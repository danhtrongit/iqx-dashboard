import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVirtualPortfolio } from '@/hooks/use-virtual-trading'
import { VirtualTradingService } from '@/services/virtual-trading.service'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function HoldingsList() {
  const { data: portfolio, isLoading } = useVirtualPortfolio()
  const [sortBy, setSortBy] = useState<'value' | 'profit' | 'percentage'>('value')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const holdings = portfolio?.holdings || []

  const sortedHoldings = [...holdings].sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return b.currentValue - a.currentValue
      case 'profit':
        return b.unrealizedProfitLoss - a.unrealizedProfitLoss
      case 'percentage':
        return (
          VirtualTradingService.parsePercentage(b.profitLossPercentage) -
          VirtualTradingService.parsePercentage(a.profitLossPercentage)
        )
      default:
        return 0
    }
  })

  // Pagination
  const totalPages = Math.ceil(sortedHoldings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedHoldings = sortedHoldings.slice(startIndex, endIndex)

  // Reset to page 1 when sort changes
  const handleSortChange = (newSort: 'value' | 'profit' | 'percentage') => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Danh mục đầu tư</CardTitle>
          <CardDescription>Cổ phiếu đang nắm giữ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex-1">
                  <div className="h-5 w-20 bg-muted rounded mb-2" />
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>
                <div className="h-6 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (holdings.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Danh mục đầu tư</CardTitle>
          <CardDescription>Cổ phiếu đang nắm giữ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Bạn chưa có cổ phiếu nào trong danh mục</p>
            <p className="text-sm mt-2">Hãy bắt đầu giao dịch để xây dựng danh mục đầu tư của bạn</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Danh mục đầu tư</CardTitle>
            <CardDescription className="text-sm">{holdings.length} mã cổ phiếu</CardDescription>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button
              variant={sortBy === 'value' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('value')}
              className="text-xs h-8 px-2 sm:px-3"
            >
              Giá trị
            </Button>
            <Button
              variant={sortBy === 'profit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('profit')}
              className="text-xs h-8 px-2 sm:px-3"
            >
              Lợi nhuận
            </Button>
            <Button
              variant={sortBy === 'percentage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('percentage')}
              className="text-xs h-8 px-2 sm:px-3"
            >
              %
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">Mã CK</TableHead>
              <TableHead className="text-right min-w-[80px]">Số lượng</TableHead>
              <TableHead className="text-right min-w-[100px]">Giá vốn</TableHead>
              <TableHead className="text-right min-w-[100px]">Giá TT</TableHead>
              <TableHead className="text-right min-w-[100px]">Giá trị</TableHead>
              <TableHead className="text-right min-w-[120px]">Lãi/Lỗ dự kiến</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedHoldings.map((holding) => {
              const profitLossPercentage = VirtualTradingService.parsePercentage(
                holding.profitLossPercentage
              )
              const isPositive = holding.unrealizedProfitLoss >= 0

              // Calculate price change from yesterday
              const priceChange = holding.currentPrice - (holding.yesterdayPrice || holding.currentPrice)
              const priceChangePercentage = holding.yesterdayPrice 
                ? ((priceChange / holding.yesterdayPrice) * 100)
                : 0
              const isPricePositive = priceChange >= 0

              return (
                <TableRow key={holding.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{holding.symbolCode}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {holding.symbolName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {holding.quantity.toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(holding.averagePrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                          'text-base font-medium',
                          isPricePositive ? 'text-green-600' : 'text-red-600',
                          priceChange === 0 && 'text-yellow-600'
                        )}>
                        {formatCurrency(holding.currentPrice)}
                      </span>
                      {holding.yesterdayPrice && (
                        <span className={cn(
                          'text-xs font-medium',
                          isPricePositive ? 'text-green-600' : 'text-red-600',
                          priceChange === 0 && 'text-yellow-600'
                        )}>
                          {isPricePositive && priceChange !== 0 ? '+' : ''}
                          {priceChangePercentage.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(holding.currentValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={cn(
                      'flex items-center gap-1 justify-end font-medium',
                      isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <div className="flex flex-col items-end">
                        <span>
                          {isPositive ? '+' : ''}
                          {formatCurrency(holding.unrealizedProfitLoss)}
                        </span>
                        <span className="text-xs">
                          ({isPositive ? '+' : ''}
                          {profitLossPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, sortedHoldings.length)} trong số {sortedHoldings.length} mã
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Trước</span>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8"
              >
                <span className="hidden sm:inline">Sau</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
