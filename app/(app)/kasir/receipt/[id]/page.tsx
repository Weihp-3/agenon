import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Icon } from "@/components/icon";
import { rupiah, paymentLabel, formatDateTime } from "@/lib/format";
import { Flash } from "@/components/flash";
import { PrintButton } from "@/components/print-button";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("kasir");
  const { id } = await params;

  const transaction = await db.transactions.findUnique({
    where: { id: BigInt(id) },
    include: { transaction_items: { include: { products: true } } },
  });

  if (!transaction) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <Flash />

      <div className="rounded-xl border border-ink/10 bg-surface-raised p-6">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-ok-soft text-status-ok-ink">
            <Icon name="check-circle" className="h-7 w-7" />
          </span>
          <h2 className="mt-3 text-xl font-bold text-ink">Transaksi berhasil</h2>
          <p className="mt-1 text-sm text-ink-muted">Struk pembayaran #{transaction.id}</p>
        </div>

        <div className="my-5 border-t border-dashed border-ink/20" />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Tanggal</dt>
            <dd className="font-medium text-ink">{formatDateTime(transaction.created_at)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Pelanggan</dt>
            <dd className="font-medium text-ink">{transaction.customer_name ?? "Pelanggan"}</dd>
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

      <div className="flex flex-col gap-2 sm:flex-row">
        <PrintButton />
        <Link href="/kasir" className="btn btn-brand flex-1 no-print">
          <Icon name="pos" className="h-4 w-4" />
          Transaksi baru
        </Link>
      </div>
    </div>
  );
}