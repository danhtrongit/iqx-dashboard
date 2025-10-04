import { z } from "zod";

// Stock Report Schema
export const StockReportSchema = z.object({
  title: z.string(),
  source: z.string(),
  issueDate: z.string(),
  recommend: z.string(),
  targetPrice: z.string(),
  currentPrice: z.string().optional(),
  upside: z.string().optional(),
  content: z.string(),
});

export type StockReport = z.infer<typeof StockReportSchema>;

// Query Analysis Schema
export const QueryAnalysisSchema = z.object({
  intent: z.string(),
  confidence: z.number(),
});

export type QueryAnalysis = z.infer<typeof QueryAnalysisSchema>;

// Usage Schema
export const UsageSchema = z.object({
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
});

export type Usage = z.infer<typeof UsageSchema>;

// Stock Analysis Response Schema
export const StockAnalysisResponseSchema = z.object({
  success: z.boolean(),
  type: z.literal("stock_analysis"),
  ticker: z.string(),
  message: z.string(),
  reports: z.array(StockReportSchema),
  totalReportsAnalyzed: z.number(),
  queryAnalysis: QueryAnalysisSchema,
  usage: UsageSchema,
});

export type StockAnalysisResponse = z.infer<typeof StockAnalysisResponseSchema>;

// General Chat Response Schema
export const GeneralChatResponseSchema = z.object({
  success: z.boolean(),
  type: z.literal("general_chat"),
  message: z.string(),
  queryAnalysis: QueryAnalysisSchema,
  usage: UsageSchema,
});

export type GeneralChatResponse = z.infer<typeof GeneralChatResponseSchema>;

// Combined Response Schema
export const AriXProResponseSchema = z.union([
  StockAnalysisResponseSchema,
  GeneralChatResponseSchema,
]);

export type AriXProResponse = z.infer<typeof AriXProResponseSchema>;

// Error Response Schema
export const AriXProErrorSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

export type AriXProError = z.infer<typeof AriXProErrorSchema>;

// Chat Message
export interface AriXProChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  data?: AriXProResponse;
  type?: "normal" | "error";
}

// Chat Request
export interface AriXProChatRequest {
  message: string;
  model?: string;
}

