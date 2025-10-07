import type { ChatResponseData, SuggestionsResponse } from '@/types/chatbot'

class ChatbotService {
  private baseUrl = 'https://bot.iqx.vn'
  // private baseUrl = 'http://localhost:5005'
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  generateSessionId() {
    return 'iqx_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }

  async sendMessage(message: string): Promise<ChatResponseData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          session_id: this.sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  async getStockInfo(symbol: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/stock/${symbol}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  async getSuggestions(): Promise<SuggestionsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/suggestions`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      return { success: false, suggestions: [] }
    }
  }

  setApiUrl(url: string) {
    this.baseUrl = url
  }

  resetSession() {
    this.sessionId = this.generateSessionId()
  }
}

export const chatbotService = new ChatbotService()