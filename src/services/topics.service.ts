import { createHttp } from "@/lib/http";
import { topics } from "@/lib/schemas";

const TopicsApi = createHttp({ baseURL: "https://proxy.iqx.vn/proxy/ai/api" });

export async function getAllTopics(language: "vi" | "en" = "vi") {
  const { data } = await TopicsApi.get<topics.TopicsAllResponse>("/topics_all", {
    params: { language },
  });
  return topics.TopicsAllResponseSchema.parse(data);
}


