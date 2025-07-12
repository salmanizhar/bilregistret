import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import MyText from '@/components/common/MyText';
import { H1, H2, H3, P, Strong, SemanticAside, SemanticSection } from '@/components/common/SemanticText';
import RegistrationNumberInput from '@/components/common/RegistrationNumberInput';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { myColors } from '@/constants/MyColors';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { ImagePath } from '@/assets/images';
import { greenCheckmark, carWithTools, moneyTag, TV, blueLightning, flightTakeOff, blackDocument, defender } from '@/assets/images/SvgIcons';
import FAQComponent from '@/components/FAQComponent';
import HeaderWithSearch from '@/components/common/HeaderWithSearch';

export default function BiluppgifterSEOPage() {
    const router = useRouter();
    const [searchInput, setSearchInput] = useState('');
    const searchInputRef = useRef<any>(null);
    const scrollViewRef = useRef<any>(null);
    const desktopScrollViewRef = useRef<any>(null);

    // Enhanced accessibility and SEO initialization
    useEffect(() => {
        if (Platform.OS === 'web') {
            // Add skip link for accessibility
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = 'Hoppa till huvudinnehåll';
            skipLink.className = 'skip-link';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: ${myColors.primary.main};
                color: white;
                padding: 8px 16px;
                text-decoration: none;
                z-index: 10000;
                border-radius: 4px;
                font-size: 14px;
                transition: top 0.3s ease;
            `;
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });
            document.body.prepend(skipLink);

            // Enhanced page metadata for SEO
            document.documentElement.lang = 'sv-SE';
            document.documentElement.setAttribute('dir', 'ltr');

            // Add structured data microdata to body
            document.body.setAttribute('itemscope', '');
            document.body.setAttribute('itemtype', 'https://schema.org/WebPage');
        }
    }, []);

    // Mobile initialization - scroll to top and focus search input
    useEffect(() => {
        if (Platform.OS !== 'web') {
            // For mobile platforms, ensure we scroll to top and then focus search input
            const initializeMobile = () => {
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({ y: 0, animated: false });

                    // Focus search input after a brief delay, but prevent auto-scroll
                    setTimeout(() => {
                        if (searchInputRef.current) {
                            // Store current scroll position
                            const currentScrollY = scrollViewRef.current?.contentOffset?.y || 0;

                            searchInputRef.current.focus();

                            // Immediately scroll back to top if focus caused scroll
                            setTimeout(() => {
                                if (scrollViewRef.current) {
                                    scrollViewRef.current.scrollTo({ y: 0, animated: false });
                                }
                            }, 50);
                        }
                    }, 300);
                }
            };

            // Run immediately and also after a small delay to ensure everything is mounted
            initializeMobile();
            const timeoutId = setTimeout(initializeMobile, 100);

            return () => clearTimeout(timeoutId);
        }
    }, []);

    // Handle search result
    const handleSearchResult = (result: any) => {
        if (result && result.regNumber) {
            router.push({
                pathname: '/(main)/biluppgifter/[regnr]' as any,
                params: {
                    regnr: result.regNumber
                }
            });
        }
        setSearchInput('');
    };

    // Handle search input change
    const handleSearchInputChange = (text: string) => {
        setSearchInput(text);
    };

    const scrollToSearchInput = () => {
        if (Platform.OS === 'web') {
            // For desktop web, use the ref if available, otherwise fallback to DOM queries
            if (isDesktopWeb() && desktopScrollViewRef.current) {
                // Use the ref to scroll to top
                desktopScrollViewRef.current.scrollTo({ y: 0, animated: true });
            } else {
                // Fallback for web platforms without ref or non-desktop
                const scrollableContainer = document.querySelector('[role="main"]') || document.documentElement;
                if (scrollableContainer && scrollableContainer.scrollTo) {
                    scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }

            setTimeout(() => {
                const searchInput = document.querySelector('input[placeholder*="REGISTRERINGSNUMMER"]') as HTMLInputElement;
                if (searchInput) {
                    searchInput.focus();
                }
            }, 500);
        } else {
            // For mobile platforms
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: 0, animated: true });
                setTimeout(() => {
                    if (searchInputRef.current) {
                        searchInputRef.current.focus();
                    }
                }, 500);
            }
        }
    };

    const renderContent = () => (
        <>
            {/* Universal Header */}
            {!isDesktopWeb() && <HeaderWithSearch />}

            {/* Hero Banner - Enhanced Semantic Structure */}
            <View style={styles.heroBannerBackground} role="banner" accessibilityLabel="Huvudsektion för biluppgifter sökning">
                <DesktopViewWrapper>
                    <View style={styles.heroBanner} id="main-content">
                        <View style={styles.heroBannerContent}>
                            <View style={styles.bannerLeft}
                                {...(Platform.OS === 'web' && {
                                    role: 'banner'
                                })}
                            >
                                <H1 id="hero-title"
                                    style={styles.heroTitle}
                                    role="heading"
                                    ariaLevel={1}
                                    itemProp="headline"
                                >
                                    Sök biluppgifter i bilregistret via registreringsnummer
                                </H1>

                                <View style={styles.heroSearchContainer}
                                    accessibilityLabel="Sök fordonsuppgifter"
                                >
                                    <View style={styles.heroSearchBar}>
                                        <View style={styles.sMarkContainer}>
                                            <MyText style={styles.heroSMark}
                                                aria-hidden={true}
                                                accessibilityElementsHidden={true}
                                            >
                                                S
                                            </MyText>
                                            <View style={styles.heroBorderLine} />
                                        </View>
                                        <RegistrationNumberInput
                                            ref={searchInputRef}
                                            style={styles.heroSearchInput}
                                            placeholder={isDesktopWeb() ? "REGISTRERINGSNUMMER / VIN " : "REGISTRERINGSNUMMER"}
                                            placeholderTextColor="#9EA6BA"
                                            value={searchInput}
                                            onChangeText={handleSearchInputChange}
                                            onSearchResult={handleSearchResult}
                                            accessibilityLabel="Skriv in registreringsnummer eller VIN-nummer"
                                            accessibilityHint="Ange ditt fordonsnummer för att söka biluppgifter från officiella källor"
                                            accessibilityRole={Platform.OS === 'web' ? "searchbox" : undefined}
                                            hideIcon={true}
                                        />
                                        <TouchableOpacity
                                            style={styles.heroSearchButton}
                                            onPress={() => {
                                                if (searchInput.trim()) {
                                                    handleSearchResult({ regNumber: searchInput.trim() });
                                                }
                                            }}
                                            accessibilityLabel="Sök biluppgifter i bilregistret"
                                            accessibilityRole="button"
                                            accessibilityHint="Tryck för att söka efter fordonsuppgifter baserat på det angivna registreringsnumret"
                                        >
                                            <SvgXml
                                                xml={ImagePath.SvgIcons.whiteSearchIcon}
                                                width={20}
                                                height={20}
                                                accessibilityLabel="Sökikon"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <SemanticAside
                                style={styles.bannerRight}
                                ariaLabelledBy="features-heading"
                                accessibilityLabel="Tillgängliga funktioner"
                            >
                                <View id="features-heading" style={{ display: 'none' }}>
                                    <MyText>Tillgängliga funktioner</MyText>
                                </View>
                                <View style={styles.featureGrid}
                                    role="list"
                                    accessibilityLabel="Lista över tillgängliga biluppgifter funktioner"
                                >
                                    <View style={styles.featureRow}>
                                        <View style={styles.featureCard} role="listitem">
                                            <SvgXml
                                                xml={greenCheckmark}
                                                width={18}
                                                height={18}
                                                accessibilityLabel="Grön bock - funktion tillgänglig"
                                            />
                                            <MyText style={styles.featureText}>I trafik</MyText>
                                        </View>
                                        <View style={styles.featureCard} role="listitem">
                                            <SvgXml
                                                xml={greenCheckmark}
                                                width={18}
                                                height={18}
                                                accessibilityLabel="Grön bock - funktion tillgänglig"
                                            />
                                            <MyText style={styles.featureText}>Mätarställning</MyText>
                                        </View>
                                    </View>
                                    <View style={styles.featureRow}>
                                        <View style={styles.featureCard} role="listitem">
                                            <SvgXml
                                                xml={greenCheckmark}
                                                width={18}
                                                height={18}
                                                accessibilityLabel="Grön bock - funktion tillgänglig"
                                            />
                                            <MyText style={styles.featureText}>Biluppgifter</MyText>
                                        </View>
                                        <View style={styles.featureCard} role="listitem">
                                            <SvgXml
                                                xml={greenCheckmark}
                                                width={18}
                                                height={18}
                                                accessibilityLabel="Grön bock - funktion tillgänglig"
                                            />
                                            <MyText style={styles.featureText}>Antal ägare</MyText>
                                        </View>
                                    </View>
                                    <View style={styles.featureRow}>
                                        <View style={styles.featureCard} role="listitem">
                                            <SvgXml
                                                xml={greenCheckmark}
                                                width={18}
                                                height={18}
                                                accessibilityLabel="Grön bock - funktion tillgänglig"
                                            />
                                            <MyText style={styles.featureText}>Besiktning</MyText>
                                        </View>
                                        <View style={styles.featureCard} role="listitem">
                                            <SvgXml
                                                xml={greenCheckmark}
                                                width={18}
                                                height={18}
                                                accessibilityLabel="Grön bock - funktion tillgänglig"
                                            />
                                            <MyText style={styles.featureText}>Ägarform</MyText>
                                        </View>
                                    </View>
                                </View>
                            </SemanticAside>
                        </View>
                    </View>
                </DesktopViewWrapper>
            </View>

            {/* Intro Text - Enhanced Semantic Section */}
            <SemanticSection
                style={styles.introSectionBackground}
                ariaLabelledBy="intro-section"
                itemScope
                itemType="https://schema.org/Article"
            >
                <DesktopViewWrapper>
                    <View style={styles.introSection}>
                        <P id="intro-section"
                            style={styles.introText}
                            itemProp="description"
                        >
                            Att ha tillgång till pålitlig och detaljerad fordonsinformation är avgörande, särskilt när det gäller att köpa eller sälja bilar. Vår söktjänst via registreringsnummer erbjuder en kostnadsfri, snabb och effektiv lösning för alla som vill ha information om fordon. Oavsett om du är en erfaren bilköpare eller bara nyfiken, är vi här för att hjälpa dig.
                        </P>
                    </View>
                </DesktopViewWrapper>
            </SemanticSection>

            {/* Why Choose Us Section - Enhanced with Structured Data */}
            <SemanticSection
                style={styles.whyUsSectionBackground}
                ariaLabelledBy="why-choose-us"
                itemScope
                itemType="https://schema.org/Service"
            >
                <DesktopViewWrapper>
                    <View style={styles.whyUsContent}>
                        <H2 id="why-choose-us"
                            style={styles.whyUsTitle}
                            itemProp="name"
                        >
                            Varför välja oss?
                        </H2>

                        <View style={styles.whyUsGrid} role="list" accessibilityLabel="Lista över våra fördelar och tjänster">
                            <View style={styles.whyUsCard} role="listitem">
                                <View style={styles.whyUsIcon}>
                                    <SvgXml
                                        xml={carWithTools}
                                        width={60}
                                        height={60}
                                        accessibilityLabel="Bil med verktyg - ikon för snabb sökning"
                                    />
                                </View>
                                <H3 style={styles.whyUsCardTitle}>
                                    Snabb och träffsäker sökning
                                </H3>
                                <P style={styles.whyUsCardText}>
                                    Med vår kraftfulla registreringsnummer-sökning hittar du rätt reservdelar och fordonsinformation på några sekunder.
                                </P>
                            </View>

                            <View style={styles.whyUsCard} role="listitem">
                                <View style={styles.whyUsIcon}>
                                    <SvgXml
                                        xml={moneyTag}
                                        width={60}
                                        height={60}
                                        accessibilityLabel="Pristagg - ikon för transparenta priser"
                                    />
                                </View>
                                <H3 style={styles.whyUsCardTitle}>
                                    Transparent prispaket
                                </H3>
                                <P style={styles.whyUsCardText}>
                                    Vi erbjuder flexibla prismodeller anpassade efter dina behov. Oavsett om du är en enskild köpare eller ett företag – hitta din{' '}
                                    <TouchableOpacity onPress={() => router.push('/paket')}
                                        accessibilityRole="link"
                                        accessibilityLabel="Gå till våra prispaket"
                                    >
                                        <Strong style={styles.linkText}>plan idag.</Strong>
                                    </TouchableOpacity>
                                </P>
                            </View>

                            <View style={styles.whyUsCard} role="listitem">
                                <View style={styles.whyUsIcon}>
                                    <SvgXml
                                        xml={TV}
                                        width={60}
                                        height={60}
                                        accessibilityLabel="TV-skärm - ikon för tillgång till kompletta biluppgifter"
                                    />
                                </View>
                                <H3 style={styles.whyUsCardTitle}>
                                    Tillgång till kompletta biluppgifter
                                </H3>
                                <P style={styles.whyUsCardText}>
                                    Vi erbjuder detaljerad fordonsdata direkt kopplad till registreringsnumret, vilket gör det enkelt att hitta rätt information.
                                </P>
                            </View>
                        </View>
                    </View>
                </DesktopViewWrapper>
            </SemanticSection>

            {/* FAQ Section - Enhanced Semantic Structure */}
            <View style={styles.faqSectionBackground}>
                <View style={styles.faqSection}
                    {...(Platform.OS === 'web' && {
                        role: 'region',
                        'aria-labelledby': 'faq-section',
                        itemScope: true,
                        itemType: 'https://schema.org/FAQPage'
                    })}
                >
                    <H2 id="faq-section"
                        fontFamily='Poppins'
                        style={styles.faqTitle}
                        itemProp="name"
                    >
                        FAQ biluppgifter
                    </H2>
                    <FAQComponent
                        selectedCategory="biluppgifter"
                    />
                </View>
            </View>

            {/* Benefits Section - Enhanced with ARIA and Structured Data */}
            <View style={styles.benefitsSectionBackground}
                {...(Platform.OS === 'web' && {
                    role: 'region',
                    'aria-labelledby': 'benefits-section',
                    itemScope: true,
                    itemType: 'https://schema.org/ItemList'
                })}
            >
                <View style={styles.benefitsGrid}
                    role="list"
                    accessibilityLabel="Lista över våra tjänstefördelar"
                >
                    <View style={styles.benefitItem} role="listitem">
                        <View style={styles.benefitIconContainer}>
                            <View style={[styles.benefitIconBg, { backgroundColor: 'rgba(28, 112, 230, 0.1)' }]} >
                                <View style={styles.benefitIconInner}>
                                    <SvgXml
                                        xml={blueLightning}
                                        width={28}
                                        height={28}
                                        accessibilityLabel="Blå blixt - ikon för officiella källor"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.benefitContent}>
                            <H3 style={styles.benefitTitle}>Officiella källor</H3>
                            <P style={styles.benefitDescription}>Data från bilregistret</P>
                        </View>
                        <View style={styles.benefitLine} />
                    </View>

                    <View style={styles.benefitItem} role="listitem">
                        <View style={styles.benefitIconContainer}>
                            <View style={[styles.benefitIconBg, { backgroundColor: 'rgba(255, 165, 38, 0.1)' }]} >
                                <View style={styles.benefitIconInner}>
                                    <SvgXml
                                        xml={flightTakeOff}
                                        width={28}
                                        height={28}
                                        accessibilityLabel="Flygplan som startar - ikon för snabb service"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.benefitContent}>
                            <H3 style={styles.benefitTitle}>Snabb service</H3>
                            <P style={styles.benefitDescription}>Resultat på sekunder</P>
                        </View>
                        <View style={styles.benefitLine} />
                    </View>

                    <View style={styles.benefitItem} role="listitem">
                        <View style={styles.benefitIconContainer}>
                            <View style={[styles.benefitIconBg, { backgroundColor: 'rgba(24, 24, 24, 0.1)' }]} >
                                <View style={styles.benefitIconInner}>
                                    <SvgXml
                                        xml={blackDocument}
                                        width={28}
                                        height={28}
                                        accessibilityLabel="Dokument - ikon för aktuell information"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.benefitContent}>
                            <H3 style={styles.benefitTitle}>Aktuell information</H3>
                            <P style={styles.benefitDescription}>Dagliga uppdateringar</P>
                        </View>
                        <View style={styles.benefitLine} />
                    </View>

                    <View style={styles.benefitItem} role="listitem">
                        <View style={styles.benefitIconContainer}>
                            <View style={[styles.benefitIconBg, { backgroundColor: 'rgba(255, 73, 56, 0.1)' }]} >
                                <View style={styles.benefitIconInner}>
                                    <SvgXml
                                        xml={defender}
                                        width={28}
                                        height={28}
                                        accessibilityLabel="Säkerhetssköld - ikon för GDPR-säkerhet"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.benefitContent}>
                            <H3 style={styles.benefitTitle}>GDPR-säkert</H3>
                            <P style={styles.benefitDescription}>Fullständig datasäkerhet</P>
                        </View>
                        <View style={styles.benefitLine} />
                    </View>
                </View>
            </View>

            {/* CTA Section - Enhanced Call-to-Action */}
            <SemanticSection style={styles.ctaSectionBackground}
                role="region"
                aria-labelledby="cta-section"
                itemScope
                itemType="https://schema.org/Action"
            >
                <DesktopViewWrapper>
                    <View style={styles.ctaContent}>
                        <H2 id="cta-section"
                            style={styles.ctaTitle}
                            itemProp="name"
                        >
                            Börja söka biluppgifter nu
                        </H2>
                        <P style={styles.ctaSubtitle} itemProp="description">
                            Svenskar över hela landet använder Bilregistret Sverige AB för att snabbt och enkelt få tillgång till pålitlig fordonsinformation – varje dag, året runt.
                        </P>
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={scrollToSearchInput}
                            accessibilityLabel="Börja sök biluppgifter gratis - går till sökfält"
                            accessibilityRole="button"
                            accessibilityHint="Tryck för att gå till sökfältet och börja söka efter fordonsuppgifter kostnadsfritt"
                        >
                            <Strong style={styles.ctaButtonText}>
                                SÖK BILUPPGIFTER GRATIS
                            </Strong>
                        </TouchableOpacity>
                    </View>
                </DesktopViewWrapper>
            </SemanticSection>
        </>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    title: 'Biluppgifter - Kolla fordonsinformation gratis | Bilregistret',
                }}
            />

            {isDesktopWeb() ? (
                <FooterWrapper
                    ref={desktopScrollViewRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                    style={styles.scrollView}
                    role="main"
                    accessibilityLabel="Huvudinnehåll för biluppgifter sökning"
                >
                    {renderContent()}
                </FooterWrapper>
            ) : (
                <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                    style={styles.scrollView}
                >
                    {renderContent()}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: isDesktopWeb() ? 0 : 40,
    },

    // Hero Banner - Contained Rectangle
    heroBannerBackground: {
        backgroundColor: '#FAFAFA',
        width: '100%',
        paddingVertical: isDesktopWeb() ? 40 : 20,
        paddingBottom: isDesktopWeb() ? 50 : 20,
        paddingHorizontal: isDesktopWeb() ? 0 : 20,
    },
    heroBanner: {
        backgroundColor: '#F5F8FA',
        borderRadius: isDesktopWeb() ? 10 : 0,
        padding: isDesktopWeb() ? 35 : 20,
        marginHorizontal: isDesktopWeb() ? 50 : 0,
    },
    heroBannerContent: {
        flexDirection: isDesktopWeb() ? 'row' : 'column',
        alignItems: isDesktopWeb() ? 'flex-start' : 'center',
        gap: isDesktopWeb() ? 40 : 30,
    },
    bannerLeft: {
        flex: isDesktopWeb() ? 1 : undefined,
        width: isDesktopWeb() ? undefined : '100%',
    },
    heroTitle: {
        fontSize: isDesktopWeb() ? 36 : 28,
        fontWeight: '400',
        color: '#262524',
        lineHeight: isDesktopWeb() ? 50 : 40,
        marginBottom: 30,
        fontFamily: 'Poppins',
        textAlign: isDesktopWeb() ? 'left' : 'center',
    },
    heroSearchContainer: {
        width: '100%',
        maxWidth: isDesktopWeb() ? 640 : undefined,
    },
    heroSearchBar: {
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        height: isDesktopWeb() ? 60 : 50,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: myColors.primary.main,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 5,
    },
    sMarkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
    },
    heroSMark: {
        fontSize: isDesktopWeb() ? 24 : 20,
        color: '#262524',
        fontWeight: '400',
        fontFamily: 'Poppins',
    },
    heroBorderLine: {
        width: 1,
        height: isDesktopWeb() ? 36 : 30,
        backgroundColor: '#E0E0E0',
        marginLeft: 12,
    },
    heroSearchInput: {
        flex: 1,
        fontSize: isDesktopWeb() ? 14 : 16,
        color: myColors.primary.main,
        paddingHorizontal: 16,
        height: '100%',
    },
    heroSearchButton: {
        width: isDesktopWeb() ? 60 : 50,
        height: isDesktopWeb() ? 60 : 50,
        backgroundColor: myColors.primary.main,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerRight: {
        flex: isDesktopWeb() ? 0.4 : undefined,
        width: isDesktopWeb() ? undefined : '100%',
        justifyContent: 'space-between',
        marginTop: isDesktopWeb() ? 0 : 20,
        paddingRight: isDesktopWeb() ? 50 : 0,
    },
    featureGrid: {
        gap: isDesktopWeb() ? 12 : 8,
        justifyContent: isDesktopWeb() ? 'space-between' : 'center',
        height: isDesktopWeb() ? 'auto' : undefined,
        ...(isDesktopWeb() && {
            paddingVertical: 0,
            height: 195,
            justifyContent: 'space-between',
        }),
    },
    featureRow: {
        flexDirection: 'row',
        gap: isDesktopWeb() ? 24 : 8,
        justifyContent: isDesktopWeb() ? 'flex-start' : 'center',
        ...(isDesktopWeb() && {
            flex: 1,
            alignItems: 'center',
        }),
    },
    featureCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: isDesktopWeb() ? 12 : 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: isDesktopWeb() ? 160 : 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        flex: 1,
        minHeight: isDesktopWeb() ? 50 : 44,
        ...(isDesktopWeb() && {
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: 36,
        }),
    },
    featureIcon: {
        width: 18,
        height: 18,
        backgroundColor: myColors.primary.main,
        borderRadius: 2,
        flexShrink: 0,
    },
    featureText: {
        fontSize: isDesktopWeb() ? 13 : 12,
        color: '#262524',
        fontWeight: '400',
        flex: 1,
        textAlign: 'left',
    },

    // Intro Section - Full Width Background
    introSectionBackground: {
        backgroundColor: '#FFFFFF',
        width: '100%',
    },
    introSection: {
        paddingHorizontal: isDesktopWeb() ? 50 : 20,
        minHeight: isDesktopWeb() ? 200 : undefined,
        justifyContent: 'center',
        alignItems: 'center',
    },
    introText: {
        fontSize: isDesktopWeb() ? 15 : 13,
        color: '#687693',
        lineHeight: isDesktopWeb() ? 28 : 22,
        textAlign: isDesktopWeb() ? 'left' : 'center',
        fontFamily: 'Inter',
        fontWeight: '400',
    },

    // Why Us Section - Full Width Background
    whyUsSectionBackground: {
        backgroundColor: '#F3F2F2',
        width: '100%',
    },
    whyUsContent: {
        paddingVertical: isDesktopWeb() ? 120 : 60,
        paddingHorizontal: isDesktopWeb() ? 0 : 20,
    },
    whyUsTitle: {
        fontSize: isDesktopWeb() ? 36 : 28,
        fontWeight: '400',
        color: '#181818',
        textAlign: 'center',
        marginBottom: isDesktopWeb() ? 65 : 40,
        fontFamily: 'Poppins',
        lineHeight: isDesktopWeb() ? 50 : 40,
    },
    whyUsGrid: {
        flexDirection: isDesktopWeb() ? 'row' : 'column',
        gap: isDesktopWeb() ? 60 : 30,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: isDesktopWeb() ? 0 : 0,
    },
    whyUsCard: {
        flex: isDesktopWeb() ? 1 : undefined,
        alignItems: 'center',
        paddingHorizontal: isDesktopWeb() ? 20 : 0,
        maxWidth: isDesktopWeb() ? undefined : undefined,
    },
    whyUsIcon: {
        width: isDesktopWeb() ? 60 : 50,
        height: isDesktopWeb() ? 60 : 50,
        borderRadius: isDesktopWeb() ? 30 : 25,
        marginBottom: isDesktopWeb() ? 30 : 20,
    },
    whyUsCardTitle: {
        fontSize: isDesktopWeb() ? 20 : 18,
        fontWeight: '400',
        color: '#181818',
        textAlign: 'center',
        marginBottom: isDesktopWeb() ? 9 : 15,
        fontFamily: 'Poppins',
        lineHeight: 30,
    },
    whyUsCardText: {
        fontSize: 15,
        color: '#687693',
        textAlign: 'center',
        lineHeight: 28,
        fontFamily: 'Inter',
        fontWeight: '400',
    },
    linkText: {
        color: myColors.primary.main,
        textDecorationLine: 'underline',
    },
    // FAQ Section - Full Width on Desktop/Mobile
    faqSectionBackground: {
        backgroundColor: isDesktopWeb() ? '#FFFFFF' : '#F3F2F2',
        width: '100%',
    },
    faqSection: {
        paddingVertical: isDesktopWeb() ? 40 : 20,
        paddingHorizontal: 0,
        width: '100%',
        ...(isDesktopWeb() && {
            maxWidth: 1280,
            alignSelf: 'center',
        }),
    },
    faqTitle: {
        fontSize: isDesktopWeb() ? 32 : 28,
        fontWeight: '400',
        color: myColors.text.primary,
        textAlign: 'left',
        marginBottom: isDesktopWeb() ? 40 : 32,
        lineHeight: isDesktopWeb() ? 40 : 36,
        paddingHorizontal: isDesktopWeb() ? 0 : 20,
    },

    // Benefits Section - Full Width Background
    benefitsSectionBackground: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        paddingBottom: isDesktopWeb() ? 40 : 20,
    },
    benefitsGrid: {
        flexDirection: isDesktopWeb() ? 'row' : 'column',
        gap: isDesktopWeb() ? 24 : 20,
        paddingVertical: isDesktopWeb() ? 40 : 20,
        paddingHorizontal: isDesktopWeb() ? 0 : 20,
        ...(isDesktopWeb() && {
            maxWidth: 1280,
            alignSelf: 'center',
            width: '100%',
            justifyContent: 'space-between',
        }),
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: isDesktopWeb() ? 1 : undefined,
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingBottom: isDesktopWeb() ? 25 : 20,
    },
    benefitIconContainer: {
        position: 'relative',
        width: 70,
        height: 70,
        marginRight: 20,
        flexShrink: 0,
    },
    benefitIconBg: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    benefitIconInner: {
        position: 'absolute',
        top: 21,
        left: 21,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    benefitContent: {
        flex: 1,
        alignItems: 'flex-start',
    },
    benefitTitle: {
        fontSize: 20,
        fontWeight: '400',
        color: '#181818',
        marginBottom: 8,
        fontFamily: 'Poppins',
        lineHeight: 30,
        textAlign: 'left',
    },
    benefitDescription: {
        fontSize: 15,
        color: '#687693',
        lineHeight: 28,
        fontFamily: 'Inter',
        fontWeight: '400',
        textAlign: 'left',
    },
    benefitLine: {
        ...(isDesktopWeb() && {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: '#E0E0E0',
        }),
    },

    // CTA Section - Full Width Background
    ctaSectionBackground: {
        backgroundColor: '#F5F8FA',
        width: '100%',
    },
    ctaContent: {
        alignItems: 'center',
        paddingVertical: isDesktopWeb() ? 120 : 60,
        paddingHorizontal: isDesktopWeb() ? 0 : 20,
    },
    ctaTitle: {
        fontSize: isDesktopWeb() ? 60 : 30,
        fontWeight: '400',
        color: '#181818',
        textAlign: 'center',
        marginBottom: isDesktopWeb() ? 30 : 20,
        fontFamily: 'Poppins',
        lineHeight: isDesktopWeb() ? 70 : 40,
        letterSpacing: isDesktopWeb() ? -1.2 : 0,
    },
    ctaSubtitle: {
        fontSize: 15,
        color: '#687693',
        textAlign: 'center',
        marginBottom: isDesktopWeb() ? 30 : 25,
        lineHeight: 28,
        fontFamily: 'Inter',
        fontWeight: '400',
    },
    ctaButton: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: isDesktopWeb() ? 40 : 32,
        paddingVertical: isDesktopWeb() ? 16 : 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: isDesktopWeb() ? 316 : 280,
    },
    ctaButtonText: {
        fontSize: 13,
        fontWeight: '400',
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'Poppins',
        letterSpacing: 0.39,
        lineHeight: 20,
    },
});