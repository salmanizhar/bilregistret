import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, Text, Platform, StatusBar, Image, Dimensions } from 'react-native';
import { IconChevronDown, IconUser } from '@/assets/icons';
import { SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';
import RegistrationNumberInput from './RegistrationNumberInput';
import { ImagePath } from '@/assets/images';
import { BilregistretBannerIconBlack } from '@/assets/images/SvgIcons';
import { useAuth } from '@/Services/api/context/auth.context';
import { LoginPopup } from '@/components/auth';
import SearchHistory from '@/components/home/SearchHistory';
import { userService } from '@/Services/api/services/user.service';
import { isDesktopWeb } from '@/utils/deviceInfo';

interface WebWideHeaderProps { }

interface SearchHistoryItem {
    id: string;
    regNumber: string;
    carModel: string;
}

interface Garage {
    name: string;
    cars: SearchHistoryItem[];
}

interface NavigationItem {
    title: string;
    route: string;
    hasDropdown?: boolean;
    dropdownItems?: Array<{
        title: string;
        route: string;
        badge?: string;
        hasSubmenu?: boolean;
        submenuItems?: Array<{
            title: string;
            route: string;
        }>;
    }>;
}

// Responsive styles object
const responsiveStyles = {
    xtraSmall: {
        topRow: { marginHorizontal: 8, height: 50 },
        logoHeight: 18,
        logoWidth: 90,
        hamburgerSize: 20,
        iconSize: 12,
        mobileIconSize: 14,
        navText: { fontSize: 10 },
        loginText: { fontSize: 10 },
        actionText: { fontSize: 10 },
        actionSpacing: 10,
        searchPlaceholder: "REG.NR",
        sMark: { fontSize: 16 },
        dropdownText: { fontSize: 12 },
        bottomRow: { paddingHorizontal: 8, paddingVertical: 6, height: 70 },
        searchSection: { flex: 2, maxWidth: 250, marginHorizontal: 0 },
        searchBarContainer: { height: 45 },
        searchInput: { fontSize: 12, paddingHorizontal: 16 },
        searchButton: { paddingHorizontal: 16 },
        mobileMenuContent: { padding: 12 },
        mobileMenuItem: { padding: 8 },
        mobileMenuText: { fontSize: 14 },
        mobileSubMenuItem: { paddingLeft: 16, paddingVertical: 6 },
        mobileSubMenuText: { fontSize: 12 },
        mobileLoginButton: { padding: 8 },
        mobileLoginText: { fontSize: 14 }
    },
    small: {
        topRow: { marginHorizontal: 12, height: 55 },
        logoHeight: 20,
        logoWidth: 100,
        hamburgerSize: 22,
        iconSize: 13,
        mobileIconSize: 15,
        navText: { fontSize: 11 },
        loginText: { fontSize: 11 },
        actionText: { fontSize: 11 },
        actionSpacing: 12,
        searchPlaceholder: "REGISTRERING",
        sMark: { fontSize: 18 },
        dropdownText: { fontSize: 13 },
        bottomRow: { paddingHorizontal: 12, paddingVertical: 8, height: 75 },
        searchSection: { flex: 2, maxWidth: 280, marginHorizontal: 0 },
        searchBarContainer: { height: 48 },
        searchInput: { fontSize: 13, paddingHorizontal: 18 },
        searchButton: { paddingHorizontal: 18 },
        mobileMenuContent: { padding: 16 },
        mobileMenuItem: { padding: 10 },
        mobileMenuText: { fontSize: 15 },
        mobileSubMenuItem: { paddingLeft: 20, paddingVertical: 7 },
        mobileSubMenuText: { fontSize: 13 },
        mobileLoginButton: { padding: 10 },
        mobileLoginText: { fontSize: 15 }
    },
    mobile: {
        topRow: { marginHorizontal: 16, height: 60 },
        logoHeight: 22,
        logoWidth: 110,
        hamburgerSize: 24,
        iconSize: 14,
        mobileIconSize: 16,
        navText: { fontSize: 12 },
        loginText: { fontSize: 12 },
        actionText: { fontSize: 12 },
        actionSpacing: 15,
        searchPlaceholder: "REGISTRERINGSNUMMER",
        sMark: { fontSize: 20 },
        dropdownText: { fontSize: 14 },
        bottomRow: { paddingHorizontal: 16, paddingVertical: 8, height: 80 },
        searchSection: { flex: 2, maxWidth: 300, marginHorizontal: 0 },
        searchBarContainer: { height: 50 },
        searchInput: { fontSize: 14, paddingHorizontal: 20 },
        searchButton: { paddingHorizontal: 20 },
        mobileMenuContent: { padding: 20 },
        mobileMenuItem: { padding: 12 },
        mobileMenuText: { fontSize: 16 },
        mobileSubMenuItem: { paddingLeft: 24, paddingVertical: 8 },
        mobileSubMenuText: { fontSize: 14 },
        mobileLoginButton: { padding: 12 },
        mobileLoginText: { fontSize: 16 }
    },
    tablet: {
        topRow: { marginHorizontal: 18, height: 75 },
        logoHeight: 24,
        logoWidth: 120,
        hamburgerSize: 24,
        iconSize: 14,
        mobileIconSize: 16,
        navText: { fontSize: 12 },
        loginText: { fontSize: 12 },
        actionText: { fontSize: 12 },
        actionSpacing: 15,
        searchPlaceholder: "REGISTRERINGSNUMMER / VIN",
        sMark: { fontSize: 20 },
        dropdownText: { fontSize: 14 },
        bottomRow: { paddingHorizontal: 18, paddingVertical: 10, height: 80 },
        searchSection: { flex: 2, maxWidth: 450, marginHorizontal: 10 },
        searchBarContainer: { height: 50 },
        searchInput: { fontSize: 14, paddingHorizontal: 20 },
        searchButton: { paddingHorizontal: 20 },
        mobileMenuContent: { padding: 20 },
        mobileMenuItem: { padding: 12 },
        mobileMenuText: { fontSize: 16 },
        mobileSubMenuItem: { paddingLeft: 24, paddingVertical: 8 },
        mobileSubMenuText: { fontSize: 14 },
        mobileLoginButton: { padding: 12 },
        mobileLoginText: { fontSize: 16 }
    },
    desktop: {
        topRow: { marginHorizontal: 20, height: 80 },
        logoHeight: 26,
        logoWidth: 134,
        hamburgerSize: 24,
        iconSize: 16,
        mobileIconSize: 16,
        navText: { fontSize: 13 },
        loginText: { fontSize: 13 },
        actionText: { fontSize: 13 },
        actionSpacing: 20,
        searchPlaceholder: "REGISTRERINGSNUMMER / VIN",
        sMark: { fontSize: 20 },
        dropdownText: { fontSize: 14 },
        bottomRow: { paddingHorizontal: 20, paddingVertical: 12, height: 80 },
        searchSection: { flex: 2, maxWidth: 500, marginHorizontal: 20 },
        searchBarContainer: { height: 50 },
        searchInput: { fontSize: 14, paddingHorizontal: 20 },
        searchButton: { paddingHorizontal: 20 },
        mobileMenuContent: { padding: 20 },
        mobileMenuItem: { padding: 12 },
        mobileMenuText: { fontSize: 16 },
        mobileSubMenuItem: { paddingLeft: 24, paddingVertical: 8 },
        mobileSubMenuText: { fontSize: 14 },
        mobileLoginButton: { padding: 12 },
        mobileLoginText: { fontSize: 16 }
    }
};

// Simple debounce function
const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

const WebWideHeader: React.FC<WebWideHeaderProps> = () => {
    const { isAuthenticated, logout, user, isGuestMode, isPremiumUser } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [showSidorDropdown, setShowSidorDropdown] = useState(false);
    const [showBloggSubmenu, setShowBloggSubmenu] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);
    const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [searchInput, setSearchInput] = useState('');

    // Search History state - real API data
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [searchHistoryItems, setSearchHistoryItems] = useState<SearchHistoryItem[]>([]);
    const [favoriteItems, setFavoriteItems] = useState<SearchHistoryItem[]>([]);
    const [garages, setGarages] = useState<Garage[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);
    const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);

    // Responsive state
    const [screenData, setScreenData] = useState({
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    });
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Enhanced Breakpoints for better responsiveness
    const isXtraSmall = screenData.width < 480;  // Very small phones
    const isSmall = screenData.width >= 480 && screenData.width < 640;  // Small phones
    const isMobile = screenData.width < 768;     // All mobile devices
    const isTablet = screenData.width >= 768 && screenData.width < 1024;
    const isLaptop = screenData.width >= 1024 && screenData.width < 1280;
    const isDesktop = screenData.width >= 1280;

    // Update screen dimensions
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setScreenData({ width: window.width, height: window.height });
        });
        return () => subscription?.remove();
    }, []);

    // Fetch search history data from API
    const fetchSearchHistoryData = async () => {
        // Skip API call if in guest mode or not authenticated or already fetching
        if (isGuestMode || !isAuthenticated || isFetchingHistory) {
            if (!isAuthenticated || isGuestMode) {
                setSearchHistoryItems([]);
                setFavoriteItems([]);
                setGarages([]);
                setHasInitiallyFetched(false);
            }
            return;
        }

        try {
            setIsFetchingHistory(true);
            setIsLoadingHistory(true);
            const [historyResponse, garagesResponse] = await Promise.all([
                userService.getSearchHistory(),
                userService.getGarages(),
            ]);

            // Transform history data and sort by most recent first
            const transformedHistory = historyResponse.history
                .map(item => ({
                    id: item.id.toString(),
                    regNumber: item.reg_name,
                    carModel: item.model
                }))
                .sort((a, b) => parseInt(b.id) - parseInt(a.id)); // Sort by ID descending (most recent first)
            setSearchHistoryItems(transformedHistory);

            // Transform garages data - keep separate garages with their names
            const transformedGarages = garagesResponse.map(garage => ({
                name: garage.name,
                cars: garage.GarageData.map(car => ({
                    id: car.id.toString(),
                    regNumber: car.reg_name,
                    carModel: car.model
                }))
            }));
            setGarages(transformedGarages);

            // Extract all cars from garages as favorites (since garages serve as favorites)
            const allFavoriteCars = garagesResponse.flatMap(garage =>
                garage.GarageData.map(car => ({
                    id: car.id.toString(),
                    regNumber: car.reg_name,
                    carModel: car.model
                }))
            );
            setFavoriteItems(allFavoriteCars);
        } catch (error) {
            console.log('Error fetching search history data:', error);
            // Set empty arrays on error
            setSearchHistoryItems([]);
            setFavoriteItems([]);
            setGarages([]);
        } finally {
            setIsLoadingHistory(false);
            setIsFetchingHistory(false);
            setHasInitiallyFetched(true);
        }
    };

    // Reset fetch flag when authentication state changes
    useEffect(() => {
        if (!isAuthenticated || isGuestMode) {
            setHasInitiallyFetched(false);
            setSearchHistoryItems([]);
            setFavoriteItems([]);
            setGarages([]);
        }
    }, [isAuthenticated, isGuestMode]);

    // Define navigation items with conditional filtering for desktop web
    const getNavigationItems = useMemo((): NavigationItem[] => {
        const baseItems: NavigationItem[] = [
            { title: 'HEM', route: '/(main)' },
            { title: 'BILUPPGIFTER', route: '/biluppgifter/' },
            { title: 'BILMÄRKEN', route: '/tillverkare' },
            {
                title: 'SIDOR',
                route: '/sidor',
                hasDropdown: true,
                dropdownItems: [
                    { title: 'PAKET', route: '/paket', badge: 'PREMIUM' },
                    { title: 'VÄRVA VÄNNER', route: '/varva-vanner' },
                    { title: 'BLOGG', route: '/blogg' },
                    { title: 'MINA FORDON', route: '/mina-fordon' },
                    { title: 'FAQ', route: '/faq' }
                ]
            },
            { title: 'OM OSS', route: '/om-oss' },
            { title: 'KONTAKT', route: '/kontakt' },
        ];

        // More robust desktop web detection and filtering
        const isDesktopWebEnvironment = isDesktopWeb() || (Platform.OS === 'web' && screenData.width >= 1024);

        // Filter out MINA FORDON on desktop web - it doesn't make sense if no vehicle exists to add
        if (isDesktopWebEnvironment) {
            const filteredItems = baseItems.map(item => {
                if (item.hasDropdown && item.dropdownItems) {
                    const filteredDropdownItems = item.dropdownItems.filter(dropdownItem =>
                        dropdownItem.title !== 'MINA FORDON'
                    );
                    return {
                        ...item,
                        dropdownItems: filteredDropdownItems
                    };
                }
                return item;
            });
            return filteredItems;
        }

        return baseItems;
    }, [screenData.width]); // Only recalculate when screen width changes

    const navigationItems = getNavigationItems;

    // Handle navigation
    const handleNavigation = (route: string) => {
        if (Platform.OS === 'web') {
            router.navigate(route as any);
        } else {
            router.push(route as any);
        }
        setShowSidorDropdown(false);
        setShowBloggSubmenu(false);
        setShowMobileMenu(false);
    };

    // Handle mobile menu toggle
    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
        setShowSidorDropdown(false);
    };

    // Handle SIDOR dropdown
    const toggleSidorDropdown = () => {
        setShowSidorDropdown(!showSidorDropdown);
        setShowBloggSubmenu(false);
        setShowUserDropdown(false);
    };

    // Handle BLOGG submenu
    const toggleBloggSubmenu = () => {
        setShowBloggSubmenu(!showBloggSubmenu);
    };

    // Handle User dropdown
    const toggleUserDropdown = () => {
        setShowUserDropdown(!showUserDropdown);
        setShowSidorDropdown(false);
        setShowBloggSubmenu(false);
    };

    // Create a ref for debounced refresh to avoid dependency issues
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Refresh search history with debouncing - only used after search operations
    const refreshSearchHistory = useCallback(() => {
        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        // Set new timeout
        refreshTimeoutRef.current = setTimeout(async () => {
            // Get current values at execution time
            const currentAuth = isAuthenticated;
            const currentGuest = isGuestMode;
            const currentFetching = isFetchingHistory;
            const currentFetched = hasInitiallyFetched;

            if (currentAuth && !currentGuest && !currentFetching && currentFetched) {
                try {
                    await fetchSearchHistoryData();
                } catch (error) {
                    console.log('Error refreshing search history:', error);
                }
            }
        }, 1000); // 1 second debounce
    }, [isAuthenticated, isGuestMode, isFetchingHistory, hasInitiallyFetched]);

    // Handle search result
    const handleSearchResult = (result: any) => {
        if (result && result.regNumber) {
            if (Platform.OS === 'web') {
                router.navigate({
                    pathname: '/(main)/biluppgifter/[regnr]' as any,
                    params: {
                        regnr: result.regNumber
                    }
                });
            } else {
                router.push({
                    pathname: '/(main)/biluppgifter/[regnr]' as any,
                    params: {
                        regnr: result.regNumber
                    }
                });
            }

            // Refresh search history after a search to show the new search at the top
            setTimeout(() => {
                refreshSearchHistory();
            }, 1000); // Increased delay to ensure backend has processed
        }
        setSearchInput('');
    };

    // Handle search input change
    const handleSearchInputChange = (text: string) => {
        setSearchInput(text);
        // Show search history when there's input and user is authenticated
        if (isAuthenticated && !isGuestMode) {
            setShowSearchHistory(true);
            // Fetch data only if not already fetched and not currently fetching
            if (!hasInitiallyFetched && !isFetchingHistory) {
                fetchSearchHistoryData();
            }
        }
    };

    // Handle search focus
    const handleSearchFocus = () => {
        // Show dropdown for authenticated users and fetch data if not already fetched
        if (isAuthenticated && !isGuestMode) {
            setShowSearchHistory(true);
            // Fetch data only if not already fetched and not currently fetching
            if (!hasInitiallyFetched && !isFetchingHistory) {
                fetchSearchHistoryData();
            }
        }
    };

    // Handle search blur with delay to allow for dropdown interaction
    const handleSearchBlur = () => {
        // Delay hiding to allow dropdown interaction
        setTimeout(() => {
            setShowSearchHistory(false);
        }, 200);
    };

    // Handle search history item selection
    const handleSearchHistoryItemPress = (item: any) => {
        setSearchInput(item.regNumber);
        setShowSearchHistory(false);
        handleSearchResult(item);

        // Refresh search history after selecting an item to update the order
        setTimeout(() => {
            refreshSearchHistory();
        }, 1000); // Delay to allow backend to process
    };

    // Handle search history close
    const handleSearchHistoryClose = () => {
        setShowSearchHistory(false);
    };

    // Prevent dropdown from closing when clicking inside it
    const handleDropdownMouseDown = (event: any) => {
        if (Platform.OS === 'web') {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    // Handle authentication
    const handleAuthAction = () => {
        if (isAuthenticated) {
            toggleUserDropdown();
        } else {
            setShowLoginPopup(true);
        }
    };

    // Handle user menu actions
    const handleUserMenuAction = (action: string) => {
        setShowUserDropdown(false);

        switch (action) {
            case 'profile':
                handleNavigation('/(main)/konto/redigera');
                break;
            case 'settings':
                handleNavigation('/(main)/konto');
                break;
            case 'logout':
                logout();
                break;
        }
    };

    // Handle login success
    const handleLoginSuccess = () => {
        setShowLoginPopup(false);
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        // Here you would implement actual dark mode logic
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            setShowSidorDropdown(false);
            setShowBloggSubmenu(false);
            setShowUserDropdown(false);
            // Don't auto-close search history - let blur handle it
        };

        if (Platform.OS === 'web') {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, []);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [hoverTimeout]);

    // Handle dropdown click to prevent closing
    const handleDropdownClick = (event: any) => {
        if (Platform.OS === 'web') {
            event.stopPropagation();
        }
    };

    // Get responsive styles
    const getResponsiveStyles = () => {
        if (isXtraSmall) return responsiveStyles.xtraSmall;
        if (isSmall) return responsiveStyles.small;
        if (isMobile) return responsiveStyles.mobile;
        if (isTablet) return responsiveStyles.tablet;
        return responsiveStyles.desktop;
    };

    const responsive = getResponsiveStyles();

    // Handle submenu hover with delay
    const handleSubmenuHover = (show: boolean, index: number) => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }

        if (show) {
            setHoveredItemIndex(index);
            setShowBloggSubmenu(true);
        } else {
            const timeout = setTimeout(() => {
                setHoveredItemIndex(null);
                setShowBloggSubmenu(false);
            }, 150); // 150ms delay before closing
            setHoverTimeout(timeout);
        }
    };
    return (
        <View style={styles.container}>
            {/* Top Navigation Row */}
            <View style={[
                styles.topRow,
                responsive.topRow
            ]}>
                {/* Left Section - Logo */}
                <TouchableOpacity
                    style={[styles.logoContainer]}
                    onPress={() => handleNavigation('/(main)')}
                >
                    <SvgXml
                        xml={BilregistretBannerIconBlack}
                        height={responsive.logoHeight}
                        width={responsive.logoWidth}
                    />
                </TouchableOpacity>

                {/* Desktop/Tablet Navigation Menu */}
                {!isMobile && (
                    <View style={[styles.navigationContainer]}>
                        {navigationItems.map((item, index) => (
                            <View key={index} style={styles.navItemContainer}>
                                {item.hasDropdown ? (
                                    <View style={styles.dropdownContainer}>
                                        <TouchableOpacity
                                            style={[styles.navItem, showSidorDropdown && styles.navItemActive]}
                                            onPress={toggleSidorDropdown}
                                        >
                                            <MyText
                                                fontFamily='Poppins'
                                                style={{
                                                    fontSize: responsive.navText.fontSize,
                                                    color: myColors.text.primary,
                                                    letterSpacing: 0.5
                                                }}
                                            >
                                                {item.title}
                                            </MyText>
                                            <IconChevronDown
                                                size={responsive.iconSize}
                                                color={myColors.text.primary}
                                                style={styles.dropdownIcon}
                                            />
                                        </TouchableOpacity>

                                        {showSidorDropdown && (
                                            <View style={styles.dropdownMenu} onTouchStart={handleDropdownClick}>
                                                {item.dropdownItems?.map((dropdownItem, dropdownIndex) => (
                                                    <View key={dropdownIndex}>
                                                        {dropdownItem.hasSubmenu ? (
                                                            <View>
                                                                <Pressable
                                                                    style={[
                                                                        styles.dropdownItem,
                                                                        styles.dropdownItemWithSubmenu,
                                                                        hoveredItemIndex === dropdownIndex && styles.dropdownItemHovered
                                                                    ]}
                                                                    onHoverIn={() => {
                                                                        handleSubmenuHover(true, dropdownIndex);
                                                                    }}
                                                                    onHoverOut={() => {
                                                                        handleSubmenuHover(false, dropdownIndex);
                                                                    }}
                                                                    onPress={toggleBloggSubmenu}
                                                                >
                                                                    <View style={styles.dropdownItemContent}>
                                                                        <MyText style={styles.dropdownText}>
                                                                            {dropdownItem.title}
                                                                        </MyText>
                                                                        <IconChevronDown
                                                                            size={12}
                                                                            color={myColors.text.secondary}
                                                                        />
                                                                    </View>
                                                                </Pressable>
                                                                {showBloggSubmenu && (
                                                                    <View style={styles.submenuContainer}>
                                                                        {dropdownItem.submenuItems?.map((submenuItem, submenuIndex) => (
                                                                            <Pressable
                                                                                key={submenuIndex}
                                                                                style={({ hovered }) => [
                                                                                    styles.submenuItem,
                                                                                    hovered && styles.submenuItemHovered
                                                                                ]}
                                                                                onPress={() => handleNavigation(submenuItem.route)}
                                                                            >
                                                                                <MyText style={styles.submenuText}>
                                                                                    {submenuItem.title}
                                                                                </MyText>
                                                                            </Pressable>
                                                                        ))}
                                                                    </View>
                                                                )}
                                                            </View>
                                                        ) : (
                                                            <Pressable
                                                                style={[
                                                                    styles.dropdownItem,
                                                                    dropdownIndex === (item.dropdownItems?.length || 0) - 1 && styles.dropdownItemLast,
                                                                    hoveredItemIndex === dropdownIndex && styles.dropdownItemHovered
                                                                ]}
                                                                onHoverIn={() => handleSubmenuHover(true, dropdownIndex)}
                                                                onHoverOut={() => handleSubmenuHover(false, dropdownIndex)}
                                                                onPress={() => handleNavigation(dropdownItem.route)}
                                                            >
                                                                <View style={styles.dropdownItemContent}>
                                                                    <MyText style={styles.dropdownText}>
                                                                        {dropdownItem.title}
                                                                    </MyText>
                                                                    {dropdownItem.badge && (
                                                                        <View style={styles.premiumBadge}>
                                                                            <MyText style={styles.premiumBadgeText}>
                                                                                {dropdownItem.badge}
                                                                            </MyText>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            </Pressable>
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.navItem}
                                        onPress={() => handleNavigation(item.route)}
                                    >
                                        <MyText
                                            fontFamily='Poppins'
                                            style={{
                                                fontSize: responsive.navText.fontSize,
                                                color: myColors.text.primary,
                                                letterSpacing: 0.5
                                            }}
                                        >
                                            {item.title}
                                        </MyText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Mobile User/Menu Button */}
                {isMobile && (
                    <TouchableOpacity style={styles.hamburgerButton} onPress={toggleMobileMenu}>
                        {/* Profile Picture or Icon */}
                        {isAuthenticated && user?.user?.profile_picture ? (
                            <View style={styles.profileImageContainer}>
                                <Image
                                    source={{ uri: user.user.profile_picture }}
                                    style={styles.profile_picture}
                                    onError={() => {
                                        // Fallback handled by parent conditional rendering
                                    }}
                                />
                                {isPremiumUser && <SvgXml xml={ImagePath.SvgIcons.PremiumIconWebHeaderProfile} height={18} width={18} style={styles.statusIndicator} />}
                            </View>
                        ) : (
                            // <IconUser size={24} color={myColors.text.webGray} />
                            <SvgXml xml={isPremiumUser ? ImagePath.SvgIcons.UserPremiumIconBlack : ImagePath.SvgIcons.UserIconBlack} />
                        )}
                        {isAuthenticated && (
                            <MyText style={styles.mobileUserName}>
                                {user?.user?.name || 'User'}
                            </MyText>
                        )}
                    </TouchableOpacity>
                )}

                {/* Right Section - Login & Actions (Desktop/Tablet only) */}
                {!isMobile && (
                    <View style={styles.topRightSection}>
                        <View style={styles.userMenuContainer}>
                            <TouchableOpacity
                                style={[styles.loginButton, showUserDropdown && styles.navItemActive]}
                                onPress={handleAuthAction}
                            >
                                {/* Profile Picture or Icon */}
                                {isAuthenticated && user?.user?.profile_picture ? (
                                    <View style={styles.profileImageContainer}>
                                        <Image
                                            source={{ uri: user.user.profile_picture }}
                                            style={styles.profile_picture}
                                            onError={() => {
                                                // Fallback handled by parent conditional rendering
                                            }}
                                        />
                                        {isPremiumUser && <SvgXml xml={ImagePath.SvgIcons.PremiumIconWebHeaderProfile} height={18} width={18} style={styles.statusIndicator} />}
                                    </View>
                                ) : (
                                    // <IconUser size={24} color={myColors.text.webGray} />
                                    <SvgXml xml={isPremiumUser ? ImagePath.SvgIcons.UserPremiumIconBlack : ImagePath.SvgIcons.UserIconBlack} />
                                )}
                                <MyText
                                    style={{
                                        fontSize: responsive.loginText.fontSize,
                                        color: myColors.text.webGray,
                                        marginLeft: 8,
                                        maxWidth: 120
                                    }}
                                    numberOfLines={1}
                                >
                                    {isAuthenticated ? (user?.user?.name || 'User') : 'Logga in'}
                                </MyText>
                                {isAuthenticated && (
                                    <IconChevronDown
                                        size={responsive.iconSize}
                                        color={myColors.text.webGray}
                                        style={styles.dropdownIcon}
                                    />
                                )}
                            </TouchableOpacity>

                            {/* User Dropdown Menu */}
                            {showUserDropdown && isAuthenticated && (
                                <View style={styles.userDropdownMenu} onTouchStart={handleDropdownClick}>
                                    <Pressable
                                        style={({ hovered }) => [
                                            styles.dropdownItem,
                                            hovered && styles.dropdownItemHovered
                                        ]}
                                        onPress={() => handleUserMenuAction('profile')}
                                    >
                                        <MyText style={styles.dropdownText}>PROFIL</MyText>
                                    </Pressable>
                                    <Pressable
                                        style={({ hovered }) => [
                                            styles.dropdownItem,
                                            hovered && styles.dropdownItemHovered
                                        ]}
                                        onPress={() => handleUserMenuAction('settings')}
                                    >
                                        <MyText style={styles.dropdownText}>INSTÄLLNINGAR</MyText>
                                    </Pressable>
                                    <Pressable
                                        style={({ hovered }) => [
                                            styles.dropdownItem,
                                            styles.dropdownItemLast,
                                            hovered && styles.dropdownItemHovered
                                        ]}
                                        onPress={() => handleUserMenuAction('logout')}
                                    >
                                        <MyText style={styles.dropdownText}>LOGGA UT</MyText>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </View>

            {/* Mobile Menu Overlay */}
            {isMobile && showMobileMenu && (
                <View style={styles.mobileMenuOverlay}>
                    <View style={[styles.mobileMenuContent, responsive.mobileMenuContent]}>
                        {/* Mobile Navigation Items */}
                        {navigationItems.map((item, index) => (
                            <View key={index}>
                                {item.hasDropdown ? (
                                    <View>
                                        <TouchableOpacity
                                            style={[styles.mobileMenuItem, responsive.mobileMenuItem]}
                                            onPress={toggleSidorDropdown}
                                        >
                                            <MyText
                                                fontFamily='Poppins'
                                                style={{
                                                    fontSize: responsive.mobileMenuText.fontSize,
                                                    color: myColors.text.primary
                                                }}
                                            >
                                                {item.title}
                                            </MyText>
                                            <IconChevronDown size={responsive.mobileIconSize} color={myColors.text.primary} />
                                        </TouchableOpacity>
                                        {showSidorDropdown && item.dropdownItems?.map((dropdownItem, dropdownIndex) => (
                                            <View key={dropdownIndex}>
                                                {dropdownItem.hasSubmenu ? (
                                                    <View>
                                                        <Pressable
                                                            style={[styles.mobileSubMenuItem, responsive.mobileSubMenuItem]}
                                                            onPress={toggleBloggSubmenu}
                                                        >
                                                            <View style={styles.mobileSubMenuItemContent}>
                                                                <MyText fontFamily='Poppins' style={styles.dropdownText}>
                                                                    {dropdownItem.title}
                                                                </MyText>
                                                                <IconChevronDown size={14} color={myColors.text.secondary} />
                                                            </View>
                                                        </Pressable>
                                                        {showBloggSubmenu && dropdownItem.submenuItems?.map((submenuItem, submenuIndex) => (
                                                            <Pressable
                                                                key={submenuIndex}
                                                                style={styles.mobileSubmenuItem}
                                                                onPress={() => handleNavigation(submenuItem.route)}
                                                            >
                                                                <MyText fontFamily='Poppins' style={styles.mobileSubmenuText}>
                                                                    {submenuItem.title}
                                                                </MyText>
                                                            </Pressable>
                                                        ))}
                                                    </View>
                                                ) : (
                                                    <Pressable
                                                        style={[
                                                            styles.mobileSubMenuItem,
                                                            responsive.mobileSubMenuItem,
                                                            dropdownIndex === (item.dropdownItems?.length || 0) - 1 && styles.dropdownItemLast
                                                        ]}
                                                        onPress={() => handleNavigation(dropdownItem.route)}
                                                    >
                                                        <View style={styles.mobileSubMenuItemContent}>
                                                            <MyText fontFamily='Poppins' style={styles.dropdownText}>
                                                                {dropdownItem.title}
                                                            </MyText>
                                                            {dropdownItem.badge && (
                                                                <View style={styles.mobilePremiumBadge}>
                                                                    <MyText fontFamily='Poppins' style={styles.mobilePremiumBadgeText}>
                                                                        {dropdownItem.badge}
                                                                    </MyText>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </Pressable>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.mobileMenuItem, responsive.mobileMenuItem]}
                                        onPress={() => handleNavigation(item.route)}
                                    >
                                        <MyText
                                            fontFamily='Poppins'
                                            style={{
                                                fontSize: responsive.mobileMenuText.fontSize,
                                                color: myColors.text.primary
                                            }}
                                        >
                                            {item.title}
                                        </MyText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        {/* Mobile User Menu */}
                        {isAuthenticated && (
                            <>
                                <TouchableOpacity
                                    style={[styles.mobileMenuItem, responsive.mobileMenuItem]}
                                    onPress={() => handleUserMenuAction('profile')}
                                >
                                    <MyText
                                        fontFamily='Poppins'
                                        style={{
                                            fontSize: responsive.mobileMenuText.fontSize,
                                            color: myColors.text.primary
                                        }}
                                    >
                                        PROFIL
                                    </MyText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.mobileMenuItem, responsive.mobileMenuItem]}
                                    onPress={() => handleUserMenuAction('settings')}
                                >
                                    <MyText
                                        fontFamily='Poppins'
                                        style={{
                                            fontSize: responsive.mobileMenuText.fontSize,
                                            color: myColors.text.primary
                                        }}
                                    >
                                        INSTÄLLNINGAR
                                    </MyText>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Mobile Login/Logout Button */}
                        <TouchableOpacity
                            style={[styles.mobileLoginButton, responsive.mobileLoginButton]}
                            onPress={isAuthenticated ? () => handleUserMenuAction('logout') : handleAuthAction}
                        >
                            {/* <IconUser size={responsive.mobileIconSize} color={myColors.white} /> */}
                            <SvgXml xml={isPremiumUser ? ImagePath.SvgIcons.UserPremiumIconBlack : ImagePath.SvgIcons.UserIconBlack} />
                            <MyText
                                style={{
                                    fontSize: responsive.mobileLoginText.fontSize,
                                    color: myColors.white,
                                    marginLeft: 8
                                }}
                            >
                                {isAuthenticated ? 'Logga ut' : 'Logga in'}
                            </MyText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Bottom Search Row */}
            <View style={[styles.bottomRow, responsive.bottomRow]}>
                {/* Left Section - Historia & Mina Fordon (Desktop/Tablet only) */}
                {!isMobile && (
                    <View style={styles.leftActions}>
                    </View>
                )}

                {/* Center Section - Search Bar with Dropdown */}
                {!isMobile && (
                    <View style={[styles.searchSection, responsive.searchSection]}>
                        <View style={[styles.searchBarContainer, responsive.searchBarContainer]}>
                            <RegistrationNumberInput
                                style={[styles.searchInput, responsive.searchInput]}
                                placeholder={responsive.searchPlaceholder}
                                placeholderTextColor={myColors.text.primary}
                                value={searchInput}
                                onChangeText={handleSearchInputChange}
                                onSearchResult={handleSearchResult}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                customLeftIcon={
                                    <View style={styles.S_mark_container}>
                                        <MyText
                                            fontFamily='Poppins'
                                            style={{
                                                fontSize: responsive.sMark.fontSize,
                                                color: myColors.text.primary
                                            }}
                                        >
                                            S
                                        </MyText>
                                        <View style={styles.borderLine} />
                                    </View>
                                }
                            />
                            <TouchableOpacity
                                style={[styles.searchButton, responsive.searchButton]}
                                onPress={() => {
                                    if (searchInput.trim()) {
                                        const searchResult = { regNumber: searchInput.trim() };
                                        handleSearchResult(searchResult);

                                        // Refresh search history after direct search
                                        setTimeout(() => {
                                            refreshSearchHistory();
                                        }, 1000);
                                    }
                                }}
                            >
                                <SvgXml xml={ImagePath.SvgIcons.whiteSearchIcon} />
                            </TouchableOpacity>
                        </View>

                        {/* Search History Dropdown */}
                        {showSearchHistory && (
                            <View
                                style={[styles.searchHistoryDropdown, {
                                    maxWidth: responsive.searchSection.maxWidth,
                                }]}
                                onTouchStart={handleDropdownMouseDown}
                            >
                                {isLoadingHistory ? (
                                    <View style={styles.loadingContainer}>
                                        <MyText style={styles.loadingText}>Laddar historik...</MyText>
                                    </View>
                                ) : (searchHistoryItems.length === 0 && garages.length === 0 && favoriteItems.length === 0) ? (
                                    <View style={styles.loadingContainer}>
                                        <MyText style={styles.loadingText}>Ingen sökhistorik tillgänglig</MyText>
                                    </View>
                                ) : (
                                    <SearchHistory
                                        visible={showSearchHistory}
                                        historyItems={searchHistoryItems}
                                        garages={garages}
                                        favoriteItems={favoriteItems}
                                        onItemPress={handleSearchHistoryItemPress}
                                        onClose={handleSearchHistoryClose}
                                        isFromHome={false}
                                        currentSearchInput={searchInput}
                                        onSearchInputChange={handleSearchInputChange}
                                        isDropdownMode={true}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                )}

                {/* Right Section - Promo & Jämföra (Desktop/Large Tablet only) */}
                {(isDesktop || isLaptop) && (
                    <View style={styles.rightActions}>
                        <View style={styles.borderLine} />
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => handleNavigation('/paket')}
                        >
                            <MyText style={styles.compareText}>PAKET</MyText>
                            <Image source={ImagePath.webHeaderJamfora} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Login Popup */}
            <LoginPopup
                visible={showLoginPopup}
                onClose={() => setShowLoginPopup(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: myColors.white,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
        zIndex: 1000,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    // Top Row Styles
    topRow: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
        zIndex: 1000,
    },
    logoContainer: {
        flex: 1,
    },
    navigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2,
        justifyContent: 'center',
    },
    navItemContainer: {
        position: 'relative',
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 4,
    },
    navItemActive: {
        backgroundColor: myColors.primary.light4,
    },
    navText: {
        fontSize: 13,
        color: myColors.text.primary,
        letterSpacing: 0.5,
    },
    dropdownContainer: {
        position: 'relative',
    },
    dropdownIcon: {
        marginLeft: 4,
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        backgroundColor: myColors.white,
        borderRadius: 12,
        // borderWidth: 1,
        borderColor: myColors.border.light,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        minWidth: 220,
        width: 280,
        zIndex: 2000,
        paddingVertical: 8,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        // borderBottomWidth: 1,
        // borderBottomColor: myColors.border.light,
    },
    dropdownItemLast: {
        borderBottomWidth: 0,
    },
    dropdownText: {
        fontSize: 13,
        color: myColors.text.primary,
    },
    topRightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },
    userMenuContainer: {
        position: 'relative',
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 4,
        // marginRight: 15,
    },
    profile_picture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: myColors.screenBackgroundColor,
    },
    userDropdownMenu: {
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: myColors.white,
        borderRadius: 12,
        borderColor: myColors.border.light,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        minWidth: 180,
        width: 220,
        zIndex: 2000,
        paddingVertical: 8,
        marginTop: 4,
    },
    loginText: {
        fontSize: 13,
        color: myColors.text.webGray,
        marginLeft: 8,
    },
    darkModeButton: {
        padding: 4,
    },

    // Bottom Row Styles
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        height: 80,
        zIndex: 500,
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 13,
        color: myColors.text.primary,
        marginLeft: 8,
        letterSpacing: 0.5,
    },
    searchSection: {
        flex: 2,
        maxWidth: 500,
        marginHorizontal: 20,
    },
    searchBarContainer: {
        flexDirection: 'row',
        backgroundColor: myColors.white,
        borderRadius: 6,
        overflow: 'hidden',
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 2,
        borderColor: myColors.primary.main,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: myColors.text.primary,
        paddingHorizontal: 20,
        fontFamily: 'Poppins',
    },
    searchButton: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 60,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "flex-end",
        flex: 1,
    },
    promoText: {
        fontSize: 12,
        color: myColors.text.secondary,
        // marginRight: 12,
    },
    promoTextPrimary: {
        fontSize: 12,
        color: myColors.primary.main,

    },
    jamforaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    jamforaText: {
        fontSize: 12,
        fontWeight: '600',
        color: myColors.white,
        letterSpacing: 0.5,
    },
    jamforaIcon: {
        marginLeft: 4,
    },
    compareText: {
        fontSize: 13,
        color: myColors.text.primary,
        marginRight: 8,
        letterSpacing: 0.5,
    },
    borderLine: {
        width: 1,
        height: 25,
        backgroundColor: myColors.border.light,
        marginHorizontal: 12,
    },
    S_mark: {
        fontSize: 20,
        color: myColors.text.primary,
        // marginLeft: 10,
    },
    S_mark_container: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Mobile Styles
    topRowMobile: {
        height: 60,
        paddingVertical: 4,
    },
    logoContainerMobile: {
        flex: 1,
    },
    hamburgerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    mobileUserName: {
        fontSize: 14,
        color: myColors.text.webGray,
        marginLeft: 8,
        fontFamily: 'Poppins',
    },
    mobileMenuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    mobileMenuContent: {
        backgroundColor: myColors.white,
        padding: 20,
        width: '100%',
    },
    mobileMenuItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    mobileMenuText: {
        fontSize: 16,
        color: myColors.text.primary,
    },
    mobileSubMenuItem: {
        paddingLeft: 24,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    mobileSubMenuText: {
        fontSize: 14,
        color: myColors.text.secondary,
    },
    mobileLoginButton: {
        backgroundColor: myColors.primary.main,
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
    },
    mobileLoginText: {
        fontSize: 16,
        color: myColors.white,
        marginLeft: 8,
    },
    bottomRowMobile: {
        paddingVertical: 8,
    },
    leftActionsMobile: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    actionItemMobile: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionTextMobile: {
        fontSize: 13,
        color: myColors.text.primary,
        marginLeft: 8,
        letterSpacing: 0.5,
    },
    searchSectionMobile: {
        flex: 2,
        maxWidth: 300,
    },
    searchBarContainerMobile: {
        flexDirection: 'row',
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        overflow: 'hidden',
        height: 40,
    },
    searchInputMobile: {
        flex: 1,
        fontSize: 14,
        color: myColors.text.primary,
        paddingHorizontal: 16,
    },
    searchButtonMobile: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 50,
    },
    rightActionsMobile: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "flex-end",
        flex: 1,
    },
    promoTextMobile: {
        fontSize: 12,
        color: myColors.text.secondary,
    },
    promoTextPrimaryMobile: {
        fontSize: 12,
        color: myColors.primary.main,
    },
    jamforaButtonMobile: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    jamforaTextMobile: {
        fontSize: 12,
        fontWeight: '600',
        color: myColors.white,
        letterSpacing: 0.5,
    },
    jamforaIconMobile: {
        marginLeft: 4,
    },
    compareTextMobile: {
        fontSize: 13,
        color: myColors.text.primary,
        marginRight: 8,
        letterSpacing: 0.5,
    },
    borderLineMobile: {
        width: 1,
        height: 25,
        backgroundColor: myColors.border.light,
        marginHorizontal: 12,
    },
    S_markMobile: {
        fontSize: 20,
        color: myColors.text.primary,
    },
    S_mark_containerMobile: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Tablet Styles
    navigationContainerTablet: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2,
        justifyContent: 'center',
    },
    navTextTablet: {
        fontSize: 12,
        color: myColors.text.primary,
        letterSpacing: 0.4,
    },
    actionTextTablet: {
        fontSize: 12,
        color: myColors.text.primary,
        marginLeft: 6,
        letterSpacing: 0.4,
    },
    topRightSectionTablet: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },
    loginButtonTablet: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginRight: 15,
    },
    loginTextTablet: {
        fontSize: 13,
        marginLeft: 8,
    },
    darkModeButtonTablet: {
        padding: 4,
    },

    // Search Section Styles
    searchSectionTablet: {
        flex: 2,
        maxWidth: 500,
        marginHorizontal: 20,
    },
    searchBarContainerTablet: {
        flexDirection: 'row',
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        overflow: 'hidden',
        height: 40,
    },
    searchInputTablet: {
        flex: 1,
        fontSize: 14,
        color: myColors.text.primary,
        paddingHorizontal: 16,
    },
    searchButtonTablet: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 50,
    },
    rightActionsTablet: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "flex-end",
        flex: 1,
    },
    promoTextTablet: {
        fontSize: 12,
        color: myColors.text.secondary,
    },
    promoTextPrimaryTablet: {
        fontSize: 12,
        color: myColors.primary.main,
    },
    jamforaButtonTablet: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    jamforaTextTablet: {
        fontSize: 12,
        fontWeight: '600',
        color: myColors.white,
        letterSpacing: 0.5,
    },
    jamforaIconTablet: {
        marginLeft: 4,
    },
    compareTextTablet: {
        fontSize: 13,
        color: myColors.text.primary,
        marginRight: 8,
        letterSpacing: 0.5,
    },
    borderLineTablet: {
        width: 1,
        height: 25,
        backgroundColor: myColors.border.light,
        marginHorizontal: 12,
    },
    S_markTablet: {
        fontSize: 20,
        color: myColors.text.primary,
    },
    S_mark_containerTablet: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Extra Small Styles
    topRowXtraSmall: {
        height: 60,
        paddingVertical: 4,
    },
    hamburgerButtonXtraSmall: {
        padding: 8,
    },
    mobileMenuContentXtraSmall: {
        padding: 16,
    },
    mobileMenuItemXtraSmall: {
        padding: 8,
    },
    mobileMenuTextXtraSmall: {
        fontSize: 14,
    },
    mobileSubMenuItemXtraSmall: {
        paddingLeft: 16,
    },
    mobileSubMenuTextXtraSmall: {
        fontSize: 12,
    },
    mobileLoginButtonXtraSmall: {
        backgroundColor: myColors.primary.main,
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
    },
    mobileLoginTextXtraSmall: {
        fontSize: 14,
    },
    bottomRowXtraSmall: {
        paddingVertical: 8,
    },
    searchSectionXtraSmall: {
        flex: 2,
        maxWidth: 300,
    },
    searchBarContainerXtraSmall: {
        flexDirection: 'row',
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        overflow: 'hidden',
        height: 40,
    },
    searchInputXtraSmall: {
        flex: 1,
        fontSize: 12,
        color: myColors.text.primary,
        paddingHorizontal: 16,
    },
    searchButtonXtraSmall: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 50,
    },
    rightActionsXtraSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "flex-end",
        flex: 1,
    },
    promoTextXtraSmall: {
        fontSize: 12,
        color: myColors.text.secondary,
    },
    promoTextPrimaryXtraSmall: {
        fontSize: 12,
        color: myColors.primary.main,
    },
    jamforaButtonXtraSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    jamforaTextXtraSmall: {
        fontSize: 12,
        fontWeight: '600',
        color: myColors.white,
        letterSpacing: 0.5,
    },
    jamforaIconXtraSmall: {
        marginLeft: 4,
    },
    compareTextXtraSmall: {
        fontSize: 13,
        color: myColors.text.primary,
        marginRight: 8,
        letterSpacing: 0.5,
    },
    borderLineXtraSmall: {
        width: 1,
        height: 25,
        backgroundColor: myColors.border.light,
        marginHorizontal: 12,
    },
    S_markXtraSmall: {
        fontSize: 16,
        color: myColors.text.primary,
    },
    S_mark_containerXtraSmall: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownItemWithSubmenu: {
        padding: 16,
    },
    submenuIcon: {
        marginLeft: 4,
    },
    submenuContainer: {
        position: 'absolute',
        top: '100%',
        left: '100%',
        marginLeft: -10,
        backgroundColor: myColors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: myColors.border.light,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 180,
        zIndex: 3000,
        paddingVertical: 4,
    },
    submenuItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    submenuText: {
        fontSize: 12,
        color: myColors.text.primary,
    },
    premiumBadge: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    premiumBadgeText: {
        fontSize: 10,
        color: myColors.white,
        fontWeight: '600',
    },
    mobileSubMenuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mobilePremiumBadge: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    mobilePremiumBadgeText: {
        fontSize: 10,
        color: myColors.white,
        fontWeight: '600',
    },
    mobileSubmenuItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    mobileSubmenuText: {
        fontSize: 14,
        color: myColors.text.primary,
    },
    dropdownItemHovered: {
        backgroundColor: myColors.primary.light4,
    },
    submenuItemHovered: {
        backgroundColor: myColors.primary.light4,
    },

    // Search History Dropdown Styles
    searchHistoryDropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: myColors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: myColors.border.light,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 1500,
        maxHeight: 520,
        overflow: 'hidden',
        marginTop: 4,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 60,
    },
    loadingText: {
        fontSize: 14,
        color: myColors.text.secondary,
        fontFamily: 'Poppins',
    },
    iconButton: {
        // width: 40,
        // height: 40,
        // borderRadius: 20,
        // marginLeft: 10,
        // backgroundColor: '#F3F2F2',
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    profileImageContainer: {
        position: 'relative',
        // marginRight: 15,
    },
    statusIndicator: {
        position: 'absolute',
        top: -5,
        right: -10,
    },

});

export default WebWideHeader;
