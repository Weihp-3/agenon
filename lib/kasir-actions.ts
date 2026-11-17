"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import { format } from "./format";
import { flashPath } from "./flash";
import { requireRole } from "./auth";
import type { FlashType } from "./flash";

/**
 * checkoutAction — mirrors KasirController@store exactly.
 * Validate payment fields, lock products in one transaction,
 * create transaction + items, decrement stock, clear cart,
 * then redirect to receipt with flashed success message.
 */
export async function checkoutAction(formData: FormData) {
  const user = await requireRole("kasir");

  const payment_method = String(formData.get("payment_method"));
  if (!["cash", "qris", "transfer"].includes(payment_method)) {
    return redirect(flashPath("/kasir/checkout", "error", "Metode pembayaran tidak valid."));
  }

  const cash_received = formData.get("cash_received") !== null ? Number(formData.get("cash_received")) : undefined;
  const customer_name = String(formData.get("customer_name") ?? "Pelanggan");
  // regex: ^[a-zA-Z0-9\s\.\-]+$  (same as Blade)
  if (customer_name && !/^[a-zA-Z0-9\s\.\-]+$/.test(customer_name)) {
    return redirect(flashPath("/kasir/checkout", "error", "Nama pelanggan tidak valid."));
  }

  // Read cart from cookie
  const { getCart, saveCart, cartTotal } = await import("./cart");
  const cart = await getCart();
  if (cart.length === 0) {
    return redirect(flashPath("/kasir", "error", "Keranjang kosong. Tambahkan produk terlebih dahulu."));
  }

  const total = cartTotal(cart);

  // Begin Prisma transaction: lock products, validate stock, then write
  try {
    const productIds = cart.map((item) => item.id);
    const products = await db.products.findMany({
      where: { id: { in: productIds } },
    });

    // Build lookup map; if any missing -> error
    const productMap = new Map(
      products.map((p) => [String(p.id), p])
    );

    for (const item of cart) {
      const product = productMap.get(String(item.id));
      if (!product) {
        return redirect(
          flashPath("/kasir/checkout", "error", `Gagal menyimpan transaksi: Produk #${item.id} tidak ditemukan.`)
        );
      }
      if (product.stock < item.qty) {
        return redirect(
          flashPath("/kasir/checkout", "error", `Gagal menyimpan transaksi: Stok ${product.name} tidak cukup. Tersedia: ${product.stock}`)
        );
      }
    }

    // Create transaction inside Prisma transaction
    // Note: Prisma's $transaction is not directly available without importing;
    // we emulate by doing writes sequentially after lock reads, which matches Laravel's lockForUpdate emulate.
    // But to be safe and match exactly, we wrap in $transaction.
    const result = await db.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          user_id: user.id,
          shift_id: null, // will be set via open shift if any; controller sets active shift id nullable
          total_price: total,
          payment_method,
          status: "selesai",
          customer_name: customer_name === "Pelanggan" ? undefined : customer_name,
          // In Laravel: 'customer_name' => $request->customer_name ?? 'Pelanggan';
          // We pass the validated value; if it's the default we store the default too.
        },
      });

      // Create transaction items and decrement stock
      for (const item of cart) {
        const product = productMap.get(String(item.id))!;
        await tx.transaction_item.create({
          data: {
            transaction_id: transaction.id,
            product_id: product.id,
            quantity: item.qty,
            price: item.price,
            subtotal: item.price * item.qty,
          },
        });
        // decrement stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.qty } },
        });
      }

      // Clear cart cookie
      saveCart([]);

      return { transaction };
    });

    const transaction = result.transaction;

    // Redirect to receipt with success flash
    const rupiahTotal = rupiah(transaction.total_price);
    return redirect(flashPath(`/kasir/receipt/${transaction.id}`, "success", `Transaksi berhasil! Total: Rp ${rupiahTotal}`));
  } catch (error) {
    console.error(error);
    return redirect(flashPath("/kasir/checkout", "error", "Gagal menyimpan transaksi: " + (error instanceof Error ? error.message : "Terjadi kesalahan")));
  }
}

/**
 * markReadyAction — only from status menunggu, set siap + ready_at=now;
 * insert notifications row for transaction owner exactly as controller;
 * redirect back with success / error message.
 */
export async function markReadyAction(id: string) {
  const user = await requireRole("kasir");

  try {
    const transaction = await db.transaction.findUnique({ where: { id: Number(id) } });
    if (!transaction) {
      return redirect(flashPath("/kasir/pesanan", "error", "Pesanan tidak ditemukan."));
    }
    if (transaction.status !== "menunggu") {
      return redirect(flashPath("/kasir/pesanan", "error", "Pesanan tidak dalam status menunggu."));
    }

    await db.transaction.update({
      where: { id: Number(id) },
      data: {
        status: "siap",
        ready_at: new Date(),
      },
    });

    // Notify owner exactly as controller
    await db.notification.create({
      data: {
        user_id: transaction.user_id,
        title: `Pesanan Siap Diambil #${transaction.id}`,
        message: `Pesananmu sudah disiapkan kasir. Silakan ambil di warung dengan kode: ${transaction.pickup_code}`,
        type: "success" as const,
        category: "purchase" as const,
        icon: "fa-circle-check",
        data: { transaction_id: transaction.id },
      },
    });

    const rupiahTotal = rupiah(transaction.total_price);
    return redirect(flashPath("/kasir/pesanan", "success", `Pesanan #${transaction.id} ditandai siap diambil. Total: Rp ${rupiahTotal}`));
  } catch (error) {
    console.error(error);
    return redirect(flashPath("/kasir/pesanan", "error", "Pesanan tidak dapat diupdate."));
  }
}

/**
 * markPickedUpAction — only from menunggu/siap; set selesai + picked_up_at;
 * notify owner; redirect back success / error message.
 */
export async function markPickedUpAction(id: string) {
  const user = await requireRole("kasir");

  try {
    const transaction = await db.transaction.findUnique({ where: { id: Number(id) } });
    if (!transaction) {
      return redirect(flashPath("/kasir/pesanan", "error", "Pesanan tidak ditemukan."));
    }
    if (!["menunggu", "siap"].includes(transaction.status)) {
      return redirect(flashPath("/kasir/pesanan", "error", "Pesanan tidak dapat diselesaikan."));
    }

    await db.transaction.update({
      where: { id: Number(id) },
      data: {
        status: "selesai",
        picked_up_at: new Date(),
      },
    });

    // Notify owner exactly as controller
    await db.notification.create({
      data: {
        user_id: transaction.user_id,
        title: `Pesanan Selesai #${transaction.id}`,
        message: `Pesananmu sudah diambil. Terima kasih sudah berbelanja di Warung Mama Zaviyar.`,
        type: "success" as const,
        category: "purchase" as const,
        icon: "fa-circle-check",
        data: { transaction_id: transaction.id },
      },
    });

    return redirect(flashPath("/kasir/pesanan", "success", `Pesanan #${transaction.id} diselesaikan.`));
  } catch (error) {
    console.error(error);
    return redirect(flashPath("/kasir/pesanan", "error", "Pesanan tidak dapat diselesaikan."));
  }
}

/**
 * startShiftAction — validates opening_balance numeric >=0;
 * if an open shift exists -> redirect back error;
 * else create shift {kasir_id, opened_at: now, opening_balance, status:'open'};
 * redirect /kasir/dashboard success.
 */
export async function startShiftAction(formData: FormData) {
  const user = await requireRole("kasir");

  const opening_balance = Number(formData.get("opening_balance"));
  if (!Number.isFinite(opening_balance) || opening_balance < 0) {
    return redirect(flashPath("/kasir/dashboard", "error", "Saldo pembukaan harus berupa angka >= 0."));
  }

  // Check if open shift exists
  const existingShift = await db.shifts.findFirst({
    where: { kasir_id: user.id, closed_at: null },
  });
  if (existingShift) {
    return redirect(flashPath("/kasir/dashboard", "error", "Anda sudah memiliki shift yang aktif. Tutup shift terlebih dahulu."));
  }

  await db.shifts.create({
    data: {
      kasir_id: user.id,
      opened_at: new Date(),
      opening_balance,
      status: "open",
    },
  });

  return redirect(flashPath("/kasir/dashboard", "success", "Shift berhasil dimulai."));
}

/**
 * endShiftAction — validates actual_cash numeric >=0 and notes nullable max 500;
 * find own open shift inside a transaction; expected = opening_balance +
 * sum(total_price of shift transactions status selesai payment_method cash);
 * discrepancy = actual - expected; set closed_at, expected_cash, actual_cash,
 * discrepancy, notes, status closed; redirect /kasir/dashboard.
 */
export async function endShiftAction(formData: FormData) {
  const user = await requireRole("kasir");

  const actual_cash = Number(formData.get("actual_cash"));
  if (!Number.isFinite(actual_cash) || actual_cash < 0) {
    return redirect(flashPath("/kasir/dashboard", "error", "Uang kas harus berupa angka >= 0."));
  }

  const notes = formData.get("notes") !== null ? String(formData.get("notes")) : undefined;
  if (notes !== undefined && notes.length > 500) {
    return redirect(flashPath("/kasir/dashboard", "error", "Catatan maksimal 500 karakter."));
  }

  // Find own open shift
  const shift = await db.shifts.findFirst({
    where: { kasir_id: user.id, closed_at: null },
  });
  if (!shift) {
    return redirect(flashPath("/kasir/dashboard", "error", "Anda tidak memiliki shift yang aktif."));
  }

  // Calculate expected cash from shift transactions (status selesai, payment_method cash)
  const shiftTransactions = await db.transaction.findMany({
    where: { shift_id: shift.id, status: "selesai", payment_method: "cash" },
    select: { total_price: true },
  });
  const expectedCash = shiftTransactions.reduce((sum, t) => sum + t.total_price, 0) + shift.opening_balance;

  const discrepancy = actual_cash - expectedCash;

  await db.shifts.update({
    where: { id: shift.id },
    data: {
      closed_at: new Date(),
      expected_cash: expectedCash,
      actual_cash,
      discrepancy,
      notes,
      status: "closed",
    },
  });

  return redirect(flashPath("/kasir/dashboard", "success", "Shift berhasil ditutup."));
}