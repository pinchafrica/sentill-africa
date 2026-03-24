"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function YieldChart({ data, label }: { data: number[]; label: string }) {
  const chartData = {
    labels: Array.from({ length: data.length }, (_, i) => `Month ${i + 1}`),
    datasets: [
      {
        fill: true,
        label: `${label} Yield (%)`,
        data: data,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#10b981",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "#0f172a",
        titleColor: "#94a3b8",
        bodyColor: "#f8fafc",
        borderColor: "#1e293b",
        borderWidth: 1,
        padding: 12,
        bodyFont: { weight: "bold" as const },
      },
    },
    scales: {
      x: { display: false },
      y: {
        display: true,
        grid: { color: "rgba(30, 41, 59, 0.5)", drawTicks: false },
        border: { display: false },
        ticks: { color: "#475569", font: { size: 10, weight: "bold" as const }, padding: 10 },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
