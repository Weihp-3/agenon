import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Icon } from "@/components/icon";
import { PickupCode } from "@/components/pickup-code";
import { rupiah, paymentLabel, statusLabel, formatDateTime } from "@/lib/format";

export default async function TransactionReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const transaction = await db.transactions.findUnique({
    where: { id: BigInt(id) },
    include: { transaction_items: { include: { products: true } } },
  });

  if (!transaction || transaction.user_id !== BigInt(user.id)) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Bukti pesanan</h2>
        <p className="mt-1 text-sm text-ink-muted">Pesanan #{transaction.id}</p>
      </div>

      <div className="rounded-xl border border-ink/10 bg-surface-raised p-6">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-soft-ink">
            <Icon name="receipt" className="h-6 w-6" />
          </span>
          <h3 className="mt-3 text-lg font-bold text-ink">Warung Mama Zaviyar</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Pesanan dan ambil di warung</p>
        </div>

        <div className="my-5 border-t border-dashed border-ink/20" />

        <div className="rounded-lg bg-surface-sunken p-4 text-center">
          <p className="text-xs text-ink-muted">Tunjukkan kode ini saat pengambilan di warung</p>
          <div className="mt-2 flex justify-center">
            <PickupCode code={transaction.pickup_code ?? "------"} size="lg" />
          </div>
        </div>

        <div className="my-5 border-t border-dashed border-ink/20" />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Status</dt>
            <dd className="font-semibold text-ink">{statusLabel(transaction.status)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Waktu</dt>
            <dd className="font-medium text-ink">{formatDateTime(transaction.created_at)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Pembayaran</dt>
            <dd className="font-medium text-ink">{paymentLabel(transaction.payment_method)}</dd>
          </div>
        </dl>

        <div className="my-5 border-t border-dashed border-ink/20" />

        <ul className="space-y-2.5">
          {transaction.transaction_items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 text-sm">
              <span className="text-ink">
                {item.quantity} × {item.products.name}
              </span>
              <span className="tabular font-medium text-ink">{rupiah(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="my-5 border-t border-dashed border-ink/20" />

        <div className="flex items-center justify-between">
          <span className="font-bold text-ink">Total</span>
          <span className="tabular text-xl font-extrabold text-brand">
            Rp {rupiah(transaction.total_price)}
          </span>
        </div>
      </div>

      <Link href="/pesanan" className="btn btn-brand w-full">
        <Icon name="orders" className="h-4 w-4" />
        Lihat pesanan saya
      </Link>
    </div>
  );
}