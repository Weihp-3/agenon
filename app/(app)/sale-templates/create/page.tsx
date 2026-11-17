import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Icon } from "@/components/icon";
import { rupiah } from "@/lib/format";
import { storeTemplateAction } from "@/lib/template-actions";

export default async function CreateTemplatePage() {
  await requireRole("kasir");

  const products = await db.products.findMany({
    where: { deleted_at: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true, stock: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Buat template penjualan</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Beri nama, isi produk, lalu simpan untuk dipakai lagi.
        </p>
      </div>

      <form action={storeTemplateAction} className="space-y-5 rounded-xl border border-ink/10 bg-surface-raised p-5">
        <div>
          <label htmlFor="name" className="field-label">Nama template</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="field"
            placeholder="Contoh: Paket sarapan"
          />
        </div>

        <div>
          <label htmlFor="description" className="field-label">Keterangan (opsional)</label>
          <textarea
            id="description"
            name="description"
            rows={2}
            className="field"
            placeholder="Contoh: Nasi + es teh untuk 2 orang"
          />
        </div>

        <fieldset>
          <legend className="field-label">Produk</legend>
          {products.length === 0 ? (
            <p className="text-sm text-ink-muted">Belum ada produk tersedia.</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-ink/10 p-2 scrollbar-quiet">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-ink/5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">{product.name}</span>
                    <span className="tabular block text-xs text-ink-muted">
                      Rp {rupiah(product.price)} · stok {product.stock}
                    </span>
                  </span>
                  <input
                    type="number"
                    name={`item_${product.id}`}
                    min="0"
                    max="999"
                    defaultValue="0"
                    className="field tabular w-20 py-1.5 text-center"
                    aria-label={`Jumlah ${product.name}`}
                  />
                </label>
              ))}
            </div>
          )}
          <p className="field-help">Isi angka lebih dari 0 untuk produk yang ingin dimasukkan.</p>
        </fieldset>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" className="btn btn-brand flex-1">
            <Icon name="check" className="h-4 w-4" />
            Simpan template
          </button>
          <Link href="/sale-templates" className="btn btn-quiet flex-1">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}