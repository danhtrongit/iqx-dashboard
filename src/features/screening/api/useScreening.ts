import { useQuery } from "@tanstack/react-query";
import { postScreeningPaging } from "@/services/screening.service";
import type { screening } from "@/lib/schemas";

export const screeningKeys = {
  all: ["screening"] as const,
  list: (body: screening.ScreeningRequest) =>
    [...screeningKeys.all, body] as const,
};

export function useScreening(body: screening.ScreeningRequest) {
  return useQuery({
    queryKey: screeningKeys.list(body),
    queryFn: () => postScreeningPaging(body),
    staleTime: 30_000,
    enabled: Boolean(body?.pageSize && body?.filter?.length >= 0),
  });
}


