import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";
import { FinancialRatioService } from "@/services/financial-ratio.service";
import {
  type FinancialRatioData,
  type Period,
  type FinancialRatioItem,
  type FinancialRatioQueryOptions,
  FinancialRatioError,
  FINANCIAL_RATIO_QUERY_KEYS,
} from "@/types/financial-ratio";

/**
 * Hook to fetch financial ratios for a company
 */
export function useFinancialRatio(
  ticker: string,
  period: Period = 'Q',
  size?: number,
  options: FinancialRatioQueryOptions = {}
): UseQueryResult<FinancialRatioData, FinancialRatioError> {
  const actualSize = size ?? FinancialRatioService.getMaxSize(period);

  return useQuery({
    queryKey: FINANCIAL_RATIO_QUERY_KEYS.list(ticker, period, actualSize),
    queryFn: () => FinancialRatioService.getFinancialRatios(ticker, period, actualSize),
    enabled: (options.enabled ?? true) && 
             !!ticker && 
             FinancialRatioService.isValidTicker(ticker),
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime ?? 60 * 60 * 1000, // 1 hour
    refetchInterval: options.refetchInterval,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (data not found)
      if (error instanceof FinancialRatioError && error.statusCode === 404) {
        return false;
      }
      // Don't retry on 400 errors (invalid parameters)
      if (error instanceof FinancialRatioError && error.statusCode === 400) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}

/**
 * Hook to fetch quarterly financial ratios
 */
export function useQuarterlyFinancialRatios(
  ticker: string,
  size: number = 12,
  options: FinancialRatioQueryOptions = {}
): UseQueryResult<FinancialRatioData, FinancialRatioError> {
  return useQuery({
    queryKey: FINANCIAL_RATIO_QUERY_KEYS.quarterly(ticker),
    queryFn: () => FinancialRatioService.getQuarterlyRatios(ticker, size),
    enabled: (options.enabled ?? true) && 
             !!ticker && 
             FinancialRatioService.isValidTicker(ticker),
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime ?? 60 * 60 * 1000, // 1 hour
    refetchInterval: options.refetchInterval,
  });
}

/**
 * Hook to fetch yearly financial ratios
 */
export function useYearlyFinancialRatios(
  ticker: string,
  size: number = 3,
  options: FinancialRatioQueryOptions = {}
): UseQueryResult<FinancialRatioData, FinancialRatioError> {
  return useQuery({
    queryKey: FINANCIAL_RATIO_QUERY_KEYS.yearly(ticker),
    queryFn: () => FinancialRatioService.getYearlyRatios(ticker, size),
    enabled: (options.enabled ?? true) && 
             !!ticker && 
             FinancialRatioService.isValidTicker(ticker),
    staleTime: options.staleTime ?? 15 * 60 * 1000, // 15 minutes
    gcTime: options.cacheTime ?? 2 * 60 * 60 * 1000, // 2 hours
    refetchInterval: options.refetchInterval,
  });
}

/**
 * Hook to fetch both quarterly and yearly ratios
 */
export function useFinancialRatiosBoth(
  ticker: string,
  options: FinancialRatioQueryOptions = {}
) {
  const quarterly = useQuarterlyFinancialRatios(ticker, 12, options);
  const yearly = useYearlyFinancialRatios(ticker, 3, options);

  return {
    quarterly: {
      data: quarterly.data,
      isLoading: quarterly.isLoading,
      error: quarterly.error,
      refetch: quarterly.refetch,
    },
    yearly: {
      data: yearly.data,
      isLoading: yearly.isLoading,
      error: yearly.error,
      refetch: yearly.refetch,
    },
    isLoading: quarterly.isLoading || yearly.isLoading,
    hasError: !!quarterly.error || !!yearly.error,
  };
}

/**
 * Hook to fetch multiple companies' financial ratios
 */
export function useMultipleCompanyRatios(
  tickers: string[],
  period: Period = 'Q',
  size?: number,
  options: FinancialRatioQueryOptions = {}
): UseQueryResult<Record<string, FinancialRatioData>, FinancialRatioError> {
  const actualSize = size ?? FinancialRatioService.getMaxSize(period);

  return useQuery({
    queryKey: [...FINANCIAL_RATIO_QUERY_KEYS.lists(), 'multiple', tickers.sort().join(','), period, actualSize],
    queryFn: () => FinancialRatioService.getMultipleCompanyRatios(tickers, period, actualSize),
    enabled: (options.enabled ?? true) && tickers.length > 0,
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime ?? 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook with computed analytics from financial ratios
 */
export function useFinancialRatioAnalytics(
  ticker: string,
  period: Period = 'Q',
  size?: number,
  options: FinancialRatioQueryOptions = {}
) {
  const query = useFinancialRatio(ticker, period, size, options);

  const analytics = useMemo(() => {
    if (!query.data || !query.data.items || query.data.items.length === 0) {
      return null;
    }

    const latest = FinancialRatioService.getLatestPeriod(query.data);
    const items = query.data.items;

    // Calculate trends
    const hasTrend = items.length >= 2;
    const comparison = hasTrend 
      ? FinancialRatioService.compareRatios(items[0], items[1])
      : null;

    // Extract ratio categories
    const balanceSheetRatios = latest ? FinancialRatioService.getBalanceSheetRatios(latest) : {};
    const incomeStatementRatios = latest ? FinancialRatioService.getIncomeStatementRatios(latest) : {};
    const operationalRatios = latest ? FinancialRatioService.getOperationalRatios(latest) : {};
    const growthRatios = latest ? FinancialRatioService.getGrowthRatios(latest) : {};

    // Prepare chart data
    const periods = items.map(item => item.periodDateName).reverse();

    return {
      latest,
      items,
      periods,
      hasTrend,
      comparison,
      ratios: {
        balanceSheet: balanceSheetRatios,
        incomeStatement: incomeStatementRatios,
        operational: operationalRatios,
        growth: growthRatios,
      },
      industryGroup: query.data.industryGroup,
      summary: FinancialRatioService.generateSummary(query.data),
    };
  }, [query.data]);

  return {
    ...query,
    analytics,
  };
}

/**
 * Hook to prefetch financial ratio data
 */
export function usePrefetchFinancialRatios() {
  const queryClient = useQueryClient();

  const prefetchQuarterly = (ticker: string, size = 12) => {
    if (!ticker || !FinancialRatioService.isValidTicker(ticker)) return;

    queryClient.prefetchQuery({
      queryKey: FINANCIAL_RATIO_QUERY_KEYS.quarterly(ticker),
      queryFn: () => FinancialRatioService.getQuarterlyRatios(ticker, size),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const prefetchYearly = (ticker: string, size = 3) => {
    if (!ticker || !FinancialRatioService.isValidTicker(ticker)) return;

    queryClient.prefetchQuery({
      queryKey: FINANCIAL_RATIO_QUERY_KEYS.yearly(ticker),
      queryFn: () => FinancialRatioService.getYearlyRatios(ticker, size),
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  const prefetchBoth = (ticker: string) => {
    prefetchQuarterly(ticker);
    prefetchYearly(ticker);
  };

  return {
    prefetchQuarterly,
    prefetchYearly,
    prefetchBoth,
  };
}

/**
 * Hook to invalidate financial ratio queries
 */
export function useInvalidateFinancialRatioQueries() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: FINANCIAL_RATIO_QUERY_KEYS.all
    });
  };

  const invalidateByTicker = (ticker: string) => {
    queryClient.invalidateQueries({
      queryKey: [...FINANCIAL_RATIO_QUERY_KEYS.all, 'detail', ticker]
    });
  };

  const invalidateQuarterly = (ticker: string) => {
    queryClient.invalidateQueries({
      queryKey: FINANCIAL_RATIO_QUERY_KEYS.quarterly(ticker)
    });
  };

  const invalidateYearly = (ticker: string) => {
    queryClient.invalidateQueries({
      queryKey: FINANCIAL_RATIO_QUERY_KEYS.yearly(ticker)
    });
  };

  return {
    invalidateAll,
    invalidateByTicker,
    invalidateQuarterly,
    invalidateYearly,
  };
}

/**
 * Hook for comparing financial ratios across companies
 */
export function useFinancialRatioComparison(
  tickers: string[],
  period: Period = 'Q',
  options: FinancialRatioQueryOptions = {}
) {
  const query = useMultipleCompanyRatios(tickers, period, undefined, options);

  const comparison = useMemo(() => {
    if (!query.data) return null;

    const companies = Object.entries(query.data);
    if (companies.length === 0) return null;

    // Extract common metrics for comparison
    const metrics = [
      { key: 'op1', label: 'Biên lợi nhuận gộp', format: 'percentage' as const },
      { key: 'op2', label: 'Biên lợi nhuận hoạt động', format: 'percentage' as const },
      { key: 'op3', label: 'Biên lợi nhuận ròng', format: 'percentage' as const },
      { key: 'op4', label: 'ROE', format: 'percentage' as const },
      { key: 'op5', label: 'ROA', format: 'percentage' as const },
      { key: 'op8', label: 'Tỷ số thanh toán hiện hành', format: 'ratio' as const },
      { key: 'op12', label: 'Nợ trên vốn chủ sở hữu', format: 'ratio' as const },
    ];

    const comparisonData = metrics.map(metric => {
      const values: Record<string, number | undefined> = {};
      
      companies.forEach(([ticker, data]) => {
        const latest = FinancialRatioService.getLatestPeriod(data);
        if (latest) {
          values[ticker] = latest[metric.key as keyof FinancialRatioItem] as number | undefined;
        }
      });

      return {
        ...metric,
        values,
      };
    });

    return {
      tickers,
      period,
      metrics: comparisonData,
      industryGroups: Object.fromEntries(
        companies.map(([ticker, data]) => [ticker, data.industryGroup])
      ),
    };
  }, [query.data, tickers, period]);

  return {
    ...query,
    comparison,
  };
}

/**
 * Hook to get specific ratio value
 */
export function useSpecificRatio(
  ticker: string,
  ratioKey: string,
  period: Period = 'Q',
  options: FinancialRatioQueryOptions = {}
) {
  const query = useFinancialRatio(ticker, period, undefined, options);

  const ratioValue = useMemo(() => {
    if (!query.data) return null;

    const latest = FinancialRatioService.getLatestPeriod(query.data);
    if (!latest) return null;

    const value = latest[ratioKey as keyof FinancialRatioItem] as number | undefined;
    
    return {
      value,
      period: latest.periodDateName,
      ticker: latest.ticker,
    };
  }, [query.data, ratioKey]);

  return {
    ...query,
    ratioValue,
  };
}

export default useFinancialRatio;

