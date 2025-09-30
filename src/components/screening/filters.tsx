import { useEffect, useMemo, useState } from "react";
import type { screening } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ScreeningFiltersValue = screening.ScreeningRequest & {
  visibleColumns?: string[];
};

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
    ],
    visibleColumns: [],
  };
}

type RangeId = string;
type DiscreteId = string;

type MultiPeriodConfig = {
  id: string;
  name: string;
  label: string;
  defaultFrom: number;
  defaultTo: number;
  periods: Array<{ value: string; label: string; extraName: string }>;
};

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
  group: string;
};

export default function ScreeningFilters(props: {
  initial?: ScreeningFiltersValue;
  onApply: (value: ScreeningFiltersValue) => void;
}) {
  const [pageSize] = useState<number>(props.initial?.pageSize ?? 20);

  // Multi-period filters configuration
  const multiPeriodConfigs: MultiPeriodConfig[] = useMemo(() => [
    {
      id: "adtv",
      name: "adtv",
      label: "GTGD trung bình (tỷ VND)",
      defaultFrom: 0,
      defaultTo: 2000000000000,
      periods: [
        { value: "30", label: "30", extraName: "30Days" },
        { value: "20", label: "20", extraName: "20Days" },
        { value: "10", label: "10", extraName: "10Days" },
      ],
    },
    {
      id: "avgVolume",
      name: "avgVolume",
      label: "KLGD trung bình (cổ phiếu)",
      defaultFrom: 0,
      defaultTo: 200000000,
      periods: [
        { value: "30", label: "30", extraName: "30Days" },
        { value: "20", label: "20", extraName: "20Days" },
        { value: "10", label: "10", extraName: "10Days" },
      ],
    },
    {
      id: "esVolumeVsAvgVolume",
      name: "esVolumeVsAvgVolume",
      label: "KLGD ước tính vs KLGD trung bình (%)",
      defaultFrom: -900,
      defaultTo: 900,
      periods: [
        { value: "30", label: "30", extraName: "30Days" },
        { value: "20", label: "20", extraName: "20Days" },
        { value: "10", label: "10", extraName: "10Days" },
      ],
    },
    {
      id: "rs",
      name: "rs",
      label: "RS",
      defaultFrom: 0,
      defaultTo: 100,
      periods: [
        { value: "1M", label: "1M", extraName: "1Month" },
        { value: "3M", label: "3M", extraName: "3Month" },
        { value: "6M", label: "6M", extraName: "6Month" },
        { value: "12M", label: "12M", extraName: "12Month" },
      ],
    },
    {
      id: "priceEma",
      name: "priceEma",
      label: "Giá vs EMA (%)",
      defaultFrom: -50,
      defaultTo: 50,
      periods: [
        { value: "ema20", label: "ema20", extraName: "ema20" },
        { value: "ema50", label: "ema50", extraName: "ema50" },
        { value: "ema100", label: "ema100", extraName: "ema100" },
        { value: "ema200", label: "ema200", extraName: "ema200" },
      ],
    },
    {
      id: "priceReturn",
      name: "priceReturn",
      label: "Tỷ suất lợi nhuận (%)",
      defaultFrom: -100,
      defaultTo: 100,
      periods: [
        { value: "1M", label: "1M", extraName: "1Month" },
        { value: "3M", label: "3M", extraName: "3Month" },
        { value: "6M", label: "6M", extraName: "6Month" },
        { value: "12M", label: "12M", extraName: "12Month" },
        { value: "YTD", label: "YTD", extraName: "Ytd" },
      ],
    },
    {
      id: "outperformsIndex",
      name: "outperformsIndex",
      label: "Tỷ suất lợi nhuận vs VNindex (%)",
      defaultFrom: -100,
      defaultTo: 100,
      periods: [
        { value: "1M", label: "1M", extraName: "1Month" },
        { value: "3M", label: "3M", extraName: "3Month" },
        { value: "6M", label: "6M", extraName: "6Month" },
        { value: "12M", label: "12M", extraName: "12Month" },
        { value: "YTD", label: "YTD", extraName: "Ytd" },
      ],
    },
    {
      id: "priceFluctuation",
      name: "priceFluctuation",
      label: "Biến động giá (%)",
      defaultFrom: -100,
      defaultTo: 100,
      periods: [
        { value: "10", label: "10", extraName: "10Days" },
        { value: "20", label: "20", extraName: "20Days" },
        { value: "30", label: "30", extraName: "30Days" },
      ],
    },
  ], []);

  const rangeConfigs: RangeConfig[] = useMemo(() => [
    // Thông tin chung
    { id: "marketCap", name: "marketCap", label: "Vốn hóa (tỷ VND)", defaultFrom: 0, defaultTo: 1000000000000000 },
    { id: "marketPrice", name: "marketPrice", label: "Giá (VND)", defaultFrom: 0, defaultTo: 800000 },
    { id: "dailyPriceChangePercent", name: "dailyPriceChangePercent", label: "Thay đổi giá (%)", defaultFrom: -15, defaultTo: 15 },

    // Tín hiệu kỹ thuật
    { id: "stockStrength", name: "stockStrength", label: "Sức mạnh giá", defaultFrom: 0, defaultTo: 100 },
    { id: "rsi", name: "rsi", label: "RSI", defaultFrom: 0, defaultTo: 100 },
    { id: "ema20Ema50", name: "ema20Ema50", label: "EMA20 vs EMA50 (%)", defaultFrom: -50, defaultTo: 50 },
    { id: "ema50Ema200", name: "ema50Ema200", label: "EMA50 vs EMA200 (%)", defaultFrom: -50, defaultTo: 50 },
    { id: "macd", name: "macd", label: "MACD", defaultFrom: -200000, defaultTo: 200000 },
    { id: "histogram", name: "histogram", label: "MACD Histogram", defaultFrom: -5000, defaultTo: 5000 },
    { id: "adx", name: "adx", label: "ADX", defaultFrom: 0, defaultTo: 100 },

    // Chỉ số tài chính
    { id: "ttmPe", name: "ttmPe", label: "P/E (x)", defaultFrom: 0, defaultTo: 100 },
    { id: "ttmPb", name: "ttmPb", label: "P/B (x)", defaultFrom: 0, defaultTo: 100 },
    { id: "ttmRoe", name: "ttmRoe", label: "ROE (%)", defaultFrom: -50, defaultTo: 50 },
    { id: "netMargin", name: "netMargin", label: "Biên lợi nhuận ròng (%)", defaultFrom: -100, defaultTo: 100 },
    { id: "grossMargin", name: "grossMargin", label: "Biên lợi nhuận gộp (%)", defaultFrom: -100, defaultTo: 100 },
  ], []);

  const discreteConfigs: DiscreteConfig[] = useMemo(() => [
    // Xu hướng CP
    { id: "trendStrongUp", name: "stockTrend", label: "Đà tăng mạnh", value: "STRONG_UPTREND", group: "stockTrend" },
    { id: "trendWeakUp", name: "stockTrend", label: "Đà tăng yếu", value: "WEAK_UPTREND", group: "stockTrend" },
    { id: "trendWeakDown", name: "stockTrend", label: "Đà giảm yếu", value: "WEAK_DOWNTREND", group: "stockTrend" },
    { id: "trendStrongDown", name: "stockTrend", label: "Đà giảm mạnh", value: "STRONG_DOWNTREND", group: "stockTrend" },
    // AO trend
    { id: "aoAbove", name: "aoTrend", label: "Trên 0", value: "ABOVE_ZERO", group: "aoTrend" },
    { id: "aoCrossAbove", name: "aoTrend", label: "Cắt trên 0", value: "CROSS_ABOVE_ZERO", group: "aoTrend" },
    { id: "aoCrossBelow", name: "aoTrend", label: "Cắt dưới 0", value: "CROSS_BELOW_ZERO", group: "aoTrend" },
    { id: "aoBelow", name: "aoTrend", label: "Dưới 0", value: "BELOW_ZERO", group: "aoTrend" },
    // Ichimoku
    { id: "ichAbove", name: "ichimoku", label: "Giá trên mây", value: "PRICE_ABOVE_CLOUD", group: "ichimoku" },
    { id: "ichCrossAbove", name: "ichimoku", label: "Giá cắt trên mây", value: "PRICE_CROSSING_ABOVE_CLOUD", group: "ichimoku" },
    { id: "ichCrossBelow", name: "ichimoku", label: "Giá cắt dưới mây", value: "PRICE_CROSSING_BELOW_CLOUD", group: "ichimoku" },
    { id: "ichBelow", name: "ichimoku", label: "Giá dưới mây", value: "PRICE_BELOW_CLOUD", group: "ichimoku" },
  ], []);

  const [enabledRanges, setEnabledRanges] = useState<Record<RangeId, boolean>>({});
  const [rangeValues, setRangeValues] = useState<Record<RangeId, { from: number; to: number }>>(() => {
    const obj: Record<string, { from: number; to: number }> = {};
    for (const c of rangeConfigs) obj[c.id] = { from: c.defaultFrom, to: c.defaultTo };
    return obj;
  });

  // State for multi-period filters
  const [enabledMultiPeriod, setEnabledMultiPeriod] = useState<Record<string, boolean>>({});
  const [multiPeriodValues, setMultiPeriodValues] = useState<Record<string, { from: number; to: number; period: string }>>(() => {
    const obj: Record<string, { from: number; to: number; period: string }> = {};
    for (const c of multiPeriodConfigs) {
      obj[c.id] = { from: c.defaultFrom, to: c.defaultTo, period: c.periods[0].value };
    }
    return obj;
  });

  const [enabledDiscrete, setEnabledDiscrete] = useState<Record<string, boolean>>({});

  function buildBody(): ScreeningFiltersValue {
    const filters: screening.FilterItem[] = [];
    const visibleColumns: string[] = [];

    // Exchanges are always included
    filters.push({
      name: "exchange",
      conditionOptions: [
        { type: "value", value: "hsx" },
        { type: "value", value: "hnx" },
        { type: "value", value: "upcom" },
      ],
    });

    // Simple range filters
    for (const cfg of rangeConfigs) {
      if (!enabledRanges[cfg.id]) continue;
      const { from, to } = rangeValues[cfg.id] ?? { from: cfg.defaultFrom, to: cfg.defaultTo };
      filters.push({
        name: cfg.name,
        extraName: cfg.extraName,
        conditionOptions: [{ from, to }],
      });
      visibleColumns.push(cfg.name);
    }

    // Multi-period filters
    for (const cfg of multiPeriodConfigs) {
      if (!enabledMultiPeriod[cfg.id]) continue;
      const state = multiPeriodValues[cfg.id];
      const periodConfig = cfg.periods.find(p => p.value === state.period);
      if (!periodConfig) continue;

      filters.push({
        name: cfg.name,
        extraName: periodConfig.extraName,
        conditionOptions: [{ from: state.from, to: state.to }],
      });
      // Build actual field name for API response (e.g., adtv30Days, priceEma20)
      const fieldName = cfg.name + periodConfig.extraName;
      visibleColumns.push(fieldName);
    }

    // Discrete filters - group by name
    const grouped: Record<string, screening.ConditionOption[]> = {};
    for (const dc of discreteConfigs) {
      if (!enabledDiscrete[dc.id]) continue;
      if (!grouped[dc.name]) grouped[dc.name] = [];
      grouped[dc.name].push({ type: "value", value: dc.value });
    }
    for (const name of Object.keys(grouped)) {
      filters.push({ name, conditionOptions: grouped[name] });
      visibleColumns.push(name);
    }

    const body: ScreeningFiltersValue = {
      page: 0,
      pageSize,
      sortFields: [],
      sortOrders: [],
      filter: filters,
      visibleColumns: [...new Set(visibleColumns)],
    };
    return body;
  }

  // Calculate total enabled filters
  const totalEnabled = Object.values(enabledRanges).filter(Boolean).length
    + Object.values(enabledMultiPeriod).filter(Boolean).length
    + Object.values(enabledDiscrete).filter(Boolean).length;

  // Auto apply with debounce when state changes
  useEffect(() => {
    const handle = setTimeout(() => {
      props.onApply(buildBody());
    }, 400);
    return () => clearTimeout(handle);
  }, [pageSize, enabledRanges, rangeValues, enabledMultiPeriod, multiPeriodValues, enabledDiscrete]);

  return (
    <div className="space-y-4">
      {/* Filter count */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Chọn tối đa</span>
        <span className="text-green-600 dark:text-green-500 font-medium">{totalEnabled}/20</span>
        <span>chỉ số</span>
      </div>

      {/* Filter Layout */}
      <Tabs defaultValue="general" className="w-full">
        <div className="flex gap-6">
          {/* Left: Tab Buttons */}
          <div className="flex-shrink-0 w-48">
            <TabsList className="flex flex-col h-auto p-0 bg-transparent gap-1">
              <TabsTrigger
                value="general"
                className="justify-start px-3 py-2 text-sm data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-l-2 data-[state=active]:border-green-500 dark:data-[state=active]:bg-green-950/50 dark:data-[state=active]:text-green-400 dark:data-[state=active]:border-green-600 rounded-none border-l-2 border-transparent w-full"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 dark:bg-green-900/50 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-500 rounded"></div>
                  </div>
                  Thông tin chung
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="technical"
                className="justify-start px-3 py-2 text-sm data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-l-2 data-[state=active]:border-blue-500 dark:data-[state=active]:bg-blue-950/50 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-600 rounded-none border-l-2 border-transparent w-full"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-500 rounded"></div>
                  </div>
                  Tín hiệu kỹ thuật
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="financial"
                className="justify-start px-3 py-2 text-sm data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-l-2 data-[state=active]:border-orange-500 dark:data-[state=active]:bg-orange-950/50 dark:data-[state=active]:text-orange-400 dark:data-[state=active]:border-orange-600 rounded-none border-l-2 border-transparent w-full"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/50 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 dark:bg-orange-500 rounded"></div>
                  </div>
                  Chỉ số tài chính
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Right: Filter Controls with Scrolling */}
          <div className="flex-1 max-h-[600px] overflow-y-auto pr-2">
            <TabsContent value="general" className="mt-0 space-y-2">
              {/* Simple ranges */}
              {rangeConfigs
                .filter(r => ["marketCap", "marketPrice", "dailyPriceChangePercent"].includes(r.id))
                .map(cfg => (
                  <FilterRangeRow
                    key={cfg.id}
                    cfg={cfg}
                    current={rangeValues[cfg.id] ?? { from: cfg.defaultFrom, to: cfg.defaultTo }}
                    enabled={Boolean(enabledRanges[cfg.id])}
                    onToggle={(checked) => setEnabledRanges(s => ({ ...s, [cfg.id]: checked }))}
                    onChange={(from, to) => setRangeValues(s => ({ ...s, [cfg.id]: { from, to } }))}
                  />
                ))}

              {/* Multi-period filters */}
              {multiPeriodConfigs
                .filter(c => ["adtv", "avgVolume", "esVolumeVsAvgVolume"].includes(c.id))
                .map(cfg => (
                  <FilterMultiPeriodRow
                    key={cfg.id}
                    cfg={cfg}
                    current={multiPeriodValues[cfg.id]}
                    enabled={Boolean(enabledMultiPeriod[cfg.id])}
                    onToggle={(checked) => setEnabledMultiPeriod(s => ({ ...s, [cfg.id]: checked }))}
                    onChange={(from, to, period) => setMultiPeriodValues(s => ({ ...s, [cfg.id]: { from, to, period } }))}
                  />
                ))}
            </TabsContent>

            <TabsContent value="technical" className="mt-0 space-y-2">
              {/* Simple ranges */}
              {rangeConfigs
                .filter(r => ["stockStrength", "rsi", "ema20Ema50", "ema50Ema200", "macd", "histogram", "adx"].includes(r.id))
                .map(cfg => (
                  <FilterRangeRow
                    key={cfg.id}
                    cfg={cfg}
                    current={rangeValues[cfg.id] ?? { from: cfg.defaultFrom, to: cfg.defaultTo }}
                    enabled={Boolean(enabledRanges[cfg.id])}
                    onToggle={(checked) => setEnabledRanges(s => ({ ...s, [cfg.id]: checked }))}
                    onChange={(from, to) => setRangeValues(s => ({ ...s, [cfg.id]: { from, to } }))}
                  />
                ))}

              {/* Multi-period filters */}
              {multiPeriodConfigs
                .filter(c => ["rs", "priceEma", "priceReturn", "outperformsIndex", "priceFluctuation"].includes(c.id))
                .map(cfg => (
                  <FilterMultiPeriodRow
                    key={cfg.id}
                    cfg={cfg}
                    current={multiPeriodValues[cfg.id]}
                    enabled={Boolean(enabledMultiPeriod[cfg.id])}
                    onToggle={(checked) => setEnabledMultiPeriod(s => ({ ...s, [cfg.id]: checked }))}
                    onChange={(from, to, period) => setMultiPeriodValues(s => ({ ...s, [cfg.id]: { from, to, period } }))}
                  />
                ))}

              {/* Discrete filters */}
              <div className="space-y-2 mt-4">
                <FilterDiscreteGroupRow
                  label="Xu Hướng CP"
                  configs={discreteConfigs.filter(d => d.group === "stockTrend")}
                  enabledState={enabledDiscrete}
                  onToggle={(id, checked) => setEnabledDiscrete(s => ({ ...s, [id]: checked }))}
                />
                <FilterDiscreteGroupRow
                  label="AO"
                  configs={discreteConfigs.filter(d => d.group === "aoTrend")}
                  enabledState={enabledDiscrete}
                  onToggle={(id, checked) => setEnabledDiscrete(s => ({ ...s, [id]: checked }))}
                />
                <FilterDiscreteGroupRow
                  label="Ichimoku"
                  configs={discreteConfigs.filter(d => d.group === "ichimoku")}
                  enabledState={enabledDiscrete}
                  onToggle={(id, checked) => setEnabledDiscrete(s => ({ ...s, [id]: checked }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="financial" className="mt-0 space-y-2">
              {rangeConfigs
                .filter(r => ["ttmPe", "ttmPb", "ttmRoe", "netMargin", "grossMargin"].includes(r.id))
                .map(cfg => (
                  <FilterRangeRow
                    key={cfg.id}
                    cfg={cfg}
                    current={rangeValues[cfg.id] ?? { from: cfg.defaultFrom, to: cfg.defaultTo }}
                    enabled={Boolean(enabledRanges[cfg.id])}
                    onToggle={(checked) => setEnabledRanges(s => ({ ...s, [cfg.id]: checked }))}
                    onChange={(from, to) => setRangeValues(s => ({ ...s, [cfg.id]: { from, to } }))}
                  />
                ))}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

// Simple range filter row
function FilterRangeRow({ cfg, current, enabled, onToggle, onChange }: {
  cfg: RangeConfig;
  current: { from: number; to: number };
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  onChange: (from: number, to: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 border border-border rounded-lg p-3 bg-card dark:bg-card/50">
      <Checkbox
        checked={enabled}
        onCheckedChange={(v) => onToggle(Boolean(v))}
        className="flex-shrink-0"
      />
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm font-medium text-foreground w-48 flex-shrink-0">{cfg.label}</span>
        <Input
          type="number"
          value={current.from}
          onChange={(e) => onChange(Number(e.target.value || 0), current.to)}
          className="w-24 h-8 text-xs"
          disabled={!enabled}
        />
        <Slider
          min={cfg.defaultFrom}
          max={cfg.defaultTo}
          value={[current.from, current.to]}
          onValueChange={(vals) => {
            const [from, to] = vals;
            onChange(from, to);
          }}
          className="flex-1"
          disabled={!enabled}
        />
        <Input
          type="number"
          value={current.to}
          onChange={(e) => onChange(current.from, Number(e.target.value || 0))}
          className="w-24 h-8 text-xs"
          disabled={!enabled}
        />
      </div>
    </div>
  );
}

// Multi-period filter row with dropdown
function FilterMultiPeriodRow({ cfg, current, enabled, onToggle, onChange }: {
  cfg: MultiPeriodConfig;
  current: { from: number; to: number; period: string };
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  onChange: (from: number, to: number, period: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 border border-border rounded-lg p-3 bg-card dark:bg-card/50">
      <Checkbox
        checked={enabled}
        onCheckedChange={(v) => onToggle(Boolean(v))}
        className="flex-shrink-0"
      />
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm font-medium text-foreground w-48 flex-shrink-0">{cfg.label}</span>

        <Select
          value={current.period}
          onValueChange={(period) => onChange(current.from, current.to, period)}
          disabled={!enabled}
        >
          <SelectTrigger className="w-24 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cfg.periods.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          value={current.from}
          onChange={(e) => onChange(Number(e.target.value || 0), current.to, current.period)}
          className="w-24 h-8 text-xs"
          disabled={!enabled}
        />
        <Slider
          min={cfg.defaultFrom}
          max={cfg.defaultTo}
          value={[current.from, current.to]}
          onValueChange={(vals) => {
            const [from, to] = vals;
            onChange(from, to, current.period);
          }}
          className="flex-1"
          disabled={!enabled}
        />
        <Input
          type="number"
          value={current.to}
          onChange={(e) => onChange(current.from, Number(e.target.value || 0), current.period)}
          className="w-24 h-8 text-xs"
          disabled={!enabled}
        />

        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!enabled}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!enabled}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Discrete value filter group
function FilterDiscreteGroupRow({ label, configs, enabledState, onToggle }: {
  label: string;
  configs: DiscreteConfig[];
  enabledState: Record<string, boolean>;
  onToggle: (id: string, checked: boolean) => void;
}) {
  return (
    <div className="border border-border rounded-lg p-3 bg-card dark:bg-card/50">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground w-48 flex-shrink-0">{label}</span>
        <div className="flex flex-wrap gap-2">
          {configs.map(cfg => (
            <label key={cfg.id} className="flex items-center gap-2 px-3 py-1 border border-border rounded cursor-pointer hover:bg-accent dark:hover:bg-accent/50">
              <Checkbox
                checked={Boolean(enabledState[cfg.id])}
                onCheckedChange={(v) => onToggle(cfg.id, Boolean(v))}
              />
              <span className="text-xs text-foreground">{cfg.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

