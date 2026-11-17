import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Panel } from "@/components/panel";
import { EmptyState } from "@/components/empty-state";
import { Chip } from "@/components/chip";
import { rupiah } from "@/lib/format";

export default async function InventoryAlertsPage() {
  await requireRole("admin");

  const alerts = await db.inventory_alerts.findMany({
    where: { is_active: true },
    orderBy: { created_at: "desc" },
    include: { products: true },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Peringatan stok</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Atur ambang stok dan pantau produk yang menipis.
        </p>
      </div>

      <Panel title="Aturan peringatan aktif" description="Ambang batas yang dipakai untuk tiap produk.">
        {alerts.length === 0 ? (
          <EmptyState
            title="Belum ada aturan peringatan"
            description="Aturan peringatan bisa dibuat dari data produk di inventory dashboard."
            icon="bell"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="table-head border-b border-ink/10">
                <tr>
                  <th className="px-2 py-2">Produk</th>
                  <th className="px-2 py-2">Stok</th>
                  <th className="px-2 py-2">Ambang rendah</th>
                  <th className="px-2 py-2">Kritis</th>
                  <th className="px-2 py-2">Reorder</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="px-2 py-2.5 font-medium text-ink">{alert.products.name}</td>
                    <td className="tabular px-2 py-2.5 text-ink">{alert.products.stock}</td>
                    <td className="tabular px-2 py-2.5 text-ink-muted">{alert.low_stock_threshold}</td>
                    <td className="tabular px-2 py-2.5 text-ink-muted">{alert.critical_threshold}</td>
                    <td className="tabular px-2 py-2.5 text-ink-muted">{alert.reorder_quantity}</td>
                    <td className="px-2 py-2.5">
                      <Chip
                        tone={
                          alert.products.stock <= alert.critical_threshold
                            ? "danger"
                            : alert.products.stock <= alert.low_stock_threshold
                              ? "warn"
                              : "ok"
                        }
                      >
                        {alert.products.stock <= alert.critical_threshold
                          ? "Kritis"
                          : alert.products.stock <= alert.low_stock_threshold
                            ? "Menipis"
                            : "Aman"}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Ringkasan nilai reorder" description="Estimasi dana yang dibutuhkan untuk mengisi ulang stok kritis.">
        <p className="tabular text-2xl font-extrabold text-brand">
          Rp{" "}
          {rupiah(
            alerts
              .filter((a) => a.products.stock <= a.low_stock_threshold)
              .reduce((sum, a) => sum + a.reorder_quantity * a.products.price, 0),
          )}
        </p>
      </Panel>
    </div>
  );
}