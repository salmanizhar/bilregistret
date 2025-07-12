export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
}

export interface QueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    [key: string]: any;
}

export type ApiErrorResponse = {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
};

export interface MutationParams<T = any> {
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
}