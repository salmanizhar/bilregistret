import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import CustomAlert from '@/components/common/CustomAlert';
import { setAlertContext } from '@/utils/alert';

interface AlertConfig {
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    showIcon?: boolean;
    positiveButton?: {
        text: string;
        onPress?: () => void;
    };
    positiveButton2?: {
        text: string;
        onPress?: () => void;
    };
    negativeButton?: {
        text: string;
        onPress?: () => void;
    };
}

interface AlertContextType {
    showAlert: (config: AlertConfig) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<AlertConfig>({
        title: '',
        message: '',
        type: 'info',
        positiveButton: { text: 'OK' },
    });

    const showAlert = useCallback((config: AlertConfig) => {
        setConfig(config);
        setVisible(true);
    }, []);

    const hideAlert = useCallback(() => {
        setVisible(false);
    }, []);

    // Set the alert context when the provider mounts
    useEffect(() => {
        setAlertContext({ showAlert });
        return () => setAlertContext(null);
    }, [showAlert]);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <CustomAlert
                visible={visible}
                title={config.title}
                message={config.message}
                type={config.type}
                showIcon={config.showIcon}
                positiveButton={config.positiveButton}
                positiveButton2={config.positiveButton2}
                negativeButton={config.negativeButton}
                onDismiss={hideAlert}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};