"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import { requireRole } from "./auth";

/** Verify a payment: mark the transaction as selesai. */
export async function verifyAction(id: string): Promise<void> {
  await requireRole("admin");
  const txId = BigInt(id);

  const transaction = await db.transactions.findUnique({ where: { id: txId } });
  if (!transaction) {
    return redirect("/transactions/pending?flash=error&msg=Transaksi+tidak+ditemukan.");
  }

  await db.transactions.update({
    where: { id: txId },
    data: { status: "selesai" },
  });

  return redirect("/transactions/pending?flash=success&msg=Transaksi+berhasil+diverifikasi.");
}

/** Reject a payment: restore stock once and mark the transaction batal. */
export async function rejectAction(id: string): Promise<void> {
  await requireRole("admin");
  const txId = BigInt(id);

  const transaction = await db.transactions.findUnique({
    where: { id: txId },
    include: { transaction_items: true },
  });

  if (!transaction) {
    return redirect("/transactions/pending?flash=error&msg=Transaksi+tidak+ditemukan.");
  }
  if (transaction.status === "batal") {
    return redirect("/transactions/pending?flash=error&msg=Transaksi+sudah+dibatalkan.");
  }

  await db.$transaction(async (tx) => {
    for (const item of transaction.transaction_items) {
      await tx.products.update({
        where: { id: item.product_id },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.transactions.update({
      where: { id: txId },
      data: { status: "batal" },
    });

    await tx.notifications.create({
      data: {
        user_id: transaction.user_id,
        title: `Pembayaran Ditolak #${transaction.id}`,
        message: "Pembayaranmu ditolak. Stok sudah dikembalikan.",
        type: "error",
        category: "purchase",
        icon: "fa-xmark",
        data: { transaction_id: String(transaction.id) },
      },
    });
  });

  return redirect(
    "/transactions/pending?flash=success&msg=Pembayaran+ditolak+dan+stok+dikembalikan.",
  );
}