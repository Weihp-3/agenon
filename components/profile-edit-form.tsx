"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Icon } from "./icon";
import { Flash } from "./flash";
import {
  updateProfileAction,
  type UpdateProfileState,
} from "@/lib/profile-actions";

export function ProfileEditForm({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const [state, formAction, pending] = useActionState<
    UpdateProfileState | undefined,
    FormData
  >(updateProfileAction, undefined);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Ubah data profil</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Perbarui nama dan email yang dipakai akun kamu.
        </p>
      </div>

      <Flash errors={state?.error ? [state.error] : undefined} />

      {state?.message ? (
        <div className="rounded-lg border border-status-ok/25 bg-status-ok-soft px-4 py-3 text-sm font-medium text-status-ok-ink">
          {state.message}
        </div>
      ) : null}

      <form
        action={formAction}
        className="space-y-4 rounded-xl border border-ink/10 bg-surface-raised p-5"
      >
        <div>
          <label htmlFor="name" className="field-label">Nama lengkap</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialName}
            className="field"
            placeholder="Nama kamu"
          />
        </div>

        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={initialEmail}
            className="field"
            placeholder="kamu@contoh.com"
          />
          <p className="field-help">Email ini dipakai untuk masuk dan menerima notifikasi.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" disabled={pending} className="btn btn-brand flex-1">
            <Icon name="check" className="h-4 w-4" />
            {pending ? "Menyimpan..." : "Simpan perubahan"}
          </button>
          <Link href="/profile" className="btn btn-quiet flex-1">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}