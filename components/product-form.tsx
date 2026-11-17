"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { storeProduct, updateProduct } from "@/lib/product-actions";

type ActionResult = { success: boolean; message?: string; error?: string };

export function ProductForm({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    image: string | null;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(product?.image ?? null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const result: ActionResult =
      mode === "create"
        ? await storeProduct(fd)
        : await updateProduct(product!.id, fd);

    if (result.success) {
      router.push("/products?flash=success&msg=" + encodeURIComponent(result.message ?? "Berhasil."));
      router.refresh();
    } else {
      setError(result.error ?? "Gagal menyimpan produk.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-ink/10 bg-surface-raised p-5">
      {error ? (
        <p className="rounded-md bg-status-danger-soft px-3 py-2 text-sm font-medium text-status-danger-ink">
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="field-label">Nama produk</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={product?.name}
          className="field"
          placeholder="Contoh: Nasi Goreng Spesial"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="field-label">Harga (Rp)</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.price}
            className="field tabular"
            placeholder="Contoh: 18000"
          />
        </div>
        <div>
          <label htmlFor="stock" className="field-label">Stok</label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.stock}
            className="field tabular"
            placeholder="Contoh: 50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="field-label">Kategori</label>
        <input
          id="category"
          name="category"
          type="text"
          defaultValue={product?.category}
          className="field"
          placeholder="Contoh: Makanan, Minuman, Snack"
        />
      </div>

      <div>
        <label htmlFor="image" className="field-label">Gambar produk</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : (product?.image ?? null));
          }}
          className="field"
        />
        <p className="field-help">JPG, PNG, atau WEBP. Maksimal 2MB.</p>
        {preview ? (
          <div className="relative mt-3 h-32 w-32 overflow-hidden rounded-lg border border-ink/10 bg-surface-sunken">
            <Image src={preview} alt="Pratinjau gambar" fill className="object-cover" sizes="128px" unoptimized />
          </div>
        ) : null}
      </div>

      <button type="submit" disabled={loading} className="btn btn-brand">
        <Icon name="check" className="h-4 w-4" />
        {loading ? "Menyimpan..." : mode === "create" ? "Simpan produk" : "Simpan perubahan"}
      </button>
    </form>
  );
}