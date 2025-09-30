import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { WatchlistService } from "@/services/watchlist.service"
import {
  type WatchlistItem,
  type GetPopularStocksResponse,
  type CheckWatchlistResponse,
  type AddToWatchlistRequest,
  type AddToWatchlistResponse,
  type UpdateWatchlistRequest,
  type UpdateWatchlistResponse,
  type DeleteFromWatchlistResponse,
  type DeleteAllWatchlistResponse,
  type GetPopularStocksRequest,
  type WatchlistStats,
  WATCHLIST_QUERY_KEYS,
  WatchlistError,
} from "@/types/watchlist"
import toast from 'react-hot-toast'

/**
 * Hook to fetch user's watchlist
 */
export function useWatchlist(
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    refetchInterval?: number
  } = {}
): UseQueryResult<WatchlistItem[], WatchlistError> {
  return useQuery({
    queryKey: WATCHLIST_QUERY_KEYS.list(),
    queryFn: () => WatchlistService.getWatchlist(),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 2 * 60 * 1000, // 2 minutes
    gcTime: options.cacheTime ?? 15 * 60 * 1000, // 15 minutes
    refetchInterval: options.refetchInterval,
  })
}

/**
 * Hook to fetch watchlist count
 */
export function useWatchlistCount(
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<number, WatchlistError> {
  return useQuery({
    queryKey: WATCHLIST_QUERY_KEYS.count(),
    queryFn: () => WatchlistService.getWatchlistCount(),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to fetch watchlist items with alerts
 */
export function useWatchlistAlerts(
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<WatchlistItem[], WatchlistError> {
  return useQuery({
    queryKey: WATCHLIST_QUERY_KEYS.alerts(),
    queryFn: () => WatchlistService.getAlertsEnabled(),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 1 * 60 * 1000, // 1 minute
    gcTime: options.cacheTime ?? 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch popular stocks
 */
export function usePopularStocks(
  params: GetPopularStocksRequest = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<GetPopularStocksResponse, WatchlistError> {
  return useQuery({
    queryKey: [...WATCHLIST_QUERY_KEYS.popular(), params],
    queryFn: () => WatchlistService.getPopularStocks(params),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 30 * 60 * 1000, // 30 minutes
    gcTime: options.cacheTime ?? 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to check if symbol is in watchlist
 */
export function useCheckWatchlist(
  symbolCode: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<CheckWatchlistResponse, WatchlistError> {
  return useQuery({
    queryKey: WATCHLIST_QUERY_KEYS.check(symbolCode),
    queryFn: () => WatchlistService.checkInWatchlist(symbolCode),
    enabled: (options.enabled ?? true) && !!symbolCode && WatchlistService.isValidSymbolCode(symbolCode),
    staleTime: options.staleTime ?? 1 * 60 * 1000, // 1 minute
    gcTime: options.cacheTime ?? 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to add symbol to watchlist
 */
export function useAddToWatchlist(): UseMutationResult<
  AddToWatchlistResponse,
  WatchlistError,
  AddToWatchlistRequest,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddToWatchlistRequest) => WatchlistService.addToWatchlist(data),
    onSuccess: (response, variables) => {
      // Invalidate and refetch watchlist queries
      queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEYS.all })

      // Show success toast
      toast.success(`Đã thêm ${variables.symbolCode} vào danh sách yêu thích`)
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message || 'Thêm vào danh sách thất bại')
    },
  })
}

/**
 * Hook to update watchlist item
 */
export function useUpdateWatchlist(): UseMutationResult<
  UpdateWatchlistResponse,
  WatchlistError,
  { id: string; data: UpdateWatchlistRequest },
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => WatchlistService.updateWatchlistItem(id, data),
    onSuccess: (response) => {
      // Invalidate and refetch watchlist queries
      queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEYS.all })

      // Show success toast
      toast.success('Cập nhật thông tin thành công')
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message || 'Cập nhật thất bại')
    },
  })
}

/**
 * Hook to remove item from watchlist
 */
export function useRemoveFromWatchlist(): UseMutationResult<
  DeleteFromWatchlistResponse,
  WatchlistError,
  string,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => WatchlistService.removeFromWatchlist(id),
    onSuccess: () => {
      // Invalidate and refetch watchlist queries
      queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEYS.all })

      // Show success toast
      toast.success('Đã xóa khỏi danh sách yêu thích')
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message || 'Xóa thất bại')
    },
  })
}

/**
 * Hook to remove by symbol code
 */
export function useRemoveBySymbol(): UseMutationResult<
  DeleteFromWatchlistResponse,
  WatchlistError,
  string,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (symbolCode: string) => WatchlistService.removeBySymbol(symbolCode),
    onSuccess: (response, symbolCode) => {
      // Invalidate and refetch watchlist queries
      queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEYS.all })

      // Show success toast
      toast.success(`Đã xóa ${symbolCode} khỏi danh sách yêu thích`)
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message || 'Xóa thất bại')
    },
  })
}

/**
 * Hook to clear entire watchlist
 */
export function useClearWatchlist(): UseMutationResult<
  DeleteAllWatchlistResponse,
  WatchlistError,
  void,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => WatchlistService.clearWatchlist(),
    onSuccess: (response) => {
      // Invalidate and refetch watchlist queries
      queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEYS.all })

      // Show success toast
      toast.success(`Đã xóa ${response.deletedCount} mục khỏi danh sách`)
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message || 'Xóa danh sách thất bại')
    },
  })
}

/**
 * Hook to get watchlist statistics
 */
export function useWatchlistStats(): UseQueryResult<WatchlistStats, WatchlistError> {
  const { data: watchlistItems = [] } = useWatchlist()

  return useQuery({
    queryKey: [...WATCHLIST_QUERY_KEYS.stats(), watchlistItems.length],
    queryFn: () => WatchlistService.getWatchlistStats(watchlistItems),
    enabled: watchlistItems.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Combined hook for easy stock favoriting
 */
export function useStockFavorite(symbolCode: string) {
  const { data: checkResult, isLoading: isChecking } = useCheckWatchlist(symbolCode, {
    enabled: !!symbolCode && WatchlistService.isValidSymbolCode(symbolCode),
  })

  const addMutation = useAddToWatchlist()
  const removeMutation = useRemoveBySymbol()

  const isInWatchlist = checkResult?.isInWatchlist ?? false
  const isPending = addMutation.isPending || removeMutation.isPending || isChecking

  const toggle = () => {
    if (isInWatchlist) {
      removeMutation.mutate(symbolCode)
    } else {
      addMutation.mutate({ symbolCode })
    }
  }

  return {
    isInWatchlist,
    isPending,
    toggle,
    watchlistItem: checkResult?.watchlistItem,
  }
}

/**
 * Hook for managing watchlist with localStorage fallback (for offline usage)
 */
export function useWatchlistWithFallback() {
  const [localWatchlist, setLocalWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('watchlist-fallback')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const watchlistQuery = useWatchlist()
  const addMutation = useAddToWatchlist()
  const removeMutation = useRemoveBySymbol()

  // Sync with localStorage
  useEffect(() => {
    if (watchlistQuery.data) {
      const symbols = watchlistQuery.data.map(item => item.symbol.symbol)
      setLocalWatchlist(symbols)
      localStorage.setItem('watchlist-fallback', JSON.stringify(symbols))
    }
  }, [watchlistQuery.data])

  const addToWatchlist = (symbolCode: string) => {
    // Optimistic update for localStorage
    const upperSymbol = symbolCode.toUpperCase()
    if (!localWatchlist.includes(upperSymbol)) {
      const newWatchlist = [...localWatchlist, upperSymbol]
      setLocalWatchlist(newWatchlist)
      localStorage.setItem('watchlist-fallback', JSON.stringify(newWatchlist))
    }

    // API call
    addMutation.mutate({ symbolCode })
  }

  const removeFromWatchlist = (symbolCode: string) => {
    // Optimistic update for localStorage
    const upperSymbol = symbolCode.toUpperCase()
    const newWatchlist = localWatchlist.filter(symbol => symbol !== upperSymbol)
    setLocalWatchlist(newWatchlist)
    localStorage.setItem('watchlist-fallback', JSON.stringify(newWatchlist))

    // API call
    removeMutation.mutate(symbolCode)
  }

  const isInWatchlist = (symbolCode: string): boolean => {
    // Use server data if available, otherwise fallback to localStorage
    if (watchlistQuery.data) {
      return watchlistQuery.data.some(item => item.symbol.symbol === symbolCode.toUpperCase())
    }
    return localWatchlist.includes(symbolCode.toUpperCase())
  }

  return {
    watchlist: watchlistQuery.data || [],
    localWatchlist,
    isLoading: watchlistQuery.isLoading,
    error: watchlistQuery.error,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refetch: watchlistQuery.refetch,
    isAddingPending: addMutation.isPending,
    isRemovingPending: removeMutation.isPending,
  }
}

/**
 * Hook for real-time watchlist updates
 */
export function useRealtimeWatchlist() {
  const [isRealtime, setIsRealtime] = useState(false)
  const watchlistQuery = useWatchlist({
    refetchInterval: isRealtime ? 30000 : undefined, // 30 seconds
    staleTime: isRealtime ? 0 : 2 * 60 * 1000,
  })

  const startRealtime = () => setIsRealtime(true)
  const stopRealtime = () => setIsRealtime(false)
  const toggleRealtime = () => setIsRealtime(prev => !prev)

  return {
    ...watchlistQuery,
    isRealtime,
    startRealtime,
    stopRealtime,
    toggleRealtime,
  }
}

/**
 * Hook for batch operations
 */
export function useBatchWatchlistOperations() {
  const queryClient = useQueryClient()

  const batchAddMutation = useMutation({
    mutationFn: (symbolCodes: string[]) => WatchlistService.batchAddToWatchlist(symbolCodes),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEYS.all })

      if (result.successful.length > 0) {
        toast.success(`Đã thêm ${result.successful.length} cổ phiếu thành công`)
      }

      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} cổ phiếu thêm thất bại`)
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Thao tác batch thất bại')
    },
  })

  return {
    batchAdd: batchAddMutation.mutate,
    isBatchAdding: batchAddMutation.isPending,
  }
}

/**
 * Hook to invalidate watchlist queries
 */
export function useInvalidateWatchlistQueries() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: WATCHLIST_QUERY_KEYS.all
    })
  }

  const invalidateList = () => {
    queryClient.invalidateQueries({
      queryKey: WATCHLIST_QUERY_KEYS.list()
    })
  }

  const invalidateCheck = (symbolCode: string) => {
    queryClient.invalidateQueries({
      queryKey: WATCHLIST_QUERY_KEYS.check(symbolCode)
    })
  }

  const invalidateAlerts = () => {
    queryClient.invalidateQueries({
      queryKey: WATCHLIST_QUERY_KEYS.alerts()
    })
  }

  return {
    invalidateAll,
    invalidateList,
    invalidateCheck,
    invalidateAlerts,
  }
}