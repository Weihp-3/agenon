"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { loginAction } from "@/lib/session-actions";
import { Flash } from "@/components/flash";
import { PasswordInput } from "@/components/password-input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData();
    fd.set("email", formData.email);
    fd.set("password", formData.password);

    const result = await loginAction(undefined, fd);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="text-xl font-bold text-ink">Masuk ke akunmu</h1>

      <Flash errors={error ? [error] : undefined} />

      <GoogleSignInButton callbackUrl={callbackUrl} />

      <div className="my-5 flex items-center gap-3 text-xs text-ink-subtle">
        <span className="h-px flex-1 bg-ink/10" />
        atau pakai email
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••"
          disabled={loading}
        />

        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-brand hover:underline">
            Lupa kata sandi?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn btn-brand w-full py-3">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Masuk...
            </>
          ) : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-brand hover:underline">
          Daftar di sini
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-ink-muted">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
