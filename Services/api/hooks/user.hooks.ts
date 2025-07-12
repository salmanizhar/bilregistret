import { useApiQuery } from './useApiQuery';
import { useApiMutation } from './useApiMutation';
import { userService, DeleteAccountRequest, DeleteAccountResponse } from '../services/user.service';
import { User, CreateUserDto, UpdateUserDto } from '../types/user.types';
import { QueryParams } from '../types/api.types';
import { API_ROUTES } from '../routes/api.routes';
import { getAuthToken } from '@/utils/storage';
import { useApiQueryClient } from './api.hooks';
import { useMutation } from '@tanstack/react-query';
import { BaseUrl } from '@/constants/commonConst';
import { getDeviceIdHeader } from '@/utils/deviceId';
// Get query client for cache invalidation

const API_BASE_URL = BaseUrl.url

export interface UpdateProfileDto {
    name?: string;
    customer_email?: string;
    telephone_number?: string;
    organization_name?: string;
    organization_number?: string;
    address?: string;
    postort?: string;
    postnummer?: string;
    profile_picture?: string;
    dob?: string;
    country?: string;
}

export async function makeUserRequest<T>(endpoint: string, method: string, data?: any): Promise<T> {
    const token = await getAuthToken();
    const deviceIdHeader = await getDeviceIdHeader();


    // Check if data contains profile_picture to determine if we need FormData
    const hasProfilePicture = data && data.profile_picture;

    let body: string | FormData | undefined;
    let headers: HeadersInit;

    if (hasProfilePicture) {
        // Use FormData for profile picture upload
        const formData = new FormData();

        // Add all other fields to form data
        Object.keys(data).forEach(key => {
            if (key === 'profile_picture' && data[key]) {
                // Add profile picture as a file
                const uriParts = data[key].split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append('profile_picture', {
                    uri: data[key],
                    name: `profile-picture.${fileType}`,
                    type: `image/${fileType}`
                } as any);
                // formData.append('profile_picture', {
                //     uri: data[key],
                //     name: `profile-picture.png`,
                //     type: `image/png`
                // } as any);

                // // console.log("formData profile picture", {
                //     uri: data[key],
                //     name: `profile-picture.png`,
                //     type: `image/png`
                // })
            } else if (data[key] !== undefined && data[key] !== null) {
                // Add all other fields as strings
                formData.append(key, data[key].toString());
            }
        });

        body = formData;
        headers = {
            'Accept': 'application/json',
            ...deviceIdHeader,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    } else {
        // Use JSON for regular requests
        body = data ? JSON.stringify(data) : undefined;
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...deviceIdHeader,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    // console.log("Profile update paylaod", JSON.stringify(body, null, 2))
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body,
    });
    // console.log("Profile update response", JSON.stringify(response, null, 2))
    if (!response.ok) {
        throw new Error('User request failed');
    }
    // // console.log("Profile update response", response.json())
    return response.json();
}

export function useUsers(params?: QueryParams) {
    return useApiQuery({
        queryKey: ['users'],
        queryFn: () => userService.getAll(params),
    });
}

export function useUser(id: string) {
    return useApiQuery({
        queryKey: ['users', id],
        queryFn: () => userService.getById(id),
        enabled: !!id,
    });
}

export function useCreateUser() {
    return useApiMutation({
        mutationFn: (data: CreateUserDto) => userService.createUser(data),
    });
}

export function useUpdateUser() {
    return useApiMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
            userService.updateUser(id, data),
    });
}

export function useDeleteUser() {
    return useApiMutation({
        mutationFn: (id: string) => userService.deleteUser(id),
    });
}

export function useUpdateProfile() {
    const queryClient = useApiQueryClient();
    return useApiMutation({
        mutationFn: (data: UpdateProfileDto) => makeUserRequest('/user/profile', 'PUT', data),
        onSuccess: (data) => {
            // // console.log("Update profile success", data)
            // Invalidate the currentUser query to force a refetch
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });

            // Invalidate any other potentially related queries
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
        }
    });
}

/**
 * Hook for deleting or deactivating a user account
 * @returns A mutation function for account deletion
 */
export function useDeleteAccount() {
    return useMutation<DeleteAccountResponse, Error, DeleteAccountRequest>({
        mutationFn: (data) => userService.deleteAccount(data),
        onError: (error) => {
            console.error('Error deleting account:', error);
        }
    });
}