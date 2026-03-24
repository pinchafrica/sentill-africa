"use client";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface AllocationChartProps {
  distribution?: { label: string; value: number }[];
}

export default function AllocationChart({ distribution = [] }: AllocationChartProps) {
  const hasData = distribution.length > 0;
  
  const data = {
    labels: hasData ? distribution.map(d => d.label) : ["No Assets"],
    datasets: [
      {
        data: hasData ? distribution.map(d => d.value) : [100],
        backgroundColor: hasData ? [
          "#10b981", // blue-600
          "#f59e0b", // Amber-500
          "#3b82f6", // Blue-500
          "#6366f1", // Indigo-500
          "#8b5cf6", // Violet-500
        ] : ["#f1f5f9"],
        borderColor: "#ffffff",
        borderWidth: 4,
        hoverOffset: 15,
        borderRadius: hasData ? 10 : 0,
      },
    ],
  };

  const options = {
    cutout: "82%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: hasData,
        backgroundColor: "#0f172a",
        titleFont: { size: 12, weight: "bold" as any },
        bodyFont: { size: 14, weight: "black" as any },
        padding: 16,
        cornerRadius: 16,
        borderColor: "#1e293b",
        borderWidth: 1,
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}
