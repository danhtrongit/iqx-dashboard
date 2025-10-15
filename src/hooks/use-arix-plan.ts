import { useQuery } from "@tanstack/react-query";
import { arixPlanService } from "@/services/arix-plan.service";

/**
 * Hook to fetch all ARIX PLAN positions
 * Cache: 60 minutes (1 hour)
 */
export const useArixPlanPositions = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["arix-plan-positions"],
    queryFn: () => arixPlanService.getArixPlanPositions(),
    enabled,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes (previously cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch ARIX PLAN position statistics
 * Cache: 60 minutes (1 hour)
 */
export const useArixPlanStatistics = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["arix-plan-statistics"],
    queryFn: () => arixPlanService.getPositionStatistics(),
    enabled,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch position for a specific symbol
 * Cache: 60 minutes (1 hour)
 */
export const useArixPlanPositionBySymbol = (
  symbol: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["arix-plan-position-by-symbol", symbol],
    queryFn: () => arixPlanService.getPositionBySymbol(symbol),
    enabled: enabled && !!symbol,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch positions sorted by return/risk ratio
 * Cache: 60 minutes (1 hour)
 */
export const useArixPlanPositionsByReturnRisk = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["arix-plan-positions-by-return-risk"],
    queryFn: () => arixPlanService.getPositionsByReturnRisk(),
    enabled,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch positions sorted by potential return percentage
 * Cache: 60 minutes (1 hour)
 */
export const useArixPlanPositionsByPotentialReturn = (
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["arix-plan-positions-by-potential-return"],
    queryFn: () => arixPlanService.getPositionsByPotentialReturn(),
    enabled,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch risk/reward analysis for all positions
 * Cache: 60 minutes (1 hour)
 */
export const useArixPlanRiskRewardAnalysis = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["arix-plan-risk-reward-analysis"],
    queryFn: () => arixPlanService.getRiskRewardAnalysis(),
    enabled,
    staleTime: 60 * 60 * 1000, // 60 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

