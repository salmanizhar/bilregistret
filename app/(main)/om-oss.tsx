// About Us screen

import React, { useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import HeaderWithSearch from '@/components/common/HeaderWithSearch';
import { SvgXml } from 'react-native-svg';
import { AboutUsData, desktopWebViewport } from '@/constants/commonConst';
import { isDesktopWeb } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { SEOHead } from '@/components/seo';

const { width: windowWidth } = Dimensions.get('window');

export default function AboutUs() {
    const [activeTab, setActiveTab] = useState('uppdrag');

    // Use desktop viewport width when on desktop, otherwise use actual window width
    const layoutWidth = isDesktopWeb() ? desktopWebViewport : windowWidth;

    const handleTabPress = (tab: string) => {
        setActiveTab(tab);
    };

    return (
        <>
            {/* SEO Head Tags */}
            <SEOHead
                title="Om Oss - Bilregistret.ai"
                description="Sveriges pålitliga partner för fordonsinformation. Omfattande biluppgifter och fordonsdata baserat på registreringsnummer."
                keywords={[
                    'om oss',
                    'bilregistret.ai',
                    'företag',
                    'fordonsinformation',
                    'biluppgifter',
                    'sverige',
                    'fordonsdata',
                    'registreringsnummer',
                    'mission',
                    'vision'
                ]}
                url="/om-oss"
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'AboutPage',
                    name: 'Om Bilregistret.ai',
                    description: 'Information om Bilregistret.ai - Sveriges ledande plattform för fordonsinformation',
                    mainEntity: {
                        '@type': 'Organization',
                        name: 'Bilregistret Sverige AB',
                        description: 'Sveriges mest pålitliga och omfattande fordonsinformationstjänst',
                        url: 'https://bilregistret.ai',
                        foundingDate: '2020',
                        address: {
                            '@type': 'PostalAddress',
                            addressCountry: 'SE',
                            addressLocality: 'Helsingborg'
                        }
                    }
                }}
            />

            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />

                <FooterWrapper
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}>

                    <DesktopViewWrapper>
                        {/* Header with Search Component - Only show on mobile */}
                        {!isDesktopWeb() && <HeaderWithSearch />}

                        <View style={styles.content}>
                            {/* Title Section */}
                            <View style={styles.titleSection}>
                                <MyText fontFamily='Poppins' style={styles.title}>
                                    Bilregistret.ai - Din Pålitliga Partner för Fordonsinformation
                                </MyText>
                            </View>

                            {/* Description Section */}
                            <View style={styles.descriptionSection}>
                                <MyText style={styles.descriptionText}>
                                    Vi på Bilregistret.ai brinner för att ge dig den mest omfattandeoch tillförlitliga fordonsinformationen i Sverige. Vi förstår hur avgörande det är att ha tillgång till exakta och uppdaterade biluppgifter när du behöver dem som mest. Därför har vi skapat en användarvänlig plattform som ger dig snabb och enkel tillgång till fordonsdata baserat på registreringsnummer. {"\n\n"}Vår databas uppdateras regelbundet för att säkerställa att du alltid får korrekt information, oavsett om du ska köpa en begagnad bil, kontrollera ägarhistorik eller verifiera tekniska detaljer. Vi sätter kundnöjdhet i fokus och har dedikerat vårt team till att erbjuda en smidig och problemfri användarupplevelse. Vårt kunniga supportteam finns alltid tillgängligt för att hjälpa dig med dina frågor.
                                </MyText>
                            </View>

                            {/* Car Image Section */}
                            <View style={styles.imageContainer}>
                                <Image
                                    source={require('@/assets/images/AboutUsImage.png')}
                                    style={[styles.carImage, { width: layoutWidth * 0.8 }]}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Mission & Vision Tabs */}
                            <View style={styles.tabContainer}>
                                <TouchableOpacity
                                    style={[styles.tabButton, activeTab === 'uppdrag' && styles.activeTabButton]}
                                    onPress={() => handleTabPress('uppdrag')}
                                >
                                    <MyText style={activeTab === 'uppdrag' ? styles.ActiveTabButtonText : styles.tabButtonText}>Vårt Uppdrag</MyText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tabButton, activeTab === 'vision' && styles.activeTabButton]}
                                    onPress={() => handleTabPress('vision')}
                                >
                                    <MyText style={activeTab === 'vision' ? styles.ActiveTabButtonText : styles.tabButtonText}>Vår Vision</MyText>
                                </TouchableOpacity>
                            </View>

                            {/* Tab Content */}
                            <View style={styles.tabContent}>
                                {activeTab === 'uppdrag' ? (
                                    <MyText style={styles.tabContentText}>
                                        Vårt uppdrag på Bilregistret.ai är att erbjuda Sveriges mest pålitliga och omfattande fordonsinformationstjänst. Vi strävar efter att göra det enkelt och effektivt för våra användare att söka och verifiera fordonsuppgifter.
                                        {'\n\n'}
                                        Genom att säkerställa att vår databas alltid är uppdaterad och tillförlitlig, ger vi dig trygghet i alla fordonsrelaterade beslut. Vår plattform är utformad för att ge dig tillgång till relevant fordonsinformation på ett ögonblick. Vi vill vara din självklara partner och arbetar ständigt för att förbättra och utveckla vår tjänst för att möta dina behov.
                                    </MyText>
                                ) : (
                                    <MyText style={styles.tabContentText}>
                                        Vår vision på Bilregistret.ai är att bli den ledande plattformen för fordonsinformation i Sverige. Vi strävar efter att vara förstahandsvalet för alla som söker pålitlig och omfattande fordonsdata. Genom att ständigt förbättra vår tjänst, vill vi erbjuda den mest användarvänliga och effektiva sökupplevelsen, oavsett om du är privatperson eller professionell.
                                        {'\n\n'}
                                        Vi arbetar för att hålla vår databas aktuell och säkerställa att du får en noggrann och korrekt bild av varje fordon du söker efter. På Bilregistret.ai är vi passionerade över att erbjuda den bästa möjliga tjänsten och hjälpa dig att fatta välgrundade beslut med förtroende. Tillsammans gör vi fordonsinformation enkel, tillgänglig och användbar för alla.
                                    </MyText>
                                )}
                            </View>

                            {/* All Vehicle Data Section */}
                            <View style={styles.dataSection}>
                                <MyText fontFamily='Poppins' style={styles.dataSectionTitle}>
                                    All Fordonsdata du behöver
                                </MyText>

                                {/* Vehicle Data Categories */}
                                <View style={styles.categoriesList}>
                                    {AboutUsData.map((category) => (
                                        <View key={category.id} style={styles.categoryItem}>
                                            <MyText style={styles.categoryText}>{category.title}</MyText>
                                            <SvgXml xml={category.icon} width={24} height={24} />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </DesktopViewWrapper>
                </FooterWrapper>
            </View>
        </>
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
    scrollViewContent: {
        paddingBottom: isDesktopWeb() ? 30 : 20,
    },
    content: {
        padding: 15,
        paddingBottom: 40,
    },
    titleSection: {
        marginTop: isDesktopWeb() ? 20 : 10,
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        color: myColors.black,
        fontWeight: '700',
        lineHeight: 30,
    },
    descriptionSection: {
        marginBottom: 25,
    },
    descriptionText: {
        fontSize: 15,
        color: myColors.baseColors.light3,
        lineHeight: 22,
        marginBottom: 15,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
    },
    carImage: {
        height: 150,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 5,
        overflow: 'hidden',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        backgroundColor: myColors.white,
        // marginHorizontal: 5,

    },
    activeTabButton: {
        backgroundColor: myColors.black,
    },
    tabButtonText: {
        fontSize: 14,
        color: myColors.black,
    },
    ActiveTabButtonText: {
        color: myColors.white,
        fontSize: 14,
    },
    tabContent: {
        backgroundColor: myColors.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 25,
    },
    tabContentText: {
        fontSize: 14,
        color: myColors.text.webGray,
        lineHeight: 22,
    },
    dataSection: {
        marginBottom: 20,
    },
    dataSectionTitle: {
        fontSize: 20,
        color: myColors.text.primary,
        marginBottom: 20,
    },
    categoriesList: {
        // overflow: 'hidden',
    },
    categoryItem: {
        backgroundColor: myColors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
    },
    categoryText: {
        fontSize: 14,
        color: myColors.text.primary,
        marginLeft: 15,
    },
});
