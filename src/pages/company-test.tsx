import { useCompany, useWatchlist, useRealtimeCompany } from '@/hooks/use-company'
import { CompanyService } from '@/services/company.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Globe,
  Users,
  Play,
  Pause,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'

export default function CompanyTestPage() {
  const [testTicker, setTestTicker] = useState('VIC')

  // Test basic company data fetch
  const { data: company, isLoading, error, refetch } = useCompany(testTicker, {
    enabled: true,
    staleTime: 30000, // 30 seconds for testing
  })

  // Test realtime functionality
  const {
    data: realtimeCompany,
    isRealtime,
    startRealtime,
    stopRealtime,
    toggleRealtime
  } = useRealtimeCompany(testTicker, {
    refreshInterval: 10000, // 10 seconds for testing
  })

  // Test watchlist functionality
  const {
    watchlist,
    watchlistData,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist
  } = useWatchlist()

  const handleTickerChange = (ticker: string) => {
    if (CompanyService.isValidTicker(ticker)) {
      setTestTicker(ticker.toUpperCase())
    }
  }

  const testTickers = ['VIC', 'VNM', 'HPG', 'FPT', 'MSN', 'ACB', 'VCB', 'VJC', 'GAS', 'SAB']

  if (isLoading) {
    return <CompanyTestSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert className="mb-6" variant="destructive">
          <AlertDescription>
            <strong>API Test Error:</strong> {error.message}
            {error.statusCode && <span className="ml-2">Status: {error.statusCode}</span>}
          </AlertDescription>
        </Alert>

        <Button onClick={() => refetch()} className="mb-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry API Call
        </Button>

        <TestControls
          testTicker={testTicker}
          onTickerChange={handleTickerChange}
          testTickers={testTickers}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Company API Test Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          API: proxy.iqx.vn/proxy/iq/api/iq-insight-service/v1
        </Badge>
      </div>

      {/* Test Controls */}
      <TestControls
        testTicker={testTicker}
        onTickerChange={handleTickerChange}
        testTickers={testTickers}
      />

      {/* Realtime Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Realtime Data Test
          </CardTitle>
          <CardDescription>
            Test auto-refresh functionality (updates every 10 seconds when active)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={toggleRealtime}
              variant={isRealtime ? "destructive" : "default"}
              size="sm"
            >
              {isRealtime ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Realtime
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Realtime
                </>
              )}
            </Button>

            <Badge variant={isRealtime ? "default" : "secondary"}>
              {isRealtime ? "Active" : "Inactive"}
            </Badge>

            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Manual Refresh
            </Button>
          </div>

          {isRealtime && (
            <Alert>
              <AlertDescription>
                Realtime mode is active. Data will refresh every 10 seconds.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Company Data Display */}
      {company && (
        <>
          <CompanyOverviewCard company={company} />
          <div className="grid gap-6 md:grid-cols-2">
            <FinancialMetricsCard company={company} />
            <OwnershipStructureCard company={company} />
          </div>
        </>
      )}

      {/* Watchlist Test */}
      <WatchlistTestCard
        watchlist={watchlist}
        watchlistData={watchlistData}
        currentTicker={testTicker}
        isInWatchlist={isInWatchlist(testTicker)}
        onAddToWatchlist={() => addToWatchlist(testTicker)}
        onRemoveFromWatchlist={() => removeFromWatchlist(testTicker)}
        onClearWatchlist={clearWatchlist}
      />

      {/* API Response Debug */}
      <Card>
        <CardHeader>
          <CardTitle>API Response Debug</CardTitle>
          <CardDescription>Raw API response data for debugging</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(company, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

function TestControls({
  testTicker,
  onTickerChange,
  testTickers
}: {
  testTicker: string
  onTickerChange: (ticker: string) => void
  testTickers: string[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Controls</CardTitle>
        <CardDescription>Select different tickers to test the API integration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {testTickers.map((ticker) => (
            <Button
              key={ticker}
              variant={testTicker === ticker ? "default" : "outline"}
              size="sm"
              onClick={() => onTickerChange(ticker)}
            >
              {ticker}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CompanyOverviewCard({ company }: { company: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6" />
            {company.ticker}
            <Badge className={CompanyService.getSectorColor(company.sector)}>
              {company.sector}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {CompanyService.formatPrice(company.financial?.currentPrice || 0)}
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          <div className="space-y-1">
            <div><strong>Vietnamese:</strong> {company.viOrganName}</div>
            <div><strong>English:</strong> {company.enOrganName}</div>
            <div><strong>Listed:</strong> {company.listingDate}</div>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function FinancialMetricsCard({ company }: { company: any }) {
  const financial = company.financial || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Market Cap:</span>
            <span className="font-semibold">
              {CompanyService.formatMarketCap(financial.marketCap || 0)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Shares Outstanding:</span>
            <span className="font-semibold">
              {(financial.numberOfSharesMktCap || 0).toLocaleString('vi-VN')}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Volume (1M):</span>
            <span className="font-semibold">
              {CompanyService.formatMarketCap(financial.averageMatchValue1Month || 0)}
            </span>
          </div>

          {financial.pe && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">P/E Ratio:</span>
              <span className="font-semibold">{financial.pe.toFixed(2)}</span>
            </div>
          )}

          {financial.pb && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">P/B Ratio:</span>
              <span className="font-semibold">{financial.pb.toFixed(2)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function OwnershipStructureCard({ company }: { company: any }) {
  const ownership = company.ownership || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Ownership Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Foreign Ownership:
            </span>
            <span className="font-semibold">
              {CompanyService.formatPercentage(ownership.foreignerPercentage || 0)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Max Foreign:</span>
            <span className="font-semibold">
              {CompanyService.formatPercentage(ownership.maximumForeignPercentage || 0)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">State Ownership:</span>
            <span className="font-semibold">
              {CompanyService.formatPercentage(ownership.statePercentage || 0)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Free Float:</span>
            <span className="font-semibold">
              {CompanyService.formatPercentage(ownership.freeFloatPercentage || 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function WatchlistTestCard({
  watchlist,
  watchlistData,
  currentTicker,
  isInWatchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onClearWatchlist,
}: {
  watchlist: string[]
  watchlistData: any[]
  currentTicker: string
  isInWatchlist: boolean
  onAddToWatchlist: () => void
  onRemoveFromWatchlist: () => void
  onClearWatchlist: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Watchlist Test ({watchlist.length})
          </span>
          <div className="flex gap-2">
            <Button
              onClick={isInWatchlist ? onRemoveFromWatchlist : onAddToWatchlist}
              variant={isInWatchlist ? "destructive" : "default"}
              size="sm"
            >
              {isInWatchlist ? (
                <>
                  <Minus className="mr-1 h-4 w-4" />
                  Remove {currentTicker}
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-4 w-4" />
                  Add {currentTicker}
                </>
              )}
            </Button>
            <Button onClick={onClearWatchlist} variant="outline" size="sm">
              Clear All
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Test localStorage-based watchlist functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        {watchlist.length === 0 ? (
          <p className="text-muted-foreground">No companies in watchlist</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {watchlistData.map((company) => (
              <div key={company.ticker} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{company.ticker}</span>
                  <Badge variant="outline" className="text-xs">
                    {company.sector}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {CompanyService.formatPrice(company.financial?.currentPrice || 0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {CompanyService.formatMarketCap(company.financial?.marketCap || 0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CompanyTestSkeleton() {
  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-12" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}