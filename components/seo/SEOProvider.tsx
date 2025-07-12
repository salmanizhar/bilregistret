import React, { createContext, useContext, ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Platform } from 'react-native';

interface SEOConfig {
    siteName: string;
    siteUrl: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultKeywords: string[];
    defaultImage: string;
    twitterHandle: string;
    facebookAppId?: string;
    organizationSchema: any;
}

interface SEOContextType {
    config: SEOConfig;
    updateConfig: (updates: Partial<SEOConfig>) => void;
}

const defaultConfig: SEOConfig = {
    siteName: 'Bilregistret.ai',
    siteUrl: 'https://bilregistret.ai',
    defaultTitle: 'Bilregistret.ai - Sveriges Kompletta Bilregister',
    defaultDescription: 'Sök biluppgifter, få fordonshistorik, hitta bildelar och mycket mer. Sveriges mest kompletta bilregister med över 10 miljoner fordon.',
    defaultKeywords: [
        'bilregistret',
        'biluppgifter',
        'fordonsdata',
        'bilsök',
        'registreringsnummer',
        'bildelar',
        'fordonshistorik',
        'bilmärken',
        'bilmodeller',
        'sverige'
    ],
    defaultImage: 'https://bilregistret.ai/assets/images/bilregistret-social-image.jpg',
    twitterHandle: '@bilregistret',
    facebookAppId: '',
    organizationSchema: {
        '@type': 'Organization',
        '@id': 'https://bilregistret.ai/#organization',
        name: 'Bilregistret Sverige AB',
        url: 'https://bilregistret.ai',
        logo: {
            '@type': 'ImageObject',
            url: 'https://bilregistret.ai/assets/images/bilregistret-logo.jpg',
            width: 600,
            height: 315
        },
        description: 'Sveriges ledande plattform för biluppgifter och fordonsdata',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'SE'
        },
        sameAs: [
            'https://facebook.com/bilregistret',
            'https://twitter.com/bilregistret',
            'https://instagram.com/bilregistret'
        ]
    }
};

const SEOContext = createContext<SEOContextType>({
    config: defaultConfig,
    updateConfig: () => { }
});

export const useSEO = () => {
    const context = useContext(SEOContext);
    if (!context) {
        throw new Error('useSEO must be used within SEOProvider');
    }
    return context;
};

interface SEOProviderProps {
    children: ReactNode;
    config?: Partial<SEOConfig>;
}

export const SEOProvider: React.FC<SEOProviderProps> = ({
    children,
    config: userConfig = {}
}) => {
    const [config, setConfig] = React.useState<SEOConfig>({
        ...defaultConfig,
        ...userConfig
    });

    const updateConfig = React.useCallback((updates: Partial<SEOConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    }, []);

    const contextValue = React.useMemo(() => ({
        config,
        updateConfig
    }), [config, updateConfig]);

    // Only use HelmetProvider on web platform
    if (Platform.OS !== 'web') {
        return (
            <SEOContext.Provider value={contextValue}>
                {children}
            </SEOContext.Provider>
        );
    }

    return (
        <HelmetProvider>
            <SEOContext.Provider value={contextValue}>
                {children}
            </SEOContext.Provider>
        </HelmetProvider>
    );
};

export default SEOProvider;