import { Alert } from 'react-native';

interface ButtonConfig {
    text: string;
    onPress?: () => void;
}

interface AlertConfig {
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    showIcon?: boolean;
    positiveButton?: ButtonConfig;
    positiveButton2?: ButtonConfig;
    negativeButton?: ButtonConfig;
}

// Create a global reference to the alert context
let alertContext: {
    showAlert: (config: AlertConfig) => void;
} | null = null;

// Function to set the alert context
export const setAlertContext = (context: typeof alertContext) => {
    alertContext = context;
};

// Helper function to create alert config
const createAlertConfig = (
    message: string,
    title: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    showIcon: boolean = true,
    positiveButton?: ButtonConfig,
    positiveButton2?: ButtonConfig,
    negativeButton?: ButtonConfig
): AlertConfig => ({
    title,
    message,
    type,
    showIcon,
    positiveButton: positiveButton || { text: 'OK' },
    positiveButton2,
    negativeButton,
});

// Direct alert functions
export const showSuccess = (
    message: string,
    title: string = 'Success',
    positiveButton?: ButtonConfig,
    positiveButton2?: ButtonConfig,
    negativeButton?: ButtonConfig
) => {
    if (alertContext) {
        alertContext.showAlert(createAlertConfig(message, title, 'success', true, positiveButton, positiveButton2, negativeButton));
    } else {
        Alert.alert(title, message);
    }
};

export const showError = (
    message: string,
    title: string = 'Error',
    positiveButton?: ButtonConfig,
    positiveButton2?: ButtonConfig,
    negativeButton?: ButtonConfig
) => {
    if (alertContext) {
        alertContext.showAlert(createAlertConfig(message, title, 'error', true, positiveButton, positiveButton2, negativeButton));
    } else {
        Alert.alert(title, message);
    }
};

export const showWarning = (
    message: string,
    title: string = 'Warning',
    positiveButton?: ButtonConfig,
    positiveButton2?: ButtonConfig,
    negativeButton?: ButtonConfig
) => {
    if (alertContext) {
        alertContext.showAlert(createAlertConfig(message, title, 'warning', true, positiveButton, positiveButton2, negativeButton));
    } else {
        Alert.alert(title, message);
    }
};

export const showInfo = (
    message: string,
    title: string = 'Information',
    positiveButton?: ButtonConfig,
    positiveButton2?: ButtonConfig,
    negativeButton?: ButtonConfig
) => {
    if (alertContext) {
        alertContext.showAlert(createAlertConfig(message, title, 'info', true, positiveButton, positiveButton2, negativeButton));
    } else {
        Alert.alert(title, message);
    }
};

// Generic show alert function
export const showAlert = (config: AlertConfig) => {
    if (alertContext) {
        alertContext.showAlert(config);
    } else {
        Alert.alert(config.title, config.message);
    }
};