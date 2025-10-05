import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserManagementService } from "@/services/user-management.service";
import type {
  UserListParams,
  AssignSubscriptionRequest,
  UpdateSubscriptionRequest,
  UpdateRoleRequest,
  CancelSubscriptionRequest,
} from "@/types/user-management";
import { toast } from "sonner";

// Query keys
export const userManagementKeys = {
  all: ["user-management"] as const,
  stats: () => [...userManagementKeys.all, "stats"] as const,
  lists: () => [...userManagementKeys.all, "list"] as const,
  list: (params: UserListParams) => [...userManagementKeys.lists(), params] as const,
  details: () => [...userManagementKeys.all, "detail"] as const,
  detail: (id: string) => [...userManagementKeys.details(), id] as const,
  subscriptions: (id: string) => [...userManagementKeys.detail(id), "subscriptions"] as const,
};

// Get user statistics
export function useUserStats() {
  return useQuery({
    queryKey: userManagementKeys.stats(),
    queryFn: () => UserManagementService.getStats(),
  });
}

// Get list of users
export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: userManagementKeys.list(params),
    queryFn: () => UserManagementService.getUsers(params),
  });
}

// Get user details
export function useUserDetail(userId: string, enabled = true) {
  return useQuery({
    queryKey: userManagementKeys.detail(userId),
    queryFn: () => UserManagementService.getUserById(userId),
    enabled: enabled && !!userId,
  });
}

// Get user subscriptions
export function useUserSubscriptions(userId: string, enabled = true) {
  return useQuery({
    queryKey: userManagementKeys.subscriptions(userId),
    queryFn: () => UserManagementService.getUserSubscriptions(userId),
    enabled: enabled && !!userId,
  });
}

// Activate user
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserManagementService.activateUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userManagementKeys.stats() });
      if (data.user) {
        queryClient.invalidateQueries({
          queryKey: userManagementKeys.detail(data.user.id),
        });
      }
      toast.success(data.message || "Kích hoạt người dùng thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Kích hoạt người dùng thất bại");
    },
  });
}

// Deactivate user
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserManagementService.deactivateUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userManagementKeys.stats() });
      if (data.user) {
        queryClient.invalidateQueries({
          queryKey: userManagementKeys.detail(data.user.id),
        });
      }
      toast.success(data.message || "Khóa người dùng thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Khóa người dùng thất bại");
    },
  });
}

// Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateRoleRequest }) =>
      UserManagementService.updateUserRole(userId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userManagementKeys.stats() });
      if (data.user) {
        queryClient.invalidateQueries({
          queryKey: userManagementKeys.detail(data.user.id),
        });
      }
      toast.success(data.message || "Cập nhật vai trò thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Cập nhật vai trò thất bại");
    },
  });
}

// Assign subscription to user
export function useAssignSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: AssignSubscriptionRequest;
    }) => UserManagementService.assignSubscription(userId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userManagementKeys.detail(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: userManagementKeys.subscriptions(variables.userId),
      });
      toast.success(data.message || "Gắn gói subscription thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gắn gói subscription thất bại");
    },
  });
}

// Update subscription
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      subscriptionId,
      data,
    }: {
      userId: string;
      subscriptionId: string;
      data: UpdateSubscriptionRequest;
    }) => UserManagementService.updateSubscription(userId, subscriptionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userManagementKeys.detail(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: userManagementKeys.subscriptions(variables.userId),
      });
      toast.success(data.message || "Cập nhật subscription thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Cập nhật subscription thất bại");
    },
  });
}

// Cancel subscription
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      subscriptionId,
      data,
    }: {
      userId: string;
      subscriptionId: string;
      data: CancelSubscriptionRequest;
    }) => UserManagementService.cancelSubscription(userId, subscriptionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userManagementKeys.detail(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: userManagementKeys.subscriptions(variables.userId),
      });
      toast.success(data.message || "Hủy subscription thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Hủy subscription thất bại");
    },
  });
}

