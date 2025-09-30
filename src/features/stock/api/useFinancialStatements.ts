import { useQuery } from "@tanstack/react-query";
import { FinancialStatementsService } from "@/services/financial-statements.service";
import type {
  FinancialStatementMetricsResponse,
  FinancialStatisticsResponse,
  FinancialStatementDetailResponse,
} from "@/lib/schemas/financial-statements";

// Query keys factory
export const financialStatementsKeys = {
  all: ["financial-statements"] as const,
  metrics: (ticker: string) => [...financialStatementsKeys.all, ticker, "metrics"] as const,
  statistics: (ticker: string) => [...financialStatementsKeys.all, ticker, "statistics"] as const,
  detail: (ticker: string, section: string) => [
    ...financialStatementsKeys.all,
    ticker,
    "detail",
    section,
  ] as const,
};

/**
 * Hook to fetch financial statement metrics (template structure)
 */
export function useFinancialStatementMetrics(ticker: string) {
  return useQuery<FinancialStatementMetricsResponse>({
    queryKey: financialStatementsKeys.metrics(ticker),
    queryFn: () => FinancialStatementsService.getFinancialStatementMetrics(ticker),
    enabled: Boolean(ticker && FinancialStatementsService.isValidTicker(ticker)),
    staleTime: 30 * 60 * 1000, // 30 minutes (template doesn't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      // Don't retry on 404 (ticker not found) or 400 (invalid ticker)
      if (error?.message?.includes('404') || error?.message?.includes('400')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch financial statistics
 */
export function useFinancialStatistics(ticker: string) {
  return useQuery<FinancialStatisticsResponse>({
    queryKey: financialStatementsKeys.statistics(ticker),
    queryFn: () => FinancialStatementsService.getFinancialStatistics(ticker),
    enabled: Boolean(ticker && FinancialStatementsService.isValidTicker(ticker)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes('404') || error?.message?.includes('400')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch financial statement details by section
 */
export function useFinancialStatementDetail(
  ticker: string,
  section: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW' = 'BALANCE_SHEET'
) {
  return useQuery<FinancialStatementDetailResponse>({
    queryKey: financialStatementsKeys.detail(ticker, section),
    queryFn: () => FinancialStatementsService.getFinancialStatementDetail(ticker, section),
    enabled: Boolean(ticker && FinancialStatementsService.isValidTicker(ticker)),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes('404') || error?.message?.includes('400')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to get the latest financial statistics with additional processing
 */
export function useLatestFinancialStatistics(ticker: string) {
  return useQuery({
    queryKey: [...financialStatementsKeys.statistics(ticker), "latest"],
    queryFn: async () => {
      const response = await FinancialStatementsService.getFinancialStatistics(ticker);
      const latest = FinancialStatementsService.getLatestStatistics(response);

      if (!latest) {
        throw new Error("No financial statistics available");
      }

      const healthScore = FinancialStatementsService.calculateFinancialHealthScore(latest);

      return {
        ticker: ticker.toUpperCase(),
        data: latest,
        healthScore,
        formattedMetrics: {
          marketCap: FinancialStatementsService.formatLargeNumber(latest.marketCap),
          pe: FinancialStatementsService.formatRatio(latest.pe),
          pb: FinancialStatementsService.formatRatio(latest.pb),
          roe: FinancialStatementsService.formatPercentage(latest.roe),
          roa: FinancialStatementsService.formatPercentage(latest.roa),
          grossMargin: FinancialStatementsService.formatPercentage(latest.grossMargin),
          operatingMargin: FinancialStatementsService.formatPercentage(latest.operatingMargin),
          netMargin: FinancialStatementsService.formatPercentage(latest.netMargin),
          currentRatio: FinancialStatementsService.formatRatio(latest.currentRatio),
          quickRatio: FinancialStatementsService.formatRatio(latest.quickRatio),
          debtToEquity: FinancialStatementsService.formatRatio(latest.debtToEquity),
          dividendYield: FinancialStatementsService.formatPercentage(latest.dividendYield),
        },
      };
    },
    enabled: Boolean(ticker && FinancialStatementsService.isValidTicker(ticker)),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message?.includes('404') || error?.message?.includes('400')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to get financial statistics with historical comparison
 */
export function useFinancialStatisticsWithComparison(ticker: string) {
  return useQuery({
    queryKey: [...financialStatementsKeys.statistics(ticker), "with-comparison"],
    queryFn: async () => {
      const response = await FinancialStatementsService.getFinancialStatistics(ticker);
      const sortedData = response.data.sort((a, b) => {
        if (a.year !== b.year) return b.year.localeCompare(a.year);
        return b.quarter - a.quarter;
      });

      const current = sortedData[0];
      const previous = sortedData[1];

      const comparison = FinancialStatementsService.compareFinancialMetrics(current, previous);

      return {
        ticker: ticker.toUpperCase(),
        current,
        previous,
        comparison,
        allData: sortedData,
        trend: {
          revenueGrowth: comparison?.revenue || 0,
          earningsGrowth: comparison?.earnings || 0,
          profitabilityTrend: {
            roe: comparison?.roe || 0,
            roa: comparison?.roa || 0,
          },
          liquidityTrend: {
            currentRatio: comparison?.currentRatio || 0,
          },
          leverageTrend: {
            debtToEquity: comparison?.debtToEquity || 0,
          },
        },
      };
    },
    enabled: Boolean(ticker && FinancialStatementsService.isValidTicker(ticker)),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch all financial statement sections at once
 */
export function useAllFinancialStatements(ticker: string) {
  const balanceSheet = useFinancialStatementDetail(ticker, 'BALANCE_SHEET');
  const incomeStatement = useFinancialStatementDetail(ticker, 'INCOME_STATEMENT');
  const cashFlow = useFinancialStatementDetail(ticker, 'CASH_FLOW');

  return {
    balanceSheet,
    incomeStatement,
    cashFlow,
    isLoading: balanceSheet.isLoading || incomeStatement.isLoading || cashFlow.isLoading,
    isError: balanceSheet.isError || incomeStatement.isError || cashFlow.isError,
    error: balanceSheet.error || incomeStatement.error || cashFlow.error,
  };
}

/**
 * Hook for filtered financial statistics by time range
 */
export function useFinancialStatisticsFiltered(
  ticker: string,
  yearFrom?: string,
  yearTo?: string,
  ratioType?: string
) {
  return useQuery({
    queryKey: [
      ...financialStatementsKeys.statistics(ticker),
      "filtered",
      yearFrom,
      yearTo,
      ratioType,
    ],
    queryFn: async () => {
      const response = await FinancialStatementsService.getFinancialStatistics(ticker);

      let filteredData = response.data;

      // Filter by year range
      if (yearFrom || yearTo) {
        filteredData = filteredData.filter(item => {
          const year = parseInt(item.year);
          if (yearFrom && year < parseInt(yearFrom)) return false;
          if (yearTo && year > parseInt(yearTo)) return false;
          return true;
        });
      }

      // Filter by ratio type
      if (ratioType) {
        filteredData = filteredData.filter(item => item.ratioType === ratioType);
      }

      return {
        ...response,
        data: filteredData,
        summary: {
          totalRecords: filteredData.length,
          yearRange: {
            from: Math.min(...filteredData.map(d => parseInt(d.year))),
            to: Math.max(...filteredData.map(d => parseInt(d.year))),
          },
          ratioTypes: [...new Set(filteredData.map(d => d.ratioType))],
        },
      };
    },
    enabled: Boolean(ticker && FinancialStatementsService.isValidTicker(ticker)),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}