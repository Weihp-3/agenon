"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Bar } from "chart.js";
import { rupiah } from "@/lib/format";

// Register needed chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Bar);

export function RevenueChart({
  labels,
  data,
  chartCounts,
}: {
  labels: string[];
  data: number[];
  chartCounts?: number[];
}) {
  const [chart, setChart] = useState<ChartJS.Chart | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!labels.length || typeof window === "undefined") return;

    const canvas = document.getElementById("salesChart") as HTMLCanvasElement | null;
    if (!canvas) return;

    // Destroy existing chart to avoid memory leaks
    if (chart) {
      chart.destroy();
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const brand = `rgb(${getComputedStyle(document.documentElement).getPropertyValue("--brand")})`;
    const ink = () => `rgb(${getComputedStyle(document.documentElement).getPropertyValue("--ink")})`;
    const inkInverse = () => `rgb(${getComputedStyle(document.documentElement).getPropertyValue("--ink-inverse")})`;
    const inkFaint = () => `rgba(${getComputedStyle(document.documentElement).getPropertyValue("--ink")}, 0.08)`;

    const myChart = new ChartJS.Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Pendapatan",
          data,
          backgroundColor: brand,
          borderRadius: 4,
          maxBarThickness: 36,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: ink(),
            titleColor: inkInverse(),
            bodyColor: inkInverse(),
            padding: 12,
            titleFont: { size: 12 },
            bodyFont: { size: 13, weight: "bold" },
            callbacks: {
              label: function (context: any) {
                return "Pendapatan: Rp " + context.parsed.y.toLocaleString("id-ID");
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: ink(), font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: inkFaint() },
            ticks: {
              color: ink(),
              font: { size: 11 },
              callback: function (value: number) {
                if (value >= 1000000) return "Rp " + (value / 1000000).toFixed(1) + "M";
                if (value >= 1000) return "Rp " + (value / 1000).toFixed(0) + "k";
                return "Rp " + value;
              },
            },
          },
        },
      },
    });

    setChart(myChart);

    // Theme apply on class change
    function applyTheme() {
      if (myChart) {
        myChart.data.datasets[0].backgroundColor = brand;
        myChart.options.scales.x.ticks.color = ink();
        myChart.options.scales.y.ticks.color = ink();
        myChart.options.scales.y.grid.color = inkFaint();
        myChart.update("none");
      }
    }

    new MutationObserver(applyTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      if (myChart) myChart.destroy();
    };
  }, [labels, data, chartCounts]);

  return null;
}

export default RevenueChart;