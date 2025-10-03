import { PortfolioStats } from "@/components/personalized/portfolio-stats";
import { HoldingsList } from "@/components/personalized/holdings-list";
import { PortfolioAllocation } from "@/components/personalized/portfolio-allocation";
import { QuickTrading } from "@/components/personalized/quick-trading";
import { Watchlist } from "@/components/personalized/watchlist";
import { VirtualTradingHistory } from "@/components/personalized/virtual-trading-history";
import { StockNews } from "@/components/personalized/stock-news";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { TradingModal } from "@/components/personalized/trading-modal";
import XGBoostDashboard from "@/components/xgboost";

export default function PersonalPage() {
  const [tradingModalOpen, setTradingModalOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [tradingMode, setTradingMode] = useState<"BUY" | "SELL">("BUY");

  const handleTrade = (symbolCode: string, mode: "BUY" | "SELL") => {
    setSelectedSymbol(symbolCode);
    setTradingMode(mode);
    setTradingModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Portfolio Statistics */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Tổng quan</h2>
        <PortfolioStats />
      </section>

      {/* Quick Trading & Portfolio Details */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Chi tiết đầu tư</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <QuickTrading />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <HoldingsList onTrade={handleTrade} />
            <PortfolioAllocation />
          </div>
        </div>
      </section>

      {/* Tabs cho Watchlist và Transaction History */}
      <section>
        <Tabs defaultValue="watchlist" className="w-full">
          <TabsList className="h-9">
            <TabsTrigger value="watchlist" className="text-sm">Theo dõi</TabsTrigger>
            <TabsTrigger value="history" className="text-sm">Lịch sử</TabsTrigger>
          </TabsList>
          <TabsContent value="watchlist" className="mt-4">
            <Watchlist />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <VirtualTradingHistory />
          </TabsContent>
        </Tabs>
      </section>

      {/* Tabs cho Stock News và XGBoost */}
      <section>
        <Tabs defaultValue="stock-news" className="w-full">
          <TabsList className="h-9">
            <TabsTrigger value="stock-news" className="text-sm">Tin tức</TabsTrigger>
            <TabsTrigger value="xgboost" className="text-sm">Dự đoán</TabsTrigger>
          </TabsList>
          <TabsContent value="stock-news" className="mt-4">
            <StockNews />
          </TabsContent>
          <TabsContent value="xgboost" className="mt-4">
            <XGBoostDashboard />
          </TabsContent>
        </Tabs>
      </section>

      {/* Trading Modal */}
      <TradingModal
        isOpen={tradingModalOpen}
        onClose={() => setTradingModalOpen(false)}
        symbolCode={selectedSymbol}
        defaultMode={tradingMode}
      />
    </div>
  );
}
