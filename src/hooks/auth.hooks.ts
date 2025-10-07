import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"; // You might want to install this or use your preferred toast library
import { useAuth } from "@/contexts/auth-context";
import { AuthService } from "@/services/auth.service";
import {
  type LoginRequest,
  type RegisterRequest,
  type UpdateProfileRequest,
  type ChangePasswordRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type PhoneVerificationRequest,
  type PhoneConfirmationRequest,
  AuthError,
} from "@/types/auth";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
  user: (id: string) => [...authKeys.all, "user", id] as const,
} as const;

// Login mutation
export function useLogin() {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  return useMutation({
    mutationFn: async ({ credentials, rememberMe = false }: {
      credentials: LoginRequest;
      rememberMe?: boolean;
    }) => {
      await contextLogin(credentials, rememberMe);
    },
    onSuccess: () => {
      navigate("/");
    },
    onError: (error: AuthError) => {
    },
  });
}

// Register mutation
export function useRegister() {
  const navigate = useNavigate();
  const { register: contextRegister } = useAuth();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      await contextRegister(data);
    },
    onSuccess: () => {
      navigate("/login?message=registration-success");
    },
    onError: (error: AuthError) => {
    },
  });
}

// Logout mutation
export function useLogout() {
  const navigate = useNavigate();
  const { logout: contextLogout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await contextLogout();
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      navigate("/login");
    },
    onError: (error: AuthError) => {
      // Even if logout fails on server, clear local state
      queryClient.clear();
      navigate("/login");
    },
  });
}

// Profile query
export function useProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => AuthService.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error instanceof AuthError && error.statusCode === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateProfile: contextUpdateProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      await contextUpdateProfile(data);
    },
    onSuccess: () => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
    onError: (error: AuthError) => {
    },
  });
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      AuthService.changePassword(data),
    onError: (error: AuthError) => {
    },
  });
}

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      AuthService.forgotPassword(data),
    onError: (error: AuthError) => {
    },
  });
}

// Reset password mutation
export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) =>
      AuthService.resetPassword(data),
    onSuccess: () => {
      navigate("/login?message=password-reset-success");
    },
    onError: (error: AuthError) => {
    },
  });
}

// Phone verification mutation
export function usePhoneVerification() {
  return useMutation({
    mutationFn: (data: PhoneVerificationRequest) =>
      AuthService.sendPhoneVerification(data),
    onError: (error: AuthError) => {
    },
  });
}

// Phone confirmation mutation
export function usePhoneConfirmation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PhoneConfirmationRequest) =>
      AuthService.confirmPhoneVerification(data),
    onSuccess: () => {
      // Refresh profile to get updated phone verification status
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
    onError: (error: AuthError) => {
    },
  });
}

// Email verification mutation
export function useEmailVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => AuthService.verifyEmail(token),
    onSuccess: () => {
      // Refresh profile to get updated email verification status
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
    onError: (error: AuthError) => {
    },
  });
}

// Resend email verification mutation
export function useResendEmailVerification() {
  return useMutation({
    mutationFn: (email: string) => AuthService.resendEmailVerification(email),
    onError: (error: AuthError) => {
    },
  });
}

// Custom hook for authentication status with real-time updates
export function useAuthStatus() {
  const auth = useAuth();

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    hasRole: (role: string) => auth.user?.role === role,
    hasAnyRole: (roles: string[]) => auth.user ? roles.includes(auth.user.role) : false,
    isAdmin: auth.user?.role === "admin",
    isMember: auth.user?.role === "member",
  };
}

// Hook to handle authentication errors globally
export function useAuthErrorHandler() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = async (error: AuthError) => {
    if (error.statusCode === 401) {
      // Unauthorized - redirect to login
      await logout();
      navigate("/login?message=session-expired");
    } else if (error.statusCode === 403) {
      // Forbidden - stay on current page but show error
      navigate("/403");
    } else {
      // Other errors - log and continue
    }
  };

  return { handleAuthError };
}

// Hook for form validation with auth schemas
export function useAuthValidation() {
  const validateLogin = (data: Partial<LoginRequest>) => {
    try {
      // You can use the Zod schemas from types/auth.ts here
      return { isValid: true, errors: {} };
    } catch (error) {
      return { isValid: false, errors: {} };
    }
  };

  const validateRegister = (data: Partial<RegisterRequest>) => {
    try {
      // You can use the Zod schemas from types/auth.ts here
      return { isValid: true, errors: {} };
    } catch (error) {
      return { isValid: false, errors: {} };
    }
  };

  return {
    validateLogin,
    validateRegister,
  };
}

// Hook for automatic token refresh
export function useTokenRefresh() {
  const { refreshToken } = useAuth();

  return useMutation({
    mutationFn: () => refreshToken(),
    onError: (error: AuthError) => {
    },
  });
}