import { useQuery } from "@tanstack/react-query";
import { arixHoldService } from "@/services/arix-hold.service";

/**
 * Hook to fetch all ARIX HOLD positions
 * Cache: 60 minutes
 */
export const useArixHoldPositions = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["arix-hold-positions"],
    queryFn: () => arixHoldService.getArixHoldPositions(),
    enabled,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes (previously cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch ARIX HOLD position statistics
 * Cache: 60 minutes
 */
export const useArixHoldStatistics = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["arix-hold-statistics"],
    queryFn: () => arixHoldService.getPositionStatistics(),
    enabled,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch positions for a specific symbol
 * Cache: 60 minutes
 */
export const useArixHoldPositionsBySymbol = (
  symbol: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["arix-hold-positions-by-symbol", symbol],
    queryFn: () => arixHoldService.getPositionsBySymbol(symbol),
    enabled: enabled && !!symbol,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch positions sorted by value
 * Cache: 60 minutes
 */
export const useArixHoldPositionsByValue = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["arix-hold-positions-by-value"],
    queryFn: () => arixHoldService.getPositionsByValue(),
    enabled,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

