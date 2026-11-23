import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PosClient } from "@/components/pos-client";

export default async function KasirPosPage() {
  await requireRole("kasir");

  const products = await db.orm.public.products
    .where({ deleted_at: null })
    .where((p) => p.stock.gt(0))
    .select("id", "name", "price", "stock", "category", "image")
    .orderBy((p) => p.name.asc())
    .all();

  return (
    <PosClient
      products={products.map((p) => ({
        id: Number(p.id),
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category ?? "Lainnya",
        image: p.image ?? "/images/default.png",
      }))}
    />
  );
}