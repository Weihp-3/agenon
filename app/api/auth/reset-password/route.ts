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

    const record = await db.password_reset_tokens.findFirst({ where: { token } });
    if (!record) {
      return NextResponse.json({ error: "Tautan reset tidak valid atau sudah dipakai." }, { status: 400 });
    }

    if (record.created_at && Date.now() - record.created_at.getTime() > ONE_HOUR) {
      await db.password_reset_tokens.delete({ where: { email: record.email } });
      return NextResponse.json({ error: "Tautan reset sudah kedaluwarsa. Minta yang baru." }, { status: 400 });
    }

    await db.$transaction([
      db.users.update({
        where: { email: record.email },
        data: { password: await bcrypt.hash(password, 12) },
      }),
      db.password_reset_tokens.delete({ where: { email: record.email } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("reset-password error", error);
    return NextResponse.json({ error: "Gagal mengatur ulang kata sandi." }, { status: 500 });
  }
}