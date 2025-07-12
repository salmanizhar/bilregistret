import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { carSearchService } from '../services/carSearch.service';
import { CarSearchData } from '../types/car.types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { flattenCarData } from '@/utils/carDataUtils';
import { carService } from '../services/car.service';
import { SimilarCarsResponse } from '../types/car.types';

/**
 * Hook for searching vehicles by license plate
 * @returns A mutation function for car searching
 */
export function useCarSearch() {
  return useMutation({
    mutationFn: (licensePlate: string) =>
      carSearchService.searchByLicensePlate(licensePlate),
    onError: (error: any) => {
      // // console.log('Car search error:', error);
    }
  });
}

/**
 * Deep merge function for merging car data objects
 * @param target The target object to merge into
 * @param source The source object to merge from
 * @returns The merged object
 */
function deepMergeCarData(target: any, source: any): any {
  if (!source) return target;
  if (!target) return source;

  // Handle arrays specially for car sections
  if (Array.isArray(target) && Array.isArray(source)) {
    // Create a map of target sections by title for quick lookup
    const targetMap = new Map();
    target.forEach(section => {
      if (section?.title) {
        targetMap.set(section.title, section);
      }
    });

    // First, process all source sections to maintain their order
    const mergedArray = source.map(sourceSection => {
      if (!sourceSection?.title) return sourceSection;

      const targetSection = targetMap.get(sourceSection.title);
      if (!targetSection) return sourceSection;

      // Remove from map to track which sections we've processed
      targetMap.delete(sourceSection.title);

      // Merge the section data while preserving the order of fields
      const mergedData = { ...sourceSection.data };
      if (targetSection.data) {
        // Add new fields from target while preserving order
        Object.entries(targetSection.data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            mergedData[key] = value;
          }
        });
      }

      return {
        ...sourceSection,
        ...targetSection,
        data: mergedData
      };
    });

    // Add any remaining target sections that weren't in the source
    targetMap.forEach(targetSection => {
      mergedArray.push(targetSection);
    });

    return mergedArray;
  }

  // Handle objects (including nested car data)
  if (source && typeof source === 'object' && !Array.isArray(source)) {
    const output = { ...target };

    // Process all source properties while preserving order
    Object.entries(source).forEach(([key, value]) => {
      // Skip null/undefined properties
      if (value === null || value === undefined) return;

      // If property exists in both and both are objects, recursively merge
      if (
        typeof value === 'object' &&
        value !== null &&
        typeof output[key] === 'object' &&
        output[key] !== null
      ) {
        output[key] = deepMergeCarData(output[key], value);
      } else {
        // Otherwise take the source value (overwrite)
        output[key] = value;
      }
    });

    return output;
  }

  return source;
}

/**
 * Validates if the provided image URL looks valid
 * @param url The image URL to validate
 * @returns boolean indicating if the URL appears valid
 */
function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (typeof url !== 'string') return false;
  if (url.includes('undefined') || url.includes('null')) return false;
  if (url.trim() === '') return false;
  return /^https?:\/\/.+/.test(url.trim());
}

function extractImageUrl(data: CarSearchData | null): string | null {
  if (!data) return null;

  // Check additionalData.imageInfo first
  if (data.additionalData?.imageInfo && isValidImageUrl(data.additionalData.imageInfo["Car Image"])) {
    // // console.log('🖼️ [Extract] Found image in additionalData:', data.additionalData.imageInfo["Car Image"]);
    return data.additionalData.imageInfo["Car Image"];
  }

  // Then check car data
  if (data.car && typeof data.car === 'object' && isValidImageUrl(data.car["Car Image"])) {
    // // console.log('🖼️ [Extract] Found image in car data:', data.car["Car Image"]);
    return data.car["Car Image"];
  }

  // // console.log('🖼️ [Extract] No valid image URL found');
  return null;
}

function extractHighResImageUrl(data: CarSearchData | null): string | null {
  if (!data) return null;

  // Check additionalData.imageInfo for high_res
  if (data.additionalData?.imageInfo && isValidImageUrl(data.additionalData.imageInfo["high_res"])) {
    return data.additionalData.imageInfo["high_res"];
  }

  return null;
}

/**
 * Hook for fetching vehicle data by license plate with optimized performance.
 * Uses parallel requests to both endpoints and returns the fastest response,
 * then merges data when both are available.
 *
 * @param licensePlate The vehicle's license plate
 * @param options Additional options for the query
 * @returns Query result with vehicle data, using the fastest response first
 */
export function useVehicleData(licensePlate: string, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<{
    mergedData: CarSearchData | null;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    carImageUrl: string | null;
    highResImageUrl: string | null;
    flattenedData: Record<string, any>;
  }>({
    mergedData: null,
    isLoading: true,
    isError: false,
    error: null,
    carImageUrl: null,
    highResImageUrl: null,
    flattenedData: {}
  });

  // Track query completions and errors
  const queriesCompletedRef = useRef({
    ts: false,
    cl: false,
    tsError: false,
    clError: false
  });

  // Format license plate by removing whitespace
  const formattedLicensePlate = licensePlate.replace(/\s/g, '');

  // Create parallel queries for both endpoints with optimized cache settings
  const results = useQueries({
    queries: [
      {
        queryKey: ['vehicleData', 'CL', formattedLicensePlate],
        queryFn: () => carSearchService.searchByLicensePlate(formattedLicensePlate),
        enabled: !!formattedLicensePlate && (options?.enabled !== false) && !queriesCompletedRef.current.clError,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: false, // Disable retries for 404 errors
      },
      {
        queryKey: ['vehicleData', 'TS', formattedLicensePlate],
        queryFn: () => carSearchService.searchByLicensePlateTS(formattedLicensePlate),
        enabled: !!formattedLicensePlate && (options?.enabled !== false) && !queriesCompletedRef.current.tsError,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: false, // Disable retries for 404 errors
      }
    ]
  });

  const [clQuery, tsQuery] = results;

  // Cleanup function to remove old queries
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['vehicleData', 'CL', formattedLicensePlate] });
      queryClient.removeQueries({ queryKey: ['vehicleData', 'TS', formattedLicensePlate] });
    };
  }, [formattedLicensePlate, queryClient]);

  // Handle CL data - this is where we get the image
  useEffect(() => {
    if (clQuery.data && !clQuery.isLoading) {
      const imageUrl = extractImageUrl(clQuery.data);
      const highResImageUrl = extractHighResImageUrl(clQuery.data);
      if (imageUrl || highResImageUrl) {
        setState(prev => ({ 
          ...prev, 
          carImageUrl: imageUrl,
          highResImageUrl: highResImageUrl
        }));
      }
      queriesCompletedRef.current.cl = true;

      // Update state with CL data immediately
      if (clQuery.data.car) {
        const flattenedData = flattenCarData(clQuery.data);
        setState(prev => ({
          ...prev,
          mergedData: clQuery.data,
          flattenedData,
          isLoading: !queriesCompletedRef.current.ts,
          isError: false,
          error: null
        }));
      }
    } else if (clQuery.isError) {
      queriesCompletedRef.current.cl = true;
      queriesCompletedRef.current.clError = true;

      // If TS also failed, show error
      if (queriesCompletedRef.current.tsError) {
        setState(prev => ({
          ...prev,
          isError: true,
          error: clQuery.error || tsQuery.error || new Error('Failed to fetch vehicle data'),
          isLoading: false,
          mergedData: {
            additionalData: { imageInfo: null },
            car: null,
            search: {
              date: new Date().toISOString(),
              id: '',
              isDuplicate: false,
              source: '',
              updatedAt: new Date().toISOString()
            },
            isError: true
          }
        }));
      }
    }
  }, [clQuery.data, clQuery.isLoading, clQuery.isError]);

  // Handle TS data - no image handling here
  useEffect(() => {
    if (tsQuery.data && !tsQuery.isLoading) {
      queriesCompletedRef.current.ts = true;

      // Update state with TS data immediately
      if (tsQuery.data.car) {
        const flattenedData = flattenCarData(tsQuery.data);
        setState(prev => ({
          ...prev,
          mergedData: tsQuery.data,
          flattenedData,
          isLoading: !queriesCompletedRef.current.cl,
          isError: false,
          error: null
        }));
      }
    } else if (tsQuery.isError) {
      queriesCompletedRef.current.ts = true;
      queriesCompletedRef.current.tsError = true;

      // If CL also failed, show error
      if (queriesCompletedRef.current.clError) {
        setState(prev => ({
          ...prev,
          isError: true,
          error: clQuery.error || tsQuery.error || new Error('Failed to fetch vehicle data'),
          isLoading: false,
          mergedData: {
            additionalData: { imageInfo: null },
            car: null,
            search: {
              date: new Date().toISOString(),
              id: '',
              isDuplicate: false,
              source: '',
              updatedAt: new Date().toISOString()
            },
            isError: true
          }
        }));
      }
    }
  }, [tsQuery.data, tsQuery.isLoading, tsQuery.isError]);

  // Final merging when both queries complete
  useEffect(() => {
    if (!(queriesCompletedRef.current.ts && queriesCompletedRef.current.cl)) {
      return;
    }

    if (queriesCompletedRef.current.tsError && queriesCompletedRef.current.clError) {
      return; // Error already handled in individual effects
    }

    const baseData = tsQuery.data || clQuery.data;

    if (!baseData) {
      return; // No data case already handled in individual effects
    }

    let finalCarData = baseData.car;
    if (clQuery.data?.car && tsQuery.data?.car) {
      finalCarData = deepMergeCarData(tsQuery.data.car, clQuery.data.car);
    }

    // Extract image URL from CL data if available
    const imageUrl = clQuery.data ? extractImageUrl(clQuery.data) : null;
    if (imageUrl && finalCarData && typeof finalCarData === 'object') {
      finalCarData["Car Image"] = imageUrl;
    }

    // Extract highResImageUrl from CL data if available
    const highResImageUrl = clQuery.data ? extractHighResImageUrl(clQuery.data) : null;
    if (highResImageUrl && finalCarData && typeof finalCarData === 'object') {
      finalCarData["high_res"] = highResImageUrl;
    }

    // Flatten the data for efficient lookups
    const flattenedData = finalCarData ? flattenCarData({
      additionalData: { imageInfo: null },
      car: finalCarData,
      search: {
        date: new Date().toISOString(),
        id: '',
        isDuplicate: false,
        source: '',
        updatedAt: new Date().toISOString()
      }
    }) : {};

    // Ensure the car data is in the correct format for the UI
    const formattedCarData = Array.isArray(finalCarData) ? finalCarData : [finalCarData];

    const finalMergedData = {
      ...baseData,
      car: formattedCarData,
      carImageUrl: imageUrl,
      highResImageUrl: highResImageUrl
    };

    setState(prev => ({
      ...prev,
      mergedData: finalMergedData,
      flattenedData: flattenedData,
      isLoading: false,
      isError: false,
      error: null
    }));
  }, [
    clQuery.data, clQuery.isLoading, clQuery.isError,
    tsQuery.data, tsQuery.isLoading, tsQuery.isError
  ]);

  const handleImageLoadError = useCallback(() => {
    setState(prev => ({ ...prev, carImageUrl: null }));
  }, []);

  const isSuccess = !state.isLoading && !state.isError && !!state.mergedData;

  return {
    data: state.mergedData,
    isLoading: state.isLoading,
    isError: state.isError,
    error: state.error,
    isSuccess,
    carImageUrl: state.carImageUrl,
    highResImageUrl: state.highResImageUrl,
    onImageLoadError: handleImageLoadError,
    flattenedData: state.flattenedData
  };
}

export const useSimilarCars = (regNr: string) => {
  const [data, setData] = useState<SimilarCarsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSimilarCars = async () => {
      if (!regNr) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await carService.getSimilarCars(regNr);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch similar cars'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarCars();
  }, [regNr]);

  return { data, isLoading, error };
};