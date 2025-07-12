import { apiClient } from '../config/api.config';
import { API_ROUTES } from '../routes/api.routes';

// Contact API response type
export interface ContactInfoResponse {
    success: boolean;
    data: {
        address: string;
        email: string;
        phone: string;
    };
}

// Contact form submission payload type
export interface ContactFormPayload {
    name: string;
    email: string;
    phoneNumber: string;
    subject: string;
    message: string;
}

// Contact form submission response type
export interface ContactFormResponse {
    success: boolean;
    message?: string;
}

/**
 * Service for handling contact-related API calls
 */
export const contactService = {
    /**
     * Get contact information for the company
     * @returns Promise with contact information
     */
    async getContactInfo(): Promise<ContactInfoResponse> {
        try {
            const response = await apiClient.get(API_ROUTES.CONTACT.GET_CONTACT_US);
            return response.data;
        } catch (error) {
            // console.error('Error fetching contact information:', error);
            throw error;
        }
    },

    /**
     * Submit contact form information
     * @param data Contact form data
     * @returns Promise with contact form submission response
     */
    async submitContactForm(data: ContactFormPayload): Promise<ContactFormResponse> {
        try {
            const response = await apiClient.post(API_ROUTES.CONTACT.POST_CONTACT_US, data);
            return response.data;
        } catch (error) {
            // console.error('Error submitting contact form:', error);
            throw error;
        }
    }
};