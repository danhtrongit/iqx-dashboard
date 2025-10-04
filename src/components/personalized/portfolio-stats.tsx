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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
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
  const unrealizedProfitLoss = portfolio?.unrealizedProfitLoss || 0
  const realizedProfitLoss = portfolio?.realizedProfitLoss || 0
  const profitLossPercentage = VirtualTradingService.parsePercentage(portfolio?.profitLossPercentage)
  const isPositiveTotal = totalProfitLoss >= 0
  const isPositiveUnrealized = unrealizedProfitLoss >= 0
  const isPositiveRealized = realizedProfitLoss >= 0
  
  // Calculate unrealized and realized percentages
  const initialBalance = 10000000000 // 10 billion VND
  const unrealizedPercentage = totalAssetValue > 0 ? (unrealizedProfitLoss / (totalAssetValue - unrealizedProfitLoss)) * 100 : 0
  const realizedPercentage = initialBalance > 0 ? (realizedProfitLoss / initialBalance) * 100 : 0

  const stats = [
    {
      title: 'Tổng tài sản',
      value: formatCurrency(totalAssetValue),
      trendValue: `${isPositiveTotal ? '+' : ''}${profitLossPercentage.toFixed(2)}%`,
      trend: isPositiveTotal ? 'up' : 'down',
      icon: DollarSign,
    },
    {
      title: 'Lợi nhuận dự kiến',
      value: formatCurrency(Math.abs(unrealizedProfitLoss)),
      icon: isPositiveUnrealized ? TrendingUp : TrendingDown,
      trend: isPositiveUnrealized ? 'up' : 'down',
      trendValue: `${isPositiveUnrealized ? '+' : ''}${unrealizedPercentage.toFixed(2)}%`,
    },
    {
      title: 'Lợi nhuận đã thực hiện',
      value: formatCurrency(Math.abs(realizedProfitLoss)),
      icon: Activity,
      trend: isPositiveRealized ? 'up' : 'down',
      trendValue: `${isPositiveRealized ? '+' : ''}${realizedPercentage.toFixed(2)}%`,
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardContent className="flex flex-row items-center gap-4 justify-between">
              <div className="size-16 bg-iqx-primary/20 flex items-center justify-center rounded-full">
                <div className="h-10 w-10 bg-iqx-primary/80 rounded-full flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="space-y-1 flex-1">
                <CardTitle className="text-sm uppercase font-medium text-muted-foreground mb-0">
                  {stat.title}
                </CardTitle>
                <div className={cn(
                  "text-lg font-bold tracking-tight",
                  stat.trend === 'up'
                    ? 'text-green-600'
                    : stat.trend === 'down'
                      ? 'text-red-600'
                      : ''
                )}>
                  {stat.value}
                </div>
              </div>
              <div className="flex items-center justify-between">
                {stat.trendValue && (
                  <div className={cn(
                    "flex items-center gap-0.5 text-xs font-medium p-1 rounded px-2",
                    stat.trend === 'up' ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10'
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