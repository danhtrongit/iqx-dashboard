import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useVirtualPortfolio } from '@/hooks/use-virtual-trading'
import { useMemo } from 'react'

export function PortfolioAllocation() {
  const { data: portfolio, isLoading } = useVirtualPortfolio()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const allocationData = useMemo(() => {
    if (!portfolio) return []

    const holdings = portfolio.holdings || []
    const cashBalance = portfolio.cashBalance || 0
    const totalAssetValue = portfolio.totalAssetValue || 1

    const stockAllocations = holdings.map((holding) => ({
      label: holding.symbolCode,
      value: holding.currentValue,
      percentage: (holding.currentValue / totalAssetValue) * 100,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }))

    const cashAllocation = {
      label: 'Tiền mặt',
      value: cashBalance,
      percentage: (cashBalance / totalAssetValue) * 100,
      color: 'hsl(0, 0%, 70%)',
    }

    return [...stockAllocations, cashAllocation].sort((a, b) => b.value - a.value)
  }, [portfolio])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân bổ tài sản</CardTitle>
          <CardDescription>Tỷ trọng các khoản đầu tư</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
                <div className="h-3 bg-muted rounded" style={{ width: `${100 - i * 15}%` }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bổ tài sản</CardTitle>
        <CardDescription>Tỷ trọng các khoản đầu tư</CardDescription>
      </CardHeader>
      <CardContent>
        {allocationData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Chưa có dữ liệu phân bổ tài sản</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pie chart representation using bars */}
            <div className="flex h-4 w-full rounded-full overflow-hidden">
              {allocationData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                  className="transition-all hover:opacity-80"
                  title={`${item.label}: ${item.percentage.toFixed(2)}%`}
                />
              ))}
            </div>

            {/* Legend and details */}
            <div className="space-y-3">
              {allocationData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-sm font-semibold w-16 text-right">
                      {item.percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Tổng tài sản:</span>
                <span className="text-lg font-bold">
                  {formatCurrency(portfolio?.totalAssetValue || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}