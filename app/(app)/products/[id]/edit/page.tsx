import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ProductForm } from "@/components/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;

  const product = await db.orm.public.products
    .whereUnique({ id: BigInt(id) })
    .select("id", "name", "price", "stock", "category", "image")
    .first();

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Edit produk</h2>
        <p className="mt-1 text-sm text-ink-muted">Ubah data {product.name}.</p>
      </div>
      <ProductForm
        mode="edit"
        product={{
          id: String(product.id),
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category ?? "",
          image: product.image,
        }}
      />
    </div>
  );
}