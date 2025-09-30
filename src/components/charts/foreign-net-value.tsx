'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { useForeignNetValueTop } from '@/features/market/api/useMarket';
import { type market } from '@/lib/schemas';

type ForeignNetValueParams = {
    group: 'ALL' | 'HOSE' | 'HNX' | 'UPCOM';
    timeFrame: 'ONE_DAY' | 'ONE_WEEK' | 'ONE_MONTH' | 'ONE_YEAR' | 'YTD' | 'ALL';
};
type ForeignNetValueItem = market.ForeignNetTopItem;

export default function ForeignNetValue() {
    const [params, setParams] = useState<ForeignNetValueParams>({
        group: 'ALL',
        timeFrame: 'ONE_DAY',
    });
    const [hoveredItem, setHoveredItem] = useState<ForeignNetValueItem | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Compute VN timezone start/end (unix seconds)
    const computeVnDayBounds = (date: Date) => {
        const vnOffsetMs = 7 * 60 * 60 * 1000;
        const vnMs = date.getTime() + vnOffsetMs;
        const vn = new Date(vnMs);
        const startOfDayUtcMs = Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate(), 0, 0, 0, 0) - vnOffsetMs;
        const endOfDayUtcMs = Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate(), 23, 59, 59, 999) - vnOffsetMs;
        return {
            startSec: Math.floor(startOfDayUtcMs / 1000),
            endSec: Math.floor(endOfDayUtcMs / 1000),
        };
    };

    const now = new Date();
    let range = computeVnDayBounds(now);
    if (params.timeFrame === 'ONE_WEEK') {
        const end = computeVnDayBounds(now).endSec;
        const start = end - 7 * 24 * 60 * 60;
        range = { startSec: start, endSec: end };
    } else if (params.timeFrame === 'ONE_MONTH') {
        const end = computeVnDayBounds(now).endSec;
        const start = end - 30 * 24 * 60 * 60;
        range = { startSec: start, endSec: end };
    } else if (params.timeFrame === 'ONE_YEAR') {
        const end = computeVnDayBounds(now).endSec;
        const start = end - 365 * 24 * 60 * 60;
        range = { startSec: start, endSec: end };
    } else if (params.timeFrame === 'YTD') {
        const vnOffsetMs = 7 * 60 * 60 * 1000;
        const vnMs = now.getTime() + vnOffsetMs;
        const vn = new Date(vnMs);
        const startUtcMs = Date.UTC(vn.getUTCFullYear(), 0, 1, 0, 0, 0, 0) - vnOffsetMs;
        const endUtcMs = Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate(), 23, 59, 59, 999) - vnOffsetMs;
        range = { startSec: Math.floor(startUtcMs / 1000), endSec: Math.floor(endUtcMs / 1000) };
    }

    const { data, isLoading, error } = useForeignNetValueTop({
        group: params.group,
        timeFrame: params.timeFrame,
        from: range.startSec,
        to: range.endSec,
    });

    const timeFrameOptions = [
        { value: 'ONE_DAY', label: 'Hôm nay' },
        { value: 'ONE_WEEK', label: '1W' },
        { value: 'ONE_MONTH', label: '1M' },
        { value: 'ONE_YEAR', label: '1Y' },
        { value: 'YTD', label: 'YTD' },
    ] as const;

    const formatValue = (value: number) => {
        const absValue = Math.abs(value);
        if (absValue >= 1e12) return (value / 1e12).toFixed(1) + 'T';
        if (absValue >= 1e9) return (value / 1e9).toFixed(1) + 'B';
        if (absValue >= 1e6) return (value / 1e6).toFixed(0) + 'M';
        if (absValue >= 1e3) return (value / 1e3).toFixed(0) + 'K';
        return value.toFixed(0);
    };

    const formatPrice = (price: number) => price.toLocaleString('vi-VN');

    const handleTimeFrameChange = (timeFrame: ForeignNetValueParams['timeFrame']) => {
        setParams(prev => ({ ...prev, timeFrame }));
    };

    const handleGroupChange = (group: ForeignNetValueParams['group']) => {
        setParams(prev => ({ ...prev, group }));
    };

    const handleMouseEnter = (item: ForeignNetValueItem, event: React.MouseEvent) => {
        setHoveredItem(item);
        setTooltipPosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    const Tooltip = () => {
        if (!hoveredItem) return null;

        const netNumber = Number(hoveredItem.net);
        const buyValue = Number(hoveredItem.foreignBuyValue);
        const sellValue = Number(hoveredItem.foreignSellValue);

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
                        <div>
                            <span className="text-muted-foreground">Giá khớp:</span>
                            <div className="font-medium text-foreground">{formatPrice(Number(hoveredItem.matchPrice))} VND</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Giá tham chiếu:</span>
                            <div className="font-medium text-foreground">{formatPrice(Number(hoveredItem.refPrice))} VND</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Mua:</span>
                            <div className="font-medium text-green-600 dark:text-green-400">{formatValue(buyValue)} VND</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Bán:</span>
                            <div className="font-medium text-red-600 dark:text-red-400">{formatValue(sellValue)} VND</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Ròng:</span>
                            <div className={`font-medium ${netNumber >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatValue(netNumber)} VND</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const SkeletonChart = () => (
        <div className="grid grid-cols-2 gap-4">
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
            <Card className='border-none p-0'>
                <CardHeader>
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
                                    <SelectValue placeholder="Nhóm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">ALL</SelectItem>
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
            <Card className='border-none p-0'>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-red-500">
                        <span>Lỗi khi tải dữ liệu: {error.message}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || (data.netBuy.length === 0 && data.netSell.length === 0)) {
        return (
            <Card className='border-none p-0'>
                <CardHeader>
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
                                    <SelectValue placeholder="Nhóm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL" className="text-xs">ALL</SelectItem>
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

    const NET_BUY_ITEMS = [...data.netBuy].sort((a, b) => Number(b.net) - Number(a.net));
    const NET_SELL_ITEMS = [...data.netSell].sort((a, b) => Number(a.net) - Number(b.net));

    const maxBuy = Math.max(...NET_BUY_ITEMS.map(i => Math.abs(Number(i.net))), 1);
    const maxSell = Math.max(...NET_SELL_ITEMS.map(i => Math.abs(Number(i.net))), 1);

    return (
        <Card className='border-none p-0'>
            <CardHeader>
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
                                <SelectValue placeholder="Nhóm" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL" className="text-xs">ALL</SelectItem>
                                <SelectItem value="HOSE" className="text-xs">HOSE</SelectItem>
                                <SelectItem value="HNX" className="text-xs">HNX</SelectItem>
                                <SelectItem value="UPCOM" className="text-xs">UPCOM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 min-h-[300px]">
                    {/* Mua ròng */}
                    {NET_BUY_ITEMS.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-center text-foreground uppercase mb-4">
                                Mua ròng
                            </h3>
                            <div className="space-y-2">
                                {NET_BUY_ITEMS.map((item: ForeignNetValueItem) => {
                                    const net = Math.abs(Number(item.net));
                                    return (
                                        <div 
                                            key={item.symbol} 
                                            className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded transition-colors"
                                            onMouseEnter={(e) => handleMouseEnter(item, e)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <span className="text-green-600 dark:text-green-400 text-sm font-medium w-12 text-right">
                                                {formatValue(net)}
                                            </span>
                                            <div className="flex-1 bg-muted rounded-full h-3 relative">
                                                <div 
                                                    className="bg-green-500 dark:bg-green-400 h-3 rounded-full transition-all duration-200 hover:bg-green-600 dark:hover:bg-green-300"
                                                    style={{ 
                                                        width: `${Math.min((net / maxBuy) * 100, 100)}%`,
                                                        marginLeft: 'auto'
                                                    }}
                                                />
                                            </div>
                                            <span className="text-foreground text-sm font-medium w-12">
                                                {item.symbol}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Bán ròng */}
                    {NET_SELL_ITEMS.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-center text-foreground uppercase mb-4">
                                Bán ròng
                            </h3>
                            <div className="space-y-2">
                                {NET_SELL_ITEMS.map((item: ForeignNetValueItem) => {
                                    const net = Math.abs(Number(item.net));
                                    return (
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
                                                        width: `${Math.min((net / maxSell) * 100, 100)}%` 
                                                    }}
                                                />
                                            </div>
                                            <span className="text-red-600 dark:text-red-400 text-sm font-medium w-12 text-right">
                                                {formatValue(net)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <Tooltip />
        </Card>
    )
}