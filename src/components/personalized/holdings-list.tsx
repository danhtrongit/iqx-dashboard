import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVirtualPortfolio } from '@/hooks/use-virtual-trading'
import { VirtualTradingService } from '@/services/virtual-trading.service'
import { useState } from 'react'
import type { VirtualHolding } from '@/types/virtual-trading'

interface HoldingsListProps {
  onTrade?: (symbolCode: string, mode: 'BUY' | 'SELL') => void
}

export function HoldingsList({ onTrade }: HoldingsListProps) {
  const { data: portfolio, isLoading } = useVirtualPortfolio()
  const [sortBy, setSortBy] = useState<'value' | 'profit' | 'percentage'>('value')

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

  if (isLoading) {
    return (
      <Card>
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
      <Card>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Danh mục đầu tư</CardTitle>
            <CardDescription>{holdings.length} mã cổ phiếu đang nắm giữ</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'value' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('value')}
            >
              Giá trị
            </Button>
            <Button
              variant={sortBy === 'profit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('profit')}
            >
              Lợi nhuận
            </Button>
            <Button
              variant={sortBy === 'percentage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('percentage')}
            >
              %
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedHoldings.map((holding) => {
            const profitLossPercentage = VirtualTradingService.parsePercentage(
              holding.profitLossPercentage
            )
            const isPositive = holding.unrealizedProfitLoss >= 0

            return (
              <div
                key={holding.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{holding.symbolCode}</h4>
                    <span className="text-sm text-muted-foreground truncate">
                      {holding.symbolName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      SL: {holding.quantity.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-muted-foreground">
                      TB: {formatCurrency(holding.averagePrice)}
                    </span>
                    <span className="font-medium">
                      Hiện: {formatCurrency(holding.currentPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatCurrency(holding.currentValue)}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isPositive ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {isPositive ? '+' : ''}
                        {formatCurrency(holding.unrealizedProfitLoss)}
                      </span>
                      <span
                        className={cn(
                          'text-sm',
                          isPositive ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        ({isPositive ? '+' : ''}
                        {profitLossPercentage.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  {onTrade && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => onTrade(holding.symbolCode, 'BUY')}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onTrade(holding.symbolCode, 'SELL')}
                      >
                        <ArrowDownRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
