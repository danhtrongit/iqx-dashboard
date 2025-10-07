// Stock Search API

import { getApiBaseUrl } from '@/lib/api'

const API_BASE_URL = getApiBaseUrl()

// Types
export interface StockSearchResult {
  id?: number
  code: string
  symbol: string
  name: string
  name_en?: string
  exchange: string
  board: string
  type?: string
  organName?: string
  organShortName?: string
  enOrganName?: string
  enOrganShortName?: string
  price?: number
  change?: number
  changePercent?: number
  volume?: number
}

export type MatchType = 'exact_symbol' | 'exact_name' | 'prefix_symbol' | 'prefix_name' | 'contains' | 'word_boundary'
export type MatchedField = 'symbol' | 'name' | 'both'

export interface QuickSearchResult {
  symbol: string
  name: string
  board: string
  type: string
  match_type: MatchType
  matched_field: MatchedField
  organShortName?: string
  price?: number
  change?: number
  changePercent?: number
  volume?: number
}

export interface StockDetail {
  code: string
  symbol: string
  name: string
  name_en?: string
  exchange: string
  board: string
  type?: string
  price?: number
  high?: number
  low?: number
  change?: number
  changePercent?: number
  volume?: number
  value?: number
  marketCap?: number
  pe?: number
  pb?: number
  eps?: number
  bookValue?: number
  dividendYield?: number
  foreignOwnership?: number
}

export interface StockSearchParams {
  query?: string
  symbol?: string
  board?: string
  type?: string
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface Board {
  code: string
  name: string
  description?: string
}

export interface StockType {
  code: string
  name: string
  description?: string
}

// Search stocks (full search)
export async function searchStocks(params: StockSearchParams = {}): Promise<StockSearchResult[]> {
  const searchParams = new URLSearchParams()

  if (params.query) searchParams.append('query', params.query)
  if (params.symbol) searchParams.append('symbol', params.symbol)
  if (params.board) searchParams.append('board', params.board)
  if (params.type) searchParams.append('type', params.type)
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.offset) searchParams.append('offset', params.offset.toString())
  if (params.sortBy) searchParams.append('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

  const url = `${API_BASE_URL}/stocks/search?${searchParams.toString()}`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const data = await response.json()
    return normalizeSearchResults(data)
  } catch (error) {
    // Return mock data if API fails
    return getMockSearchResults(params.query || '')
  }
}

// Quick search for autocomplete (optimized)
export async function quickSearchStocks(query: string, limit: number = 10): Promise<QuickSearchResult[]> {
  if (!query || query.length < 1) return []

  const searchParams = new URLSearchParams()
  searchParams.append('q', query)
  searchParams.append('limit', limit.toString())

  const url = `${API_BASE_URL}/stocks/quick-search?${searchParams.toString()}`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Quick search failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    // Return mock data for quick search
    return getMockQuickSearchResults(query)
  }
}

// Get stocks by exact symbol match
export async function getStockByExactSymbol(symbol: string): Promise<StockDetail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/exact/${symbol}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to fetch stock: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    return null
  }
}

// Get stocks by prefix
export async function getStocksByPrefix(prefix: string, board?: string, limit: number = 50): Promise<StockSearchResult[]> {
  const searchParams = new URLSearchParams()
  if (board) searchParams.append('board', board)
  searchParams.append('limit', limit.toString())

  const url = `${API_BASE_URL}/stocks/prefix/${prefix}?${searchParams.toString()}`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch stocks by prefix: ${response.status}`)
    }

    const data = await response.json()
    return normalizeSearchResults(data)
  } catch (error) {
    return []
  }
}

// Get single stock by symbol
export async function getStockBySymbol(symbol: string): Promise<StockDetail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/symbol/${symbol}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch stock: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    return null
  }
}

// Get all boards
export async function getBoards(): Promise<Board[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/boards`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch boards: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    return [
      { code: 'HSX', name: 'HOSE' },
      { code: 'HNX', name: 'HNX' },
      { code: 'UPCOM', name: 'UPCOM' }
    ]
  }
}

// Get all stock types
export async function getStockTypes(): Promise<StockType[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/types`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch types: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    return []
  }
}

// Get stocks by board
export async function getStocksByBoard(board: string): Promise<StockSearchResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/board/${board}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch stocks by board: ${response.status}`)
    }

    const data = await response.json()
    return normalizeSearchResults(data)
  } catch (error) {
    return []
  }
}

// Normalize search results
function normalizeSearchResults(data: any): StockSearchResult[] {
  if (Array.isArray(data)) {
    return data.map(item => ({
      id: item.id,
      code: item.code || item.symbol || '',
      symbol: item.symbol || item.code || '',
      name: item.organShortName || item.name || item.companyName || '',
      name_en: item.enOrganShortName || item.name_en || item.nameEn || '',
      exchange: item.exchange || '',
      board: item.board || item.exchange || '',
      type: item.type || 'STOCK',
      organName: item.organName,
      organShortName: item.organShortName,
      enOrganName: item.enOrganName,
      enOrganShortName: item.enOrganShortName,
      price: item.price || item.matchPrice || 0,
      change: item.change || 0,
      changePercent: item.changePercent || item.priceChangePercent || 0,
      volume: item.volume || item.matchedVolume || 0,
    }))
  }

  if (data.data && Array.isArray(data.data)) {
    return normalizeSearchResults(data.data)
  }

  return []
}

// Mock data for development/fallback
function getMockSearchResults(query: string): StockSearchResult[] {
  const mockData: StockSearchResult[] = [
    { code: 'VIC', symbol: 'VIC', name: 'Vingroup', organName: 'Tập đoàn Vingroup - Công ty CP', organShortName: 'Vingroup', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 44800, change: -200, changePercent: -0.44, volume: 2834300 },
    { code: 'VHM', symbol: 'VHM', name: 'Vinhomes', organName: 'Công ty Cổ phần Vinhomes', organShortName: 'Vinhomes', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 36850, change: 150, changePercent: 0.41, volume: 5123400 },
    { code: 'VNM', symbol: 'VNM', name: 'Vinamilk', organName: 'Công ty Cổ phần Sữa Việt Nam', organShortName: 'Vinamilk', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 68900, change: -300, changePercent: -0.43, volume: 1234500 },
    { code: 'HPG', symbol: 'HPG', name: 'Hòa Phát', organName: 'Công ty Cổ phần Tập đoàn Hòa Phát', organShortName: 'Hòa Phát', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 19750, change: 250, changePercent: 1.28, volume: 12456700 },
    { code: 'MSN', symbol: 'MSN', name: 'Masan', organName: 'Công ty Cổ phần Tập đoàn Masan', organShortName: 'Masan Group', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 52300, change: -100, changePercent: -0.19, volume: 3456700 },
    { code: 'FPT', symbol: 'FPT', name: 'FPT', organName: 'Công ty Cổ phần FPT', organShortName: 'FPT Corporation', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 127500, change: 1500, changePercent: 1.19, volume: 2345600 },
    { code: 'BID', symbol: 'BID', name: 'BIDV', organName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', organShortName: 'BIDV', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 39800, change: 0, changePercent: 0, volume: 4567800 },
    { code: 'CTG', symbol: 'CTG', name: 'VietinBank', organName: 'Ngân hàng TMCP Công Thương Việt Nam', organShortName: 'VietinBank', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 25650, change: 150, changePercent: 0.59, volume: 6789000 },
    { code: 'VCB', symbol: 'VCB', name: 'Vietcombank', organName: 'Ngân hàng TMCP Ngoại thương Việt Nam', organShortName: 'Vietcombank', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 88500, change: -500, changePercent: -0.56, volume: 1234500 },
    { code: 'ACB', symbol: 'ACB', name: 'ACB', organName: 'Ngân hàng TMCP Á Châu', organShortName: 'ACB', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 20350, change: 50, changePercent: 0.25, volume: 8901200 },
    { code: 'MBB', symbol: 'MBB', name: 'MB Bank', organName: 'Ngân hàng TMCP Quân đội', organShortName: 'MB Bank', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 18900, change: 100, changePercent: 0.53, volume: 9012300 },
    { code: 'TCB', symbol: 'TCB', name: 'Techcombank', organName: 'Ngân hàng TMCP Kỹ thương Việt Nam', organShortName: 'Techcombank', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 20100, change: -100, changePercent: -0.50, volume: 5678900 },
    { code: 'VPB', symbol: 'VPB', name: 'VPBank', organName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', organShortName: 'VPBank', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 18150, change: 50, changePercent: 0.28, volume: 7890100 },
    { code: 'HDB', symbol: 'HDB', name: 'HDBank', organName: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh', organShortName: 'HDBank', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 14650, change: -50, changePercent: -0.34, volume: 4567800 },
    { code: 'STB', symbol: 'STB', name: 'Sacombank', organName: 'Ngân hàng TMCP Sài Gòn Thương Tín', organShortName: 'Sacombank', board: 'HOSE', exchange: 'HSX', type: 'STOCK', price: 18950, change: 150, changePercent: 0.80, volume: 12345600 },
  ]

  if (!query) return mockData.slice(0, 10)

  const lowerQuery = query.toLowerCase()
  const normalizedQuery = removeVietnameseTones(lowerQuery)

  // Priority-based search matching the API documentation
  const results = mockData.map(stock => {
    let priority = 999
    const lowerSymbol = stock.symbol.toLowerCase()
    const lowerName = stock.name.toLowerCase()
    const lowerOrgName = (stock.organName || '').toLowerCase()
    const normalizedName = removeVietnameseTones(lowerName)
    const normalizedOrgName = removeVietnameseTones(lowerOrgName)

    // Priority 1: Exact symbol match
    if (lowerSymbol === lowerQuery) priority = 1
    // Priority 2: Exact short name match
    else if (lowerName === lowerQuery || normalizedName === normalizedQuery) priority = 2
    // Priority 3: Exact full name match
    else if (lowerOrgName === lowerQuery || normalizedOrgName === normalizedQuery) priority = 3
    // Priority 4: Symbol starts with query
    else if (lowerSymbol.startsWith(lowerQuery)) priority = 4
    // Priority 5: Name starts with query
    else if (lowerName.startsWith(lowerQuery) || normalizedName.startsWith(normalizedQuery)) priority = 5
    // Priority 6: Symbol contains query
    else if (lowerSymbol.includes(lowerQuery)) priority = 6
    // Priority 7: Word boundary match in name
    else if (matchesWordBoundary(lowerName, lowerQuery) || matchesWordBoundary(normalizedName, normalizedQuery)) priority = 7
    // Priority 8: Name contains query
    else if (lowerName.includes(lowerQuery) || normalizedName.includes(normalizedQuery)) priority = 8
    // Priority 9: Full org name contains query
    else if (lowerOrgName.includes(lowerQuery) || normalizedOrgName.includes(normalizedQuery)) priority = 9

    return { stock, priority }
  })

  return results
    .filter(r => r.priority < 999)
    .sort((a, b) => a.priority - b.priority)
    .map(r => r.stock)
    .slice(0, 10)
}

// Mock quick search results
function getMockQuickSearchResults(query: string): QuickSearchResult[] {
  const results = getMockSearchResults(query)

  return results.map(stock => {
    const lowerQuery = query.toLowerCase()
    const lowerSymbol = stock.symbol.toLowerCase()
    const lowerName = stock.name.toLowerCase()

    let match_type: MatchType = 'contains'
    let matched_field: MatchedField = 'both'

    if (lowerSymbol === lowerQuery) {
      match_type = 'exact_symbol'
      matched_field = 'symbol'
    } else if (lowerName === lowerQuery) {
      match_type = 'exact_name'
      matched_field = 'name'
    } else if (lowerSymbol.startsWith(lowerQuery)) {
      match_type = 'prefix_symbol'
      matched_field = 'symbol'
    } else if (lowerName.startsWith(lowerQuery)) {
      match_type = 'prefix_name'
      matched_field = 'name'
    } else if (lowerSymbol.includes(lowerQuery)) {
      matched_field = 'symbol'
    } else if (lowerName.includes(lowerQuery)) {
      matched_field = 'name'
    }

    return {
      symbol: stock.symbol,
      name: stock.organShortName || stock.name,
      board: stock.board,
      type: stock.type || 'STOCK',
      match_type,
      matched_field,
      organShortName: stock.organShortName,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      volume: stock.volume
    }
  })
}

// Helper: Remove Vietnamese tones for search matching
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

// Helper: Check if query matches at word boundary
function matchesWordBoundary(text: string, query: string): boolean {
  const words = text.split(/\s+/)
  return words.some(word => word.startsWith(query))
}