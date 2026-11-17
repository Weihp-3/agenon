import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Stat } from "@/components/stat";
import { Panel } from "@/components/panel";
import { Chip } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { rupiah } from "@/lib/format";

export default async function InventoryDashboardPage() {
  await requireRole("admin");

  const products = await db.products.findMany({
    where: { deleted_at: null },
    orderBy: { stock: "asc" },
  });

  const criticalCount = products.filter((p) => p.stock <= 5).length;
  const lowCount = products.filter((p) => p.stock > 5 && p.stock <= 10).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Dashboard stok</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Ringkasan stok kritis, stok menipis, dan perkiraan kapan produk habis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Stok kritis" value={criticalCount} note="≤ 5 tersisa" tone="brand" icon="warning" />
        <Stat label="Stok menipis" value={lowCount} note="6–10 tersisa" icon="stock" />
        <Stat label="Nilai stok" value={`Rp ${rupiah(totalValue)}`} note="Estimasi nilai inventory" icon="box" />
      </div>

      <Panel
        title="Stok terendah"
        description="Produk dengan sisa stok paling sedikit."
        actions={
          <a href="/inventory/alerts" className="text-xs font-semibold text-brand hover:underline">
            Atur ambang
          </a>
        }
      >
        {products.length === 0 ? (
          <EmptyState title="Belum ada produk" icon="box" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="table-head border-b border-ink/10">
                <tr>
                  <th className="px-2 py-2">Produk</th>
                  <th className="px-2 py-2">Kategori</th>
                  <th className="px-2 py-2">Harga</th>
                  <th className="px-2 py-2">Stok</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {products.slice(0, 20).map((product) => (
                  <tr key={product.id}>
                    <td className="px-2 py-2.5 font-medium text-ink">{product.name}</td>
                    <td className="px-2 py-2.5 text-ink-muted">{product.category ?? "-"}</td>
                    <td className="tabular px-2 py-2.5 text-ink-muted">{rupiah(product.price)}</td>
                    <td className="tabular px-2 py-2.5 font-semibold text-ink">{product.stock}</td>
                    <td className="px-2 py-2.5">
                      <Chip
                        tone={
                          product.stock <= 0
                            ? "danger"
                            : product.stock <= 5
                              ? "warn"
                              : product.stock <= 10
                                ? "info"
                                : "ok"
                        }
                      >
                        {product.stock <= 0
                          ? "Habis"
                          : product.stock <= 5
                            ? "Kritis"
                            : product.stock <= 10
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
    </div>
  );
}