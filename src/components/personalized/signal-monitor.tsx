import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    AlertTriangle,
    Activity,
    RefreshCcw,
    Wifi,
    WifiOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVirtualPortfolio } from '@/hooks/use-virtual-trading'
import { useSignalsWebSocket } from '@/hooks/use-signals-websocket'
import { Button } from '@/components/ui/button'
import { useMemo } from 'react'
import type { SignalDataItem } from '@/lib/schemas/signals'

export function SignalMonitor() {
    const { data: portfolio, isLoading: isPortfolioLoading } = useVirtualPortfolio()

    // Extract symbols from holdings
    const symbols = useMemo(() => {
        return portfolio?.holdings?.map(holding => holding.symbolCode) || []
    }, [portfolio?.holdings])

    // Use WebSocket for real-time signals
    const {
        signals: signalsData,
        isConnected,
        isConnecting,
        error: wsError,
        reconnect,
        usingFallback
    } = useSignalsWebSocket(symbols, {
        enabled: symbols.length > 0,
        interval: 60000, // Update every 60 seconds
        onConnected: () => {
        },
        onError: (error) => {
        },
        autoReconnect: true,
        reconnectDelay: 5000,
    })

    const isLoading = isPortfolioLoading || isConnecting

    // Filter signals - only show stocks with active signals
    const filteredSignals = useMemo(() => {
        if (!signalsData || signalsData.length === 0) return []

        return signalsData.filter(signal => {
            // Check if any signal is active
            const hasActiveSignal = Object.values(signal.analysis.signals).some(Boolean)
            return hasActiveSignal
        })
    }, [signalsData])

    // Render signal card
    const renderSignalCard = (signal: SignalDataItem) => {
        const { analysis, indicators, price, priceVsEMA20 } = signal

        // Trend configuration
        const trendConfig = {
            UPTREND: { 
                label: 'UPTREND',
                bg: 'bg-green-500/10',
                text: 'text-green-700'
            },
            DOWNTREND: {
                label: 'DOWNTREND',
                bg: 'bg-red-500/10',
                text: 'text-red-700'
            },
            SIDEWAYS: {
                label: 'SIDEWAYS',
                bg: 'bg-gray-500/10',
                text: 'text-gray-700'
            },
        }

        // Signal badges
        const signalBadges = [
            { key: 'xuHuongTang', label: '📈 Xu hướng tăng', show: analysis.signals.xuHuongTang, className: 'bg-green-500/10 text-green-700' },
            { key: 'suyYeu', label: '⚠️ Suy yếu', show: analysis.signals.suyYeu, className: 'bg-orange-500/10 text-orange-700' },
            { key: 'tinHieuBan', label: '📉 Tín hiệu bán', show: analysis.signals.tinHieuBan, className: 'bg-red-500/10 text-red-700' },
            { key: 'quaMua', label: '⚡ Quá mua', show: analysis.signals.quaMua, className: 'bg-purple-500/10 text-purple-700' },
            { key: 'quaBan', label: '💎 Quá bán', show: analysis.signals.quaBan, className: 'bg-blue-500/10 text-blue-700' },
        ]

        return (
            <Card key={signal.symbol} className="overflow-hidden hover:shadow transition-shadow py-0">
                <CardContent className="p-4 pb-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">{signal.symbol}</h3>
                            {/* Signal Badges */}
                            <div className="flex flex-col gap-1">
                                {signalBadges.filter(b => b.show).map(badge => (
                                    <Badge key={badge.key} className={cn("text-xs", badge.className)}>
                                        {badge.label}
                                    </Badge>
                                ))}
                            </div>

                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                                {price.toLocaleString('vi-VN')} đ
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* RSI */}
                        <div className="bg-muted/50 rounded p-3">
                            <div className="text-xs text-muted-foreground mb-1">RSI</div>
                            <div className="text-base font-bold">{indicators.rsi.toFixed(2)}</div>
                        </div>

                        {/* MACD */}
                        <div className="bg-muted/50 rounded p-3">
                            <div className="text-xs text-muted-foreground mb-1">MACD</div>
                            <div className="text-base font-bold">{indicators.macd.macd.toFixed(2)}</div>
                        </div>

                        {/* Return 1D */}
                        <div className="bg-muted/50 rounded p-3">
                            <div className="text-xs text-muted-foreground mb-1">Return 1D</div>
                            <div className={cn(
                                "text-base font-bold",
                                indicators.return1D >= 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                                {indicators.return1D >= 0 ? '+' : ''}{indicators.return1D.toFixed(2)}%
                            </div>
                        </div>

                        {/* Price vs EMA20 */}
                        <div className="bg-muted/50 rounded p-3">
                            <div className="text-xs text-muted-foreground mb-1">Price vs EMA20</div>
                            <div className={cn(
                                "text-base font-bold",
                                priceVsEMA20 >= 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                                {priceVsEMA20 >= 0 ? '+' : ''}{priceVsEMA20.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* No signals message */}
                    {signalBadges.every(b => !b.show) && (
                        <div className="text-sm text-muted-foreground text-center py-2">
                            Không có tín hiệu
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tín hiệu và cảnh báo realtime</CardTitle>
                    <CardDescription>Phân tích kỹ thuật cho danh mục đầu tư</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                                <div className="flex-1">
                                    <div className="h-5 w-20 bg-muted rounded mb-2" />
                                    <div className="h-4 w-32 bg-muted rounded" />
                                </div>
                                <div className="h-6 w-24 bg-muted rounded" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!portfolio || symbols.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tín hiệu và cảnh báo realtime</CardTitle>
                    <CardDescription>Phân tích kỹ thuật cho danh mục đầu tư</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Không có cổ phiếu trong danh mục</p>
                        <p className="text-sm mt-2">Hãy mua cổ phiếu để theo dõi </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!signalsData || signalsData.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Tín hiệu và cảnh báo realtime</h2>
                        <p className="text-sm text-muted-foreground">Phân tích kỹ thuật cho danh mục đầu tư</p>
                    </div>
                <div className="flex items-center gap-2">
                    {/* Connection Status */}
                    <Badge 
                        variant={isConnected || usingFallback ? "default" : wsError ? "destructive" : "secondary"} 
                        className="gap-1"
                    >
                        {isConnected ? (
                            <>
                                <Wifi className="h-3 w-3" />
                                <span>WebSocket</span>
                            </>
                        ) : usingFallback ? (
                            <>
                                <RefreshCcw className="h-3 w-3" />
                                <span>HTTP Polling</span>
                            </>
                        ) : wsError ? (
                            <>
                                <AlertTriangle className="h-3 w-3" />
                                <span>Lỗi kết nối</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-3 w-3" />
                                <span>Chưa kết nối</span>
                            </>
                        )}
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reconnect()}
                        disabled={isConnecting}
                        className="h-9"
                    >
                        <RefreshCcw className={cn("h-4 w-4 mr-2", isConnecting && "animate-spin")} />
                        {isConnecting ? 'Đang kết nối...' : 'Kết nối lại'}
                    </Button>
                </div>
                </div>
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                            {wsError ? (
                                <>
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50 text-orange-500" />
                                    <p className="font-medium text-foreground">Lỗi kết nối</p>
                                    <p className="text-sm mt-2 max-w-md mx-auto">
                                        {wsError}
                                    </p>
                                    <p className="text-xs mt-4 text-muted-foreground">
                                        Nhấn "Kết nối lại" để thử lại hoặc kiểm tra xem máy chủ WebSocket có đang chạy không.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Không có dữ liệu tín hiệu</p>
                                    <p className="text-sm mt-2">Đang chờ dữ liệu từ server...</p>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Count active signals from filtered data
    const totalSignals = filteredSignals.reduce((count, item) => {
        const activeCount = Object.values(item.analysis.signals).filter(Boolean).length
        return count + activeCount
    }, 0)

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-semibold">Tín hiệu và cảnh báo realtime</h2>
                        {/* Real-time indicator */}
                        {(isConnected || usingFallback) && (
                            <Badge variant="default" className="gap-1 animate-pulse">
                                {isConnected ? (
                                    <>
                                        <Wifi className="h-3 w-3" />
                                        <span>Live</span>
                                    </>
                                ) : (
                                    <>
                                        <RefreshCcw className="h-3 w-3" />
                                        <span>Polling</span>
                                    </>
                                )}
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {filteredSignals.length} mã có tín hiệu • {totalSignals} tín hiệu hoạt động
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Connection Status */}
                    <Badge 
                        variant={isConnected || usingFallback ? "default" : wsError ? "destructive" : "secondary"} 
                        className="gap-1"
                    >
                        {isConnected ? (
                            <>
                                <Wifi className="h-3 w-3" />
                                <span>WebSocket</span>
                            </>
                        ) : usingFallback ? (
                            <>
                                <RefreshCcw className="h-3 w-3" />
                                <span>HTTP Polling</span>
                            </>
                        ) : wsError ? (
                            <>
                                <AlertTriangle className="h-3 w-3" />
                                <span>Lỗi kết nối</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-3 w-3" />
                                <span>Chưa kết nối</span>
                            </>
                        )}
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reconnect()}
                        disabled={isConnecting}
                        className="h-9"
                    >
                        <RefreshCcw className={cn("h-4 w-4 mr-2", isConnecting && "animate-spin")} />
                        {isConnecting ? 'Đang kết nối...' : 'Kết nối lại'}
                    </Button>
                </div>
            </div>

            {/* Signal Cards Grid */}
            {filteredSignals.length > 0 ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        {filteredSignals.map(signal => renderSignalCard(signal))}
                    </div>
                </>
            ) : (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">Không có mã nào có tín hiệu</p>
                            <p className="text-sm mt-2">Tất cả các mã trong danh mục đều không có Tín hiệu và cảnh báo realtime</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

