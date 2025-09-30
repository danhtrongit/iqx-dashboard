import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessage, ChatbotOptions } from '@/types/chatbot'
import { chatbotService } from '@/services/chatbot.service'

export function useChatbot(options: ChatbotOptions = {}) {
  const [isOpen, setIsOpen] = useState(options.autoOpen || false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load suggestions on mount
  useEffect(() => {
    if (options.showSuggestions !== false) {
      loadSuggestions()
    }
  }, [])

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadSuggestions = useCallback(async () => {
    try {
      const response = await chatbotService.getSuggestions()
      if (response.success && response.suggestions) {
        setSuggestions(response.suggestions.slice(0, 4))
      }
    } catch (error) {
      console.warn('Could not load suggestions:', error)
    }
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const generateMessageId = () => {
    return 'msg_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }

  const addMessage = useCallback((content: string, sender: 'user' | 'bot', data?: ChatMessage['data'], type?: ChatMessage['type']) => {
    const message: ChatMessage = {
      id: generateMessageId(),
      content,
      sender,
      timestamp: new Date(),
      data,
      type
    }
    setMessages(prev => [...prev, message])
    return message
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    // Add user message
    addMessage(content, 'user')
    setIsLoading(true)

    try {
      const response = await chatbotService.sendMessage(content)

      if (response.success) {
        addMessage(response.response, 'bot', response)
      } else {
        addMessage(
          response.error || 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
          'bot',
          undefined,
          'error'
        )
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      addMessage(errorMessage, 'bot', undefined, 'error')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, addMessage])

  const clearHistory = useCallback(() => {
    setMessages([])
    chatbotService.resetSession()
  }, [])

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    messages,
    isLoading,
    suggestions,
    messagesEndRef,
    sendMessage,
    clearHistory,
    toggleOpen,
    open,
    close,
    setIsOpen
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
    }
    if (error.message.includes('404')) {
      return 'Không tìm thấy thông tin yêu cầu.'
    }
    if (error.message.includes('500')) {
      return 'Lỗi server. Vui lòng thử lại sau.'
    }
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
}

// Utility functions
export const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const sanitizeHTML = (str: string) => {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
