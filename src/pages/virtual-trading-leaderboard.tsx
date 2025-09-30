import React, { useState } from 'react'
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  RefreshCw,
  SortAsc,
  SortDesc,
  Filter
} from 'lucide-react'
import { useLeaderboard } from '@/hooks/use-virtual-trading'
import { VirtualTradingService } from '@/services/virtual-trading.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type SortBy = 'value' | 'percentage'

const RANK_ICONS = {
  1: <Crown className="w-5 h-5 text-yellow-500" />,
  2: <Medal className="w-5 h-5 text-gray-400" />,
  3: <Trophy className="w-5 h-5 text-amber-600" />
}

const LIMITS = [10, 25, 50, 100]

export default function VirtualTradingLeaderboard() {
  const [sortBy, setSortBy] = useState<SortBy>('percentage')
  const [limit, setLimit] = useState(50)

  const {
    data: leaderboardData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useLeaderboard(
    { sortBy, limit },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 3 * 60 * 1000 // Auto refresh every 3 minutes
    }
  )

  const handleRefresh = () => {
    refetch()
  }

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return RANK_ICONS[rank as keyof typeof RANK_ICONS]
    }
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-muted-foreground">#{rank}</span>
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1: return "default"
      case 2: return "secondary"
      case 3: return "outline"
      default: return "outline"
    }
  }

  const formatProfitLoss = (amount: number, percentage: string | number) => {
    const formattedPercentage = VirtualTradingService.formatPercentage(percentage)
    const isPositive = amount >= 0

    return (
      <div className={`text-right ${formattedPercentage.color}`}>
        <div className="font-medium">
          {VirtualTradingService.formatCurrency(amount)}
        </div>
        <div className="text-sm flex items-center justify-end gap-1">
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {formattedPercentage.text}
        </div>
      </div>
    )
  }

  const calculateWinRate = (successfulTrades: number, totalTransactions: number) => {
    if (totalTransactions === 0) return 0
    return (successfulTrades / totalTransactions) * 100
  }

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 80) return "text-emerald-600"
    if (winRate >= 60) return "text-green-600"
    if (winRate >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Không thể tải bảng xếp hạng</h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            Bảng Xếp Hạng Virtual Trading
          </h1>
          <p className="text-muted-foreground mt-2">
            Top trader xuất sắc nhất trong hệ thống Virtual Trading
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Filters & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sắp xếp theo:</label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortBy)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Tỷ lệ lãi/lỗ
                    </div>
                  </SelectItem>
                  <SelectItem value="value">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Tổng tài sản
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Hiển thị:</label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(Number(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIMITS.map(limitOption => (
                    <SelectItem key={limitOption} value={limitOption.toString()}>
                      Top {limitOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {leaderboardData && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                <Users className="w-4 h-4" />
                Tổng {leaderboardData.length} trader
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Hạng</TableHead>
                  <TableHead>Trader</TableHead>
                  <TableHead className="text-right">Tổng tài sản</TableHead>
                  <TableHead className="text-right">Lãi/Lỗ</TableHead>
                  <TableHead className="text-center">Tỷ lệ thắng</TableHead>
                  <TableHead className="text-center">Giao dịch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData?.map((entry) => (
                  <TableRow key={entry.userId} className="hover:bg-muted/30">
                    {/* Rank */}
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Badge variant={getRankBadgeVariant(entry.rank)} className="px-2 py-1">
                          {getRankIcon(entry.rank)}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Username */}
                    <TableCell>
                      <div className="font-medium">{entry.username}</div>
                    </TableCell>

                    {/* Total Asset Value */}
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {VirtualTradingService.formatCurrency(entry.totalAssetValue)}
                      </div>
                    </TableCell>

                    {/* Profit/Loss */}
                    <TableCell>
                      {formatProfitLoss(entry.profitLoss || entry.totalProfitLoss || 0, entry.profitLossPercentage)}
                    </TableCell>

                    {/* Win Rate */}
                    <TableCell className="text-center">
                      <div className={`font-medium ${getWinRateColor(calculateWinRate(entry.successfulTrades, entry.totalTransactions))}`}>
                        {calculateWinRate(entry.successfulTrades, entry.totalTransactions).toFixed(1)}%
                      </div>
                    </TableCell>

                    {/* Transactions */}
                    <TableCell className="text-center">
                      <div className="text-sm">
                        <div className="font-medium">{entry.totalTransactions}</div>
                        <div className="text-muted-foreground">
                          {entry.successfulTrades} thành công
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      {leaderboardData && leaderboardData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-yellow-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Trader xuất sắc nhất</div>
                  <div className="font-semibold">{leaderboardData[0]?.username}</div>
                  <div className="text-sm text-green-600">
                    +{VirtualTradingService.parsePercentage(leaderboardData[0]?.profitLossPercentage).toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Lợi nhuận cao nhất</div>
                  <div className="font-semibold text-green-600">
                    {VirtualTradingService.formatCurrency(
                      Math.max(...leaderboardData.map(entry => entry.profitLoss || entry.totalProfitLoss || 0))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Tỷ lệ thắng trung bình</div>
                  <div className="font-semibold">
                    {(leaderboardData.reduce((sum, entry) => sum + calculateWinRate(entry.successfulTrades, entry.totalTransactions), 0) / leaderboardData.length).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}