// News article data types
export type NewsType = 'stock_news' | 'market_news' | 'economy_news' | 'company_news'
export type SentimentType = 'Positive' | 'Negative' | 'Neutral'
export type NewsSource = 'cafef' | 'vnexpress' | 'baodautu' | 'other'

// File attachment type
export interface FileAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

// Base news article interface
export interface NewsArticle {
  id: string
  ticker: string
  company_name: string
  industry: string
  news_title: string
  news_short_content: string
  summary: string
  highlight_position: string
  news_full_content: string
  file_attachment: FileAttachment[]
  news_source_link: string
  news_image_url: string
  update_date: string
  news_from: NewsSource
  sentiment: SentimentType
  score: number
  slug: string
  male_audio_duration: number
  female_audio_duration: number
  news_type: NewsType
  news_from_name: string
}

// API Request types
export interface GetNewsFromSlugRequest {
  slug: string
  language?: 'vi' | 'en'
}

export interface GetNewsListRequest {
  page?: number
  limit?: number
  ticker?: string
  news_type?: NewsType
  sentiment?: SentimentType
  news_from?: NewsSource
  date_from?: string
  date_to?: string
  search?: string
}

// API Response types
export interface GetNewsFromSlugResponse {
  data: NewsArticle
  message?: string
  success?: boolean
}

export interface GetNewsListResponse {
  data: NewsArticle[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
  message?: string
  success?: boolean
}

// Display helper types
export interface NewsDisplayInfo {
  title: string
  shortContent: string
  imageUrl: string
  publishDate: string
  source: string
  ticker: string
  companyName: string
  sentiment: SentimentType
  sentimentColor: string
  score: number
}

// Error types
export class NewsError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[]
  ) {
    super(message)
    this.name = 'NewsError'
  }
}

// Audio player types
export interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
}

export interface AudioPlayerControls {
  play: () => void
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setPlaybackRate: (rate: number) => void
}

// Content parsing types
export interface ParsedContent {
  html: string
  textLength: number
  readingTime: number // in minutes
  imageCount: number
  hasVideo: boolean
  hasAudio: boolean
}

// Social sharing types
export interface ShareOptions {
  title: string
  text: string
  url: string
}

// Query key types for React Query
export const NEWS_QUERY_KEYS = {
  all: ['news'] as const,
  lists: () => [...NEWS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: GetNewsListRequest) => [...NEWS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...NEWS_QUERY_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...NEWS_QUERY_KEYS.details(), slug] as const,
  byTicker: (ticker: string) => [...NEWS_QUERY_KEYS.all, 'ticker', ticker] as const,
  byType: (type: NewsType) => [...NEWS_QUERY_KEYS.all, 'type', type] as const,
  bySentiment: (sentiment: SentimentType) => [...NEWS_QUERY_KEYS.all, 'sentiment', sentiment] as const,
} as const

// Utility types for UI components
export interface NewsCardProps {
  article: NewsArticle
  compact?: boolean
  showImage?: boolean
  showSummary?: boolean
  onClick?: (article: NewsArticle) => void
}

export interface NewsFilterOptions {
  tickers: string[]
  newsTypes: NewsType[]
  sentiments: SentimentType[]
  sources: NewsSource[]
  dateRange: {
    from?: Date
    to?: Date
  }
}

// Meta tags for SEO
export interface NewsMetaTags {
  title: string
  description: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogUrl: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  canonicalUrl: string
  publishedTime: string
  modifiedTime: string
  author: string
  section: string
}

// Reading progress tracking
export interface ReadingProgress {
  articleId: string
  slug: string
  progressPercentage: number
  timeSpent: number // in seconds
  lastReadAt: string
  completed: boolean
}

// Related articles
export interface RelatedArticle {
  id: string
  title: string
  slug: string
  imageUrl: string
  publishDate: string
  similarity: number
}