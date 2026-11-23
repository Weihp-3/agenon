import { db } from "@/lib/db";
import { requireRole, type SessionUser } from "@/lib/auth";
import { Stat } from "@/components/stat";
import { Panel } from "@/components/panel";
import { Chip } from "@/components/chip";
import { Flash } from "@/components/flash";
import { Icon } from "@/components/icon";
import { rupiah, formatDateTime } from "@/lib/format";
import { startShiftAction, endShiftAction } from "@/lib/kasir-actions";

export default async function KasirDashboardPage() {
  const user: SessionUser = await requireRole("kasir");
  const kasirId = BigInt(user.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todaySales, todayCount, waitingCount, openShift, previousShift] = await Promise.all([
    db.orm.public.transactions
      .where({ status: "selesai" })
      .where((t) => t.created_at.gte(today))
      .where((t, { fns }) => fns.or(t.user_id.eq(kasirId), t.customer_name.neq(null)))
      .aggregate((agg) => ({ total: agg.sum("total_price") })),
    db.orm.public.transactions
      .where({ status: "selesai" })
      .where((t) => t.created_at.gte(today))
      .aggregate((agg) => ({ total: agg.count() }))
      .then((r) => r.total),
    db.orm.public.transactions
      .where({ status: "menunggu" })
      .aggregate((agg) => ({ total: agg.count() }))
      .then((r) => r.total),
    db.orm.public.shifts
      .where({ kasir_id: kasirId, closed_at: null })
      .orderBy((s) => s.opened_at.desc())
      .first(),
    db.orm.public.shifts
      .where({ kasir_id: kasirId })
      .where((s) => s.closed_at.neq(null))
      .select("actual_cash")
      .orderBy((s) => s.closed_at.desc())
      .first(),
  ]);

  const shiftCashSales = openShift
    ? await db.orm.public.transactions
        .where({ shift_id: openShift.id, status: "selesai", payment_method: "cash" })
        .aggregate((agg) => ({ total: agg.sum("total_price"), count: agg.count() }))
    : null;
  const expectedCash = openShift
    ? Number(openShift.opening_balance) + Number(shiftCashSales?.total ?? 0)
    : 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Dashboard kasir</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Ringkasan penjualan hari ini dan status shift kamu.
        </p>
      </div>

      <Flash />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat
          label="Penjualan hari ini"
          value={`Rp ${rupiah(todaySales.total ?? 0)}`}
          note={`${todayCount} transaksi selesai`}
          tone="brand"
          icon="chart"
        />
        <Stat
          label="Pesanan menunggu"
          value={waitingCount}
          note="Perlu disiapkan"
          icon="bell"
        />
        <Stat
          label="Status shift"
          value={openShift ? "Aktif" : "Belum buka"}
          note={openShift ? `Sejak ${formatDateTime(openShift.opened_at)}` : "Buka shift untuk mulai"}
          icon="clock"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title={openShift ? "Shift berjalan" : "Buka shift baru"}
          description={
            openShift
              ? `Saldo pembukaan Rp ${rupiah(Number(openShift.opening_balance))} · Harapan kas Rp ${rupiah(expectedCash)}`
              : previousShift?.actual_cash != null
                ? `Saldo otomatis dari shift sebelumnya: Rp ${rupiah(Number(previousShift.actual_cash))}`
                : "Saldo awal hanya perlu diisi saat shift pertama."
          }
        >
          {openShift ? (
            <form action={endShiftAction} className="space-y-3">
              <div className="rounded-lg bg-surface-sunken p-3 text-sm text-ink-muted">
                {shiftCashSales?.count ?? 0} transaksi tunai · Kas harapan: <strong className="text-ink">Rp {rupiah(expectedCash)}</strong>
              </div>
              <div>
                <label htmlFor="actual_cash" className="field-label">Uang kas akhir</label>
                <input
                  id="actual_cash"
                  name="actual_cash"
                  type="number"
                  min="0"
                  step="1"
                  required
                  className="field tabular"
                  placeholder="Contoh: 350000"
                />
              </div>
              <div>
                <label htmlFor="notes" className="field-label">Catatan (opsional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  maxLength={500}
                  className="field"
                  placeholder="Catatan selisih kas..."
                />
              </div>
              <button type="submit" className="btn btn-quiet">
                <Icon name="lock" className="h-4 w-4" />
                Tutup shift
              </button>
            </form>
          ) : (
            <form action={startShiftAction} className="space-y-3">
              {previousShift?.actual_cash == null ? (
                <div>
                  <label htmlFor="opening_balance" className="field-label">Saldo pembukaan</label>
                  <input
                    id="opening_balance"
                    name="opening_balance"
                    type="number"
                    min="0"
                    step="1"
                    required
                    className="field tabular"
                    placeholder="Contoh: 200000"
                  />
                </div>
              ) : (
                <input type="hidden" name="opening_balance" value="" />
              )}
              <button type="submit" className="btn btn-brand">
                <Icon name="unlock" className="h-4 w-4" />
                Buka shift
              </button>
            </form>
          )}
        </Panel>

        <Panel
          title="Aksi cepat"
          description="Pintasan ke halaman yang paling sering dipakai kasir."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="/kasir" className="flex items-center gap-3 rounded-lg border border-ink/10 px-4 py-3 transition-colors hover:bg-ink/5">
              <Icon name="pos" className="h-5 w-5 shrink-0 text-brand" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">Point of Sale</span>
                <span className="block text-xs text-ink-muted">Layani pelanggan langsung</span>
              </span>
            </a>
            <a href="/kasir/pesanan" className="flex items-center gap-3 rounded-lg border border-ink/10 px-4 py-3 transition-colors hover:bg-ink/5">
              <Icon name="orders" className="h-5 w-5 shrink-0 text-brand" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">Antrian pesanan</span>
                <span className="block text-xs text-ink-muted">Proses pesanan HP</span>
              </span>
            </a>
            <a href="/kasir/riwayat" className="flex items-center gap-3 rounded-lg border border-ink/10 px-4 py-3 transition-colors hover:bg-ink/5">
              <Icon name="receipt" className="h-5 w-5 shrink-0 text-brand" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">Riwayat</span>
                <span className="block text-xs text-ink-muted">Transaksi yang diproses</span>
              </span>
            </a>
            <a href="/sale-templates" className="flex items-center gap-3 rounded-lg border border-ink/10 px-4 py-3 transition-colors hover:bg-ink/5">
              <Icon name="box" className="h-5 w-5 shrink-0 text-brand" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">Template</span>
                <span className="block text-xs text-ink-muted">Penjualan berulang</span>
              </span>
            </a>
          </div>
        </Panel>
      </div>
    </div>
  );
}