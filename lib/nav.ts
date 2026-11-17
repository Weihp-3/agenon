import { db } from "./db";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  /** Path prefixes that mark this item current. */
  match: string[];
  /** When true only the exact href counts as current. */
  exact?: boolean;
  badge?: "orders";
};

/**
 * Port of AppServiceProvider::menuFor(). Route names became paths; the
 * `user` role is the single customer role.
 */
export function menuFor(role: string | undefined | null): NavItem[] {
  switch (role) {
    case "admin":
      return [
        { label: "Dashboard", href: "/admin/dashboard", icon: "home", match: ["/admin/dashboard"] },
        { label: "Verifikasi Bayar", href: "/transactions/pending", icon: "orders", match: ["/transactions"] },
        { label: "Produk", href: "/products", icon: "box", match: ["/products"] },
        { label: "Stok", href: "/inventory/dashboard", icon: "stock", match: ["/inventory"] },
        { label: "Laporan", href: "/laporan", icon: "chart", match: ["/laporan"] },
        {
          label: "Kasir",
          href: "/kasir-akun",
          icon: "pos",
          match: ["/kasir-akun", "/kasir-shifts"],
        },
        { label: "Laporan Kasir", href: "/admin/kasir/laporan", icon: "chart", match: ["/admin/kasir/laporan"] },
      ];

    case "kasir":
      return [
        { label: "Dashboard", href: "/kasir/dashboard", icon: "home", match: ["/kasir/dashboard"] },
        { label: "Point of Sale", href: "/kasir", icon: "pos", match: ["/kasir"], exact: true },
        { label: "Template Penjualan", href: "/sale-templates", icon: "orders", match: ["/sale-templates"] },
        { label: "Antrian Pesanan", href: "/kasir/pesanan", icon: "bell", match: ["/kasir/pesanan"], badge: "orders" },
        { label: "Riwayat", href: "/kasir/riwayat", icon: "receipt", match: ["/kasir/riwayat"] },
        { label: "Laporan", href: "/laporan", icon: "chart", match: ["/laporan"] },
      ];

    default:
      return [
        { label: "Dashboard", href: "/user/dashboard", icon: "home", match: ["/user/dashboard"] },
        { label: "Beli Produk", href: "/pembelian", icon: "cart", match: ["/pembelian"] },
        { label: "Pesanan Saya", href: "/pesanan", icon: "orders", match: ["/pesanan"], badge: "orders" },
        { label: "Riwayat Belanja", href: "/riwayat", icon: "receipt", match: ["/riwayat"] },
      ];
  }
}

/** Port of AppServiceProvider::pendingCount(). */
export async function pendingCount(
  role: string | undefined | null,
  userId: string,
): Promise<number> {
  if (role === "kasir" || role === "admin") {
    return db.transactions.count({ where: { status: "menunggu" } });
  }

  if (role === "user") {
    return db.transactions.count({
      where: { user_id: BigInt(userId), status: { in: ["menunggu", "siap"] } },
    });
  }

  return 0;
}

