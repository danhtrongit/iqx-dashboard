export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  data?: ChatResponseData
  type?: 'normal' | 'error'
}

export interface ChatResponseData {
  success: boolean
  response: string
  session_id?: string
  context_data?: Record<string, StockContextData>
  query_analysis?: QueryAnalysis
  data_sources_used?: string[]
  error?: string
}

export interface StockContextData {
  price_data?: PriceData
  [key: string]: unknown
}

export interface PriceData {
  chart_ready: boolean
  data: ChartDataPoint[]
}

export interface ChartDataPoint {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface QueryAnalysis {
  intent?: string
  symbols?: string[]
  [key: string]: unknown
}

export interface ChatbotOptions {
  apiUrl?: string
  autoOpen?: boolean
  showSuggestions?: boolean
  position?: 'bottom-right' | 'bottom-left'
  theme?: 'default' | 'dark'
}

export interface SuggestionsResponse {
  success: boolean
  suggestions: string[]
}
