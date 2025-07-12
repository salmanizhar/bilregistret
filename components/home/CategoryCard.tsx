import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { SvgXml } from 'react-native-svg';
import { MYSCREEN } from '@/constants/Dimentions';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { desktopWebViewport } from '@/constants/commonConst';
import { H3 } from '@/components/common/SemanticText';

interface CategoryCardProps {
    title: string;
    icon: string | ImageSourcePropType;
    iconType?: 'svg' | 'png' | 'webp';
    onPress: () => void;
    desktopWidth?: number; // Optional prop to override desktop width
    altText?: string; // SEO-optimized alt text
    ariaLabel?: string; // Accessibility label
}

const CategoryCard = React.memo(({ title, icon, iconType = 'svg', onPress, desktopWidth, altText, ariaLabel }: CategoryCardProps) => {
    // Calculate card width - prioritize desktopWidth prop for consistent sizing
    let cardWidth;
    
    if (desktopWidth) {
        // If desktopWidth is provided, use it on both desktop and mobile
        cardWidth = desktopWidth;
    } else if (isDesktopWeb()) {
        // On desktop, use desktop calculation
        cardWidth = (desktopWebViewport - 45) / 2;
    } else {
        // On mobile, use the mobile screen width calculation
        cardWidth = (MYSCREEN.WIDTH - 45) / 2;
    }

    return (
        <TouchableOpacity 
            onPress={onPress} 
            style={[
                styles.touchable, 
                { width: cardWidth },
                isDesktopWeb() && { cursor: 'pointer' }
            ]}
            accessibilityRole="button"
            accessibilityLabel={ariaLabel || `Navigera till ${title}`}
            accessibilityHint={`Tryck för att komma åt ${title.toLowerCase()} tjänster`}
            // @ts-ignore - Web-specific attributes
            role="button"
            aria-label={ariaLabel || `Navigera till ${title}`}
            // @ts-ignore - Web-specific hover styles
            onMouseEnter={isDesktopWeb() ? (e: any) => {
                e.currentTarget.style.transition = 'transform 0.2s ease-in-out';
                e.currentTarget.style.transform = 'translateY(-2px)';
                const card = e.currentTarget.querySelector('div');
                if (card) {
                    card.style.transition = 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out';
                    card.style.backgroundColor = '#f8f9fa';
                    card.style.boxShadow = '0 8px 30px rgba(168, 187, 214, 0.15)';
                }
            } : undefined}
            // @ts-ignore - Web-specific hover styles
            onMouseLeave={isDesktopWeb() ? (e: any) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                const card = e.currentTarget.querySelector('div');
                if (card) {
                    card.style.backgroundColor = myColors.white;
                    card.style.boxShadow = '0 4px 25px rgba(168, 187, 214, 0.08)';
                }
            } : undefined}
        >
            <View 
                style={styles.card}
                // @ts-ignore - Web-specific semantic attributes
                itemScope
                itemType="https://schema.org/Action"
            >
                <View style={styles.iconContainer}>
                    {iconType === 'svg' ? (
                        <SvgXml 
                            xml={icon as string} 
                            width={150} 
                            height={110}
                            // @ts-ignore - Web-specific attributes
                            role="img"
                            aria-label={altText || `${title} ikon`}
                        />
                    ) : (
                        <Image
                            source={icon as ImageSourcePropType}
                            style={
                                title === 'Biluppgifter' ? styles.imageIconLarge :
                                title === 'Bilmärken' ? styles.imageIconSmall : 
                                styles.imageIcon
                            }
                            contentFit="contain"
                            contentPosition="center"
                            cachePolicy="none"
                            priority="high"
                            alt={altText || `${title} - Bilregistret tjänst ikon`}
                            // @ts-ignore - Web-specific attributes
                            role="img"
                            aria-label={altText || `${title} tjänst ikon`}
                        />
                    )}
                </View>
                <H3 
                    numberOfLines={2} 
                    style={{
                        ...styles.title,
                        fontWeight: isDesktopWeb() ? "600" : '600'
                    }}
                    itemProp="name"
                >
                    {title}
                </H3>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    touchable: {
        height: isDesktopWeb() ? 200 : 185,
    },
    card: {
        shadowColor: "rgba(168, 187, 214, 0.08)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 25,
        elevation: 25,
        shadowOpacity: 1,
        borderRadius: 15,
        backgroundColor: myColors.white,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        paddingTop: 10,
    },
    imageIcon: {
        width: 190,
        height: 110,
    },
    imageIconSmall: {
        width: 150,
        height: 100,
    },
    imageIconLarge: {
        width: 240,
        height: 140,
    },
    title: {
        fontSize: isDesktopWeb() ? 18 : 14,
        color: myColors.black,
        textAlign: 'center',
        marginTop: isDesktopWeb() ? 10 : 15,
        lineHeight: 20,
        paddingBottom: 4,
    }
});

export default CategoryCard;