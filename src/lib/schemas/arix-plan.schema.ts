import { z } from "zod";

/**
 * Schema for Google Sheets API response
 */
export const googleSheetsResponseSchema = z.object({
  range: z.string(),
  majorDimension: z.string(),
  values: z.array(z.array(z.string())),
});

/**
 * Schema for ARIX Plan position
 */
export const arixPlanPositionSchema = z.object({
  symbol: z.string(),
  buyPrice: z.number(),
  stopLoss: z.number(),
  target: z.number(),
  returnRisk: z.number(),
});

export type ArixPlanPositionSchema = z.infer<typeof arixPlanPositionSchema>;

