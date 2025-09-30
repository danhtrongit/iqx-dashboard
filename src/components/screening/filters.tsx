import { useEffect, useMemo, useState } from "react";
import type { screening } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ScreeningFiltersValue = screening.ScreeningRequest;

export function buildDefaultFilters(): ScreeningFiltersValue {
  return {
    page: 0,
    pageSize: 20,
    sortFields: [],
    sortOrders: [],
    filter: [
      { name: "exchange", conditionOptions: [
        { type: "value", value: "hsx" },
        { type: "value", value: "hnx" },
        { type: "value", value: "upcom" },
      ]},
      { name: "marketCap", conditionOptions: [{ from: 0, to: 1_000_000_000_000_000 }]},
      { name: "rsi", conditionOptions: [{ from: 0, to: 100 }]},
      { name: "ttmPb", conditionOptions: [{ from: 0, to: 100 }]},
      { name: "ttmRoe", conditionOptions: [{ from: -50, to: 50 }]},
    ],
  };
}

export default function ScreeningFilters(props: {
  initial?: ScreeningFiltersValue;
  onApply: (value: ScreeningFiltersValue) => void;
}) {
  const [pageSize] = useState<number>(props.initial?.pageSize ?? 20);

  type RangeId = string;
  type DiscreteId = string;

  type RangeConfig = {
    id: RangeId;
    name: string;
    label: string;
    defaultFrom: number;
    defaultTo: number;
    extraName?: string;
  };

  type DiscreteConfig = {
    id: DiscreteId;
    name: string;
    label: string;
    value: string;
    group: string; // used for UI grouping only
  };

  const rangeConfigs: RangeConfig[] = useMemo(() => [
    // Thông tin chung
    { id: "marketCap", name: "marketCap", label: "Vốn hóa (tỷ VND)", defaultFrom: 0, defaultTo: 1_000_000_000_000_000 },
    { id: "marketPrice", name: "marketPrice", label: "Giá (VND)", defaultFrom: 0, defaultTo: 800_000 },
    { id: "dailyPriceChangePercent", name: "dailyPriceChangePercent", label: "Thay đổi giá (%)", defaultFrom: -15, defaultTo: 15 },
    { id: "adtv30", name: "adtv", extraName: "30Days", label: "GTGD TB (30d)", defaultFrom: 0, defaultTo: 2_000_000_000_000 },
    { id: "adtv20", name: "adtv", extraName: "20Days", label: "GTGD TB (20d)", defaultFrom: 0, defaultTo: 2_000_000_000_000 },
    { id: "adtv10", name: "adtv", extraName: "10Days", label: "GTGD TB (10d)", defaultFrom: 0, defaultTo: 2_000_000_000_000 },
    { id: "avgVolume30", name: "avgVolume", extraName: "30Days", label: "KLGD TB (30d)", defaultFrom: 0, defaultTo: 200_000_000 },
    { id: "avgVolume20", name: "avgVolume", extraName: "20Days", label: "KLGD TB (20d)", defaultFrom: 0, defaultTo: 200_000_000 },
    { id: "avgVolume10", name: "avgVolume", extraName: "10Days", label: "KLGD TB (10d)", defaultFrom: 0, defaultTo: 200_000_000 },
    { id: "esVol30", name: "esVolumeVsAvgVolume", extraName: "30Days", label: "Ước tính vs TB (30d)", defaultFrom: -900, defaultTo: 900 },
    { id: "esVol20", name: "esVolumeVsAvgVolume", extraName: "20Days", label: "Ước tính vs TB (20d)", defaultFrom: -900, defaultTo: 900 },
    { id: "esVol10", name: "esVolumeVsAvgVolume", extraName: "10Days", label: "Ước tính vs TB (10d)", defaultFrom: -900, defaultTo: 900 },

    // Tín hiệu kỹ thuật
    { id: "stockStrength", name: "stockStrength", label: "Sức mạnh giá", defaultFrom: 0, defaultTo: 100 },
    { id: "rs1M", name: "rs", extraName: "1Month", label: "RS 1M", defaultFrom: 0, defaultTo: 100 },
    { id: "rs3M", name: "rs", extraName: "3Month", label: "RS 3M", defaultFrom: 0, defaultTo: 100 },
    { id: "rs6M", name: "rs", extraName: "6Month", label: "RS 6M", defaultFrom: 0, defaultTo: 100 },
    { id: "rs12M", name: "rs", extraName: "12Month", label: "RS 12M", defaultFrom: 0, defaultTo: 100 },
    { id: "rsi", name: "rsi", label: "RSI", defaultFrom: 0, defaultTo: 100 },
    { id: "ema20", name: "priceEma", extraName: "ema20", label: "Giá vs EMA20", defaultFrom: -50, defaultTo: 50 },
    { id: "ema50", name: "priceEma", extraName: "ema50", label: "Giá vs EMA50", defaultFrom: -50, defaultTo: 50 },
    { id: "ema100", name: "priceEma", extraName: "ema100", label: "Giá vs EMA100", defaultFrom: -50, defaultTo: 50 },
    { id: "ema200", name: "priceEma", extraName: "ema200", label: "Giá vs EMA200", defaultFrom: -50, defaultTo: 50 },
    { id: "ema20Ema50", name: "ema20Ema50", label: "EMA20 vs EMA50", defaultFrom: -50, defaultTo: 50 },
    { id: "ema50Ema200", name: "ema50Ema200", label: "EMA50 vs EMA200", defaultFrom: -50, defaultTo: 50 },
    { id: "ret1M", name: "priceReturn", extraName: "1Month", label: "TSLN 1M", defaultFrom: -100, defaultTo: 100 },
    { id: "ret3M", name: "priceReturn", extraName: "3Month", label: "TSLN 3M", defaultFrom: -100, defaultTo: 100 },
    { id: "ret6M", name: "priceReturn", extraName: "6Month", label: "TSLN 6M", defaultFrom: -100, defaultTo: 100 },
    { id: "ret12M", name: "priceReturn", extraName: "12Month", label: "TSLN 12M", defaultFrom: -100, defaultTo: 100 },
    { id: "retYTD", name: "priceReturn", extraName: "Ytd", label: "TSLN YTD", defaultFrom: -100, defaultTo: 100 },
    { id: "out1M", name: "outperformsIndex", extraName: "1Month", label: "Vs VNIndex 1M", defaultFrom: -100, defaultTo: 100 },
    { id: "out3M", name: "outperformsIndex", extraName: "3Month", label: "Vs VNIndex 3M", defaultFrom: -100, defaultTo: 100 },
    { id: "out6M", name: "outperformsIndex", extraName: "6Month", label: "Vs VNIndex 6M", defaultFrom: -100, defaultTo: 100 },
    { id: "out12M", name: "outperformsIndex", extraName: "12Month", label: "Vs VNIndex 12M", defaultFrom: -100, defaultTo: 100 },
    { id: "outYTD", name: "outperformsIndex", extraName: "Ytd", label: "Vs VNIndex YTD", defaultFrom: -100, defaultTo: 100 },
    { id: "fluc10", name: "priceFluctuation", extraName: "10Days", label: "Biến động 10d", defaultFrom: -100, defaultTo: 100 },
    { id: "fluc20", name: "priceFluctuation", extraName: "20Days", label: "Biến động 20d", defaultFrom: -100, defaultTo: 100 },
    { id: "fluc30", name: "priceFluctuation", extraName: "30Days", label: "Biến động 30d", defaultFrom: -100, defaultTo: 100 },
    { id: "macd", name: "macd", label: "MACD", defaultFrom: -200_000, defaultTo: 200_000 },
    { id: "histogram", name: "histogram", label: "MACD Histogram", defaultFrom: -5000, defaultTo: 5000 },
    { id: "adx", name: "adx", label: "ADX", defaultFrom: 0, defaultTo: 100 },

    // Chỉ số tài chính
    { id: "ttmPe", name: "ttmPe", label: "P/E (x)", defaultFrom: 0, defaultTo: 100 },
    { id: "ttmPb", name: "ttmPb", label: "P/B (x)", defaultFrom: 0, defaultTo: 100 },
    { id: "ttmRoe", name: "ttmRoe", label: "ROE (%)", defaultFrom: -50, defaultTo: 50 },
    { id: "netMargin", name: "netMargin", label: "Biên LN ròng (%)", defaultFrom: -100, defaultTo: 100 },
    { id: "grossMargin", name: "grossMargin", label: "Biên LN gộp (%)", defaultFrom: -100, defaultTo: 100 },
  ], []);

  const discreteConfigs: DiscreteConfig[] = useMemo(() => [
    // Xu hướng CP
    { id: "trendStrongUp", name: "stockTrend", label: "Đà tăng mạnh", value: "STRONG_UPTREND", group: "trend" },
    { id: "trendWeakUp", name: "stockTrend", label: "Đà tăng yếu", value: "WEAK_UPTREND", group: "trend" },
    { id: "trendWeakDown", name: "stockTrend", label: "Đà giảm yếu", value: "WEAK_DOWNTREND", group: "trend" },
    { id: "trendStrongDown", name: "stockTrend", label: "Đà giảm mạnh", value: "STRONG_DOWNTREND", group: "trend" },
    // AO trend
    { id: "aoAbove", name: "aoTrend", label: "AO Trên 0", value: "ABOVE_ZERO", group: "ao" },
    { id: "aoCrossAbove", name: "aoTrend", label: "AO Cắt trên 0", value: "CROSS_ABOVE_ZERO", group: "ao" },
    { id: "aoCrossBelow", name: "aoTrend", label: "AO Cắt dưới 0", value: "CROSS_BELOW_ZERO", group: "ao" },
    { id: "aoBelow", name: "aoTrend", label: "AO Dưới 0", value: "BELOW_ZERO", group: "ao" },
    // Ichimoku
    { id: "ichAbove", name: "ichimoku", label: "Giá trên mây", value: "PRICE_ABOVE_CLOUD", group: "ich" },
    { id: "ichCrossAbove", name: "ichimoku", label: "Giá cắt trên mây", value: "PRICE_CROSSING_ABOVE_CLOUD", group: "ich" },
    { id: "ichCrossBelow", name: "ichimoku", label: "Giá cắt dưới mây", value: "PRICE_CROSSING_BELOW_CLOUD", group: "ich" },
    { id: "ichBelow", name: "ichimoku", label: "Giá dưới mây", value: "PRICE_BELOW_CLOUD", group: "ich" },
  ], []);

  const [enabledRanges, setEnabledRanges] = useState<Record<RangeId, boolean>>({});
  const [rangeValues, setRangeValues] = useState<Record<RangeId, { from: number; to: number }>>(() => {
    const obj: Record<string, { from: number; to: number }> = {};
    for (const c of rangeConfigs) obj[c.id] = { from: c.defaultFrom, to: c.defaultTo };
    return obj;
  });
  const [enabledDiscrete] = useState<Record<string, boolean>>({});

  function buildBody(): screening.ScreeningRequest {
    const filters: screening.FilterItem[] = [];

    // Exchanges are always included (as per earlier default)
    filters.push({
      name: "exchange",
      conditionOptions: [
        { type: "value", value: "hsx" },
        { type: "value", value: "hnx" },
        { type: "value", value: "upcom" },
      ],
    });

    // Ranges if enabled
    for (const cfg of rangeConfigs) {
      if (!enabledRanges[cfg.id]) continue;
      const { from, to } = rangeValues[cfg.id] ?? { from: cfg.defaultFrom, to: cfg.defaultTo };
      filters.push({
        name: cfg.name,
        extraName: cfg.extraName,
        conditionOptions: [{ from, to }],
      });
    }

    // Discrete groups: collect by name
    const grouped: Record<string, screening.ConditionOption[]> = {};
    for (const dc of discreteConfigs) {
      if (!enabledDiscrete[dc.id]) continue;
      if (!grouped[dc.name]) grouped[dc.name] = [];
      grouped[dc.name].push({ type: "value", value: dc.value });
    }
    for (const name of Object.keys(grouped)) {
      filters.push({ name, conditionOptions: grouped[name] });
    }

    const body: screening.ScreeningRequest = {
      page: 0,
      pageSize,
      sortFields: [],
      sortOrders: [],
      filter: filters,
    };
    return body;
  }

  // Auto apply with debounce when state changes
  useEffect(() => {
    const handle = setTimeout(() => {
      props.onApply(buildBody());
    }, 400);
    return () => clearTimeout(handle);
  }, [pageSize, enabledRanges, rangeValues, enabledDiscrete]);

  return (
    <div className="space-y-4">
      {/* Page Size Control */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span>Chọn tối đa</span>
        <span className="text-green-600 font-medium">0/20</span>
        <span>chỉ số</span>
      </div>

      {/* Filter Layout: Tabs on left, Controls on right */}
      <Tabs defaultValue="general" className="w-full">
        <div className="flex gap-6">
          {/* Left: Tab Buttons */}
          <div className="flex-shrink-0">
            <TabsList className="flex flex-col h-auto p-0 bg-transparent gap-1">
              <TabsTrigger
                value="general"
                className="justify-start px-3 py-2 text-sm data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-l-2 data-[state=active]:border-green-500 rounded-none border-l-2 border-transparent w-full"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded"></div>
                  </div>
                  Thông tin chung
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="technical"
                className="justify-start px-3 py-2 text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-l-2 data-[state=active]:border-blue-500 rounded-none border-l-2 border-transparent w-full"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded"></div>
                  </div>
                  Tín hiệu kỹ thuật
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="financial"
                className="justify-start px-3 py-2 text-sm data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-l-2 data-[state=active]:border-orange-500 rounded-none border-l-2 border-transparent w-full"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded"></div>
                  </div>
                  Chỉ số tài chính
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Right: Filter Controls */}
          <div className="flex-1">
            <TabsContent value="general" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {rangeConfigs.filter((r) => ["marketCap","marketPrice","dailyPriceChangePercent","adtv30"].includes(r.id)).map((cfg) => {
                  const current = rangeValues[cfg.id] ?? { from: cfg.defaultFrom, to: cfg.defaultTo };
                  return (
                    <CompactRow key={cfg.id} cfg={cfg} current={current} enabled={Boolean(enabledRanges[cfg.id])}
                      onToggle={(checked) => setEnabledRanges((s) => ({ ...s, [cfg.id]: checked }))}
                      onChange={(from, to) => setRangeValues((s) => ({ ...s, [cfg.id]: { ...(s[cfg.id] ?? current), from, to } }))}
                    />
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="technical" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {rangeConfigs.filter((r) => ["stockStrength","rsi","ema20","ret1M"].includes(r.id)).map((cfg) => {
                  const current = rangeValues[cfg.id] ?? { from: cfg.defaultFrom, to: cfg.defaultTo };
                  return (
                    <CompactRow key={cfg.id} cfg={cfg} current={current} enabled={Boolean(enabledRanges[cfg.id])}
                      onToggle={(checked) => setEnabledRanges((s) => ({ ...s, [cfg.id]: checked }))}
                      onChange={(from, to) => setRangeValues((s) => ({ ...s, [cfg.id]: { ...(s[cfg.id] ?? current), from, to } }))}
                    />
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="financial" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {rangeConfigs.filter((r) => ["ttmPe","ttmPb","ttmRoe","netMargin"].includes(r.id)).map((cfg) => {
                  const current = rangeValues[cfg.id] ?? { from: cfg.defaultFrom, to: cfg.defaultTo };
                  return (
                    <CompactRow key={cfg.id} cfg={cfg} current={current} enabled={Boolean(enabledRanges[cfg.id])}
                      onToggle={(checked) => setEnabledRanges((s) => ({ ...s, [cfg.id]: checked }))}
                      onChange={(from, to) => setRangeValues((s) => ({ ...s, [cfg.id]: { ...(s[cfg.id] ?? current), from, to } }))}
                    />
                  );
                })}
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function CompactRow({ cfg, current, enabled, onToggle, onChange }: {
  cfg: { id: string; label: string; defaultFrom: number; defaultTo: number } & { name: string; extraName?: string };
  current: { from: number; to: number };
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  onChange: (from: number, to: number) => void;
}) {
  return (
    <div className="p-3 border rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-2">
        <Checkbox checked={enabled} onCheckedChange={(v) => onToggle(Boolean(v))} />
        <span className="text-sm font-medium text-gray-700">{cfg.label}</span>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={current.from}
          onChange={(e) => onChange(Number(e.target.value || 0), current.to)}
          className="w-16 h-7 text-xs"
          placeholder="0"
        />
        <div className="flex-1">
          <Slider
            min={cfg.defaultFrom}
            max={cfg.defaultTo}
            value={[current.from, current.to]}
            onValueChange={(vals) => {
              const [from, to] = Array.isArray(vals) && vals.length >= 2 ? (vals as number[]) : [cfg.defaultFrom, cfg.defaultTo]
              onChange(from, to)
            }}
            className="flex-1"
          />
        </div>
        <Input
          type="number"
          value={current.to}
          onChange={(e) => onChange(current.from, Number(e.target.value || 0))}
          className="w-20 h-7 text-xs"
          placeholder={cfg.defaultTo.toLocaleString()}
        />
      </div>
    </div>
  );
}


