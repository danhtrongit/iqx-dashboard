import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllWatchlist,
  addToWatchlist,
  removeFromWatchlistBySymbol,
  checkIsInWatchlist,
  type WatchlistItem,
  type AddWatchlistRequest
} from '@/lib/api/watchlist'

interface UseFavoritesOptions {
  enabled?: boolean
}

// Legacy aliases for backward compatibility
export type Favorite = WatchlistItem
export type AddFavoriteRequest = { symbol: string; notes?: string }

export function useFavorites(options: UseFavoritesOptions = {}) {
  const queryClient = useQueryClient()
  const { enabled = true } = options

  // Get all favorites (watchlist items)
  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: getAllWatchlist,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: (data: AddFavoriteRequest) => {
      // Convert legacy format to new format
      const requestData: AddWatchlistRequest = {
        symbolCode: data.symbol,
        notes: data.notes
      }
      return addToWatchlist(requestData)
    },
    onSuccess: (newFavorite) => {
      // Optimistically update the favorites list
      queryClient.setQueryData<WatchlistItem[]>(['favorites'], (old = []) => [...old, newFavorite])
      // Invalidate favorite check queries for this symbol
      queryClient.invalidateQueries({ queryKey: ['favorite-check', newFavorite.symbol.symbol] })
    },
    onError: (error) => {
      console.error('Failed to add favorite:', error)
    }
  })

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (symbol: string) => removeFromWatchlistBySymbol(symbol),
    onSuccess: (_, symbol) => {
      // Optimistically remove from favorites list
      queryClient.setQueryData<WatchlistItem[]>(['favorites'], (old = []) =>
        old?.filter(fav => fav.symbol.symbol !== symbol) || []
      )
      // Invalidate favorite check queries for this symbol
      queryClient.invalidateQueries({ queryKey: ['favorite-check', symbol] })
    },
    onError: (error) => {
      console.error('Failed to remove favorite:', error)
    }
  })

  // Helper functions
  const addFavorite = useCallback(async (symbol: string, notes?: string) => {
    return addFavoriteMutation.mutateAsync({ symbol, notes })
  }, [addFavoriteMutation])

  const removeFavorite = useCallback(async (symbol: string) => {
    return removeFavoriteMutation.mutateAsync(symbol)
  }, [removeFavoriteMutation])

  const isFavorite = useCallback((symbol: string) => {
    return favorites?.some(fav => fav.symbol.symbol === symbol) ?? false
  }, [favorites])

  const toggleFavorite = useCallback(async (symbol: string) => {
    if (isFavorite(symbol)) {
      await removeFavorite(symbol)
    } else {
      await addFavorite(symbol)
    }
  }, [isFavorite, addFavorite, removeFavorite])

  return {
    favorites: favorites ?? [],
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    isAdding: addFavoriteMutation.isPending,
    isRemoving: removeFavoriteMutation.isPending,
  }
}

// Individual hook for checking favorite status (useful for single symbols)
export function useFavoriteStatus(symbol: string, options: UseFavoritesOptions = {}) {
  const { enabled = true } = options

  const { data, isLoading } = useQuery({
    queryKey: ['favorite-check', symbol],
    queryFn: () => checkIsInWatchlist(symbol),
    enabled: enabled && !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    isFavorite: data?.isInWatchlist ?? false,
    isLoading,
  }
}

// Hook for managing a specific stock's favorite status
export function useStockFavorite(symbol: string) {
  const queryClient = useQueryClient()
  const [isOptimistic, setIsOptimistic] = useState<boolean | null>(null)

  // Get favorite status
  const { isFavorite: actualIsFavorite, isLoading } = useFavoriteStatus(symbol)

  // Use optimistic state if available, otherwise use actual state
  const isFavorite = isOptimistic !== null ? isOptimistic : actualIsFavorite

  // Add to favorites
  const addMutation = useMutation({
    mutationFn: () => addToWatchlist({ symbolCode: symbol }),
    onMutate: () => {
      // Optimistic update
      setIsOptimistic(true)
    },
    onSuccess: () => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-check', symbol] })
      setIsOptimistic(null)
    },
    onError: () => {
      // Revert optimistic update
      setIsOptimistic(null)
    }
  })

  // Remove from favorites
  const removeMutation = useMutation({
    mutationFn: () => removeFromWatchlistBySymbol(symbol),
    onMutate: () => {
      // Optimistic update
      setIsOptimistic(false)
    },
    onSuccess: () => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-check', symbol] })
      setIsOptimistic(null)
    },
    onError: () => {
      // Revert optimistic update
      setIsOptimistic(null)
    }
  })

  const toggle = useCallback(() => {
    if (isFavorite) {
      removeMutation.mutate()
    } else {
      addMutation.mutate()
    }
  }, [isFavorite, addMutation, removeMutation])

  return {
    isFavorite,
    isLoading: isLoading && isOptimistic === null,
    isPending: addMutation.isPending || removeMutation.isPending,
    toggle,
    addToFavorites: () => addMutation.mutate(),
    removeFromFavorites: () => removeMutation.mutate(),
  }
}