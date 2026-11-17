import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getCart, cartTotal } from "@/lib/cart";
import { checkoutAction } from "@/lib/kasir-actions";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { rupiah } from "@/lib/format";
import { Flash } from "@/components/flash";

export default async function CheckoutPage() {
  await requireRole("kasir");
  const cart = await getCart();
  const total = cartTotal(cart);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Checkout</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Periksa pesanan, pilih metode pembayaran, lalu proses transaksi.
        </p>
      </div>

      <Flash />

      {cart.length === 0 ? (
        <EmptyState
          title="Keranjang kosong"
          description="Tambahkan produk dari halaman Point of Sale terlebih dahulu."
          icon="cart"
          action={
            <Link href="/kasir" className="btn btn-brand btn-sm">
              <Icon name="pos" className="h-4 w-4" />
              Kembali ke POS
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <section className="rounded-xl border border-ink/10 bg-surface-raised">
            <header className="border-b border-ink/10 px-4 py-3.5">
              <h3 className="text-sm font-bold text-ink">Rincian pesanan</h3>
            </header>
            <ul className="divide-y divide-ink/5">
              {cart.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.name}</p>
                    <p className="tabular text-xs text-ink-muted">
                      {item.qty} × Rp {rupiah(item.price)}
                    </p>
                  </div>
                  <p className="tabular text-sm font-bold text-ink">
                    Rp {rupiah(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-ink/10 px-4 py-4">
              <span className="text-sm font-semibold text-ink">Total pembayaran</span>
              <span className="tabular text-xl font-extrabold text-brand">Rp {rupiah(total)}</span>
            </div>
          </section>

          <aside>
            <form action={checkoutAction} className="space-y-4 rounded-xl border border-ink/10 bg-surface-raised p-4">
              <div>
                <label htmlFor="customer_name" className="field-label">Nama pelanggan</label>
                <input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  defaultValue="Pelanggan"
                  className="field"
                  placeholder="Nama pelanggan"
                  required
                />
                <p className="field-help">Huruf, angka, titik, dan tanda hubung.</p>
              </div>

              <fieldset>
                <legend className="field-label">Metode pembayaran</legend>
                <div className="space-y-2">
                  {[
                    { value: "cash", label: "Tunai", icon: "cash" },
                    { value: "qris", label: "QRIS", icon: "card" },
                    { value: "transfer", label: "Transfer", icon: "download" },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink/10 px-3 py-2.5 text-sm font-medium text-ink hover:bg-ink/5 has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand-soft-ink"
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.value}
                        defaultChecked={method.value === "cash"}
                        className="h-4 w-4 accent-[rgb(var(--brand))]"
                      />
                      <Icon name={method.icon} className="h-4 w-4" />
                      {method.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className="btn btn-brand w-full">
                <Icon name="check" className="h-4 w-4" />
                Proses Transaksi
              </button>
              <Link href="/kasir" className="btn btn-quiet w-full">
                Batal
              </Link>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}