import { useQuery } from "@tanstack/react-query"
import { CompanyDailyInfoService } from "@/services/company-daily-info.service"
import { COMPANY_DAILY_INFO_QUERY_KEYS } from "@/types/company-daily-info"
import type { ForeignNetEntry } from "@/types/company-daily-info"

// Query keys factory
export const companyDailyInfoKeys = {
  all: ["company-daily-info"] as const,
  detail: (ticker: string) => [...companyDailyInfoKeys.all, ticker] as const,
  formatted: (ticker: string) => [...companyDailyInfoKeys.all, ticker, "formatted"] as const,
}

/**
 * Hook to fetch company daily info (foreign net data)
 */
export function useCompanyDailyInfo(ticker: string) {
  return useQuery<ForeignNetEntry[]>({
    queryKey: companyDailyInfoKeys.detail(ticker),
    queryFn: () => CompanyDailyInfoService.getCompanyDailyInfo(ticker),
    enabled: Boolean(ticker && CompanyDailyInfoService.isValidTicker(ticker)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 (ticker not found) or 400 (invalid ticker)
      if (error?.statusCode === 404 || error?.statusCode === 400) {
        return false
      }
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to fetch company daily info with formatted data and statistics
 */
export function useCompanyDailyInfoFormatted(ticker: string) {
  return useQuery({
    queryKey: companyDailyInfoKeys.formatted(ticker),
    queryFn: () => CompanyDailyInfoService.getCompanyDailyInfoFormatted(ticker),
    enabled: Boolean(ticker && CompanyDailyInfoService.isValidTicker(ticker)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 (ticker not found) or 400 (invalid ticker)
      if (error?.statusCode === 404 || error?.statusCode === 400) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook with additional data processing for charts and display
 */
export function useCompanyDailyInfoWithStats(ticker: string) {
  return useQuery({
    queryKey: [...companyDailyInfoKeys.detail(ticker), "with-stats"],
    queryFn: async () => {
      const data = await CompanyDailyInfoService.getCompanyDailyInfo(ticker)
      const statistics = CompanyDailyInfoService.calculateStatistics(data)
      const trend = CompanyDailyInfoService.getTrend(data)

      return {
        ticker: ticker.toUpperCase(),
        data,
        statistics,
        trend,
        formattedData: data.map(entry => ({
          date: entry.tradingDate,
          value: entry.foreignNet,
          formattedValue: CompanyDailyInfoService.formatForeignNet(entry.foreignNet),
          color: CompanyDailyInfoService.getForeignNetColor(entry.foreignNet),
        })),
      }
    },
    enabled: Boolean(ticker && CompanyDailyInfoService.isValidTicker(ticker)),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.statusCode === 404 || error?.statusCode === 400) {
        return false
      }
      return failureCount < 3
    },
  })
}

/**
 * Hook for filtered data by date range
 */
export function useCompanyDailyInfoFiltered(
  ticker: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: [...companyDailyInfoKeys.detail(ticker), "filtered", startDate, endDate],
    queryFn: async () => {
      const data = await CompanyDailyInfoService.getCompanyDailyInfo(ticker)

      if (!startDate || !endDate) {
        return data
      }

      return CompanyDailyInfoService.filterByDateRange(data, startDate, endDate)
    },
    enabled: Boolean(
      ticker &&
      CompanyDailyInfoService.isValidTicker(ticker)
    ),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}