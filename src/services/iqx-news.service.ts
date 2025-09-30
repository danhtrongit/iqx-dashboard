// src/services/iqx-news.service.ts
import { createHttp } from "@/lib/http";
import { news } from "@/lib/schemas";
import type { IqxNewsInfoRequest, IqxNewsResponse } from "@/lib/schemas/news";

const IqxApi = createHttp({
  baseURL: "https://proxy.iqx.vn/proxy/ai/api/v2",
});

export async function getIqxNewsInfo(params: Partial<IqxNewsInfoRequest> = {}) {
  // Build query parameters with proper encoding
  const queryParams = new URLSearchParams();

  queryParams.set('page', String(params.page ?? 1));
  queryParams.set('language', params.language ?? 'vi');
  queryParams.set('page_size', String(params.page_size ?? 12));

  if (params.ticker) queryParams.set('ticker', params.ticker);
  if (params.industry) queryParams.set('industry', params.industry);
  if (params.update_from) queryParams.set('update_from', params.update_from);
  if (params.update_to) queryParams.set('update_to', params.update_to);
  if (params.sentiment) queryParams.set('sentiment', params.sentiment);
  if (params.newsfrom) queryParams.set('newsfrom', params.newsfrom);

  const { data } = await IqxApi.get<IqxNewsResponse>(`/news_info?${queryParams.toString()}`);
  return news.IqxNewsResponseSchema.parse(data);
}

// Alternative method using axios params (in case the first method doesn't work correctly)
export async function getIqxNewsInfoAlt(params: Partial<IqxNewsInfoRequest> = {}) {
  const { data } = await IqxApi.get<IqxNewsResponse>("/news_info", {
    params: {
      page: params.page ?? 1,
      ticker: params.ticker ?? '',
      industry: params.industry ?? '',
      update_from: params.update_from ?? '',
      update_to: params.update_to ?? '',
      sentiment: params.sentiment ?? '',
      newsfrom: params.newsfrom ?? '',
      language: params.language ?? 'vi',
      page_size: params.page_size ?? 12,
    },
  });
  return news.IqxNewsResponseSchema.parse(data);
}