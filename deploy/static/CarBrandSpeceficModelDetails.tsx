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
import { useSSGData } from '@/hooks/useSSGData';
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

    // Try to load SSG data first (web only) - using the existing complete-tree structure
    const ssgData = useSSGData<any>('submodels', {
        brand: hyphensToSpaces(brand as string),
        model: hyphensToSpaces(subBrand as string)
    });

    // Find the specific submodel from SSG data
    const specificSubModel = useMemo(() => {
        if (!ssgData || !Array.isArray(ssgData)) return null;
        
        // Decode URL-encoded subBrandDetails and convert to different formats for matching
        const decodedSubBrandDetails = decodeURIComponent(subBrandDetails as string);
        const hyphenatedVersion = decodedSubBrandDetails.replace(/\s+/g, '-').toLowerCase();
        const spaceVersion = decodedSubBrandDetails.toLowerCase();
        
        // Debug logging
        if (Platform.OS === 'web') {
            console.log('🔍 SSG Debug:', {
                subBrandDetails,
                decodedSubBrandDetails,
                hyphenatedVersion,
                spaceVersion,
                ssgDataLength: ssgData.length,
                firstFewItems: ssgData.slice(0, 3).map((item: any) => ({
                    C_typ: item.C_typ,
                    Title: item.Title,
                    slug: item.slug
                }))
            });
        }
        
        const found = ssgData.find((subModel: any) => {
            const subModelTitle = (subModel.C_typ || '').toLowerCase();
            const subModelSlug = (subModel.slug || '').toLowerCase();
            const subModelTitleAlt = (subModel.Title || '').toLowerCase();
            
            const match = subModelTitle === spaceVersion ||
                   subModelSlug === hyphenatedVersion ||
                   subModelTitleAlt === spaceVersion ||
                   subModelTitle.includes(spaceVersion) ||
                   subModelSlug.includes(hyphenatedVersion);
            
            if (match && Platform.OS === 'web') {
                console.log('✅ Found matching submodel:', {
                    C_typ: subModel.C_typ,
                    Title: subModel.Title,
                    slug: subModel.slug
                });
            }
            
            return match;
        });
        
        if (!found && Platform.OS === 'web') {
            console.log('❌ No matching submodel found');
        }
        
        return found;
    }, [ssgData, subBrandDetails]);

    // Use API as fallback when SSG data is not available
    const carModelDetailsMutation = useCarModelDetails();

    // Animation and state values
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [modelDetails, setModelDetails] = useState<CarModelDetailsResponse | null>(null);
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Use SSG data if available, otherwise load from API
    useEffect(() => {
        // Only proceed if we have the required parameters
        if (!subBrandDetails || !brand || !subBrand) {
            setIsError(true);
            setIsLoading(false);
            return;
        }

        if (specificSubModel) {
            // Use SSG data - convert submodel data to the expected format
            const modelDetailsData: CarModelDetailsResponse = {
                Title: specificSubModel.Title || specificSubModel.C_typ || '',
                ID: specificSubModel.id || specificSubModel.ID || '',
                modell_id: specificSubModel.modell_id || '',
                C_merke: specificSubModel.C_merke || '',
                merke_id: specificSubModel.merke_id || '',
                C_modell: specificSubModel.C_modell || '',
                BIL_MODELL_ID: specificSubModel.BIL_MODELL_ID || '',
                MERKE_MODELL: specificSubModel.MERKE_MODELL || '',
                C_typ: specificSubModel.C_typ || '',
                C_kw: specificSubModel.C_kw || '',
                C_hk: specificSubModel.C_hk || '',
                C_slagvolym: specificSubModel.C_slagvolym || '',
                C_lit: specificSubModel.C_lit || '',
                C_cylinder: specificSubModel.C_cylinder || '',
                C_hjuldrift: specificSubModel.C_hjuldrift || '',
                MINI_AR: specificSubModel.MINI_AR || '',
                MAX_YEAR: specificSubModel.MAX_YEAR || '',
                HJUL_DRIFT_SAMLAD: specificSubModel.HJUL_DRIFT_SAMLAD || '',
                C_bransle: specificSubModel.C_bransle || '',
                BRANSLE_SAMLAD: specificSubModel.BRANSLE_SAMLAD || '',
                C_kaross: specificSubModel.C_kaross || '',
                kaross_samlad: specificSubModel.kaross_samlad || '',
                C_motorkod: specificSubModel.C_motorkod || '',
                C_chassi: specificSubModel.C_chassi || null,
                C_fran_ar: specificSubModel.C_fran_ar || '',
                ar_fra: specificSubModel.ar_fra || '',
                C_till_ar: specificSubModel.C_till_ar || '',
                ar_till: specificSubModel.ar_till || '',
                fake_till_AR: specificSubModel.fake_till_AR || null,
                tcount: specificSubModel.tcount || specificSubModel.t_count || '',
                description: specificSubModel.description || '',
                "Car Image": specificSubModel["Car Image"] || specificSubModel.imageUrl || '',
                "high_res": specificSubModel.high_res || specificSubModel["Car Image"] || specificSubModel.imageUrl || '',
                "model description": specificSubModel["model description"] || '',
                "Mobile Image": specificSubModel["Mobile Image"] || ''
            };
            setModelDetails(modelDetailsData);
            setIsLoading(false);
            setIsError(false);
        } else if (ssgData === undefined && isFocused) {
            // SSG data is not available (not loaded yet or failed), fall back to API
            const loadModelDetails = async () => {
                setIsLoading(true);
                setIsError(false);

                try {
                    const result = await carModelDetailsMutation.mutateAsync({
                        c_merke: hyphensToSpaces(brand as string),
                        c_modell: hyphensToSpaces(subBrand as string),
                        title: subBrandDetails as string
                    });
                    setModelDetails(result);
                    setIsLoading(false);
                } catch (error) {
                    // console.error('Error loading model details:', error);
                    setIsError(true);
                    setIsLoading(false);
                }
            };

            loadModelDetails();
        } else if (ssgData === null && isFocused) {
            // SSG data was attempted but failed, fall back to API
            const loadModelDetails = async () => {
                setIsLoading(true);
                setIsError(false);

                try {
                    const result = await carModelDetailsMutation.mutateAsync({
                        c_merke: hyphensToSpaces(brand as string),
                        c_modell: hyphensToSpaces(subBrand as string),
                        title: subBrandDetails as string
                    });
                    setModelDetails(result);
                    setIsLoading(false);
                } catch (error) {
                    // console.error('Error loading model details:', error);
                    setIsError(true);
                    setIsLoading(false);
                }
            };

            loadModelDetails();
        }
    }, [specificSubModel, ssgData, brand, subBrand, subBrandDetails, isFocused]);

    // Bottom items data
    const { data: bottomItemsData, isLoading: isBottomItemsLoading, refetch: refetchBottomItems } = useCarModelDetailsBottomItems(
        modelDetails?.modell_id || '',
        { enabled: isFocused && !!modelDetails?.modell_id }
    );

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
