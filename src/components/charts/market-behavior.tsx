import * as echarts from 'echarts'
import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMarketBehavior } from '@/features/market/api/useMarket'

// Data is now provided via useMarketBehavior hook and normalized in the service

export function MarketBehavior() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  
  const { data, isLoading, error } = useMarketBehavior()
  
  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return
    
    // Initialize chart if not already initialized with SVG renderer
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, null, {
        renderer: 'svg'
      })
    }
    
    const chart = chartInstance.current
    
    // Prepare data for chart
    const dates = data.map(item => {
      // Format date from DD/MM/YY to a more readable format
      if (!item.date) return 'N/A'
      const dateParts = item.date.split('/')
      if (dateParts.length < 2) return item.date
      const [day, month, _year] = dateParts
      return `${day}/${month}`
    })
    
    const strongSellData = data.map(item => (item.strong_sell * 100).toFixed(2))
    const sellData = data.map(item => (item.sell * 100).toFixed(2))
    const buyData = data.map(item => (item.buy * 100).toFixed(2))
    const strongBuyData = data.map(item => (item.strong_buy * 100).toFixed(2))
    const vnindexData = data.map(item => item.vnindex)
    
    // Calculate min and max for VN-INDEX to ensure proper scaling
    const vnindexMin = Math.min(...vnindexData) * 0.98  // Add 2% padding
    const vnindexMax = Math.max(...vnindexData) * 1.02  // Add 2% padding
    
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function (params: any) {
          let tooltipText = `<strong>${params[0].axisValue}</strong><br/>`
          params.forEach((param: any) => {
            if (param.seriesName === 'VN-INDEX') {
              tooltipText += `${param.marker} ${param.seriesName}: <strong>${param.value}</strong><br/>`
            } else {
              tooltipText += `${param.marker} ${param.seriesName}: <strong>${param.value}%</strong><br/>`
            }
          })
          return tooltipText
        }
      },
      legend: {
        show: true,
        top: 0,
        left: 'center',
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 8,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '5%', // Reduced bottom margin since legend is hidden
        top: '46',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: {
          rotate: 45,
          interval: Math.floor(dates.length / 20), // Show about 20 labels
          fontSize: 10
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Tỷ lệ (%)',
          position: 'left',
          axisLabel: {
            formatter: '{value}%'
          },
          min: 0,
          max: 100
        },
        {
          type: 'value',
          name: '',
          position: 'right',
          min: vnindexMin,
          max: vnindexMax,
          axisLabel: {
            show: false  // Hide the right axis labels
          },
          axisLine: {
            show: false  // Hide the axis line
          },
          axisTick: {
            show: false  // Hide the axis ticks
          },
          splitLine: {
            show: false
          },
          inverse: false  // Ensure proper orientation (low at bottom, high at top)
        }
      ],
      // Disable zoom completely
      dataZoom: [],
      series: [
        {
          name: 'Bán mạnh',
          type: 'bar',
          stack: 'sentiment',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: '#dc2626' // red-600
          },
          data: strongSellData
        },
        {
          name: 'Bán',
          type: 'bar',
          stack: 'sentiment',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: '#f87171' // red-400
          },
          data: sellData
        },
        {
          name: 'Mua',
          type: 'bar',
          stack: 'sentiment',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: '#4ade80' // green-400
          },
          data: buyData
        },
        {
          name: 'Mua mạnh',
          type: 'bar',
          stack: 'sentiment',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: '#16a34a' // green-600
          },
          data: strongBuyData
        },
        {
          name: 'VN-INDEX',
          type: 'line',
          yAxisIndex: 1,
          symbol: 'none',
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#3b82f6' // blue-500
          },
          itemStyle: {
            color: '#3b82f6'
          },
          data: vnindexData
        }
      ]
    }
    
    chart.setOption(option)
    
    // Handle resize
    const handleResize = () => {
      chart.resize()
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [data])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [])
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hành vi thị trường</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Không thể tải dữ liệu hành vi thị trường. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hành vi thị trường</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[220px] w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : (
          <div ref={chartRef} className="h-[220px] w-full" />
        )}
      </CardContent>
    </Card>
  )
}