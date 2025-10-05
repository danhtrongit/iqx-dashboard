import { z } from "zod";

// API Extension Package Schema
export const ApiExtensionPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  additionalCalls: z.number(),
  price: z.coerce.number(),
  currency: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ApiExtensionPackage = z.infer<typeof ApiExtensionPackageSchema>;

// User API Extension Schema
export const UserApiExtensionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subscriptionId: z.string(),
  extensionPackageId: z.string(),
  additionalCalls: z.number(),
  price: z.coerce.number(),
  currency: z.string(),
  paymentReference: z.string().nullable(),
  createdAt: z.string(),
});

export type UserApiExtension = z.infer<typeof UserApiExtensionSchema>;

// User API Extension with Package Details (Backend returns flattened structure)
export const UserApiExtensionWithPackageSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  subscriptionId: z.string(),
  extensionPackageId: z.string().optional(),
  extensionPackageName: z.string(), // Flattened from package.name
  additionalCalls: z.number(),
  price: z.coerce.number(),
  currency: z.string(),
  paymentReference: z.string().nullable(),
  purchasedAt: z.string(), // Backend uses purchasedAt instead of createdAt
  createdAt: z.string().optional(),
});

export type UserApiExtensionWithPackage = z.infer<
  typeof UserApiExtensionWithPackageSchema
>;

// Purchase Extension Request
export const PurchaseExtensionRequestSchema = z.object({
  extensionPackageId: z.string().uuid("ID gói mở rộng không hợp lệ"),
  paymentReference: z.string().optional(),
});

export type PurchaseExtensionRequest = z.infer<
  typeof PurchaseExtensionRequestSchema
>;

// Purchase Extension Response
export const PurchaseExtensionResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string(),
  extension: UserApiExtensionWithPackageSchema.optional(),
  newLimit: z.number().optional(),
  remaining: z.number().optional(),
  // Backend might return the extension directly or in different format
}).passthrough(); // Allow additional properties from backend

export type PurchaseExtensionResponse = z.infer<
  typeof PurchaseExtensionResponseSchema
>;

// My Extensions Response (current subscription's extensions)
export const MyExtensionsResponseSchema = z.object({
  subscriptionId: z.string(),
  totalAdditionalCalls: z.number(),
  extensions: z.array(UserApiExtensionWithPackageSchema),
});

export type MyExtensionsResponse = z.infer<typeof MyExtensionsResponseSchema>;

// Extension Purchase History
export const ExtensionHistoryResponseSchema = z.object({
  totalPurchases: z.number(),
  totalSpent: z.number(),
  history: z.array(UserApiExtensionWithPackageSchema),
});

export type ExtensionHistoryResponse = z.infer<
  typeof ExtensionHistoryResponseSchema
>;

// API Extension Error
export class ApiExtensionError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiExtensionError";
  }
}

