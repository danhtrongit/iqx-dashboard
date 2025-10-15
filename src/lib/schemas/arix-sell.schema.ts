import { z } from "zod";

export const googleSheetsResponseSchema = z.object({
  range: z.string(),
  majorDimension: z.string(),
  values: z.array(z.array(z.string())),
});

export const arixSellTradeSchema = z.object({
  stockCode: z.string(),
  buyDate: z.string(),
  buyPrice: z.number(),
  quantity: z.number(),
  sellDate: z.string(),
  sellPrice: z.number(),
  returnPercent: z.string(),
  profitLoss: z.number(),
  daysHeld: z.number(),
});

export const arixSellResponseSchema = z.object({
  trades: z.array(arixSellTradeSchema),
  totalTrades: z.number(),
  lastUpdated: z.string(),
});

export type GoogleSheetsResponse = z.infer<typeof googleSheetsResponseSchema>;
export type ArixSellTrade = z.infer<typeof arixSellTradeSchema>;
export type ArixSellResponse = z.infer<typeof arixSellResponseSchema>;

