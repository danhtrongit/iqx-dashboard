import type {
  ApiExtensionPackage,
  PurchaseExtensionRequest,
  PurchaseExtensionResponse,
  MyExtensionsResponse,
  ExtensionHistoryResponse,
} from "@/types/api-extension";
import { TokenManager } from "./auth.service";

class ApiExtensionService {
  private baseUrl = import.meta.env.VITE_BASE_API || "http://localhost:3000/api";

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
      throw new Error(
        errorData.message || errorData.error || `HTTP error! status: ${response.status}`
      );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  /**
   * Get all available API extension packages (public endpoint)
   */
  async getAllPackages(): Promise<ApiExtensionPackage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api-extensions/packages`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific API extension package by ID (public endpoint)
   */
  async getPackageById(packageId: string): Promise<ApiExtensionPackage> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api-extensions/packages/${packageId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create payment for API extension package (requires auth)
   */
  async createExtensionPayment(
    extensionPackageId: string,
    returnUrl?: string,
    cancelUrl?: string
  ): Promise<any> {
    try {
      // Ensure we have valid absolute URLs
      const baseUrl = window.location.origin;
      const defaultReturnUrl = `${baseUrl}/payment/success`;
      const defaultCancelUrl = `${baseUrl}/payment/cancel`;
      
      // Get URLs from params or env vars or defaults
      const finalReturnUrl = returnUrl || 
        (import.meta.env.VITE_PAYOS_RETURN_URL && import.meta.env.VITE_PAYOS_RETURN_URL.trim() !== '' 
          ? import.meta.env.VITE_PAYOS_RETURN_URL 
          : defaultReturnUrl);
      
      const finalCancelUrl = cancelUrl || 
        (import.meta.env.VITE_PAYOS_CANCEL_URL && import.meta.env.VITE_PAYOS_CANCEL_URL.trim() !== '' 
          ? import.meta.env.VITE_PAYOS_CANCEL_URL 
          : defaultCancelUrl);

      // Validate URLs
      const isValidUrl = (urlString: string) => {
        try {
          const url = new URL(urlString);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (e) {
          return false;
        }
      };

      if (!isValidUrl(finalReturnUrl)) {
        throw new Error(`Invalid return URL: ${finalReturnUrl}. Must be an absolute URL with http:// or https://`);
      }

      if (!isValidUrl(finalCancelUrl)) {
        throw new Error(`Invalid cancel URL: ${finalCancelUrl}. Must be an absolute URL with http:// or https://`);
      }


      const response = await fetch(`${this.baseUrl}/api-extensions/payment/create`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          extensionPackageId,
          returnUrl: finalReturnUrl,
          cancelUrl: finalCancelUrl,
        }),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderCode: string | number): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api-extensions/payment/check/${orderCode}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current subscription's extensions (requires auth)
   */
  async getMyExtensions(): Promise<MyExtensionsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api-extensions/my-extensions`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get full purchase history (requires auth)
   */
  async getPurchaseHistory(): Promise<ExtensionHistoryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api-extensions/history`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Format price with currency
   */
  static formatPrice(price: number, currency: string = "VND"): string {
    if (currency === "VND") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
  }

  /**
   * Calculate price per call
   */
  static calculatePricePerCall(price: number, calls: number): number {
    return Math.round(price / calls);
  }
}

export const apiExtensionService = new ApiExtensionService();
export default ApiExtensionService;

