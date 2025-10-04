import type {
  AriXProResponse,
  AriXProChatRequest,
} from "@/types/arix-pro";

class AriXProService {
  private baseUrl = "https://arix.iqx.vn/api";
  // private baseUrl = "http://localhost:5999/api";
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId() {
    return "arix_pro_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
  }

  /**
   * Send a chat message to AriX Pro API
   */
  async chat(request: AriXProChatRequest): Promise<AriXProResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: request.message,
          model: request.model || "gpt-5-chat-latest",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("AriX Pro chat error:", error);
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
      console.error("AriX Pro health check error:", error);
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

