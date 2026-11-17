import Link from "next/link";

import { Icon } from "@/components/icon";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="mt-2 text-xl font-bold text-ink">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Alamat yang kamu tuju tidak ada, atau pesanan yang kamu cari sudah dihapus.
      </p>
      <Link href="/" className="btn btn-brand mt-6">
        <Icon name="home" className="h-4 w-4" />
        Kembali ke beranda
      </Link>
    </div>
  );
}
