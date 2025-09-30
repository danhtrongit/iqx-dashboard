import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Newspaper } from 'lucide-react'
import { useWatchlist } from '@/hooks/use-watchlist'
import { useVirtualPortfolio } from '@/hooks/use-virtual-trading'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { getIqxNewsInfo } from '@/services/iqx-news.service'
import type { IqxNewsItem } from '@/lib/schemas/news'

export function StockNews() {
  const { data: watchlist = [] } = useWatchlist()
  const { data: portfolio } = useVirtualPortfolio()

  // Get all unique symbols from watchlist and holdings
  const symbolsList = useMemo(() => {
    const watchlistSymbols = watchlist.map(item => item.symbol.symbol)
    const holdingSymbols = portfolio?.holdings.map(holding => holding.symbolCode) || []
    return [...new Set([...watchlistSymbols, ...holdingSymbols])]
  }, [watchlist, portfolio])

  // Fetch news for all symbols in parallel
  const { data: allNews = [], isLoading } = useQuery({
    queryKey: ['stock-news', symbolsList],
    queryFn: async () => {
      if (symbolsList.length === 0) return []

      // Fetch news for each symbol in parallel
      const newsPromises = symbolsList.map(symbol =>
        getIqxNewsInfo({
          ticker: symbol,
          page_size: 5,
        }).catch(() => ({ news_info: [], total_records: 0, name: '' }))
      )

      const results = await Promise.all(newsPromises)

      // Combine all news and sort by date
      const allNewsItems: IqxNewsItem[] = []
      results.forEach(result => {
        if (result.news_info) {
          allNewsItems.push(...result.news_info)
        }
      })

      // Remove duplicates by id and sort by date
      const uniqueNews = Array.from(
        new Map(allNewsItems.map(item => [item.id, item])).values()
      )

      return uniqueNews.sort((a, b) =>
        new Date(b.update_date).getTime() - new Date(a.update_date).getTime()
      ).slice(0, 20)
    },
    enabled: symbolsList.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'neutral':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'Tích cực'
      case 'negative':
        return 'Tiêu cực'
      case 'neutral':
        return 'Trung lập'
      default:
        return sentiment
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Tin tức liên quan
          </CardTitle>
          <CardDescription>
            Tin tức về các cổ phiếu đang theo dõi và nắm giữ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-lg animate-pulse">
                <div className="h-20 w-32 bg-muted rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!symbolsList || symbolsList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Tin tức liên quan
          </CardTitle>
          <CardDescription>
            Tin tức về các cổ phiếu đang theo dõi và nắm giữ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Chưa có cổ phiếu nào trong danh sách theo dõi hoặc danh mục</p>
            <p className="text-sm mt-2">
              Hãy thêm cổ phiếu vào danh sách theo dõi hoặc bắt đầu giao dịch
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (allNews.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Tin tức liên quan
          </CardTitle>
          <CardDescription>
            Tin tức về các cổ phiếu đang theo dõi và nắm giữ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Chưa có tin tức mới cho các cổ phiếu này</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Tin tức liên quan
        </CardTitle>
        <CardDescription>
          {allNews.length} tin tức về các cổ phiếu đang theo dõi và nắm giữ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allNews.map((item: IqxNewsItem) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors group"
            >
              {item.news_image_url && (
                <div className="flex-shrink-0">
                  <img
                    src={item.news_image_url}
                    alt={item.news_title}
                    className="h-20 w-32 object-cover rounded"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <Badge variant="outline" className="flex-shrink-0">
                    {item.ticker}
                  </Badge>
                  <Badge className={cn('flex-shrink-0', getSentimentColor(item.sentiment))}>
                    {getSentimentLabel(item.sentiment)}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                    {formatDate(item.update_date)}
                  </span>
                </div>
                <h4 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {item.news_title}
                </h4>
                {item.news_short_content && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {item.news_short_content}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {item.news_from_name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    asChild
                  >
                    <a
                      href={item.news_source_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Xem chi tiết <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}