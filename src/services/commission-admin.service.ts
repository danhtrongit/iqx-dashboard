import axios, { type AxiosResponse } from "axios";
import {
  type CommissionSetting,
  type CreateCommissionSettingRequest,
  type UpdateCommissionSettingRequest,
  type PayoutExampleRequest,
  CommissionError,
  CommissionSettingResponseSchema,
  CommissionSettingsResponseSchema,
  PayoutExamplesResponseSchema,
} from "@/types/commission";

const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api";

// Create axios instance
const commissionHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
commissionHttp.interceptors.request.use(
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
commissionHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || "Có lỗi xảy ra";
      throw new CommissionError(
        message,
        error.response.status,
        error.response.data?.code
      );
    }
    throw new CommissionError("Không thể kết nối đến máy chủ");
  }
);

export class CommissionAdminService {
  /**
   * Get all commission settings
   */
  static async getAllSettings(): Promise<CommissionSetting[]> {
    const response: AxiosResponse = await commissionHttp.get("/admin/commission/settings");
    const validated = CommissionSettingsResponseSchema.parse(response.data);
    return validated.data;
  }

  /**
   * Get active commission setting
   */
  static async getActiveSetting(): Promise<CommissionSetting | null> {
    const response: AxiosResponse = await commissionHttp.get("/admin/commission/settings/active");
    const validated = CommissionSettingResponseSchema.parse(response.data);
    return validated.data;
  }

  /**
   * Create new commission setting
   */
  static async createSetting(data: CreateCommissionSettingRequest): Promise<CommissionSetting> {
    const response: AxiosResponse = await commissionHttp.post("/admin/commission/settings", data);
    const validated = CommissionSettingResponseSchema.parse(response.data);
    if (!validated.data) {
      throw new CommissionError("Không thể tạo cấu hình hoa hồng");
    }
    return validated.data;
  }

  /**
   * Update commission setting
   */
  static async updateSetting(
    id: string,
    data: UpdateCommissionSettingRequest
  ): Promise<CommissionSetting> {
    const response: AxiosResponse = await commissionHttp.put(
      `/admin/commission/settings/${id}`,
      data
    );
    const validated = CommissionSettingResponseSchema.parse(response.data);
    if (!validated.data) {
      throw new CommissionError("Không thể cập nhật cấu hình hoa hồng");
    }
    return validated.data;
  }

  /**
   * Delete commission setting
   */
  static async deleteSetting(id: string): Promise<void> {
    await commissionHttp.delete(`/admin/commission/settings/${id}`);
  }

  /**
   * Toggle active status of commission setting
   */
  static async toggleActiveSetting(id: string): Promise<CommissionSetting> {
    const response: AxiosResponse = await commissionHttp.put(
      `/admin/commission/settings/${id}/toggle-active`
    );
    const validated = CommissionSettingResponseSchema.parse(response.data);
    if (!validated.data) {
      throw new CommissionError("Không thể thay đổi trạng thái");
    }
    return validated.data;
  }

  /**
   * Get payout examples
   */
  static async getPayoutExamples(data: PayoutExampleRequest) {
    const response: AxiosResponse = await commissionHttp.post(
      "/admin/commission/settings/payout-examples",
      data
    );
    const validated = PayoutExamplesResponseSchema.parse(response.data);
    return validated.data;
  }

  /**
   * Generate referral codes for all users (Migration)
   */
  static async generateReferralForAllUsers(): Promise<{ created: number; skipped: number }> {
    const response: AxiosResponse = await commissionHttp.post(
      "/admin/commission/referral/generate-for-all"
    );
    return response.data.data;
  }
}

export default CommissionAdminService;

