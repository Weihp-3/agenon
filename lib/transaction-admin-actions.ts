"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import { requireRole } from "./auth";

/** Verify a payment: mark the transaction as selesai. */
export async function verifyAction(id: string): Promise<void> {
  await requireRole("admin", "kasir");
  const txId = BigInt(id);

  const transaction = await db.orm.public.transactions.whereUnique({ id: txId }).first();
  if (!transaction) {
    return redirect("/transactions/pending?flash=error&msg=Transaksi+tidak+ditemukan.");
  }

  await db.orm.public.transactions.where({ id: txId }).update({ status: "selesai" });

  return redirect("/transactions/pending?flash=success&msg=Transaksi+berhasil+diverifikasi.");
}

/** Reject a payment: restore stock once and mark the transaction batal. */
export async function rejectAction(id: string): Promise<void> {
  await requireRole("admin", "kasir");
  const txId = BigInt(id);

  const transaction = await db.orm.public.transactions
    .whereUnique({ id: txId })
    .include("transaction_items")
    .first();

  if (!transaction) {
    return redirect("/transactions/pending?flash=error&msg=Transaksi+tidak+ditemukan.");
  }
  if (transaction.status === "batal") {
    return redirect("/transactions/pending?flash=error&msg=Transaksi+sudah+dibatalkan.");
  }

  await db.transaction(async (tx) => {
    for (const item of transaction.transaction_items) {
      await tx.execute(
        tx.raw.sql`UPDATE "products" SET stock = stock + ${item.quantity} WHERE id = ${Number(item.product_id)}`
          .affectedCount()
          .build(),
      );
    }

    await tx.orm.public.transactions.where({ id: txId }).update({ status: "batal" });

    await tx.orm.public.notifications.create({
      user_id: transaction.user_id,
      title: `Pembayaran Ditolak #${transaction.id}`,
      message: "Pembayaranmu ditolak. Stok sudah dikembalikan.",
      type: "error",
      category: "purchase",
      icon: "fa-xmark",
      data: { transaction_id: String(transaction.id) },
    });
  });

  return redirect(
    "/transactions/pending?flash=success&msg=Pembayaran+ditolak+dan+stok+dikembalikan.",
  );
}
