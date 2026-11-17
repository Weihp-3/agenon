export type HeaderMeta = { title: string; subtitle?: string };

const HEADERS: Array<{ prefix: string; exact?: boolean; title: string; subtitle?: string }> = [
  { prefix: "/admin/dashboard", exact: true, title: "Dashboard Admin", subtitle: "Ringkasan penjualan, pesanan, dan stok warung" },
  { prefix: "/transactions/pending", exact: true, title: "Verifikasi pembayaran", subtitle: "Transaksi yang menunggu konfirmasi kasir" },
  { prefix: "/products/create", exact: true, title: "Tambah Produk", subtitle: "Buat produk baru untuk warung" },
  { prefix: "/products", exact: true, title: "Data Produk", subtitle: "Kelola produk yang tersedia di warung" },
  { prefix: "/laporan", exact: true, title: "Laporan penjualan", subtitle: "Rekap transaksi selesai, tren harian, dan produk terlaris" },
  { prefix: "/inventory/alerts", exact: true, title: "Peringatan stok", subtitle: "Atur ambang stok dan pantau produk yang menipis" },
  { prefix: "/inventory", exact: true, title: "Dashboard stok", subtitle: "Ringkasan stok kritis, stok menipis, dan perkiraan kapan produk habis" },
  { prefix: "/kasir-akun/create", exact: true, title: "Tambah Kasir Baru", subtitle: "Buat akun kasir baru untuk warung" },
  { prefix: "/kasir-akun", exact: true, title: "Manajemen Kasir", subtitle: "Kelola data kasir dan pantau shift mereka" },
  { prefix: "/kasir-shifts", exact: true, title: "Shift kasir", subtitle: "Pantau shift yang sedang berjalan di setiap kasir" },
  { prefix: "/admin/kasir/laporan", exact: true, title: "Laporan kerja kasir", subtitle: "Rekap shift, transaksi, dan selisih kas per kasir" },
  { prefix: "/kasir/dashboard", exact: true, title: "Dashboard kasir", subtitle: "Ringkasan penjualan hari ini dan status shift" },
  { prefix: "/kasir/pesanan", exact: true, title: "Antrian pesanan", subtitle: "Pesanan siswa yang menunggu dan yang siap diambil" },
  { prefix: "/kasir/checkout", exact: true, title: "Checkout", subtitle: "Periksa pesanan, pilih metode pembayaran, lalu proses transaksi" },
  { prefix: "/kasir/receipt", exact: true, title: "Struk transaksi", subtitle: "Bukti pembayaran untuk transaksi ini" },
  { prefix: "/kasir/riwayat", exact: true, title: "Riwayat transaksi", subtitle: "Transaksi yang Anda proses sebagai kasir" },
  { prefix: "/kasir", exact: true, title: "Point of Sale", subtitle: "Pilih produk, atur jumlah, lalu proses pembayaran" },
  { prefix: "/sale-templates/create", exact: true, title: "Buat template penjualan", subtitle: "Simpan susunan produk dan jumlah yang sering dijual" },
  { prefix: "/sale-templates", exact: true, title: "Template penjualan", subtitle: "Simpan susunan produk yang sering dijual" },
  { prefix: "/shift/history", exact: true, title: "Riwayat shift", subtitle: "Shift yang sudah ditutup beserta rekap uang kasir" },
  { prefix: "/siswa/dashboard", exact: true, title: "Dashboard", subtitle: "Selamat datang di Warung Mama Zaviyar" },
  { prefix: "/user/dashboard", exact: true, title: "Dashboard", subtitle: "Selamat datang di Warung Mama Zaviyar" },
  { prefix: "/siswa/pembelian", exact: true, title: "Belanja produk", subtitle: "Pilih produk, atur jumlah, lalu bayar dan ambil di warung" },
  { prefix: "/pembelian", exact: true, title: "Belanja produk", subtitle: "Pilih produk, atur jumlah, lalu bayar dan ambil di warung" },
  { prefix: "/pesanan", exact: true, title: "Pesanan saya", subtitle: "Lacak pesanan yang menunggu dan yang siap diambil" },
  { prefix: "/riwayat", exact: true, title: "Riwayat pembelian", subtitle: "Semua transaksi pembelian kamu di warung" },
  { prefix: "/profile", exact: true, title: "Pengaturan profil", subtitle: "Kelola data profil, preferensi, dan keamanan akun Anda" },
  { prefix: "/notifications", exact: true, title: "Notifikasi", subtitle: "Pemberitahuan pesanan, stok, dan shift warung" },
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
