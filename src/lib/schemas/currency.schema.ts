import { z } from "zod";

export const hexarateResponseSchema = z.object({
  status_code: z.number(),
  data: z.object({
    base: z.string(),
    target: z.string(),
    mid: z.number(),
    unit: z.number(),
    timestamp: z.string(),
  }),
});

export const currencySchema = z.object({
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  flag: z.string(),
});

export type HexarateResponse = z.infer<typeof hexarateResponseSchema>;
export type Currency = z.infer<typeof currencySchema>;

