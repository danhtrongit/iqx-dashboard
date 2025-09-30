import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCompanyTechnicalAnalysis } from '@/features/market/api/useMarket'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { market } from '@/lib/schemas'
import * as React from 'react'

const GaugeSentiment = React.lazy(() => import('./gauge'))

type Props = {
  symbol: string
}

type TimeFrame = "ONE_HOUR" | "FOUR_HOUR" | "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH"
type Indicator = market.TechnicalIndicator

const TIMEFRAMES: { label: string; value: TimeFrame }[] = [
  { label: '1H', value: 'ONE_HOUR' },
  { label: '1D', value: 'ONE_DAY' },
  { label: '1W', value: 'ONE_WEEK' },
]

function IndicatorsTable({ rows }: { rows: Indicator[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên</TableHead>
          <TableHead className="text-right">Giá trị</TableHead>
          <TableHead className="text-right">Khuyến nghị</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows?.map((r) => (
          <TableRow key={r.name}>
            <TableCell className="capitalize">{r.name}</TableCell>
            <TableCell className="text-right">
              {r.value == null ? '-' :
                typeof r.value === 'number' ?
                  new Intl.NumberFormat('vi-VN').format(r.value) :
                  r.value
              }
            </TableCell>
            <TableCell className="text-right">{r.rating}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function TechnicalAnalysis({ symbol }: Props) {
  const [active, setActive] = useState<TimeFrame>('ONE_DAY')

  const { data, isLoading, error } = useCompanyTechnicalAnalysis({
    symbol,
    timeFrame: active
  })

  const current = data?.data
  const ma = current?.movingAverages ?? []
  const osc = current?.oscillators ?? []

  const gaugeSummary = current?.gaugeSummary
  const gaugeMA = current?.gaugeMovingAverage
  const gaugeOSC = current?.gaugeOscillator

  const summaryText = useMemo(() => {
    if (!gaugeSummary) return '-'
    const buy = gaugeSummary.values?.BUY ?? 0
    const neutral = gaugeSummary.values?.NEUTRAL ?? 0
    return `${gaugeSummary.rating} · Mua ${buy} · Trung lập ${neutral}`
  }, [gaugeSummary])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân tích kỹ thuật</CardTitle>
        <CardDescription>
          {symbol} · {summaryText}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={active} onValueChange={(v) => setActive(v as TimeFrame)}>
          <TabsList className="flex flex-wrap gap-2">
            {TIMEFRAMES.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>

          {TIMEFRAMES.map((t) => (
            <TabsContent key={t.value} value={t.value}>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Đang tải...</div>
              ) : error ? (
                <div className="text-sm text-destructive">Lỗi tải dữ liệu</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <GaugeBlock
                      title="Dao động"
                      value={percentageFromGauge(gaugeOSC)}
                      rating={gaugeOSC?.rating}
                      counts={gaugeOSC?.values}
                    />
                    <GaugeBlock
                      title="Tổng Quan"
                      value={percentageFromGauge(gaugeSummary)}
                      rating={gaugeSummary?.rating}
                      counts={gaugeSummary?.values}
                    />
                    <GaugeBlock
                      title="Trung Bình Động"
                      value={percentageFromGauge(gaugeMA)}
                      rating={gaugeMA?.rating}
                      counts={gaugeMA?.values}
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <ScrollArea className="w-full overflow-auto">
                      <div className="mb-2 text-sm font-medium">Đường trung bình</div>
                      <IndicatorsTable rows={ma} />
                    </ScrollArea>
                    <ScrollArea className="w-full overflow-auto">
                      <div className="mb-2 text-sm font-medium">Dao động</div>
                      <IndicatorsTable rows={osc} />
                    </ScrollArea>
                  </div>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default TechnicalAnalysis

function GaugeBlock({
  title,
  value,
  rating,
  counts,
}: {
  title: string
  value: number
  rating?: string
  counts?: Record<string, number>
}) {
  const buy = counts?.BUY ?? 0
  const neutral = counts?.NEUTRAL ?? 0
  const sell = counts?.SELL ?? counts?.SELLING ?? 0
  return (
    <div className="flex flex-col items-center">
      <React.Suspense fallback={<div className="text-sm text-muted-foreground">Đang tải gauge...</div>}>
        <GaugeSentiment
          value={Math.round(value * 100)}
          activeBandIndex={bandIndexFromRating(rating)}
          statusText={ratingLabel(rating)}
          sectionTitle={title}
          sell={sell}
          neutral={neutral}
          buy={buy}
        />
      </React.Suspense>
    </div>
  )
}

function ratingLabel(r?: string) {
  if (!r) return '-'
  // Map API ratings to vi labels similar to screenshot
  switch (r) {
    case 'VERY_BAD':
      return 'Rất xấu'
    case 'BAD':
      return 'Xấu'
    case 'NEUTRAL':
      return 'Trung lập'
    case 'GOOD':
      return 'Tốt'
    case 'VERY_GOOD':
      return 'Rất tốt'
    default:
      return r
  }
}

function percentageFromGauge(g?: { values?: Record<string, number> }) {
  if (!g?.values) return 0.5
  const buy = g.values.BUY ?? 0
  const neutral = g.values.NEUTRAL ?? 0
  const total = buy + neutral
  if (total <= 0) return 0.5
  // interpret as fraction leaning to right with higher BUY
  return Math.max(0, Math.min(1, buy / total))
}

// ratingColor no longer used after switching to GaugeSentiment; keeping mapping via bandIndexFromRating

function bandIndexFromRating(r?: string) {
  switch (r) {
    case 'VERY_BAD':
      return 0
    case 'BAD':
      return 1
    case 'NEUTRAL':
      return 2
    case 'GOOD':
      return 3
    case 'VERY_GOOD':
      return 4
    default:
      return 3
  }
}


