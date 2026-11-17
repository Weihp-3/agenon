import Link from "next/link";

import { Icon } from "@/components/icon";

export default function Forbidden() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-brand">403</p>
      <h1 className="mt-2 text-xl font-bold text-ink">Tidak boleh diakses</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Akun kamu tidak punya peran yang diperlukan untuk halaman ini.
      </p>
      <Link href="/dashboard" className="btn btn-brand mt-6">
        <Icon name="home" className="h-4 w-4" />
        Kembali ke dashboard
      </Link>
    </div>
  );
}
