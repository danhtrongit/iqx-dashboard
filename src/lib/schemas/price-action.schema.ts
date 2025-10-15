import { z } from "zod";

// Schema for individual stock price action data
export const priceActionItemSchema = z.object({
  ticker: z.string(),
  date: z.string(),
  currentPrice: z.number(),
  change1D: z.number(),
  change7D: z.number(),
  change30D: z.number(),
  volume: z.number(),
  avgVolume3M: z.number(),
  high3M: z.number(),
  percentFromHigh3M: z.number(),
}).passthrough();

// Schema for API response
export const priceActionResponseSchema = z.object({
  data: z.array(priceActionItemSchema),
}).passthrough();

export type PriceActionItem = z.infer<typeof priceActionItemSchema>;
export type PriceActionResponse = z.infer<typeof priceActionResponseSchema>;
