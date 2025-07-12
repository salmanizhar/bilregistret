import React from 'react';
import { View, StyleSheet } from 'react-native';
import MyText from '@/components/common/MyText';
import { myColors } from '@/constants/MyColors';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { H1, H2, H3, P, SemanticMain, SemanticSection, SemanticArticle } from '@/components/common/SemanticText';

// 🚗 Car Brand SEO Hero Section
interface CarBrandHeroSEOProps {
    brandName: string;
    modelCount?: number;
    description?: string;
    heroImageUrl?: string;
}

export const CarBrandHeroSEO: React.FC<CarBrandHeroSEOProps> = ({ 
    brandName, 
    modelCount = 0, 
    description,
    heroImageUrl 
}) => {
    return (
        <SemanticSection style={styles.heroSection} itemScope itemType="https://schema.org/Brand">
            <H1 
                id={`${brandName.toLowerCase()}-hero-title`}
                style={styles.heroTitle}
                itemProp="name"
            >
                {brandName} Bilar Sverige 2025
            </H1>
            
            <H2 style={styles.heroSubtitle}>
                Utforska Alla {brandName} Modeller & Specifikationer
            </H2>
            
            <P style={styles.heroDescription} itemProp="description">
                {description || `Komplett guide till ${brandName} bilar i Sverige 2025. Hitta alla modeller, priser, tekniska specifikationer och fordonsuppgifter för ${brandName}. Sök ${brandName} biluppgifter gratis med registreringsnummer från det officiella bilregistret.`}
            </P>
            
            {modelCount > 0 && (
                <P style={styles.modelCount}>
                    <strong>{modelCount} modeller</strong> tillgängliga i Sverige
                </P>
            )}
            
            <meta itemProp="url" content={`https://bilregistret.ai/tillverkare/${brandName.toLowerCase()}`} />
            <meta itemProp="logo" content={`https://cdn.bilregistret.ai/assets/brands/logo-${brandName.toLowerCase()}.png`} />
        </SemanticSection>
    );
};

// 🔧 Car Model SEO Section
interface CarModelSEOProps {
    brandName: string;
    modelName: string;
    variantCount?: number;
    yearRange?: string;
    startingPrice?: string;
    fuelTypes?: string[];
    bodyTypes?: string[];
}

export const CarModelSEO: React.FC<CarModelSEOProps> = ({
    brandName,
    modelName,
    variantCount = 0,
    yearRange,
    startingPrice,
    fuelTypes = [],
    bodyTypes = []
}) => {
    return (
        <SemanticArticle 
            style={styles.modelSection} 
            itemScope 
            itemType="https://schema.org/Product"
        >
            <H2 
                id={`${brandName.toLowerCase()}-${modelName.toLowerCase()}-title`}
                style={styles.modelTitle}
                itemProp="name"
            >
                {brandName} {modelName}
            </H2>
            
            <P style={styles.modelDescription} itemProp="description">
                {brandName} {modelName} - {yearRange && `Årsmodeller ${yearRange}, `}
                {variantCount > 0 && `${variantCount} varianter tillgängliga. `}
                {startingPrice && `Pris från ${startingPrice}. `}
                Komplett information om tekniska specifikationer, utrustning och fordonsuppgifter.
            </P>
            
            {/* Structured data for fuel types */}
            {fuelTypes.length > 0 && (
                <div style={{ display: 'none' }}>
                    {fuelTypes.map((fuel, index) => (
                        <span key={index} itemProp="vehicleEngine" itemScope itemType="https://schema.org/EngineSpecification">
                            <meta itemProp="fuelType" content={fuel} />
                        </span>
                    ))}
                </div>
            )}
            
            {/* Structured data for body types */}
            {bodyTypes.length > 0 && (
                <div style={{ display: 'none' }}>
                    {bodyTypes.map((body, index) => (
                        <meta key={index} itemProp="bodyType" content={body} />
                    ))}
                </div>
            )}
            
            <meta itemProp="brand" content={brandName} />
            <meta itemProp="model" content={modelName} />
            <meta itemProp="category" content="Automobil" />
            <meta itemProp="url" content={`https://bilregistret.ai/tillverkare/${brandName.toLowerCase()}/${modelName.toLowerCase()}`} />
        </SemanticArticle>
    );
};

// 🎯 Car Brand Statistics SEO Component
interface CarBrandStatsSEOProps {
    brandName: string;
    totalModels: number;
    registeredVehicles?: number;
    popularModels?: string[];
    marketShare?: string;
}

export const CarBrandStatsSEO: React.FC<CarBrandStatsSEOProps> = ({
    brandName,
    totalModels,
    registeredVehicles,
    popularModels = [],
    marketShare
}) => {
    return (
        <SemanticSection 
            style={styles.statsSection}
            ariaLabelledBy={`${brandName.toLowerCase()}-stats-title`}
            itemScope 
            itemType="https://schema.org/Dataset"
        >
            <H3 
                id={`${brandName.toLowerCase()}-stats-title`}
                style={styles.statsTitle}
                itemProp="name"
            >
                {brandName} Statistik Sverige 2025
            </H3>
            
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <P style={styles.statNumber} itemProp="size">{totalModels}</P>
                    <P style={styles.statLabel}>Olika modeller</P>
                </View>
                
                {registeredVehicles && (
                    <View style={styles.statItem}>
                        <P style={styles.statNumber}>{registeredVehicles.toLocaleString('sv-SE')}</P>
                        <P style={styles.statLabel}>Registrerade fordon</P>
                    </View>
                )}
                
                {marketShare && (
                    <View style={styles.statItem}>
                        <P style={styles.statNumber}>{marketShare}</P>
                        <P style={styles.statLabel}>Marknadsandel</P>
                    </View>
                )}
            </View>
            
            {popularModels.length > 0 && (
                <View style={styles.popularModels}>
                    <H3 style={styles.popularTitle}>Populäraste {brandName} Modellerna</H3>
                    <View style={styles.popularList}>
                        {popularModels.map((model, index) => (
                            <P key={index} style={styles.popularModel}>
                                {model}
                            </P>
                        ))}
                    </View>
                </View>
            )}
            
            <meta itemProp="description" content={`${brandName} bilstatistik för Sverige 2025 med ${totalModels} modeller och detaljerad marknadsdata`} />
        </SemanticSection>
    );
};

// 🏆 Car Brand FAQ SEO Component
interface CarBrandFAQProps {
    brandName: string;
    customFAQs?: Array<{
        question: string;
        answer: string;
    }>;
}

export const CarBrandFAQSEO: React.FC<CarBrandFAQProps> = ({ brandName, customFAQs = [] }) => {
    const defaultFAQs = [
        {
            question: `Vilka ${brandName} modeller är mest populära i Sverige?`,
            answer: `De mest populära ${brandName} modellerna i Sverige varierar från år till år, men du kan se aktuell statistik och alla ${brandName} modeller med detaljerade specifikationer på Bilregistret.ai.`
        },
        {
            question: `Var hittar jag ${brandName} biluppgifter och specifikationer?`,
            answer: `På Bilregistret.ai kan du söka ${brandName} biluppgifter gratis med registreringsnummer. Vi har tekniska specifikationer, modelluppgifter och fordonsdata för alla ${brandName} bilar från det officiella bilregistret.`
        },
        {
            question: `Vilka ${brandName} modeller finns som elbil eller hybrid?`,
            answer: `${brandName} erbjuder flera elektriska och hybridmodeller. Du kan filtrera och utforska alla ${brandName} elbilar och hybrider med detaljerade specifikationer på vår webbplats.`
        },
        {
            question: `Hur söker jag information om en specifik ${brandName} bil?`,
            answer: `Ange bilens registreringsnummer i vårt sökfält så får du omedelbart detaljerade ${brandName} biluppgifter inklusive tekniska specifikationer, modellår, utrustning och mycket mer.`
        }
    ];
    
    const allFAQs = [...customFAQs, ...defaultFAQs];
    
    return (
        <SemanticSection 
            style={styles.faqSection}
            ariaLabelledBy={`${brandName.toLowerCase()}-faq-title`}
            itemScope 
            itemType="https://schema.org/FAQPage"
        >
            <MyText 
                id={`${brandName.toLowerCase()}-faq-title`}
                style={styles.faqTitle}
                fontFamily="Poppins"
            >
                Vanliga Frågor om {brandName}
            </MyText>
            
            {allFAQs.map((faq, index) => (
                <View 
                    key={index} 
                    style={styles.faqItem}
                    itemScope 
                    itemType="https://schema.org/Question"
                    itemProp="mainEntity"
                >
                    <H3 style={styles.faqQuestion} itemProp="name">
                        {faq.question}
                    </H3>
                    <View itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                        <P style={styles.faqAnswer} itemProp="text">
                            {faq.answer}
                        </P>
                    </View>
                </View>
            ))}
        </SemanticSection>
    );
};

// 🔍 Search Intent Keywords Component (Hidden SEO boost)
interface SearchKeywordsSEOProps {
    brandName: string;
    modelName?: string;
    additionalKeywords?: string[];
}

export const SearchKeywordsSEO: React.FC<SearchKeywordsSEOProps> = ({ 
    brandName, 
    modelName, 
    additionalKeywords = [] 
}) => {
    const baseKeywords = [
        `${brandName.toLowerCase()} bilar`,
        `${brandName.toLowerCase()} sverige`,
        `${brandName.toLowerCase()} modeller`,
        `${brandName.toLowerCase()} priser`,
        `${brandName.toLowerCase()} specifikationer`,
        `${brandName.toLowerCase()} biluppgifter`,
        `${brandName.toLowerCase()} tekniska data`,
        `${brandName.toLowerCase()} registreringsnummer`,
        `${brandName.toLowerCase()} fordonsuppgifter`,
        `nya ${brandName.toLowerCase()}`,
        `begagnade ${brandName.toLowerCase()}`,
        `${brandName.toLowerCase()} service`,
        `${brandName.toLowerCase()} reservdelar`,
        `${brandName.toLowerCase()} bilhandlare`
    ];
    
    const modelKeywords = modelName ? [
        `${brandName.toLowerCase()} ${modelName.toLowerCase()}`,
        `${brandName.toLowerCase()} ${modelName.toLowerCase()} pris`,
        `${brandName.toLowerCase()} ${modelName.toLowerCase()} test`,
        `${brandName.toLowerCase()} ${modelName.toLowerCase()} specifikationer`,
        `${brandName.toLowerCase()} ${modelName.toLowerCase()} review`
    ] : [];
    
    const allKeywords = [...baseKeywords, ...modelKeywords, ...additionalKeywords];
    
    return (
        <View style={styles.hiddenKeywords}>
            {allKeywords.map((keyword, index) => (
                <span key={index} style={{ display: 'none' }}>
                    {keyword}
                </span>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    heroSection: {
        paddingVertical: isDesktopWeb() ? 40 : 24,
        paddingHorizontal: isDesktopWeb() ? 0 : 16,
        marginBottom: isDesktopWeb() ? 40 : 24,
    },
    heroTitle: {
        fontSize: isDesktopWeb() ? 36 : 28,
        fontWeight: '700' as const,
        color: myColors.text.primary,
        textAlign: 'left' as const,
        marginBottom: isDesktopWeb() ? 16 : 12,
        lineHeight: isDesktopWeb() ? 44 : 36,
    },
    heroSubtitle: {
        fontSize: isDesktopWeb() ? 24 : 20,
        fontWeight: '500' as const,
        color: myColors.text.primary,
        textAlign: 'left' as const,
        marginBottom: isDesktopWeb() ? 20 : 16,
        lineHeight: isDesktopWeb() ? 32 : 28,
    },
    heroDescription: {
        fontSize: isDesktopWeb() ? 18 : 16,
        color: myColors.text.secondary,
        lineHeight: isDesktopWeb() ? 28 : 24,
        marginBottom: isDesktopWeb() ? 24 : 16,
        textAlign: 'left' as const,
    },
    modelCount: {
        fontSize: isDesktopWeb() ? 16 : 14,
        color: myColors.primary.main,
        fontWeight: '600' as const,
    },
    modelSection: {
        paddingVertical: isDesktopWeb() ? 32 : 20,
        marginBottom: isDesktopWeb() ? 32 : 20,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    modelTitle: {
        fontSize: isDesktopWeb() ? 28 : 22,
        fontWeight: '600' as const,
        color: myColors.text.primary,
        marginBottom: isDesktopWeb() ? 16 : 12,
    },
    modelDescription: {
        fontSize: isDesktopWeb() ? 16 : 14,
        color: myColors.text.secondary,
        lineHeight: isDesktopWeb() ? 24 : 20,
    },
    statsSection: {
        paddingVertical: isDesktopWeb() ? 40 : 24,
        paddingHorizontal: isDesktopWeb() ? 24 : 16,
        backgroundColor: myColors.background.light,
        borderRadius: 12,
        marginBottom: isDesktopWeb() ? 40 : 24,
    },
    statsTitle: {
        fontSize: isDesktopWeb() ? 24 : 20,
        fontWeight: '600' as const,
        color: myColors.text.primary,
        textAlign: 'center' as const,
        marginBottom: isDesktopWeb() ? 24 : 20,
    },
    statsGrid: {
        flexDirection: 'row' as const,
        justifyContent: 'space-around' as const,
        marginBottom: isDesktopWeb() ? 32 : 24,
    },
    statItem: {
        alignItems: 'center' as const,
    },
    statNumber: {
        fontSize: isDesktopWeb() ? 32 : 24,
        fontWeight: '700' as const,
        color: myColors.primary.main,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: isDesktopWeb() ? 14 : 12,
        color: myColors.text.secondary,
        textAlign: 'center' as const,
    },
    popularModels: {
        marginTop: isDesktopWeb() ? 24 : 16,
    },
    popularTitle: {
        fontSize: isDesktopWeb() ? 20 : 18,
        fontWeight: '600' as const,
        color: myColors.text.primary,
        marginBottom: isDesktopWeb() ? 16 : 12,
        textAlign: 'center' as const,
    },
    popularList: {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        justifyContent: 'center' as const,
        gap: 8,
    },
    popularModel: {
        backgroundColor: myColors.primary.light,
        color: myColors.primary.main,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        fontSize: isDesktopWeb() ? 14 : 12,
        fontWeight: '500' as const,
    },
    faqSection: {
        paddingVertical: isDesktopWeb() ? 40 : 24,
        marginBottom: isDesktopWeb() ? 40 : 24,
    },
    faqTitle: {
        fontSize: isDesktopWeb() ? 28 : 24,
        fontWeight: '600' as const,
        color: myColors.text.primary,
        marginBottom: isDesktopWeb() ? 32 : 24,
        textAlign: 'center' as const,
    },
    faqItem: {
        marginBottom: isDesktopWeb() ? 24 : 20,
        paddingBottom: isDesktopWeb() ? 24 : 20,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    faqQuestion: {
        fontSize: isDesktopWeb() ? 18 : 16,
        fontWeight: '600' as const,
        color: myColors.text.primary,
        marginBottom: isDesktopWeb() ? 12 : 8,
    },
    faqAnswer: {
        fontSize: isDesktopWeb() ? 16 : 14,
        color: myColors.text.secondary,
        lineHeight: isDesktopWeb() ? 24 : 20,
    },
    hiddenKeywords: {
        display: 'none',
    },
});

export default {
    CarBrandHeroSEO,
    CarModelSEO,
    CarBrandStatsSEO,
    CarBrandFAQSEO,
    SearchKeywordsSEO
}; 