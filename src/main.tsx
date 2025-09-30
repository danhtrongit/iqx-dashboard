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
import DanhMucCoPhieuPage from './pages/danh-muc-co-phieu'

// Authentication pages
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import SettingsPage from './pages/settings'
import VerificationPage from './pages/verification'
import ForgotPasswordPage from './pages/forgot-password'
import ForbiddenPage from './pages/403'

// Protected route wrapper
import { ProtectedRoute } from './components/auth/protected-route'
import {TradingViewChart} from './pages/tradingview'

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
  // Protected routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Root />
      </ProtectedRoute>
    ),
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
        element: <PersonalPage />,
      },
      {
        path: "bo-loc-co-phieu",
        element: <ScreeningPage />,
      },
      {
        path: "danh-muc-co-phieu",
        element: <DanhMucCoPhieuPage />,
      },
      {
        path: "co-phieu/:symbol",
        element: <StockDetailPage />,
      },
      {
        path: "virtual-trading",
        element: <VirtualTradingPage />,
      },
      {
        path: "virtual-trading/leaderboard",
        element: <VirtualTradingLeaderboard />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
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
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
            success: {
              iconTheme: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--primary-foreground))',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(var(--destructive))',
                secondary: 'hsl(var(--destructive-foreground))',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
