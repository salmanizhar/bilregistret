import { makeAuthenticatedRequest } from '../utils/api.utils';
import { API_ROUTES } from '../routes/api.routes';
import { SimilarCarsResponse } from '../types/car.types';

export interface CarBrand {
    id: number;
    merke_id: number;
    title: string;
    brandimage: string;
    bannerimage: string;
    country_code: string;
    flags: string;
}

export interface CarModel {
    import_nr: string | null;
    MAX_YEAR: string;
    MERKE_MODELL: string;
    merke_id: string;
    C_kw: string;
    kolla_upp: string | null;
    C_slagvolym: string;
    modell_id: string;
    C_cylinder: string;
    "Media Gallery": string | null;
    Image1: string | null;
    Image2: string | null;
    Image3: string | null;
    Image4: string | null;
    BIL_MODELL_ID: string;
    ar_fra: string;
    MINI_AR: string;
    ar_till: string;
    fake_till_AR: string | null;
    tcount: string;
    minSeats: string;
    maxSeats: string;
    t_count: string;
    "Car Image": string;
    ImageURL?: string;
    ID: string;
    C_merke: string;
    C_modell: string;
    C_typ: string;
    C_hk: string;
    C_lit: string;
    C_hjuldrift: string;
    HJUL_DRIFT_SAMLAD: string;
    C_bransle: string;
    BRANSLE_SAMLAD: string;
    C_kaross: string;
    kaross_samlad: string;
    C_motorkod: string;
    C_chassi: string;
    C_fran_ar: string;
    C_till_ar: string;
    info_om_datan: string | null;
    Title: string;
    _id: string;
}

export interface CarRegistrationData {
    regNrCar: string;
    regNrSlap: string;
    modellid: number;
    korkortsbehorighet: 'B96' | 'B' | 'BE';
    registreringsnummerBil?: string;
    registreringsnummerSläp?: string;
    rekommenderadKorkortsbehorighet?: string | null;
    data?: {
        bil: {
            tjänstevikt: number;
            totalvikt: number;
            maxBromsad: number;
            maxObromsad: number;
            tågvikt: number;
        };
        släp: {
            tjänstevikt: number;
            totalvikt: number;
            maxLastvikt: number;
            lastvikt: number;
            bromsad: boolean;
            fordonsinformation: string;
        };
    };
    resultat?: {
        bilStatus: 'success' | 'warning' | 'error';
        släpStatus: 'success' | 'warning' | 'error';
        meddelanden: string[];
        förklaring: string;
    };
}

export class CarService {
    async getCarBrands(): Promise<CarBrand[]> {
        const response = await makeAuthenticatedRequest(API_ROUTES.CARS.BRANDS, { method: 'GET' });
        return response.json();
    }

    async getCarModels(c_merke: string): Promise<CarModel[]> {
        const response = await makeAuthenticatedRequest(API_ROUTES.CARS.MODELS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ c_merke }),
        });
        return response.json();
    }

    async getCarSubModels(c_merke: string, c_modell: string): Promise<CarModel[]> {
        const response = await makeAuthenticatedRequest(API_ROUTES.CARS.SUB_MODELS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ c_merke, c_modell }),
        });
        return response.json();
    }

    async getCarSubModelBottomItems(merke_id: string, c_modell: string): Promise<CarModel[]> {
        const response = await makeAuthenticatedRequest(API_ROUTES.CARS.SUB_MODEL_BOTTOM_ITEMS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ merke_id, c_modell }),
        });
        return response.json();
    }

    async getCarModelDetailsBottomItems(modell_id: string): Promise<CarModel[]> {
        const response = await makeAuthenticatedRequest(API_ROUTES.CARS.DETAILS_BOTTOM_ITEMS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ modell_id }),
        });
        return response.json();
    }

    async getFordonCarModelDetailsBottomItems(merke_id: string | number, c_modell: string, modell_id: string | number, fordons_ar: string | number): Promise<CarModel[]> {
        const response = await makeAuthenticatedRequest(API_ROUTES.CARS.FORDON_DETAILS_BOTTOM_ITEMS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ merke_id, c_modell, modell_id, fordons_ar }),
        });
        return response.json();
    }

    async getSimilarCars(regNr: string): Promise<SimilarCarsResponse> {
        const encodedRegNr = encodeURIComponent(regNr.replace(/\s+/g, ''));
        const response = await makeAuthenticatedRequest(`/cars/${encodedRegNr}/similar`, { method: 'GET' });
        return response.json();
    }

    async registerCar(data: CarRegistrationData): Promise<CarRegistrationData> {
        // console.log('Registering car with data:', {
        //    regNrCar: data.regNrCar,
        //    regNrSlap: data.regNrSlap,
        //    modellid: data.modellid,
        //    kortkort: data.korkortsbehorighet
        //});

        const requestData = {
            regNrCar: data.regNrCar.replace(/\s+/g, ''),
            regNrSlap: data.regNrSlap.replace(/\s+/g, ''),
            modellid: data.modellid,
            korkortsbehorighet: data.korkortsbehorighet
        };

        // console.log('Sending request with data:', requestData);

        const response = await makeAuthenticatedRequest(API_ROUTES.CARS.TRAILER_CALCULATOR, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        const responseData = await response.json();
        // console.log('Received response:', responseData);
        return responseData;
    }
}

export const carService = new CarService();