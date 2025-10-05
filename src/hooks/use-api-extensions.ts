import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ApiExtensionPackage,
  PurchaseExtensionRequest,
  PurchaseExtensionResponse,
  MyExtensionsResponse,
  ExtensionHistoryResponse,
} from "@/types/api-extension";
import { apiExtensionService } from "@/services/api-extension.service";
import { toast } from "sonner";

// Query keys
export const API_EXTENSION_KEYS = {
  all: ["api-extensions"] as const,
  packages: () => [...API_EXTENSION_KEYS.all, "packages"] as const,
  package: (id: string) => [...API_EXTENSION_KEYS.all, "package", id] as const,
  myExtensions: () => [...API_EXTENSION_KEYS.all, "my-extensions"] as const,
  history: () => [...API_EXTENSION_KEYS.all, "history"] as const,
};

/**
 * Get all available API extension packages (public)
 */
export function useApiExtensionPackages() {
  return useQuery<ApiExtensionPackage[], Error>({
    queryKey: API_EXTENSION_KEYS.packages(),
    queryFn: () => apiExtensionService.getAllPackages(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get a specific API extension package by ID (public)
 */
export function useApiExtensionPackage(packageId: string, enabled: boolean = true) {
  return useQuery<ApiExtensionPackage, Error>({
    queryKey: API_EXTENSION_KEYS.package(packageId),
    queryFn: () => apiExtensionService.getPackageById(packageId),
    enabled: enabled && !!packageId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get current subscription's extensions
 */
export function useMyExtensions() {
  return useQuery<MyExtensionsResponse, Error>({
    queryKey: API_EXTENSION_KEYS.myExtensions(),
    queryFn: () => apiExtensionService.getMyExtensions(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get full purchase history
 */
export function usePurchaseHistory() {
  return useQuery<ExtensionHistoryResponse, Error>({
    queryKey: API_EXTENSION_KEYS.history(),
    queryFn: () => apiExtensionService.getPurchaseHistory(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create payment for API extension package
 */
export function useCreateExtensionPayment() {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { packageId: string; returnUrl?: string; cancelUrl?: string }
  >({
    mutationFn: ({ packageId, returnUrl, cancelUrl }) => 
      apiExtensionService.createExtensionPayment(packageId, returnUrl, cancelUrl),
    onSuccess: (data) => {
      // Save orderCode for later checking
      if (data.orderCode) {
        localStorage.setItem('extensionPaymentOrderCode', data.orderCode.toString());
      }
      
      // Redirect to PayOS checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Không thể tạo link thanh toán");
      }
    },
    onError: (error) => {
      toast.error("Lỗi tạo thanh toán", {
        description: error.message || "Đã có lỗi xảy ra khi tạo thanh toán",
      });
    },
  });
}

/**
 * Check payment status
 */
export function useCheckPaymentStatus(orderCode: string | number | null) {
  return useQuery<any, Error>({
    queryKey: ["payment-status", orderCode],
    queryFn: () => orderCode ? apiExtensionService.checkPaymentStatus(orderCode) : Promise.reject(new Error("No order code")),
    enabled: !!orderCode,
    refetchInterval: (data) => {
      // Continue polling if payment is still processing
      if (data?.status === 'processing' || data?.status === 'pending') {
        return 2000; // Poll every 2 seconds
      }
      return false; // Stop polling
    },
  });
}

