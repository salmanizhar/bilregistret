import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    ImageStyle,
    TextStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { isUrl } from '@/constants/commonFunctions';
import { createBoxShadow, createTextShadow } from '@/utils/shadowHelper';
import { IconCar } from '@/assets/icons';

interface DesktopHeaderProps {
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
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({
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
}) => {
    const router = useRouter();
    const [isImageLoading, setIsImageLoading] = useState(false);

    const handleImageError = useCallback(() => {
        onImageError();
    }, [onImageError]);

    return (
        <View style={styles.container}>
            {/* Main Header Content */}
            <View style={styles.headerContent}>
                {/* Car Image Section */}
                <View style={styles.imageSection}>
                    {isUrl(carImageUrl) ? (
                        <Image
                            source={{ uri: carImageUrl }}
                            style={styles.carImage}
                            cachePolicy="disk"
                            contentFit="cover"
                            priority="high"
                            onError={handleImageError}
                            transition={200}
                            onLoadStart={() => setIsImageLoading(true)}
                            onLoadEnd={() => setIsImageLoading(false)}
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            {/* <Ionicons name="car" size={80} color={myColors.border.light} /> */}
                            <IconCar
                                color={myColors.border.light}
                                size={80}
                            />
                        </View>
                    )}

                    {/* Subtle Gradient Overlay */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.15)']}
                        style={styles.imageOverlay}
                    />

                    {/* Car Info Overlay */}
                    <View style={styles.carInfoOverlay}>
                        <View style={styles.titleSection}>
                            <MyText style={styles.regNumber}>
                                {regNumber.toUpperCase()}
                            </MyText>
                            <MyText style={styles.carTitle} numberOfLines={2}>
                                {displayTitle}
                                {displayYear && (
                                    <MyText style={styles.carYear}> • {displayYear}</MyText>
                                )}
                            </MyText>
                        </View>

                        {!isGuestMode && (
                            <TouchableOpacity
                                style={styles.favoriteButton}
                                onPress={onFavoritePress}
                                activeOpacity={0.8}
                            >
                                <View style={styles.favoriteButtonInner}>
                                    <MyText style={styles.favoriteButtonText}>
                                        mina fordon
                                    </MyText>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

type DesktopHeaderStyles = {
    container: ViewStyle;
    headerContent: ViewStyle;
    imageSection: ViewStyle;
    carImage: ImageStyle;
    imagePlaceholder: ViewStyle;
    imageOverlay: ViewStyle;
    carInfoOverlay: ViewStyle;
    titleSection: ViewStyle;
    regNumber: TextStyle;
    carTitle: TextStyle;
    carYear: TextStyle;
    favoriteButton: ViewStyle;
    favoriteButtonInner: ViewStyle;
    favoriteButtonText: TextStyle;
};

const styles = StyleSheet.create<DesktopHeaderStyles>({
    container: {
        width: '100%',
        backgroundColor: myColors.screenBackgroundColor,
    },
    headerContent: {
        paddingHorizontal: 10,
        gap: 20,
        marginTop: 30,
    },
    imageSection: {
        position: 'relative',
        width: '100%',
        height: 320,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: myColors.white,
        ...createBoxShadow({
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
        }),
        elevation: 8,
    },
    carImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: myColors.screenBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    carInfoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingLeft: 24,
        paddingTop: 24,
        paddingRight: 16,
        paddingBottom: 16,
    },
    titleSection: {
        flex: 1,
        marginRight: 16,
    },
    regNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: myColors.white,
        marginBottom: 4,
        letterSpacing: 1.2,
        ...createTextShadow({
            textShadowColor: 'rgba(172, 159, 159, 0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
        }),
    },
    carTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: myColors.white,
        lineHeight: 28,
        ...createTextShadow({
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
        }),
    },
    carYear: {
        fontSize: 22,
        fontWeight: '700',
        color: myColors.white,
    },
    favoriteButton: {
        padding: 4,
    },
    favoriteButtonInner: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        ...createBoxShadow({
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
        }),
        elevation: 4,
    },
    favoriteButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: myColors.white,
    },
});

export default DesktopHeader;