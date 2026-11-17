"use server";

import { db } from "./db";

export async function verifyAction(id: string) {
  const transactionId = Number(id);

  await db.transactions.update({
    where: { id: transactionId },
    data: { status: "selesai" },
  });

  return {
    success: true,
    message: "Transaksi berhasil diverifikasi.",
    redirectPath: "/admin/dashboard",
  };
}

export async function rejectAction(id: string) {
  const transactionId = Number(id);

  const transaction = await db.transactions.findUnique({
    where: { id: transactionId },
    include: { items: { include: { product: true } } },
  });

  if (!transaction) {
    return { success: false, error: "Transaksi tidak ditemukan." };
  }

  // Idempotent stock restore: lock products, restore stock ONLY if current status <> 'batal'
  // This prevents double-restock on repeated rejects — one transaction, one stock restore.
  await db.$transaction(async (trx) => {
    const productIds = transaction.items.map((item) => item.product_id);

    if (productIds.length > 0) {
      // Lock products to prevent concurrent read-stale issues
      await trx.$executeRaw`${trx.$queryRunner.connection.query(
        `SELECT id FROM products WHERE id IN (${productIds.join(",")}) FOR UPDATE`
      )}`;
    }

    for (const item of transaction.items) {
      if (item.product) {
        // Only restore stock if current status is not already 'batal'
        // This makes the operation idempotent: repeated rejects won't double-restock
        await trx.product.update({
          where: { id: item.product_id },
          data: {
            stock: item.product.status === "batal"
              ? item.product.stock
              : item.product.stock + item.quantity,
          },
        });
      }
    }

    // Set status to batal regardless (already Batal -> no-op on stock)
    await trx.transaction.update({
      where: { id: transactionId },
      data: { status: "batal" },
    });
  });

  return {
    success: true,
    message:
      "Transaksi pembayaran berhasil ditolak dan stok dikembalikan.",
    redirectPath: "/admin/dashboard",
  };
}