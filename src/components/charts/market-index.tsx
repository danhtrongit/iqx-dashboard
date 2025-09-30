import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Button } from "@/components/ui/button";
import { useMarketOHLC } from "@/features/market/api/useMarket";

type OHLCResponse = Array<{
    t: number[];
    o: number[];
    h: number[];
    l: number[];
    c: number[];
    v: number[];
}>;

export default function MarketIndex({ symbol = 'VNINDEX' }: { symbol?: string }) {
    const [preset, setPreset] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y'>('1D');
    const [compareBaseline, setCompareBaseline] = useState<number | undefined>(undefined);
    const [daily5Y, setDaily5Y] = useState<{ t: number[]; c: number[] } | null>(null);

    // Removed computeToUtcMidnight; service handles date range internally

    const getParamsForPreset = (p: typeof preset) => {
        switch (p) {
            case '1D':
                // Increase countBack to ensure we get enough data even with filtering
                return { timeFrame: 'ONE_MINUTE' as const, countBack: 500 };
            case '1W':
                return { timeFrame: 'ONE_HOUR' as const, countBack: 46 };
            case '1M':
                return { timeFrame: 'ONE_DAY' as const, countBack: 30 };
            case '1Y':
                return { timeFrame: 'ONE_DAY' as const, countBack: 260 };
            case '5Y':
                return { timeFrame: 'ONE_DAY' as const, countBack: 1300 };
            default:
                return { timeFrame: 'ONE_DAY' as const, countBack: 30 };
        }
    };

    const params = getParamsForPreset(preset);
    const { data, isLoading, isError, error } = useMarketOHLC({ symbol, timeFrame: params.timeFrame, countBack: params.countBack });
    const raw = useMemo<OHLCResponse | null>(() => {
        if (!data) return null;

        return data.map((item) => ({
            t: item.t,
            o: item.o,
            h: item.h,
            l: item.l,
            c: item.c,
            v: item.v,
        }));
    }, [data]);

    // Separate filtered data for display (only affects 1D chart display)
    const displayData = useMemo<OHLCResponse | null>(() => {
        if (!raw) return null;

        // Additional filtering for 1D timeframe only - limit to trading hours (9AM-3PM) of the current trading day
        if (preset === '1D') {
            return raw.map((item) => {
                const now = new Date();
                const vietnamNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
                const currentDayOfWeek = vietnamNow.getDay(); // 0 = Sunday, 6 = Saturday

                // Determine the target trading date
                let targetDate: Date;
                if (currentDayOfWeek === 0) {
                    // Sunday: show Friday's data
                    targetDate = new Date(vietnamNow);
                    targetDate.setDate(vietnamNow.getDate() - 2);
                } else if (currentDayOfWeek === 6) {
                    // Saturday: show Friday's data
                    targetDate = new Date(vietnamNow);
                    targetDate.setDate(vietnamNow.getDate() - 1);
                } else {
                    // Weekday: show today's data
                    targetDate = new Date(vietnamNow);
                }

                const targetDateStr = targetDate.toDateString();

                const filteredT: number[] = [];
                const filteredO: number[] = [];
                const filteredH: number[] = [];
                const filteredL: number[] = [];
                const filteredC: number[] = [];
                const filteredV: number[] = [];

                for (let i = 0; i < item.t.length; i++) {
                    const timestamp = item.t[i];
                    const date = new Date(timestamp * 1000);
                    const vietnamDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
                    const hour = vietnamDate.getHours();

                    // Check if this data point is from the target date and within trading hours (9AM-3PM)
                    const isTargetDate = vietnamDate.toDateString() === targetDateStr;
                    const isWithinTradingHours = hour >= 9 && hour < 15;

                    if (isTargetDate && isWithinTradingHours) {
                        filteredT.push(timestamp);
                        filteredO.push(item.o[i]);
                        filteredH.push(item.h[i]);
                        filteredL.push(item.l[i]);
                        filteredC.push(item.c[i]);
                        filteredV.push(item.v[i]);
                    }
                }

                return {
                    t: filteredT,
                    o: filteredO,
                    h: filteredH,
                    l: filteredL,
                    c: filteredC,
                    v: filteredV,
                };
            });
        }

        return raw;
    }, [raw, preset]);
    // Fetch 5Y daily once and compute baseline by day offsets for comparison
    const { data: data5y } = useMarketOHLC({ symbol, timeFrame: 'ONE_DAY', countBack: 1300 });
    useEffect(() => {
        if (daily5Y) return;
        try {
            const dd = data5y?.[0];
            if (dd && dd.t && dd.c) setDaily5Y({ t: dd.t.map(Number), c: dd.c.map(Number) });
        } catch { }
    }, [data5y, daily5Y]);

    // Reset cached 5Y data when symbol changes to refetch
    useEffect(() => {
        setDaily5Y(null);
    }, [symbol]);

    useEffect(() => {
        if (!daily5Y || !daily5Y.t?.length) { setCompareBaseline(undefined); return; }
        const times = daily5Y.t;
        const closes = daily5Y.c;
        const lastIdx = times.length - 1;
        const lastTsMs = times[lastIdx] * 1000;

        const findCloseAtOffsetDays = (days: number) => {
            const target = lastTsMs - days * 86400000;
            let lo = 0, hi = times.length - 1, ans = 0;
            while (lo <= hi) {
                const mid = (lo + hi) >> 1;
                const val = times[mid] * 1000;
                if (val <= target) { ans = mid; lo = mid + 1; } else { hi = mid - 1; }
            }
            return closes[Math.max(0, Math.min(ans, closes.length - 1))];
        };

        if (preset === '1D') { setCompareBaseline(closes[lastIdx - 1]); return; }
        if (preset === '1W') { setCompareBaseline(findCloseAtOffsetDays(7)); return; }
        if (preset === '1M') { setCompareBaseline(findCloseAtOffsetDays(30)); return; }
        if (preset === '1Y') { setCompareBaseline(findCloseAtOffsetDays(365)); return; }
        if (preset === '5Y') { setCompareBaseline(findCloseAtOffsetDays(365 * 5)); return; }
        setCompareBaseline(undefined);
    }, [preset, daily5Y]);

    const handlePresetClick = (p: typeof preset) => {
        if (p !== preset) setPreset(p);
    };

    type Bucket = {
        label: string;
        startTs: number;
        endTs: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    };

    const { categories, lineData, buckets } = useMemo(() => {
        const empty = { categories: [] as string[], lineData: [] as number[], buckets: [] as Bucket[] };
        if (!displayData || !Array.isArray(displayData) || displayData.length === 0) return empty;
        const r = displayData[0];
        if (!r || !r.t || r.t.length === 0) return empty;

        const points = [] as Array<{ ts: number; o: number; h: number; l: number; c: number; v: number }>;
        for (let i = 0; i < r.t.length; i++) {
            const ts = Number(r.t[i]);
            if (!Number.isFinite(ts)) continue;
            points.push({
                ts,
                o: Number(r.o?.[i] ?? 0),
                h: Number(r.h?.[i] ?? 0),
                l: Number(r.l?.[i] ?? 0),
                c: Number(r.c?.[i] ?? 0),
                v: Number(r.v?.[i] ?? 0),
            });
        }

        const fmtDate = (date: Date) => new Intl.DateTimeFormat('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: '2-digit', month: '2-digit', day: '2-digit'
        }).format(date);

        const fmtDateTime = (date: Date) => new Intl.DateTimeFormat('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit', minute: '2-digit',
            year: '2-digit', month: '2-digit', day: '2-digit'
        }).format(date);

        const getIsoWeek = (d: Date) => {
            const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            const dayNum = date.getUTCDay() || 7;
            date.setUTCDate(date.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
            const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
            return { year: date.getUTCFullYear(), week: weekNo };
        };

        const weekly = preset === '1Y';
        const monthly = preset === '5Y';

        const bucketMap = new Map<string, Bucket>();
        for (const p of points) {
            const local = new Date(p.ts * 1000);
            let key: string;
            if (weekly) {
                const { year, week } = getIsoWeek(local);
                key = `W-${year}-${week}`;
            } else if (monthly) {
                key = `M-${local.getFullYear()}-${local.getMonth() + 1}`;
            } else {
                key = `D-${p.ts}`;
            }

            let b = bucketMap.get(key);
            if (!b) {
                const label = weekly
                    ? (() => { const { year, week } = getIsoWeek(local); return `Tuần ${week}/${String(year).slice(-2)}`; })()
                    : monthly
                        ? `${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getFullYear()).slice(-2)}`
                        : ((preset === '1D' || preset === '1W') ? fmtDateTime(local) : fmtDate(local));
                b = { label, startTs: p.ts, endTs: p.ts, open: p.o, high: p.h, low: p.l, close: p.c, volume: p.v };
                bucketMap.set(key, b);
            } else {
                b.endTs = p.ts;
                b.high = Math.max(b.high, p.h);
                b.low = Math.min(b.low, p.l);
                b.close = p.c;
                b.volume += p.v;
            }
        }

        const buckets = Array.from(bucketMap.values()).sort((a, b) => a.startTs - b.startTs);
        const categoriesLocal = buckets.map(b => b.label);
        const line = buckets.map(b => b.close);
        return { categories: categoriesLocal, lineData: line, buckets };
    }, [displayData, preset]);

    const option = useMemo(() => {
        const prevBucketClose = lineData.length > 1 ? lineData[lineData.length - 2] : undefined;
        const baseline = compareBaseline !== undefined ? compareBaseline : (preset === '1Y' || preset === '5Y' ? prevBucketClose : (lineData.length > 0 ? lineData[0] : undefined));
        const last = lineData.length > 0 ? lineData[lineData.length - 1] : undefined;
        const isUpOverall = baseline !== undefined && last !== undefined ? last >= baseline : true;
        const lineColor = isUpOverall ? '#22c55e' : '#ef4444';
        const areaTop = isUpOverall ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.25)';
        const areaBottom = isUpOverall ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.04)';
        return {
            animation: false,
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross', crossStyle: { type: 'dashed' } },
                backgroundColor: 'transparent',
                borderColor: 'var(--border)',
                textStyle: { color: 'var(--popover-foreground)' },
                extraCssText: 'background: var(--popover); color: var(--popover-foreground); border: 1px solid var(--border); box-shadow: none;',
                formatter: (params: any) => {
                    const p = Array.isArray(params) ? params[0] : params;
                    const idx = p?.dataIndex ?? 0;
                    const b = buckets?.[idx];
                    if (!b) return '';
                    const prevB = idx > 0 ? buckets[idx - 1] : undefined;
                    const circle = (diff?: number) => {
                        if (diff === undefined) return '';
                        const color = diff > 0
                            ? '#22c55e'
                            : diff < 0
                                ? '#ef4444'
                                : 'var(--muted-foreground)';
                        return `<span style="display:inline-block;width:8px;height:8px;border-radius:9999px;background:${color};margin-left:8px;vertical-align:middle"></span>`;
                    };
                    const row = (label: string, value: string, diff?: number) => {
                        return `<div style="display:flex;align-items:center;justify-content:space-between;margin:2px 0">\
                            <span class=\"text-muted-foreground\">${label}</span>\
                            <span style=\"display:inline-flex;align-items:center\">${value}${circle(diff)}</span>\
                        </div>`;
                    };
                    const prev = idx > 0 ? buckets[idx - 1].close : undefined;
                    const change = prev ? ((b.close - prev) / prev) * 100 : undefined;
                    const closeDiffL = prev !== undefined ? b.close - prev : undefined;
                    const volDiffL = prevB ? b.volume - prevB.volume : undefined;
                    return `<div style="min-width:200px;color:var(--popover-foreground)">\
                        <div style="font-weight:700;margin-bottom:6px">${b.label}</div>\
                        ${row('Đóng cửa', b.close.toLocaleString('vi-VN'), closeDiffL)}\
                        ${row('Khối lượng', b.volume.toLocaleString('vi-VN'), volDiffL)}\
                        ${change !== undefined ? `<div style=\"margin-top:4px\">Biến động: ${change > 0 ? '+' : ''}${change.toFixed(2)}%</div>` : ''}\
                    </div>`;
                }
            },
            legend: undefined,
            axisPointer: { label: { backgroundColor: 'var(--muted)', color: 'var(--foreground)' } },
            grid: { left: 50, right: 5, top: 10, bottom: 50, show: false },
            xAxis: {
                type: 'category',
                data: categories,
                boundaryGap: false,
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { color: 'var(--muted-foreground)' },
                min: 'dataMin',
                max: 'dataMax'
            },
            yAxis: {
                scale: true,
                splitLine: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: 'var(--muted-foreground)',
                    formatter: (v: number) => v.toLocaleString('vi-VN')
                }
            },
            series: [
                {
                    name: symbol,
                    type: 'line',
                    smooth: true,
                    showSymbol: false,
                    data: lineData,
                    lineStyle: { width: 2, color: lineColor },
                    areaStyle: {
                        color: {
                            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: areaTop },
                                { offset: 1, color: areaBottom },
                            ]
                        }
                    }
                }
            ]
        } as any;
    }, [categories, lineData, buckets, symbol, compareBaseline, preset]);

    if (isLoading) {
        return <div className="min-h-[420px] flex items-center justify-center text-sm text-muted-foreground">Đang tải dữ liệu...</div>;
    }

    if (isError) {
        const message = (error as any)?.message ?? 'Lỗi không xác định';
        return <div className="min-h-[420px] flex items-center justify-center text-sm text-red-500">Lỗi: {message}</div>;
    }

    if (!categories.length) {
        return <div className="min-h-[420x] flex items-center justify-center text-sm text-muted-foreground">Không có dữ liệu</div>;
    }

    // Compute session stats on current buckets
    const latest = buckets?.[buckets.length - 1];
    const first = buckets?.[0];
    const totalVolume = buckets?.reduce((sum, b) => sum + b.volume, 0) || 0;
    const avgVolume = buckets && buckets.length ? Math.round(totalVolume / buckets.length) : 0;
    // Use daily5Y for comparison (latest vs compareBaseline)
    const latestClose = daily5Y?.c?.length ? Number(daily5Y.c[daily5Y.c.length - 1]) : (latest ? latest.close : undefined);
    const baselineSidebar = compareBaseline;
    const isUp = baselineSidebar !== undefined && latestClose !== undefined ? latestClose >= baselineSidebar : true;
    const delta = baselineSidebar !== undefined && latestClose !== undefined ? (latestClose - baselineSidebar) : 0;
    const deltaPct = baselineSidebar ? (delta / baselineSidebar) * 100 : 0;

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4">
            <aside className="lg:col-span-1 border rounded-md p-3 border-border bg-background">
                <div className="flex flex-col gap-2">
                    <div>
                        <div className="text-sm text-muted-foreground">{symbol}</div>
                        <div className={`text-2xl font-semibold ${isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{latestClose !== undefined ? latestClose.toLocaleString('vi-VN') : '-'}</div>
                        <div className={`text-xs ${isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {delta > 0 ? '+' : ''}{delta.toLocaleString('vi-VN')} ({deltaPct.toFixed(2)}%)
                        </div>
                    </div>
                    <div className="flex items-center gap-0 border rounded-md w-fit border-border">
                        {(['1D', '1W', '1M', '1Y', '5Y'] as const).map((p) => (
                            <Button
                                key={p}
                                variant={preset === p ? 'default' : 'ghost'}
                                size="sm"
                                className="px-2"
                                onClick={() => handlePresetClick(p)}
                            >
                                {p}
                            </Button>
                        ))}

                    </div>
                    {/* Removed candlestick toggle to simplify to line-only view */}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                    <div className="text-muted-foreground">Phiên giao dịch</div>
                    <div className="grid grid-cols-2 gap-x-2">
                        <div className="text-muted-foreground">Mở cửa</div>
                        <div className="text-right text-foreground">{first ? first.open.toLocaleString('vi-VN') : '-'}</div>
                        <div className="text-muted-foreground">Cao nhất</div>
                        <div className="text-right text-foreground">{latest ? Math.max(...buckets.map(b => b.high)).toLocaleString('vi-VN') : '-'}</div>
                        <div className="text-muted-foreground">Thấp nhất</div>
                        <div className="text-right text-foreground">{latest ? Math.min(...buckets.map(b => b.low)).toLocaleString('vi-VN') : '-'}</div>
                        <div className="text-muted-foreground">Đóng cửa</div>
                        <div className="text-right text-foreground">{latest ? latest.close.toLocaleString('vi-VN') : '-'}</div>
                    </div>

                    <div className="pt-2 text-muted-foreground">Khối lượng giao dịch</div>
                    <div className="grid grid-cols-2 gap-x-2">
                        <div className="text-muted-foreground">Tổng khối lượng</div>
                        <div className="text-right text-foreground">{totalVolume.toLocaleString('vi-VN')}</div>
                        <div className="text-muted-foreground">KL trung bình</div>
                        <div className="text-right text-foreground">{avgVolume.toLocaleString('vi-VN')}</div>
                    </div>
                </div>
            </aside>

            <div className="lg:col-span-3">
                <ReactECharts style={{ height: 420, width: '100%' }} option={option} notMerge={true} lazyUpdate={true} opts={{ renderer: 'svg' }} />
            </div>
        </div>
    );
}