// src/services/news.service.ts
import { createHttp } from "@/lib/http";
import { news } from "@/lib/schemas";

const VietcapAiApi = createHttp(
  { baseURL: "https://ai.vietcap.com.vn/api/v2",
    headers: {
      "Referrer": `https://ai.vietcap.com.vn`
    }
   },
);

export async function getLatestNews(params?: { industry?: string; page_size?: number }) {
  const { data } = await VietcapAiApi.get<news.NewsResponse>("/news_info", {
    params: {
      industry: params?.industry ?? "",
      language: "vi",
      page_size: params?.page_size ?? 12,
    },
  });
  return news.NewsResponseSchema.parse(data);
}
