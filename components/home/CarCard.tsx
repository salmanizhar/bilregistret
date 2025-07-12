import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MyText from '@/components/common/MyText';
import { ImagePath } from '@/assets/images';
import { myColors } from '@/constants/MyColors';

interface CarCardProps {
    brand: string;
    image: any;
    count?: string;
    onPress: () => void;
}

// Card should take the full width provided by the parent (e.g., carousel item)
const CarCard = React.memo(({ brand, image, count, onPress }: CarCardProps) => {
    const handlePress = useCallback(() => {
        onPress();
    }, [onPress]);

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
            <View style={styles.headerRow}>
                <MyText
                    fontFamily='Poppins'
                    numberOfLines={1}
                    style={styles.brandText}
                >{brand}</MyText>
                {count && (
                    <View style={styles.countContainer}>
                        <MyText style={styles.countText}>{count}</MyText>
                    </View>
                )}
            </View>
            <View style={styles.imageContainer}>
                <Image
                    source={image ? { uri: image } : ImagePath.emptyImage}
                    style={styles.carImage}
                    resizeMode="cover"
                />
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 16,
        marginBottom: 16,
        // overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    carImage: {
        width: '100%',
        height: 173,
        borderRadius: 12,
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
    },
    contentOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    brandText: {
        fontSize: 20,
        color: myColors.text.primary,
        width: "70%"
    },
    countContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    countText: {
        fontSize: 13,
        color: myColors.baseColors.light2,
        fontWeight: '600',
    },
});

export default CarCard;