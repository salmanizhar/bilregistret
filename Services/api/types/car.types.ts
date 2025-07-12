export interface CarSearchData {
    additionalData: {
        imageInfo: any;
    };
    car: {
        modell_id?: string;
        carlinkment?: string;
        Dackdimension_fram?: string;
        Dackdimension_bak?: string;
        dack_dim_fram?: string;
        dack_dim_bak?: string;
        ET_fram_tollerans?: string;
        ET_bak_tollerans?: string;
        BULTCIRKEL?: string;
        [key: string]: any;
    } | null;
    search: {
        date: string;
        id: string;
        isDuplicate: boolean;
        source: string;
        updatedAt: string;
    };
    imageSource?: 'TS' | 'CL' | null; // Track which endpoint provided the image
    hasValidImage?: boolean; // Track if we found a valid image URL in the data
    isError?: boolean; // Track if both CL and TS returned errors
}

// Remove the ApiResponse wrapper since the response comes directly
export type CarSearchResponse = CarSearchData;

export interface SimilarCar {
    regNr: string;
    displayName: string;
    distance: number;
    metadata: {
        make: string;
        model: string | null;
        year: number;
        color: string;
    };
}

export interface SimilarCarsResponse {
    similarCars: SimilarCar[];
    message: string;
}

export interface CarModel {
    ID: string;
    modelName: string;
    C_modell: string;
    C_merke: string;
    fuelType?: string;
    chassis?: string;
    seats?: number;
    year?: number;
    imageUrl?: string;
}

export interface FilterValue {
    fuelType: string | null;
    chassis: string | null;
    seats: number | null;
    yearRange: [number, number];
}

export interface CarModelItemProps {
    item: CarModel;
    onPress: (item: CarModel) => void;
    layoutType: number;
}

export interface CarBrandSpecificProps {
    merke_id: string;
    brand: string;
    c_merke: string;
} 