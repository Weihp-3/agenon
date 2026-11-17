"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { requireUser } from "./auth";

export type UpdateProfileState = { error?: string; message?: string };

/** Update the signed-in user's name and email. Email must stay unique. */
export async function updateProfileAction(
  _prev: UpdateProfileState | undefined,
  formData: FormData,
): Promise<UpdateProfileState> {
  const sessionUser = await requireUser();
  const userId = BigInt(sessionUser.id);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!name) {
    return { error: "Nama wajib diisi." };
  }
  if (!email) {
    return { error: "Email wajib diisi." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Alamat email tidak valid." };
  }

  const existing = await db.users.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    return { error: "Email sudah dipakai akun lain." };
  }

  await db.users.update({
    where: { id: userId },
    data: { name, email },
  });

  revalidatePath("/profile");
  revalidatePath("/user/dashboard");
  return { message: "Profil berhasil diperbarui." };
}
