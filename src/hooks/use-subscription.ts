import { useQuery } from "@tanstack/react-query";
import { SubscriptionService } from "@/services/subscription.service";

// Query keys
export const subscriptionKeys = {
  all: ["subscription"] as const,
  packages: () => [...subscriptionKeys.all, "packages"] as const,
  package: (id: string) => [...subscriptionKeys.all, "package", id] as const,
  myPlan: () => [...subscriptionKeys.all, "my-plan"] as const,
  mySubscription: () => [...subscriptionKeys.all, "my-subscription"] as const,
  myHistory: () => [...subscriptionKeys.all, "my-history"] as const,
  stats: () => [...subscriptionKeys.all, "stats"] as const,
};

/**
 * Hook to get all subscription packages
 */
export function useSubscriptionPackages() {
  return useQuery({
    queryKey: subscriptionKeys.packages(),
    queryFn: () => SubscriptionService.getAllPackages(),
    staleTime: 10 * 60 * 1000, // 10 minutes - packages don't change often
  });
}

/**
 * Hook to get a single package by ID
 */
export function useSubscriptionPackage(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: subscriptionKeys.package(id),
    queryFn: () => SubscriptionService.getPackageById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
  });
}

