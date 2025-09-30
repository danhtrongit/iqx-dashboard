import React, { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import {
  type AuthState,
  type AuthContextType,
  type User,
  type LoginRequest,
  type RegisterRequest,
  type UpdateProfileRequest,
} from "@/types/auth";
import { AuthService, TokenManager } from "@/services/auth.service";

// Action types for reducer
type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_TOKEN"; payload: string | null }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: User };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
      };

    case "SET_TOKEN":
      return {
        ...state,
        token: action.payload,
      };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Props type for provider
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load - removed hasInitialized dependency
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const token = TokenManager.getToken();
        const refreshToken = TokenManager.getRefreshToken();
        const user = TokenManager.getUser();

        // If no token, refresh token, or user, logout
        if (!token || !refreshToken || !user) {
          dispatch({ type: "LOGOUT" });
          return;
        }

        // Check if token is expired
        const isExpired = TokenManager.isTokenExpired(token);

        if (isExpired) {
          // Try to refresh token
          try {
            const response = await AuthService.refreshToken();

            dispatch({
              type: "LOGIN_SUCCESS",
              payload: {
                user: response.user,
                token: response.accessToken
              },
            });
          } catch (refreshError) {
            // Refresh failed, clear stored data and logout
            TokenManager.clear();
            dispatch({ type: "LOGOUT" });
          }
        } else {
          dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear potentially corrupted data
        TokenManager.clear();
        dispatch({ type: "LOGOUT" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - runs once per component mount

  // Listen for storage changes to sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Handle token changes
      if (event.key === "access_token") {
        if (!event.newValue) {
          // Token removed - logout
          dispatch({ type: "LOGOUT" });
        } else {
          // Token added/changed - restore auth state
          const user = TokenManager.getUser();
          if (user && !TokenManager.isTokenExpired(event.newValue)) {
            dispatch({
              type: "LOGIN_SUCCESS",
              payload: { user, token: event.newValue }
            });
          }
        }
      }

      // Handle user changes
      if (event.key === "user") {
        if (!event.newValue) {
          dispatch({ type: "LOGOUT" });
        } else {
          try {
            const user = JSON.parse(event.newValue);
            const token = TokenManager.getToken();
            if (token && !TokenManager.isTokenExpired(token)) {
              dispatch({ type: "UPDATE_USER", payload: user });
            }
          } catch (error) {
            console.error("Failed to parse user from storage change:", error);
          }
        }
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!state.token || !state.isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        // Refresh token 5 minutes before expiration
        const token = TokenManager.getToken();
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;
          const timeUntilExpiry = payload.exp - currentTime;

          // Refresh if less than 5 minutes until expiry
          if (timeUntilExpiry < 300) {
            await AuthService.refreshToken();
            const newToken = TokenManager.getToken();
            const newUser = TokenManager.getUser();

            if (newToken && newUser) {
              dispatch({ type: "SET_TOKEN", payload: newToken });
              dispatch({ type: "UPDATE_USER", payload: newUser });
            }
          }
        }
      } catch (error) {
        console.error("Token refresh error:", error);
        // Don't logout on refresh error, let it handle naturally
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [state.token, state.isAuthenticated]);

  // Login function
  const login = async (credentials: LoginRequest, rememberMe = false): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await AuthService.login(credentials, rememberMe);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.user,
          token: response.accessToken,
        },
      });
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await AuthService.register(data);
    } catch (error) {
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await AuthService.refreshToken();
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.user,
          token: response.accessToken,
        },
      });
    } catch (error) {
      dispatch({ type: "LOGOUT" });
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (data: UpdateProfileRequest): Promise<void> => {
    try {
      const updatedUser = await AuthService.updateProfile(data);
      dispatch({ type: "UPDATE_USER", payload: updatedUser });
    } catch (error) {
      throw error;
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

// Hook to check if user has specific role
export function useHasRole(role: string): boolean {
  const { user } = useAuth();
  return user?.role === role;
}

// Hook to check if user has any of the specified roles
export function useHasAnyRole(roles: string[]): boolean {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
}

// Hook to require authentication
export function useRequireAuth(): AuthContextType {
  const auth = useAuth();
  const navigate = React.useCallback(
    () => (window.location.href = "/login"),
    []
  );

  React.useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate();
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

  return auth;
}

export default AuthContext;