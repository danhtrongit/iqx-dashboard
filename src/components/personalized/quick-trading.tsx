import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, Check } from 'lucide-react'
import { useBuyStock, useSellStock, useVirtualPortfolio, useStockPrice } from '@/hooks/use-virtual-trading'
import { VirtualTradingService } from '@/services/virtual-trading.service'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export function QuickTrading() {
  const [symbol, setSymbol] = useState('FPT')
  const [quantity, setQuantity] = useState('')
  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY')
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET')
  const [limitPrice, setLimitPrice] = useState('')

  const { data: portfolio } = useVirtualPortfolio()
  const buyMutation = useBuyStock()
  const sellMutation = useSellStock()
  
  // Fetch stock price for current symbol
  const { data: stockPrice } = useStockPrice(symbol, {
    enabled: !!symbol && symbol.length >= 3,
    refetchInterval: 30000,
  })

  const holding = portfolio?.holdings.find(h => h.symbolCode === symbol)
  // Prefer real-time price from API, fallback to holding price
  const currentPrice = stockPrice?.currentPrice || holding?.currentPrice || 0
  
  // Use limit price if LIMIT order, otherwise use current market price
  const executionPrice = orderType === 'LIMIT' && limitPrice 
    ? parseFloat(limitPrice) 
    : currentPrice
    
  const totalAmount = parseInt(quantity || '0') * executionPrice
  const calculation = VirtualTradingService.calculateTradingCost(totalAmount, mode)
  const isLoading = buyMutation.isPending || sellMutation.isPending

  const handleExecute = async () => {
    if (!symbol || !quantity || parseInt(quantity) <= 0) {
      toast.error('Vui lòng nhập thông tin hợp lệ')
      return
    }

    // Validate limit price for LIMIT orders
    if (orderType === 'LIMIT') {
      if (!limitPrice || parseFloat(limitPrice) <= 0) {
        toast.error('Vui lòng nhập giá giới hạn hợp lệ')
        return
      }
    }

    try {
      const qty = parseInt(quantity)
      const orderData = {
        symbolCode: symbol,
        quantity: qty,
        orderType,
        ...(orderType === 'LIMIT' && { limitPrice: parseFloat(limitPrice) }),
      }

      if (mode === 'BUY') {
        await buyMutation.mutateAsync(orderData)
      } else {
        await sellMutation.mutateAsync(orderData)
      }
      
      // Reset form after success
      setQuantity('')
      if (orderType === 'LIMIT') {
        setLimitPrice('')
      }
    } catch (error) {
      // Error already shown by mutation hook
    }
  }

  return (
    <Card className="pt-0 relative overflow-hidden h-full">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Đặt lệnh</h3>
        </div>
        <div className="text-right">
          <p className="text-base text-muted-foreground">Số dư</p>
          <p className="text-lg font-bold tabular-nums">
            {(portfolio?.cashBalance || 0).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-3 space-y-2.5">
        {/* Symbol & Mode */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Mã CK</label>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="FPT"
              className="h-9 text-center font-bold uppercase"
            />
            <p className="text-[10px] text-muted-foreground text-center">
              {currentPrice > 0 ? currentPrice.toLocaleString('vi-VN') : '0'} VND
              {holding && ` • SL: ${holding.quantity.toLocaleString('vi-VN')}`}
            </p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Loại</label>
            <div className="grid grid-cols-2 gap-1 p-0.5 bg-muted/30 rounded-md h-9">
              <button
                onClick={() => setMode('BUY')}
                className={cn(
                  "rounded text-xs font-semibold transition-all",
                  mode === 'BUY' ? "bg-green-600 text-white" : "text-muted-foreground"
                )}
              >
                MUA
              </button>
              <button
                onClick={() => setMode('SELL')}
                className={cn(
                  "rounded text-xs font-semibold transition-all",
                  mode === 'SELL' ? "bg-red-600 text-white" : "text-muted-foreground"
                )}
              >
                BÁN
              </button>
            </div>
          </div>
        </div>

        {/* Order Type */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Loại lệnh</label>
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-muted/30 rounded-md h-9">
            <button
              onClick={() => {
                setOrderType('MARKET')
                setLimitPrice('')
              }}
              className={cn(
                "rounded text-xs font-semibold transition-all",
                orderType === 'MARKET' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Thị trường
            </button>
            <button
              onClick={() => setOrderType('LIMIT')}
              className={cn(
                "rounded text-xs font-semibold transition-all",
                orderType === 'LIMIT' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Giới hạn
            </button>
          </div>
        </div>

        {/* Limit Price (only for LIMIT orders) */}
        {orderType === 'LIMIT' && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Giá giới hạn</label>
            <Input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={currentPrice > 0 ? currentPrice.toString() : '0'}
              className="h-9 text-center font-semibold tabular-nums"
            />
            <p className="text-[10px] text-muted-foreground text-center">
              Giá thị trường: {currentPrice.toLocaleString('vi-VN')} VND
            </p>
          </div>
        )}

        {/* Quantity */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <label className="text-xs text-muted-foreground">Khối lượng</label>
            <button
              onClick={() => {
                if (currentPrice <= 0) return
                const maxQty = mode === 'BUY' 
                  ? VirtualTradingService.getMaxPurchaseQuantity(portfolio?.cashBalance || 0, currentPrice)
                  : holding?.quantity || 0
                setQuantity(maxQty.toString())
              }}
              className="text-[10px] text-primary hover:underline"
            >
              Tối đa
            </button>
          </div>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="h-10 text-center text-lg font-semibold tabular-nums"
          />
        </div>

        {/* Summary */}
        <div className="space-y-1 p-2.5 rounded-md bg-muted/30 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tổng</span>
            <span className="font-semibold tabular-nums">{totalAmount.toLocaleString('vi-VN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phí</span>
            <span className="font-semibold tabular-nums">{(calculation.fee + calculation.tax).toLocaleString('vi-VN')}</span>
          </div>
          <div className="flex justify-between pt-1 border-t">
            <span className="font-semibold">{mode === 'BUY' ? 'Thanh toán' : 'Nhận về'}</span>
            <span className={cn("font-bold tabular-nums", mode === 'BUY' ? 'text-red-500' : 'text-green-500')}>
              {calculation.netAmount.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Execute */}
        <Button
          onClick={handleExecute}
          disabled={
            !symbol || 
            !quantity || 
            parseInt(quantity) <= 0 || 
            (orderType === 'MARKET' && currentPrice <= 0) ||
            (orderType === 'LIMIT' && (!limitPrice || parseFloat(limitPrice) <= 0)) ||
            isLoading
          }
          className={cn(
            "w-full h-10 font-semibold",
            mode === 'BUY' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
          )}
        >
          {isLoading ? (
            <>
              <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              {mode === 'BUY' ? 'MUA' : 'BÁN'} {orderType === 'LIMIT' && '(Giới hạn)'}
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
