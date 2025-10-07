import axios, { type AxiosResponse } from "axios";
import {
  type SubscriptionPackage,
  type UserSubscription,
  type UserSubscriptionWithPackage,
  type SubscribeRequest,
  type CurrentPlan,
  type SubscriptionStats,
  type CancelSubscriptionRequest,
  type RenewSubscriptionRequest,
  SubscriptionError,
  SubscriptionPackageSchema,
  UserSubscriptionSchema,
  UserSubscriptionWithPackageSchema,
  CurrentPlanSchema,
  SubscriptionStatsSchema,
} from "@/types/subscription";

const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api";

// Create axios instance for subscription
const subscriptionHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
subscriptionHttp.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
subscriptionHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || "Có lỗi xảy ra";
      throw new SubscriptionError(
        message,
        error.response.status,
        error.response.data?.code
      );
    }
    throw new SubscriptionError("Không thể kết nối đến máy chủ");
  }
);

export class SubscriptionService {
  /**
   * Get all available subscription packages
   */
  static async getAllPackages(): Promise<SubscriptionPackage[]> {
    const response: AxiosResponse<SubscriptionPackage[]> =
      await subscriptionHttp.get("/subscriptions/packages");

    
    try {
      const parsed = response.data.map((pkg) => {
        const result = SubscriptionPackageSchema.parse(pkg);
        return result;
      });
      return parsed;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get subscription package by ID
   */
  static async getPackageById(packageId: string): Promise<SubscriptionPackage> {
    const response: AxiosResponse<SubscriptionPackage> =
      await subscriptionHttp.get(`/subscriptions/packages/${packageId}`);

    return SubscriptionPackageSchema.parse(response.data);
  }

  /**
   * Get user's current plan
   */
  static async getMyPlan(): Promise<CurrentPlan> {
    const response: AxiosResponse<CurrentPlan> = await subscriptionHttp.get(
      "/subscriptions/my-plan"
    );

    return CurrentPlanSchema.parse(response.data);
  }

  /**
   * Get user's active subscription
   */
  static async getMySubscription(): Promise<UserSubscriptionWithPackage | null> {
    try {
      const response: AxiosResponse<UserSubscriptionWithPackage> =
        await subscriptionHttp.get("/subscriptions/my-subscription");

      return UserSubscriptionWithPackageSchema.parse(response.data);
    } catch (error) {
      // If no active subscription, return null
      if (error instanceof SubscriptionError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get user's subscription history
   */
  static async getMyHistory(): Promise<UserSubscriptionWithPackage[]> {
    const response: AxiosResponse<UserSubscriptionWithPackage[]> =
      await subscriptionHttp.get("/subscriptions/my-history");

    return response.data.map((sub) =>
      UserSubscriptionWithPackageSchema.parse(sub)
    );
  }

  /**
   * Subscribe to a package (Direct - not recommended, use payment flow instead)
   */
  static async subscribe(
    data: SubscribeRequest
  ): Promise<UserSubscription> {
    const response: AxiosResponse<UserSubscription> =
      await subscriptionHttp.post("/subscriptions/subscribe", data);

    return UserSubscriptionSchema.parse(response.data);
  }

  /**
   * Renew subscription
   */
  static async renewSubscription(
    subscriptionId: string,
    data: RenewSubscriptionRequest
  ): Promise<UserSubscription> {
    const response: AxiosResponse<UserSubscription> =
      await subscriptionHttp.put(
        `/subscriptions/${subscriptionId}/renew`,
        data
      );

    return UserSubscriptionSchema.parse(response.data);
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    data: CancelSubscriptionRequest
  ): Promise<UserSubscription> {
    const response: AxiosResponse<UserSubscription> =
      await subscriptionHttp.put(
        `/subscriptions/${subscriptionId}/cancel`,
        data
      );

    return UserSubscriptionSchema.parse(response.data);
  }

  /**
   * Get subscription statistics
   */
  static async getStats(): Promise<SubscriptionStats> {
    const response: AxiosResponse<SubscriptionStats> =
      await subscriptionHttp.get("/subscriptions/stats");

    return SubscriptionStatsSchema.parse(response.data);
  }

  /**
   * Seed sample packages (for testing)
   */
  static async seedSamplePackages(): Promise<SubscriptionPackage[]> {
    const response: AxiosResponse<SubscriptionPackage[]> =
      await subscriptionHttp.post("/subscriptions/seed-packages");

    return response.data.map((pkg) => SubscriptionPackageSchema.parse(pkg));
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(): Promise<boolean> {
    try {
      const subscription = await this.getMySubscription();
      return subscription !== null;
    } catch {
      return false;
    }
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency === "VND" ? "VND" : "USD",
    }).format(price);
  }

  /**
   * Calculate expiry date
   */
  static calculateExpiryDate(durationDays: number): Date {
    const now = new Date();
    return new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  }
}

export default SubscriptionService;
