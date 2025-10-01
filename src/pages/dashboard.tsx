import LastestNews from "@/components/dashboard/lastest-news";
import MarketIndex from "@/components/charts/market-index";
import VNIndexTechnicalAnalysis from "@/components/charts/vnindex-technical-analysis";
import IndexImpactChart from "@/components/charts/index-impact-chart";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopProprietary from "@/components/charts/top-proprietary";
import ForeignNetValue from "@/components/charts/foreign-net-value";
import MarketAllocation from "@/components/charts/market-allocation";
import { MarketBehavior } from "@/components/charts/market-behavior";
import CashFlowAllocation from "@/components/charts/cash-flow-allocation";
import AllocatedICBTable from "@/components/charts/allocated-icb";
import MarketIndices from "@/components/charts/market-indices";
import XGBoostDashboard from "@/components/xgboost";

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 space-y-8">

      <XGBoostDashboard />

      <LastestNews />
      <div className="relative">
        <h2 className="text-2xl font-bold mb-4">Thống kê thị trường</h2>
        <MarketIndex />
      </div>
      <MarketIndices />

      <div className="relative">
        <h2 className="text-2xl font-bold mb-4">Cổ phiếu dẫn dắt thị trường</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          <IndexImpactChart />

          <Card>
            <Tabs defaultValue="top-proprietary" className="items-center w-full">
              <TabsList className="h-auto rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="top-proprietary"
                  className="border-0 data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Tự doanh
                </TabsTrigger>
                <TabsTrigger
                  value="foreign-net-value"
                  className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Khối ngoại
                </TabsTrigger>
              </TabsList>
              <TabsContent value="top-proprietary" className="w-full">
                <TopProprietary />
              </TabsContent>
              <TabsContent value="foreign-net-value" className="w-full">
                <ForeignNetValue />
              </TabsContent>
            </Tabs>

          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <MarketAllocation />
        <AllocatedICBTable />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <CashFlowAllocation />
        </div>
        <div className="lg:col-span-2">
          <MarketBehavior />
        </div>
      </div>

      <VNIndexTechnicalAnalysis />

    </div>
  )
}