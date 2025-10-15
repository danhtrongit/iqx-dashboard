import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import {
  type TradingModalProps,
  type OrderType
} from "@/types/virtual-trading"
import { VirtualTradingService } from "@/services/virtual-trading.service"
import { useBuyStock, useSellStock, useTradingCapacity } from "@/hooks/use-virtual-trading"

export function TradingModal({
  isOpen,
  onClose,
  symbolCode,
  symbolName,
  currentPrice,
  mode,
  maxQuantity,
  cashBalance
}: TradingModalProps) {
  const [orderType, setOrderType] = useState<OrderType>('MARKET')
  const [quantity, setQuantity] = useState<number>(0)
  const [limitPrice, setLimitPrice] = useState<number>(currentPrice)
  const [estimatedCost, setEstimatedCost] = useState({ totalAmount: 0, fee: 0, tax: 0, netAmount: 0 })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const { tradingCapacity } = useTradingCapacity(symbolCode)
  const buyMutation = useBuyStock()
  const sellMutation = useSellStock()

  const effectivePrice = orderType === 'MARKET' ? currentPrice : limitPrice
  const effectiveMaxQuantity = mode === 'BUY'
    ? (cashBalance && currentPrice ? VirtualTradingService.getMaxPurchaseQuantity(cashBalance, currentPrice) : 0)
    : (maxQuantity || 0)

  // Calculate estimated costs
  useEffect(() => {
    if (quantity > 0 && effectivePrice > 0) {
      const totalAmount = quantity * effectivePrice
      const calculation = VirtualTradingService.calculateTradingCost(totalAmount, mode)
      setEstimatedCost(calculation)
    } else {
      setEstimatedCost({ totalAmount: 0, fee: 0, tax: 0, netAmount: 0 })
    }
  }, [quantity, effectivePrice, mode])

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Check if user has portfolio for buying
    if (mode === 'BUY' && !cashBalance) {
      newErrors.general = "Bạn chưa tạo portfolio giao dịch ảo"
      setErrors(newErrors)
      return false
    }

    if (quantity <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0"
    } else if (quantity > effectiveMaxQuantity) {
      newErrors.quantity = mode === 'BUY'
        ? `Số dư không đủ. Tối đa có thể mua ${effectiveMaxQuantity} cổ phiếu`
        : `Không đủ cổ phiếu. Tối đa có thể bán ${effectiveMaxQuantity} cổ phiếu`
    }

    if (orderType === 'LIMIT' && limitPrice <= 0) {
      newErrors.limitPrice = "Giá giới hạn phải lớn hơn 0"
    }

    // Additional validation for buying
    if (mode === 'BUY' && currentPrice > 0 && cashBalance) {
      const totalCost = quantity * effectivePrice
      const calculation = VirtualTradingService.calculateTradingCost(totalCost, 'BUY')
      if (calculation.netAmount > cashBalance) {
        newErrors.quantity = "Số dư không đủ để thực hiện giao dịch này"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const request = {
      symbolCode,
      quantity,
      orderType,
      limitPrice: orderType === 'LIMIT' ? limitPrice : undefined
    }

    try {
      if (mode === 'BUY') {
        await buyMutation.mutateAsync(request)
      } else {
        await sellMutation.mutateAsync(request)
      }
      onClose()
      // Reset form
      setQuantity(0)
      setOrderType('MARKET')
      setLimitPrice(currentPrice)
      setErrors({})
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  const handleSetMaxQuantity = () => {
    if (effectiveMaxQuantity > 0) {
      setQuantity(effectiveMaxQuantity)
    }
  }

  const isLoading = buyMutation.isPending || sellMutation.isPending
  const canAfford = mode === 'BUY'
    ? (cashBalance || 0) >= estimatedCost.netAmount && cashBalance > 0
    : true
  const hasGeneralError = errors.general

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'BUY' ? (
              <>
                <TrendingUp className="h-5 w-5 text-green-600" />
                Mua cổ phiếu {symbolCode}
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-red-600" />
                Bán cổ phiếu {symbolCode}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {symbolName} - Giá hiện tại: {VirtualTradingService.formatCurrency(currentPrice)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Số dư khả dụng</div>
              <div className="text-sm font-semibold">
                {VirtualTradingService.formatCurrency(cashBalance || 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Số CP đang có</div>
              <div className="text-sm font-semibold">
                {maxQuantity || 0}
              </div>
            </div>
          </div>

          {/* Show message if no portfolio */}
          {!cashBalance && mode === 'BUY' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bạn chưa tạo portfolio giao dịch ảo. Vui lòng tạo portfolio trước khi giao dịch.
              </AlertDescription>
            </Alert>
          )}

          {/* General errors */}
          {hasGeneralError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Order Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại lệnh</label>
            <Select value={orderType} onValueChange={(value: OrderType) => setOrderType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại lệnh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MARKET">Thường (Giá thị trường)</SelectItem>
                <SelectItem value="LIMIT">Giới hạn</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {orderType === 'MARKET'
                ? 'Giao dịch với giá thị trường hiện tại'
                : 'Đặt lệnh với giá mong muốn'
              }
            </p>
          </div>

          {/* Limit Price */}
          {orderType === 'LIMIT' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá giới hạn</label>
              <Input
                type="number"
                placeholder="Nhập giá mong muốn"
                value={limitPrice || ''}
                onChange={(e) => setLimitPrice(Number(e.target.value) || 0)}
              />
              {errors.limitPrice && (
                <p className="text-xs text-red-600">{errors.limitPrice}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Giá mong muốn để {mode === 'BUY' ? 'mua' : 'bán'} cổ phiếu
              </p>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Số lượng</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSetMaxQuantity}
                className="h-auto p-0 text-xs text-primary hover:underline"
              >
                Tối đa: {effectiveMaxQuantity.toLocaleString()}
              </Button>
            </div>
            <Input
              type="number"
              placeholder="Nhập số lượng cổ phiếu"
              value={quantity || ''}
              onChange={(e) => setQuantity(Number(e.target.value) || 0)}
            />
            {errors.quantity && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.quantity}</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              Số lượng cổ phiếu muốn {mode === 'BUY' ? 'mua' : 'bán'}
            </p>
          </div>

          {/* Calculation Summary */}
          {quantity > 0 && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tổng giá trị</span>
                  <span className="font-medium">
                    {VirtualTradingService.formatCurrency(estimatedCost.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Phí giao dịch (0.01%)</span>
                  <span>{VirtualTradingService.formatCurrency(estimatedCost.fee)}</span>
                </div>
                {estimatedCost.tax > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Thuế (0.1%)</span>
                    <span>{VirtualTradingService.formatCurrency(estimatedCost.tax)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>
                    {mode === 'BUY' ? 'Số tiền cần thanh toán' : 'Số tiền nhận được'}
                  </span>
                  <span className={mode === 'BUY' ? 'text-red-600' : 'text-green-600'}>
                    {VirtualTradingService.formatCurrency(estimatedCost.netAmount)}
                  </span>
                </div>
              </div>

              {mode === 'BUY' && !canAfford && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Số dư không đủ để thực hiện giao dịch này
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant={mode === 'BUY' ? 'default' : 'destructive'}
              disabled={quantity <= 0 || !canAfford || isLoading || hasGeneralError || Object.keys(errors).filter(k => k !== 'general').length > 0}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'BUY' ? 'Mua' : 'Bán'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}