import { BaseUrl } from '@/constants/commonConst';
import { getApiHeaders } from '@/utils/apiHeaders';
import { getAuthToken } from '@/utils/storage';
import { useMutation, useQuery, UseMutationOptions, UseQueryOptions, QueryKey, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = BaseUrl.url

export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
    error?: string;
}

export interface ApiError {
    message: string;
    status: number;
    error?: string;
}

async function fetchApi<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getAuthToken();
    const headers = await getApiHeaders();
    // const headers: HeadersInit = {
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json',
    //     ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    // };

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: headers,
    });

    if (!response.ok) {
        const error: ApiError = {
            message: 'An error occurred during the request',
            status: response.status,
        };

        try {
            const errorData = await response.json();
            error.message = errorData.message || errorData.error || error.message;
        } catch {
            // If parsing json fails, use default error message
        }

        throw error;
    }

    return response.json();
}

export function useApiQuery<T>(
    key: QueryKey,
    url: string,
    options?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
) {
    return useQuery<T, ApiError>({
        queryKey: key,
        queryFn: () => fetchApi<T>(url),
        ...options,
    });
}

export function useApiMutation<T, TVariables>(
    url: string,
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
    options?: Omit<UseMutationOptions<T, ApiError, TVariables>, 'mutationFn'>
) {
    return useMutation<T, ApiError, TVariables>({
        mutationFn: (variables) =>
            fetchApi<T>(url, {
                method,
                body: JSON.stringify(variables),
            }),
        ...options,
    });
}

// Helper hook for invalidating queries
export function useInvalidateQueries() {
    const queryClient = useQueryClient();

    return (queryKey: QueryKey) => {
        return queryClient.invalidateQueries({ queryKey });
    };
}

// Export the query client hook
export function useApiQueryClient() {
    return useQueryClient();
}