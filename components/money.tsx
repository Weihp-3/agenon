import { rupiah } from "@/lib/format";

/** Rupiah never carries a currency symbol in tables; the column header says so. */
export function Money({ value }: { value: number | string | null | undefined }) {
  return <span className="tabular">{rupiah(value)}</span>;
}
