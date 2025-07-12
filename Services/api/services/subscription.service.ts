import { apiClient } from '../config/api.config';
import { API_ROUTES } from '../routes/api.routes';

// Subscription cancellation request and response interfaces
export interface CancelSubscriptionRequest {
    date: string;
}

export interface CancelSubscriptionResponse {
    success: boolean;
    message: string;
    data?: any;
}

/**
 * Service for subscription operations
 */
export const subscriptionService = {
    /**
     * Cancel user subscription
     * @param data Request data containing cancellation date
     * @returns Promise with the response
     */
    async cancelSubscription(data: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse> {
        try {
            const response = await apiClient.post(API_ROUTES.SUBSCRIPTIONS.POST_CANCEL_SUBSCRIPTION, data);
            return response.data;
        } catch (error) {
            console.error('Error canceling subscription:', error);
            throw error;
        }
    }
};