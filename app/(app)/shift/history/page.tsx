import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { Chip } from "@/components/chip";
import { rupiah, shiftStatusLabel, formatDateTime } from "@/lib/format";

export default async function ShiftHistoryPage() {
  const user = await requireRole("kasir");

  const shifts = await db.shifts.findMany({
    where: { kasir_id: BigInt(user.id), closed_at: { not: null } },
    orderBy: { opened_at: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Riwayat shift</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Shift yang sudah ditutup beserta rekap uang kasir.
        </p>
      </div>

      {shifts.length === 0 ? (
        <EmptyState
          title="Belum ada shift selesai"
          description="Shift yang sudah ditutup akan tersimpan di sini."
          icon="clock"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="table-head border-b border-ink/10 bg-surface-sunken">
                <tr>
                  <th className="px-4 py-3">Dibuka</th>
                  <th className="px-4 py-3">Ditutup</th>
                  <th className="px-4 py-3">Saldo awal</th>
                  <th className="px-4 py-3">Harapan</th>
                  <th className="px-4 py-3">Aktual</th>
                  <th className="px-4 py-3">Selisih</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {shifts.map((shift) => {
                  const discrepancy = Number(shift.discrepancy ?? 0);
                  return (
                    <tr key={shift.id} className="hover:bg-ink/[0.02]">
                      <td className="whitespace-nowrap px-4 py-3 text-ink">
                        {formatDateTime(shift.opened_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                        {formatDateTime(shift.closed_at)}
                      </td>
                      <td className="tabular whitespace-nowrap px-4 py-3 text-ink-muted">
                        {rupiah(Number(shift.opening_balance))}
                      </td>
                      <td className="tabular whitespace-nowrap px-4 py-3 text-ink-muted">
                        {rupiah(Number(shift.expected_cash))}
                      </td>
                      <td className="tabular whitespace-nowrap px-4 py-3 text-ink-muted">
                        {rupiah(Number(shift.actual_cash))}
                      </td>
                      <td
                        className={`tabular whitespace-nowrap px-4 py-3 font-semibold ${
                          discrepancy === 0
                            ? "text-status-ok-ink"
                            : discrepancy > 0
                              ? "text-status-ok-ink"
                              : "text-status-danger-ink"
                        }`}
                      >
                        {discrepancy > 0 ? "+" : ""}{rupiah(discrepancy)}
                      </td>
                      <td className="px-4 py-3">
                        <Chip tone={shift.status === "verified" ? "ok" : "neutral"}>
                          {shiftStatusLabel(shift.status)}
                        </Chip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}