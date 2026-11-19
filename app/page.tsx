"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Icon } from "@/components/icon";

const steps = [
  { title: "Pilih produk", desc: "Buka katalog, lihat harga dan stok yang tersedia." },
  { title: "Bayar sesukamu", desc: "Tunai, QRIS, transfer, atau pakai saldo." },
  { title: "Ambil di kasir", desc: "Tunjukkan kode 6 huruf, pesanan siap." },
];

const features = [
  { icon: "clock", title: "Buka setiap hari", desc: "07.00–21.00 WIB, termasuk akhir pekan." },
  { icon: "cash", title: "Bayar fleksibel", desc: "Tunai, QRIS, transfer, dan saldo." },
  { icon: "bell", title: "Notifikasi pesanan", desc: "Kabar saat pesanan siap diambil." },
  { icon: "shield", title: "Kode ambil unik", desc: "Tiap pesanan punya kode 6 huruf." },
];

export default function LandingPage() {
  return (
    <main className="flex-1">
      {/* Top panel */}
      <div className="border-b border-ink/10 bg-brand text-brand-on">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 font-semibold">
            <Icon name="pin" className="h-4 w-4" />
            Jl. Raya Serpong No. 42, Tangerang
          </span>
          <span className="flex items-center gap-2">
            <Icon name="clock" className="h-4 w-4" />
            Buka 07.00–21.00 WIB setiap hari
            <span className="mx-2 hidden h-3 w-px bg-brand-on/40 sm:block" />
            <Link href="/login" className="font-semibold underline underline-offset-2 hover:no-underline">
              Masuk
            </Link>
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-surface px-4 py-12 md:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14"
        >
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-ink md:text-5xl lg:text-6xl">
              Warung Mama Zaviyar.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              Warung kelontong di Tangerang. Pesan lewat HP, bayar tunai, QRIS, transfer, atau saldo, lalu ambil di warung dengan kode.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/pembelian" className="btn btn-brand px-6 py-3 text-base">
                <Icon name="cart" className="h-5 w-5" />
                Lihat produk
              </Link>
              <Link href="/login" className="btn btn-outline px-6 py-3 text-base">
                <Icon name="user" className="h-5 w-5" />
                Masuk akun
              </Link>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-ink/10 pt-6">
              <div>
                <dt className="text-xs text-ink-muted">Lokasi</dt>
                <dd className="mt-1 text-sm font-semibold text-ink">Tangerang, Banten</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Jam buka</dt>
                <dd className="tabular mt-1 text-sm font-semibold text-ink">07.00–21.00 WIB</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Pembayaran</dt>
                <dd className="mt-1 text-sm font-semibold text-ink">Tunai, QRIS, transfer, saldo</dd>
              </div>
            </dl>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-sunken"
          >
            <Image
              src="/images/warung-hero.jpg"
              alt="Rak produk di Warung Mama Zaviyar"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Cara pakai */}
      <section className="bg-surface-sunken px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Cara belanja di sini
          </h2>
          <p className="mt-3 max-w-xl text-lg text-ink-muted">
            Tiga langkah, tanpa antri panjang.
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.1 * i, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="border-t-2 border-brand pt-5"
              >
                <h3 className="text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.desc}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Untuk kasir & admin */}
      <section className="bg-surface px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-sunken">
            <Image
              src="/images/warung-interior.jpg"
              alt="Suasana warung di Tangerang"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Dibangun untuk kasir & admin
            </h2>
            <p className="mt-4 max-w-md text-lg text-ink-muted">
              Alat harian warung: kasir cepat, stok, shift, dan laporan dalam satu tempat.
            </p>

            <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {features.map((f, i) => (
                <motion.li
                  key={f.icon}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: 0.08 * i, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-4 py-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-ink">
                    <Icon name={f.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-ink">{f.title}</h3>
                    <p className="mt-0.5 text-sm text-ink-muted">{f.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-brand px-4 py-16 text-brand-on md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Siap belanja hari ini?
          </h2>
          <p className="mt-3 text-lg text-brand-on/90">
            Buka katalog, pilih produk, dan ambil di warung.
          </p>
          <Link
            href="/pembelian"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-brand-on px-8 py-3 text-base font-bold text-brand transition-transform active:scale-[0.98]"
          >
            <Icon name="cart" className="mr-2 h-5 w-5" />
            Lihat katalog produk
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/10 bg-surface-sunken px-4 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="mb-4 flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand text-brand-on">
                  <Icon name="store" className="h-5 w-5" />
                </span>
                <span className="font-bold text-ink">Warung Mama Zaviyar</span>
              </Link>
              <p className="max-w-xs text-sm text-ink-muted">
                Warung kelontong di Tangerang. Pesan lewat HP, bayar fleksibel, ambil dengan kode.
              </p>
              <dl className="mt-6 grid gap-2 text-sm text-ink-muted">
                <div className="flex gap-2"><dt className="w-20 font-semibold">Alamat</dt><dd>Jl. Raya Serpong No. 42, Tangerang</dd></div>
                <div className="flex gap-2"><dt className="w-20 font-semibold">Buka</dt><dd>07.00–21:00 WIB (Setiap hari)</dd></div>
                <div className="flex gap-2"><dt className="w-20 font-semibold">Bayar</dt><dd>Tunai, QRIS, transfer, saldo</dd></div>
              </dl>
            </div>
            <nav>
              <h4 className="mb-3 font-semibold text-ink">Pelanggan</h4>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li><Link href="/pembelian" className="hover:text-brand">Belanja produk</Link></li>
                <li><Link href="/pesanan" className="hover:text-brand">Pesanan saya</Link></li>
                <li><Link href="/riwayat" className="hover:text-brand">Riwayat belanja</Link></li>
              </ul>
            </nav>
            <nav>
              <h4 className="mb-3 font-semibold text-ink">Kasir & Admin</h4>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li><Link href="/login" className="hover:text-brand">Masuk kasir</Link></li>
                <li><Link href="/login" className="hover:text-brand">Masuk admin</Link></li>
              </ul>
            </nav>
          </div>
          <div className="mt-8 border-t border-ink/10 pt-6">
            <p className="text-center text-xs text-ink-subtle md:text-left">
              © {new Date().getFullYear()} Warung Mama Zaviyar. Hak cipta dilindungi.
            </p>
            <p className="mt-2 text-center text-xs text-ink-subtle md:text-left">
              Foto: Warung Kelontong (CC BY-SA 4.0), Warung Kuta (CC BY-SA 4.0), Wikimedia Commons.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
