import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Stat } from "@/components/stat";
import { Panel } from "@/components/panel";
import { Chip } from "@/components/chip";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/empty-state";
import { rupiah } from "@/lib/format";

export async function DashboardPage() {
  const user = await requireRole("user");

  // Count products with stock > 0 (same as Laravel: Product::where('stock', '>', 0)->select(['id'])->cursor())
  const productsCount = await db.products.count({
    where: { stock: { gt: 0 } },
  });

  // Count completed transactions for this user
  const totalTransaksi = await db.transactions.count({
    where: {
      user_id: user.id,
      status: "selesai",
    },
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Stat
          label="Transaksi selesai"
          value={totalTransaksi}
          note="Pesanan yang sudah kamu ambil"
          tone="brand"
          icon="receipt"
        />

        <Stat
          label="Produk tersedia"
          value={productsCount}
          note="Produk yang masih bisa dipesan"
          icon="box"
        />
      </div>

      <Panel title="Akun kamu" description="Data ini dipakai untuk memproses pesanan dan takinganmu.">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold text-ink-muted">Nama</dt>
            <dd className="mt-1 truncate text-sm font-semibold text-ink">
              {user.name}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-ink-muted">Email</dt>
            <dd className="mt-1 flex items-center gap-2 truncate text-sm font-semibold text-ink">
              <Icon name="mail" className="h-4 w-4 shrink-0 text-ink-subtle" />
              {user.email}
            </dd>
          </div>
        </dl>

        <a href="/pembelian" className="btn btn-outline btn-sm mt-4">
          <Icon name="pencil" className="h-4 w-4" />
          Ubah data profil
        </a>
      </Panel>

      <Panel title="Pintasan cepat" description="Langsung ke bagian yang paling sering dipakai.">
        <div className="grid gap-3 sm:grid-cols-3">
          <a href="/pembelian" className="flex items-center gap-3 rounded-lg border border-ink/10 px-4 py-3.5 transition-colors duration-quick ease-swift ease-swift hover:bg-ink/5">
            <Icon name="cart" className="h-5 w-5 shrink-0 text-brand" />
            <span className="min-w-0">
              <span class="block text-sm font-semibold text-ink">Belanja</span>
              <span class="block text-xs text-ink-muted">Pilih produk yang mau kamu beli</span>
            </span>
            <Icon name="chevron-right" className="ml-auto h-4 w-4 shrink-0 text-ink-subtle" />
          </a>

          <a href="/pesanan" className="flex items-center gap-3 rounded-lg border border-ink/10 px-4 py-3.5 transition-colors duration-quick ease-swift ease-swift hover:bg-ink/5">
            <Icon name="orders" className="h-5 w-5 shrink-0 text-brand" />
            <span className="min-w-0">
              <span class="block text-sm font-semibold text-ink">Pesanan saya</span>
              <span class="block text-xs text-ink-muted">Lacak status pesanan aktif</span>
            </span>
            <Icon name="chevron-right" className="ml-auto h-4 w-4 shrink-0 text-ink-subtle" />
          </a>

          <a href="/riwayat" className="flex items-center gap-3 rounded-lg border border-ink/10 px-4 py-3.5 transition-colors duration-quick ease-swift ease-swift hover:bg-ink/5">
            <Icon name="receipt" className="h-5 w-5 shrink-0 text-brand" />
            <span className="min-w-0">
              <span class="block text-sm font-semibold text-ink">Riwayat</span>
              <span class="block text-xs text-ink-muted">Semua transaksi sebelumnya</span>
            </span>
            <Icon name="chevron-right" className="ml-auto h-4 w-4 shrink-0 text-ink-subtle" />
          </a>
        </div>
      </Panel>
    </div>
  );
}