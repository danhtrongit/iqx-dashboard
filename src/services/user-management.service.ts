import axios, { type AxiosResponse } from "axios";
import type {
  UserStats,
  UserListParams,
  UserListResponse,
  UserDetail,
  UserSubscription,
  AssignSubscriptionRequest,
  UpdateSubscriptionRequest,
  UpdateRoleRequest,
  CancelSubscriptionRequest,
  UserActionResponse,
} from "@/types/user-management";

const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api";

// Create axios instance for user management API
const userManagementHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
userManagementHttp.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
userManagementHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Có lỗi xảy ra";
    return Promise.reject(new Error(message));
  }
);

const BASE_URL = "/admin/users";

export class UserManagementService {
  // Get user statistics
  static async getStats(): Promise<UserStats> {
    const response = await userManagementHttp.get<UserStats>(`${BASE_URL}/stats`);
    return response.data;
  }

  // Get list of users with pagination and filters
  static async getUsers(params: UserListParams): Promise<UserListResponse> {
    const response = await userManagementHttp.get<UserListResponse>(BASE_URL, { params });
    return response.data;
  }

  // Get user details by ID
  static async getUserById(userId: string): Promise<UserDetail> {
    const response = await userManagementHttp.get<UserDetail>(`${BASE_URL}/${userId}`);
    return response.data;
  }

  // Activate a user
  static async activateUser(userId: string): Promise<UserActionResponse> {
    const response = await userManagementHttp.patch<UserActionResponse>(
      `${BASE_URL}/${userId}/activate`
    );
    return response.data;
  }

  // Deactivate/lock a user
  static async deactivateUser(userId: string): Promise<UserActionResponse> {
    const response = await userManagementHttp.patch<UserActionResponse>(
      `${BASE_URL}/${userId}/deactivate`
    );
    return response.data;
  }

  // Update user role
  static async updateUserRole(
    userId: string,
    data: UpdateRoleRequest
  ): Promise<UserActionResponse> {
    const response = await userManagementHttp.patch<UserActionResponse>(
      `${BASE_URL}/${userId}/role`,
      data
    );
    return response.data;
  }

  // Get user subscriptions
  static async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    const response = await userManagementHttp.get<UserSubscription[]>(
      `${BASE_URL}/${userId}/subscriptions`
    );
    return response.data;
  }

  // Assign subscription to user
  static async assignSubscription(
    userId: string,
    data: AssignSubscriptionRequest
  ): Promise<UserActionResponse> {
    const response = await userManagementHttp.post<UserActionResponse>(
      `${BASE_URL}/${userId}/subscriptions`,
      data
    );
    return response.data;
  }

  // Update user subscription
  static async updateSubscription(
    userId: string,
    subscriptionId: string,
    data: UpdateSubscriptionRequest
  ): Promise<UserActionResponse> {
    const response = await userManagementHttp.patch<UserActionResponse>(
      `${BASE_URL}/${userId}/subscriptions/${subscriptionId}`,
      data
    );
    return response.data;
  }

  // Cancel user subscription
  static async cancelSubscription(
    userId: string,
    subscriptionId: string,
    data: CancelSubscriptionRequest
  ): Promise<UserActionResponse> {
    const response = await userManagementHttp.delete<UserActionResponse>(
      `${BASE_URL}/${userId}/subscriptions/${subscriptionId}`,
      { data }
    );
    return response.data;
  }
}

export default UserManagementService;

