/**
 * lib/useMarketRates.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared SWR hook for fetching market rates from the unified API.
 * Used by: SovereignTicker, MMF Page, Dashboard, AI Oracle.
 *
 * Features:
 *  - 5-minute revalidation (SWR stale-while-revalidate)
 *  - Focus revalidation (re-fetches when user tabs back)
 *  - Error retry with exponential backoff
 *  - Type-safe response interface
 * ─────────────────────────────────────────────────────────────────────────────
 */

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export interface MMFFund {
  id: number;
  code: string;
  name: string;
  manager: string;
  yield7d: number;
  yield30d: number;
  yield90d: number;
  yield1y: number;
  aum: number;
  minInvest: number;
  liquidity: string;
  risk: string;
  taxCategory: string;
  cmaLicensed: boolean;
  esgScore: number;
  inceptionDate: string;
  currency: string;
  category: string;
  status: string;
  fees: { management: number; performance: number };
  color: string;
  nav: number;
  paybill: string;
  source: string;
  lastUpdated: string | null;
}

export interface TBill {
  name: string;
  tenor: string;
  yield: number;
  netYield: number;
  issuer: string;
  risk: string;
  wht: number;
}

export interface Bond {
  name: string;
  type: string;
  yield: number;
  netYield: number;
  tenor: string;
  wht: number;
  maturity: string;
  note: string;
}

export interface TickerItem {
  label: string;
  value: string;
  change: string;
  up: boolean;
}

export interface DataQuality {
  totalSymbolsInDb: number;
  mmfsWithRates: number;
  mmfsMissing: number;
  tbillsWithRates: number;
  forexAvailable: boolean;
  freshestSync: string | null;
  staleHours: number;
  isStale: boolean;
  isEmpty: boolean;
  status: "fresh" | "stale" | "empty";
}

export interface MarketRatesResponse {
  success: boolean;
  timestamp: string;
  source: string;
  quality: DataQuality;
  mmfFunds: MMFFund[];
  tbills: TBill[];
  bonds: Bond[];
  forex: { usdKes: number; eurKes: number; gbpKes: number };
  macro: { cbkRate: number; inflation: number; nse20: number };
  ticker: TickerItem[];
}

export function useMarketRates() {
  const { data, error, isLoading, mutate } = useSWR<MarketRatesResponse>(
    "/api/market/rates",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      dedupingInterval: 60 * 1000,     // 1 minute dedup
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    // Convenience getters
    funds: data?.mmfFunds ?? [],
    tbills: data?.tbills ?? [],
    bonds: data?.bonds ?? [],
    forex: data?.forex ?? { usdKes: 0, eurKes: 0, gbpKes: 0 },
    macro: data?.macro ?? { cbkRate: 0, inflation: 0, nse20: 0 },
    ticker: data?.ticker ?? [],
    quality: data?.quality ?? null,
    isStale: data?.quality?.isStale ?? false,
    isEmpty: data?.quality?.isEmpty ?? true,
    isFresh: data?.quality?.status === "fresh",
  };
}
