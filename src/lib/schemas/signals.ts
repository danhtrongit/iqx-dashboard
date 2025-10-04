import { z } from "zod";

// MACD indicator schema
export const MACDSchema = z.object({
  macd: z.number(),
  signal: z.number(),
  histogram: z.number(),
});

// Technical indicators schema
export const IndicatorsSchema = z.object({
  ema20: z.number(),
  ema50: z.number(),
  ema200: z.number(),
  rsi: z.number(),
  macd: MACDSchema,
  return1D: z.number(),
});

// Condition detail schema
export const ConditionDetailSchema = z.object({
  condition: z.string(),
  actual: z.number(),
  required: z.number(),
  satisfied: z.boolean(),
});

// Condition check schema
export const ConditionCheckSchema = z.object({
  met: z.boolean(),
  details: z.array(ConditionDetailSchema),
});

// Analysis signals schema
export const AnalysisSignalsSchema = z.object({
  xuHuongTang: z.boolean(),
  suyYeu: z.boolean(),
  tinHieuBan: z.boolean(),
  quaMua: z.boolean(),
  quaBan: z.boolean(),
});

// Analysis conditions schema
export const AnalysisConditionsSchema = z.object({
  xuHuongTang: ConditionCheckSchema,
  suyYeu: ConditionCheckSchema,
  tinHieuBan: ConditionCheckSchema,
  quaMua: ConditionCheckSchema,
  quaBan: ConditionCheckSchema,
});

// Analysis schema
export const AnalysisSchema = z.object({
  trend: z.enum(["UPTREND", "DOWNTREND", "SIDEWAYS"]),
  strength: z.enum(["STRONG", "WEAK", "MODERATE"]),
  signals: AnalysisSignalsSchema,
  conditions: AnalysisConditionsSchema,
});

// Signal data item schema
export const SignalDataItemSchema = z.object({
  symbol: z.string(),
  timestamp: z.string(),
  price: z.number(),
  indicators: IndicatorsSchema,
  analysis: AnalysisSchema,
  priceVsEMA20: z.number(),
  priceVsEMA50: z.number(),
});

// Request schema
export const GetSignalsRequestSchema = z.object({
  symbols: z.array(z.string()),
});

// Response schema
export const GetSignalsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(SignalDataItemSchema),
  count: z.number(),
});

// TypeScript types
export type MACD = z.infer<typeof MACDSchema>;
export type Indicators = z.infer<typeof IndicatorsSchema>;
export type ConditionDetail = z.infer<typeof ConditionDetailSchema>;
export type ConditionCheck = z.infer<typeof ConditionCheckSchema>;
export type AnalysisSignals = z.infer<typeof AnalysisSignalsSchema>;
export type AnalysisConditions = z.infer<typeof AnalysisConditionsSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;
export type SignalDataItem = z.infer<typeof SignalDataItemSchema>;
export type GetSignalsRequest = z.infer<typeof GetSignalsRequestSchema>;
export type GetSignalsResponse = z.infer<typeof GetSignalsResponseSchema>;

// Query key types for React Query
export const SIGNALS_QUERY_KEYS = {
  all: ['signals'] as const,
  lists: () => [...SIGNALS_QUERY_KEYS.all, 'list'] as const,
  list: (symbols: string[]) => [...SIGNALS_QUERY_KEYS.lists(), { symbols }] as const,
} as const;


