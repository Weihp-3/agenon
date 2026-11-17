import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { Chip } from "@/components/chip";
import { rupiah, shiftStatusLabel, formatDateTime } from "@/lib/format";

export default async function KasirShiftsPage() {
  await requireRole("admin");

  const shifts = await db.shifts.findMany({
    orderBy: { opened_at: "desc" },
    take: 100,
    include: { users: { select: { name: true } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Shift kasir</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Pantau shift yang sedang berjalan di setiap kasir.
        </p>
      </div>

      {shifts.length === 0 ? (
        <EmptyState title="Belum ada shift" description="Shift kasir akan muncul di sini." icon="clock" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="table-head border-b border-ink/10 bg-surface-sunken">
                <tr>
                  <th className="px-4 py-3">Kasir</th>
                  <th className="px-4 py-3">Dibuka</th>
                  <th className="px-4 py-3">Ditutup</th>
                  <th className="px-4 py-3">Saldo awal</th>
                  <th className="px-4 py-3">Harapan</th>
                  <th className="px-4 py-3">Selisih</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {shifts.map((shift) => {
                  const discrepancy = Number(shift.discrepancy ?? 0);
                  return (
                    <tr key={shift.id} className="hover:bg-ink/[0.02]">
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">
                        {shift.users.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                        {formatDateTime(shift.opened_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                        {shift.closed_at ? formatDateTime(shift.closed_at) : "-"}
                      </td>
                      <td className="tabular whitespace-nowrap px-4 py-3 text-ink-muted">
                        {rupiah(Number(shift.opening_balance))}
                      </td>
                      <td className="tabular whitespace-nowrap px-4 py-3 text-ink-muted">
                        {rupiah(Number(shift.expected_cash))}
                      </td>
                      <td
                        className={`tabular whitespace-nowrap px-4 py-3 font-semibold ${
                          discrepancy < 0 ? "text-status-danger-ink" : "text-status-ok-ink"
                        }`}
                      >
                        {discrepancy > 0 ? "+" : ""}{rupiah(discrepancy)}
                      </td>
                      <td className="px-4 py-3">
                        <Chip tone={shift.status === "open" ? "warn" : shift.status === "verified" ? "ok" : "neutral"}>
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