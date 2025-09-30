import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import TechnicalGauge from '@/components/charts/technical-gauge'
import { useVNIndexTechnical } from '@/features/market/api/useMarket'
import { getRecommendationText } from '@/services/tradingview.service'
import type { VNIndexTimeframe, VNIndexTechnicalData } from '@/services/tradingview.service'


const TIMEFRAMES: { label: string; value: VNIndexTimeframe }[] = [
  { label: '5 phút', value: '5' },
  { label: '1 giờ', value: '60' },
  { label: '1 ngày', value: '1D' },
  { label: '1 tuần', value: '1W' },
  { label: '1 tháng', value: '1M' },
]

interface ProcessedData {
  oscillators: IndicatorRow[]
  movingAverages: IndicatorRow[]
  oscillatorCounts: { buy: number; neutral: number; sell: number }
  maCounts: { buy: number; neutral: number; sell: number }
  overallCounts: { buy: number; neutral: number; sell: number }
  overallRecommendation: string
  maRecommendation: string
  oscillatorRecommendation: string
}

interface IndicatorRow {
  name: string
  value: number | null
  signal: string
}

// Tooltip content for each indicator name
const INDICATOR_TIPS: Record<string, string> = {
  'RSI (14)': 'Đo lường tình trạng quá mua/quá bán (thang 0-100). Mua khi RSI < 30 (quá bán), bán khi RSI > 70 (quá mua). Trung lập từ 30-70.',
  'Stochastic %K': "Chỉ báo Stochastic %K đo động lượng bằng cách so sánh giá đóng cửa với phạm vi giá trong một khoảng thời gian. Đường %D là trung bình động của %K giúp làm mượt và báo hiệu đảo chiều. Tín hiệu: %D cắt lên %K và %K < 20 → mua; %D cắt xuống %K và %K > 80 → bán.",
  'CCI (20)': 'Nhận diện sức mạnh xu hướng. Mua khi CCI > 100 (xu hướng tăng mạnh), bán khi CCI < -100 (xu hướng giảm mạnh). Trung lập từ -100 đến 100.',
  'ADX (14)': 'Đo sức mạnh xu hướng (0-100). Xu hướng mạnh trên 25; yếu dưới 20. Không trực tiếp xác định mua/bán.',
  'Awesome Oscillator': "Đo động lượng bằng chênh lệch SMA 34 kỳ và 5 kỳ của giá trung vị. Mua khi AO cắt lên 0 hoặc có mẫu hình 'bullish saucer'; bán khi AO cắt xuống 0 hoặc có 'bearish saucer'.",
  'Momentum (10)': 'So sánh giá hiện tại với giá 10 kỳ trước. Mua khi động lượng tăng và > 0; bán khi < 0. Trung lập khi gần 0.',
  'MACD': 'Theo dõi xu hướng và động lượng. Mua khi MACD cắt lên đường tín hiệu; bán khi cắt xuống. Trung lập khi hai đường gần nhau.',
  'Williams %R': 'Đo lường quá mua/quá bán (-100 đến 0). Mua khi %R < -80 (quá bán), bán khi %R > -20 (quá mua). Trung lập giữa hai mức này.',
  'Bull Bear Power': 'Đo chênh lệch giữa giá và đường trung bình (thường EMA). > 0 ưu thế bò; < 0 ưu thế gấu. Tín hiệu khi cắt qua mức 0.',
  'Ultimate Oscillator': 'Kết hợp động lượng ngắn, trung, dài hạn. Mua khi vượt 50; bán khi dưới 50. Tín hiệu mạnh quanh 30 (mua) và 70 (bán).',
  'EMA 10': 'Đường trung bình động hàm mũ 10 chu kỳ, phản ứng nhanh với giá gần đây.',
  'SMA 10': 'Đường trung bình động đơn giản 10 chu kỳ, trung bình giá 10 chu kỳ gần nhất.',
  'EMA 20': 'Đường trung bình động hàm mũ 20 chu kỳ, mượt hơn EMA(10).',
  'SMA 20': 'Đường trung bình động đơn giản 20 chu kỳ, trung bình giá 20 chu kỳ gần nhất.',
  'EMA 30': 'Đường trung bình động hàm mũ 30 chu kỳ, ít nhạy cảm hơn biến động ngắn hạn.',
  'SMA 30': 'Đường trung bình động đơn giản 30 chu kỳ, trung bình giá 30 chu kỳ gần nhất.',
  'EMA 50': 'Đường trung bình động hàm mũ 50 chu kỳ, tập trung vào xu hướng trung hạn.',
  'SMA 50': 'Đường trung bình động đơn giản 50 chu kỳ, trung bình giá 50 chu kỳ gần nhất.',
  'EMA 100': 'Đường trung bình động hàm mũ 100 chu kỳ, xác định xu hướng dài hạn.',
  'SMA 100': 'Đường trung bình động đơn giản 100 chu kỳ, trung bình giá 100 chu kỳ gần nhất.',
  'EMA 200': 'Đường trung bình động hàm mũ 200 chu kỳ, dùng để phân tích xu hướng dài hạn.',
  'SMA 200': 'Đường trung bình động đơn giản 200 chu kỳ, trung bình giá 200 chu kỳ gần nhất.'
}

export function VNIndexTechnicalAnalysis() {
  const [activeTimeframe, setActiveTimeframe] = useState<VNIndexTimeframe>('1D')
  const { data, isLoading, error } = useVNIndexTechnical(activeTimeframe)
  const currentData = useMemo(() => (
    data ? processRawData(data as VNIndexTechnicalData, activeTimeframe) : undefined
  ), [data, activeTimeframe])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Phân tích kỹ thuật VNINDEX</CardTitle>
        <CardDescription>
          {currentData ? (
            <>
              VNINDEX · {getRecommendationText(currentData.overallRecommendation)} · 
              Mua {currentData.overallCounts.buy} · 
              Trung lập {currentData.overallCounts.neutral} · 
              Bán {currentData.overallCounts.sell}
            </>
          ) : (
            'Đang tải dữ liệu...'
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTimeframe} onValueChange={(v) => setActiveTimeframe(v as VNIndexTimeframe)}>
          <TabsList className="grid grid-cols-5 w-full">
            {TIMEFRAMES.map((tf) => (
              <TabsTrigger key={tf.value} value={tf.value}>
                {tf.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TIMEFRAMES.map((tf) => (
            <TabsContent key={tf.value} value={tf.value} className="space-y-6">
              {isLoading && tf.value === activeTimeframe ? (
                <LoadingSkeleton />
              ) : error && tf.value === activeTimeframe ? (
                <div className="text-sm text-destructive p-4 text-center">
                  {(error as any)?.message || 'Lỗi tải dữ liệu kỹ thuật'}
                </div>
              ) : currentData ? (
                <>
                  {/* Gauge Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GaugeBlock
                      title="Dao động"
                      recommendation={currentData.oscillatorRecommendation}
                      counts={currentData.oscillatorCounts}
                    />
                    <GaugeBlock
                      title="Tổng quan"
                      recommendation={currentData.overallRecommendation}
                      counts={currentData.overallCounts}
                    />
                    <GaugeBlock
                      title="Trung bình động"
                      recommendation={currentData.maRecommendation}
                      counts={currentData.maCounts}
                    />
                  </div>

                  {/* Tables Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Chỉ báo dao động</h3>
                      <ScrollArea className="h-[400px] rounded-md border">
                        <IndicatorTable rows={currentData.oscillators} />
                      </ScrollArea>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Chỉ báo trung bình động</h3>
                      <ScrollArea className="h-[400px] rounded-md border">
                        <IndicatorTable rows={currentData.movingAverages} />
                      </ScrollArea>
                    </div>
                  </div>
                </>
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

function GaugeBlock({
  title,
  recommendation,
  counts
}: {
  title: string
  recommendation: string
  counts: { buy: number; neutral: number; sell: number }
}) {
  return (
    <TechnicalGauge
      title={title}
      buy={counts.buy}
      neutral={counts.neutral}
      sell={counts.sell}
      recommendation={getRecommendationText(recommendation)}
    />
  )
}

function IndicatorTable({ rows }: { rows: IndicatorRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Chỉ báo</TableHead>
          <TableHead className="text-right">Giá trị</TableHead>
          <TableHead className="text-right">Tín hiệu</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-1.5">
                <span>{row.name}</span>
                {INDICATOR_TIPS[row.name] ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground inline-flex items-center" aria-label={`Giải thích ${row.name}`}>
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6} className="max-w-[360px] text-pretty leading-relaxed">
                      {INDICATOR_TIPS[row.name]}
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="text-right">
              {row.value !== null ? 
                new Intl.NumberFormat('vi-VN', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }).format(row.value) : 
                '-'
              }
            </TableCell>
            <TableCell className="text-right">
              <SignalBadge signal={row.signal} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function SignalBadge({ signal }: { signal: string }) {
  const getColor = () => {
    switch (signal) {
      case 'Mua':
      case 'Mua mạnh':
        return 'text-green-600'
      case 'Bán':
      case 'Bán mạnh':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }
  
  return (
    <span className={`text-xs font-medium ${getColor()}`}>
      {signal}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <Skeleton className="h-[200px] w-[300px]" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i}>
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}


function processRawData(data: VNIndexTechnicalData, timeframe: VNIndexTimeframe): ProcessedData {
  const tfSuffix = timeframe === '1D' ? '' : `|${timeframe}`
  
  // Extract values with timeframe suffix
  const getValue = (key: string): number | undefined => {
    const fullKey = tfSuffix ? `${key}${tfSuffix}` : key
    return data[fullKey] ?? data[key]
  }
  
  // Process oscillators
  const oscillators: IndicatorRow[] = [
    { name: 'RSI (14)', value: getValue('RSI') ?? null, signal: getSignalText(getValue('RSI'), 'RSI') },
    { name: 'Stochastic %K', value: getValue('Stoch.K') ?? null, signal: getSignalText(getValue('Stoch.K'), 'Stoch') },
    { name: 'CCI (20)', value: getValue('CCI20') ?? null, signal: getSignalText(getValue('CCI20'), 'CCI') },
    { name: 'ADX (14)', value: getValue('ADX') ?? null, signal: getSignalText(getValue('ADX'), 'ADX') },
    { name: 'Awesome Oscillator', value: getValue('AO') ?? null, signal: getSignalText(getValue('AO'), 'AO') },
    { name: 'Momentum (10)', value: getValue('Mom') ?? null, signal: getSignalText(getValue('Mom'), 'Mom') },
    { name: 'MACD', value: getValue('MACD.macd') ?? null, signal: getSignalText(getValue('MACD.macd'), 'MACD') },
    { name: 'Williams %R', value: getValue('W.R') ?? null, signal: getSignalText(getValue('W.R'), 'WR') },
    { name: 'Bull Bear Power', value: getValue('BBPower') ?? null, signal: getSignalText(getValue('BBPower'), 'BBP') },
    { name: 'Ultimate Oscillator', value: getValue('UO') ?? null, signal: getSignalText(getValue('UO'), 'UO') },
  ]
  
  const closePrice = getValue('close') ?? 0
  
  // Process moving averages
  const movingAverages: IndicatorRow[] = [
    { name: 'EMA 10', value: getValue('EMA10') ?? null, signal: getMASignal(closePrice, getValue('EMA10')) },
    { name: 'SMA 10', value: getValue('SMA10') ?? null, signal: getMASignal(closePrice, getValue('SMA10')) },
    { name: 'EMA 20', value: getValue('EMA20') ?? null, signal: getMASignal(closePrice, getValue('EMA20')) },
    { name: 'SMA 20', value: getValue('SMA20') ?? null, signal: getMASignal(closePrice, getValue('SMA20')) },
    { name: 'EMA 30', value: getValue('EMA30') ?? null, signal: getMASignal(closePrice, getValue('EMA30')) },
    { name: 'SMA 30', value: getValue('SMA30') ?? null, signal: getMASignal(closePrice, getValue('SMA30')) },
    { name: 'EMA 50', value: getValue('EMA50') ?? null, signal: getMASignal(closePrice, getValue('EMA50')) },
    { name: 'SMA 50', value: getValue('SMA50') ?? null, signal: getMASignal(closePrice, getValue('SMA50')) },
    { name: 'EMA 100', value: getValue('EMA100') ?? null, signal: getMASignal(closePrice, getValue('EMA100')) },
    { name: 'SMA 100', value: getValue('SMA100') ?? null, signal: getMASignal(closePrice, getValue('SMA100')) },
    { name: 'EMA 200', value: getValue('EMA200') ?? null, signal: getMASignal(closePrice, getValue('EMA200')) },
    { name: 'SMA 200', value: getValue('SMA200') ?? null, signal: getMASignal(closePrice, getValue('SMA200')) },
  ]
  
  // Calculate counts
  const oscillatorCounts = calculateCounts(oscillators)
  const maCounts = calculateCounts(movingAverages)
  const overallCounts = {
    buy: oscillatorCounts.buy + maCounts.buy,
    neutral: oscillatorCounts.neutral + maCounts.neutral,
    sell: oscillatorCounts.sell + maCounts.sell
  }
  
  // Calculate recommendations
  const oscillatorRecommendation = getRecommendationFromCounts(oscillatorCounts)
  const maRecommendation = getRecommendationFromCounts(maCounts)
  const overallRecommendation = getRecommendationFromCounts(overallCounts)
  
  return {
    oscillators,
    movingAverages,
    oscillatorCounts,
    maCounts,
    overallCounts,
    overallRecommendation,
    maRecommendation,
    oscillatorRecommendation
  }
}

function getSignalText(value: number | undefined, indicator: string): string {
  if (value === undefined || value === null) return 'Trung lập'
  
  switch (indicator) {
    case 'RSI':
      if (value > 70) return 'Bán'
      if (value < 30) return 'Mua'
      return 'Trung lập'
    
    case 'Stoch':
      if (value > 80) return 'Bán'
      if (value < 20) return 'Mua'
      return 'Trung lập'
    
    case 'CCI':
      if (value > 100) return 'Bán'
      if (value < -100) return 'Mua'
      return 'Trung lập'
    
    case 'ADX':
      if (value > 50) return 'Mua mạnh'
      if (value > 25) return 'Mua'
      return 'Trung lập'
    
    case 'AO':
    case 'Mom':
    case 'MACD':
    case 'BBP':
      if (value > 0) return 'Mua'
      if (value < 0) return 'Bán'
      return 'Trung lập'
    
    case 'WR':
      if (value > -20) return 'Bán'
      if (value < -80) return 'Mua'
      return 'Trung lập'
    
    case 'UO':
      if (value > 70) return 'Bán'
      if (value < 30) return 'Mua'
      return 'Trung lập'
    
    default:
      return 'Trung lập'
  }
}

function getMASignal(price: number, ma: number | undefined): string {
  if (!ma || !price) return 'Trung lập'
  if (price > ma) return 'Mua'
  if (price < ma) return 'Bán'
  return 'Trung lập'
}

function calculateCounts(rows: IndicatorRow[]): { buy: number; neutral: number; sell: number } {
  const counts = { buy: 0, neutral: 0, sell: 0 }
  
  rows.forEach(row => {
    if (row.signal.includes('Mua')) counts.buy++
    else if (row.signal.includes('Bán')) counts.sell++
    else counts.neutral++
  })
  
  return counts
}

function getRecommendationFromCounts(counts: { buy: number; neutral: number; sell: number }): string {
  const total = counts.buy + counts.neutral + counts.sell
  if (total === 0) return 'NEUTRAL'
  
  const buyRatio = counts.buy / total
  const sellRatio = counts.sell / total
  
  if (buyRatio > 0.6) return 'STRONG_BUY'
  if (buyRatio > 0.4) return 'BUY'
  if (sellRatio > 0.6) return 'STRONG_SELL'
  if (sellRatio > 0.4) return 'SELL'
  return 'NEUTRAL'
}

export default VNIndexTechnicalAnalysis