import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult
} from "@tanstack/react-query"
import { VirtualTradingService } from "@/services/virtual-trading.service"
import {
  type CreatePortfolioResponse,
  type GetPortfolioResponse,
  type BuyStockRequest,
  type BuyStockResponse,
  type SellStockRequest,
  type SellStockResponse,
  type GetTransactionsRequest,
  type GetTransactionsResponse,
  type GetPriceResponse,
  type GetLeaderboardRequest,
  type GetLeaderboardResponse,
  type VirtualPortfolio,
  type VirtualTransaction,
  type StockPrice,
  type LeaderboardEntry,
  VIRTUAL_TRADING_QUERY_KEYS,
  VirtualTradingError,
} from "@/types/virtual-trading"
import toast from 'react-hot-toast'

/**
 * Hook to get virtual trading portfolio
 */
export function useVirtualPortfolio(
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    refetchInterval?: number | false
  } = {}
): UseQueryResult<VirtualPortfolio, VirtualTradingError> {
  return useQuery({
    queryKey: VIRTUAL_TRADING_QUERY_KEYS.portfolio(),
    queryFn: async () => {
      const response = await VirtualTradingService.getPortfolio()
      return response.data
    },
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 30 * 1000, // 30 seconds
    gcTime: options.cacheTime ?? 5 * 60 * 1000, // 5 minutes
    refetchInterval: options.refetchInterval ?? 30 * 1000, // Auto refresh every 30 seconds
    retry: (failureCount, error) => {
      // Don't retry if portfolio doesn't exist (404)
      if (error instanceof VirtualTradingError && error.statusCode === 404) {
        return false
      }
      return failureCount < 3
    },
  })
}

/**
 * Hook to get stock price in real-time
 */
export function useStockPrice(
  symbol: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    refetchInterval?: number | false
  } = {}
): UseQueryResult<StockPrice, VirtualTradingError> {
  return useQuery({
    queryKey: VIRTUAL_TRADING_QUERY_KEYS.price(symbol),
    queryFn: async () => {
      const response = await VirtualTradingService.getStockPrice(symbol)
      return response.data
    },
    enabled: (options.enabled ?? true) && !!symbol,
    staleTime: options.staleTime ?? 15 * 1000, // 15 seconds
    gcTime: options.cacheTime ?? 2 * 60 * 1000, // 2 minutes
    refetchInterval: options.refetchInterval ?? 30 * 1000, // Auto refresh every 30 seconds
    retry: (failureCount, error) => {
      // Don't retry too many times for invalid symbols
      if (error instanceof VirtualTradingError && error.statusCode === 404) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to get transaction history with pagination
 */
export function useTransactionHistory(
  params: GetTransactionsRequest = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<GetTransactionsResponse, VirtualTradingError> {
  return useQuery({
    queryKey: VIRTUAL_TRADING_QUERY_KEYS.transactionsList(params),
    queryFn: () => VirtualTradingService.getTransactions(params),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 1 * 60 * 1000, // 1 minute
    gcTime: options.cacheTime ?? 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to get leaderboard rankings
 */
export function useLeaderboard(
  params: GetLeaderboardRequest = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    refetchInterval?: number | false
  } = {}
): UseQueryResult<LeaderboardEntry[], VirtualTradingError> {
  return useQuery({
    queryKey: VIRTUAL_TRADING_QUERY_KEYS.leaderboardList(params),
    queryFn: async () => {
      const response = await VirtualTradingService.getLeaderboard(params)
      return response.data
    },
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 15 * 60 * 1000, // 15 minutes
    refetchInterval: options.refetchInterval ?? 2 * 60 * 1000, // Auto refresh every 2 minutes
  })
}

/**
 * Hook to create virtual trading portfolio
 */
export function useCreatePortfolio(): UseMutationResult<
  CreatePortfolioResponse,
  VirtualTradingError,
  void,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => VirtualTradingService.createPortfolio(),
    onSuccess: (data) => {
      // Update portfolio query cache
      queryClient.invalidateQueries({
        queryKey: VIRTUAL_TRADING_QUERY_KEYS.portfolio()
      })

      toast.success(`Tạo portfolio thành công! Bạn đã nhận được ${VirtualTradingService.formatCurrency(data.data.cashBalance)} để bắt đầu đầu tư`)
    },
    onError: (error: VirtualTradingError) => {
      toast.error(`Tạo portfolio thất bại: ${error.message}`)
    },
  })
}

/**
 * Hook to buy stock
 */
export function useBuyStock(): UseMutationResult<
  BuyStockResponse,
  VirtualTradingError,
  BuyStockRequest,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: BuyStockRequest) => VirtualTradingService.buyStock(request),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: VIRTUAL_TRADING_QUERY_KEYS.portfolio()
      })
      queryClient.invalidateQueries({
        queryKey: VIRTUAL_TRADING_QUERY_KEYS.transactions()
      })

      toast.success(`Mua cổ phiếu thành công! Đã mua ${data.quantity} cổ phiếu ${data.symbolCode} với giá ${VirtualTradingService.formatCurrency(data.pricePerShare)}/cp`)
    },
    onError: (error: VirtualTradingError, variables) => {
      toast.error(`Mua cổ phiếu thất bại: ${error.message}`)
    },
  })
}

/**
 * Hook to sell stock
 */
export function useSellStock(): UseMutationResult<
  SellStockResponse,
  VirtualTradingError,
  SellStockRequest,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: SellStockRequest) => VirtualTradingService.sellStock(request),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: VIRTUAL_TRADING_QUERY_KEYS.portfolio()
      })
      queryClient.invalidateQueries({
        queryKey: VIRTUAL_TRADING_QUERY_KEYS.transactions()
      })

      toast.success(`Bán cổ phiếu thành công! Đã bán ${data.quantity} cổ phiếu ${data.symbolCode} với giá ${VirtualTradingService.formatCurrency(data.pricePerShare)}/cp`)
    },
    onError: (error: VirtualTradingError, variables) => {
      toast.error(`Bán cổ phiếu thất bại: ${error.message}`)
    },
  })
}

/**
 * Hook to prefetch portfolio data
 */
export function usePrefetchVirtualTrading() {
  const queryClient = useQueryClient()

  const prefetchPortfolio = () => {
    queryClient.prefetchQuery({
      queryKey: VIRTUAL_TRADING_QUERY_KEYS.portfolio(),
      queryFn: async () => {
        const response = await VirtualTradingService.getPortfolio()
        return response.data
      },
      staleTime: 30 * 1000,
    })
  }

  const prefetchStockPrice = (symbol: string) => {
    if (!symbol) return

    queryClient.prefetchQuery({
      queryKey: VIRTUAL_TRADING_QUERY_KEYS.price(symbol),
      queryFn: async () => {
        const response = await VirtualTradingService.getStockPrice(symbol)
        return response.data
      },
      staleTime: 15 * 1000,
    })
  }

  const prefetchTransactions = (params: GetTransactionsRequest = {}) => {
    queryClient.prefetchQuery({
      queryKey: VIRTUAL_TRADING_QUERY_KEYS.transactionsList(params),
      queryFn: () => VirtualTradingService.getTransactions(params),
      staleTime: 1 * 60 * 1000,
    })
  }

  const prefetchLeaderboard = (params: GetLeaderboardRequest = {}) => {
    queryClient.prefetchQuery({
      queryKey: VIRTUAL_TRADING_QUERY_KEYS.leaderboardList(params),
      queryFn: async () => {
        const response = await VirtualTradingService.getLeaderboard(params)
        return response.data
      },
      staleTime: 5 * 60 * 1000,
    })
  }

  return {
    prefetchPortfolio,
    prefetchStockPrice,
    prefetchTransactions,
    prefetchLeaderboard,
  }
}

/**
 * Hook to invalidate virtual trading queries
 */
export function useInvalidateVirtualTradingQueries() {
  const queryClient = useQueryClient()

  const invalidatePortfolio = () => {
    queryClient.invalidateQueries({
      queryKey: VIRTUAL_TRADING_QUERY_KEYS.portfolio()
    })
  }

  const invalidateStockPrice = (symbol?: string) => {
    if (symbol) {
      queryClient.invalidateQueries({
        queryKey: VIRTUAL_TRADING_QUERY_KEYS.price(symbol)
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: [...VIRTUAL_TRADING_QUERY_KEYS.all, 'price']
      })
    }
  }

  const invalidateTransactions = (params?: GetTransactionsRequest) => {
    if (params) {
      queryClient.invalidateQueries({
        queryKey: VIRTUAL_TRADING_QUERY_KEYS.transactionsList(params)
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: VIRTUAL_TRADING_QUERY_KEYS.transactions()
      })
    }
  }

  const invalidateLeaderboard = (params?: GetLeaderboardRequest) => {
    if (params) {
      queryClient.invalidateQueries({
        queryKey: VIRTUAL_TRADING_QUERY_KEYS.leaderboardList(params)
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: VIRTUAL_TRADING_QUERY_KEYS.leaderboard()
      })
    }
  }

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: VIRTUAL_TRADING_QUERY_KEYS.all
    })
  }

  return {
    invalidatePortfolio,
    invalidateStockPrice,
    invalidateTransactions,
    invalidateLeaderboard,
    invalidateAll,
  }
}

/**
 * Combined hook for getting portfolio and calculating trading capacity
 */
export function useTradingCapacity(symbolCode?: string) {
  const { data: portfolio, ...portfolioQuery } = useVirtualPortfolio()
  const { data: stockPrice, ...priceQuery } = useStockPrice(symbolCode || '', {
    enabled: !!symbolCode,
  })

  const tradingCapacity = symbolCode && portfolio && stockPrice ? {
    maxBuyQuantity: VirtualTradingService.getMaxPurchaseQuantity(
      portfolio.cashBalance || 0,
      stockPrice.currentPrice || 0
    ),
    maxSellQuantity: portfolio.holdings.find(h => h.symbolCode === symbolCode)?.quantity || 0,
    canBuy: (portfolio.cashBalance || 0) > 0 && (stockPrice.currentPrice || 0) > 0,
    canSell: (portfolio.holdings.find(h => h.symbolCode === symbolCode)?.quantity || 0) > 0,
  } : {
    maxBuyQuantity: 0,
    maxSellQuantity: 0,
    canBuy: false,
    canSell: false,
  }

  return {
    portfolio,
    stockPrice,
    tradingCapacity,
    isLoading: portfolioQuery.isLoading || priceQuery.isLoading,
    isError: portfolioQuery.isError || priceQuery.isError,
    error: portfolioQuery.error || priceQuery.error,
  }
}