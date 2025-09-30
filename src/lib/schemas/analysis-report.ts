import { z } from "zod";

export const AnalysisReportDataSchema = z.object({
  id: z.number(),
  ticker: z.string(),
  tickerName: z.string(),
  reportType: z.number(),
  source: z.string(),
  issueDate: z.string(),
  issueDateTimeAgo: z.string(),
  title: z.string(),
  attachedLink: z.string(),
  fileName: z.string(),
  targetPrice: z.number().optional(),
  recommend: z.string(),
});

export const AnalysisReportResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  total: z.number(),
  data: z.array(AnalysisReportDataSchema),
});

export const AnalysisReportQuerySchema = z.object({
  ticker: z.string(),
  isWl: z.boolean().optional().default(false),
  page: z.number().optional().default(0),
  size: z.number().optional().default(5),
});

export type AnalysisReportData = z.infer<typeof AnalysisReportDataSchema>;
export type AnalysisReportResponse = z.infer<typeof AnalysisReportResponseSchema>;
export type AnalysisReportQuery = z.infer<typeof AnalysisReportQuerySchema>;