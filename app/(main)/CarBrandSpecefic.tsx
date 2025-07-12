import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ScrollView, TouchableNativeFeedback, TouchableWithoutFeedback, Pressable, Keyboard, Animated, Platform, ActivityIndicator, Dimensions, InteractionManager } from 'react-native';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import HeaderWithSearch from '@/components/common/HeaderWithSearch';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import ProductSearchBar from '@/components/common/ProductSearchBar';
import { useCarModels } from '@/Services/api/hooks/car.hooks';
import { convertWixImageUrl, hyphensToSpaces, isUrl, spacesToHyphens } from '@/constants/commonFunctions';
import ListEmptyView from '@/components/common/ListEmptyView';
import CarBrandSpeceficFilter from '@/components/common/CarBrandSpeceficFilter';
import moment from 'moment';
import { useLayoutType } from '@/hooks/useLayoutType';
import { Easing } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { performCacheCleanup } from '@/Services/api/utils/cacheManager';
import { cleanupForScreen } from '@/utils/cacheUtils';
import { useIsFocused } from '@react-navigation/native';
import { isDesktopWeb } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { desktopWebViewport } from '@/constants/commonConst';
import {
    getSSGBrandModels,
    isSSGMode,
    logSSGPerformance,
    getStaticBrandData,
    transformBrandDataForComponent,
    isStaticContentAvailable
} from '@/utils/staticContentLoader';
import {
    createOptimizedImageProps,
    WebImagePreloader,
    WebLazyImageObserver
} from '@/utils/webImageOptimizer';
import { H1 } from '@/components/common/SemanticText';
import { IconRefresh } from '@/assets/icons';

// Move helper functions outside component to prevent recreation on each render
const getSvgIcon = (fuelType: string) => {
    switch (fuelType?.toUpperCase()) {
        case 'CNG':
            return ImagePath.SvgIcons.CarBrandFuelTypeCNGIcon;
        case 'BENSIN':
            return ImagePath.SvgIcons.CarBrandFuelTypeBIcon;
        case 'BENSIN/NATURGAS (CNG)':
            return ImagePath.SvgIcons.CarBrandFuelTypeBCNGIcon;
        case 'BENSIN/MOTORGAS (CNG)':
            return ImagePath.SvgIcons.CarBrandFuelTypeBLPGcon;
        case 'DIESEL':
            return ImagePath.SvgIcons.CarBrandFuelTypeDIcon;
        case 'BENSIN/ELHYBRID':
            return ImagePath.SvgIcons.CarBrandFuelTypeHBcon;
        case 'DIESEL/ELHYBRID':
            return ImagePath.SvgIcons.CarBrandFuelTypeHDcon;
        case 'ETANOL':
            return ImagePath.SvgIcons.CarBrandFuelTypeE85con;
        case 'BENSIN/ETANOL':
            return ImagePath.SvgIcons.CarBrandFuelTypeBE85con;
        case 'EL':
            return ImagePath.SvgIcons.CarBrandFuelTypeELIcon;
        case 'ELEKTRICITET':
            return ImagePath.SvgIcons.CarBrandFuelTypeELIcon;
        case 'VÄTGAS':
            return ImagePath.SvgIcons.CarBrandFuelTypeHIcon;
        case 'MOTORGAS':
            return ImagePath.SvgIcons.CarBrandFuelTypeLPGcon;
        case 'BENSIN/MOTORGAS':
            return ImagePath.SvgIcons.CarBrandFuelTypeBLPGcon;
        case 'BENSIN/MOTORGAS (LPG)':
            return ImagePath.SvgIcons.CarBrandFuelTypeBLPGcon;
        default:
            return ImagePath.SvgIcons.CarBrandFuelTypeBIcon; // Default to petrol icon
    }
}

const getEngineType = (engineType: string) => {
    switch (engineType?.toUpperCase()) {
        case 'FRAMHJULSDRIFT':
            return 'FWD';
        case 'BAKHJULSDRIFT':
            return 'RWD';
        case 'FYRHJULSDRIFT':
            return '4WD';
        case 'ALLHJULSDRIFT':
            return 'AWD';
        default:
            return engineType;
    }
}

interface FilterValue {
    fuelType: string | number | null;
    chassis: string | number | null;
    seats: string | number | null;
    yearRange: number[];
}

interface CarModelData {
    id: string;
    modelName: string;
    title: string;
    yearRange: string;
    registeredCars: string;
    seats: string;
    imageUrl: string;
    imageUrlLowRes: string;
    fuelTypes: string[];
    bodyTypes: string[];
    c_merke: string;
    engineTypes: string[];
    minYear: number;
    maxYear: number;
}

const yearRangeArray = [1920, moment().year()]

// Fuel Type Icon with Tooltip Component
const FuelTypeIconWithTooltip = React.memo(({ fuelType, iconXml, style }: { fuelType: string, iconXml: string, style?: any }) => {
    if (Platform.OS === 'web') {
        return (
            <div
                style={{
                    display: 'inline-flex',
                    cursor: 'pointer',
                    ...style
                }}
                onMouseEnter={(e) => {
                    const tooltip = document.createElement('div');
                    tooltip.id = `fuel-tooltip-${Date.now()}`;
                    tooltip.style.cssText = `
                        position: fixed;
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        z-index: 1000;
                        max-width: 200px;
                        word-wrap: break-word;
                        white-space: nowrap;
                    `;
                    tooltip.textContent = fuelType;
                    document.body.appendChild(tooltip);

                    const rect = e.currentTarget.getBoundingClientRect();
                    tooltip.style.left = rect.left + 'px';
                    tooltip.style.top = (rect.bottom + 5) + 'px';
                }}
                onMouseLeave={() => {
                    // Remove all fuel tooltips
                    const tooltips = document.querySelectorAll('[id^="fuel-tooltip-"]');
                    tooltips.forEach(tooltip => tooltip.remove());
                }}
            >
                <SvgXml xml={iconXml} style={style} />
            </div>
        );
    }

    // Native fallback - no tooltip
    return <SvgXml xml={iconXml} style={style} />;
});

// Engine Type Text with Tooltip Component
const EngineTypeWithTooltip = React.memo(({ originalEngineType, children, style }: { originalEngineType: string, children: React.ReactNode, style?: any }) => {
    if (Platform.OS === 'web') {
        return (
            <div
                style={{
                    display: 'inline-flex',
                    cursor: 'pointer',
                    ...style
                }}
                onMouseEnter={(e) => {
                    const tooltip = document.createElement('div');
                    tooltip.id = `engine-tooltip-${Date.now()}`;
                    tooltip.style.cssText = `
                        position: fixed;
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        z-index: 1000;
                        max-width: 200px;
                        word-wrap: break-word;
                        white-space: nowrap;
                    `;
                    tooltip.textContent = originalEngineType;
                    document.body.appendChild(tooltip);

                    const rect = e.currentTarget.getBoundingClientRect();
                    tooltip.style.left = rect.left + 'px';
                    tooltip.style.top = (rect.bottom + 5) + 'px';
                }}
                onMouseLeave={() => {
                    // Remove all engine tooltips
                    const tooltips = document.querySelectorAll('[id^="engine-tooltip-"]');
                    tooltips.forEach(tooltip => tooltip.remove());
                }}
            >
                {children}
            </div>
        );
    }

    // Native fallback - no tooltip, just return the children
    return <>{children}</>;
});

// No Search Results Component
const NoSearchResultsComponent = React.memo(() => {

    // React Native fallback
    return (
        <View style={styles.noSearchResultsContainer}>
            <MyText style={styles.noSearchResultsText}>
                Inga sökträffar hittade
            </MyText>
        </View>
    );
});

// Memoize layout components for better performance
const LayoutTextView = React.memo(({ item, onPress }: { item: CarModelData, onPress: () => void }) => {
    // Desktop Web Optimized Layout
    if (isDesktopWeb()) {
        return (
            <TouchableOpacity
                style={styles.carBrandTextItemContainerDesktop}
                onPress={onPress}>
                <View style={styles.carBrandTextRowDesktop}>
                    {/* Model Name Column */}
                    <View style={styles.textModelNameColumnDesktop}>
                        <MyText fontFamily='Inter' style={styles.textModelNameDesktop}>{item.title}</MyText>
                    </View>

                    {/* Year Column */}
                    <View style={styles.textYearColumnDesktop}>
                        <View style={styles.textYearBadgeDesktop}>
                            <MyText style={styles.textYearTextDesktop}>{item.yearRange}</MyText>
                        </View>
                    </View>

                    {/* Fuel Types Column */}
                    <View style={styles.textFuelTypesColumnDesktop}>
                        {item.fuelTypes.slice(0, 6).map((fuelType, index) => {
                            const iconXml = getSvgIcon(fuelType);
                            return iconXml ? (
                                <FuelTypeIconWithTooltip key={index} fuelType={fuelType} iconXml={iconXml} style={{ height: 25 }} />
                            ) : null;
                        })}
                        {item.fuelTypes.length > 6 && (
                            <MyText style={styles.textMoreIndicatorDesktop}>+{item.fuelTypes.length - 6}</MyText>
                        )}
                    </View>

                    {/* Body Types Column (Chassis) */}
                    <View style={styles.textBodyTypesColumnDesktop}>
                        {item.bodyTypes.slice(0, 2).map((bodyType, index) => (
                            <View key={index} style={styles.textBodyTypeBadgeDesktop}>
                                <MyText style={styles.textBodyTypeTextDesktop}>{bodyType}</MyText>
                            </View>
                        ))}
                        {item.bodyTypes.length > 2 && (
                            Platform.OS === 'web' ? (
                                <div
                                    style={{
                                        paddingLeft: 7,
                                        paddingRight: 7,
                                        // paddingTop: 8,
                                        // paddingBottom: 8,
                                        backgroundColor: '#F5F5F5',
                                        borderRadius: 6,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        // gap: 10,
                                        height: 25,
                                        display: 'flex',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        const tooltip = document.createElement('div');
                                        tooltip.id = 'chassis-tooltip';
                                        tooltip.style.cssText = `
                                            position: fixed;
                                            background: rgba(0, 0, 0, 0.8);
                                            color: white;
                                            padding: 8px 12px;
                                            border-radius: 6px;
                                            font-size: 12px;
                                            z-index: 1000;
                                            max-width: 200px;
                                            word-wrap: break-word;
                                        `;
                                        tooltip.textContent = item.bodyTypes.slice(2).join(', ');
                                        document.body.appendChild(tooltip);

                                        const rect = e.currentTarget.getBoundingClientRect();
                                        tooltip.style.left = rect.left + 'px';
                                        tooltip.style.top = (rect.bottom + 5) + 'px';
                                    }}
                                    onMouseLeave={() => {
                                        const tooltip = document.getElementById('chassis-tooltip');
                                        if (tooltip) {
                                            tooltip.remove();
                                        }
                                    }}
                                >
                                    <MyText style={styles.textBodyTypeTextDesktop}>
                                        {item.bodyTypes.length - 2}+
                                    </MyText>
                                </div>
                            ) : (
                                <View style={styles.textBodyTypeBadgeDesktop}>
                                    <MyText style={styles.textBodyTypeTextDesktop}>
                                        {item.bodyTypes.length - 2}+
                                    </MyText>
                                </View>
                            )
                        )}
                    </View>

                    {/* Engine Types Column (Wheel Drive) */}
                    <View style={styles.textEngineTypesColumnDesktop}>
                        {item.engineTypes.slice(0, 2).map((engineType, index) => (
                            <View key={index} style={styles.textEngineTypeBadgeDesktop}>
                                <EngineTypeWithTooltip originalEngineType={engineType}>
                                    <MyText style={styles.textEngineTypeTextDesktop}>
                                        {getEngineType(engineType)}
                                    </MyText>
                                </EngineTypeWithTooltip>
                            </View>
                        ))}
                        {item.engineTypes.length > 2 && (
                            Platform.OS === 'web' ? (
                                <div
                                    style={{
                                        paddingLeft: 7,
                                        paddingRight: 7,
                                        paddingTop: 8,
                                        paddingBottom: 8,
                                        backgroundColor: '#F5F5F5',
                                        borderRadius: 6,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: 10,
                                        height: 25,
                                        display: 'flex',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        const tooltip = document.createElement('div');
                                        tooltip.id = 'wheel-drive-tooltip';
                                        tooltip.style.cssText = `
                                            position: fixed;
                                            background: rgba(0, 0, 0, 0.8);
                                            color: white;
                                            padding: 8px 12px;
                                            border-radius: 6px;
                                            font-size: 12px;
                                            z-index: 1000;
                                            max-width: 200px;
                                            word-wrap: break-word;
                                        `;
                                        tooltip.textContent = item.engineTypes.slice(2).map(type => getEngineType(type)).join(', ');
                                        document.body.appendChild(tooltip);

                                        const rect = e.currentTarget.getBoundingClientRect();
                                        tooltip.style.left = rect.left + 'px';
                                        tooltip.style.top = (rect.bottom + 5) + 'px';
                                    }}
                                    onMouseLeave={() => {
                                        const tooltip = document.getElementById('wheel-drive-tooltip');
                                        if (tooltip) {
                                            tooltip.remove();
                                        }
                                    }}
                                >
                                    <MyText style={styles.textEngineTypeTextDesktop}>
                                        {item.engineTypes.length - 2}+
                                    </MyText>
                                </div>
                            ) : (
                                <View style={styles.textEngineTypeBadgeDesktop}>
                                    <MyText style={styles.textEngineTypeTextDesktop}>
                                        {item.engineTypes.length - 2}+
                                    </MyText>
                                </View>
                            )
                        )}
                    </View>

                    {/* Seats Column */}
                    <View style={[styles.textSeatsColumnDesktop, { left: 1080 }]}>
                        <View style={styles.textSeatsBadgeDesktop}>
                            <SvgXml xml={ImagePath.SvgIcons.CarBrandSeatIcon} style={styles.textStatIconDesktop} />
                            <MyText style={styles.textSeatsTextDesktop}>{item.seats}</MyText>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // Mobile Layout - Updated to match LayoutGridtView structure
    return (
        <TouchableOpacity
            style={styles.carBrandItemContainer}
            onPress={onPress}>
            <View>
                <MyText fontFamily='Poppins' style={styles.carModelName}>{item.title}</MyText>
                <View style={styles.carBrandItemContent}>
                    {/* <View style={[styles.carBrandImage, { backgroundColor: myColors.screenBackgroundColor }]}>
                        {isUrl(item.imageUrl) && (
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={styles.carBrandImage}
                                contentFit="cover"
                                cachePolicy="disk"
                                transition={100}
                            />
                        )}
                    </View> */}
                    <View style={{ width: '70%' }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            removeClippedSubviews={true}
                        >
                            <TouchableWithoutFeedback>
                                <View style={styles.bodyTypeContainer}>
                                    {item.bodyTypes.map((bodyType, index) => (
                                        <View key={index} style={styles.carModelInfoContainer}>
                                            <MyText style={styles.carInfoText}>{bodyType}</MyText>
                                        </View>
                                    ))}
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            removeClippedSubviews={true}
                        >
                            <TouchableWithoutFeedback>
                                <View style={styles.engineTypeContainer}>
                                    {[...item.engineTypes, item.yearRange].map((engineType, index) => (
                                        <View key={index} style={styles.carModelInfoContainer}>
                                            <EngineTypeWithTooltip originalEngineType={engineType}>
                                                <MyText style={styles.carInfoText}>{getEngineType(engineType)}</MyText>
                                            </EngineTypeWithTooltip>
                                        </View>
                                    ))}
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            removeClippedSubviews={true}
                        >
                            <TouchableWithoutFeedback>
                                <View style={styles.carModelInfoRowContainer}>
                                    {item.fuelTypes.map((fuelType, index) => {
                                        const iconXml = getSvgIcon(fuelType);
                                        return iconXml ? (
                                            <FuelTypeIconWithTooltip key={index} fuelType={fuelType} iconXml={iconXml} style={{ marginRight: 2.5 }} />
                                        ) : null;
                                    })}
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id;
});

const LayoutGridtView = React.memo(({ item, onPress, index }: { item: CarModelData, onPress: () => void, index?: number }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const isMounted = useRef(true);

    // WEB: Determine image priority based on position
    const isAboveFold = index !== undefined && index < 6; // First 6 images are critical
    const priority = isAboveFold ? 'critical' : (index !== undefined && index < 15 ? 'high' : 'lazy');

    // WEB: Get optimized image props (native gets standard props)
    const imageProps = isDesktopWeb()
        ? createOptimizedImageProps(item.imageUrlLowRes, 'model', priority)
        : {
            source: { uri: item.imageUrl },
            priority: 'low' as const,
            contentFit: 'cover' as const,
            cachePolicy: 'disk' as const,
            transition: 100,
            onLoadEnd: () => {
                if (isMounted.current) {
                    setImageLoaded(true);
                }
            },
            onError: () => {
                if (isMounted.current) {
                    setImageLoaded(false);
                }
            }
        };

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
            // WEB: Aggressive cleanup for image optimization
            if (isDesktopWeb() && isUrl(item.imageUrl)) {
                // Schedule cleanup to give time for GC
                setTimeout(() => {
                    // Only clear if we're still on web
                    if (isDesktopWeb()) {
                        Image.clearMemoryCache();
                    }
                }, 100);
            } else if (isUrl(item.imageUrl)) {
                // Native: standard cleanup
                setTimeout(() => {
                    Image.clearMemoryCache();
                }, 100);
            }
        };
    }, [item.imageUrl]);

    const handleImageLoad = () => {
        if (isMounted.current) {
            setImageLoaded(true);
        }
    };

    const handleImageError = () => {
        if (isMounted.current) {
            setImageLoaded(false);
        }
    };

    // Desktop Web Optimized Layout
    if (isDesktopWeb()) {
        return (
            <TouchableOpacity
                style={styles.carBrandItemContainerDesktopNew}
                onPress={onPress}>
                <View style={styles.carBrandItemWrapperDesktopNew}>
                    {/* Image Section */}
                    <View style={styles.carBrandImageDesktopNew}>
                        {isUrl(item.imageUrl) && (
                            <Image
                                {...imageProps}
                                style={styles.carBrandImageDesktopNew}
                            />
                        )}
                    </View>
                    {/* Content Section - Middle */}
                    <View style={styles.layoutType1MiddleContainer}>
                        <View style={styles.carBrandItemContentDesktopNew}>
                            {/* Model Title */}
                            <MyText fontFamily='Inter' style={styles.carModelNameDesktopNew}>
                                {item.title}
                            </MyText>

                            {/* Body Types and Engine Types Row */}
                            <View style={styles.bodyEngineTypesRowDesktopNew}>
                                {[...item.bodyTypes.slice(0, 2), ...item.engineTypes.slice(0, 2)].map((type, index) => (
                                    <View key={index} style={styles.bodyEngineTypeBadgeDesktopNew}>
                                        <EngineTypeWithTooltip originalEngineType={type}>
                                            <MyText style={styles.bodyEngineTypeTextDesktopNew}>
                                                {getEngineType(type)}
                                            </MyText>
                                        </EngineTypeWithTooltip>
                                    </View>
                                ))}
                            </View>

                            {/* Fuel Types Row */}
                            <View style={styles.fuelTypesRowDesktop}>
                                {item.fuelTypes.slice(0, 6).map((fuelType, index) => {
                                    const iconXml = getSvgIcon(fuelType);
                                    return iconXml ? (
                                        <FuelTypeIconWithTooltip key={index} fuelType={fuelType} iconXml={iconXml} style={styles.fuelIconDesktop} />
                                    ) : null;
                                })}
                            </View>
                        </View>

                        {/* Stats Section - Right */}
                        <View style={styles.statsColumnDesktopNew}>
                            {/* Year Range */}
                            <View style={styles.statItemDesktopNew}>
                                <SvgXml xml={ImagePath.SvgIcons.bilmarkenYearRangeCalendarIcon} style={styles.statIconDesktopNew} />
                                <MyText style={styles.statTextDesktopNew}>{item.yearRange}</MyText>
                            </View>



                            {/* Seats */}
                            <View style={styles.statItemDesktopNew}>
                                <SvgXml xml={ImagePath.SvgIcons.CarBrandSeatIcon} style={styles.statIconDesktopNew} />
                                <MyText style={styles.statTextDesktopNew}>{item.seats}</MyText>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // Mobile Layout (Original)
    return (
        <TouchableOpacity
            style={styles.carBrandItemContainer}
            onPress={onPress}>
            <View>
                <MyText fontFamily='Poppins' style={styles.carModelName}>{item.title}</MyText>
                <View style={styles.carBrandItemContent}>
                    <View style={[styles.carBrandImage, { backgroundColor: myColors.screenBackgroundColor }]}>
                        {isUrl(item.imageUrl) && (
                            <Image
                                {...imageProps}
                                style={styles.carBrandImage}
                            />
                        )}
                    </View>
                    <View style={{ width: '70%' }}>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            removeClippedSubviews={true}
                        >
                            <TouchableWithoutFeedback>
                                <View style={styles.bodyTypeContainer}>
                                    {item.bodyTypes.map((bodyType, index) => (
                                        <View key={index} style={styles.carModelInfoContainer}>
                                            <MyText style={styles.carInfoText}>{bodyType}</MyText>
                                        </View>
                                    ))}
                                </View>
                            </TouchableWithoutFeedback>

                        </ScrollView>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            removeClippedSubviews={true}
                        >
                            <TouchableWithoutFeedback>
                                <View style={styles.engineTypeContainer}>
                                    {[...item.engineTypes, item.yearRange].map((engineType, index) => (
                                        <View key={index} style={styles.carModelInfoContainer}>
                                            <EngineTypeWithTooltip originalEngineType={engineType}>
                                                <MyText style={styles.carInfoText}>{getEngineType(engineType)}</MyText>
                                            </EngineTypeWithTooltip>
                                        </View>
                                    ))}
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            removeClippedSubviews={true}
                        >
                            <TouchableWithoutFeedback>
                                <View style={styles.carModelInfoRowContainer}>
                                    {item.fuelTypes.map((fuelType, index) => {
                                        const iconXml = getSvgIcon(fuelType);
                                        return iconXml ? (
                                            <FuelTypeIconWithTooltip key={index} fuelType={fuelType} iconXml={iconXml} style={{ marginRight: 2.5 }} />
                                        ) : null;
                                    })}
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id;
});

const LayoutLargeGridtView = React.memo(({ item, onPress, index }: { item: CarModelData, onPress: () => void, index?: number }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    // WEB: Determine image priority based on position
    const isAboveFold = index !== undefined && index < 4; // First 4 large images are critical
    const priority = isAboveFold ? 'critical' : (index !== undefined && index < 10 ? 'high' : 'lazy');

    // WEB: Get optimized image props (native gets standard props)
    const imageProps = isDesktopWeb()
        ? createOptimizedImageProps(item.imageUrl, 'detail', priority) // Use 'detail' for larger images
        : {
            source: { uri: item.imageUrl },
            priority: 'low' as const,
            contentFit: 'cover' as const,
            cachePolicy: 'disk' as const,
            transition: 0,
            onLoadEnd: () => setImageLoaded(true),
            onError: () => setImageLoaded(false)
        };

    useEffect(() => {
        return () => {
            // WEB: Aggressive cleanup for large images
            if (isDesktopWeb() && isUrl(item.imageUrl)) {
                // Cleanup large images more aggressively
                setTimeout(() => {
                    if (isDesktopWeb()) {
                        Image.clearMemoryCache();
                    }
                }, 50);
            } else if (isUrl(item.imageUrl)) {
                // Native: standard cleanup
                Image.clearMemoryCache();
            }
        };
    }, [item.imageUrl]);


    if (isDesktopWeb()) {
        return (
            <TouchableOpacity
                style={styles.carBrandItemContainerLargeGrid}
                onPress={onPress}>
                <View>
                    <View style={[styles.carBrandImageLargeGrid, { backgroundColor: myColors.screenBackgroundColor }]}>
                        {isUrl(item.imageUrl) && (
                            <Image
                                {...imageProps}
                                style={styles.carBrandImageLargeGrid}
                            />
                        )}
                    </View>
                    <View style={styles.carBrandItemContentLargeGrid}>
                        <MyText style={[styles.carModelNameLargeGrid, styles.desktopWebExtraSpace]}>{item.title}</MyText>
                        <View style={{ width: '100%' }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                                style={styles.desktopWebExtraSpace}
                            >
                                <TouchableWithoutFeedback>
                                    <View style={styles.bodyTypeContainer}>
                                        {/* {item.bodyTypes.map((bodyType, index) => ( */}
                                        {[...item.bodyTypes, ...item.engineTypes].map((bodyType, index) => (
                                            <View key={index} style={styles.carModelInfoContainer}>
                                                <EngineTypeWithTooltip originalEngineType={bodyType}>
                                                    <MyText style={styles.carInfoText}>{getEngineType(bodyType)}</MyText>
                                                </EngineTypeWithTooltip>
                                            </View>
                                        ))}
                                    </View>
                                </TouchableWithoutFeedback>
                            </ScrollView>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <TouchableWithoutFeedback>
                                    <View style={styles.carModelInfoRowContainer}>
                                        {item.fuelTypes.map((fuelType, index) => {
                                            const iconXml = getSvgIcon(fuelType);
                                            return iconXml ? (
                                                <FuelTypeIconWithTooltip key={index} fuelType={fuelType} iconXml={iconXml} style={{ marginHorizontal: 2.5, }} />
                                            ) : null;
                                        })}
                                    </View>
                                </TouchableWithoutFeedback>
                            </ScrollView>
                            <View style={{ height: 1, backgroundColor: myColors.screenBackgroundColor, marginVertical: 15 }}></View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <TouchableWithoutFeedback>
                                    <View style={styles.engineTypeContainer}>
                                        {[item.yearRange].map((engineType, index) => (
                                            <View key={index} style={styles.carModelInfoContainer}>
                                                <SvgXml xml={ImagePath.SvgIcons.bilmarkenYearRangeCalendarIcon} style={{ marginRight: 5 }} />
                                                <EngineTypeWithTooltip originalEngineType={engineType}>
                                                    <MyText style={styles.carInfoText}>{getEngineType(engineType)}</MyText>
                                                </EngineTypeWithTooltip>
                                            </View>
                                        ))}
                                        <View style={styles.carModelInfoContainer}>
                                            <SvgXml xml={ImagePath.SvgIcons.CarBrandSeatIcon} style={{ marginRight: 5 }} />
                                            <MyText style={styles.carInfoText}>{item.seats}</MyText>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    } else {
        return (
            <TouchableOpacity
                style={styles.carBrandItemContainerLargeGrid}
                onPress={onPress}>
                <View>
                    <View style={[styles.carBrandImageLargeGrid, { backgroundColor: myColors.screenBackgroundColor }]}>
                        {isUrl(item.imageUrl) && (
                            <Image
                                {...imageProps}
                                style={styles.carBrandImageLargeGrid}
                            />
                        )}
                    </View>
                    <View style={styles.carBrandItemContentLargeGrid}>
                        <MyText style={styles.carModelNameLargeGrid}>{item.title}</MyText>
                        <View style={{ width: '100%' }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <TouchableWithoutFeedback>
                                    <View style={styles.bodyTypeContainer}>
                                        {item.bodyTypes.map((bodyType, index) => (
                                            <View key={index} style={styles.carModelInfoContainer}>
                                                <MyText style={styles.carInfoText}>{bodyType}</MyText>
                                            </View>
                                        ))}
                                    </View>
                                </TouchableWithoutFeedback>
                            </ScrollView>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <TouchableWithoutFeedback>
                                    <View style={styles.engineTypeContainer}>
                                        {[...item.engineTypes, item.yearRange].map((engineType, index) => (
                                            <View key={index} style={styles.carModelInfoContainer}>
                                                <EngineTypeWithTooltip originalEngineType={engineType}>
                                                    <MyText style={styles.carInfoText}>{getEngineType(engineType)}</MyText>
                                                </EngineTypeWithTooltip>
                                            </View>
                                        ))}
                                    </View>
                                </TouchableWithoutFeedback>
                            </ScrollView>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <TouchableWithoutFeedback>
                                    <View style={styles.carModelInfoRowContainer}>
                                        {item.fuelTypes.map((fuelType, index) => {
                                            const iconXml = getSvgIcon(fuelType);
                                            return iconXml ? (
                                                <FuelTypeIconWithTooltip key={index} fuelType={fuelType} iconXml={iconXml} style={{ marginHorizontal: 2.5 }} />
                                            ) : null;
                                        })}
                                    </View>
                                </TouchableWithoutFeedback>
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}, (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id;
});

// Move helper functions outside component to prevent recreation on each render
const processDataChunk = (chunk: any[], transformedArray: CarModelData[]) => {
    for (const model of chunk) {
        if (!model) continue;

        // Extract min and max years as numbers for filtering
        const minYear = parseInt(model.MINI_AR || '0', 10);
        const maxYear = parseInt(model.MAX_YEAR || '0', 10);

        // Split arrays once and reuse
        const fuelTypes = (model.BRANSLE_SAMLAD || '').split(',').map((type: string) => type.trim()).filter(Boolean);
        const bodyTypes = (model.kaross_samlad || '').split(',').map((type: string) => type.trim()).filter(Boolean);
        const engineTypes = (model.HJUL_DRIFT_SAMLAD || '').split(',').map((type: string) => type.trim()).filter(Boolean);

        transformedArray.push({
            id: model.ID || '',
            modelName: `${model.C_modell || ''}`.trim(),
            title: `${model.C_merke} ${model.C_modell || ''}`.trim() || '',
            c_merke: model.C_merke || '',
            yearRange: `${model.MINI_AR || ''}-${model.MAX_YEAR || ''}`,
            registeredCars: model.t_count || '0',
            seats: `${model.minSeats || '0'}-${model.maxSeats || '0'}`,
            imageUrl: convertWixImageUrl(model[Platform.OS === "web" ? "high_res" : "Car Image"] || ''),
            imageUrlLowRes: convertWixImageUrl(model["Car Image"] || ''),
            fuelTypes,
            bodyTypes,
            engineTypes,
            minYear,
            maxYear
        });
    }
};

const filterDataChunk = (
    chunk: CarModelData[],
    searchTextLower: string,
    yearMin: number,
    yearMax: number,
    hasFuelTypeFilter: boolean,
    hasChassisFilter: boolean,
    hasSeatsFilter: boolean,
    filterValues: FilterValue
) => {
    const filtered: CarModelData[] = [];

    for (const item of chunk) {
        // Quick search text check
        if (searchTextLower && !item.title.toLowerCase().includes(searchTextLower)) {
            continue;
        }

        // Quick year range check
        if (item.maxYear < yearMin || item.minYear > yearMax) {
            continue;
        }

        // Normalize filter values to uppercase for case-insensitive comparison
        const fuelFilter = (filterValues.fuelType ?? '').toString().toUpperCase();
        const chassisFilter = (filterValues.chassis ?? '').toString().toUpperCase();

        // Fuel type check
        if (hasFuelTypeFilter) {
            let fuelMatch = false;
            for (const fuelType of item.fuelTypes) {
                if (fuelType.toUpperCase() === fuelFilter) {
                    fuelMatch = true;
                    break;
                }
            }
            if (!fuelMatch) continue;
        }

        // Chassis check
        if (hasChassisFilter) {
            let chassisMatch = false;
            for (const bodyType of item.bodyTypes) {
                if (bodyType.toUpperCase() === chassisFilter) {
                    chassisMatch = true;
                    break;
                }
            }
            if (!chassisMatch) continue;
        }

        // Seats check
        if (hasSeatsFilter) {
            const [minSeats, maxSeats] = item.seats.split('-').map(s => parseInt(s, 10));
            const selectedSeats = parseInt(filterValues.seats as string, 10);
            if (selectedSeats < minSeats || selectedSeats > maxSeats) {
                continue;
            }
        }

        filtered.push(item);
    }

    return filtered;
};

// Add this new component after the existing layout components and before the main CarBrand component
const TableHeader = React.memo(({ filteredDataLength, layoutType }: { filteredDataLength?: number, layoutType?: number }) => {
    if (!isDesktopWeb()) return null;

    // Layout type 0 has more columns
    if (layoutType === 0) {
        return (
            <View style={styles.tableHeaderContainer}>
                <View style={styles.tableHeaderContentLayout0}>
                    <View style={styles.tableHeaderLeftLayout0}>
                        <MyText style={styles.tableHeaderTitle}>
                            Nuvarande serie ({filteredDataLength || 0})
                        </MyText>
                    </View>

                    <View style={[styles.tableHeaderColumnLayout0, { left: 267 }]}>
                        <MyText style={styles.tableHeaderColumnText}>Modellår</MyText>
                    </View>

                    <View style={[styles.tableHeaderDividerLayout0, { left: 350 }]} />

                    <View style={[styles.tableHeaderColumnLayout0, { left: 370 }]}>
                        <MyText style={styles.tableHeaderColumnText}>Fuels</MyText>
                    </View>

                    <View style={[styles.tableHeaderColumnLayout0, { left: 694 }]}>
                        <MyText style={styles.tableHeaderColumnText}>Chassis</MyText>
                    </View>

                    <View style={[styles.tableHeaderColumnLayout0, { left: 924 }]}>
                        <MyText style={styles.tableHeaderColumnText}>Wheel Drive</MyText>
                    </View>

                    {/* <View style={[styles.tableHeaderColumnLayout0, { left: 1099 }]}>
                        <MyText style={styles.tableHeaderColumnText}>Registrerad</MyText>
                    </View>

                    <View style={[styles.tableHeaderDividerLayout0, { left: 1183, top: 14 }]} /> */}

                    <View style={[styles.tableHeaderColumnLayout0, { left: 1080 }]}>
                        <MyText style={styles.tableHeaderColumnText}>Antal Säten</MyText>
                    </View>
                </View>
            </View>
        );
    }

    // Layout type 1 (existing simplified version)
    return (
        <View style={styles.tableHeaderContainer}>
            <View style={styles.tableHeaderContent}>
                <View style={styles.tableHeaderLeft}>
                    <MyText style={styles.tableHeaderTitle}>
                        Nuvarande serie ({filteredDataLength || 0})
                    </MyText>
                </View>
                <View style={styles.tableHeaderRight}>
                    <View style={styles.tableHeaderColumn}>
                        <MyText style={styles.tableHeaderColumnText}>Modellår</MyText>
                    </View>
                    <View style={styles.tableHeaderDivider} />
                    <View style={styles.tableHeaderColumn}>
                        <MyText style={styles.tableHeaderColumnText}>Antal Säten</MyText>
                    </View>
                </View>
            </View>
        </View>
    );
});

const CarBrand = () => {
    const { brand } = useLocalSearchParams<{ brand: string }>();
    const brandName = hyphensToSpaces(brand || '');
    const c_merke = brand;
    const isFocused = useIsFocused();

    // Calculate layout width based on platform
    const layoutWidth = useMemo(() => {
        return isDesktopWeb() ? desktopWebViewport : Dimensions.get('window').width;
    }, []);

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
    const queryClient = useQueryClient();
    const apiData = !isDesktopWeb() || dataLoadingStrategy === 'API_ONLY' || dataLoadingStrategy === 'STATIC_WITH_FALLBACK'
        ? useCarModels(hyphensToSpaces(c_merke as string), { enabled: isFocused })
        : { data: [], isLoading: false, error: null, refetch: () => Promise.resolve() }; // Dummy data only for SSG web

    // Step 3: Load data based on strategy
    const { data: carModels, isLoading: isCarModelsLoading, error, refetch } = useMemo(() => {
        switch (dataLoadingStrategy) {
            case 'MOBILE_API':
                // Mobile ALWAYS uses API - this ensures mobile native works!
                // console.log('📱 MOBILE_API: Using live API for mobile native');
                return apiData;

            case 'SSG_ONLY':
                // Pure SSG: Instant synchronous data, zero API calls (WEB ONLY)
                const ssgData = getSSGBrandModels(c_merke as string);
                // console.log('🚀 SSG_ONLY: Loaded brand models instantly (WEB ONLY - zero API overhead)');
                return {
                    data: ssgData,
                    isLoading: false,
                    error: null,
                    refetch: () => Promise.resolve()
                };

            case 'STATIC_WITH_FALLBACK':
                // Static content with emergency API fallback (WEB ONLY)
                const brandData = getStaticBrandData(c_merke as string);
                if (brandData && brandData.models) {
                    const transformedModels = transformBrandDataForComponent(brandData);
                    // console.log('🌐 STATIC_WITH_FALLBACK: Using static brand models (WEB)');
                    return {
                        data: transformedModels.models,
                        isLoading: false,
                        error: null,
                        refetch: () => Promise.resolve()
                    };
                } else {
                    // Emergency fallback to API
                    // console.log('⚠️ STATIC_WITH_FALLBACK: Static failed, using API emergency fallback (WEB)');
                    return apiData;
                }

            case 'API_ONLY':
                // Web without static content - use API
                // console.log('📡 API_ONLY: Using API brand models (WEB)');
                return apiData;

            default:
                // console.error('Unknown data loading strategy:', dataLoadingStrategy);
                return {
                    data: [],
                    isLoading: false,
                    error: null,
                    refetch: () => Promise.resolve()
                };
        }
    }, [dataLoadingStrategy, apiData, c_merke]);

    // Log strategy for debugging
    useEffect(() => {
        // console.log(`📊 CarBrandSpecefic Data Strategy: ${dataLoadingStrategy}`);
        // console.log(`🎯 Platform: ${isDesktopWeb() ? 'Desktop Web' : 'Mobile'}`);
        // console.log(`🔧 SSG Mode: ${isSSGMode()}`);
        // console.log(`📁 Static Available: ${isStaticContentAvailable()}`);

        // Log performance for SSG
        if (dataLoadingStrategy === 'SSG_ONLY' && carModels && carModels.length > 0) {
            logSSGPerformance('CarBrandSpecefic', carModels.length);
        }
    }, [dataLoadingStrategy, carModels?.length]);

    // Use the strategy-determined data
    const finalCarModels = carModels;
    const finalIsLoading = isCarModelsLoading;

    const [infoSearchInputText, setInfoSearchInputText] = useState('');
    const [cachedLayoutType, setCachedLayoutType] = useState<number>(0); // Initial default layout type
    const [isLayoutTypeReady, setIsLayoutTypeReady] = useState(false); // Track if layout type is ready
    const { layoutType, updateLayoutType, isLoading: isLayoutLoading } = useLayoutType('model');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filterValues, setFilterValues] = useState<FilterValue>({
        fuelType: null,
        chassis: null,
        seats: null,
        yearRange: yearRangeArray
    });
    const [resetFilters, setResetFilters] = useState(false);
    const [backgroundPressed, setBackgroundPressed] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const itemsPerPage = 15; // Smaller batch size for better performance

    // Animation values
    const filterSlideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const filterHeight = useRef(0);
    const flatListRef = useRef<FlatList<CarModelData>>(null);

    // Memoize the year value to avoid unnecessary re-rendering
    const currentYear = useMemo(() => moment().year(), []);

    // Get cached layout type on first render
    useEffect(() => {
        const loadCachedLayout = async () => {
            try {
                const savedLayout = await AsyncStorage.getItem('model_layout_type');
                if (savedLayout !== null) {
                    setCachedLayoutType(parseInt(savedLayout, 10));
                }
                // Mark layout type as ready whether we found a saved value or not
                setIsLayoutTypeReady(true);
            } catch (error) {
                // console.error('Error loading cached layout:', error);
                // Even if there's an error, we need to proceed
                setIsLayoutTypeReady(true);
            }
        };

        loadCachedLayout();
    }, []);

    // Update cached layout type when layoutType changes
    useEffect(() => {
        if (!isLayoutLoading) {
            setCachedLayoutType(layoutType);
            // If layout is loaded but our ready flag isn't set, set it now
            if (!isLayoutTypeReady) {
                setIsLayoutTypeReady(true);
            }
            // Save to AsyncStorage for future use
            AsyncStorage.setItem('model_layout_type', layoutType.toString()).catch(err => {
                // console.error('Error saving layout type:', err)
            });
        }
    }, [layoutType, isLayoutLoading, isLayoutTypeReady]);

    // Add cleanup to the useEffect for initial data loading
    useEffect(() => {
        let isActive = true;

        if (c_merke) {
            setIsInitialLoad(true);
            setDataLoaded(false);
            // Force immediate refetch when the component mounts or brand changes
            setTimeout(() => {
                if (isActive) {
                    refetch();
                }
            }, 0);
        }

        return () => {
            isActive = false;
        };
    }, [c_merke, refetch]);

    // Handle loading states with animations - modify this effect to prevent flickering
    useEffect(() => {
        if (!finalIsLoading && !isLayoutLoading && finalCarModels && finalCarModels.length > 0 && !dataLoaded) {
            // Only set dataLoaded to true once when data finishes loading
            setDataLoaded(true);
            setIsInitialLoad(false);

            // Animate content appearance with subtle scale effect
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400, // Slightly longer for a smoother effect
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            }).start();
        }
    }, [finalIsLoading, isLayoutLoading, finalCarModels, dataLoaded, fadeAnim]);

    // Improve the focus effect cleanup
    useFocusEffect(
        useCallback(() => {
            // Clear image cache when entering screen
            Image.clearMemoryCache();

            let isMounted = true;

            // Ensure data is fetched when screen gains focus
            if (c_merke && isMounted) {
                refetch();
            }

            return () => {
                isMounted = false;
                // Clear image cache when leaving screen
                Image.clearMemoryCache();

                // Reset critical animations to prevent memory leaks
                filterSlideAnim.setValue(0);
                fadeAnim.setValue(0);
            };
        }, [c_merke, refetch, filterSlideAnim, fadeAnim])
    );

    // Debounced search handler
    const debouncedSearch = useCallback(
        (text: string) => {
            setInfoSearchInputText(text);
        },
        []
    );

    // Pull to refresh handler
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch]);

    // Measure filter height on layout
    const onFilterLayout = useCallback((event: { nativeEvent: { layout: { height: number } } }) => {
        const { height } = event.nativeEvent.layout;
        if (height > 0 && filterHeight.current === 0) {
            filterHeight.current = height;
        }
    }, []);

    // Toggle filter with sliding animation
    const toggleFilter = useCallback(() => {
        setIsFilterVisible(prevVisible => {
            const toValue = !prevVisible ? 1 : 0;

            Animated.timing(filterSlideAnim, {
                toValue,
                duration: 300,
                useNativeDriver: true
            }).start();

            return !prevVisible;
        });
    }, [filterSlideAnim]);

    // Memoized handler to prevent recreation on re-renders
    const handleFilterChange = useCallback((values: FilterValue) => {
        setFilterValues(values);
        setResetFilters(false); // Reset the reset flag
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilterValues({
            fuelType: null,
            chassis: null,
            seats: null,
            yearRange: [...yearRangeArray] // Create new array to ensure proper state update
        });
        setResetFilters(true);
    }, []);

    // Optimize data transformation with useMemo and chunking
    const transformedData = useMemo(() => {
        if (!finalCarModels) return [];

        const transformedArray: CarModelData[] = [];
        const chunkSize = 20; // Process data in chunks

        // Process data directly without deferring
        for (let i = 0; i < finalCarModels.length; i += chunkSize) {
            const chunk = finalCarModels.slice(i, i + chunkSize);
            processDataChunk(chunk, transformedArray);
        }

        return transformedArray;
    }, [finalCarModels]);

    // WEB ONLY: EXTREME image preloading optimization for model images
    useEffect(() => {
        if (isDesktopWeb() && transformedData.length > 0) {
            const criticalImages = transformedData.slice(0, 6).map(item => item.imageUrl).filter(Boolean);
            const allImages = transformedData.map(item => item.imageUrl).filter(Boolean);

            // Preload critical model images immediately for blazing fast display
            WebImagePreloader.getInstance().preloadCritical(criticalImages);

            // Queue the rest for intelligent lazy loading
            WebImagePreloader.getInstance().queuePreload(allImages.slice(6));

            // console.log(`🚀 WEB: Preloading ${criticalImages.length} critical model images, queuing ${allImages.length - 6} for smart lazy load`);
        }
    }, [transformedData]);

    // Optimize filtering with useMemo and early returns
    const filteredData = useMemo(() => {
        if (!transformedData.length) return [];

        const searchTextLower = infoSearchInputText.toLowerCase();
        const [yearMin, yearMax] = filterValues.yearRange;
        const hasFuelTypeFilter = !!filterValues.fuelType;
        const hasChassisFilter = !!filterValues.chassis;
        const hasSeatsFilter = !!filterValues.seats;

        // Early return if no filters are active
        if (!searchTextLower && !hasFuelTypeFilter && !hasChassisFilter &&
            !hasSeatsFilter && yearMin === yearRangeArray[0] && yearMax === yearRangeArray[1]) {
            return transformedData;
        }

        const filtered: CarModelData[] = [];
        const chunkSize = 20; // Process in chunks

        // Process filtering directly without deferring
        for (let i = 0; i < transformedData.length; i += chunkSize) {
            const chunk = transformedData.slice(i, i + chunkSize);
            const filteredChunk = filterDataChunk(
                chunk,
                searchTextLower,
                yearMin,
                yearMax,
                hasFuelTypeFilter,
                hasChassisFilter,
                hasSeatsFilter,
                filterValues
            );
            filtered.push(...filteredChunk);
        }

        return filtered;
    }, [transformedData, infoSearchInputText, filterValues]);

    // Get paginated data
    const getPaginatedData = useCallback(() => {
        if (isDesktopWeb()) {
            return filteredData; // Show all data on desktop web
        }
        const endIndex = currentPage * itemsPerPage;
        return filteredData.slice(0, endIndex);
    }, [filteredData, currentPage, itemsPerPage]);

    const paginatedData = getPaginatedData();
    const hasMoreData = !isDesktopWeb() && paginatedData.length < filteredData.length;

    // Reset pagination when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [infoSearchInputText, filterValues]);



    // Load more data - only for mobile
    const loadMoreData = useCallback(() => {
        if (!isDesktopWeb() && !isLoadingMore && hasMoreData && !finalIsLoading) {
            setIsLoadingMore(true);
            // Simulate loading delay for better UX
            setTimeout(() => {
                setCurrentPage(prev => prev + 1);
                setIsLoadingMore(false);
            }, 100);
        }
    }, [isLoadingMore, hasMoreData, finalIsLoading]);

    // Handle end reached for FlatList - only for mobile
    const handleEndReached = useCallback(() => {
        if (!isDesktopWeb()) {
            loadMoreData();
        }
    }, [loadMoreData]);

    // Create memoized item press handler to avoid recreation on every render
    const handleItemPress = useCallback((item: CarModelData) => {
        // Get the original model data to access C_merke and C_modell
        const originalModel = finalCarModels?.find((model: any) => model.ID === item.id);
        const c_modell = originalModel?.C_modell//originalModel?.C_modell.toLowerCase().replace(/\s+/g, '-')

        // // console.log("item", {
        //     model_id: item.id,
        //     model: item.modelName,
        //     c_modell: originalModel?.C_modell || '',  // Use C_modell from original data
        //     c_merke: originalModel?.C_merke || '',     // Use C_merke from original data
        //     activeLayout: layoutType.toString() // Pass current layout type
        // });
        router.push({
            // pathname: '/(main)/CarBrandSpeceficSubModel',
            pathname: '/(main)/tillverkare/[brand]/[subBrand]',
            params: {
                brand: spacesToHyphens(originalModel?.C_merke || '').toLowerCase(),
                subBrand: spacesToHyphens(c_modell || '')?.toLowerCase(),
                // model_id: item.id,
                // model: item.modelName,
                // c_modell: originalModel?.C_modell || '',  // Use C_modell from original data
                // c_merke: originalModel?.C_merke || '',     // Use C_merke from original data
                activeLayout: layoutType.toString() // Pass current layout type
            } as any
        });
    }, [finalCarModels, router, layoutType]);

    // Add a comprehensive component unmount cleanup
    useEffect(() => {
        const filterRef = filterSlideAnim;
        const fadeRef = fadeAnim;
        const flatlistReference = flatListRef;

        return () => {
            // WEB ONLY: EXTREME image optimization cleanup
            if (isDesktopWeb()) {
                WebImagePreloader.getInstance().clearCache();
                WebLazyImageObserver.disconnect();
                // console.log('🧹 WEB: Cleaned up aggressive image optimization caches');
            }

            // Clear all animations
            filterRef.setValue(0);
            fadeRef.setValue(0);

            // Cleanup refs
            if (flatlistReference.current) {
                // @ts-ignore - force cleanup
                flatlistReference.current = null;
            }

            // Force immediate image cache clearing
            Image.clearMemoryCache();
            cleanupForScreen('CarBrandSpecefic');
            performCacheCleanup();

            // Reset large data structures
            if (filteredData) {
                // @ts-ignore - force array cleanup
                filteredData.length = 0;
            }

            if (transformedData) {
                // @ts-ignore - force array cleanup
                transformedData.length = 0;
            }

            // Reset state without triggering renders
            setIsFilterVisible(false);
            setFilterValues({
                fuelType: null,
                chassis: null,
                seats: null,
                yearRange: yearRangeArray
            });
            setResetFilters(false);
            setBackgroundPressed(false);
            setIsRefreshing(false);
            setDataLoaded(false);
            setIsInitialLoad(true);

            // Reset pagination state
            setCurrentPage(1);
            setIsLoadingMore(false);
        };
    }, [transformedData]); // Added transformedData dependency for better cleanup timing

    // Footer component for loading more indicator
    const renderFooter = useCallback(() => {
        if (isDesktopWeb() || !isLoadingMore) return null;

        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={myColors.primary.main} />
                <MyText style={styles.loadingText}>Laddar fler modeller...</MyText>
            </View>
        );
    }, [isLoadingMore]);

    // Optimize FlatList configuration
    const getItemLayout = useCallback((data: any, index: number) => {
        // Define exact fixed heights based on layout type
        let itemHeight: number;

        switch (layoutType) {
            case 0: // Text layout
                itemHeight = isDesktopWeb() ? 52 : 148; // Compact table row vs mobile
                break;
            case 1: // Grid layout
                itemHeight = isDesktopWeb() ? 84 : 150; // Modern compact desktop vs mobile
                break;
            case 2: // Large grid layout
                itemHeight = 260; // More accurate height for large grid
                break;
            default:
                itemHeight = isDesktopWeb() ? 52 : 148;
        }

        return {
            length: itemHeight,
            offset: itemHeight * index,
            index,
        };
    }, [layoutType]);

    // Optimize FlatList key extractor
    const keyExtractor = useCallback((item: CarModelData) => item.id, []);

    // Optimize ScrollView performance
    const renderScrollView = useCallback((children: React.ReactNode) => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            removeClippedSubviews={true}
            scrollEventThrottle={16}
            decelerationRate="normal"
            contentContainerStyle={{ flexGrow: 1 }}
        >
            {children}
        </ScrollView>
    ), []);

    // Enhanced render item with animation - improve to prevent layout shifts
    const renderItem = useCallback(({ item, index }: { item: CarModelData, index: number }) => {
        const onPress = () => handleItemPress(item);
        const ItemComponent = layoutType === 0 ? LayoutTextView :
            layoutType === 1 ? LayoutGridtView :
                LayoutLargeGridtView;

        // Apply static transformations instead of dynamic ones that could cause layout shifts
        return (
            <View style={{ opacity: dataLoaded ? 1 : 0, marginBottom: isDesktopWeb() ? 5 : 10 }}>
                <ItemComponent item={item} onPress={onPress} index={index} />
            </View>
        );
    }, [layoutType, handleItemPress, dataLoaded]);

    // Handle scroll events
    const handleScroll = useCallback((event: any) => {
        // You can add scroll-based animations here if needed
    }, []);

    const Layouts = () => {
        // Calculate selected background position based on current layout type
        const getSelectedBackgroundStyle = () => {
            const baseStyle = {
                backgroundColor: '#EEF1FB',
                position: 'absolute' as const,
                width: isDesktopWeb() ? 55 : 43,
                height: isDesktopWeb() ? 50 : 40,
                zIndex: 1,
            };

            switch (layoutType) {
                case 0:
                    return {
                        ...baseStyle,
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
                    <SvgXml xml={layoutType === 0 ? ImagePath.SvgIcons.LayoutTextListGridSelectedIcon : ImagePath.SvgIcons.LayoutTextListGridUnselectedIcon} />
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
                    <SvgXml xml={layoutType === 2 ? ImagePath.SvgIcons.LayoutTextListLargeGridSelectedIcon : ImagePath.SvgIcons.LayoutTextListLargeGridUnselectedIcon} />
                </TouchableOpacity>
            </View>
        )
    }

    // Prevent input from losing focus immediately on web when clicking inside ProductSearchBar
    const handleBackgroundPress = useCallback(() => {
        // On native platforms, dismiss the keyboard as before
        if (Platform.OS !== 'web') {
            Keyboard.dismiss();
        }
        // Still mark background press for closing dropdowns, etc.
        setBackgroundPressed(true);
    }, []);

    const HeaderComponent = useMemo(() => {
        // Convert animation value to translateY
        const translateY = filterSlideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, 0] // Start slightly offscreen when hidden
        });

        // Convert animation value to opacity for smoother appearance
        const opacity = filterSlideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
        });

        return (
            <>
                {!isDesktopWeb() && <HeaderWithSearch />}
                {isDesktopWeb() &&
                    <H1 id="hero-title"
                        style={styles.heroTitle}
                        role="heading"
                        ariaLevel={1}
                        itemProp="headline"
                    >
                        Serie
                    </H1>
                }
                {!isDesktopWeb() ?
                    <Animated.View
                        style={[
                            styles.filterContainer,
                            {
                                opacity,
                                transform: [{ translateY }],
                                height: isFilterVisible ? 'auto' : 0,
                                marginTop: isFilterVisible ? 10 : 0,
                                display: isFilterVisible ? 'flex' : 'none',
                            }
                        ]}
                        onLayout={onFilterLayout}
                    >
                        <CarBrandSpeceficFilter
                            selectedFilterValues={filterValues}
                            onFilterChange={handleFilterChange}
                            resetFilters={resetFilters}
                            closeDropdowns={backgroundPressed}
                            isMobileModal={true}
                        />
                        <TouchableOpacity
                            style={styles.resetFilterButton}
                            onPress={handleResetFilters}
                        >
                            <MyText style={styles.resetFilterText}>Återställ filter</MyText>
                        </TouchableOpacity>
                    </Animated.View>
                    : <View></View>
                }
                <View style={[styles.webHeaderContainer, isDesktopWeb() && styles.webHeaderContainerDesktop]}>
                    <View style={[styles.searchContainer, isDesktopWeb() && styles.searchContainerDesktop]}>
                        <View style={[styles.searchBarWrapper, isDesktopWeb() && styles.searchBarWrapperDesktop]}>
                            <ProductSearchBar
                                placeholder="Sök specifik Bilmodell..."
                                value={infoSearchInputText}
                                onChangeText={setInfoSearchInputText}
                                isFilterVisible={isDesktopWeb() ? false : true}
                                filterOnPress={toggleFilter}
                            />
                        </View>
                        {isDesktopWeb() &&
                            <>
                                <View style={[styles.webFilterContainer, styles.webFilterContainerDesktop]}>
                                    <CarBrandSpeceficFilter
                                        selectedFilterValues={filterValues}
                                        onFilterChange={handleFilterChange}
                                        resetFilters={resetFilters}
                                        closeDropdowns={backgroundPressed}
                                    />
                                </View>
                                {/* Reset filter button */}
                                {Platform.OS === 'web' ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 40,
                                            height: 40,
                                            backgroundColor: myColors.white,
                                            borderRadius: 8,
                                            border: `1px solid ${myColors.primary.light3}`,
                                            marginLeft: 4,
                                            cursor: 'pointer',
                                            boxShadow: 'rgba(0, 0, 0, 0.04) 0px 2px 4px',
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                            overflow: 'visible'
                                        }}
                                        onClick={() => handleResetFilters()}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = myColors.primary.light4;
                                            // Create tooltip
                                            const tooltip = document.createElement('div');
                                            tooltip.id = 'reset-tooltip';
                                            tooltip.style.cssText = `
                                                    position: absolute;
                                                    bottom: 50px;
                                                    left: 50%;
                                                    transform: translateX(-50%);
                                                    background: rgba(0, 0, 0, 0.8);
                                                    color: white;
                                                    padding: 8px 12px;
                                                    border-radius: 6px;
                                                    font-size: 12px;
                                                    z-index: 1000;
                                                    white-space: nowrap;
                                                    font-family: Inter;
                                                    font-weight: 600;
                                                `;
                                            tooltip.textContent = 'Återställ filter';
                                            e.currentTarget.appendChild(tooltip);
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = myColors.white;
                                            const tooltip = document.getElementById('reset-tooltip');
                                            if (tooltip) {
                                                tooltip.remove();
                                            }
                                        }}
                                    >
                                        <IconRefresh size={18} color={myColors.primary.main} />
                                    </div>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.resetFilterButtonDesktopSmall}
                                        onPress={handleResetFilters}
                                        activeOpacity={0.7}
                                    >
                                        <IconRefresh size={18} color={myColors.primary.main} />
                                    </TouchableOpacity>
                                )}
                            </>
                        }
                        <View style={[styles.layoutsWrapper, isDesktopWeb() && styles.layoutsWrapperDesktop]}>
                            <Layouts />
                        </View>
                    </View>
                </View>
                {/* Add TableHeader for layout types 0 and 1 on desktop */}
                {isDesktopWeb() && (layoutType === 0 || layoutType === 1) && (
                    <TableHeader filteredDataLength={filteredData.length} layoutType={layoutType} />
                )}
            </>
        );
    }, [
        isFilterVisible,
        filterValues,
        layoutType,
        infoSearchInputText,
        resetFilters,
        backgroundPressed,
        handleFilterChange,
        handleResetFilters,
        filterSlideAnim,
        onFilterLayout,
        filteredData.length
    ]);

    // Loading skeleton component with shimmer effect
    const LoadingSkeleton = useCallback(() => {
        // Use the cached layout type for consistent skeleton rendering
        const currentLayoutType = !isLayoutLoading ? layoutType : cachedLayoutType;

        // Create a looping animation for the shimmer effect
        const shimmerAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            // Start the shimmer animation loop
            Animated.loop(
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.linear
                })
            ).start();

            return () => {
                // Clean up animation when component unmounts
                shimmerAnim.setValue(0);
            };
        }, [shimmerAnim]);

        // Shimmer animation component to reuse across different skeleton layouts
        const ShimmerOverlay = () => (
            <Animated.View
                style={[
                    styles.shimmerOverlay,
                    {
                        transform: [{
                            translateX: shimmerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-200, 200]
                            })
                        }]
                    }
                ]}
            />
        );

        // Text Layout Skeleton (layoutType === 0) - Desktop Table Layout
        const TextLayoutSkeleton = () => {
            if (isDesktopWeb()) {
                return (
                    <View style={styles.carBrandTextItemContainerDesktop}>
                        <View style={styles.carBrandTextRowDesktop}>
                            {/* Model Name Column */}
                            <View style={styles.textModelNameColumnDesktop}>
                                <View style={styles.skeletonTextModelNameDesktop}><ShimmerOverlay /></View>
                            </View>

                            {/* Year Column */}
                            <View style={styles.textYearColumnDesktop}>
                                <View style={styles.skeletonTextYearBadgeDesktop}><ShimmerOverlay /></View>
                            </View>

                            {/* Fuel Types Column */}
                            <View style={styles.textFuelTypesColumnDesktop}>
                                {Array(4).fill(null).map((_, i) => (
                                    <View key={i} style={styles.skeletonTextFuelIconDesktop}><ShimmerOverlay /></View>
                                ))}
                            </View>

                            {/* Body Types Column */}
                            <View style={styles.textBodyTypesColumnDesktop}>
                                {Array(2).fill(null).map((_, i) => (
                                    <View key={i} style={styles.skeletonTextBodyTypeBadgeDesktop}><ShimmerOverlay /></View>
                                ))}
                            </View>

                            {/* Engine Types Column */}
                            <View style={styles.textEngineTypesColumnDesktop}>
                                {Array(2).fill(null).map((_, i) => (
                                    <View key={i} style={styles.skeletonTextEngineTypeBadgeDesktop}><ShimmerOverlay /></View>
                                ))}
                            </View>

                            {/* Seats Column */}
                            <View style={[styles.textSeatsColumnDesktop, { left: 1080 }]}>
                                <View style={styles.skeletonTextSeatsBadgeDesktop}><ShimmerOverlay /></View>
                            </View>
                        </View>
                    </View>
                );
            }

            // Mobile Layout
            return (
                <View style={styles.carBrandItemContainer}>
                    <View style={styles.skeletonTitleContainer}>
                        <View style={styles.skeletonTitle}><ShimmerOverlay /></View>
                    </View>
                    <View style={styles.carBrandItemContent}>
                        <View style={{ width: '100%' }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <View style={styles.carModelInfoRowContainer}>
                                    {Array(3).fill(null).map((_, i) => (
                                        <View key={i} style={styles.skeletonFuelIcon}><ShimmerOverlay /></View>
                                    ))}
                                </View>
                            </ScrollView>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <View style={styles.bodyTypeContainer}>
                                    {Array(2).fill(null).map((_, i) => (
                                        <View key={i} style={styles.skeletonBodyType}><ShimmerOverlay /></View>
                                    ))}
                                </View>
                            </ScrollView>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <View style={styles.engineTypeContainer}>
                                    {Array(2).fill(null).map((_, i) => (
                                        <View key={i} style={styles.skeletonEngineType}><ShimmerOverlay /></View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </View>
            );
        };

        // Grid Layout Skeleton (layoutType === 1) - Desktop New Layout
        const GridLayoutSkeleton = () => {
            if (isDesktopWeb()) {
                return (
                    <View style={styles.carBrandItemContainerDesktopNew}>
                        <View style={styles.carBrandItemWrapperDesktopNew}>
                            {/* Image Section */}
                            <View style={[styles.carBrandImageDesktopNew, { backgroundColor: myColors.screenBackgroundColor }]}>
                                <ShimmerOverlay />
                            </View>

                            {/* Content Section - Middle */}
                            <View style={styles.layoutType1MiddleContainer}>
                                <View style={styles.carBrandItemContentDesktopNew}>
                                    {/* Model Title */}
                                    <View style={styles.skeletonGridModelNameDesktop}><ShimmerOverlay /></View>

                                    {/* Body Types and Engine Types Row */}
                                    <View style={styles.bodyEngineTypesRowDesktopNew}>
                                        {Array(3).fill(null).map((_, i) => (
                                            <View key={i} style={styles.skeletonGridBodyEngineTypeBadgeDesktop}><ShimmerOverlay /></View>
                                        ))}
                                    </View>

                                    {/* Fuel Types Row */}
                                    <View style={styles.fuelTypesRowDesktopNew}>
                                        {Array(4).fill(null).map((_, i) => (
                                            <View key={i} style={styles.skeletonGridFuelIconDesktop}><ShimmerOverlay /></View>
                                        ))}
                                    </View>
                                </View>

                                {/* Stats Section - Right */}
                                <View style={styles.statsColumnDesktopNew}>
                                    {/* Year Range */}
                                    <View style={styles.skeletonGridStatBadgeDesktop}><ShimmerOverlay /></View>
                                    {/* Seats */}
                                    <View style={styles.skeletonGridStatBadgeDesktop}><ShimmerOverlay /></View>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            }

            // Mobile Layout
            return (
                <View style={styles.carBrandItemContainer}>
                    <View style={styles.skeletonTitleContainer}>
                        <View style={styles.skeletonTitle}><ShimmerOverlay /></View>
                    </View>
                    <View style={styles.carBrandItemContent}>
                        <View style={[styles.carBrandImage, { backgroundColor: myColors.screenBackgroundColor }]}>
                            <ShimmerOverlay />
                        </View>
                        <View style={{ width: '70%' }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <View style={styles.carModelInfoRowContainer}>
                                    {Array(3).fill(null).map((_, i) => (
                                        <View key={i} style={styles.skeletonFuelIcon}><ShimmerOverlay /></View>
                                    ))}
                                </View>
                            </ScrollView>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <View style={styles.bodyTypeContainer}>
                                    {Array(2).fill(null).map((_, i) => (
                                        <View key={i} style={styles.skeletonBodyType}><ShimmerOverlay /></View>
                                    ))}
                                </View>
                            </ScrollView>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <View style={styles.engineTypeContainer}>
                                    {Array(2).fill(null).map((_, i) => (
                                        <View key={i} style={styles.skeletonEngineType}><ShimmerOverlay /></View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </View>
            );
        };

        // Large Grid Layout Skeleton (layoutType === 2)
        const LargeGridLayoutSkeleton = () => (
            <View style={styles.carBrandItemContainerLargeGrid}>
                <View>
                    <View style={[styles.carBrandImageLargeGrid, { backgroundColor: myColors.screenBackgroundColor }]}>
                        <ShimmerOverlay />
                    </View>
                    <View style={styles.carBrandItemContentLargeGrid}>
                        <View style={styles.skeletonTitle}><ShimmerOverlay /></View>
                        <View style={{ width: '100%' }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                                style={isDesktopWeb() ? styles.desktopWebExtraSpace : {}}
                            >
                                <View style={styles.bodyTypeContainer}>
                                    {Array(3).fill(null).map((_, i) => (
                                        <View key={i} style={styles.skeletonBodyType}><ShimmerOverlay /></View>
                                    ))}
                                </View>
                            </ScrollView>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <View style={styles.carModelInfoRowContainer}>
                                    {Array(4).fill(null).map((_, i) => (
                                        <View key={i} style={styles.skeletonFuelIcon}><ShimmerOverlay /></View>
                                    ))}
                                </View>
                            </ScrollView>
                            <View style={{ height: 1, backgroundColor: myColors.screenBackgroundColor, marginVertical: 15 }}></View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                removeClippedSubviews={true}
                            >
                                <View style={styles.engineTypeContainer}>
                                    {Array(2).fill(null).map((_, i) => (
                                        <View key={i} style={styles.skeletonEngineType}><ShimmerOverlay /></View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </View>
        );

        // Select the appropriate skeleton based on layout type
        const SkeletonComponent =
            currentLayoutType === 0 ? TextLayoutSkeleton :
                currentLayoutType === 1 ? GridLayoutSkeleton :
                    LargeGridLayoutSkeleton;

        // Different layout containers based on layoutType
        if (currentLayoutType === 2) {
            // Large Grid layout - items in a vertical list
            return (
                <View style={{ flexDirection: isDesktopWeb() ? "row" : "column", flexWrap: "wrap", gap: 10 }}>
                    {Array(4).fill(null).map((_, index) => (
                        <SkeletonComponent key={index} />
                    ))}
                </View>
            );
        } else {
            // Standard vertical list for other layouts
            return (
                <View>
                    {Array(5).fill(null).map((_, index) => (
                        <SkeletonComponent key={index} />
                    ))}
                </View>
            );
        }
    }, [layoutType, isLayoutLoading, cachedLayoutType]);

    // Initial loading component that shows while layout type is being determined
    const InitialLoadingComponent = useCallback(() => (
        <View style={styles.initialLoadingContainer}>
            <ActivityIndicator size="large" color={myColors.primary.main} />
        </View>
    ), []);

    // Error component with retry functionality
    const ErrorComponent = useCallback(() => (
        <View style={styles.errorContainer}>
            <MyText style={styles.errorText}>Ett fel uppstod vid laddning av bilmodeller</MyText>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRefresh}
                activeOpacity={0.7}
            >
                <MyText style={styles.retryButtonText}>Försök igen</MyText>
            </TouchableOpacity>
        </View>
    ), [handleRefresh]);

    return (
        <>

            <TouchableWithoutFeedback onPress={handleBackgroundPress}>
                <View style={styles.container}>
                    <Stack.Screen options={{ headerShown: false }} />

                    {
                        !isLayoutTypeReady ? (
                            <InitialLoadingComponent />
                        ) : (
                            isDesktopWeb() ? (
                                <FooterWrapper
                                    showsVerticalScrollIndicator={false}
                                    style={styles.content}
                                    contentContainerStyle={styles.scrollViewContent}
                                >
                                    <View style={{ paddingBottom: 100 }}>
                                        <DesktopViewWrapper>
                                            <FlatList<CarModelData>
                                                ref={flatListRef}
                                                data={isLayoutLoading ? [] : paginatedData}
                                                renderItem={renderItem}
                                                ListHeaderComponent={HeaderComponent}
                                                ListFooterComponent={renderFooter}
                                                keyExtractor={(item, idx) => idx.toString()}
                                                showsVerticalScrollIndicator={false}
                                                contentContainerStyle={styles.listContent}
                                                ListEmptyComponent={
                                                    isCarModelsLoading ? <LoadingSkeleton /> :
                                                        error ? <ErrorComponent /> :
                                                            (infoSearchInputText.trim() || filterValues.fuelType || filterValues.chassis || filterValues.seats || (filterValues.yearRange && (filterValues.yearRange[0] !== yearRangeArray[0] || filterValues.yearRange[1] !== yearRangeArray[1]))) ?
                                                                <NoSearchResultsComponent /> :
                                                                <ListEmptyView message="Inga bilmodeller hittades" />
                                                }
                                                initialNumToRender={isDesktopWeb() ? 100 : itemsPerPage}
                                                onEndReachedThreshold={0.1}
                                                refreshing={isRefreshing}
                                                onRefresh={handleRefresh}
                                                keyboardShouldPersistTaps="handled"
                                                onEndReached={handleEndReached}
                                                removeClippedSubviews={!isDesktopWeb()}
                                                maxToRenderPerBatch={isDesktopWeb() ? 100 : itemsPerPage}
                                                windowSize={isDesktopWeb() ? 10 : 5}
                                                scrollEnabled={true}
                                                nestedScrollEnabled={true}
                                                numColumns={isDesktopWeb() && layoutType === 2 ? 4 : 1}
                                                key={`${layoutType}-${isDesktopWeb() ? 'desktop' : 'mobile'}`}
                                                columnWrapperStyle={isDesktopWeb() && layoutType === 2 ? styles.gridRowResponsive : undefined}
                                                style={{ minHeight: isDesktopWeb() ? 500 : 150 }}
                                            />
                                        </DesktopViewWrapper>
                                    </View>
                                </FooterWrapper>
                            ) : (
                                <View style={styles.content} pointerEvents="box-none">
                                    <DesktopViewWrapper>
                                        <FlatList<CarModelData>
                                            ref={flatListRef}
                                            data={isLayoutLoading ? [] : paginatedData}
                                            renderItem={renderItem}
                                            ListHeaderComponent={HeaderComponent}
                                            ListFooterComponent={() => (
                                                <View>
                                                    {renderFooter()}
                                                    <MyText style={styles.footerText}>© {currentYear} Bilregistret.ai | Alla rättigheter reserverade Bilregistret Sverige AB {"\n"}Ansvarig utgivare: Alen Rasic, databasens namn: bilregistret.ai</MyText>
                                                </View>
                                            )}
                                            keyExtractor={(item, idx) => idx.toString()}
                                            showsVerticalScrollIndicator={false}
                                            contentContainerStyle={styles.listContent}
                                            ListEmptyComponent={
                                                isCarModelsLoading ? <LoadingSkeleton /> :
                                                    error ? <ErrorComponent /> :
                                                        (infoSearchInputText.trim() || filterValues.fuelType || filterValues.chassis || filterValues.seats || (filterValues.yearRange && (filterValues.yearRange[0] !== yearRangeArray[0] || filterValues.yearRange[1] !== yearRangeArray[1]))) ?
                                                            <NoSearchResultsComponent /> :
                                                            <ListEmptyView message="Inga bilmodeller hittades" />
                                            }
                                            initialNumToRender={isDesktopWeb() ? 100 : itemsPerPage}
                                            onEndReachedThreshold={0.1}
                                            refreshing={isRefreshing}
                                            onRefresh={handleRefresh}
                                            keyboardShouldPersistTaps="handled"
                                            onEndReached={handleEndReached}
                                            removeClippedSubviews={!isDesktopWeb()}
                                            maxToRenderPerBatch={isDesktopWeb() ? 100 : itemsPerPage}
                                            windowSize={isDesktopWeb() ? 10 : 5}
                                            scrollEnabled={true}
                                            nestedScrollEnabled={true}
                                        />
                                    </DesktopViewWrapper>
                                </View>
                            )
                        )
                    }
                </View>
            </TouchableWithoutFeedback>
        </>
    );
}

export default CarBrand;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
    },
    content: {
        flex: 1,
        paddingBottom: isDesktopWeb() ? 0 : 0,
    },
    carBrandItemContainer: {
        backgroundColor: myColors.white,
        borderRadius: 8,
        paddingHorizontal: 8,
        // paddingVertical: 5,
        paddingTop: 10,
        // marginBottom: 10,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    carBrandItemContainerLargeGrid: {
        backgroundColor: myColors.white,
        borderRadius: 8,
        padding: isDesktopWeb() ? 8 : 5,
        marginBottom: 15,
        marginHorizontal: isDesktopWeb() ? 4 : 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flex: 1,
        // minWidth: isDesktopWeb() ? 270 : undefined,
        // maxWidth: isDesktopWeb() ? 320 : undefined,
        // width: isDesktopWeb() ? 300 : undefined,
        width: isDesktopWeb() ? 280 : undefined,
    },
    carModelName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    carModelNameLargeGrid: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    carBrandItemContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    carBrandItemContentLargeGrid: {
        padding: 5,
    },
    carBrandImage: {
        width: 110,
        height: 95,
        marginRight: 3,
        borderRadius: 10,
    },
    carBrandImageLargeGrid: {
        width: "100%",
        aspectRatio: isDesktopWeb() ? 1.8 : 1.8, // Similar to padding-top: 55% for responsive aspect ratio
        marginBottom: 8,
        marginRight: 0,
        borderRadius: 6,
        position: 'relative',
        overflow: 'hidden',
    },
    carModelInfoRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 5,
    },
    carModelInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.screenBackgroundColor,
        paddingHorizontal: 5,
        borderRadius: 6,
        marginRight: 3,
        marginBottom: 10,//5,
        height: 25,
    },
    carInfoText: {
        marginLeft: 5,
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: isDesktopWeb() ? 16 : 0,
        maxWidth: isDesktopWeb() ? 1200 : undefined,
        alignSelf: isDesktopWeb() ? 'center' : undefined,
        width: isDesktopWeb() ? '100%' : undefined,
    },
    bodyTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        width: '100%',
    },
    engineTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        // width: '100%',
    },
    webHeaderContainer: {
        // borderTopWidth: isDesktopWeb() ? 1 : 0,
        // borderBottomWidth: isDesktopWeb() ? 1 : 0,
        borderColor: myColors.border.default,
        marginHorizontal: isDesktopWeb() ? 15 : 0,
        marginVertical: isDesktopWeb() ? 5 : 0
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
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
        backgroundColor: myColors.white,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        marginLeft: 5,
    },
    resetFilterButton: {
        alignSelf: 'flex-end',
        paddingVertical: 6,
        paddingHorizontal: 15,
        marginBottom: 10,
        backgroundColor: myColors.primary.light3,
        borderRadius: 10,
    },
    resetFilterText: {
        color: myColors.primary.main,
        fontWeight: '500',
    },
    resultsCountContainer: {
        marginBottom: 10,
    },
    resultsCountText: {
        fontSize: 14,
        color: myColors.text.secondary,
    },
    filterContainer: {
        marginHorizontal: 15,
        zIndex: 1000,
    },
    skeletonContainer: {
        padding: 15,
    },
    skeletonItem: {
        flexDirection: 'row',
        backgroundColor: myColors.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    skeletonContent: {
        flex: 1,
    },
    skeletonTitleContainer: {
        marginBottom: 10,
    },
    skeletonTitle: {
        height: 20,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        width: '70%',
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    skeletonIcon: {
        width: 20,
        height: 20,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        marginHorizontal: 2.5,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonTag: {
        width: 50,
        height: 16,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        marginRight: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: myColors.text.secondary,
        textAlign: 'center',
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
    initialLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 300,
    },
    skeletonFuelIcon: {
        width: 25,
        height: 26,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        marginHorizontal: 2.5,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonBodyType: {
        width: 70,
        height: 17,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 6,
        marginRight: 3,
        marginBottom: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonEngineType: {
        width: 60,
        height: 17,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 6,
        marginRight: 3,
        marginBottom: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    loadingFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: '500',
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
    webFilterContainer: {
        flex: 2,
        marginBottom: -10,
        marginEnd: 10
    },
    cardContent: {
        flex: 1,
        height: '100%',
    },
    cardHeader: {
        paddingHorizontal: 4,
        paddingVertical: 2,
        marginBottom: 6,
    },
    yearRangeLargeGrid: {
        fontSize: 14,
        color: myColors.text.secondary,
        fontWeight: '400',
    },
    infoRowLargeGrid: {
        paddingHorizontal: 4,
        marginBottom: 4,
    },
    bodyTypeContainerLargeGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    bodyTypeTextLargeGrid: {
        fontSize: 14,
        color: myColors.text.primary,
        marginRight: 2,
    },
    separatorText: {
        fontSize: 14,
        color: myColors.text.secondary,
        marginHorizontal: 2,
    },
    seatsTextLargeGrid: {
        fontSize: 14,
        color: myColors.text.primary,
        marginLeft: 4,
    },
    fuelTypesRowLargeGrid: {
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    statsRowLargeGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 4,
        paddingTop: 6,
        marginTop: 'auto',
        borderTopWidth: 1,
        borderTopColor: myColors.border.light,
    },
    statsLeftLargeGrid: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsIcon: {
        width: 16,
        height: 16,
        marginRight: 4,
    },
    statsText: {
        fontSize: 14,
        color: myColors.text.primary,
        fontWeight: '500',
    },
    gridRow: {
        justifyContent: 'space-between',
        paddingHorizontal: 0,
    },
    // Responsive Header Styles
    webHeaderContainerDesktop: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        // paddingHorizontal: 20,
    },
    searchContainerDesktop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
    },
    searchBarWrapper: {
        flex: 1,
        minWidth: 200,
    },
    searchBarWrapperDesktop: {
        flex: 2,
        maxWidth: 400,
        minWidth: 300,
    },
    webFilterContainerDesktop: {
        flex: 3.4,
        minWidth: 300,
        marginRight: -4,
    },
    layoutsWrapper: {
        flexShrink: 0,
    },
    layoutsWrapperDesktop: {
        flexShrink: 0,
        minWidth: 110,
    },
    // Responsive Grid Styles
    gridRowResponsive: {
        justifyContent: 'flex-start',
        paddingHorizontal: 8,
        gap: 8,
    },

    // Desktop Web Grid Layout Styles - Modern Compact
    carBrandItemContainerDesktop: {
        backgroundColor: myColors.white,
        borderRadius: 12,
        padding: 0,
        marginBottom: 4,
        marginHorizontal: 4,
        shadowColor: 'rgba(0, 0, 0, 0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 1,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.04)',
    },
    carBrandItemWrapperDesktop: {
        flexDirection: 'row',
        height: 80,
    },
    carBrandImageDesktop: {
        width: 110,
        height: '100%',
        backgroundColor: '#f8f9fa',
        overflow: 'hidden',
    },
    carBrandItemContentDesktop: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 12,
        justifyContent: 'center',
    },
    carModelHeaderDesktop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    carModelNameDesktop: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        flex: 1,
        marginRight: 8,
        lineHeight: 16,
        letterSpacing: -0.2,
    },
    yearBadgeDesktop: {
        backgroundColor: '#f0f4ff',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        minWidth: 50,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e1e8ff',
    },
    yearTextDesktop: {
        fontSize: 9,
        fontWeight: '600',
        color: '#4f46e5',
        letterSpacing: 0.2,
    },
    fuelTypesRowDesktop: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 4,
        minHeight: 18,
        top: -20,
    },
    fuelIconDesktop: {
        marginRight: 3,
        // width: 25,
        height: 25,
        opacity: 0.9,
    },
    moreIndicatorDesktop: {
        fontSize: 8,
        color: '#64748b',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
        marginLeft: 2,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    infoRowDesktop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 0,
        width: '100%',
    },
    bodyTypesWrapperDesktop: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        flexWrap: 'wrap',
        marginRight: 6,
    },
    bodyTypeBadgeDesktop: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 3,
        marginBottom: 0,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    bodyTypeTextDesktop: {
        fontSize: 9,
        color: '#374151',
        fontWeight: '500',
        letterSpacing: 0.1,
    },
    seatsInfoDesktop: {
        backgroundColor: '#fff7ed',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#fed7aa',
        flexShrink: 0,
        minWidth: 45,
    },
    seatsTextDesktop: {
        fontSize: 9,
        color: '#ea580c',
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    statsRowDesktop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
        width: '100%',
    },
    registeredCarsDesktop: {
        flex: 1,
        marginRight: 6,
    },
    registeredCarsTextDesktop: {
        fontSize: 9,
        color: '#64748b',
        fontWeight: '500',
        letterSpacing: 0.1,
        flexShrink: 1,
    },
    engineTypeBadgeDesktop: {
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#bbf7d0',
        flexShrink: 0,
        maxWidth: 60,
        marginLeft: 5,
    },
    engineTypeTextDesktop: {
        fontSize: 8,
        color: '#059669',
        fontWeight: '600',
        letterSpacing: 0.1,
    },

    // Desktop Web Text Layout Styles - New Layout Type 0 Design
    carBrandTextItemContainerDesktop: {
        width: '100%',
        height: 66,
        backgroundColor: 'white',
        borderRadius: 6,
        marginBottom: 4,
        marginHorizontal: 4,
        shadowColor: 'rgba(0, 0, 0, 0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 1,
        overflow: 'hidden',
        maxWidth: 1200,
        alignSelf: 'center',
        position: 'relative',
    },
    carBrandTextRowDesktop: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        position: 'relative',
    },
    textModelNameColumnDesktop: {
        position: 'absolute',
        left: 20,
        // top: 27,
        width: 230,
    },
    textModelNameDesktop: {
        color: '#181818',
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: '700',
        textTransform: 'capitalize',
        lineHeight: 24,
    },
    textYearColumnDesktop: {
        position: 'absolute',
        left: 251,
        top: 20,
    },
    textYearBadgeDesktop: {
        paddingLeft: 7,
        paddingRight: 7,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        height: 25,
    },
    textYearTextDesktop: {
        textAlign: 'right',
        color: '#181818',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        textTransform: 'uppercase',
        lineHeight: 20,
    },
    textFuelTypesColumnDesktop: {
        position: 'absolute',
        left: 370,
        // top: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    textFuelIconDesktop: {
        marginRight: 4,
        width: 20,
        height: 20,
        opacity: 0.9,
    },
    textFuelBadgeDesktop: {
        width: 50,
        padding: 8,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    textFuelTextDesktop: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        lineHeight: 28,
    },
    textMoreIndicatorDesktop: {
        fontSize: 9,
        color: '#64748b',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 2,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    textBodyTypesColumnDesktop: {
        position: 'absolute',
        left: 694,
        // top: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        height: 25,
    },
    textBodyTypeBadgeDesktop: {
        paddingLeft: 7,
        paddingRight: 7,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        height: 25,
    },
    textBodyTypeTextDesktop: {
        color: '#181818',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        lineHeight: 18,
    },
    textEngineTypesColumnDesktop: {
        position: 'absolute',
        left: 924,
        top: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    textEngineTypeBadgeDesktop: {
        paddingLeft: 7,
        paddingRight: 7,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        height: 25,
    },
    textEngineTypeTextDesktop: {
        color: '#181818',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        lineHeight: 18,
    },
    textRegisteredColumnDesktop: {
        position: 'absolute',
        left: 1099,
        top: 15,
    },
    textRegisteredBadgeDesktop: {
        paddingLeft: 7,
        paddingRight: 7,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        flexDirection: 'row',
    },
    textRegisteredTextDesktop: {
        textAlign: 'right',
        color: '#181818',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        textTransform: 'uppercase',
        lineHeight: 20,
    },
    textSeatsColumnDesktop: {
        position: 'absolute',
        left: 1203,
        // top: 15,
    },
    textSeatsBadgeDesktop: {
        paddingLeft: 7,
        paddingRight: 7,
        // paddingTop: 8,
        // paddingBottom: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        flexDirection: 'row',
        height: 25,
    },
    textSeatsTextDesktop: {
        textAlign: 'right',
        color: '#181818',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        textTransform: 'uppercase',
        lineHeight: 20,
    },
    textStatIconDesktop: {
        width: 20,
        height: 20,
        opacity: 0.6,
    },
    heroTitle: {
        fontSize: isDesktopWeb() ? 36 : 28,
        fontWeight: '400',
        color: '#262524',
        lineHeight: isDesktopWeb() ? 50 : 40,
        // marginBottom: 30,
        fontFamily: 'Poppins',
        marginTop: 10,
        textAlign: isDesktopWeb() ? 'left' : 'center',
    },
    desktopWebExtraSpace: {
        marginBottom: 10,
    },
    tableHeaderContainer: {
        width: '100%',
        height: 45,
        position: 'relative',
        backgroundColor: '#E6E6F1',
        borderRadius: 10,
        marginBottom: 10,
        marginHorizontal: 4,
        maxWidth: 1200,
        alignSelf: 'center',
    },
    tableHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    tableHeaderLeft: {
        flex: 1,
        justifyContent: 'center',
    },
    tableHeaderTitle: {
        color: '#262524',
        fontSize: 13,
        fontFamily: 'Inter',
        fontWeight: '700',
        lineHeight: 24,
    },
    tableHeaderRight: {
        width: 172,//282,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    tableHeaderColumn: {
        width: 86,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableHeaderColumnText: {
        textAlign: 'center',
        color: '#262524',
        fontSize: 13,
        fontFamily: 'Inter',
        fontWeight: '700',
        lineHeight: 24,
    },
    tableHeaderDivider: {
        width: 17,
        height: 1,
        backgroundColor: 'rgba(158, 166, 186, 0.40)',
        transform: [{ rotate: '90deg' }],
    },

    // New Layout 1 Desktop Styles - Based on provided design
    carBrandItemContainerDesktopNew: {
        width: '100%',
        height: 134,
        backgroundColor: 'white',
        borderRadius: 6,
        marginBottom: 4,
        marginHorizontal: 4,
        shadowColor: 'rgba(0, 0, 0, 0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 1,
        overflow: 'hidden',
        maxWidth: 1200,
        alignSelf: 'center',
    },
    carBrandItemWrapperDesktopNew: {
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 6,
    },
    carBrandImageDesktopNew: {
        width: 236,
        height: 122,
        backgroundColor: '#f8f9fa',
        borderRadius: 6,
        overflow: 'hidden',
    },
    carBrandItemContentDesktopNew: {
        // width: 266,
        paddingLeft: 20,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 23,
    },
    carModelNameDesktopNew: {
        color: '#181818',
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: '700',
        textTransform: 'capitalize',
        lineHeight: 24,
        alignSelf: 'stretch',
    },
    bodyEngineTypesRowDesktopNew: {
        alignSelf: 'stretch',
        // overflow: 'hidden',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 5,
        flexDirection: 'row',
        top: -13,
        // flexWrap: 'wrap',
    },
    bodyEngineTypeBadgeDesktopNew: {
        paddingLeft: 7,
        paddingRight: 7,
        // paddingTop: 8,
        // paddingBottom: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        height: 25
    },
    bodyEngineTypeTextDesktopNew: {
        color: '#181818',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        lineHeight: 18,
    },
    fuelTypesRowDesktopNew: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 5,
        flexDirection: 'row',
    },
    fuelTypeBadgeDesktopNew: {
        width: 50,
        padding: 8,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    fuelTypeTextDesktopNew: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        lineHeight: 28,
    },
    statsColumnDesktopNew: {
        // width: 324,
        // position: 'absolute',
        // right: 0,
        marginRight: 15,
        // top: 49,
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 15,
        flexDirection: 'row',
        top: -10,
    },
    statItemDesktopNew: {
        paddingLeft: 7,
        paddingRight: 7,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        flexDirection: 'row',
        height: 25
    },
    statIconDesktopNew: {
        width: 20,
        height: 20,
        opacity: 0.6,
    },
    statTextDesktopNew: {
        textAlign: 'right',
        color: '#181818',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        textTransform: 'uppercase',
        lineHeight: 20,
    },
    layoutType1MiddleContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: "center",
    },

    // Layout Type 0 Table Header Styles
    tableHeaderContentLayout0: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    tableHeaderLeftLayout0: {
        position: 'absolute',
        left: 20,
        justifyContent: 'center',
    },
    tableHeaderColumnLayout0: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        // top: 18,
    },
    tableHeaderDividerLayout0: {
        width: 17,
        height: 1,
        backgroundColor: 'rgba(158, 166, 186, 0.40)',
        transform: [{ rotate: '90deg' }],
        position: 'absolute',
    },
    noSearchResultsContainer: {
        width: isDesktopWeb() ? '100%' : '90%',
        paddingHorizontal: 40,
        paddingVertical: 16,
        backgroundColor: 'rgba(255, 72.87, 56.31, 0.10)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FF4938',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        alignSelf: 'center',
        // maxWidth: 400,
        flex: 1,
    },
    noSearchResultsText: {
        textAlign: 'center',
        color: '#FF4938',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '700',
        lineHeight: 20,
    },

    // Desktop Skeleton Styles for Layout Type 0 (Text Layout)
    skeletonTextModelNameDesktop: {
        height: 20,
        width: 200,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonTextYearBadgeDesktop: {
        height: 25,
        width: 70,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 6,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonTextFuelIconDesktop: {
        height: 25,
        width: 25,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        marginRight: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonTextBodyTypeBadgeDesktop: {
        height: 25,
        width: 60,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 6,
        marginRight: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonTextEngineTypeBadgeDesktop: {
        height: 25,
        width: 50,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 6,
        marginRight: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonTextSeatsBadgeDesktop: {
        height: 25,
        width: 80,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 6,
        position: 'relative',
        overflow: 'hidden',
    },

    // Desktop Skeleton Styles for Layout Type 1 (Grid Layout)
    skeletonGridModelNameDesktop: {
        height: 24,
        width: '100%',
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonGridBodyEngineTypeBadgeDesktop: {
        height: 25,
        width: 60,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 6,
        marginRight: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonGridFuelIconDesktop: {
        height: 25,
        width: 25,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        marginRight: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonGridStatBadgeDesktop: {
        height: 25,
        width: 70,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 6,
        position: 'relative',
        overflow: 'hidden',
    },

    // Desktop Reset Filter Button Styles
    resetFilterButtonDesktop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: myColors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: myColors.primary.light3,
        minWidth: 120,
        height: 48,
        shadowColor: 'rgba(0, 0, 0, 0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
        marginLeft: 4,
    },
    resetFilterButtonDesktopSmall: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        backgroundColor: myColors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: myColors.primary.light3,
        shadowColor: 'rgba(0, 0, 0, 0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
        marginLeft: 4,
    },

    resetFilterTextDesktop: {
        fontSize: 14,
        fontWeight: '600',
        color: myColors.primary.main,
        fontFamily: 'Inter',
    },
});