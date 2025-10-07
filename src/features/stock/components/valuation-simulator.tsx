'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, TrendingUp, DollarSign, BarChart3, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchPeerComparisonV2 } from '@/lib/api/peer-comparison';
import { fetchValuationData, fetchStatisticsFinancial } from '@/lib/api/valuation-data';

interface StockData {
  ticker: string;
  pe: number;
  pb: number;
  evEbitda: number;
}

interface CompanyFinancials {
  eps2025F: number; // EPS 2025F - Tài chính công ty (số 4)
  bookValue: number; // Book Value = (EPS * P/E) / P/B
  ebitda2025F: number; // EBITDA để tính EV
  debt: number; // Nợ phải trả (số 5)
  cash: number; // Tiền và tương đương (số 6)
  sharesOutstanding: number; // Số CP lưu hành (số 7)
}

type ValuationSimulatorProps = {
  symbol?: string;
};

export default function ValuationSimulator(props: ValuationSimulatorProps) {
  const { symbol = 'VIC' } = props;

  const [loading, setLoading] = useState(true);
  const [benchmarkStocks, setBenchmarkStocks] = useState<StockData[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [targetEvEbitda, setTargetEvEbitda] = useState<number>(0);
  
  const [financials, setFinancials] = useState<CompanyFinancials>({
    eps2025F: 0,
    bookValue: 0,
    ebitda2025F: 0,
    debt: 0,
    cash: 0,
    sharesOutstanding: 0,
  });

  // Fetch peer comparison data and target company EV/EBITDA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch peer comparison
        const peers = await fetchPeerComparisonV2(symbol);
        
        // Filter out Median and the target stock itself, get actual peers
        const filteredPeers = peers.filter(
          (peer) => peer.ticker !== 'Median' && peer.ticker !== symbol
        );

        // Convert to StockData format and get all stocks (no limit to 5)
        const stocks: StockData[] = filteredPeers.map((peer) => ({
          ticker: peer.ticker,
          pe: peer.pe?.['2025F'] || 0,
          pb: peer.pb?.['2025F'] || 0,
          evEbitda: 0, // Will be fetched separately for each stock
        }));

        // Fetch EV/EBITDA for each peer stock
        const stocksWithEvEbitda = await Promise.all(
          stocks.map(async (stock) => {
            const stats = await fetchStatisticsFinancial(stock.ticker);
            return {
              ...stock,
              evEbitda: stats?.evToEbitda || 0,
            };
          })
        );

        setBenchmarkStocks(stocksWithEvEbitda);
        
        // Auto-select first 3 stocks
        const initialSelection = stocksWithEvEbitda.slice(0, 3).map(s => s.ticker);
        setSelectedStocks(initialSelection);

        // Fetch target company EV/EBITDA
        const targetStats = await fetchStatisticsFinancial(symbol);
        setTargetEvEbitda(targetStats?.evToEbitda || 0);

        // Fetch target company financials
        const valuationData = await fetchValuationData(symbol);
        setFinancials({
          eps2025F: valuationData.eps2025F,
          bookValue: valuationData.bookValue || 0,
          ebitda2025F: valuationData.ebitda2025F,
          debt: valuationData.debt,
          cash: valuationData.cash,
          sharesOutstanding: valuationData.sharesOutstanding,
        });
        
      } catch (error) {
        // No fallback data - show actual error state
        setBenchmarkStocks([]);
        setSelectedStocks([]);
        setTargetEvEbitda(0);
        setFinancials({
          eps2025F: 0,
          bookValue: 0,
          ebitda2025F: 0,
          debt: 0,
          cash: 0,
          sharesOutstanding: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  // Tính toán các chỉ số trung bình
  const averageMultiples = useMemo(() => {
    const selected = benchmarkStocks.filter(stock => selectedStocks.includes(stock.ticker));
    if (selected.length === 0) return { pe: 0, pb: 0, evEbitda: 0 };

    const peAvg = selected.reduce((sum, stock) => sum + stock.pe, 0) / selected.length;
    const pbAvg = selected.reduce((sum, stock) => sum + stock.pb, 0) / selected.length;
    const evEbitdaAvg = selected.reduce((sum, stock) => sum + stock.evEbitda, 0) / selected.length;

    return {
      pe: peAvg,
      pb: pbAvg,
      evEbitda: evEbitdaAvg,
    };
  }, [selectedStocks, benchmarkStocks]);

  // Tính toán giá trị cổ phiếu theo PP1
  const valuations = useMemo(() => {
    const { pe, pb, evEbitda } = averageMultiples;
    const { eps2025F, bookValue, ebitda2025F, debt, cash, sharesOutstanding } = financials;

    // 1. Giá trị CP theo P/E = P/E trung bình × EPS 2025F
    const valuationPE = pe * eps2025F;

    // 2. Giá trị CP theo P/B = P/B trung bình × Book Value
    // Book Value = (EPS * P/E) / P/B
    const valuationPB = pb * bookValue;

    // 3. Giá trị CP theo EV/EBITDA
    // Công thức: Market Cap = (EV/EBITDA TB × EBITDA) - Nợ + Tiền
    // Giá CP = Market Cap / Số CP lưu hành
    const enterpriseValue = evEbitda * ebitda2025F * 1000000; // EBITDA in millions
    const marketCap = enterpriseValue - debt + cash;
    const valuationEV = sharesOutstanding > 0 ? marketCap / sharesOutstanding : 0;

    // 4. Giá trị trung bình của 3 phương pháp
    const averageValuation = (valuationPE + valuationPB + valuationEV) / 3;

    return {
      pe: valuationPE,
      pb: valuationPB,
      evEbitda: valuationEV,
      average: averageValuation,
    };
  }, [averageMultiples, financials]);

  const handleStockToggle = (ticker: string) => {
    setSelectedStocks(prev => 
      prev.includes(ticker) 
        ? prev.filter(t => t !== ticker)
        : [...prev, ticker]
    );
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle>PP1 - Định giá theo Chỉ số cơ bản</CardTitle>
            </div>
            <CardDescription>Mã: {symbol}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Đang tải dữ liệu...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle>PP1 - Định giá theo Chỉ số cơ bản</CardTitle>
          </div>
          <CardDescription>
            Ước tính giá trị hợp lý dựa trên P/E, P/B và EV/EBITDA. Mã: {symbol}
            {targetEvEbitda > 0 && (
              <span className="ml-2 text-primary">
                (EV/EBITDA hiện tại: {targetEvEbitda.toFixed(1)})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bảng so sánh */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Cổ phiếu so sánh ({benchmarkStocks.length} mã) 
              {selectedStocks.length > 0 && (
                <span className="text-muted-foreground font-normal ml-2">
                  (Đã chọn: {selectedStocks.length})
                </span>
              )}
            </h3>
            {benchmarkStocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không tìm thấy cổ phiếu so sánh cho mã {symbol}
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Chọn</th>
                    <th className="text-left py-2">Mã CP</th>
                    <th className="text-right py-2">P/E</th>
                    <th className="text-right py-2">P/B</th>
                    <th className="text-right py-2">EV/EBITDA</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkStocks.map((stock) => (
                    <tr key={stock.ticker} className="border-b hover:bg-muted/50">
                      <td className="py-2">
                        <input
                          type="checkbox"
                          checked={selectedStocks.includes(stock.ticker)}
                          onChange={() => handleStockToggle(stock.ticker)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="py-2 font-medium">{stock.ticker}</td>
                      <td className="text-right py-2">{stock.pe.toFixed(1)}</td>
                      <td className="text-right py-2">{stock.pb.toFixed(1)}</td>
                      <td className="text-right py-2">{stock.evEbitda.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-muted">
                    <td colSpan={2} className="py-2">Hệ số trung bình</td>
                    <td className="text-right py-2 text-primary">{averageMultiples.pe.toFixed(2)}</td>
                    <td className="text-right py-2 text-primary">{averageMultiples.pb.toFixed(2)}</td>
                    <td className="text-right py-2 text-primary">{averageMultiples.evEbitda.toFixed()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            )}
          </div>

          {/* Tài chính công ty mục tiêu */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Tài chính công ty mục tiêu ({symbol})</h3>
              <span className="text-xs text-muted-foreground">Nguồn: API</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">(4) EPS 2025F</p>
                <p className="font-semibold text-sm">{formatNumber(financials.eps2025F)} đ</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Book Value</p>
                <p className="font-semibold text-sm">{formatNumber(financials.bookValue)} đ</p>
                <p className="text-xs text-muted-foreground">(EPS×P/E)÷P/B</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">EBITDA</p>
                <p className="font-semibold text-sm">{formatNumber(financials.ebitda2025F)}M đ</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">(5) Nợ phải trả</p>
                <p className="font-semibold text-sm">{(financials.debt/1e12).toFixed(1)}K tỷ</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">(6) Tiền mặt</p>
                <p className="font-semibold text-sm">{(financials.cash/1e12).toFixed(1)}K tỷ</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">(7) Số CP</p>
                <p className="font-semibold text-sm">{(financials.sharesOutstanding/1e6).toFixed(0)}M</p>
              </div>
            </div>
          </div>

          {/* Kết quả định giá */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-sm font-semibold mb-4">Kết quả định giá</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Theo P/E</span>
                </div>
                <p className="text-lg font-bold text-blue-500">
                  {formatCurrency(valuations.pe)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {averageMultiples.pe.toFixed(1)} × {formatNumber(financials.eps2025F)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-muted-foreground">Theo P/B</span>
                </div>
                <p className="text-lg font-bold text-green-500">
                  {formatCurrency(valuations.pb)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {averageMultiples.pb.toFixed(1)} × {formatNumber(financials.bookValue)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Theo EV/EBITDA</span>
                </div>
                <p className="text-lg font-bold text-purple-500">
                  {formatCurrency(valuations.evEbitda)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Hệ số: {averageMultiples.evEbitda.toFixed(1)}
                </p>
              </div>

              <div className="pl-4 border-l-2 border-primary">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Trung bình</span>
                </div>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(valuations.average)}
                </p>
                <p className="text-xs text-muted-foreground">
                  3 phương pháp
                </p>
              </div>
            </div>
          </div>

          {/* Công thức tính */}
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <div className="space-y-1">
                <p><strong>Công thức tính:</strong></p>
                <p>• Giá theo P/E = P/E trung bình (3) × EPS 2025F (4)</p>
                <p>• Giá theo P/B = P/B trung bình (3) × Book Value</p>
                <p className="ml-4 text-xs">(Book Value = EPS × P/E ÷ P/B)</p>
                <p>• Giá theo EV/EBITDA = [(EV/EBITDA TB (2) × EBITDA) - Nợ (5) + Tiền (6)] / Số CP (7)</p>
                <p>• Giá trung bình = (Giá P/E + Giá P/B + Giá EV/EBITDA) ÷ 3</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Ghi chú */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Lưu ý:</strong> Đây là công cụ định giá dựa trên phương pháp so sánh bội số (PP1). 
              Kết quả chỉ mang tính tham khảo và không phải là khuyến nghị đầu tư.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}


