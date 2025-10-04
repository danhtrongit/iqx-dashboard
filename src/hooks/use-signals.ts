import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { SignalsService, SignalsError } from "@/services/signals.service";
import {
  type GetSignalsRequest,
  type GetSignalsResponse,
  type SignalDataItem,
  SIGNALS_QUERY_KEYS,
} from "@/lib/schemas/signals";

/**
 * Hook to fetch signals for multiple symbols
 */
export function useSignals(
  symbols: string[],
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: number | false;
  } = {}
): UseQueryResult<GetSignalsResponse, SignalsError> {
  return useQuery({
    queryKey: SIGNALS_QUERY_KEYS.list(symbols),
    queryFn: () => SignalsService.getSignals({ symbols }),
    enabled: (options.enabled ?? true) && symbols.length > 0,
    staleTime: options.staleTime ?? 1 * 60 * 1000, // 1 minute - signals change frequently
    gcTime: options.cacheTime ?? 5 * 60 * 1000, // 5 minutes
    refetchInterval: options.refetchInterval ?? false, // Optional auto-refetch
  });
}

/**
 * Hook to fetch signals for a single symbol
 */
export function useSignal(
  symbol: string,
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: number | false;
  } = {}
): UseQueryResult<SignalDataItem | undefined, SignalsError> {
  return useQuery({
    queryKey: SIGNALS_QUERY_KEYS.list([symbol]),
    queryFn: async () => {
      const response = await SignalsService.getSignalForSymbol(symbol);
      return response.data[0]; // Return first (and only) item
    },
    enabled: (options.enabled ?? true) && !!symbol,
    staleTime: options.staleTime ?? 1 * 60 * 1000, // 1 minute
    gcTime: options.cacheTime ?? 5 * 60 * 1000, // 5 minutes
    refetchInterval: options.refetchInterval ?? false,
  });
}

/**
 * Hook to fetch signals with auto-refresh
 * Useful for real-time monitoring
 */
export function useSignalsRealtime(
  symbols: string[],
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
): UseQueryResult<GetSignalsResponse, SignalsError> {
  return useSignals(symbols, {
    ...options,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: options.refetchInterval ?? 60 * 1000, // 1 minute default
  });
}

/**
 * Hook to fetch filtered signals based on conditions
 */
export function useFilteredSignals(
  symbols: string[],
  filter: {
    trend?: "UPTREND" | "DOWNTREND" | "SIDEWAYS";
    strength?: "STRONG" | "WEAK" | "MODERATE";
    hasSignal?: keyof GetSignalsResponse["data"][0]["analysis"]["signals"];
  },
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  } = {}
): UseQueryResult<SignalDataItem[], SignalsError> {
  return useQuery({
    queryKey: [...SIGNALS_QUERY_KEYS.list(symbols), "filtered", filter],
    queryFn: async () => {
      const response = await SignalsService.getSignals({ symbols });
      
      // Apply filters
      let filtered = response.data;
      
      if (filter.trend) {
        filtered = filtered.filter(item => item.analysis.trend === filter.trend);
      }
      
      if (filter.strength) {
        filtered = filtered.filter(item => item.analysis.strength === filter.strength);
      }
      
      if (filter.hasSignal) {
        filtered = filtered.filter(item => item.analysis.signals[filter.hasSignal] === true);
      }
      
      return filtered;
    },
    enabled: (options.enabled ?? true) && symbols.length > 0,
    staleTime: options.staleTime ?? 1 * 60 * 1000,
    gcTime: options.cacheTime ?? 5 * 60 * 1000,
  });
}

/**
 * Hook to check if any symbol has specific signals
 */
export function useSignalAlerts(
  symbols: string[],
  alertOn: {
    xuHuongTang?: boolean;
    suyYeu?: boolean;
    tinHieuBan?: boolean;
    quaMua?: boolean;
    quaBan?: boolean;
  },
  options: {
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
): UseQueryResult<SignalDataItem[], SignalsError> {
  return useQuery({
    queryKey: [...SIGNALS_QUERY_KEYS.list(symbols), "alerts", alertOn],
    queryFn: async () => {
      const response = await SignalsService.getSignals({ symbols });
      
      // Filter items that match any of the alert conditions
      return response.data.filter(item => {
        const signals = item.analysis.signals;
        
        return Object.entries(alertOn).some(([key, value]) => {
          if (value === true) {
            return signals[key as keyof typeof signals] === true;
          }
          return false;
        });
      });
    },
    enabled: (options.enabled ?? true) && symbols.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: options.refetchInterval ?? 60 * 1000, // Check every minute
  });
}

