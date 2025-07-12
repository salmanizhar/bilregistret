import { useQuery } from '@tanstack/react-query';
import { packagesApiService, PackageResponse } from '../services/packages.service';
import { AllPackageData } from '@/constants/commonConst';

// Define package keys for query caching
export const packageKeys = {
    all: ['packagesList'] as const,
    lists: () => [...packageKeys.all, 'list'] as const,
};

// Use the local package type
export type UIPackage = typeof AllPackageData[0];

/**
 * Hook to fetch all packages
 */
export const usePackages = () => {

    return useQuery({
        queryKey: packageKeys.lists(),
        queryFn: async () => {
            try {
                // For now, we're just logging the API call but using local data
                const apiData = await packagesApiService.getAllPackages();

                // Return the local data to bypass icon mapping issues
                return apiData;
            } catch (error) {
                // // console.log('Error fetching packages:', error);
                // return AllPackageData;
                return false
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};