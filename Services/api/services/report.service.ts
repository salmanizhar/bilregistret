import { apiClient } from '../config/api.config';
import { API_ROUTES } from '../routes/api.routes';

// Report problem request payload interface
export interface ReportProblemRequest {
    title: string;
    description: string;
    reportType: string;
    email: string;
}

// Report problem response interface
export interface ReportProblemResponse {
    success: boolean;
    message: string;
    data?: any;
}

/**
 * Service for reporting problems
 */
export const reportService = {
    /**
     * Submit a problem report
     * @param data Report problem data
     * @returns Promise with the response
     */
    async submitReport(data: ReportProblemRequest): Promise<ReportProblemResponse> {
        try {
            const response = await apiClient.post(API_ROUTES.REPORT_PROBLEM.POST_REPORT_PROBLEM, data);
            return response.data;
        } catch (error) {
            console.error('Error submitting problem report:', error);
            throw error;
        }
    }
};