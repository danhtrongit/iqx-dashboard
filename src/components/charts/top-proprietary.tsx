'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { useTopProprietary } from '@/features/market/api/useMarket';
import { type market } from '@/lib/schemas';

type TopProprietaryParams = {
    exchange: 'ALL' | 'HOSE' | 'HNX' | 'UPCOM';
    timeFrame: 'ONE_DAY' | 'ONE_WEEK' | 'ONE_MONTH' | 'ONE_YEAR' | 'YTD' | 'ALL';
};
type TopProprietaryItem = market.TopProprietaryItem;

export default function TopProprietary() {
    const [params, setParams] = useState<TopProprietaryParams>({
        exchange: 'ALL',
        timeFrame: 'ONE_DAY',
    });
    const [hoveredItem, setHoveredItem] = useState<TopProprietaryItem | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const { data, isLoading, error } = useTopProprietary(params);

    const timeFrameOptions = [
        { value: 'ONE_DAY', label: 'Hôm nay' },
        { value: 'ONE_WEEK', label: '1W' },
        { value: 'ONE_MONTH', label: '1M' },
        { value: 'ONE_YEAR', label: '1Y' },
        { value: 'YTD', label: 'YTD' },
    ] as const;

    const formatValue = (value: number) => {
        if (Math.abs(value) >= 1e9) {
            return (value / 1e9).toFixed(1) + 'B';
        } else if (Math.abs(value) >= 1e6) {
            return (value / 1e6).toFixed(1) + 'M';
        } else if (Math.abs(value) >= 1e3) {
            return (value / 1e3).toFixed(1) + 'K';
        }
        return value.toFixed(0);
    };

    const toNumber = (value: number | string | null | undefined) => {
        if (value === null || value === undefined) return 0;
        return typeof value === 'number' ? value : Number(value);
    };

    const formatPrice = (price: number | string | null | undefined) => {
        const n = toNumber(price);
        return n.toLocaleString('vi-VN');
    };

    const formatVolume = (volume: number) => {
        if (volume >= 1e6) {
            return (volume / 1e6).toFixed(1) + 'M';
        } else if (volume >= 1e3) {
            return (volume / 1e3).toFixed(1) + 'K';
        }
        return volume.toFixed(0);
    };

    const handleTimeFrameChange = (timeFrame: TopProprietaryParams['timeFrame']) => {
        setParams(prev => ({ ...prev, timeFrame }));
    };

    const handleExchangeChange = (exchange: TopProprietaryParams['exchange']) => {
        setParams(prev => ({ ...prev, exchange }));
    };

    const handleMouseEnter = (item: TopProprietaryItem, event: React.MouseEvent) => {
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
                        <span className="font-bold text-lg text-foreground">{hoveredItem.ticker}</span>
                        <span className="text-sm text-muted-foreground">({hoveredItem.exchange})</span>
                    </div>
                    <div className="text-sm text-foreground">
                        <div className="font-medium">{hoveredItem.organShortName}</div>
                        <div className="text-xs text-muted-foreground">{hoveredItem.organName}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Giá khớp:</span>
                            <div className="font-medium text-foreground">{formatPrice(hoveredItem.matchPrice)} VND</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Giá tham chiếu:</span>
                            <div className="font-medium text-foreground">{formatPrice(hoveredItem.refPrice)} VND</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Tổng giá trị:</span>
                            <div className="font-medium text-foreground">{formatValue(hoveredItem.totalValue)} VND</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Tổng khối lượng:</span>
                            <div className="font-medium text-foreground">{formatVolume(hoveredItem.totalVolume)}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Skeleton component for loading state
    const SkeletonChart = () => (
        <div className="grid grid-cols-2 gap-4">
            {/* Mua ròng skeleton */}
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
            
            {/* Bán ròng skeleton */}
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
                            <Select value={params.exchange} onValueChange={handleExchangeChange}>
                                <SelectTrigger size="sm" className="border-0 rounded-none">
                                    <SelectValue placeholder="Sàn" />
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
            <Card>
                <CardHeader>
                    <CardTitle>Tự doanh</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-red-500">
                        <span>Lỗi khi tải dữ liệu: {error.message}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || (data.data.BUY.length === 0 && data.data.SELL.length === 0)) {
        return (
            <Card>
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
                            <Select value={params.exchange} onValueChange={handleExchangeChange}>
                                <SelectTrigger size="sm" className="border-0 rounded-none">
                                    <SelectValue placeholder="Sàn" />
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

    const BUY_ITEMS = [...data.data.BUY].sort((a, b) => b.totalValue - a.totalValue); // Sort descending (highest first)
    const SELL_ITEMS = [...data.data.SELL].sort((a, b) => a.totalValue - b.totalValue); // Sort ascending (most negative first)

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
                            <Select value={params.exchange} onValueChange={handleExchangeChange}>
                            <SelectTrigger size="sm" className="border-0 rounded-none">
                                <SelectValue placeholder="Sàn" />
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
                    {BUY_ITEMS.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-center text-foreground uppercase mb-4">
                                Mua ròng
                            </h3>
                            <div className="space-y-2">
                                {BUY_ITEMS.map((item: TopProprietaryItem) => (
                                    <div 
                                        key={item.ticker} 
                                        className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded transition-colors"
                                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span className="text-green-600 dark:text-green-400 text-sm font-medium w-12 text-right">
                                            {formatValue(item.totalValue)}
                                        </span>
                                        <div className="flex-1 bg-muted rounded-full h-3 relative">
                                            <div 
                                                className="bg-green-500 dark:bg-green-400 h-3 rounded-full transition-all duration-200 hover:bg-green-600 dark:hover:bg-green-300"
                                                style={{ 
                                                    width: `${Math.min((item.totalValue / Math.max(...BUY_ITEMS.map((i: TopProprietaryItem) => i.totalValue))) * 100, 100)}%`,
                                                    marginLeft: 'auto'
                                                }}
                                            />
                                        </div>
                                        <span className="text-foreground text-sm font-medium w-12">
                                            {item.ticker}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bán ròng */}
                    {SELL_ITEMS.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-center text-foreground uppercase mb-4">
                                Bán ròng
                            </h3>
                            <div className="space-y-2">
                                {SELL_ITEMS.map((item: TopProprietaryItem) => (
                                    <div 
                                        key={item.ticker} 
                                        className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded transition-colors"
                                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span className="text-foreground text-sm font-medium w-12">
                                            {item.ticker}
                                        </span>
                                        <div className="flex-1 bg-muted rounded-full h-3 relative">
                                            <div 
                                                className="bg-red-500 dark:bg-red-400 h-3 rounded-full transition-all duration-200 hover:bg-red-600 dark:hover:bg-red-300"
                                                style={{ 
                                                    width: `${Math.min((Math.abs(item.totalValue) / Math.max(...SELL_ITEMS.map((i: TopProprietaryItem) => Math.abs(i.totalValue)))) * 100, 100)}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="text-red-600 dark:text-red-400 text-sm font-medium w-12 text-right">
                                            {formatValue(item.totalValue)}
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
