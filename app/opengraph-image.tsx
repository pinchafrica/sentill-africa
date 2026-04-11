import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sentill Africa | Kenya's #1 Investment Intelligence Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #042f2e 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
          <span style={{ color: "#10b981", fontSize: "13px", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Live Market Intelligence · Kenya
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "28px" }}>📊</span>
            </div>
            <span style={{ color: "#94a3b8", fontSize: "16px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Sentill Africa
            </span>
          </div>

          <div style={{ color: "white", fontSize: "58px", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Kenya's #1<br />
            <span style={{ color: "#10b981" }}>Investment</span> Intelligence
          </div>

          <div style={{ color: "#94a3b8", fontSize: "20px", fontWeight: 500, maxWidth: "700px", lineHeight: 1.5 }}>
            AI-powered wealth analytics for MMFs, T-Bills, SACCOs & NSE stocks.
            Get real-time yields, charts & advice on WhatsApp.
          </div>
        </div>

        {/* Bottom stats row */}
        <div style={{ display: "flex", gap: "24px" }}>
          {[
            { label: "Best MMF Yield",  value: "18.2%",  color: "#10b981" },
            { label: "IFB Tax-Free",    value: "18.46%", color: "#6366f1" },
            { label: "91-Day T-Bill",   value: "15.85%", color: "#f59e0b" },
            { label: "Top SACCO Div.",  value: "14.5%",  color: "#ec4899" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                borderRadius: "16px",
                padding: "20px 24px",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                {s.label}
              </span>
              <span style={{ color: s.color, fontSize: "28px", fontWeight: 900 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
