import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Panel } from "@/components/panel";
import { Icon } from "@/components/icon";
import { roleLabel, formatDateLong } from "@/lib/format";
import { Flash } from "@/components/flash";

export default async function ProfilePage() {
  const sessionUser = await requireUser();

  const user = await db.orm.public.users
    .whereUnique({ id: BigInt(sessionUser.id) })
    .select("id", "name", "email", "avatar", "role", "created_at")
    .first();

  if (!user) {
    return <p className="text-sm text-ink-muted">Profil tidak ditemukan.</p>;
  }

  const initial = (user.name ?? "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Pengaturan profil</h2>
        <p className="mt-1 text-sm text-ink-muted">Data akun dan preferensi kamu.</p>
      </div>

      <Flash />

      <Panel title="Data akun" description="Informasi yang dipakai untuk memproses pesanan.">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-xl font-extrabold text-brand-soft-ink">
            {initial}
          </span>
          <dl className="grid flex-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-ink-muted">Nama</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
                <Icon name="user" className="h-4 w-4 text-ink-subtle" />
                {user.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-ink-muted">Email</dt>
              <dd className="mt-1 flex items-center gap-2 truncate text-sm font-semibold text-ink">
                <Icon name="mail" className="h-4 w-4 text-ink-subtle" />
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-ink-muted">Peran</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{roleLabel(user.role)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-ink-muted">Bergabung</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {formatDateLong(user.created_at)}
              </dd>
            </div>
          </dl>
        </div>
      </Panel>

      <Panel title="Keamanan akun" description="Kelola kata sandi dan sesi masuk kamu.">
        <div className="space-y-3">
          <a href="/profile/edit" className="btn btn-outline btn-sm">
            <Icon name="pencil" className="h-4 w-4" />
            Ubah data profil
          </a>
          <a href="/profile/password" className="btn btn-outline btn-sm">
            <Icon name="lock" className="h-4 w-4" />
            Ubah kata sandi
          </a>
          <p className="text-xs text-ink-muted">
            Lupa kata sandi? Gunakan halaman lupa kata sandi untuk mengirim tautan ke email.
          </p>
          <a href="/forgot-password" className="text-xs font-semibold text-brand hover:underline">
            Lupa kata sandi?
          </a>
        </div>
      </Panel>
    </div>
  );
}