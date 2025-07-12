import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Animated,
    StatusBar as RNStatusBar,
    Platform,
    TextInput,
    ActivityIndicator,
    Linking,
    FlatList,
    Easing,
    ViewStyle,
    ImageStyle,
    TextStyle,
    StyleProp,
    Image as RNImage
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams, Stack, router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { ImagePath } from '@/assets/images';
import { LinearGradient } from 'expo-linear-gradient';
import PopupMenu from '@/components/menu/PopupMenu';
import ProfilePopupMenu from '@/components/menu/ProfilePopupMenu';
import { CarDetailsList } from '@/constants/commonConst';
import FavoriteListPopup from '@/components/menu/FavoriteListPopup';
import { useVehicleData } from '@/Services/api/hooks/carSearch.hooks';
import {
    useDrivknutenProducts,
    useSkruvatProducts,
    useMekonomenProducts,
    useDacklineProductSearch,
    useTickoProducts,
} from '@/Services/api/hooks/productSearch.hooks';

import { useSectionState } from '@/Services/api/hooks/sectionState.hooks';
import { useAuth } from '@/Services/api/context/auth.context';
import { useUserRole } from '@/Services/api/hooks/useUserRole';
import { CarSearchData } from '@/Services/api/types/car.types';
import moment from 'moment';
import { useGarages, isCarInGarage } from '@/Services/api/hooks/garage.hooks';
import KeyboardAvoidingWrapper from '@/components/common/KeyboardAvoidingWrapper';
import NoResultsComponent from '@/components/common/NoResultsComponent';
import TrailerCalculator from '@/components/TrailerCalculator';
import {
    normalizeMekonomenProducts,
    normalizeSkruvatProducts,
    normalizeDrivknutenProducts,
    normalizeDacklineProducts,
    normalizeTickoProducts,
    NormalizedProduct
} from '@/utils/carDataUtils';
import { cleanupForScreen } from '@/utils/cacheUtils';
import { performCacheCleanup } from '@/Services/api/utils/cacheManager';
import { isDesktopWeb, isMobileWeb } from '@/utils/deviceInfo';
import { desktopWebViewport } from '@/constants/commonConst';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import MobileHeader from '@/components/carDetails/MobileHeader';
import DesktopHeader from '@/components/carDetails/DesktopHeader';
import { createWebStyles, shouldUseNativeDriver } from '@/utils/shadowHelper';
import { IconChevronDown, IconChevronUp, IconCloseCircle, IconExternalLink, IconSearch } from '@/assets/icons';
import { CarDetailsSEO } from '@/components/seo';

// Use FlashList for smoother horizontal lists on native
import { FlashList } from '@shopify/flash-list';
import SafeSvgXml from '@/components/common/SafeSvgXml';
import BilvarderingPro from '@/components/BilvarderingPro';

const { width: windowWidth } = Dimensions.get('window');
const width = isDesktopWeb() ? desktopWebViewport : windowWidth;
let LocalCarDetailsList = CarDetailsList;

// Define types for the CarDetailSection component
interface CarDetailSectionProps {
    title: string;
    initiallyOpen?: boolean;
    children: React.ReactNode;
}

const LoginButtonKeyMapper = "guest_login";
// Add this type definition after the CarDetailSectionProps interface
type TabType = 'Biluppgifter' | 'Produktinfo' | 'Bildelar' | 'Statistik' | 'Släpvagnskalkylator';

// Car detail section component with collapsible functionality
const CarDetailSection: React.FC<CarDetailSectionProps> = ({ title, initiallyOpen = false, children }) => {
    const { isOpen, isLoading, toggleState } = useSectionState({
        sectionKey: `car_detail_section_${title}`,
        defaultState: title === 'Biluppgifter' || title === 'Fordonsinformation' ? true : initiallyOpen,
        dataVersion: '1.0' // Update this when the data structure changes
    });

    // Add animation for chevron rotation
    const chevronRotateAnim = useRef(new Animated.Value(isOpen ? 0 : 1)).current;
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize animation state
    useEffect(() => {
        if (!isLoading && !isInitialized) {
            setIsInitialized(true);
            // Set initial rotation value without animation
            chevronRotateAnim.setValue(isOpen ? 0 : 1);
        }
    }, [isLoading, isInitialized, isOpen]);

    // Handle animated transitions when expanded state changes (only after initialization)
    useEffect(() => {
        if (!isInitialized) return;

        const duration = 200;
        const easing = Easing.out(Easing.cubic);

        Animated.timing(chevronRotateAnim, {
            toValue: isOpen ? 0 : 1,
            duration,
            easing,
            useNativeDriver: shouldUseNativeDriver(),
        }).start();
    }, [isOpen, isInitialized]);

    // Interpolate rotation animation
    const chevronRotation = chevronRotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-90deg'], // 0deg = pointing down (expanded), -90deg = pointing right (collapsed)
    });
    
    if (isLoading) {
        return (
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <MyText fontFamily="Poppins" style={styles.sectionTitle}>{title}</MyText>
                    <ActivityIndicator size="small" color={myColors.black} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.sectionContainer}>
            <TouchableOpacity
                style={styles.sectionHeader}
                onPress={toggleState}
                activeOpacity={0.8}
            >
                <MyText fontFamily="Poppins" style={styles.sectionTitle}>{title}</MyText>
                {isInitialized && (
                    <Animated.View
                        style={{
                            transform: [{ rotate: chevronRotation }],
                        }}
                    >
                        {/* <Entypo
                            name="chevron-down"
                            size={isDesktopWeb() ? 26 : 20}
                            color={myColors.black}
                        /> */}
                        <IconChevronDown
                            color={myColors.black}
                            size={isDesktopWeb() ? 26 : 20}
                        />
                    </Animated.View>
                )}
                {!isInitialized && (
                    // <Entypo
                    //     name={isOpen ? "chevron-down" : "chevron-right"}
                    //     size={isDesktopWeb() ? 26 : 20}
                    //     color={myColors.black}
                    // />
                    isOpen ? <IconChevronDown
                        color={myColors.black}
                        size={isDesktopWeb() ? 26 : 20}
                    /> : <IconChevronUp
                        color={myColors.black}
                        size={isDesktopWeb() ? 26 : 20}
                    />
                )}
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.sectionContent}>
                    {children}
                </View>
            )}
        </View>
    );
};

// Update ProductSearchBar component to use the search state
const ProductSearchBar: React.FC<{
    placeholder: React.ReactNode;
    value: string;
    onChangeText: (text: string) => void;
    style?: any;
}> = ({ placeholder, value, onChangeText, style }) => {
    return (
        <View style={[{
            marginBottom: 15,
        }, style]}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: myColors.productBackgroundGrey,
                borderRadius: 8,
                paddingHorizontal: 15,
                width: isDesktopWeb() ? '32.8%' : '100%',
                height: 45, // Match ProductSection header height
                borderWidth: 0,
            }}>
                {/* <Ionicons name="search" size={22} color={myColors.white} style={{ marginRight: 10 }} /> */}
                <IconSearch
                    color={myColors.white}
                    size={20}
                    style={{ marginRight: 10 }}
                />
                {value === '' && (
                    <View style={{
                        position: 'absolute',
                        left: 45,
                        right: 15,
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        pointerEvents: 'none'
                    }}>
                        {typeof placeholder === 'string' ? (
                            <MyText style={{ color: myColors.white, fontSize: 13, fontWeight: 'bold' }}>{placeholder}</MyText>
                        ) : (
                            placeholder
                        )}
                    </View>
                )}
                <TextInput
                    style={{
                        flex: 1,
                        height: '100%',
                        fontSize: 16, // Increased from 13 to 16 to prevent zoom on iOS
                        fontWeight: 'bold',
                        color: myColors.white,
                        ...createWebStyles({ outline: 'none' }),
                    }}
                    value={value}
                    onChangeText={onChangeText}
                    placeholderTextColor={myColors.white}
                    autoComplete="off"
                    autoCorrect={false}
                    autoCapitalize="none"
                    spellCheck={false}
                    {...(Platform.OS === 'web' && {
                        // Web-specific props
                        autoFocus: false,
                        tabIndex: 0,
                    })}
                />
                {value.length > 0 && (
                    <TouchableOpacity onPress={() => onChangeText('')}>
                        {/* <Ionicons name="close-circle" size={20} color={myColors.white} /> */}
                        <IconCloseCircle
                            color={myColors.white}
                            size={20}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// Update ProductSection component with consistent styling and auto-expand behavior
const ProductSection: React.FC<{
    title: string,
    isOpen?: boolean,
    icon: string,
    children?: React.ReactNode,
    style?: any,
    hasContent?: boolean,
    isSearching?: boolean
}> = ({ title, isOpen = false, icon, children, style, hasContent = true, isSearching = false }) => {
    const { isOpen: expanded, isLoading, isVisible, toggleState, updateContentState } = useSectionState({
        sectionKey: `product_section_${title}`,
        defaultState: false,
        hasContent,
        isSearching
    });

    // Add animation for chevron rotation
    const chevronRotateAnim = useRef(new Animated.Value(expanded ? 0 : 1)).current;
    const [isInitialized, setIsInitialized] = useState(false);

    // Update content state when hasContent changes
    useEffect(() => {
        updateContentState(hasContent);
    }, [hasContent, updateContentState]);

    // Initialize animation state
    useEffect(() => {
        if (!isLoading && !isInitialized) {
            setIsInitialized(true);
            // Set initial rotation value without animation
            chevronRotateAnim.setValue(expanded ? 0 : 1);
        }
    }, [isLoading, isInitialized, expanded]);

    // Handle animated transitions when expanded state changes (only after initialization)
    useEffect(() => {
        if (!isInitialized) return;

        const duration = 200;
        const easing = Easing.out(Easing.cubic);

        Animated.timing(chevronRotateAnim, {
            toValue: expanded ? 0 : 1,
            duration,
            easing,
            useNativeDriver: shouldUseNativeDriver(),
        }).start();
    }, [expanded, isInitialized]);

    // Interpolate rotation animation
    const chevronRotation = chevronRotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-90deg'], // 0deg = pointing down (expanded), -90deg = pointing right (collapsed)
    });

    if (isLoading) {
        return (
            <View style={[{
                marginBottom: 10,
                overflow: 'hidden',
                borderRadius: 8,
            }, style]}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    borderRadius: 8,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    backgroundColor: "myColors.productBackgroundGrey",
                }}>
                    <View style={{ flex: 1 }}>
                        <MyText style={{
                            fontSize: 13,
                            color: myColors.white,
                            fontWeight: 'bold',
                        }}>{title}</MyText>
                    </View>
                    <ActivityIndicator size="small" color={myColors.white} />
                </View>
            </View>
        );
    }

    // Don't render anything if the section is not visible.
    if (!isVisible) return null;

    return (
        <View style={[{
            marginBottom: 10,
            overflow: 'hidden',
            borderRadius: 8,
        }, style]}>
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12, // Reduced from 15 to make the header more compact
                    borderRadius: expanded ? 0 : 8,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    backgroundColor: myColors.productBackgroundGrey,
                }}
                onPress={toggleState}
            >
                <View style={{
                    flex: 1,
                }}>
                    <MyText style={{
                        fontSize: 13,
                        color: myColors.white,
                        fontWeight: 'bold',
                    }}>{title}</MyText>
                </View>
                {isInitialized && (
                    <Animated.View
                        style={{
                            transform: [{ rotate: chevronRotation }],
                        }}
                    >
                        {/* <Entypo
                            name="chevron-down"
                            size={20}
                            color={myColors.white}
                        /> */}
                        <IconChevronDown
                            color={myColors.white}
                            size={20}
                        />
                    </Animated.View>
                )}
                {!isInitialized && (
                    expanded ? <IconChevronDown
                        color={myColors.white}
                        size={20}
                    /> : <IconChevronUp
                        color={myColors.white}
                        size={20}
                    />
                )}
            </TouchableOpacity>

            {expanded && (
                <View style={{
                    width: '100%',
                    paddingBottom: isDesktopWeb() ? 20 : 0,
                    backgroundColor: myColors.productBackgroundGrey,
                }}>
                    {children}
                </View>
            )}
        </View>
    );
};

// Add a new component for the vehicle info item row
interface VehicleInfoRowProps {
    label: string;
    value: string | string[];
    isAlternate?: boolean;
    searchQuery?: string; // Add searchQuery prop
}

// Helper function to highlight matching text
const highlightText = (text: string, searchQuery: string, textStyle: any) => {
    if (!searchQuery || !searchQuery.trim()) {
        return <MyText style={textStyle}>{text}</MyText>;
    }

    const query = searchQuery.trim().toLowerCase();
    const textLower = text.toLowerCase();

    if (!textLower.includes(query)) {
        return <MyText style={textStyle}>{text}</MyText>;
    }

    const parts = [];
    let lastIndex = 0;
    let searchIndex = textLower.indexOf(query);
    let keyCounter = 0;

    while (searchIndex !== -1) {
        // Add text before the match
        if (searchIndex > lastIndex) {
            parts.push(text.substring(lastIndex, searchIndex));
        }

        // Add the highlighted match with special marker
        parts.push({
            text: text.substring(searchIndex, searchIndex + query.length),
            isHighlight: true,
            key: `highlight-${keyCounter++}`
        });

        lastIndex = searchIndex + query.length;
        searchIndex = textLower.indexOf(query, lastIndex);
    }

    // Add remaining text after the last match
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return (
        <MyText style={textStyle}>
            {parts.map((part, index) => {
                if (typeof part === 'string') {
                    return part;
                }
                // This is a highlight object
                return (
                    <MyText
                        key={part.key}
                        style={{
                            backgroundColor: 'rgba(255, 193, 7, 0.2)', // Slightly more visible but still subtle
                            borderRadius: 2,
                            paddingHorizontal: 1,
                        }}
                    >
                        {part.text}
                    </MyText>
                );
            })}
        </MyText>
    );
};

const VehicleInfoRow = React.memo<VehicleInfoRowProps>(({ label, value, isAlternate = false, searchQuery }) => {
    // Handle array values by joining them with commas
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    const [isHovered, setIsHovered] = useState(false);

    const labelStyle = {
        fontSize: isDesktopWeb() ? 16 : 12,
        fontWeight: isDesktopWeb() ? '700' : '400',
        color: myColors.text.primary,
        flexShrink: 1,
        marginRight: 8,
    } as const;

    const valueStyle = {
        fontSize: isDesktopWeb() ? 16 : 12,
        fontWeight: isDesktopWeb() ? '700' : '400',
        color: myColors.text.primary,
        textAlign: 'right' as const,
        flex: 1,
        flexWrap: 'wrap' as const,
    };

    return (
        <View style={{ width: '100%' }}>
            <View
                style={[{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingTop: isDesktopWeb() ? 12 : 8,
                    paddingBottom: isDesktopWeb() ? 12 : 8,
                    paddingHorizontal: isDesktopWeb() ? 20 : 12,
                    alignSelf: 'center',
                    width: isDesktopWeb() ? '95%' : '100%',
                    borderRadius: 5,
                    backgroundColor: isHovered ? "transparent" : (isDesktopWeb() ? ('#F5F8FA') : (isAlternate ? '#F5F8FA' : 'transparent')),
                }]}
                {...(isDesktopWeb() ? {
                    onMouseEnter: () => setIsHovered(true),
                    onMouseLeave: () => setIsHovered(false)
                } : {})}
            >
                {highlightText(label, searchQuery || '', labelStyle)}
                {displayValue === LoginButtonKeyMapper ?
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <MyText style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: myColors.primary.main,
                            textAlign: 'right',
                            flex: 1,
                        }}>{"Logga In"}</MyText>
                    </TouchableOpacity>
                    :
                    highlightText(displayValue, searchQuery || '', valueStyle)
                }
            </View>
        </View>
    );
});

// Add a new component for VehicleInformationSection
interface VehicleInformationSectionProps {
    title: string;
    icon: string;
    isExpanded: boolean;
    toggleExpand: () => void;
    children?: React.ReactNode;
}

const VehicleInformationSection = React.memo<VehicleInformationSectionProps>(({
    title,
    icon,
    isExpanded,
    toggleExpand,
    children
}) => {
    const { isOpen: sectionExpanded, isLoading, toggleState } = useSectionState({
        sectionKey: `vehicle_info_section_${title}`,
        defaultState: isExpanded,
        dataVersion: '1.0',
        hasContent: !!children,
        isSearching: isExpanded
    });

    // Use local state to control the expanded state and avoid timing issues
    const [expanded, setExpanded] = useState(isExpanded);
    const [isInitialized, setIsInitialized] = useState(false);

    // Calculate proper alignment for the final orange bar position
    const headerPadding = isDesktopWeb() ? 22 : 12;
    const textLineHeight = isDesktopWeb() ? 24 : 19; // Approximate line height for the font sizes
    const textOffset = Math.floor(textLineHeight * 0.15) - 4; // Adjust 3px higher to align with text
    const orangeBarTop = headerPadding + textOffset; // Where the orange bar should sit
    const orangeBarHeight = 30; // Small orange bar height
    const fullCardHeight = 100; // Full blue bar height (covers whole card)

    // Initialize animation values - start with collapsed state (full height, top 0, blue)
    const barHeightAnim = useRef(new Animated.Value(fullCardHeight)).current;
    const barTopAnim = useRef(new Animated.Value(0)).current;
    const barColorAnim = useRef(new Animated.Value(1)).current; // 1 = blue (collapsed)
    const chevronRotateAnim = useRef(new Animated.Value(1)).current; // 1 = down arrow

    // Sync with section state when it changes - but don't set initial immediately
    useEffect(() => {
        if (!isLoading) {
            if (!isInitialized) {
                setIsInitialized(true);
                // Set the correct initial state immediately without animation on first load
                const initialExpanded = sectionExpanded;
                setExpanded(initialExpanded);

                // Set values immediately for first render to prevent flash
                barHeightAnim.setValue(initialExpanded ? orangeBarHeight : fullCardHeight);
                barTopAnim.setValue(initialExpanded ? orangeBarTop : 0);
                barColorAnim.setValue(initialExpanded ? 0 : 1);
                chevronRotateAnim.setValue(initialExpanded ? 0 : 1);
            } else {
                // After initialization, update with animation
                setExpanded(sectionExpanded);
            }
        }
    }, [sectionExpanded, isLoading, isInitialized]);

    // Handle animated transitions when expanded state changes (only after initialization)
    useEffect(() => {
        if (!isInitialized) return;

        const duration = 250;
        const easing = Easing.out(Easing.cubic);

        // Separate animations that can use native driver from those that cannot
        // Layout properties (height, top) and backgroundColor cannot use native driver
        Animated.parallel([
            Animated.timing(barHeightAnim, {
                toValue: expanded ? orangeBarHeight : fullCardHeight,
                duration,
                easing,
                useNativeDriver: false, // Layout properties cannot use native driver
            }),
            Animated.timing(barTopAnim, {
                toValue: expanded ? orangeBarTop : 0,
                duration,
                easing,
                useNativeDriver: false, // Layout properties cannot use native driver
            }),
            Animated.timing(barColorAnim, {
                toValue: expanded ? 0 : 1,
                duration,
                easing,
                useNativeDriver: false, // backgroundColor cannot use native driver
            }),
            Animated.timing(chevronRotateAnim, {
                toValue: expanded ? 0 : 1,
                duration: 200,
                easing,
                useNativeDriver: true, // Transform properties can use native driver
            }),
        ]).start();
    }, [expanded, isInitialized]);

    // Interpolate color animation
    const barBackgroundColor = barColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#e77832', myColors.primary.main], // Orange when expanded, blue when collapsed
    });

    const chevronRotation = chevronRotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-90deg'],
    });

    // Handle press
    const handlePress = () => {
        toggleState();
    };

    if (isLoading) {
        return (
            <View style={[
                styles.vehicleInformationSectionAnimated,
                {
                    marginBottom: 1,
                    borderRadius: 8,
                    backgroundColor: myColors.white,
                    overflow: 'hidden',
                },
                isDesktopWeb() && styles.vehicleInformationSectionDesktop
            ]}>
                <View style={styles.vehicleInformationSectionHeader}>
                    <View style={{ flex: 1 }}>
                        <MyText style={styles.vehicleInformationSectionTitle}>{title}</MyText>
                    </View>
                    <ActivityIndicator size="small" color={myColors.text.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={[
            styles.vehicleInformationSectionAnimated,
            {
                marginBottom: 1,
                borderRadius: 8,
                backgroundColor: myColors.white,
                overflow: 'hidden',
            },
            isDesktopWeb() && styles.vehicleInformationSectionDesktop
        ]}>
            {/* Animated decorative bar - only render when initialized */}
            {isInitialized && (
                <Animated.View
                    style={[
                        styles.animatedDecorativeBar,
                        {
                            height: barHeightAnim,
                            top: barTopAnim,
                            backgroundColor: barBackgroundColor,
                        },
                    ]}
                />
            )}

            <TouchableOpacity
                style={styles.vehicleInformationSectionHeader}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <View style={{ flex: 1 }}>
                    <MyText style={styles.vehicleInformationSectionTitle}>{title}</MyText>
                </View>
                {isInitialized && (
                    <Animated.View
                        style={{
                            transform: [{ rotate: chevronRotation }],
                        }}
                    >
                        <IconChevronDown
                            color={myColors.text.primary}
                            size={26}
                        />
                    </Animated.View>
                )}
            </TouchableOpacity>

            {expanded && (
                <View style={{
                    width: '100%',
                    paddingBottom: isDesktopWeb() ? 20 : 0
                }}>
                    {children}
                </View>
            )}
        </View>
    );
});

interface VehicleInfoComponentProps {
    vehicleData: CarSearchData | undefined;
    activeTab: TabType;
    isGuestMode?: boolean;
}

const VehicleInfoComponent = React.memo<VehicleInfoComponentProps>(({ vehicleData, activeTab, isGuestMode = false }) => {
    const [infoSearchInputText, setInfoSearchInputText] = useState("");
    const infoSearchQuery = useDebounce(infoSearchInputText, 100);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [dataLoaded, setDataLoaded] = useState(false);

    // Add animated transition when data loads
    useEffect(() => {
        if (vehicleData?.car && !dataLoaded) {
            setDataLoaded(true);
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                    easing: Easing.out(Easing.cubic)
                }).start();
            }, 50);
        }
    }, [vehicleData]);

    // Filter vehicles sections based on search while preserving order
    const filteredSections = useMemo(() => {
        if (!vehicleData?.car) {
            return [];
        }

        // If no search query, return all sections in original order
        if (!infoSearchQuery) {
            return Array.isArray(vehicleData.car)
                ? vehicleData.car
                : (typeof vehicleData.car === 'object' ? [vehicleData.car] : []);
        }

        const query = infoSearchQuery.toLowerCase();
        const sectionsArray = Array.isArray(vehicleData.car)
            ? vehicleData.car
            : (typeof vehicleData.car === 'object' ? [vehicleData.car] : []);

        // Filter sections while preserving order
        return sectionsArray.filter((section: any) => {
            if (!section) return false;

            // Check section title
            if (section.title && typeof section.title === 'string' &&
                section.title.toLowerCase().includes(query)) {
                return true;
            }

            // Check all data fields while preserving their order
            if (section.data && typeof section.data === 'object') {
                const hasMatchingData = Object.entries(section.data).some(([key, value]) => {
                    const keyMatch = key.toLowerCase().includes(query);
                    const valueMatch = String(value).toLowerCase().includes(query);
                    return keyMatch || valueMatch;
                });
                if (hasMatchingData) return true;
            }

            return false;
        });
    }, [vehicleData, infoSearchQuery]);

    // Render content from API data
    const renderApiContent = () => {
        try {
            if (!vehicleData?.car) {
                return (
                    <View style={styles.vehicleInfoMobileContainer}>
                        {Array(3).fill(null).map((_, index) => (
                            <View
                                key={index}
                                style={styles.vehicleInfoLoadingCard}
                            >
                                <View style={styles.vehicleInfoLoadingContent}>
                                    <View style={[styles.placeholder, { width: '60%', height: 18 }]} />
                                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: myColors.border.light }} />
                                </View>
                            </View>
                        ))}
                    </View>
                );
            }

            return (
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.vehicleInfoMobileContainer}>
                        {filteredSections.map((section: any, index: number) => {
                            if (!section || typeof section !== 'object') return null;

                            const title = typeof section.title === 'string' ? section.title : `Section ${index}`;
                            const icon = section.icon || ImagePath.SvgIcons.CarIcon;
                            const shouldExpand = !!infoSearchQuery;

                            // Check if this is an owner/history section and user is in guest mode
                            const isOwnerSection = title.toLowerCase().includes('ägare') ||
                                title.toLowerCase().includes('fordonshistorik') ||
                                title.toLowerCase().includes('ägarhistorik');
                            const shouldBlur = isOwnerSection && isGuestMode;

                            // Use placeholder data for owner sections when not logged in
                            const sectionData = shouldBlur ? getOwnerPlaceholderData() : section.data;

                            // Calculate total number of items for this section
                            let totalItems = 0;
                            if (sectionData && typeof sectionData === 'object') {
                                Object.entries(sectionData).forEach(([_, value]) => {
                                    if (Array.isArray(value)) {
                                        totalItems += value.length;
                                    } else {
                                        totalItems += 1;
                                    }
                                });
                            }

                            return (
                                <View
                                    key={index}
                                    style={[styles.vehicleInfoMobileCard, shouldBlur && { position: 'relative' }]}
                                >
                                    <VehicleInformationSection
                                        title={title}
                                        icon={icon}
                                        isExpanded={shouldExpand}
                                        toggleExpand={() => { }}
                                    >
                                        {sectionData && typeof sectionData === 'object' ? (
                                            <View style={shouldBlur ? { opacity: 0.3 } : {}}>
                                                {Object.entries(sectionData).map(([key, value], idx) => {
                                                    if (Array.isArray(value)) {
                                                        return value.map((item, itemIdx) => {
                                                            const runningCount = Object.entries(sectionData)
                                                                .slice(0, idx)
                                                                .reduce((count, [_, val]) => {
                                                                    return count + (Array.isArray(val) ? val.length : 1);
                                                                }, 0) + itemIdx;

                                                            return (
                                                                <VehicleInfoRow
                                                                    key={`${idx}-${itemIdx}`}
                                                                    label={key || ''}
                                                                    value={item != null ? String(item) : ''}
                                                                    isAlternate={runningCount % 2 === 0}
                                                                    searchQuery={shouldBlur ? '' : infoSearchQuery}
                                                                />
                                                            );
                                                        });
                                                    }
                                                    const runningCount = Object.entries(sectionData)
                                                        .slice(0, idx)
                                                        .reduce((count, [_, val]) => {
                                                            return count + (Array.isArray(val) ? val.length : 1);
                                                        }, 0);

                                                    return (
                                                        <VehicleInfoRow
                                                            key={idx}
                                                            label={key || ''}
                                                            value={value != null ? String(value) : ''}
                                                            isAlternate={runningCount % 2 === 0}
                                                            searchQuery={shouldBlur ? '' : infoSearchQuery}
                                                        />
                                                    );
                                                })}
                                            </View>
                                        ) : (
                                            <MyText style={{
                                                padding: 16,
                                                fontSize: 14,
                                                color: myColors.text.primary,
                                                fontStyle: 'italic',
                                                textAlign: 'center',
                                            }}>
                                                Ingen information tillgänglig.
                                            </MyText>
                                        )}

                                        {shouldBlur && (
                                            <ProtectedContentOverlay
                                                visible={true}
                                                onLoginPress={() => router.push('/(auth)/login')}
                                            />
                                        )}
                                    </VehicleInformationSection>
                                </View>
                            );
                        })}
                    </View>

                    {filteredSections.length === 0 && (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <MyText style={{
                                fontSize: 14,
                                color: myColors.text.secondary
                            }}>
                                Inga resultat för "{infoSearchQuery}"
                            </MyText>
                        </View>
                    )}
                </Animated.View>
            );
        } catch (error) {
            return null;
        }
    };

    return (
        <CarDetailSection
            title="Fordonsinformation"
            initiallyOpen={true}
        >
            <View style={{ marginTop: 5, marginBottom: isDesktopWeb() ? 40 : 0 }}>
                <ProductSearchBar
                    placeholder="Sök fordonsuppgifter"
                    value={infoSearchInputText}
                    onChangeText={setInfoSearchInputText}
                />

                {renderApiContent()}
            </View>
        </CarDetailSection>
    );
});

// Add a product card component for displaying product results
const ProductCard: React.FC<{
    name: string;
    brand?: string;
    price: string;
    imageUrl: string;
    productUrl?: string;
}> = ({ name, brand, price, imageUrl, productUrl }) => {
    const [imageError, setImageError] = useState(false);

    // Open product URL in external browser
    const handlePress = () => {
        if (productUrl && productUrl.trim() !== '') {
            Linking.openURL(productUrl).catch(err => {
                console.error('Error opening URL:', err);
            });
        }
    };

    // Check if product URL is valid
    const hasValidUrl = productUrl && productUrl.trim() !== '';

    // Handle image loading error
    const handleImageError = () => {
        setImageError(true);
    };

    // Determine image source with proper error handling
    const imageSource = !imageError && imageUrl && !imageUrl.includes('undefined') && !imageUrl.includes('null')
        ? { uri: imageUrl }
        : null;

    return (
        <TouchableOpacity
            style={styles.productCard}
            onPress={handlePress}
            disabled={!hasValidUrl}
            activeOpacity={hasValidUrl ? 0.8 : 1}
        >
            <View style={[styles.productImageContainer, imageError && { backgroundColor: 'white' }]}>
                {imageSource ? (
                    <RNImage
                        source={imageSource}
                        style={styles.productImage}
                        onError={handleImageError}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={styles.productImagePlaceholder} />
                )}
            </View>
            <MyText style={styles.productBrand}>{brand}</MyText>
            <MyText style={styles.productName} numberOfLines={2}>{name}</MyText>
            <MyText style={styles.productPrice}>{price}</MyText>
        </TouchableOpacity>
    );
};

// Update the ScrollableProductList component to properly handle pagination
const ScrollableProductList = React.memo<{
    products: any[];
    renderItem: (item: any, index: number) => React.ReactElement;
    onEndReached?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
}>(({ products, renderItem, onEndReached, hasMore, isLoadingMore }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const webListRef = useRef<FlatList>(null);
    const nativeListRef = useRef<FlashList<any>>(null);

    // Calculate item dimensions
    const ITEM_WIDTH = Platform.OS === 'web' ? width / 11.5 : width / 4;
    const ITEM_MARGIN = 10;
    const itemsPerView = Platform.OS === 'web' ? 11.5 : 4;

    // Check if we can scroll left/right
    const canScrollLeft = currentIndex > 0;
    const canScrollRight = currentIndex < products.length - Math.floor(itemsPerView);

    // Handle scroll to specific index
    const scrollToIndex = useCallback((index: number) => {
        const targetIndex = Math.max(0, Math.min(index, products.length - 1));

        if (Platform.OS === 'web' && webListRef.current) {
            webListRef.current.scrollToIndex({
                index: targetIndex,
                animated: true,
                viewPosition: 0
            });
        } else if (nativeListRef.current) {
            nativeListRef.current.scrollToIndex({
                index: targetIndex,
                animated: true,
                viewPosition: 0
            });
        }
        setCurrentIndex(targetIndex);
    }, [products.length]);

    // Navigation handlers
    const handleScrollLeft = useCallback(() => {
        if (canScrollLeft) {
            const newIndex = Math.max(0, currentIndex - Math.floor(itemsPerView / 2));
            scrollToIndex(newIndex);
        }
    }, [currentIndex, canScrollLeft, scrollToIndex, itemsPerView]);

    const handleScrollRight = useCallback(() => {
        if (canScrollRight) {
            const newIndex = Math.min(products.length - 1, currentIndex + Math.floor(itemsPerView / 2));
            scrollToIndex(newIndex);
        }
    }, [currentIndex, canScrollRight, scrollToIndex, products.length, itemsPerView]);

    // Handle manual scroll events
    const handleScroll = useCallback((event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / (ITEM_WIDTH + ITEM_MARGIN));
        setCurrentIndex(newIndex);
    }, [ITEM_WIDTH, ITEM_MARGIN]);

    const handleEndReached = useCallback(() => {
        if (hasMore && !isLoadingMore && onEndReached) {
            onEndReached();
        }
    }, [hasMore, isLoadingMore, onEndReached]);

    if (!products || products.length === 0) return null;

    // Don't show navigation buttons if there are too few items
    const showNavigation = products.length > itemsPerView;

    // ---------------- Web implementation with pagination ----------------
    if (Platform.OS === 'web') {
        return (
            <View style={styles.carouselContainer as any}>
                <FlatList
                    ref={webListRef}
                    data={products}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingVertical: 0,
                        paddingHorizontal: 15,
                    }}
                    keyExtractor={(item: any, index: number) => {
                        const keyCandidate = item?.sku || item?.id || item?.trackingUrl;
                        return keyCandidate ? `web-product-${keyCandidate}` : `web-product-${index}`;
                    }}
                    renderItem={({ item, index }) => renderItem(item, index)}
                    getItemLayout={(_, index) => ({
                        length: ITEM_WIDTH + ITEM_MARGIN,
                        offset: (ITEM_WIDTH + ITEM_MARGIN) * index,
                        index,
                    })}
                    initialNumToRender={20}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.7} // Load earlier than mobile (mobile uses 0.3)
                    removeClippedSubviews={false}
                    decelerationRate="fast"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                />

                {/* Navigation Buttons */}
                {showNavigation && (
                    <>
                        <TouchableOpacity
                            style={[
                                styles.navLeftButton,
                                !canScrollLeft && styles.navButtonDisabled
                            ]}
                            onPress={handleScrollLeft}
                            disabled={!canScrollLeft}
                            accessibilityLabel="Föregående produkter"
                        >
                            <SafeSvgXml xml={ImagePath.SvgIcons.LeftArrow} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.navRightButton,
                                !canScrollRight && styles.navButtonDisabled
                            ]}
                            onPress={handleScrollRight}
                            disabled={!canScrollRight}
                            accessibilityLabel="Nästa produkter"
                        >
                            <SafeSvgXml xml={ImagePath.SvgIcons.RightArrow} />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    }

    // ---------------- Native (iOS / Android) implementation ----------------
    return (
        <View style={styles.carouselContainer as any}>
            <FlashList
                ref={nativeListRef}
                data={products}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingVertical: 0,
                    paddingHorizontal: 15,
                }}
                estimatedItemSize={ITEM_WIDTH + ITEM_MARGIN}
                decelerationRate="fast"
                keyExtractor={(item: any, index: number) => {
                    const keyCandidate = item?.sku || item?.id || item?.trackingUrl;
                    return keyCandidate ? `product-${keyCandidate}` : `product-${index}`;
                }}
                renderItem={({ item, index }) => renderItem(item, index)}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.3}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            />

            {/* Navigation Buttons */}
            {showNavigation && (
                <>
                    <TouchableOpacity
                        style={[
                            styles.navLeftButton,
                            !canScrollLeft && styles.navButtonDisabled
                        ]}
                        onPress={handleScrollLeft}
                        disabled={!canScrollLeft}
                        accessibilityLabel="Föregående produkter"
                    >
                        <SafeSvgXml xml={ImagePath.SvgIcons.LeftArrow} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.navRightButton,
                            !canScrollRight && styles.navButtonDisabled
                        ]}
                        onPress={handleScrollRight}
                        disabled={!canScrollRight}
                        accessibilityLabel="Nästa produkter"
                    >
                        <SafeSvgXml xml={ImagePath.SvgIcons.RightArrow} />
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
});

// Optimize the search experience with debounced search input
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

interface CarData {
    // Model and identification
    "Bilkod"?: string;
    "Carlinkment ID"?: string;
    "Chassinummer"?: string;
    "Bilmärke"?: string;
    "Fabrikat"?: string;
    "Bilmodell"?: string;
    "Handelsbeteckning"?: string;
    "Karosstyp"?: string;
    "Typ"?: string;
    "Chassikod"?: string;
    "Årsmodell"?: string;
    "Bränsle"?: string;

    // Tire and wheel specifications
    Dackdimension_fram?: string;
    Dackdimension_bak?: string;
    dack_dim_fram?: string;
    dack_dim_bak?: string;
    ET_fram_tollerans?: string;
    ET_bak_tollerans?: string;
    BULTCIRKEL?: string;

    // Image data
    "Car Image"?: string;
    additionalData?: {
        imageInfo?: {
            "Car Image"?: string;
            high_res?: string;
        };
    };

    // Allow other properties but with a more specific type
    [key: string]: string | { [key: string]: any } | undefined;
}

interface CarDetailsRendererProps {
    vehicleData: CarSearchData | undefined;
    findValueInCarData: (key: string) => string | string[] | null;
    regNumber: string;
}

// Define the renderer component
const CarDetailsRenderer = React.memo<CarDetailsRendererProps>(({ vehicleData, findValueInCarData, regNumber }) => {
    // Add these fade animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [dataLoaded, setDataLoaded] = useState(false);

    // Add animated transition when data loads
    useEffect(() => {
        if (vehicleData?.car && !dataLoaded) {
            // Mark data as loaded
            setDataLoaded(true);

            // Animate fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
                easing: Easing.out(Easing.cubic)
            }).start();
        }
    }, [vehicleData]);

    // Show no results component if both CL and TS returned errors
    if (!vehicleData?.car && vehicleData?.isError) {
        return <NoResultsComponent regNr={regNumber} />;
    }

    // Show loading state if data is not yet available
    if (!vehicleData?.car || !dataLoaded) {
        return (
            <View style={styles.specsContainer}>
                {Array(6).fill(null).map((_, index) => (
                    <View key={index} style={styles.specItem}>
                        <View style={styles.specIconTitleWrapper}>
                            <View style={styles.infoSection}>
                                <View style={[styles.placeholder, { width: '60%', height: 12 }]} />
                                <View style={[styles.placeholder, { width: '80%', height: 16, marginTop: 4 }]} />
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // Only render the actual data once it's loaded
    return (
        <Animated.View style={[styles.specsContainer, { opacity: fadeAnim }]}>
            {LocalCarDetailsList.map((item, index) => {
                const fieldKey = item.value;
                let displayValue = '-';
                let displayTitle = item.title;
                let statusStyle = item.VehiclestatusField ? styles.VehiclestatusFieldStyle : styles.specValue;

                // Get the value from the merged data
                const value = findValueInCarData(fieldKey);
                displayValue = Array.isArray(value) ? value[0] : value || '-';

                // Special case for Fordonsstatus datum (index 3) and Fordonsstatus (index 6)
                if (item.index === 3 || item.index === 6) {
                    // Always check the "Fordonsstatus" field value to determine the display
                    const fordonsstatus = findValueInCarData('Fordonsstatus');
                    const fordonsstatusValue = Array.isArray(fordonsstatus) ? fordonsstatus[0] : fordonsstatus;

                    if (item.index === 3) {
                        // Check the Fordonsstatus value to determine what to display
                        if (fordonsstatusValue === 'I TRAFIK') {
                            displayTitle = 'Påställd';
                        } else if (fordonsstatusValue === 'KÖRFÖRBUD') {
                            displayTitle = 'KÖRFÖRBUD';
                        } else {
                            displayTitle = 'Avställd';
                        }
                        // Use the current field's value for display (this should be the status date)
                        displayValue = Array.isArray(value) ? value[0] : value || '-';
                    }

                    if (item.index === 6) {
                        let cardStyle = {};
                        if (displayValue === 'I TRAFIK') {
                            cardStyle = { backgroundColor: myColors.darkGreen };
                            statusStyle = { ...styles.VehiclestatusFieldStyle, color: myColors.white };
                        } else if (displayValue === 'AVSTÄLLD') {
                            cardStyle = { backgroundColor: myColors.didNotFindRed };
                            statusStyle = { ...styles.VehiclestatusFieldStyle, color: myColors.white };
                        } else if (displayValue === 'KÖRFÖRBUD') {
                            cardStyle = { backgroundColor: myColors.didNotFindRed };
                            statusStyle = { ...styles.VehiclestatusFieldStyle, color: myColors.white };
                        }

                        return (
                            <View key={index} style={[styles.specItem, cardStyle]}>
                                <View style={styles.specIconTitleWrapper}>
                                    <View style={styles.infoSection}>
                                        <MyText style={{ ...styles.specLabel, color: myColors.white }}>{displayTitle}</MyText>
                                        {displayValue === LoginButtonKeyMapper ?
                                            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                                <MyText style={{
                                                    fontSize: 16,
                                                    fontWeight: 'bold',
                                                    color: myColors.white,
                                                }}>{"Logga In"}</MyText>
                                            </TouchableOpacity>
                                            :
                                            <MyText style={statusStyle}>
                                                {displayValue}
                                            </MyText>
                                        }
                                    </View>
                                </View>
                            </View>
                        );
                    }
                }
                // Special case for Köpform (index 8)
                else if (item.index === 8) {
                    const leasing = findValueInCarData('Leasad');
                    const kreditkop = findValueInCarData('Kreditköpt');
                    const leasingValue = Array.isArray(leasing) ? leasing[0] : leasing;
                    const kreditkopValue = Array.isArray(kreditkop) ? kreditkop[0] : kreditkop;

                    const leasingStr = String(leasingValue || '').toUpperCase();
                    const kreditkopStr = String(kreditkopValue || '').toUpperCase();

                    if (leasingStr === 'JA') {
                        displayValue = 'Leasad';
                    } else if (kreditkopStr === 'JA') {
                        displayValue = 'Kreditköpt';
                    } else {
                        displayValue = 'Skuldfri';
                    }
                }

                return (
                    <View key={index} style={styles.specItem}>
                        <View style={styles.specIconTitleWrapper}>
                            <View style={styles.infoSection}>
                                <MyText style={styles.specLabel}>{displayTitle}</MyText>
                                {displayValue === LoginButtonKeyMapper ?
                                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                        <MyText style={{
                                            fontSize: 16,
                                            fontWeight: 'bold',
                                            color: myColors.primary.main,
                                        }}>{"Logga In"}</MyText>
                                    </TouchableOpacity>
                                    :
                                    <MyText style={statusStyle}>
                                        {displayValue}
                                    </MyText>
                                }
                            </View>
                        </View>
                    </View>
                );
            })}
        </Animated.View>
    );
});

// Add Pagination Hook
const usePagination = (items: any[], itemsPerPage: number = 20) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(0, endIndex); // Show cumulative items (load more pattern)

    const loadMore = useCallback(() => {
        if (currentPage < totalPages && !isLoadingMore) {
            setIsLoadingMore(true);
            // Simulate loading delay for smooth UX
            setTimeout(() => {
                setCurrentPage(prev => prev + 1);
                setIsLoadingMore(false);
            }, 300);
        }
    }, [currentPage, totalPages, isLoadingMore]);

    const reset = useCallback(() => {
        setCurrentPage(1);
        setIsLoadingMore(false);
    }, []);

    const hasMore = currentPage < totalPages;

    return {
        currentItems,
        currentPage,
        totalPages,
        hasMore,
        isLoadingMore,
        loadMore,
        reset,
        totalItems: items.length,
        displayedItems: currentItems.length
    };
};

// Add Pagination Controls Component to show loading and count only
const AutoLoadIndicator = React.memo<{
    hasMore: boolean;
    isLoadingMore: boolean;
    displayedItems: number;
    totalItems: number;
}>(({ hasMore, isLoadingMore, displayedItems, totalItems }) => {
    if (totalItems <= 20) return null;

    return (
        <View style={styles.autoLoadContainer}>
            {isLoadingMore && (
                <View style={styles.loadingIndicatorContainer}>
                    <ActivityIndicator size="small" color={myColors.white} />
                    <MyText style={styles.loadingText}>Laddar fler...</MyText>
                </View>
            )}
        </View>
    );
});

// Define DacklineSizeFilterProps interface and DacklineSizeFilter component here
interface DacklineSizeFilterProps {
    availableSizes: number[] | undefined;
    selectedSizes: number[];
    onToggleSize: (size: number) => void;
    style?: StyleProp<ViewStyle>;
}

const DacklineSizeFilter: React.FC<DacklineSizeFilterProps> = React.memo(({
    availableSizes,
    selectedSizes,
    onToggleSize,
    style
}) => {
    const sortedSizes = useMemo(() => {
        return availableSizes ? [...availableSizes].sort((a, b) => a - b) : [];
    }, [availableSizes]);

    if (!sortedSizes || sortedSizes.length === 0) {
        return null;
    }

    const handlePress = (size: number) => {
        onToggleSize(size);
    };

    return (
        <View style={[styles.sizeFilterContainer, style]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sizeFilterScrollViewContent}>
                {sortedSizes.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    const textStyle = {
                        ...styles.sizeFilterButtonText, // Base style
                        ...(isSelected ? styles.sizeFilterButtonTextSelected : styles.sizeFilterButtonTextNormal) // Conditional style
                    };
                    return (
                        <TouchableOpacity
                            key={size}
                            style={[
                                styles.sizeFilterButton,
                                isSelected ? styles.sizeFilterButtonSelected : styles.sizeFilterButtonNormal,
                            ]}
                            onPress={() => handlePress(size)}
                            activeOpacity={0.7}
                        >
                            <MyText style={textStyle} >
                                {`${size}"`}
                            </MyText>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
});

// Define placeholder data for owner section when not logged in
const getOwnerPlaceholderData = () => ({
    "Ägare": "••••••••••••••",
    "Ägarens adress": "••••••••••••••••••••••",
    "Ägarens postnummer": "••••••",
    "Ägarens postort": "••••••••••••••",
    "Tidigare ägare": "••••••••••••••",
    "Ägarbyten": "•••",
    "Senaste ägarbyte": "••••-••-••",
    "Tid som nuvarande ägare": "••• månader",
});

// Blur overlay component for protected content
const ProtectedContentOverlay: React.FC<{
    visible: boolean;
    onLoginPress: () => void;
}> = ({ visible, onLoginPress }) => {
    if (!visible) return null;

    return (
        <View style={styles.blurOverlay}>
            <View style={styles.blurOverlayContent}>
                <View style={styles.loginFloatInfo}>
                    <View style={styles.rotatedMessageBox}>
                        <MyText style={styles.rotatedMessageText}>
                            Endast inloggade medlemmar kan se ägarinformation.
                        </MyText>
                    </View>
                    <View style={[styles.rotatedMessageBox, styles.rotatedMessageBoxSecondary]}>
                        <MyText style={styles.rotatedMessageText}>
                            Bli medlem gratis idag genom att logga in.
                        </MyText>
                    </View>
                </View>

                <View style={styles.loginBox}>
                    <TouchableOpacity
                        style={styles.bankIdButton}
                        onPress={onLoginPress}
                        activeOpacity={0.8}
                    >
                        <MyText style={styles.bankIdButtonText}>Logga in</MyText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default function CarDetails() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        car: string;
        regnr: string;
        regNumber: string;
        title?: string;
        year?: string;
        id?: string;
        brand?: string;
        model?: string;
        image?: string;
    }>();

    const regNumber = params.regnr || params.car;
    const isFocused = useIsFocused();
    // // console.log("CarDetails isFocused", isFocused);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Single instance of vehicle data fetching
    const {
        data: vehicleData,
        isLoading: isLoadingData,
        carImageUrl: hookImageUrl,
        highResImageUrl: hookHighResImageUrl,
        onImageLoadError,
        flattenedData
    } = useVehicleData(regNumber, { enabled: isFocused });

    // Image state management - simplified to use hook values
    const [carImageUrl, setCarImageUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    // Add state for navigation bar visibility
    const [isNavBarVisible, setIsNavBarVisible] = useState(true);

    // Add helper function for opening external URLs
    const openExternalUrl = (url: string) => {
        Linking.openURL(url).catch(err => {
            console.error('Error opening URL:', err);
        });
    };

    // Optimized findValueInCarData function using flattened data
    const findValueInCarData = useCallback((key: string): string | string[] | null => {
        if (!vehicleData?.car) return null;

        // First try the flattened data
        if (flattenedData?.[key]) {
            return flattenedData[key];
        }

        // If not found in flattened data, search through sections
        const sections = Array.isArray(vehicleData.car) ? vehicleData.car : [vehicleData.car];

        for (const section of sections) {
            if (section?.data && typeof section.data === 'object') {
                const value = section.data[key];
                if (value !== null && value !== undefined) {
                    return value;
                }
            }
        }

        return null;
    }, [vehicleData, flattenedData]);

    // Add state for car title and year that can be updated from API
    const [displayTitle, setDisplayTitle] = useState<string>('');
    const [displayYear, setDisplayYear] = useState<string>('');

    // State for product data
    const [modelId, setModelId] = useState<string | null>(null);
    const [carlinkmentId, setCarlinkmentId] = useState<string | null>(null);
    const [tireDimensions, setTireDimensions] = useState<string[]>([]);
    const [etTolerance, setEtTolerance] = useState<{ et_min: number, et_max: number } | null>(null);
    const [pcd, setPcd] = useState<string | null>(null);

    // Extract other params
    const { id, brand, model, year, image } = params;
    const carTitle = params.title || ''; // MÄRKE MODELL
    const carYear = params.year || '';
    // const carTitle = vehicleData?.car?.data?.Bilmärke || ''; // MÄRKE MODELL
    // const carYear = vehicleData?.car?.data?.Årsmodell || '';

    const { isPremiumUser, isGuestMode } = useAuth();
    const { hasProAccess } = useUserRole();
    const dacklineSearchPerformed = useRef<boolean>(false);
    const modelIdExtracted = useRef<boolean>(false);
    const productParamsExtracted = useRef<boolean>(false);

    const [isFavorite, setIsFavorite] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('Biluppgifter');
    const [searchInputText, setSearchInputText] = useState("");
    const [preFilteredComplete, setPreFilteredComplete] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState({
        mekonomen: [] as NormalizedProduct[],
        skruvat: [] as NormalizedProduct[],
        drivknuten: [] as NormalizedProduct[],
        dacklineWheels: [] as NormalizedProduct[],
        dacklineTyre: [] as NormalizedProduct[],
        ticko: [] as NormalizedProduct[]
    });

    // State for Däckline size filter
    const [selectedDacklineSizes, setSelectedDacklineSizes] = useState<number[]>([]);

    const [isImageLoading, setIsImageLoading] = useState(false);

    // Add pagination hooks for each product type - for all platforms
    const mekonomenPagination = usePagination(filteredProducts.mekonomen, 20);
    const skruvatPagination = usePagination(filteredProducts.skruvat, 20);
    const drivknutenPagination = usePagination(filteredProducts.drivknuten, 20);
    const tickoPagination = usePagination(filteredProducts.ticko, 20);

    // Reset pagination when search changes - for all platforms
    useEffect(() => {
        mekonomenPagination.reset();
        skruvatPagination.reset();
        drivknutenPagination.reset();
        tickoPagination.reset();
    }, [searchInputText]);

    // Debounce search query to prevent excessive filtering during typing
    const searchQuery = useDebounce(searchInputText, 100);

    const toggleFavorite = () => {
        setFavoritePopupVisible(true);
    };

    const handleMenuPress = () => {
        setMenuVisible(true);
    };

    const handleProfilePress = () => {
        setProfileMenuVisible(true);
    };

    // Replace with a simplified effect that just uses cache:
    useEffect(() => {
        const regNum = regNumber as string;
        if (!regNum) return;
    }, []);

    // Product API hooks - enable when needed after modelId is available and screen is focused
    const dacklineSearch = useDacklineProductSearch();
    const { data: drivknutenData, isLoading: isDrivknutenLoading } = useDrivknutenProducts({
        modell_id: modelId || undefined,
        carlinkment_id: carlinkmentId || undefined
    }, { enabled: !!(modelId || carlinkmentId) && !isLoadingData && isFocused }); // Only enable when we have merged data and screen is focused

    const { data: skruvatData, isLoading: isSkruvatLoading } = useSkruvatProducts(
        modelId || '',
        { enabled: !!modelId && !isLoadingData && isFocused } // Only enable when we have merged data and screen is focused
    );

    const { data: mekonomenData, isLoading: isMekonomenLoading } = useMekonomenProducts(
        modelId || '',
        { enabled: !!modelId && !isLoadingData && isFocused } // Only enable when we have merged data and screen is focused
    );

    // Add Ticko products API hook - only when screen is focused
    const { data: tickoData, isLoading: isTickoLoading } = useTickoProducts({ enabled: !isLoadingData && isFocused }); // Only enable when we have merged data and screen is focused

    // Extract product search parameters from car data
    useEffect(() => {
        // Skip if already extracted or if we're still loading
        if (modelIdExtracted.current && productParamsExtracted.current || isLoadingData) {
            return;
        }

        if (vehicleData?.car) {
            // Extract model IDs for Skruvat and Mekonomen
            const modelIdValue = findValueInCarData('Bilkod');
            const carlinkmentIdValue = findValueInCarData('Carlinkment ID');
            const foundModelId = Array.isArray(modelIdValue) ? modelIdValue[0] : modelIdValue;
            const foundCarlinkmentId = Array.isArray(carlinkmentIdValue) ? carlinkmentIdValue[0] : carlinkmentIdValue;

            if (foundModelId) {
                setModelId(foundModelId);
            }
            if (foundCarlinkmentId) {
                setCarlinkmentId(foundCarlinkmentId);
            }
            modelIdExtracted.current = true;

            // Extract tire dimensions - try all possible field names
            const dimensions: string[] = [];

            const dackDimensionFram = findValueInCarData("Däckdimensioner");
            if (dackDimensionFram) {
                const values = Array.isArray(dackDimensionFram) ? dackDimensionFram : [dackDimensionFram];
                dimensions.push(...values.filter(Boolean));
            }

            if (dimensions.length > 0) {
                setTireDimensions(dimensions);
            }

            const ET_fram = findValueInCarData("ET fram tolerans");
            if (ET_fram) {
                const etToleranceStr = Array.isArray(ET_fram) ? ET_fram[0] : ET_fram;
                if (etToleranceStr) {
                    // Extract numbers from string like "från 35 mm till 40 mm"
                    const matches = etToleranceStr.match(/(\d+)\s*mm\s*till\s*(\d+)\s*mm/);
                    if (matches) {
                        const [_, min, max] = matches;
                        setEtTolerance({ et_min: parseInt(min), et_max: parseInt(max) });
                    }
                }
            }

            const Bultcirkel = findValueInCarData("Bultcirkel");
            if (Bultcirkel) {
                const pcdValue = Array.isArray(Bultcirkel) ? Bultcirkel[0] : Bultcirkel;
                if (pcdValue) {
                    setPcd(pcdValue);
                }
            }

            // Track that product parameters have been extracted
            productParamsExtracted.current = true;
        }
    }, [vehicleData, regNumber, isLoadingData]);

    useEffect(() => {
        // Skip if search was already performed or if we already have data
        if (dacklineSearchPerformed.current || (dacklineSearch.data &&
            ((dacklineSearch.data.wheels && dacklineSearch.data.wheels.length > 0) ||
                (dacklineSearch.data.tyre && dacklineSearch.data.tyre.length > 0)))) {
            return;
        }

        // Skip if we don't have all required parameters yet
        if (!tireDimensions.length || !etTolerance || !pcd) {
            return;
        }

        // Validate parameters
        if (isNaN(etTolerance.et_min) || isNaN(etTolerance.et_max)) {
            return;
        }

        // Clean and validate PCD
        const cleanedPcd = pcd.replace(/[^\d.]/g, '');
        if (!cleanedPcd) {
            return;
        }

        // Format PCD correctly (e.g. "5-110" -> "5x110")
        const formattedPcd = pcd.replace(/(\d+)[-](\d+)/, '$1x$2');
        if (!formattedPcd) {
            return;
        }

        // Mark that we're performing the search
        dacklineSearchPerformed.current = true;

        dacklineSearch.mutate({
            tyres: tireDimensions,
            et_min: etTolerance.et_min,
            et_max: etTolerance.et_max,
            pcd: formattedPcd
        });
    }, [tireDimensions, etTolerance, pcd, dacklineSearch.data]);

    // Update title and year when data is loaded
    useEffect(() => {
        if (vehicleData?.car) {
            // Get all the components for the title
            const marke = findValueInCarData('Bilmärke') || findValueInCarData('Fabrikat') || '';
            const modell = findValueInCarData('Bilmodell') || findValueInCarData('Handelsbeteckning') || '';
            const karosstyp = findValueInCarData('Karosstyp') || '';
            const typ = findValueInCarData('Typ') || '';
            const chassikod = findValueInCarData('Chassikod') || '';

            // Combine components with spaces between non-empty values
            const titleComponents = [marke, modell, karosstyp, typ, chassikod].filter(Boolean);
            const combinedTitle = titleComponents.join(' ').trim();

            // Use combined title or fallback to param
            if (combinedTitle) {
                setDisplayTitle(combinedTitle.toUpperCase());
            } else if (carTitle) {
                setDisplayTitle(carTitle);
            }

            // Get year from API
            const arsmodell = findValueInCarData('Årsmodell');

            if (arsmodell) {
                const yearValue = Array.isArray(arsmodell) ? arsmodell[0] : arsmodell;
                setDisplayYear(yearValue);
            } else if (carYear) {
                setDisplayYear(carYear);
            }
        }
    }, [vehicleData, carTitle, carYear]);

    // Normalize data and update filteredProducts with useMemo for performance
    const normalizedMekonomen = useMemo(() =>
        mekonomenData?.results ? normalizeMekonomenProducts(mekonomenData.results) : []
        , [mekonomenData]);

    const normalizedSkruvat = useMemo(() =>
        skruvatData?.results ? normalizeSkruvatProducts(skruvatData.results) : []
        , [skruvatData]);

    const normalizedDrivknuten = useMemo(() =>
        drivknutenData?.results ? normalizeDrivknutenProducts(drivknutenData.results) : []
        , [drivknutenData]);

    const normalizedTicko = useMemo(() =>
        tickoData?.results ? normalizeTickoProducts(tickoData.results) : []
        , [tickoData]);

    // Update the product filtering logic
    const tokenizeAndFilter = useCallback((searchStr: string, products: NormalizedProduct[]): NormalizedProduct[] => {
        // If no search query, return all products (limited to 500)
        if (!searchStr.trim()) {
            return products.slice(0, 500);
        }

        const tokens = searchStr.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .split(/\s+/)
            .filter(token => token.length > 1);

        if (!tokens.length) {
            return products.slice(0, 500);
        }

        // Use a more efficient filtering approach with early return
        const filtered = products.filter(product => {
            const searchText = [product.name, product.brand, product.sku, product.description, product.price]
                .join(' ').toLowerCase();
            return tokens.every(token => searchText.includes(token));
        });

        // Sort by price and limit to first 500 results
        return filtered
            .sort((a, b) => {
                const priceA = parseFloat(String(a.price).replace(/[^\d.-]/g, '')) || 0;
                const priceB = parseFloat(String(b.price).replace(/[^\d.-]/g, '')) || 0;
                return priceA - priceB;
            })
            .slice(0, 500); // Increased limit to 500 results
    }, []);

    // Däckline products - use effect to perform additional processing after normalization
    const normalizedDacklineWheels = useMemo(() => {
        const products = dacklineSearch.data?.wheels ? normalizeDacklineProducts(dacklineSearch.data.wheels) : [];
        let filteredAndSortedProducts = products;

        // Apply search query filter first
        if (searchQuery && searchQuery.trim()) {
            filteredAndSortedProducts = tokenizeAndFilter(searchQuery, filteredAndSortedProducts);
        }

        // Then apply size filter
        if (selectedDacklineSizes.length > 0) {
            filteredAndSortedProducts = filteredAndSortedProducts.filter(product =>
                product.size !== undefined && product.size !== null && selectedDacklineSizes.includes(Number(String(product.size)))
            );
        }

        // Sort by price
        return filteredAndSortedProducts.sort((a, b) => {
            const priceA = parseFloat(String(a.price).replace(/[^\\d.-]/g, '')) || 0;
            const priceB = parseFloat(String(b.price).replace(/[^\\d.-]/g, '')) || 0;
            return priceA - priceB;
        });
    }, [dacklineSearch.data?.wheels, selectedDacklineSizes, searchQuery]);

    const normalizedDacklineTyre = useMemo(() => {
        const products = dacklineSearch.data?.tyre ? normalizeDacklineProducts(dacklineSearch.data.tyre) : [];
        let filteredAndSortedProducts = products;

        // Apply search query filter first
        if (searchQuery && searchQuery.trim()) {
            filteredAndSortedProducts = tokenizeAndFilter(searchQuery, filteredAndSortedProducts);
        }

        // Then apply size filter
        if (selectedDacklineSizes.length > 0) {
            filteredAndSortedProducts = filteredAndSortedProducts.filter(product =>
                product.size !== undefined && product.size !== null && selectedDacklineSizes.includes(Number(String(product.size)))
            );
        }

        // Sort by price
        return filteredAndSortedProducts.sort((a, b) => {
            const priceA = parseFloat(String(a.price).replace(/[^\\d.-]/g, '')) || 0;
            const priceB = parseFloat(String(b.price).replace(/[^\\d.-]/g, '')) || 0;
            return priceA - priceB;
        });
    }, [dacklineSearch.data?.tyre, selectedDacklineSizes, searchQuery]);

    // Update the filtered products calculation with cleanup
    useEffect(() => {
        let isMounted = true;
        const updateFilteredProducts = () => {
            if (!isMounted) return;

            setFilteredProducts({
                mekonomen: tokenizeAndFilter(searchQuery, normalizedMekonomen),
                skruvat: tokenizeAndFilter(searchQuery, normalizedSkruvat),
                drivknuten: tokenizeAndFilter(searchQuery, normalizedDrivknuten),
                dacklineWheels: normalizedDacklineWheels, // Now properly filtered by both search and size
                dacklineTyre: normalizedDacklineTyre,     // Now properly filtered by both search and size
                ticko: tokenizeAndFilter(searchQuery, normalizedTicko)
            });
        };

        // Use requestAnimationFrame to prevent blocking the main thread
        requestAnimationFrame(updateFilteredProducts);

        // Cleanup function
        return () => {
            isMounted = false;
            // Keep previous filtered products until new ones are ready to avoid UI flicker.
        };
    }, [searchQuery, normalizedMekonomen, normalizedSkruvat, normalizedDrivknuten, normalizedDacklineWheels, normalizedDacklineTyre, normalizedTicko]);

    // Add cleanup effect for search changes
    useEffect(() => {
        return () => {
            // Clear search state
            setSearchInputText('');
            // Clear filtered products
            setFilteredProducts({
                mekonomen: [],
                skruvat: [],
                drivknuten: [],
                dacklineWheels: [],
                dacklineTyre: [],
                ticko: []
            });
        };
    }, []);

    // Detect when initial data has loaded and pre-process everything
    useEffect(() => {
        // Check if all data has loaded at least once
        if (
            preFilteredComplete ||
            (!mekonomenData && !skruvatData && !drivknutenData &&
                !dacklineSearch.data?.wheels && !dacklineSearch.data?.tyre && !tickoData)
        ) {
            return;
        }

        // Start pre-filtering on a slight delay to avoid blocking the UI
        const timer = setTimeout(() => {
            // Mark as complete after pre-filtering
            setPreFilteredComplete(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [
        mekonomenData,
        skruvatData,
        drivknutenData,
        dacklineSearch.data,
        tickoData
    ]);

    // Add cleanup effect for product data
    useEffect(() => {
        return () => {
            // Clear all product data when component unmounts
            setFilteredProducts({
                mekonomen: [],
                skruvat: [],
                drivknuten: [],
                dacklineWheels: [],
                dacklineTyre: [],
                ticko: []
            });
            Image.clearDiskCache();
            Image.clearMemoryCache();

            cleanupForScreen('CarDetails');
            performCacheCleanup();

            // Clear search state
            setSearchInputText('');

            // Clear any pending image loads
            const cleanupFn = preloadProductImages([]);
            if (cleanupFn) {
                cleanupFn();
            }
        };
    }, []);

    // Helper function to preload images for smoother scrolling
    const preloadProductImages = (products: NormalizedProduct[]): (() => void) | null => {
        if (!products.length) return null;

        // Limit to first 5 images
        const imagesToPreload = products.slice(0, 5);
        const cleanupRefs = new Set<string>();
        const abortControllers = new Set<AbortController>();
        const imageLoadPromises: Promise<void>[] = [];
        const imageCache = new Set<string>();

        imagesToPreload.forEach(product => {
            if (product.imageUrl && !product.imageUrl.includes('undefined') && !product.imageUrl.includes('null')) {
                const imageKey = product.imageUrl;
                cleanupRefs.add(imageKey);

                const controller = new AbortController();
                abortControllers.add(controller);

                // Create a promise that can be aborted
                const imagePromise = new Promise<void>((resolve, reject) => {
                    // Add a small delay to prevent rapid consecutive loads
                    const timeout = setTimeout(() => {
                        if (controller.signal.aborted) {
                            cleanupRefs.delete(imageKey);
                            resolve(); // Resolve instead of reject to prevent unhandled promise rejection
                            return;
                        }

                        RNImage.prefetch(product.imageUrl)
                            .then(() => {
                                if (!controller.signal.aborted) {
                                    cleanupRefs.delete(imageKey);
                                    imageCache.add(imageKey);
                                }
                                resolve();
                            })
                            .catch((error) => {
                                if (!controller.signal.aborted) {
                                    cleanupRefs.delete(imageKey);
                                    console.warn('Image prefetch failed:', error);
                                }
                                resolve(); // Resolve instead of reject to prevent unhandled promise rejection
                            });
                    }, 100); // Add a small delay

                    controller.signal.addEventListener('abort', () => {
                        clearTimeout(timeout);
                        cleanupRefs.delete(imageKey);
                        resolve(); // Resolve instead of reject to prevent unhandled promise rejection
                    });
                });

                imageLoadPromises.push(imagePromise);
            }
        });

        // Return cleanup function
        return () => {
            // Abort any pending image loads
            abortControllers.forEach(controller => {
                controller.abort();
            });
            abortControllers.clear();

            // Clear all references
            cleanupRefs.clear();
            imageCache.clear();

            // Clear any pending promises
            imageLoadPromises.length = 0;
        };
    };

    // Add cleanup effect for search changes
    useEffect(() => {
        let cleanupFn: (() => void) | null = null;

        // Cleanup previous images when search changes
        if (searchQuery) {
            cleanupFn = preloadProductImages([]);
        }

        return () => {
            if (cleanupFn) {
                cleanupFn();
            }
        };
    }, [searchQuery]);

    // Update the preload images effect to include cleanup
    useEffect(() => {
        let cleanupFn: (() => void) | null = null;

        if (normalizedMekonomen.length) {
            cleanupFn = preloadProductImages(normalizedMekonomen);
        } else if (normalizedSkruvat.length) {
            cleanupFn = preloadProductImages(normalizedSkruvat);
        } else if (normalizedDrivknuten.length) {
            cleanupFn = preloadProductImages(normalizedDrivknuten);
        } else if (normalizedDacklineWheels.length) {
            cleanupFn = preloadProductImages(normalizedDacklineWheels);
        } else if (normalizedDacklineTyre.length) {
            cleanupFn = preloadProductImages(normalizedDacklineTyre);
        } else if (normalizedTicko.length) {
            cleanupFn = preloadProductImages(normalizedTicko);
        }

        // Cleanup function for the effect
        return () => {
            if (cleanupFn) {
                cleanupFn();
            }
        };
    }, [
        normalizedMekonomen,
        normalizedSkruvat,
        normalizedDrivknuten,
        normalizedDacklineWheels,
        normalizedDacklineTyre,
        normalizedTicko
    ]);

    // Add a new state for the favorite popup
    const [favoritePopupVisible, setFavoritePopupVisible] = useState(false);

    // Use garage hooks to fetch garages - only when screen is focused
    const { data: userGarages, isLoading: isLoadingGarages } = useGarages({ enabled: isFocused });

    // Check if car is in any garage when garages data is loaded
    useEffect(() => {
        if (userGarages && Array.isArray(userGarages) && regNumber) {
            setIsFavorite(isCarInGarage(userGarages, regNumber));
        } else {
            setIsFavorite(false);
        }
    }, [userGarages, regNumber]);

    // Handle saving to favorite lists
    const handleSaveToFavorites = (selectedListIds: string[]) => {
        setIsFavorite(selectedListIds.length > 0);
        setFavoritePopupVisible(false);
    };

    // Use the improved image handling from the hook
    useEffect(() => {
        // For desktop web, use high_res image if available
        if (isDesktopWeb() && hookHighResImageUrl) {
            setCarImageUrl(hookHighResImageUrl);
            setImageError(false);
            return;
        }

        // For mobile or if high_res not available, use regular hookImageUrl (Car Image)
        if (hookImageUrl) {
            setCarImageUrl(hookImageUrl);
            setImageError(false);
        } else if (!carImageUrl) {
            setImageError(true);
        }
    }, [hookImageUrl, hookHighResImageUrl]);

    // Handle image error to trigger fallback
    const handleImageError = useCallback(() => {
        if (onImageLoadError) {
            onImageLoadError();
        }
        // requestAnimationFrame(() => {
        setImageError(true);
        // setCarImageUrl(ImagePath.BMWImage);
        // });
    }, [onImageLoadError]);


    // Reset extraction flags when regNumber changes
    useEffect(() => {
        modelIdExtracted.current = false;
        productParamsExtracted.current = false;
    }, [regNumber]);

    // Define handleToggleDacklineSize INSIDE CarDetails component scope
    const handleToggleDacklineSize = useCallback((size: number) => {
        setSelectedDacklineSizes(prevSelectedSizes => {
            if (prevSelectedSizes.includes(size)) {
                return prevSelectedSizes.filter(s => s !== size);
            } else {
                return [...prevSelectedSizes, size].sort((a, b) => a - b);
            }
        });
    }, []);

    // Define header props for both mobile and desktop
    const headerProps = {
        carImageUrl,
        imageError,
        regNumber: regNumber || '',
        displayTitle,
        displayYear,
        isFavorite,
        isGuestMode,
        isPremiumUser,
        onImageError: handleImageError,
        onFavoritePress: toggleFavorite,
        onMenuPress: handleMenuPress,
        onProfilePress: handleProfilePress,
    };

    // // console.log("carImageUrl", carImageUrl);
    return (
        <KeyboardAvoidingWrapper>
            <View style={styles.container}>
                <RNStatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                <Stack.Screen
                    options={{
                        headerShown: false,
                        animation: 'fade',
                        animationDuration: 300,
                        contentStyle: {
                            backgroundColor: 'transparent',
                        },
                    }}
                />

                {/* SEO Head Tags */}
                {vehicleData?.car && regNumber && (
                    <CarDetailsSEO
                        carData={{
                            regNumber: regNumber,
                            make: (findValueInCarData('Bilmärke') || findValueInCarData('Fabrikat') || '') as string,
                            model: (findValueInCarData('Bilmodell') || findValueInCarData('Handelsbeteckning') || '') as string,
                            year: (findValueInCarData('Årsmodell') || displayYear || '') as string,
                            imageUrl: carImageUrl || undefined,
                            description: `Komplett information om ${displayTitle} ${displayYear}. Få detaljerade biluppgifter, tekniska specifikationer och hitta bildelar för ${regNumber}.`,
                            specifications: {
                                fuel: (findValueInCarData('Bränsletyp') || findValueInCarData('Bränsle') || '') as string,
                                transmission: (findValueInCarData('Växellåda') || '') as string,
                                engine: (findValueInCarData('Motor') || findValueInCarData('Motorvolym') || '') as string,
                                seats: (findValueInCarData('Antal platser') || '') as string
                            }
                        }}
                    />
                )}
                {menuVisible && <PopupMenu
                    visible={true}
                    onClose={() => setMenuVisible(false)}
                    popupPosition={"right"}
                />}
                {profileMenuVisible && <ProfilePopupMenu
                    visible={true}
                    onClose={() => setProfileMenuVisible(false)}
                />}

                <FooterWrapper
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {/* Conditional Header Rendering - Now inside ScrollView */}
                    {isDesktopWeb() ? (
                        <DesktopViewWrapper>
                            <DesktopHeader {...headerProps} />
                        </DesktopViewWrapper>
                    ) : (
                        <MobileHeader {...headerProps} />
                    )}

                    <DesktopViewWrapper>
                        <View style={[styles.contentContainer]}>
                            {!vehicleData?.car && vehicleData?.isError ? (
                                <NoResultsComponent regNr={regNumber} />
                            ) : (
                                <>
                                    <View style={styles.detailsCard}>
                                        {hasProAccess() && (
                                            <CarDetailSection title="Bilvärdering Pro" initiallyOpen={false}>
                                                <BilvarderingPro 
                                                    regNumber={regNumber} 
                                                    vehicleData={vehicleData} 
                                                    findValueInCarData={findValueInCarData}
                                                />
                                            </CarDetailSection>
                                        )}
                                        <CarDetailSection title="Biluppgifter" initiallyOpen={true}>
                                            <View style={{ marginTop: 5 }}>
                                                {!vehicleData?.car ? (
                                                    <View style={styles.specsContainer}>
                                                        {Array(6).fill(null).map((_, index) => (
                                                            <View key={index} style={styles.specItem}>
                                                                <View style={styles.specIconTitleWrapper}>
                                                                    <View style={styles.infoSection}>
                                                                        <View style={[styles.placeholder, { width: '60%', height: 12 }]} />
                                                                        <View style={[styles.placeholder, { width: '80%', height: 16, marginTop: 4 }]} />
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        ))}
                                                    </View>
                                                ) : (
                                                    <>
                                                        <CarDetailsRenderer
                                                            vehicleData={vehicleData}
                                                            findValueInCarData={findValueInCarData}
                                                            regNumber={regNumber}
                                                        />
                                                        <View style={[styles.infoCardsContainer, { marginTop: 15 }]}>
                                                            <View style={[styles.chassisNumberStyle, { flex: 1, marginRight: isDesktopWeb() ? 8 : 0 }]}>
                                                                <View style={styles.chassisNumberInfoContainer as any}>
                                                                    <MyText style={styles.chassisNumberTxt as any}>Chassinummer</MyText>
                                                                    <MyText style={styles.chassisNumberValueTxt as any}>
                                                                        {findValueInCarData('Chassinummer') || '-'}
                                                                    </MyText>
                                                                </View>
                                                            </View>
                                                            {(() => {
                                                                // Get the fuel type
                                                                const fuelType = findValueInCarData('Bränsletyp') || '-';

                                                                // Determine style based on fuel type
                                                                let fuelBackgroundStyle = {};
                                                                let gradientColors: [string, string] | null = null;

                                                                if (fuelType === 'BENSIN') {
                                                                    fuelBackgroundStyle = { backgroundColor: '#12B262' };
                                                                } else if (fuelType === 'DIESEL') {
                                                                    fuelBackgroundStyle = { backgroundColor: '#181818' };
                                                                } else if (fuelType === 'BENSIN/ELHYBRID') {
                                                                    gradientColors = ['#12B262', '#013D7B'];
                                                                } else if (fuelType === 'DIESEL/ELHYBRID') {
                                                                    gradientColors = ['#181818', '#013D7B'];
                                                                } else if (fuelType.includes('EL')) {
                                                                    fuelBackgroundStyle = { backgroundColor: '#013D7B' };
                                                                } else {
                                                                    fuelBackgroundStyle = { backgroundColor: myColors.black };
                                                                }

                                                                return (
                                                                    <View style={[styles.fuelStyle, gradientColors ? {} : fuelBackgroundStyle, { flex: 1, marginLeft: isDesktopWeb() ? 8 : 0, marginTop: isDesktopWeb() ? 0 : 15, marginBottom: 15 }]}>
                                                                        {gradientColors ? (
                                                                            <LinearGradient
                                                                                colors={gradientColors}
                                                                                start={{ x: 0, y: 0 }}
                                                                                end={{ x: 1, y: 0 }}
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    left: 0,
                                                                                    right: 0,
                                                                                    top: 0,
                                                                                    bottom: 0,
                                                                                    borderRadius: 12
                                                                                }}
                                                                            />
                                                                        ) : null}
                                                                        <View style={styles.fuelInfoContainer as any}>
                                                                            <MyText style={styles.fuelTxt as any}>Drivmedel</MyText>
                                                                            <MyText style={styles.fuelValueTxt as any}>
                                                                                {fuelType}
                                                                            </MyText>
                                                                        </View>
                                                                    </View>
                                                                );
                                                            })()}
                                                        </View>
                                                    </>
                                                )}
                                            </View>
                                        </CarDetailSection>
                                        <CarDetailSection title="Bildelar & tillbehör" initiallyOpen={activeTab === 'Bildelar'}>
                                            <View style={styles.productInfoContainer as any}>
                                                <ProductSearchBar
                                                    placeholder="Sök i bildelar & tillbehör..."
                                                    value={searchInputText}
                                                    onChangeText={setSearchInputText}
                                                />

                                                <View style={styles.productSections}>
                                                    <ProductSection
                                                        title="Bildelar nära dig"
                                                        isOpen={filteredProducts.mekonomen.length > 0}
                                                        icon={ImagePath.SvgIcons.CarIcon}
                                                        hasContent={filteredProducts.mekonomen.length > 0 || isMekonomenLoading}
                                                        isSearching={!!searchInputText}
                                                    >
                                                        {isMekonomenLoading ? (
                                                            <View style={{ padding: 20, alignItems: 'center' }}>
                                                                <ActivityIndicator size="small" color={myColors.white} />
                                                                <MyText style={{ marginTop: 10, color: myColors.white, fontSize: 12 }}>
                                                                    Laddar bildelar...
                                                                </MyText>
                                                            </View>
                                                        ) : mekonomenPagination.currentItems.length > 0 ? (
                                                            <>
                                                                <ScrollableProductList
                                                                    products={mekonomenPagination.currentItems}
                                                                    renderItem={(item, index) => (
                                                                        <ProductCard
                                                                            key={index}
                                                                            name={item.name}
                                                                            brand={item.brand ?? ''}
                                                                            price={`${item.price} kr`}
                                                                            imageUrl={item.imageUrl}
                                                                            productUrl={item.trackingUrl}
                                                                        />
                                                                    )}
                                                                    onEndReached={mekonomenPagination.loadMore}
                                                                    hasMore={mekonomenPagination.hasMore}
                                                                    isLoadingMore={mekonomenPagination.isLoadingMore}
                                                                />
                                                                <AutoLoadIndicator
                                                                    hasMore={mekonomenPagination.hasMore}
                                                                    isLoadingMore={mekonomenPagination.isLoadingMore}
                                                                    displayedItems={mekonomenPagination.displayedItems}
                                                                    totalItems={mekonomenPagination.totalItems}
                                                                />
                                                            </>
                                                        ) : (
                                                            <View style={{ padding: 10, alignItems: 'center' }}>
                                                                <MyText style={{ color: myColors.white, fontSize: 12 }}>
                                                                    Inga produkter hittades
                                                                </MyText>
                                                            </View>
                                                        )}
                                                    </ProductSection>
                                                    <ProductSection
                                                        title="Bildelar på nätet"
                                                        isOpen={filteredProducts.skruvat.length > 0}
                                                        icon={ImagePath.SvgIcons.CarIcon}
                                                        hasContent={filteredProducts.skruvat.length > 0 || isSkruvatLoading}
                                                        isSearching={!!searchInputText}
                                                    >
                                                        {isSkruvatLoading ? (
                                                            <View style={{ padding: 20, alignItems: 'center' }}>
                                                                <ActivityIndicator size="small" color={myColors.white} />
                                                                <MyText style={{ marginTop: 10, color: myColors.white, fontSize: 12 }}>
                                                                    Laddar bildelar...
                                                                </MyText>
                                                            </View>
                                                        ) : skruvatPagination.currentItems.length > 0 ? (
                                                            <>
                                                                <ScrollableProductList
                                                                    products={skruvatPagination.currentItems}
                                                                    renderItem={(item, index) => (
                                                                        <ProductCard
                                                                            key={index}
                                                                            name={item.name}
                                                                            brand={item.brand ?? ''}
                                                                            price={`${item.price} kr`}
                                                                            imageUrl={item.imageUrl}
                                                                            productUrl={item.trackingUrl}
                                                                        />
                                                                    )}
                                                                    onEndReached={skruvatPagination.loadMore}
                                                                    hasMore={skruvatPagination.hasMore}
                                                                    isLoadingMore={skruvatPagination.isLoadingMore}
                                                                />
                                                                <AutoLoadIndicator
                                                                    hasMore={skruvatPagination.hasMore}
                                                                    isLoadingMore={skruvatPagination.isLoadingMore}
                                                                    displayedItems={skruvatPagination.displayedItems}
                                                                    totalItems={skruvatPagination.totalItems}
                                                                />
                                                            </>
                                                        ) : (
                                                            <View style={{ padding: 10, alignItems: 'center' }}>
                                                                <MyText style={{ color: myColors.white, fontSize: 12 }}>
                                                                    Inga produkter hittades
                                                                </MyText>
                                                            </View>
                                                        )}
                                                    </ProductSection>

                                                    <ProductSection
                                                        title="Drivaxel - Drivknut - Drivlina"
                                                        isOpen={filteredProducts.drivknuten.length > 0}
                                                        icon={ImagePath.SvgIcons.CarIcon}
                                                        hasContent={filteredProducts.drivknuten.length > 0 || isDrivknutenLoading}
                                                        isSearching={!!searchInputText}
                                                    >
                                                        {isDrivknutenLoading ? (
                                                            <View style={{ padding: 20, alignItems: 'center' }}>
                                                                <ActivityIndicator size="small" color={myColors.white} />
                                                                <MyText style={{ marginTop: 10, color: myColors.white, fontSize: 12 }}>
                                                                    Laddar bildelar...
                                                                </MyText>
                                                            </View>
                                                        ) : drivknutenPagination.currentItems.length > 0 ? (
                                                            <>
                                                                <ScrollableProductList
                                                                    products={drivknutenPagination.currentItems}
                                                                    renderItem={(item, index) => (
                                                                        <ProductCard
                                                                            key={index}
                                                                            name={item.name}
                                                                            brand={item.brand ?? ''}
                                                                            price={`${item.price} kr`}
                                                                            imageUrl={item.imageUrl}
                                                                            productUrl={item.trackingUrl}
                                                                        />
                                                                    )}
                                                                    onEndReached={drivknutenPagination.loadMore}
                                                                    hasMore={drivknutenPagination.hasMore}
                                                                    isLoadingMore={drivknutenPagination.isLoadingMore}
                                                                />
                                                                <AutoLoadIndicator
                                                                    hasMore={drivknutenPagination.hasMore}
                                                                    isLoadingMore={drivknutenPagination.isLoadingMore}
                                                                    displayedItems={drivknutenPagination.displayedItems}
                                                                    totalItems={drivknutenPagination.totalItems}
                                                                />
                                                            </>
                                                        ) : (
                                                            <View style={{ padding: 10, alignItems: 'center' }}>
                                                                <MyText style={{ color: myColors.white, fontSize: 12 }}>
                                                                    Inga produkter hittades
                                                                </MyText>
                                                            </View>
                                                        )}
                                                    </ProductSection>
                                                    <ProductSection
                                                        title="Däck & Fälg"
                                                        isOpen={filteredProducts.dacklineWheels.length > 0 || filteredProducts.dacklineTyre.length > 0}
                                                        icon={ImagePath.SvgIcons.CarIcon}
                                                        hasContent={(normalizedDacklineWheels.length > 0 || normalizedDacklineTyre.length > 0) || dacklineSearch.isPending}
                                                        isSearching={!!searchInputText}
                                                    >
                                                        {dacklineSearch.isPending ? (
                                                            <View style={{ padding: 20, alignItems: 'center' }}>
                                                                <ActivityIndicator size="small" color={myColors.white} />
                                                                <MyText style={{ marginTop: 10, color: myColors.white, fontSize: 12 }}>
                                                                    Laddar däck och fälgar...
                                                                </MyText>
                                                            </View>
                                                        ) : (
                                                            <>
                                                                <DacklineSizeFilter
                                                                    availableSizes={dacklineSearch.data?.sizes}
                                                                    selectedSizes={selectedDacklineSizes}
                                                                    onToggleSize={handleToggleDacklineSize}
                                                                />
                                                                {(filteredProducts.dacklineWheels && filteredProducts.dacklineWheels.length > 0) && (
                                                                    <View>
                                                                        <MyText style={{
                                                                            fontSize: 12,
                                                                            fontWeight: 'bold',
                                                                            color: myColors.white,
                                                                            marginBottom: 5,
                                                                            marginTop: (dacklineSearch.data?.sizes && dacklineSearch.data.sizes.length > 0) ? 10 : 0,
                                                                            marginHorizontal: 15,
                                                                        }}>
                                                                            Fälgar
                                                                        </MyText>
                                                                        <ScrollableProductList
                                                                            products={filteredProducts.dacklineWheels}
                                                                            renderItem={(item, index) => (
                                                                                <ProductCard
                                                                                    key={index}
                                                                                    name={item.name}
                                                                                    brand={item.brand ?? ''}
                                                                                    price={`${item.price} kr`}
                                                                                    imageUrl={item.imageUrl}
                                                                                    productUrl={item.trackingUrl}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </View>
                                                                )}

                                                                {(filteredProducts.dacklineTyre && filteredProducts.dacklineTyre.length > 0) && (
                                                                    <View>
                                                                        <MyText style={{
                                                                            fontSize: 12,
                                                                            fontWeight: 'bold',
                                                                            color: myColors.white,
                                                                            marginTop: 10,
                                                                            marginBottom: 5,
                                                                            marginHorizontal: 15,
                                                                        }}>
                                                                            Däck
                                                                        </MyText>
                                                                        <ScrollableProductList
                                                                            products={filteredProducts.dacklineTyre}
                                                                            renderItem={(item, index) => (
                                                                                <ProductCard
                                                                                    key={index}
                                                                                    name={item.name}
                                                                                    brand={item.brand ?? ''}
                                                                                    price={`${item.price} kr`}
                                                                                    imageUrl={item.imageUrl}
                                                                                    productUrl={item.trackingUrl}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </View>
                                                                )}

                                                                {filteredProducts.dacklineWheels.length === 0 && filteredProducts.dacklineTyre.length === 0 && (
                                                                    <View style={{ padding: 10, alignItems: 'center' }}>
                                                                        <MyText style={{ color: myColors.white, fontSize: 12 }}>
                                                                            Inga däck eller fälgar hittades
                                                                        </MyText>
                                                                    </View>
                                                                )}
                                                            </>
                                                        )}
                                                    </ProductSection>

                                                    <ProductSection
                                                        title="Modellbilar"
                                                        isOpen={filteredProducts.ticko.length > 0}
                                                        icon={ImagePath.SvgIcons.CarIcon}
                                                        hasContent={filteredProducts.ticko.length > 0 || isTickoLoading}
                                                        isSearching={!!searchInputText}
                                                    >
                                                        {isTickoLoading ? (
                                                            <View style={{ padding: 20, alignItems: 'center' }}>
                                                                <ActivityIndicator size="small" color={myColors.white} />
                                                                <MyText style={{ marginTop: 10, color: myColors.white, fontSize: 12 }}>
                                                                    Laddar modellbilar...
                                                                </MyText>
                                                            </View>
                                                        ) : tickoPagination.currentItems.length > 0 ? (
                                                            <>
                                                                <ScrollableProductList
                                                                    products={tickoPagination.currentItems}
                                                                    renderItem={(item, index) => (
                                                                        <ProductCard
                                                                            key={index}
                                                                            name={item.name}
                                                                            brand={item.brand ?? ''}
                                                                            price={`${item.price} kr`}
                                                                            imageUrl={item.imageUrl}
                                                                            productUrl={item.trackingUrl}
                                                                        />
                                                                    )}
                                                                    onEndReached={tickoPagination.loadMore}
                                                                    hasMore={tickoPagination.hasMore}
                                                                    isLoadingMore={tickoPagination.isLoadingMore}
                                                                />
                                                                <AutoLoadIndicator
                                                                    hasMore={tickoPagination.hasMore}
                                                                    isLoadingMore={tickoPagination.isLoadingMore}
                                                                    displayedItems={tickoPagination.displayedItems}
                                                                    totalItems={tickoPagination.totalItems}
                                                                />
                                                            </>
                                                        ) : (
                                                            <View style={{ padding: 10, alignItems: 'center' }}>
                                                                <MyText style={{ color: myColors.white, fontSize: 12 }}>
                                                                    Inga modellbilar hittades
                                                                </MyText>
                                                            </View>
                                                        )}
                                                    </ProductSection>
                                                </View>
                                            </View>
                                        </CarDetailSection>
                                        <CarDetailSection
                                            title="Bilvärdering"
                                            initiallyOpen={activeTab === 'Statistik'}
                                        >
                                            <View style={{ marginTop: 5 }}>
                                                <View style={styles.productSections}>
                                                    <TouchableOpacity
                                                        style={styles.externalLinkButton}
                                                        onPress={() => openExternalUrl('https://do.riddermarkbil.se/t/t?a=1800849169&as=1948156165&t=2&tk=1')}
                                                        activeOpacity={0.7}
                                                    >
                                                        <View style={{ flex: 1 }}>
                                                            <MyText style={styles.externalLinkButtonText}>Värdera din bil gratis</MyText>
                                                        </View>
                                                        {/* <Feather name="external-link" size={20} color={myColors.white} /> */}
                                                        <IconExternalLink
                                                            color={myColors.white}
                                                            size={20}
                                                        />
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={styles.externalLinkButton}
                                                        onPress={() => openExternalUrl('https://www.compricer.se/forsakring/bil/?domain=adtraction.compricer.se&utm_source=adtrac&utm_medium=affiliate&utm_campaign=adtrac_plan&utm_content=adtrac_plan_1&cn=at_gd&cv=0B9CDB4D9AF5BA1710E8924E66FDF234F455C16F&at_gd=0B9CDB4D9AF5BA1710E8924E66FDF234F455C16F')}
                                                        activeOpacity={0.7}
                                                    >
                                                        <View style={{ flex: 1 }}>
                                                            <MyText style={styles.externalLinkButtonText}>Bilförsäkring</MyText>
                                                        </View>
                                                        {/* <Feather name="external-link" size={20} color={myColors.white} /> */}
                                                        <IconExternalLink
                                                            color={myColors.white}
                                                            size={20}
                                                        />
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={styles.externalLinkButton}
                                                        onPress={() => openExternalUrl('https://www.compricer.se/privatlan/?domain=adtraction.compricer.se&utm_source=adtrac&utm_medium=affiliate&utm_campaign=adtrac_plan&utm_content=adtrac_plan_1&cn=at_gd&cv=0B9CDB4D9AF5BA1710E8924E66FDF234F455C16F&at_gd=0B9CDB4D9AF5BA1710E8924E66FDF234F455C16F')}
                                                        activeOpacity={0.7}
                                                    >
                                                        <View style={{ flex: 1 }}>
                                                            <MyText style={styles.externalLinkButtonText}>Billån & Finansiering</MyText>
                                                        </View>
                                                        {/* <Feather name="external-link" size={20} color={myColors.white} /> */}
                                                        <IconExternalLink
                                                            color={myColors.white}
                                                            size={20}
                                                        />
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={styles.externalLinkButton}
                                                        onPress={() => openExternalUrl('https://www.liveit.se/upplevelsepresenter/motorsport?utm_source=adtraction&utm_medium=affiliate&utm_campaign=adtraction&at_gd=6752C006E6D1936B7B3506B6E879B482F3C03128')}
                                                        activeOpacity={0.7}
                                                    >
                                                        <View style={{ flex: 1 }}>
                                                            <MyText style={styles.externalLinkButtonText}>Motorsportupplevelse - presentkort</MyText>
                                                        </View>
                                                        {/* <Feather name="external-link" size={20} color={myColors.white} /> */}
                                                        <IconExternalLink
                                                            color={myColors.white}
                                                            size={20}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </CarDetailSection>

                                        <VehicleInfoComponent
                                            vehicleData={vehicleData || undefined}
                                            activeTab={activeTab}
                                            isGuestMode={isGuestMode}
                                        />

                                        <CarDetailSection
                                            title="Släpvagnskalkylator"
                                            initiallyOpen={activeTab === 'Släpvagnskalkylator'}
                                        >
                                            <View style={{ marginTop: 5, marginBottom: isDesktopWeb() ? 50 : 0 }}>
                                                <TrailerCalculator
                                                    carRegNumber={regNumber || ''}
                                                    modellid={(() => {
                                                        const bilkod = findValueInCarData('Bilkod');
                                                        if (!bilkod) return 0;
                                                        const value = Array.isArray(bilkod) ? bilkod[0] : bilkod;
                                                        return parseInt(value) || 0;
                                                    })()}
                                                    carRegNumberEditable={true}
                                                />
                                            </View>
                                        </CarDetailSection>
                                    </View>
                                    <View style={styles.bottomPadding} />
                                </>
                            )}
                        </View>
                    </DesktopViewWrapper>
                    {!isDesktopWeb() && <MyText style={styles.footerText}>© {moment().year()} Bilregistret.ai | Alla rättigheter reserverade Bilregistret Sverige AB {"\n"}Ansvarig utgivare: Alen Rasic, databasens namn: bilregistret.ai</MyText>}
                </FooterWrapper>

                <FavoriteListPopup
                    visible={favoritePopupVisible}
                    onClose={() => setFavoritePopupVisible(false)}
                    onSave={handleSaveToFavorites}
                    carDetails={{
                        title: displayTitle || '',
                        year: displayYear || '',
                        regNumber: regNumber || '',
                        id: ''
                    }}
                />
            </View>
        </KeyboardAvoidingWrapper>
    );
}

type CarDetailsStyles = {
    container: ViewStyle;
    scrollView: ViewStyle;
    loadingContainer: ViewStyle;
    contentContainer: ViewStyle;
    externalLinkButton: ViewStyle;
    externalLinkButtonText: TextStyle;
    bottomPadding: ViewStyle;
    sectionContainer: ViewStyle;
    sectionHeader: ViewStyle;
    sectionTitle: TextStyle;
    sectionContent: ViewStyle;
    specsContainer: ViewStyle;
    specItem: ViewStyle;
    specIconTitleWrapper: ViewStyle;
    infoSection: ViewStyle;
    specLabel: TextStyle;
    specValue: TextStyle;
    VehiclestatusFieldStyle: TextStyle;
    valueContainer: ViewStyle;
    descriptionText: TextStyle;
    button: ViewStyle;
    buttonText: TextStyle;
    placeholder: ViewStyle;
    productCard: ViewStyle;
    productImage: ImageStyle;
    productBrand: TextStyle;
    productName: TextStyle;
    productPrice: TextStyle;
    carouselContainer: ViewStyle;
    detailsCard: ViewStyle;
    chassisNumberStyle: ViewStyle;
    chassisNumberInfoContainer: ViewStyle;
    chassisNumberTxt: TextStyle;
    chassisNumberValueTxt: TextStyle;
    fuelStyle: ViewStyle;
    productInfoContainer: ViewStyle;
    productSections: ViewStyle;
    footerText: TextStyle;
    noResultsContainer: ViewStyle;
    noResultsContent: ViewStyle;
    noResultsIcon: ViewStyle;
    noResultsIconInner: ViewStyle;
    noResultsTitle: TextStyle;
    suggestionsContainer: ViewStyle;
    suggestionsTitle: TextStyle;
    suggestionsList: ViewStyle;
    suggestionItem: ViewStyle;
    suggestionText: TextStyle;
    suggestionRegNumber: TextStyle;
    productImageContainer: ViewStyle;
    productImagePlaceholder: ViewStyle;
    paginationContainer: ViewStyle;
    paginationText: TextStyle;
    loadMoreButton: ViewStyle;
    loadMoreText: TextStyle;
    autoLoadContainer: ViewStyle;
    loadingIndicatorContainer: ViewStyle;
    loadingText: TextStyle;
    // Add styles for DacklineSizeFilter
    sizeFilterContainer: ViewStyle;
    sizeFilterScrollViewContent: ViewStyle;
    sizeFilterButton: ViewStyle;
    sizeFilterButtonNormal: ViewStyle;
    sizeFilterButtonSelected: ViewStyle;
    sizeFilterButtonText: TextStyle;
    sizeFilterButtonTextNormal: TextStyle;
    sizeFilterButtonTextSelected: TextStyle;
    infoCardsContainer: ViewStyle;
    // Add new styles for vehicle info desktop layout
    vehicleInfoDesktopGrid: ViewStyle;
    vehicleInfoMobileContainer: ViewStyle;
    vehicleInfoDesktopCard: ViewStyle;
    vehicleInfoMobileCard: ViewStyle;
    vehicleInfoLoadingCard: ViewStyle;
    vehicleInfoLoadingContent: ViewStyle;
    vehicleInformationSectionContainer: ViewStyle;
    vehicleInformationSectionHeader: ViewStyle;
    vehicleInformationSectionTitle: TextStyle;
    vehicleInformationSectionDesktop: ViewStyle;
    fuelInfoContainer: ViewStyle;
    fuelTxt: TextStyle;
    fuelValueTxt: TextStyle;
    vehicleInformationSectionAnimated: ViewStyle;
    animatedDecorativeBar: ViewStyle;
    navLeftButton: ViewStyle;
    navRightButton: ViewStyle;
    navButtonDisabled: ViewStyle;
    blurOverlay: ViewStyle;
    blurOverlayContent: ViewStyle;
    loginFloatInfo: ViewStyle;
    rotatedMessageBox: ViewStyle;
    rotatedMessageBoxSecondary: ViewStyle;
    rotatedMessageText: TextStyle;
    loginBox: ViewStyle;
    bankIdButton: ViewStyle;
    bankIdButtonText: TextStyle;
    bankIdIcon: ViewStyle;
    bankIdIconText: TextStyle;
};

const styles = StyleSheet.create<CarDetailsStyles>({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
        marginBottom: isDesktopWeb() ? -20 : 0,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 100,
    },
    contentContainer: {
        paddingTop: isDesktopWeb() ? 25 : 10,
        backgroundColor: myColors.screenBackgroundColor,
    },
    externalLinkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        backgroundColor: myColors.productBackgroundGrey,
        height: 45,
        width: '100%',
        marginBottom: 7,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    externalLinkButtonText: {
        fontSize: 13,
        color: myColors.white,
        fontWeight: 'bold',
    },
    bottomPadding: {
        height: 20,
    },
    sectionContainer: {
        marginBottom: 5,
        borderBottomWidth: 1,
        marginHorizontal: 15,
        borderColor: myColors.border.light
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 20,
        color: myColors.text.primary,
    },
    sectionContent: {
        paddingTop: 0,
    },
    specsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: "space-between",
        width: '100%',
        gap: 8,
    },
    specItem: {
        backgroundColor: myColors.white,
        height: 71,
        borderRadius: 8,
        width: isDesktopWeb() ? '24%' : '48%', // Use 24% width on desktop for 4 columns
        marginVertical: 7,
        padding: 15
    },
    specIconTitleWrapper: {
        flexDirection: "row",
        alignItems: "flex-start",
        width: '100%'
    },
    infoSection: {
        flex: 1,
        width: '100%'
    },
    specLabel: {
        fontSize: 12,
        color: myColors.baseColors.light3,
        marginBottom: 8,
    },
    specValue: {
        fontSize: 16,
        color: myColors.baseColors.light3,
        fontWeight: 'bold',
    },
    VehiclestatusFieldStyle: {
        fontSize: 16,
        color: myColors.lightGreen,
        fontWeight: 'bold',
    },
    valueContainer: {
        paddingBottom: 15,
        backgroundColor: myColors.white,
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 22,
        color: myColors.text.secondary,
        marginBottom: 20,
    },
    button: {
        backgroundColor: myColors.primary.main,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: myColors.text.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    placeholder: {
        backgroundColor: myColors.border.light,
        borderRadius: 4,
    },
    productCard: {
        backgroundColor: myColors.white,
        borderRadius: 8,
        padding: 8,
        marginRight: 10,
        marginBottom: 10,
        width: isDesktopWeb() ? width / 11.5 : width / 4,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImageContainer: {
        width: 70,
        height: 70,
        marginBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
    },
    productBrand: {
        fontSize: 10,
        color: myColors.baseColors.light3,
        textAlign: 'center',
    },
    productName: {
        fontSize: 11,
        color: myColors.baseColors.light3,
        textAlign: 'center',
        fontWeight: 'bold',
        marginVertical: 2,
        height: 28,
        overflow: 'hidden',
    },
    productPrice: {
        fontSize: 12,
        color: myColors.primary.main,
        fontWeight: 'bold',
        marginTop: 2,
    },
    carouselContainer: {
        position: 'relative',
        marginTop: 2,
    },
    detailsCard: {
        padding: 0,
    },
    chassisNumberStyle: {
        height: Platform.OS === 'web' ? (isMobileWeb() ? 200 : 120) : 85,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: Platform.OS === 'web' ? 20 : 15,
        paddingVertical: Platform.OS === 'web' ? 15 : 0,
        backgroundColor: "#e77832",
        width: '100%'
    },
    chassisNumberInfoContainer: {
        width: "100%",
        paddingRight: Platform.OS === 'web' ? 20 : 15
    },
    chassisNumberTxt: {
        fontSize: Platform.OS === 'web' ? (isMobileWeb() ? 18 : 16) : 14,
        color: myColors.white,
        fontWeight: 'bold',
        marginBottom: Platform.OS === 'web' ? 8 : 0
    },
    chassisNumberValueTxt: {
        fontSize: Platform.OS === 'web' ? 24 : 22,
        color: myColors.white,
        fontWeight: 'bold',
        marginTop: Platform.OS === 'web' ? 0 : 10,
        textTransform: Platform.OS === 'web' ? 'none' : 'uppercase'
    },
    fuelStyle: {
        height: Platform.OS === 'web' ? (isMobileWeb() ? 200 : 120) : 85,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: Platform.OS === 'web' ? 20 : 15,
        paddingVertical: Platform.OS === 'web' ? 15 : 0,
        backgroundColor: "#e77832",
        width: '100%'
    },
    fuelInfoContainer: {
        width: "100%",
        paddingRight: Platform.OS === 'web' ? 20 : 15
    },
    fuelTxt: {
        fontSize: Platform.OS === 'web' ? (isMobileWeb() ? 18 : 16) : 14,
        color: myColors.white,
        fontWeight: 'bold',
        marginBottom: Platform.OS === 'web' ? 8 : 0
    },
    fuelValueTxt: {
        fontSize: Platform.OS === 'web' ? 24 : 22,
        color: myColors.white,
        fontWeight: 'bold',
        marginTop: Platform.OS === 'web' ? 0 : 10,
        textTransform: Platform.OS === 'web' ? 'none' : 'uppercase'
    },
    productInfoContainer: {
        marginTop: 5,
    },
    productSections: {
        marginBottom: 20,
        borderRadius: 8,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 9,
        color: myColors.text.secondary,
        marginTop: 20,
        paddingHorizontal: 10,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    noResultsContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
    },
    noResultsContent: {
        padding: 20,
        alignItems: 'center',
    },
    noResultsIcon: {
        width: 36,
        height: 36,
        position: 'relative',
        marginBottom: 20,
    },
    noResultsIconInner: {
        width: 31.32,
        height: 29.44,
        position: 'absolute',
        left: 2.34,
        top: 3,
        opacity: 0.40,
        backgroundColor: '#FF4938',
    },
    noResultsTitle: {
        color: '#181818',
        fontSize: 20,
        fontFamily: 'Poppins',
        fontWeight: '400',
        lineHeight: 20,
        marginBottom: 20,
    },
    suggestionsContainer: {
        width: '100%',
        marginTop: 20,
    },
    suggestionsTitle: {
        color: '#181818',
        fontSize: 20,
        fontFamily: 'Poppins',
        fontWeight: '400',
        lineHeight: 30,
        marginBottom: 20,
    },
    suggestionsList: {
        gap: 20,
    },
    suggestionItem: {
        marginBottom: 10,
    },
    suggestionText: {
        color: '#181818',
        fontSize: 13,
        fontFamily: 'Inter',
        fontWeight: '400',
        lineHeight: 30,
    },
    suggestionRegNumber: {
        color: '#181818',
        fontSize: 13,
        fontFamily: 'Inter',
        fontWeight: '700',
        lineHeight: 24,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 10,
    },
    paginationText: {
        fontSize: 12,
        color: myColors.white,
        fontWeight: '500',
    },
    loadMoreButton: {
        backgroundColor: myColors.primary.main,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
        alignItems: 'center',
    },
    loadMoreText: {
        color: myColors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    autoLoadContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 10,
    },
    loadingIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 5,
    },
    loadingText: {
        color: myColors.text.primary,
        fontSize: 12,
        fontWeight: '500',
    },
    // Styles for DacklineSizeFilter
    sizeFilterContainer: {
        marginVertical: 10,
        // The ProductSection content area already has paddingHorizontal: 10
    },
    sizeFilterScrollViewContent: {
        paddingHorizontal: 15, // Add horizontal padding to match product cards
        // If buttons have marginRight, this can be 0 or a small value like 'paddingLeft: 0'
        // and 'paddingRight: to_accommodate_last_button_margin'
    },
    sizeFilterButton: {
        paddingHorizontal: 15, // Dynamic width based on text
        height: 40, // Or adjust as needed
        borderRadius: 8,
        marginRight: 10, // Spacing between buttons
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow (same as productCard)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minWidth: isDesktopWeb() ? width / 16.2 : width / 10.2, // Ensure a minimum width, adjust as needed
    },
    sizeFilterButtonNormal: {
        backgroundColor: myColors.white,
    },
    sizeFilterButtonSelected: {
        backgroundColor: myColors.primary.main, // Primary blue
    },
    sizeFilterButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    sizeFilterButtonTextNormal: {
        color: myColors.text.primary, // Default text color for buttons
    },
    sizeFilterButtonTextSelected: {
        color: myColors.white,
    },
    infoCardsContainer: {
        flexDirection: isDesktopWeb() ? 'row' : 'column',
        width: '100%',
    },
    vehicleInfoDesktopGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        gap: 8,
    },
    vehicleInfoMobileContainer: {
        flexDirection: 'column',
        width: '100%',
    },
    vehicleInfoDesktopCard: {
        width: '32.8%', // 3 columns with space between
        marginBottom: 1,
    },
    vehicleInfoMobileCard: {
        width: '100%',
        marginBottom: 10,
    },
    vehicleInfoLoadingCard: {
        marginBottom: 1,
        borderRadius: 8,
        backgroundColor: myColors.white,
        overflow: 'hidden',
        height: 130,
    },
    vehicleInfoLoadingContent: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    vehicleInformationSectionContainer: {
        marginBottom: 1,
        borderRadius: 8,
        backgroundColor: myColors.white,
        overflow: 'hidden',
    },
    vehicleInformationSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isDesktopWeb() ? 22 : 12,
    },
    vehicleInformationSectionTitle: {
        fontSize: isDesktopWeb() ? 20 : 16,
        color: myColors.text.primary,
        fontWeight: '500',
    },
    vehicleInformationSectionDesktop: {
        marginBottom: 1,
        borderRadius: 8,
        backgroundColor: myColors.white,
        overflow: 'hidden',
    },
    vehicleInformationSectionAnimated: {
        overflow: 'hidden',
        borderLeftWidth: 0, // Remove the default border since we have the animated bar
    },
    animatedDecorativeBar: {
        position: 'absolute',
        left: 0,
        width: isDesktopWeb() ? 5 : 3,
        zIndex: 9,
    },
    navLeftButton: {
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: [{ translateY: -22 }],
        width: 44,
        height: 44,
        borderRadius: 22,
        marginLeft: isDesktopWeb() ? 10 : 0,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        zIndex: 10,
        ...(Platform.OS === 'android' ? {
            elevation: 4,
        } : {}),
    },
    navRightButton: {
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: [{ translateY: -22 }],
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: isDesktopWeb() ? 10 : 0,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        zIndex: 10,
        ...(Platform.OS === 'android' ? {
            elevation: 4,
        } : {}),
    },
    navButtonDisabled: {
        opacity: 0.5,
        backgroundColor: '#f5f5f5',
    },
    blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        backgroundColor: Platform.OS === 'web' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.70)',
        justifyContent: 'center',
        alignItems: 'center',
        ...(Platform.OS === 'web' && {
            backdropFilter: 'blur(3px) saturate(0)',
            background: 'linear-gradient(transparent, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.9))',
        }),
        borderRadius: 8,
    },
    blurOverlayContent: {
        alignItems: 'center',
        paddingHorizontal: isDesktopWeb() ? 15 : 12,
        paddingVertical: isDesktopWeb() ? 20 : 16,
        justifyContent: 'center',
        flexDirection: 'column',
        width: '100%',
        flex: 1,
    },
    loginFloatInfo: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: isDesktopWeb() ? 15 : 10,
        padding: isDesktopWeb() ? 10 : 8,
        marginBottom: isDesktopWeb() ? 20 : 20,
        marginTop: isDesktopWeb() ? 10 : 8,
    },
    rotatedMessageBox: {
        backgroundColor: '#e77832', // Match expandable tab orange color
        paddingHorizontal: isDesktopWeb() ? 12 : 10,
        paddingVertical: isDesktopWeb() ? 8 : 6,
        borderRadius: 2,
        marginBottom: isDesktopWeb() ? 5 : 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        transform: [{ rotate: '-2deg' }],
    },
    rotatedMessageBoxSecondary: {
        backgroundColor: '#e73f3c',
        marginTop: isDesktopWeb() ? -25 : -15,
        transform: [{ rotate: '-4deg' }],
        zIndex: -1,
    },
    rotatedMessageText: {
        color: myColors.white,
        fontSize: isDesktopWeb() ? 17 : 13,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: isDesktopWeb() ? 22 : 16,
    },
    loginBox: {
        flexDirection: 'column',
        alignItems: 'center',
        width: isDesktopWeb() ? '90%' : '85%',
        maxWidth: isDesktopWeb() ? 280 : 240,
        padding: isDesktopWeb() ? 8 : 6,
        borderRadius: 20,
    },
    bankIdButton: {
        backgroundColor: myColors.primary.main, // Changed to myColors.primary.main
        paddingHorizontal: isDesktopWeb() ? 16 : 13,
        paddingVertical: isDesktopWeb() ? 12 : 10,
        borderRadius: 6,
        width: isDesktopWeb() ? '90%' : '85%',
        maxWidth: isDesktopWeb() ? 280 : 240,
        height: isDesktopWeb() ? 40 : 34,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    bankIdButtonText: {
        color: myColors.white,
        fontSize: isDesktopWeb() ? 14 : 12,
        fontWeight: '500',
    },
    bankIdIcon: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bankIdIconText: {
        fontSize: 24,
        color: myColors.white,
    },
});
