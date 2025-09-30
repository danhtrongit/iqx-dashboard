import { z } from "zod";

// Common response wrapper schema
export const ApiResponseSchema = z.object({
  serverDateTime: z.string(),
  status: z.number(),
  code: z.number(),
  msg: z.string(),
  exception: z.null(),
  successful: z.boolean(),
});

// Financial Statement Metrics Schema
export const FinancialMetricItemSchema = z.object({
  level: z.number(),
  parent: z.string().nullable(),
  titleEn: z.string(),
  titleVi: z.string(),
  fullTitleEn: z.string(),
  fullTitleVi: z.string(),
  field: z.string(),
  name: z.string(),
});

export const FinancialStatementMetricsSchema = z.object({
  BALANCE_SHEET: z.array(FinancialMetricItemSchema),
  INCOME_STATEMENT: z.array(FinancialMetricItemSchema),
  CASH_FLOW: z.array(FinancialMetricItemSchema),
  NOTE: z.array(FinancialMetricItemSchema),
});

export const FinancialStatementMetricsResponseSchema = ApiResponseSchema.extend({
  data: FinancialStatementMetricsSchema,
});

// Financial Statistics Schema
export const FinancialStatisticsItemSchema = z.object({
  year: z.string(),
  quarter: z.number(),
  ratioType: z.string(),
  organCode: z.string(),
  marketCap: z.union([z.number(), z.null(), z.undefined()]).optional(),
  dividendYield: z.union([z.number(), z.null(), z.undefined()]).optional(),
  pe: z.union([z.number(), z.null(), z.undefined()]).optional(),
  pb: z.union([z.number(), z.null(), z.undefined()]).optional(),
  ps: z.union([z.number(), z.null(), z.undefined()]).optional(),
  roe: z.union([z.number(), z.null(), z.undefined()]).optional(),
  roa: z.union([z.number(), z.null(), z.undefined()]).optional(),
  grossMargin: z.union([z.number(), z.null(), z.undefined()]).optional(),
  operatingMargin: z.union([z.number(), z.null(), z.undefined()]).optional(),
  netMargin: z.union([z.number(), z.null(), z.undefined()]).optional(),
  debtToEquity: z.union([z.number(), z.null(), z.undefined()]).optional(),
  debtToAsset: z.union([z.number(), z.null(), z.undefined()]).optional(),
  currentRatio: z.union([z.number(), z.null(), z.undefined()]).optional(),
  quickRatio: z.union([z.number(), z.null(), z.undefined()]).optional(),
  cashRatio: z.union([z.number(), z.null(), z.undefined()]).optional(),
  assetTurnover: z.union([z.number(), z.null(), z.undefined()]).optional(),
  inventoryTurnover: z.union([z.number(), z.null(), z.undefined()]).optional(),
  receivableTurnover: z.union([z.number(), z.null(), z.undefined()]).optional(),
  payableTurnover: z.union([z.number(), z.null(), z.undefined()]).optional(),
  cashCycle: z.union([z.number(), z.null(), z.undefined()]).optional(),
  workingCapital: z.union([z.number(), z.null(), z.undefined()]).optional(),
  enterpriseValue: z.union([z.number(), z.null(), z.undefined()]).optional(),
  evToEbitda: z.union([z.number(), z.null(), z.undefined()]).optional(),
  evToSales: z.union([z.number(), z.null(), z.undefined()]).optional(),
  priceToBook: z.union([z.number(), z.null(), z.undefined()]).optional(),
  priceToSales: z.union([z.number(), z.null(), z.undefined()]).optional(),
  pegRatio: z.union([z.number(), z.null(), z.undefined()]).optional(),
  bookValuePerShare: z.union([z.number(), z.null(), z.undefined()]).optional(),
  earningsPerShare: z.union([z.number(), z.null(), z.undefined()]).optional(),
  revenuePerShare: z.union([z.number(), z.null(), z.undefined()]).optional(),
  tangibleBookValuePerShare: z.union([z.number(), z.null(), z.undefined()]).optional(),
  car: z.union([z.number(), z.null(), z.undefined()]).optional(),
  equity: z.union([z.number(), z.null(), z.undefined()]).optional(),
}).catchall(z.union([z.number(), z.null(), z.undefined()]).optional()); // Allow additional dynamic fields

export const FinancialStatisticsResponseSchema = ApiResponseSchema.extend({
  data: z.array(FinancialStatisticsItemSchema),
});

// Financial Statement Detail Schema
export const FinancialReportSchema = z.object({
  organCode: z.string(),
  ticker: z.string(),
  createDate: z.string().nullable().optional(),
  updateDate: z.string(),
  yearReport: z.number(),
  lengthReport: z.number(),
  publicDate: z.string(),
}).catchall(z.union([z.number(), z.string(), z.null(), z.undefined()]).optional()); // Allow dynamic numeric fields (bsa1, bsa2, etc.)

export const FinancialStatementDetailSchema = z.object({
  years: z.array(FinancialReportSchema),
  quarters: z.array(FinancialReportSchema),
});

export const FinancialStatementDetailResponseSchema = ApiResponseSchema.extend({
  data: FinancialStatementDetailSchema,
});

// Type exports
export type FinancialMetricItem = z.infer<typeof FinancialMetricItemSchema>;
export type FinancialStatementMetrics = z.infer<typeof FinancialStatementMetricsSchema>;
export type FinancialStatementMetricsResponse = z.infer<typeof FinancialStatementMetricsResponseSchema>;

export type FinancialStatisticsItem = z.infer<typeof FinancialStatisticsItemSchema>;
export type FinancialStatisticsResponse = z.infer<typeof FinancialStatisticsResponseSchema>;

export type FinancialReport = z.infer<typeof FinancialReportSchema>;
export type FinancialStatementDetail = z.infer<typeof FinancialStatementDetailSchema>;
export type FinancialStatementDetailResponse = z.infer<typeof FinancialStatementDetailResponseSchema>;