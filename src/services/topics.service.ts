import { createHttp } from "@/lib/http";
import { topics } from "@/lib/schemas";

const TopicsApi = createHttp({ baseURL: "https://proxy.iqx.vn/proxy/ai/api" });

export async function getAllTopics(language: "vi" | "en" = "vi") {
  const { data } = await TopicsApi.get<topics.TopicsAllResponse>("/topics_all", {
    params: { language },
  });
  return topics.TopicsAllResponseSchema.parse(data);
}

export async function getTopicNews(topic: string, language: "vi" | "en" = "vi", page = 1, pageSize = 12) {
  const { data } = await TopicsApi.get("/topics_info", {
    params: { topic, language, page, page_size: pageSize },
  });
  return data;
}


