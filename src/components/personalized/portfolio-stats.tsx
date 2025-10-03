import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Activity, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react'
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
          <Card key={i} className="overflow-hidden">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/20 animate-pulse" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
              </CardHeader>
              <CardContent className="relative">
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const totalAssetValue = portfolio?.totalAssetValue || 0
  const totalProfitLoss = portfolio?.totalProfitLoss || 0
  const profitLossPercentage = VirtualTradingService.parsePercentage(portfolio?.profitLossPercentage)
  const isPositive = totalProfitLoss >= 0
  const cashBalance = portfolio?.cashBalance || 0
  const stockValue = portfolio?.stockValue || 0
  const totalTransactions = portfolio?.totalTransactions || 0
  const holdingsCount = portfolio?.holdings?.length || 0

  const stats = [
    {
      title: 'Tổng tài sản',
      value: formatCurrency(totalAssetValue),
      icon: DollarSign,
      description: 'Giá trị danh mục',
    },
    {
      title: 'Lợi nhuận/Lỗ',
      value: formatCurrency(Math.abs(totalProfitLoss)),
      icon: isPositive ? TrendingUp : TrendingDown,
      description: 'So với vốn ban đầu',
      trend: isPositive ? 'up' : 'down',
      trendValue: `${isPositive ? '+' : ''}${profitLossPercentage.toFixed(2)}%`,
    },
    {
      title: 'Giá trị cổ phiếu',
      value: formatCurrency(stockValue),
      icon: Activity,
      description: `${holdingsCount} mã đang nắm giữ`,
    },
    {
      title: 'Số giao dịch',
      value: totalTransactions.toLocaleString('vi-VN'),
      icon: Award,
      description: 'Tổng lệnh đã thực hiện',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn(
                  "text-2xl font-bold tracking-tight",
                  stat.trend === 'up'
                    ? 'text-green-600'
                    : stat.trend === 'down'
                    ? 'text-red-600'
                    : ''
                )}>
                  {stat.value}
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg border bg-muted/50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                {stat.trendValue && (
                  <div className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.trendValue}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}