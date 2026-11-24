"use server";

import { redirect } from "next/navigation";
import { CredentialsSignin } from "next-auth";

import { signIn, signOut } from "./auth";
import { flashPath } from "./flash";

export async function logoutAction(): Promise<void> {
  await signOut({
    redirectTo: flashPath("/login", "success", "Kamu telah keluar."),
  });
}

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email.trim() || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  try {
    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Email atau kata sandi salah." };
    }
  } catch (error) {
    // Auth.js v5 throws even with redirect: false when credentials are rejected.
    if (error instanceof CredentialsSignin) {
      return { error: "Email atau kata sandi salah." };
    }
    throw error;
  }

  redirect("/dashboard");
}

/** Hanya menerima path relatif agar tidak jadi open redirect. */
export async function googleSignInAction(formData: FormData): Promise<void> {
  const requested = String(formData.get("callbackUrl") ?? "");
  const callbackUrl =
    requested.startsWith("/") && !requested.startsWith("//") && !requested.startsWith("/\\")
      ? requested
      : "/dashboard";

  await signIn("google", { redirectTo: callbackUrl });
}
