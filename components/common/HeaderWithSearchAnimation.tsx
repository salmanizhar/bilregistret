import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, Animated } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import PopupMenu from '../menu/PopupMenu';
import ProfilePopupMenu from '../menu/ProfilePopupMenu';
import SearchHistory from '../home/SearchHistory';
import { router } from 'expo-router';
import RegistrationNumberInput, { RegistrationNumberInputRef } from '../common/RegistrationNumberInput';
import { userService } from '@/Services/api/services/user.service';
import { useAuth } from '@/Services/api/context/auth.context';

interface HeaderWithSearchProps {
    // scrollY: Animated.Value;
}

// Animation constants
const HEADER_MAX_HEIGHT = 200; // Height of the expanded header
const HEADER_MIN_HEIGHT = 70; // Height of the collapsed header
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;


const HeaderWithSearch: React.FC<HeaderWithSearchProps> = ({ }) => {
    const { isPremiumUser } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);
    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [searchHistory, setSearchHistory] = useState<any[]>([]);
    const [garages, setGarages] = useState<any[]>([]);
    const [currentSearchInput, setCurrentSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Animation related state and refs
    const scrollY = useRef(new Animated.Value(0)).current;
    const [showFloatingBar, setShowFloatingBar] = useState(false);
    const searchInputRef = useRef<RegistrationNumberInputRef>(null);
    const floatingSearchInputRef = useRef<TextInput>(null);
    const animationTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastScrollValue = useRef(0);
    const isAnimating = useRef(false);

    // Add new animation refs for smoother transitions
    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const headerScale = useRef(new Animated.Value(1)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;

    // Pre-fetch data when component mounts or when search history becomes visible
    useEffect(() => {
        if (showSearchHistory) {
            fetchData();
        }
    }, [showSearchHistory]);

    // Function to fetch both search history and favorites
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [historyResponse, garagesResponse] = await Promise.all([
                userService.getSearchHistory(),
                userService.getGarages()
            ]);

            // Transform history data
            const transformedHistory = historyResponse.history.map(item => ({
                id: item.id.toString(),
                regNumber: item.reg_name,
                carModel: item.model
            }));
            setSearchHistory(transformedHistory);

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
        } catch (error) {
            // // console.log('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMenuPress = () => {
        setMenuVisible(true);
    };

    const handleProfilePress = () => {
        setProfileMenuVisible(true);
    };

    // Optimize animation timing
    const animateToFloatingSearchBar = () => {
        // First, blur the regular search bar to prevent keyboard issues
        searchInputRef.current?.blur();

        // Clear any existing animation timeout
        if (animationTimeout.current) {
            clearTimeout(animationTimeout.current);
        }

        // Set animating flag
        isAnimating.current = true;

        // Use parallel animations for smoother transition
        Animated.parallel([
            Animated.timing(scrollY, {
                toValue: HEADER_SCROLL_DISTANCE + 10,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(headerTranslateY, {
                toValue: -HEADER_SCROLL_DISTANCE,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(headerScale, {
                toValue: 0.8,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(headerOpacity, {
                toValue: 0.8,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            // After animation completes, focus the floating search bar and show history
            animationTimeout.current = setTimeout(() => {
                setShowFloatingBar(true);
                floatingSearchInputRef.current?.focus();
                setShowSearchHistory(true);
                isAnimating.current = false;
            }, 50); // Reduced delay for snappier response
        });
    };

    // Optimize reverse animation
    const animateToOriginalPosition = () => {
        // First dismiss the keyboard
        Keyboard.dismiss();

        // Blur any focused inputs
        floatingSearchInputRef.current?.blur();
        searchInputRef.current?.blur();

        // Set animating flag
        isAnimating.current = true;

        // Get the target position
        const targetPosition = Math.min(lastScrollValue.current, HEADER_SCROLL_DISTANCE * 0.9);

        // Use parallel animations for smoother transition
        Animated.parallel([
            Animated.timing(scrollY, {
                toValue: targetPosition,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(headerTranslateY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(headerScale, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(headerOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            isAnimating.current = false;
        });
    };

    // Update the showFloatingBar state based on scroll position
    useEffect(() => {
        const scrollListener = scrollY.addListener(({ value }) => {
            setShowFloatingBar(value > HEADER_SCROLL_DISTANCE * 0.7);
            // Store the last scroll value when it's from user scrolling
            // (not during search history display)
            if (!showSearchHistory && !isAnimating.current) {
                lastScrollValue.current = value;
            }
        });

        // Clean up the listener when the component unmounts
        return () => {
            scrollY.removeListener(scrollListener);
            if (animationTimeout.current) {
                clearTimeout(animationTimeout.current);
            }
        };
    }, [showSearchHistory]);

    // Handle search bar focus - will trigger scroll animation
    const handleSearchFocus = () => {
        // Start the animation to floating search bar
        animateToFloatingSearchBar();

        // Reset search input
        setCurrentSearchInput('');
    };

    const handleBlueSearchBlur = () => {
        // Only react to blur if we're not animating
        if (!isAnimating.current) {
            setShowSearchHistory(false);
        }
    };

    const handleHistoryItemPress = (item: any) => {
        // // console.log("handleHistoryItemPress", item);
        handleCarPress(item);
    };

    const handleCloseSearchHistory = () => {
        setShowSearchHistory(false);
        setShowFloatingBar(false);

        // Run the reverse animation
        animateToOriginalPosition();

        Keyboard.dismiss();
    };

    const handleCarPress = (car: any) => {
        router.push({
            pathname: '/(main)/biluppgifter/[regnr]',
            params: {
                regnr: car.regNumber
            }
        });
    };

    // Update the RegistrationNumberInput components to track input changes
    const handleSearchInputChange = (text: string) => {
        setCurrentSearchInput(text);
    };

    const handleSearchResult = (result: any) => {
        // // console.log('Search in SearchHistory received:', result);

        // When a search is performed directly in SearchHistory
        if (result) {
            // If result is a car object with regNumber
            if (typeof result === 'object' && result.regNumber) {
                handleCarSearch(result);
                return;
            }

            // If result is a string (reg number directly entered)
            if (typeof result === 'string') {
                const regNumber = result.trim();
                handleCarSearch({
                    id: Date.now().toString(),
                    regNumber: regNumber,
                    carModel: 'Sökresultat'
                });
                return;
            }
        }
    };

    const handleCarSearch = (car: any) => {
        // // console.log('SearchHistory: navigating to car:', car);

        // Close the search history first
        setShowSearchHistory(false);
        setShowFloatingBar(false);

        // Navigate to car details with the registration number
        // // console.log('SearchHistory: Navigating to CarDetails');
        router.push({
            pathname: '/(main)/biluppgifter/[regnr]',
            params: {
                regnr: car.regNumber
            }
        });
    };

    const onCameraPress = () => {
        // // console.log('Camera pressed');
    };

    // Calculate animated styles based on scroll position
    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    });

    const headerInterpolatedOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE * 0.7, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 1, 0],
        extrapolate: 'clamp',
    });

    // Floating search bar animation
    const floatingSearchOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE * 0.6, HEADER_SCROLL_DISTANCE],
        outputRange: [0, 0, 1],
        extrapolate: 'clamp',
    });

    const floatingSearchTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [20, 0],
        extrapolate: 'clamp',
    });
    const logoOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE * 0.5],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const logoScale = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE * 0.5],
        outputRange: [1, 0.5],
        extrapolate: 'clamp',
    });

    // Add an effect to handle animation cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationTimeout.current) {
                clearTimeout(animationTimeout.current);
            }
            setShowFloatingBar(false);
            setShowSearchHistory(false);
        };
    }, []);

    const AppHeaderComponent = () => {
        return (
            <View style={styles.navButtonsContainer} >
                <SvgXml xml={ImagePath.SvgIcons.CarDetailsHeaderAppIcon} />
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress}>
                        <SvgXml xml={isPremiumUser ? ImagePath.SvgIcons.UserPremiumIcon : ImagePath.SvgIcons.UserIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress}>
                        <MaterialCommunityIcons name="menu" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View >
        );
    };

    return (
        <View>
            <Animated.View
                style={[
                    // showSearchHistory ? styles.keyboardAvoidingContainerWithSearchHistory : styles.keyboardAvoidingContainer,
                    {
                        height: showSearchHistory ? 0 : headerHeight,
                        // height: 0,
                        zIndex: 1100,
                    }
                ]}
            >
                {/* Menu Popup */}
                <PopupMenu
                    visible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    popupPosition={"right"}
                />

                {/* Profile Menu Popup */}
                <ProfilePopupMenu
                    visible={profileMenuVisible}
                    onClose={() => setProfileMenuVisible(false)}
                />

                <Animated.View
                    style={[
                        styles.header,
                        {
                            height: headerHeight,
                            transform: [
                                { translateY: headerTranslateY },
                                { scale: headerScale }
                            ],
                            opacity: headerOpacity
                        }
                    ]}
                >
                    <Animated.View
                        style={[
                            {
                                opacity: logoOpacity,
                                transform: [{ scale: logoScale }]
                            }
                        ]}
                    >

                        <StatusBar
                            barStyle={showFloatingBar ? "dark-content" : "light-content"}
                            backgroundColor={myColors.primary.main}
                            translucent
                        />

                        <AppHeaderComponent />

                        {/* Mobile-style search bar - white background with blue border */}
                        <View style={styles.mobileStyleSearchBar} >
                            <Ionicons
                                name="search"
                                size={20}
                                color={myColors.text.secondary}
                                style={styles.searchIcon}
                            />
                            <RegistrationNumberInput
                                ref={searchInputRef}
                                style={styles.mobileSearchText}
                                placeholderTextColor={myColors.text.webGray}
                                onFocus={handleSearchFocus}
                                onSearchResult={handleSearchResult}
                                onChangeText={handleSearchInputChange}
                                placeholder="Registreringsnummer / VIN"
                                hideIcon={true}
                            />
                        </View>
                    </Animated.View>
                </Animated.View>

                {/* Floating search bar that appears when scrolled */}
                {showFloatingBar && (
                    <Animated.View
                        style={[
                            styles.floatingSearchContainer,
                            {
                                opacity: floatingSearchOpacity,
                                transform: [{ translateY: floatingSearchTranslateY }],
                            }
                        ]}
                    >
                        <View style={styles.floatingMobileStyleSearchBar}>
                            <Ionicons
                                name="search"
                                size={20}
                                color={myColors.text.secondary}
                                style={styles.searchIcon}
                            />
                            <RegistrationNumberInput
                                ref={floatingSearchInputRef}
                                style={styles.floatingMobileSearchText}
                                onFocus={() => setShowSearchHistory(true)}
                                onSearchResult={handleSearchResult}
                                onChangeText={handleSearchInputChange}
                                placeholder="Registreringsnummer / VIN"
                                placeholderTextColor={myColors.text.webGray}
                                hideIcon={true}
                            />
                        </View>
                    </Animated.View>
                )}

            </Animated.View>
            {/* Search History Overlay */}
            {showSearchHistory && (
                <SearchHistory
                    visible={showSearchHistory}
                    historyItems={searchHistory}
                    garages={garages}
                    favoriteItems={[]}
                    onItemPress={handleHistoryItemPress}
                    onClose={handleCloseSearchHistory}
                    currentSearchInput={currentSearchInput}
                    onSearchInputChange={handleSearchInputChange}
                    isFromHome={true}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        // position: 'absolute',
        // left: 0,
        // right: 0,
        // bottom: 0,
        // top: HEADER_MAX_HEIGHT - 50, // Position it just below the header
        // height: Platform.OS === 'ios' ? 200 : 190,
        zIndex: 1100,
        // flex: 1,
    },
    keyboardAvoidingContainerWithSearchHistory: {
        zIndex: 1100,
    },
    container: {
        // position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: myColors.primary.main,
        zIndex: 900,
        paddingHorizontal: 16,
        overflow: 'hidden',
        paddingTop: Platform.OS === 'ios' ? 50 : 40, // For status bar
        borderBottomRightRadius: 40,
        borderBottomLeftRadius: 40,
    },
    header: {
        backgroundColor: myColors.primary.main,
        borderBottomRightRadius: 40,
        borderBottomLeftRadius: 40,
        paddingVertical: 10,
        paddingHorizontal: Platform.OS === "android" ? 15 : 0,
        paddingTop: Platform.OS === 'ios' ? 50 : 40, // For status bar
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        // height: Platform.OS === 'ios' ? 200 : 190, //added new
    },
    backButton: {
        height: 46,
        width: 46,
        borderRadius: 30,
        marginRight: 15,
        backgroundColor: myColors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
    },
    emptySpace: {
        width: 40, // To balance the header
    },
    navButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginVertical: 10,
        paddingHorizontal: Platform.OS === "ios" ? 15 : 0,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginLeft: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Mobile-style search bar (white with blue border, like WhiteSearchButton)
    mobileStyleSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.white,
        borderWidth: 2,
        borderColor: myColors.primary.main,
        borderRadius: 10,
        height: 62,
        paddingRight: 15,
        paddingLeft: 15,
        marginTop: 10,
        marginHorizontal: Platform.OS === 'ios' ? 15 : 0,
        // Make it wider for desktop/larger screens
        minWidth: Platform.OS === 'web' ? 400 : 'auto',
    },
    searchIcon: {
        marginRight: 10,
    },
    mobileSearchText: {
        color: myColors.text.primary,
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
    },
    searchInputWithIconWrapper: {
        flexDirection: "row",
        alignItems: "center"
    },
    // Floating search bar styles (mobile-style)
    floatingSearchContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 1000,
    },
    floatingMobileStyleSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.white,
        borderWidth: 2,
        borderColor: myColors.primary.main,
        borderRadius: 10,
        height: 62,
        paddingRight: 15,
        paddingLeft: 15,
        flex: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.46,
        shadowRadius: 11.14,
        elevation: 17,
        // Make it wider for desktop/larger screens
        minWidth: Platform.OS === 'web' ? 400 : 'auto',
    },
    floatingMobileSearchText: {
        flex: 1,
        color: myColors.text.primary,
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default HeaderWithSearch;
