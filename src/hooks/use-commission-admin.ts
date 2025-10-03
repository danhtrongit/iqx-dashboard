import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommissionAdminService } from "@/services/commission-admin.service";
import { toast } from "sonner";
import type {
  CreateCommissionSettingRequest,
  UpdateCommissionSettingRequest,
  PayoutExampleRequest,
} from "@/types/commission";

// Query keys
export const commissionAdminKeys = {
  all: ["commission-admin"] as const,
  settings: () => [...commissionAdminKeys.all, "settings"] as const,
  activeSetting: () => [...commissionAdminKeys.all, "active-setting"] as const,
  payoutExamples: (price: number) =>
    [...commissionAdminKeys.all, "payout-examples", price] as const,
};

/**
 * Hook to get all commission settings
 */
export function useCommissionSettings() {
  return useQuery({
    queryKey: commissionAdminKeys.settings(),
    queryFn: () => CommissionAdminService.getAllSettings(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get active commission setting
 */
export function useActiveCommissionSetting() {
  return useQuery({
    queryKey: commissionAdminKeys.activeSetting(),
    queryFn: () => CommissionAdminService.getActiveSetting(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create commission setting
 */
export function useCreateCommissionSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommissionSettingRequest) =>
      CommissionAdminService.createSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionAdminKeys.settings() });
      queryClient.invalidateQueries({ queryKey: commissionAdminKeys.activeSetting() });
      toast.success("Đã tạo cấu hình hoa hồng thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể tạo cấu hình hoa hồng");
    },
  });
}

/**
 * Hook to update commission setting
 */
export function useUpdateCommissionSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommissionSettingRequest }) =>
      CommissionAdminService.updateSetting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionAdminKeys.settings() });
      queryClient.invalidateQueries({ queryKey: commissionAdminKeys.activeSetting() });
      toast.success("Đã cập nhật cấu hình hoa hồng thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật cấu hình hoa hồng");
    },
  });
}

/**
 * Hook to get payout examples
 */
export function usePayoutExamples(price: number, enabled: boolean = true) {
  return useQuery({
    queryKey: commissionAdminKeys.payoutExamples(price),
    queryFn: () => CommissionAdminService.getPayoutExamples({ price }),
    enabled: enabled && price > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to delete commission setting
 */
export function useDeleteCommissionSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CommissionAdminService.deleteSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commissionAdminKeys.settings() });
      queryClient.invalidateQueries({ queryKey: commissionAdminKeys.activeSetting() });
      toast.success("Đã xóa cấu hình hoa hồng!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể xóa cấu hình hoa hồng");
    },
  });
}

/**
 * Hook to toggle active status of commission setting
 */
export function useToggleActiveSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CommissionAdminService.toggleActiveSetting(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: commissionAdminKeys.settings() });
      queryClient.invalidateQueries({ queryKey: commissionAdminKeys.activeSetting() });
      toast.success(
        data.isActive
          ? "Đã kích hoạt cấu hình!"
          : "Đã vô hiệu hóa cấu hình!"
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể thay đổi trạng thái");
    },
  });
}

/**
 * Hook to generate referral codes for all users
 */
export function useGenerateReferralForAll() {
  return useMutation({
    mutationFn: () => CommissionAdminService.generateReferralForAllUsers(),
    onSuccess: (data) => {
      toast.success(`Đã tạo ${data.created} mã giới thiệu mới!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể tạo mã giới thiệu");
    },
  });
}

