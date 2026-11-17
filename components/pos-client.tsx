"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/empty-state";
import { rupiah } from "@/lib/format";
import { addToCart, updateCart, removeFromCart } from "@/lib/cart-actions";

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  image: string | null;
};

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
};

export function PosClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = useMemo(
    () => ["Semua", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );
  const [category, setCategory] = useState("Semua");

  const visible = products.filter(
    (p) =>
      (category === "Semua" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  async function add(product: Product) {
    setLoading(true);
    const res = await addToCart(product.id, 1);
    if (res.success) setCart(res.cart as CartItem[]);
    setLoading(false);
  }

  async function changeQty(id: number, qty: number) {
    setLoading(true);
    const res = qty < 1 ? await removeFromCart(id) : await updateCart(id, qty);
    if (res.success) setCart(res.cart as CartItem[]);
    setLoading(false);
  }

  async function remove(id: number) {
    setLoading(true);
    const res = await removeFromCart(id);
    if (res.success) setCart(res.cart as CartItem[]);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Point of Sale</h2>
          <p className="mt-1 text-sm text-ink-muted">Pilih produk, atur jumlah, lalu proses pembayaran.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="field pl-9"
            aria-label="Cari produk"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
              category === cat
                ? "bg-brand text-brand-on"
                : "bg-surface-raised text-ink-muted hover:bg-ink/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <section>
          {visible.length === 0 ? (
            <EmptyState title="Produk tidak ditemukan" icon="search" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visible.map((product, i) => (
                <motion.button
                  key={product.id}
                  type="button"
                  onClick={() => add(product)}
                  disabled={loading || product.stock < 1}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.25), duration: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 rounded-xl border border-ink/10 bg-surface-raised p-3 text-left transition-colors hover:border-brand/50 hover:bg-brand/5 disabled:opacity-50"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                    <Image src={product.image} alt="" fill className="object-cover" sizes="56px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{product.name}</span>
                    <span className="tabular block text-sm font-bold text-brand">
                      Rp {rupiah(product.price)}
                    </span>
                    <span className="block text-xs text-ink-muted">Stok {product.stock}</span>
                  </span>
                  <Icon name="plus" className="h-4 w-4 shrink-0 text-brand" />
                </motion.button>
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col rounded-xl border border-ink/10 bg-surface-raised p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-ink">Keranjang</h3>
              <span className="tabular rounded bg-ink/5 px-2 py-0.5 text-xs font-semibold text-ink-muted">
                {count} item
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-ink/5 text-ink-subtle">
                  <Icon name="cart" className="h-5 w-5" />
                </span>
                <p className="mt-2 text-sm text-ink-muted">Klik produk untuk menambah.</p>
              </div>
            ) : (
              <ul className="mt-3 max-h-[24rem] divide-y divide-ink/5 overflow-y-auto scrollbar-quiet">
                {cart.map((item) => (
                  <li key={item.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                        <p className="tabular text-xs text-ink-muted">Rp {rupiah(item.price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="text-ink-subtle hover:text-status-danger-ink"
                        aria-label={`Hapus ${item.name}`}
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-md border border-ink/10">
                        <button
                          type="button"
                          onClick={() => changeQty(item.id, item.qty - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded text-ink-muted hover:bg-ink/5"
                          aria-label="Kurangi"
                        >
                          <Icon name="minus" className="h-4 w-4" />
                        </button>
                        <span className="tabular w-6 text-center text-sm font-bold text-ink">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => changeQty(item.id, item.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded text-ink-muted hover:bg-ink/5"
                          aria-label="Tambah"
                        >
                          <Icon name="plus" className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="tabular text-sm font-semibold text-ink">
                        Rp {rupiah(item.price * item.qty)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto border-t border-ink/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">Total</span>
                <span className="tabular text-xl font-extrabold text-brand">Rp {rupiah(total)}</span>
              </div>
              <button
                type="button"
                disabled={cart.length === 0 || loading}
                onClick={() => router.push("/kasir/checkout")}
                className="btn btn-brand mt-3 w-full"
              >
                Lanjut Bayar
                <Icon name="arrowRight" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}