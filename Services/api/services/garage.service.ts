import { API_ROUTES } from '../routes/api.routes';
import { makeAuthenticatedRequest } from '../utils/api.utils';
import { Garage, GarageCar } from '../hooks/garage.hooks';

// Response interface for the garage API
interface GarageResponse {
    data: Garage[];
    message: string;
    success: boolean;
}

interface GarageCarResponse {
    data: GarageCar;
    message: string;
    success: boolean;
}

export const garageService = {
    /**
     * Get all garages for the current user
     * @returns Promise with the garages response
     */
    async getGarages(): Promise<Garage[]> {
        try {
            const response = await makeAuthenticatedRequest(
                API_ROUTES.GARAGE.GET_GARAGE_LISTS,
                { method: 'GET' }
            );

            // // console.log('response', response);
            if (!response.ok) {
                return []; // Return empty array on error
            }

            const result = await response.json();
            // // console.log('result', result);
            // Ensure we return an array even if the API response is malformed
            if (!result) {
                return [];
            }

            return result as Garage[];
        } catch (error) {
            return []; // Return empty array on error
        }
    },

    /**
     * Create a new garage
     * @param data Garage creation data
     * @returns Promise with the created garage
     */
    async createGarage(data: { name: string; description?: string }): Promise<Garage> {
        try {
            const response = await makeAuthenticatedRequest(
                API_ROUTES.GARAGE.POST_CREATE_GARAGE,
                {
                    method: 'POST',
                    body: JSON.stringify(data)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to create garage');
            }

            const result = await response.json();
            return result.data as Garage;
        } catch (error) {
            // console.error('Error creating garage:', error);
            throw error;
        }
    },

    /**
     * Add a car to a garage
     * @param garageId The ID of the garage to add the car to
     * @param data Car data to add
     * @returns Promise with the added car
     */
    async addCarToGarage(
        garageId: string,
        data: { reg_name: string; model?: string; brand?: string; year?: string }
    ): Promise<GarageCar> {
        try {
            const response = await makeAuthenticatedRequest(
                API_ROUTES.GARAGE.POST_ADD_CAR_TO_GARAGE(garageId),
                {
                    method: 'POST',
                    body: JSON.stringify(data)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to add car to garage');
            }

            const result = await response.json();
            return result.data as GarageCar;
        } catch (error) {
            // console.error('Error adding car to garage:', error);
            throw error;
        }
    },

    /**
     * Delete a car from a garage
     * @param garageId The ID of the garage
     * @param carId The ID of the car to delete
     * @returns Promise with the delete status
     */
    async deleteCarFromGarage(garageId: string, carId: string): Promise<void> {
        try {
            const response = await makeAuthenticatedRequest(
                API_ROUTES.GARAGE.DELETE_CAR_FROM_GARAGE(garageId, carId),
                { method: 'DELETE' }
            );

            if (!response.ok) {
                throw new Error('Failed to delete car from garage');
            }
        } catch (error) {
            // console.error('Error deleting car from garage:', error);
            throw error;
        }
    },

    /**
     * Delete a garage
     * @param garageId The ID of the garage to delete
     * @returns Promise with the delete status
     */
    async deleteGarage(garageId: string): Promise<void> {
        try {
            const response = await makeAuthenticatedRequest(
                API_ROUTES.GARAGE.DELETE_GARAGE(garageId),
                { method: 'DELETE' }
            );

            if (!response.ok) {
                throw new Error('Failed to delete garage');
            }
        } catch (error) {
            // console.error('Error deleting garage:', error);
            throw error;
        }
    }
};