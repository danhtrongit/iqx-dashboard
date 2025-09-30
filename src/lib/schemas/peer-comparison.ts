import { z } from "zod";

export const PeerComparisonGrowthSchema = z.object({
  "2025F": z.number(),
  "2026F": z.number(),
});

export const PeerComparisonRatioSchema = z.object({
  "2025F": z.number(),
  "2026F": z.number(),
});

export const PeerComparisonItemSchema = z.object({
  id: z.number(),
  symbol: z.string(),
  stockSymbolId: z.null(),
  ticker: z.string(),
  marketCap: z.null(),
  projectedTSR: z.number(),
  npatmiGrowth: PeerComparisonGrowthSchema,
  pe: PeerComparisonRatioSchema,
  pb: PeerComparisonRatioSchema,
  sectorType: z.string(),
  fetchedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PeerComparisonDataSchema = z.array(PeerComparisonItemSchema);

export type PeerComparisonGrowth = z.infer<typeof PeerComparisonGrowthSchema>;
export type PeerComparisonRatio = z.infer<typeof PeerComparisonRatioSchema>;
export type PeerComparisonItem = z.infer<typeof PeerComparisonItemSchema>;
export type PeerComparisonData = z.infer<typeof PeerComparisonDataSchema>;