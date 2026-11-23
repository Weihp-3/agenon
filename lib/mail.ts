import nodemailer from "nodemailer";

/**
 * Email pengirim tautan reset password. Konfigurasi SMTP dibaca dari env supaya
 * kredensial tidak pernah masuk ke source. Jika SMTP belum diisi (misalnya di
 * lokal), kirim dilewati dan API mengembalikan tautan langsung untuk development.
 */
export function isMailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT ?? 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(args: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<void> {
  const from =
    process.env.SMTP_FROM ?? `"${process.env.APP_NAME ?? "Warung Mama Zaviyar"}" <no-reply@warungmama.local>`;

  await createTransport().sendMail({
    from,
    to: args.to,
    subject: "Atur ulang kata sandi Warung Mama Zaviyar",
    text: [
      `Halo ${args.name},`,
      "",
      "Kami menerima permintaan untuk mengatur ulang kata sandi akunmu.",
      "Buka tautan ini dalam 1 jam untuk membuat kata sandi baru:",
      args.resetUrl,
      "",
      "Jika kamu tidak meminta ini, abaikan email ini. Kata sandimu tetap aman.",
      "",
      "Warung Mama Zaviyar",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:auto">
        <h2 style="font-size:20px;margin:0 0 16px">Atur ulang kata sandi</h2>
        <p>Halo ${escapeHtml(args.name)},</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Warung Mama Zaviyar kamu.</p>
        <p>
          <a href="${escapeHtml(args.resetUrl)}"
             style="display:inline-block;background:#8EC3B0;color:#142C25;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
            Buat kata sandi baru
          </a>
        </p>
        <p>Atau salin tautan ini ke browser:<br /><span style="word-break:break-all">${escapeHtml(args.resetUrl)}</span></p>
        <p style="color:#475569;font-size:13px">Tautan berlaku 1 jam. Jika kamu tidak meminta ini, abaikan email ini.</p>
        <p style="color:#475569;font-size:13px">Warung Mama Zaviyar</p>
      </div>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
