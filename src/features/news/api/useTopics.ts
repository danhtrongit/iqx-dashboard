import { useQuery } from "@tanstack/react-query";
import { getAllTopics } from "@/services/topics.service";

export const topicsKeys = {
  all: ["topics"] as const,
  allByLanguage: (language: "vi" | "en" = "vi") =>
    [...topicsKeys.all, { language }] as const,
};

export function useTopics(language: "vi" | "en" = "vi") {
  return useQuery({
    queryKey: topicsKeys.allByLanguage(language),
    queryFn: () => getAllTopics(language),
    staleTime: 60_000,
  });
}


