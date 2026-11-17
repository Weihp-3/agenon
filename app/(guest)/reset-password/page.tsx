"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Flash } from "@/components/flash";
import { PasswordInput } from "@/components/password-input";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmation) {
      setError("Kata sandi dan konfirmasi tidak cocok.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (!token) {
      setError("Tautan reset tidak valid.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengatur ulang kata sandi.");
        setLoading(false);
        return;
      }

      router.push("/login?flash=success&msg=Kata+sandi+berhasil+diubah.+Silakan+masuk.");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="text-xl font-bold text-ink">Atur ulang kata sandi</h1>
      <p className="mt-1.5 text-sm text-ink-muted">Buat kata sandi baru untuk akunmu.</p>

      <Flash errors={error ? [error] : undefined} />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <PasswordInput
          label="Kata sandi baru"
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 8 karakter"
          disabled={loading}
        />

        <PasswordInput
          label="Konfirmasi kata sandi"
          id="confirmation"
          name="confirmation"
          autoComplete="new-password"
          required
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="Ulangi kata sandi baru"
          disabled={loading}
        />

        <button type="submit" disabled={loading || !token} className="btn btn-brand w-full py-3">
          {loading ? "Menyimpan..." : "Simpan kata sandi baru"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Kembali ke halaman masuk
        </Link>
      </p>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-ink-muted">Memuat...</div>}>
      <ResetForm />
    </Suspense>
  );
}