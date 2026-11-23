import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { Flash } from "@/components/flash";
import { formatDateOnly } from "@/lib/format";
import { destroyTemplateAction } from "@/lib/template-actions";

export default async function SaleTemplatesPage() {
  const user = await requireRole("kasir");

  const templates = await db.orm.public.sale_templates
    .where({ kasir_id: BigInt(user.id) })
    .orderBy((t) => t.created_at.desc())
    .include("sale_template_items", (item) => item.include("products"))
    .all();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Template penjualan</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Simpan susunan produk yang sering dijual agar transaksi lebih cepat.
          </p>
        </div>
        <Link href="/sale-templates/create" className="btn btn-brand shrink-0">
          <Icon name="plus" className="h-4 w-4" />
          Buat template
        </Link>
      </div>

      <Flash />

      {templates.length === 0 ? (
        <EmptyState
          title="Belum ada template"
          description="Buat template pertama untuk mempercepat transaksi berulang."
          icon="box"
          action={
            <Link href="/sale-templates/create" className="btn btn-brand btn-sm">
              <Icon name="plus" className="h-4 w-4" />
              Buat template
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <section
              key={template.id}
              className="flex flex-col rounded-xl border border-ink/10 bg-surface-raised p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-ink">{template.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">
                    {template.description ?? "Tanpa keterangan"}
                  </p>
                </div>
                <form action={destroyTemplateAction.bind(null, String(template.id))}>
                  <button
                    type="submit"
                    className="text-ink-subtle hover:text-status-danger-ink"
                    aria-label={`Hapus template ${template.name}`}
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <ul className="mt-3 flex-1 space-y-1.5">
                {template.sale_template_items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2 text-sm">
                    <span className="truncate text-ink-muted">{item.products.name}</span>
                    <span className="tabular font-semibold text-ink">×{item.quantity}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 border-t border-ink/10 pt-3 text-xs text-ink-muted">
                Dipakai {template.usage_count} kali · {formatDateOnly(template.created_at)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}