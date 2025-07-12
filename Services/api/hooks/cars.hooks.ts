import { useQuery, useMutation } from '@tanstack/react-query';
import { API_ROUTES } from '../routes/api.routes';
import { useApiMutation } from './api.hooks';
import { carService } from '../services/car.service';

interface QueryOptions {
    enabled?: boolean;
}

// Interface for the car model details request payload
export interface CarModelDetailsRequest {
    c_merke: string;
    c_modell: string;
    title: string;
}

export interface CarFordonDetailsRequest {
    title: string;
}

// Interface for car model details response
export interface CarModelDetailsResponse {
    Title: string;
    ID: string;
    modell_id: string;
    C_merke: string;
    merke_id: string;
    C_modell: string;
    BIL_MODELL_ID: string;
    MERKE_MODELL: string;
    C_typ: string;
    C_kw: string;
    C_hk: string;
    C_slagvolym: string;
    C_lit: string;
    C_cylinder: string;
    C_hjuldrift: string;
    MINI_AR: string;
    MAX_YEAR: string;
    HJUL_DRIFT_SAMLAD: string;
    C_bransle: string;
    BRANSLE_SAMLAD: string;
    C_kaross: string;
    kaross_samlad: string;
    C_motorkod: string;
    C_chassi: string | null;
    C_fran_ar: string;
    ar_fra: string;
    C_till_ar: string;
    ar_till: string;
    fake_till_AR: string | null;
    tcount: string;
    description: string;
    "Car Image": string;
    "high_res": string;
    "model description": string;
    "Mobile Image": string;
}

export interface CarFordonDetailsResponse {
    Title: string | null;
    ID: number;
    Created_Date: string;
    Updated_Date: string;
    Owner: string;
    All_data: string;
    REG_NR: string;
    merke_id: number;
    ANTALL_merke_id: number;
    TABLE_ID: number;
    BIL_MODELL_ID: number;
    MERKE_MODELL: number;
    modell_id: number;
    C_merke: string;
    link_NYA_12: string;
    C_merke_link: string;
    C_modell: string;
    C_typ: string;
    C_typ_2: string;
    C_bransle: string;
    C_bransle_2: string;
    C_kaross: string;
    C_kaross_2: string;
    Fordons_ar: number;
    C_vaxellada: string;
    Farg: string;
    farg_2: string;
    Tjanstevikt: number;
    Totalvikt: number;
    Registreringsdatum: number;
    Tillverkningsmanad: number | null;
    carImage: string | null;
    img_url: string;
    high_res: string;
}


/**
 * Hook to fetch car model details
 * @returns A mutation function for getting car model details
 */
export function useCarModelDetails() {
    return useApiMutation<CarModelDetailsResponse, CarModelDetailsRequest>(
        // API_ROUTES.CARS.POST_CAR_DETAILS_BY_MODEL_ID,
        API_ROUTES.CARS.POST_CAR_DETAILS_BY_SLUG,
        'POST'
    );
}

export const useCarModelDetailsBottomItems = (modell_id: string, options?: QueryOptions) => {
    return useQuery({
        queryKey: ['carModelDetailsBottomItems', modell_id],
        queryFn: () => carService.getCarModelDetailsBottomItems(modell_id),
        enabled: !!modell_id && (options?.enabled !== false),
    });
};

export function useFordonCarModelDetails() {
    return useApiMutation<CarFordonDetailsResponse[], CarFordonDetailsRequest>(
        // API_ROUTES.CARS.POST_CAR_DETAILS_BY_MODEL_ID,
        API_ROUTES.CARS.FORDON_DETAILS,
        'POST'
    );
}
export const useFordonCarModelDetailsBottomItems = (merke_id: string | number, c_modell: string, modell_id: string | number, fordons_ar: string | number, options?: QueryOptions) => {
    return useQuery({
        queryKey: ['fordonCarModelDetailsBottomItems', merke_id, c_modell, modell_id, fordons_ar],
        queryFn: () => carService.getFordonCarModelDetailsBottomItems(merke_id, c_modell, modell_id, fordons_ar),
        enabled: !!merke_id && !!c_modell && !!modell_id && !!fordons_ar && (options?.enabled !== false),
    });
};

// Add other car-related hooks below