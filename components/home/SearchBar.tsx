import React, { } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { SvgXml } from 'react-native-svg';
import { HomeScreenAppLogo } from '@/assets/images/SvgIcons';
import { ImagePath } from '@/assets/images';
import { useAuth } from '@/Services/api/context/auth.context';
import WhiteSearchButton from '../common/WhiteSearchButton';
import { Strong } from '@/components/common/SemanticText';
import { IconMenu } from '@/assets/icons';

interface SearchBarProps {
    onMenuPress: () => void;
    onProfilePress: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onMenuPress, onProfilePress }) => {
    // Get user from auth context (keep this for display purposes only)
    const { isPremiumUser } = useAuth();

    return (
        <View
            style={[styles.container]}>
            {/* Top navigation buttons */}
            <View style={styles.navButtonsContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
                    {/* <MaterialCommunityIcons name="menu" size={24} color="white" />
                     */}
                    <IconMenu size={24} color={myColors.text.white} />
                </TouchableOpacity>

                {/* Invisible middle spacer */}
                <View style={styles.middleSpacer} />

                <TouchableOpacity style={styles.iconButton} onPress={onProfilePress}>
                    <SvgXml xml={isPremiumUser ? ImagePath.SvgIcons.UserPremiumIcon : ImagePath.SvgIcons.UserIcon} />
                </TouchableOpacity>
            </View>

            {/* Logo section */}
            <View style={[styles.logoContainer]}>
                <View style={styles.logoWrapper}>
                    <SvgXml xml={HomeScreenAppLogo} />
                </View>
                {/* Info text */}
                <MyText
                    numberOfLines={2}
                    adjustsFontSizeToFit={true}
                    fontFamily="Poppins"
                    style={[styles.infoText, { fontWeight: '700' }]}>
                    Bilregistret Sverige AB {"\n"}Sök biluppgifter i bilregistret via registreringsnummer
                </MyText>

                {/* Blue background search bar */}
                <View style={styles.searchButtonWrapper}>
                    <WhiteSearchButton />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: Platform.select({
            web: 0,
            default: 40
        }),
        paddingBottom: 10,
        elevation: 8,
        backgroundColor: myColors.primary.main,
    },
    navButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginVertical: Platform.OS === "ios" ? 10 : 15,
        paddingHorizontal: 15,
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: myColors.primary.main,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleSpacer: {
        width: 30,
    },
    logoContainer: {
        width: '100%',
        marginBottom: 10,
        alignItems: 'center',
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -5,
    },
    infoText: {
        color: myColors.text.white,
        fontWeight: '700',
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: 25,
        paddingTop: 15,
        paddingBottom: 15
    },
    searchButtonWrapper: {
        width: '100%',
        paddingHorizontal: 15,
        alignItems: 'stretch',
    },
});

export default SearchBar;