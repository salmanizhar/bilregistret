import React, { forwardRef } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { isDesktopWeb } from '@/utils/deviceInfo';
import WebWideFooter from './footer.web';

interface ScreenWrapperProps extends ScrollViewProps {
    children: React.ReactNode; 
}

const FooterWrapper = forwardRef<ScrollView, ScreenWrapperProps>(({ children, contentContainerStyle, ...scrollViewProps }, ref) => {
    if (isDesktopWeb()) {
        return (
            <ScrollView
                ref={ref}
                style={{ flex: 1 }}
                contentContainerStyle={[
                    { paddingBottom: 0 },
                    contentContainerStyle
                ]}
                {...scrollViewProps}
            >
                {children}
                <WebWideFooter />
            </ScrollView>
        );
    }

    // For non-desktop web, just return the children wrapped in a basic ScrollView
    return (
        <ScrollView
            ref={ref}
            style={{ flex: 1 }}
            contentContainerStyle={contentContainerStyle}
            {...scrollViewProps}
        >
            {children}
        </ScrollView>
    );
});

FooterWrapper.displayName = 'FooterWrapper';

export default FooterWrapper; 