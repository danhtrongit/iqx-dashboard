import { useState, useEffect, useRef, useCallback } from 'react'
import type { SignalDataItem } from '@/lib/schemas/signals'

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
}

interface UseSignalsWebSocketReturn {
  signals: SignalDataItem[]
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  subscribe: (symbols: string[]) => void
  unsubscribe: (symbols?: string[]) => void
  reconnect: () => void
}

const WS_URL = import.meta.env.VITE_SIGNALS_WS_URL || 'ws://localhost:3456/ws'

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
  } = options

  const [signals, setSignals] = useState<SignalDataItem[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const subscribedSymbolsRef = useRef<string[]>([])
  const reconnectAttemptsRef = useRef<number>(0)
  const maxReconnectAttempts = 3
  
  // Use ref to store latest symbols to avoid reconnect on symbols change
  const symbolsRef = useRef<string[]>(symbols)
  useEffect(() => {
    symbolsRef.current = symbols
  }, [symbols])

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled || isConnecting || isConnected) return

    setIsConnecting(true)
    setError(null)

    try {
      console.log('🔌 Attempting to connect to:', WS_URL)
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ Connected to IQX Signal WebSocket')
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        reconnectAttemptsRef.current = 0 // Reset reconnect attempts on successful connection
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          switch (message.type) {
            case 'connected':
              console.log('🔌 WebSocket connected:', message.message)
              onConnected?.()
              // Auto-subscribe to symbols after connection
              const currentSymbols = symbolsRef.current
              if (currentSymbols.length > 0) {
                console.log('📤 Auto-subscribing to:', currentSymbols.join(', '))
                ws.send(JSON.stringify({
                  action: 'subscribe',
                  symbols: currentSymbols,
                  interval,
                }))
              }
              break

            case 'subscribed':
              console.log('📡 Subscribed to symbols:', message.symbols.join(', '))
              subscribedSymbolsRef.current = message.symbols
              break

            case 'signals':
              console.log(`📊 Received ${message.count} signals`)
              setSignals(message.data)
              onSignalsUpdate?.(message.data)
              break

            case 'error':
              console.error('❌ WebSocket error:', message.message)
              setError(message.message)
              onError?.(message.message)
              break
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      ws.onerror = (event) => {
        console.error('❌ WebSocket connection error:', event)
        const errorMessage = 'Không thể kết nối tới máy chủ tín hiệu. Vui lòng kiểm tra kết nối mạng hoặc liên hệ hỗ trợ.'
        setError(errorMessage)
        setIsConnecting(false)
        onError?.(errorMessage)
      }

      ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected')
        console.log('   Code:', event.code)
        console.log('   Reason:', event.reason || 'No reason provided')
        console.log('   Clean:', event.wasClean)
        
        setIsConnected(false)
        setIsConnecting(false)
        wsRef.current = null

        // Auto-reconnect with max attempts limit
        if (autoReconnect && enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          console.log(`🔄 Reconnecting in ${reconnectDelay / 1000}s... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectDelay)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          const errorMsg = 'Không thể kết nối sau nhiều lần thử. Vui lòng thử lại sau.'
          setError(errorMsg)
          onError?.(errorMsg)
          console.error('❌ Max reconnection attempts reached')
        }
      }
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setError('Failed to connect to WebSocket')
      setIsConnecting(false)
    }
  }, [enabled, isConnecting, isConnected, interval, onConnected, onError, onSignalsUpdate, autoReconnect, reconnectDelay])

  // Subscribe to symbols
  const subscribe = useCallback((newSymbols: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot subscribe')
      return
    }

    if (newSymbols.length === 0) {
      console.warn('No symbols to subscribe')
      return
    }

    if (newSymbols.length > 20) {
      console.warn('Maximum 20 symbols per subscription, truncating...')
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
      console.warn('WebSocket not connected, cannot unsubscribe')
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
    
    connect()
  }, [connect])

  // Effect: Connect on mount, disconnect on unmount
  useEffect(() => {
    console.log('🔍 WebSocket Effect - enabled:', enabled)
    
    if (enabled) {
      connect()
    }

    return () => {
      console.log('🧹 WebSocket cleanup')
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [enabled, connect])

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
  }
}

