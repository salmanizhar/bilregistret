import { API_ROUTES } from '../routes/api.routes';
import { 
    CreateBilvarderingProRequest, 
    BilvarderingProResponse, 
    BilvarderingProListResponse,
    BilvarderingProRecord 
} from '../types/bilvardering.types';
import { makeAuthenticatedRequest } from '../utils/api.utils';

export class BilvarderingService {
    /**
     * Create a new Bilvardering Pro record
     * @param data The valuation data to create
     * @returns The created record
     */
    async createRecord(data: CreateBilvarderingProRequest): Promise<BilvarderingProResponse> {
        const response = await makeAuthenticatedRequest(
            API_ROUTES.BILVARDERING_PRO.CREATE,
            {
                method: 'POST',
                body: JSON.stringify(data)
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Bilvardering Pro API error:', response.status, errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        
        return response.json();
    }

    /**
     * Get all Bilvardering Pro records for the organization
     * @param regNum Optional registration number to filter by
     * @returns List of valuation records
     */
    async getRecordsByOrganization(regNum?: string): Promise<BilvarderingProListResponse> {
        const queryParams = regNum 
            ? new URLSearchParams({ reg_num: regNum }).toString()
            : '';
        
        const url = queryParams 
            ? `${API_ROUTES.BILVARDERING_PRO.LIST}?${queryParams}`
            : API_ROUTES.BILVARDERING_PRO.LIST;

        const response = await makeAuthenticatedRequest(url, {
            method: 'GET'
        });
        return response.json();
    }

    /**
     * Get a specific Bilvardering Pro record by ID
     * @param id The record ID
     * @returns The valuation record
     */
    async getRecordById(id: string): Promise<BilvarderingProResponse> {
        const response = await makeAuthenticatedRequest(
            API_ROUTES.BILVARDERING_PRO.GET_BY_ID(id),
            {
                method: 'GET'
            }
        );
        return response.json();
    }
}

// Export singleton instance
export const bilvarderingService = new BilvarderingService();