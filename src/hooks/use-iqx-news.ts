import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { getIqxNewsInfo } from "@/services/iqx-news.service"
import type { IqxNewsInfoRequest, IqxNewsResponse } from "@/lib/schemas/news"

// Query keys for IQX news info
export const IQX_NEWS_QUERY_KEYS = {
  all: ['iqx-news'] as const,
  info: () => [...IQX_NEWS_QUERY_KEYS.all, 'info'] as const,
  infoWithParams: (params: Partial<IqxNewsInfoRequest>) => [...IQX_NEWS_QUERY_KEYS.info(), params] as const,
} as const

/**
 * Hook to fetch IQX news info with filtering and pagination
 */
export function useIqxNewsInfo(
  params: Partial<IqxNewsInfoRequest> = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<IqxNewsResponse, Error> {
  return useQuery({
    queryKey: IQX_NEWS_QUERY_KEYS.infoWithParams(params),
    queryFn: () => getIqxNewsInfo(params),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error && 'status' in error && typeof error.status === 'number') {
        if (error.status >= 400 && error.status < 500) {
          return false
        }
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
  })
}

/**
 * Hook to fetch IQX news info for a specific ticker
 */
export function useIqxNewsInfoByTicker(
  ticker: string,
  additionalParams: Omit<Partial<IqxNewsInfoRequest>, 'ticker'> = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<IqxNewsResponse, Error> {
  return useIqxNewsInfo(
    { ticker, ...additionalParams },
    {
      ...options,
      enabled: (options.enabled ?? true) && !!ticker,
    }
  )
}

/**
 * Hook to fetch IQX news info with pagination
 */
export function useIqxNewsInfoPaginated(
  page: number,
  pageSize: number = 12,
  additionalParams: Omit<Partial<IqxNewsInfoRequest>, 'page' | 'page_size'> = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<IqxNewsResponse, Error> {
  return useIqxNewsInfo(
    { page, page_size: pageSize, ...additionalParams },
    {
      ...options,
      enabled: (options.enabled ?? true) && page > 0,
    }
  )
}