import { useMutation, useQuery } from '@tanstack/react-query';
import { contactService, ContactFormPayload } from '../services/contact.service';

/**
 * Hook to fetch contact information
 * @returns UseQuery result for contact information
 */
export function useContactInfo() {
    return useQuery({
        queryKey: ['contactInfo'],
        queryFn: () => contactService.getContactInfo(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 2,
    });
}

/**
 * Hook to submit contact form data
 * @returns UseMutation result for form submission
 */
export function useSubmitContactForm() {
    return useMutation({
        mutationFn: (data: ContactFormPayload) => contactService.submitContactForm(data),
        onError: (error: any) => {
            // console.error('Error submitting contact form:', error);
        }
    });
}