"use server";

import { redirect } from "next/navigation";
import { db } from "./db";

export async function storeKasir(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("password_confirmation") ?? "");

  // Validasi sederhana sebelum redirect/return error
  if (!name || !email || !password) {
    redirect("/kasir-akun/create?flash=error&msg=Semua field wajib diisi.");
  }

  if (password !== passwordConfirmation) {
    redirect("/kasir-akun/create?flash=error&msg=Password dan konfirmasi password tidak cocok.");
  }

  // Cek email unik (case-insensitive)
  const existing = await db.users.findFirst({ where: { email } });
  if (existing) {
    redirect("/kasir-akun/create?flash=error&msg=Email sudah terdaftar.");
  }

  // Peran kasir dipaksa, bukan dari input
  await db.users.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role: "kasir",
    },
  });

  redirect("/kasir-akun?flash=success&msg=Kasir berhasil ditambahkan.");
}

export async function destroyKasir(kasirId: string): Promise<void> {
  const user = await db.users.findUnique({ where: { id: BigInt(kasirId) } });
  if (!user || user.role !== "kasir") {
    redirect("/kasir-akun?flash=error&msg=Kasir tidak ditemukan.");
  }

  await db.users.delete({ where: { id: BigInt(kasirId) } });

  redirect("/kasir-akun?flash=success&msg=Kasir berhasil dihapus.");
}

async function hashPassword(password: string): Promise<string> {
  // Simpel: gunakan bcryptjs dari dep atau fallback ke argon2 jos tanpa import tambahan
  // Cek apakah bcrypt tersedia via direkt import, tapi di sini kita pakai argon2
  // yang sudah terinstall karena devDep. Return hashed pakai argon2.
  const { hash } = await import("argon2");
  return hash(password);
}