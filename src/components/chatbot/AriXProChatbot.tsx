import { useState, useEffect } from "react";
import { useAriXPro, formatTime } from "@/hooks/use-arix-pro";
import { Send, Trash2, Sparkles, TrendingUp, Brain, Zap, Shield, Clock, BarChart3, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ApiUsageDisplay } from "@/components/charts/api-usage-display";

export function AriXProChatbot() {
  const { messages, isLoading, messagesEndRef, sendMessage, clearHistory, usage, isLoadingUsage, fetchUsage } =
    useAriXPro();

  const [inputValue, setInputValue] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowWelcome(true);
    setShowClearConfirm(false);
  };

  const suggestions = ["VIC", "VCB vs TCB", "Thị trường", "Cổ phiếu ngân hàng"];

  const features = [
    {
      icon: Brain,
      title: "Mô hình AriX Pro",
      desc: "AI phân tích thông minh",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: BarChart3,
      title: "Dữ liệu Real-time",
      desc: "Cập nhật liên tục",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: FileText,
      title: "Phân tích chuyên sâu",
      desc: "Tổng hợp từ dữ liệu thị trường",
      gradient: "from-indigo-500 to-blue-600",
    },
    {
      icon: Zap,
      title: "Phản hồi nhanh",
      desc: "Kết quả trong 30 giây",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: Shield,
      title: "Bảo mật cao",
      desc: "Dữ liệu được mã hóa",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: Clock,
      title: "Lưu lịch sử",
      desc: "Truy cập mọi lúc",
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <div className="h-screen flex items-center justify-center p-3 lg:p-4">
      <div className="w-full max-w-7xl h-[86vh] flex gap-3">
        {/*  Left Side - Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-2 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold">AriX Pro</h1>
                <p className="text-[9px] text-muted-foreground">Phân tích thông minh</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                onClick={() => setShowClearConfirm(true)}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px]"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Desktop Clear Button */}
          {messages.length > 0 && (
            <div className="hidden lg:flex justify-end mb-1.5">
              <Button
                onClick={() => setShowClearConfirm(true)}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px]"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Xóa
              </Button>
            </div>
          )}

          <div className="flex-1 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl rounded-xl border border-gray-200/20 dark:border-gray-800/20 shadow-lg overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-3 lg:px-4 py-4 space-y-3">
              {showWelcome && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4 max-w-sm">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto shadow-md">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold mb-1">Chào mừng!</h2>
                      <p className="text-xs text-muted-foreground">
                        Nhập mã cổ phiếu hoặc câu hỏi
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-2.5 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-xs font-medium hover:border-purple-400 dark:hover:border-purple-600 hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-105"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-1.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-bold ${msg.sender === "bot"
                      ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    {msg.sender === "user" ? "U" : <Sparkles className="w-3 h-3" />}
                  </div>

                  <div className="flex-1 max-w-xl space-y-1.5">
                    <div
                      className={`rounded-lg px-3 py-2 ${msg.sender === "user"
                        ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white ml-auto"
                        : msg.type === "error"
                          ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                          : "bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                        }`}
                    >
                      {msg.sender === "bot" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none 
                          [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                          [&_p]:text-xs [&_p]:leading-relaxed [&_p]:my-2
                          [&_h1]:text-sm [&_h1]:font-bold [&_h1]:my-2 [&_h1]:leading-tight
                          [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:my-2 [&_h2]:leading-tight
                          [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:my-1.5 [&_h3]:leading-tight
                          [&_h4]:text-xs [&_h4]:font-medium [&_h4]:my-1.5 [&_h4]:leading-tight
                          [&_ul]:text-xs [&_ul]:my-2 [&_ul]:leading-relaxed
                          [&_ol]:text-xs [&_ol]:my-2 [&_ol]:leading-relaxed
                          [&_li]:text-xs [&_li]:my-1 [&_li]:leading-relaxed
                          [&_strong]:font-semibold [&_strong]:text-xs
                          [&_em]:italic [&_em]:text-xs
                          [&_table]:text-xs [&_table]:my-2
                          [&_th]:text-xs [&_th]:font-semibold [&_th]:px-2 [&_th]:py-1
                          [&_td]:text-xs [&_td]:px-2 [&_td]:py-1
                          [&_hr]:my-2 [&_hr]:border-gray-200 [&_hr]:dark:border-gray-700
                          [&_blockquote]:text-xs [&_blockquote]:my-2 [&_blockquote]:pl-3 [&_blockquote]:border-l-2
                          [&_code]:text-[11px] [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-xs">{msg.content}</p>
                      )}
                    </div>

                    {msg.data?.type === "stock_analysis" && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400">
                          <TrendingUp className="w-2.5 h-2.5" />
                          {msg.data.ticker} • {msg.data.totalReportsAnalyzed} báo cáo
                        </div>

                        {msg.data.usage && (
                          <div className="text-[8px] text-muted-foreground">
                            {(msg.data.usage.total_tokens / 1000).toFixed(1)}k •{" "}
                            {Math.round(msg.data.queryAnalysis.confidence * 100)}%
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-[8px] text-muted-foreground">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg px-3 py-2 flex items-center gap-1">
                    <div className="flex gap-0.5">
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200/20 dark:border-gray-800/20 bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl p-2.5">
              <div className="flex items-end gap-1.5">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập mã cổ phiếu..."
                  maxLength={500}
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 px-2.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 placeholder:text-muted-foreground"
                  style={{ minHeight: "36px", maxHeight: "80px" }}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = "36px";
                    t.style.height = t.scrollHeight + "px";
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 shadow-sm shadow-purple-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="hidden lg:flex lg:w-[340px] flex-col">
          <div className="mb-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 blur-lg opacity-30" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AriX Pro
                </h1>
                <p className="text-[10px] text-muted-foreground">Phân tích thông minh</p>
              </div>
            </div>

            <p className="text-muted-foreground text-xs leading-snug">
              Mô hình AriX Pro độc quyền của IQX, tổng hợp dữ liệu từ các công ty chứng khoán hàng đầu.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            <h2 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              Tính năng
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-lg p-2.5 border border-gray-200/20 dark:border-gray-800/20 hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all hover:scale-105 cursor-pointer"
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow`}>
                    <feature.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="font-semibold text-[11px] mb-0.5 leading-tight">{feature.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-lg p-3 border border-purple-200/20 dark:border-purple-800/20">
              <h3 className="font-semibold text-[11px] mb-2 flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-purple-600" />
                Thống kê
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    99%
                  </div>
                  <div className="text-[9px] text-muted-foreground">Chính xác</div>
                </div>
                <div>
                  <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    &lt;30s
                  </div>
                  <div className="text-[9px] text-muted-foreground">Thời gian</div>
                </div>
                <div>
                  <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    24/7
                  </div>
                  <div className="text-[9px] text-muted-foreground">Hoạt động</div>
                </div>
              </div>
            </div>

            {/* API Usage Display */}
            <div className="mt-3">
              <ApiUsageDisplay 
                usage={usage} 
                isLoading={isLoadingUsage} 
                onRefresh={fetchUsage}
                compact={false}
              />
            </div>

            <div className="mt-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-3 text-white shadow-md">
              <h3 className="font-bold text-xs mb-1">Bắt đầu phân tích</h3>
              <p className="text-[10px] opacity-90 mb-2">
                Nhập mã cổ phiếu bên phải
              </p>
              <div className="flex items-center gap-1 text-[9px] opacity-80">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Powered by IQX</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-xs w-full shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-xs mb-0.5">Xóa lịch sử?</h3>
                <p className="text-[10px] text-muted-foreground">Không thể hoàn tác</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowClearConfirm(false)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleClearHistory}
                  variant="destructive"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                >
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
