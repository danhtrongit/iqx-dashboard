import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCompanyDailyInfo } from "../api/useCompanyDailyInfo";
import type { ForeignNetEntry } from "@/types/company-daily-info";

type ViewMode = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
type ColumnCount = 10 | 20;

const VIEW_MODES: { value: ViewMode; label: string }[] = [
    { value: 'DAY', label: 'Ngày' },
    { value: 'WEEK', label: 'Tuần' },
    { value: 'MONTH', label: 'Tháng' },
    { value: 'YEAR', label: 'Năm' },
];

export default function ForeignNet({ symbol }: { symbol: string }) {
    const [viewMode, setViewMode] = useState<ViewMode>('MONTH');
    const [columnCount, setColumnCount] = useState<ColumnCount>(10);

    const { data: raw, isLoading: loading, error } = useCompanyDailyInfo(symbol);

    // Helper function to get week number
    const getWeekNumber = (date: Date): string => {
        const tempDate = new Date(date.getTime());
        tempDate.setHours(0, 0, 0, 0);
        tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
        const week1 = new Date(tempDate.getFullYear(), 0, 4);
        const weekNum = 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        return `${tempDate.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    };

    const { xAxisData, barData, lineData, periodLabel } = useMemo(() => {
        const empty = { xAxisData: [] as string[], barData: [] as number[], lineData: [] as number[], periodLabel: '' };
        if (!raw || !raw.length) return empty;
        
        const sorted = [...raw].sort((a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime());
        
        if (viewMode === 'DAY') {
            // Show daily data
            const dailyData = sorted.slice(-columnCount);
            let running = 0;
            
            // Calculate cumulative from beginning
            const allPreviousSum = sorted
                .slice(0, Math.max(0, sorted.length - columnCount))
                .reduce((sum, p) => sum + Number(p.foreignNet || 0), 0);
            running = allPreviousSum;
            
            const xAxisData = dailyData.map(p => {
                const date = new Date(p.tradingDate);
                // Format as DD/MM for daily view to save space
                return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
            });
            
            const barData = dailyData.map(p => Number(p.foreignNet || 0));
            const lineData = dailyData.map(p => {
                running += Number(p.foreignNet || 0);
                return running;
            });
            
            return { xAxisData, barData, lineData, periodLabel: 'Ngày' };
            
        } else if (viewMode === 'WEEK') {
            // Aggregate by week
            const byWeek = new Map<string, { bar: number; cum: number; date: Date }>();
            let running = 0;
            
            for (const p of sorted) {
                const date = new Date(p.tradingDate);
                const weekKey = getWeekNumber(date);
                running += Number(p.foreignNet || 0);
                
                const cur = byWeek.get(weekKey) || { bar: 0, cum: running, date };
                cur.bar += Number(p.foreignNet || 0);
                cur.cum = running;
                byWeek.set(weekKey, cur);
            }
            
            // Take last N weeks
            const weeks = Array.from(byWeek.keys()).sort().slice(-columnCount);
            const weekLabels = weeks.map(w => {
                if (!w || typeof w !== 'string') return 'N/A';
                const parts = w.split('-W');
                if (parts.length < 2) return w;
                const [year, week] = parts;
                return `T${parseInt(week)}/${year}`;
            });
            const barData = weeks.map(w => byWeek.get(w)!.bar);
            const lineData = weeks.map(w => byWeek.get(w)!.cum);
            
            return { xAxisData: weekLabels, barData, lineData, periodLabel: 'Tuần' };
            
        } else if (viewMode === 'MONTH') {
            // Aggregate by month
            const byMonth = new Map<string, { bar: number; cum: number }>();
            let running = 0;
            
            for (const p of sorted) {
                const date = new Date(p.tradingDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                running += Number(p.foreignNet || 0);
                
                const cur = byMonth.get(monthKey) || { bar: 0, cum: running };
                cur.bar += Number(p.foreignNet || 0);
                cur.cum = running;
                byMonth.set(monthKey, cur);
            }
            
            // Take last N months
            const months = Array.from(byMonth.keys()).sort().slice(-columnCount);
            const monthLabels = months.map(m => {
                if (!m || typeof m !== 'string') return 'N/A';
                const parts = m.split('-');
                if (parts.length < 2) return m;
                const [year, month] = parts;
                return `T${parseInt(month)}/${year}`;
            });
            const barData = months.map(m => byMonth.get(m)!.bar);
            const lineData = months.map(m => byMonth.get(m)!.cum);
            
            return { xAxisData: monthLabels, barData, lineData, periodLabel: 'Tháng' };
            
        } else {
            // Aggregate by year
            const byYear = new Map<number, { bar: number; cum: number }>();
            let running = 0;
            
            for (const p of sorted) {
                const y = new Date(p.tradingDate).getFullYear();
                running += Number(p.foreignNet || 0);
                
                const cur = byYear.get(y) || { bar: 0, cum: running };
                cur.bar += Number(p.foreignNet || 0);
                cur.cum = running;
                byYear.set(y, cur);
            }
            
            // Take last N years
            const years = Array.from(byYear.keys()).sort((a, b) => a - b).slice(-columnCount);
            const barData = years.map(y => byYear.get(y)!.bar);
            const lineData = years.map(y => byYear.get(y)!.cum);
            
            return { xAxisData: years.map(String), barData, lineData, periodLabel: 'Năm' };
        }
    }, [raw, viewMode, columnCount]);

    const option = useMemo(() => {
        // Intelligent bar width based on data distribution and view mode
        const getBarWidth = () => {
            // Calculate data variance to determine optimal bar width
            const values = barData.filter(v => v != null && !isNaN(v));
            if (values.length === 0) return '50%';

            const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
            const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
            const coefficientOfVariation = Math.sqrt(variance) / Math.abs(mean) || 0;

            // Base width on view mode
            let baseWidth: number;
            if (viewMode === 'DAY') {
                baseWidth = columnCount === 10 ? 70 : 50;
            } else if (viewMode === 'WEEK') {
                baseWidth = columnCount === 10 ? 50 : 35;
            } else if (viewMode === 'MONTH') {
                baseWidth = columnCount === 10 ? 55 : 40;
            } else {
                baseWidth = columnCount === 10 ? 45 : 30;
            }

            // Adjust based on data variance - higher variance needs thicker bars for visibility
            if (coefficientOfVariation > 1.5) {
                baseWidth += 10; // High variance - make bars thicker
            } else if (coefficientOfVariation < 0.3) {
                baseWidth -= 5; // Low variance - can use thinner bars
            }

            return `${Math.max(baseWidth, 25)}%`; // Minimum 25% width
        };

        return {
            animation: false,
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'transparent',
                borderColor: 'var(--border)',
                textStyle: { color: 'var(--popover-foreground)' },
                extraCssText: 'background: var(--popover); color: var(--popover-foreground); border: 1px solid var(--border); box-shadow: none;',
                formatter: (params: any[]) => {
                    if (!params?.length) return '';
                    const bar = params.find(p => p.seriesType === 'bar');
                    const line = params.find(p => p.seriesType === 'line');
                    const fmt = (v?: number) => {
                        const billions = Number(v ?? 0) / 1_000_000_000;
                        return billions.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';
                    };
                    // For daily view, show full date in tooltip
                    let dateLabel = bar?.axisValueLabel ?? '';
                    if (viewMode === 'DAY' && bar?.dataIndex !== undefined) {
                        const dataPoint = raw && raw.length > bar.dataIndex 
                            ? raw[raw.length - columnCount + bar.dataIndex]
                            : null;
                        if (dataPoint) {
                            const date = new Date(dataPoint.tradingDate);
                            dateLabel = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                        }
                    }
                    return `<div style="min-width:200px;color:var(--popover-foreground)">
                        <div style="font-weight:700;margin-bottom:6px">${periodLabel} ${dateLabel}</div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                            <span>Mua ròng ${periodLabel.toLowerCase()}</span>
                            <span style="color:${bar?.data >= 0 ? '#16a34a' : '#dc2626'}">${fmt(bar?.data)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between">
                            <span>Tích lũy</span>
                            <span style="color:${line?.data >= 0 ? '#16a34a' : '#dc2626'}">${fmt(line?.data)}</span>
                        </div>
                    </div>`;
                }
            },
            legend: { 
                data: ['Mua Ròng', 'Tích Lũy'], 
                textStyle: { color: 'var(--muted-foreground)' },
                top: 10
            },
            grid: { 
                left: 80, 
                right: 20, 
                top: 50, 
                bottom: viewMode === 'DAY' || (viewMode === 'WEEK' && columnCount === 20) ? 80 : 60, 
                show: false 
            },
            xAxis: {
                type: 'category',
                data: xAxisData,
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { 
                    color: 'var(--muted-foreground)',
                    rotate: (() => {
                        if (viewMode === 'DAY') return 45;
                        if (viewMode === 'WEEK' && columnCount === 20) return 45;
                        if (viewMode === 'MONTH' && columnCount === 20) return 30;
                        return 0;
                    })(),
                    interval: (viewMode === 'DAY' && columnCount === 20) || 
                              (viewMode === 'WEEK' && columnCount === 20) ? 1 : 0,
                    fontSize: viewMode === 'DAY' ? 10 : 11
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'var(--border)',
                        type: 'dashed',
                        opacity: 0.3
                    }
                },
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: 'var(--muted-foreground)',
                    formatter: (v: number) => {
                        const billions = v / 1_000_000_000;
                        if (Math.abs(billions) < 1) {
                            const millions = v / 1_000_000;
                            return millions.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' triệu';
                        }
                        return billions.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' tỷ';
                    }
                },
                min: function(_value: any) {
                    // Intelligent auto-scaling based on data distribution
                    const getAllValues = () => {
                        if (viewMode === 'DAY') return barData;
                        // For other modes, use both bar and line data for context
                        return [...barData, ...lineData];
                    };

                    const allValues = getAllValues().filter(v => v != null && !isNaN(v));
                    if (allValues.length === 0) return -500000000;

                    // Calculate statistics for intelligent scaling
                    const sortedValues = [...allValues].sort((a, b) => a - b);
                    const min = sortedValues[0];
                    const max = sortedValues[sortedValues.length - 1];
                    const range = max - min;

                    // Use percentiles for better outlier handling
                    const p10 = sortedValues[Math.floor(sortedValues.length * 0.1)];
                    const p90 = sortedValues[Math.floor(sortedValues.length * 0.9)];
                    const effectiveRange = p90 - p10;

                    if (range === 0) {
                        // All values same - create meaningful range
                        const absValue = Math.abs(min);
                        const defaultPadding = Math.max(absValue * 0.3, 200000000);
                        return min - defaultPadding;
                    }

                    // Adaptive padding based on data characteristics
                    let paddingFactor: number;
                    if (viewMode === 'DAY') {
                        // For daily data, use tighter scaling
                        paddingFactor = effectiveRange < range * 0.5 ? 0.15 : 0.05; // More padding if outliers exist
                    } else {
                        paddingFactor = 0.1; // Standard padding for aggregated views
                    }

                    const minPadding = Math.max(
                        range * paddingFactor,
                        effectiveRange * 0.1,
                        Math.abs(min) * 0.05,
                        50000000 // Minimum 50M padding
                    );

                    return min - minPadding;
                },
                max: function(_value: any) {
                    // Intelligent auto-scaling based on data distribution
                    const getAllValues = () => {
                        if (viewMode === 'DAY') return barData;
                        // For other modes, use both bar and line data for context
                        return [...barData, ...lineData];
                    };

                    const allValues = getAllValues().filter(v => v != null && !isNaN(v));
                    if (allValues.length === 0) return 500000000;

                    // Calculate statistics for intelligent scaling
                    const sortedValues = [...allValues].sort((a, b) => a - b);
                    const min = sortedValues[0];
                    const max = sortedValues[sortedValues.length - 1];
                    const range = max - min;

                    // Use percentiles for better outlier handling
                    const p10 = sortedValues[Math.floor(sortedValues.length * 0.1)];
                    const p90 = sortedValues[Math.floor(sortedValues.length * 0.9)];
                    const effectiveRange = p90 - p10;

                    if (range === 0) {
                        // All values same - create meaningful range
                        const absValue = Math.abs(max);
                        const defaultPadding = Math.max(absValue * 0.3, 200000000);
                        return max + defaultPadding;
                    }

                    // Adaptive padding based on data characteristics
                    let paddingFactor: number;
                    if (viewMode === 'DAY') {
                        // For daily data, use tighter scaling
                        paddingFactor = effectiveRange < range * 0.5 ? 0.15 : 0.05; // More padding if outliers exist
                    } else {
                        paddingFactor = 0.1; // Standard padding for aggregated views
                    }

                    const maxPadding = Math.max(
                        range * paddingFactor,
                        effectiveRange * 0.1,
                        Math.abs(max) * 0.05,
                        50000000 // Minimum 50M padding
                    );

                    return max + maxPadding;
                },
                splitNumber: 6
            },
            series: [
                {
                    name: 'Mua Ròng',
                    type: 'bar',
                    data: barData,
                    barWidth: getBarWidth(),
                    barMaxWidth: viewMode === 'DAY' ? 60 : 50,
                    itemStyle: {
                        color: (p: any) => (p.data >= 0 ? '#16a34a' : '#dc2626'),
                        borderRadius: [2, 2, 0, 0],
                        // Add slight border for daily view to make bars more defined
                        ...(viewMode === 'DAY' && {
                            borderColor: (p: any) => (p.data >= 0 ? '#15803d' : '#b91c1c'),
                            borderWidth: 1
                        })
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0,0,0,0.3)'
                        }
                    }
                },
                {
                    name: 'Tích Lũy',
                    type: 'line',
                    smooth: true,
                    data: lineData,
                    showSymbol: viewMode === 'YEAR' || columnCount === 10 || viewMode === 'DAY',
                    symbol: 'circle',
                    symbolSize: viewMode === 'DAY' ? 6 : 4,
                    lineStyle: {
                        width: viewMode === 'DAY' ? 3 : 2,
                        color: '#22c55e',
                        shadowBlur: viewMode === 'DAY' ? 3 : 2,
                        shadowColor: 'rgba(34, 197, 94, 0.3)'
                    },
                    itemStyle: { color: '#22c55e' },
                    emphasis: {
                        scale: 1.5,
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 2
                        }
                    }
                }
            ]
        } as any;
    }, [xAxisData, barData, lineData, periodLabel, viewMode, columnCount, raw]);

    if (loading) {
        return <div className="min-h-[360px] flex items-center justify-center text-sm text-muted-foreground">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="min-h-[360px] flex items-center justify-center text-sm text-red-500">Lỗi: {error.message}</div>;
    }

    if (!xAxisData.length) {
        return <div className="min-h-[360px] flex items-center justify-center text-sm text-muted-foreground">Không có dữ liệu</div>;
    }

    return (
        <div className="w-full border rounded-md p-4 border-border bg-background">
            <div className="flex flex-col gap-3">
                {/* Header with title */}
                <div className="flex items-center justify-between">
                    <div className="text-base font-semibold">Mua Ròng Của Khối Ngoại (Đơn vị: tỷ VND)</div>
                </div>
                
                {/* Control buttons */}
                <div className="flex items-center justify-between border-t pt-3">
                    {/* View mode selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Xem theo:</span>
                        <ToggleGroup 
                            type="single" 
                            value={viewMode} 
                            onValueChange={(value) => value && setViewMode(value as ViewMode)}
                            className="gap-1"
                        >
                            {VIEW_MODES.map((mode) => (
                                <ToggleGroupItem
                                    key={mode.value}
                                    value={mode.value}
                                    className="h-7 px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                >
                                    {mode.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                    
                    {/* Column count selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Số cột:</span>
                        <ToggleGroup 
                            type="single" 
                            value={columnCount.toString()} 
                            onValueChange={(value) => value && setColumnCount(parseInt(value) as ColumnCount)}
                            className="gap-1"
                        >
                            <ToggleGroupItem
                                value="10"
                                className="h-7 px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                                10
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="20"
                                className="h-7 px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                                20
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
            </div>
            
            {/* Chart */}
            <ReactECharts
                style={{
                    height: (() => {
                        // Dynamic height based on view mode for better visual representation
                        if (viewMode === 'DAY') return 450;
                        if (viewMode === 'WEEK') return 420;
                        if (viewMode === 'MONTH') return 400;
                        return 380; // YEAR
                    })(),
                    width: '100%',
                    marginTop: '16px'
                }}
                option={option}
                notMerge={true}
                lazyUpdate={true}
                opts={{ renderer: 'svg' }}
            />
        </div>
    );
}


