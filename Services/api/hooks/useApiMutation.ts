import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { ApiErrorResponse } from '../types/api.types';

interface UseApiMutationOptions<TData, TVariables, TError = ApiErrorResponse>
    extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
    mutationFn: (variables: TVariables) => Promise<TData>;
}

export function useApiMutation<TData, TVariables, TError = ApiErrorResponse>({
    mutationFn,
    ...options
}: UseApiMutationOptions<TData, TVariables, TError>): UseMutationResult<TData, TError, TVariables> {
    return useMutation({
        mutationFn,
        ...options,
    });
}