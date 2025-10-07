import { createHttp } from "@/lib/http";
import { tickerDetail } from "@/lib/schemas";

const DcsFinboxApi = createHttp({
  baseURL: "https://dcs.finbox.vn/v1",
});

/**
 * Get ticker detail with historical data
 * @param ticker - Stock ticker symbol (e.g., "VIC")
 * @param day - Number of days back (default: 0 for current)
 * @returns Parsed ticker detail response
 */
export async function getTickerDetail(params: {
  ticker: string;
  day?: number;
}): Promise<tickerDetail.GetTickerDetailResponse> {
  const requestBody = tickerDetail.GetTickerDetailRequestSchema.parse({
    ticker: params.ticker.toUpperCase(),
    day: params.day ?? 0,
  });

  const { data } = await DcsFinboxApi.post<tickerDetail.GetTickerDetailRawResponse>(
    "/getTickerDetail",
    requestBody
  );

  // Validate raw response
  const rawResponse = tickerDetail.GetTickerDetailRawResponseSchema.parse(data);

  // Parse JSON strings
  let tickerData: tickerDetail.TickerData;
  let tendays: tickerDetail.TenDaysItem[];

  try {
    tickerData = tickerDetail.TickerDataSchema.parse(JSON.parse(rawResponse.tickerData));
  } catch (error) {
    throw new Error("Invalid tickerData format");
  }

  try {
    tendays = z.array(tickerDetail.TenDaysItemSchema).parse(JSON.parse(rawResponse.tendays));
  } catch (error) {
    throw new Error("Invalid tendays format");
  }

  return {
    tickerData,
    tendays,
  };
}

// Helper function to format date from YYYYMMDD to readable format
export function formatTickerDate(date: number): string {
  const dateStr = date.toString();
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${day}/${month}/${year}`;
}

// Helper function to format price change percentage
export function formatPricePercent(percent: number): string {
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${(percent * 100).toFixed(2)}%`;
}

// Helper function to get trend color
export function getTrendColor(percent: number): string {
  if (percent > 0) return "text-green-600 dark:text-green-400";
  if (percent < 0) return "text-red-600 dark:text-red-400";
  return "text-gray-600 dark:text-gray-400";
}

// Helper to get rating color
export function getRatingColor(rating: string): string {
  const ratingColors: Record<string, string> = {
    A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    C: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    D: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    F: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const firstLetter = rating.charAt(0).toUpperCase();
  return ratingColors[firstLetter] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
}

// Import z for array parsing
import { z } from "zod";

