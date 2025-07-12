import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    Platform,
} from 'react-native';
import FooterWrapper from '@/components/common/ScreenWrapper';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { myColors } from '@/constants/MyColors';
import HeaderWithSearch from '@/components/common/HeaderWithSearch';
import MyText from '@/components/common/MyText';
import FAQComponent from '@/components/FAQComponent';
import SafeSEOWrapper from '@/components/common/SafeSEOWrapper';
import { IconSearch } from '@/assets/icons';
import { SEOHead } from '@/components/seo';

const FAQ = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <View style={styles.container}>
            {/* SEO Head Tags */}
            <SEOHead
                title="FAQ - Vanliga Frågor"
                description="Få svar på vanliga frågor om Bilregistret.ai, biluppgifter, registreringsnummer och fordonsdata. Hitta information om vår tjänst och hur du använder den."
                keywords={[
                    'faq',
                    'vanliga frågor',
                    'biluppgifter',
                    'bilregistret',
                    'hjälp',
                    'support',
                    'registreringsnummer',
                    'fordonsdata',
                    'svar',
                    'frågor'
                ]}
                url="/faq"
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    name: 'Vanliga Frågor om Bilregistret.ai',
                    description: 'Svar på de vanligaste frågorna om biluppgifter och Bilregistret.ai',
                    mainEntity: [
                        {
                            '@type': 'Question',
                            name: 'Hur söker jag biluppgifter?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Du kan söka biluppgifter genom att ange registreringsnummer i sökfältet på vår hemsida.'
                            }
                        },
                        {
                            '@type': 'Question',
                            name: 'Vilken information kan jag få om min bil?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Du kan få omfattande information som tekniska specifikationer, registreringsdata, fordonshistorik och mycket mer.'
                            }
                        }
                    ]
                }}
            />

            <FooterWrapper
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                <DesktopViewWrapper>
                    {!isDesktopWeb() && <HeaderWithSearch />}

                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <MyText style={styles.mainTitle}>FAQ Biluppgifter</MyText>
                        <MyText style={styles.subtitle}>
                            Hitta svar på de vanligaste frågorna om Bilregistret.ai
                        </MyText>
                    </View>

                    {/* Search Section */}
                    <View style={styles.searchSection}>
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Sök bland FAQ-frågor..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#9ca3af"
                                {...(Platform.OS === 'web' && {
                                    // Web-specific props
                                    autoFocus: false,
                                    tabIndex: 0,
                                })}
                            />
                            <View style={styles.searchIcon}>
                                {/* <MyText style={styles.searchIconText}>🔍</MyText> */}
                                <IconSearch
                                    size={20}
                                    color={myColors.black}
                                />
                            </View>
                        </View>
                    </View>

                    {/* FAQ Content with VehicleInformationSection Design */}
                    <FAQComponent
                        searchQuery={searchQuery}
                        selectedCategory="Alla kategorier"
                        showSearch={false}
                        showTitle={false}
                    />
                </DesktopViewWrapper>
            </FooterWrapper>
        </View>
    );
};

export default FAQ;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: isDesktopWeb() ? 0 : 40,
    },

    // Hero Section
    heroSection: {
        paddingHorizontal: isDesktopWeb() ? 60 : 24,
        paddingTop: isDesktopWeb() ? 80 : 60,
        // paddingBottom: isDesktopWeb() ? 40 : 20,
        alignItems: 'center',
        backgroundColor: myColors.screenBackgroundColor,
    },
    mainTitle: {
        fontSize: isDesktopWeb() ? 48 : 36,
        fontWeight: '700',
        color: '#262524',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Poppins-Regular',
        letterSpacing: isDesktopWeb() ? -1 : -0.5,
    },
    subtitle: {
        fontSize: isDesktopWeb() ? 18 : 16,
        color: '#687693',
        textAlign: 'center',
        lineHeight: isDesktopWeb() ? 28 : 24,
        maxWidth: isDesktopWeb() ? 600 : 350,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
    },

    // Search Section
    searchSection: {
        paddingHorizontal: isDesktopWeb() ? 60 : 24,
        paddingVertical: isDesktopWeb() ? 40 : 24,
        backgroundColor: myColors.screenBackgroundColor,
    },
    searchContainer: {
        position: 'relative',
        alignSelf: 'center',
        width: '100%',
        maxWidth: isDesktopWeb() ? 700 : '100%',
    },
    searchInput: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: isDesktopWeb() ? 16 : 12,
        paddingHorizontal: isDesktopWeb() ? 20 : 16,
        paddingRight: isDesktopWeb() ? 60 : 50,
        paddingVertical: isDesktopWeb() ? 18 : 14,
        fontSize: isDesktopWeb() ? 17 : 16,
        color: '#181818',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter-Regular',
        ...(Platform.OS === 'web' && {
            outlineStyle: 'none',
            transition: 'all 0.2s ease-in-out',
        }),
    },
    searchIcon: {
        position: 'absolute',
        right: isDesktopWeb() ? 16 : 12,
        top: '50%',
        transform: [{ translateY: isDesktopWeb() ? -12 : -12 }],
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchIconText: {
        fontSize: isDesktopWeb() ? 18 : 16,
    },
});