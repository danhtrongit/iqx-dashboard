import PeerComparison from "./components/peer-comparison"
import { StockProfile } from "./components/stock-profile"
import TechnicalAnalysis from "./components/technical-analysis"
import { Organization } from "./components/organization"
import ForeignNet from "./components/foreign-net"
import News from "./components/news"
import FinancialReport from "./components/financial-report"
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
            <TabsList className="grid w-full grid-cols-7 h-auto rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="market-index"
                className="relative rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Giá
              </TabsTrigger>
              <TabsTrigger
                value="peer-comparison"
                className="relative rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                So sánh
              </TabsTrigger>
              <TabsTrigger
                value="technical-analysis"
                className="relative rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Kỹ thuật
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className="relative rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Tổ chức
              </TabsTrigger>
              <TabsTrigger
                value="foreign-net"
                className="relative rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Khối ngoại
              </TabsTrigger>
              <TabsTrigger
                value="financial-report"
                className="relative rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Tài chính
              </TabsTrigger>
              <TabsTrigger
                value="analysis-report"
                className="relative rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
              >
                Phân tích
              </TabsTrigger>
              <TabsTrigger
                value="news"
                className="relative rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
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

              <TabsContent value="peer-comparison" className="m-0">
                <div className="max-w-full">
                  <PeerComparison symbol={ticker} />
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