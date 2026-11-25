/**
 * The Laravel app ran on APP_TIMEZONE=Asia/Jakarta and APP_LOCALE=id, and wrote
 * every date through Carbon. MySQL TIMESTAMP columns store the same instant, so
 * Prisma hands back a UTC Date and every display here renders it back in WIB
 * with Indonesian names. Nothing is re-interpreted as a local wall clock.
 */

export const TIMEZONE = "Asia/Jakarta";

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(options);
  let value = formatterCache.get(key);
  if (!value) {
    value = new Intl.DateTimeFormat("id-ID", { timeZone: TIMEZONE, ...options });
    formatterCache.set(key, value);
  }
  return value;
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

function partsOf(date: Date): Record<string, string> {
  const parts = formatter({
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const result: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") result[part.type] = part.value;
  }
  return result;
}

function longMonth(date: Date): string {
  return formatter({ month: "long" }).format(date);
}

function shortMonth(date: Date): string {
  return formatter({ month: "short" }).format(date);
}

function shortDay(date: Date): string {
  return formatter({ weekday: "short" }).format(date);
}

/**
 * Carbon-style date pattern. Covers every pattern the Blade views use:
 * d j D l N M F m n Y y H G h i s A a, plus backslash escapes.
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  pattern: string,
): string {
  if (date === null || date === undefined || date === "") return "";

  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const p = partsOf(d);
  const day = Number(p.day);
  const month = Number(p.month);
  const hour = Number(p.hour);
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  const tokens: Record<string, string> = {
    d: pad(day),
    j: String(day),
    D: shortDay(d),
    l: p.weekday,
    N: "",
    w: "",
    M: shortMonth(d),
    F: longMonth(d),
    m: pad(month),
    n: String(month),
    Y: p.year,
    y: p.year.slice(-2),
    H: pad(hour),
    G: String(hour),
    h: pad(hour12),
    g: String(hour12),
    i: p.minute,
    s: p.second,
    A: hour < 12 ? "AM" : "PM",
    a: hour < 12 ? "am" : "pm",
  };

  let out = "";
  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i];
    if (char === "\\") {
      i += 1;
      if (i < pattern.length) out += pattern[i];
      continue;
    }
    out += tokens[char] ?? char;
  }
  return out;
}

export function formatTime(date: Date | string | null | undefined): string {
  return formatDate(date, "H:i");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, "d M Y H:i");
}

export function formatDateOnly(date: Date | string | null | undefined): string {
  return formatDate(date, "d M Y");
}

export function formatDayDate(date: Date | string | null | undefined): string {
  return formatDate(date, "l, d F Y");
}

export function formatDateLong(date: Date | string | null | undefined): string {
  return formatDate(date, "d F Y");
}

export function formatStamp(date: Date | string | null | undefined): string {
  return formatDate(date, "d/m/Y H:i:s");
}

/** Indonesian relative time, the shape Carbon's diffForHumans() produced. */
export function relativeTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));

  if (seconds < 60) return "baru saja";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit yang lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam yang lalu`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari yang lalu`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} minggu yang lalu`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan yang lalu`;

  return `${Math.floor(days / 365)} tahun yang lalu`;
}

export function rupiah(value: number | string | null | undefined): string {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
    Number.isFinite(number) ? number : 0,
  );
}

export function rp(value: number | string | null | undefined): string {
  return `Rp ${rupiah(value)}`;
}

/** Rupiah with one decimal, used by the inventory prediction readouts. */
export function rupiahDecimal(value: number | string | null | undefined): string {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
    Number.isFinite(number) ? number : 0,
  );
}

export function statusLabel(status: string | null | undefined): string {
  switch (status) {
    case "menunggu":
      return "Menunggu disiapkan";
    case "siap":
      return "Siap diambil";
    case "selesai":
      return "Sudah diambil";
    case "batal":
      return "Dibatalkan";
    case "pending":
      return "Menunggu verifikasi";
    default:
      return status ?? "-";
  }
}

export function paymentLabel(method: string | null | undefined): string {
  switch (method) {
    case "qris":
      return "QRIS";
    case "cash":
      return "Tunai";
    case "transfer":
      return "Transfer";
    case "saldo":
      return "Saldo";
    default:
      return method ?? "-";
  }
}

export function roleLabel(role: string | null | undefined): string {
  switch (role) {
    case "admin":
      return "Administrator";
    default:
      return "User";
  }
}

export function adjustmentReasonLabel(reason: string | null | undefined): string {
  switch (reason) {
    case "stok_opname":
      return "Stok opname";
    case "damage":
      return "Rusak";
    case "waste":
      return "Habis terpakai";
    case "manual_correction":
      return "Koreksi manual";
    default:
      return reason ?? "-";
  }
}

export function notificationTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case "success":
      return "Berhasil";
    case "warning":
      return "Peringatan";
    case "error":
      return "Kesalahan";
    default:
      return "Info";
  }
}
