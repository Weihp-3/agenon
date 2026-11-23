import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user) {
      return NextResponse.json(
        { error: "Kamu sudah masuk. Keluar dulu untuk daftar akun lain." },
        { status: 409 },
      );
    }

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Alamat email tidak valid." }, { status: 400 });
    }

    const existing = await db.users.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        {
          error: existing.google_id
            ? "Email ini terdaftar dengan Google. Silakan masuk dengan Google."
            : "Email sudah terdaftar.",
        },
        { status: 409 },
      );
    }

    await db.users.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 12),
        role: "user",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("register error", error);
    return NextResponse.json({ error: "Gagal mendaftar. Coba lagi." }, { status: 500 });
  }
}