import { z } from "zod";

export const MarketOHLCItemSchema = z.object({
  symbol: z.string(),
  o: z.array(z.number()),
  h: z.array(z.number()),
  l: z.array(z.number()),
  c: z.array(z.number()),
  v: z.array(z.number()),
  t: z.array(z.coerce.number()),
  accumulatedVolume: z.array(z.number()).optional(),
  accumulatedValue: z.array(z.number()).optional(),
  minBatchTruncTime: z.string().optional(),
});

export const MarketOHLCResponseSchema = z.array(MarketOHLCItemSchema);

export type MarketOHLCItem = z.infer<typeof MarketOHLCItemSchema>;
export type MarketOHLCResponse = z.infer<typeof MarketOHLCResponseSchema>;

// Index Impact Chart schemas
export const IndexImpactItemSchema = z.object({
  symbol: z.string(),
  impact: z.number(),
  exchange: z.string(),
  enOrganName: z.string(),
  enOrganShortName: z.string(),
  organName: z.string(),
  organShortName: z.string(),
  // API returns numeric prices as strings (e.g., "118600.0" or "214400")
  matchPrice: z.union([z.string(), z.number()]).nullable().optional(),
  refPrice: z.union([z.string(), z.number()]).nullable().optional(),
  ceiling: z.union([z.string(), z.number()]).nullable().optional(),
  floor: z.union([z.string(), z.number()]).nullable().optional(),
});

export const IndexImpactResponseSchema = z.object({
  topDown: z.array(IndexImpactItemSchema),
  topUp: z.array(IndexImpactItemSchema),
});

export type IndexImpactItem = z.infer<typeof IndexImpactItemSchema>;
export type IndexImpactResponse = z.infer<typeof IndexImpactResponseSchema>;

// Top Proprietary schemas
export const TopProprietaryItemSchema = z.object({
  ticker: z.string(),
  totalValue: z.number(),
  totalVolume: z.number(),
  enOrganName: z.string(),
  enOrganShortName: z.string(),
  organName: z.string(),
  organShortName: z.string(),
  exchange: z.string(),
  // API returns numeric prices as numbers (scientific or decimal), but be lenient
  refPrice: z.union([z.string(), z.number()]).nullable().optional(),
  ceiling: z.union([z.string(), z.number()]).nullable().optional(),
  floor: z.union([z.string(), z.number()]).nullable().optional(),
  matchPrice: z.union([z.string(), z.number()]).nullable().optional(),
});

export const TopProprietaryResponseSchema = z.object({
  tradingDate: z.string(),
  data: z.object({
    SELL: z.array(TopProprietaryItemSchema),
    BUY: z.array(TopProprietaryItemSchema),
  }),
});

export type TopProprietaryItem = z.infer<typeof TopProprietaryItemSchema>;
export type TopProprietaryResponse = z.infer<typeof TopProprietaryResponseSchema>;

// Foreign Net Value Top schemas
export const ForeignNetTopItemSchema = z.object({
  symbol: z.string(),
  group: z.string(),
  timeFrame: z.string(),
  truncTime: z.union([z.string(), z.number()]),
  foreignBuyValue: z.union([z.string(), z.number()]),
  foreignSellValue: z.union([z.string(), z.number()]),
  net: z.union([z.string(), z.number()]),
  matchPrice: z.union([z.string(), z.number(), z.null()]).nullable().optional(),
  refPrice: z.union([z.string(), z.number(), z.null()]).nullable().optional(),
  ceiling: z.union([z.string(), z.number(), z.null()]).nullable().optional(),
  floor: z.union([z.string(), z.number(), z.null()]).nullable().optional(),
  enOrganName: z.string(),
  enOrganShortName: z.string(),
  organName: z.string(),
  organShortName: z.string(),
  exchange: z.string(),
});

export const ForeignNetTopResponseSchema = z.object({
  group: z.string(),
  netBuy: z.array(ForeignNetTopItemSchema),
  netSell: z.array(ForeignNetTopItemSchema),
  totalNetBuy: z.union([z.string(), z.number()]).optional(),
  totalNetSell: z.union([z.string(), z.number()]).optional(),
});

export type ForeignNetTopItem = z.infer<typeof ForeignNetTopItemSchema>;
export type ForeignNetTopResponse = z.infer<typeof ForeignNetTopResponseSchema>;

// Market Behavior (Google Sheets) schemas
export const MarketBehaviorRawResponseSchema = z.object({
  range: z.string(),
  majorDimension: z.string(),
  values: z.array(z.array(z.string())),
});

export const MarketBehaviorItemSchema = z.object({
  date: z.string(),
  strong_sell: z.number(),
  sell: z.number(),
  buy: z.number(),
  strong_buy: z.number(),
  vnindex: z.number(),
});

export const MarketBehaviorResponseSchema = z.array(MarketBehaviorItemSchema);

export type MarketBehaviorRawResponse = z.infer<typeof MarketBehaviorRawResponseSchema>;
export type MarketBehaviorItem = z.infer<typeof MarketBehaviorItemSchema>;
export type MarketBehaviorResponse = z.infer<typeof MarketBehaviorResponseSchema>;

// Allocated Value schemas
export const AllocatedValueRequestSchema = z.object({
  group: z.enum(["ALL", "HOSE", "HNX", "UPCOM"]),
  timeFrame: z.enum(["ONE_DAY", "ONE_WEEK", "ONE_MONTH", "YTD", "ONE_YEAR"]),
});

// API can return multiple exchange blocks when group=ALL.
// Each block contains arrays with one object: { group: string, <dynamic numeric key>: number|string }
const AllocatedValueNumericObjectSchema = z.object({
  group: z.string(),
}).catchall(z.union([z.number(), z.string()]));

export const AllocatedValueItemSchema = z.object({
  totalIncrease: z.array(AllocatedValueNumericObjectSchema),
  totalNochange: z.array(AllocatedValueNumericObjectSchema),
  totalDecrease: z.array(AllocatedValueNumericObjectSchema),
  totalSymbolIncrease: z.array(AllocatedValueNumericObjectSchema),
  totalSymbolNochange: z.array(AllocatedValueNumericObjectSchema),
  totalSymbolDecrease: z.array(AllocatedValueNumericObjectSchema),
});

export const AllocatedValueResponseSchema = z.array(AllocatedValueItemSchema);

export type AllocatedValueRequest = z.infer<typeof AllocatedValueRequestSchema>;
export type AllocatedValueItem = z.infer<typeof AllocatedValueItemSchema>;
export type AllocatedValueResponse = z.infer<typeof AllocatedValueResponseSchema>;

// Allocated ICB schemas
export const AllocatedICBRequestSchema = z.object({
  group: z.enum(["ALL", "HOSE", "HNX", "UPCOM"]),
  timeFrame: z.enum(["ONE_DAY", "ONE_WEEK", "ONE_MONTH", "YTD", "ONE_YEAR"]),
});

// When group is specific (e.g., HOSE), API returns richer objects including totals/market cap.
export const AllocatedICBItemSchema = z.object({
  icb_code: z.number(),
  icbChangePercent: z.number().nullable().optional(),
  totalPriceChange: z.union([z.number(), z.string()]).nullable().optional(),
  totalMarketCap: z.union([z.number(), z.string()]).nullable().optional(),
  totalValue: z.union([z.number(), z.string()]).nullable().optional(),
  totalStockIncrease: z.number().nullable().optional(),
  totalStockDecrease: z.number().nullable().optional(),
  totalStockNoChange: z.number().nullable().optional(),
  icbCodeParent: z.union([z.number(), z.null()]).nullable().optional(),
});

// When group = ALL, objects may omit some totals; keep the same schema but allow partials
export const AllocatedICBResponseSchema = z.array(AllocatedICBItemSchema);

export type AllocatedICBRequest = z.infer<typeof AllocatedICBRequestSchema>;
export type AllocatedICBItem = z.infer<typeof AllocatedICBItemSchema>;
export type AllocatedICBResponse = z.infer<typeof AllocatedICBResponseSchema>;

// Company Technical Analysis schemas
export const TechnicalIndicatorSchema = z.object({
  name: z.string(),
  value: z.union([z.number(), z.string()]).nullable(),
  rating: z.string(), // "BUY", "SELL", "NEUTRAL", etc.
});

export const GaugeSchema = z.object({
  rating: z.string(),
  values: z.record(z.string(), z.number()), // count of each rating type
});

export const PivotSchema = z.object({
  R3: z.union([z.number(), z.string()]).nullable().optional(),
  R2: z.union([z.number(), z.string()]).nullable().optional(),
  R1: z.union([z.number(), z.string()]).nullable().optional(),
  Pivot: z.union([z.number(), z.string()]).nullable().optional(),
  S1: z.union([z.number(), z.string()]).nullable().optional(),
  S2: z.union([z.number(), z.string()]).nullable().optional(),
  S3: z.union([z.number(), z.string()]).nullable().optional(),
});

export const TechnicalAnalysisDataSchema = z.object({
  timeFrame: z.string(),
  movingAverages: z.array(TechnicalIndicatorSchema),
  gaugeMovingAverage: GaugeSchema,
  oscillators: z.array(TechnicalIndicatorSchema),
  gaugeOscillator: GaugeSchema,
  pivot: PivotSchema,
  gaugeSummary: GaugeSchema,
  price: z.union([z.number(), z.string()]).nullable().optional(),
  matchTime: z.union([z.number(), z.string()]).nullable().optional(),
});

export const TechnicalAnalysisResponseSchema = z.object({
  serverDateTime: z.string(),
  status: z.number(),
  code: z.number(),
  msg: z.string(),
  successful: z.boolean(),
  data: TechnicalAnalysisDataSchema,
});

export type TechnicalIndicator = z.infer<typeof TechnicalIndicatorSchema>;
export type Gauge = z.infer<typeof GaugeSchema>;
export type Pivot = z.infer<typeof PivotSchema>;
export type TechnicalAnalysisData = z.infer<typeof TechnicalAnalysisDataSchema>;
export type TechnicalAnalysisResponse = z.infer<typeof TechnicalAnalysisResponseSchema>;
