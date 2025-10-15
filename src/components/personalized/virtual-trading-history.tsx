import { useState } from 'react'
import {
  History,
  TrendingUp,
  TrendingDown,
  Filter,
  RefreshCw,
  Receipt,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useTransactionHistory } from '@/hooks/use-virtual-trading'
import { VirtualTradingService } from '@/services/virtual-trading.service'
import type { GetTransactionsRequest, TransactionType } from '@/types/virtual-trading'
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

const TRANSACTION_TYPES: Array<{ value: TransactionType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'BUY', label: 'Mua' },
  { value: 'SELL', label: 'Bán' }
]

const ITEMS_PER_PAGE = [5, 10, 20, 50]

export function VirtualTradingHistory() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [transactionType, setTransactionType] = useState<TransactionType | 'ALL'>('ALL')

  const queryParams: GetTransactionsRequest = {
    page: currentPage,
    limit: pageSize,
    ...(transactionType !== 'ALL' && { type: transactionType })
  }

  const {
    data: transactionData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useTransactionHistory(queryParams, {
    staleTime: 1 * 60 * 1000 // 1 minute
  })

  const handleRefresh = () => {
    refetch()
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const resetFilters = () => {
    setCurrentPage(1)
    setTransactionType('ALL')
    setPageSize(20)
  }

  const getTransactionIcon = (type: TransactionType) => {
    return type === 'BUY' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    )
  }

  const getTransactionBadge = (type: TransactionType) => {
    return (
      <Badge
        variant="outline"
        className="text-xs"
      >
        <div className="flex items-center gap-1">
          {getTransactionIcon(type)}
          {type === 'BUY' ? 'Mua' : 'Bán'}
        </div>
      </Badge>
    )
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }

  const getTotalPages = () => {
    if (!transactionData?.meta?.total || !pageSize) return 0
    return Math.ceil(transactionData.meta.total / pageSize)
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Không thể tải lịch sử giao dịch</h3>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Lịch sử giao dịch Virtual Trading
          </CardTitle>

          <div className="flex items-center gap-2">
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
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <label className="text-sm font-medium">Lọc theo:</label>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">Loại giao dịch:</label>
            <Select
              value={transactionType}
              onValueChange={(value) => {
                setTransactionType(value as TransactionType | 'ALL')
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">Hiển thị:</label>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs"
          >
            Đặt lại
          </Button>

          {transactionData?.meta && (
            <div className="text-sm text-muted-foreground ml-auto">
              <Receipt className="w-4 h-4 inline mr-1" />
              Tổng {transactionData.meta.total} giao dịch
            </div>
          )}
        </div>

        {/* Transaction Table */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4">
                <Skeleton className="h-10 w-16" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : transactionData?.data && transactionData.data.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Loại</TableHead>
                    <TableHead>Mã CK</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                    <TableHead className="text-right">Giá thực hiện</TableHead>
                    <TableHead className="text-right">Giá vốn TB</TableHead>
                    <TableHead className="text-right">Tổng giá trị</TableHead>
                    <TableHead className="text-right">Phí + Thuế</TableHead>
                    <TableHead className="text-right">Thực nhận/trả</TableHead>
                    <TableHead className="text-center">Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionData.data.map((transaction) => {
                    const { date, time } = formatDateTime(transaction.createdAt)
                    const totalFeesTax = transaction.fee + transaction.tax

                    return (
                      <TableRow key={transaction.id}>
                        {/* Transaction Type */}
                        <TableCell>
                          {getTransactionBadge(transaction.transactionType)}
                        </TableCell>

                        {/* Symbol Code */}
                        <TableCell>
                          <div className="font-medium">
                            {transaction.symbolCode}
                          </div>
                        </TableCell>

                        {/* Quantity */}
                        <TableCell className="text-center">
                          <div className="font-medium">
                            {transaction.quantity.toLocaleString()}
                          </div>
                        </TableCell>

                        {/* Price Per Share */}
                        <TableCell className="text-right">
                          <div className="font-medium">
                            {VirtualTradingService.formatCurrency(transaction.pricePerShare)}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="font-medium">
                            {VirtualTradingService.formatCurrency(transaction.averageCost)}
                          </div>
                        </TableCell>

                        {/* Total Amount */}
                        <TableCell className="text-right">
                          <div className="font-medium">
                            {VirtualTradingService.formatCurrency(transaction.totalAmount)}
                          </div>
                        </TableCell>

                        {/* Fees & Tax */}
                        <TableCell className="text-right">
                          <div className="text-sm">
                            <div className="text-orange-600">
                              {VirtualTradingService.formatCurrency(totalFeesTax)}
                            </div>
                            {transaction.tax > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Phí: {VirtualTradingService.formatCurrency(transaction.fee)} |
                                Thuế: {VirtualTradingService.formatCurrency(transaction.tax)}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Net Amount */}
                        <TableCell className="text-right">
                          <div className={`font-medium ${
                            transaction.transactionType === 'BUY'
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}>
                            {transaction.transactionType === 'BUY' ? '-' : '+'}
                            {VirtualTradingService.formatCurrency(Math.abs(transaction.netAmount))}
                          </div>
                        </TableCell>

                        {/* Date & Time */}
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <div className="font-medium">{date}</div>
                            <div className="text-muted-foreground text-xs">{time}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {transactionData.meta && getTotalPages() > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, transactionData.meta.total)}
                  trong tổng số {transactionData.meta.total} giao dịch
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Trước
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2)
                      if (page > getTotalPages()) return null

                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= getTotalPages()}
                  >
                    Sau
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Chưa có giao dịch nào</h3>
            <p className="text-muted-foreground">
              Bắt đầu giao dịch để xem lịch sử tại đây
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}