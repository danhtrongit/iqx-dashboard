import { z } from "zod";

// Commission Setting Schema
export const CommissionSettingSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  commissionTotalPct: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  tiersPct: z.array(z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  )),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CommissionSetting = z.infer<typeof CommissionSettingSchema>;

// API Response Schemas
export const CommissionSettingResponseSchema = z.object({
  success: z.boolean(),
  data: CommissionSettingSchema.nullable(),
});

export const CommissionSettingsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CommissionSettingSchema),
});

export const PayoutExampleSchema = z.object({
  tier: z.number(),
  percentage: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  amount: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
});

export const PayoutExamplesResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    price: z.number(),
    totalCommission: z.union([z.number(), z.string()]).transform(val => 
      typeof val === 'string' ? parseFloat(val) : val
    ),
    tiers: z.array(PayoutExampleSchema),
  }),
});

// Request DTOs
export interface CreateCommissionSettingRequest {
  name: string;
  description?: string;
  commissionTotalPct: number;
  tiersPct: number[];
  isActive?: boolean;
}

export interface UpdateCommissionSettingRequest {
  name?: string;
  description?: string;
  commissionTotalPct?: number;
  tiersPct?: number[];
  isActive?: boolean;
}

export interface PayoutExampleRequest {
  price: number;
}

// Commission Error
export class CommissionError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = "CommissionError";
  }
}

