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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Portfolio Statistics - 4 thẻ thống kê tổng quan */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Tổng quan Portfolio</h2>
        <PortfolioStats />
      </section>

      {/* Quick Trading & Portfolio Details - 3 cột */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Chi tiết đầu tư</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Trading - Cột trái */}
          <div className="lg:col-span-1">
            <QuickTrading />
          </div>

          {/* Holdings List - Cột giữa rộng hơn */}
          <div className="lg:col-span-2 space-y-6">
            <HoldingsList onTrade={handleTrade} />
            <PortfolioAllocation />
          </div>
        </div>
      </section>

      {/* Tabs cho Watchlist và Transaction History */}
      <section>
        <Tabs defaultValue="watchlist" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="watchlist">Danh sách theo dõi</TabsTrigger>
            <TabsTrigger value="history">Lịch sử giao dịch</TabsTrigger>
          </TabsList>
          <TabsContent value="watchlist" className="mt-6">
            <Watchlist />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <VirtualTradingHistory />
          </TabsContent>
        </Tabs>
      </section>


      {/* Tabs cho Stock News và XGBoost */}
      <section>
        <Tabs defaultValue="stock-news" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="stock-news">Tin tức liên quan</TabsTrigger>
            <TabsTrigger value="xgboost">Mô hình XGBoost</TabsTrigger>
          </TabsList>
          <TabsContent value="stock-news" className="mt-6">
            <StockNews />
          </TabsContent>
          <TabsContent value="xgboost" className="mt-6">
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
