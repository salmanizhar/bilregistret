import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bilvarderingService } from '../services/bilvardering.service';
import { CreateBilvarderingProRequest } from '../types/bilvardering.types';
import { showSuccess, showError } from '@/utils/alert';

const QUERY_KEYS = {
    BILVARDERING_LIST: 'bilvardering-pro-list',
    BILVARDERING_DETAIL: 'bilvardering-pro-detail'
};

/**
 * Hook for creating a Bilvardering Pro record
 * @returns A mutation function for creating valuation records
 */
export function useCreateBilvarderingPro() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: CreateBilvarderingProRequest) =>
            bilvarderingService.createRecord(data),
        onSuccess: (response) => {
            if (response.success) {
                showSuccess('Sparad', 'Din värdering har registrerats');
                // Invalidate list queries to refetch
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BILVARDERING_LIST] });
            }
        },
        onError: (error: any) => {
            console.error('Failed to create Bilvardering Pro record:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            
            let errorMessage = 'Det gick inte att spara värderingen just nu';
            
            // Check for specific error types
            if (error.message?.includes('401') || error.message?.includes('403')) {
                errorMessage = 'Du har inte behörighet att spara värderingar';
            } else if (error.message?.includes('400')) {
                errorMessage = 'Kontrollera att alla uppgifter är korrekt ifyllda';
            } else if (error.message?.includes('500')) {
                errorMessage = 'Ett tekniskt fel uppstod. Försök igen senare';
            }
            
            showError('Kunde inte spara', errorMessage);
        }
    });
}

/**
 * Hook for fetching Bilvardering Pro records for the organization
 * @param regNum Optional registration number to filter by
 * @returns Query result with list of valuation records
 */
export function useBilvarderingProRecords(regNum?: string) {
    return useQuery({
        queryKey: [QUERY_KEYS.BILVARDERING_LIST, regNum],
        queryFn: () => bilvarderingService.getRecordsByOrganization(regNum),
        enabled: !!regNum, // Only fetch when regNum is provided
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    });
}

/**
 * Hook for fetching a specific Bilvardering Pro record
 * @param id The record ID
 * @returns Query result with the valuation record
 */
export function useBilvarderingProRecord(id: string) {
    return useQuery({
        queryKey: [QUERY_KEYS.BILVARDERING_DETAIL, id],
        queryFn: () => bilvarderingService.getRecordById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}