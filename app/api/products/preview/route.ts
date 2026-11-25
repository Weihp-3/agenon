import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET() {
  const products = await db.products.findMany({
    where: { deleted_at: null, stock: { gt: 0 } },
    orderBy: { name: "asc" },
    take: 4,
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      image: true,
      stock: true,
    },
  });

  return NextResponse.json(
    products.map((product) => ({
      id: String(product.id),
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
    })),
  );
}
