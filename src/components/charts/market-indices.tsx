import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOHLCChartGap } from "@/features/market/api/useMarket";

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

function getWeekdayTimestamps(): { from: number; to: number } {
  const now = new Date();
  const vietnamNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const currentDay = vietnamNow.getDay(); // 0 = Sunday, 6 = Saturday

  let targetDate = new Date(vietnamNow);

  // If today is weekend, get Friday's data
  if (currentDay === 0) { // Sunday
    targetDate.setDate(targetDate.getDate() - 2); // Go to Friday
  } else if (currentDay === 6) { // Saturday
    targetDate.setDate(targetDate.getDate() - 1); // Go to Friday
  }

  // Get 2 most recent trading days
  const toDate = new Date(targetDate);
  const fromDate = new Date(targetDate);
  fromDate.setDate(fromDate.getDate() - 1);

  // Convert to start and end of day timestamps
  const to = Math.floor(new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59).getTime() / 1000);
  const from = Math.floor(new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0).getTime() / 1000);

  return { from, to };
}

function MarketIndexCard({ data }: { data: MarketIndexData }) {
  const current = data.c[0] || 0;
  const previous = data.o[0] || current;
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
  const isPositive = change >= 0;

  const volume = data.accumulatedVolume[0] || 0;
  const value = data.accumulatedValue[0] || 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{data.symbol}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="text-2xl font-semibold">
            {current.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
              {isPositive ? '+' : ''}{change.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Badge>
            <span className={`text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Cao nhất</div>
            <div className="font-medium">{(data.h[0] || 0).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Thấp nhất</div>
            <div className="font-medium">{(data.l[0] || 0).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Khối lượng</div>
            <div className="font-medium">{volume.toLocaleString('vi-VN')}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Giá trị (tỷ)</div>
            <div className="font-medium">{(value / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketIndices() {
  const { from, to } = useMemo(() => getWeekdayTimestamps(), []);

  const symbols = ["VNINDEX", "VN30", "HNXIndex", "HNX30", "HNXUpcomIndex"];

  const { data, isLoading, isError } = useOHLCChartGap({
    timeFrame: "ONE_DAY",
    symbols,
    from,
    to,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {symbols.map((symbol) => (
          <Card key={symbol} className="h-[200px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">{symbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-3">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không thể tải dữ liệu chỉ số thị trường</p>
      </div>
    );
  }

  const marketData = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Chỉ số thị trường</h2>
        <p className="text-sm text-muted-foreground">
          Cập nhật: {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {marketData.map((item: MarketIndexData) => (
          <MarketIndexCard key={item.symbol} data={item} />
        ))}
      </div>
    </div>
  );
}