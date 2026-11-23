import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { Chip } from "@/components/chip";
import { Icon } from "@/components/icon";
import { rupiah } from "@/lib/format";
import { Flash } from "@/components/flash";
import { destroyProduct } from "@/lib/product-actions";

export default async function ProductsPage() {
  await requireRole("admin");

  const products = await db.orm.public.products
    .where({ deleted_at: null })
    .orderBy((p) => p.name.asc())
    .all();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Data Produk</h2>
          <p className="mt-1 text-sm text-ink-muted">Kelola produk yang tersedia di warung.</p>
        </div>
        <Link href="/products/create" className="btn btn-brand shrink-0">
          <Icon name="plus" className="h-4 w-4" />
          Tambah produk
        </Link>
      </div>

      <Flash />

      {products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          description="Tambahkan produk pertama untuk mulai berjualan."
          icon="box"
          action={
            <Link href="/products/create" className="btn btn-brand btn-sm">
              <Icon name="plus" className="h-4 w-4" />
              Tambah produk
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="table-head border-b border-ink/10 bg-surface-sunken">
                <tr>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Stok</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-ink/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-sunken">
                          <Image
                            src={product.image ?? "/images/default.png"}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </span>
                        <span className="font-semibold text-ink">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{product.category ?? "-"}</td>
                    <td className="tabular px-4 py-3 font-semibold text-ink">
                      Rp {rupiah(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <Chip
                        tone={
                          product.stock <= 0
                            ? "danger"
                            : product.stock <= 10
                              ? "warn"
                              : "ok"
                        }
                      >
                        {product.stock}
                      </Chip>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-ink/5 hover:text-ink"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Icon name="pencil" className="h-4 w-4" />
                        </Link>
                        <form action={destroyProduct.bind(null, String(product.id))}>
                          <button
                            type="submit"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-status-danger-soft hover:text-status-danger-ink"
                            aria-label={`Hapus ${product.name}`}
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}