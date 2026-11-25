export type HeaderMeta = { title: string; subtitle?: string };

const HEADERS: Array<{ prefix: string; exact?: boolean; title: string; subtitle?: string }> = [
  { prefix: "/admin/dashboard", exact: true, title: "Dashboard Admin", subtitle: "Ringkasan penjualan, pesanan, dan stok warung" },
  { prefix: "/transactions/pending", exact: true, title: "Verifikasi pembayaran", subtitle: "Transaksi yang menunggu konfirmasi admin" },
  { prefix: "/products/create", exact: true, title: "Tambah Produk", subtitle: "Buat produk baru untuk warung" },
  { prefix: "/products", exact: true, title: "Data Produk", subtitle: "Kelola produk yang tersedia di warung" },
  { prefix: "/laporan", exact: true, title: "Laporan penjualan", subtitle: "Rekap transaksi selesai, tren harian, dan produk terlaris" },
  { prefix: "/inventory/alerts", exact: true, title: "Peringatan stok", subtitle: "Atur ambang stok dan pantau produk yang menipis" },
  { prefix: "/inventory", exact: true, title: "Dashboard stok", subtitle: "Ringkasan stok kritis, stok menipis, dan perkiraan kapan produk habis" },
  { prefix: "/user/dashboard", exact: true, title: "Dashboard", subtitle: "Selamat datang di Warung Mama Zaviyar" },
  { prefix: "/pembelian", exact: true, title: "Belanja produk", subtitle: "Pilih produk, atur jumlah, lalu bayar dan ambil di warung" },
  { prefix: "/pesanan", exact: true, title: "Pesanan saya", subtitle: "Lacak pesanan yang menunggu dan yang siap diambil" },
  { prefix: "/riwayat", exact: true, title: "Riwayat pembelian", subtitle: "Semua transaksi pembelian kamu di warung" },
  { prefix: "/profile", exact: true, title: "Pengaturan profil", subtitle: "Kelola data profil, preferensi, dan keamanan akun Anda" },
  { prefix: "/notifications", exact: true, title: "Notifikasi", subtitle: "Pemberitahuan pesanan dan stok warung" },
];

/**
 * The Blade layouts carried @section('header') per page. This path map keeps
 * the sticky bar in the shell without threading props through a layout.
 */
export function headerMeta(pathname: string): HeaderMeta {
  for (const entry of HEADERS) {
    if (entry.exact ? pathname === entry.prefix : pathname.startsWith(entry.prefix)) {
      return { title: entry.title, subtitle: entry.subtitle };
    }
  }

  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  return { title: segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Dashboard" };
}
