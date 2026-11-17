"use server";

import { db } from "./db";
import { requireRole } from "./auth";
import { redirect } from "next/navigation";
import crypto from "crypto";

export async function createTransactionAction(
  input: {
    items: Array<{ id: number; qty: number }>;
    payment_method: "qris" | "cash" | "transfer" | "saldo";
  }
) {
  const user = await requireRole("user");

  const { items, payment_method } = input;

  // Validate items and payment method
  if (!items || items.length === 0) {
    return { success: false, message: "Keranjang kosong." };
  }

  // Collect product IDs and validate existence + stock
  const productIds = items.map((it) => it.id);

  // Lock products for update (sequential to avoid race)
  const productsMap = new Map<number, Awaited<ReturnType<typeof db.products.findMany>>[number]>();
  const products = await db.products.findMany({
    where: { id: { in: productIds } },
  });

  const productsById = new Map(
    products.map((p) => [p.id, p])
  );

  const calculatedTotal = items.reduce((sum, it) => {
    const product = productsById.get(it.id);
    if (!product) return sum;
    return sum + product.price * it.qty;
  }, 0 as number);

  // We'll do a transaction manually to lock and update stocks stepwise
  // Using raw locking: findMany then decrement one by one within try/catch
  // Since Prisma doesn't have explicit lockForUpdate in findMany across transaction easily,
  // we'll rely on sequential validation and decrement, similar to Laravel's lockForUpdate via findUnique.
  // But spec says "use a transaction with raw locking or sequential updates". We'll simulate.

  // We'll compute line totals and validate stock before any write
  const lines: Array<{
    product_id: number;
    quantity: number;
    price: number;
    subtotal: number;
  }> = [];

  for (const it of items) {
    const product = productsById.get(it.id);
    if (!product) {
      return { success: false, message: "Produk tidak ditemukan." };
    }
    if (product.stock < it.qty) {
      return {
        success: false,
        message: `Stok ${product.name} tidak mencukupi!`,
      };
    }
    lines.push({
      product_id: product.id,
      quantity: it.qty,
      price: product.price,
      subtotal: product.price * it.qty,
    });
  }

  // Now perform the DB writes inside a transaction
  const transaction = await db.$transaction(async (tx) => {
    // Create transaction row
    const pickupCode = crypto
      .createHash("md5")
      .update(String(user.id) + crypto.randomBytes(16).toString("hex"))
      .digest("hex")
      .slice(0, 6)
      .toUpperCase();

    const newTx = await tx.transaction.create({
      data: {
        user_id: user.id,
        shift_id: null, // usually null for student
        total_price: calculatedTotal,
        payment_method,
        status: "menunggu",
        customer_name: user.name,
        pickup_code,
        notified_at: new Date(),
      },
    });

    // Create transaction items and decrement stock
    for (const line of lines) {
      const product = await tx.products.findUnique({
        where: { id: line.product_id },
        lock: { mode: "update" }, // raw locking equivalent
      });

      if (!product || product.stock < line.quantity) {
        // Rollback handled by transaction
        throw new Error("Stok berubah secara konkurensial");
      }

      await tx.transactionItem.create({
        data: {
          transaction_id: newTx.id,
          product_id: line.product_id,
          quantity: line.quantity,
          price: line.price,
          subtotal: line.subtotal,
        },
      });

      await tx.products.update({
        where: { id: line.product_id },
        data: { stock: { decrement: line.quantity } },
      });
    }

    // Notify ALL kasir via notifications table
    const kasirIds = await tx.users
      .where({ role: "kasir" })
      .select({ id: true })
      .all();

    if (kasirIds.length > 0) {
      const itemSummary = lines
        .map((l) => {
          const prod = await tx.products.findUnique({
            where: { id: l.product_id },
          });
          return (prod?.name ?? "Item") + " x" + l.quantity;
        })
        .implode(",");

      await tx.notifications.createMany({
        data: kasirIds.map((kasir) => ({
          user_id: kasir.id,
          title: `Pesanan Baru #${newTx.id}`,
          message: `${user.name ?? "Pelanggan"} memesan ${itemSummary} (Rp ${calculatedTotal.toLocaleString(
            "id-ID",
          )}). Kode ambil: ${pickupCode}`,
          type: "warning",
          category: "purchase",
          icon: "bell",
          data: { transaction_id: newTx.id },
        })),
      });
    }

    // Insert audit_log
    await tx.auditLog.create({
      data: {
        user_id: user.id,
        action: "transaction_create",
        model_type: "Transaction",
        model_id: newTx.id,
        after_values: newTx.toArray(),
        description: `Pesanan dibuat oleh ${user.name} - Total: Rp ${calculatedTotal.toLocaleString(
          "id-ID",
        )}`,
      },
    });

    return newTx;
  });

  return {
    success: true,
    message: "Pesanan berhasil dibuat! Menunggu kasir menyiapkan.",
    transaction_id: transaction.id,
    pickup_code: transaction.pickup_code,
    total_price: transaction.total_price,
    receipt_url: `/transactions/${transaction.id}/receipt`,
  };
}

export async function cancelTransactionAction(
  transactionId: number
): Promise<{ success: boolean; message?: string }> {
  const user = await requireRole("user");

  // Check policy: student cannot cancel; only admin or kasir-owner may cancel
  // We'll enforce by checking role; if user.role is "siswa" or "user" (non-admin/non-owner), forbid
  if (user.role === "siswa" || user.role === "user") {
    return {
      success: false,
      message: "Amu tidak memiliki izin untuk membatalkan transaksi ini.",
    };
  }

  // Admin or kasir owner may cancel
  const transaction = await db.transactions.findUnique({
    where: { id: transactionId },
    include: { items: { include: { product: true } } },
  });

  if (!transaction) {
    return { success: false, message: "Transaksi tidak ditemukan." };
  }

  // If the transaction belongs to this user OR user is admin/kasir, proceed
  // Admin can cancel any; kasir can only cancel their own
  const isOwner = transaction.user_id === user.id;
  const isAdminOrKasir = user.role === "admin" || user.role === "kasir";

  if (!isOwner && !isAdminOrKasir) {
    return { success: false, message: "Amu tidak memiliki izin untuk membatalkan transaksi ini." };
  }

  await db.$transaction(async (tx) => {
    // Restock products
    for (const item of transaction.items) {
      await tx.products.update({
        where: { id: item.product_id },
        data: { stock: { increment: item.quantity } },
      });
    }

    // Update status
    await tx.transactions.update({
      where: { id: transactionId },
      data: { status: "batal" },
    });

    // Notify user
    await tx.notifications.create({
      data: {
        user_id: transaction.user_id,
        title: "Pesanan Dibatalkan #" + transactionId,
        message: "Pesananmu dibatalkan oleh kasir. Hubungi warung untuk informasi lebih lanjut.",
        type: "error",
        category: "purchase",
        icon: "x-circle",
        data: { transaction_id: transactionId },
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        user_id: user.id,
        action: "transaction_cancel",
        model_type: "Transaction",
        model_id: transactionId,
        description: `Transaksi #${transactionId} dibatalkan oleh ${user.name}`,
      },
    });
  });

  return { success: true, message: "Transaksi berhasil dibatalkan." };
}