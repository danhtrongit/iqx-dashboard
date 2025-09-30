import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query"
import { useState, useEffect, useMemo } from "react"
import { CompanyService } from "@/services/company.service"
import {
  type CompanyData,
  type CompanySearchRequest,
  type CompanyListResponse,
  type CompanyTimeSeriesData,
  type CompanyNews,
  type CompanyEvent,
  type FinancialRatios,
  type CompanySector,
  type CompanyRelationshipResponse,
  type ShareholderStructureResponse,
  type CompanyShareholderResponse,
  COMPANY_QUERY_KEYS,
  CompanyError,
} from "@/types/company"

/**
 * Hook to fetch company data by ticker
 */
export function useCompany(
  ticker: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    refetchInterval?: number
  } = {}
): UseQueryResult<CompanyData, CompanyError> {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.detail(ticker),
    queryFn: () => CompanyService.getCompany(ticker),
    enabled: (options.enabled ?? true) && !!ticker && CompanyService.isValidTicker(ticker),
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
    refetchInterval: options.refetchInterval ?? 2 * 60 * 1000, // 2 minutes for real-time data
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (company not found)
      if (error instanceof CompanyError && error.statusCode === 404) {
        return false
      }
      // Don't retry on 400 errors (invalid ticker)
      if (error instanceof CompanyError && error.statusCode === 400) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
  })
}

/**
 * Hook to fetch multiple companies
 */
export function useMultipleCompanies(
  tickers: string[],
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    limit?: number
  } = {}
): UseQueryResult<CompanyData[], CompanyError> {
  return useQuery({
    queryKey: [...COMPANY_QUERY_KEYS.all, 'multiple', tickers.sort().join(',')],
    queryFn: () => CompanyService.getMultipleCompanies(tickers, { limit: options.limit }),
    enabled: (options.enabled ?? true) && tickers.length > 0,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to search companies
 */
export function useSearchCompanies(
  params: CompanySearchRequest = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<CompanyListResponse, CompanyError> {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.list(params),
    queryFn: () => CompanyService.searchCompanies(params),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 3 * 60 * 1000, // 3 minutes
    gcTime: options.cacheTime ?? 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook to fetch companies by sector
 */
export function useCompaniesBySector(
  sector: CompanySector,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    limit?: number
  } = {}
): UseQueryResult<CompanyData[], CompanyError> {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.sector(sector),
    queryFn: () => CompanyService.getCompaniesBySector(sector, options.limit),
    enabled: (options.enabled ?? true) && !!sector,
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to fetch top companies by market cap
 */
export function useTopCompanies(
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    limit?: number
  } = {}
): UseQueryResult<CompanyData[], CompanyError> {
  return useQuery({
    queryKey: [...COMPANY_QUERY_KEYS.all, 'top', { limit: options.limit }],
    queryFn: () => CompanyService.getTopCompanies(options.limit),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime ?? 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to fetch company financial ratios
 */
export function useCompanyRatios(
  ticker: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<FinancialRatios, CompanyError> {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.financials(ticker),
    queryFn: () => CompanyService.getCompanyRatios(ticker),
    enabled: (options.enabled ?? true) && !!ticker && CompanyService.isValidTicker(ticker),
    staleTime: options.staleTime ?? 15 * 60 * 1000, // 15 minutes
    gcTime: options.cacheTime ?? 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to fetch company time series data
 */
export function useCompanyTimeSeries(
  ticker: string,
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'daily',
  days = 30,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<CompanyTimeSeriesData, CompanyError> {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.timeSeries(ticker, `${period}_${days}`),
    queryFn: () => CompanyService.getCompanyTimeSeries(ticker, period, days),
    enabled: (options.enabled ?? true) && !!ticker && CompanyService.isValidTicker(ticker),
    staleTime: options.staleTime ?? (period === 'daily' ? 1 * 60 * 1000 : 10 * 60 * 1000), // 1 min for daily, 10 min for others
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to fetch company news
 */
export function useCompanyNews(
  ticker: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    limit?: number
  } = {}
): UseQueryResult<CompanyNews[], CompanyError> {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.news(ticker),
    queryFn: () => CompanyService.getCompanyNews(ticker, options.limit),
    enabled: (options.enabled ?? true) && !!ticker && CompanyService.isValidTicker(ticker),
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to fetch company events
 */
export function useCompanyEvents(
  ticker: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    limit?: number
  } = {}
): UseQueryResult<CompanyEvent[], CompanyError> {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.events(ticker),
    queryFn: () => CompanyService.getCompanyEvents(ticker, options.limit),
    enabled: (options.enabled ?? true) && !!ticker && CompanyService.isValidTicker(ticker),
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime ?? 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to compare multiple companies
 */
export function useCompanyComparison(
  tickers: string[],
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<CompanyData[], CompanyError> {
  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.comparison(tickers),
    queryFn: () => CompanyService.getMultipleCompanies(tickers),
    enabled: (options.enabled ?? true) && tickers.length > 1,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to prefetch company data
 */
export function usePrefetchCompany() {
  const queryClient = useQueryClient()

  const prefetchCompany = (ticker: string) => {
    if (!ticker || !CompanyService.isValidTicker(ticker)) return

    queryClient.prefetchQuery({
      queryKey: COMPANY_QUERY_KEYS.detail(ticker),
      queryFn: () => CompanyService.getCompany(ticker),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  const prefetchCompanyNews = (ticker: string, limit = 10) => {
    if (!ticker || !CompanyService.isValidTicker(ticker)) return

    queryClient.prefetchQuery({
      queryKey: COMPANY_QUERY_KEYS.news(ticker),
      queryFn: () => CompanyService.getCompanyNews(ticker, limit),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  const prefetchTopCompanies = (limit = 20) => {
    queryClient.prefetchQuery({
      queryKey: [...COMPANY_QUERY_KEYS.all, 'top', { limit }],
      queryFn: () => CompanyService.getTopCompanies(limit),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }

  return {
    prefetchCompany,
    prefetchCompanyNews,
    prefetchTopCompanies,
  }
}

/**
 * Hook to invalidate company queries
 */
export function useInvalidateCompanyQueries() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: COMPANY_QUERY_KEYS.all
    })
  }

  const invalidateCompany = (ticker: string) => {
    queryClient.invalidateQueries({
      queryKey: COMPANY_QUERY_KEYS.detail(ticker)
    })
  }

  const invalidateCompanyNews = (ticker: string) => {
    queryClient.invalidateQueries({
      queryKey: COMPANY_QUERY_KEYS.news(ticker)
    })
  }

  const invalidateTimeSeries = (ticker: string) => {
    queryClient.invalidateQueries({
      queryKey: [...COMPANY_QUERY_KEYS.detail(ticker), 'timeSeries']
    })
  }

  const invalidateSector = (sector: CompanySector) => {
    queryClient.invalidateQueries({
      queryKey: COMPANY_QUERY_KEYS.sector(sector)
    })
  }

  const invalidateSearch = (params?: CompanySearchRequest) => {
    if (params) {
      queryClient.invalidateQueries({
        queryKey: COMPANY_QUERY_KEYS.list(params)
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: COMPANY_QUERY_KEYS.lists()
      })
    }
  }

  return {
    invalidateAll,
    invalidateCompany,
    invalidateCompanyNews,
    invalidateTimeSeries,
    invalidateSector,
    invalidateSearch,
  }
}

/**
 * Hook for real-time company data with auto-refresh
 */
export function useRealtimeCompany(
  ticker: string,
  options: {
    enabled?: boolean
    refreshInterval?: number
  } = {}
) {
  const [isRealtime, setIsRealtime] = useState(false)

  const { data, isLoading, error, refetch } = useCompany(ticker, {
    enabled: options.enabled,
    refetchInterval: isRealtime ? (options.refreshInterval ?? 30000) : undefined, // 30 seconds
    staleTime: isRealtime ? 0 : 5 * 60 * 1000, // No stale time in realtime mode
  })

  const startRealtime = () => setIsRealtime(true)
  const stopRealtime = () => setIsRealtime(false)
  const toggleRealtime = () => setIsRealtime(prev => !prev)

  // Auto-stop realtime when component unmounts or ticker changes
  useEffect(() => {
    return () => setIsRealtime(false)
  }, [ticker])

  return {
    data,
    isLoading,
    error,
    refetch,
    isRealtime,
    startRealtime,
    stopRealtime,
    toggleRealtime,
  }
}

/**
 * Hook for watchlist functionality
 */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('company-watchlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const addToWatchlist = (ticker: string) => {
    if (!ticker || !CompanyService.isValidTicker(ticker)) return

    const upperTicker = ticker.toUpperCase()
    if (watchlist.includes(upperTicker)) return

    const newWatchlist = [...watchlist, upperTicker]
    setWatchlist(newWatchlist)
    localStorage.setItem('company-watchlist', JSON.stringify(newWatchlist))
  }

  const removeFromWatchlist = (ticker: string) => {
    if (!ticker) return

    const upperTicker = ticker.toUpperCase()
    const newWatchlist = watchlist.filter(t => t !== upperTicker)
    setWatchlist(newWatchlist)
    localStorage.setItem('company-watchlist', JSON.stringify(newWatchlist))
  }

  const isInWatchlist = (ticker: string): boolean => {
    return ticker ? watchlist.includes(ticker.toUpperCase()) : false
  }

  const clearWatchlist = () => {
    setWatchlist([])
    localStorage.removeItem('company-watchlist')
  }

  // Use the multiple companies hook to fetch watchlist data
  const watchlistQuery = useMultipleCompanies(watchlist, {
    enabled: watchlist.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  return {
    watchlist,
    watchlistData: watchlistQuery.data || [],
    isLoading: watchlistQuery.isLoading,
    error: watchlistQuery.error,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist,
    refetch: watchlistQuery.refetch,
  }
}

/**
 * Hook for company comparison with analytics
 */
export function useCompanyAnalytics(companies: CompanyData[]) {
  const analytics = useMemo(() => {
    if (companies.length === 0) return null

    const comparison = CompanyService.compareCompanies(companies)

    const sortedByMarketCap = [...companies].sort((a, b) => b.financial.marketCap - a.financial.marketCap)
    const sortedByPrice = [...companies].sort((a, b) => b.financial.currentPrice - a.financial.currentPrice)
    const sortedByPE = [...companies]
      .filter(c => c.financial.pe)
      .sort((a, b) => (a.financial.pe || 0) - (b.financial.pe || 0))

    const averages = {
      marketCap: companies.reduce((sum, c) => sum + c.financial.marketCap, 0) / companies.length,
      price: companies.reduce((sum, c) => sum + c.financial.currentPrice, 0) / companies.length,
      pe: companies.filter(c => c.financial.pe).reduce((sum, c) => sum + (c.financial.pe || 0), 0) / companies.filter(c => c.financial.pe).length,
      foreignOwnership: companies.reduce((sum, c) => sum + c.ownership.foreignerPercentage, 0) / companies.length,
    }

    return {
      comparison,
      sortedByMarketCap,
      sortedByPrice,
      sortedByPE,
      averages,
      totalMarketCap: companies.reduce((sum, c) => sum + c.financial.marketCap, 0),
      count: companies.length,
    }
  }, [companies])

  return analytics
}

/**
 * Hook to fetch company relationships (affiliates and subsidiaries)
 */
export function useCompanyRelationships(
  ticker: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<CompanyRelationshipResponse, CompanyError> {
  return useQuery({
    queryKey: [...COMPANY_QUERY_KEYS.detail(ticker), 'relationships'],
    queryFn: () => CompanyService.getCompanyRelationships(ticker),
    enabled: (options.enabled ?? true) && !!ticker && CompanyService.isValidTicker(ticker),
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes (less frequent updates)
    gcTime: options.cacheTime ?? 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      if (error instanceof CompanyError && error.statusCode === 404) {
        return false
      }
      if (error instanceof CompanyError && error.statusCode === 400) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to fetch shareholder structure
 */
export function useShareholderStructure(
  ticker: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<ShareholderStructureResponse, CompanyError> {
  return useQuery({
    queryKey: [...COMPANY_QUERY_KEYS.detail(ticker), 'shareholder-structure'],
    queryFn: () => CompanyService.getShareholderStructure(ticker),
    enabled: (options.enabled ?? true) && !!ticker && CompanyService.isValidTicker(ticker),
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime ?? 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      if (error instanceof CompanyError && error.statusCode === 404) {
        return false
      }
      if (error instanceof CompanyError && error.statusCode === 400) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to fetch company shareholders
 */
export function useCompanyShareholders(
  ticker: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<CompanyShareholderResponse, CompanyError> {
  return useQuery({
    queryKey: [...COMPANY_QUERY_KEYS.detail(ticker), 'shareholders'],
    queryFn: () => CompanyService.getCompanyShareholders(ticker),
    enabled: (options.enabled ?? true) && !!ticker && CompanyService.isValidTicker(ticker),
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime ?? 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      if (error instanceof CompanyError && error.statusCode === 404) {
        return false
      }
      if (error instanceof CompanyError && error.statusCode === 400) {
        return false
      }
      return failureCount < 2
    },
  })
}