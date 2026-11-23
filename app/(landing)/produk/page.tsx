import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rupiah } from "@/lib/format";

export default async function ProdukPage() {
  const [session, products] = await Promise.all([
    auth(),
    db.products.findMany({
      where: { deleted_at: null, stock: { gt: 0 } },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        category: true,
        image: true,
      },
    }),
  ]);

  const buyHref = session?.user ? "/pembelian" : "/login?callbackUrl=/pembelian";

  return (
    <main className="flex-1 px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand">
          <Icon name="arrowLeft" className="h-4 w-4" />
          Kembali ke beranda
        </Link>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Produk warung</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
              Pilih barang yang tersedia. Boleh lihat dulu tanpa akun — saat mau beli, kamu akan diminta masuk.
            </p>
          </div>
          <Link href={buyHref} className="btn btn-brand w-full sm:w-auto">
            <Icon name="cart" className="h-5 w-5" />
            {session?.user ? "Ke keranjang" : "Masuk untuk beli"}
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon="box"
              title="Belum ada produk dijual"
              description="Barang jualan belum tersedia. Coba lagi setelah kasir menambahkan stok."
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-surface-raised"
              >
                <div className="relative aspect-[4/3] bg-surface-sunken">
                  <Image
                    src={product.image ?? "/images/default.png"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-surface-raised/90 px-2 py-0.5 text-xs font-semibold text-ink">
                    {product.category ?? "Lainnya"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3.5">
                  <h2 className="text-sm font-bold text-ink">{product.name}</h2>
                  <p className="tabular mt-1 text-base font-extrabold text-brand">Rp {rupiah(product.price)}</p>
                  <p className="tabular mt-1 text-xs text-ink-muted">
                    {product.stock > 5 ? `Stok ${product.stock}` : `Sisa ${product.stock}`}
                  </p>
                  <Link href={buyHref} className="btn btn-outline btn-sm mt-auto w-full">
                    <Icon name="plus" className="h-4 w-4" />
                    Beli
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
