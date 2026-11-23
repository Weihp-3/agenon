"use client";

import { useEffect } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export function RevenueChart({
  labels,
  data,
}: {
  labels: string[];
  data: number[];
  chartCounts?: number[];
}) {
  useEffect(() => {
    if (!labels.length || typeof window === "undefined") return;

    const canvas = document.getElementById("salesChart") as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const css = getComputedStyle(document.documentElement);
    const brand = `rgb(${css.getPropertyValue("--brand").trim()})`;
    const ink = () => `rgb(${getComputedStyle(document.documentElement).getPropertyValue("--ink").trim()})`;
    const inkInverse = () =>
      `rgb(${getComputedStyle(document.documentElement).getPropertyValue("--ink-inverse").trim()})`;
    const inkFaint = () =>
      `rgba(${getComputedStyle(document.documentElement).getPropertyValue("--ink").trim()}, 0.08)`;

    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Pendapatan",
            data,
            backgroundColor: brand,
            borderRadius: 4,
            maxBarThickness: 36,
          },
        ],
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
            callbacks: {
              label: (context) =>
                "Pendapatan: Rp " + Number(context.parsed.y).toLocaleString("id-ID"),
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
              callback: (value) => {
                const v = Number(value);
                if (v >= 1000000) return "Rp " + (v / 1000000).toFixed(1) + "M";
                if (v >= 1000) return "Rp " + (v / 1000).toFixed(0) + "k";
                return "Rp " + v;
              },
            },
          },
        },
      },
    });

    function applyTheme() {
      const scales = myChart.options.scales;
      if (!scales?.x?.ticks || !scales.y?.ticks || !scales.y.grid) return;
      myChart.data.datasets[0].backgroundColor = brand;
      scales.x.ticks.color = ink();
      scales.y.ticks.color = ink();
      scales.y.grid.color = inkFaint();
      myChart.update("none");
    }

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      myChart.destroy();
    };
  }, [labels, data]);

  return null;
}

export default RevenueChart;