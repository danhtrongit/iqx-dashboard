import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVirtualPortfolio } from '@/hooks/use-virtual-trading'

export function PortfolioOverview() {
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tài sản Virtual Trading</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-7 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalValue = (portfolio?.totalValue || 0)
  const totalProfit = (portfolio?.totalProfit || 0)
  const totalProfitPercent = (portfolio?.totalProfitPercent || 0)
  const isPositive = totalProfit >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Tài sản Virtual Trading</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(totalValue)}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {isPositive ? '+' : ''}{formatCurrency(totalProfit)}
          </span>
          <span
            className={cn(
              "text-sm",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            ({isPositive ? '+' : ''}{totalProfitPercent.toFixed(2)}%)
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Tiền mặt: {formatCurrency(portfolio?.cashBalance || 0)}
        </p>
      </CardContent>
    </Card>
  )
}