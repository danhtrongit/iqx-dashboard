import { useMemo } from "react";
import AriXHubSellChart from "@/components/charts/arix-hub-sell-chart";
import AriXHubSellTable from "@/components/charts/arix-hub-sell-table";
import AriXHubPlanTable from "@/components/charts/arix-hub-plan-table";
import AriXHubHoldTable from "@/components/charts/arix-hub-hold-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useArixSellTrades } from "@/hooks/use-arix-sell";
import { useArixPlanPositions } from "@/hooks/use-arix-plan";
import { useArixHoldPositions } from "@/hooks/use-arix-hold";
import { 
  BarChart3Icon, 
  TableIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  ActivityIcon,
  PercentIcon,
  WalletIcon,
  TargetIcon,
  ClipboardListIcon,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArixSellTrade } from "@/types/arix-sell";

export default function AriXHubPage() {
  // Fetch data from APIs
  const { data: arixSellData, isLoading: isLoadingSell } = useArixSellTrades();
  const { data: arixPlanData, isLoading: isLoadingPlan } = useArixPlanPositions();
  const { data: arixHoldData, isLoading: isLoadingHold } = useArixHoldPositions();

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!arixSellData?.trades) return [];
    
    return arixSellData.trades.map((trade: ArixSellTrade, index: number) => {
      const returnPercent = parseFloat(trade.returnPercent.replace('%', '')) || 0;
      
      return {
        id: `trade-${index}`,
        symbol: trade.stockCode,
        value: Math.abs(returnPercent),
        percentChange: returnPercent,
        volume: trade.quantity,
        details: {
          profit: trade.profitLoss,
          daysHeld: trade.daysHeld,
          buyDate: trade.buyDate,
          quantity: trade.quantity,
          buyPrice: trade.buyPrice,
          sellPrice: trade.sellPrice,
          sellDate: trade.sellDate,
          status: trade.profitLoss >= 0 ? 'Lãi' : 'Lỗ',
        },
      };
    });
  }, [arixSellData]);

  // Calculate statistics for sell
  const statistics = useMemo(() => {
    if (!arixSellData?.trades || arixSellData.trades.length === 0) {
      return {
        totalTrades: 0,
        profitTrades: 0,
        lossTrades: 0,
        totalProfit: 0,
        avgReturnPercent: 0,
      };
    }

    const totalTrades = arixSellData.trades.length;
    const profitTrades = arixSellData.trades.filter(t => t.profitLoss >= 0).length;
    const lossTrades = totalTrades - profitTrades;
    const totalProfit = arixSellData.trades.reduce((sum, t) => sum + t.profitLoss, 0);
    
    // SUM(% lợi nhuận) / 10
    const sumReturnPercent = arixSellData.trades.reduce((sum, t) => {
      const returnPercent = parseFloat(t.returnPercent.replace('%', '')) || 0;
      return sum + returnPercent;
    }, 0);
    const avgReturnPercent = sumReturnPercent / 10;

    return {
      totalTrades,
      profitTrades,
      lossTrades,
      totalProfit,
      avgReturnPercent,
    };
  }, [arixSellData]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Calculate portfolio summary
  const portfolioSummary = useMemo(() => {
    const BASE_CAPITAL = 1000000000; // 1 tỉ đồng
    const realizedProfit = statistics.totalProfit; // P/L from sell history
    const unrealizedProfit = arixHoldData?.totalProfitLoss || 0; // P/L from holdings
    const totalAssets = BASE_CAPITAL + realizedProfit;
    
    // Calculate percentages
    const totalAssetsPercent = BASE_CAPITAL > 0 ? (realizedProfit / BASE_CAPITAL) * 100 : 0;
    const unrealizedPercent = arixHoldData?.totalProfitLossPercent || 0;
    const realizedPercent = BASE_CAPITAL > 0 ? (realizedProfit / BASE_CAPITAL) * 100 : 0;

    return {
      totalAssets,
      unrealizedProfit,
      realizedProfit,
      totalAssetsPercent,
      unrealizedPercent,
      realizedPercent,
    };
  }, [statistics.totalProfit, arixHoldData?.totalProfitLoss, arixHoldData?.totalProfitLossPercent]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AriX Hub</h1>
          <p className="text-muted-foreground mt-1">
            Trợ lý đầu tư AI 
            </p>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-row items-center gap-4 justify-between">
            <div className="size-16 bg-iqx-primary/20 flex items-center justify-center rounded-full">
              <div className="h-10 w-10 bg-iqx-primary/80 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-1 flex-1">
              <CardTitle className="text-sm uppercase font-medium text-muted-foreground mb-0">
                Tổng tài sản
              </CardTitle>
              <div className="text-lg font-bold tracking-tight text-primary">
                {formatCurrency(portfolioSummary.totalAssets)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-medium p-1 rounded px-2",
                portfolioSummary.realizedProfit >= 0 ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10'
              )}>
                {portfolioSummary.realizedProfit >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {portfolioSummary.realizedProfit >= 0 ? '+' : ''}
                {portfolioSummary.totalAssetsPercent.toFixed(2)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 justify-between">
            <div className="size-16 bg-iqx-primary/20 flex items-center justify-center rounded-full">
              <div className="h-10 w-10 bg-iqx-primary/80 rounded-full flex items-center justify-center">
                <TrendingUpIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-1 flex-1">
              <CardTitle className="text-sm uppercase font-medium text-muted-foreground mb-0">
                Lợi nhuận dự kiến
              </CardTitle>
              <div className={cn(
                "text-lg font-bold tracking-tight",
                portfolioSummary.unrealizedProfit >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {formatCurrency(Math.abs(portfolioSummary.unrealizedProfit))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-medium p-1 rounded px-2",
                portfolioSummary.unrealizedProfit >= 0 ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10'
              )}>
                {portfolioSummary.unrealizedProfit >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {portfolioSummary.unrealizedProfit >= 0 ? '+' : ''}
                {portfolioSummary.unrealizedPercent.toFixed(2)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 justify-between">
            <div className="size-16 bg-iqx-primary/20 flex items-center justify-center rounded-full">
              <div className="h-10 w-10 bg-iqx-primary/80 rounded-full flex items-center justify-center">
                <ActivityIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-1 flex-1">
              <CardTitle className="text-sm uppercase font-medium text-muted-foreground mb-0">
                Lợi nhuận đã thực hiện
              </CardTitle>
              <div className={cn(
                "text-lg font-bold tracking-tight",
                portfolioSummary.realizedProfit >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {formatCurrency(Math.abs(portfolioSummary.realizedProfit))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-medium p-1 rounded px-2",
                portfolioSummary.realizedProfit >= 0 ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10'
              )}>
                {portfolioSummary.realizedProfit >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {portfolioSummary.realizedProfit >= 0 ? '+' : ''}
                {portfolioSummary.realizedPercent.toFixed(2)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: Arix Plan Table */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TargetIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Kế hoạch giao dịch</h2>
        </div>
        <AriXHubPlanTable data={arixPlanData?.positions || []} isLoading={isLoadingPlan} />
      </section>

      {/* Section 2: Arix Hold Table */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <WalletIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Danh mục nắm giữ</h2>
        </div>
        <AriXHubHoldTable data={arixHoldData?.positions || []} isLoading={isLoadingHold} />
      </section>

      {/* Section 3: Arix Sell with Tabs */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardListIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Lịch sử giao dịch</h2>
        </div>
        
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalTrades}</div>
                <p className="text-xs text-muted-foreground">Lệnh</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lãi</CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{statistics.profitTrades}</div>
                <p className="text-xs text-muted-foreground">Giao dịch</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lỗ</CardTitle>
                <TrendingDownIcon className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{statistics.lossTrades}</div>
                <p className="text-xs text-muted-foreground">Giao dịch</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng P/L</CardTitle>
                <WalletIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${statistics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(statistics.totalProfit)}
                </div>
                <p className="text-xs text-muted-foreground">VND</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lãi TB/10</CardTitle>
                <PercentIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${statistics.avgReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {statistics.avgReturnPercent.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">Trung bình</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Table Tabs */}
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="chart" className="flex items-center gap-2">
                <BarChart3Icon className="h-4 w-4" />
                Biểu đồ
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <TableIcon className="h-4 w-4" />
                Bảng dữ liệu
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Biểu đồ bubble giao dịch</CardTitle>
                  <CardDescription>
                    Kích thước bubble thể hiện % lợi nhuận, màu xanh là lãi, màu đỏ là lỗ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AriXHubSellChart data={chartData} width={1200} height={500} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table" className="mt-6">
              <AriXHubSellTable data={arixSellData?.trades || []} isLoading={isLoadingSell} />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}