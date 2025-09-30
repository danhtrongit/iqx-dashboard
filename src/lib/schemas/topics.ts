import { z } from "zod";
import { NewsItemSchema } from "./news";

export const TopicSchema = z.object({
  name: z.string(),
  key: z.string(),
  news: z.array(NewsItemSchema),
});

export const TopicsAllResponseSchema = z.object({
  static_topic: z.array(TopicSchema),
  dynamic_topic: z.array(TopicSchema),
});

export type Topic = z.infer<typeof TopicSchema>;
export type TopicsAllResponse = z.infer<typeof TopicsAllResponseSchema>;


