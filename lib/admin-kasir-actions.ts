"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { requireRole } from "./auth";

/** Admin creates a cashier account. Role is forced to "kasir". */
export async function storeKasir(formData: FormData): Promise<void> {
  await requireRole("admin");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");

  if (!name || !email || !password) {
    return redirect("/kasir-akun/create?flash=error&msg=Semua+field+wajib+diisi.");
  }
  if (password !== confirmation) {
    return redirect("/kasir-akun/create?flash=error&msg=Password+dan+konfirmasi+tidak+cocok.");
  }
  if (password.length < 8) {
    return redirect("/kasir-akun/create?flash=error&msg=Password+minimal+8+karakter.");
  }

  const existing = await db.orm.public.users.where({ email }).first();
  if (existing) {
    return redirect("/kasir-akun/create?flash=error&msg=Email+sudah+terdaftar.");
  }

  await db.orm.public.users.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    role: "kasir",
  });

  return redirect("/kasir-akun?flash=success&msg=Kasir+berhasil+ditambahkan.");
}

/** Admin deletes a cashier account. */
export async function destroyKasir(kasirId: string): Promise<void> {
  await requireRole("admin");

  const user = await db.orm.public.users.whereUnique({ id: BigInt(kasirId) }).first();
  if (!user || user.role !== "kasir") {
    return redirect("/kasir-akun?flash=error&msg=Kasir+tidak+ditemukan.");
  }

  await db.orm.public.users.where({ id: BigInt(kasirId) }).delete();

  return redirect("/kasir-akun?flash=success&msg=Kasir+berhasil+dihapus.");
}