import { User, CreateUserDto, UpdateUserDto, SearchHistoryResponse, GarageResponse } from '../types/user.types';
import { QueryParams } from '../types/api.types';
import { makeAuthenticatedRequest } from '../utils/api.utils';
import { API_ROUTES } from '../routes/api.routes';
import { apiClient } from '../config/api.config';
import { BaseUrl } from '@/constants/commonConst';

interface SearchHistoryItem {
    id: string;
    query: string;
    timestamp: string;
}

interface GarageData {
    id: string;
    reg_name: string;
    model: string;
}

interface Garage {
    name: string;
    GarageData: GarageData[];
}

// Add DeleteAccount interface
export interface DeleteAccountRequest {
    reason: string;
    status: 'delete' | 'deactivate';
    email: string;
    password: string;
}

export interface DeleteAccountResponse {
    success: boolean;
    message: string;
}

const API_BASE_URL = BaseUrl.url

export class UserService {
    async getAll(params?: QueryParams): Promise<User[]> {
        const response = await makeAuthenticatedRequest('/user', { method: 'GET' });
        return response.json();
    }

    async getById(id: string): Promise<User> {
        const response = await makeAuthenticatedRequest(`/user/${id}`, { method: 'GET' });
        return response.json();
    }

    async createUser(data: CreateUserDto): Promise<User> {
        const response = await makeAuthenticatedRequest('/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async updateUser(id: string, data: UpdateUserDto): Promise<User> {
        const response = await makeAuthenticatedRequest(`/user/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async deleteUser(id: string): Promise<void> {
        await makeAuthenticatedRequest(`/user/${id}`, { method: 'DELETE' });
    }

    async getSearchHistory(): Promise<SearchHistoryResponse> {
        const response = await makeAuthenticatedRequest(API_ROUTES.USER.SEARCH_HISTORY, { method: 'GET' });
        return response.json();
    }

    async getGarages(): Promise<GarageResponse[]> {
        const response = await makeAuthenticatedRequest(API_ROUTES.USER.GARAGE, { method: 'GET' });
        return response.json();
    }

    /**
     * Delete or deactivate user account
     * @param data Account deletion data
     * @returns Promise with deletion response
     */
    async deleteAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
        try {
            const response = await apiClient.post(API_ROUTES.DELETE_ACCOUNT.POST_DELETE_ACCOUNT, data);
            return response.data;
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    }
}

export const userService = new UserService();