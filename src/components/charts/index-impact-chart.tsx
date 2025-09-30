'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { useIndexImpactChart } from "@/features/market/api/useMarket";
import type { market } from "@/lib/schemas";
import { Loader2 } from 'lucide-react';

type IndexImpactChartParams = {
    group: 'ALL' | 'HOSE' | 'HNX' | 'UPCOM';
    timeFrame: 'ONE_DAY' | 'ONE_WEEK' | 'ONE_MONTH' | 'ONE_YEAR' | 'YTD';
    exchange: 'HOUSE' | 'HNX' | 'UPCOM';
};

export default function IndexImpactChart() {
    const [params, setParams] = useState<IndexImpactChartParams>({
        group: 'ALL',
        timeFrame: 'ONE_DAY',
        exchange: 'HOUSE',
    });
    const [hoveredItem, setHoveredItem] = useState<market.IndexImpactItem | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const { data, isLoading, error, isRefetching } = useIndexImpactChart(params);

    const timeFrameOptions = [
        { value: 'ONE_DAY', label: 'Hôm nay' },
        { value: 'ONE_WEEK', label: '1W' },
        { value: 'ONE_MONTH', label: '1M' },
        { value: 'ONE_YEAR', label: '1Y' },
        { value: 'YTD', label: 'YTD' },
    ] as const;

    const formatValue = (value: number) => {
        return value.toFixed(2);
    };

    const formatPrice = (price?: string | number | null) => {
        if (!price) return '-';
        const n = Number(price);
        if (Number.isNaN(n)) return '-';
        return n.toLocaleString('vi-VN');
    };

    const handleTimeFrameChange = (timeFrame: IndexImpactChartParams['timeFrame']) => {
        setParams(prev => ({ ...prev, timeFrame }));
    };

    const handleGroupChange = (group: IndexImpactChartParams['group']) => {
        const exchangeMap: Record<IndexImpactChartParams['group'], IndexImpactChartParams['exchange']> = {
            ALL: 'HOUSE',
            HOSE: 'HOUSE',
            HNX: 'HNX',
            UPCOM: 'UPCOM',
        };
        setParams(prev => ({ ...prev, group, exchange: exchangeMap[group] }));
    };

    const handleMouseEnter = (item: market.IndexImpactItem, event: React.MouseEvent) => {
        setHoveredItem(item);
        setTooltipPosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    const Tooltip = () => {
        if (!hoveredItem) return null;

        return (
            <div 
                className="fixed z-50 bg-background border border-border rounded-lg shadow-xs p-4 max-w-sm"
                style={{ 
                    left: tooltipPosition.x + 10, 
                    top: tooltipPosition.y - 10,
                    pointerEvents: 'none'
                }}
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-foreground">{hoveredItem.symbol}</span>
                        <span className="text-sm text-muted-foreground">({hoveredItem.exchange})</span>
                    </div>
                    <div className="text-sm text-foreground">
                        <div className="font-medium">{hoveredItem.organShortName}</div>
                        <div className="text-xs text-muted-foreground">{hoveredItem.organName}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="font-medium text-foreground">{formatPrice(hoveredItem.matchPrice)} VND</div>
                            <span className={`font-medium ml-1 ${hoveredItem.impact >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {(() => {
                                    const m = hoveredItem.matchPrice ? Number(hoveredItem.matchPrice) : NaN;
                                    const r = hoveredItem.refPrice ? Number(hoveredItem.refPrice) : NaN;
                                    if (Number.isFinite(m) && Number.isFinite(r) && r !== 0) {
                                        return (((m / r) - 1) * 100).toFixed(2) + '%';
                                    }
                                    return '-';
                                })()}
                            </span>
                    </div>
                </div>
            </div>
        );
    };

    // Skeleton component for loading state
    const SkeletonChart = () => (
        <div className="grid grid-cols-2 gap-4">
            {/* Đóng góp tăng skeleton */}
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
                            <div className="flex-1 bg-muted rounded-full h-3 animate-pulse"></div>
                            <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Đóng góp giảm skeleton */}
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
                            <div className="flex-1 bg-muted rounded-full h-3 animate-pulse"></div>
                            <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        Nhóm dẫn dắt thị trường
                        <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
                    </CardTitle>
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-0 border rounded-md w-fit border-border">
                            {timeFrameOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    variant={params.timeFrame === option.value ? 'default' : 'ghost'}
                                    size="sm"
                                    className="px-2"
                                    onClick={() => handleTimeFrameChange(option.value)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>

                        <div className="flex items-center gap-0 border rounded-md w-fit border-border">
                            <Select value={params.group} onValueChange={handleGroupChange}>
                                <SelectTrigger size="sm" className="border-0 rounded-none">
                                    <SelectValue placeholder="Sàn" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">Tất cả</SelectItem>
                                    <SelectItem value="HOSE" className="text-xs">HOSE</SelectItem>
                                    <SelectItem value="HNX" className="text-xs">HNX</SelectItem>
                                    <SelectItem value="UPCOM" className="text-xs">UPCOM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <SkeletonChart />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Nhóm dẫn dắt thị trường</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-red-500">
                        <span>Lỗi khi tải dữ liệu: {error.message}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || (data.topUp.length === 0 && data.topDown.length === 0)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        Nhóm dẫn dắt thị trường
                        {isRefetching && (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
                        )}
                    </CardTitle>
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-0 border rounded-md w-fit border-border">
                            {timeFrameOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    variant={params.timeFrame === option.value ? 'default' : 'ghost'}
                                    size="sm"
                                    className="px-2"
                                    onClick={() => handleTimeFrameChange(option.value)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>

                        <div className="flex items-center gap-0 border rounded-md w-fit border-border">
                            <Select value={params.group} onValueChange={handleGroupChange}>
                                <SelectTrigger size="sm" className="border-0 rounded-none">
                                    <SelectValue placeholder="Sàn" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">Tất cả</SelectItem>
                                    <SelectItem value="HOSE" className="text-xs">HOSE</SelectItem>
                                    <SelectItem value="HNX" className="text-xs">HNX</SelectItem>
                                    <SelectItem value="UPCOM" className="text-xs">UPCOM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <span>Không có dữ liệu cho khoảng thời gian này</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const TOP_DOWN = [...data.topDown].sort((a, b) => a.impact - b.impact);
    const TOP_UP = [...data.topUp].sort((a, b) => b.impact - a.impact);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Nhóm dẫn dắt thị trường
                    {isRefetching && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
                    )}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-0 border rounded-md w-fit border-border">
                            {timeFrameOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    variant={params.timeFrame === option.value ? 'default' : 'ghost'}
                                    size="sm"
                                    className="px-2"
                                    onClick={() => handleTimeFrameChange(option.value)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>

                        <div className="flex items-center gap-0 border rounded-md w-fit border-border">
                            <Select value={params.group} onValueChange={handleGroupChange}>
                                <SelectTrigger size="sm" className="border-0 rounded-none">
                                    <SelectValue placeholder="Sàn" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">Tất cả</SelectItem>
                                    <SelectItem value="HOSE" className="text-xs">HOSE</SelectItem>
                                    <SelectItem value="HNX" className="text-xs">HNX</SelectItem>
                                    <SelectItem value="UPCOM" className="text-xs">UPCOM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 min-h-[300px]">
                    {/* Đóng góp tăng */}
                    {TOP_UP.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-center text-foreground uppercase mb-4">
                                Đóng góp tăng
                            </h3>
                            <div className="space-y-2">
                                {TOP_UP.map((item: market.IndexImpactItem) => (
                                    <div 
                                        key={item.symbol} 
                                        className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded transition-colors"
                                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span className="text-green-600 dark:text-green-400 text-sm font-medium w-12 text-right">
                                            {formatValue(item.impact)}
                                        </span>
                                        <div className="flex-1 bg-muted rounded-full h-3 relative">
                                            <div 
                                                className="bg-green-500 dark:bg-green-400 h-3 rounded-full transition-all duration-200 hover:bg-green-600 dark:hover:bg-green-300"
                                                style={{ 
                                                    width: `${Math.min((item.impact / Math.max(...TOP_UP.map((i: market.IndexImpactItem) => i.impact))) * 100, 100)}%`,
                                                    marginLeft: 'auto'
                                                }}
                                            />
                                        </div>
                                        <span className="text-foreground text-sm font-medium w-12">
                                            {item.symbol}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Đóng góp giảm */}
                    {TOP_DOWN.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-center text-foreground uppercase mb-4">
                                Đóng góp giảm
                            </h3>
                            <div className="space-y-2">
                                {TOP_DOWN.map((item: market.IndexImpactItem) => (
                                    <div 
                                        key={item.symbol} 
                                        className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded transition-colors"
                                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span className="text-foreground text-sm font-medium w-12">
                                            {item.symbol}
                                        </span>
                                        <div className="flex-1 bg-muted rounded-full h-3 relative">
                                            <div 
                                                className="bg-red-500 dark:bg-red-400 h-3 rounded-full transition-all duration-200 hover:bg-red-600 dark:hover:bg-red-300"
                                                style={{ 
                                                    width: `${Math.min((Math.abs(item.impact) / Math.max(...TOP_DOWN.map((i: market.IndexImpactItem) => Math.abs(i.impact)))) * 100, 100)}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="text-red-600 dark:text-red-400 text-sm font-medium w-12 text-right">
                                            {formatValue(item.impact)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <Tooltip />
        </Card>
    )
}