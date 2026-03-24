#!/usr/bin/env python3
"""
Sentill Africa — Market Data Scraper
Runs daily via GitHub Actions at 06:00 EAT (03:00 UTC).
Sources:
  - CBK (Central Bank of Kenya) — T-Bill rates, CBR
  - NSE Kenya — index levels
  - CMA-registered fund data (public bulletins)
  - Hardcoded authoritative fallbacks where scraping fails

Output: public/market_data.json
"""

import json, os, sys, re, logging
from datetime import datetime, timezone
from pathlib import Path

# Optional deps — install in CI via requirements.txt
try:
    import requests
    from bs4 import BeautifulSoup
    SCRAPING_AVAILABLE = True
except ImportError:
    SCRAPING_AVAILABLE = False
    logging.warning("requests/bs4 not installed — using authoritative fallbacks only")

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("sentill-scraper")

# ── Output path ────────────────────────────────────────────────────────────────
OUT = Path(__file__).parent.parent / "public" / "market_data.json"

# ── Authoritative fallback data (updated manually each quarter) ───────────────
FALLBACK_MMFS = [
    {"name": "Etica Wealth MMF",        "code": "etca",   "yield": 17.55, "aum": "15.2B",  "min": 1000,  "wht": 15, "net_yield": 14.92, "risk": "Low", "liquidity": "T+1",      "paybill": "511116"},
    {"name": "Britam Money Market",     "code": "brtm",   "yield": 16.80, "aum": "8.4B",   "min": 1000,  "wht": 15, "net_yield": 14.28, "risk": "Low", "liquidity": "T+1",      "paybill": "602600"},
    {"name": "NCBA Money Market",       "code": "ncba",   "yield": 16.20, "aum": "3.1B",   "min": 1000,  "wht": 15, "net_yield": 13.77, "risk": "Low", "liquidity": "Instant",   "paybill": "880100"},
    {"name": "CIC Money Market",        "code": "cic",    "yield": 15.90, "aum": "20.8B",  "min": 5000,  "wht": 15, "net_yield": 13.52, "risk": "Low", "liquidity": "T+1",      "paybill": "174174"},
    {"name": "Sanlam Investments MMF",  "code": "sanlam", "yield": 14.20, "aum": "51.4B",  "min": 5000,  "wht": 15, "net_yield": 12.07, "risk": "Low", "liquidity": "T+2",      "paybill": "880100"},
    {"name": "Old Mutual MMF",          "code": "omam",   "yield": 14.00, "aum": "22.3B",  "min": 1000,  "wht": 15, "net_yield": 11.90, "risk": "Low", "liquidity": "T+2",      "paybill": "542542"},
    {"name": "Lofty Corban MMF",        "code": "lofty",  "yield": 16.10, "aum": "3.4B",   "min": 1000,  "wht": 15, "net_yield": 13.69, "risk": "Low", "liquidity": "Instant",   "paybill": "512600"},
    {"name": "Cytonn MMF",              "code": "cytonn", "yield": 15.60, "aum": "8.2B",   "min": 1000,  "wht": 15, "net_yield": 13.26, "risk": "Low", "liquidity": "T+2",      "paybill": "525200"},
    {"name": "Madison MMF",             "code": "madison","yield": 13.80, "aum": "4.1B",   "min": 1000,  "wht": 15, "net_yield": 11.73, "risk": "Low", "liquidity": "T+2",      "paybill": "508508"},
    {"name": "ICEA Lion MMF",           "code": "icea",   "yield": 14.50, "aum": "18.2B",  "min": 5000,  "wht": 15, "net_yield": 12.33, "risk": "Low", "liquidity": "T+1",      "paybill": "402402"},
]

FALLBACK_TBILLS = [
    {"name": "91-Day T-Bill",  "tenor": "91d",  "yield": 15.82, "wht": 15, "net_yield": 13.45, "issuer": "CBK", "risk": "Zero"},
    {"name": "182-Day T-Bill", "tenor": "182d", "yield": 16.10, "wht": 15, "net_yield": 13.69, "issuer": "CBK", "risk": "Zero"},
    {"name": "364-Day T-Bill", "tenor": "364d", "yield": 16.45, "wht": 15, "net_yield": 13.98, "issuer": "CBK", "risk": "Zero"},
]

FALLBACK_BONDS = [
    {"name": "IFB1/2024", "type": "IFB", "yield": 18.46, "wht": 0,  "net_yield": 18.46, "tenor": "10yr", "maturity": "2034-03-15"},
    {"name": "IFB2/2023", "type": "IFB", "yield": 17.20, "wht": 0,  "net_yield": 17.20, "tenor": "10yr", "maturity": "2033-06-15"},
    {"name": "IFB3/2022", "type": "IFB", "yield": 13.94, "wht": 0,  "net_yield": 13.94, "tenor": "10yr", "maturity": "2032-09-15"},
    {"name": "FXD1/2024", "type": "FXD", "yield": 16.00, "wht": 15, "net_yield": 13.60, "tenor": "5yr",  "maturity": "2029-03-15"},
    {"name": "FXD2/2023", "type": "FXD", "yield": 15.50, "wht": 15, "net_yield": 13.18, "tenor": "7yr",  "maturity": "2030-09-15"},
    {"name": "FXD1/2022 15yr", "type": "FXD", "yield": 13.92, "wht": 15, "net_yield": 11.83, "tenor": "15yr", "maturity": "2037-02-15"},
]

FALLBACK_SACCOS = [
    {"name": "Stima SACCO",        "yield": 15.00, "members": "180K+", "regulated_by": "SASRA"},
    {"name": "Mwalimu National",   "yield": 14.50, "members": "220K+", "regulated_by": "SASRA"},
    {"name": "Kenya Police SACCO", "yield": 14.00, "members": "120K+", "regulated_by": "SASRA"},
    {"name": "Unaitas SACCO",      "yield": 13.50, "members": "90K+",  "regulated_by": "SASRA"},
    {"name": "Tower SACCO",        "yield": 13.00, "members": "60K+",  "regulated_by": "SASRA"},
]

FALLBACK_MACRO = {
    "cbk_rate": 13.00,
    "inflation": 6.3,
    "usd_kes": 129.50,
    "nse20": 2198,
    "nse20_ytd": 20.8,
    "nasi": 118.4,
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SentillBot/1.0; +https://sentill.africa)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ── Scraper helpers ────────────────────────────────────────────────────────────

def safe_float(text: str) -> float | None:
    """Extract first float from a string."""
    if not text:
        return None
    m = re.search(r"[\d,]+\.?\d*", text.replace(",", ""))
    return float(m.group()) if m else None


def scrape_cbk_tbills() -> list[dict]:
    """Scrape CBK T-Bill rates from the weekly auction results."""
    if not SCRAPING_AVAILABLE:
        return FALLBACK_TBILLS

    try:
        url = "https://www.centralbank.go.ke/bills-bonds/treasury-bills/"
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        # CBK publishes rates in a table — parse the most recent row
        tbills = []
        tables = soup.find_all("table")
        for table in tables:
            rows = table.find_all("tr")
            for row in rows:
                cells = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
                if not cells:
                    continue
                text = " ".join(cells).lower()
                if "91" in text or "182" in text or "364" in text:
                    for tenor, label in [("91", "91-Day T-Bill"), ("182", "182-Day T-Bill"), ("364", "364-Day T-Bill")]:
                        if tenor in cells[0] if cells else False:
                            rate = safe_float(cells[-1]) or safe_float(cells[-2])
                            if rate and 5 < rate < 30:
                                wht = 15
                                tbills.append({
                                    "name": label, "tenor": f"{tenor}d",
                                    "yield": round(rate, 2),
                                    "wht": wht,
                                    "net_yield": round(rate * (1 - wht / 100), 2),
                                    "issuer": "CBK", "risk": "Zero",
                                    "source": "cbk_scraped",
                                })

        if len(tbills) >= 2:
            log.info(f"CBK T-Bills scraped: {len(tbills)} instruments")
            return tbills

    except Exception as e:
        log.warning(f"CBK T-Bill scrape failed: {e}")

    return FALLBACK_TBILLS


def scrape_exchange_rate() -> float:
    """Fetch KES/USD from open.er-api.com (free, no key)."""
    if not SCRAPING_AVAILABLE:
        return FALLBACK_MACRO["usd_kes"]
    try:
        r = requests.get("https://open.er-api.com/v6/latest/USD", timeout=10)
        data = r.json()
        kes = data.get("rates", {}).get("KES")
        if kes and 100 < kes < 200:
            log.info(f"Exchange rate fetched: 1 USD = {kes} KES")
            return round(kes, 2)
    except Exception as e:
        log.warning(f"Exchange rate fetch failed: {e}")
    return FALLBACK_MACRO["usd_kes"]


def scrape_nse20() -> dict:
    """Attempt to get NSE 20 index from NSE website."""
    if not SCRAPING_AVAILABLE:
        return {"nse20": FALLBACK_MACRO["nse20"], "nasi": FALLBACK_MACRO["nasi"]}
    try:
        r = requests.get("https://www.nse.co.ke/market-statistics/", headers=HEADERS, timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        nse20 = None
        nasi = None

        # Look for index values in common patterns
        for el in soup.find_all(string=re.compile(r"NSE\s*20|NASI", re.I)):
            parent = el.find_parent()
            if parent:
                nearby = parent.get_text(" ", strip=True)
                val = safe_float(nearby)
                if val and 500 < val < 5000:
                    if "20" in str(el).upper() and not nse20:
                        nse20 = round(val, 2)
                    elif "NASI" in str(el).upper() and not nasi:
                        nasi = round(val, 2)

        result = {}
        if nse20: result["nse20"] = nse20
        if nasi:  result["nasi"]  = nasi
        if result:
            log.info(f"NSE indices scraped: {result}")
        return result

    except Exception as e:
        log.warning(f"NSE scrape failed: {e}")
    return {}


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    log.info("Sentill scraper starting...")

    # Scrape live data
    tbills      = scrape_cbk_tbills()
    usd_kes     = scrape_exchange_rate()
    nse_indices = scrape_nse20()

    macro = {**FALLBACK_MACRO, "usd_kes": usd_kes, **nse_indices}

    data = {
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "source": "sentill-scraper-v2",
        "mmfs":   FALLBACK_MMFS,   # Updated quarterly from CMA bulletins
        "tbills": tbills,
        "bonds":  FALLBACK_BONDS,  # Updated quarterly from CBK auction results
        "saccos": FALLBACK_SACCOS, # Updated annually from SASRA reports
        "macro":  macro,
    }

    # Ensure output directory exists
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    log.info(f"market_data.json written to {OUT}")
    log.info(f"  MMFs: {len(data['mmfs'])} | T-Bills: {len(data['tbills'])} | Bonds: {len(data['bonds'])}")
    log.info(f"  Macro: USD/KES={macro['usd_kes']} | CBR={macro['cbk_rate']}%")


if __name__ == "__main__":
    main()
