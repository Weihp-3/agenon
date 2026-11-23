"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import { requireRole } from "./auth";
import { flashPath } from "./flash";

/** Create a reusable sale template for the cashier. */
export async function storeTemplateAction(formData: FormData) {
  const user = await requireRole("kasir");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name) {
    return redirect(flashPath("/sale-templates/create", "error", "Nama template wajib diisi."));
  }

  const items: Array<{ product_id: bigint; quantity: number }> = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("item_")) continue;
    const productId = Number(key.slice(5));
    const qty = Number(value);
    if (productId > 0 && Number.isFinite(qty) && qty > 0) {
      items.push({ product_id: BigInt(productId), quantity: Math.floor(qty) });
    }
  }

  if (items.length === 0) {
    return redirect(flashPath("/sale-templates/create", "error", "Pilih minimal satu produk."));
  }

  await db.orm.public.sale_templates.create({
    kasir_id: BigInt(user.id),
    name,
    description,
    sale_template_items: (rows) => rows.create(items),
  });

  return redirect(flashPath("/sale-templates", "success", "Template penjualan berhasil dibuat."));
}

/** Delete a sale template. */
export async function destroyTemplateAction(id: string) {
  await requireRole("kasir");
  await db.orm.public.sale_templates.where({ id: BigInt(id) }).delete();
  return redirect(flashPath("/sale-templates", "success", "Template berhasil dihapus."));
}