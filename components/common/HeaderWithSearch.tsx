import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { myColors } from '@/constants/MyColors';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import PopupMenu from '../menu/PopupMenu';
import ProfilePopupMenu from '../menu/ProfilePopupMenu';
import { router } from 'expo-router';
import { useAuth } from '@/Services/api/context/auth.context';
import BlueSearchButton from './BlueSearchButton';
import { LoginPopup } from '@/components/auth';
import { IconMenu } from '@/assets/icons';
import { safeNavigation } from '@/utils/safeNavigation';

interface HeaderWithSearchProps { }

const HeaderWithSearch: React.FC<HeaderWithSearchProps> = ({ }) => {
    const { isPremiumUser, isAuthenticated } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);
    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState('');


    const handleMenuPress = () => {
        setMenuVisible(true);
    };

    const handleProfilePress = () => {
        setProfileMenuVisible(true);
    };

    // Handle authentication-required navigation
    const handleAuthRequiredNavigation = useCallback((destination: any) => {
        if (!isAuthenticated) {
            setPendingNavigation(destination);
            setShowLoginPopup(true);
        } else {
            safeNavigation(destination);
        }
    }, [isAuthenticated]);

    // Handle login success
    const handleLoginSuccess = useCallback(() => {
        setShowLoginPopup(false);

        // Navigate to the pending destination if there is one
        if (pendingNavigation) {
            const destination = pendingNavigation;
            setPendingNavigation('');
            safeNavigation(destination as any);
        }
    }, [pendingNavigation]);

    const AppHeaderComponent = () => {
        return (
            <View style={styles.navButtonsContainer} >
                <TouchableOpacity onPress={() => router.replace('/')}>
                    <SvgXml xml={ImagePath.SvgIcons.CarDetailsHeaderAppIcon} />
                </TouchableOpacity>
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress}>
                        <SvgXml xml={isPremiumUser ? ImagePath.SvgIcons.UserPremiumIcon : ImagePath.SvgIcons.UserIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress}>
                        <IconMenu size={24} color={myColors.text.white} />
                    </TouchableOpacity>
                </View>
            </View >
        );
    };

    return (
        <View>
            {/* Menu Popup */}
            <PopupMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                popupPosition={"right"}
                onReferFriendsPress={() => {
                    setMenuVisible(false);
                    handleAuthRequiredNavigation('/(main)/ReferFriends');
                }}
            />

            {/* Profile Menu Popup */}
            <ProfilePopupMenu
                visible={profileMenuVisible}
                onClose={() => setProfileMenuVisible(false)}
            />

            {/* Login Popup */}
            <LoginPopup
                visible={showLoginPopup}
                onClose={() => setShowLoginPopup(false)}
                onLoginSuccess={handleLoginSuccess}
            />

            <View
                style={[styles.header]}>
                <StatusBar barStyle="light-content" backgroundColor={myColors.primary.main} translucent />

                <AppHeaderComponent />

                {/* Blue background search bar */}
                <View style={styles.searchButtonWrapper}>
                    <BlueSearchButton theme='light' />
                </View>
            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: myColors.primary.main,
        paddingVertical: Platform.select({
            web: 20,
            default: 10
        }),
        paddingHorizontal: Platform.OS === "android" ? 15 : 0,
        paddingTop: Platform.select({
            web: 10,
            default: Platform.OS === 'ios' ? 50 : 40
        }),
        paddingBottom: 15,
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
        marginVertical: Platform.OS === "ios" ? 10 : 15,
        paddingHorizontal: Platform.select({
            web: 20,
            default: Platform.OS === "ios" ? 15 : 0
        }),
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
    searchButtonWrapper: {
        width: '100%',
        paddingHorizontal: 15,
        alignItems: 'stretch',
    },
});

export default HeaderWithSearch;
