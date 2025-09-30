import { useQuery } from "@tanstack/react-query";
import { getPeerComparison } from "@/services/peer-comparison.service";

export const peerComparisonKeys = {
  all: ["peerComparison"] as const,
  bySymbol: (symbol: string) => [...peerComparisonKeys.all, symbol] as const,
};

export function usePeerComparison(symbol: string) {
  return useQuery({
    queryKey: peerComparisonKeys.bySymbol(symbol),
    queryFn: () => getPeerComparison(symbol),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: Boolean(symbol),
  });
}