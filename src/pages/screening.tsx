import { useState, useMemo } from "react";
import { useScreening } from "@/features/screening/api/useScreening";
import type { screening } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScreeningFilters, { buildDefaultFilters, type ScreeningFiltersValue } from "@/components/screening/filters";
import { icb_codes } from "@/data/icb_codes";

// Column configuration mapping
type ColumnConfig = {
  key: string;
  label: string;
  render: (value: any) => React.ReactNode;
  align?: "left" | "right" | "center";
};

const COLUMN_CONFIGS: Record<string, ColumnConfig> = {
  marketPrice: {
    key: "marketPrice",
    label: "Giá",
    align: "right",
    render: (val: number | undefined) => val?.toLocaleString() || "-",
  },
  dailyPriceChangePercent: {
    key: "dailyPriceChangePercent",
    label: "Thay đổi giá",
    align: "right",
    render: (val: number | undefined) =>
      val !== undefined ? (
        <span className={val >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
          {val.toFixed(2)}%
        </span>
      ) : "-",
  },
  stockStrength: {
    key: "stockStrength",
    label: "Sức mạnh giá",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(0) : "-",
  },
  marketCap: {
    key: "marketCap",
    label: "Vốn hóa (tỷ)",
    align: "right",
    render: (val: number | undefined) => val ? (val / 1_000_000_000).toFixed(2) : "-",
  },
  ttmPe: {
    key: "ttmPe",
    label: "P/E",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  ttmPb: {
    key: "ttmPb",
    label: "P/B",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  ttmRoe: {
    key: "ttmRoe",
    label: "ROE (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  rsi: {
    key: "rsi",
    label: "RSI",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  macd: {
    key: "macd",
    label: "MACD",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  macdSignalLine: {
    key: "macdSignalLine",
    label: "MACD Signal",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  histogram: {
    key: "histogram",
    label: "Histogram",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  adx: {
    key: "adx",
    label: "ADX",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  stockTrend: {
    key: "stockTrend",
    label: "Xu hướng",
    align: "left",
    render: (val: string | undefined) => {
      const trendLabels: Record<string, string> = {
        STRONG_UPTREND: "Tăng mạnh",
        WEAK_UPTREND: "Tăng yếu",
        WEAK_DOWNTREND: "Giảm yếu",
        STRONG_DOWNTREND: "Giảm mạnh",
        NONE: "-",
      };
      return trendLabels[val || "NONE"] || val || "-";
    },
  },
  netMargin: {
    key: "netMargin",
    label: "Biên lợi nhuận ròng (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  grossMargin: {
    key: "grossMargin",
    label: "Biên lợi nhuận gộp (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  ema20Ema50: {
    key: "ema20Ema50",
    label: "EMA20 vs EMA50 (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  ema50Ema200: {
    key: "ema50Ema200",
    label: "EMA50 vs EMA200 (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  // Multi-period filters - ADTV
  adtv30Days: {
    key: "adtv30Days",
    label: "GTGD TB 30 ngày (tỷ)",
    align: "right",
    render: (val: number | undefined) => val ? (val / 1_000_000_000).toFixed(2) : "-",
  },
  adtv20Days: {
    key: "adtv20Days",
    label: "GTGD TB 20 ngày (tỷ)",
    align: "right",
    render: (val: number | undefined) => val ? (val / 1_000_000_000).toFixed(2) : "-",
  },
  adtv10Days: {
    key: "adtv10Days",
    label: "GTGD TB 10 ngày (tỷ)",
    align: "right",
    render: (val: number | undefined) => val ? (val / 1_000_000_000).toFixed(2) : "-",
  },
  // Avg Volume
  avgVolume30Days: {
    key: "avgVolume30Days",
    label: "KLGD TB 30 ngày",
    align: "right",
    render: (val: number | undefined) => val?.toLocaleString() || "-",
  },
  avgVolume20Days: {
    key: "avgVolume20Days",
    label: "KLGD TB 20 ngày",
    align: "right",
    render: (val: number | undefined) => val?.toLocaleString() || "-",
  },
  avgVolume10Days: {
    key: "avgVolume10Days",
    label: "KLGD TB 10 ngày",
    align: "right",
    render: (val: number | undefined) => val?.toLocaleString() || "-",
  },
  // ES Volume vs Avg Volume
  esVolumeVsAvgVolume30Days: {
    key: "esVolumeVsAvgVolume30Days",
    label: "KLGD ước tính vs TB 30 ngày (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  esVolumeVsAvgVolume20Days: {
    key: "esVolumeVsAvgVolume20Days",
    label: "KLGD ước tính vs TB 20 ngày (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  esVolumeVsAvgVolume10Days: {
    key: "esVolumeVsAvgVolume10Days",
    label: "KLGD ước tính vs TB 10 ngày (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  // RS
  rs1Month: {
    key: "rs1Month",
    label: "RS 1 tháng",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(0) : "-",
  },
  rs3Month: {
    key: "rs3Month",
    label: "RS 3 tháng",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(0) : "-",
  },
  rs6Month: {
    key: "rs6Month",
    label: "RS 6 tháng",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(0) : "-",
  },
  rs12Month: {
    key: "rs12Month",
    label: "RS 12 tháng",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(0) : "-",
  },
  // Price EMA
  priceEmaema20: {
    key: "priceEma20",
    label: "Giá vs EMA20 (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  priceEmaema50: {
    key: "priceEma50",
    label: "Giá vs EMA50 (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  priceEmaema100: {
    key: "priceEma100",
    label: "Giá vs EMA100 (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  priceEmaema200: {
    key: "priceEma200",
    label: "Giá vs EMA200 (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  // Price Return
  priceReturn1Month: {
    key: "priceReturn1Month",
    label: "Lợi nhuận 1 tháng (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? (
      <span className={val >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
        {val.toFixed(2)}%
      </span>
    ) : "-",
  },
  priceReturn3Month: {
    key: "priceReturn3Month",
    label: "Lợi nhuận 3 tháng (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? (
      <span className={val >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
        {val.toFixed(2)}%
      </span>
    ) : "-",
  },
  priceReturn6Month: {
    key: "priceReturn6Month",
    label: "Lợi nhuận 6 tháng (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? (
      <span className={val >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
        {val.toFixed(2)}%
      </span>
    ) : "-",
  },
  priceReturn12Month: {
    key: "priceReturn12Month",
    label: "Lợi nhuận 12 tháng (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? (
      <span className={val >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
        {val.toFixed(2)}%
      </span>
    ) : "-",
  },
  priceReturnYtd: {
    key: "priceReturnYtd",
    label: "Lợi nhuận YTD (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? (
      <span className={val >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
        {val.toFixed(2)}%
      </span>
    ) : "-",
  },
  // Outperforms Index
  outperformsIndex1Month: {
    key: "outperformsIndex1Month",
    label: "VS VNIndex 1 tháng (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? (
      <span className={val >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
        {val.toFixed(2)}%
      </span>
    ) : "-",
  },
  outperformsIndex3Month: {
    key: "outperformsIndex3Month",
    label: "VS VNIndex 3 tháng (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? (
      <span className={val >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
        {val.toFixed(2)}%
      </span>
    ) : "-",
  },
  outperformsIndex6Month: {
    key: "outperformsIndex6Month",
    label: "VS VNIndex 6 tháng (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? (
      <span className={val >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
        {val.toFixed(2)}%
      </span>
    ) : "-",
  },
  outperformsIndex12Month: {
    key: "outperformsIndex12Month",
    label: "VS VNIndex 12 tháng (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? (
      <span className={val >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
        {val.toFixed(2)}%
      </span>
    ) : "-",
  },
  outperformsIndexYtd: {
    key: "outperformsIndexYtd",
    label: "VS VNIndex YTD (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? (
      <span className={val >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
        {val.toFixed(2)}%
      </span>
    ) : "-",
  },
  // Price Fluctuation
  priceFluctuation10Days: {
    key: "priceFluctuation10Days",
    label: "Biến động giá 10 ngày (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  priceFluctuation20Days: {
    key: "priceFluctuation20Days",
    label: "Biến động giá 20 ngày (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  priceFluctuation30Days: {
    key: "priceFluctuation30Days",
    label: "Biến động giá 30 ngày (%)",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  // AO
  ao: {
    key: "ao",
    label: "AO",
    align: "right",
    render: (val: number | undefined) => val !== undefined ? val.toFixed(2) : "-",
  },
  aoTrend: {
    key: "aoTrend",
    label: "AO Trend",
    align: "left",
    render: (val: string | undefined) => {
      const labels: Record<string, string> = {
        ABOVE_ZERO: "Trên 0",
        CROSS_ABOVE_ZERO: "Cắt trên 0",
        CROSS_BELOW_ZERO: "Cắt dưới 0",
        BELOW_ZERO: "Dưới 0",
      };
      return labels[val || ""] || val || "-";
    },
  },
  // Ichimoku
  ichimoku: {
    key: "ichimoku",
    label: "Ichimoku",
    align: "left",
    render: (val: string | undefined) => {
      const labels: Record<string, string> = {
        PRICE_ABOVE_CLOUD: "Giá trên mây",
        PRICE_CROSSING_ABOVE_CLOUD: "Giá cắt trên mây",
        PRICE_CROSSING_BELOW_CLOUD: "Giá cắt dưới mây",
        PRICE_BELOW_CLOUD: "Giá dưới mây",
      };
      return labels[val || ""] || val || "-";
    },
  },
};

export default function ScreeningPage() {
  const [body, setBody] = useState<ScreeningFiltersValue>(() => buildDefaultFilters());
  const { data, isLoading, isError } = useScreening(body);

  // Calculate dynamic columns based on enabled filters
  const dynamicColumns = useMemo(() => {
    const baseColumns = ["marketPrice", "dailyPriceChangePercent", "stockStrength"];
    const filterColumns = body.visibleColumns || [];
    return [...baseColumns, ...filterColumns].filter((col, idx, arr) => arr.indexOf(col) === idx);
  }, [body.visibleColumns]);

  // State cho filter ngành
  const [selectedExchange, setSelectedExchange] = useState<string>("all");
  const [selectedIndustryLevel, setSelectedIndustryLevel] = useState<"all" | "1" | "2" | "3" | "4">("all");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  // Lấy danh sách ngành theo cấp
  const getIndustriesByLevel = (level: number) => {
    return icb_codes.filter((code) => code.icbLevel === level);
  };

  // Xử lý thay đổi cấp ngành
  const handleIndustryLevelChange = (level: "all" | "1" | "2" | "3" | "4") => {
    setSelectedIndustryLevel(level);
    setSelectedIndustries([]);

    // Cập nhật filter body
    updateFilterBody(selectedExchange, level, []);
  };

  // Xử lý thay đổi sàn
  const handleExchangeChange = (exchange: string) => {
    setSelectedExchange(exchange);
    updateFilterBody(exchange, selectedIndustryLevel, selectedIndustries);
  };

  // Xử lý thay đổi ngành
  const handleIndustryChange = (industries: string[]) => {
    setSelectedIndustries(industries);
    updateFilterBody(selectedExchange, selectedIndustryLevel, industries);
  };

  // Cập nhật filter body
  const updateFilterBody = (
    exchange: string,
    industryLevel: "all" | "1" | "2" | "3" | "4",
    industries: string[]
  ) => {
    setBody((prev) => {
      const newFilters = prev.filter.filter(
        (f) => !["exchange", "sectorLv1", "sector", "sectorLv3", "sectorLv4"].includes(f.name)
      );

      // Thêm filter exchange
      if (exchange !== "all") {
        newFilters.push({
          name: "exchange",
          conditionOptions: [{ type: "value", value: exchange }],
        });
      } else {
        newFilters.push({
          name: "exchange",
          conditionOptions: [
            { type: "value", value: "hsx" },
            { type: "value", value: "hnx" },
            { type: "value", value: "upcom" },
          ],
        });
      }

      // Thêm filter ngành nếu có chọn
      if (industryLevel !== "all" && industries.length > 0) {
        const filterName =
          industryLevel === "1" ? "sectorLv1" :
          industryLevel === "2" ? "sector" :
          industryLevel === "3" ? "sectorLv3" :
          "sectorLv4";

        newFilters.push({
          name: filterName,
          conditionOptions: industries.map((value) => ({ type: "value", value })),
        });
      }

      return { ...prev, filter: newFilters };
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Bộ lọc cổ phiếu</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sàn</span>
              <Select value={selectedExchange} onValueChange={handleExchangeChange}>
                <SelectTrigger className="w-32 h-8 text-sm bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="hsx">HSX</SelectItem>
                  <SelectItem value="hnx">HNX</SelectItem>
                  <SelectItem value="upcom">UPCOM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Cấp ngành</span>
              <Select value={selectedIndustryLevel} onValueChange={handleIndustryLevelChange}>
                <SelectTrigger className="w-32 h-8 text-sm bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="1">Cấp 1</SelectItem>
                  <SelectItem value="2">Cấp 2</SelectItem>
                  <SelectItem value="3">Cấp 3</SelectItem>
                  <SelectItem value="4">Cấp 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedIndustryLevel !== "all" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ngành</span>
                <Select
                  value={selectedIndustries[0] || "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      handleIndustryChange([]);
                    } else {
                      handleIndustryChange([value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-48 h-8 text-sm bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    <SelectValue placeholder="Chọn ngành" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {getIndustriesByLevel(parseInt(selectedIndustryLevel)).map((industry) => (
                      <SelectItem key={industry.name} value={industry.name}>
                        {industry.viSector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-4 bg-muted/40 border-b border-border overflow-x-auto max-h-[280px]">
        <ScreeningFilters initial={body} onApply={setBody} />
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading && <div className="flex items-center justify-center h-32 text-muted-foreground">Đang tải...</div>}
        {isError && <div className="flex items-center justify-center h-32 text-destructive">Không thể tải dữ liệu</div>}
        {!isLoading && data && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-3 bg-muted/40 border-b border-border">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Mã: {data.content.length} kết quả | Hiển thị: {dynamicColumns.length + 3} cột
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-medium text-foreground sticky left-0 bg-muted/40 z-10">Mã</TableHead>
                    <TableHead className="font-medium text-foreground">Sàn</TableHead>
                    <TableHead className="font-medium text-foreground">Ngành</TableHead>
                    {dynamicColumns.map((colKey) => {
                      const config = COLUMN_CONFIGS[colKey];
                      if (!config) return null;
                      return (
                        <TableHead
                          key={colKey}
                          className={`font-medium text-foreground ${config.align === "right" ? "text-right" : config.align === "center" ? "text-center" : ""}`}
                        >
                          {config.label}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.map((row: any) => (
                    <TableRow key={row.ticker} className="hover:bg-muted/40">
                      <TableCell className="font-medium text-blue-600 dark:text-blue-400 sticky left-0 bg-card z-10">
                        {row.ticker}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 uppercase">
                          {row.exchange}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {row.viSector || row.industryName || "Không xác định"}
                      </TableCell>
                      {dynamicColumns.map((colKey) => {
                        const config = COLUMN_CONFIGS[colKey];
                        if (!config) return null;
                        return (
                          <TableCell
                            key={colKey}
                            className={config.align === "right" ? "text-right" : config.align === "center" ? "text-center" : ""}
                          >
                            {config.render(row[colKey])}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


