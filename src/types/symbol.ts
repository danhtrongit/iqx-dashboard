// Base symbol data types from API documentation
export type SymbolType = 'STOCK' | 'BOND' | 'FU'
export type BoardType = 'HSX' | 'HNX' | 'UPCOM'

export interface Symbol {
  id: number
  symbol: string
  type: SymbolType
  board: BoardType
  enOrganName?: string
  organShortName?: string
  organName?: string
  productGrpID?: string
  createdAt: Date
  updatedAt: Date
}

export interface SymbolWithPrice extends Symbol {
  currentPrice?: number | null
  openPrice?: number | null
  highPrice?: number | null
  lowPrice?: number | null
  volume?: number | null
  percentageChange?: number | null
  previousClosePrice?: number | null
  priceUpdatedAt?: string
}

// API Request types
export interface GetSymbolsRequest {
  symbol?: string
  type?: SymbolType
  board?: BoardType
  search?: string
  page?: number
  limit?: number
  includePrices?: boolean
}

export interface GetSymbolRequest {
  symbol: string
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
  data: SymbolWithPrice[]
  meta: PaginationMeta
  message: string
}

export interface GetAllSymbolsResponse {
  data: SymbolWithPrice[]
  count: number
  message: string
}

export interface GetSymbolResponse {
  data: SymbolWithPrice
  message: string
}

export interface GetSymbolCountResponse {
  count: number
  message: string
}

export interface SyncSymbolsResponse {
  message: string
}

// Search specific types
export interface SymbolSearchResult {
  id: number
  symbol: string
  type: SymbolType
  board: BoardType
  organName?: string
  organShortName?: string
  enOrganName?: string
}

export interface SymbolSearchResponse {
  data: SymbolSearchResult[]
  meta: PaginationMeta
  message: string
}

// Error types
export class SymbolError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[]
  ) {
    super(message)
    this.name = 'SymbolError'
  }
}

// Display helper types
export interface SymbolDisplayInfo {
  symbol: string
  displayName: string
  shortName?: string
  board: BoardType
  type: SymbolType
  boardColor: string
  typeColor: string
}

// Query key types for React Query
export const SYMBOL_QUERY_KEYS = {
  all: ['symbols'] as const,
  lists: () => [...SYMBOL_QUERY_KEYS.all, 'list'] as const,
  list: (filters: GetSymbolsRequest) => [...SYMBOL_QUERY_KEYS.lists(), filters] as const,
  details: () => [...SYMBOL_QUERY_KEYS.all, 'detail'] as const,
  detail: (symbol: string) => [...SYMBOL_QUERY_KEYS.details(), symbol] as const,
  search: (query: string) => [...SYMBOL_QUERY_KEYS.all, 'search', query] as const,
  count: () => [...SYMBOL_QUERY_KEYS.all, 'count'] as const,
} as const