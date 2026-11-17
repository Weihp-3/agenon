"use server";

import { redirect } from "next/navigation";

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

  const result = await signIn("credentials", {
    email: email.trim(),
    password,
    redirect: false,
  });

  if (result?.error) {
    return { error: "Email atau kata sandi salah." };
  }

  redirect("/dashboard");
}
