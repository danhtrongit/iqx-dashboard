import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePeerComparison } from '@/features/peer-comparison/api/usePeerComparison'
import { TrendingUp, TrendingDown, Minus, Info, AlertCircle, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function PeerComparison({ symbol }: { symbol: string }) {
  const { data, isLoading, error } = usePeerComparison(symbol)

  // Sort data: target symbol first, then Median, then others
  const rows = useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => {
      if (a.ticker === symbol) return -1
      if (b.ticker === symbol) return 1
      if (a.ticker === 'Median') return -1
      if (b.ticker === 'Median') return 1
      return a.ticker.localeCompare(b.ticker)
    })
  }, [data, symbol])

  const nf2 = useMemo(() => new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [])
  const pf1 = useMemo(() => new Intl.NumberFormat('vi-VN', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }), [])

  // Calculate statistics
  const stats = useMemo(() => {
    if (rows.length === 0) return null
    
    const targetData = rows.find(r => r.ticker === symbol)
    const medianData = rows.find(r => r.ticker === 'Median')
    const peersData = rows.filter(r => r.ticker !== symbol && r.ticker !== 'Median')
    
    return {
      targetData,
      medianData,
      peersData,
      peerCount: peersData.length,
    }
  }, [rows, symbol])

  // Helper function to render growth indicator
  const renderGrowthIndicator = (value: number | null | undefined) => {
    if (value == null) return <span className="text-muted-foreground">-</span>
    
    const formatted = pf1.format(value)
    const icon = value > 0 ? <TrendingUp className="h-3 w-3" /> : 
                 value < 0 ? <TrendingDown className="h-3 w-3" /> : 
                 <Minus className="h-3 w-3" />
    
    return (
      <div className={cn(
        "flex items-center justify-end gap-1",
        value > 0 ? "text-green-600 dark:text-green-400" :
        value < 0 ? "text-red-600 dark:text-red-400" :
        "text-muted-foreground"
      )}>
        {icon}
        <span>{formatted}</span>
      </div>
    )
  }

  // Helper function to render valuation metric
  const renderValuation = (value: number | null | undefined) => {
    if (value == null) return <span className="text-muted-foreground">-</span>
    return <span>{nf2.format(value)}</span>
  }


  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              So sánh cùng ngành
            </CardTitle>
            <CardDescription className="mt-1">
              {symbol} · Đối chiếu với {stats?.peerCount || 0} công ty cùng ngành
            </CardDescription>
          </div>
          {stats && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {stats.peerCount} peers
              </Badge>
              {stats.medianData && (
                <Badge variant="secondary" className="text-xs">
                  Có Median
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error.message || 'Lỗi tải dữ liệu'}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Info className="h-4 w-4 mr-2" />
            Không có dữ liệu so sánh
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Cards */}
            {stats?.targetData && stats?.medianData && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">P/E 2025F</div>
                  <div className="text-lg font-semibold">
                    {renderValuation(stats.targetData.pe?.['2025F'])}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Median: {renderValuation(stats.medianData.pe?.['2025F'])}
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">P/B 2025F</div>
                  <div className="text-lg font-semibold">
                    {renderValuation(stats.targetData.pb?.['2025F'])}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Median: {renderValuation(stats.medianData.pb?.['2025F'])}
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">NPATMI Growth 2025F</div>
                  <div className="text-lg font-semibold">
                    {stats.targetData.npatmiGrowth?.['2025F'] != null ? 
                      pf1.format(stats.targetData.npatmiGrowth['2025F']) : '-'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Median: {stats.medianData.npatmiGrowth?.['2025F'] != null ?
                      pf1.format(stats.medianData.npatmiGrowth['2025F']) : '-'}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs for different views */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="growth">Tăng trưởng</TabsTrigger>
                <TabsTrigger value="valuation">Định giá</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <div className="w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap sticky left-0 bg-background">Mã</TableHead>
                        <TableHead className="whitespace-nowrap text-right">NPATMI 2025F</TableHead>
                        <TableHead className="whitespace-nowrap text-right">NPATMI 2026F</TableHead>
                        <TableHead className="whitespace-nowrap text-right">P/E 2025F</TableHead>
                        <TableHead className="whitespace-nowrap text-right">P/E 2026F</TableHead>
                        <TableHead className="whitespace-nowrap text-right">P/B 2025F</TableHead>
                        <TableHead className="whitespace-nowrap text-right">P/B 2026F</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow 
                          key={`${r.id}-${r.ticker}`}
                          className={cn(
                            r.ticker === symbol && "bg-primary/5 font-medium",
                            r.ticker === 'Median' && "bg-muted/50 border-t-2"
                          )}
                        >
                          <TableCell className="font-medium sticky left-0 bg-background">
                            <div className="flex items-center gap-2">
                              {r.ticker}
                              {r.ticker === symbol && (
                                <Badge variant="default" className="text-xs">YOU</Badge>
                              )}
                              {r.ticker === 'Median' && (
                                <Badge variant="outline" className="text-xs">MED</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {renderGrowthIndicator(r.npatmiGrowth?.['2025F'])}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderGrowthIndicator(r.npatmiGrowth?.['2026F'])}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderValuation(r.pe?.['2025F'])}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderValuation(r.pe?.['2026F'])}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderValuation(r.pb?.['2025F'])}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderValuation(r.pb?.['2026F'])}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="growth" className="mt-4">
                <div className="w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap sticky left-0 bg-background">Mã</TableHead>
                        <TableHead className="whitespace-nowrap text-right">NPATMI 2025F</TableHead>
                        <TableHead className="whitespace-nowrap text-right">NPATMI 2026F</TableHead>
                        <TableHead className="whitespace-nowrap text-right">Avg Growth</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => {
                        const avgGrowth = (r.npatmiGrowth?.['2025F'] != null && r.npatmiGrowth?.['2026F'] != null)
                          ? (r.npatmiGrowth['2025F'] + r.npatmiGrowth['2026F']) / 2
                          : null
                        
                        return (
                          <TableRow 
                            key={`growth-${r.id}-${r.ticker}`}
                            className={cn(
                              r.ticker === symbol && "bg-primary/5 font-medium",
                              r.ticker === 'Median' && "bg-muted/50 border-t-2"
                            )}
                          >
                            <TableCell className="font-medium sticky left-0 bg-background">
                              <div className="flex items-center gap-2">
                                {r.ticker}
                                {r.ticker === symbol && (
                                  <Badge variant="default" className="text-xs">YOU</Badge>
                                )}
                                {r.ticker === 'Median' && (
                                  <Badge variant="outline" className="text-xs">MED</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {renderGrowthIndicator(r.npatmiGrowth?.['2025F'])}
                            </TableCell>
                            <TableCell className="text-right">
                              {renderGrowthIndicator(r.npatmiGrowth?.['2026F'])}
                            </TableCell>
                            <TableCell className="text-right">
                              {renderGrowthIndicator(avgGrowth)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="valuation" className="mt-4">
                <div className="w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap sticky left-0 bg-background">Mã</TableHead>
                        <TableHead className="whitespace-nowrap text-right">P/E 2025F</TableHead>
                        <TableHead className="whitespace-nowrap text-right">P/E 2026F</TableHead>
                        <TableHead className="whitespace-nowrap text-right">P/B 2025F</TableHead>
                        <TableHead className="whitespace-nowrap text-right">P/B 2026F</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow 
                          key={`val-${r.id}-${r.ticker}`}
                          className={cn(
                            r.ticker === symbol && "bg-primary/5 font-medium",
                            r.ticker === 'Median' && "bg-muted/50 border-t-2"
                          )}
                        >
                          <TableCell className="font-medium sticky left-0 bg-background">
                            <div className="flex items-center gap-2">
                              {r.ticker}
                              {r.ticker === symbol && (
                                <Badge variant="default" className="text-xs">YOU</Badge>
                              )}
                              {r.ticker === 'Median' && (
                                <Badge variant="outline" className="text-xs">MED</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {renderValuation(r.pe?.['2025F'])}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderValuation(r.pe?.['2026F'])}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderValuation(r.pb?.['2025F'])}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderValuation(r.pb?.['2026F'])}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
