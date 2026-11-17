import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { rupiah, formatDateOnly } from "@/lib/format";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Suspense } from "react";

export default async function LaporanPage() {
  await requireRole("admin", "kasir");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [transactions, topProducts] = await Promise.all([
    db.transactions.findMany({
      where: { status: "selesai", created_at: { gte: sevenDaysAgo } },
      orderBy: { created_at: "asc" },
      select: { total_price: true, created_at: true },
    }),
    db.transaction_items.groupBy({
      by: ["product_id"],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 6,
    }),
  ]);

  const productIds = topProducts.map((p) => p.product_id);
  const products = await db.products.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const productName = new Map(products.map((p) => [p.id, p.name]));

  const days: { label: string; key: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ label: formatDateOnly(d), key });
  }

  const revenueMap = new Map<string, number>();
  const countMap = new Map<string, number>();
  for (const tx of transactions) {
    if (!tx.created_at) continue;
    const d = new Date(tx.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    revenueMap.set(key, (revenueMap.get(key) ?? 0) + tx.total_price);
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  const labels = days.map((d) => d.label);
  const data = days.map((d) => revenueMap.get(d.key) ?? 0);
  const chartCounts = days.map((d) => countMap.get(d.key) ?? 0);
  const totalRevenue = data.reduce((a, b) => a + b, 0);
  const totalOrders = chartCounts.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Laporan penjualan</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Rekap transaksi selesai, tren harian, dan produk terlaris 7 hari terakhir.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-brand bg-brand p-4 text-brand-on">
          <p className="text-xs font-semibold text-brand-on/80">Total pendapatan</p>
          <p className="tabular mt-2 text-2xl font-extrabold">Rp {rupiah(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-surface-raised p-4">
          <p className="text-xs font-semibold text-ink-muted">Transaksi selesai</p>
          <p className="tabular mt-2 text-2xl font-extrabold text-ink">{totalOrders}</p>
        </div>
      </div>

      <section className="rounded-xl border border-ink/10 bg-surface-raised p-4">
        <h3 className="text-sm font-bold text-ink">Tren pendapatan harian</h3>
        <div className="mt-4 h-72">
          <Suspense fallback={<div className="h-full w-full animate-pulse rounded bg-ink/5" />}>
            <RevenueChart labels={labels} data={data} chartCounts={chartCounts} />
          </Suspense>
        </div>
        <canvas id="salesChart" className="h-full w-full" aria-label="Grafik pendapatan harian" role="img" />
      </section>

      <section className="rounded-xl border border-ink/10 bg-surface-raised">
        <header className="border-b border-ink/10 px-4 py-3.5">
          <h3 className="text-sm font-bold text-ink">Produk terlaris</h3>
        </header>
        {topProducts.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Belum ada data penjualan" icon="chart" />
          </div>
        ) : (
          <ul className="divide-y divide-ink/5">
            {topProducts.map((item, i) => (
              <li key={item.product_id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="tabular flex h-7 w-7 items-center justify-center rounded-md bg-brand-soft text-xs font-bold text-brand-soft-ink">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {productName.get(item.product_id) ?? `Produk #${item.product_id}`}
                  </span>
                </div>
                <div className="text-right">
                  <p className="tabular text-sm font-semibold text-ink">
                    {item._sum.quantity} terjual
                  </p>
                  <p className="tabular text-xs text-ink-muted">
                    Rp {rupiah(item._sum.subtotal ?? 0)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}