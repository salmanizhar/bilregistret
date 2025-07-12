import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ROUTES } from '../routes/api.routes';
import { garageService } from '../services/garage.service';
import { useApiMutation } from './api.hooks';
import { useAuth } from '@/Services/api/context/auth.context';
import { showAlert } from '@/utils/alert';

// Define interfaces for API responses
export interface GarageCar {
    id: string;
    garage_id: string;
    reg_name: string;
    model: string;
    brand?: string;
    year?: string;
    created_at: string;
    updated_at: string;
}

export interface Garage {
    id: string;
    name: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    description?: string;
    GarageData: GarageCar[];
}

// Hook to get all garages
export const useGarages = (options?: { enabled?: boolean }) => {
    const { isGuestMode, isAuthenticated, user } = useAuth();

    // Combine authentication state with options.enabled
    // Only enabled when user is authenticated AND not in guest mode AND options.enabled is not false
    const isEnabled = isAuthenticated && !isGuestMode && (options?.enabled !== false);

    return useQuery({
        queryKey: ['garages', user?.id], // Include user ID in query key so it refetches when user changes
        queryFn: async () => {
            if (isGuestMode || !isAuthenticated) {
                return []
            }
            try {
                const result = await garageService.getGarages();
                return result || [];
            } catch (error) {
                console.error('Error fetching garages:', error);
                return []; // Return empty array instead of undefined
            }
        },
        enabled: isEnabled, // Use the combined enabled state
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    });
};


// Hook to create a new garage
export const useCreateGarage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string; description?: string }) => {
            return garageService.createGarage(data);
        },
        onSuccess: () => {
            // Invalidate all garage queries to refetch the updated list
            queryClient.invalidateQueries({ queryKey: ['garages'] });
        },
    });
};

// Hook to add a car to a garage
export const useAddCarToGarage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ garageId, data }: { garageId: string; data: { reg_name: string; model?: string; brand?: string; year?: string } }) => {
            return garageService.addCarToGarage(garageId, data);
        },
        onSuccess: () => {
            // Invalidate all garage queries to refetch the updated list
            queryClient.invalidateQueries({ queryKey: ['garages'] });
        },
        onError: (error) => {
            // console.log('error', error);
        },
    });
};

// Hook to delete a car from a garage
export const useDeleteCarFromGarage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ garageId, carId }: { garageId: string; carId: string }) => {
            return garageService.deleteCarFromGarage(garageId, carId);
        },
        onSuccess: () => {
            // Invalidate all garage queries to refetch the updated list
            queryClient.invalidateQueries({ queryKey: ['garages'] });
        },
    });
};

// Hook to delete a garage
export const useDeleteGarage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (garageId: string) => {
            return garageService.deleteGarage(garageId);
        },
        onSuccess: () => {
            // Invalidate all garage queries to refetch the updated list
            queryClient.invalidateQueries({ queryKey: ['garages'] });
        },
    });
};

// Helper function to check if a car is in any garage
export const isCarInGarage = (garages: Garage[] | undefined | null, regNumber: string | undefined | null): boolean => {
    if (!garages || !Array.isArray(garages) || !regNumber) return false;

    return garages.some(garage =>
        garage && garage.GarageData && Array.isArray(garage.GarageData) && garage.GarageData.some(car =>
            car && car.reg_name && car.reg_name.toLowerCase() === regNumber.toLowerCase()
        )
    );
};

// Helper function to get garage IDs that contain a specific car
export const getGarageIdsWithCar = (garages: Garage[] | undefined | null, regNumber: string | undefined | null): string[] => {
    if (!garages || !Array.isArray(garages) || !regNumber) return [];

    return garages
        .filter(garage =>
            garage && garage.GarageData && Array.isArray(garage.GarageData) && garage.GarageData.some(car =>
                car && car.reg_name && car.reg_name.toLowerCase() === regNumber.toLowerCase()
            )
        )
        .map(garage => garage.id);
};