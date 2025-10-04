import { useState } from 'react'
import { useCompany } from '@/hooks/use-company'
import { useStockFavorite } from '@/hooks/use-watchlist'
import { useVirtualPortfolio, useStockPrice, useCreatePortfolio } from '@/hooks/use-virtual-trading'
import { useTickerDetail, useTickerPriceTrend } from '@/hooks/use-ticker-detail'
import { CompanyService } from '@/services/company.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TradingModal } from '@/components/trading/trading-modal'
import {
  AlertCircle,
  Building2,
  TrendingUp,
  TrendingDown,
  Plus,
  Activity,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface StockProfileProps {
  ticker?: string
}

export function StockProfile({ ticker = 'VIC' }: StockProfileProps) {
  const [tradingModalOpen, setTradingModalOpen] = useState(false)
  const [tradingMode, setTradingMode] = useState<'BUY' | 'SELL'>('BUY')

  const { data: company, isLoading, error } = useCompany(ticker, {
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })

  const { data: portfolio, error: portfolioError } = useVirtualPortfolio({
    enabled: !!ticker,
  })

  const { data: stockPrice } = useStockPrice(ticker, {
    enabled: !!ticker,
  })

  const { data: tickerDetail, isLoading: tickerDetailLoading } = useTickerDetail(ticker, {
    enabled: !!ticker,
  })

  const priceTrend = useTickerPriceTrend(tickerDetail?.tickerData)

  const createPortfolioMutation = useCreatePortfolio()


  // Get current holding for this stock
  const currentHolding = portfolio?.holdings.find(h => h.symbolCode === ticker)
  const currentPrice = stockPrice?.currentPrice || company?.currentPrice || 0

  const handleOpenTradingModal = (mode: 'BUY' | 'SELL') => {
    setTradingMode(mode)
    setTradingModalOpen(true)
  }

  const handleCreatePortfolio = () => {
    createPortfolioMutation.mutate()
  }

  // Check if portfolio doesn't exist (404 error)
  const portfolioNotExists = portfolioError?.statusCode === 404

  if (isLoading) {
    return <StockProfileSkeleton />
  }

  if (error || !company) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Không thể tải thông tin công ty {ticker}. {error?.message || 'Vui lòng thử lại sau.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-baseline gap-4 flex-wrap">
              <CardTitle className='text-3xl font-bold'>
                {company.ticker}
              </CardTitle>
              {priceTrend && (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold">
                    {(priceTrend.currentPrice * 1000).toLocaleString('vi-VN')}
                  </span>
                  <span className={`text-lg font-semibold ${
                    priceTrend.isPositive ? 'text-green-600' :
                    priceTrend.isNegative ? 'text-red-600' : ''
                  }`}>
                    {priceTrend.priceChange > 0 ? '+' : ''}
                    {(priceTrend.priceChange * 1000).toLocaleString('vi-VN')}
                    ({priceTrend.priceChangePercent > 0 ? '+' : ''}
                    {(priceTrend.priceChangePercent * 100).toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
            <CardDescription className="text-base">
              {company.viOrganShortName || company.enOrganShortName || company.viOrganName || company.enOrganName}
            </CardDescription>
          </div>

          {/* Trading Buttons */}
          <div className="flex gap-2">
            {portfolioNotExists ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleCreatePortfolio}
                className="h-8 px-4"
                disabled={createPortfolioMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo Portfolio
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenTradingModal('BUY')}
                  className="h-8 px-4 text-green-600 border-green-600 hover:bg-green-50"
                  disabled={!currentPrice || !portfolio}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  MUA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenTradingModal('SELL')}
                  className="h-8 px-4 text-red-600 border-red-600 hover:bg-red-50"
                  disabled={!currentPrice || !currentHolding || currentHolding.quantity === 0}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  BÁN
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Financial Ratios - Only show if data available */}
        {(company.pe || company.pb || company.roe) && (
          <div>
            <h3 className='text-sm font-semibold mb-3'>Chỉ số tài chính</h3>
            <div className='grid grid-cols-3 gap-4 sm:grid-cols-6'>
              {company.pe && (
                <div className='text-center'>
                  <div className='text-xs text-muted-foreground'>P/E</div>
                  <div className='text-lg font-semibold'>{company.pe.toFixed(1)}</div>
                </div>
              )}
              {company.pb && (
                <div className='text-center'>
                  <div className='text-xs text-muted-foreground'>P/B</div>
                  <div className='text-lg font-semibold'>{company.pb.toFixed(1)}</div>
                </div>
              )}
              {company.roe && (
                <div className='text-center'>
                  <div className='text-xs text-muted-foreground'>ROE</div>
                  <div className='text-lg font-semibold'>
                    {CompanyService.formatPercentage(company.roe)}
                  </div>
                </div>
              )}
              {company.roa && (
                <div className='text-center'>
                  <div className='text-xs text-muted-foreground'>ROA</div>
                  <div className='text-lg font-semibold'>
                    {CompanyService.formatPercentage(company.roa)}
                  </div>
                </div>
              )}
              {company.eps && (
                <div className='text-center'>
                  <div className='text-xs text-muted-foreground'>EPS</div>
                  <div className='text-lg font-semibold'>
                    {CompanyService.formatPrice(company.eps * 1000)}
                  </div>
                </div>
              )}
              {company.dividendYield && (
                <div className='text-center'>
                  <div className='text-xs text-muted-foreground'>Cổ tức</div>
                  <div className='text-lg font-semibold'>
                    {CompanyService.formatPercentage(company.dividendYield)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Profile & Ticker Detail */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {/* Company Profile - Left */}
          {(company.profile || company.enProfile) && (
            <div className='bg-muted/20 rounded-lg p-4'>
              <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                <Building2 className="h-4 w-4" />
                Giới thiệu công ty
              </h3>
              <div
                className='text-base text-muted-foreground leading-relaxed prose prose-sm max-w-none prose-p:mb-2 prose-p:mt-0'
                dangerouslySetInnerHTML={{
                  __html: company.profile || company.enProfile || ''
                }}
              />
            </div>
          )}

          {/* Ticker Detail - Right */}
          {tickerDetail?.tickerData ? (
            <div className='bg-muted/20 rounded-lg p-4'>
              <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                <Activity className="h-4 w-4" />
                Thông tin giao dịch
              </h3>
              <div className='grid grid-cols-2 gap-3'>
                {/* Left Column */}
                <div className='space-y-3'>
                  {/* Price Trend */}
                  {priceTrend && (
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center pb-2 border-b'>
                        <span className='text-sm text-muted-foreground'>Giá hiện tại</span>
                        <span className='font-semibold text-sm'>
                          {(priceTrend.currentPrice * 1000).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>Thay đổi</span>
                        <span className={`font-medium text-sm ${
                          priceTrend.isPositive ? 'text-green-600' :
                          priceTrend.isNegative ? 'text-red-600' : ''
                        }`}>
                          {priceTrend.priceChange > 0 ? '+' : ''}
                          {(priceTrend.priceChange * 1000).toLocaleString('vi-VN')} ₫
                          ({priceTrend.priceChangePercent > 0 ? '+' : ''}
                          {(priceTrend.priceChangePercent * 100).toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Financial Metrics */}
                  <div className='space-y-2 pt-2 border-t'>
                    {tickerDetail.tickerData.roe !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>ROE</span>
                        <span className='font-medium text-sm'>
                          {CompanyService.formatPercentage(tickerDetail.tickerData.roe)}
                        </span>
                      </div>
                    )}
                    {tickerDetail.tickerData.roa !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>ROA</span>
                        <span className='font-medium text-sm'>
                          {CompanyService.formatPercentage(tickerDetail.tickerData.roa)}
                        </span>
                      </div>
                    )}
                    {tickerDetail.tickerData.bienloinhuan !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>Biên LN</span>
                        <span className='font-medium text-sm'>
                          {CompanyService.formatPercentage(tickerDetail.tickerData.bienloinhuan)}
                        </span>
                      </div>
                    )}
                    {tickerDetail.tickerData.pe !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>P/E</span>
                        <span className='font-medium text-sm'>{tickerDetail.tickerData.pe.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className='space-y-3'>
                  {/* More Financial Metrics */}
                  <div className='space-y-2'>
                    {tickerDetail.tickerData.pb !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>P/B</span>
                        <span className='font-medium text-sm'>{tickerDetail.tickerData.pb.toFixed(2)}</span>
                      </div>
                    )}
                    {tickerDetail.tickerData.eps_pha_loang !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>EPS</span>
                        <span className='font-medium text-sm'>
                          {CompanyService.formatPrice(tickerDetail.tickerData.eps_pha_loang * 1000)}
                        </span>
                      </div>
                    )}
                    {tickerDetail.tickerData.gia_tri_so_sach !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>BVPS</span>
                        <span className='font-medium text-sm'>
                          {CompanyService.formatPrice(tickerDetail.tickerData.gia_tri_so_sach * 1000)}
                        </span>
                      </div>
                    )}
                    {tickerDetail.tickerData.noVCSH !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>Nợ/VCSH</span>
                        <span className='font-medium text-sm'>{tickerDetail.tickerData.noVCSH.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Market Info */}
                  <div className='space-y-2 pt-2 border-t'>
                    {tickerDetail.tickerData.vonhoa !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>Vốn hóa</span>
                        <span className='font-medium text-sm'>
                          {CompanyService.formatMarketCap(tickerDetail.tickerData.vonhoa)}
                        </span>
                      </div>
                    )}
                    {tickerDetail.tickerData.slcp !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>SLCP</span>
                        <span className='font-medium text-sm'>
                          {((tickerDetail.tickerData.slcp) / 1000000).toFixed(0)}M
                        </span>
                      </div>
                    )}
                    {tickerDetail.tickerData.sohuungoai !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>Sở hữu NN</span>
                        <span className='font-medium text-sm'>
                          {CompanyService.formatPercentage(tickerDetail.tickerData.sohuungoai)}
                        </span>
                      </div>
                    )}
                    {tickerDetail.tickerData.rsi !== undefined && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>RSI</span>
                        <span className='font-medium text-sm'>{tickerDetail.tickerData.rsi.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ) : tickerDetailLoading ? (
            <div className='bg-muted/20 rounded-lg p-4'>
              <Skeleton className="h-5 w-32 mb-3" />
              <div className='space-y-2'>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ) : null}
        </div>

      </CardContent>

      {/* Trading Modal */}
      {company && (
        <TradingModal
          isOpen={tradingModalOpen}
          onClose={() => setTradingModalOpen(false)}
          symbolCode={ticker}
          symbolName={company.viOrganShortName || company.enOrganShortName || company.viOrganName || company.enOrganName || ticker}
          currentPrice={currentPrice}
          mode={tradingMode}
          maxQuantity={currentHolding?.quantity}
          cashBalance={portfolio?.cashBalance}
        />
      )}
    </Card>
  )
}

// Skeleton component for loading state
function StockProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-5 w-80" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='text-center p-4 bg-muted/30 rounded-lg'>
              <Skeleton className="h-4 w-16 mb-2 mx-auto" />
              <Skeleton className="h-6 w-20 mx-auto" />
            </div>
          ))}
        </div>

        <div>
          <Skeleton className="h-5 w-32 mb-3" />
          <div className='grid grid-cols-3 gap-4 sm:grid-cols-6'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='text-center'>
                <Skeleton className="h-3 w-8 mb-1 mx-auto" />
                <Skeleton className="h-5 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>

        <div className='bg-muted/20 rounded-lg p-4'>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}

export default StockProfile
