"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { requireUser } from "./auth";

export type ChangePasswordState = { error?: string; message?: string };

/** Ganti kata sandi akun yang sedang login setelah verifikasi sandi lama. */
export async function changePasswordAction(
  _prev: ChangePasswordState | undefined,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await requireUser();

  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (!current || !next || !confirm) {
    return { error: "Semua field wajib diisi." };
  }
  if (next.length < 8) {
    return { error: "Kata sandi baru minimal 8 karakter." };
  }
  if (next !== confirm) {
    return { error: "Konfirmasi kata sandi tidak cocok." };
  }
  if (next === current) {
    return { error: "Kata sandi baru harus berbeda dari kata sandi lama." };
  }

  const user = await db.orm.public.users
    .whereUnique({ id: BigInt(session.id) })
    .select("password")
    .first();
  if (!user) {
    return { error: "Akun tidak ditemukan." };
  }

  const matches = await bcrypt.compare(current, user.password);
  if (!matches) {
    return { error: "Kata sandi lama salah." };
  }

  await db.orm.public.users
    .where({ id: BigInt(session.id) })
    .update({ password: await bcrypt.hash(next, 12) });

  revalidatePath("/profile");
  return { message: "Kata sandi berhasil diubah." };
}
