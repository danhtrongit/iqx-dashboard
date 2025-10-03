import { z } from "zod";

// Subscription status enum
export const SubscriptionStatus = z.enum([
  "active",
  "expired",
  "cancelled",
  "suspended",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;

// Subscription package schema
export const SubscriptionPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.coerce.number(),
  currency: z.string(),
  durationDays: z.number(),
  isActive: z.boolean(),
  features: z.record(z.string(), z.any()).nullable(),
  maxVirtualPortfolios: z.number().nullable(),
  dailyApiLimit: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SubscriptionPackage = z.infer<typeof SubscriptionPackageSchema>;

// User subscription schema
export const UserSubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  packageId: z.string(),
  status: SubscriptionStatus,
  startsAt: z.string(),
  expiresAt: z.string(),
  autoRenew: z.boolean(),
  price: z.coerce.number().nullable(),
  currency: z.string().nullable(),
  paymentReference: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserSubscription = z.infer<typeof UserSubscriptionSchema>;

// User subscription with package
export const UserSubscriptionWithPackageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  packageId: z.string(),
  status: SubscriptionStatus,
  startsAt: z.string(),
  expiresAt: z.string(),
  autoRenew: z.boolean(),
  price: z.coerce.number().nullable(),
  currency: z.string().nullable(),
  paymentReference: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  package: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.coerce.number(),
    currency: z.string(),
    durationDays: z.number(),
    isActive: z.boolean(),
    features: z.record(z.string(), z.any()).nullable(),
    maxVirtualPortfolios: z.number().nullable(),
    dailyApiLimit: z.number().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export type UserSubscriptionWithPackage = z.infer<
  typeof UserSubscriptionWithPackageSchema
>;

// Subscribe request
export const SubscribeRequestSchema = z.object({
  packageId: z.string().uuid("ID gói đăng ký không hợp lệ"),
  paymentReference: z.string().optional(),
});

export type SubscribeRequest = z.infer<typeof SubscribeRequestSchema>;

// Current plan response
export const CurrentPlanSchema = z.object({
  hasPlan: z.boolean(),
  planName: z.string(),
  expiresAt: z.string().optional(),
  features: z.object({
    maxVirtualPortfolios: z.number(),
    dailyApiLimit: z.number(),
  }),
});

export type CurrentPlan = z.infer<typeof CurrentPlanSchema>;

// Subscription stats
export const SubscriptionStatsSchema = z.object({
  total: z.number(),
  active: z.number(),
  expired: z.number(),
  cancelled: z.number(),
  totalRevenue: z.number(),
});

export type SubscriptionStats = z.infer<typeof SubscriptionStatsSchema>;

// Cancel subscription request
export const CancelSubscriptionRequestSchema = z.object({
  reason: z.string().optional(),
});

export type CancelSubscriptionRequest = z.infer<
  typeof CancelSubscriptionRequestSchema
>;

// Renew subscription request
export const RenewSubscriptionRequestSchema = z.object({
  paymentReference: z.string().optional(),
});

export type RenewSubscriptionRequest = z.infer<
  typeof RenewSubscriptionRequestSchema
>;

// Subscription error
export class SubscriptionError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = "SubscriptionError";
  }
}
