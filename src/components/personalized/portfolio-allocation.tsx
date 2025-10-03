import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useVirtualPortfolio } from '@/hooks/use-virtual-trading'
import { useMemo, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

// Beautiful color palette
const COLOR_PALETTE = [
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#f59e0b', // Orange
  '#ec4899', // Pink
  '#eab308', // Yellow
  '#06b6d4', // Cyan
  '#f97316', // Red-Orange
]

const CASH_COLOR = '#9ca3af' // Gray

export function PortfolioAllocation() {
  const { data: portfolio, isLoading } = useVirtualPortfolio()
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const chartData = useMemo(() => {
    if (!portfolio) return []

    const holdings = portfolio.holdings || []
    const cashBalance = portfolio.cashBalance || 0

    const stockData = holdings.map((holding, index) => ({
      name: holding.symbolCode,
      value: holding.currentValue,
      itemStyle: {
        color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      },
    }))

    const cashData = {
      name: 'Tiền mặt',
      value: cashBalance,
      itemStyle: {
        color: CASH_COLOR,
      },
    }

    return [...stockData, cashData].sort((a, b) => b.value - a.value)
  }, [portfolio])

  const allocationList = useMemo(() => {
    if (!portfolio || chartData.length === 0) return []

    const totalValue = portfolio.totalAssetValue || 1

    return chartData.map((item) => ({
      name: item.name,
      value: item.value,
      percentage: (item.value / totalValue) * 100,
      color: item.itemStyle.color,
    }))
  }, [chartData, portfolio])

  // Initialize and update ECharts
  useEffect(() => {
    if (!chartRef.current || isLoading || chartData.length === 0) return

    // Initialize chart instance
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current)
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const percentage = params.percent.toFixed(1)
          const value = formatCurrency(params.value)
          return `<div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
                  <div style="font-size: 14px;">${value}</div>
                  <div style="font-size: 14px; font-weight: 600; color: ${params.color};">${percentage}%</div>`
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        textStyle: {
          color: '#1f2937',
        },
      },
      legend: {
        show: false,
      },
      series: [
        {
          name: 'Portfolio',
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 3,
          },
          label: {
            show: false,
          },
          emphasis: {
            scale: true,
            scaleSize: 10,
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              formatter: (params: any) => {
                return `{name|${params.name}}\n{value|${params.percent.toFixed(1)}%}`
              },
              rich: {
                name: {
                  fontSize: 14,
                  fontWeight: 'normal',
                  color: '#6b7280',
                  padding: [0, 0, 4, 0],
                },
                value: {
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#1f2937',
                },
              },
            },
          },
          labelLine: {
            show: false,
          },
          data: chartData,
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: (idx: number) => idx * 100,
        },
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '45%',
          style: {
            text: 'Tổng tài sản',
            fill: '#9ca3af',
            fontSize: 12,
            fontWeight: '500' as any,
          },
          z: 100,
        },
        {
          type: 'text',
          left: 'center',
          top: '55%',
          style: {
            text: formatCurrency(portfolio?.totalAssetValue || 0),
            fill: '#1f2937',
            fontSize: 20,
            fontWeight: 'bold' as any,
          },
          z: 100,
        },
      ],
    }

    chartInstanceRef.current.setOption(option, true)

    // Handle resize
    const handleResize = () => {
      chartInstanceRef.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [chartData, portfolio, isLoading, formatCurrency])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chartInstanceRef.current?.dispose()
    }
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân bổ tài sản</CardTitle>
          <CardDescription>Tỷ trọng các khoản đầu tư</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="w-80 h-80 rounded-full bg-muted/50 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!portfolio || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân bổ tài sản</CardTitle>
          <CardDescription>Tỷ trọng các khoản đầu tư</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Chưa có dữ liệu phân bổ tài sản</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Phân bổ tài sản</CardTitle>
        <CardDescription className="text-sm">Tỷ trọng đầu tư</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Chart */}
          <div ref={chartRef} className="w-full lg:w-[350px] h-[350px] flex-shrink-0" />
          
          {/* Legend List */}
          <div className="flex-1 w-full space-y-2">
            {allocationList.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-sm font-semibold min-w-[3rem] text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
            
            {/* Total Summary */}
            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                <span className="text-sm font-medium">Tổng tài sản</span>
                <span className="text-base font-bold">
                  {formatCurrency(portfolio?.totalAssetValue || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}