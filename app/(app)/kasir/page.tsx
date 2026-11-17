import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PosClient } from "@/components/pos-client";

export default async function KasirPosPage() {
  await requireRole("kasir");

  const products = await db.products.findMany({
    where: { deleted_at: null, stock: { gt: 0 } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      category: true,
      image: true,
    },
  });

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