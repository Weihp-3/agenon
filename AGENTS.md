<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Warung Mama Zaviyar

## Aturan kerja
- Proyek masih **development**. **Jangan jalankan `bun run build`** setelah tiap perubahan kode — hanya jika diminta eksplisit. Verifikasi cukup `bun run lint` lalu `bunx tsc --noEmit`.
- **Database: Prisma Postgres (produksi).** `.env` (gitignored) memakai `DATABASE_URL` `postgres://...@db.prisma.io:5432/postgres?sslmode=require`. Prisma **tidak** membaca `DB_*`. Untuk dev lokal, arahkan `DATABASE_URL` ke MySQL lokal sendiri. Jangan pernah commit atau menampilkan isi `.env` (AUTH_SECRET, SMTP_PASS, kredensial DB ada di sana).

## Toolchain & command
- Package manager **Bun** (`bun.lock`, `packageManager: bun@1.4.3`). README itu boilerplate create-next-app yang stale (npm/yarn/pnpm, Vercel) — jangan dipakai sebagai acuan.
- Script yang ada: `bun dev`, `bun run lint`, `bun run prisma:generate`, `bun run prisma:migrate` (`prisma migrate deploy`), `bun db:seed`. **Tidak ada script test maupun typecheck** — jangan mengarang `npm test`.
- `postinstall` menjalankan `prisma generate`. Jika tipe Prisma error setelah ubah schema: `bun run prisma:generate`.
- **Tidak ada `prisma/migrations/`.** Untuk sinkron schema ke DB lokal saat dev pakai `bunx prisma db push`; `prisma:migrate` tidak akan berguna tanpa file migrasi.
- `bun db:seed` hanya membuat 2 user: `admin@warung.test`, `user@warung.test`. Password wajib diset lewat env `SEED_PASSWORD` (jangan hardcode). Produk dan transaksi sengaja tidak dibuat — diisi lewat UI admin.

## Arsitektur
- Next.js 16 App Router + React 19, Prisma/PostgreSQL (Prisma Postgres), Auth.js v5 beta (JWT, tanpa adapter), Tailwind 3. Lihat docs di `node_modules/next/dist/docs/` sebelum pakai API yang tidak yakin.
- `app/(guest)/…` = halaman sebelum login; `app/(app)/…` = dilindungi `requireUser()` di layout-nya lalu dibungkus `AppShell`. `app/page.tsx` = landing page.
- `proxy.ts` — **bukan `middleware.ts`** (Next 16 mengganti namanya). Hanya meredirect user yang sudah login dari `/login`, `/register`, `/forgot-password`, `/reset-password` ke `/dashboard`. Cek role ada di page/server action, bukan di sini.
- Role: `user` (pelanggan) dan `admin`. Tidak ada role kasir — semua pengelolaan dilakukan admin. `requireRole()` di `lib/auth.ts` memanggil `forbidden()` → bergantung pada `experimental.authInterrupts: true` di `next.config.ts` dan `app/forbidden.tsx`. Jangan hapus keduanya.
- Server action terkonsentrasi di `lib/*-actions.ts` (cart, product, transaction-admin, profile, password, dll.), bukan di dalam `app/`.
- Alias `@/*` = root repo. Singleton Prisma ada di `lib/db.ts` (cache di `globalThis` agar hot reload tidak membuka pool baru).
- `output: "standalone"`; Dockerfile memakai Bun Alpine + engine Prisma musl (`binaryTargets` di schema). Jangan sentuh kecuali ada tugas deploy.

## UI & konten
- Ikuti `DESIGN.md` untuk palet, font (Plus Jakarta Sans + JetBrains Mono), dan konsep "struk sebagai frame halaman" — jangan ganti ke gaya generik.
- Bahasa Indonesia santai: "Kamu" bukan "Anda", "Belanja" bukan "Transaksi". Angka memakai tabular figures.
