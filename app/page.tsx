"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Icon } from "@/components/icon";
import { rupiah } from "@/lib/format";

const sampleProducts = [
  { id: 1, name: "Nasi Goreng Spesial", price: 18000, image: "/images/food-restaurant.jpeg", category: "Makanan" },
  { id: 2, name: "Es Teh Manis", price: 5000, image: "/images/drink-cafe.jpeg", category: "Minuman" },
  { id: 3, name: "Mie Goreng Pedas", price: 15000, image: "/images/food-restaurant.jpeg", category: "Makanan" },
  { id: 4, name: "Kopi Susu Gula Aren", price: 12000, image: "/images/drink-cafe.jpeg", category: "Minuman" },
];

const steps = [
  { number: 1, title: "Pilih", desc: "Buka katalog, pilih produk, atur jumlahnya." },
  { number: 2, title: "Bayar", desc: "Tunai, QRIS, transfer, atau pakai saldo." },
  { number: 3, title: "Ambil", desc: "Tunjukkan kode 6 huruf di kasir, selesai." },
];

const features = [
  { icon: "clock", title: "Buka 07:00–21:00", desc: "Setiap hari, termasuk akhir pekan." },
  { icon: "cash", title: "Bayar fleksibel", desc: "Tunai, QRIS, transfer, saldo." },
  { icon: "bell", title: "Notifikasi real-time", desc: "Pesan siap → HP berbunyi." },
  { icon: "shield", title: "Transaksi aman", desc: "Kode ambil unik, struk digital." },
];

export default function LandingPage() {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showPrefill, setShowPrefill] = useState(false);

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = sampleProducts.find((x) => x.id === Number(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const itemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  function addToCart(id: number) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }

  function removeFromCart(id: number) {
    setCart((c) => {
      const next = { ...c };
      if (next[id] && next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });
  }

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface px-4 py-12 md:py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink md:text-5xl lg:text-6xl"
              >
                Pesan lewat HP, ambil di warung.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 text-lg text-ink-muted max-w-xl mx-auto lg:mx-0"
              >
                Warung Mama Zaviyar buka 07:00–21:00 WIB. Pilih makanan & minuman, bayar tunai/QRIS/transfer/saldo, tunjukkan kode ambil di kasir.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start"
              >
                <Link
                  href="/pembelian"
                  className="btn btn-brand text-base px-6 py-3"
                >
                  <Icon name="cart" className="h-5 w-5" />
                  Mulai Belanja
                </Link>
                <Link
                  href="/login"
                  className="btn btn-outline text-base px-6 py-3"
                >
                  <Icon name="user" className="h-5 w-5" />
                  Masuk / Daftar
                </Link>
              </motion.div>

              {/* Live Calculator */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 rounded-xl border border-ink/10 bg-surface-raised p-4 md:p-6"
              >
                <p className="text-sm font-semibold text-ink">Coba hitung belanjamu</p>
                <p className="mt-1 text-xs text-ink-muted">Pilih produk contoh, lihat total, lalu lanjut ke halaman belanja.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {sampleProducts.map((p) => (
                    <motion.button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p.id)}
                      whileTap={{ scale: 0.97 }}
                      className="relative flex items-center gap-3 rounded-lg border border-ink/10 bg-surface p-3 transition-colors hover:border-brand/50 hover:bg-brand/5"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                        <p className="text-xs text-ink-muted">{p.category}</p>
                        <p className="tabular text-sm font-bold text-brand">Rp {rupiah(p.price)}</p>
                      </div>
                      <Icon name="plus" className="h-5 w-5 text-brand" />
                    </motion.button>
                  ))}
                </div>

                {itemCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 rounded-lg bg-brand-soft p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-brand-soft-ink">
                        {itemCount} item · Total: <span className="tabular">Rp {rupiah(total)}</span>
                      </span>
                      <Link href="/pembelian" className="btn btn-brand btn-sm">
                        Lihat katalog
                      </Link>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-sunken"
            >
              <Image
                src="/images/hero-warung.jpeg"
                alt="Interior Warung Mama Zaviyar"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 text-brand-on">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <Icon name="pin" className="h-4 w-4" />
                  Jl. Raya Serpong No. 42, Tangerang
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium ml-auto">
                  <Icon name="clock" className="h-4 w-4" />
                  07:00–21:00 WIB
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Cara Pakai */}
      <section className="px-4 py-16 md:py-24 bg-surface-sunken">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto"
        >
          <header className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Cara pakai: Pilih → Bayar → Ambil
            </h2>
            <p className="mt-3 text-lg text-ink-muted max-w-2xl mx-auto">
              Tidak perlu antri lama. Pesan dari tempat duduk, bayar pilihanmu, ambil saat siap.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.1 * (i + 1), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-surface-raised border border-ink/10"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-brand-on text-2xl font-extrabold tabular">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{step.desc}</p>
                {step.number < 3 && (
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 hidden md:block text-ink-subtle">
                    <Icon name="chevronRight" className="h-6 w-6" />
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Produk Populer */}
      <section className="px-4 py-16 md:py-24 bg-surface">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto"
        >
          <header className="flex flex-col items-start justify-between gap-4 mb-10 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
                Produk populer hari ini
              </h2>
              <p className="mt-1 text-lg text-ink-muted">
                Stok & harga update real-time dari kasir.
              </p>
            </div>
            <Link
              href="/pembelian"
              className="btn btn-outline shrink-0"
            >
              <Icon name="box" className="h-4 w-4" />
              Lihat semua produk
            </Link>
          </header>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sampleProducts.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.08 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-2xl border border-ink/10 bg-surface-raised overflow-hidden transition-shadow hover:shadow-float"
              >
                <Link href={`/pembelian#product-${p.id}`} className="block">
                  <div className="aspect-square relative overflow-hidden bg-surface-sunken">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-brand-soft-ink bg-brand-soft px-2 py-0.5 rounded inline-block">{p.category}</p>
                    <h3 className="mt-2 truncate text-base font-bold text-ink group-hover:text-brand transition-colors">{p.name}</h3>
                    <p className="mt-1 tabular text-lg font-extrabold text-brand">Rp {rupiah(p.price)}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Fitur untuk Kasir & Admin */}
      <section className="px-4 py-16 md:py-24 bg-surface-sunken">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
                Dibangun untuk kasir & admin
              </h2>
              <p className="mt-4 text-lg text-ink-muted max-w-md">
                Warung butuh alat yang cepat dan jujur. Sistem ini menangani kas harian, stok, dan laporan tanpa pekerjaan tambahan.
              </p>
              <div className="mt-8 aspect-[5/4] relative overflow-hidden rounded-2xl bg-surface-sunken">
                <Image
                  src="/images/shop-interior.jpeg"
                  alt="Rak produk di Warung Mama Zaviyar"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </div>

            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {features.map((f, i) => (
                <motion.li
                  key={f.icon}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: 0.08 * i, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-4 py-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-ink">
                    <Icon name={f.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-ink">{f.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{f.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 md:py-24 bg-surface">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Siap belanja hari ini?
          </h2>
          <p className="mt-3 text-lg text-ink-muted">
            Buka katalog, pilih favoritmu, dan ambil di warung dalam hitungan menit.
          </p>
          <Link
            href="/pembelian"
            className="mt-8 btn btn-brand text-base px-8 py-3 inline-flex"
          >
            <Icon name="cart" className="h-5 w-5" />
            Mulai Belanja Sekarang
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/10 bg-surface-sunken px-4 py-10 md:py-14">
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand text-brand-on">
                <Icon name="store" className="h-5 w-5" />
              </span>
              <span className="font-bold text-ink">Warung Mama Zaviyar</span>
            </Link>
            <p className="text-sm text-ink-muted max-w-xs">
              Warung klontong modern dekat sekolah. Pesan lewat HP, bayar fleksibel, ambil dengan kode.
            </p>
            <dl className="mt-6 grid gap-2 text-sm text-ink-muted">
              <div className="flex gap-2"><dt className="font-semibold w-20">Alamat</dt><dd>Jl. Raya Serpong No. 42, Tangerang</dd></div>
              <div className="flex gap-2"><dt className="font-semibold w-20">Buka</dt><dd>07:00–21:00 WIB (Setiap hari)</dd></div>
              <div className="flex gap-2"><dt className="font-semibold w-20">Bayar</dt><dd>Tunai, QRIS, Transfer, Saldo</dd></div>
            </dl>
          </div>
          <nav>
            <h4 className="font-semibold text-ink mb-3">Pelanggan</h4>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li><Link href="/pembelian" className="hover:text-brand transition-colors">Belanja Produk</Link></li>
              <li><Link href="/pesanan" className="hover:text-brand transition-colors">Pesanan Saya</Link></li>
              <li><Link href="/riwayat" className="hover:text-brand transition-colors">Riwayat Belanja</Link></li>
            </ul>
          </nav>
          <nav>
            <h4 className="font-semibold text-ink mb-3">Kasir & Admin</h4>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li><Link href="/login" className="hover:text-brand transition-colors">Masuk Kasir</Link></li>
              <li><Link href="/login" className="hover:text-brand transition-colors">Masuk Admin</Link></li>
            </ul>
          </nav>
        </div>
        <div className="mt-8 border-t border-ink/10 pt-6 max-w-6xl mx-auto">
          <p className="text-xs text-ink-subtle text-center md:text-left">
            © {new Date().getFullYear()} Warung Mama Zaviyar. Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </main>
  );
}