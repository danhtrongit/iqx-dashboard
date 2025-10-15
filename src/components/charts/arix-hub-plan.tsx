import { useMemo } from "react";
import AriXHubPlanChart from "@/components/charts/arix-hub-plan-chart";
import AriXHubPlanTable from "@/components/charts/arix-hub-plan-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useArixPlanPositions, useArixPlanStatistics } from "@/hooks/use-arix-plan";
import { 
  BarChart3Icon, 
  TableIcon, 
  TrendingUpIcon, 
  TargetIcon,
  PercentIcon,
  ShieldIcon
} from "lucide-react";

export default function AriXHubPlan() {
  // Fetch data from API
  const { data: arixData, isLoading } = useArixPlanPositions();
  const { data: statistics } = useArixPlanStatistics();

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!arixData?.positions) return [];
    
    return arixData.positions.map((position, index) => {
      const returnPercent = ((position.target - position.buyPrice) / position.buyPrice) * 100;
      const riskPercent = ((position.buyPrice - position.stopLoss) / position.buyPrice) * 100;
      const potentialGain = position.target - position.buyPrice;
      const potentialLoss = position.buyPrice - position.stopLoss;
      
      return {
        id: `plan-${index}`,
        symbol: position.symbol,
        value: position.returnRisk,
        returnPercent,
        riskPercent,
        details: {
          buyPrice: position.buyPrice,
          stopLoss: position.stopLoss,
          target: position.target,
          returnRisk: position.returnRisk,
          potentialGain,
          potentialLoss,
        },
      };
    });
  }, [arixData]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng kế hoạch</CardTitle>
              <TargetIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalPositions}</div>
              <p className="text-xs text-muted-foreground">Cơ hội giao dịch</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giá mua TB</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(statistics.avgBuyPrice)}</div>
              <p className="text-xs text-muted-foreground">VND</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Target TB</CardTitle>
              <TargetIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(statistics.avgTarget)}</div>
              <p className="text-xs text-muted-foreground">VND</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">R/R TB</CardTitle>
              <PercentIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.avgReturnRisk.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Tỷ lệ Lãi/Rủi ro</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for Chart and Table */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Bảng dữ liệu
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <BarChart3Icon className="h-4 w-4" />
            Biểu đồ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-6">
          <AriXHubPlanTable data={arixData?.positions || []} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="chart" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ kế hoạch giao dịch</CardTitle>
              <CardDescription>
                Kích thước bubble thể hiện tỷ lệ Lãi/Rủi ro. Màu xanh lá: R/R ≥ 5 (Tốt), Màu vàng: R/R ≥ 3 (Trung bình), Màu cam: R/R &lt; 3 (Cẩn trọng)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AriXHubPlanChart data={chartData} width={1200} height={500} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Opportunities */}
      {statistics?.topOpportunities && statistics.topOpportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5" />
              Top 5 Cơ hội tốt nhất
            </CardTitle>
            <CardDescription>
              Các cổ phiếu có tỷ lệ Lãi/Rủi ro cao nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.topOpportunities.slice(0, 5).map((position, index) => {
                const returnPercent = ((position.target - position.buyPrice) / position.buyPrice) * 100;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-lg">{position.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        Mua: {formatCurrency(position.buyPrice)} | Target: {formatCurrency(position.target)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-green-600 font-semibold">+{returnPercent.toFixed(2)}%</span>
                      </div>
                      <div className="font-bold text-lg text-primary">
                        R/R: {position.returnRisk.toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

