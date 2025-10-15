import { z } from "zod";

// Financial Ratio Item Schema - Contains balance sheet, income statement, and operational ratios
export const FinancialRatioItemSchema = z.object({
  ticker: z.string(),
  periodDateName: z.string(),
  periodDate: z.string(),
  
  // Balance Sheet fields (bs1-bs200+)
  // Using catchall to handle dynamic fields efficiently
}).catchall(z.union([z.number(), z.string(), z.null(), z.undefined()]).optional());

// Financial Ratio Data Schema
export const FinancialRatioDataSchema = z.object({
  industryGroup: z.string(),
  items: z.array(FinancialRatioItemSchema),
});

// Financial Ratio Response Schema
export const FinancialRatioResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: FinancialRatioDataSchema,
});

// Period enum
export const PeriodSchema = z.enum(['Q', 'Y']);

// Financial Ratio Request Schema
export const FinancialRatioRequestSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").toUpperCase(),
  period: PeriodSchema,
  size: z.number().int().positive(),
});

// Type exports
export type FinancialRatioItem = z.infer<typeof FinancialRatioItemSchema>;
export type FinancialRatioData = z.infer<typeof FinancialRatioDataSchema>;
export type FinancialRatioResponse = z.infer<typeof FinancialRatioResponseSchema>;
export type Period = z.infer<typeof PeriodSchema>;
export type FinancialRatioRequest = z.infer<typeof FinancialRatioRequestSchema>;

