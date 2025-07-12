
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import PopupMenu from '../menu/PopupMenu';
import ProfilePopupMenu from '../menu/ProfilePopupMenu';
import SearchHistory from '../home/SearchHistory';
import { router } from 'expo-router';
import { IconMenu } from '@/assets/icons';

interface ProfileHeaderProps {
    title: string;
}

// Temporary mock data for search history
const MOCK_HISTORY = [
    { id: '1', regNumber: 'ABC 123', carModel: 'MERCEDES-BENZ VITO 116 CDI', brandLogo: 'truck' },
    { id: '2', regNumber: 'ABC 123', carModel: 'TESLA DYNAMIX 400E AWD', brandLogo: 'truck' },
    { id: '3', regNumber: 'ABC 123', carModel: 'HONDA VELOX 220i HYBRID', brandLogo: 'truck' },
    { id: '4', regNumber: 'ABC 123', carModel: 'ROLLS-ROYCE IMPERIAL 750 V12', brandLogo: 'truck' },
];

const MOCK_FAVORITES = [
    { id: '5', regNumber: 'ABC 123', carModel: 'CITROËN AXION 220 HDI', brandLogo: 'truck' },
];

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ title }) => {

    const [menuVisible, setMenuVisible] = useState(false);
    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const [showSearchHistory, setShowSearchHistory] = useState(false);

    const handleMenuPress = () => {
        setMenuVisible(true);
    };

    const handleProfilePress = () => {
        setProfileMenuVisible(true);
    };

    const handleBlueSearchFocus = () => {
        setShowSearchHistory(true);
    }

    const handleBlueSearchBlur = () => {
        setShowSearchHistory(false);
    }

    const handleHistoryItemPress = (item: any) => {
        // // console.log("handleHistoryItemPress", item);
        handleCarPress(item)
    }

    const handleCloseSearchHistory = () => {
        setShowSearchHistory(false);
        Keyboard.dismiss();
    }

    const handleCarPress = (car: any) => {
        router.push({
            pathname: '/(main)/CarDetails',
            params: {
                id: car.id,
                brand: car.brand,
                image: car.image
            }
        });
    };


    const onCameraPress = () => {
        // // console.log('Camera pressed');
    };

    const AppHeaderComponent = () => {
        return (
            <View style={styles.navButtonsContainer} >
                <MyText fontFamily="Poppins" style={styles.headerTitle}>{title}</MyText>
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress}>
                        <IconMenu size={24} color={myColors.black} />
                    </TouchableOpacity>

                </View>
            </View >
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingContainer}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -100}
            >
                {/* Menu Popup */}
                <PopupMenu
                    visible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    popupPosition={"right"}
                // onLogout={handleLogout}
                />
                {/* Profile Menu Popup */}
                <ProfilePopupMenu
                    visible={profileMenuVisible}
                    onClose={() => setProfileMenuVisible(false)}
                // onLogout={handleLogout}
                />

                <View style={styles.header}>
                    <StatusBar barStyle="dark-content" backgroundColor={myColors.primary.main} translucent />

                    <AppHeaderComponent />

                </View>
                {/* Search History Overlay */}
                {showSearchHistory && (
                    <SearchHistory
                        visible={showSearchHistory}
                        historyItems={MOCK_HISTORY}
                        favoriteItems={MOCK_FAVORITES}
                        onItemPress={handleHistoryItemPress}
                        onClose={handleCloseSearchHistory}

                    />
                )}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        // position: 'absolute',
        // left: 0,
        // right: 0,
        // bottom: 0,
        // top: HEADER_MAX_HEIGHT - 50, // Position it just below the header
        // height: "100%",
        zIndex: 800,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Platform.OS === "ios" ? 0 : 15,
        paddingVertical: 10,
    },

    backButton: {
        height: 46,
        width: 46,
        borderRadius: 30,
        marginRight: 15,
        backgroundColor: myColors.white,
        alignItems: "center",
        justifyContent: "center",
        // ...myStyles.shadow
    },
    title: {
        fontSize: 24,
        // fontWeight: '600',
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
        backgroundColor: myColors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blueSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#6CA2EF",
        justifyContent: "space-between",
        borderRadius: 50,
        height: 62,
        paddingRight: 10,
        paddingLeft: 15,
        marginTop: 10,
        marginHorizontal: Platform.OS === 'ios' ? 15 : 0,
    },
    searchIcon: {
        marginRight: 10,
    },
    blueSearchText: {
        color: 'white',
        fontSize: 16,
        fontWeight: "bold",
        width: "75%"
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
    searchInputWithIconWrapper: { flexDirection: "row", alignItems: "center" },
    headerTitle: {
        fontSize: 24,
        color: myColors.text.primary,
    },

});

export default ProfileHeader;