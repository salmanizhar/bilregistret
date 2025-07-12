import { useApiQuery } from './useApiQuery';
import { useApiMutation } from './useApiMutation';
import { carService, CarBrand, CarModel, CarRegistrationData } from '../services/car.service';
import { API_ROUTES } from '../routes/api.routes';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../config/api.config';

interface QueryOptions {
    enabled?: boolean;
}

export function useCarBrands(options?: QueryOptions) {
    return useApiQuery<CarBrand[]>({
        queryKey: ['carBrands'],
        queryFn: () => carService.getCarBrands(),
        enabled: options?.enabled !== false,
    });
}

export function useCarModels(merke_id: string, options?: QueryOptions) {
    return useApiQuery<CarModel[]>({
        queryKey: ['carModels', merke_id],
        queryFn: () => carService.getCarModels(merke_id),
        enabled: !!merke_id && (options?.enabled !== false),
    });
}

export function useCarSubModels(c_merke: string, c_modell: string, options?: QueryOptions) {
    return useApiQuery<CarModel[]>({
        queryKey: ['carSubModels', c_merke, c_modell],
        queryFn: () => carService.getCarSubModels(c_merke, c_modell),
        enabled: !!c_merke && !!c_modell && (options?.enabled !== false),
    });
}

export function useRegisterCar() {
    return useApiMutation({
        mutationFn: (data: CarRegistrationData) => carService.registerCar(data),
    });
}

export const useCarSubModelBottomItems = (merke_id: string, c_modell: string, options?: QueryOptions) => {
    return useQuery({
        queryKey: ['carSubModelBottomItemsList', merke_id, c_modell],
        queryFn: () => carService.getCarSubModelBottomItems(merke_id, c_modell),
        enabled: !!merke_id && !!c_modell && (options?.enabled !== false),
    });
};