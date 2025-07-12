import { useMutation, useQuery } from '@tanstack/react-query';
import { productSearchService } from '../services/productSearch.service';
import {
  TickoProductsResponse,
  SkruvatProductsResponse,
  MekonomenProductsResponse,
  DrivknutenProductsResponse,
  DacklineProductsResponse,
  DacklineParams
} from '../types/product.types';
import { UseQueryOptions } from '@tanstack/react-query';

/**
 * Hook for searching Ticko model car products
 * @returns Query result for Ticko products
 */
export function useTickoProducts(options?: { enabled?: boolean }) {
  return useQuery<TickoProductsResponse>({
    queryKey: ['tickoProducts'],
    queryFn: () => productSearchService.searchTickoProducts(),
    enabled: options?.enabled !== false,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}

/**
 * Hook for searching Skruvat products by model ID
 * @param modellId The model ID to search for
 * @returns Query result for Skruvat products
 */
export function useSkruvatProducts(modellId: string, options?: { enabled?: boolean }) {
  return useQuery<SkruvatProductsResponse>({
    queryKey: ['skruvatProducts', modellId],
    queryFn: () => productSearchService.searchSkruvatProducts(modellId),
    enabled: !!modellId && (options?.enabled !== false),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}

/**
 * Hook for searching Mekonomen products by model ID
 * @param modellId The model ID to search for
 * @returns Query result for Mekonomen products
 */
export function useMekonomenProducts(modellId: string, options?: { enabled?: boolean }) {
  return useQuery<MekonomenProductsResponse>({
    queryKey: ['mekonomenProducts', modellId],
    queryFn: () => productSearchService.searchMekonomenProducts(modellId),
    enabled: !!modellId && (options?.enabled !== false),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}

/**
 * Hook for searching Drivknuten products by model ID or carlinkment ID
 * @param params Object containing model_id and/or carlinkment_id
 * @returns Query result for Drivknuten products
 */
export function useDrivknutenProducts(
  params: { modell_id?: string; carlinkment_id?: string },
  options?: { enabled?: boolean }
) {
  const { modell_id, carlinkment_id } = params;
  const hasParams = !!modell_id || !!carlinkment_id;

  return useQuery<DrivknutenProductsResponse>({
    queryKey: ['drivknutenProducts', modell_id, carlinkment_id],
    queryFn: () => productSearchService.searchDrivknutenProducts(params),
    enabled: hasParams && (options?.enabled !== false),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}

/**
 * Hook for searching Däckline products
 * @returns Mutation function for Däckline product search
 */
export function useDacklineProductSearch() {
  return useMutation<DacklineProductsResponse, Error, DacklineParams>({
    mutationFn: (params: DacklineParams) =>
      productSearchService.searchDacklineProducts(params),
    onError: (error: any) => {
      // // console.log('Däckline search error:', error);
    }
  });
}

/**
 * Helper function to parse ET tolerance from string
 * @param etTolerance The ET tolerance string (e.g., "från 20 till 40")
 * @returns Object with min and max ET values
 */
export function parseETTolerance(etTolerance: string): { et_min: number, et_max: number } | null {
  const regex = /från\s+(\d+)\s+till\s+(\d+)/i;
  const match = etTolerance.match(regex);

  if (match) {
    return {
      et_min: parseInt(match[1], 10),
      et_max: parseInt(match[2], 10)
    };
  }

  return null;
}