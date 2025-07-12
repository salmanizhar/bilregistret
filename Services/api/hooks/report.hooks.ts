import { useMutation } from '@tanstack/react-query';
import { reportService, ReportProblemRequest, ReportProblemResponse } from '../services/report.service';

/**
 * Hook for submitting problem reports
 * @returns A mutation function for submitting reports
 */
export function useSubmitReport() {
    return useMutation<ReportProblemResponse, Error, ReportProblemRequest>({
        mutationFn: (data) => reportService.submitReport(data),
        onError: (error) => {
            console.error('Error submitting report:', error);
        }
    });
}