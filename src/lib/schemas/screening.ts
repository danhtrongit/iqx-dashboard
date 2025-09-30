import { z } from "zod";

// Generic filter option that supports either range or discrete values
export const ConditionOptionSchema = z.object({
  type: z.literal("value").optional(),
  value: z.string().optional(),
  from: z.number().optional(),
  to: z.number().optional(),
});

export const FilterItemSchema = z.object({
  name: z.string(),
  extraName: z.string().optional(),
  conditionOptions: z.array(ConditionOptionSchema),
});

export const ScreeningRequestSchema = z.object({
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  sortFields: z.array(z.string()),
  sortOrders: z.array(z.string()),
  filter: z.array(FilterItemSchema),
});

export type ConditionOption = z.infer<typeof ConditionOptionSchema>;
export type FilterItem = z.infer<typeof FilterItemSchema>;
export type ScreeningRequest = z.infer<typeof ScreeningRequestSchema>;

// Item within data.content[] from API example
export const ScreeningTickerItemSchema = z.object({
  ticker: z.string(),
  exchange: z.string(),
  refPrice: z.number().nullable().optional(),
  ceiling: z.number().nullable().optional(),
  marketPrice: z.number().nullable().optional(),
  floor: z.number().nullable().optional(),
  accumulatedValue: z.number().nullable().optional(),
  accumulatedVolume: z.number().nullable().optional(),
  marketCap: z.number().nullable().optional(),
  dailyPriceChangePercent: z.number().nullable().optional(),
  tradingValueAdtv10Days: z.number().nullable().optional(),
  estVolume: z.number().nullable().optional(),
  ttmPb: z.number().nullable().optional(),
  ttmRoe: z.number().nullable().optional(),
  matchPriceTime: z.string().nullable().optional(),
  emaTime: z.string().nullable().optional(),
  rsi: z.number().nullable().optional(),
  lastModifiedDate: z.string().nullable().optional(),
  enOrganName: z.string().nullable().optional(),
  enOrganShortName: z.string().nullable().optional(),
  viOrganName: z.string().nullable().optional(),
  viOrganShortName: z.string().nullable().optional(),
  icbCodeLv2: z.string().nullable().optional(),
  enSector: z.string().nullable().optional(),
  viSector: z.string().nullable().optional(),
  icbCodeLv4: z.string().nullable().optional(),
  stockStrength: z.number().nullable().optional(),
});

export const PageableOrderSchema = z.object({
  direction: z.string(),
  property: z.string(),
  ignoreCase: z.boolean(),
  nullHandling: z.string(),
  descending: z.boolean(),
  ascending: z.boolean(),
});

export const PageableSortSchema = z.object({
  orders: z.array(PageableOrderSchema),
  unsorted: z.boolean(),
  sorted: z.boolean(),
  empty: z.boolean(),
});

export const PageableSchema = z.object({
  pageNumber: z.number(),
  pageSize: z.number(),
  sort: PageableSortSchema,
  offset: z.number(),
  unpaged: z.boolean(),
  paged: z.boolean(),
});

export const ScreeningDataSchema = z.object({
  content: z.array(ScreeningTickerItemSchema),
  pageable: PageableSchema,
  total: z.number(),
  totalPages: z.number(),
  totalElements: z.number(),
  last: z.boolean(),
  numberOfElements: z.number(),
  first: z.boolean(),
  size: z.number(),
  number: z.number(),
  sort: PageableSortSchema,
  empty: z.boolean(),
});

export const ScreeningEnvelopeSchema = z.object({
  serverDateTime: z.string(),
  status: z.number(),
  code: z.number(),
  msg: z.string(),
  exception: z.any().nullable(),
  successful: z.boolean(),
  data: ScreeningDataSchema,
});

export type ScreeningTickerItem = z.infer<typeof ScreeningTickerItemSchema>;
export type ScreeningData = z.infer<typeof ScreeningDataSchema>;
export type ScreeningEnvelope = z.infer<typeof ScreeningEnvelopeSchema>;

