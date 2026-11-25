# DESIGN.md — Warung Mama Zaviyar

## Identity
- **Name**: Warung Mama Zaviyar
- **Tagline**: Pesan dan ambil di warung
- **What it is**: Warung klontong modern di Tangerang. User/pelanggan memesan lewat HP, bayar tunai/QRIS/transfer/saldo, lalu ambil di warung dengan kode unik.
- **Audience**: User/pelanggan (utama), admin/owner. Semua pengelolaan dilakukan admin.
- **Location feel**: Tangerang, warung dekat sekolah, jam buka 07:00–21:00 WIB.

## Personality
- **Tone**: Hangat, dekat, jujur, praktis. Bukan "tech startup" — ini warung tetangga yang dipakai setiap hari.
- **Voice**: Bahasa Indonesia santai tapi rapi. "Kamu" bukan "Anda". "Belanja" bukan "Transaksi".
- **Energy**: Tenang tapi hidup. Ada ritme harian: buka pagi, ramai istirahat, tutup malam.

## Palette (from existing globals.css — keep, refine roles)
- **Ground (surface)**: `#f6f8fc` (light) / `#080e1a` (dark) — kertas/lemari warung
- **Ground raised (surface-raised)**: `#ffffff` / `#10192a` — kartu struk, panel admin
- **Ground sunken (surface-sunken)**: `#eee2f9` / `#050a13` — area input, keranjang
- **Ink (ink)**: `#0f172a` / `#e2e8f0` — tulisan di struk, label harga
- **Ink muted (ink-muted)**: `#475569` / `#94a3b8` — keterangan kecil, stok habis
- **Ink subtle (ink-subtle)**: `#74849a` / `#718094` — placeholder, border halus
- **Brand (brand)**: `#2563eb` / `#60a5fa` — biru tusuk sate / kemasan minuman — **accent tunggal**
- **Brand hover**: `#1d4ed8` / `#93c5fd`
- **Brand soft (brand-soft)**: `#eff6ff` / `#162644` — latar badge "siap ambil"
- **Status OK**: `#16804a` / `#4ade80` — stok aman, pesanan selesai
- **Status Warn**: `#b45309` / `#fbbf24` — stok menipis, menunggu
- **Status Danger**: `#be2a2a` / `#f87171` — stok habis, batal
- **Status Info**: `#02779e` / `#22d3ee` — notifikasi sistem

## Typography
- **Display & UI**: Plus Jakarta Sans (400, 500, 600, 700, 800) — modern, legible, karakter warung modern
- **Mono (harga, kode, angka)**: JetBrains Mono (500, 600) — tabular-nums, rapi di struk & tabel
- **Scale**: Dua ukuran kerja — **Display** (sangat besar, untuk hero & judul halaman) dan **Body** (16–18px, leading 1.5). Tidak ada ukuran tengah.
- **Tracking**: Display -0.02em, Body normal.

## Dial
- **ENERGY 2 (Balanced)** — Stripe/Vercel: cukup keras untuk "halo", cukup tenang untuk dipakai harian.
- **RHYTHM 2 (Consistent with breaks)** — Halaman landing punya komposisi berbeda tiap section; dashboard/app screen seragam tapi punya titik fokus jelas.
- **MOTION 2 (Scroll-reveal + transitions)** — Entrance stagger per section, feedback press/hover/focus di setiap kontrol, satu moving picture di hero.

## Imagery inventory (what we have)
- `/public/images/hero-warung.jpeg` — interior warung (hero)
- `/public/images/shop-interior.jpeg` — rak produk
- `/public/images/food-restaurant.jpeg` — makanan siap saji
- `/public/images/drink-cafe.jpeg` — minuman kemasan
- `/public/images/default.png` — fallback produk

## The Idea (one sentence)
> **Struk belanja** menjadi **frame halaman** — setiap section dibungkus seperti item di struk: nama, qty, harga, subtotal; scroll ke bawah = tambah item; footer = total & bayar.

## Competitor test
Warung sebelah juga punya struk. Tapi struk *Warung Mama Zaviyar* punya **kode ambil 6 huruf** (contoh: `A7F2K9`) dan **notifikasi real-time** ke pelanggan. Itu cuma punya kita.

## Live thing (one interactive thing)
**Hero: "Coba hitung belanjamu"** — pelanggan pilih 1–3 produk contoh, lihat total rupiah update real-time, klik "Pesan sekar" → bawa ke `/pembelian` dengan keranjang terisi. Bekerja di HP pakai jari, fallback tanpa JS: link ke `/pembelian` dengan query `?prefill=...`.

## Sections for Landing Page (claim → proof)
1. **Hero** — "Pesan lewat HP, ambil di warung. Buka 07:00–21:00." → Foto interior + live calculator
2. **Cara pakai** — 3 langkah real: Pilih → Bayar → Ambil (dengan kode)
3. **Produk** — tombol navbar/CTA mengarah ke `/produk` (katalog produk, bukan preview di landing)
4. **Tentang warung** — Ringkasan fitur: laporan, stok, verifikasi bayar → screenshot dashboard
5. **FAQ** — Pertanyaan yang sering ditanya
6. **Footer** — Nama warung, jam, alamat, link login/daftar, customer service, link akun sosial (Instagram, Facebook, GitHub)

## App Screen principles (dashboard, user, admin)
- **Quiet borders**, small labels, repeated panels — no gradients, no glows, no icon cards
- **One focal point per screen**: Belanja = keranjang + total; Dashboard = statistik hari ini; Admin = tabel butuh aksi
- **Tabular figures** untuk semua angka (harga, stok, total)
- **States**: empty (belum ada pesanan), loading (skeleton baris), error (banner merah + retry)
- **Keyboard**: Tab order logis, Escape tutup modal, Enter submit form