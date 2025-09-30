import axios, { type AxiosResponse } from "axios";
import {
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
  type RefreshTokenRequest,
  type RefreshTokenResponse,
  type UpdateProfileRequest,
  type ChangePasswordRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type PhoneVerificationRequest,
  type PhoneConfirmationRequest,
  type SuccessResponse,
  type User,
  AuthError,
  type TokenStorage,
} from "@/types/auth";

const API_BASE_URL = import.meta.env.VITE_BASE_API || "http://localhost:3000/api";

// Create axios instance for auth
const authHttp = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";
  private static readonly USER_KEY = "user";

  static getToken(): string | null {
    return (
      localStorage.getItem(this.ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(this.ACCESS_TOKEN_KEY)
    );
  }

  static setToken(token: string, storage: TokenStorage = "localStorage"): void {
    if (storage === "localStorage") {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    } else {
      sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    }
  }

  static removeToken(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return (
      localStorage.getItem(this.REFRESH_TOKEN_KEY) ||
      sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
    );
  }

  static setRefreshToken(token: string, storage: TokenStorage = "localStorage"): void {
    if (storage === "localStorage") {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    } else {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  static removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static getUser(): User | null {
    const userJson =
      localStorage.getItem(this.USER_KEY) ||
      sessionStorage.getItem(this.USER_KEY);

    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error("Failed to parse user JSON:", error);
      return null;
    }
  }

  static setUser(user: User, storage: TokenStorage = "localStorage"): void {
    const userJson = JSON.stringify(user);

    if (storage === "localStorage") {
      localStorage.setItem(this.USER_KEY, userJson);
      sessionStorage.removeItem(this.USER_KEY);
    } else {
      sessionStorage.setItem(this.USER_KEY, userJson);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  static clear(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
  }

  static isTokenExpired(token: string): boolean {
    try {
      if (!token || typeof token !== 'string') {
        return true;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp || typeof payload.exp !== 'number') {
        return true;
      }

      const currentTime = Date.now() / 1000;
      // Add a 30-second buffer to account for network delays
      return payload.exp < (currentTime + 30);
    } catch (error) {
      console.error('Token validation error:', error);
      return true;
    }
  }
}

// Request interceptor to add auth token
authHttp.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      // Only add Authorization header if token is not expired
      if (!TokenManager.isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('Token expired, not adding to request headers');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
authHttp.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration, but not for auth endpoints
    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/register') &&
        !originalRequest.url?.includes('/auth/refresh')) {

      originalRequest._retry = true;

      try {
        await AuthService.refreshToken();
        const token = TokenManager.getToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return authHttp(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens but don't redirect if we're on login page
        TokenManager.clear();

        // Only redirect if not already on login/register pages
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') &&
            !currentPath.includes('/register') &&
            !currentPath.includes('/forgot-password')) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Convert axios error to AuthError
    const message = error.response?.data?.message || error.message || "Có lỗi xảy ra";
    const statusCode = error.response?.status;
    const errors = Array.isArray(error.response?.data?.message)
      ? error.response.data.message
      : undefined;

    throw new AuthError(message, statusCode, errors);
  }
);

export class AuthService {
  // Authentication methods
  static async login(credentials: LoginRequest, rememberMe = false): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await authHttp.post(
        "/auth/login",
        credentials
      );

      const { accessToken, refreshToken, user } = response.data;
      // Always use localStorage by default for better UX - user stays logged in across tabs
      // Only use sessionStorage if explicitly requested (rememberMe = false and user wants session-only)
      const storage: TokenStorage = "localStorage";

      TokenManager.setToken(accessToken, storage);
      TokenManager.setRefreshToken(refreshToken, storage);
      TokenManager.setUser(user, storage);

      return response.data;
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError("Đăng nhập thất bại");
    }
  }

  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response: AxiosResponse<RegisterResponse> = await authHttp.post(
        "/auth/register",
        data
      );
      return response.data;
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError("Đăng ký thất bại");
    }
  }

  static async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate server-side session
      await authHttp.post("/auth/logout");
    } catch (error) {
      // Continue with local logout even if server call fails
      console.warn("Server logout failed:", error);
    } finally {
      TokenManager.clear();
    }
  }

  static async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new AuthError("Không có refresh token");
      }

      // Create a separate axios instance for refresh to avoid interceptor loops
      const refreshHttp = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response: AxiosResponse<RefreshTokenResponse> = await refreshHttp.post(
        "/auth/refresh",
        { refreshToken: refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken, user } = response.data;
      const currentStorage = localStorage.getItem(TokenManager["ACCESS_TOKEN_KEY"])
        ? "localStorage"
        : "sessionStorage";

      TokenManager.setToken(accessToken, currentStorage);
      TokenManager.setRefreshToken(newRefreshToken, currentStorage);
      TokenManager.setUser(user, currentStorage);

      return response.data;
    } catch (error) {
      console.error('Refresh token failed:', error);
      TokenManager.clear();
      throw error instanceof AuthError ? error : new AuthError("Làm mới token thất bại");
    }
  }

  // Profile management
  static async getProfile(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await authHttp.get("/auth/profile");

      // Update stored user data
      const currentStorage = localStorage.getItem(TokenManager["USER_KEY"])
        ? "localStorage"
        : "sessionStorage";
      TokenManager.setUser(response.data, currentStorage);

      return response.data;
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError("Lấy thông tin thất bại");
    }
  }

  static async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      const response: AxiosResponse<User> = await authHttp.patch("/auth/profile", data);

      // Update stored user data
      const currentStorage = localStorage.getItem(TokenManager["USER_KEY"])
        ? "localStorage"
        : "sessionStorage";
      TokenManager.setUser(response.data, currentStorage);

      return response.data;
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError("Cập nhật thông tin thất bại");
    }
  }

  static async changePassword(data: ChangePasswordRequest): Promise<SuccessResponse> {
    try {
      const response: AxiosResponse<SuccessResponse> = await authHttp.post(
        "/auth/change-password",
        data
      );
      return response.data;
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError("Đổi mật khẩu thất bại");
    }
  }

  // Password reset
  static async forgotPassword(data: ForgotPasswordRequest): Promise<SuccessResponse> {
    try {
      const response: AxiosResponse<SuccessResponse> = await authHttp.post(
        "/auth/forgot-password",
        data
      );
      return response.data;
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError("Gửi email thất bại");
    }
  }

  static async resetPassword(data: ResetPasswordRequest): Promise<SuccessResponse> {
    try {
      const response: AxiosResponse<SuccessResponse> = await authHttp.post(
        "/auth/reset-password",
        data
      );
      return response.data;
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError("Đặt lại mật khẩu thất bại");
    }
  }

  // Phone verification
  static async sendPhoneVerification(
    data: PhoneVerificationRequest
  ): Promise<SuccessResponse> {
    try {
      const response: AxiosResponse<SuccessResponse> = await authHttp.post(
        "/auth/phone/verify",
        data
      );
      return response.data;
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError("Gửi mã xác thực thất bại");
    }
  }

  static async confirmPhoneVerification(
    data: PhoneConfirmationRequest
  ): Promise<SuccessResponse> {
    try {
      const response: AxiosResponse<SuccessResponse> = await authHttp.post(
        "/auth/phone/confirm",
        data
      );
      return response.data;
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError("Xác thực số điện thoại thất bại");
    }
  }

  // Email verification
  static async resendEmailVerification(email: string): Promise<SuccessResponse> {
    try {
      const response: AxiosResponse<SuccessResponse> = await authHttp.post(
        "/auth/resend-email-verification",
        { email }
      );
      return response.data;
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError("Gửi lại email thất bại");
    }
  }

  static async verifyEmail(token: string): Promise<SuccessResponse> {
    try {
      const response: AxiosResponse<SuccessResponse> = await authHttp.get(
        `/auth/verify-email?token=${token}`
      );
      return response.data;
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError("Xác thực email thất bại");
    }
  }

  // Utility methods
  static isAuthenticated(): boolean {
    const token = TokenManager.getToken();
    return token !== null && !TokenManager.isTokenExpired(token);
  }

  static getCurrentUser(): User | null {
    return TokenManager.getUser();
  }

  static hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  static hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }
}

export default AuthService;