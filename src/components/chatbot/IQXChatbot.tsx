import { useState, useEffect } from 'react'
import { useChatbot, formatTime, sanitizeHTML } from '@/hooks/use-chatbot'
import type { ChatbotOptions } from '@/types/chatbot'
import { MessageCircle, X, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface IQXChatbotProps {
  options?: ChatbotOptions
}

export function IQXChatbot({ options = {} }: IQXChatbotProps) {
  const {
    isOpen,
    messages,
    isLoading,
    suggestions,
    messagesEndRef,
    sendMessage,
    toggleOpen
  } = useChatbot(options)

  const [inputValue, setInputValue] = useState('')
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false)
    }
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return
    sendMessage(inputValue)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    sendMessage(suggestion)
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans text-sm leading-6">
      {/* Toggle Button */}
      <button
        onClick={toggleOpen}
        className={`
          w-[60px] h-[60px] rounded-full border-none cursor-pointer
          shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]
          transition-all duration-300 flex items-center justify-center
          text-white text-2xl
          ${isOpen
            ? 'bg-[#e74c3c] rotate-45 hover:rotate-45'
            : 'bg-gradient-to-br from-[#1a365d] to-[#2d5985] hover:scale-110'
          }
        `}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Container */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] h-[520px] bg-background rounded-2xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] border border-border flex flex-col overflow-hidden animate-[slideUp_0.3s_ease]">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#1a365d] to-[#2d5985] text-white px-5 py-4 flex items-center justify-between">
            <div className="text-base font-semibold flex items-center gap-2">
              <div className="w-8 h-6 bg-white rounded flex items-center justify-center font-bold text-[#1a365d] text-xs">
                AriX
              </div>
              <span>Trợ lý ảo hệ thống IQX</span>
            </div>
            <div className="text-xs opacity-90 flex items-center gap-1">
              <div className="w-2 h-2 bg-[#00b894] rounded-full animate-[pulse_2s_infinite]" />
              <span>Online</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#f8fafc] dark:bg-background/50">
            {showWelcome && (
              <div className="text-center py-5 text-muted-foreground">
                <h3 className="text-foreground mb-2 text-base">AriX - Trợ lý ảo hệ thống IQX</h3>
                <p className="text-sm mb-4">
                  Cung cấp phân tích khách quan dựa trên dữ liệu. Không đưa ra khuyến nghị mang tính thúc đẩy.
                </p>
              </div>
            )}

            {/* Suggestions */}
            {showWelcome && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-background border border-border rounded-2xl px-3 py-1.5 text-xs text-foreground cursor-pointer transition-all hover:bg-[#0066cc] hover:text-white hover:border-[#0066cc] whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 max-w-full ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                    message.sender === 'bot'
                      ? 'bg-gradient-to-br from-[#1a365d] to-[#2d5985] text-white'
                      : 'bg-[#0066cc] text-white'
                  }`}
                >
                  {message.sender === 'user' ? 'U' : 'AriX'}
                </div>

                {/* Message Bubble */}
                <div className="flex-1">
                  <div
                    className={`rounded-2xl p-3 max-w-[280px] break-words shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] border ${
                      message.sender === 'user'
                        ? 'bg-[#0066cc] text-white border-transparent ml-auto'
                        : message.type === 'error'
                        ? 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]'
                        : 'bg-background text-foreground border-border'
                    }`}
                  >
                    {message.sender === 'bot' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(message.content) }} />
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 text-center">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a365d] to-[#2d5985] text-white flex items-center justify-center text-xs font-semibold">
                  AriX
                </div>
                <div className="bg-background rounded-2xl p-3 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] border border-border">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-[typing_1.4s_infinite]" />
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-[typing_1.4s_infinite_0.2s]" />
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-[typing_1.4s_infinite_0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex items-center gap-2 bg-[#f8fafc] dark:bg-background/50 border border-border rounded-3xl px-4 py-2 transition-all focus-within:border-[#0066cc] focus-within:shadow-[0_0_0_3px_rgba(0,102,204,0.1)]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi về chứng khoán..."
                maxLength={500}
                disabled={isLoading}
                className="flex-1 border-none outline-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="w-8 h-8 bg-[#0066cc] border-none rounded-full text-white cursor-pointer flex items-center justify-center transition-all hover:bg-[#1a365d] hover:scale-105 disabled:bg-border disabled:cursor-not-allowed disabled:scale-100"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 2px;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .fixed.bottom-5 {
            bottom: 10px;
            right: 10px;
          }

          .fixed.bottom-5 > div {
            width: calc(100vw - 20px);
            height: calc(100vh - 100px);
            bottom: 70px;
            right: -10px;
          }

          .fixed.bottom-5 > button {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  )
}
