export interface ApiErrorResponse {
    code: string;
    message: string;
    status: number;
    timestamp: string;
}

export const parseApiError = (error: any): ApiErrorResponse => {
    return {
        code: error?.response?.status ? `HTTP_${error.response.status}` : 'UNKNOWN_ERROR',
        message: error?.message || 'An unexpected error occurred',
        status: error?.response?.status || 500,
        timestamp: new Date().toISOString(),
    };
}; 