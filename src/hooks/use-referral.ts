import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReferralService } from "@/services/referral.service";
import { toast } from "sonner";
import type { CommissionStatus, ApplyReferralCodeRequest } from "@/types/referral";

// Query keys
export const referralKeys = {
  all: ["referral"] as const,
  myCode: () => [...referralKeys.all, "my-code"] as const,
  stats: () => [...referralKeys.all, "stats"] as const,
  commissions: (status?: CommissionStatus) =>
    [...referralKeys.all, "commissions", status] as const,
  total: () => [...referralKeys.all, "total"] as const,
  referrals: () => [...referralKeys.all, "referrals"] as const,
  downlineTree: (maxDepth?: number) =>
    [...referralKeys.all, "downline-tree", maxDepth] as const,
  totalDownline: (maxDepth?: number) =>
    [...referralKeys.all, "total-downline", maxDepth] as const,
};

/**
 * Hook to get user's referral code
 */
export function useMyReferralCode() {
  return useQuery({
    queryKey: referralKeys.myCode(),
    queryFn: () => ReferralService.getMyReferralCode(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to generate referral code
 */
export function useGenerateReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ReferralService.generateReferralCode(),
    onSuccess: (data) => {
      // Update cache with the new referral code
      queryClient.setQueryData(referralKeys.myCode(), data);
      // Invalidate stats only, not myCode (to avoid refetch loop)
      queryClient.invalidateQueries({ queryKey: referralKeys.stats() });
      toast.success("Đã tạo mã giới thiệu thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể tạo mã giới thiệu");
    },
  });
}

/**
 * Hook to update referral code
 */
export function useUpdateReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newCode: string) => ReferralService.updateReferralCode(newCode),
    onSuccess: (data) => {
      // Update cache directly without invalidating myCode
      queryClient.setQueryData(referralKeys.myCode(), data);
      queryClient.invalidateQueries({ queryKey: referralKeys.stats() });
      toast.success("Đã cập nhật mã giới thiệu thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật mã giới thiệu");
    },
  });
}

/**
 * Hook to apply referral code
 */
export function useApplyReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplyReferralCodeRequest) =>
      ReferralService.applyReferralCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referralKeys.all });
      toast.success("Áp dụng mã giới thiệu thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể áp dụng mã giới thiệu");
    },
  });
}

/**
 * Hook to get referral stats
 */
export function useReferralStats() {
  return useQuery({
    queryKey: referralKeys.stats(),
    queryFn: () => ReferralService.getMyStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get commissions
 */
export function useCommissions(status?: CommissionStatus) {
  return useQuery({
    queryKey: referralKeys.commissions(status),
    queryFn: () => ReferralService.getMyCommissions(status),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get total commission
 */
export function useTotalCommission() {
  return useQuery({
    queryKey: referralKeys.total(),
    queryFn: () => ReferralService.getTotalCommission(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get direct referrals (F1)
 */
export function useDirectReferrals() {
  return useQuery({
    queryKey: referralKeys.referrals(),
    queryFn: () => ReferralService.getDirectReferrals(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to copy referral link
 */
export function useCopyReferralLink() {
  return useMutation({
    mutationFn: (code: string) => ReferralService.copyReferralLink(code),
    onSuccess: () => {
      toast.success("Đã sao chép link giới thiệu!");
    },
    onError: () => {
      toast.error("Không thể sao chép link");
    },
  });
}

/**
 * Hook to get downline tree
 */
export function useDownlineTree(maxDepth: number = 10) {
  return useQuery({
    queryKey: referralKeys.downlineTree(maxDepth),
    queryFn: () => ReferralService.getDownlineTree(maxDepth),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get total downline count
 */
export function useTotalDownlineCount(maxDepth: number = 10) {
  return useQuery({
    queryKey: referralKeys.totalDownline(maxDepth),
    queryFn: () => ReferralService.getTotalDownlineCount(maxDepth),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
