/**
 * lib/chart-generator.ts
 * Generates QuickChart.io URLs for WhatsApp image messages.
 * No auth required — QuickChart is a free, open-source chart rendering service.
 * Charts are returned as PNG URLs that WhatsApp can fetch and display inline.
 */

const QUICKCHART_BASE = "https://quickchart.io/chart";

// ── Colour palette (dark theme for legibility on mobile) ─────────────────────

const COLORS = {
  emerald:  "rgba(16,185,129,0.9)",
  blue:     "rgba(59,130,246,0.9)",
  violet:   "rgba(139,92,246,0.9)",
  amber:    "rgba(245,158,11,0.9)",
  rose:     "rgba(244,63,94,0.9)",
  slate:    "rgba(100,116,139,0.9)",
  emeraldB: "rgba(16,185,129,0.3)",
  blueB:    "rgba(59,130,246,0.3)",
};

// ── Chart 1: MMF Yields Bar Chart ────────────────────────────────────────────

export function mmfYieldChartUrl(): string {
  const labels = [
    "Etica (Zidi)", "Lofty Corpin", "Cytonn MMF",
    "NCBA MMF",     "KCB MMF",      "Britam MMF",
    "Sanlam MMF",   "ICEA Lion",    "CIC MMF",   "Old Mutual",
  ];
  const yields = [18.20, 17.50, 16.90, 16.20, 15.80, 15.50, 15.10, 14.50, 13.60, 13.40];
  const colors = yields.map(y =>
    y >= 18 ? COLORS.emerald :
    y >= 16 ? COLORS.blue :
    y >= 15 ? COLORS.violet : COLORS.slate
  );

  const config = {
    type: "horizontalBar",
    data: {
      labels,
      datasets: [{
        label: "Annual Yield %",
        data: yields,
        backgroundColor: colors,
        borderRadius: 6,
      }],
    },
    options: {
      title: { display: true, text: "🏆 Top MMF Yields — Kenya Apr 2026", fontColor: "#fff", fontSize: 14 },
      legend: { display: false },
      scales: {
        xAxes: [{ ticks: { fontColor: "#94a3b8", callback: (v: number) => v + "%" }, gridLines: { color: "#1e293b" } }],
        yAxes: [{ ticks: { fontColor: "#e2e8f0", fontSize: 11 }, gridLines: { display: false } }],
      },
      plugins: {
        backgroundImageColor: { color: "#0f172a" },
        datalabels: { anchor: "end", align: "right", color: "#10b981", font: { weight: "bold", size: 11 }, formatter: (v: number) => v + "%" },
      },
    },
  };

  return buildUrl(config, 600, 340);
}

// ── Chart 2: T-Bill Yield Curve Line Chart ───────────────────────────────────

export function tbillYieldCurveUrl(): string {
  const config = {
    type: "line",
    data: {
      labels: ["91-Day", "182-Day", "364-Day", "2yr Bond", "5yr Bond", "10yr IFB"],
      datasets: [
        {
          label: "Gross Yield %",
          data: [15.85, 16.10, 16.45, 15.80, 16.00, 18.46],
          borderColor: COLORS.amber,
          backgroundColor: "rgba(245,158,11,0.1)",
          borderWidth: 3,
          pointBackgroundColor: COLORS.amber,
          pointRadius: 6,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Net Yield (after 15% WHT) %",
          data: [13.47, 13.69, 13.98, 13.43, 13.60, 18.46],
          borderColor: COLORS.emerald,
          backgroundColor: "rgba(16,185,129,0.1)",
          borderWidth: 2,
          pointBackgroundColor: COLORS.emerald,
          pointRadius: 5,
          fill: true,
          tension: 0.4,
          borderDash: [5, 3],
        },
      ],
    },
    options: {
      title: { display: true, text: "📊 Kenya Yield Curve — Apr 2026", fontColor: "#fff", fontSize: 14 },
      scales: {
        xAxes: [{ ticks: { fontColor: "#94a3b8" }, gridLines: { color: "#1e293b" } }],
        yAxes: [{ ticks: { fontColor: "#94a3b8", callback: (v: number) => v + "%" }, gridLines: { color: "#1e293b" }, suggestedMin: 12 }],
      },
      legend: { labels: { fontColor: "#e2e8f0", fontSize: 11 } },
    },
  };

  return buildUrl(config, 600, 300);
}

// ── Chart 3: Investment Comparison Radar / Bar ───────────────────────────────

export function investmentComparisonUrl(
  labels: string[],
  yields: number[],
  title = "📈 Investment Comparison"
): string {
  const colors = [COLORS.emerald, COLORS.blue, COLORS.violet, COLORS.amber, COLORS.rose, COLORS.slate];

  const config = {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Yield % p.a.",
        data: yields,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderRadius: 8,
      }],
    },
    options: {
      title: { display: true, text: title, fontColor: "#fff", fontSize: 14 },
      legend: { display: false },
      scales: {
        xAxes: [{ ticks: { fontColor: "#e2e8f0", fontSize: 11 }, gridLines: { display: false } }],
        yAxes: [{ ticks: { fontColor: "#94a3b8", callback: (v: number) => v + "%" }, gridLines: { color: "#1e293b" } }],
      },
      plugins: {
        datalabels: { anchor: "end", align: "top", color: "#fff", font: { weight: "bold", size: 12 }, formatter: (v: number) => v + "%" },
      },
    },
  };

  return buildUrl(config, 600, 300);
}

// ── Chart 4: Compound Growth Line Chart ──────────────────────────────────────

export function compoundGrowthChartUrl(
  principal: number,
  yield_pct: number,
  years: number,
  label = "Your Investment"
): string {
  const yearLabels: string[] = [];
  const grossData: number[] = [];
  const netData: number[] = [];
  const netYield = yield_pct * 0.85; // after 15% WHT (for MMFs/T-Bills)

  for (let i = 0; i <= years; i++) {
    yearLabels.push(i === 0 ? "Today" : `Year ${i}`);
    grossData.push(Math.round(principal * Math.pow(1 + yield_pct / 100, i)));
    netData.push(Math.round(principal * Math.pow(1 + netYield / 100, i)));
  }

  const formatK = (v: number) => v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : v >= 1000 ? (v / 1000).toFixed(0) + "K" : v.toString();

  const config = {
    type: "line",
    data: {
      labels: yearLabels,
      datasets: [
        {
          label: `${label} (Gross ${yield_pct}%)`,
          data: grossData,
          borderColor: COLORS.amber,
          backgroundColor: "rgba(245,158,11,0.1)",
          borderWidth: 3,
          pointRadius: 4,
          fill: true,
          tension: 0.4,
        },
        {
          label: `Net After WHT (${netYield.toFixed(1)}%)`,
          data: netData,
          borderColor: COLORS.emerald,
          backgroundColor: "rgba(16,185,129,0.1)",
          borderWidth: 2,
          pointRadius: 3,
          fill: true,
          tension: 0.4,
          borderDash: [4, 2],
        },
      ],
    },
    options: {
      title: { display: true, text: `💰 KES ${formatK(principal)} Growth Projection`, fontColor: "#fff", fontSize: 14 },
      legend: { labels: { fontColor: "#e2e8f0", fontSize: 10 } },
      scales: {
        xAxes: [{ ticks: { fontColor: "#94a3b8" }, gridLines: { color: "#1e293b" } }],
        yAxes: [{ ticks: { fontColor: "#94a3b8", callback: (v: number) => "KES " + formatK(v) }, gridLines: { color: "#1e293b" } }],
      },
    },
  };

  return buildUrl(config, 600, 300);
}

// ── Chart 5: SACCO Dividend Bar Chart ────────────────────────────────────────

export function saccoChartUrl(): string {
  const config = {
    type: "bar",
    data: {
      labels: ["Tower SACCO", "Police SACCO", "Stima SACCO", "Wanandege", "Safaricom SACCO", "Mwalimu"],
      datasets: [{
        label: "Dividend Yield %",
        data: [20.0, 17.0, 15.0, 15.0, 13.0, 11.2],
        backgroundColor: [COLORS.emerald, COLORS.blue, COLORS.violet, COLORS.amber, COLORS.rose, COLORS.slate],
        borderRadius: 8,
      }],
    },
    options: {
      title: { display: true, text: "🤝 SACCO Dividend Yields — Kenya 2026", fontColor: "#fff", fontSize: 14 },
      legend: { display: false },
      scales: {
        xAxes: [{ ticks: { fontColor: "#e2e8f0", fontSize: 10 }, gridLines: { display: false } }],
        yAxes: [{ ticks: { fontColor: "#94a3b8", callback: (v: number) => v + "%" }, gridLines: { color: "#1e293b" } }],
      },
      plugins: {
        datalabels: { anchor: "end", align: "top", color: "#fff", font: { weight: "bold", size: 12 }, formatter: (v: number) => v + "%" },
      },
    },
  };

  return buildUrl(config, 600, 300);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildUrl(config: object, width = 600, height = 300): string {
  const chartObj = {
    ...config,
    options: {
      ...(config as any).options,
      // Force dark background globally
      plugins: {
        ...((config as any).options?.plugins ?? {}),
        backgroundImageColor: { color: "#0f172a" },
      },
    },
  };

  const encoded = encodeURIComponent(JSON.stringify(chartObj));
  return `${QUICKCHART_BASE}?c=${encoded}&w=${width}&h=${height}&bkg=%230f172a&devicePixelRatio=2&format=png`;
}

// ── Parse CALC command ─────────────────────────────────────────────────────────

export function parseCalcCommand(input: string): {
  principal: number;
  yieldPct: number;
  years: number;
  label: string;
} | null {
  // Formats: CALC 100000  |  CALC 100000 18.2  |  CALC 100000 18.2 5
  const parts = input.replace(/^calc(ulate)?\s*/i, "").trim().split(/\s+/);
  const principal = Number(parts[0]?.replace(/[^0-9.]/g, ""));
  if (!principal || principal < 100) return null;

  const yieldPct = parts[1] ? Number(parts[1]) : 16.80; // default: Lofty Corpin
  const years    = parts[2] ? Math.min(Number(parts[2]), 30) : 5;
  const label    = parts[3] ? parts.slice(3).join(" ") : "Investment";

  return { principal, yieldPct: yieldPct || 16.80, years: years || 5, label };
}
