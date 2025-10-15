import { StockProfile } from "./components/stock-profile"
import TechnicalAnalysis from "./components/technical-analysis"
import { Organization } from "./components/organization"
import ForeignNet from "./components/foreign-net"
import News from "./components/news"
import FinancialReport from "./components/financial-report"
import FinancialRatioTable from "./components/financial-ratio-table"
import AnalysisReport from "./components/analysis-report"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import MarketIndex from "@/components/charts/market-index"

export default function StockDetail({ ticker }: { ticker: string }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="space-y-8">
          <StockProfile ticker={ticker} />

          <Tabs defaultValue="market-index" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto  border-b bg-transparent p-0">
              <TabsTrigger
                value="market-index"
                className="relative py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-1 data-[state=active]:after:rounded-lg data-[state=active]:after:bg-blue-700"
              >
                Giá
              </TabsTrigger>
              <TabsTrigger
                value="technical-analysis"
                className="relative py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-1 data-[state=active]:after:rounded-lg data-[state=active]:after:bg-blue-700"
              >
                Kỹ thuật
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className="relative py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-1 data-[state=active]:after:rounded-lg data-[state=active]:after:bg-blue-700"
              >
                Tổ chức
              </TabsTrigger>
              <TabsTrigger
                value="foreign-net"
                className="relative py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-1 data-[state=active]:after:rounded-lg data-[state=active]:after:bg-blue-700"
              >
                Khối ngoại
              </TabsTrigger>
              <TabsTrigger
                value="financial-report"
                className="relative py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-1 data-[state=active]:after:rounded-lg data-[state=active]:after:bg-blue-700"
              >
                Báo cáo TC
              </TabsTrigger>
              <TabsTrigger
                value="financial-ratios"
                className="relative py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-1 data-[state=active]:after:rounded-lg data-[state=active]:after:bg-blue-700"
              >
                Chỉ số TC
              </TabsTrigger>
              <TabsTrigger
                value="analysis-report"
                className="relative py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-1 data-[state=active]:after:rounded-lg data-[state=active]:after:bg-blue-700"
              >
                Phân tích
              </TabsTrigger>
              <TabsTrigger
                value="news"
                className="relative py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-1 data-[state=active]:after:rounded-lg data-[state=active]:after:bg-blue-700"
              >
                Tin tức
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="market-index" className="m-0">
                <div className="max-w-full">
                  <MarketIndex symbol={ticker} />
                </div>
              </TabsContent>

              <TabsContent value="technical-analysis" className="m-0">
                <div className="max-w-full">
                  <TechnicalAnalysis symbol={ticker} />
                </div>
              </TabsContent>

              <TabsContent value="organization" className="m-0">
                <div className="max-w-full">
                  <Organization ticker={ticker} />
                </div>
              </TabsContent>

              <TabsContent value="foreign-net" className="m-0">
                <div className="max-w-full">
                  <ForeignNet symbol={ticker} />
                </div>
              </TabsContent>

              <TabsContent value="financial-report" className="m-0">
                <div className="max-w-full">
                  <FinancialReport symbol={ticker} />
                </div>
              </TabsContent>

              <TabsContent value="financial-ratios" className="m-0">
                <div className="max-w-full">
                  <FinancialRatioTable ticker={ticker} />
                </div>
              </TabsContent>

              <TabsContent value="analysis-report" className="m-0">
                <div className="max-w-full">
                  <AnalysisReport symbol={ticker} />
                </div>
              </TabsContent>

              <TabsContent value="news" className="m-0">
                <div className="max-w-full">
                  <News symbol={ticker} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}