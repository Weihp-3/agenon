import { requireRole } from "@/lib/auth";
import { ProductForm } from "@/components/product-form";

export default async function CreateProductPage() {
  await requireRole("admin");

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Tambah Produk</h2>
        <p className="mt-1 text-sm text-ink-muted">Buat produk baru untuk warung.</p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}