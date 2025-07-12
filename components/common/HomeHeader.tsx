import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, TextInput, Keyboard } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { SvgXml } from 'react-native-svg';
import { HomeScreenAppLogo } from '@/assets/images/SvgIcons';
import { ImagePath } from '@/assets/images';
import RegistrationNumberInput, { RegistrationNumberInputRef } from './RegistrationNumberInput';
import { useAuth } from '@/Services/api/context/auth.context';

interface HomeHeaderProps {
    onMenuPress: () => void;
    onProfilePress: () => void;
    onCameraPress: () => void;
    onSearchFocus?: () => void;
    onSearchResult?: (result: any) => void;
    onSearchInputChange?: (text: string) => void;
    currentSearchInput?: string;
    placeholder?: React.ReactNode;
}

// Matches the home screen header height
const HEADER_MAX_HEIGHT = 365;

export interface HomeHeaderRef {
    focusSearchInput: () => void;
}

const HomeHeader = forwardRef<HomeHeaderRef, HomeHeaderProps>(({
    onMenuPress,
    onProfilePress,
    onCameraPress,
    onSearchFocus,
    onSearchResult,
    onSearchInputChange,
    currentSearchInput,
    placeholder
}, ref) => {
    const { isPremiumUser } = useAuth();
    const searchInputRef = useRef<RegistrationNumberInputRef>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        focusSearchInput: () => {
            // // console.log('HomeHeader: Attempting to focus search input');
            // Try forcing focus with a slight delay to ensure UI is ready
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                    // // console.log('HomeHeader: Search input focused');
                } else {
                    // // console.log('HomeHeader: searchInputRef is null');
                }
            }, 50);
        }
    }));

    const handleSearchFocus = () => {
        if (onSearchFocus) {
            onSearchFocus();
        }
    };

    const handleSearch = (result: any) => {
        // // console.log('Search result from HomeHeader:', result);
        if (onSearchResult && result) {
            onSearchResult(result);
        }
    };

    return (
        <View style={styles.header}>
            {/* Top navigation buttons */}
            <View style={styles.navButtonsContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
                    <MaterialCommunityIcons name="menu" size={24} color="white" />
                </TouchableOpacity>

                {/* Invisible middle spacer */}
                <View style={styles.middleSpacer} />

                <TouchableOpacity style={styles.iconButton} onPress={onProfilePress}>
                    <SvgXml xml={isPremiumUser ? ImagePath.SvgIcons.UserPremiumIcon : ImagePath.SvgIcons.UserIcon} />
                </TouchableOpacity>
            </View>

            {/* Logo section */}
            <View style={styles.logoContainer}>
                <View style={styles.logoWrapper}>
                    <SvgXml xml={HomeScreenAppLogo} />
                </View>
                {/* Info text */}
                <MyText style={styles.infoText}>
                    Bilregistret Sverige AB Sök biluppgifter i bilregistret via registreringsnummer
                </MyText>

                {/* Blue background search bar */}
                <View style={styles.blueSearchBar} >
                    <RegistrationNumberInput
                        ref={searchInputRef}
                        style={styles.blueSearchText}
                        placeholderTextColor={myColors.white}
                        iconColor={myColors.white}
                        onFocus={handleSearchFocus}
                        onSearchResult={handleSearch}
                        onChangeText={onSearchInputChange}
                        value={currentSearchInput}
                        placeholder={placeholder}
                    />
                    {/* <TouchableOpacity style={styles.cameraButton} onPress={onCameraPress}>
                        <Feather name="camera" size={18} color="black" />
                    </TouchableOpacity> */}
                </View>
            </View>
        </View>
    );
});

// Add display name for React DevTools
HomeHeader.displayName = 'HomeHeader';

const styles = StyleSheet.create({
    header: {
        backgroundColor: myColors.primary.main,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingHorizontal: 16,
        height: HEADER_MAX_HEIGHT,
        zIndex: 1000,
        elevation: 10,
        overflow: 'hidden',
    },
    navButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginVertical: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: "#327EE8",
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleSpacer: {
        width: 30,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -5,
    },
    infoText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: 20,
        paddingTop: 25,
        paddingBottom: 15
    },
    blueSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.productBackgroundGrey,
        justifyContent: "space-between",
        borderRadius: 50,
        height: 62,
        paddingRight: 10,
        paddingLeft: 15,
    },
    blueSearchText: {
        flex: 1,
        color: myColors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    cameraButton: {
        backgroundColor: myColors.white,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
});

export default HomeHeader;