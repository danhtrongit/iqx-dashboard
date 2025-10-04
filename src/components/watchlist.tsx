import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Plus, Heart, MoreVertical, Settings, AlertTriangle, RefreshCw } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getAllWatchlist,
  removeFromWatchlistById,
  type WatchlistItem
} from '@/lib/api/watchlist'
import { useFavorites } from '@/hooks/useFavorites'
import { useState } from 'react'
import { AddToWatchlistDialog } from '@/components/add-to-watchlist-dialog'

export default function Watchlist() {
  const queryClient = useQueryClient()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [error, setError] = useState<string | null>(null)

  // Get watchlist data from API
  const {
    data: watchlistItems,
    isLoading,
    error: fetchError,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['watchlist'],
    queryFn: getAllWatchlist,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: (item: WatchlistItem) => removeFromWatchlistById(item.id),
    onSuccess: (_, removedItem) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      console.log('Đã xóa', removedItem.symbol.symbol, 'khỏi danh sách theo dõi')
    },
    onError: (error: any, failedItem) => {
      console.error('Failed to remove from watchlist:', error)
      setError(`Không thể xóa ${failedItem.symbol.symbol} khỏi danh sách theo dõi`)
    }
  })

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const handleToggleFavorite = async (symbol: string) => {
    try {
      await toggleFavorite(symbol)
      setError(null)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      setError('Không thể cập nhật danh sách yêu thích')
    }
  }

  const handleRemoveFromWatchlist = (item: WatchlistItem) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${item.symbol.symbol} khỏi danh sách theo dõi?`)) {
      removeFromWatchlistMutation.mutate(item)
    }
  }

  const handleRefresh = () => {
    refetch()
    setError(null)
  }

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Danh Sách Theo Dõi</CardTitle>
          </div>
          <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (fetchError || error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <CardTitle>Danh Sách Theo Dõi</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Tải lại
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {error || fetchError?.message || 'Không thể tải danh sách theo dõi'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleRefresh}>
                Thử lại
              </Button>
              <AddToWatchlistDialog>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm cổ phiếu
                </Button>
              </AddToWatchlistDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const watchlistCount = watchlistItems?.length || 0

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold">Danh sách theo dõi</CardTitle>
            <span className="text-sm text-muted-foreground">
              {watchlistCount} mã
            </span>
            {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            <AddToWatchlistDialog>
              <Button size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1.5" />
                Thêm
              </Button>
            </AddToWatchlistDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {watchlistCount === 0 ? (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Chưa có cổ phiếu nào</h3>
            <p className="text-muted-foreground mb-4">
              Thêm cổ phiếu vào danh sách theo dõi để bắt đầu
            </p>
            <AddToWatchlistDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm cổ phiếu đầu tiên
              </Button>
            </AddToWatchlistDialog>
          </div>
        ) : (
          <div className="divide-y">
            {watchlistItems?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 hover:bg-muted/30 -mx-6 px-6 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleToggleFavorite(item.symbol.symbol)}
                  >
                    <Heart className={`h-3 w-3 ${
                      isFavorite(item.symbol.symbol) ? 'fill-red-500 text-red-500' : ''
                    }`} />
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm">{item.symbol.symbol}</span>
                      <Badge variant="outline" className="text-xs h-5">
                        {item.symbol.board}
                      </Badge>
                      {item.isAlertEnabled && (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.customName || item.symbol.organShortName || item.symbol.organName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {item.isAlertEnabled && (item.alertPriceHigh || item.alertPriceLow) && (
                    <div className="text-xs space-x-2">
                      {item.alertPriceHigh && (
                        <span className="text-red-600">↑ {formatPrice(item.alertPriceHigh)}</span>
                      )}
                      {item.alertPriceLow && (
                        <span className="text-green-600">↓ {formatPrice(item.alertPriceLow)}</span>
                      )}
                    </div>
                  )}
                  
                  {item.notes && (
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate hidden md:block" title={item.notes}>
                      {item.notes}
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Cài đặt cảnh báo
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Chỉnh sửa ghi chú
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleRemoveFromWatchlist(item)}
                        disabled={removeFromWatchlistMutation.isPending}
                      >
                        {removeFromWatchlistMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Cập nhật: {new Date().toLocaleTimeString('vi-VN')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}