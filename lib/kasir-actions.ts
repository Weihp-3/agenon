"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import { flashPath } from "./flash";
import { requireRole } from "./auth";
import { rupiah } from "./format";
import { getCart, saveCart, cartTotal } from "./cart";

/** POS checkout: validate stock, write transaction + items, decrement stock. */
export async function checkoutAction(formData: FormData) {
  await requireRole("kasir");

  const payment_method = String(formData.get("payment_method") ?? "");
  if (!["cash", "qris", "transfer"].includes(payment_method)) {
    return redirect(flashPath("/kasir/checkout", "error", "Metode pembayaran tidak valid."));
  }

  const customer_name = String(formData.get("customer_name") ?? "Pelanggan").trim() || "Pelanggan";
  if (!/^[a-zA-Z0-9\s.\-]+$/.test(customer_name)) {
    return redirect(flashPath("/kasir/checkout", "error", "Nama pelanggan tidak valid."));
  }

  const cart = await getCart();
  if (cart.length === 0) {
    return redirect(flashPath("/kasir", "error", "Keranjang kosong. Tambahkan produk terlebih dahulu."));
  }

  const total = cartTotal(cart);
  const productIds = cart.map((item) => BigInt(item.id));
  const products = await db.orm.public.products.where((p) => p.id.in(productIds)).all();
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const item of cart) {
    const product = byId.get(BigInt(item.id));
    if (!product) {
      return redirect(flashPath("/kasir/checkout", "error", `Produk #${item.id} tidak ditemukan.`));
    }
    if (product.stock < item.qty) {
      return redirect(
        flashPath("/kasir/checkout", "error", `Stok ${product.name} tidak cukup. Tersedia: ${product.stock}`),
      );
    }
  }

  const shift = await db.orm.public.shifts
    .where({ kasir_id: BigInt((await requireRole("kasir")).id), closed_at: null })
    .first();
  if (!shift) {
    return redirect(flashPath("/kasir", "error", "Buka shift terlebih dahulu."));
  }

  try {
    const transaction = await db.transaction(async (tx) => {
      const created = await tx.orm.public.transactions.create({
        user_id: BigInt((await requireRole("kasir")).id),
        shift_id: shift.id,
        total_price: total,
        payment_method: payment_method as "cash" | "qris" | "transfer",
        status: "selesai",
        customer_name,
        picked_up_at: new Date(),
      });

      await tx.orm.public.transaction_items.createAll(
        cart.map((item) => ({
          transaction_id: created.id,
          product_id: BigInt(item.id),
          quantity: item.qty,
          price: item.price,
          subtotal: item.price * item.qty,
        })),
      );

      for (const item of cart) {
        await tx.execute(
          tx.raw.sql`UPDATE "products" SET stock = stock - ${item.qty} WHERE id = ${Number(item.id)}`
            .affectedCount()
            .build(),
        );
      }

      return created;
    });

    await saveCart([]);
    return redirect(
      flashPath(
        `/kasir/receipt/${transaction.id}`,
        "success",
        `Transaksi berhasil. Total Rp ${rupiah(transaction.total_price)}`,
      ),
    );
  } catch (error) {
    console.error("checkout error", error);
    return redirect(flashPath("/kasir/checkout", "error", "Gagal menyimpan transaksi. Coba lagi."));
  }
}

/** Mark a waiting order as ready and notify its owner. */
export async function markReadyAction(id: string) {
  await requireRole("kasir");
  const txId = BigInt(id);

  const transaction = await db.orm.public.transactions.whereUnique({ id: txId }).first();
  if (!transaction) {
    return redirect(flashPath("/kasir/pesanan", "error", "Pesanan tidak ditemukan."));
  }
  if (transaction.status !== "menunggu") {
    return redirect(flashPath("/kasir/pesanan", "error", "Pesanan tidak dalam status menunggu."));
  }

  await db.orm.public.transactions.where({ id: txId }).update({
    status: "siap",
    ready_at: new Date(),
  });

  await db.orm.public.notifications.create({
    user_id: transaction.user_id,
    title: `Pesanan Siap Diambil #${transaction.id}`,
    message: `Pesananmu sudah disiapkan kasir. Ambil di warung dengan kode: ${transaction.pickup_code}`,
    type: "success",
    category: "purchase",
    icon: "fa-circle-check",
    data: { transaction_id: String(transaction.id) },
  });

  return redirect(flashPath("/kasir/pesanan", "success", `Pesanan #${transaction.id} ditandai siap diambil.`));
}

/** Mark an order as picked up and notify its owner. */
export async function markPickedUpAction(id: string) {
  await requireRole("kasir");
  const txId = BigInt(id);

  const transaction = await db.orm.public.transactions.whereUnique({ id: txId }).first();
  if (!transaction) {
    return redirect(flashPath("/kasir/pesanan", "error", "Pesanan tidak ditemukan."));
  }
  if (!["menunggu", "siap"].includes(transaction.status)) {
    return redirect(flashPath("/kasir/pesanan", "error", "Pesanan tidak dapat diselesaikan."));
  }

  await db.orm.public.transactions.where({ id: txId }).update({
    status: "selesai",
    picked_up_at: new Date(),
  });

  await db.orm.public.notifications.create({
    user_id: transaction.user_id,
    title: `Pesanan Selesai #${transaction.id}`,
    message: "Pesananmu sudah diambil. Terima kasih sudah berbelanja di Warung Mama Zaviyar.",
    type: "success",
    category: "purchase",
    icon: "fa-circle-check",
    data: { transaction_id: String(transaction.id) },
  });

  return redirect(flashPath("/kasir/pesanan", "success", `Pesanan #${transaction.id} diselesaikan.`));
}

/** Open a cashier shift. */
export async function startShiftAction(formData: FormData) {
  const user = await requireRole("kasir");

  const existing = await db.orm.public.shifts
    .where({ kasir_id: BigInt(user.id), closed_at: null })
    .first();
  if (existing) {
    return redirect(flashPath("/kasir/dashboard", "error", "Kamu sudah punya shift aktif. Tutup dulu."));
  }

  const previousShift = await db.orm.public.shifts
    .where({ kasir_id: BigInt(user.id) })
    .where((s) => s.closed_at.neq(null))
    .orderBy((s) => s.closed_at.desc())
    .first();
  const requestedOpening = formData.get("opening_balance");
  const opening_balance =
    requestedOpening === null || String(requestedOpening).trim() === ""
      ? Number(previousShift?.actual_cash ?? 0)
      : Number(requestedOpening);

  if (!Number.isFinite(opening_balance) || opening_balance < 0) {
    return redirect(flashPath("/kasir/dashboard", "error", "Saldo pembukaan harus angka >= 0."));
  }

  await db.orm.public.shifts.create({
    kasir_id: BigInt(user.id),
    opened_at: new Date(),
    opening_balance: String(opening_balance),
    status: "open",
  });

  return redirect(flashPath("/kasir/dashboard", "success", "Shift berhasil dimulai."));
}

/** Close the cashier shift and compute expected cash + discrepancy. */
export async function endShiftAction(formData: FormData) {
  const user = await requireRole("kasir");
  const actual_cash = Number(formData.get("actual_cash"));

  if (!Number.isFinite(actual_cash) || actual_cash < 0) {
    return redirect(flashPath("/kasir/dashboard", "error", "Uang kas harus angka >= 0."));
  }

  const notes = String(formData.get("notes") ?? "") || undefined;
  if (notes && notes.length > 500) {
    return redirect(flashPath("/kasir/dashboard", "error", "Catatan maksimal 500 karakter."));
  }

  const shift = await db.orm.public.shifts
    .where({ kasir_id: BigInt(user.id), closed_at: null })
    .first();
  if (!shift) {
    return redirect(flashPath("/kasir/dashboard", "error", "Kamu tidak punya shift aktif."));
  }

  const sales = await db.orm.public.transactions
    .where({ shift_id: shift.id, status: "selesai", payment_method: "cash" })
    .aggregate((agg) => ({ total: agg.sum("total_price") }));
  const expectedCash = Number(sales.total ?? 0) + Number(shift.opening_balance);
  const discrepancy = actual_cash - expectedCash;

  await db.orm.public.shifts.where({ id: shift.id }).update({
    closed_at: new Date(),
    expected_cash: String(expectedCash),
    actual_cash: String(actual_cash),
    discrepancy: String(discrepancy),
    notes,
    status: "closed",
  });

  return redirect(flashPath("/kasir/dashboard", "success", "Shift berhasil ditutup."));
}
