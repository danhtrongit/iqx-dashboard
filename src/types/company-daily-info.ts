// Company daily info types from IQ Insight Service API

export interface ForeignNetEntry {
  tradingDate: string // ISO 8601 datetime string
  foreignNet: number // Foreign net investment amount (can be in scientific notation)
}

export interface CompanyDailyInfoData {
  data: ForeignNetEntry[]
}

export interface CompanyDailyInfoResponse {
  serverDateTime: string
  status: number
  code: number
  msg: string
  exception: null | unknown
  successful: boolean
  data: ForeignNetEntry[]
}

// API Request types
export interface GetCompanyDailyInfoRequest {
  ticker: string
}

// Error types
export class CompanyDailyInfoError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[]
  ) {
    super(message)
    this.name = 'CompanyDailyInfoError'
  }
}

// Query keys for React Query
export const COMPANY_DAILY_INFO_QUERY_KEYS = {
  all: ['company-daily-info'] as const,
  detail: (ticker: string) => [...COMPANY_DAILY_INFO_QUERY_KEYS.all, ticker] as const,
} as const

// Utility types
export interface ForeignNetDisplayData {
  ticker: string
  data: Array<{
    date: string
    value: number
    formattedValue: string
    color: 'positive' | 'negative' | 'neutral'
  }>
}

// Chart data types for displaying foreign net data
export interface ForeignNetChartData {
  ticker: string
  title: string
  data: Array<{
    date: string
    value: number
    label?: string
    color?: string
  }>
  period: {
    start: string
    end: string
  }
  totalInflow: number
  totalOutflow: number
  netChange: number
}