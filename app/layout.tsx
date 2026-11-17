import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Warung Mama Zaviyar",
    template: "%s | Warung Mama Zaviyar",
  },
  description:
    "Warung Mama Zaviyar, warung klontong di Tangerang. Pilih barang dari katalog, bayar dengan tunai, QRIS, atau transfer, lalu ambil di kasir dengan kode ambil.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/favicon-512.png",
  },
};

// Applied before first paint so a dark-mode user never sees a white flash.
const themeScript = `(function(){var stored=localStorage.getItem('theme');var dark=stored==='dark'||(!stored&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-surface text-ink antialiased">{children}</body>
    </html>
  );
}
