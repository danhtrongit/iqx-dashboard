import { z } from "zod";

// Payment status enum
export const PaymentStatus = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

// Payment method enum
export const PaymentMethod = z.enum(["payos", "bank_transfer", "other"]);
export type PaymentMethod = z.infer<typeof PaymentMethod>;

// Payment entity schema
export const PaymentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subscriptionId: z.string().nullable(),
  orderCode: z.coerce.number(), // Accept string or number and convert to number
  amount: z.coerce.number(),
  currency: z.string(),
  description: z.string().nullable(),
  status: PaymentStatus,
  paymentMethod: PaymentMethod,
  paymentLinkId: z.string().nullable(),
  checkoutUrl: z.string().nullable(),
  qrCode: z.string().nullable(),
  accountNumber: z.string().nullable(),
  reference: z.string().nullable(),
  transactionDateTime: z.string().nullable(),
  counterAccountBankId: z.string().nullable(),
  counterAccountBankName: z.string().nullable(),
  counterAccountName: z.string().nullable(),
  counterAccountNumber: z.string().nullable(),
  virtualAccountName: z.string().nullable(),
  virtualAccountNumber: z.string().nullable(),
  webhookData: z.record(z.string(), z.any()).nullable(),
  completedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  failedReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Payment = z.infer<typeof PaymentSchema>;

// Create payment request
export const CreatePaymentRequestSchema = z.object({
  packageId: z.string(),
  returnUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;

// Create payment response
export const CreatePaymentResponseSchema = z.object({
  id: z.string(),
  orderCode: z.number(),
  amount: z.coerce.number(),
  currency: z.string(),
  description: z.string(),
  status: PaymentStatus,
  checkoutUrl: z.string().nullable(),
  qrCode: z.string().nullable(),
  paymentLinkId: z.string().nullable(),
  package: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    durationDays: z.number(),
  }),
});

export type CreatePaymentResponse = z.infer<typeof CreatePaymentResponseSchema>;

// Payment with subscription info
export const PaymentWithSubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subscriptionId: z.string().nullable(),
  orderCode: z.coerce.number(), // Accept string or number and convert to number
  amount: z.coerce.number(),
  currency: z.string(),
  description: z.string().nullable(),
  status: PaymentStatus,
  paymentMethod: PaymentMethod,
  paymentLinkId: z.string().nullable(),
  checkoutUrl: z.string().nullable(),
  qrCode: z.string().nullable(),
  accountNumber: z.string().nullable(),
  reference: z.string().nullable(),
  transactionDateTime: z.string().nullable(),
  counterAccountBankId: z.string().nullable(),
  counterAccountBankName: z.string().nullable(),
  counterAccountName: z.string().nullable(),
  counterAccountNumber: z.string().nullable(),
  virtualAccountName: z.string().nullable(),
  virtualAccountNumber: z.string().nullable(),
  webhookData: z.record(z.string(), z.any()).nullable(),
  completedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  failedReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  subscription: z
    .object({
      id: z.string(),
      packageId: z.string(),
      status: z.string(),
      startsAt: z.string(),
      expiresAt: z.string(),
      package: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable(),
        price: z.coerce.number(),
        currency: z.string(),
        durationDays: z.number(),
      }),
    })
    .nullable(),
});

export type PaymentWithSubscription = z.infer<
  typeof PaymentWithSubscriptionSchema
>;

// Payment status check response
export const PaymentStatusResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subscriptionId: z.string().nullable(),
  orderCode: z.coerce.number(), // Accept string or number and convert to number
  amount: z.coerce.number(),
  currency: z.string(),
  description: z.string().nullable(),
  status: PaymentStatus,
  paymentMethod: PaymentMethod,
  paymentLinkId: z.string().nullable(),
  checkoutUrl: z.string().nullable(),
  qrCode: z.string().nullable(),
  accountNumber: z.string().nullable(),
  reference: z.string().nullable(),
  transactionDateTime: z.string().nullable(),
  counterAccountBankId: z.string().nullable(),
  counterAccountBankName: z.string().nullable(),
  counterAccountName: z.string().nullable(),
  counterAccountNumber: z.string().nullable(),
  virtualAccountName: z.string().nullable(),
  virtualAccountNumber: z.string().nullable(),
  webhookData: z.record(z.string(), z.any()).nullable(),
  completedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  failedReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  payosStatus: z.string().optional(),
  payosInfo: z.any().optional(), // Add payosInfo field
});

export type PaymentStatusResponse = z.infer<typeof PaymentStatusResponseSchema>;

// Payment error
export class PaymentError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = "PaymentError";
  }
}
