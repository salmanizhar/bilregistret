import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import HeaderWithSearch from '@/components/common/HeaderWithSearch';
import MyButton from '@/components/common/MyButton';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { safeNavigation } from '@/utils/safeNavigation';
import LoginPopup from '@/components/auth/LoginPopup';

export default function MaxSearchReached() {
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    const handleLoginSuccess = () => {
        setShowLoginPopup(false);
        // You can add any additional logic here after successful login
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Login Popup */}
            <LoginPopup
                visible={showLoginPopup}
                onClose={() => setShowLoginPopup(false)}
                onLoginSuccess={handleLoginSuccess}
            />

            <FooterWrapper style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <DesktopViewWrapper>
                    {/* Header with Search Component - Only show on mobile */}
                    {!isDesktopWeb() && <HeaderWithSearch />}

                    <View style={styles.content}>
                        {/* Title Section */}
                        <View style={styles.titleSection}>
                            <MyText fontFamily='Poppins' style={styles.title}>Kaffepaus</MyText>
                        </View>

                        {/* Container for both sections */}
                        <View style={[
                            styles.sectionsContainer,
                            isDesktopWeb() && styles.sectionsContainerDesktop
                        ]}>
                            {/* Personal User Section */}
                            <View style={[
                                styles.userTypeCard,
                                isDesktopWeb() && styles.userTypeCardDesktop
                            ]}>
                                <MyText fontFamily='Poppins' style={styles.sectionTitle}>Privatperson</MyText>

                                <View style={styles.infoContainer}>
                                    <View style={styles.infoTextContainer}>
                                        <MyText style={styles.infoText}>
                                            Om ditt besök är för privat och icke-kommersiellt bruk, är det dags för en kort kaffepaus ☕ – men det finns ett enkelt sätt att fortsätta!
                                            Logga in för att få tillgång till fler sökningar och en bättre upplevelse. Det är gratis och hjälper oss att hålla tjänsten igång!                                </MyText>
                                    </View>
                                    {/* <View style={styles.priceContainer}>
                                        <MyText style={styles.priceLabel}>Pris:</MyText>
                                        <MyText style={styles.priceValue}>Gratis*</MyText>
                                    </View> */}

                                    <View style={styles.featureBox}>
                                        <MyText style={styles.featureText}>
                                            Du kan söka igen om en stund – eller skapa ett gratiskonto för att få fler sökningar direkt. Inget krav, bara en fördel!
                                        </MyText>
                                    </View>

                                    <MyButton title='Registrera dig' onPress={() => {
                                        safeNavigation('/(auth)/registrera');
                                    }} buttonStyle={styles.upgradeButton} />

                                    <MyButton title='Logga in' onPress={() => {
                                        if (isDesktopWeb()) {
                                            setShowLoginPopup(true);
                                        } else {
                                            safeNavigation('/(auth)/login');
                                        }
                                    }}
                                        buttonStyle={styles.loginButton}
                                        textStyle={styles.loginButtonText}
                                    />

                                    <MyText style={styles.disclaimerText}>
                                        *För dig som använder Bilregistret.ai enbart för personligt, icke-kommersiellt bruk erbjuder vi vår tjänst kostnadsfritt.
                                    </MyText>
                                </View>
                            </View>

                            {/* Professional User Section */}
                            <View style={[
                                styles.userTypeCard,
                                isDesktopWeb() && styles.userTypeCardDesktop
                            ]}>
                                <MyText fontFamily='Poppins' style={styles.sectionTitle}>Professionell Användare</MyText>

                                <View style={styles.businessInfoBox}>
                                    <MyText style={styles.businessInfoText}>
                                        Om du använder Bilregistret.ai i yrkes- eller affärssyfte krävs en kommersiell licens för att använda våra tjänster, enligt våra användarvillkor.
                                    </MyText>
                                </View>

                                {/* Pricing Options */}
                                {/* <View style={styles.pricingContainer}>
                                    <View style={styles.pricingRow}>
                                        <MyText style={styles.pricingLabel}>Bilregistret Däck & Fälg:</MyText>
                                        <MyText style={styles.pricingValue}>399kr<MyText style={styles.perMonth}>/mån</MyText></MyText>
                                    </View>

                                    <View style={styles.pricingRow}>
                                        <MyText style={styles.pricingLabel}>Registreringsnummer Plus:</MyText>
                                        <MyText style={styles.pricingValue}>699kr<MyText style={styles.perMonth}>/mån</MyText></MyText>
                                    </View>

                                    <View style={styles.pricingRow}>
                                        <MyText style={styles.pricingLabel}>Registreringsnummer Max:</MyText>
                                        <MyText style={styles.pricingValue}>799kr<MyText style={styles.perMonth}>/mån</MyText></MyText>
                                    </View>
                                </View> */}

                                <View style={styles.infoContainer}>
                                    <View style={styles.featureBox}>
                                        <MyText style={styles.featureText}>
                                            Ger dig obegränsad tillgång, avancerade sökalternativ, exklusiva funktioner och ytterligare information som inte är tillgänglig för allmänheten.
                                        </MyText>
                                    </View>

                                    <MyButton
                                        title={isDesktopWeb() ? 'Köp paket' : 'Kontakta oss'}
                                        onPress={() => {
                                            safeNavigation(isDesktopWeb() ? '/(main)/paket' : '/(main)/kontakt');
                                        }}
                                        buttonStyle={styles.upgradeButton}
                                    />

                                    <MyText style={styles.licenseNote}>
                                        *Varje licens är kopplad till en specifik person och kan inte användas av flera användare.
                                    </MyText>
                                </View>
                            </View>
                        </View>
                    </View>
                </DesktopViewWrapper>
                {isDesktopWeb() && <View style={{ height: 100 }} />}
            </FooterWrapper>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 15,
        paddingBottom: 40,
    },
    titleSection: {
        marginTop: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        color: myColors.text.primary,
    },
    sectionsContainer: {
        width: '100%',
    },
    sectionsContainerDesktop: {
        flexDirection: 'row',
        gap: 20,
    },
    userTypeCard: {
        backgroundColor: myColors.white,
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
    },
    userTypeCardDesktop: {
        flex: 1,
        marginBottom: 0,
    },
    sectionTitle: {
        fontSize: 18,
        color: myColors.text.primary,
        padding: 15,
    },
    infoContainer: {
        padding: 15,
        paddingTop: 0,
    },
    infoText: {
        fontSize: 14,
        color: myColors.baseColors.light3,
        textAlign: 'left',
        lineHeight: 22,
        marginBottom: 15,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        minHeight: 54,
    },
    warningText: {
        color: myColors.success,
        fontSize: 14,
        marginLeft: 6,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: myColors.border.light,
        paddingBottom: 8
    },
    priceLabel: {
        fontSize: 16,
        color: myColors.text.primary,
    },
    priceValue: {
        fontSize: 20,
        color: myColors.primary.main,
    },
    asterisk: {
        fontSize: 16,
    },
    featureBox: {
        backgroundColor: myColors.screenBackgroundColor,
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    trophyIconContainer: {
        height: 53,
        width: 53,
        borderRadius: 30,
        backgroundColor: myColors.white,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        fontSize: 14,
        color: myColors.baseColors.light3,
        lineHeight: 24,
        textAlign: 'left',
        marginTop: 10,
    },
    upgradeButton: {
        backgroundColor: myColors.primary.main,
        alignItems: 'center',
        // marginBottom: 15,
    },
    loginButton: {
        backgroundColor: myColors.black,
        alignItems: 'center',
        marginBottom: 15,
    },
    loginButtonText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    upgradeButtonText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    disclaimerText: {
        fontSize: 12,
        color: myColors.baseColors.lightGray3,
        textAlign: 'center',
        lineHeight: 20,
    },
    businessInfoBox: {
        backgroundColor: '#FFF1DE',
        padding: 15,
        marginHorizontal: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    businessInfoText: {
        fontSize: 14,
        color: myColors.baseColors.light3,
        textAlign: 'left',
        lineHeight: 24,
    },
    pricingContainer: {
        padding: 15,
        paddingTop: 10,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        height: 40,
        borderBottomWidth: 0.5,
        borderBottomColor: myColors.border.light,
    },
    pricingLabel: {
        fontSize: 16,
        color: myColors.text.primary,
    },
    pricingValue: {
        fontSize: 18,
        color: myColors.primary.main,
    },
    perMonth: {
        fontSize: 14,
        color: myColors.primary.main,
        fontWeight: 'normal',
    },
    orderButton: {
        flexDirection: 'row',
        backgroundColor: myColors.primary.main,
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 15,
        marginBottom: 15,
    },
    orderIcon: {
        marginRight: 10,
    },
    orderButtonText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    licenseNote: {
        fontSize: 12,
        color: myColors.baseColors.light2,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 15,
    },
    infoTextContainer: {
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: myColors.primary.light4,
        borderRadius: 10,
        padding: 15,
        shadowColor: "rgba(0, 0, 0, 0.25)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 4,
        elevation: 4,
        shadowOpacity: 1,
    }
});