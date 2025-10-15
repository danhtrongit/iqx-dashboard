import { z } from "zod";

export const googleSheetsResponseSchema = z.object({
  range: z.string(),
  majorDimension: z.string(),
  values: z.array(z.array(z.string())),
});

export const arixHoldPositionSchema = z.object({
  symbol: z.string(),
  date: z.string(),
  price: z.number(),
  volume: z.number(),
  currentPrice: z.number().optional(),
  profitLoss: z.number().optional(),
  profitLossPercent: z.number().optional(),
});

export const arixHoldResponseSchema = z.object({
  positions: z.array(arixHoldPositionSchema),
  totalPositions: z.number(),
  lastUpdated: z.string(),
  totalProfitLoss: z.number().optional(),
  totalProfitLossPercent: z.number().optional(),
});

export type GoogleSheetsResponse = z.infer<typeof googleSheetsResponseSchema>;
export type ArixHoldPosition = z.infer<typeof arixHoldPositionSchema>;
export type ArixHoldResponse = z.infer<typeof arixHoldResponseSchema>;

