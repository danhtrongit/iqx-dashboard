import { createHttp } from "@/lib/http";
import { analysisReport } from "@/lib/schemas";

const ANALYSIS_REPORT_API_BASE_URL = "https://api2.simplize.vn/api";

const analysisReportHttp = createHttp({
  baseURL: ANALYSIS_REPORT_API_BASE_URL,
  timeout: 15000,
});

export class AnalysisReportService {
  static async getAnalysisReports(
    params: analysisReport.AnalysisReportQuery
  ): Promise<analysisReport.AnalysisReportResponse> {
    try {
      const validatedParams = analysisReport.AnalysisReportQuerySchema.parse(params);

      const response = await analysisReportHttp.get("/company/analysis-report/list", {
        params: validatedParams,
      });

      return analysisReport.AnalysisReportResponseSchema.parse(response.data);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch analysis reports"
      );
    }
  }
}