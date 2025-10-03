import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  TrendingUp, 
  Wallet,
  Zap,
  Sparkles
} from 'lucide-react'
import { TradingModal } from './trading-modal'
import { useVirtualPortfolio } from '@/hooks/use-virtual-trading'
import { cn } from '@/lib/utils'

export function QuickTrading() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState<string>('')
  const [tradingMode, setTradingMode] = useState<'BUY' | 'SELL'>('BUY')
  const [searchSymbol, setSearchSymbol] = useState('')
  const [focusedInput, setFocusedInput] = useState(false)

  const { data: portfolio } = useVirtualPortfolio()

  const handleOpenModal = (symbol: string, mode: 'BUY' | 'SELL') => {
    setSelectedSymbol(symbol)
    setTradingMode(mode)
    setIsModalOpen(true)
  }

  const handleSearchTrade = () => {
    if (searchSymbol.trim()) {
      handleOpenModal(searchSymbol.toUpperCase(), 'BUY')
      setSearchSymbol('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchTrade()
    }
  }

  const recentHoldings = portfolio?.holdings.slice(0, 3) || []
  const totalHoldings = portfolio?.holdings.length || 0

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <CardTitle className="text-lg font-semibold">Giao dịch nhanh</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Số dư khả dụng</p>
              <p className="text-sm font-bold">
                {portfolio?.cashBalance.toLocaleString('vi-VN') || 0} VND
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Nhập mã cổ phiếu (VD: ACB, VNM)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                className="uppercase h-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button 
              onClick={handleSearchTrade} 
              disabled={!searchSymbol.trim()}
              className="h-10 px-4"
            >
              Tìm
            </Button>
          </div>

          {/* Holdings Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Đang nắm giữ</h4>
              {totalHoldings > 0 && (
                <span className="text-xs text-muted-foreground">
                  {recentHoldings.length}/{totalHoldings} mã
                </span>
              )}
            </div>

            {recentHoldings.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">Chưa có cổ phiếu nào</p>
                <p className="text-xs text-muted-foreground mt-1">Bắt đầu giao dịch ngay</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentHoldings.map((holding) => (
                  <div
                    key={holding.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold">{holding.symbolCode}</span>
                        <span className="text-xs text-muted-foreground">
                          {holding.quantity.toLocaleString('vi-VN')} CP
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        TB: {holding.averagePrice.toLocaleString('vi-VN')}
                      </p>
                    </div>
                    
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenModal(holding.symbolCode, 'BUY')}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenModal(holding.symbolCode, 'SELL')}
                      >
                        <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Stocks */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Cổ phiếu phổ biến</h4>
            <div className="grid grid-cols-3 gap-2">
              {['VNM', 'VIC', 'FPT', 'HPG', 'VCB', 'VHM'].map((symbol) => (
                <Button
                  key={symbol}
                  variant="outline"
                  onClick={() => handleOpenModal(symbol, 'BUY')}
                  className="h-10 font-semibold text-sm hover:bg-muted"
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <TradingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        symbolCode={selectedSymbol}
        defaultMode={tradingMode}
      />
    </>
  )
}