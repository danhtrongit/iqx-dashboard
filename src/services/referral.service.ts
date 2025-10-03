import axios, { type AxiosResponse } from "axios";
import {
  type ReferralCode,
  type ReferralStats,
  type Commission,
  type CommissionTotal,
  type DownlineNode,
  type ApplyReferralCodeRequest,
  ReferralError,
  ReferralCodeResponseSchema,
  ReferralStatsResponseSchema,
  CommissionsResponseSchema,
  CommissionTotalResponseSchema,
  DownlineTreeResponseSchema,
  TotalDownlineResponseSchema,
  type CommissionStatus,
} from "@/types/referral";

const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api";

// Create axios instance for referral
const referralHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
referralHttp.interceptors.request.use(
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
referralHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || "Có lỗi xảy ra";
      throw new ReferralError(
        message,
        error.response.status,
        error.response.data?.code
      );
    }
    throw new ReferralError("Không thể kết nối đến máy chủ");
  }
);

export class ReferralService {
  /**
   * Generate referral code for current user
   */
  static async generateReferralCode(): Promise<ReferralCode> {
    const response: AxiosResponse = await referralHttp.post(
      "/referral/generate-code"
    );
    const validated = ReferralCodeResponseSchema.parse(response.data);
    if (!validated.data) {
      throw new ReferralError("Không thể tạo mã giới thiệu");
    }
    return validated.data;
  }

  /**
   * Get my referral code
   */
  static async getMyReferralCode(): Promise<ReferralCode | null> {
    const response: AxiosResponse = await referralHttp.get("/referral/my-code");
    const validated = ReferralCodeResponseSchema.parse(response.data);
    return validated.data;
  }

  /**
   * Update my referral code
   */
  static async updateReferralCode(newCode: string): Promise<ReferralCode> {
    const response: AxiosResponse = await referralHttp.put("/referral/my-code", {
      code: newCode,
    });
    const validated = ReferralCodeResponseSchema.parse(response.data);
    if (!validated.data) {
      throw new ReferralError("Không thể cập nhật mã giới thiệu");
    }
    return validated.data;
  }

  /**
   * Apply referral code
   */
  static async applyReferralCode(data: ApplyReferralCodeRequest): Promise<void> {
    await referralHttp.post("/referral/apply", data);
  }

  /**
   * Get my referral stats
   */
  static async getMyStats(): Promise<ReferralStats> {
    const response: AxiosResponse = await referralHttp.get("/referral/stats");
    const validated = ReferralStatsResponseSchema.parse(response.data);
    return validated.data;
  }

  /**
   * Get my commissions
   */
  static async getMyCommissions(status?: CommissionStatus): Promise<Commission[]> {
    const params = status ? { status } : {};
    const response: AxiosResponse = await referralHttp.get("/referral/commissions", {
      params,
    });
    const validated = CommissionsResponseSchema.parse(response.data);
    return validated.data;
  }

  /**
   * Get total commission
   */
  static async getTotalCommission(): Promise<CommissionTotal> {
    const response: AxiosResponse = await referralHttp.get(
      "/referral/commissions/total"
    );
    const validated = CommissionTotalResponseSchema.parse(response.data);
    return validated.data;
  }

  /**
   * Get direct referrals (F1)
   */
  static async getDirectReferrals(): Promise<any[]> {
    const response: AxiosResponse = await referralHttp.get("/referral/referrals");
    return response.data.data;
  }

  /**
   * Generate referral link
   */
  static generateReferralLink(code: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${code}`;
  }

  /**
   * Copy referral link to clipboard
   */
  static async copyReferralLink(code: string): Promise<void> {
    const link = this.generateReferralLink(code);
    await navigator.clipboard.writeText(link);
  }

  /**
   * Get downline tree
   */
  static async getDownlineTree(maxDepth: number = 10): Promise<DownlineNode | null> {
    const response: AxiosResponse = await referralHttp.get("/referral/downline-tree", {
      params: { maxDepth },
    });
    const validated = DownlineTreeResponseSchema.parse(response.data);
    return validated.data;
  }

  /**
   * Get total downline count
   */
  static async getTotalDownlineCount(maxDepth: number = 10): Promise<number> {
    const response: AxiosResponse = await referralHttp.get("/referral/total-downline", {
      params: { maxDepth },
    });
    const validated = TotalDownlineResponseSchema.parse(response.data);
    return validated.data.total;
  }
}

export default ReferralService;
