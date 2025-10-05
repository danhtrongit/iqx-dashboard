import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useOHLCChartGap } from "@/features/market/api/useMarket";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

type MarketIndexData = {
  symbol: string;
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
  t: string[];
  accumulatedVolume: number[];
  accumulatedValue: number[];
  minBatchTruncTime: string;
};

const getWeekdayTimestamps = (): { from: number; to: number } => {
  const vietnamNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const currentDay = vietnamNow.getDay();
  const daysToSubtract = currentDay === 0 ? 2 : currentDay === 6 ? 1 : 0;
  const targetDate = new Date(vietnamNow);
  targetDate.setDate(targetDate.getDate() - daysToSubtract);
  const toDate = new Date(targetDate.setHours(23, 59, 59, 0));
  const fromDate = new Date(targetDate.setHours(0, 0, 0, 0));
  fromDate.setDate(fromDate.getDate() - 1);
  return { 
    from: Math.floor(fromDate.getTime() / 1000), 
    to: Math.floor(toDate.getTime() / 1000) 
  };
};

const formatNumber = (value: number, decimals = 2) => 
  value.toLocaleString('vi-VN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function MarketIndexCard({ data }: { data: MarketIndexData }) {
  const [current, previous] = [data.c[0] || 0, data.o[0] || 0];
  const change = current - previous;
  const changePercent = previous ? (change / previous) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl" />
      
      <div className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground">{data.symbol}</h3>
            <p className="text-2xl font-bold tracking-tight mt-1">{formatNumber(current)}</p>
          </div>
          {isPositive ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-500" />
          )}
        </div>

        {/* Change */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isPositive 
            ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
            : 'bg-red-500/10 text-red-600 dark:text-red-400'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {isPositive ? '+' : ''}{formatNumber(change)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="text-muted-foreground">Cao</p>
            <p className="font-semibold">{formatNumber(data.h[0] || 0)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground">Thấp</p>
            <p className="font-semibold">{formatNumber(data.l[0] || 0)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground">KL (tr)</p>
            <p className="font-semibold">{((data.accumulatedVolume[0] || 0) / 1000000).toFixed(1)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground">GT (tỷ)</p>
            <p className="font-semibold">{formatNumber((data.accumulatedValue[0] || 0) / 1000, 1)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

const LoadingSkeleton = ({ symbols }: { symbols: string[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
    {symbols.map((symbol) => (
      <Card key={symbol} className="border-0 bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="animate-pulse space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-muted rounded w-20" />
              <div className="h-7 bg-muted rounded w-28" />
            </div>
            <div className="w-5 h-5 bg-muted rounded-full" />
          </div>
          <div className="h-6 bg-muted rounded-full w-32" />
          <div className="border-t border-border/50" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-2.5 bg-muted rounded w-12" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export default function MarketIndices() {
  const symbols = ["VNINDEX", "VN30", "HNXIndex", "HNX30", "HNXUpcomIndex"];
  const { from, to } = useMemo(() => getWeekdayTimestamps(), []);

  const { data, isLoading, isError } = useOHLCChartGap({
    timeFrame: "ONE_DAY",
    symbols,
    from,
    to,
  });

  if (isLoading) return <LoadingSkeleton symbols={symbols} />;
  
  if (isError || !data) {
    return (
      <Card className="border-dashed">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <TrendingDown className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Không thể tải dữ liệu chỉ số thị trường</p>
          <p className="text-xs text-muted-foreground mt-1">Vui lòng thử lại sau</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="text-xl font-bold">Chỉ số thị trường</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {(Array.isArray(data) ? data : []).map((item: MarketIndexData) => (
          <MarketIndexCard key={item.symbol} data={item} />
        ))}
      </div>
    </div>
  );
}