import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Minus, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { VirtualTradingService } from '@/services/virtual-trading.service'
import { useBuyStock, useSellStock, useStockPrice, useVirtualPortfolio } from '@/hooks/use-virtual-trading'
import type { OrderType } from '@/types/virtual-trading'
import { cn } from '@/lib/utils'

interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  symbolCode?: string
  defaultMode?: 'BUY' | 'SELL'
}

export function TradingModal({ isOpen, onClose, symbolCode: initialSymbol, defaultMode = 'BUY' }: TradingModalProps) {
  const [mode, setMode] = useState<'BUY' | 'SELL'>(defaultMode)
  const [symbolCode, setSymbolCode] = useState(initialSymbol || '')
  const [orderType, setOrderType] = useState<OrderType>('MARKET')
  const [quantity, setQuantity] = useState<number>(0)
  const [limitPrice, setLimitPrice] = useState<number>(0)

  const { data: portfolio } = useVirtualPortfolio()
  const { data: stockPrice, isError: priceError } = useStockPrice(symbolCode, {
    enabled: !!symbolCode && symbolCode.length >= 3,
    refetchInterval: 30000,
  })
  const buyMutation = useBuyStock()
  const sellMutation = useSellStock()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Reset form when modal opens/closes or symbol changes
  useEffect(() => {
    if (isOpen && initialSymbol) {
      setSymbolCode(initialSymbol)
      setMode(defaultMode)
      setOrderType('MARKET')
      setQuantity(0)
      setLimitPrice(0)
    }
  }, [isOpen, initialSymbol, defaultMode])

  // Get holding info for this symbol
  const holding = portfolio?.holdings.find(h => h.symbolCode === symbolCode)

  const currentPrice = stockPrice?.currentPrice || holding?.currentPrice || 0
  const priceToUse = orderType === 'LIMIT' && limitPrice > 0 ? limitPrice : currentPrice

  // For MARKET orders, if no current price, user must enter limit price
  const needsManualPrice = orderType === 'MARKET' && currentPrice === 0

  // Calculate trading values
  const totalAmount = quantity * priceToUse
  const calculation = VirtualTradingService.calculateTradingCost(totalAmount, mode)

  // Get max quantities
  const maxBuyQuantity = VirtualTradingService.getMaxPurchaseQuantity(
    portfolio?.cashBalance || 0,
    priceToUse
  )

  const maxSellQuantity = holding?.quantity || 0

  const maxQuantity = mode === 'BUY' ? maxBuyQuantity : maxSellQuantity
  const availableBalance = mode === 'BUY'
    ? portfolio?.cashBalance || 0
    : holding?.currentValue || 0

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setQuantity(0)
      return
    }
    // Allow typing any number, validation happens on submit
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 0) {
      setQuantity(num)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setLimitPrice(0)
      return
    }
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      setLimitPrice(num)
    }
  }

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => Math.max(0, Math.min(prev + delta, maxQuantity)))
  }

  const adjustPrice = (delta: number) => {
    setLimitPrice(prev => Math.max(0, prev + delta))
  }

  const handleSubmit = async () => {
    if (!symbolCode || quantity <= 0) return

    // Validate price is available
    if (priceToUse <= 0) {
      toast.error('Vui lòng nhập giá hoặc chọn lệnh Giới hạn')
      return
    }

    // Validate quantity doesn't exceed max
    if (quantity > maxQuantity) {
      toast.error(`Số lượng vượt quá giới hạn (tối đa: ${maxQuantity.toLocaleString('vi-VN')})`)
      return
    }

    try {
      if (mode === 'BUY') {
        await buyMutation.mutateAsync({
          symbolCode,
          quantity,
          orderType,
          limitPrice: orderType === 'LIMIT' ? limitPrice : undefined,
        })
      } else {
        await sellMutation.mutateAsync({
          symbolCode,
          quantity,
          orderType,
          limitPrice: orderType === 'LIMIT' ? limitPrice : undefined,
        })
      }
      onClose()
    } catch (error) {
      // Error handled by mutation hooks
    }
  }

  const isLoading = buyMutation.isPending || sellMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Giao dịch cổ phiếu</DialogTitle>
          <DialogDescription>
            Đặt lệnh mua/bán cổ phiếu trong Virtual Trading
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'BUY' | 'SELL')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="BUY" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              MUA
            </TabsTrigger>
            <TabsTrigger value="SELL" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              BÁN
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4">
            {/* Symbol Code */}
            <div className="space-y-2">
              <Label>Mã cổ phiếu</Label>
              <Input
                value={symbolCode}
                onChange={(e) => setSymbolCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã cổ phiếu"
                className="uppercase"
              />
              {stockPrice && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Giá hiện tại:</span>
                  <span className="font-bold text-lg">{formatCurrency(currentPrice)}</span>
                </div>
              )}
              {!stockPrice && symbolCode && symbolCode.length >= 3 && (
                <div className="text-xs text-amber-600">
                  Không lấy được giá thị trường, vui lòng chọn lệnh Giới hạn và nhập giá
                </div>
              )}
            </div>

            {/* Order Type */}
            <div className="space-y-2">
              <Label>Loại lệnh</Label>
              <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKET">Thường (Market)</SelectItem>
                  <SelectItem value="LIMIT">Giới hạn (Limit)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Limit Price - only show for LIMIT orders */}
            {orderType === 'LIMIT' && (
              <div className="space-y-2">
                <Label>Giá đặt</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustPrice(-1000)}
                    disabled={limitPrice <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={limitPrice === 0 ? '' : limitPrice}
                    onChange={handlePriceChange}
                    placeholder="Nhập giá"
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustPrice(1000)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <Label>Khối lượng</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustQuantity(-100)}
                  disabled={quantity <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={quantity === 0 ? '' : quantity}
                  onChange={handleQuantityChange}
                  placeholder="Nhập khối lượng"
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustQuantity(100)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>KL tối đa:</span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-primary"
                  onClick={() => setQuantity(maxQuantity)}
                >
                  {maxQuantity.toLocaleString('vi-VN')}
                </Button>
              </div>
            </div>

            {/* Trading Summary */}
            <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
              <div className="flex justify-between text-sm">
                <span>Giá trị lệnh:</span>
                <span className="font-semibold">{formatCurrency(calculation.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Phí giao dịch:</span>
                <span>{formatCurrency(calculation.fee)}</span>
              </div>
              {mode === 'SELL' && (
                <div className="flex justify-between text-sm">
                  <span>Thuế:</span>
                  <span>{formatCurrency(calculation.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-semibold">
                  {mode === 'BUY' ? 'Tổng thanh toán:' : 'Nhận về:'}
                </span>
                <span className={cn(
                  'font-bold text-base',
                  mode === 'BUY' ? 'text-red-600' : 'text-green-600'
                )}>
                  {formatCurrency(calculation.netAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{mode === 'BUY' ? 'Khả dụng:' : 'Giá trị nắm giữ:'}</span>
                <span>{formatCurrency(availableBalance)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              className={cn(
                'w-full',
                mode === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              )}
              onClick={handleSubmit}
              disabled={
                !symbolCode ||
                quantity <= 0 ||
                priceToUse <= 0 ||
                isLoading
              }
            >
              {isLoading ? 'Đang xử lý...' : mode === 'BUY' ? 'MUA' : 'BÁN'}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}