import { priceActionResponseSchema } from "@/lib/schemas/price-action.schema";
import type { PriceActionResponse, PriceActionItem, PriceActionStats } from "@/types/price-action";
import { TokenManager } from "./auth.service";

class PriceActionService {
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

      if (response.status === 401) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục sử dụng Price Action");
      }

      if (response.status === 502) {
        throw new Error("Price Action API không phản hồi. Vui lòng thử lại sau");
      }

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
   * Get all price action data
   */
  async getPriceActionData(): Promise<PriceActionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/price-action`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      
      try {
        return priceActionResponseSchema.parse(data);
      } catch (zodError) {
        console.warn("Price Action schema validation failed, using raw data:", zodError);
        return data;
      }
    } catch (error) {
      console.error("Price Action service error:", error);
      throw error;
    }
  }

  /**
   * Calculate statistics from price action data
   */
  calculateStats(items: PriceActionItem[]): PriceActionStats {
    if (items.length === 0) {
      return {
        totalStocks: 0,
        positiveChange1D: 0,
        negativeChange1D: 0,
        avgChange1D: 0,
        avgChange7D: 0,
        avgChange30D: 0,
        highestGainer1D: null,
        highestLoser1D: null,
      };
    }

    const positiveChange1D = items.filter((item) => item.change1D > 0).length;
    const negativeChange1D = items.filter((item) => item.change1D < 0).length;

    const avgChange1D =
      items.reduce((sum, item) => sum + item.change1D, 0) / items.length;
    const avgChange7D =
      items.reduce((sum, item) => sum + item.change7D, 0) / items.length;
    const avgChange30D =
      items.reduce((sum, item) => sum + item.change30D, 0) / items.length;

    const sortedBy1D = [...items].sort((a, b) => b.change1D - a.change1D);
    const highestGainer1D = sortedBy1D[0] || null;
    const highestLoser1D = sortedBy1D[sortedBy1D.length - 1] || null;

    return {
      totalStocks: items.length,
      positiveChange1D,
      negativeChange1D,
      avgChange1D,
      avgChange7D,
      avgChange30D,
      highestGainer1D,
      highestLoser1D,
    };
  }

  /**
   * Filter price action data
   */
  filterData(
    items: PriceActionItem[],
    filters: {
      minChange1D?: number;
      maxChange1D?: number;
      minVolume?: number;
      ticker?: string;
    }
  ): PriceActionItem[] {
    let filtered = [...items];

    if (filters.minChange1D !== undefined) {
      filtered = filtered.filter((item) => item.change1D >= filters.minChange1D!);
    }

    if (filters.maxChange1D !== undefined) {
      filtered = filtered.filter((item) => item.change1D <= filters.maxChange1D!);
    }

    if (filters.minVolume !== undefined) {
      filtered = filtered.filter((item) => item.volume >= filters.minVolume!);
    }

    if (filters.ticker) {
      const searchTerm = filters.ticker.toUpperCase();
      filtered = filtered.filter((item) =>
        item.ticker.toUpperCase().includes(searchTerm)
      );
    }

    return filtered;
  }

  /**
   * Sort price action data
   */
  sortData(
    items: PriceActionItem[],
    sortBy: keyof PriceActionItem,
    order: "asc" | "desc" = "desc"
  ): PriceActionItem[] {
    return [...items].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }

  /**
   * Set custom API URL
   */
  setApiUrl(url: string) {
    this.baseUrl = url;
  }
}

export const priceActionService = new PriceActionService();
