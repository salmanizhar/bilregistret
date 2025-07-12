import React, { useRef, useState, useEffect, useCallback, useMemo, lazy, Suspense, memo } from 'react';
import {
    StyleSheet,
    View,
    StatusBar,
    Keyboard,
    Platform,
    Linking,
    Pressable,
} from 'react-native';

import { useRouter } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { createBoxShadow } from '@/utils/shadowHelper';

// 🚀 CRITICAL PATH - Load immediately for instant render
import SearchBar from '@/components/home/SearchBar';
import CategoryList from '@/components/home/CategoryList';
import PopupMenu from '@/components/menu/PopupMenu';
import ProfilePopupMenu from '@/components/menu/ProfilePopupMenu';
import { ImagePath } from '@/assets/images';
import MyText from '@/components/common/MyText';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { LoginPopup } from '@/components/auth';
import { useAuth } from '@/Services/api/context/auth.context';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import SafeSEOWrapper from '@/components/common/SafeSEOWrapper';
import { H1, H2, P, Strong, SemanticMain, SemanticSection, SemanticHeader } from '@/components/common/SemanticText';
import SEOSitemapGenerator from '@/components/seo/SEOSitemapGenerator';
import { HomepageSEO } from '@/components/seo';
import { preloadHomePage, makeEverythingInstant } from '@/utils/resourcePreloader';

// 🎯 LAZY LOADED - Below the fold components for instant page load
const CarCarousel = lazy(() => import('@/components/home/CarCarousel'));
const BlogList = lazy(() => import('@/components/home/BlogList'));
const FAQComponent = lazy(() => import('@/components/FAQComponent'));

// 🏎️ PERFORMANCE: Static data for SSG
const STATIC_YEAR = new Date().getFullYear();

// 🎯 SSG MODE DETECTION
const isSSGMode = () => {
    // Detect if we're in SSG/SSR context
    return typeof window === 'undefined' || !window.navigator?.userAgent;
};

// 🏎️ SSG: Initialize after function declaration
const IS_SSG = isSSGMode();

// 🎯 SSG STATIC CONTENT - Pre-rendered at build time
const StaticHeroSection = React.memo(() => (
    <SemanticHeader
        style={styles.seoHeroSection}
        role="banner"
        accessibilityLabel="Huvudheader för Bilregistret Sverige AB"
        itemScope
        itemType="https://schema.org/Organization"
    >
        <View style={styles.seoTitleContainer}>
            <H1
                id="main-title"
                style={styles.seoTitle}
                itemProp="name"
                fontFamily="Poppins"
            >
                Bilregistret Sverige AB
            </H1>
            <MyText style={styles.swedishFlag} accessibilityLabel="Swedish flag">🇸🇪</MyText>
        </View>
        <H2
            id="hero-subtitle"
            style={styles.seoSlogan}
            itemProp="description"
        >
            Sök <Strong>biluppgifter</Strong> i <Strong>bilregistret</Strong> via registreringsnummer
        </H2>
    </SemanticHeader>
));

// 🎯 SSG STATIC SERVICES - Pre-rendered categories
const StaticServicesSection = React.memo(({ onCategoryPress }: { onCategoryPress: (category: any) => void }) => (
    <View style={styles.servicesSection}>
        <H2
            id="services-heading"
            style={styles.hiddenHeading}
        >
            Bilregistret Tjänster - Sök Biluppgifter
        </H2>
        <CategoryList
            categories={CATEGORIES}
            onCategoryPress={onCategoryPress}
        />
    </View>
));

// 🎯 SSG STATIC SEO CONTENT - Pre-rendered at build time
const StaticSEOContentSection = React.memo(() => null);

// 🎯 STATIC DATA - Pre-computed at build time for SSG
const CATEGORIES: Array<{
    id: string;
    title: string;
    icon: any;
    iconType: 'svg' | 'png' | 'webp';
    altText: string;
    ariaLabel: string;
}> = [
        {
            id: '1',
            title: 'Biluppgifter',
            icon: ImagePath.biluppgifter,
            iconType: 'webp',
            altText: 'Sök biluppgifter i bilregistret - Få detaljerad fordonsinformation direkt via registreringsnummer',
            ariaLabel: 'Sök biluppgifter i bilregistret - Få detaljerad fordonsinformation om alla fordon i Sverige'
        },
        {
            id: '2',
            title: 'Bilvärdering',
            icon: ImagePath.bilvardering,
            iconType: 'webp',
            altText: 'Bilvärdering online - Värdera din bil enkelt och snabbt med AI-teknik',
            ariaLabel: 'Bilvärdering - Få professionell värdering av din bil direkt online'
        },
        {
            id: '3',
            title: 'Mina fordon',
            icon: ImagePath.minaFordon,
            iconType: 'webp',
            altText: 'Mina fordon - Hantera och spåra alla dina registrerade bilar på en plats',
            ariaLabel: 'Mina fordon - Administrera dina fordon och få påminnelser om besiktning'
        },
        {
            id: '4',
            title: 'Släpvagnskalkylator',
            icon: ImagePath.slapvagnskalkylator,
            iconType: 'webp',
            altText: 'Släpvagnskalkylator - Beräkna maximal släpvagnsvikt för säker körning',
            ariaLabel: 'Släpvagnskalkylator - Beräkna vilken släpvagnsvikt din bil kan dra säkert'
        },
        {
            id: '5',
            title: 'Bilmärken',
            icon: ImagePath.bilmarken,
            iconType: 'webp',
            altText: 'Bilmärken och tillverkare - Utforska alla bilmärken representerade i Sverige',
            ariaLabel: 'Bilmärken - Bläddra bland alla bilmärken och tillverkare i bilregistret'
        },
    ];

export default function HomeScreen() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);
    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const [searchHistoryVisible, setSearchHistoryVisible] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState('');

    // 🚀 INSTANT LOADING: All content renders immediately
    const belowFoldTimer = useRef<NodeJS.Timeout | null>(null);

    // 🚀 INSTANT: Removed all artificial delays and SSG hydration logic
    useEffect(() => {
        // Skip effects during SSG
        if (IS_SSG) return;

        // 🔥 AGGRESSIVE RESOURCE PRELOADING - Make everything instant
        if (Platform.OS === 'web') {
            // Universal instant optimizations
            makeEverythingInstant();

            // Homepage-specific preloading
            preloadHomePage();

            // console.log('🚀 HomePage: Aggressive preloading activated!');
        }

        // Clean up any existing timers
        return () => {
            if (belowFoldTimer.current) {
                clearTimeout(belowFoldTimer.current);
            }
        };
    }, []);

    // 🔥 INSTANT WEB OPTIMIZATIONS - Run immediately without delays
    useEffect(() => {
        if (Platform.OS !== 'web' || IS_SSG) return;

        // 🚀 IMMEDIATE web optimizations
        const immediateOptimizations = () => {
            // Dynamic viewport optimization
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
            }

            // Dynamic theme-color
            const hour = new Date().getHours();
            const isDark = hour < 7 || hour > 19;
            const themeColor = isDark ? '#003d7a' : '#0066cc';

            let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
            if (!themeColorMeta) {
                themeColorMeta = document.createElement('meta');
                themeColorMeta.name = 'theme-color';
                document.head.appendChild(themeColorMeta);
            }
            themeColorMeta.content = themeColor;

            // Performance hints
            const dnsPrefetchDomains = [
                'https://fonts.gstatic.com',
                'https://www.googletagmanager.com'
            ];

            dnsPrefetchDomains.forEach(domain => {
                const link = document.createElement('link');
                link.rel = 'dns-prefetch';
                link.href = domain;
                document.head.appendChild(link);
            });

            // Accessibility skip link
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = 'Hoppa till huvudinnehåll';
            skipLink.className = 'skip-link';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 1000;
                transition: top 0.3s;
            `;
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });
            document.body.prepend(skipLink);
        };

        // Run optimizations immediately
        immediateOptimizations();
    }, []);

    // Handler functions - Memoized for SSG performance
    const handleMenuPress = useCallback(() => {
        setMenuVisible(true);
    }, []);

    const handleProfilePress = useCallback(() => {
        setProfileMenuVisible(true);
    }, []);

    const openExternalUrl = useCallback((url: string) => {
        Linking.openURL(url).catch(err => {
            // console.error('Error opening URL:', err);
        });
    }, []);

    const handleAuthRequiredNavigation = useCallback((destination: any) => {
        if (!isAuthenticated) {
            setPendingNavigation(destination);
            setShowLoginPopup(true);
        } else {
            if (Platform.OS === 'web') {
                router.navigate(destination);
            } else {
                router.push(destination);
            }
        }
    }, [isAuthenticated, router]);

    const handleLoginSuccess = useCallback(() => {
        setShowLoginPopup(false);
        if (pendingNavigation) {
            const destination = pendingNavigation;
            setPendingNavigation('');
            router.push(destination as any);
        }
    }, [pendingNavigation, router]);

    const handleCategoryPress = useCallback((category: any) => {
        // 🎯 Track category interactions for SEO analytics
        if (Platform.OS === 'web' && (window as any).gtag) {
            (window as any).gtag('event', 'category_interaction', {
                event_category: 'User Engagement',
                event_label: category.title,
                value: 1
            });
        }

        switch (category.title) {
            case 'Biluppgifter':
                if (Platform.OS === 'web') {
                    router.navigate('/(main)/biluppgifter/');
                } else {
                    router.push('/(main)/biluppgifter/');
                }
                break;
            case 'Bilmärken':
                if (Platform.OS === 'web') {
                    router.navigate('/(main)/tillverkare');
                } else {
                    router.push('/(main)/tillverkare');
                }
                break;
            case 'Bilvärdering':
                openExternalUrl('https://do.riddermarkbil.se/t/t?a=1800849169&as=1948156165&t=2&tk=1');
                break;
            case 'Värva vänner':
                handleAuthRequiredNavigation('/(main)/ReferFriends');
                break;
            case 'Släpvagnskalkylator':
                if (Platform.OS === 'web') {
                    router.navigate('/(main)/slapvagnskalkylator');
                } else {
                    router.push('/(main)/slapvagnskalkylator');
                }
                break;
            case 'Mina fordon':
                if (Platform.OS === 'web') {
                    router.navigate('/(main)/mina-fordon');
                } else {
                    router.push('/(main)/mina-fordon');
                }
                break;
        }
    }, [router, handleAuthRequiredNavigation, openExternalUrl]);

    // Monitor scroll state
    useEffect(() => {
        setScrollEnabled(!menuVisible && !profileMenuVisible && !searchHistoryVisible && !showLoginPopup);
    }, [menuVisible, profileMenuVisible, searchHistoryVisible, showLoginPopup]);

    // 🏎️ PERFORMANCE: Static year for SSG
    const currentYear = STATIC_YEAR;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={myColors.primary.main} />

            {/* 🎯 SEO Head Tags - Homepage SEO */}
            <HomepageSEO />

            {/* 🎭 SEO Components - Render immediately */}
            <SafeSEOWrapper>
                <SEOSitemapGenerator />
            </SafeSEOWrapper>

            {/* Popup Components - Render immediately */}
            <PopupMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onReferFriendsPress={() => {
                    setMenuVisible(false);
                    handleAuthRequiredNavigation('/(main)/ReferFriends');
                }}
            />

            <ProfilePopupMenu
                visible={profileMenuVisible}
                onClose={() => setProfileMenuVisible(false)}
            />

            <LoginPopup
                visible={showLoginPopup}
                onClose={() => setShowLoginPopup(false)}
                onLoginSuccess={handleLoginSuccess}
            />

            {/* 🚀 SSG CRITICAL PATH - INSTANT STATIC RENDERING */}
            <FooterWrapper
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
                style={[
                    styles.scrollView,
                    Platform.OS === 'android' && (menuVisible || profileMenuVisible || showLoginPopup) && {
                        elevation: 0,
                        zIndex: 0,
                    }
                ]}
                scrollEnabled={scrollEnabled}
            >
                <View style={{ marginBottom: !isDesktopWeb() ? -50 : 0 }} onStartShouldSetResponder={() => true}>
                    <DesktopViewWrapper>
                        {/* 🌟 SSG STATIC HERO - Pre-rendered HTML - Desktop Only */}
                        {isDesktopWeb() && (
                            <View style={styles.heroContainer}>
                                <StaticHeroSection />
                            </View>
                        )}

                        {/* 🎯 SSG STATIC MAIN CONTENT - Pre-rendered critical path */}
                        <SemanticMain
                            style={styles.content}
                            role="main"
                            id="main-content"
                            accessibilityLabel="Huvudinnehåll för bilregistret"
                            itemScope
                            itemType="https://schema.org/WebPage"
                        >
                            {/* 🚀 INSTANT: Search bar - immediate availability */}
                            {!isDesktopWeb() && (
                                <SearchBar
                                    onMenuPress={handleMenuPress}
                                    onProfilePress={handleProfilePress}
                                />
                            )}

                            {/* 🚀 INSTANT: Categories - instant conversion opportunity */}
                            <View style={styles.categoriesContainer}>
                                <StaticServicesSection onCategoryPress={handleCategoryPress} />
                            </View>

                            {/* Manufacturers Section */}
                            <SemanticSection
                                style={styles.manufacturersSection}
                                role="region"
                                ariaLabelledBy="manufacturers-heading"
                                accessibilityLabel="Bilmärken och tillverkare"
                                itemScope
                                itemType="https://schema.org/Organization"
                            >
                                <H2
                                    id="manufacturers-heading"
                                    style={styles.sectionTitle}
                                    itemProp="name"
                                >
                                    Tillverkare
                                </H2>
                                <P style={styles.sectionDescription} itemProp="description">
                                    Utforska <Strong>biluppgifter</Strong> för alla stora bilmärken. Vårt <Strong>bilregister</Strong> innehåller detaljerad information om miljontals fordon från hundratals tillverkare.
                                </P>

                                {/* 🚀 INSTANT: Load component immediately with instantRender prop */}
                                <Suspense fallback={null}>
                                    <CarCarousel
                                        disabled={(menuVisible || profileMenuVisible || showLoginPopup) && Platform.OS === 'android'}
                                        instantRender={true}
                                    />
                                </Suspense>
                            </SemanticSection>

                            {/* News and Blog Section */}
                            <SemanticSection
                                style={styles.newsSection}
                                role="region"
                                ariaLabelledBy="news-heading"
                                accessibilityLabel="Senaste nyheterna om biluppgifter och bilregistret"
                                itemScope
                                itemType="https://schema.org/Blog"
                            >
                                <MyText
                                    id="news-heading"
                                    style={[styles.sectionTitle, {}] as any}
                                    fontFamily="Poppins"
                                >
                                    Nyheter
                                </MyText>
                                {(
                                    <P style={styles.sectionDescription} itemProp="description">
                                        Håll dig uppdaterad med de senaste nyheterna om <Strong>biluppgifter</Strong>, <Strong>bilregistret</Strong> och fordonstrender i Sverige.
                                    </P>
                                )}

                                {/* 🚀 INSTANT: Load component immediately with instantRender prop */}
                                <View style={{ marginTop: Platform.OS !== 'web' ? -20 : 20 }}>

                                    <Suspense fallback={null}>
                                        <BlogList
                                            disabled={(menuVisible || profileMenuVisible || showLoginPopup) && Platform.OS === 'android'}
                                            instantRender={true}
                                        />
                                    </Suspense>
                                </View>

                            </SemanticSection>

                            {/* FAQ Section */}
                            <SemanticSection
                                style={styles.faqSection}
                                role="region"
                                ariaLabelledBy="faq-heading"
                                accessibilityLabel="Vanliga frågor om biluppgifter och bilregistret"
                                itemScope
                                itemType="https://schema.org/FAQPage"
                            >
                                <MyText
                                    id="faq-heading"
                                    style={styles.faqSectionTitle}
                                    fontFamily="Poppins"
                                >
                                    Vanliga Frågor om Biluppgifter
                                </MyText>
                                {(
                                    <P style={styles.faqDescription} itemProp="description">
                                        Få svar på de vanligaste frågorna om att söka <Strong>biluppgifter</Strong> i <Strong>bilregistret</Strong>. Lär dig hur du använder våra AI-tjänster för att få detaljerad fordonsinformation.
                                    </P>
                                )}

                                {/* 🚀 INSTANT: Load component immediately with instantRender prop */}
                                <Suspense fallback={null}>
                                    <FAQComponent
                                        selectedCategory="HomeScreen"
                                        instantRender={true}
                                    />
                                </Suspense>
                            </SemanticSection>

                            {/* 🎯 INSTANT STATIC SEO CONTENT */}
                            <StaticSEOContentSection />
                        </SemanticMain>
                    </DesktopViewWrapper>
                </View>

                {isDesktopWeb() && <View style={{ height: 100 }} />}
                {!isDesktopWeb() && (
                    <P style={styles.footerText}>
                        © {currentYear} Bilregistret.ai | Alla rättigheter reserverade Bilregistret Sverige AB Ansvarig utgivare: Alen Rasic, databasens namn: bilregistret.ai
                    </P>
                )}
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
        flex: 1,
        ...(isDesktopWeb() && {
            width: '100%',
            alignItems: 'center',
        }),
    },
    footerText: {
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 9,
        color: myColors.text.secondary,
        // marginTop: 20,
        paddingHorizontal: 10,
        paddingBottom: Platform.OS === "android" ? 50 : 0,
        width: '70%',
    },
    scrollViewContent: {
        paddingBottom: isDesktopWeb() ? 0 : 20,
        ...(isDesktopWeb() && {
            alignItems: 'center',
            width: '100%',
        }),
    },
    heroContainer: {
        ...(isDesktopWeb() && {
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        }),
    },
    seoHeroSection: {
        paddingTop: 80,
        paddingBottom: 60,
        paddingHorizontal: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: myColors.screenBackgroundColor,
        width: '100%',
        ...(isDesktopWeb() && {
            maxWidth: 1280,
        }),
    },
    seoTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        width: '100%',
    },
    seoTitle: {
        fontSize: 48,
        fontWeight: '700',
        color: myColors.text.primary,
        textAlign: 'center',
    },
    swedishFlag: {
        fontSize: 48,
        marginLeft: 16,
    },
    seoSlogan: {
        fontSize: 24,
        color: myColors.text.primary,
        textAlign: 'center',
        marginBottom: 20,
        maxWidth: 800,
        fontWeight: '600',
        width: '100%',
        alignSelf: 'center',
        ...(isDesktopWeb() && {
            marginHorizontal: 'auto',
            paddingHorizontal: 20,
        }),
    },
    categoriesContainer: {
        ...(isDesktopWeb() && {
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: 1280,
            alignSelf: 'center',
        }),
    },
    servicesSection: {
        marginBottom: 40,
        ...(isDesktopWeb() && {
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        }),
    },
    manufacturersSection: {
        marginBottom: 40,
    },
    newsSection: {
        marginBottom: isDesktopWeb() ? 40 : 0,
        marginTop: isDesktopWeb() ? 80 : 30
    },
    faqSection: {
        marginBottom: isDesktopWeb() ? -70 : 40,
        // ...(isDesktopWeb() && {
        //     // width: '100%',
        //     alignItems: 'center',
        //     justifyContent: 'center',
        //     width: 1280,
        //     alignSelf: 'center',
        // }),
    },
    sectionTitle: {
        fontSize: isDesktopWeb() ? 28 : 22,
        color: myColors.text.primary,
        marginLeft: isDesktopWeb() ? 10 : 20,
        marginBottom: 8,
        fontWeight: '700',
    },
    sectionDescription: {
        fontSize: isDesktopWeb() ? 16 : 14,
        color: myColors.text.placeholderText,
        marginLeft: isDesktopWeb() ? 10 : 20,
        marginRight: isDesktopWeb() ? 10 : 20,
        marginBottom: isDesktopWeb() ? 10 : 20,
        lineHeight: 24,
    },
    hiddenHeading: {
        position: 'absolute',
        left: -9999,
        top: -9999,
        width: 1,
        height: 1,
        overflow: 'hidden',
    },
    faqSectionTitle: {
        fontSize: isDesktopWeb() ? 28 : 22,
        color: myColors.text.primary,
        marginLeft: isDesktopWeb() ? 10 : 20,
        marginBottom: 8,
        fontWeight: '700',
    },
    faqDescription: {
        fontSize: isDesktopWeb() ? 16 : 14,
        color: myColors.text.placeholderText,
        marginLeft: isDesktopWeb() ? 10 : 20,
        marginRight: isDesktopWeb() ? 10 : 20,
        marginBottom: 20,
        lineHeight: 24,
    },
    seoContentSection: {
        backgroundColor: myColors.white,
        marginHorizontal: 20,
        marginVertical: 40,
        padding: 40,
        borderRadius: 20,
        ...createBoxShadow({
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
        }),
        elevation: 5,
    },
    additionalInfoTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: myColors.text.primary,
        textAlign: 'center',
        marginBottom: 40,
    },
    seoContentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 30,
    },
    seoContentItem: {
        width: '48%',
        minWidth: 300,
    },
    seoContentItemTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: 12,
    },
    seoContentItemText: {
        fontSize: 16,
        color: myColors.text.placeholderText,
        lineHeight: 24,
    },
});