import { useQuery } from "@tanstack/react-query";
import { AnalysisReportService } from "@/services/analysis-report.service";
import type { analysisReport } from "@/lib/schemas";

export const analysisReportKeys = {
  all: ["analysisReport"] as const,
  list: (params: analysisReport.AnalysisReportQuery) =>
    [...analysisReportKeys.all, "list", params] as const,
};

export function useAnalysisReports(params: analysisReport.AnalysisReportQuery) {
  return useQuery<analysisReport.AnalysisReportResponse>({
    queryKey: analysisReportKeys.list(params),
    queryFn: () => AnalysisReportService.getAnalysisReports(params),
    staleTime: 300_000, // 5 minutes
    enabled: Boolean(params?.ticker),
  });
}