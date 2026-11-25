"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import { Icon } from "@/components/icon";
import { rupiah } from "@/lib/format";

type PreviewProduct = {
  id: string;
  name: string;
  price: number;
  category: string | null;
  image: string | null;
  stock: number;
};

export function ProductPreview() {
  const [products, setProducts] = useState<PreviewProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products/preview")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PreviewProduct[]) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="produk" className="scroll-mt-20 bg-surface px-4 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-6xl"
      >
        <header className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Produk populer hari ini
            </h2>
            <p className="mt-1 text-lg text-ink-muted">
              Stok & harga terbaru dari warung.
            </p>
          </div>
          <Link href="/produk" className="btn btn-outline shrink-0">
            <Icon name="box" className="h-4 w-4" />
            Lihat semua produk
          </Link>
        </header>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-ink/5" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/15 bg-surface-raised px-6 py-12 text-center">
            <p className="text-sm font-semibold text-ink">Belum ada produk ditampilkan</p>
            <p className="mt-1 text-sm text-ink-muted">Barang jualan akan muncul di sini setelah tersedia.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.08 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group overflow-hidden rounded-2xl border border-ink/10 bg-surface-raised transition-shadow hover:shadow-float"
              >
                <Link href="/produk" className="block">
                  <div className="relative aspect-square overflow-hidden bg-surface-sunken">
                    <Image
                      src={product.image ?? "/images/default.png"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    {product.category ? (
                      <span className="inline-block rounded bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-soft-ink">
                        {product.category}
                      </span>
                    ) : null}
                    <h3 className="mt-2 truncate text-base font-bold text-ink transition-colors group-hover:text-brand">
                      {product.name}
                    </h3>
                    <p className="tabular mt-1 text-lg font-extrabold text-brand">
                      Rp {rupiah(product.price)}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">Stok {product.stock}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
