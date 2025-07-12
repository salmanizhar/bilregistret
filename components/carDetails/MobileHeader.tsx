import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar as RNStatusBar,
    ViewStyle,
    ImageStyle,
    TextStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { ImagePath } from '@/assets/images';
import { isUrl } from '@/constants/commonFunctions';
import BlueSearchButton from '@/components/common/BlueSearchButton';
import { IconMenu, IconHeart, IconHeartOutline } from '@/assets/icons';

interface MobileHeaderProps {
    carImageUrl: string | null;
    imageError: boolean;
    regNumber: string;
    displayTitle: string;
    displayYear: string;
    isFavorite: boolean;
    isGuestMode: boolean;
    isPremiumUser: boolean;
    onImageError: () => void;
    onFavoritePress: () => void;
    onMenuPress: () => void;
    onProfilePress: () => void;
}

// Header height values for animation
const HEADER_MAX_HEIGHT = 330//420;

const MobileHeader: React.FC<MobileHeaderProps> = ({
    carImageUrl,
    imageError,
    regNumber,
    displayTitle,
    displayYear,
    isFavorite,
    isGuestMode,
    isPremiumUser,
    onImageError,
    onFavoritePress,
    onMenuPress,
    onProfilePress,
}) => {
    const router = useRouter();
    const [isImageLoading, setIsImageLoading] = useState(false);

    const handleImageError = useCallback(() => {
        onImageError();
    }, [onImageError]);

    const AppHeaderComponent = () => {
        return (
            <View style={styles.navButtonsContainer}>
                <TouchableOpacity onPress={() => router.replace('/')}>
                    <SvgXml xml={ImagePath.SvgIcons.CarDetailsHeaderAppIcon} />
                </TouchableOpacity>
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity style={styles.iconButton} onPress={onProfilePress}>
                        <SvgXml xml={isPremiumUser ? ImagePath.SvgIcons.UserPremiumIcon : ImagePath.SvgIcons.UserIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
                        {/* <MaterialCommunityIcons name="menu" size={24} color="white" /> */}
                        <IconMenu size={24} color='white' />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <>
            {/* Header image component */}
            <View
                style={[
                    styles.header,
                    {
                        height: HEADER_MAX_HEIGHT
                    }]}>

                <View style={[styles.imageContainer]}>
                    {isUrl(carImageUrl) && (
                        <Image
                            source={isUrl(carImageUrl) ? { uri: carImageUrl } : ImagePath.BMWImage}
                            style={[styles.carImage]}
                            cachePolicy="disk"
                            contentFit="cover"
                            priority="high"
                            onError={handleImageError}
                            transition={100}
                            onLoadStart={() => setIsImageLoading(true)}
                            onLoadEnd={() => setIsImageLoading(false)}
                        />
                    )}

                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        height: 200,
                    }}>
                        <LinearGradient
                            colors={[myColors.transparent, 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                            }}
                        >
                            <View style={styles.carInfoNameWrapper}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <MyText style={styles.headerTitle} numberOfLines={3}>
                                        {regNumber ? regNumber.toUpperCase() : ''} - {displayTitle}{displayYear ? `, ${displayYear}` : ''}
                                    </MyText>
                                </View>
                                {!isGuestMode &&
                                    <TouchableOpacity
                                        style={styles.favoriteButton}
                                        onPress={onFavoritePress}
                                    >
                                        {isFavorite ? (
                                            <IconHeart
                                                color={myColors.primary.main}
                                                size={24}
                                            />
                                        ) : (
                                            <IconHeartOutline
                                                color={myColors.white}
                                                size={24}
                                            />
                                        )}
                                    </TouchableOpacity>
                                }
                            </View>
                        </LinearGradient>
                    </View>
                </View>

                <View style={[styles.searchBarWrapper]}>
                    <BlueSearchButton theme="light" />
                </View>
            </View>

            <View style={[styles.navigationBar]}>
                <AppHeaderComponent />
            </View>
        </>
    );
};

type MobileHeaderStyles = {
    header: ViewStyle;
    navigationBar: ViewStyle;
    imageContainer: ViewStyle;
    carImage: ImageStyle;
    carInfoNameWrapper: ViewStyle;
    headerTitle: TextStyle;
    favoriteButton: ViewStyle;
    searchBarWrapper: ViewStyle;
    navButtonsContainer: ViewStyle;
    iconButton: ViewStyle;
};

const styles = StyleSheet.create<MobileHeaderStyles>({
    header: {
        position: 'relative',
        width: '100%',
        height: HEADER_MAX_HEIGHT,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    navigationBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? 44 + 10 : (RNStatusBar.currentHeight || 0),
        zIndex: 2000,
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        overflow: "hidden",
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: myColors.screenBackgroundColor,
    },
    carImage: {
        width: '100%',
        height: '100%',
    },
    carInfoNameWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 110,
        left: 16,
        right: 16,
        zIndex: 15,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22,
        color: myColors.white,
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBarWrapper: {
        position: 'absolute',
        left: 15,
        right: 15,
        bottom: 28,
        zIndex: 10,
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
        borderRadius: 20,
        marginLeft: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MobileHeader;