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

interface PortfolioProjectionChartProps {
  principal: number;
  annualYield: number;
  years?: number;
}

export default function PortfolioProjectionChart({ principal, annualYield, years = 5 }: PortfolioProjectionChartProps) {
  const months = years * 12;
  const monthlyRate = annualYield / 100 / 12;
  
  const labels = Array.from({ length: months + 1 }, (_, i) => {
    if (i % 12 === 0) return `Year ${i / 12}`;
    return "";
  });

  const dataPoints = Array.from({ length: months + 1 }, (_, i) => {
    return principal * Math.pow(1 + monthlyRate, i);
  });

  const data = {
    labels: labels,
    datasets: [
      {
        fill: true,
        label: "Projected Wealth",
        data: dataPoints,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        tension: 0.4,
        borderWidth: 4,
        pointRadius: (ctx: any) => (ctx.dataIndex % 12 === 0 ? 6 : 0),
        pointHoverRadius: 8,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#94a3b8",
        bodyColor: "#f8fafc",
        borderColor: "#1e293b",
        borderWidth: 1,
        padding: 16,
        cornerRadius: 16,
        callbacks: {
          label: (context: any) => {
            return `Projected: KES ${context.parsed.y.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 10, weight: "bold" as any } },
        border: { display: false },
      },
      y: {
        display: false,
      },
    },
  };

  return <Line data={data} options={options} />;
}
