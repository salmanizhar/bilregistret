import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ScrollView, TouchableNativeFeedback, TouchableWithoutFeedback, Pressable, Keyboard, Animated, Platform, ActivityIndicator, Dimensions, InteractionManager, SectionList } from 'react-native';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import HeaderWithSearch from '@/components/common/HeaderWithSearch';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import ProductSearchBar from '@/components/common/ProductSearchBar';
import CustomDropdownPicker, { DropdownItem } from '@/components/common/CustomDropdownPicker';
import { useCarBrands } from '@/Services/api/hooks/car.hooks'; // Keep for mobile
import { convertWixImageUrl, hyphensToSpaces, isUrl, spacesToHyphens } from '@/constants/commonFunctions';
import { useLayoutType } from '@/hooks/useLayoutType';
import { useIsFocused } from '@react-navigation/native';
import { isDesktopWeb } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { desktopWebViewport } from '@/constants/commonConst';
import moment from 'moment';
import { SEOHead } from '@/components/seo';

import {
    getStaticCarBrands,
    transformBrandsDataForComponent,
    isStaticContentAvailable,
    getSSGCarBrands,
    isSSGMode,
    logSSGPerformance
} from '@/utils/staticContentLoader'; // Only used on web
import {
    optimizeImageForWeb,
    createOptimizedImageProps,
    WebImagePreloader,
    WebLazyImageObserver
} from '@/utils/webImageOptimizer';
import { H1 } from '@/components/common/SemanticText';

// Types
interface Props {
    showHeader?: boolean;
}

interface CarBrandData {
    id: string;
    merke_id: string;
    title: string;
    countryFlag: string;
    brandImage: string;
    country?: string; // Add country field
}

// Add new filter types
type CountryFilter = 'all' | string;
type OrderBy = 'name' | 'country';

// Header component
const HeaderComponent = ({
    infoSearchInputText,
    setInfoSearchInputText,
    layouts,
    countryFilter,
    setCountryFilter,
    orderBy,
    setOrderBy,
    countryOptions
}: {
    infoSearchInputText: string,
    setInfoSearchInputText: (text: string) => void,
    layouts: React.ReactNode,
    countryFilter: string,
    setCountryFilter: (value: string) => void,
    orderBy: string,
    setOrderBy: (value: string) => void,
    countryOptions: DropdownItem[]
}) => {
    const orderByOptions: DropdownItem[] = [
        { label: 'Sortera efter namn', value: 'name' },
        { label: 'Sortera efter ursprungsland', value: 'country' }
    ];

    const handleCountryChange = (item: DropdownItem) => {
        setCountryFilter(item.value as string);
    };

    const handleOrderByChange = (item: DropdownItem) => {
        setOrderBy(item.value as string);
    };


    const FiltersAndOrder = () => {
        // {/* Filter Dropdowns */}
        return (
            <View style={styles.filterContainer}>
                <View style={styles.filterRow}>
                    <CustomDropdownPicker
                        data={countryOptions}
                        value={countryFilter}
                        onChange={handleCountryChange}
                        placeholder="Alla ursprungsländer"
                        style={styles.filterDropdown}
                        searchable={true}
                        searchPlaceholder="Sök land"
                        useMobileModal={true}
                        modalTitle="Välj land"

                    />
                    <CustomDropdownPicker
                        data={orderByOptions}
                        value={orderBy}
                        onChange={handleOrderByChange}
                        placeholder="Sortera efter namn"
                        style={styles.filterDropdown}
                        searchable={true}
                        useMobileModal={true}
                        modalTitle="Välj sortering efter"

                    />
                </View>
            </View>
        )
    }

    return (
        <View style={styles.webHeaderContainer}>
            {!isDesktopWeb() && <HeaderWithSearch />}
            {isDesktopWeb() &&
                <H1 id="hero-title"
                    style={styles.heroTitle}
                    role="heading"
                    ariaLevel={1}
                    itemProp="headline"
                >
                    Bilmärken
                </H1>
            }
            <View style={styles.searchContainer}>
                <ProductSearchBar
                    placeholder="Sök specifik Bilmodell..."
                    value={infoSearchInputText}
                    onChangeText={setInfoSearchInputText}
                />
                {isDesktopWeb() &&
                    <View style={{ flex: 1 }}>
                        {FiltersAndOrder()}
                    </View>
                }
                {layouts}
            </View>
            {!isDesktopWeb() && FiltersAndOrder()}

        </View>
    )
}

// OLD: Async hook with loading states (SLOW!)
// Static data source - ONLY used on web platforms
function useStaticCarBrands() {
    const [carBrands, setCarBrands] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            if (isStaticContentAvailable()) {
                // console.log('🌐 WEB: Loading car brands from static content (ZERO API CALLS!)');
                const staticBrands = getStaticCarBrands();
                const transformedBrands = transformBrandsDataForComponent(staticBrands);
                setCarBrands(transformedBrands);
                setIsLoading(false);
                // console.log(`✅ WEB: Loaded ${transformedBrands.length} brands from static content`);
            } else {
                // console.log('⚠️ WEB: Static content not available, using API fallback');
                setCarBrands([]);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error loading static car brands:', error);
            setCarBrands([]);
            setIsLoading(false);
        }
    }, []);

    return {
        data: carBrands,
        isLoading
    };
}

// NEW: Synchronous SSG data loading (INSTANT!)
function useSSGCarBrands() {
    // For SSG: Data is available immediately, no loading state needed!
    const ssgData = isSSGMode() ? getSSGCarBrands() : [];

    return {
        data: ssgData,
        isLoading: false // Never loading for SSG!
    };
}

// Cards per row configuration
const CARDS_PER_ROW = {
    mobile: 2,
    desktop: 6
};

const CarBrand = (props: Props) => {
    const isFocused = useIsFocused();

    const [infoSearchInputText, setInfoSearchInputText] = useState('');

    // Add filter state
    const [countryFilter, setCountryFilter] = useState<CountryFilter>('all');
    const [orderBy, setOrderBy] = useState<OrderBy>('name');

    // Add state to persist data on mobile to prevent disappearing
    const [persistedData, setPersistedData] = useState<any[]>([]);
    const [hasInitialData, setHasInitialData] = useState(false);

    // Create wrapper functions to handle type conversion
    const handleCountryFilterChange = useCallback((value: string) => {
        setCountryFilter(value as CountryFilter);
    }, []);

    const handleOrderByChange = useCallback((value: string) => {
        setOrderBy(value as OrderBy);
    }, []);

    // Platform-specific data loading:
    // STRATEGY: SSG ONLY FOR WEB, Mobile always uses API
    // - SSG WEB: Use synchronous static content (ZERO API hooks instantiated!)
    // - NON-SSG WEB: Use static content OR API fallback
    // - MOBILE: ALWAYS use API hooks (live API calls)

    // Step 1: Determine data loading strategy upfront - but always ensure mobile gets API
    const dataLoadingStrategy = useMemo(() => {
        // MOBILE: Always use API - SSG is WEB ONLY!
        if (!isDesktopWeb()) {
            return 'MOBILE_API'; // Mobile ALWAYS uses API
        }

        // WEB: Check for SSG capabilities
        if (isSSGMode()) {
            return 'SSG_ONLY'; // Pure SSG - no API hooks at all
        } else if (isStaticContentAvailable()) {
            return 'STATIC_WITH_FALLBACK'; // Static content with API emergency fallback
        } else {
            return 'API_ONLY'; // Web without static content - use API
        }
    }, []);

    // Step 2: ALWAYS instantiate API hooks for mobile, conditionally for web
    // This fixes the mobile native issue!
    // For mobile, always keep the hook enabled to prevent data loss during navigation
    const apiData = !isDesktopWeb() || dataLoadingStrategy === 'API_ONLY' || dataLoadingStrategy === 'STATIC_WITH_FALLBACK'
        ? useCarBrands({ enabled: !isDesktopWeb() || isFocused }) // Always enabled for mobile
        : { data: [], isLoading: false }; // Dummy data only for SSG web

    // Step 3: Load data based on strategy
    const { data: carBrands, isLoading } = useMemo(() => {
        switch (dataLoadingStrategy) {
            case 'MOBILE_API':
                // Mobile ALWAYS uses API - this ensures mobile native works!
                // console.log('📱 MOBILE_API: Using live API for mobile native');
                // For mobile, use persisted data as fallback if API data is empty/loading
                if (!isDesktopWeb() && (!apiData.data || apiData.data.length === 0) && persistedData.length > 0 && !apiData.isLoading) {
                    return { data: persistedData, isLoading: false };
                }
                return apiData;

            case 'SSG_ONLY':
                // Pure SSG: Instant synchronous data, zero API calls (WEB ONLY)
                const ssgData = getSSGCarBrands();
                // console.log('🚀 SSG_ONLY: Loaded data instantly (WEB ONLY - zero API overhead)');
                return { data: ssgData, isLoading: false };

            case 'STATIC_WITH_FALLBACK':
                // Static content with emergency API fallback (WEB ONLY)
                const staticBrands = getStaticCarBrands();
                if (staticBrands && staticBrands.length > 0) {
                    const transformedBrands = transformBrandsDataForComponent(staticBrands);
                    // console.log('🌐 STATIC_WITH_FALLBACK: Using static content (WEB)');
                    return { data: transformedBrands, isLoading: false };
                } else {
                    // Emergency fallback to API
                    // console.log('⚠️ STATIC_WITH_FALLBACK: Static failed, using API emergency fallback (WEB)');
                    return apiData;
                }

            case 'API_ONLY':
                // Web without static content - use API
                // console.log('📡 API_ONLY: Using API data (WEB)');
                return apiData;

            default:
                console.error('Unknown data loading strategy:', dataLoadingStrategy);
                return { data: [], isLoading: false };
        }
    }, [dataLoadingStrategy, apiData, persistedData]);

    // Log strategy for debugging
    useEffect(() => {
        // console.log(`📊 Data Loading Strategy: ${dataLoadingStrategy}`);
        // console.log(`🎯 Platform: ${isDesktopWeb() ? 'Desktop Web' : 'Mobile'}`);
        // console.log(`🔧 SSG Mode: ${isSSGMode()}`);
        // console.log(`📁 Static Available: ${isStaticContentAvailable()}`);

        // Log performance for SSG
        if (dataLoadingStrategy === 'SSG_ONLY' && carBrands && carBrands.length > 0) {
            logSSGPerformance('CarBrand', carBrands.length);
        }
    }, [dataLoadingStrategy, carBrands?.length]);

    // Persist data on mobile to prevent disappearing during navigation
    useEffect(() => {
        if (!isDesktopWeb() && carBrands && carBrands.length > 0 && !isLoading) {
            setPersistedData(carBrands);
            setHasInitialData(true);
        }
    }, [carBrands, isLoading]);

    // Handle focus/blur for mobile navigation
    useFocusEffect(
        useCallback(() => {
            // When screen comes into focus, check if we need to restore data
            if (!isDesktopWeb() && !carBrands?.length && persistedData.length > 0) {
                // Don't clear persisted data immediately, let the API call complete first
                // The API should refresh the data naturally
            }

            return () => {
                // When screen loses focus, keep the persisted data
                // Don't clear it to prevent data loss
            };
        }, [carBrands, persistedData])
    );

    const { layoutType, updateLayoutType } = useLayoutType('brand');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const itemsPerPage = 20; // Adjust this number based on your needs

    // SSG OPTIMIZATION: Reduce JavaScript overhead for instant loading
    const shouldOptimizeForSSG = dataLoadingStrategy === 'SSG_ONLY';

    // SSG: Skip heavy computations during initial render
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Mark as hydrated after first render
        setIsHydrated(true);
    }, []);

    // SSG: Defer non-critical JavaScript until after hydration
    const deferredFeatures = useMemo(() => {
        if (shouldOptimizeForSSG && !isHydrated) {
            // During SSG hydration: Disable expensive features
            return {
                imagePreloading: false,
                pagination: false,
                dynamicStyles: false,
                searchFiltering: false
            };
        }

        // After hydration OR non-SSG: Enable all features
        return {
            imagePreloading: true,
            pagination: true,
            dynamicStyles: true,
            searchFiltering: true
        };
    }, [shouldOptimizeForSSG, isHydrated]);

    // Calculate layout width based on platform (deferred for SSG)
    const layoutWidth = useMemo(() => {
        if (shouldOptimizeForSSG && !deferredFeatures.dynamicStyles) {
            return isDesktopWeb() ? desktopWebViewport : 375; // Default mobile width
        }
        return isDesktopWeb() ? desktopWebViewport : Dimensions.get('window').width;
    }, [shouldOptimizeForSSG, deferredFeatures.dynamicStyles]);

    // Get cards per row based on platform
    const cardsPerRow = useMemo(() => {
        return isDesktopWeb() ? CARDS_PER_ROW.desktop : CARDS_PER_ROW.mobile;
    }, []);

    // Create dynamic styles based on layout width (optimized for SSG)
    const dynamicStyles = useMemo(() => {
        if (shouldOptimizeForSSG && !deferredFeatures.dynamicStyles) {
            // SSG: Use static styles during hydration
            return {
                carBrandItemContainer: {
                    height: isDesktopWeb() ? 196 : 165,
                    width: isDesktopWeb() ? 196 : 165, // Fixed square width for SSG mobile
                    borderRadius: 10,
                    backgroundColor: myColors.white,
                    padding: 6,
                    marginStart: isDesktopWeb() ? 10 : 15,
                    marginVertical: isDesktopWeb() ? 5 : 6,
                },
                carBrandImageContainer: {
                    width: isDesktopWeb() ? 74 : 74,
                    height: 60,
                    padding: 3,
                    justifyContent: 'center' as const,
                    alignItems: 'center' as const,
                },
            };
        }

        // Regular dynamic calculation
        const margin = isDesktopWeb() ? 10 : 15;

        // For desktop web, use fixed 196x196 dimensions
        // For mobile, use responsive calculation
        let cardWidth, cardHeight;
        if (isDesktopWeb()) {
            cardWidth = 196;
            cardHeight = 196;
        } else {
            cardWidth = (layoutWidth - (cardsPerRow + 1) * margin) / cardsPerRow;
            cardHeight = cardWidth; // Make mobile cards square
        }

        const imageContainerWidth = isDesktopWeb() ? 74 : Math.min(cardWidth - 12, 74);
        const imageContainerHeight = isDesktopWeb() ? 60 : Math.min(cardWidth - 8, 60);

        return {
            carBrandItemContainer: {
                height: cardHeight,
                width: cardWidth,
                borderRadius: 10,
                backgroundColor: myColors.white,
                padding: 6,
                marginStart: margin,
                marginVertical: isDesktopWeb() ? margin / 2 : 6,
            },
            carBrandImageContainer: {
                width: imageContainerWidth,
                height: imageContainerHeight,
                padding: 3,
                justifyContent: 'center' as const,
                alignItems: 'center' as const,
            },
        };
    }, [layoutWidth, cardsPerRow, shouldOptimizeForSSG, deferredFeatures.dynamicStyles]);

    // Original mobile press handler
    const handleCarBrandPress = (item: CarBrandData) => {
        router.push({
            pathname: "/(main)/tillverkare/[brand]",
            params: { brand: spacesToHyphens(item.title).toLowerCase() }
        } as any);
    }

    // Create the image load handler outside the render function - at component level
    const handleImageLoad = useCallback(() => {
        // Schedule image cache clearing after a short delay
        setTimeout(() => {
            if (Platform.OS !== 'web') {
                Image.clearMemoryCache();
            }
        }, 300);
    }, []);

    // ORIGINAL mobile renderCarBrandItem with layout types
    const renderCarBrandItem = ({ item, index }: { item: CarBrandData | { type: 'header'; title: string; id: string }; index?: number }) => {
        // Handle section headers
        if ('type' in item && item.type === 'header') {
            return renderSectionHeader(item.title);
        }

        // Handle regular car brand items
        const carBrandItem = item as CarBrandData;
        // WEB: Determine image priority based on position
        const isAboveFold = index !== undefined && index < 3;
        const priority = isAboveFold ? 'critical' : (index !== undefined && index < 10 ? 'high' : 'lazy');

        // WEB: Get optimized image props (native gets standard props)
        const brandImageProps = isDesktopWeb()
            ? createOptimizedImageProps(carBrandItem.brandImage, 'brand', priority)
            : {
                source: { uri: carBrandItem.brandImage },
                priority: 'high' as const,
                contentFit: 'contain' as const,
                cachePolicy: 'disk' as const,
                responsivePolicy: 'live' as const,
                onLoadEnd: handleImageLoad
            };

        const flagImageProps = isDesktopWeb()
            ? createOptimizedImageProps(carBrandItem.countryFlag, 'brand', priority)
            : {
                source: { uri: carBrandItem.countryFlag },
                priority: 'high' as const,
                contentFit: 'fill' as const,
                cachePolicy: 'disk' as const,
                responsivePolicy: 'live' as const,
                onLoadEnd: handleImageLoad
            };

        if (layoutType === 0) {
            return (
                <TouchableOpacity style={dynamicStyles.carBrandItemContainer} onPress={() => handleCarBrandPress(carBrandItem)}>
                    <View style={styles.countryFlagContainer}>
                        <Image
                            {...flagImageProps}
                            style={styles.countryFlag}
                        />
                        <View style={[styles.totalCountPil, isDesktopWeb() ? styles.totalCountPilListViewDesktop : null]}>
                            <MyText style={[styles.carBrandItemTitleListViewTotalCount, isDesktopWeb() && styles.carBrandItemTitleListViewTotalCountListViewDesktop]}>
                                {"1.9k"}
                            </MyText>
                        </View>
                    </View>
                    <View style={styles.carBrandItemContent}>
                        <View style={dynamicStyles.carBrandImageContainer}>
                            <Image
                                {...brandImageProps}
                                style={styles.carBrandImage}
                            />
                        </View>
                        <MyText adjustsFontSizeToFit style={styles.carBrandItemTitle}>{carBrandItem.title}</MyText>
                    </View>
                </TouchableOpacity>
            )
        } else if (layoutType === 1) {
            return (
                <TouchableOpacity
                    style={[
                        styles.carBrandItemContainerListView,
                        isDesktopWeb() ? styles.carBrandItemContainerListViewDesktop : styles.carBrandItemContainerListViewMobile
                    ]}
                    onPress={() => handleCarBrandPress(carBrandItem)}
                    activeOpacity={0.8}
                >
                    {/* Brand Logo - No Background */}
                    <View style={styles.carBrandImageContainerListView}>
                        <Image
                            {...brandImageProps}
                            style={styles.carBrandImageListView}
                            contentFit='contain'
                        />
                    </View>

                    {/* Brand Name with Big Space */}
                    <View style={styles.brandTitleContainerListView}>
                        <MyText style={styles.carBrandItemTitleListView}>
                            {carBrandItem.title}
                        </MyText>
                    </View>

                    {/* Country Flag */}
                    <Image
                        {...flagImageProps}
                        style={styles.countryFlagListView}
                    />

                    {/* Count Text */}
                    <MyText style={styles.countryCountText}>
                        1.9k
                    </MyText>
                </TouchableOpacity>
            )
        }
        // Default case for layoutType === 2 or any other value - TEXT ONLY
        return (
            <TouchableOpacity
                style={[
                    styles.carBrandItemContainerTextListView,
                    // isDesktopWeb() ? undefined : undefined
                ]}
                onPress={() => handleCarBrandPress(carBrandItem)}
                activeOpacity={0.8}
            >
                <View style={styles.carBrandItemContentTextListView}>
                    <View style={isDesktopWeb() ? styles.brandTextInfo : styles.brandTextInfoMobile}>
                        <MyText numberOfLines={1} style={[
                            styles.carBrandItemTitleListView,
                            isDesktopWeb() ? styles.carBrandItemTitleTextOnlyDesktop : styles.carBrandItemTitleTextOnlyMobile
                        ]}>
                            {carBrandItem.title}
                        </MyText>
                        {/* {(isDesktopWeb() || !isDesktopWeb()) && (
                            <MyText style={isDesktopWeb() ? styles.countryNameTextOnly : styles.countryNameTextOnlyMobile}>
                                {carBrandItem.country}
                            </MyText>
                        )} */}
                    </View>
                </View>
                <View style={[
                    styles.totalCountPilTextListView,
                    // isDesktopWeb() ? styles.totalCountPilTextOnlyDesktop : styles.totalCountPilTextOnlyMobile
                ]}>
                    <MyText fontFamily='Poppins' style={[
                        styles.carBrandItemTitleListViewTotalCount,
                        isDesktopWeb() ? styles.carBrandItemTitleListViewTotalCountTextOnlyDesktop : styles.carBrandItemTitleListViewTotalCountTextOnlyMobile
                    ]}>
                        {"1.9k"}
                    </MyText>
                </View>
            </TouchableOpacity>
        )
    }

    const Layouts = () => {
        // Calculate selected background position based on current layout type
        const getSelectedBackgroundStyle = () => {
            const baseStyle = {
                backgroundColor: '#EEF1FB',
                position: 'absolute' as const,
                // top: 1,
                width: isDesktopWeb() ? 55 : 43,
                height: isDesktopWeb() ? 50 : 40,
                zIndex: 1,
            };

            switch (layoutType) {
                case 0:
                    return {
                        ...baseStyle,
                        // left: 1,
                        borderTopLeftRadius: 7,
                        borderBottomLeftRadius: 7,
                    };
                case 1:
                    return {
                        ...baseStyle,
                        left: isDesktopWeb() ? 55 : 44,
                    };
                case 2:
                    return {
                        ...baseStyle,
                        left: isDesktopWeb() ? 109 : 87,
                        borderTopRightRadius: 7,
                        borderBottomRightRadius: 7,
                    };
                default:
                    return baseStyle;
            }
        };

        return (
            <View style={styles.layoutContainer}>
                {/* Selected background indicator */}
                <View style={getSelectedBackgroundStyle()} />

                {/* Vertical dividers */}
                <View style={[
                    styles.layoutDivider,
                    {
                        left: isDesktopWeb() ? 55 : 44,
                        height: isDesktopWeb() ? 50 : 40
                    }
                ]} />
                <View style={[
                    styles.layoutDivider,
                    {
                        left: isDesktopWeb() ? 109 : 87,
                        height: isDesktopWeb() ? 50 : 40
                    }
                ]} />

                <TouchableOpacity
                    style={styles.layoutButton}
                    onPress={() => updateLayoutType(0)}
                    activeOpacity={0.7}
                >
                    <SvgXml xml={layoutType === 0 ? ImagePath.SvgIcons.LayoutBoxGridSelectedIcon : ImagePath.SvgIcons.LayoutBoxGridUnselectedIcon} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.layoutButton}
                    onPress={() => updateLayoutType(1)}
                    activeOpacity={0.7}
                >
                    <SvgXml xml={layoutType === 1 ? ImagePath.SvgIcons.LayoutListGridSelectedIcon : ImagePath.SvgIcons.LayoutListGridUnselectedIcon} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.layoutButton}
                    onPress={() => updateLayoutType(2)}
                    activeOpacity={0.7}
                >
                    <SvgXml xml={layoutType === 2 ? ImagePath.SvgIcons.LayoutTextListGridSelectedIcon : ImagePath.SvgIcons.LayoutTextListGridUnselectedIcon} />
                </TouchableOpacity>
            </View>
        )
    }

    // Transform API data to match the component's data structure
    // Use the most reliable data source available
    const dataToTransform = carBrands && carBrands.length > 0 ? carBrands :
        (!isDesktopWeb() && persistedData.length > 0 ? persistedData : []);

    const transformedData = dataToTransform?.map(brand => ({
        id: brand.id.toString(),
        merke_id: brand.merke_id.toString(),
        title: brand.title,
        brandImage: convertWixImageUrl(brand.brandimage),
        countryFlag: convertWixImageUrl(brand.flags),
        country: brand.country || 'Unknown' // Add country field with fallback
    })) || [];

    // Get unique countries for filter dropdown with flags
    const countryOptions: DropdownItem[] = useMemo(() => {
        // Create a map of countries to their flags
        const countryFlagMap = new Map<string, string>();
        transformedData.forEach(brand => {
            if (brand.country && brand.country !== 'Unknown') {
                countryFlagMap.set(brand.country, brand.countryFlag);
            }
        });

        const countries = Array.from(countryFlagMap.keys()).sort();

        return [
            { label: 'Alla ursprungsländer', value: 'all' },
            ...countries.map(country => ({
                label: country,
                value: country,
                icon: countryFlagMap.get(country), // Add flag as icon
                leftComponent: (
                    <Image
                        source={{ uri: countryFlagMap.get(country) }}
                        style={{ width: 20, height: 15 }}
                        contentFit="cover"
                    />
                )
            }))
        ];
    }, [transformedData]);

    // Filter and sort data
    const processedData = useMemo(() => {
        let filtered = transformedData.filter(item =>
            item.title.toLowerCase().includes(infoSearchInputText.toLowerCase())
        );

        // Apply country filter
        if (countryFilter !== 'all') {
            filtered = filtered.filter(item => item.country === countryFilter);
        }

        // Sort based on orderBy
        if (orderBy === 'name') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (orderBy === 'country') {
            filtered.sort((a, b) => {
                // First sort by country, then by name within country
                if (a.country !== b.country) {
                    return a.country.localeCompare(b.country);
                }
                return a.title.localeCompare(b.title);
            });
        }

        return filtered;
    }, [transformedData, infoSearchInputText, countryFilter, orderBy]);

    // Group data by country or name when ordering by country/name
    const groupedData = useMemo(() => {
        if (orderBy !== 'country' && orderBy !== 'name') {
            return null;
        }

        const groups: { [key: string]: CarBrandData[] } = {};
        processedData.forEach(item => {
            let groupKey: string;

            if (orderBy === 'country') {
                groupKey = item.country || 'Unknown';
            } else { // orderBy === 'name'
                // Group by first letter of brand name
                groupKey = item.title.charAt(0).toUpperCase();
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });

        return Object.keys(groups)
            .sort()
            .map(groupKey => ({
                [orderBy === 'country' ? 'country' : 'letter']: groupKey,
                brands: groups[groupKey]
            }));
    }, [processedData, orderBy]);

    // Section Header Component
    const renderSectionHeader = (title: string) => (
        // <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
        <View style={[styles.sectionHeader, { paddingHorizontal: layoutType === 2 ? 0 : 16, }]}>
            <MyText style={styles.sectionHeaderText}>{title}</MyText>
            <View style={styles.sectionHeaderLine} />
        </View>
        // {/* <View /> */ }
        // </View>
    );

    // Section Header Component for SectionList
    const renderSectionListHeader = ({ section }: { section: { title: string } }) => {
        if (!section.title) return null;
        return renderSectionHeader(section.title);
    };

    // Custom render function for SectionList with horizontal grid layout
    const renderSectionListItem = ({ item, index, section }: { item: CarBrandData; index: number; section: { title: string; data: CarBrandData[] } }) => {
        // Only render the first item of each section, and render all items in that section as a grid
        if (index !== 0) return null;

        const sectionData = section.data;

        // Group items into rows based on cardsPerRow
        const rows: CarBrandData[][] = [];
        for (let i = 0; i < sectionData.length; i += cardsPerRow) {
            rows.push(sectionData.slice(i, i + cardsPerRow));
        }

        return (
            <View style={styles.sectionContent}>
                {rows.map((row, rowIndex) => (
                    <View key={`row-${rowIndex}`} style={styles.sectionRow}>
                        {row.map((item, itemIndex) => {
                            const globalIndex = rowIndex * cardsPerRow + itemIndex;

                            // WEB: Determine image priority based on position
                            const isAboveFold = globalIndex < 3;
                            const priority = isAboveFold ? 'critical' : (globalIndex < 10 ? 'high' : 'lazy');

                            // WEB: Get optimized image props (native gets standard props)
                            const brandImageProps = isDesktopWeb()
                                ? createOptimizedImageProps(item.brandImage, 'brand', priority)
                                : {
                                    source: { uri: item.brandImage },
                                    priority: 'high' as const,
                                    contentFit: 'contain' as const,
                                    cachePolicy: 'disk' as const,
                                    responsivePolicy: 'live' as const,
                                    onLoadEnd: handleImageLoad
                                };

                            const flagImageProps = isDesktopWeb()
                                ? createOptimizedImageProps(item.countryFlag, 'brand', priority)
                                : {
                                    source: { uri: item.countryFlag },
                                    priority: 'high' as const,
                                    contentFit: 'fill' as const,
                                    cachePolicy: 'disk' as const,
                                    responsivePolicy: 'live' as const,
                                    onLoadEnd: handleImageLoad
                                };

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[dynamicStyles.carBrandItemContainer, styles.sectionGridItem]}
                                    onPress={() => handleCarBrandPress(item)}
                                >
                                    <View style={styles.countryFlagContainer}>
                                        <Image
                                            {...flagImageProps}
                                            style={styles.countryFlag}
                                        />
                                        <View style={styles.totalCountPil}>
                                            <MyText style={styles.carBrandItemTitleListViewTotalCount}>{"1.9k"}</MyText>
                                        </View>
                                    </View>
                                    <View style={styles.carBrandItemContent}>
                                        <View style={dynamicStyles.carBrandImageContainer}>
                                            <Image
                                                {...brandImageProps}
                                                style={styles.carBrandImage}
                                            />
                                        </View>
                                        <MyText adjustsFontSizeToFit style={styles.carBrandItemTitle}>{item.title}</MyText>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                        {/* Fill empty spaces in the last row */}
                        {row.length < cardsPerRow && Array.from({ length: cardsPerRow - row.length }).map((_, emptyIndex) => (
                            <View key={`empty-${emptyIndex}`} style={[dynamicStyles.carBrandItemContainer, styles.sectionGridItem, { opacity: 0 }]} />
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    // WEB ONLY: Aggressive image preloading optimization
    useEffect(() => {
        if (isDesktopWeb() && transformedData.length > 0 && deferredFeatures.imagePreloading) {
            const criticalImages = transformedData.slice(0, 3).map(item => item.brandImage);
            const allImages = transformedData.map(item => item.brandImage);

            // Preload critical images immediately for instant display
            WebImagePreloader.getInstance().preloadCritical(criticalImages);

            // Queue the rest for smart lazy loading
            WebImagePreloader.getInstance().queuePreload(allImages.slice(3));

            // console.log(`🚀 WEB: Preloading ${criticalImages.length} critical images, queuing ${allImages.length - 3} for lazy load`);
        } else if (shouldOptimizeForSSG && !deferredFeatures.imagePreloading) {
            // console.log('⚡ SSG: Deferring image preloading until after hydration');
        }
    }, [transformedData, deferredFeatures.imagePreloading, shouldOptimizeForSSG]);

    // Filter data based on search text (optimized for SSG)
    const filteredData = useMemo(() => {
        if (shouldOptimizeForSSG && !deferredFeatures.searchFiltering) {
            // SSG: Skip search filtering during hydration for better performance
            return transformedData;
        }

        // Regular search filtering
        return transformedData.filter(item =>
            item.title.toLowerCase().includes(infoSearchInputText.toLowerCase())
        );
    }, [transformedData, infoSearchInputText, shouldOptimizeForSSG, deferredFeatures.searchFiltering]);

    // Get paginated data - only paginate on mobile, show all on desktop web (deferred for SSG)
    const getPaginatedData = useCallback(() => {
        // Always start from fully-processed data so country/order filters apply on every platform
        const baseData = processedData;

        // Desktop: show all (no pagination)
        if (isDesktopWeb()) {
            return baseData;
        }

        // Mobile SSG hydration: optionally skip pagination until JS hydrated
        if (shouldOptimizeForSSG && !deferredFeatures.pagination) {
            return baseData;
        }

        const endIndex = currentPage * itemsPerPage;
        return baseData.slice(0, endIndex);
    }, [processedData, currentPage, itemsPerPage, shouldOptimizeForSSG, deferredFeatures.pagination]);

    const paginatedData = getPaginatedData();

    // Check if there's more data to load (only for mobile)
    const hasMoreData = !isDesktopWeb() && processedData.length > paginatedData.length;

    // Load more data - only for mobile
    const loadMoreData = useCallback(() => {
        if (!isDesktopWeb() && !isLoadingMore && hasMoreData && !isLoading) {
            setIsLoadingMore(true);
            // Simulate loading delay for better UX
            setTimeout(() => {
                setCurrentPage(prev => prev + 1);
                setIsLoadingMore(false);
            }, 100);
        }
    }, [isLoadingMore, hasMoreData, isLoading]);

    // Handle end reached for FlatList - only for mobile
    const handleEndReached = useCallback(() => {
        if (!isDesktopWeb()) {
            loadMoreData();
        }
    }, [loadMoreData]);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [infoSearchInputText]);

    // Footer component for load more indicator - only for mobile
    const renderFooter = useCallback(() => {
        if (isDesktopWeb() || !hasMoreData) {
            return null;
        }

        return (
            <View style={styles.loadingFooter}>
                {isLoadingMore ? (
                    <ActivityIndicator size="small" color={myColors.text.primary} />
                ) : null}
            </View>
        );
    }, [isLoadingMore, hasMoreData]);

    // Pagination for ScrollView (layoutType 2)
    const [scrollViewPage, setScrollViewPage] = useState(1);
    const scrollViewItemsPerPage = 30; // More items for scroll view since it's lighter

    const getScrollViewPaginatedData = useCallback(() => {
        if (isDesktopWeb()) {
            return processedData; // Show all data on desktop web
        }
        const endIndex = scrollViewPage * scrollViewItemsPerPage;
        return processedData.slice(0, endIndex);
    }, [processedData, scrollViewPage, scrollViewItemsPerPage]);

    const scrollViewPaginatedData = getScrollViewPaginatedData();
    const scrollViewHasMoreData = !isDesktopWeb() && scrollViewPaginatedData.length < processedData.length;

    // Create section data for SectionList (layout type 0)
    const sectionListData = useMemo(() => {
        if ((orderBy === 'country' || orderBy === 'name') && groupedData) {
            return groupedData.map((group) => {
                const groupTitle = orderBy === 'country' ? (group as any).country : (group as any).letter;
                return {
                    title: groupTitle,
                    data: group.brands
                };
            });
        }
        return [{
            title: '',
            data: paginatedData
        }];
    }, [groupedData, paginatedData, orderBy]);

    // Create flattened data for FlatList with section headers (layout type 1)
    const flatListData = useMemo(() => {
        if ((orderBy === 'country' || orderBy === 'name') && groupedData) {
            const flattened: (CarBrandData | { type: 'header'; title: string; id: string })[] = [];
            groupedData.forEach((group, groupIndex) => {
                const groupTitle = orderBy === 'country' ? (group as any).country : (group as any).letter;
                // Add section header
                flattened.push({
                    type: 'header',
                    title: groupTitle,
                    id: `header-${groupTitle}`
                });
                // Add brands in this group
                group.brands.forEach(brand => {
                    flattened.push(brand);
                });
            });
            return flattened;
        }
        return paginatedData;
    }, [groupedData, paginatedData, orderBy]);

    // Reset scroll view pagination when search changes
    useEffect(() => {
        setScrollViewPage(1);
    }, [infoSearchInputText]);

    // Handle scroll view scroll end - only for mobile
    const handleScrollViewEndReached = useCallback(() => {
        if (!isDesktopWeb() && scrollViewHasMoreData && !isLoadingMore) {
            setIsLoadingMore(true);
            setTimeout(() => {
                setScrollViewPage(prev => prev + 1);
                setIsLoadingMore(false);
            }, 200);
        }
    }, [scrollViewHasMoreData, isLoadingMore]);

    // Add cleanup effect for web image optimization
    useEffect(() => {
        // Keep reference to the original data
        const originalData = transformedData;

        return () => {
            // WEB ONLY: Aggressive cleanup for image optimization
            if (isDesktopWeb()) {
                WebImagePreloader.getInstance().clearCache();
                WebLazyImageObserver.disconnect();
                // console.log('🧹 WEB: Cleaned up image optimization caches');
            }

            // Clear all image caches when component unmounts
            Image.clearMemoryCache();

            // Clean up any other resources
            originalData.length = 0; // Clear array reference
        };
    }, [transformedData]);

    // Component unmount cleanup - be careful not to clear persisted data too aggressively
    useEffect(() => {
        return () => {
            // Only clear persisted data on actual component unmount, not on navigation
            // The persisted data should survive navigation to prevent data loss
            if (!isFocused) {
                // Component is being unmounted, safe to clear
                setTimeout(() => {
                    if (!isDesktopWeb()) {
                        // Clear after a delay to ensure navigation is complete
                        setPersistedData([]);
                        setHasInitialData(false);
                    }
                }, 5000); // 5 second delay to handle navigation transitions
            }
        };
    }, []);

    // Memoize the year value to avoid unnecessary re-rendering
    const currentYear = useMemo(() => moment().year(), []);

    // Show loading skeleton only for non-SSG modes
    // On mobile, don't show loading if we have persisted data to prevent flickering
    const shouldShowLoading = dataLoadingStrategy !== 'SSG_ONLY' &&
        (isLoading && (!persistedData.length || isDesktopWeb())) &&
        (!carBrands || carBrands.length === 0);

    // SSG mode: Never show loading states - content is pre-rendered!
    if (dataLoadingStrategy === 'SSG_ONLY' && (!carBrands || carBrands.length === 0)) {
        // console.log('🚀 SSG: No loading state needed - content should be pre-rendered!');
        // For SSG, if no data, it means static generation failed - show error, not loading
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <MyText style={styles.errorText}>
                    SSG data not available. Please regenerate static content.
                </MyText>
            </View>
        );
    }

    // Update all header component calls to use wrapper functions
    const headerProps = {
        infoSearchInputText,
        setInfoSearchInputText,
        layouts: <Layouts />,
        countryFilter,
        setCountryFilter: handleCountryFilterChange,
        orderBy,
        setOrderBy: handleOrderByChange,
        countryOptions
    };

    // No Results Found Component
    const NoResultsFound = () => (
        <View style={styles.noResultsContainer}>
            <MyText style={styles.noResultsText}>Inga sökträffar hittade</MyText>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* SEO Head Tags */}
            <SEOHead
                title="Bilmärken - Alla Bilmärken i Sverige"
                description="Utforska alla bilmärken representerade i Sverige. Sök biluppgifter för över 100 olika bilmärken från hela världen. Hitta information om din bil direkt via registreringsnummer."
                keywords={[
                    'bilmärken',
                    'bilmärken sverige',
                    'bil tillverkare',
                    'ford',
                    'volvo',
                    'bmw',
                    'mercedes',
                    'audi',
                    'volkswagen',
                    'toyota',
                    'bilregistret',
                    'biluppgifter',
                    'alla bilmärken'
                ]}
                url="/tillverkare"
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'ItemList',
                    name: 'Bilmärken i Sverige',
                    description: 'Kompletta listan över alla bilmärken representerade i bilregistret',
                    numberOfItems: carBrands?.length || 0,
                    itemListElement: carBrands?.slice(0, 10).map((brand, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        item: {
                            '@type': 'Brand',
                            name: brand.title,
                            url: `https://bilregistret.ai/tillverkare/${brand.title.toLowerCase()}`
                        }
                    })) || []
                }}
            />
            {layoutType !== 2 ? (
                isDesktopWeb() ? (
                    <FooterWrapper
                        showsVerticalScrollIndicator={false}
                        style={styles.content}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        <DesktopViewWrapper>
                            <View style={styles.listContainer}>
                                {shouldShowLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color={myColors.primary.main} />
                                        <MyText style={styles.loadingText}>Laddar märken...</MyText>
                                    </View>
                                ) : layoutType === 0 ? (
                                    <SectionList
                                        key={`sectionlist-${layoutType}`}
                                        sections={sectionListData}
                                        renderItem={renderSectionListItem}
                                        renderSectionHeader={renderSectionListHeader}
                                        ListHeaderComponent={<HeaderComponent {...headerProps} />}
                                        ListFooterComponent={renderFooter}
                                        ListEmptyComponent={
                                            processedData.length === 0 && (infoSearchInputText.trim() !== '' || countryFilter !== 'all') ? (
                                                <NoResultsFound />
                                            ) : null
                                        }
                                        keyExtractor={(item) => item.id}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.listContent}
                                        style={styles.flatList}
                                        onEndReached={handleEndReached}
                                        onEndReachedThreshold={0.5}
                                        removeClippedSubviews={!isDesktopWeb()}
                                        maxToRenderPerBatch={isDesktopWeb() ? 100 : itemsPerPage}
                                        windowSize={isDesktopWeb() ? 10 : 5}
                                        initialNumToRender={isDesktopWeb() ? 100 : itemsPerPage}
                                        stickySectionHeadersEnabled={false}
                                    />
                                ) : (
                                    <FlatList
                                        key={`flatlist-${layoutType}`}
                                        data={flatListData as any}
                                        renderItem={({ item, index }) => renderCarBrandItem({ item, index })}
                                        ListHeaderComponent={<HeaderComponent {...headerProps} />}
                                        ListFooterComponent={renderFooter}
                                        ListEmptyComponent={
                                            processedData.length === 0 && (infoSearchInputText.trim() !== '' || countryFilter !== 'all') ? (
                                                <NoResultsFound />
                                            ) : null
                                        }
                                        keyExtractor={(item) =>
                                            'type' in item && item.type === 'header' ? item.id : item.id
                                        }
                                        showsVerticalScrollIndicator={false}
                                        numColumns={1}
                                        contentContainerStyle={styles.listContent}
                                        style={styles.flatList}
                                        onEndReached={handleEndReached}
                                        onEndReachedThreshold={0.5}
                                        removeClippedSubviews={!isDesktopWeb()}
                                        maxToRenderPerBatch={isDesktopWeb() ? 100 : itemsPerPage}
                                        windowSize={isDesktopWeb() ? 10 : 5}
                                        initialNumToRender={isDesktopWeb() ? 100 : itemsPerPage}
                                        getItemLayout={(data, index) => ({
                                            length: 68,
                                            offset: 68 * index,
                                            index,
                                        })}
                                    />
                                )}
                            </View>
                        </DesktopViewWrapper>
                    </FooterWrapper>
                ) : (
                    <View style={styles.content}>
                        <DesktopViewWrapper>
                            <View style={styles.listContainer}>
                                {layoutType === 0 ? (
                                    <SectionList
                                        key={`sectionlist-${layoutType}`}
                                        sections={sectionListData}
                                        renderItem={renderSectionListItem}
                                        renderSectionHeader={renderSectionListHeader}
                                        ListHeaderComponent={<HeaderComponent {...headerProps} />}
                                        ListFooterComponent={renderFooter}
                                        ListEmptyComponent={
                                            processedData.length === 0 && (infoSearchInputText.trim() !== '' || countryFilter !== 'all') ? (
                                                <NoResultsFound />
                                            ) : null
                                        }
                                        keyExtractor={(item) => item.id}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.listContent}
                                        style={styles.flatList}
                                        onEndReached={handleEndReached}
                                        onEndReachedThreshold={0.5}
                                        removeClippedSubviews={!isDesktopWeb()}
                                        maxToRenderPerBatch={isDesktopWeb() ? 100 : itemsPerPage}
                                        windowSize={isDesktopWeb() ? 10 : 5}
                                        initialNumToRender={isDesktopWeb() ? 100 : itemsPerPage}
                                        stickySectionHeadersEnabled={false}
                                    />
                                ) : (
                                    <FlatList
                                        key={`flatlist-${layoutType}`}
                                        data={flatListData as any}
                                        renderItem={({ item, index }) => renderCarBrandItem({ item, index })}
                                        ListHeaderComponent={<HeaderComponent {...headerProps} />}
                                        ListFooterComponent={() => (
                                            <View>
                                                {renderFooter()}
                                                <MyText style={styles.footerText}>
                                                    © {currentYear} Bilregistret.ai | Alla rättigheter reserverade Bilregistret Sverige AB {"\n"}
                                                    Ansvarig utgivare: Alen Rasic, databasens namn: bilregistret.ai
                                                </MyText>
                                            </View>
                                        )}
                                        keyExtractor={(item) => item.id}
                                        showsVerticalScrollIndicator={false}
                                        numColumns={layoutType === 1 ? 1 : cardsPerRow}
                                        contentContainerStyle={styles.listContent}
                                        style={styles.flatList}
                                        onEndReached={handleEndReached}
                                        onEndReachedThreshold={0.5}
                                        removeClippedSubviews={!isDesktopWeb()}
                                        maxToRenderPerBatch={isDesktopWeb() ? 100 : itemsPerPage}
                                        windowSize={isDesktopWeb() ? 10 : 5}
                                        initialNumToRender={isDesktopWeb() ? 100 : itemsPerPage}
                                        getItemLayout={(data, index) => ({
                                            length: 68,
                                            offset: 68 * index,
                                            index,
                                        })}
                                    />
                                )}
                            </View>
                        </DesktopViewWrapper>
                    </View>
                )
            ) : (
                <FooterWrapper
                    showsVerticalScrollIndicator={false}
                    style={styles.content}
                    contentContainerStyle={styles.scrollViewContent}
                    onScroll={
                        !isDesktopWeb()
                            ? ({ nativeEvent }) => {
                                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                                const paddingToBottom = 20;
                                if (
                                    layoutMeasurement.height + contentOffset.y >=
                                    contentSize.height - paddingToBottom
                                ) {
                                    handleScrollViewEndReached();
                                }
                            }
                            : undefined
                    }
                    scrollEventThrottle={400}
                >
                    <DesktopViewWrapper>
                        <View style={{ paddingTop: isDesktopWeb() ? 15 : 0 }}>
                            <HeaderComponent {...headerProps} />
                            {processedData.length === 0 && (infoSearchInputText.trim() !== '' || countryFilter !== 'all') ? (
                                <NoResultsFound />
                            ) : (
                                <View style={styles.listContainerTextListView}>
                                    {(orderBy === 'country' || orderBy === 'name') && groupedData ? (
                                        groupedData.map((group, groupIndex) => {
                                            const groupTitle =
                                                orderBy === 'country'
                                                    ? (group as any).country
                                                    : (group as any).letter;
                                            return (
                                                <React.Fragment key={groupTitle}>
                                                    {renderSectionHeader(groupTitle)}
                                                    {group.brands.map((item, index) =>
                                                        renderCarBrandItem({ item, index: groupIndex * 100 + index })
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        scrollViewPaginatedData?.map((item, index) =>
                                            renderCarBrandItem({ item, index })
                                        )
                                    )}
                                    {!isDesktopWeb() && isLoadingMore && (
                                        <View style={styles.loadingFooterScrollView}>
                                            <MyText style={styles.loadingText}>Laddar fler märken...</MyText>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                    </DesktopViewWrapper>
                    {isDesktopWeb() && <View style={{ height: 100 }} />}
                    {!isDesktopWeb() && (
                        <MyText style={styles.footerText}>
                            © {currentYear} Bilregistret.ai | Alla rättigheter reserverade Bilregistret Sverige AB {"\n"}
                            Ansvarig utgivare: Alen Rasic, databasens namn: bilregistret.ai
                        </MyText>
                    )}
                </FooterWrapper>
            )}
        </View>
    )
}

export default CarBrand

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
        height: '100%',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingBottom: isDesktopWeb() ? 0 : 0,
    },
    listContainer: {
        flex: 1,
        height: '100%',
    },
    listContainerTextListView: {
        flex: 1,
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: isDesktopWeb() ? 'flex-start' : 'space-between',
        marginHorizontal: isDesktopWeb() ? 24 : 15,
        gap: isDesktopWeb() ? 16 : 0,
        paddingTop: isDesktopWeb() ? 16 : 0,
    },
    carBrandItemContainerListView: {
        height: 72,
        backgroundColor: 'transparent',
        paddingVertical: 16,
        // paddingHorizontal: 20,
        marginBottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: myColors.border.light,
    },
    carBrandItemContainerTextListView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: isDesktopWeb() ? '15%' : '47%', // 6 columns on desktop, 2 on mobile
        // backgroundColor: isDesktopWeb() ? 'transparent' : myColors.white,
        // marginBottom: isDesktopWeb() ? 8 : 10,
        // paddingVertical: isDesktopWeb() ? 4 : 12,
        // paddingHorizontal: isDesktopWeb() ? 4 : 12,
        // borderRadius: isDesktopWeb() ? 0 : 8,
        // shadowColor: isDesktopWeb() ? 'transparent' : '#000',
        // shadowOffset: isDesktopWeb() ? { width: 0, height: 0 } : { width: 0, height: 1 },
        // shadowOpacity: isDesktopWeb() ? 0 : 0.08,
        // shadowRadius: isDesktopWeb() ? 0 : 4,
        // elevation: isDesktopWeb() ? 0 : 2,
        // borderWidth: isDesktopWeb() ? 0 : 1,
        // borderColor: isDesktopWeb() ? 'transparent' : '#f1f5f9',
        minHeight: isDesktopWeb() ? 'auto' : 55,
    },
    carBrandImage: {
        width: '100%',
        height: '100%',
    },

    countryFlag: {
        width: 20,
        height: 15,
        // position: 'absolute',
        // top: 6,
        // left: 6,
    },
    countryFlagListView: {
        width: 20,
        height: 15,
        marginRight: 12,
    },
    carBrandItemContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -10,
    },
    carBrandItemContentListView: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
    },
    carBrandItemContentTextListView: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    carBrandItemTitle: {
        marginTop: 14,
        fontSize: 14,
        fontWeight: 'bold',
        color: myColors.text.primary,
    },

    carBrandItemTitleListViewTotalCount: {
        fontSize: 13,
        color: myColors.text.primary,
    },
    listContent: {
        paddingBottom: 30,
        paddingHorizontal: 0,
        paddingTop: isDesktopWeb() ? 15 : 0,
    },
    flatList: {
        flex: 1,
        width: '100%',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: isDesktopWeb() ? 0 : 10,
        marginHorizontal: isDesktopWeb() ? 0 : 15,
    },
    layoutContainer: {
        width: isDesktopWeb() ? 163 : 130,
        height: isDesktopWeb() ? 52 : 42,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E6E6F1',
        position: 'relative',
    },
    layoutButton: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
    },
    layoutDivider: {
        position: 'absolute',
        top: 1,
        width: 1,
        height: 50, // Will be adjusted dynamically for mobile
        backgroundColor: '#E6E6F1',
        zIndex: 2,
    },
    totalCountPil: {
        backgroundColor: myColors.screenBackgroundColor,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    totalCountPilTextListView: {
        backgroundColor: "#F3F2F2",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        marginLeft: 5,
    },

    // Clean Layout 1 Desktop Styles (matching mobile)
    carBrandItemContainerListViewDesktop: {
        height: 70,
        backgroundColor: 'transparent',
        paddingVertical: 16,
        // paddingHorizontal: 20,
        marginBottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: myColors.border.light,
    },
    carBrandItemContainerListViewMobile: {
        // Keep existing mobile styles
    },

    carBrandImageContainerListViewDesktop: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    carBrandImageListViewDesktop: {
        width: 40,
        height: 40,
    },
    carBrandImageContainerListView: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    brandTitleContainerListView: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 20, // Big space after company name
    },
    carBrandItemTitleListView: {
        fontSize: 16,
        fontWeight: '500',
        color: myColors.text.primary,
        letterSpacing: -0.2,
    },

    carBrandImageListView: {
        width: 50,
        height: 50,
    },
    // Country Count Styles
    countryCountContainer: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countryCountContainerDesktop: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countryCountContainerMobile: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        minWidth: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countryCountText: {
        fontSize: 13,
        fontWeight: '500',
        color: myColors.text.primary,
        backgroundColor: "rgba(243, 242, 242, 1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 44,
        textAlign: 'center',
        overflow: 'hidden',
    },
    countryCountTextDesktop: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6B7280',
    },
    countryCountTextMobile: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },

    totalCountPilListViewDesktop: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        minWidth: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    carBrandItemTitleListViewTotalCountListViewDesktop: {
        fontSize: 13,
        color: '#ffffff',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    brandTextInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    carBrandItemTitleTextOnlyDesktop: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        letterSpacing: -0.1,
        marginBottom: 1,
    },
    countryNameTextOnly: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: '500',
    },
    totalCountPilTextOnlyDesktop: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        minWidth: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    carBrandItemTitleListViewTotalCountTextOnlyDesktop: {
        fontSize: 13,
        color: '#687693',
    },
    // Mobile-specific styles for Layout 2
    carBrandItemContainerTextListViewMobile: {
        // Mobile styles are handled in the main carBrandItemContainerTextListView
    },
    brandTextInfoMobile: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 8,
        // maxWidth: '75%',
    },
    carBrandItemTitleTextOnlyMobile: {
        fontSize: 14,
        fontWeight: '700',
        color: myColors.text.primary,
        marginBottom: 2,
    },
    countryNameTextOnlyMobile: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
    },
    totalCountPilTextOnlyMobile: {
        backgroundColor: myColors.screenBackgroundColor,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 10,
        minWidth: 35,
        maxWidth: 45,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
    },
    carBrandItemTitleListViewTotalCountTextOnlyMobile: {
        fontSize: 11,
        color: myColors.text.primary,
        fontWeight: '600',
    },
    loadingFooter: {
        padding: 10,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: myColors.text.primary,
    },
    loadingFooterScrollView: {
        padding: 10,
        alignItems: 'center',
        width: '100%',
    },
    footerText: {
        textAlign: 'center',
        fontSize: 9,
        color: myColors.text.secondary,
        marginTop: 20,
        paddingHorizontal: 10,
        paddingBottom: Platform.OS === "ios" ? 0 : 50,
    },
    scrollViewContent: {
        paddingBottom: isDesktopWeb() ? 0 : 20,
    },
    errorText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: myColors.text.primary,
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: isDesktopWeb() ? 500 : 100,
    },

    filterContainer: {
        marginVertical: 10,
        marginHorizontal: 15,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    filterDropdown: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        // paddingHorizontal: 0,
        marginTop: 20,
        width: '100%',
        paddingHorizontal: 16,
    },
    sectionHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: myColors.text.primary,
        marginRight: 15,
    },
    sectionHeaderLine: {
        flex: 1,
        // marginTop: 5,
        height: 0.5,
        backgroundColor: myColors.border.light,
    },
    sectionContent: {
        paddingRight: 10,
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,//16,
    },
    sectionGridItem: {
        flex: 1,
        marginHorizontal: 4,
    },
    webHeaderContainer: {
        // borderTopWidth: isDesktopWeb() ? 1 : 0,
        // borderBottomWidth: isDesktopWeb() ? 1 : 0,
        borderColor: myColors.border.default,
        marginHorizontal: isDesktopWeb() ? 15 : 0
    },
    countryFlagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // width: '100%',
        // backgroundColor: 'red',
        // height: 100,
    },
    heroTitle: {
        fontSize: isDesktopWeb() ? 36 : 28,
        fontWeight: '400',
        color: '#262524',
        lineHeight: isDesktopWeb() ? 50 : 40,
        // marginBottom: 30,
        fontFamily: 'Poppins',
        textAlign: isDesktopWeb() ? 'left' : 'center',
    },
    noResultsContainer: {
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: 'rgba(255, 72.87, 56.31, 0.10)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FF4938',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 15,
        marginVertical: 20,
    },
    noResultsText: {
        textAlign: 'center',
        color: '#FF4938',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '700',
        lineHeight: 20,
    },
})