import { useQuery } from "@tanstack/react-query";
import { getTopicNews } from "@/services/topics.service";

export const topicNewsKeys = {
  all: ["topicNews"] as const,
  byTopic: (topic: string, language: "vi" | "en" = "vi", page = 1, pageSize = 12) =>
    [...topicNewsKeys.all, { topic, language, page, pageSize }] as const,
};

export function useTopicNews(topic: string, language: "vi" | "en" = "vi", page = 1, pageSize = 12) {
  return useQuery({
    queryKey: topicNewsKeys.byTopic(topic, language, page, pageSize),
    queryFn: () => getTopicNews(topic, language, page, pageSize),
    staleTime: 60_000,
  });
}