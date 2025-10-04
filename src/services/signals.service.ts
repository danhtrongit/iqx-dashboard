import axios, { type AxiosResponse } from "axios";
import {
  type GetSignalsRequest,
  type GetSignalsResponse,
  GetSignalsResponseSchema,
} from "@/lib/schemas/signals";

const API_BASE_URL = import.meta.env.VITE_BASE_API2 || "http://localhost:3000/api";

// Create axios instance for signals API
const signalsHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for technical analysis
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if available
signalsHttp.interceptors.request.use(
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
signalsHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Có lỗi xảy ra khi lấy tín hiệu";
    const statusCode = error.response?.status;
    
    throw new SignalsError(message, statusCode);
  }
);

// Custom error class
export class SignalsError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "SignalsError";
  }
}

export class SignalsService {
  /**
   * Get signals for multiple symbols
   */
  static async getSignals(request: GetSignalsRequest): Promise<GetSignalsResponse> {
    try {
      const response: AxiosResponse<GetSignalsResponse> = await signalsHttp.post(
        "/signals",
        request
      );

      // Validate response with Zod schema
      const validatedData = GetSignalsResponseSchema.parse(response.data);
      
      return validatedData;
    } catch (error) {
      if (error instanceof SignalsError) {
        throw error;
      }
      
      // Handle Zod validation errors
      if (error instanceof Error && error.name === "ZodError") {
        throw new SignalsError("Dữ liệu tín hiệu không hợp lệ");
      }
      
      throw new SignalsError("Lấy tín hiệu thất bại");
    }
  }

  /**
   * Get signals for a single symbol
   */
  static async getSignalForSymbol(symbol: string): Promise<GetSignalsResponse> {
    return this.getSignals({ symbols: [symbol] });
  }
}

export default SignalsService;

