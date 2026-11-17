import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { PurchaseClient } from "@/components/purchase-client";

export default async function PembelianPage() {
  await requireRole("user");

  const products = await db.products.findMany({
    where: { deleted_at: null, stock: { gt: 0 } },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      category: true,
      image: true,
    },
  });

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