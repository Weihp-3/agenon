"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Flash } from "@/components/flash";
import { PasswordInput } from "@/components/password-input";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.passwordConfirmation) {
      setError("Kata sandi dan konfirmasi tidak cocok.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.set("name", formData.name);
    fd.set("email", formData.email);
    fd.set("password", formData.password);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mendaftar. Coba lagi.");
        setLoading(false);
        return;
      }

      router.push("/login?flash=success&msg=Akun+berhasil+dibuat.+Silakan+masuk.");
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
      <h1 className="text-xl font-bold text-ink">Buat akun baru</h1>
      <p className="mt-1.5 text-sm text-ink-muted">Daftar untuk mulai memesan di Warung Mama Zaviyar.</p>

      <Flash errors={error ? [error] : undefined} />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="field-label">Nama lengkap</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="field"
            placeholder="Nama kamu"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="field"
            placeholder="kamu@contoh.com"
            disabled={loading}
          />
        </div>

        <PasswordInput
          label="Kata sandi"
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Minimal 8 karakter"
          disabled={loading}
        />

        <PasswordInput
          label="Konfirmasi kata sandi"
          id="passwordConfirmation"
          name="password_confirmation"
          autoComplete="new-password"
          required
          value={formData.passwordConfirmation}
          onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
          placeholder="Ulangi kata sandi"
          disabled={loading}
        />

        <button type="submit" disabled={loading} className="btn btn-brand w-full py-3">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Daftar...
            </>
          ) : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Masuk di sini
        </Link>
      </p>
    </motion.div>
  );
}