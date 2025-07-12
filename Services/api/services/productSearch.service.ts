import { API_ROUTES } from '../routes/api.routes';
import {
  TickoProductsResponse,
  SkruvatProductsResponse,
  MekonomenProductsResponse,
  DrivknutenProductsResponse,
  DacklineProductsResponse,
  DacklineParams
} from '../types/product.types';
import { makeAuthenticatedRequest } from '../utils/api.utils';

export interface ProductSearchResponse {
  // ... keep existing interface
}

export class ProductSearchService {
  /**
   * Search for Ticko model products
   * @returns The Ticko products
   */
  async searchTickoProducts(): Promise<TickoProductsResponse> {
    try {
      const response = await makeAuthenticatedRequest(
        API_ROUTES.PRODUCTS.TICKO,
        { method: 'GET' }
      );
      return response.json();
    } catch (error: any) {
      // // console.log('Ticko search error:', error);
      this.logError(error);
      throw error;
    }
  }

  /**
   * Search for Skruvat products by model ID
   * @param modell_id The model ID to search for
   * @returns The Skruvat products matching the model ID
   */
  async searchSkruvatProducts(modell_id: string): Promise<SkruvatProductsResponse> {
    try {
      if (!modell_id) {
        throw new Error('Model ID is required');
      }

      const response = await makeAuthenticatedRequest(
        API_ROUTES.PRODUCTS.SKRUVAT(modell_id),
        { method: 'GET' }
      );
      return response.json();
    } catch (error: any) {
      // // console.log('Skruvat search error:', error);
      this.logError(error);
      throw error;
    }
  }

  /**
   * Search for Mekonomen products by model ID
   * @param modell_id The model ID to search for
   * @returns The Mekonomen products matching the model ID
   */
  async searchMekonomenProducts(modell_id: string): Promise<MekonomenProductsResponse> {
    try {
      if (!modell_id) {
        throw new Error('Model ID is required');
      }

      const response = await makeAuthenticatedRequest(
        API_ROUTES.PRODUCTS.MEKONOMEN(modell_id),
        { method: 'GET' }
      );
      return response.json();
    } catch (error: any) {
      // // console.log('Mekonomen search error:', error);
      this.logError(error);
      throw error;
    }
  }

  /**
   * Search for Drivknuten products by model ID or carlinkment ID
   * @param params Object containing model_id and/or carlinkment_id
   * @returns The Drivknuten products matching the criteria
   */
  async searchDrivknutenProducts(
    params: { modell_id?: string; carlinkment_id?: string }
  ): Promise<DrivknutenProductsResponse> {
    try {
      if (!params.modell_id && !params.carlinkment_id) {
        throw new Error('Either model ID or carlinkment ID is required');
      }

      const queryParams = new URLSearchParams();
      if (params.modell_id) {
        queryParams.append('modell_id', params.modell_id);
      }
      if (params.carlinkment_id) {
        queryParams.append('carlinkment_id', params.carlinkment_id);
      }

      const url = `${API_ROUTES.PRODUCTS.DRIVKNUTEN}?${queryParams.toString()}`;
      const response = await makeAuthenticatedRequest(url, { method: 'GET' });
      return response.json();
    } catch (error: any) {
      // // console.log('Drivknuten search error:', error);
      this.logError(error);
      throw error;
    }
  }

  /**
   * Search for Däckline products with specific parameters
   * @param params Object containing tire specifications and other parameters
   * @returns The matching Däckline products
   */
  async searchDacklineProducts(params: DacklineParams): Promise<DacklineProductsResponse> {
    try {
      const { tyres, et_min, et_max, pcd } = params;

      if (!tyres || !Array.isArray(tyres) || tyres.length === 0) {
        throw new Error('Valid tyres array is required');
      }

      if (et_min === undefined || et_max === undefined || !pcd) {
        throw new Error('ET min, ET max, and PCD are required');
      }

      const response = await makeAuthenticatedRequest(
        API_ROUTES.PRODUCTS.DACKLINE,
        {
          method: 'POST',
          body: JSON.stringify({ tyres, et_min, et_max, pcd })
        }
      );
      return response.json();
    } catch (error: any) {
      // // console.log('Däckline search error:', error);
      this.logError(error);
      throw error;
    }
  }

  /**
   * Get model car products from Ticko
   * @returns Products from Ticko
   */
  async getTickoProducts(): Promise<TickoProductsResponse> {
    try {
      const response = await makeAuthenticatedRequest(
        API_ROUTES.PRODUCTS.TICKO,
        { method: 'GET' }
      );
      return response.json();
    } catch (error: any) {
      // // console.log('Ticko search error:', error);
      this.logError(error);
      throw error;
    }
  }

  // Helper method to log detailed error information
  private logError(error: any) {
    if (error.response) {
      // // console.log('Error response data:', error.response.data);
      // // console.log('Error response status:', error.response.status);
      // // console.log('Error response headers:', error.response.headers);
    } else if (error.request) {
      // // console.log('Error request:', error.request);
    } else {
      // // console.log('Error message:', error.message);
    }
  }
}

// Export a singleton instance
export const productSearchService = new ProductSearchService();