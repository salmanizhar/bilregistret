import NetInfo from '@react-native-community/netinfo';
import { ApiError, ApiResponse } from '../types/api.types';
import { BaseUrl } from '@/constants/commonConst';
import { getApiHeaders } from '@/utils/apiHeaders';
import { handle401Error } from '../config/api.config';
import { API_ROUTES } from '../routes/api.routes';
import { safeNavigation } from '@/utils/safeNavigation';

// Feature flag for mock API mode (use in tests or when developing offline)
export const MOCK_API_MODE = false;

// Flag to prevent multiple redirects
let isRedirectingToMaxSearch = false;

// Base API URL with proper slash handling
export const API_BASE_URL = BaseUrl.url?.replace(/\/+$/, '');

// Helper function to check if user is in guest mode
export const checkGuestMode = (isGuestMode: boolean, isAuthenticated: boolean): boolean => {
    if (isGuestMode || !isAuthenticated) return true;
    return false;
};

/**
 * Get authentication headers for API requests
 * @returns Promise<Headers> - Headers with auth token if available
 */
/**
 * Make an authenticated API request
 * @param endpoint - The API endpoint
 * @param options - Fetch options
 * @returns Promise<Response>
 */

// Function to handle redirection to MaxSearchReached with debounce
const redirectToMaxSearch = () => {
    if (isRedirectingToMaxSearch) return;

    try {
        isRedirectingToMaxSearch = true;

        // Use setTimeout to navigate
        setTimeout(() => {
            try {
                safeNavigation('/');
                setTimeout(() => {
                    safeNavigation('/(main)/rast');
                    setTimeout(() => {
                        isRedirectingToMaxSearch = false;
                    }, 300);
                }, 50);
            } catch (navError) {
                console.error('Navigation error:', navError);
                isRedirectingToMaxSearch = false;
            }
        }, 0);
    } catch (error) {
        // If there's an error during redirect, reset the flag
        isRedirectingToMaxSearch = false;
        console.error('Error redirecting to MaxSearchReached:', error);
    }
};

export async function makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const headers = await getApiHeaders();
    const url = buildApiUrl(endpoint);



    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    });

    // // console.log(' response status -- ', response.status);

    // Allow 202 Accepted responses (for pending approval)
    if (response.status === 202) {
        return response;
    }

    if (!response.ok) {
        // Special handling for 401 errors - use the centralized handler
        if (response.status === 401) {
            // // console.log(' car details 401 error url tracking -- ', url);
            // Use the centralized 401 error handler
            if ((endpoint.includes(API_ROUTES.USER.SEARCH_HISTORY) || endpoint.includes(API_ROUTES.USER.GARAGE))) {
                // return nothing as we're handling search 401 differently for logged in users
            } else {
                await handle401Error();
                throw new Error('Your session has expired. Please log in again.');
            }
        }

        // Special handling for 403 errors - bypass premium restriction
        if (response.status === 403) {
            if (endpoint.includes(API_ROUTES.USER.SEARCH_CAR_ROUTE) || endpoint.includes(API_ROUTES.USER.GARAGE)) {
                redirectToMaxSearch();
            }
            // If this is a car search or vehicle data request, return a successful mock response
            if (endpoint.includes('USER.SEARCH') || endpoint.includes('cars/')) {
                // // console.log('Bypassing premium restriction for vehicle search');
                // Create a mock successful response instead of throwing an error
                return new Response(JSON.stringify({
                    success: true,
                    message: "Search successful",
                    car: {} // Empty car object that the UI will handle
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else {
            const errorData = await response.json();
            throw {
                message: errorData.error,
                data: errorData,
                status: response.status,
            };
        }

        // Try to parse error message from response
        // try {
        //     const errorData = await response.json();
        //     // console.log('errorData -- ', errorData);
        //     throw {
        //         message: errorData.error,
        //         data: errorData,
        //         status: response.status,
        //     };
        // } catch (e) {
        //     const errorData = await response.json()
        //     throw {
        //         message: errorData.error,//getErrorMessageForStatus(response.status),
        //         status: response.status,
        //     };
        // }
    }

    return response;
}

/**
 * Build the full API URL for a given endpoint
 * @param endpoint - The API endpoint path
 * @returns string - The full API URL
 */
export function buildApiUrl(endpoint: string): string {
    const baseUrl = BaseUrl.url
    // Ensure we don't have double slashes in the URL
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Check if the device has internet connectivity
 * @returns Promise<boolean> - true if connected, false otherwise
 */
export const checkNetworkConnectivity = async (): Promise<boolean> => {
    // In mock mode, always return true
    if (MOCK_API_MODE) {
        return true;
    }

    try {
        const netInfo = await NetInfo.fetch();
        return netInfo.isConnected === true && netInfo.isInternetReachable === true;
    } catch (error) {
        // // console.log('Error checking network connectivity:', error);
        return false;
    }
};

/**
 * Get a human-readable error message for an HTTP status code
 * @param status - The HTTP status code
 * @returns string - A human-readable error message
 */
function getErrorMessageForStatus(status: number): string {
    switch (status) {
        case 400:
            return 'Bad request. Please check your input.';
        case 401:
            return 'Your session has expired. Please log in again.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 404:
            return 'The requested resource was not found.';
        case 500:
            return 'An internal server error occurred. Please try again later.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}

/**
 * Parse API error into a standard format
 * @param error - The error from the API call
 * @returns A standardized error object
 */
export function parseApiError(error: any): ApiError {
    // If it's a fetch error response
    if (error instanceof Response) {
        return {
            message: getErrorMessageForStatus(error.status),
            code: `HTTP_${error.status}`,
            errors: {}
        };
    }

    // If it's a network error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
            message: 'Network error. Please check your internet connection.',
            code: 'NETWORK_ERROR',
            errors: {}
        };
    }

    // If it's a timeout error
    if (error.name === 'AbortError') {
        return {
            message: 'Request timed out. Please try again.',
            code: 'TIMEOUT',
            errors: {}
        };
    }

    // For other types of errors
    if (error instanceof Error) {
        return {
            message: error.message,
            code: 'APPLICATION_ERROR',
            errors: {}
        };
    }

    // Default error structure
    return {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        errors: {}
    };
}

/**
 * Format API response for consistency
 * @param response - The raw API response
 * @returns A formatted API response
 */
export function formatApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
    return response.json().then(data => ({
        success: response.ok,
        data,
        message: response.statusText
    }));
}