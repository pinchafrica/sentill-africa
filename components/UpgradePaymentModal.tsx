"use client";

import React, { useEffect, useRef, memo } from "react";

function TechnicalAnalysisWidget({ symbol = "NSEKE:SCOM" }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: "1D",
      width: "100%",
      isTransparent: false,
      height: "100%",
      symbol: symbol,
      showIntervalTabs: true,
      displayMode: "single",
      locale: "en",
      colorTheme: "light"
    });
    
    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TechnicalAnalysisWidget);