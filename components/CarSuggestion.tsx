import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import MyText from './common/MyText';
import { H2 } from './common/SemanticText';
import { myColors } from '@/constants/MyColors';
import ReadMoreText from './ReadMoreText';
import { spacesToHyphens } from '@/constants/commonFunctions';
import { isDesktopWeb } from '@/utils/deviceInfo';


interface CarItem {
    id: string;
    image: string;
    title: string;
    description: string;
    link?: string;
}

interface CarSuggestionProps {
    title: string;
    cars: any[];//CarItem[];
    bottomSections?: {
        title: string;
        description: string;
        link?: string;
    }[];
    scrollEnabled?: boolean;
}

const CarSuggestion = ({ title, cars, bottomSections = [], scrollEnabled = false }: CarSuggestionProps) => {
    const router = useRouter();

    // Calculate number of columns and card width based on device type
    const numColumns = isDesktopWeb() ? 3 : 2;
    const cardWidth = isDesktopWeb() ? '32%' : '48%';

    const handleReadMore = (slug?: string) => {
        router.push({
            pathname: '/(main)/fordon/[carBrandDetailsSlug]',
            params: {
                carBrandDetailsSlug: slug?.toLowerCase(),
            } as any
        });
    };

    // const renderCarItem = ({ item, index }: { item: CarItem; index: number }) => (
    const RenderCarItem = ({ item, index }: { item: any; index: number }) => (
        <TouchableOpacity
            style={[
                styles.carItemContainer,
                isDesktopWeb() ? styles.carItemContainerDesktop : styles.carItemContainerMobile,
                { width: cardWidth }
            ]}
            onPress={() => handleReadMore(item.slug)}
            activeOpacity={0.8}
        >
            <View style={[styles.carImageContainer, isDesktopWeb() ? styles.carImageContainerDesktop : null]}>
                <Image
                    source={{ uri: item.image_url }}
                    style={[styles.carImage, isDesktopWeb() ? styles.carImageDesktop : null]}
                    resizeMode="cover"
                />
                {isDesktopWeb() && (
                    <View style={styles.imageOverlay}>
                        <View style={styles.viewDetailsButton}>
                            <MyText fontFamily="Poppins" style={styles.viewDetailsText}>
                                Visa detaljer
                            </MyText>
                        </View>
                    </View>
                )}
            </View>
            <View style={[styles.carInfoContainer, isDesktopWeb() ? styles.carInfoContainerDesktop : null]}>
                <H2
                    id={`car-title-${item.id}`}
                    style={StyleSheet.flatten([
                        styles.carTitle,
                        isDesktopWeb() ? styles.carTitleDesktop : {}
                    ])}
                >
                    {item.title}
                </H2>
                <ReadMoreText
                    text={item.description}
                    maxLength={isDesktopWeb() ? 80 : 40}
                    readMoreStyle={styles.readMoreText}
                    textStyle={[styles.carDescription, isDesktopWeb() ? styles.carDescriptionDesktop : null]}
                />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, isDesktopWeb() ? styles.containerDesktop : null]} onStartShouldSetResponder={() => true}>
            {/* Title */}
            <H2
                id="car-suggestions-title"
                style={StyleSheet.flatten([
                    styles.sectionTitle,
                    isDesktopWeb() ? styles.sectionTitleDesktop : {}
                ])}
            >
                {title}
            </H2>

            {/* Car Grid */}
            <FlatList
                data={cars}
                renderItem={RenderCarItem}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                columnWrapperStyle={numColumns > 1 ? (isDesktopWeb() ? styles.carGridRowDesktop : styles.carGridRow) : undefined}
                scrollEnabled={scrollEnabled}
                contentContainerStyle={isDesktopWeb() ? styles.flatListContainerDesktop : null}
            />

            {/* Bottom Sections */}
            {bottomSections.map((section, index) => (
                <View key={index} style={[styles.bottomSection, isDesktopWeb() ? styles.bottomSectionDesktop : null]}>
                    <H2
                        id={`bottom-section-${index}`}
                        style={StyleSheet.flatten([
                            styles.bottomSectionTitle,
                            isDesktopWeb() ? styles.bottomSectionTitleDesktop : {}
                        ])}
                    >
                        {section.title}
                    </H2>
                    <View style={styles.bottomSectionContent}>
                        <ReadMoreText
                            text={section.description}
                            maxLength={isDesktopWeb() ? 200 : 100}
                            readMoreStyle={styles.readMoreText}
                            textStyle={[styles.bottomSectionContentText, isDesktopWeb() ? styles.bottomSectionContentTextDesktop : null]}
                        />
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    containerDesktop: {
        padding: 32,
        // backgroundColor: '#fafbfc',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        marginBottom: 100,
    },
    sectionTitle: {
        fontSize: 20,
        color: myColors.text.primary,
        marginBottom: 16,
    },
    sectionTitleDesktop: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
        color: '#1e293b',
        marginBottom: 32,
        textAlign: 'center',
    },
    flatListContainerDesktop: {
        gap: 24,
    },
    carGridRow: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    carGridRowDesktop: {
        justifyContent: 'flex-start',
        marginBottom: 32,
        gap: 24,
    },
    carItemContainer: {
        marginBottom: 16,
        padding: 6,
        borderRadius: 8,
        backgroundColor: myColors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    carItemContainerMobile: {
        // Keep mobile styles as they are
    },
    carItemContainerDesktop: {
        marginBottom: 0,
        padding: 0,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    carImage: {
        width: '100%',
        height: 120,
        borderRadius: 5,
    },
    carImageDesktop: {
        height: 200,
        borderRadius: 0,
    },
    carImageContainer: {
        width: '100%',
        height: 120,
        borderRadius: 5,
        backgroundColor: myColors.screenBackgroundColor,
    },
    carImageContainerDesktop: {
        height: 200,
        borderRadius: 0,
        backgroundColor: '#f1f5f9',
        position: 'relative',
        overflow: 'hidden',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
    },
    viewDetailsButton: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    viewDetailsText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    carInfoContainer: {
        padding: 8,
    },
    carInfoContainerDesktop: {
        padding: 20,
        backgroundColor: '#ffffff',
    },
    carTitle: {
        fontSize: 14,
        marginBottom: 4,
        color: myColors.text.primary,
    },
    carTitleDesktop: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
        color: '#1e293b',
        marginBottom: 8,
        lineHeight: 24,
    },
    carDescription: {
        fontSize: 13,
        color: myColors.text.primary,
    },
    carDescriptionDesktop: {
        fontSize: 14,
        lineHeight: 22,
        color: '#64748b',
        fontWeight: '400',
    },
    readMoreText: {
        color: myColors.primary.main,
        fontWeight: '500',
    },
    bottomSection: {
        marginTop: 16,
    },
    bottomSectionDesktop: {
        // marginTop: 48,
        padding: 24,
        // backgroundColor: '#ffffff',
        borderRadius: 12,
        // borderWidth: 1,
        // borderColor: '#e2e8f0',
        // shadowColor: '#0f172a',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.04,
        // shadowRadius: 8,
        // elevation: 2,
    },
    bottomSectionTitle: {
        fontSize: 20,
        marginBottom: 8,
        color: myColors.text.primary,
    },
    bottomSectionTitleDesktop: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.4,
        color: '#1e293b',
        marginBottom: 16,
    },
    bottomSectionContent: {
        marginBottom: 8,
    },
    bottomSectionContentText: {
        fontSize: 15,
        marginBottom: 4,
        color: myColors.text.primary,
    },
    bottomSectionContentTextDesktop: {
        fontSize: 16,
        lineHeight: 26,
        color: '#475569',
        fontWeight: '400',
    },
});

export default CarSuggestion;
