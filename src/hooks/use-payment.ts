import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import PaymentService from "@/services/payment.service";
import SubscriptionService from "@/services/subscription.service";
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentWithSubscription,
  PaymentStatusResponse,
} from "@/types/payment";
import type {
  SubscriptionPackage,
  UserSubscriptionWithPackage,
  CurrentPlan,
  SubscriptionStats,
  CancelSubscriptionRequest,
  RenewSubscriptionRequest,
} from "@/types/subscription";

// Query keys
export const PAYMENT_KEYS = {
  all: ["payments"] as const,
  lists: () => [...PAYMENT_KEYS.all, "list"] as const,
  list: () => [...PAYMENT_KEYS.lists()] as const,
  details: () => [...PAYMENT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PAYMENT_KEYS.details(), id] as const,
  status: (orderCode: number) =>
    [...PAYMENT_KEYS.all, "status", orderCode] as const,
};

export const SUBSCRIPTION_KEYS = {
  all: ["subscriptions"] as const,
  packages: () => [...SUBSCRIPTION_KEYS.all, "packages"] as const,
  package: (id: string) => [...SUBSCRIPTION_KEYS.packages(), id] as const,
  myPlan: () => [...SUBSCRIPTION_KEYS.all, "my-plan"] as const,
  mySubscription: () => [...SUBSCRIPTION_KEYS.all, "my-subscription"] as const,
  history: () => [...SUBSCRIPTION_KEYS.all, "history"] as const,
  stats: () => [...SUBSCRIPTION_KEYS.all, "stats"] as const,
};

// ========== Payment Hooks ==========

/**
 * Create a new payment for subscription package
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation<CreatePaymentResponse, Error, CreatePaymentRequest>({
    mutationFn: (data) => PaymentService.createPayment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.lists() });
      toast.success("Đã tạo thanh toán thành công");

      // Redirect to PayOS checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Không thể tạo thanh toán");
    },
  });
}

/**
 * Get user's payment history
 */
export function usePaymentHistory() {
  return useQuery<PaymentWithSubscription[], Error>({
    queryKey: PAYMENT_KEYS.list(),
    queryFn: () => PaymentService.getMyPayments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get payment by ID
 */
export function usePayment(paymentId: string) {
  return useQuery<PaymentWithSubscription, Error>({
    queryKey: PAYMENT_KEYS.detail(paymentId),
    queryFn: () => PaymentService.getPaymentById(paymentId),
    enabled: !!paymentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Check payment status by order code
 */
export function usePaymentStatus(orderCode: number | null) {
  return useQuery<PaymentStatusResponse, Error>({
    queryKey: PAYMENT_KEYS.status(orderCode!),
    queryFn: () => PaymentService.checkPaymentStatus(orderCode!),
    enabled: !!orderCode,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 5000, // Refetch every 5 seconds while pending
  });
}

/**
 * Cancel a payment
 */
export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation<PaymentWithSubscription, Error, string>({
    mutationFn: (paymentId) => PaymentService.cancelPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.lists() });
      toast.success("Đã hủy thanh toán");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể hủy thanh toán");
    },
  });
}

// ========== Subscription Hooks ==========

/**
 * Get all available subscription packages
 */
export function useSubscriptionPackages() {
  return useQuery<SubscriptionPackage[], Error>({
    queryKey: SUBSCRIPTION_KEYS.packages(),
    queryFn: () => SubscriptionService.getAllPackages(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get subscription package by ID
 */
export function useSubscriptionPackage(packageId: string) {
  return useQuery<SubscriptionPackage, Error>({
    queryKey: SUBSCRIPTION_KEYS.package(packageId),
    queryFn: () => SubscriptionService.getPackageById(packageId),
    enabled: !!packageId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get user's current plan
 */
export function useCurrentPlan() {
  return useQuery<CurrentPlan, Error>({
    queryKey: SUBSCRIPTION_KEYS.myPlan(),
    queryFn: () => SubscriptionService.getMyPlan(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get user's active subscription
 */
export function useMySubscription() {
  return useQuery<UserSubscriptionWithPackage | null, Error>({
    queryKey: SUBSCRIPTION_KEYS.mySubscription(),
    queryFn: () => SubscriptionService.getMySubscription(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get user's subscription history
 */
export function useSubscriptionHistory() {
  return useQuery<UserSubscriptionWithPackage[], Error>({
    queryKey: SUBSCRIPTION_KEYS.history(),
    queryFn: () => SubscriptionService.getMyHistory(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get subscription statistics
 */
export function useSubscriptionStats() {
  return useQuery<SubscriptionStats, Error>({
    queryKey: SUBSCRIPTION_KEYS.stats(),
    queryFn: () => SubscriptionService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Renew subscription
 */
export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation<
    UserSubscriptionWithPackage,
    Error,
    { subscriptionId: string; data: RenewSubscriptionRequest }
  >({
    mutationFn: ({ subscriptionId, data }) =>
      SubscriptionService.renewSubscription(subscriptionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.myPlan() });
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_KEYS.mySubscription(),
      });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.history() });
      toast.success("Đã gia hạn gói đăng ký");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể gia hạn gói đăng ký");
    },
  });
}

/**
 * Cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation<
    UserSubscriptionWithPackage,
    Error,
    { subscriptionId: string; data: CancelSubscriptionRequest }
  >({
    mutationFn: ({ subscriptionId, data }) =>
      SubscriptionService.cancelSubscription(subscriptionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.myPlan() });
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_KEYS.mySubscription(),
      });
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.history() });
      toast.success("Đã hủy gói đăng ký");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể hủy gói đăng ký");
    },
  });
}

/**
 * Seed sample packages (for testing)
 */
export function useSeedSamplePackages() {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionPackage[], Error>({
    mutationFn: () => SubscriptionService.seedSamplePackages(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.packages() });
      toast.success("Đã tạo gói mẫu thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể tạo gói mẫu");
    },
  });
}
