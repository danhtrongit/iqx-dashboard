import { useQuery } from "@tanstack/react-query";
import { arixSellService } from "@/services/arix-sell.service";

/**
 * Hook to fetch all ARIX SELL trades
 * Cache: 60 minutes
 */
export const useArixSellTrades = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["arix-sell-trades"],
    queryFn: () => arixSellService.getArixSellTrades(),
    enabled,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes (previously cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch ARIX SELL trade statistics
 * Cache: 60 minutes
 */
export const useArixSellStatistics = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["arix-sell-statistics"],
    queryFn: () => arixSellService.getTradeStatistics(),
    enabled,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch trades for a specific stock
 * Cache: 60 minutes
 */
export const useArixSellTradesByStock = (
  stockCode: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["arix-sell-trades-by-stock", stockCode],
    queryFn: () => arixSellService.getTradesByStock(stockCode),
    enabled: enabled && !!stockCode,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch recent trades
 * Cache: 60 minutes
 */
export const useArixSellRecentTrades = (
  limit: number = 10,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["arix-sell-recent-trades", limit],
    queryFn: () => arixSellService.getRecentTrades(limit),
    enabled,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

