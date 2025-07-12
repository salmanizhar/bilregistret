import { API_ROUTES } from '../routes/api.routes';
import { BaseService } from './base.service';
import { apiClient } from '../config/api.config';

export interface PackageFeature {
    title: string;
    description: string;
}

export interface PackageResponse {
    id: number;
    name: string;
    packageName: string;
    icon: string;
    description: string;
    fullDescription: string;
    additionalInformation: string;
    price: string;
    priceDisplay: string;
    period: string;
    features: PackageFeature[];
}

class PackagesApiService {
    /**
     * Fetch all available packages
     * @returns List of packages
     */
    async getAllPackages(): Promise<PackageResponse[]> {
        const response = await apiClient.get(API_ROUTES.PACKAGES.ALL_PACKAGE_LIST);
        return response.data;
    }
}

export const packagesApiService = new PackagesApiService();