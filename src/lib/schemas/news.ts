import { z } from "zod";

export const NewsItemSchema = z.object({
  id: z.string(),
  ticker: z.string().nullable(),
  industry: z.string().nullable(),
  news_title: z.string(),
  news_short_content: z.string(),
  news_source_link: z.string().url(),
  news_image_url: z.string().url().nullable(),
  update_date: z.string(),
  news_from: z.string(),
  news_from_name: z.string(),
  sentiment: z.string(),
  score: z.number(),
  slug: z.string(),
  male_audio_duration: z.number().nullable(),
  female_audio_duration: z.number().nullable(),
});

export const NewsResponseSchema = z.object({
  total_records: z.number(),
  name: z.string(),
  news_info: z.array(NewsItemSchema),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;
export type NewsResponse = z.infer<typeof NewsResponseSchema>;

// IQX News Info API Schema
export const IqxNewsItemSchema = z.object({
  id: z.string(),
  ticker: z.string(),
  industry: z.string(),
  news_title: z.string(),
  news_short_content: z.string().nullable(),
  news_source_link: z.string().url(),
  news_image_url: z.string().url(),
  update_date: z.string(),
  news_from: z.string(),
  news_from_name: z.string(),
  sentiment: z.string(),
  score: z.number(),
  slug: z.string(),
  male_audio_duration: z.number(),
  female_audio_duration: z.number(),
});

export const IqxNewsResponseSchema = z.object({
  total_records: z.number(),
  name: z.string(),
  news_info: z.array(IqxNewsItemSchema),
});

// Request parameters schema
export const IqxNewsInfoRequestSchema = z.object({
  page: z.number().default(1),
  ticker: z.string().optional(),
  industry: z.string().optional(),
  update_from: z.string().optional(),
  update_to: z.string().optional(),
  sentiment: z.string().optional(),
  newsfrom: z.string().optional(),
  language: z.enum(['vi', 'en']).default('vi'),
  page_size: z.number().default(12),
});

export type IqxNewsItem = z.infer<typeof IqxNewsItemSchema>;
export type IqxNewsResponse = z.infer<typeof IqxNewsResponseSchema>;
export type IqxNewsInfoRequest = z.infer<typeof IqxNewsInfoRequestSchema>;
