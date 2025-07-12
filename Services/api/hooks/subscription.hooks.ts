import { useApiMutation, useApiQuery } from './api.hooks';
import { API_ROUTES } from '../routes/api.routes';
import { useMutation } from '@tanstack/react-query';
import {
  subscriptionService,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse
} from '../services/subscription.service';

interface ValidateCouponParams {
  couponCode: string;
  planId: string;
  purchaseAmount: number;
}

interface Discount {
  id: number;
  couponCode: string;
  discountPercent: number;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  minPurchaseAmount: string;
  maxDiscountAmount: string;
  applicablePlans: string[];
  createdAt: string;
  updatedAt: string;
}

interface ValidateCouponResponse {
  valid: boolean;
  discountAmount: number;
  discount: Discount;
  originalPrice: string;
  finalPrice: number;
}

interface BillingInfo {
  fullName: string;
  companyName: string;
  billingAddress: string;
  postalCode: string;
  city: string;
  telephoneNumber: string;
}

interface PlanFeature {
  title: string;
  description: string;
}

interface Plan {
  id: string;
  name: string;
  packageName: string | null;
  description: string;
  fullDescription: string | null;
  additionalInformation: string | null;
  price: string;
  priceDisplay: string;
  period: string;
  duration: number;
  searchesPerDay: number;
  features: PlanFeature[];
  icon: string;
  isActive: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pricing {
  originalPrice: string;
  finalPrice: number;
  discountApplied: boolean;
}

interface Subscription {
  Plan: Plan;
  autoRenew: boolean;
  billingAddress: string;
  billingEmail: string;
  city: string;
  companyName: string;
  companyNumber: string;
  country: string;
  createdAt: string;
  currentPeriodSearches: number;
  endDate: string;
  fullName: string;
  id: string;
  lastSearchDate: string | null;
  metadata: SubscriptionMetadata;
  paymentId: string | null;
  paymentMethod: string | null;
  planId: string;
  postalCode: string;
  startDate: string;
  status: string;
  telephoneNumber: string;
  updatedAt: string;
  userId: string;
}
interface SubscriptionMetadata {
  couponCode: string;
  finalPrice: number;
  originalPrice: string;
  previousPlanId: string;
  upgradeDate: string;
}
interface CreateSubscriptionRequest {
  planId: string;
  billingInfo: BillingInfo;
  couponCode?: string;
  paymentMethod: string;
}

interface CreateSubscriptionResponse {
  subscription: Subscription;
  message: string;
}

interface UpgradeSubscriptionRequest {
  planId: string;
  billingInfo: BillingInfo;
  couponCode?: string;
}

interface UpgradeSubscriptionResponse {
  subscription: Subscription;
  message: string;
}

export const useValidateCoupon = () => {
  return useApiMutation<ValidateCouponResponse, ValidateCouponParams>(
    API_ROUTES.SUBSCRIPTIONS.DISCOUNT_CUPON,
    'POST'
  );
};

export const useCreateSubscription = () => {
  return useApiMutation<CreateSubscriptionResponse, CreateSubscriptionRequest>(
    API_ROUTES.SUBSCRIPTIONS.CREATE,
    'POST'
  );
};

export const useUpgradeSubscription = () => {
  return useApiMutation<UpgradeSubscriptionResponse, UpgradeSubscriptionRequest>(
    API_ROUTES.SUBSCRIPTIONS.UPGRADE,
    'POST'
  );
};

export const useCurrentSubscription = () => {
  return useApiQuery<{ subscription: Subscription }>(
    ['currentSubscription'],
    API_ROUTES.SUBSCRIPTIONS.CURRENT_SUBSCRIPTION
  );
};

/**
 * Hook for canceling a subscription
 * @returns A mutation function for subscription cancellation
 */
export function useCancelSubscription() {
  return useMutation<CancelSubscriptionResponse, Error, CancelSubscriptionRequest>({
    mutationFn: (data) => subscriptionService.cancelSubscription(data),
    onError: (error) => {
      console.error('Subscription cancellation error:', error);
    }
  });
}