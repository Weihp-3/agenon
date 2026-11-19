"use client";

import { useActionState, useState } from "react";
import { Icon } from "./icon";
import { Flash } from "./flash";
import { PasswordInput } from "./password-input";
import {
  changePasswordAction,
  type ChangePasswordState,
} from "@/lib/password-actions";

export function PasswordChangeForm() {
  const [state, formAction, pending] = useActionState<
    ChangePasswordState | undefined,
    FormData
  >(changePasswordAction, undefined);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Ganti kata sandi</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Masukkan kata sandi lama, lalu buat kata sandi baru.
        </p>
      </div>

      <Flash errors={state?.error ? [state.error] : undefined} />

      {state?.message ? (
        <div className="flex items-center gap-2 rounded-lg border border-status-ok/25 bg-status-ok-soft px-4 py-3 text-sm font-medium text-status-ok-ink">
          <Icon name="check-circle" className="h-5 w-5 shrink-0" />
          {state.message}
        </div>
      ) : null}

      <form
        action={formAction}
        className="space-y-4 rounded-xl border border-ink/10 bg-surface-raised p-5"
      >
        <PasswordInput
          label="Kata sandi lama"
          id="current_password"
          name="current_password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Kata sandi saat ini"
          disabled={pending}
        />

        <PasswordInput
          label="Kata sandi baru"
          id="new_password"
          name="new_password"
          autoComplete="new-password"
          required
          minLength={8}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="Minimal 8 karakter"
          disabled={pending}
        />

        <PasswordInput
          label="Konfirmasi kata sandi baru"
          id="confirm_password"
          name="confirm_password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Ulangi kata sandi baru"
          disabled={pending}
        />

        <button type="submit" disabled={pending} className="btn btn-brand w-full">
          <Icon name="lock" className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Simpan kata sandi baru"}
        </button>
      </form>
    </div>
  );
}
