import { useState, useCallback, useRef, useEffect } from "react";
import type { AriXProChatMessage, UsageResponse, StatsResponse } from "@/types/arix-pro";
import { ariXProService } from "@/services/arix-pro.service";

const STORAGE_KEY = "arix_pro_chat_history";

export function useAriXPro() {
  const [messages, setMessages] = useState<AriXProChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: AriXProChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
    }
  }, [messages]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const generateMessageId = () => {
    return "msg_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
  };

  const addMessage = useCallback(
    (
      content: string,
      sender: "user" | "bot",
      data?: AriXProChatMessage["data"],
      type?: AriXProChatMessage["type"]
    ) => {
      const message: AriXProChatMessage = {
        id: generateMessageId(),
        content,
        sender,
        timestamp: new Date(),
        data,
        type,
      };
      setMessages((prev) => [...prev, message]);
      return message;
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string, model?: string) => {
      if (!content.trim() || isLoading) return;

      // Add user message
      addMessage(content, "user");
      setIsLoading(true);

      try {
        const response = await ariXProService.chat({
          message: content,
          model,
        });

        if (response.success) {
          addMessage(response.message, "bot", response);
        } else {
          addMessage(
            "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
            "bot",
            undefined,
            "error"
          );
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        addMessage(errorMessage, "bot", undefined, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, addMessage]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    ariXProService.resetSession();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  }, []);

  const fetchUsage = useCallback(async () => {
    setIsLoadingUsage(true);
    try {
      const usageData = await ariXProService.getUsage();
      setUsage(usageData);
      return usageData;
    } catch (error) {
      console.error("Error fetching usage:", error);
      throw error;
    } finally {
      setIsLoadingUsage(false);
    }
  }, []);

  const fetchStats = useCallback(async (days: number = 7): Promise<StatsResponse> => {
    try {
      return await ariXProService.getStats(days);
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }, []);

  return {
    messages,
    isLoading,
    messagesEndRef,
    sendMessage,
    clearHistory,
    usage,
    isLoadingUsage,
    fetchUsage,
    fetchStats,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("fetch")) {
      return "Không thể kết nối đến AriX Pro. Vui lòng kiểm tra kết nối mạng.";
    }
    if (error.message.includes("404")) {
      return "Không tìm thấy thông tin yêu cầu.";
    }
    if (error.message.includes("500")) {
      return "Lỗi server. Vui lòng thử lại sau.";
    }
    return error.message;
  }
  return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
}

// Utility functions
export const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const sanitizeHTML = (str: string) => {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

