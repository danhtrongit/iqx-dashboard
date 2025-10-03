import { z } from "zod";

// User types
export const UserRole = z.enum(["admin", "member", "guest"]);
export type UserRole = z.infer<typeof UserRole>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  fullName: z.string().nullable(),
  phoneE164: z.string().nullable(),
  phoneVerifiedAt: z.string().nullable(),
  emailVerifiedAt: z.string().nullable().optional(),
  role: UserRole,
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Authentication request/response types
export const LoginRequestSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
  message: z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt"
    ),
  displayName: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự").optional(),
  fullName: z.string().max(255, "Họ tên không được quá 255 ký tự").optional(),
  referralCode: z.string().optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  message: z.string(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
  message: z.string(),
});

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

// Profile update types
export const UpdateProfileRequestSchema = z.object({
  displayName: z.string().min(2).optional(),
  fullName: z.string().max(255).optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

// Password change types
export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc"),
  newPassword: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt"
    ),
});

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

// Password reset types
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, "Token là bắt buộc"),
  newPassword: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt"
    ),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// Phone verification types
export const PhoneVerificationRequestSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, "Số điện thoại không hợp lệ"),
});

export type PhoneVerificationRequest = z.infer<typeof PhoneVerificationRequestSchema>;

export const PhoneConfirmationRequestSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, "Số điện thoại không hợp lệ"),
  otpCode: z.string().regex(/^\d{6}$/, "Mã OTP phải có 6 chữ số"),
});

export type PhoneConfirmationRequest = z.infer<typeof PhoneConfirmationRequestSchema>;

// Generic response types
export const SuccessResponseSchema = z.object({
  message: z.string(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

export const ErrorResponseSchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Authentication state types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
}

// Token storage types
export type TokenStorage = "localStorage" | "sessionStorage";

// API error type
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[]
  ) {
    super(message);
    this.name = "AuthError";
  }
}