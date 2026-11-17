"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Icon } from "@/components/icon";
import { Flash } from "@/components/flash";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengirim tautan. Coba lagi.");
      } else {
        setSent(true);
        if (data.devLink) setLink(data.devLink);
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="text-xl font-bold text-ink">Lupa kata sandi?</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Masukkan email akunmu. Kami akan mengirim tautan pengaturan ulang kata sandi lewat email.
      </p>

      <Flash errors={error ? [error] : undefined} />

      {sent ? (
        <div className="mt-6 rounded-lg border border-status-ok/25 bg-status-ok-soft px-4 py-3 text-sm text-status-ok-ink">
          <p className="font-semibold flex items-center gap-2">
            <Icon name="check-circle" className="h-4 w-4" />
            Tautan siap.
          </p>
          <p className="mt-1">Jika email terdaftar, tautan reset sudah dibuatkan. Cek kotak masuk emailmu.</p>
          {link ? (
            <div className="mt-3 rounded-md bg-surface-raised p-3">
              <p className="text-xs text-ink-muted mb-1">Mode pengembangan, tautan langsung:</p>
              <Link href={link} className="text-brand font-semibold break-all hover:underline">
                {link}
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="kamu@contoh.com"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-brand w-full py-3">
            {loading ? "Mengirim..." : "Kirim tautan reset"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Kembali ke halaman masuk
        </Link>
      </p>
    </motion.div>
  );
}