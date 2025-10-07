import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query"
import { NewsService } from "@/services/news-detail.service"
import {
  type NewsArticle,
  type GetNewsListRequest,
  type GetNewsListResponse,
  NEWS_QUERY_KEYS,
  NewsError,
} from "@/types/news"

/**
 * Hook to fetch news article by slug
 */
export function useNewsFromSlug(
  slug: string,
  language: 'vi' | 'en' = 'vi',
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<NewsArticle, NewsError> {
  return useQuery({
    queryKey: [...NEWS_QUERY_KEYS.detail(slug), { language }],
    queryFn: () => NewsService.getNewsFromSlug(slug, language),
    enabled: (options.enabled ?? true) && !!slug && NewsService.isValidSlug(slug),
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (article not found)
      if (error instanceof NewsError && error.statusCode === 404) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
  })
}

/**
 * Hook to fetch news list with pagination
 */
export function useNewsList(
  params: GetNewsListRequest = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
): UseQueryResult<GetNewsListResponse, NewsError> {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.list(params),
    queryFn: () => NewsService.getNewsList(params),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook to search news articles
 */
export function useSearchNews(
  query: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    limit?: number
  } = {}
): UseQueryResult<NewsArticle[], NewsError> {
  return useQuery({
    queryKey: [...NEWS_QUERY_KEYS.all, 'search', query],
    queryFn: () => NewsService.searchNews(query, options.limit),
    enabled: (options.enabled ?? true) && query.trim().length > 0,
    staleTime: options.staleTime ?? 2 * 60 * 1000, // 2 minutes
    gcTime: options.cacheTime ?? 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch news by ticker symbol
 */
export function useNewsByTicker(
  ticker: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    limit?: number
  } = {}
): UseQueryResult<NewsArticle[], NewsError> {
  return useQuery({
    queryKey: NEWS_QUERY_KEYS.byTicker(ticker),
    queryFn: () => NewsService.getNewsByTicker(ticker, options.limit),
    enabled: (options.enabled ?? true) && !!ticker,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook to fetch trending news
 */
export function useTrendingNews(
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    limit?: number
  } = {}
): UseQueryResult<NewsArticle[], NewsError> {
  return useQuery({
    queryKey: [...NEWS_QUERY_KEYS.all, 'trending'],
    queryFn: () => NewsService.getTrendingNews(options.limit),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Hook to fetch latest news
 */
export function useLatestNews(
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    limit?: number
  } = {}
): UseQueryResult<NewsArticle[], NewsError> {
  return useQuery({
    queryKey: [...NEWS_QUERY_KEYS.all, 'latest'],
    queryFn: () => NewsService.getLatestNews(options.limit),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 2 * 60 * 1000, // 2 minutes
    gcTime: options.cacheTime ?? 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch related articles
 */
export function useRelatedNews(
  articleId: string,
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    limit?: number
  } = {}
): UseQueryResult<NewsArticle[], NewsError> {
  return useQuery({
    queryKey: [...NEWS_QUERY_KEYS.all, 'related', articleId],
    queryFn: () => NewsService.getRelatedNews(articleId, options.limit),
    enabled: (options.enabled ?? true) && !!articleId,
    staleTime: options.staleTime ?? 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to prefetch news data
 */
export function usePrefetchNews() {
  const queryClient = useQueryClient()

  const prefetchNewsFromSlug = (slug: string, language: 'vi' | 'en' = 'vi') => {
    if (!slug || !NewsService.isValidSlug(slug)) return

    queryClient.prefetchQuery({
      queryKey: [...NEWS_QUERY_KEYS.detail(slug), { language }],
      queryFn: () => NewsService.getNewsFromSlug(slug, language),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }

  const prefetchNewsByTicker = (ticker: string, limit = 10) => {
    if (!ticker) return

    queryClient.prefetchQuery({
      queryKey: NEWS_QUERY_KEYS.byTicker(ticker),
      queryFn: () => NewsService.getNewsByTicker(ticker, limit),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  const prefetchTrendingNews = (limit = 10) => {
    queryClient.prefetchQuery({
      queryKey: [...NEWS_QUERY_KEYS.all, 'trending'],
      queryFn: () => NewsService.getTrendingNews(limit),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  return {
    prefetchNewsFromSlug,
    prefetchNewsByTicker,
    prefetchTrendingNews,
  }
}

/**
 * Hook to invalidate news queries
 */
export function useInvalidateNewsQueries() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: NEWS_QUERY_KEYS.all
    })
  }

  const invalidateArticle = (slug: string) => {
    queryClient.invalidateQueries({
      queryKey: NEWS_QUERY_KEYS.detail(slug)
    })
  }

  const invalidateByTicker = (ticker: string) => {
    queryClient.invalidateQueries({
      queryKey: NEWS_QUERY_KEYS.byTicker(ticker)
    })
  }

  const invalidateSearch = () => {
    queryClient.invalidateQueries({
      queryKey: [...NEWS_QUERY_KEYS.all, 'search']
    })
  }

  const invalidateList = (params?: GetNewsListRequest) => {
    if (params) {
      queryClient.invalidateQueries({
        queryKey: NEWS_QUERY_KEYS.list(params)
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: NEWS_QUERY_KEYS.lists()
      })
    }
  }

  const invalidateTrending = () => {
    queryClient.invalidateQueries({
      queryKey: [...NEWS_QUERY_KEYS.all, 'trending']
    })
  }

  const invalidateLatest = () => {
    queryClient.invalidateQueries({
      queryKey: [...NEWS_QUERY_KEYS.all, 'latest']
    })
  }

  return {
    invalidateAll,
    invalidateArticle,
    invalidateByTicker,
    invalidateSearch,
    invalidateList,
    invalidateTrending,
    invalidateLatest,
  }
}

/**
 * Hook for infinite scrolling news list
 */
export function useInfiniteNewsList(
  params: Omit<GetNewsListRequest, 'page'> = {},
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
) {
  return useQuery({
    queryKey: [...NEWS_QUERY_KEYS.lists(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      NewsService.getNewsList({ ...params, page: pageParam }),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 15 * 60 * 1000, // 15 minutes
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined
    },
  })
}

/**
 * Custom hook for reading progress tracking
 */
export function useReadingProgress(articleId: string, slug: string) {
  const [progress, setProgress] = useState({
    progressPercentage: 0,
    timeSpent: 0,
    completed: false,
  })

  useEffect(() => {
    if (!articleId || !slug) return

    const startTime = Date.now()
    let timeSpent = 0

    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progressPercentage = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100))

      timeSpent = Math.floor((Date.now() - startTime) / 1000)

      const newProgress = {
        progressPercentage,
        timeSpent,
        completed: progressPercentage >= 90,
      }

      setProgress(newProgress)

      // Save to localStorage for persistence
      try {
        localStorage.setItem(
          `reading-progress-${articleId}`,
          JSON.stringify({
            ...newProgress,
            articleId,
            slug,
            lastReadAt: new Date().toISOString(),
          })
        )
      } catch (error) {
      }
    }

    // Load existing progress
    try {
      const saved = localStorage.getItem(`reading-progress-${articleId}`)
      if (saved) {
        const savedProgress = JSON.parse(saved)
        setProgress({
          progressPercentage: savedProgress.progressPercentage,
          timeSpent: savedProgress.timeSpent,
          completed: savedProgress.completed,
        })
      }
    } catch (error) {
    }

    // Add scroll event listener
    const handleScroll = throttle(updateProgress, 1000) // Throttle to once per second
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      updateProgress() // Final update on unmount
    }
  }, [articleId, slug])

  return progress
}

// Utility function to throttle function calls
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>
  let lastExecTime = 0

  return ((...args: Parameters<T>) => {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }) as T
}

// Import useState and useEffect for the reading progress hook
import { useState, useEffect } from "react"