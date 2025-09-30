import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query"
import { SymbolService } from "@/services/symbol.service"
import {
  type GetSymbolsRequest,
  type GetSymbolsResponse,
  type GetAllSymbolsResponse,
  type GetSymbolResponse,
  type GetSymbolCountResponse,
  type SyncSymbolsResponse,
  type SymbolSearchResponse,
  type SymbolWithPrice,
  type SymbolSearchResult,
  SYMBOL_QUERY_KEYS,
  SymbolError,
} from "@/types/symbol"

/**
 * Hook to fetch symbols with pagination
 */
export function useSymbols(
  params: GetSymbolsRequest = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<GetSymbolsResponse, SymbolError> {
  return useQuery({
    queryKey: SYMBOL_QUERY_KEYS.list(params),
    queryFn: () => SymbolService.getSymbols(params),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch all symbols without pagination
 */
export function useAllSymbols(
  params: Omit<GetSymbolsRequest, 'page' | 'limit'> = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<GetAllSymbolsResponse, SymbolError> {
  return useQuery({
    queryKey: [...SYMBOL_QUERY_KEYS.all, 'all', params],
    queryFn: () => SymbolService.getAllSymbols(params),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 30 * 60 * 1000, // 30 minutes
    gcTime: options.cacheTime ?? 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to search symbols
 */
export function useSearchSymbols(
  query: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    limit?: number
  } = {}
): UseQueryResult<SymbolSearchResult[], SymbolError> {
  return useQuery({
    queryKey: SYMBOL_QUERY_KEYS.search(query),
    queryFn: async () => {
      const response = await SymbolService.quickSearch(query, options.limit)
      return response.data
    },
    enabled: (options.enabled ?? true) && query.trim().length > 0,
    staleTime: options.staleTime ?? 30 * 1000, // 30 seconds
    gcTime: options.cacheTime ?? 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a specific symbol by code
 */
export function useSymbol(
  symbolCode: string,
  includePrices = false,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<SymbolWithPrice, SymbolError> {
  return useQuery({
    queryKey: [...SYMBOL_QUERY_KEYS.detail(symbolCode), { includePrices }],
    queryFn: async () => {
      const response = await SymbolService.getSymbol(symbolCode, includePrices)
      return response.data
    },
    enabled: (options.enabled ?? true) && !!symbolCode,
    staleTime: options.staleTime ?? (includePrices ? 1 * 60 * 1000 : 10 * 60 * 1000), // 1 min with prices, 10 min without
    gcTime: options.cacheTime ?? 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook to fetch symbol count
 */
export function useSymbolCount(
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<number, SymbolError> {
  return useQuery({
    queryKey: SYMBOL_QUERY_KEYS.count(),
    queryFn: async () => {
      const response = await SymbolService.getSymbolCount()
      return response.count
    },
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 60 * 60 * 1000, // 1 hour
    gcTime: options.cacheTime ?? 2 * 60 * 60 * 1000, // 2 hours
  })
}

/**
 * Hook to check if a symbol exists
 */
export function useSymbolExists(
  symbolCode: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<boolean, SymbolError> {
  return useQuery({
    queryKey: [...SYMBOL_QUERY_KEYS.detail(symbolCode), 'exists'],
    queryFn: () => SymbolService.symbolExists(symbolCode),
    enabled: (options.enabled ?? true) && !!symbolCode,
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to sync symbols data (requires authentication)
 */
export function useSyncSymbols(): UseMutationResult<
  SyncSymbolsResponse,
  SymbolError,
  void,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => SymbolService.syncSymbols(),
    onSuccess: () => {
      // Invalidate all symbol queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: SYMBOL_QUERY_KEYS.all
      })
    },
  })
}

/**
 * Helper hook for infinite scrolling of symbols
 */
export function useInfiniteSymbols(
  params: Omit<GetSymbolsRequest, 'page'> = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
) {
  return useQuery({
    queryKey: [...SYMBOL_QUERY_KEYS.lists(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      SymbolService.getSymbols({ ...params, page: pageParam }),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 10 * 60 * 1000, // 10 minutes
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined
    },
  })
}

/**
 * Hook to prefetch symbol data
 */
export function usePrefetchSymbol() {
  const queryClient = useQueryClient()

  const prefetchSymbol = (symbolCode: string, includePrices = false) => {
    queryClient.prefetchQuery({
      queryKey: [...SYMBOL_QUERY_KEYS.detail(symbolCode), { includePrices }],
      queryFn: async () => {
        const response = await SymbolService.getSymbol(symbolCode, includePrices)
        return response.data
      },
      staleTime: includePrices ? 1 * 60 * 1000 : 10 * 60 * 1000,
    })
  }

  const prefetchSymbolSearch = (query: string, limit = 10) => {
    if (!query.trim()) return

    queryClient.prefetchQuery({
      queryKey: SYMBOL_QUERY_KEYS.search(query),
      queryFn: async () => {
        const response = await SymbolService.quickSearch(query, limit)
        return response.data
      },
      staleTime: 30 * 1000, // 30 seconds
    })
  }

  return {
    prefetchSymbol,
    prefetchSymbolSearch,
  }
}

/**
 * Utility hook to invalidate symbol queries
 */
export function useInvalidateSymbolQueries() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: SYMBOL_QUERY_KEYS.all
    })
  }

  const invalidateSymbol = (symbolCode: string) => {
    queryClient.invalidateQueries({
      queryKey: SYMBOL_QUERY_KEYS.detail(symbolCode)
    })
  }

  const invalidateSearch = (query?: string) => {
    if (query) {
      queryClient.invalidateQueries({
        queryKey: SYMBOL_QUERY_KEYS.search(query)
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: [...SYMBOL_QUERY_KEYS.all, 'search']
      })
    }
  }

  const invalidateList = (params?: GetSymbolsRequest) => {
    if (params) {
      queryClient.invalidateQueries({
        queryKey: SYMBOL_QUERY_KEYS.list(params)
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: SYMBOL_QUERY_KEYS.lists()
      })
    }
  }

  return {
    invalidateAll,
    invalidateSymbol,
    invalidateSearch,
    invalidateList,
  }
}