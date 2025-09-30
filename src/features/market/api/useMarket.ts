import { useQuery } from "@tanstack/react-query";
import { getMarketOHLC, getOHLCChartGap, getIndexImpactChart, getTopProprietary, getForeignNetValueTop, getMarketBehavior, getAllocatedValue, getAllocatedICB, getCompanyTechnicalAnalysis } from "@/services/market.service";
import { fetchVNIndexTechnical } from "@/services/tradingview.service";
import type { VNIndexTimeframe, VNIndexTechnicalData } from "@/services/tradingview.service";
import type { market } from "@/lib/schemas";

export const marketKeys = {
  all: ["market"] as const,
  ohlc: (params?: { symbol?: string; timeFrame?: string; countBack?: number }) =>
    [...marketKeys.all, "ohlc", params ?? {}] as const,
  ohlcGap: (params: { timeFrame: string; symbols: string[]; from: number; to: number }) =>
    [...marketKeys.all, "ohlcGap", params] as const,
  vnindexTechnical: (timeframe: VNIndexTimeframe) =>
    [...marketKeys.all, "vnindex", "technical", timeframe] as const,
  indexImpact: (params: { group: string; timeFrame: string; exchange: string }) =>
    [...marketKeys.all, "indexImpact", params] as const,
  topProprietary: (params: { timeFrame: string; exchange: string }) =>
    [...marketKeys.all, "topProprietary", params] as const,
  foreignNetTop: (params: { group: string; timeFrame: string; from: number; to: number }) =>
    [...marketKeys.all, "foreignNetTop", params] as const,
  behavior: () => [...marketKeys.all, "behavior"] as const,
  allocatedValue: (params: { group: "ALL" | "HOSE" | "HNX" | "UPCOM"; timeFrame: "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH" | "YTD" | "ONE_YEAR" }) =>
    [...marketKeys.all, "allocatedValue", params] as const,
  allocatedICB: (params: { group: "ALL" | "HOSE" | "HNX" | "UPCOM"; timeFrame: "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH" | "YTD" | "ONE_YEAR" }) =>
    [...marketKeys.all, "allocatedICB", params] as const,
  technicalAnalysis: (params: { symbol: string; timeFrame: "ONE_HOUR" | "FOUR_HOUR" | "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH" }) =>
    [...marketKeys.all, "technicalAnalysis", params] as const,
};

export function useMarketOHLC(params?: {
  symbol?: string;
  timeFrame?: string;
  countBack?: number;
}) {
  return useQuery({
    queryKey: marketKeys.ohlc(params),
    queryFn: () => getMarketOHLC(params),
    staleTime: 60_000,
    enabled: Boolean((params?.symbol ?? "").length >= 0),
  });
}

export function useVNIndexTechnical(timeframe: VNIndexTimeframe) {
  return useQuery<VNIndexTechnicalData>({
    queryKey: marketKeys.vnindexTechnical(timeframe),
    queryFn: () => fetchVNIndexTechnical(timeframe),
    staleTime: 30_000,
  });
}

export function useIndexImpactChart(params: { group: string; timeFrame: string; exchange: string }) {
  return useQuery<market.IndexImpactResponse>({
    queryKey: marketKeys.indexImpact(params),
    queryFn: () => getIndexImpactChart(params),
    staleTime: 60_000,
    enabled: Boolean(params?.group && params?.timeFrame && params?.exchange),
  });
}

export function useTopProprietary(params: { timeFrame: string; exchange: string }) {
  return useQuery<market.TopProprietaryResponse>({
    queryKey: marketKeys.topProprietary(params),
    queryFn: () => getTopProprietary(params),
    staleTime: 60_000,
    enabled: Boolean(params?.timeFrame && params?.exchange),
  });
}

export function useForeignNetValueTop(params: { group: string; timeFrame: string; from: number; to: number }) {
  return useQuery<market.ForeignNetTopResponse>({
    queryKey: marketKeys.foreignNetTop(params),
    queryFn: () => getForeignNetValueTop(params),
    staleTime: 60_000,
    enabled: Boolean(params?.group && params?.timeFrame && params?.from && params?.to),
  });
}

export function useMarketBehavior() {
  return useQuery<market.MarketBehaviorResponse>({
    queryKey: marketKeys.behavior(),
    queryFn: () => getMarketBehavior(),
    staleTime: 60_000,
  });
}

export function useAllocatedValue(params: { group: "ALL" | "HOSE" | "HNX" | "UPCOM"; timeFrame: "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH" | "YTD" | "ONE_YEAR" }) {
  return useQuery<market.AllocatedValueResponse>({
    queryKey: marketKeys.allocatedValue(params),
    queryFn: () => getAllocatedValue(params),
    staleTime: 60_000,
    enabled: Boolean(params?.group && params?.timeFrame),
  });
}

export function useAllocatedICB(params: { group: "ALL" | "HOSE" | "HNX" | "UPCOM"; timeFrame: "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH" | "YTD" | "ONE_YEAR" }) {
  return useQuery<market.AllocatedICBResponse>({
    queryKey: marketKeys.allocatedICB(params),
    queryFn: () => getAllocatedICB(params),
    staleTime: 60_000,
    enabled: Boolean(params?.group && params?.timeFrame),
  });
}

export function useCompanyTechnicalAnalysis(params: {
  symbol: string;
  timeFrame: "ONE_HOUR" | "FOUR_HOUR" | "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH"
}) {
  return useQuery<market.TechnicalAnalysisResponse>({
    queryKey: marketKeys.technicalAnalysis(params),
    queryFn: () => getCompanyTechnicalAnalysis(params),
    staleTime: 30_000,
    enabled: Boolean(params?.symbol && params?.timeFrame),
  });
}

export function useOHLCChartGap(params: {
  timeFrame: string;
  symbols: string[];
  from: number;
  to: number;
}) {
  return useQuery({
    queryKey: marketKeys.ohlcGap(params),
    queryFn: () => getOHLCChartGap(params),
    staleTime: 60_000,
    enabled: Boolean(params?.timeFrame && params?.symbols?.length && params?.from && params?.to),
  });
}
