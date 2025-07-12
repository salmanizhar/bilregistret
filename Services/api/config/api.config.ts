import axios, { AxiosRequestHeaders } from 'axios';
import { getAuthToken, clearAuthData } from '@/utils/storage';
import { BaseUrl } from '@/constants/commonConst';
import { getApiHeaders } from '@/utils/apiHeaders';
import { safeNavigation } from '@/utils/safeNavigation';
import { parseApiError } from '../utils/api.utils';

// Flag to prevent multiple redirects at once
let isRedirectingToLogin = false;

// Function to handle 401 unauthorized responses
export const handle401Error = async () => {
    // Prevent multiple simultaneous redirects
    if (isRedirectingToLogin) return;

    try {
        isRedirectingToLogin = true;

        // Clear authentication data
        await clearAuthData();

        // Set a flag to show session expired message
        if (typeof global !== 'undefined') {
            global.returnToPath = '401_redirect';
        }

        // Use setTimeout to ensure this happens after the current execution context
        setTimeout(() => {
            // Redirect to login screen using safe navigation
            safeNavigation('/(auth)/login');

            // Reset redirect flag after a short delay
            setTimeout(() => {
                isRedirectingToLogin = false;
            }, 500);
        }, 0);
    } catch (error) {
        // If there's an error during redirect, reset the flag
        isRedirectingToLogin = false;
    }
};

const getHeaders = async () => {
    const headers = await getApiHeaders();
    return headers;
}

// Create a base Axios instance with default configuration
export const apiClient = axios.create({
    baseURL: BaseUrl.url,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add auth token and handle requests
apiClient.interceptors.request.use(
    async (config) => {
        try {
            // Add auth token to headers if available

            // hide below line by sani on may 5 2025
            // const token = await getAuthToken();
            // if (token) {
            //     config.headers.Authorization = `Bearer ${token}`;
            // }

            //added by sani on may 5 2025
            const headers = await getHeaders();
            config.headers = headers as AxiosRequestHeaders;

            // Log outgoing requests in development
            // if (__DEV__) {
            //     // console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
            //         config.params || config.data || '');
            // }

            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common error patterns
apiClient.interceptors.response.use(
    (response) => {
        // // Log successful responses in development
        // if (__DEV__) {
        //     // console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        //         response.status, response.data ? '(has data)' : '(no data)');
        // }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Handle the 401 error with the centralized function
            await handle401Error();

            return Promise.reject(parseApiError(error));
        }

        // Log errors in development
        // if (__DEV__) {
        //     // console.log(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        //         error.response?.status || 'No Status', error.message);
        // }

        // Parse and return standardized error format
        return Promise.reject(parseApiError(error));
    }
);

export default apiClient;