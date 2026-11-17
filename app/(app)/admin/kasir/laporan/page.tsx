import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { rupiah } from "@/lib/format";

export default async function LaporanKasirPage() {
  await requireRole("admin");

  const kasirs = await db.users.findMany({
    where: { role: "kasir" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      shifts: {
        where: { closed_at: { not: null } },
        select: {
          id: true,
          opened_at: true,
          closed_at: true,
          expected_cash: true,
          actual_cash: true,
          discrepancy: true,
        },
        orderBy: { opened_at: "desc" },
        take: 30,
      },
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Laporan kerja kasir</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Rekap shift, transaksi, dan selisih kas per kasir.
        </p>
      </div>

      {kasirs.length === 0 ? (
        <EmptyState title="Belum ada kasir" description="Tambahkan kasir untuk melihat laporan." icon="users" />
      ) : (
        <div className="space-y-5">
          {kasirs.map((kasir) => {
            const shifts = kasir.shifts;
            const totalExpected = shifts.reduce((s, x) => s + Number(x.expected_cash ?? 0), 0);
            const totalActual = shifts.reduce((s, x) => s + Number(x.actual_cash ?? 0), 0);
            const totalDiscrepancy = shifts.reduce((s, x) => s + Number(x.discrepancy ?? 0), 0);

            return (
              <section
                key={kasir.id}
                className="rounded-xl border border-ink/10 bg-surface-raised p-4 md:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold text-ink">{kasir.name}</h3>
                  <span className="text-xs text-ink-muted">{shifts.length} shift selesai</span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-surface-sunken p-3">
                    <p className="text-xs text-ink-muted">Total harapan</p>
                    <p className="tabular mt-1 font-bold text-ink">Rp {rupiah(totalExpected)}</p>
                  </div>
                  <div className="rounded-lg bg-surface-sunken p-3">
                    <p className="text-xs text-ink-muted">Total aktual</p>
                    <p className="tabular mt-1 font-bold text-ink">Rp {rupiah(totalActual)}</p>
                  </div>
                  <div className="rounded-lg bg-surface-sunken p-3">
                    <p className="text-xs text-ink-muted">Total selisih</p>
                    <p
                      className={`tabular mt-1 font-bold ${
                        totalDiscrepancy < 0 ? "text-status-danger-ink" : "text-status-ok-ink"
                      }`}
                    >
                      {totalDiscrepancy > 0 ? "+" : ""}Rp {rupiah(totalDiscrepancy)}
                    </p>
                  </div>
                </div>

                {shifts.length > 0 ? (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="table-head border-b border-ink/10">
                        <tr>
                          <th className="px-2 py-2">Dibuka</th>
                          <th className="px-2 py-2">Ditutup</th>
                          <th className="px-2 py-2 text-right">Harapan</th>
                          <th className="px-2 py-2 text-right">Aktual</th>
                          <th className="px-2 py-2 text-right">Selisih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5">
                        {shifts.map((shift) => (
                          <tr key={shift.id}>
                            <td className="whitespace-nowrap px-2 py-2 text-ink-muted">
                              {new Date(shift.opened_at).toLocaleString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-ink-muted">
                              {shift.closed_at
                                ? new Date(shift.closed_at).toLocaleString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </td>
                            <td className="tabular px-2 py-2 text-right text-ink-muted">
                              {rupiah(Number(shift.expected_cash))}
                            </td>
                            <td className="tabular px-2 py-2 text-right text-ink-muted">
                              {rupiah(Number(shift.actual_cash))}
                            </td>
                            <td
                              className={`tabular px-2 py-2 text-right font-semibold ${
                                Number(shift.discrepancy ?? 0) < 0
                                  ? "text-status-danger-ink"
                                  : "text-status-ok-ink"
                              }`}
                            >
                              {Number(shift.discrepancy ?? 0) > 0 ? "+" : ""}
                              {rupiah(Number(shift.discrepancy))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}