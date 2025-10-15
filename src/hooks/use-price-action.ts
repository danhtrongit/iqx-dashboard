import { useQuery } from "@tanstack/react-query";
import { priceActionService } from "@/services/price-action.service";

/**
 * Hook to fetch all price action data
 * Cache: 5 minutes (price data is time-sensitive)
 */
export const usePriceAction = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["price-action-data"],
    queryFn: () => priceActionService.getPriceActionData(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
