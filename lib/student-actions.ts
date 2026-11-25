"use server";

import { db } from "./db";
import { requireRole, type SessionUser } from "./auth";
import crypto from "crypto";

type CartLine = { id: number; qty: number };
type PaymentMethod = "qris" | "cash" | "transfer" | "saldo";

function pickCode(userId: string): string {
  return crypto
    .createHash("md5")
    .update(userId + crypto.randomBytes(16).toString("hex"))
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();
}

/** Customer places an order. Stock is validated and decremented atomically. */
export async function createTransactionAction(input: {
  items: CartLine[];
  payment_method: PaymentMethod;
  customer_name?: string;
}) {
  const user: SessionUser = await requireRole("user");
  const { items, payment_method } = input;

  if (!items || items.length === 0) {
    return { success: false, message: "Keranjang kosong." };
  }
  if (!["qris", "cash", "transfer", "saldo"].includes(payment_method)) {
    return { success: false, message: "Metode pembayaran tidak valid." };
  }

  const productIds = items.map((it) => it.id);
  const products = await db.products.findMany({
    where: { id: { in: productIds }, deleted_at: null },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: Array<{
    product_id: number;
    quantity: number;
    price: number;
    subtotal: number;
    name: string;
  }> = [];

  for (const item of items) {
    const product = byId.get(BigInt(item.id));
    if (!product) return { success: false, message: "Produk tidak ditemukan." };
    if (product.stock < item.qty) {
      return { success: false, message: `Stok ${product.name} tidak mencukupi.` };
    }
    lines.push({
      product_id: Number(product.id),
      quantity: item.qty,
      price: product.price,
      subtotal: product.price * item.qty,
      name: product.name,
    });
  }

  const total = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const code = pickCode(user.id);

  const transaction = await db.$transaction(async (tx) => {
    const created = await tx.transactions.create({
      data: {
        user_id: BigInt(user.id),
        total_price: total,
        payment_method,
        status: "menunggu",
        customer_name: input.customer_name?.trim() || user.name,
        pickup_code: code,
        notified_at: new Date(),
      },
    });

    await tx.transaction_items.createMany({
      data: lines.map((l) => ({
        transaction_id: created.id,
        product_id: BigInt(l.product_id),
        quantity: l.quantity,
        price: l.price,
        subtotal: l.subtotal,
      })),
    });

    for (const line of lines) {
      await tx.products.update({
        where: { id: BigInt(line.product_id) },
        data: { stock: { decrement: line.quantity } },
      });
    }

    const admins = await tx.users.findMany({
      where: { role: "admin" },
      select: { id: true },
    });

    if (admins.length > 0) {
      const summary = lines.map((l) => `${l.name} x${l.quantity}`).join(", ");
      await tx.notifications.createMany({
        data: admins.map((k) => ({
          user_id: k.id,
          title: `Pesanan Baru #${created.id}`,
          message: `${user.name} memesan ${summary} (Rp ${total.toLocaleString("id-ID")}). Kode ambil: ${code}`,
          type: "warning",
          category: "purchase",
          icon: "fa-bell",
          data: { transaction_id: String(created.id) },
        })),
      });
    }

    await tx.audit_logs.create({
      data: {
        user_id: BigInt(user.id),
        action: "transaction_create",
        model_type: "transactions",
        model_id: created.id,
        after_values: { id: String(created.id), status: created.status, total_price: created.total_price },
        description: `Pesanan dibuat oleh ${user.name}, total Rp ${total.toLocaleString("id-ID")}`,
      },
    });

    return created;
  });

  return {
    success: true,
    message: "Pesanan berhasil dibuat. Menunggu admin memproses.",
    transaction_id: String(transaction.id),
    pickup_code: transaction.pickup_code,
    total_price: transaction.total_price,
    receipt_url: `/transactions/${transaction.id}/receipt`,
  };
}

/** Cancel an order and restore stock. Only admin may cancel. */
export async function cancelTransactionAction(
  transactionId: number,
): Promise<{ success: boolean; message: string }> {
  const user: SessionUser = await requireRole("user");

  if (user.role === "user") {
    return { success: false, message: "Kamu tidak memiliki izin untuk membatalkan transaksi ini." };
  }

  const transaction = await db.transactions.findUnique({
    where: { id: BigInt(transactionId) },
    include: { transaction_items: true },
  });

  if (!transaction) {
    return { success: false, message: "Transaksi tidak ditemukan." };
  }
  if (transaction.status === "batal") {
    return { success: false, message: "Transaksi sudah dibatalkan." };
  }

  await db.$transaction(async (tx) => {
    for (const item of transaction.transaction_items) {
      await tx.products.update({
        where: { id: item.product_id },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.transactions.update({
      where: { id: transaction.id },
      data: { status: "batal" },
    });

    await tx.notifications.create({
      data: {
        user_id: transaction.user_id,
        title: `Pesanan Dibatalkan #${transaction.id}`,
        message: "Pesananmu dibatalkan admin. Hubungi warung untuk informasi lebih lanjut.",
        type: "error",
        category: "purchase",
        icon: "fa-xmark",
        data: { transaction_id: String(transaction.id) },
      },
    });

    await tx.audit_logs.create({
      data: {
        user_id: BigInt(user.id),
        action: "transaction_cancel",
        model_type: "transactions",
        model_id: transaction.id,
        description: `Transaksi #${transaction.id} dibatalkan oleh ${user.name}`,
      },
    });
  });

  return { success: true, message: "Transaksi berhasil dibatalkan." };
}