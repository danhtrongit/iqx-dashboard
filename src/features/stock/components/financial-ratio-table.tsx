import { useMemo, useState, useEffect } from 'react'
import { useFinancialRatioAnalytics } from '@/hooks/use-financial-ratio'
import type { Period } from '@/types/financial-ratio'
import { FinancialRatioService } from '@/services/financial-ratio.service'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type FinancialRatioTableProps = {
  ticker: string
}

type SortOrder = 'newest' | 'oldest'
type TimeRange = '3' | '5' | 'max'

// Số cột tối đa hiển thị theo period
const MAX_COLUMNS_QUARTERLY = 6  // Hiển thị 6 quý
const MAX_COLUMNS_YEARLY = 3     // Hiển thị 3 năm

// Định nghĩa các chỉ tiêu tài chính theo nhóm
const FINANCIAL_METRICS = {
  incomeStatement: {
    label: 'Chỉ tiêu Báo cáo kết quả kinh doanh',
    color: 'text-orange-600',
    metrics: [
      { key: 'is1', label: 'Doanh thu thuần', format: 'currency' as const },
      { key: 'is3', label: 'Lợi nhuận gộp', format: 'currency' as const },
      { key: 'is5', label: 'Lợi nhuận thuần từ HĐKD', format: 'currency' as const },
      { key: 'is9', label: 'Lợi nhuận trước thuế', format: 'currency' as const },
      { key: 'is11', label: 'Lợi nhuận sau thuế của Cổ đông công ty mẹ', format: 'currency' as const },
    ],
  },
  balanceSheet: {
    label: 'Chỉ tiêu Bảng cân đối kế toán',
    color: 'text-blue-600',
    metrics: [
      { key: 'bs1', label: 'Tổng tài sản', format: 'currency' as const },
      { key: 'bs2', label: 'Tài sản ngắn hạn', format: 'currency' as const },
      { key: 'bs3', label: 'Tài sản dài hạn', format: 'currency' as const },
      { key: 'bs15', label: 'Tổng nợ phải trả', format: 'currency' as const },
      { key: 'bs101', label: 'Vốn chủ sở hữu', format: 'currency' as const },
    ],
  },
  profitability: {
    label: 'Chỉ số khả năng sinh lời (%)',
    color: 'text-green-600',
    metrics: [
      { key: 'op1', label: 'Biên lợi nhuận gộp', format: 'percentage' as const },
      { key: 'op2', label: 'Biên lợi nhuận hoạt động', format: 'percentage' as const },
      { key: 'op3', label: 'Biên lợi nhuận ròng', format: 'percentage' as const },
      { key: 'op4', label: 'ROE (Lợi nhuận/Vốn CSH)', format: 'percentage' as const },
      { key: 'op5', label: 'ROA (Lợi nhuận/Tổng tài sản)', format: 'percentage' as const },
    ],
  },
  liquidity: {
    label: 'Chỉ số thanh khoản',
    color: 'text-purple-600',
    metrics: [
      { key: 'op8', label: 'Tỷ số thanh toán hiện hành', format: 'ratio' as const },
      { key: 'op9', label: 'Tỷ số thanh toán nhanh', format: 'ratio' as const },
      { key: 'op10', label: 'Tỷ số thanh toán tiền mặt', format: 'ratio' as const },
    ],
  },
  leverage: {
    label: 'Chỉ số đòn bẩy tài chính',
    color: 'text-red-600',
    metrics: [
      { key: 'op12', label: 'Nợ/Vốn chủ sở hữu', format: 'ratio' as const },
      { key: 'op13', label: 'Nợ/Tổng tài sản', format: 'ratio' as const },
      { key: 'op14', label: 'Khả năng thanh toán lãi vay', format: 'ratio' as const },
    ],
  },
  valuation: {
    label: 'Chỉ số định giá',
    color: 'text-indigo-600',
    metrics: [
      { key: 'op21', label: 'P/E (Giá/Thu nhập)', format: 'ratio' as const },
      { key: 'op22', label: 'P/B (Giá/Giá trị sổ sách)', format: 'ratio' as const },
      { key: 'op23', label: 'P/S (Giá/Doanh thu)', format: 'ratio' as const },
      { key: 'op24', label: 'EV/EBITDA', format: 'ratio' as const },
    ],
  },
}

export default function FinancialRatioTable({ ticker }: FinancialRatioTableProps) {
  const [period, setPeriod] = useState<Period>('Q')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [timeRange, setTimeRange] = useState<TimeRange>('3')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['incomeStatement']) // Mở mục đầu tiên mặc định
  )

  // Tính size dựa trên period và time range
  const size = useMemo(() => {
    if (period === 'Q') {
      return timeRange === '3' ? 12 : timeRange === '5' ? 20 : 12
    } else {
      return timeRange === '3' ? 3 : timeRange === '5' ? 5 : 3
    }
  }, [period, timeRange])

  const {
    data,
    isLoading,
    error,
    analytics,
  } = useFinancialRatioAnalytics(ticker, period, size)

  // Reset currentIndex khi thay đổi period hoặc sortOrder
  useEffect(() => {
    setCurrentIndex(0)
  }, [period, sortOrder, timeRange])

  // Số cột hiển thị dựa trên period
  const maxColumns = period === 'Q' ? MAX_COLUMNS_QUARTERLY : MAX_COLUMNS_YEARLY

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  // Tất cả dữ liệu các kỳ
  const allPeriodColumns = useMemo(() => {
    if (!data?.items) return []
    
    const items = [...data.items]
    if (sortOrder === 'newest') {
      items.reverse() // API trả về cũ -> mới, reverse để hiển thị mới -> cũ
    }
    
    return items
  }, [data, sortOrder])

  // Hiển thị số cột dựa trên period (Quý: 6, Năm: 3)
  const displayedColumns = useMemo(() => {
    return allPeriodColumns.slice(currentIndex, currentIndex + maxColumns)
  }, [allPeriodColumns, currentIndex, maxColumns])

  const periodHeaders = useMemo(() => {
    return displayedColumns.map(item => 
      FinancialRatioService.formatPeriodName(item.periodDateName, period)
    )
  }, [displayedColumns, period])

  // Navigation functions
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex + maxColumns < allPeriodColumns.length

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex(prev => Math.max(0, prev - 1))
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(prev => Math.min(allPeriodColumns.length - maxColumns, prev + 1))
    }
  }

  const formatValue = (value: number | undefined, format: 'currency' | 'percentage' | 'ratio') => {
    if (value === undefined || value === null) return '-'
    
    switch (format) {
      case 'currency':
        return FinancialRatioService.formatCurrency(value)
      case 'percentage':
        return FinancialRatioService.formatPercentage(value)
      case 'ratio':
        return FinancialRatioService.formatNumber(value)
      default:
        return value.toString()
    }
  }

  const getValueFromItem = (item: any, key: string): number | undefined => {
    return item[key]
  }

  const exportToCSV = () => {
    if (!data?.items) return
    
    // Export tất cả dữ liệu, không chỉ 3 cột hiển thị
    const allHeaders = allPeriodColumns.map(item => 
      FinancialRatioService.formatPeriodName(item.periodDateName, period)
    )
    const headers = ['Chỉ tiêu', ...allHeaders]
    const rows: string[][] = [headers]

    Object.entries(FINANCIAL_METRICS).forEach(([groupKey, group]) => {
      rows.push([group.label, ...Array(allHeaders.length).fill('')])
      
      group.metrics.forEach(metric => {
        const values = allPeriodColumns.map(item => {
          const value = getValueFromItem(item, metric.key)
          return formatValue(value, metric.format)
        })
        rows.push([metric.label, ...values])
      })
      
      rows.push(['', ...Array(allHeaders.length).fill('')]) // Empty row
    })

    const csv = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${ticker}_financial_ratios_${period}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Không thể tải dữ liệu tỷ lệ tài chính: {error instanceof Error ? error.message : 'Có lỗi xảy ra'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Ngành:</span>
          <span>{data?.industryGroup || 'N/A'}</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Báo cáo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q">Quý</SelectItem>
              <SelectItem value="Y">Năm</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất bên phải</SelectItem>
              <SelectItem value="oldest">Cũ nhất bên phải</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 {period === 'Y' ? 'năm' : 'năm'}</SelectItem>
              <SelectItem value="5">5 {period === 'Y' ? 'năm' : 'năm'}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Xuất dữ liệu
          </Button>

          {/* Navigation buttons */}
          {allPeriodColumns.length > maxColumns && (
            <>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={!canGoPrev || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {currentIndex + 1}-{Math.min(currentIndex + maxColumns, allPeriodColumns.length)} / {allPeriodColumns.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!canGoNext || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Financial Data Table */}
      <div className="rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-medium min-w-[280px]">
                    <div className="flex flex-col">
                      <span>Bảng chỉ số tài chính</span>
                      <span className="text-xs font-normal text-muted-foreground">Đơn vị: Tỷ VND</span>
                    </div>
                  </th>
                  {periodHeaders.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-right font-medium whitespace-nowrap min-w-[120px]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(FINANCIAL_METRICS).map(([groupKey, group]) => {
                  const isExpanded = expandedGroups.has(groupKey)
                  
                  return (
                    <>
                      {/* Group Header */}
                      <tr
                        key={groupKey}
                        className="border-b bg-muted/20 cursor-pointer hover:bg-muted/30"
                        onClick={() => toggleGroup(groupKey)}
                      >
                        <td
                          className="sticky left-0 z-10 bg-muted/20 px-4 py-3 font-semibold flex items-center gap-2"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span className={group.color}>{group.label}</span>
                        </td>
                        {periodHeaders.map((_, idx) => (
                          <td key={idx} className="px-4 py-3"></td>
                        ))}
                      </tr>

                      {/* Group Metrics */}
                      {isExpanded && group.metrics.map((metric) => (
                        <tr
                          key={metric.key}
                          className="border-b hover:bg-muted/10 transition-colors"
                        >
                          <td className="sticky left-0 z-10 bg-background px-4 py-2 pl-8">
                            <span>{metric.label}</span>
                          </td>
                          {displayedColumns.map((item, idx) => {
                            const value = getValueFromItem(item, metric.key)
                            return (
                              <td
                                key={idx}
                                className="px-4 py-2 text-right tabular-nums"
                              >
                                {formatValue(value, metric.format)}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

