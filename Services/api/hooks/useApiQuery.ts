import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { QueryParams, ApiErrorResponse } from '../types/api.types';

interface UseApiQueryOptions<TData, TError = ApiErrorResponse>
    extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
    queryKey: string[];
    queryFn: () => Promise<TData>;
    params?: QueryParams;
}

export function useApiQuery<TData, TError = ApiErrorResponse>({
    queryKey,
    queryFn,
    params,
    ...options
}: UseApiQueryOptions<TData, TError>): UseQueryResult<TData, TError> {
    const finalQueryKey = [...queryKey, params];

    return useQuery({
        queryKey: finalQueryKey,
        queryFn,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 2,
        ...options,
    });
}