import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Icon } from "@/components/icon";
import { storeKasir } from "@/lib/admin-kasir-actions";
import { Flash } from "@/components/flash";

export default async function CreateKasirPage() {
  await requireRole("admin");

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Tambah Kasir Baru</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Buat akun kasir baru untuk warung. Peran akan diatur otomatis sebagai kasir.
        </p>
      </div>

      <Flash />

      <form action={storeKasir} className="space-y-4 rounded-xl border border-ink/10 bg-surface-raised p-5">
        <div>
          <label htmlFor="name" className="field-label">Nama lengkap</label>
          <input id="name" name="name" type="text" required className="field" placeholder="Nama kasir" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="field"
            placeholder="kasir@warung.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="field-label">Kata sandi</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="field"
            placeholder="Minimal 8 karakter"
          />
        </div>
        <div>
          <label htmlFor="password_confirmation" className="field-label">Konfirmasi kata sandi</label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            required
            className="field"
            placeholder="Ulangi kata sandi"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" className="btn btn-brand flex-1">
            <Icon name="check" className="h-4 w-4" />
            Simpan kasir
          </button>
          <Link href="/kasir-akun" className="btn btn-quiet flex-1">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}