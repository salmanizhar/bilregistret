import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { makeAuthenticatedRequest } from '../utils/api.utils';

export abstract class BaseService<T> {
    protected constructor(protected endpoint: string) {}

    async getAll(params?: Record<string, any>): Promise<PaginatedResponse<T>> {
        const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
        const response = await makeAuthenticatedRequest(`${this.endpoint}${queryString}`, { method: 'GET' });
        return response.json();
    }

    async getById(id: string): Promise<ApiResponse<T>> {
        const response = await makeAuthenticatedRequest(`${this.endpoint}/${id}`, { method: 'GET' });
        return response.json();
    }

    async create(data: Partial<T>): Promise<ApiResponse<T>> {
        const response = await makeAuthenticatedRequest(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
        const response = await makeAuthenticatedRequest(`${this.endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async delete(id: string): Promise<ApiResponse<void>> {
        const response = await makeAuthenticatedRequest(`${this.endpoint}/${id}`, { method: 'DELETE' });
        return response.json();
    }
}