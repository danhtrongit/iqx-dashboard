import { PortfolioStats } from "@/components/personalized/portfolio-stats";
import { HoldingsList } from "@/components/personalized/holdings-list";
import { PortfolioAllocation } from "@/components/personalized/portfolio-allocation";
import { QuickTrading } from "@/components/personalized/quick-trading";
import { VirtualTradingHistory } from "@/components/personalized/virtual-trading-history";
import { StockNews } from "@/components/personalized/stock-news";
import { SignalMonitor } from "@/components/personalized/signal-monitor";

export default function PersonalPage() {

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">

      {/* Portfolio Statistics */}
      <section>
        <PortfolioStats />
      </section>

      {/* Quick Trading & Portfolio Details */}
      <section>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1 h-full">
            <QuickTrading />
          </div>
          <div className="lg:col-span-2 space-y-4 h-full">
            <HoldingsList />
          </div>
        </div>

      </section>

      <section className="`">
        <PortfolioAllocation />
      </section>

      {/* Signal Monitor */}
      <section>
        <SignalMonitor />
      </section>

      {/* Tabs cho Watchlist và Transaction History */}
      <section>
        <VirtualTradingHistory />
      </section>

      {/* Tabs cho Stock News và XGBoost */}
      <section>
        <StockNews />
      </section>
    </div>
  );
}
