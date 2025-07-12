import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { myColors } from '@/constants/MyColors';
import CarCard from './CarCard';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import MyText from '@/components/common/MyText';
import { P, Strong, SemanticSection, SemanticArticle } from '@/components/common/SemanticText';
import { useRouter } from 'expo-router';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { desktopWebViewport } from '@/constants/commonConst';

// Web-specific imports
let MultiCarousel: any = null;

if (Platform.OS === 'web') {
    try {
        MultiCarousel = require('react-multi-carousel').default;

        // Import carousel styles
        require('react-multi-carousel/lib/styles.css');

        // Import custom styles
        require('../../Styles/multi-carousel-custom.css');
    } catch (error) {
        // console.warn('MultiCarousel not available:', error);
    }
}

// Define the car item type
interface Car {
    brandImage: string;
    countryFlag: string;
    id: string;
    merke_id: string;
    title: string;
    count?: string;
}

interface CarCarouselProps {
    title?: string;
    isElectric?: boolean;
    onCarPress?: (car: Car) => void;
    onViewAllPress?: () => void;
    limit?: number;
    disabled?: boolean;
    instantRender?: boolean;
}

const windowWidth = Dimensions.get('window').width;
const ITEM_SPACING = 15;

// Default car brands data
const DefaultCarBrands = [
    {
        "brandImage": "https://media.istockphoto.com/id/1274643657/photo/volvo-xc60-test-drive-day.jpg?s=612x612&w=0&k=20&c=DMdBBG-yIkYbvNRCY_vz69NNcqTTqSPazmnH2NqJgwo=",
        "countryFlag": "https://d220xhopowubtq.cloudfront.net/brands/fc9b98_d46d28dffaa14be8915d98788de25ab6~mv2.webp",
        "id": "574",
        "merke_id": "100",
        "title": "Volvo"
    },
    {
        "brandImage": "https://stimg.cardekho.com/images/carexteriorimages/930x620/BMW/X5-2023/10452/1688992642182/front-left-side-47.jpg",
        "countryFlag": "https://d220xhopowubtq.cloudfront.net/brands/fc9b98_783adbac1bc3459291eda816fb01801c~mv2.webp",
        "id": "541",
        "merke_id": "114",
        "title": "BMW"
    },
    {
        "brandImage": "https://bluesky-cogcms-prodb.cdn.imgeng.in/media/23kcymvw/mercedes-amg-gt-c192-stage-3840x3840-07-2023.jpg",
        "countryFlag": "https://d220xhopowubtq.cloudfront.net/brands/fc9b98_e488f1d76909492aab13cf93f7a85f35~mv2.webp",
        "id": "23400",
        "merke_id": "123",
        "title": "Mercedes-Benz"
    },
    {
        "brandImage": "https://cdn.asiatatler.com/asiatatler/i/hk/2018/11/05200547-460487_cover_1600x1000.jpg",
        "countryFlag": "https://d220xhopowubtq.cloudfront.net/brands/fc9b98_7cf062a0120f4a25b5fa4cca5756f624~mv2.png",
        "id": "540",
        "merke_id": "166",
        "title": "Lamborghini"
    },
    {
        "brandImage": "https://cdn.bilregistret.ai/compressed-mobile/Bilregistret-audi-q8-e-tron-sportback-2022-2024.webp",
        "countryFlag": "https://d220xhopowubtq.cloudfront.net/brands/fc9b98_7cf062a0120f4a25b5fa4cca5756f624~mv2.png",
        "id": "23180",
        "merke_id": "117",
        "title": "Audi"
    },
];
// Electric car brands data
const ElectricCarBrands = [
    {
        "brandImage": "https://hips.hearstapps.com/hmg-prod/images/2025-tesla-model-s-1-672d42e172407.jpg?crop=0.465xw:0.466xh;0.285xw,0.361xh&resize=2048:*",
        "countryFlag": "https://d220xhopowubtq.cloudfront.net/brands/fc9b98_7e32eae1679e461d82c22846df069b24~mv2.webp",
        "id": "613",
        "merke_id": "110",
        "title": "Tesla"
    },
    {
        "id": "497",
        "merke_id": "225",
        "title": "XPENG",
        "brandImage": "https://cdn.bilregistret.ai/compressed-mobile/Bilregistret-xpeng-p7-2023-2024.webp",
        "countryFlag": "https://d220xhopowubtq.cloudfront.net/brands/fc9b98_c391f421bb3f45839672654f7d164741~mv2.webp"
    },
    {
        "id": "602",
        "merke_id": "126",
        "title": "Polestar",
        "brandImage": "https://cdn.bilregistret.ai/compressed-mobile/Bilregistret-polestar-polestar-2-2023-2024.webp",
        "countryFlag": "https://d220xhopowubtq.cloudfront.net/brands/fc9b98_a4083f6e037c4402a5b65ee2072917ed~mv2.webp"
    },
    {
        "id": "18874",
        "merke_id": "203",
        "title": "BYD",
        "brandImage": "https://cdn.bilregistret.ai/compressed-mobile/Bilregistret-byd-tang-2020-2024.webp",
        "countryFlag": "https://d220xhopowubtq.cloudfront.net/brands/fc9b98_a4083f6e037c4402a5b65ee2072917ed~mv2.webp"
    }
];

// Helper to chunk array
const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

const CarCarousel: React.FC<CarCarouselProps> = ({
    title = "Populära bilmärken",
    isElectric,
    onCarPress,
    onViewAllPress,
    limit = 10,
    disabled = false,
    instantRender = false
}) => {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<ICarouselInstance>(null);
    const webCarouselRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [cars, setCars] = useState<Car[]>([]);
    const isMounted = useRef(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const carouselWidth = isDesktopWeb() ? desktopWebViewport : windowWidth;
    const itemsPerSlide = isDesktopWeb() ? 4 : 1;
    const itemWidth = isDesktopWeb()
        ? (desktopWebViewport - ITEM_SPACING * (itemsPerSlide - 1)) / itemsPerSlide
        : carouselWidth;

    // Use full viewport width on desktop so arrows align neatly
    const visibleRowWidth = isDesktopWeb() ? desktopWebViewport : carouselWidth;

    // Use the provided handler or default handler
    const handleCarPress = useCallback((car: Car) => {
        if (onCarPress) {
            onCarPress(car);
        } else {
            // Clear any existing timeout
            // if (timeoutRef.current) {
            //     clearTimeout(timeoutRef.current);
            // }

            // timeoutRef.current = setTimeout(() => {
            //     if (isMounted.current) {
            router.push({
                pathname: "/(main)/tillverkare/[brand]",
                params: { brand: car.title.toLowerCase() }
            } as any);
            //     }
            // }, 0);
        }
    }, [router, onCarPress]);

    // Initialize cars data and setup cleanup
    useEffect(() => {
        setIsLoading(true);
        const baseData = isElectric ? ElectricCarBrands : DefaultCarBrands;

        // Simple data loading - avoid complex duplication logic that can fail
        try {
            // For desktop, ensure we have enough items for smooth infinite scrolling
            // when showing multiple items at once
            if (isDesktopWeb() && baseData.length < itemsPerSlide * 2) {
                // Simple duplication - just double the data if needed
                const duplicatedData = [...baseData, ...baseData.map((item, index) => ({
                    ...item,
                    id: `${item.id}_dup_${index}`
                }))];
                setCars(duplicatedData);
            } else {
                setCars(baseData);
            }
            setIsError(false);
        } catch (error) {
            // console.error('Error setting up car data:', error);
            // Fallback to base data even if duplication fails
            setCars(baseData);
            setIsError(baseData.length === 0);
        }

        setIsLoading(false);

        return () => {
            isMounted.current = false;
            // Clean up timeout on unmount
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [isElectric, itemsPerSlide]);

    // Determine data source depending on platform
    const desktopSlides: any[] = isDesktopWeb() ? chunkArray(cars, itemsPerSlide) : cars;

    const renderItem = useCallback(({ item, index }: any) => {
        if (isDesktopWeb()) {
            const slideCars: Car[] = item as Car[];
            return (
                <View style={styles.desktopSlide}>
                    {slideCars.map((car, idx) => {
                        const itemStyle = {
                            ...styles.carItemContainer,
                            width: itemWidth,
                            marginRight: idx !== itemsPerSlide - 1 ? ITEM_SPACING : 0,
                        };

                        return (
                            <SemanticArticle
                                key={car.id}
                                style={itemStyle}
                                itemScope
                                itemType="https://schema.org/Brand"
                                accessibilityLabel={`Bilmärke: ${car.title}`}
                            >
                                <CarCard
                                    brand={car.title}
                                    image={car.brandImage}
                                    count={car.count || undefined}
                                    onPress={() => handleCarPress(car)}
                                />
                            </SemanticArticle>
                        );
                    })}
                    {/* Pad empty slots if needed */}
                    {slideCars.length < itemsPerSlide && Array.from({ length: itemsPerSlide - slideCars.length }).map((_, idx) => (
                        <View key={`pad_${idx}`} style={{ width: itemWidth, marginRight: idx !== itemsPerSlide - 1 ? ITEM_SPACING : 0 }} />
                    ))}
                </View>
            );
        }
        // Mobile render behaviour (single card)
        const car: Car = item as Car;
        const itemStyle = {
            ...styles.carItemContainer,
            width: itemWidth,
        };

        return (
            <SemanticArticle
                style={itemStyle}
                itemScope
                itemType="https://schema.org/Brand"
                accessibilityLabel={`Bilmärke: ${car.title}`}
            >
                <CarCard
                    brand={car.title}
                    image={car.brandImage}
                    count={undefined}
                    onPress={() => handleCarPress(car)}
                />
            </SemanticArticle>
        );
    }, [handleCarPress, itemWidth, itemsPerSlide]);

    const handleOnPressLeftArrow = useCallback(() => {
        if (cars.length === 0 || !isMounted.current || !carouselRef.current) return;

        carouselRef.current.prev();
    }, [cars.length]);

    const handleOnPressRightArrow = useCallback(() => {
        if (cars.length === 0 || !isMounted.current || !carouselRef.current) return;

        carouselRef.current.next();
    }, [cars.length]);

    const onProgressChange = useCallback((progressValue: number) => {
        if (!isMounted.current) return;

        const index = Math.round(progressValue * (cars.length - 1));
        setActiveIndex(index);
    }, [cars.length]);

    const carouselMode = isDesktopWeb() ? 'default' : 'parallax';
    const carouselModeConfig = isDesktopWeb() ? undefined : {
        parallaxScrollingScale: 0.9,
        parallaxScrollingOffset: 50,
    };

    if (isLoading && !instantRender) {
        return (
            <SemanticSection
                style={styles.container}
                role="region"
                accessibilityLabel="Laddar bilmärken"
                itemScope
                itemType="https://schema.org/ItemList"
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={myColors.primary.main} />
                    <P style={styles.loadingText}>
                        Laddar {isElectric ? "elektriska" : "populära"} bilmärken från vårt <Strong>bilregister</Strong>...
                    </P>
                </View>
            </SemanticSection>
        );
    }

    if (instantRender && (isError || cars.length === 0)) {
        return (
            <SemanticSection
                style={styles.container}
                role="region"
                accessibilityLabel="Bilmärken laddas"
                itemScope
                itemType="https://schema.org/ItemList"
            >
                <View style={[styles.carouselContainer, { height: 243, justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={styles.placeholder}>
                        <P style={styles.placeholderTitle}>
                            {isElectric ? "Elektriska Bilmärken" : "Populära Bilmärken"}
                        </P>
                        <P style={styles.placeholderText}>
                            Sök <Strong>biluppgifter</Strong> för fordon från vårt <Strong>bilregister</Strong>
                        </P>
                    </View>
                </View>
            </SemanticSection>
        );
    }

    // Show cars even if there was an error, but fallback to default data
    if (isError && cars.length === 0) {
        // Force fallback to default data
        const fallbackData = isElectric ? ElectricCarBrands : DefaultCarBrands;
        if (fallbackData.length > 0) {
            // Use fallback data to still show something
            return (
                <SemanticSection
                    style={styles.container}
                    role="region"
                    accessibilityLabel={`${isElectric ? "Elektriska bilmärken" : "Populära bilmärken"} för att söka biluppgifter`}
                    itemScope
                    itemType="https://schema.org/ItemList"
                >
                    {/* Render carousel with fallback data */}
                    {Platform.OS === 'web' && MultiCarousel && !disabled && (
                        <View
                            style={[
                                styles.carouselContainer,
                                {
                                    width: visibleRowWidth,
                                },
                                { overflow: 'hidden' },
                            ]}
                        >
                            <MultiCarousel
                                responsive={{
                                    desktop: {
                                        breakpoint: { max: 3000, min: 1024 },
                                        items: isDesktopWeb() ? itemsPerSlide : 2,
                                    },
                                    tablet: {
                                        breakpoint: { max: 1024, min: 464 },
                                        items: 2,
                                    },
                                    mobile: {
                                        breakpoint: { max: 464, min: 0 },
                                        items: 1,
                                    },
                                }}
                                infinite={true}
                                autoPlay={false}
                                showDots={false}
                                arrows={true}
                                renderArrowsWhenDisabled={false}
                                itemClass="carousel-item-padding-40-px"
                                containerClass="car-carousel-container"
                            >
                                {fallbackData.map((car) => (
                                    <div key={car.id} style={{ padding: '0 8px' }}>
                                        <SemanticArticle
                                            style={{
                                                ...styles.carItemContainer,
                                                width: '100%',
                                                height: 243,
                                            }}
                                            itemScope
                                            itemType="https://schema.org/Brand"
                                            accessibilityLabel={`Bilmärke: ${car.title}`}
                                        >
                                            <CarCard
                                                brand={car.title}
                                                image={car.brandImage}
                                                count={undefined}
                                                onPress={() => handleCarPress(car)}
                                            />
                                        </SemanticArticle>
                                    </div>
                                ))}
                            </MultiCarousel>
                        </View>
                    )}

                    {Platform.OS !== 'web' && !(disabled && Platform.OS === 'android') && (
                        <View style={[styles.carouselContainer, { width: visibleRowWidth }]}>
                            <View style={styles.placeholder}>
                                <P style={styles.placeholderText}>
                                    {isElectric ? "Elektriska bilmärken" : "Populära bilmärken"} tillfälligt otillgängliga
                                </P>
                            </View>
                        </View>
                    )}
                </SemanticSection>
            );
        }

        // Absolute fallback if even default data fails
        return (
            <SemanticSection
                style={styles.container}
                role="region"
                accessibilityLabel="Fel vid laddning av bilmärken"
            >
                <View style={styles.errorContainer}>
                    <P style={styles.errorText}>
                        Kunde inte ladda bilmärken från bilregistret
                    </P>
                </View>
            </SemanticSection>
        );
    }

    return (
        <SemanticSection
            style={styles.container}
            role="region"
            accessibilityLabel={`${isElectric ? "Elektriska bilmärken" : "Populära bilmärken"} för att söka biluppgifter`}
            itemScope
            itemType="https://schema.org/ItemList"
        >
            {/* Web-specific MultiCarousel implementation */}
            {Platform.OS === 'web' && MultiCarousel && !disabled && (
                <View
                    style={[
                        styles.carouselContainer,
                        {
                            width: visibleRowWidth,
                        },
                        { overflow: 'hidden' },
                    ]}
                >
                    <MultiCarousel
                        ref={webCarouselRef}
                        responsive={{
                            desktop: {
                                breakpoint: { max: 3000, min: 1024 },
                                items: isDesktopWeb() ? itemsPerSlide : 2,
                            },
                            tablet: {
                                breakpoint: { max: 1024, min: 464 },
                                items: 2,
                            },
                            mobile: {
                                breakpoint: { max: 464, min: 0 },
                                items: 1,
                            },
                        }}
                        infinite={cars.length > itemsPerSlide}
                        autoPlay={false}
                        showDots={false}
                        arrows={cars.length > itemsPerSlide}
                        renderArrowsWhenDisabled={false}
                        itemClass="carousel-item-padding-40-px"
                        containerClass="car-carousel-container"
                        sliderClass=""
                        transitionDuration={400}
                        beforeChange={(nextSlide: number) => {
                            if (onProgressChange && cars.length > 0) {
                                const progress = nextSlide / Math.max(cars.length - 1, 1);
                                onProgressChange(progress);
                            }
                        }}
                        customLeftArrow={
                            <TouchableOpacity
                                style={styles.navLeftButton}
                                accessibilityLabel="Föregående bilmärken"
                                onPress={() => webCarouselRef.current?.previous()}
                            >
                                <SvgXml xml={ImagePath.SvgIcons.LeftArrow} />
                            </TouchableOpacity>
                        }
                        customRightArrow={
                            <TouchableOpacity
                                style={styles.navRightButton}
                                accessibilityLabel="Nästa bilmärken"
                                onPress={() => webCarouselRef.current?.next()}
                            >
                                <SvgXml xml={ImagePath.SvgIcons.RightArrow} />
                            </TouchableOpacity>
                        }
                    >
                        {cars.map((car, index) => (
                            <div key={car.id || `car-${index}`} style={{ padding: '0 8px' }}>
                                <SemanticArticle
                                    style={{
                                        ...styles.carItemContainer,
                                        width: '100%',
                                        height: 243,
                                    }}
                                    itemScope
                                    itemType="https://schema.org/Brand"
                                    accessibilityLabel={`Bilmärke: ${car.title}`}
                                >
                                    <CarCard
                                        brand={car.title}
                                        image={car.brandImage}
                                        count={undefined}
                                        onPress={() => handleCarPress(car)}
                                    />
                                </SemanticArticle>
                            </div>
                        ))}
                    </MultiCarousel>
                </View>
            )}

            {/* Native mobile carousel - completely hide on Android when disabled to prevent native view interference */}
            {Platform.OS !== 'web' && !(disabled && Platform.OS === 'android') && (
                <View
                    style={[
                        styles.carouselContainer,
                        {
                            width: visibleRowWidth,
                        },
                        // Add Android-specific pointer events handling
                        disabled && Platform.OS === 'android' && { pointerEvents: 'none' },
                        { overflow: 'hidden' },
                    ]}
                >
                    <View style={styles.carouselWrapper}>
                        <Carousel
                            ref={carouselRef}
                            data={desktopSlides}
                            renderItem={renderItem}
                            width={isDesktopWeb() ? desktopWebViewport : itemWidth}
                            height={243}
                            loop={cars.length > itemsPerSlide}
                            enabled={!disabled}
                            scrollAnimationDuration={400}
                            onProgressChange={onProgressChange}
                            mode={carouselMode as any}
                            modeConfig={carouselModeConfig as any}
                            onConfigurePanGesture={(gestureChain) => {
                                gestureChain.activeOffsetX([-15, 15]);
                                if (Platform.OS !== 'web') {
                                    gestureChain.failOffsetY([-10, 10]);
                                }
                            }}
                            style={[styles.carousel, { width: carouselWidth }]}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.navLeftButton,
                            // Reduce opacity when disabled on Android
                            disabled && Platform.OS === 'android' && { opacity: 0.5 }
                        ]}
                        onPress={handleOnPressLeftArrow}
                        disabled={disabled} // Disable button when carousel is disabled
                        accessibilityLabel="Föregående bilmärken"
                    >
                        <SvgXml xml={ImagePath.SvgIcons.LeftArrow} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.navRightButton,
                            // Reduce opacity when disabled on Android
                            disabled && Platform.OS === 'android' && { opacity: 0.5 }
                        ]}
                        onPress={handleOnPressRightArrow}
                        disabled={disabled} // Disable button when carousel is disabled
                        accessibilityLabel="Nästa bilmärken"
                    >
                        <SvgXml xml={ImagePath.SvgIcons.RightArrow} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Show placeholder when carousel is disabled */}
            {((disabled && Platform.OS === 'android') || (Platform.OS === 'web' && disabled)) && (
                <View style={[styles.carouselContainer, { height: 243, justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={styles.placeholder}>
                        <P style={styles.placeholderTitle}>
                            {isElectric ? "Elektriska Bilmärken" : "Populära Bilmärken"}
                        </P>
                        <P style={styles.placeholderText}>
                            Sök <Strong>biluppgifter</Strong> för fordon från vårt <Strong>bilregister</Strong>
                        </P>
                    </View>
                </View>
            )}
        </SemanticSection>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: isDesktopWeb() ? 20 : 0,
        backgroundColor: myColors.screenBackgroundColor,
        alignItems: 'center',
    },
    carouselContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...(Platform.OS === 'android' && {
            elevation: 0,
        }),
    },
    carouselWrapper: {
        position: 'relative',
        alignItems: 'center',
        ...(Platform.OS === 'android' && {
            elevation: 0,
        }),
    },
    carousel: {
        width: '100%',
        // The width will be set dynamically in the component
        ...(Platform.OS === 'android' && {
            elevation: 0,
        }),
    },
    carItemContainer: {
        backgroundColor: myColors.white,
        borderRadius: 15,
        height: 243,
        // The width will be set by the carousel component
        alignSelf: 'center',
        ...(Platform.OS === 'android' && {
            elevation: 1,
        }),
    },
    navLeftButton: {
        position: 'absolute',
        left: 0,
        top: '50%',
        width: 44,
        height: 44,
        borderRadius: 30,
        marginLeft: 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        ...(Platform.OS === 'android' ? {
            elevation: 2,
            zIndex: 2,
        } : {
            elevation: 4,
            zIndex: 10,
        }),
    },
    navRightButton: {
        position: 'absolute',
        right: 0,
        top: '50%',
        width: 44,
        height: 44,
        borderRadius: 30,
        marginRight: 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        ...(Platform.OS === 'android' ? {
            elevation: 2,
            zIndex: 2,
        } : {
            elevation: 4,
            zIndex: 10,
        }),
    },
    loadingContainer: {
        height: 243,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: myColors.text.secondary,
        textAlign: 'center',
    },
    errorContainer: {
        height: 243,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: myColors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    placeholder: {
        backgroundColor: myColors.white,
        padding: 30,
        borderRadius: 15,
        alignItems: 'center',
        maxWidth: 300,
    },
    placeholderTitle: {
        fontSize: 18,
        color: myColors.text.primary,
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    placeholderText: {
        fontSize: 14,
        color: myColors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    desktopSlide: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default CarCarousel;