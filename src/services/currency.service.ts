import { hexarateResponseSchema } from "@/lib/schemas/currency.schema";
import type { ExchangeRateResponse } from "@/types/currency";

const HEXARATE_API_BASE = "https://hexarate.paikama.co/api/rates/latest";

export const currencyService = {
  /**
   * Get exchange rate using Hexarate API
   * @param base - Base currency code (e.g., "USD")
   * @param target - Target currency code (e.g., "VND")
   */
  async getExchangeRate(base: string, target: string): Promise<ExchangeRateResponse> {
    try {
      const response = await fetch(`${HEXARATE_API_BASE}/${base}?target=${target}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Exchange rate request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return hexarateResponseSchema.parse(data);
    } catch (error) {
      console.error("Currency exchange rate error:", error);
      throw error;
    }
  },

  /**
   * Convert amount from one currency to another
   * @param amount - Amount to convert
   * @param base - Base currency code
   * @param target - Target currency code
   */
  async convertCurrency(amount: number, base: string, target: string): Promise<{
    convertedAmount: number;
    rate: number;
    timestamp: string;
  }> {
    const rateData = await this.getExchangeRate(base, target);
    
    return {
      convertedAmount: amount * rateData.data.mid,
      rate: rateData.data.mid,
      timestamp: rateData.data.timestamp,
    };
  },
};

