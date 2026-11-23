import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const ONE_HOUR = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "");
    const password = String(body.password ?? "");

    if (!token || password.length < 8) {
      return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
    }

    const record = await db.orm.public.password_reset_tokens.where({ token }).first();
    if (!record) {
      return NextResponse.json({ error: "Tautan reset tidak valid atau sudah dipakai." }, { status: 400 });
    }

    if (record.created_at && Date.now() - record.created_at.getTime() > ONE_HOUR) {
      await db.orm.public.password_reset_tokens.where({ email: record.email }).delete();
      return NextResponse.json({ error: "Tautan reset sudah kedaluwarsa. Minta yang baru." }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      await tx.orm.public.users.where({ email: record.email }).update({
        password: await bcrypt.hash(password, 12),
      });
      await tx.orm.public.password_reset_tokens.where({ email: record.email }).delete();
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("reset-password error", error);
    return NextResponse.json({ error: "Gagal mengatur ulang kata sandi." }, { status: 500 });
  }
}