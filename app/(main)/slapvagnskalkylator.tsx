import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import TrailerCalculator from '@/components/TrailerCalculator'
import { myColors } from '@/constants/MyColors'
import { router, Stack } from 'expo-router'
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper'
import FooterWrapper from '@/components/common/ScreenWrapper'
import { isDesktopWeb, isBotUserAgent, getUserAgentInfo } from '@/utils/deviceInfo'
import FAQComponent from '@/components/FAQComponent'
import { H1, H2, P, SemanticMain, SemanticSection } from '@/components/common/SemanticText'
import HeaderWithSearch from '@/components/common/HeaderWithSearch'

type Props = {}

const Slapvagnskalkylator = (props: Props) => {
    const handleGoBack = () => {
        router.back();
    };

    // SEO Bot Detection - Pre-fill calculator for search engine crawlers
    const isBot = isBotUserAgent();

    // Debug logging for development
    React.useEffect(() => {
        const userAgentInfo = getUserAgentInfo();
        // console.log('🔍 Slapvagnskalkylator Page Load Debug:', {
        //     ...userAgentInfo,
        //     willPrefill: isBot
        // });

        // Also log to help with PageSpeed testing
        if (typeof window !== 'undefined') {
            (window as any).bilregistretBotDetection = {
                isBot,
                userAgent: userAgentInfo.userAgent,
                matchedPattern: userAgentInfo.matchedPattern
            };
        }
    }, [isBot]);

    // SEO pre-filled values for bots
    const seoPrefilledValues = {
        carRegNumber: 'AAG104',
        trailerRegNumber: 'RAG01R',
        selectedLicense: 'BE' as const,
        autoCalculate: true,
        expandSections: true
    };

    return (
        <View style={styles.container} >
            <StatusBar barStyle="dark-content" backgroundColor={myColors.primary.main} />
            <Stack.Screen options={{ headerShown: false }} />
            <FooterWrapper
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
                style={styles.scrollView}
                keyboardShouldPersistTaps="handled"
            >
                <DesktopViewWrapper>
                    {!isDesktopWeb() && <HeaderWithSearch />}
                    <View style={styles.contentWrapper}>

                        <SemanticMain style={styles.content}>
                            <H1 id="main-title" style={styles.pageTitle}>
                                Släpvagnskalkylator
                            </H1>

                            <H2 id="description-title" style={styles.descriptionTitle}>
                                Kontrollera om din bil kan dra släpvagn lagligt
                            </H2>

                            <P style={styles.description}>
                                Använd vår AI-baserade släpvagnskalkylator för att snabbt kontrollera om din bil lagligt kan dra en specifik släpvagn. Kalkylatorn tar hänsyn till faktorer som dragkapacitet, körkortsbehörighet och viktgränser enligt gällande regelverk.
                            </P>
                            <P style={styles.description}>
                            Kalkylatorn är utformad för att ge dig en snabb och enkel svar på om din bil kan dra en specifik släpvagn. Den tar hänsyn till faktorer som dragkapacitet, körkortsbehörighet och viktgränser enligt gällande regelverk.
                            </P>

                            {/* Calculator Section */}
                            <SemanticSection
                                style={styles.calculatorSection}
                                ariaLabelledBy="main-title"
                                itemScope
                                itemType="https://schema.org/SoftwareApplication"
                            >
                                <TrailerCalculator
                                    carRegNumber={isBot ? seoPrefilledValues.carRegNumber : ''}
                                    modellid={0}
                                    carRegNumberEditable={!isBot}
                                    prefilledTrailerRegNumber={isBot ? seoPrefilledValues.trailerRegNumber : undefined}
                                    prefilledSelectedLicense={isBot ? seoPrefilledValues.selectedLicense : undefined}
                                    autoCalculate={isBot ? seoPrefilledValues.autoCalculate : false}
                                    expandSections={isBot ? seoPrefilledValues.expandSections : false}
                                />
                            </SemanticSection>

                            {/* FAQ Section */}
                            <SemanticSection
                                style={styles.faqSectionBackground}
                                ariaLabelledBy="faq-title"
                                itemScope
                                itemType="https://schema.org/FAQPage"
                            >
                                <View style={styles.faqSection}>
                                    <H2 id="faq-title" fontFamily='Poppins' style={styles.faqTitle}>
                                        FAQ
                                    </H2>
                                    <View style={styles.faqSectionContainer}>
                                        <FAQComponent
                                            selectedCategory="slapvagnskalkylator"
                                        />
                                    </View>
                                </View>
                            </SemanticSection>
                        </SemanticMain>
                    </View>
                </DesktopViewWrapper>
            </FooterWrapper>
        </View>
    )
}

export default Slapvagnskalkylator

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
    content: {
        flex: 1,
        paddingHorizontal: 15,
        paddingBottom: 40,
        marginTop: isDesktopWeb() ? 50 : 20,
    },
    pageTitle: {
        fontSize: isDesktopWeb() ? 26 : 22,
        fontWeight: '600' as const,
        color: myColors.text.primary,
        textAlign: 'left' as const,
        marginBottom: isDesktopWeb() ? 15 : 12,
        marginTop: 10,

    },
    descriptionTitle: {
        fontSize: isDesktopWeb() ? 20 : 16,
        fontWeight: '500' as const,
        color: myColors.text.primary,
        textAlign: 'left' as const,
        marginBottom: isDesktopWeb() ? 12 : 10,
    },
    description: {
        fontSize: isDesktopWeb() ? 16 : 12,
        color: myColors.text.primary,
        lineHeight: isDesktopWeb() ? 24 : 22,
        marginBottom: isDesktopWeb() ? 30 : 25,
        textAlign: 'left' as const,
    },
    calculatorSection: {
        marginBottom: isDesktopWeb() ? 40 : 30,
    },
    faqSectionBackground: {
        width: '100%',
        marginTop: isDesktopWeb() ? 40 : 30,
    },
    faqSection: {
        paddingVertical: isDesktopWeb() ? 40 : 20,
        paddingHorizontal: 0,
        width: '100%',
        ...(isDesktopWeb() && {
            maxWidth: 1280,
            alignSelf: 'center' as const,
        }),
    },
    faqTitle: {
        fontSize: isDesktopWeb() ? 32 : 28,
        fontWeight: '400' as const,
        color: myColors.text.primary,
        textAlign: 'left' as const,
        marginBottom: isDesktopWeb() ? 40 : 32,
        lineHeight: isDesktopWeb() ? 40 : 36,
    },
    contentWrapper: {
        ...(Platform.OS === 'web' && {
            marginHorizontal: 15,
        }),
    },
    faqSectionContainer: {
        marginHorizontal: isDesktopWeb() ? -15 : -5, //negative margin to remove the padding of the parent container
    },
})