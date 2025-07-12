import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, FlatList, Animated, ScrollView, Keyboard, KeyboardAvoidingView, Platform, StatusBar, TextInput, Easing, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import { HomeHeaderRef } from '@/components/common/HomeHeader';
import { router } from 'expo-router';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { IconClose } from '@/assets/icons';

interface SearchHistoryItem {
    id: string;
    regNumber: string;
    carModel: string;
}

interface Garage {
    name: string;
    cars: SearchHistoryItem[];
}

interface SearchHistoryProps {
    visible: boolean;
    historyItems: SearchHistoryItem[];
    garages: Garage[];
    favoriteItems: SearchHistoryItem[];
    onItemPress: (item: SearchHistoryItem) => void;
    onClose: () => void;
    isFromHome?: boolean;
    onSearch?: (query: string) => void;
    currentSearchInput?: string;
    onSearchInputChange?: (text: string) => void;
    isDropdownMode?: boolean;
}

// Matches the home screen header height
const HEADER_MAX_HEIGHT = 365;

const SearchHistory: React.FC<SearchHistoryProps> = ({
    visible,
    historyItems,
    garages,
    favoriteItems,
    onItemPress,
    onClose,
    isFromHome = false,
    onSearch,
    currentSearchInput = '',
    onSearchInputChange,
    isDropdownMode = false
}) => {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const headerRef = useRef<HomeHeaderRef>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const desktopWeb = isDesktopWeb();

    // Animation effect - only for full-screen mode
    useEffect(() => {
        if (isDropdownMode) {
            setIsVisible(visible);
            return;
        }

        if (visible) {
            setIsVisible(true);
            setIsAnimating(true);
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }).start(() => {
                setIsAnimating(false);
            });
        } else {
            setIsAnimating(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }).start(() => {
                setIsVisible(false);
                setIsAnimating(false);
            });
        }
    }, [visible, slideAnim, isDropdownMode]);

    // Memoize all callbacks and computed values
    const handleCarSearch = useCallback((car: any) => {
        onClose();
        router.replace({
            pathname: '/(main)/biluppgifter/[regnr]',
            params: {
                regnr: car.regNumber.replace(/\s+/g, "")
            }
        });
    }, [onClose]);

    const handleSearch = useCallback((result: any) => {
        if (result) {
            if (typeof result === 'object' && result.regNumber) {
                handleCarSearch(result);
                return;
            }

            if (typeof result === 'string') {
                const regNumber = result.trim();
                handleCarSearch({
                    id: Date.now().toString(),
                    regNumber: regNumber,
                    carModel: 'Sökresultat'
                });
                return;
            }

            if (onSearch) {
                onSearch(result);
            }
        }
    }, [handleCarSearch, onSearch]);

    const renderHighlightedRegNumber = (regNumber: string) => {
        if (!desktopWeb || !currentSearchInput) return regNumber;
        const input = currentSearchInput.replace(/\s/g, '').toUpperCase();
        const upperReg = regNumber.toUpperCase();
        if (!upperReg.startsWith(input) || input.length === 0) return regNumber;
        const match = regNumber.substring(0, input.length);
        const rest = regNumber.substring(input.length);
        return (<>
            <Text style={{ color: myColors.primary.main, fontFamily: 'Poppins' }}>{match}</Text>
            {rest}
        </>);
    };

    const renderHistoryItem = useCallback(({ item }: { item: SearchHistoryItem }) => (
        <Pressable
            style={({ hovered }) => [
                styles.historyItem,
                isDropdownMode && styles.historyItemDropdown,
                hovered && desktopWeb && styles.historyItemHovered
            ]}
            onPress={() => handleCarSearch(item)}
        >
            <MyText fontFamily='Poppins' style={[styles.regNumber, isDropdownMode && styles.regNumberDropdown]}>
                {renderHighlightedRegNumber(item.regNumber)}
            </MyText>
            <MyText fontFamily='Poppins' style={[styles.separator, isDropdownMode && styles.separatorDropdown]}>
                -
            </MyText>
            <MyText fontFamily='Poppins' style={[styles.carModel, isDropdownMode && styles.carModelDropdown]}>
                {item.carModel}
            </MyText>
        </Pressable>
    ), [handleCarSearch, isDropdownMode, desktopWeb, currentSearchInput]);

    const renderSectionHeader = useCallback((title: string, icon: string) => (
        <View style={[styles.sectionHeader, isDropdownMode && styles.sectionHeaderDropdown]}>
            <SvgXml xml={icon} width={isDropdownMode ? 14 : 16} height={isDropdownMode ? 14 : 16} />
            <MyText style={[styles.sectionTitle, isDropdownMode && styles.sectionTitleDropdown]}>
                {title}
            </MyText>
        </View>
    ), [isDropdownMode]);

    // Memoize filtered results
    const filteredHistoryItems = useMemo(() => {
        if (!currentSearchInput) return historyItems;
        const searchInput = currentSearchInput.replace(/\s/g, '').toLowerCase();
        return historyItems?.filter(item => {
            const regNumber = item.regNumber.replace(/\s/g, '').toLowerCase();
            return regNumber.startsWith(searchInput);
        });
    }, [historyItems, currentSearchInput]);

    const filteredFavoriteItems = useMemo(() => {
        if (!currentSearchInput) return favoriteItems;
        const searchInput = currentSearchInput.replace(/\s/g, '').toLowerCase();
        return favoriteItems?.filter(item => {
            const regNumber = item.regNumber.replace(/\s/g, '').toLowerCase();
            return regNumber.startsWith(searchInput);
        });
    }, [favoriteItems, currentSearchInput]);

    const filteredGarages = useMemo(() => {
        if (!currentSearchInput) return garages;
        const searchInput = currentSearchInput.replace(/\s/g, '').toLowerCase();
        return garages?.map(garage => ({
            ...garage,
            cars: garage.cars.filter(car => {
                const regNumber = car.regNumber.replace(/\s/g, '').toLowerCase();
                return regNumber.startsWith(searchInput);
            })
        })).filter(garage => garage.cars.length > 0);
    }, [garages, currentSearchInput]);

    const hasResults = useMemo(() => {
        return (
            (filteredHistoryItems?.length > 0) ||
            (filteredFavoriteItems?.length > 0) ||
            (filteredGarages?.some(garage => garage.cars.length > 0))
        );
    }, [filteredHistoryItems, filteredFavoriteItems, filteredGarages]);

    if (!isVisible) return null;

    // Dropdown mode - simplified layout
    if (isDropdownMode) {
        return (
            <View style={styles.dropdownContainer}>
                <ScrollView
                    style={styles.dropdownScrollContent}
                    contentContainerStyle={styles.dropdownScrollContentInner}
                    keyboardShouldPersistTaps="handled"
                    removeClippedSubviews={false}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    scrollEventThrottle={16}
                    bounces={true}
                >
                    {filteredHistoryItems?.length > 0 && (
                        <View style={[styles.section, styles.sectionDropdown]}>
                            {renderSectionHeader('Historik', ImagePath.SvgIcons.SearchHistoryIcon)}
                            {filteredHistoryItems?.map(item => (
                                <React.Fragment key={item.id}>
                                    {renderHistoryItem({ item })}
                                </React.Fragment>
                            ))}
                        </View>
                    )}

                    {filteredFavoriteItems.length > 0 && (
                        <View style={[styles.section, styles.sectionDropdown]}>
                            {renderSectionHeader('Favoriter', ImagePath.SvgIcons.SearchFavouriteIcon)}
                            {filteredFavoriteItems?.map(item => (
                                <React.Fragment key={item.id}>
                                    {renderHistoryItem({ item })}
                                </React.Fragment>
                            ))}
                        </View>
                    )}

                    {filteredGarages?.map((garage, index) => (
                        garage?.cars?.length > 0 && (
                            <View key={index} style={[styles.section, styles.sectionDropdown]}>
                                {renderSectionHeader(garage.name, ImagePath.SvgIcons.SearchFavouriteIcon)}
                                {garage.cars.map(item => (
                                    <React.Fragment key={item.id}>
                                        {renderHistoryItem({ item })}
                                    </React.Fragment>
                                ))}
                            </View>
                        )
                    ))}

                    {!hasResults && currentSearchInput && (
                        <View style={[styles.noResultsContainer, styles.noResultsContainerDropdown]}>
                            <MyText style={[styles.noResultsText, styles.noResultsTextDropdown]}>
                                Inga resultat hittades för "{currentSearchInput}"
                            </MyText>
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    }

    // Full-screen mode - original layout
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.keyboardAvoidingContainer, { backgroundColor: myColors.white }]}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            enabled={Platform.OS === 'ios'}
        >
            <StatusBar
                barStyle="dark-content"
                backgroundColor={myColors.white}
                translucent={false}
            />

            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity: slideAnim,
                        transform: [
                            {
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                    extrapolate: 'clamp'
                                })
                            }
                        ]
                    }
                ]}
            >
                <View style={isFromHome ? styles.header : styles.headerWithoutMarginTop}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <IconClose size={24} color={myColors.text.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollContent}
                    contentContainerStyle={styles.scrollContentInner}
                    keyboardShouldPersistTaps="handled"
                    removeClippedSubviews={true}
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                >
                    {filteredHistoryItems?.length > 0 && (
                        <View style={styles.section}>
                            {renderSectionHeader('Historik', ImagePath.SvgIcons.SearchHistoryIcon)}
                            {filteredHistoryItems?.map(item => (
                                <React.Fragment key={item.id}>
                                    {renderHistoryItem({ item })}
                                </React.Fragment>
                            ))}
                        </View>
                    )}

                    {filteredFavoriteItems.length > 0 && (
                        <View style={styles.section}>
                            {renderSectionHeader('Favoriter', ImagePath.SvgIcons.SearchFavouriteIcon)}
                            {filteredFavoriteItems?.map(item => (
                                <React.Fragment key={item.id}>
                                    {renderHistoryItem({ item })}
                                </React.Fragment>
                            ))}
                        </View>
                    )}

                    {filteredGarages?.map((garage, index) => (
                        garage?.cars?.length > 0 && (
                            <View key={index} style={styles.section}>
                                {renderSectionHeader(garage.name, ImagePath.SvgIcons.SearchFavouriteIcon)}
                                {garage.cars.map(item => (
                                    <React.Fragment key={item.id}>
                                        {renderHistoryItem({ item })}
                                    </React.Fragment>
                                ))}
                            </View>
                        )
                    ))}

                    {!hasResults && currentSearchInput && (
                        <View style={styles.noResultsContainer}>
                            <MyText style={styles.noResultsText}>
                                Inga resultat hittades för "{currentSearchInput}"
                            </MyText>
                        </View>
                    )}

                    <View style={styles.bottomPadding} />
                </ScrollView>
            </Animated.View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        height: "100%",
        zIndex: 800,
        backgroundColor: myColors.white,
    },
    container: {
        flex: 1,
        backgroundColor: myColors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 1000,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
    },
    headerWithoutMarginTop: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
    },
    closeButton: {
        padding: 10,
    },
    contentContainer: {
        position: 'absolute',
        top: HEADER_MAX_HEIGHT - 20,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 30,
        paddingHorizontal: 20,
        zIndex: 800,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        width: '100%',
        marginLeft: 0,
        marginRight: 0,
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContentInner: {
        paddingBottom: 50,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        color: myColors.text.primary,
        marginLeft: 12,
        fontFamily: 'Poppins',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    regNumber: {
        fontSize: 14,
        color: myColors.text.primary,
        fontFamily: 'Poppins',
    },
    separator: {
        fontSize: 14,
        color: myColors.text.primary,
        marginHorizontal: 10,
        fontFamily: 'Poppins',
    },
    carModel: {
        fontSize: 14,
        color: myColors.text.primary,
        flex: 1,
        fontFamily: 'Poppins',
    },
    bottomPadding: {
        height: 50,
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    noResultsText: {
        fontSize: 16,
        color: myColors.text.secondary,
        textAlign: 'center',
        fontFamily: 'Poppins',
    },

    // Dropdown mode styles
    dropdownContainer: {
        flex: 1,
        backgroundColor: myColors.white,
        maxHeight: 520,
    },
    dropdownScrollContent: {
        flex: 1,
    },
    dropdownScrollContentInner: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 20,
    },
    sectionDropdown: {
        marginBottom: 20,
    },
    sectionHeaderDropdown: {
        marginBottom: 8,
    },
    sectionTitleDropdown: {
        fontSize: 14,
        marginLeft: 8,
        fontFamily: 'Poppins',
    },
    historyItemDropdown: {
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    regNumberDropdown: {
        fontSize: 13,
        fontFamily: 'Poppins',
    },
    separatorDropdown: {
        fontSize: 13,
        marginHorizontal: 8,
        fontFamily: 'Poppins',
    },
    carModelDropdown: {
        fontSize: 13,
        fontFamily: 'Poppins',
    },
    noResultsContainerDropdown: {
        paddingTop: 20,
        paddingBottom: 10,
    },
    noResultsTextDropdown: {
        fontSize: 14,
        fontFamily: 'Poppins',
    },
    historyItemHovered: {
        backgroundColor: myColors.primary.light4,
        // @ts-ignore - cursor is web-only style property
        cursor: 'pointer',
    },
});

export default SearchHistory;