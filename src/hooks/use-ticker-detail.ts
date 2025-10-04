import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { getTickerDetail } from "@/services/ticker-detail.service";
import { tickerDetail } from "@/lib/schemas";
import { useState, useEffect } from "react";

/**
 * Hook to fetch ticker detail data
 * @param ticker - Stock ticker symbol (e.g., "VIC")
 * @param options - Query options
 * @returns Query result with ticker detail data
 */
export function useTickerDetail(
  ticker: string,
  options: {
    day?: number;
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: number;
  } = {}
): UseQueryResult<tickerDetail.GetTickerDetailResponse, Error> {
  const day = options.day ?? 0;

  return useQuery({
    queryKey: tickerDetail.TICKER_DETAIL_QUERY_KEYS.detail(ticker, day),
    queryFn: () => getTickerDetail({ ticker, day }),
    enabled: (options.enabled ?? true) && !!ticker && ticker.length >= 3,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
    refetchInterval: options.refetchInterval,
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error.message.includes("Invalid")) {
        return false;
      }
      // Retry up to 2 times for network errors
      return failureCount < 2;
    },
  });
}

/**
 * Hook for real-time ticker detail with auto-refresh
 * @param ticker - Stock ticker symbol
 * @param options - Query options with refresh interval
 */
export function useRealtimeTickerDetail(
  ticker: string,
  options: {
    day?: number;
    enabled?: boolean;
    refreshInterval?: number;
  } = {}
) {
  const [isRealtime, setIsRealtime] = useState(false);

  const { data, isLoading, error, refetch } = useTickerDetail(ticker, {
    day: options.day,
    enabled: options.enabled,
    refetchInterval: isRealtime ? (options.refreshInterval ?? 30000) : undefined, // 30 seconds
    staleTime: isRealtime ? 0 : 5 * 60 * 1000, // No stale time in realtime mode
  });

  const startRealtime = () => setIsRealtime(true);
  const stopRealtime = () => setIsRealtime(false);
  const toggleRealtime = () => setIsRealtime((prev) => !prev);

  // Auto-stop realtime when component unmounts or ticker changes
  useEffect(() => {
    return () => setIsRealtime(false);
  }, [ticker]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isRealtime,
    startRealtime,
    stopRealtime,
    toggleRealtime,
  };
}

/**
 * Hook to prefetch ticker detail data
 */
export function usePrefetchTickerDetail() {
  const queryClient = useQueryClient();

  const prefetchTickerDetail = (ticker: string, day = 0) => {
    if (!ticker || ticker.length < 3) return;

    queryClient.prefetchQuery({
      queryKey: tickerDetail.TICKER_DETAIL_QUERY_KEYS.detail(ticker, day),
      queryFn: () => getTickerDetail({ ticker, day }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return { prefetchTickerDetail };
}

/**
 * Hook to invalidate ticker detail queries
 */
export function useInvalidateTickerDetail() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: tickerDetail.TICKER_DETAIL_QUERY_KEYS.all,
    });
  };

  const invalidateTicker = (ticker: string, day?: number) => {
    if (day !== undefined) {
      queryClient.invalidateQueries({
        queryKey: tickerDetail.TICKER_DETAIL_QUERY_KEYS.detail(ticker, day),
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: [tickerDetail.TICKER_DETAIL_QUERY_KEYS.all[0], ticker],
      });
    }
  };

  return {
    invalidateAll,
    invalidateTicker,
  };
}

/**
 * Hook to get ticker price trend summary
 * @param tickerData - Ticker data from useTickerDetail
 */
export function useTickerPriceTrend(tickerData?: tickerDetail.TickerData) {
  if (!tickerData) return null;

  const getCurrentPrice = () => tickerData.priceFlat ?? 0;
  const getPriceChange = () => tickerData.priceFloat ?? 0;
  const getPriceChangePercent = () => tickerData.pricePercent ?? 0;
  
  const isPositive = getPriceChangePercent() > 0;
  const isNegative = getPriceChangePercent() < 0;
  const isNeutral = getPriceChangePercent() === 0;

  return {
    currentPrice: getCurrentPrice(),
    priceChange: getPriceChange(),
    priceChangePercent: getPriceChangePercent(),
    isPositive,
    isNegative,
    isNeutral,
    trend: tickerData.trend,
    base: tickerData.base,
    rating: tickerData.rating,
  };
}

/**
 * Hook to analyze 10-day price history
 * @param tendays - Ten days data from useTickerDetail
 */
export function useTenDaysAnalysis(tendays?: tickerDetail.TenDaysItem[]) {
  if (!tendays || tendays.length === 0) return null;

  const sortedByDate = [...tendays].sort((a, b) => b.date - a.date);
  const latest = sortedByDate[0];
  const oldest = sortedByDate[sortedByDate.length - 1];

  const priceChanges = tendays.map((day) => day.pricePercent);
  const avgPriceChange =
    priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;

  const positiveChanges = priceChanges.filter((change) => change > 0).length;
  const negativeChanges = priceChanges.filter((change) => change < 0).length;
  const neutralChanges = priceChanges.filter((change) => change === 0).length;

  const totalForeignTrade = tendays.reduce((sum, day) => sum + day.giaodichnn, 0);
  const avgForeignTrade = totalForeignTrade / tendays.length;

  return {
    latest,
    oldest,
    tendays: sortedByDate,
    avgPriceChange,
    positiveChanges,
    negativeChanges,
    neutralChanges,
    totalForeignTrade,
    avgForeignTrade,
    period: tendays.length,
    overallTrend:
      positiveChanges > negativeChanges ? "uptrend" : 
      negativeChanges > positiveChanges ? "downtrend" : 
      "sideways",
  };
}

