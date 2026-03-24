import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Served from public/market_data.json (written by GitHub Actions scraper daily)
// Falls back to hardcoded authoritative data if the file doesn't exist yet.

const FALLBACK_DATA = {
  scraped_at: null,
  source: "fallback",
  mmfs: [
    { name: "Etica Wealth MMF",        code: "etca",   yield: 17.55, aum: "15.2B",  min: 1000,   wht: 15, net_yield: 14.92, risk: "Low",      liquidity: "T+1",     paybill: "511116" },
    { name: "Britam Money Market",     code: "brtm",   yield: 16.80, aum: "8.4B",   min: 1000,   wht: 15, net_yield: 14.28, risk: "Low",      liquidity: "T+1",     paybill: "602600" },
    { name: "NCBA Money Market",       code: "ncba",   yield: 16.20, aum: "3.1B",   min: 1000,   wht: 15, net_yield: 13.77, risk: "Low",      liquidity: "Instant",  paybill: "880100" },
    { name: "CIC Money Market",        code: "cic",    yield: 15.90, aum: "20.8B",  min: 5000,   wht: 15, net_yield: 13.52, risk: "Low",      liquidity: "T+1",     paybill: "174174" },
    { name: "Sanlam Investments MMF",  code: "sanlam", yield: 14.20, aum: "51.4B",  min: 5000,   wht: 15, net_yield: 12.07, risk: "Low",      liquidity: "T+2",     paybill: "880100" },
    { name: "Old Mutual MMF",          code: "omam",   yield: 14.00, aum: "22.3B",  min: 1000,   wht: 15, net_yield: 11.90, risk: "Low",      liquidity: "T+2",     paybill: "542542" },
    { name: "Lofty Corban MMF",        code: "lofty",  yield: 16.10, aum: "3.4B",   min: 1000,   wht: 15, net_yield: 13.69, risk: "Low",      liquidity: "Instant",  paybill: "512600" },
    { name: "Cytonn MMF",              code: "cytonn", yield: 15.60, aum: "8.2B",   min: 1000,   wht: 15, net_yield: 13.26, risk: "Low",      liquidity: "T+2",     paybill: "525200" },
    { name: "Madison MMF",             code: "madison",yield: 13.80, aum: "4.1B",   min: 1000,   wht: 15, net_yield: 11.73, risk: "Low",      liquidity: "T+2",     paybill: "508508" },
    { name: "ICEA Lion MMF",           code: "icea",   yield: 14.50, aum: "18.2B",  min: 5000,   wht: 15, net_yield: 12.33, risk: "Low",      liquidity: "T+1",     paybill: "402402" },
  ],
  tbills: [
    { name: "91-Day T-Bill",  tenor: "91d",  yield: 15.82, wht: 15, net_yield: 13.45, issuer: "CBK", risk: "Zero" },
    { name: "182-Day T-Bill", tenor: "182d", yield: 16.10, wht: 15, net_yield: 13.69, issuer: "CBK", risk: "Zero" },
    { name: "364-Day T-Bill", tenor: "364d", yield: 16.45, wht: 15, net_yield: 13.98, issuer: "CBK", risk: "Zero" },
  ],
  bonds: [
    { name: "IFB1/2024", type: "IFB", yield: 18.46, wht: 0,  net_yield: 18.46, tenor: "10yr", maturity: "2034-03-15" },
    { name: "IFB2/2023", type: "IFB", yield: 17.20, wht: 0,  net_yield: 17.20, tenor: "10yr", maturity: "2033-06-15" },
    { name: "IFB3/2022", type: "IFB", yield: 13.94, wht: 0,  net_yield: 13.94, tenor: "10yr", maturity: "2032-09-15" },
    { name: "FXD1/2024", type: "FXD", yield: 16.00, wht: 15, net_yield: 13.60, tenor: "5yr",  maturity: "2029-03-15" },
    { name: "FXD2/2023", type: "FXD", yield: 15.50, wht: 15, net_yield: 13.18, tenor: "7yr",  maturity: "2030-09-15" },
  ],
  saccos: [
    { name: "Stima SACCO",        yield: 15.00, members: "180K+", regulated_by: "SASRA" },
    { name: "Mwalimu National",   yield: 14.50, members: "220K+", regulated_by: "SASRA" },
    { name: "Kenya Police SACCO", yield: 14.00, members: "120K+", regulated_by: "SASRA" },
    { name: "Unaitas SACCO",      yield: 13.50, members: "90K+",  regulated_by: "SASRA" },
    { name: "Tower SACCO",        yield: 13.00, members: "60K+",  regulated_by: "SASRA" },
  ],
  macro: {
    cbk_rate: 13.00,
    inflation: 6.3,
    usd_kes: 129.50,
    nse20: 2198,
    nse20_ytd: 20.8,
    nasi: 118.4,
  },
};

export async function GET(req: Request) {
  let aiRates: Record<string, number> = {};
  try {
    const aiRes = await fetch(`${new URL(req.url).origin}/api/market/ai-rates`);
    if (aiRes.ok) {
      const aiData = await aiRes.json();
      aiRates = aiData.rates || {};
    }
  } catch (e) {
    console.warn("[Yields API] AI Rate fetch failed.");
  }

  try {
    const filePath = join(process.cwd(), "public", "market_data.json");
    if (existsSync(filePath)) {
      const raw = readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      return NextResponse.json({ ...data, source: "scraped" });
    }
  } catch {
    // fall through
  }

  // Inject AI rates into fallback data if live file is missing
  const dataWithAi = {
    ...FALLBACK_DATA,
    mmfs: FALLBACK_DATA.mmfs.map(mmf => {
      const liveRate = aiRates[mmf.code.toUpperCase()];
      return {
        ...mmf,
        yield: liveRate || mmf.yield,
        source: liveRate ? "gemini-forced" : "fallback"
      };
    }),
    bonds: FALLBACK_DATA.bonds.map(bond => {
      const normalizedBondName = bond.name.toUpperCase().replace("/", "-");
      const liveRate = aiRates[normalizedBondName] || aiRates[bond.name.toUpperCase()];
      return {
        ...bond,
        yield: liveRate || bond.yield,
        source: liveRate ? "gemini-forced" : "fallback"
      };
    }),
    saccos: FALLBACK_DATA.saccos.map(sacco => {
      // Very basic SACCO AI sync match
      const liveRate = aiRates[sacco.name.toUpperCase()] || aiRates[sacco.name.split(" ")[0].toUpperCase()];
      return {
        ...sacco,
        yield: liveRate || sacco.yield,
        source: liveRate ? "gemini-forced" : "fallback"
      };
    })
  };

  return NextResponse.json(dataWithAi);
}
