// src/features/news/api/useNews.ts
import { useQuery } from "@tanstack/react-query";
import { getLatestNews } from "@/services/news.service";

export const newsKeys = {
  all: ["news"] as const,
  list: (industry?: string, page_size?: number) =>
    [...newsKeys.all, { industry, page_size }] as const,
};

export function useNews(industry?: string, page_size?: number) {
  return useQuery({
    queryKey: newsKeys.list(industry, page_size),
    queryFn: () => getLatestNews({ industry, page_size }),
    staleTime: 60_000, // cache 1 phút
  });
}
