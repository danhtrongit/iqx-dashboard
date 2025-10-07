import type {
  AriXProResponse,
  AriXProChatRequest,
  UsageResponse,
  StatsResponse,
  RateLimitError,
} from "@/types/arix-pro";
import { TokenManager } from "./auth.service";

class AriXProService {
  private baseUrl = import.meta.env.VITE_BASE_API || "http://localhost:3000/api";

  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId() {
    return "arix_pro_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
  }

  /**
   * Get authorization headers with JWT token
   */
  private getAuthHeaders(): HeadersInit {
    const token = TokenManager.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Handle API errors with proper error messages
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    try {
      const errorData = await response.json();
      
      // Handle rate limit error (429)
      if (response.status === 429) {
        const rateLimitError: RateLimitError = errorData;
        throw new Error(
          `${rateLimitError.message}. Đã dùng: ${rateLimitError.currentUsage}/${rateLimitError.limit}. Reset: ${new Date(rateLimitError.resetDate).toLocaleString('vi-VN')}`
        );
      }

      // Handle unauthorized error (401)
      if (response.status === 401) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục sử dụng AriX Pro");
      }

      // Handle bad gateway (502)
      if (response.status === 502) {
        throw new Error("AriX API không phản hồi. Vui lòng thử lại sau");
      }

      // Generic error
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  /**
   * Send a chat message to AriX Pro API
   */
  async chat(request: AriXProChatRequest): Promise<AriXProResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          message: request.message,
          model: request.model || "gpt-5-chat-latest",
        }),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current API usage for the authenticated user
   */
  async getUsage(): Promise<UsageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/usage`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data: UsageResponse = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get usage statistics for the authenticated user
   * @param days Number of days to retrieve stats for (default: 7)
   */
  async getStats(days: number = 7): Promise<StatsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/stats?days=${days}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data: StatsResponse = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Health check for AriX Pro API
   */
  async healthCheck(): Promise<string> {
    try {
      const response = await fetch(this.baseUrl.replace("/api", "/api"), {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set custom API URL
   */
  setApiUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Reset session
   */
  resetSession() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Get current session ID
   */
  getSessionId() {
    return this.sessionId;
  }
}

export const ariXProService = new AriXProService();

