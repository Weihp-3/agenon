import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PurchaseClient } from "@/components/purchase-client";

export default async function PembelianPage() {
  await requireRole("user");

  const products = await db.orm.public.products
    .where({ deleted_at: null })
    .where((p) => p.stock.gt(0))
    .orderBy((p) => p.created_at.desc())
    .select("id", "name", "price", "stock", "category", "image")
    .all();

  const serialized = products.map((p) => ({
    id: Number(p.id),
    name: p.name,
    price: p.price,
    stock: p.stock,
    category: p.category ?? "Lainnya",
    image: p.image ?? "/images/default.png",
  }));

  return <PurchaseClient products={serialized} />;
}