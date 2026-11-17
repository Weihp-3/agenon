"use client";

import { Icon } from "./icon";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-outline flex-1 no-print"
    >
      <Icon name="printer" className="h-4 w-4" />
      Cetak struk
    </button>
  );
}