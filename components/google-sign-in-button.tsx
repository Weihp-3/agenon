import { googleSignInAction } from "@/lib/session-actions";

export function GoogleSignInButton({
  callbackUrl = "/dashboard",
  label = "Masuk dengan Google",
}: {
  callbackUrl?: string;
  label?: string;
}) {
  return (
    <form action={googleSignInAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <button type="submit" className="btn btn-outline w-full py-3">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
          <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 010-4.22V7.05H2.18a11 11 0 000 9.9l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
        </svg>
        {label}
      </button>
    </form>
  );
}
