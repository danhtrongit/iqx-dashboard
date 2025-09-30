import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVirtualPortfolio } from '@/hooks/use-virtual-trading'
import { VirtualTradingService } from '@/services/virtual-trading.service'

export function PortfolioStats() {
  const { data: portfolio, isLoading } = useVirtualPortfolio()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalAssetValue = portfolio?.totalAssetValue || 0
  const totalProfitLoss = portfolio?.totalProfitLoss || 0
  const profitLossPercentage = VirtualTradingService.parsePercentage(portfolio?.profitLossPercentage)
  const isPositive = totalProfitLoss >= 0

  const totalTransactions = portfolio?.totalTransactions || 0

  const stats = [
    {
      title: 'Tổng tài sản',
      value: formatCurrency(totalAssetValue),
      icon: DollarSign,
      description: `Tiền mặt: ${formatCurrency(portfolio?.cashBalance || 0)}`,
      trend: null,
    },
    {
      title: 'Lợi nhuận/Lỗ',
      value: formatCurrency(Math.abs(totalProfitLoss)),
      icon: isPositive ? TrendingUp : TrendingDown,
      description: `${isPositive ? '+' : ''}${profitLossPercentage.toFixed(2)}% so với vốn ban đầu`,
      trend: isPositive ? 'up' : 'down',
      trendValue: `${isPositive ? '+' : ''}${profitLossPercentage.toFixed(2)}%`,
    },
    {
      title: 'Giá trị cổ phiếu',
      value: formatCurrency(portfolio?.stockValue || 0),
      icon: Activity,
      description: `${portfolio?.holdings?.length || 0} mã đang nắm giữ`,
      trend: null,
    },
    {
      title: 'Số giao dịch',
      value: totalTransactions.toLocaleString('vi-VN'),
      icon: Award,
      description: `Tổng số lệnh mua/bán đã thực hiện`,
      trend: null,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon
                className={cn(
                  'h-4 w-4',
                  stat.trend === 'up'
                    ? 'text-green-600'
                    : stat.trend === 'down'
                    ? 'text-red-600'
                    : 'text-muted-foreground'
                )}
              />
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'text-2xl font-bold',
                  stat.trend === 'up'
                    ? 'text-green-600'
                    : stat.trend === 'down'
                    ? 'text-red-600'
                    : ''
                )}
              >
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}