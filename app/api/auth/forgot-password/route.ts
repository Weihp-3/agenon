import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { isMailConfigured, sendPasswordResetEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    const user = await db.users.findUnique({ where: { email } });

    // Always respond the same way so accounts cannot be enumerated.
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await db.password_reset_tokens.upsert({
      where: { email },
      create: { email, token, created_at: new Date() },
      update: { token, created_at: new Date() },
    });

    const origin =
      process.env.APP_URL ??
      request.headers.get("origin") ??
      new URL(request.url).origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    if (!isMailConfigured()) {
      // Development fallback: no SMTP configured, surface the link in the UI.
      return NextResponse.json({
        success: true,
        devLink: resetUrl,
        delivered: false,
      });
    }

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });
      return NextResponse.json({ success: true, delivered: true });
    } catch (error) {
      console.error("Gagal mengirim email reset password:", error);
      return NextResponse.json(
        { error: "Email berhasil disiapkan tetapi gagal dikirim. Coba lagi nanti." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("forgot-password error", error);
    return NextResponse.json({ error: "Gagal memproses permintaan." }, { status: 500 });
  }
}
