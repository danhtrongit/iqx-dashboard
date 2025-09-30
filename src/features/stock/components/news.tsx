import { useMemo, useState } from 'react'
import { format as formatDate } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import { useIqxNewsInfoByTicker } from '@/hooks/use-iqx-news'
import type { IqxNewsItem } from '@/lib/schemas/news'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  symbol: string
}

function SentimentBadge({ value }: { value?: string }) {
  const vi = value === 'Positive' ? 'Tích cực' : value === 'Negative' ? 'Tiêu cực' : 'Trung lập'
  const className =
    value === 'Positive'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
      : value === 'Negative'
      ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800'
  return <Badge className={className}>{vi}</Badge>
}

function NewsCard({ item }: { item: IqxNewsItem }) {
  return (
    <div className="flex gap-4 rounded-lg border p-3">
      {item.news_image_url ? (
        <img
          src={item.news_image_url}
          alt={item.news_title}
          className="h-24 w-32 flex-none rounded object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <a href={`/tin-tuc/${item.slug}`} rel="noreferrer" className="line-clamp-2 font-medium hover:underline">
          {item.news_title}
        </a>
        <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.news_short_content}</div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <SentimentBadge value={item.sentiment} />
          <span>{new Date(item.update_date).toLocaleDateString('vi-VN')}</span>
          <span>· {item.news_from_name}</span>
          {(item.male_audio_duration || item.female_audio_duration) ? (
            <Button variant="outline" size="sm" className="h-6 px-2 py-0 text-xs">
              {Math.round((item.male_audio_duration || item.female_audio_duration || 0))}s
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function News({ symbol }: Props) {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [sentiment, setSentiment] = useState<string>('ALL')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [newsFrom, setNewsFrom] = useState<string>('ALL')

  const { data, isLoading: loading, error } = useIqxNewsInfoByTicker(symbol, {
    page,
    page_size: pageSize,
    sentiment: sentiment === 'ALL' ? undefined : sentiment,
    newsfrom: newsFrom === 'ALL' ? undefined : newsFrom,
    update_from: dateRange?.from ? formatDate(dateRange.from, 'yyyy-MM-dd') : undefined,
    update_to: dateRange?.to ? formatDate(dateRange.to, 'yyyy-MM-dd') : undefined,
  })

  const items = data?.news_info || []
  const total = data?.total_records || 0

  // Reset page when filters change
  const resetPage = () => setPage(1)

  const sourceOptions = useMemo(() => {
    const set = new Map<string, string>()
    for (const it of items) {
      if (it.news_from && it.news_from_name) set.set(it.news_from, it.news_from_name)
    }
    return Array.from(set.entries()).map(([value, label]) => ({ value, label }))
  }, [items])

  const totalPages = useMemo(() => (total > 0 ? Math.ceil(total / pageSize) : 1), [total, pageSize])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tin tức · {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">Cảm xúc</div>
            <Select value={sentiment} onValueChange={(v: string) => { setSentiment(v); resetPage() }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tất cả nhận định" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="Positive">Tích cực</SelectItem>
                <SelectItem value="Neutral">Trung lập</SelectItem>
                <SelectItem value="Negative">Tiêu cực</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">Nguồn</div>
            <Select value={newsFrom} onValueChange={(v: string) => { setNewsFrom(v); resetPage() }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Tất cả nguồn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {sourceOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">Khoảng ngày</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start w-60">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${formatDate(dateRange.from, 'dd/MM/yyyy')} - ${formatDate(dateRange.to, 'dd/MM/yyyy')}`
                    ) : (
                      `${formatDate(dateRange.from, 'dd/MM/yyyy')}`
                    )
                  ) : (
                    'Chọn khoảng ngày'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-fit" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => { setDateRange(range); resetPage() }}
                  numberOfMonths={2}
                  pagedNavigation
                  showOutsideDays={false}
                  classNames={{
                    months: 'flex gap-8',
                    month: 'relative first-of-type:before:hidden before:absolute max-sm:before:inset-x-2 max-sm:before:h-px max-sm:before:-top-2 sm:before:inset-y-2 sm:before:w-px before:bg-border sm:before:-left-4',
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {loading && items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Đang tải...</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error instanceof Error ? error.message : 'Lỗi tải tin tức'}</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Không có tin tức</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {items.map((n) => (
                <NewsCard key={n.id} item={n} />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Trang {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Trước
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Sau
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default News


