import axios, { type AxiosResponse } from "axios";
import {
  type CreatePaymentRequest,
  type CreatePaymentResponse,
  type Payment,
  type PaymentWithSubscription,
  type PaymentStatusResponse,
  PaymentError,
  CreatePaymentResponseSchema,
  PaymentSchema,
  PaymentWithSubscriptionSchema,
  PaymentStatusResponseSchema,
} from "@/types/payment";

const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api";

// Create axios instance for payment
const paymentHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
paymentHttp.interceptors.request.use(
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
paymentHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || "Có lỗi xảy ra";
      throw new PaymentError(
        message,
        error.response.status,
        error.response.data?.code
      );
    }
    throw new PaymentError("Không thể kết nối đến máy chủ");
  }
);

export class PaymentService {
  /**
   * Create a new payment for subscription package
   */
  static async createPayment(
    data: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    const response: AxiosResponse<CreatePaymentResponse> =
      await paymentHttp.post("/payments/create", data);

    // Validate response with schema
    return CreatePaymentResponseSchema.parse(response.data);
  }

  /**
   * Get payment by ID
   */
  static async getPaymentById(paymentId: string): Promise<PaymentWithSubscription> {
    const response: AxiosResponse<PaymentWithSubscription> =
      await paymentHttp.get(`/payments/${paymentId}`);

    return PaymentWithSubscriptionSchema.parse(response.data);
  }

  /**
   * Get user's payment history
   */
  static async getMyPayments(): Promise<PaymentWithSubscription[]> {
    const response: AxiosResponse<PaymentWithSubscription[]> =
      await paymentHttp.get("/payments/my-payments");

    return response.data.map((payment) =>
      PaymentWithSubscriptionSchema.parse(payment)
    );
  }

  /**
   * Check payment status by order code
   */
  static async checkPaymentStatus(
    orderCode: number
  ): Promise<PaymentStatusResponse> {
    const response: AxiosResponse<PaymentStatusResponse> =
      await paymentHttp.get(`/payments/check-status/${orderCode}`);

    return PaymentStatusResponseSchema.parse(response.data);
  }

  /**
   * Cancel a pending payment
   */
  static async cancelPayment(paymentId: string): Promise<Payment> {
    const response: AxiosResponse<Payment> = await paymentHttp.put(
      `/payments/${paymentId}/cancel`
    );

    return PaymentSchema.parse(response.data);
  }

  /**
   * Get payment link URL for checkout
   */
  static getCheckoutUrl(checkoutUrl: string): string {
    return checkoutUrl;
  }

  /**
   * Handle payment redirect (after PayOS checkout)
   */
  static parsePaymentResult(
    searchParams: URLSearchParams
  ): {
    orderCode: number | null;
    status: string | null;
  } {
    const orderCode = searchParams.get("orderCode");
    const status = searchParams.get("status");

    return {
      orderCode: orderCode ? parseInt(orderCode, 10) : null,
      status,
    };
  }
}

export default PaymentService;
