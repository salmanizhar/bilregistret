import { StyleSheet, View, Platform, StatusBar, TouchableOpacity, KeyboardAvoidingView, Keyboard, Animated, Easing } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { myColors } from '@/constants/MyColors'
import RegistrationNumberInput, { RegistrationNumberInputRef } from '@/components/common/RegistrationNumberInput'
import SearchHistory from '@/components/home/SearchHistory'
import { Stack, router } from 'expo-router'
import { useIsFocused } from '@react-navigation/native'
import { userService } from '@/Services/api/services/user.service'
import { useAuth } from '@/Services/api/context/auth.context'
import MyText from '@/components/common/MyText'
import MyButton from '@/components/common/MyButton'

const SearchScreen = () => {
    const isFocused = useIsFocused();
    const { isGuestMode, isAuthenticated } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [historyVisible, setHistoryVisible] = useState(false);
    const inputRef = useRef<RegistrationNumberInputRef>(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const animatedValue = useRef(new Animated.Value(0)).current;

    // search history states
    const [searchHistory, setSearchHistory] = useState<any[]>([]);
    const [garages, setGarages] = useState<any[]>([]);
    const [currentSearchInput, setCurrentSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Shimmer animation for skeleton
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    // Track keyboard visibility to prevent flickering
    // useEffect(() => {
    //     const keyboardWillShowListener = Keyboard.addListener(
    //         Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
    //         () => {
    //             setKeyboardVisible(true);
    //             Animated.timing(animatedValue, {
    //                 toValue: 1,
    //                 duration: 250,
    //                 useNativeDriver: false
    //             }).start();
    //         }
    //     );
    //     const keyboardWillHideListener = Keyboard.addListener(
    //         Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
    //         () => {
    //             setKeyboardVisible(false);
    //             Animated.timing(animatedValue, {
    //                 toValue: 0,
    //                 duration: 250,
    //                 useNativeDriver: false
    //             }).start();
    //         }
    //     );

    //     return () => {
    //         keyboardWillShowListener.remove();
    //         keyboardWillHideListener.remove();
    //     };
    // }, []);

    // Start shimmer animation when loading
    useEffect(() => {
        if (isLoading) {
            Animated.loop(
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.linear
                })
            ).start();
        } else {
            shimmerAnim.setValue(0);
        }

        return () => {
            shimmerAnim.setValue(0);
            // cleanupForScreen('SearchScreen');
            // performCacheCleanup();
        };
    }, [isLoading, shimmerAnim]);

    // Pre-fetch data when component mounts or when search history becomes visible
    useEffect(() => {
        if (isFocused) {
            // Only fetch data if not in guest mode
            if (!isGuestMode && isAuthenticated) {
                fetchData();
            }
        }
    }, [isFocused, isGuestMode, isAuthenticated]);


    // Function to fetch both search history and favorites
    const fetchData = async () => {
        // Skip API call if in guest mode
        if (isGuestMode || !isAuthenticated) return;

        try {
            setIsLoading(true);
            const [historyResponse, garagesResponse] = await Promise.all([
                userService.getSearchHistory(),
                userService.getGarages(),
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
            // console.log('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Show history after component mounts with a slight delay for animations
    useEffect(() => {
        const timer = setTimeout(() => {
            setHistoryVisible(true);
            // Focus the input after history becomes visible
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 50); // Reduced from 150ms to 50ms since we're loading data earlier

        return () => clearTimeout(timer);
    }, []);

    // Handle search input change
    const handleSearchInputChange = (text: string) => {
        setSearchInput(text);
        setCurrentSearchInput(text);
    };

    // Handle search result selection
    const handleSearchResult = (result: any) => {
        Keyboard.dismiss();
        setCurrentSearchInput('');

        if (typeof result === 'object' && result.regNumber) {
            router.replace({
                pathname: '/(main)/biluppgifter/[regnr]',
                params: {
                    regnr: result.regNumber
                }
            });
        } else if (typeof result === 'string' && result.trim()) {
            // Handle direct text input (registration number)
            router.replace({
                pathname: '/(main)/biluppgifter/[regnr]',
                params: {
                    regnr: result.trim()
                }
            });
        }
    };

    const handleCarPress = (car: any) => {
        router.replace({
            pathname: '/(main)/biluppgifter/[regnr]',
            params: {
                regnr: car.regNumber.replace(/\s+/g, "")
            }
        });
    };

    const handleHistoryItemPress = (item: any) => {
        setCurrentSearchInput('');
        handleCarPress(item);
    };

    const handleCloseSearchHistory = () => {
        Keyboard.dismiss();
        setCurrentSearchInput('');
        router.back();
    };

    const handleLoginPress = () => {
        router.replace('/(auth)/login');
    };

    // Skeleton loading component
    const LoadingSkeleton = () => {
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

        const SkeletonItem = () => (
            <View style={styles.skeletonItem}>
                <View style={styles.skeletonContent}>
                    <View style={styles.skeletonTitle}>
                        <ShimmerOverlay />
                    </View>
                    <View style={styles.skeletonSubtitle}>
                        <ShimmerOverlay />
                    </View>
                </View>
            </View>
        );

        return (
            <View style={styles.skeletonContainer}>
                <View style={styles.skeletonSection}>
                    <View style={styles.skeletonSectionTitle}>
                        <ShimmerOverlay />
                    </View>
                    {Array(3).fill(null).map((_, index) => (
                        <SkeletonItem key={`history-${index}`} />
                    ))}
                </View>

                <View style={styles.skeletonSection}>
                    <View style={styles.skeletonSectionTitle}>
                        <ShimmerOverlay />
                    </View>
                    {Array(2).fill(null).map((_, index) => (
                        <SkeletonItem key={`garage-${index}`} />
                    ))}
                </View>
            </View>
        );
    };

    // Login message component for guest mode
    const renderLoginMessage = () => (
        <View style={styles.loginMessageContainer}>
            <MyText style={styles.loginMessageTitle}>Logga in för fler funktioner</MyText>
            <MyText style={styles.loginMessageText}>
                Få tillgång till ditt garage, sökhistorik, favoriter och mer information om fordonen.
            </MyText>
            <MyButton
                title="LOGGA IN"
                onPress={handleLoginPress}
                buttonStyle={styles.loginButton}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    animation: 'fade',
                    animationDuration: 200,
                    contentStyle: {
                        backgroundColor: myColors.white,
                    },
                }}
            />
            <StatusBar barStyle="dark-content" backgroundColor={myColors.white} />

            {/* Main container with consistent background */}
            <View style={styles.mainContainer}>
                {/* Header with search input */}
                <View style={styles.header}>
                    <View style={styles.searchContainer}>
                        <RegistrationNumberInput
                            ref={inputRef}
                            style={styles.searchInput}
                            onChangeText={handleSearchInputChange}
                            onSearchResult={handleSearchResult}
                            placeholder="Registreringsnummer / VIN"
                            value={searchInput}
                        />
                    </View>
                </View>

                {/* Main content container */}
                <View style={styles.contentContainer}>
                    {(isLoading && searchHistory.length === 0 && garages.length === 0) ? (
                        <LoadingSkeleton />
                    ) : isGuestMode || !isAuthenticated ? (
                        <View style={styles.guestModeContainer}>
                            {/* Show empty SearchHistory component with placeholder message */}
                            <SearchHistory
                                visible={true}
                                historyItems={[]}
                                garages={[]}
                                favoriteItems={[]}
                                onItemPress={handleHistoryItemPress}
                                onClose={handleCloseSearchHistory}
                                currentSearchInput={currentSearchInput}
                                onSearchInputChange={handleSearchInputChange}
                                isFromHome={true}
                            />
                            {renderLoginMessage()}
                        </View>
                    ) : (
                        /* Authenticated user view with search history */
                        <SearchHistory
                            visible={true}
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
            </View>
        </View>
    )
}

export default SearchScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.white,
    },
    mainContainer: {
        flex: 1,
        // paddingTop: Platform.OS === 'ios' ? 44 + 10 : (StatusBar.currentHeight || 0),
        paddingTop: Platform.OS === 'ios' ? 44 + 10 : 0, // removed android status bar height because it's not required for this screen.
        backgroundColor: myColors.white,
    },
    header: {
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 1000,
        backgroundColor: myColors.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.white,
        justifyContent: "space-between",
        marginTop: 10,
        marginBottom: 5,
        borderRadius: 10,
        height: 62,
        paddingRight: 10,
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
    },
    searchInput: {
        height: 40,
        fontSize: 16,
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: myColors.white,
    },
    guestModeContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: myColors.white,
    },
    loginMessageContainer: {
        position: 'absolute',
        top: 70,
        left: 20,
        right: 20,
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        zIndex: 1000,
        backgroundColor: myColors.white,
    },
    loginMessageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: myColors.black,
    },
    loginMessageText: {
        fontSize: 16,
        color: myColors.text.secondary,
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 22,
    },
    loginButton: {
        backgroundColor: myColors.black,
        paddingHorizontal: 30,
        minWidth: 300,
    },
    // Skeleton loading styles
    skeletonContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: myColors.white,
    },
    skeletonSection: {
        marginBottom: 30,
    },
    skeletonSectionTitle: {
        height: 20,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        marginBottom: 15,
        width: '40%',
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonItem: {
        backgroundColor: myColors.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonContent: {
        flex: 1,
    },
    skeletonTitle: {
        height: 18,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        marginBottom: 8,
        width: '70%',
        position: 'relative',
        overflow: 'hidden',
    },
    skeletonSubtitle: {
        height: 14,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 4,
        width: '50%',
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
})