import { z } from "zod";

// Commission Status
export enum CommissionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  PAID = "paid",
  CANCELLED = "cancelled",
}

// Referral Code Schema
export const ReferralCodeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  code: z.string(),
  totalReferrals: z.number(),
  totalCommission: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ReferralCode = z.infer<typeof ReferralCodeSchema>;

// Commission Schema
export const CommissionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  paymentId: z.string(),
  referrerId: z.string(),
  tier: z.number(),
  amount: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  commissionPct: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  originalAmount: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  status: z.nativeEnum(CommissionStatus),
  paidAt: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional(),
  cancellationReason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  payment: z.any().optional(),
  referrer: z.any().optional(),
});

export type Commission = z.infer<typeof CommissionSchema>;

// Referral Stats Schema
export const ReferralStatsSchema = z.object({
  referralCode: z.string().nullable().optional(),
  totalReferrals: z.number(),
  totalCommission: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  directReferrals: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      displayName: z.string().nullable().optional(),
      createdAt: z.string(),
    })
  ),
});

export type ReferralStats = z.infer<typeof ReferralStatsSchema>;

// Downline Tree Node Schema
export const DownlineNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    email: z.string(),
    displayName: z.string().nullable().optional(),
    createdAt: z.string(),
    referralCode: z.string().nullable().optional(),
    totalReferrals: z.number(),
    totalCommission: z.union([z.number(), z.string()]).transform(val => 
      typeof val === 'string' ? parseFloat(val) : val
    ),
    level: z.number(),
    childrenCount: z.number(),
    children: z.array(DownlineNodeSchema),
  })
);

export type DownlineNode = {
  id: string;
  email: string;
  displayName?: string | null;
  createdAt: string;
  referralCode?: string | null;
  totalReferrals: number;
  totalCommission: number;
  level: number;
  childrenCount: number;
  children: DownlineNode[];
};

export const DownlineTreeResponseSchema = z.object({
  success: z.boolean(),
  data: DownlineNodeSchema.nullable(),
});

export const TotalDownlineResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    total: z.number(),
  }),
});

// Commission Total Schema
export const CommissionTotalSchema = z.object({
  total: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  pending: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  approved: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  paid: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
});

export type CommissionTotal = z.infer<typeof CommissionTotalSchema>;

// API Response Schemas
export const ReferralCodeResponseSchema = z.object({
  success: z.boolean(),
  data: ReferralCodeSchema.nullable(),
});

export const ReferralStatsResponseSchema = z.object({
  success: z.boolean(),
  data: ReferralStatsSchema,
});

export const CommissionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CommissionSchema),
});

export const CommissionTotalResponseSchema = z.object({
  success: z.boolean(),
  data: CommissionTotalSchema,
});

// Request DTOs
export interface ApplyReferralCodeRequest {
  code: string;
}

export interface GenerateReferralCodeResponse {
  success: boolean;
  data: ReferralCode;
}

// Referral Error
export class ReferralError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ReferralError";
  }
}
