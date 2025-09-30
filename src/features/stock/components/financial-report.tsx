import { useMemo, useState, useCallback } from 'react'
import {
  useFinancialStatementMetrics,
  useFinancialStatementDetail,
  useFinancialStatisticsWithComparison
} from '@/features/stock/api/useFinancialStatements'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FinancialStatementsService } from '@/services/financial-statements.service'

type FinancialReportProps = {
  symbol: string
}

type PeriodMode = 'YEAR' | 'QUARTER'
type StatementSection = 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW'

const SECTION_TABS: { key: StatementSection; label: string }[] = [
  { key: 'BALANCE_SHEET', label: 'Bảng cân đối kế toán' },
  { key: 'INCOME_STATEMENT', label: 'Kết Quả Kinh Doanh' },
  { key: 'CASH_FLOW', label: 'Báo Cáo Lưu Chuyển Tiền Tệ' },
]

type FinancialItem = {
  field: string | null
  label: string
  level: number
  parent: string | null
  isCollapsible?: boolean
  children?: FinancialItem[]
}

export default function FinancialReport(props: FinancialReportProps) {
  const { symbol } = props
  const [section, setSection] = useState<StatementSection>('BALANCE_SHEET')
  const [mode, setMode] = useState<PeriodMode>('QUARTER')
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set())

  // Use the new hooks
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError
  } = useFinancialStatementMetrics(symbol)

  const {
    data: statementData,
    isLoading: statementLoading,
    error: statementError
  } = useFinancialStatementDetail(symbol, section)

  const {
    data: statisticsData,
    isLoading: statisticsLoading,
    error: statisticsError
  } = useFinancialStatisticsWithComparison(symbol)

  const loading = metricsLoading || statementLoading || statisticsLoading
  const error = metricsError || statementError || statisticsError

  const toggleCollapse = useCallback((field: string | null) => {
    if (!field) return
    setCollapsedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(field)) {
        newSet.delete(field)
      } else {
        newSet.add(field)
      }
      return newSet
    })
  }, [])

  // Format value with Vietnamese locale
  const formatValue = useCallback((value: number | null | undefined) => {
    return FinancialStatementsService.formatLargeNumber(value || 0)
  }, [])

  // Build periods for columns: latest 8 items
  const periodRecords = useMemo(() => {
    if (!statementData?.data) return []
    const list = mode === 'YEAR' ? statementData.data.years : statementData.data.quarters
    // Sort by year and quarter/period descending
    const sorted = [...(list || [])].sort((a, b) => {
      if (b.yearReport !== a.yearReport) {
        return b.yearReport - a.yearReport
      }
      return (b.lengthReport || 5) - (a.lengthReport || 5)
    })
    return sorted.slice(0, 8).reverse() // Take first 8 and reverse for chronological order
  }, [statementData, mode])

  const periodHeaders = useMemo(() => {
    return periodRecords.map((r) => {
      if (mode === 'YEAR') {
        return r.yearReport.toString()
      }
      // Format as Q3 2023, Q4 2023, etc.
      return `Q${r.lengthReport} ${r.yearReport}`
    })
  }, [periodRecords, mode])

  // Build hierarchical structure with parent-child relationships
  const hierarchicalData = useMemo(() => {
    if (!metricsData?.data) return [] as FinancialItem[]

    // Get section metrics from the new schema structure
    const sectionMetrics = metricsData.data[section] || []

    if (!sectionMetrics || sectionMetrics.length === 0) {
      return [] as FinancialItem[]
    }

    // Build hierarchy
    const itemsByName: Record<string, FinancialItem> = {}
    const rootItems: FinancialItem[] = []

    // First pass: create all items
    sectionMetrics.forEach((metric) => {
      // Skip items with null field
      if (!metric.field) return

      const item: FinancialItem = {
        field: metric.field,
        label: metric.titleVi || metric.titleEn || metric.field,
        level: metric.level || 1,
        parent: metric.parent,
        children: [],
        isCollapsible: metric.level === 1
      }
      itemsByName[metric.name || metric.field] = item
    })

    // Second pass: build hierarchy
    sectionMetrics.forEach((metric) => {
      // Skip items with null field
      if (!metric.field) return

      const item = itemsByName[metric.name || metric.field]
      if (metric.parent && itemsByName[metric.parent]) {
        itemsByName[metric.parent].children?.push(item)
      } else if (!metric.parent || metric.level === 1) {
        rootItems.push(item)
      }
    })

    // Create flat list with hierarchy preserved
    const flatList: FinancialItem[] = []
    const addToList = (item: FinancialItem, parentCollapsed = false) => {
      flatList.push(item)
      if (item.children && item.children.length > 0) {
        const isCollapsed = item.field ? collapsedItems.has(item.field) : false
        if (!isCollapsed && !parentCollapsed) {
          item.children.forEach(child => addToList(child, isCollapsed))
        }
      }
    }

    rootItems.forEach(item => addToList(item))
    return flatList
  }, [metricsData, section, collapsedItems])

  function valueAt(field: string | null, rec: any) {
    if (!field) return null
    const key = field?.toLowerCase?.()
    const direct = rec?.[key]
    if (direct != null) return direct
    return rec?.[field] ?? null
  }

  function exportData() {
    const header = ['Chỉ tiêu', ...periodHeaders].join(',')
    const lines = hierarchicalData.map((item) => {
      const vals = periodRecords.map((rec) => formatValue(valueAt(item.field, rec)))
      const indent = '  '.repeat(item.level - 1)
      return [indent + item.label, ...vals].join(',')
    })
    const csv = [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${symbol}_${section}_${mode}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Error handling
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Không thể tải dữ liệu báo cáo tài chính: {error instanceof Error ? error.message : 'Có lỗi xảy ra'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Financial Statistics Summary */}
      {statisticsData && !statisticsLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tổng quan tài chính {symbol}
            </CardTitle>
            <CardDescription>
              Các chỉ số tài chính chính và xu hướng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">P/E</div>
                <div className="text-2xl font-bold">
                  {FinancialStatementsService.formatRatio(statisticsData.current?.pe)}
                </div>
                {statisticsData.comparison?.pe && (
                  <div className="flex items-center gap-1 text-sm">
                    {statisticsData.comparison.pe > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">+{statisticsData.comparison.pe.toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">{statisticsData.comparison.pe.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">P/B</div>
                <div className="text-2xl font-bold">
                  {FinancialStatementsService.formatRatio(statisticsData.current?.pb)}
                </div>
                {statisticsData.comparison?.pb && (
                  <div className="flex items-center gap-1 text-sm">
                    {statisticsData.comparison.pb > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">+{statisticsData.comparison.pb.toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">{statisticsData.comparison.pb.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">ROE</div>
                <div className="text-2xl font-bold">
                  {FinancialStatementsService.formatPercentage(statisticsData.current?.roe)}
                </div>
                {statisticsData.comparison?.roe && (
                  <div className="flex items-center gap-1 text-sm">
                    {statisticsData.comparison.roe > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">+{(statisticsData.comparison.roe * 100).toFixed(2)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">{(statisticsData.comparison.roe * 100).toFixed(2)}%</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Tỷ lệ thanh toán hiện hành</div>
                <div className="text-2xl font-bold">
                  {FinancialStatementsService.formatRatio(statisticsData.current?.currentRatio)}
                </div>
                {statisticsData.comparison?.currentRatio && (
                  <div className="flex items-center gap-1 text-sm">
                    {statisticsData.comparison.currentRatio > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">+{statisticsData.comparison.currentRatio.toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">{statisticsData.comparison.currentRatio.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header section */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">
            {SECTION_TABS.find(s => s.key === section)?.label}
          </h2>
          <span className="text-sm text-muted-foreground">
            Dữ liệu được cập nhật lúc{' '}
            {statementData?.serverDateTime ?
              new Date(statementData.serverDateTime).toLocaleDateString('vi-VN') :
              'N/A'
            }
          </span>
          {statisticsData?.current && (
            <Badge variant="outline">
              {statisticsData.current.ratioType} - {statisticsData.current.year} Q{statisticsData.current.quarter}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as PeriodMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="YEAR" className="text-xs">Năm</TabsTrigger>
              <TabsTrigger value="QUARTER" className="text-xs">Quý</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-1" />
            Tải xuống
          </Button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 border-b">
        {SECTION_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setSection(t.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative",
              section === t.key 
                ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Đang tải dữ liệu...</div>
          </div>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-medium min-w-[300px]">
                <span>Đơn vị: tỷ VND</span>
              </th>
              {periodHeaders.map((h, idx) => (
                <th key={idx} className="px-3 py-3 text-right font-medium whitespace-nowrap min-w-[100px]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hierarchicalData.map((item, idx) => {
              const hasChildren = item.children && item.children.length > 0
              const isCollapsed = item.field ? collapsedItems.has(item.field) : false

              return (
                <tr
                  key={idx}
                  className={cn(
                    "border-b hover:bg-muted/30 transition-colors",
                    item.level === 1 && "font-semibold bg-muted/10"
                  )}
                >
                  <td
                    className={cn(
                      "sticky left-0 bg-background px-4 py-2 flex items-center gap-1",
                      item.level === 2 && "pl-8",
                      item.level === 3 && "pl-12"
                    )}
                  >
                    {hasChildren && item.isCollapsible && (
                      <button
                        onClick={() => toggleCollapse(item.field)}
                        className="p-0.5 hover:bg-muted rounded"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}
                    {!hasChildren && item.level > 1 && (
                      <span className="w-4" />
                    )}
                    <span className={cn(
                      item.level === 1 && "uppercase"
                    )}>
                      {item.label}
                    </span>
                  </td>
                  {periodRecords.map((rec, cidx) => {
                    const value = valueAt(item.field, rec)
                    return (
                      <td
                        key={cidx}
                        className={cn(
                          "px-3 py-2 text-right tabular-nums",
                          item.level === 1 && "font-semibold"
                        )}
                      >
                        {formatValue(value)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}


