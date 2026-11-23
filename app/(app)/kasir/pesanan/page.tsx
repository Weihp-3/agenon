import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { PickupCode } from "@/components/pickup-code";
import { Chip } from "@/components/chip";
import { Flash } from "@/components/flash";
import { rupiah, statusLabel, paymentLabel, formatDateTime } from "@/lib/format";
import { markReadyAction, markPickedUpAction } from "@/lib/kasir-actions";

export default async function KasirPesananPage() {
  await requireRole("kasir");

  const orders = await db.orm.public.transactions
    .where((t) => t.status.in(["menunggu", "siap"]))
    .orderBy((t) => t.created_at.asc())
    .include("transaction_items", (item) => item.include("products"))
    .all();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Antrian pesanan</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Pesanan user yang menunggu dan yang siap diambil.
        </p>
      </div>

      <Flash />

      {orders.length === 0 ? (
        <EmptyState
          title="Antrian kosong"
          description="Belum ada pesanan yang perlu disiapkan."
          icon="bell"
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {orders.map((order) => (
            <section
              key={order.id}
              className="flex flex-col rounded-xl border border-ink/10 bg-surface-raised p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink">Pesanan #{order.id}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{formatDateTime(order.created_at)}</p>
                </div>
                <Chip
                  tone={order.status === "siap" ? "ok" : "warn"}
                  icon={order.status === "siap" ? "check-circle" : "clock"}
                >
                  {statusLabel(order.status)}
                </Chip>
              </div>

              <div className="mt-4 rounded-lg bg-surface-sunken p-3">
                <PickupCode code={order.pickup_code ?? "------"} size="md" />
              </div>

              <ul className="mt-3 flex-1 space-y-1.5">
                {order.transaction_items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 text-sm">
                    <span className="text-ink-muted">
                      {item.quantity} × {item.products.name}
                    </span>
                    <span className="tabular font-medium text-ink">{rupiah(item.subtotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
                <div>
                  <p className="text-xs text-ink-muted">
                    {order.customer_name ?? "Pelanggan"} · {paymentLabel(order.payment_method)}
                  </p>
                  <p className="tabular text-base font-extrabold text-brand">
                    Rp {rupiah(order.total_price)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {order.status === "menunggu" ? (
                    <form action={markReadyAction.bind(null, String(order.id))}>
                      <button type="submit" className="btn btn-brand btn-sm">
                        Siapkan
                      </button>
                    </form>
                  ) : (
                    <form action={markPickedUpAction.bind(null, String(order.id))}>
                      <button type="submit" className="btn btn-outline btn-sm">
                        Selesaikan
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}