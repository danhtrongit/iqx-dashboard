import { useQuery } from "@tanstack/react-query";
import { currencyService } from "@/services/currency.service";

export const useExchangeRate = (
  base: string,
  target: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["exchange-rate", base, target],
    queryFn: () => currencyService.getExchangeRate(base, target),
    enabled: enabled && !!base && !!target && base !== target,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

export const useCurrencyConvert = (
  amount: number,
  base: string,
  target: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["currency-convert", amount, base, target],
    queryFn: () => currencyService.convertCurrency(amount, base, target),
    enabled: enabled && amount > 0 && !!base && !!target && base !== target,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

