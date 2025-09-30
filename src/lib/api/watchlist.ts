import { TokenManager } from '@/services/auth.service'
import { getWatchlistApiBaseUrl } from '@/lib/api'

const API_BASE_URL = getWatchlistApiBaseUrl()

// Create a compatible authAPI object
const authAPI = {
  fetchWithAuth: async (url: string, options: RequestInit = {}) => {
    const token = TokenManager.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    if (token && !TokenManager.isTokenExpired(token)) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return fetch(url, {
      ...options,
      headers
    })
  }
}

export interface WatchlistItem {
  id: string
  userId: string
  symbolId: string
  symbol: {
    id: string
    symbol: string
    organName: string
    organShortName: string
    type: string
    board: string
    enOrganName?: string
    enOrganShortName?: string
  }
  customName?: string
  notes?: string
  alertPriceHigh?: number
  alertPriceLow?: number
  isAlertEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface WatchlistResponse {
  data: WatchlistItem[]
  count: number
  message: string
}

export interface WatchlistCountResponse {
  count: number
  message: string
}

export interface AddWatchlistRequest {
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

export interface CheckWatchlistResponse {
  isInWatchlist: boolean
  watchlistItem?: WatchlistItem
  message: string
}

export interface PopularStockItem {
  symbol: WatchlistItem['symbol']
  count: number
}

export interface PopularStocksResponse {
  data: PopularStockItem[]
  message: string
}

export interface ClearAllResponse {
  deletedCount: number
  message: string
}

// Get all watchlist items
export async function getAllWatchlist(): Promise<WatchlistItem[]> {
  const response = await authAPI['fetchWithAuth'](`${API_BASE_URL}`)
  if (!response.ok) {
    throw new Error('Failed to fetch watchlist')
  }
  const result: WatchlistResponse = await response.json()
  return result.data
}

// Get watchlist with full response
export async function getWatchlist(): Promise<WatchlistResponse> {
  const response = await authAPI['fetchWithAuth'](`${API_BASE_URL}`)
  if (!response.ok) {
    throw new Error('Failed to fetch watchlist')
  }
  return response.json()
}

// Get watchlist count
export async function getWatchlistCount(): Promise<WatchlistCountResponse> {
  const response = await authAPI['fetchWithAuth'](`${API_BASE_URL}/count`)
  if (!response.ok) {
    throw new Error('Failed to fetch watchlist count')
  }
  return response.json()
}

// Get watchlist items with alerts enabled
export async function getWatchlistWithAlerts(): Promise<WatchlistResponse> {
  const response = await authAPI['fetchWithAuth'](`${API_BASE_URL}/alerts`)
  if (!response.ok) {
    throw new Error('Failed to fetch watchlist with alerts')
  }
  return response.json()
}

// Get popular stocks
export async function getPopularStocks(limit?: number): Promise<PopularStocksResponse> {
  const url = limit ? `${API_BASE_URL}/popular?limit=${limit}` : `${API_BASE_URL}/popular`
  const response = await authAPI['fetchWithAuth'](url)
  if (!response.ok) {
    throw new Error('Failed to fetch popular stocks')
  }
  return response.json()
}

// Check if symbol is in watchlist
export async function checkIsInWatchlist(symbol: string): Promise<CheckWatchlistResponse> {
  const response = await authAPI['fetchWithAuth'](`${API_BASE_URL}/check/${symbol}`)
  if (!response.ok) {
    throw new Error('Failed to check watchlist status')
  }
  return response.json()
}

// Add to watchlist
export async function addToWatchlist(data: AddWatchlistRequest): Promise<WatchlistItem> {
  const response = await authAPI['fetchWithAuth'](`${API_BASE_URL}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to add to watchlist')
  }

  const result = await response.json()
  return result.data
}

// Update watchlist item
export async function updateWatchlistItem(id: string, data: UpdateWatchlistRequest): Promise<WatchlistItem> {
  const response = await authAPI['fetchWithAuth'](`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update watchlist item')
  }

  const result = await response.json()
  return result.data
}

// Remove from watchlist by ID
export async function removeFromWatchlistById(id: string): Promise<void> {
  const response = await authAPI['fetchWithAuth'](`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to remove from watchlist')
  }
}

// Remove from watchlist by symbol
export async function removeFromWatchlistBySymbol(symbol: string): Promise<void> {
  const response = await authAPI['fetchWithAuth'](`${API_BASE_URL}/symbol/${symbol}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to remove from watchlist')
  }
}

// Clear all watchlist
export async function clearAllWatchlist(): Promise<ClearAllResponse> {
  const response = await authAPI['fetchWithAuth'](`${API_BASE_URL}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to clear all watchlist')
  }

  return response.json()
}