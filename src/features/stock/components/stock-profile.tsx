import { useState } from 'react'
import { useCompany } from '@/hooks/use-company'
import { useStockFavorite } from '@/hooks/use-watchlist'
import { useVirtualPortfolio, useStockPrice, useCreatePortfolio } from '@/hooks/use-virtual-trading'
import { CompanyService } from '@/services/company.service'
import { VirtualTradingService } from '@/services/virtual-trading.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TradingModal } from '@/components/trading/trading-modal'
import {
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  Activity,
  Heart,
  Globe,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Plus
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

  const createPortfolioMutation = useCreatePortfolio()

  const {
    isInWatchlist,
    isPending,
    toggle
  } = useStockFavorite(ticker)

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

  const riskLevel = CompanyService.getCompanyRiskLevel(company)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className='text-2xl flex items-center gap-3'>
              <span>{company.ticker}</span>
              <Button
                variant={isInWatchlist ? "default" : "outline"}
                size="sm"
                onClick={toggle}
                disabled={isPending}
                className="h-8 px-3"
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    isInWatchlist
                      ? 'fill-current'
                      : ''
                  }`}
                />
                {isInWatchlist ? 'Đã yêu thích' : 'Yêu thích'}
              </Button>
            </CardTitle>
            <CardDescription className="text-base">
              {company.viOrganShortName || company.enOrganShortName || company.viOrganName || company.enOrganName}
            </CardDescription>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                {company.sector}
              </Badge>
              {company.rating && (
                <Badge variant="outline" className="text-xs">
                  {company.rating}
                </Badge>
              )}
              {company.exchange && (
                <Badge variant="secondary" className="text-xs">
                  {company.exchange}
                </Badge>
              )}
              <Badge
                variant={riskLevel === 'low' ? 'default' : riskLevel === 'medium' ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {riskLevel === 'low' ? 'Rủi ro thấp' :
                 riskLevel === 'medium' ? 'Rủi ro trung bình' : 'Rủi ro cao'}
              </Badge>
            </div>
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
        {/* Key Metrics */}
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <div className='text-center p-4 bg-muted/30 rounded-lg'>
            <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2'>
              <DollarSign className="h-4 w-4" />
              Giá hiện tại
            </div>
            <div className='text-xl font-bold'>
              {CompanyService.formatPrice(company.currentPrice || 0)}
            </div>
          </div>

          <div className='text-center p-4 bg-muted/30 rounded-lg'>
            <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2'>
              <Activity className="h-4 w-4" />
              Vốn hóa
            </div>
            <div className='text-xl font-bold'>
              {CompanyService.formatMarketCap(company.marketCap || 0)}
            </div>
          </div>

          <div className='text-center p-4 bg-muted/30 rounded-lg'>
            <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2'>
              <BarChart3 className="h-4 w-4" />
              Số CP (M)
            </div>
            <div className='text-xl font-bold'>
              {((company.numberOfSharesMktCap || 0) / 1000000).toFixed(1)}M
            </div>
          </div>

          <div className='text-center p-4 bg-muted/30 rounded-lg'>
            <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2'>
              <Globe className="h-4 w-4" />
              Sở hữu NN
            </div>
            <div className='text-xl font-bold'>
              {CompanyService.formatPercentage(company.foreignerPercentage || 0)}
            </div>
          </div>
        </div>

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
                    {CompanyService.formatPrice(company.eps)}
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

        {/* Additional Info */}
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
          <div>
            <div className='text-xs text-muted-foreground mb-1'>Sở hữu Nhà nước</div>
            <div className='text-sm font-semibold'>
              {CompanyService.formatPercentage(company.statePercentage || 0)}
            </div>
          </div>

          <div>
            <div className='text-xs text-muted-foreground mb-1'>Free Float</div>
            <div className='text-sm font-semibold'>
              {CompanyService.formatPercentage(company.freeFloatPercentage || 0)}
            </div>
          </div>

          {company.listingDate && (
            <div>
              <div className='text-xs text-muted-foreground mb-1 flex items-center gap-1'>
                <Calendar className="h-3 w-3" />
                Ngày niêm yết
              </div>
              <div className='text-sm font-semibold'>
                {new Date(company.listingDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
          )}
        </div>

        {/* Company Profile */}
        {(company.profile || company.enProfile) && (
          <div className='bg-muted/20 rounded-lg p-4'>
            <h3 className='text-sm font-semibold mb-3 flex items-center gap-2'>
              <Building2 className="h-4 w-4" />
              Giới thiệu công ty
            </h3>
            <div
              className='text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none prose-p:mb-2 prose-p:mt-0'
              dangerouslySetInnerHTML={{
                __html: company.profile || company.enProfile || ''
              }}
            />
          </div>
        )}

        {/* Company Summary */}
        <div className='bg-muted/20 rounded-lg p-4'>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {CompanyService.generateCompanySummary(company)}
          </p>
        </div>

        {/* Current Holdings Display */}
        {currentHolding && (
          <div className='bg-muted/30 rounded-lg p-4'>
            <h3 className='font-semibold mb-3 flex items-center gap-2'>
              <BarChart3 className="h-4 w-4" />
              Sở hữu hiện tại
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Số lượng</span>
                <span className='font-semibold'>{currentHolding.quantity.toLocaleString()}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Giá mua TB</span>
                <span className='font-semibold'>{CompanyService.formatPrice(currentHolding.averagePrice)}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Giá trị hiện tại</span>
                <span className='font-semibold'>{CompanyService.formatPrice(currentHolding.currentValue)}</span>
              </div>
              <div className='flex justify-between items-center pt-2 border-t'>
                <span className='text-muted-foreground'>P&L</span>
                <div className='text-right'>
                  <div className={`font-semibold ${
                    (currentHolding.unrealizedProfitLoss || 0) > 0 ? 'text-green-600' :
                    (currentHolding.unrealizedProfitLoss || 0) < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {CompanyService.formatPrice(currentHolding.unrealizedProfitLoss || 0)}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    ({VirtualTradingService.parsePercentage(currentHolding.profitLossPercentage).toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
