import { API_ROUTES } from '../routes/api.routes';
import { CarSearchData, CarSearchResponse } from '../types/car.types';
import { makeAuthenticatedRequest } from '../utils/api.utils';

export class CarSearchService {
  /**
   * Search for a vehicle by license plate number
   * @param licensePlate The license plate number to search for
   * @returns The search results with categorized car data
   */
  async searchByLicensePlate(licensePlate: string): Promise<CarSearchResponse> {
    const queryParams = new URLSearchParams({
      categorized: 'true',
      cleaned: 'true',
      includeUnits: 'true',
      basic: 'true',
      includeImage: 'true',
    }).toString();

    const response = await makeAuthenticatedRequest(
      `${API_ROUTES.USER.SEARCH(licensePlate)}?${queryParams}`,
      {
        method: 'GET'
      }
    );
    return response.json();
  }

  /**
   * Search for a vehicle by license plate number using the TS endpoint (faster)
   * @param licensePlate The license plate number to search for
   * @returns The search results with categorized car data and image
   */
  async searchByLicensePlateTS(licensePlate: string): Promise<CarSearchResponse> {
    const queryParams = new URLSearchParams({
      categorized: 'true',
      cleaned: 'true',
      includeUnits: 'true',
      basic: 'true',
    }).toString();

    const response = await makeAuthenticatedRequest(
      `${API_ROUTES.USER.SEARCHTS(licensePlate)}?${queryParams}`,
      {
        method: 'GET'
      }
    );
    return response.json();
  }


  async getCarDetails(carId: string): Promise<CarSearchResponse> {
    const response = await makeAuthenticatedRequest(
      API_ROUTES.CARS.DETAILS(carId),
      { method: 'GET' }
    );
    return response.json();
  }
}

// Export a singleton instance
export const carSearchService = new CarSearchService();