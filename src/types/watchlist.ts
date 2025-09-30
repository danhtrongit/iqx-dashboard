// Watchlist data types based on backend API
export type SymbolType = 'STOCK' | 'BOND' | 'FU' | 'ETF' | 'CW'
export type BoardType = 'HOSE' | 'HNX' | 'UPCOM'

// Symbol information embedded in watchlist
export interface WatchlistSymbol {
  id: string
  symbol: string
  organName: string
  organShortName: string
  type: SymbolType
  board: BoardType
}

// Main watchlist item
export interface WatchlistItem {
  id: string
  userId: string
  symbolId: string
  symbol: WatchlistSymbol
  customName?: string
  notes?: string
  alertPriceHigh?: number
  alertPriceLow?: number
  isAlertEnabled: boolean
  createdAt: string
  updatedAt: string
}

// API Request types
export interface AddToWatchlistRequest {
  symbolCode: string
  customName?: string
  notes?: string
}

export interface UpdateWatchlistRequest {
  customName?: string
  notes?: string
  alertPriceHigh?: number
  alertPriceLow?: number
  isAlertEnabled?: boolean
}

export interface GetPopularStocksRequest {
  limit?: number
}

// API Response types
export interface GetWatchlistResponse {
  data: WatchlistItem[]
  count: number
  message: string
}

export interface GetWatchlistCountResponse {
  count: number
  message: string
}

export interface GetAlertsResponse {
  data: WatchlistItem[]
  count: number
  message: string
}

export interface PopularStock {
  symbol: WatchlistSymbol
  count: number
}

export interface GetPopularStocksResponse {
  data: PopularStock[]
  message: string
}

export interface CheckWatchlistResponse {
  isInWatchlist: boolean
  watchlistItem?: WatchlistItem
  message: string
}

export interface AddToWatchlistResponse {
  data: {
    id: string
    userId: string
    symbolId: string
    customName?: string
    notes?: string
    createdAt: string
  }
  message: string
}

export interface UpdateWatchlistResponse {
  data: WatchlistItem
  message: string
}

export interface DeleteFromWatchlistResponse {
  message: string
}

export interface DeleteAllWatchlistResponse {
  deletedCount: number
  message: string
}

// Error types
export class WatchlistError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[]
  ) {
    super(message)
    this.name = 'WatchlistError'
  }
}

// Display helper types
export interface WatchlistDisplayItem {
  id: string
  symbol: string
  symbolName: string
  customName?: string
  board: BoardType
  type: SymbolType
  alertPriceHigh?: number
  alertPriceLow?: number
  isAlertEnabled: boolean
  notes?: string
  createdAt: string
}

// Alert configuration
export interface AlertConfig {
  isEnabled: boolean
  priceHigh?: number
  priceLow?: number
  isTriggered?: boolean
  lastTriggered?: string
}

// Statistics
export interface WatchlistStats {
  totalItems: number
  alertsEnabled: number
  alertsTriggered?: number
  topSectors: Array<{
    sector: string
    count: number
  }>
  recentlyAdded: WatchlistItem[]
}

// Bulk operations
export interface BulkAddToWatchlistRequest {
  symbols: Array<{
    symbolCode: string
    customName?: string
    notes?: string
  }>
}

export interface BulkUpdateWatchlistRequest {
  updates: Array<{
    id: string
    customName?: string
    notes?: string
    alertPriceHigh?: number
    alertPriceLow?: number
    isAlertEnabled?: boolean
  }>
}

// Export and import
export interface ExportWatchlistData {
  items: WatchlistItem[]
  exportedAt: string
  userInfo: {
    userId: string
    totalItems: number
  }
}

export interface ImportWatchlistRequest {
  items: Array<{
    symbolCode: string
    customName?: string
    notes?: string
    alertPriceHigh?: number
    alertPriceLow?: number
    isAlertEnabled?: boolean
  }>
  overwriteExisting?: boolean
}

// Query keys for React Query
export const WATCHLIST_QUERY_KEYS = {
  all: ['watchlist'] as const,
  list: () => [...WATCHLIST_QUERY_KEYS.all, 'list'] as const,
  count: () => [...WATCHLIST_QUERY_KEYS.all, 'count'] as const,
  alerts: () => [...WATCHLIST_QUERY_KEYS.all, 'alerts'] as const,
  popular: () => [...WATCHLIST_QUERY_KEYS.all, 'popular'] as const,
  check: (symbol: string) => [...WATCHLIST_QUERY_KEYS.all, 'check', symbol] as const,
  item: (id: string) => [...WATCHLIST_QUERY_KEYS.all, 'item', id] as const,
  stats: () => [...WATCHLIST_QUERY_KEYS.all, 'stats'] as const,
} as const

// UI component types
export interface WatchlistItemCardProps {
  item: WatchlistItem
  compact?: boolean
  showAlerts?: boolean
  onEdit?: (item: WatchlistItem) => void
  onDelete?: (item: WatchlistItem) => void
  onToggleAlert?: (item: WatchlistItem) => void
}

export interface WatchlistFilterOptions {
  boards: BoardType[]
  types: SymbolType[]
  hasAlerts?: boolean
  hasNotes?: boolean
  dateRange?: {
    from?: Date
    to?: Date
  }
}

export interface WatchlistSortOptions {
  field: 'symbol' | 'customName' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

// Real-time updates
export interface WatchlistUpdate {
  type: 'ADD' | 'UPDATE' | 'DELETE' | 'ALERT_TRIGGERED'
  itemId: string
  data?: Partial<WatchlistItem>
  timestamp: string
}

// Price alert types
export interface PriceAlert {
  id: string
  watchlistItemId: string
  symbol: string
  alertType: 'HIGH' | 'LOW'
  triggerPrice: number
  currentPrice: number
  triggeredAt: string
  isRead: boolean
  message: string
}

export interface GetPriceAlertsResponse {
  data: PriceAlert[]
  count: number
  unreadCount: number
  message: string
}

// Watchlist sharing (if implemented in future)
export interface ShareWatchlistRequest {
  recipientEmail?: string
  shareLink?: boolean
  permissions: 'VIEW' | 'EDIT'
  expiresAt?: string
}

export interface SharedWatchlist {
  id: string
  ownerId: string
  sharedWithId?: string
  shareToken: string
  permissions: 'VIEW' | 'EDIT'
  isActive: boolean
  expiresAt?: string
  createdAt: string
}

// Advanced features
export interface WatchlistTemplate {
  id: string
  name: string
  description?: string
  symbols: string[]
  isPublic: boolean
  createdBy: string
  usageCount: number
  tags: string[]
}

export interface SmartWatchlistConfig {
  name: string
  criteria: {
    marketCapMin?: number
    marketCapMax?: number
    sectors?: string[]
    priceChangeMin?: number
    priceChangeMax?: number
    volumeMin?: number
    pe?: { min?: number; max?: number }
    pb?: { min?: number; max?: number }
  }
  autoUpdate: boolean
  maxItems: number
}

// Notification preferences
export interface WatchlistNotificationSettings {
  emailAlerts: boolean
  pushNotifications: boolean
  smsAlerts: boolean
  alertFrequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY'
  quietHours?: {
    enabled: boolean
    startTime: string // HH:mm
    endTime: string // HH:mm
  }
}

// Export types for easy importing
export type {
  WatchlistItem as Watchlist,
  WatchlistDisplayItem as WatchlistDisplay,
  WatchlistSymbol as Symbol,
}