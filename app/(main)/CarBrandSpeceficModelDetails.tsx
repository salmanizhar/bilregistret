import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform, FlatList, Dimensions, Animated, Easing, Share, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { H1, H2, P } from '@/components/common/SemanticText';
import SimpleHeader from '@/components/common/SimpleHeader';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCarModelDetails, CarModelDetailsResponse, useCarModelDetailsBottomItems } from '@/Services/api/hooks/cars.hooks';
import { convertWixImageUrl, getStatusBarHeight, hyphensToSpaces, isUrl } from '@/constants/commonFunctions';
import ReadMoreText from '@/components/ReadMoreText';
import CarSuggestion from '@/components/CarSuggestion';
import { useCarSubModelBottomItems } from '@/Services/api/hooks/car.hooks';
import { cleanupForScreen } from '@/utils/cacheUtils';
import { performCacheCleanup } from '@/Services/api/utils/cacheManager';
import { useIsFocused } from '@react-navigation/native';
import { isDesktopWeb } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { desktopWebViewport } from '@/constants/commonConst';
import moment from 'moment';
import {
    getSSGSubModelDetails,
    getSSGBottomItems,
    transformBottomItemsForCarSuggestion,
    generateBottomSections,
    isStaticContentAvailable,
    isSSGMode,
    logSSGPerformance,
    getStaticSubModelData
} from '@/utils/staticContentLoader';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// In expo-image 2.0.7, there is no direct cache management API.
// We'll use a combination of cachePolicy and component lifecycle management.

interface ModelDetailItem {
    icon: string;
    label: string;
    value: string;
}

export default function CarBrandSpeceficModelDetails() {
    const params = useLocalSearchParams();
    const { brand, subBrand, subBrandDetails } = params;
    const isFocused = useIsFocused();
    // // console.log("props from model details", params);

    // Calculate layout width based on platform
    const layoutWidth = useMemo(() => {
        return isDesktopWeb() ? desktopWebViewport : Dimensions.get('window').width;
    }, []);

    // Create dynamic styles based on layout width (if any card components use width calculations)
    const dynamicStyles = useMemo(() => ({
        // Add any width-dependent styles here if needed
        imageItemContainer: {
            width: isDesktopWeb() ? layoutWidth - 32 : SCREEN_WIDTH - 32, // Accounting for content padding
            height: 190,
            borderRadius: 12,
            overflow: 'hidden' as const,
        },
    }), [layoutWidth]);

    // Memoize the year value to avoid unnecessary re-rendering
    const currentYear = useMemo(() => moment().year(), []);

    // STRATEGY: SSG ONLY FOR WEB, Mobile always uses API
    // - SSG WEB: Use synchronous static content (ZERO API hooks instantiated!)
    // - NON-SSG WEB: Use static content OR API fallback.
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
    const carModelDetailsMutation = !isDesktopWeb() || dataLoadingStrategy === 'API_ONLY' || dataLoadingStrategy === 'STATIC_WITH_FALLBACK'
        ? useCarModelDetails()
        : { mutateAsync: () => Promise.resolve(null), mutate: () => { } }; // Dummy for SSG web only

    // Animation and state values
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [modelDetails, setModelDetails] = useState<CarModelDetailsResponse | null>(null);
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Step 3: Load model details data based on strategy
    useEffect(() => {
        const loadModelDetails = async () => {
            if (!subBrandDetails || !brand || !subBrand) {
                setIsError(true);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setIsError(false);

            try {
                switch (dataLoadingStrategy) {
                    case 'MOBILE_API':
                        // Mobile ALWAYS uses API - this ensures mobile native works!
                        // console.log('📱 MOBILE_API: Using live API for mobile native');
                        const mobileResult = await carModelDetailsMutation.mutateAsync({
                            c_merke: hyphensToSpaces(brand as string),
                            c_modell: hyphensToSpaces(subBrand as string),
                            title: subBrandDetails as string
                        });
                        setModelDetails(mobileResult);
                        setIsLoading(false);
                        break;

                    case 'SSG_ONLY':
                        // Pure SSG: Instant synchronous data, zero API calls (WEB ONLY)
                        const ssgData = getSSGSubModelDetails(
                            brand as string,
                            subBrand as string,
                            subBrandDetails as string
                        );
                        if (ssgData && ssgData.subModel) {
                            // Transform SSG data to match CarModelDetailsResponse format
                            const transformedData = {
                                ...ssgData.subModel.originalData,
                                ID: ssgData.subModel.id,
                                C_merke: ssgData.subModel.c_merke,
                                C_modell: ssgData.subModel.c_modell,
                                C_typ: ssgData.subModel.c_typ,
                                ar_fra: ssgData.subModel.yearRange.split(' - ')[0] || '',
                                ar_till: ssgData.subModel.yearRange.split(' - ')[1] || '',
                                "Car Image": ssgData.subModel.imageUrl,
                                "high_res": ssgData.subModel.high_res,
                                C_chassi: ssgData.subModel.C_chassi,
                                C_bransle: ssgData.subModel.engine,
                                modell_id: ssgData.subModel.modell_id
                            };
                            setModelDetails(transformedData as CarModelDetailsResponse);
                            // console.log('🚀 SSG_ONLY: Loaded sub-model details instantly (WEB ONLY - zero API overhead)');
                        } else {
                            setIsError(true);
                        }
                        setIsLoading(false);
                        break;

                    case 'STATIC_WITH_FALLBACK':
                        // Static content with emergency API fallback (WEB ONLY)
                        const staticData = getStaticSubModelData(
                            brand as string,
                            subBrand as string,
                            subBrandDetails as string
                        );
                        if (staticData && staticData.subModel) {
                            // Transform static data to match CarModelDetailsResponse format
                            const transformedStaticData = {
                                ...staticData.subModel.originalData,
                                ID: staticData.subModel.id,
                                C_merke: staticData.subModel.c_merke,
                                C_modell: staticData.subModel.c_modell,
                                C_typ: staticData.subModel.c_typ,
                                ar_fra: staticData.subModel.yearRange.split(' - ')[0] || '',
                                ar_till: staticData.subModel.yearRange.split(' - ')[1] || '',
                                "Car Image": staticData.subModel.imageUrl,
                                "high_res": staticData.subModel.high_res,
                                C_chassi: staticData.subModel.C_chassi,
                                C_bransle: staticData.subModel.engine,
                                modell_id: staticData.subModel.modell_id
                            };
                            setModelDetails(transformedStaticData as CarModelDetailsResponse);
                            // console.log('🌐 STATIC_WITH_FALLBACK: Using static sub-model details (WEB)');
                            setIsLoading(false);
                        } else {
                            // Emergency fallback to API
                            // console.log('⚠️ STATIC_WITH_FALLBACK: Static failed, using API emergency fallback (WEB)');
                            const result = await carModelDetailsMutation.mutateAsync({
                                c_merke: hyphensToSpaces(brand as string),
                                c_modell: hyphensToSpaces(subBrand as string),
                                title: subBrandDetails as string
                            });
                            setModelDetails(result);
                            setIsLoading(false);
                        }
                        break;

                    case 'API_ONLY':
                        // Web without static content - use API
                        // console.log('📡 API_ONLY: Using API sub-model details (WEB)');
                        const result = await carModelDetailsMutation.mutateAsync({
                            c_merke: hyphensToSpaces(brand as string),
                            c_modell: hyphensToSpaces(subBrand as string),
                            title: subBrandDetails as string
                        });
                        setModelDetails(result);
                        setIsLoading(false);
                        break;

                    default:
                        // console.error('Unknown data loading strategy:', dataLoadingStrategy);
                        setIsError(true);
                        setIsLoading(false);
                        break;
                }
            } catch (error) {
                // console.error('Error loading model details:', error);
                setIsError(true);
                setIsLoading(false);
            }
        };

        loadModelDetails();
    }, [dataLoadingStrategy, brand, subBrand, subBrandDetails]);

    // Step 4: ALWAYS instantiate bottom items API hooks for mobile, conditionally for web
    const apiBottomItemsData = !isDesktopWeb() || dataLoadingStrategy === 'API_ONLY' || dataLoadingStrategy === 'STATIC_WITH_FALLBACK'
        ? useCarModelDetailsBottomItems(
            modelDetails?.modell_id || '',
            { enabled: isFocused && !!modelDetails?.modell_id }
        )
        : { data: [], isLoading: false, error: null, refetch: () => Promise.resolve() }; // Dummy for SSG web only

    // Bottom items data based on strategy
    const { data: bottomItemsData, isLoading: isBottomItemsLoading, refetch: refetchBottomItems } = useMemo(() => {
        switch (dataLoadingStrategy) {
            case 'MOBILE_API':
                // Mobile ALWAYS uses API - this ensures mobile native works!
                // console.log('📱 MOBILE_API: Using live API bottom items for mobile native');
                return apiBottomItemsData;

            case 'SSG_ONLY':
                // Pure SSG: Instant synchronous data, zero API calls (WEB ONLY)
                const ssgBottomItems = getSSGBottomItems(brand as string, subBrand as string);
                // console.log('🚀 SSG_ONLY: Loaded bottom items instantly (WEB ONLY - ELIMINATES slow @fordon queries!)');
                return {
                    data: ssgBottomItems,
                    isLoading: false,
                    refetch: () => Promise.resolve()
                };

            case 'STATIC_WITH_FALLBACK':
                // Static content with emergency API fallback (WEB ONLY)
                const staticBottomItems = getSSGBottomItems(brand as string, subBrand as string);
                if (staticBottomItems && staticBottomItems.length > 0) {
                    // console.log('🌐 STATIC_WITH_FALLBACK: Using static bottom items (WEB - ELIMINATES slow @fordon queries!)');
                    return {
                        data: staticBottomItems,
                        isLoading: false,
                        refetch: () => Promise.resolve()
                    };
                } else {
                    // Emergency fallback to API
                    // console.log('⚠️ STATIC_WITH_FALLBACK: Static bottom items failed, using API emergency fallback (WEB)');
                    return apiBottomItemsData;
                }

            case 'API_ONLY':
                // Web without static content - use API
                // console.log('📡 API_ONLY: Using API bottom items (WEB)');
                return apiBottomItemsData;

            default:
                // console.error('Unknown data loading strategy for bottom items:', dataLoadingStrategy);
                return {
                    data: [],
                    isLoading: false,
                    refetch: () => Promise.resolve()
                };
        }
    }, [dataLoadingStrategy, apiBottomItemsData, brand, subBrand, modelDetails?.modell_id]);

    // Log strategy for debugging
    useEffect(() => {
        // console.log(`📊 CarBrandSpeceficModelDetails Data Strategy: ${dataLoadingStrategy}`);
        // console.log(`🎯 Platform: ${isDesktopWeb() ? 'Desktop Web' : 'Mobile'}`);
        // console.log(`🔧 SSG Mode: ${isSSGMode()}`);
        // console.log(`📁 Static Available: ${isStaticContentAvailable()}`);

        // Log performance for SSG
        if (dataLoadingStrategy === 'SSG_ONLY' && modelDetails) {
            logSSGPerformance('CarBrandSpeceficModelDetails', 1);
        }
    }, [dataLoadingStrategy, modelDetails]);

    const modelName = `${modelDetails?.C_merke} ${modelDetails?.C_modell} ${modelDetails?.C_typ}`;

    // Images for carousel - use API data if available
    const carImages = modelDetails?.[Platform.OS === "web" ? "high_res" : "Car Image"]
        ? [modelDetails[Platform.OS === "web" ? "high_res" : "Car Image"]]
        : [
            'https://media.ed.edmunds-media.com/bmw/i4/2022/oem/2022_bmw_i4_sedan_m50_fq_oem_1_1600.jpg'
        ];

    // Get detail items from API response
    const getDetailItems = useCallback((): ModelDetailItem[] => {
        if (!modelDetails) {
            return [];
        }
        // // console.log("modelDetails", JSON.stringify(modelDetails, null, 2));
        return [
            {
                icon: ImagePath.SvgIcons.CarBrandYearModelIcon,
                label: "Årsmodell",
                // value: `${modelDetails.C_fran_ar} - ${modelDetails.C_till_ar}`
                value: `${modelDetails.ar_fra || ""} - ${modelDetails.ar_till || ""}` //added this over upper one to match the response with web wix site
            },
            {
                icon: ImagePath.SvgIcons.CarBrandAntalCylindrarIcon,
                label: "Antal Cylindrar",
                value: `${modelDetails.C_cylinder || "0"} Cyl`
            },
            {
                icon: ImagePath.SvgIcons.CarBrandDriveModelIcon,
                label: "Drivmedel",
                value: modelDetails.C_bransle || "N/A"
            },
            {
                icon: ImagePath.SvgIcons.CarBrandHastkrafterIcon,
                label: "Hästkrafter",
                value: `${modelDetails.C_hk} hk` || "N/A"
            },
            {
                icon: ImagePath.SvgIcons.CarBrandMotorFamiljIcon,
                label: "Motorfamilj",
                value: modelDetails.C_motorkod || "N/A"
            },
            {
                icon: ImagePath.SvgIcons.CarBrandKWIcon,
                label: "kW",
                value: `${modelDetails.C_kw} kW` || "N/A"
            },
            {
                icon: ImagePath.SvgIcons.CarBrandMotorVolymIcon,
                label: "Motorvolym",
                value: `${modelDetails.C_slagvolym || "0"} CC`
            },
            {
                icon: ImagePath.SvgIcons.CarBranHjuldriftIcon,
                label: "Hjuldrift",
                value: modelDetails.C_hjuldrift || "N/A"
            },
        ];
    }, [modelDetails]);


    const mergedCarSuggestionData = useMemo(() => {
        if (!modelDetails) {
            return bottomItemsData ?? []; // Fallback to empty array
        }

        // Limit to the available number of items (max 9)
        const maxItems = Math.min(bottomItemsData?.length ?? 0, 9);

        return (bottomItemsData ?? []).slice(0, maxItems).map((bottomItem: any, index: number) => {
            // Get corresponding carSubModel if available, otherwise use first item
            const carModel = modelDetails

            return {
                id: String(index + 1),
                image_url: convertWixImageUrl(carModel[Platform.OS === "web" ? "high_res" : "Car Image"] || ''),
                title: `${bottomItem.C_merke} ${bottomItem.C_modell} ${bottomItem.Fordons_ar}`,
                description: `${bottomItem.C_merke} ${bottomItem.C_modell} ${bottomItem.Fordons_ar} ${bottomItem.C_typ} med ${bottomItem.C_bransle.toLowerCase()} motor ${bottomItem.C_kaross.toLowerCase()} med ${bottomItem?.C_vaxellada?.toLowerCase()} växellåda som har en tjänstevikt på ${bottomItem.Tjanstevikt} kg och totalvikt ${bottomItem.Totalvikt} kg.`.trim(),
                slug: bottomItem.link_NYA_12
                // link: bottomItem.link_NYA_12 || `/(main)/bil/${c_merke}/${c_modell}`
            };
        });
    }, [bottomItemsData, modelDetails]);

    const handleGoBack = () => {
        router.back();
    };

    // Share functionality
    const handleShare = async () => {
        try {
            // Construct the shareable URL
            const baseUrl = Platform.OS === 'web' ? window.location.origin : 'https://bilregistret.ai';
            const shareUrl = `${baseUrl}/tillverkare/${brand}/${subBrand}/${subBrandDetails}`;
            const shareTitle = `${modelDetails?.C_merke} ${modelDetails?.C_modell} ${modelDetails?.C_typ}`;
            const shareMessage = `Kolla in denna ${shareTitle} på Bilregistret.ai`;

            if (Platform.OS === 'web') {
                // Web platform
                if (navigator.share) {
                    // Use Web Share API if available
                    await navigator.share({
                        title: shareTitle,
                        text: shareMessage,
                        url: shareUrl,
                    });
                } else {
                    // Fallback: Copy to clipboard
                    await navigator.clipboard.writeText(shareUrl);
                    Alert.alert('Länk kopierad', 'Länken har kopierats till urklipp');
                }
            } else {
                // Mobile platform
                const result = await Share.share({
                    message: `${shareMessage}\n\n${shareUrl}`,
                    url: shareUrl,
                    title: shareTitle,
                });

                if (result.action === Share.dismissedAction) {
                    // User dismissed the share dialog
                }
            }
        } catch (error) {
            console.error('Error sharing:', error);
            Alert.alert('Fel', 'Kunde inte dela länken. Försök igen.');
        }
    };

    const renderModelDetailItem = useCallback((item: ModelDetailItem, index: number) => (
        <View key={index} style={styles.detailItemContainer}>
            <SvgXml xml={item.icon} style={{ marginRight: 12 }} />
            <View style={styles.detailTextContainer}>
                <MyText style={styles.detailLabel}>{item.label}</MyText>
                <H2 id={`detail-${item.label.toLowerCase().replace(/\s+/g, '-')}-${index}`} style={styles.detailValue}>
                    {item.value}
                </H2>
            </View>
        </View>
    ), []);

    // Add cache cleanup with useFocusEffect - this runs when navigating away
    useFocusEffect(
        useCallback(() => {
            // This runs when the screen comes into focus

            // Return a cleanup function that runs when the screen loses focus
            return () => {
                // When navigating away, force garbage collection on images
                setTimeout(() => {
                    try {
                        // Force a series of image operations to trigger GC
                        if (carImages && carImages.length > 0) {
                            carImages.forEach(img => {
                                if (isUrl(img)) {
                                    // Prefetch and release to help flush cache
                                    Image.prefetch(img)
                                        .then(() => { })
                                        .catch(() => { });
                                }
                            });
                        }

                        // Create dummy images to help trigger GC
                        const dummyImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
                        Image.prefetch(dummyImg).then(() => { }).catch(() => { });
                    } catch (e) {
                        // Silently handle any errors during cleanup
                        // console.log('Cache cleanup error:', e);
                    }
                }, 300);
            };
        }, [carImages])
    );

    // Keep the existing cleanup but modify to be more effective
    useEffect(() => {
        const imageUrls = [...carImages]; // Copy the array to avoid issues if it changes

        return () => {
            // Final component unmount cleanup
            try {
                // For each image URL, try to remove references to help GC
                if (imageUrls && imageUrls.length > 0) {
                    // Force immediate prefetch/unload cycle - this can help trigger GC
                    imageUrls.forEach(img => {
                        if (isUrl(img)) {
                            // Trigger load/unload cycle which can help with cleanup
                            Image.prefetch(img)
                                .then(() => {
                                    // Let the promise complete normally
                                })
                                .catch(() => {
                                    // Ignore errors
                                });
                        }
                    });
                }

                // Run a little garbage collection helper
                setTimeout(() => {
                    try {
                        // Create a series of prefetch operations to help flush cache
                        const dummyImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
                        Image.prefetch(dummyImg).then(() => { }).catch(() => { });
                    } catch (e) {
                        // Ignore errors
                    }
                }, 100);
            } catch (e) {
                // Silently handle errors
                // console.log('Final cache cleanup error:', e);
            }
        };
    }, [carImages]);

    // Optimize image rendering function
    const renderImageItem = useCallback(({ item }: { item: string }) => {
        // Create key based on item to help with efficient rendering/recycling
        const imageKey = `car-image-${item.substring(item.lastIndexOf('/') + 1)}`;

        return (
            <View>
                <Image
                    source={{ uri: item }}
                    style={styles.carImage}
                    contentFit="cover"
                    cachePolicy="disk" // Only use memory cache
                    transition={100} // Small transition to prevent rendering issues
                    key={imageKey}
                    onLoadStart={() => {
                        // Help GC by clearing memory before loading new image
                        if (Platform.OS !== 'web') {
                            Image.clearMemoryCache();
                        }
                    }}
                />
            </View>
        );
    }, [dynamicStyles]);

    const renderPaginationDots = useCallback(() => {
        return (
            <View style={styles.paginationContainer}>
                {carImages.map((_, i) => {
                    const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 16, 8],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.5, 1, 0.5],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={i}
                            style={[
                                styles.paginationDot,
                                {
                                    width: dotWidth,
                                    opacity,
                                    backgroundColor: i === activeIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                },
                            ]}
                        />
                    );
                })}
            </View>
        );
    }, [activeIndex, carImages, scrollX]);

    const onScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
            useNativeDriver: false,
            listener: (event: any) => {
                const slideIndex = Math.round(
                    event.nativeEvent.contentOffset.x / SCREEN_WIDTH
                );
                if (slideIndex !== activeIndex) {
                    setActiveIndex(slideIndex);
                }
            },
        }
    );

    // Shimmer overlay component for skeleton loading
    const ShimmerOverlay = useCallback(() => (
        <Animated.View
            style={[
                styles.shimmerOverlay,
                {
                    transform: [{
                        translateX: shimmerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-300, 300]
                        })
                    }]
                }
            ]}
        />
    ), [shimmerAnim]);

    // Loading skeleton component
    const LoadingSkeleton = useCallback(() => (
        <View style={styles.skeletonContainer}>
            {/* Model Name Skeleton */}
            <View style={styles.skeletonTitle}>
                <ShimmerOverlay />
            </View>

            {/* Image Carousel Skeleton */}
            <View style={styles.skeletonImageContainer}>
                <ShimmerOverlay />
            </View>

            {/* Details Section Skeleton */}
            <View style={styles.detailsSection}>
                {Array(8).fill(null).map((_, index) => (
                    <View key={index} style={styles.skeletonDetailItem}>
                        <View style={styles.skeletonIcon}>
                            <ShimmerOverlay />
                        </View>
                        <View style={styles.skeletonDetailTextContainer}>
                            <View style={styles.skeletonDetailLabel}>
                                <ShimmerOverlay />
                            </View>
                            <View style={styles.skeletonDetailValue}>
                                <ShimmerOverlay />
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Description Skeleton */}
            <View style={styles.descriptionSection}>
                <View style={styles.skeletonDescriptionLine}>
                    <ShimmerOverlay />
                </View>
                <View style={[styles.skeletonDescriptionLine, { width: '80%' }]}>
                    <ShimmerOverlay />
                </View>
                <View style={[styles.skeletonDescriptionLine, { width: '90%' }]}>
                    <ShimmerOverlay />
                </View>
            </View>
        </View>
    ), [ShimmerOverlay]);

    // Add more comprehensive cleanup effects
    useEffect(() => {
        // Keep references to animation values to properly clean them up
        const shimmerAnimValue = shimmerAnim;
        const fadeAnimValue = fadeAnim;
        const scrollXValue = scrollX;

        return () => {
            // Clean up animation values
            shimmerAnimValue.setValue(0);
            fadeAnimValue.setValue(0);
            scrollXValue.setValue(0);

            // Clear image references and force GC
            if (carImages && carImages.length > 0) {
                Image.clearMemoryCache();
                cleanupForScreen('CarBrandSpecefic');
                performCacheCleanup();
            }

            // Reset all state
            setModelDetails(null);
            setActiveIndex(0);
            setIsLoading(false);
            setIsError(false);
        };
    }, []);

    // Start shimmer animation when loading and fade in content when loaded
    useEffect(() => {
        if (isLoading) {
            // Start the shimmer animation loop
            Animated.loop(
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.linear
                })
            ).start();
        } else {
            // Fade in the content when loaded
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            }).start();
        }

        return () => {
            // Clean up animations when component unmounts
            shimmerAnim.setValue(0);
            fadeAnim.setValue(0);
        };
    }, [isLoading, shimmerAnim, fadeAnim]);

    // Custom Expandable P Component for semantic description with ReadMoreText functionality
    const ExpandableP: React.FC<{
        id?: string;
        text: string;
        maxLength: number;
        style?: any;
    }> = useCallback(({ id, text, maxLength, style }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        if (!text) return null;

        const needsTruncation = text.length > maxLength;

        if (!needsTruncation) {
            return (
                <P id={id} style={style}>
                    {text}
                </P>
            );
        }

        const handleToggle = () => {
            setIsExpanded(!isExpanded);
        };

        if (isExpanded) {
            return (
                <P id={id} style={style}>
                    {text}{' '}
                    <TouchableOpacity onPress={handleToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <MyText style={[styles.readMoreText, { color: myColors.primary.main }]}>
                            Visa mindre
                        </MyText>
                    </TouchableOpacity>
                </P>
            );
        }

        const truncatedText = text.substring(0, maxLength) + '...';

        return (
            <P id={id} style={style}>
                {truncatedText}{' '}
                <TouchableOpacity onPress={handleToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MyText style={[styles.readMoreText, { color: myColors.primary.main }]}>
                        Läs mer
                    </MyText>
                </TouchableOpacity>
            </P>
        );
    }, []);

    // Display error state
    if (isError) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <Stack.Screen options={{ headerShown: false }} />
                {!isDesktopWeb() && (
                    <SimpleHeader
                        title="Modells Detaljer"
                        onBackPress={handleGoBack}
                    />
                )}
                {isDesktopWeb() ? (
                    <FooterWrapper
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        <DesktopViewWrapper>
                            <View style={styles.errorContainer}>
                                <MyText style={styles.errorText}>Kunde inte ladda modelldetaljer.</MyText>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={() => {
                                        setIsError(false);
                                        setIsLoading(true);
                                        carModelDetailsMutation.mutate({
                                            c_merke: brand as string,
                                            c_modell: subBrand as string,
                                            title: subBrandDetails as string
                                        }, {
                                            onSuccess: (data) => {
                                                setModelDetails(data);
                                                setIsLoading(false);
                                            },
                                            onError: () => {
                                                setIsError(true);
                                                setIsLoading(false);
                                            }
                                        });
                                    }}
                                >
                                    <MyText style={styles.retryButtonText}>Försök igen</MyText>
                                </TouchableOpacity>
                            </View>
                        </DesktopViewWrapper>
                    </FooterWrapper>
                ) : (
                    <View style={styles.errorContainer}>
                        <DesktopViewWrapper>
                            <MyText style={styles.errorText}>Kunde inte ladda modelldetaljer.</MyText>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={() => {
                                    setIsError(false);
                                    setIsLoading(true);
                                    carModelDetailsMutation.mutate({
                                        c_merke: brand as string,
                                        c_modell: subBrand as string,
                                        title: subBrandDetails as string
                                    }, {
                                        onSuccess: (data) => {
                                            setModelDetails(data);
                                            setIsLoading(false);
                                        },
                                        onError: () => {
                                            setIsError(true);
                                            setIsLoading(false);
                                        }
                                    });
                                }}
                            >
                                <MyText style={styles.retryButtonText}>Försök igen</MyText>
                            </TouchableOpacity>
                            <MyText style={styles.footerText}>© {currentYear} Bilregistret.ai | Alla rättigheter reserverade Bilregistret Sverige AB {"\n"}Ansvarig utgivare: Alen Rasic, databasens namn: bilregistret.ai</MyText>
                        </DesktopViewWrapper>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Stack.Screen options={{ headerShown: false }} />

            {!isDesktopWeb() && (
                <SimpleHeader
                    title="Modells Detaljer"
                    onBackPress={handleGoBack}
                />
            )}

            {isLoading ? (
                isDesktopWeb() ? (
                    <FooterWrapper
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        <DesktopViewWrapper>
                            <LoadingSkeleton />
                        </DesktopViewWrapper>
                    </FooterWrapper>
                ) : (
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        <DesktopViewWrapper>
                            <LoadingSkeleton />
                            <MyText style={styles.footerText}>© {currentYear} Bilregistret.ai | Alla rättigheter reserverade Bilregistret Sverige AB {"\n"}Ansvarig utgivare: Alen Rasic, databasens namn: bilregistret.ai</MyText>
                        </DesktopViewWrapper>
                    </ScrollView>
                )
            ) : (
                isDesktopWeb() ? (
                    <FooterWrapper
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        <DesktopViewWrapper>
                            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                                {/* Model Name */}
                                <H1 id="model-details-title" style={styles.modelName}>
                                    {modelDetails?.C_merke} {modelDetails?.C_modell} {modelDetails?.C_typ}
                                </H1>

                                {/* Car Image Carousel */}
                                <View style={styles.imageContainer}>
                                    <FlatList
                                        data={carImages}
                                        renderItem={renderImageItem}
                                        keyExtractor={(_, index) => index.toString()}
                                        horizontal
                                        pagingEnabled
                                        showsHorizontalScrollIndicator={false}
                                        onScroll={onScroll}
                                        scrollEventThrottle={16}
                                        removeClippedSubviews={true}
                                    />
                                    {renderPaginationDots()}

                                    {/* Share Button */}
                                    <TouchableOpacity
                                        style={styles.shareButton}
                                        onPress={handleShare}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <SvgXml xml={ImagePath.SvgIcons.BlogShareIcon} />
                                    </TouchableOpacity>
                                </View>

                                {/* Details Section */}
                                <View style={styles.detailsSection}>
                                    {isDesktopWeb() ? (
                                        <View style={styles.detailsGrid}>
                                            {getDetailItems().map(renderModelDetailItem)}
                                        </View>
                                    ) : (
                                        getDetailItems().map(renderModelDetailItem)
                                    )}
                                </View>

                                {/* Description */}
                                <View style={styles.descriptionSection}>
                                    <ExpandableP
                                        id="model-description"
                                        text={modelDetails?.description || "Ingen beskrivning tillgänglig."}
                                        maxLength={500}
                                        style={styles.descriptionText}
                                    />
                                </View>
                            </Animated.View>
                            <CarSuggestion
                                title={`BILREGISTRET ${modelName}`}
                                cars={mergedCarSuggestionData}
                            />
                        </DesktopViewWrapper>
                    </FooterWrapper>
                ) : (
                    <Animated.ScrollView
                        style={[styles.scrollView, { opacity: fadeAnim }]}
                        showsVerticalScrollIndicator={false}
                    >
                        <DesktopViewWrapper>
                            <View style={styles.content}>
                                {/* Model Name */}
                                <H1 id="model-details-title" style={styles.modelName}>
                                    {modelDetails?.C_merke} {modelDetails?.C_modell} {modelDetails?.C_typ}
                                </H1>

                                {/* Car Image Carousel */}
                                <View style={styles.imageContainer}>
                                    <FlatList
                                        data={carImages}
                                        renderItem={renderImageItem}
                                        keyExtractor={(_, index) => index.toString()}
                                        horizontal
                                        pagingEnabled
                                        showsHorizontalScrollIndicator={false}
                                        onScroll={onScroll}
                                        scrollEventThrottle={16}
                                        removeClippedSubviews={true}
                                    />
                                    {renderPaginationDots()}

                                    {/* Share Button */}
                                    <TouchableOpacity
                                        style={styles.shareButton}
                                        onPress={handleShare}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <SvgXml xml={ImagePath.SvgIcons.BlogShareIcon} />
                                    </TouchableOpacity>
                                </View>

                                {/* Details Section */}
                                <View style={styles.detailsSection}>
                                    {isDesktopWeb() ? (
                                        <View style={styles.detailsGrid}>
                                            {getDetailItems().map(renderModelDetailItem)}
                                        </View>
                                    ) : (
                                        getDetailItems().map(renderModelDetailItem)
                                    )}
                                </View>

                                {/* Description */}
                                <View style={styles.descriptionSection}>
                                    <ExpandableP
                                        id="model-description"
                                        text={modelDetails?.description || "Ingen beskrivning tillgänglig."}
                                        maxLength={500}
                                        style={styles.descriptionText}
                                    />
                                </View>

                            </View>
                            <CarSuggestion
                                title={`BILREGISTRET ${modelName}`}
                                cars={mergedCarSuggestionData}
                                scrollEnabled={true}
                            />
                            <MyText style={styles.footerText}>© {currentYear} Bilregistret.ai | Alla rättigheter reserverade Bilregistret Sverige AB {"\n"}Ansvarig utgivare: Alen Rasic, databasens namn: bilregistret.ai</MyText>
                        </DesktopViewWrapper>
                    </Animated.ScrollView>
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
        paddingTop: getStatusBarHeight(),
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: isDesktopWeb() ? 0 : 40,
    },
    modelName: {
        fontSize: isDesktopWeb() ? 24 : 16,
        color: myColors.text.primary,
        marginBottom: 16,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 24,
        borderRadius: 12,
        // overflow: 'hidden',
        // height: 190,
    },
    imageItemContainer: {
        width: SCREEN_WIDTH - 32, // Accounting for content padding
        height: 190,
        borderRadius: 12,
        overflow: 'hidden' as const,
    },
    carImage: {
        // width: '100%',
        // height: '100%',
        borderRadius: 12,
        width: isDesktopWeb() ? desktopWebViewport - 30 : SCREEN_WIDTH - 30,
        height: (isDesktopWeb() ? desktopWebViewport : SCREEN_WIDTH) * 0.45,
        // marginTop: 30,
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    shareButton: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: myColors.white,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    detailsSection: {
        marginBottom: 24,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    detailItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: myColors.white,
        borderRadius: 12,
        padding: 10,
        width: isDesktopWeb() ? '49.6%' : '100%',
        // height: 48,
    },
    iconBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(230, 230, 230, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailTextContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: myColors.baseColors.light3,
        // flex: 1,
        width: 100,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '500',
        color: myColors.text.primary,
        flex: 1,
        textAlign: 'right',
    },
    descriptionSection: {
        // marginBottom: 24,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 22,
        color: myColors.text.primary,
        marginBottom: 16,
    },
    readMoreButton: {
        alignSelf: 'flex-start',
    },
    readMoreText: {
        fontSize: 14,
        color: myColors.primary.main,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: myColors.text.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: isDesktopWeb() ? 500 : 300,
    },
    errorText: {
        fontSize: 16,
        color: myColors.error,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    retryButtonText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '500',
    },

    // Skeleton styles
    skeletonContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    skeletonTitle: {
        height: 20,
        backgroundColor: myColors.white,
        borderRadius: 4,
        marginBottom: 16,
        width: '70%',
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonImageContainer: {
        height: 190,
        backgroundColor: myColors.white,
        borderRadius: 12,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: myColors.white,
        borderRadius: 12,
        padding: 10,
        height: 60,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: myColors.screenBackgroundColor,
        marginRight: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonDetailTextContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skeletonDetailLabel: {
        width: 100,
        height: 16,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonDetailValue: {
        flex: 1,
        height: 16,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        maxWidth: 100,
        alignSelf: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonDescriptionLine: {
        height: 16,
        backgroundColor: myColors.white,
        borderRadius: 4,
        marginBottom: 8,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: '100%',
        height: '100%',
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
});
