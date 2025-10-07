import { useState, useEffect, useRef, useCallback } from 'react'
import type { SignalDataItem } from '@/lib/schemas/signals'
import SignalsService from '@/services/signals.service'

// WebSocket message types
interface ConnectedMessage {
  type: 'connected'
  message: string
  timestamp: string
}

interface SubscribedMessage {
  type: 'subscribed'
  symbols: string[]
  interval: number
  message: string
}

interface SignalsMessage {
  type: 'signals'
  timestamp: string
  data: SignalDataItem[]
  count: number
}

interface ErrorMessage {
  type: 'error'
  message: string
}

type WebSocketMessage = ConnectedMessage | SubscribedMessage | SignalsMessage | ErrorMessage

interface UseSignalsWebSocketOptions {
  enabled?: boolean
  interval?: number // Update interval in milliseconds (default: 60000)
  onConnected?: () => void
  onError?: (error: string) => void
  onSignalsUpdate?: (signals: SignalDataItem[]) => void
  autoReconnect?: boolean
  reconnectDelay?: number
  useFallbackPolling?: boolean // Enable HTTP polling as fallback
}

interface UseSignalsWebSocketReturn {
  signals: SignalDataItem[]
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  subscribe: (symbols: string[]) => void
  unsubscribe: (symbols?: string[]) => void
  reconnect: () => void
  usingFallback: boolean
}

// WebSocket configuration
const WEBSOCKET_ENABLED = true // Server is now running on port 3456

// Determine WebSocket URL based on environment
const getWebSocketURL = () => {
  // If environment variable is set, use it
  if (import.meta.env.VITE_SIGNALS_WS_URL) {
    return import.meta.env.VITE_SIGNALS_WS_URL
  }
  
  // In development, connect directly to the warning server
  if (import.meta.env.DEV) {
    return 'ws://localhost:3456/ws'
  }
  
  // In production, use the direct WebSocket URL
  return 'wss://https://warning.iqx.vn/ws'
}

export function useSignalsWebSocket(
  symbols: string[],
  options: UseSignalsWebSocketOptions = {}
): UseSignalsWebSocketReturn {
  const {
    enabled = true,
    interval = 60000, // 60 seconds default
    onConnected,
    onError,
    onSignalsUpdate,
    autoReconnect = true,
    reconnectDelay = 5000, // 5 seconds
    useFallbackPolling = true, // Enable fallback by default
  } = options

  const [signals, setSignals] = useState<SignalDataItem[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const subscribedSymbolsRef = useRef<string[]>([])
  const reconnectAttemptsRef = useRef<number>(0)
  const maxReconnectAttempts = 3
  
  // Use ref to store latest symbols to avoid reconnect on symbols change
  const symbolsRef = useRef<string[]>(symbols)
  useEffect(() => {
    symbolsRef.current = symbols
  }, [symbols])

  // Fallback HTTP polling
  const startPolling = useCallback(() => {
    if (!useFallbackPolling || !enabled || symbolsRef.current.length === 0) return
    
    // Don't start if already polling
    if (pollingIntervalRef.current) {
      return
    }
    
    setUsingFallback(true)
    
    // Initial fetch
    const fetchSignals = async () => {
      try {
        // Use real API from warning server
        const response = await SignalsService.getSignals({ 
          symbols: symbolsRef.current 
        })
        if (response && response.data) {
          setSignals(response.data)
          onSignalsUpdate?.(response.data)
          setError(null)
        }
      } catch (err) {
        setError('Không thể tải dữ liệu tín hiệu qua HTTP')
      }
    }
    
    fetchSignals() // Initial fetch
    
    // Set up polling interval
    pollingIntervalRef.current = setInterval(fetchSignals, interval)
  }, [enabled, interval, onSignalsUpdate, useFallbackPolling])

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = undefined
      setUsingFallback(false)
    }
  }, [])

  // Connect to WebSocket  
  const connectWebSocket = useCallback(() => {
    // Check if WebSocket is disabled
    if (!WEBSOCKET_ENABLED) {
      if (!usingFallback && !pollingIntervalRef.current) {
        startPolling()
      }
      return
    }
    
    // Check current state using refs to avoid stale closure issues
    if (!enabled) return
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setIsConnecting(true)
    setError(null)

    try {
      const wsUrl = getWebSocketURL()
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        reconnectAttemptsRef.current = 0 // Reset reconnect attempts on successful connection
        
        // Stop fallback polling if it was running
        if (usingFallback) {
          stopPolling()
        }
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          switch (message.type) {
            case 'connected':
              onConnected?.()
              // Auto-subscribe to symbols after connection
              const currentSymbols = symbolsRef.current
              if (currentSymbols.length > 0) {
                ws.send(JSON.stringify({
                  action: 'subscribe',
                  symbols: currentSymbols,
                  interval,
                }))
              }
              break

            case 'subscribed':
              subscribedSymbolsRef.current = message.symbols
              break

            case 'signals':
              setSignals(message.data)
              onSignalsUpdate?.(message.data)
              break

            case 'error':
              setError(message.message)
              onError?.(message.message)
              break
          }
        } catch (err) {
        }
      }

      ws.onerror = (event) => {
        
        let errorMessage = 'Không thể kết nối tới máy chủ tín hiệu.'
        
        // Provide more specific error messages based on environment
        if (import.meta.env.DEV) {
          errorMessage += ' Đang chạy ở chế độ development. Kiểm tra xem backend WebSocket server có đang chạy tại ' + wsUrl
        } else {
          errorMessage += ' Vui lòng kiểm tra kết nối mạng hoặc liên hệ hỗ trợ.'
        }
        
        // Check for common issues
        if (wsUrl.startsWith('ws://') && window.location.protocol === 'https:') {
          errorMessage = 'Lỗi bảo mật: Không thể kết nối WebSocket không bảo mật (ws://) từ trang HTTPS. Vui lòng sử dụng wss://'
        }
        
        setError(errorMessage)
        setIsConnecting(false)
        onError?.(errorMessage)
      }

      ws.onclose = (event) => {
        
        setIsConnected(false)
        setIsConnecting(false)
        wsRef.current = null

        // Auto-reconnect with max attempts limit
        if (autoReconnect && enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, reconnectDelay)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          const errorMsg = 'Không thể kết nối WebSocket. Chuyển sang chế độ HTTP polling.'
          
          // Start fallback HTTP polling if enabled
          if (useFallbackPolling && !usingFallback) {
            startPolling()
            setError(null) // Clear error if fallback is working
          } else {
            setError(errorMsg)
            onError?.(errorMsg)
          }
        }
      }
    } catch (err) {
      setError('Failed to connect to WebSocket')
      setIsConnecting(false)
    }
  }, [enabled, interval, autoReconnect, reconnectDelay, useFallbackPolling, startPolling, usingFallback])

  // Subscribe to symbols
  const subscribe = useCallback((newSymbols: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    if (newSymbols.length === 0) {
      return
    }

    if (newSymbols.length > 20) {
      newSymbols = newSymbols.slice(0, 20)
    }

    wsRef.current.send(JSON.stringify({
      action: 'subscribe',
      symbols: newSymbols,
      interval,
    }))
  }, [interval])

  // Unsubscribe from symbols
  const unsubscribe = useCallback((symbolsToUnsubscribe?: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    const message: any = { action: 'unsubscribe' }
    if (symbolsToUnsubscribe && symbolsToUnsubscribe.length > 0) {
      message.symbols = symbolsToUnsubscribe
    }

    wsRef.current.send(JSON.stringify(message))
  }, [])

  // Reconnect manually
  const reconnect = useCallback(() => {
    // Reset reconnect attempts on manual reconnect
    reconnectAttemptsRef.current = 0
    setError(null)
    
    if (wsRef.current) {
      wsRef.current.close()
    }
    
    // Clear any pending reconnect timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    // Stop polling if running
    stopPolling()
    
    connectWebSocket()
  }, [connectWebSocket, stopPolling])

  // Effect: Connect on mount, disconnect on unmount
  useEffect(() => {
    if (!enabled) return
    
    connectWebSocket()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
      // Clean up polling if running
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = undefined
      }
    }
  }, [enabled, connectWebSocket]) // Only re-run when enabled changes or connect function changes

  // Effect: Update subscription when symbols change
  useEffect(() => {
    if (!isConnected || !wsRef.current) return
    if (symbols.length === 0) return

    // Unsubscribe from old symbols
    const oldSymbols = subscribedSymbolsRef.current
    const symbolsToUnsubscribe = oldSymbols.filter(s => !symbols.includes(s))
    const symbolsToSubscribe = symbols.filter(s => !oldSymbols.includes(s))

    if (symbolsToUnsubscribe.length > 0) {
      unsubscribe(symbolsToUnsubscribe)
    }

    if (symbolsToSubscribe.length > 0) {
      subscribe(symbolsToSubscribe)
    }

    // If completely different set, just resubscribe all
    if (oldSymbols.length > 0 && symbolsToSubscribe.length === symbols.length) {
      unsubscribe() // Unsubscribe all
      setTimeout(() => subscribe(symbols), 100) // Subscribe to new set
    }
  }, [symbols, isConnected, subscribe, unsubscribe])

  return {
    signals,
    isConnected,
    isConnecting,
    error,
    subscribe,
    unsubscribe,
    reconnect,
    usingFallback,
  }
}

