import { useState } from 'react';
import { Alert } from 'react-native';
import { showAlert } from './alert';

type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Show a toast message to the user
 * @param message Message to display
 * @param type Type of toast (success, error, info, warning)
 * @param duration Duration in milliseconds
 */
export const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    // For now, we'll use a simple Alert as a fallback
    // In a real app, you might want to use a more sophisticated toast mechanism or StatusMessage
    // Alert.alert(
    //     type.charAt(0).toUpperCase() + type.slice(1),
    //     message,
    //     [{ text: 'OK' }],
    //     { cancelable: true }
    // );
    showAlert({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message,
        type: type,
    });
};