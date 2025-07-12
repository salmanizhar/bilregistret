import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, Platform, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import CategoryCard from './CategoryCard';
import { H3, P, Strong, SemanticSection, SemanticNav } from '@/components/common/SemanticText';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { APP_STORE_URL, GOOGLE_PLAY_URL, desktopWebViewport } from '@/constants/commonConst';
import { MYSCREEN } from '@/constants/Dimentions';
import MyText from '@/components/common/MyText';
import { IconApple, IconGooglePlay } from '@/assets/icons';
import { myColors } from '@/constants/MyColors';

// Define the category item type
interface Category {
    id: string;
    title: string;
    icon: string;
    iconType?: 'svg' | 'png' | 'webp';
    altText?: string;
    ariaLabel?: string;
}

interface CategoryListProps {
    categories: Category[];
    onCategoryPress: (category: Category) => void;
}

const ITEM_SPACING = 15; // Reduced spacing for better fit

const CategoryList = React.memo(({ categories, onCategoryPress }: CategoryListProps) => {

    const renderItem = useCallback(({ item, index }: { item: Category, index: number }) => (
        <CategoryCard
            key={index}
            title={item.title}
            icon={item.icon}
            iconType={item.iconType}
            onPress={() => onCategoryPress(item)}
            altText={item.altText}
            ariaLabel={item.ariaLabel}
        />
    ), [onCategoryPress]);

    // Calculate exact dimensions for desktop layout - using original card width
    const originalItemsPerSlide = 4; // Original layout had 4 cards
    const originalTotalSpacing = ITEM_SPACING * (originalItemsPerSlide - 1); // 15 * 3 = 45px

    // Use the original card width: (1280 - 45) / 4 = 308.75px per card
    const itemWidth = isDesktopWeb()
        ? (desktopWebViewport - originalTotalSpacing) / originalItemsPerSlide
        : 0;

    // Same width for all cards for consistency
    const bottomRowItemWidth = itemWidth;

    // Calculate full width for mobile first row
    const mobileFullWidth = (MYSCREEN.WIDTH - 30); // Full width minus padding

    // Mobile layout - 1 full width card, then 2 rows of 2
    const mobileContent = (
        <SemanticNav
            style={styles.mobileContainer}
            role="navigation"
            ariaLabelledBy="services-navigation"
            accessibilityLabel="Bilregister tjänster navigation"
            itemScope
            itemType="https://schema.org/SiteNavigationElement"
        >

            {/* First row - Biluppgifter spanning full width */}
            {/* <View style={styles.fullWidthCardContainer}>
                <CategoryCard
                    title={categories[0].title}
                    icon={categories[0].icon}
                    iconType={categories[0].iconType}
                    onPress={() => onCategoryPress(categories[0])}
                    desktopWidth={mobileFullWidth}
                    altText={categories[0].altText}
                    ariaLabel={categories[0].ariaLabel}
                />
            </View> */}
            <View style={styles.listViewContent}>
                <View style={styles.mobileCardContainer}>
                    <CategoryCard
                        title={categories[0].title}
                        icon={categories[0].icon}
                        iconType={categories[0].iconType}
                        onPress={() => onCategoryPress(categories[0])}
                        // desktopWidth={mobileFullWidth}
                        altText={categories[0].altText}
                        ariaLabel={categories[0].ariaLabel}
                    />
                </View>
                <View style={styles.mobileCardContainer}>
                    <CategoryCard
                        title={categories[1].title}
                        icon={categories[1].icon}
                        iconType={categories[1].iconType}
                        onPress={() => onCategoryPress(categories[1])}
                        altText={categories[1].altText}
                        ariaLabel={categories[1].ariaLabel}
                    />
                </View>
            </View>

            {/* Second row - 2 cards */}
            <View style={styles.listViewContent}>
                <View style={styles.mobileCardContainer}>
                    <CategoryCard
                        title={categories[3].title}
                        icon={categories[3].icon}
                        iconType={categories[3].iconType}
                        onPress={() => onCategoryPress(categories[3])}
                        altText={categories[3].altText}
                        ariaLabel={categories[3].ariaLabel}
                    />
                </View>
                <View style={styles.mobileCardContainer}>
                    <CategoryCard
                        title={categories[2].title}
                        icon={categories[2].icon}
                        iconType={categories[2].iconType}
                        onPress={() => onCategoryPress(categories[2])}
                        altText={categories[2].altText}
                        ariaLabel={categories[2].ariaLabel}
                    />
                </View>
            </View>

            {/* Third row - 2 cards */}
            <View style={styles.listViewContent}>
                <View style={styles.mobileCardContainer}>
                    <CategoryCard
                        title={categories[4].title}
                        icon={categories[4].icon}
                        iconType={categories[4].iconType}
                        onPress={() => onCategoryPress(categories[4])}
                        altText={categories[4].altText}
                        ariaLabel={categories[4].ariaLabel}
                    />
                </View>
                {/* Web only apps advertisement */}
                <View style={styles.mobileCardContainer}>
                    {Platform.OS === 'web' && (
                        <View style={styles.appStoreContainer}>


                            {/* App Store Button */}
                            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                <TouchableOpacity
                                    style={styles.appStoreButton}
                                    accessibilityLabel="Ladda ner från App Store"
                                    accessibilityRole="button"
                                >
                                    <View style={styles.appStoreButtonContent}>
                                        <View style={styles.appleIconContainer}>
                                            <IconApple size={20} color="white" />
                                        </View>
                                        <View style={styles.appStoreTextContainer}>
                                            <MyText style={styles.appStoreSmallText}>Download on the</MyText>
                                            <MyText style={styles.appStoreLargeText}>App Store</MyText>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </a>

                            {/* Google Play Button */}
                            <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                <TouchableOpacity
                                    style={styles.googlePlayButton}
                                    accessibilityLabel="Hämta på Google Play"
                                    accessibilityRole="button"
                                >
                                    <View style={styles.appStoreButtonContent}>
                                        <View style={styles.playIconContainer}>
                                            <IconGooglePlay size={20} color="white" />
                                        </View>
                                        <View style={styles.appStoreTextContainer}>
                                            <MyText style={styles.appStoreSmallText}>GET IT ON</MyText>
                                            <MyText style={styles.appStoreLargeText}>Google Play</MyText>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </a>
                            {/* <MyText style={styles.appStoreTitle}>Ladda ner appen</MyText> */}
                            <H3
                                numberOfLines={2}
                                style={{
                                    ...styles.appStoreTitle,
                                    fontWeight: isDesktopWeb() ? "600" : '600'
                                }}
                                itemProp="name"
                            >
                                Ladda ner appen
                            </H3>
                        </View>
                    )}
                </View>
            </View>
        </SemanticNav>
    );

    // Desktop layout - 3 cards on top, 2 cards on bottom
    const desktopContent = (
        <SemanticSection
            style={styles.desktopCarouselContainer}
            role="region"
            ariaLabelledBy="desktop-services"
            accessibilityLabel="Bilregister tjänster"
            itemScope
            itemType="https://schema.org/ItemList"
        >

            {/* Top row - 3 cards */}
            <View style={styles.desktopRowContent}>
                {categories.slice(0, 3).map((category, index) => (
                    <View
                        key={index}
                        style={[
                            styles.desktopCardContainer,
                            {
                                width: itemWidth,
                                marginRight: index < 2 ? ITEM_SPACING : 0,
                            }
                        ]}
                    >
                        <CategoryCard
                            title={category.title}
                            icon={category.icon}
                            iconType={category.iconType}
                            onPress={() => onCategoryPress(category)}
                            desktopWidth={itemWidth}
                            altText={category.altText}
                            ariaLabel={category.ariaLabel}
                        />
                    </View>
                ))}
            </View>

            {/* Bottom row - 2 cards centered */}
            <View style={[styles.desktopRowContent, styles.bottomRowContent]}>
                {categories.slice(3, 5).map((category, index) => (
                    <View
                        key={index + 3}
                        style={[
                            styles.desktopCardContainer,
                            {
                                width: bottomRowItemWidth,
                                marginRight: index < 1 ? ITEM_SPACING : 0,
                            }
                        ]}
                    >
                        <CategoryCard
                            title={category.title}
                            icon={category.icon}
                            iconType={category.iconType}
                            onPress={() => onCategoryPress(category)}
                            desktopWidth={bottomRowItemWidth}
                            altText={category.altText}
                            ariaLabel={category.ariaLabel}
                        />
                    </View>
                ))}
            </View>
        </SemanticSection>
    );

    return (
        <SemanticSection
            style={styles.container}
            role="region"
            ariaLabelledBy="category-list-section"
            accessibilityLabel="Bilregister kategorier och tjänster"
            itemScope
            itemType="https://schema.org/ItemList"
        >
            {isDesktopWeb() ? (
                <View style={styles.desktopContainer}>
                    {desktopContent}
                </View>
            ) : (
                mobileContent
            )}
        </SemanticSection>
    );
});

const styles = StyleSheet.create({
    container: {
        marginTop: isDesktopWeb() ? 30 : 15,
        marginBottom: isDesktopWeb() ? 80 : 0,
        alignItems: 'center',
        width: '100%',
    },
    desktopContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mobileContainer: {
        width: '100%',
        alignItems: 'center',
    },
    desktopCarouselContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: desktopWebViewport,
    },
    desktopRowContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    desktopCardContainer: {
        alignSelf: 'center',
    },
    listContent: {
        paddingHorizontal: 40,
    },
    listViewContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 15,
        marginBottom: 15,
        gap: 15,
    },
    mobileCardContainer: {
        flex: 1,
        alignItems: 'center',
    },
    separator: {
        width: 12,
    },
    bottomRowContent: {
        justifyContent: 'center',
        marginTop: 0,
    },
    fullWidthCardContainer: {
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    hiddenHeading: {
        position: 'absolute',
        left: -9999,
        top: -9999,
        width: 1,
        height: 1,
        overflow: 'hidden',
    },
    hiddenDescription: {
        position: 'absolute',
        left: -9999,
        top: -9999,
        width: 1,
        height: 1,
        overflow: 'hidden',
    },
    // App Store Styles
    appStoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
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
        // alignItems: 'center',
        // justifyContent: 'space-between',
        width: '100%',
        height: '100%',
    },
    appStoreTitle: {
        fontSize: isDesktopWeb() ? 18 : 14,
        color: myColors.black,
        textAlign: 'center',
        marginTop: isDesktopWeb() ? 10 : 15,
        lineHeight: 20,
        paddingBottom: 4,
    },
    appStoreButton: {
        backgroundColor: '#000',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 8,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    googlePlayButton: {
        backgroundColor: '#000',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    appStoreButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    appleIconContainer: {
        marginRight: 8,
    },
    appleIcon: {
        fontSize: 20,
        color: '#fff',
    },
    playIconContainer: {
        marginRight: 8,
    },
    playIcon: {
        fontSize: 16,
        color: '#fff',
        transform: [{ rotate: '0deg' }],
    },
    appStoreTextContainer: {
        alignItems: 'flex-start',
    },
    appStoreSmallText: {
        color: '#fff',
        fontSize: 10,
        lineHeight: 12,
        fontWeight: '400',
    },
    appStoreLargeText: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 16,
        fontWeight: '600',
    },
});

export default CategoryList;