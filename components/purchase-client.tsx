"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/empty-state";
import { rupiah } from "@/lib/format";
import { createTransactionAction } from "@/lib/student-actions";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
};

const PAYMENTS = [
  { value: "qris", label: "QRIS", icon: "card" },
  { value: "cash", label: "Tunai", icon: "cash" },
  { value: "transfer", label: "Transfer", icon: "download" },
  { value: "saldo", label: "Saldo", icon: "wallet" },
] as const;

export function PurchaseClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [payment, setPayment] = useState("qris");
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => ["Semua", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const [category, setCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  const visible = products.filter(
    (p) =>
      (category === "Semua" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === Number(id)), qty }))
    .filter((x): x is { product: Product; qty: number } => Boolean(x.product));

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  function add(id: number) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setCart((c) => {
      const qty = c[id] || 0;
      if (qty >= product.stock) return c;
      return { ...c, [id]: qty + 1 };
    });
  }

  function subtract(id: number) {
    setCart((c) => {
      const qty = c[id] || 0;
      if (qty <= 1) {
        const next = { ...c };
        delete next[id];
        return next;
      }
      return { ...c, [id]: qty - 1 };
    });
  }

  async function checkout() {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    setError(null);

    const result = await createTransactionAction({
      items: cartItems.map((item) => ({ id: item.product.id, qty: item.qty })),
      payment_method: payment as "qris" | "cash" | "transfer" | "saldo",
      customer_name: customerName || undefined,
    });

    if (result.success) {
      setCart({});
      router.push(`/pesanan?flash=success&msg=${encodeURIComponent(result.message)}`);
      router.refresh();
    } else {
      setError(result.message ?? "Gagal membuat pesanan.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Belanja produk</h2>
          <p className="mt-1 text-sm text-ink-muted">Pilih produk, atur jumlah, lalu bayar dan ambil di warung.</p>
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
            <EmptyState
              title="Produk tidak ditemukan"
              description="Coba kata kunci atau kategori lain."
              icon="search"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((product, i) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-surface-raised"
                >
                  <div className="relative aspect-[4/3] bg-surface-sunken">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />
                    <span className="absolute left-2 top-2 rounded-md bg-surface-raised/90 px-2 py-0.5 text-xs font-semibold text-ink">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-3.5">
                    <h3 className="text-sm font-bold text-ink">{product.name}</h3>
                    <p className="tabular mt-1 text-base font-extrabold text-brand">Rp {rupiah(product.price)}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {product.stock > 5 ? `Stok ${product.stock}` : product.stock > 0 ? `Sisa ${product.stock}` : "Habis"}
                    </p>

                    <div className="mt-auto pt-3">
                      {(cart[product.id] || 0) === 0 ? (
                        <button
                          type="button"
                          onClick={() => add(product.id)}
                          className="btn btn-outline btn-sm w-full"
                        >
                          <Icon name="plus" className="h-4 w-4" />
                          Tambah
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-2 rounded-md border border-brand bg-brand-soft p-1">
                          <button
                            type="button"
                            onClick={() => subtract(product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded text-brand-soft-ink hover:bg-brand/10"
                            aria-label={`Kurangi ${product.name}`}
                          >
                            <Icon name="minus" className="h-4 w-4" />
                          </button>
                          <span className="tabular text-sm font-bold text-brand-soft-ink">{cart[product.id]}</span>
                          <button
                            type="button"
                            onClick={() => add(product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded text-brand-soft-ink hover:bg-brand/10"
                            aria-label={`Tambah ${product.name}`}
                          >
                            <Icon name="plus" className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-ink/10 bg-surface-raised p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-ink">Keranjang</h3>
              <span className="rounded bg-ink/5 px-2 py-0.5 text-xs font-semibold text-ink-muted tabular">
                {totalQty} item
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-8 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-ink/5 text-ink-subtle">
                  <Icon name="cart" className="h-5 w-5" />
                </span>
                <p className="mt-2 text-sm text-ink-muted">Belum ada produk dipilih.</p>
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-ink/5">
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => (
                    <motion.li
                      key={item.product.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between gap-2 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{item.product.name}</p>
                        <p className="text-xs text-ink-muted tabular">
                          {item.qty} × {rupiah(item.product.price)}
                        </p>
                      </div>
                      <p className="tabular shrink-0 text-sm font-semibold text-ink">
                        {rupiah(item.product.price * item.qty)}
                      </p>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}

            <div className="mt-3 border-t border-ink/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted">Total</span>
                <span className="tabular text-lg font-extrabold text-brand">Rp {rupiah(total)}</span>
              </div>
            </div>

            {cartItems.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 space-y-3 overflow-hidden"
              >
                <div>
                  <label htmlFor="customer" className="field-label text-xs">Nama pemesan (opsional)</label>
                  <input
                    id="customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="field py-2 text-sm"
                    placeholder="Nama kamu"
                  />
                </div>
                <div>
                  <p className="field-label text-xs">Metode pembayaran</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENTS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPayment(p.value)}
                        className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs font-semibold transition-colors ${
                          payment === p.value
                            ? "border-brand bg-brand-soft text-brand-soft-ink"
                            : "border-ink/10 text-ink-muted hover:bg-ink/5"
                        }`}
                      >
                        <Icon name={p.icon} className="h-4 w-4" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error ? (
                  <p className="rounded-md bg-status-danger-soft px-3 py-2 text-xs font-medium text-status-danger-ink">
                    {error}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={checkout}
                  disabled={submitting}
                  className="btn btn-brand w-full"
                >
                  {submitting ? "Memproses..." : "Pesan Sekarang"}
                </button>
              </motion.div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}