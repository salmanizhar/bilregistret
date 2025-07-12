import React from 'react';
import { View, StyleSheet } from 'react-native';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { desktopWebViewport } from '@/constants/commonConst';

interface DesktopViewWrapperProps {
    children: React.ReactNode;
}

const DesktopViewWrapper: React.FC<DesktopViewWrapperProps> = ({ children }) => {
    // If the device is a desktop web browser, wrap the content in a view
    // that centers it and applies a max-width.
    if (isDesktopWeb()) {
        return (
            <View style={styles.desktopContainer}>
                <View style={styles.desktopContent}>{children}</View>
            </View>
        );
    }

    // On mobile or native platforms, render the children directly without any extra layout.
    return <>{children}</>;
};

const styles = StyleSheet.create({
    desktopContainer: {
        alignItems: 'center',
        width: '100%',
    },
    desktopContent: {
        width: '100%',
        maxWidth: desktopWebViewport,
    },
});

export default DesktopViewWrapper; 