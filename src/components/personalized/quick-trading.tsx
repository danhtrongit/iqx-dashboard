import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowUpRight, ArrowDownRight, Search } from 'lucide-react'
import { TradingModal } from './trading-modal'
import { useVirtualPortfolio } from '@/hooks/use-virtual-trading'

export function QuickTrading() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState<string>('')
  const [tradingMode, setTradingMode] = useState<'BUY' | 'SELL'>('BUY')
  const [searchSymbol, setSearchSymbol] = useState('')

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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Giao dịch nhanh</CardTitle>
          <CardDescription>Mua/bán cổ phiếu nhanh chóng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search & Trade */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Nhập mã cổ phiếu (VD: ACB, VNM...)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="uppercase"
              />
              <Button onClick={handleSearchTrade} disabled={!searchSymbol.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Tìm
              </Button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Cổ phiếu đang nắm giữ</h4>
              {recentHoldings.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {recentHoldings.length}/{portfolio?.holdings.length || 0}
                </span>
              )}
            </div>

            {recentHoldings.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <p>Bạn chưa có cổ phiếu nào</p>
                <p className="text-xs mt-1">Tìm kiếm mã cổ phiếu để bắt đầu giao dịch</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentHoldings.map((holding) => (
                  <div
                    key={holding.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{holding.symbolCode}</div>
                      <div className="text-xs text-muted-foreground">
                        SL: {holding.quantity.toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleOpenModal(holding.symbolCode, 'BUY')}
                      >
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        Mua
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleOpenModal(holding.symbolCode, 'SELL')}
                      >
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        Bán
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Stocks - Optional */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Cổ phiếu phổ biến</h4>
            <div className="grid grid-cols-3 gap-2">
              {['VNM', 'VIC', 'FPT', 'HPG', 'VCB', 'VHM'].map((symbol) => (
                <Button
                  key={symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(symbol, 'BUY')}
                  className="hover:bg-primary/10"
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