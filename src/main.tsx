import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/query-client'
import { AuthProvider } from '@/contexts/auth-context'
import '@fontsource/manrope/200.css'
import '@fontsource/manrope/300.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/manrope/800.css'
import './index.css'

// Layouts and main pages
import Root from './root'
import Dashboard from './pages/dashboard'
import NotFound from './pages/not-found'
import NewsPage from './pages/news'
import NewsDetailPage from './pages/news-detail'
import TopicNewsPage from './pages/topic-news'
import ScreeningPage from './pages/screening'
import PersonalPage from './pages/personal'
import StockDetailPage from './pages/stock-detail'
import VirtualTradingLeaderboard from './pages/virtual-trading-leaderboard'
import VirtualTradingPage from './pages/virtual-trading'
import PremiumUpgradePage from './pages/premium'
import PaymentSuccessPage from './pages/payment-success'
import ReferralPage from './pages/referral'
import PartnerPolicyPage from './pages/partner-policy'
import AdminCommissionPage from './pages/admin-commission'
import AdminUsersPage from './pages/admin-users'
import WatchlistPage from './pages/watchlist-page'
import AriXProPage from './pages/arix-pro'
import ApiExtensionsPage from './pages/api-extensions'
// Authentication pages
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import SettingsPage from './pages/settings'
import VerificationPage from './pages/verification'
import ForgotPasswordPage from './pages/forgot-password'
import ForbiddenPage from './pages/403'

// Protected route wrapper
import { ProtectedRoute } from './components/auth/protected-route'
import { TradingViewChart } from './pages/tradingview'
import XGBoostDashboard from './components/xgboost'
import FibonacciPage from './pages/fibonacci'

const router = createBrowserRouter([
  // Authentication routes (public)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/verification",
    element: <VerificationPage />,
  },
  {
    path: "/403",
    element: <ForbiddenPage />,
  },
  // Main application routes (now publicly accessible)
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "bieu-do-ky-thuat",
        element: <TradingViewChart />,
      },
      {
        path: "cong-cu/fibonacci",
        element: <FibonacciPage />,
      },
      {
        path: "theo-doi",
        element: <WatchlistPage />,
      },
      {
        path: "arix-pro",
        element: (
          <ProtectedRoute>
            <AriXProPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "tin-tuc",
        element: <NewsPage />,
      },
      {
        path: "tin-tuc/danh-muc/:key",
        element: <TopicNewsPage />,
      },
      {
        path: "tin-tuc/:slug",
        element: <NewsDetailPage />,
      },
      {
        path: "ca-nhan",
        element: (
          <ProtectedRoute>
            <PersonalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "bo-loc",
        element: <ScreeningPage />,
      },
      {
        path: "du-bao",
        element: (
          <ProtectedRoute>  
            <XGBoostDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "co-phieu/:symbol",
        element: <StockDetailPage />,
      },
      {
        path: "virtual-trading",
        element: (
          <ProtectedRoute>
            <VirtualTradingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "virtual-trading/leaderboard",
        element: (
          <ProtectedRoute>
            <VirtualTradingLeaderboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "premium",
        element: (
          <ProtectedRoute>
            <PremiumUpgradePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "api-extensions",
        element: (
          <ProtectedRoute>
            <ApiExtensionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment/success",
        element: (
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "referral",
        element: (
          <ProtectedRoute>
            <ReferralPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "partner-policy",
        element: <PartnerPolicyPage />,
      },
      {
        path: "admin/commission",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminCommissionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
