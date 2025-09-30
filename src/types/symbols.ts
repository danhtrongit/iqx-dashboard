// Symbols API Types based on API_SYMBOLS_DOCUMENTATION.md

export type SymbolType = 'STOCK' | 'BOND' | 'FU'
export type BoardType = 'HSX' | 'HNX' | 'UPCOM'

// Core entities
export interface Symbol {
  id: number
  symbol: string
  type: SymbolType
  board: BoardType
  en_organ_name?: string
  organ_short_name?: string
  organ_name?: string
  product_grp_id?: string
  created_at: string
  updated_at: string
}

export interface SymbolWithPrice extends Symbol {
  currentPrice: number
  openPrice?: number
  highPrice?: number
  lowPrice?: number
  volume?: number
  percentageChange?: number
  previousClosePrice?: number
  priceUpdatedAt: string
}

// API Request types
export interface GetSymbolsRequest {
  page?: number
  limit?: number
  search?: string
  symbol?: string
  type?: SymbolType
  board?: BoardType
  includePrices?: boolean
}

export interface GetAllSymbolsRequest {
  search?: string
  symbol?: string
  type?: SymbolType
  board?: BoardType
  includePrices?: boolean
}

// API Response types
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface GetSymbolsResponse {
  data: (Symbol | SymbolWithPrice)[]
  meta: PaginationMeta
  message: string
}

export interface GetAllSymbolsResponse {
  data: (Symbol | SymbolWithPrice)[]
  count: number
  message: string
}

export interface GetSymbolResponse {
  data: Symbol | SymbolWithPrice | null
  message: string
}

export interface GetSymbolCountResponse {
  count: number
  message: string
}

export interface SyncSymbolsResponse {
  message: string
}

// Query key types for React Query
export const SYMBOLS_QUERY_KEYS = {
  all: ['symbols'] as const,
  lists: () => [...SYMBOLS_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetSymbolsRequest) => [...SYMBOLS_QUERY_KEYS.lists(), params] as const,
  allSymbols: (params: GetAllSymbolsRequest) => [...SYMBOLS_QUERY_KEYS.all, 'all', params] as const,
  detail: (symbol: string) => [...SYMBOLS_QUERY_KEYS.all, 'detail', symbol] as const,
  count: () => [...SYMBOLS_QUERY_KEYS.all, 'count'] as const,
} as const

// UI specific types for the page
export interface SymbolsPageFilters {
  search?: string
  type?: SymbolType
  board?: BoardType
  includePrices: boolean
}

export interface SymbolsTableColumn {
  key: keyof (Symbol | SymbolWithPrice)
  label: string
  sortable?: boolean
  render?: (value: unknown, item: Symbol | SymbolWithPrice) => React.ReactNode
}

// Popular Vietnamese stocks for quick access
export const POPULAR_STOCKS = [
  { symbol: 'VIC', name: 'Tập đoàn Vingroup', board: 'HSX' },
  { symbol: 'VCB', name: 'Ngân hàng Vietcombank', board: 'HSX' },
  { symbol: 'FPT', name: 'Tập đoàn FPT', board: 'HSX' },
  { symbol: 'VNM', name: 'Vinamilk', board: 'HSX' },
  { symbol: 'MSN', name: 'Tập đoàn Masan', board: 'HSX' },
  { symbol: 'VHM', name: 'Vinhomes', board: 'HSX' },
  { symbol: 'GAS', name: 'PetroVietnam Gas', board: 'HSX' },
  { symbol: 'CTG', name: 'VietinBank', board: 'HSX' },
  { symbol: 'BID', name: 'BIDV', board: 'HSX' },
  { symbol: 'VRE', name: 'Vincom Retail', board: 'HSX' },
] as const

// Error types
export class SymbolsError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[]
  ) {
    super(message)
    this.name = 'SymbolsError'
  }
}