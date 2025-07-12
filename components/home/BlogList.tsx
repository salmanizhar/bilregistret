import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { myColors } from '@/constants/MyColors';
import BlogCard from './BlogCard';
import SectionHeader from './SectionHeader';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import MyText from '@/components/common/MyText';
import { P, Strong, SemanticSection, SemanticArticle } from '@/components/common/SemanticText';
import { useInfiniteBlogs } from '@/Services/api/hooks/blog.hooks';
import { BlogPost as ApiBlogPost } from '@/Services/api/services/blog.service';
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

// Define the blog post type
interface BlogPost {
    id: string;
    title: string;
    image: any;
    category: string;
    date: string;
    likes: string;
    slug?: string;
}

interface BlogListProps {
    title?: string;
    onBlogPress?: (blog: BlogPost) => void;
    onViewAllPress?: () => void;
    limit?: number;
    disabled?: boolean;
    instantRender?: boolean;
}

// We'll determine the carousel/item width dynamically so that on desktop web we respect the 1280px viewport cap
const windowWidth = Dimensions.get('window').width;
const ITEM_SPACING = 15;
const SIDE_PADDING = 15;
const DEFAULT_BLOG_LIMIT = 15;

// Helper to chunk array
const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

const BlogList: React.FC<BlogListProps> = ({
    onBlogPress,
    onViewAllPress,
    limit = DEFAULT_BLOG_LIMIT,
    disabled = false,
    instantRender = false
}) => {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<ICarouselInstance>(null);
    const webCarouselRef = useRef<any>(null);
    const isMountedRef = useRef(true);

    // Simplified state management
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Use infinite query
    const {
        data: infiniteBlogData,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteBlogs(limit);

    // Transform API data to the format expected by component
    const formatBlogForDisplay = useCallback((blog: ApiBlogPost): BlogPost => ({
        id: blog.id,
        title: blog.title,
        image: blog.featuredImage,
        category: blog.categories?.[0]?.name || 'BLOG',
        date: new Date(blog.publishedAt).toLocaleString('sv-SE', {
            hour: 'numeric',
            minute: 'numeric',
            weekday: 'long'
        }),
        likes: blog.commentCount.toString(),
        slug: blog.slug,
    }), []);

    // Cleanup function
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Simplified data processing - single effect with clear logic
    useEffect(() => {
        if (!isMountedRef.current) return;

        // Process data when we have pages
        if (infiniteBlogData?.pages && infiniteBlogData.pages.length > 0) {
            try {
                const allPosts: ApiBlogPost[] = infiniteBlogData.pages
                    .filter(page => page && page.posts)
                    .flatMap(page => page.posts || []);

                if (allPosts.length > 0) {
                    const formattedBlogs = allPosts.map(formatBlogForDisplay);
                    setBlogs(formattedBlogs);
                    setHasInitialized(true);
                }
            } catch (error) {
                console.error('Error processing blog data:', error);
                setHasInitialized(true); // Still mark as initialized to prevent loading state
            }
        }
        // Mark as initialized even if no data to prevent infinite loading
        else if (!isLoading && !isFetchingNextPage) {
            setHasInitialized(true);
        }
    }, [infiniteBlogData?.pages, isLoading, isFetchingNextPage, formatBlogForDisplay]);

    // Simple initial fetch effect
    useEffect(() => {
        if (!hasInitialized && !isLoading && !isFetchingNextPage && hasNextPage && blogs.length === 0) {
            // Only fetch once on mount if we have no data
            fetchNextPage();
        }
    }, [hasInitialized, isLoading, isFetchingNextPage, hasNextPage, blogs.length, fetchNextPage]);

    // Default handlers - memoized to prevent re-renders
    const defaultBlogPressHandler = useCallback((blog: BlogPost) => {
        if (Platform.OS === 'web') {
            router.navigate({
                pathname: "/(main)/nyheter/[slug]",
                params: { slug: blog.slug }
            } as any);
        } else {
            router.push({
                pathname: "/(main)/nyheter/[slug]",
                params: { slug: blog.slug }
            } as any);
        }
    }, [router]);

    const defaultViewAllHandler = useCallback(() => {
        if (Platform.OS === 'web') {
            router.navigate('/(main)/blogg');
        } else {
            router.push('/(main)/blogg');
        }
    }, [router]);

    // Use provided handlers or defaults
    const handleBlogPress = onBlogPress || defaultBlogPressHandler;
    const handleViewAllPress = onViewAllPress || defaultViewAllHandler;

    // Memoize expensive calculations
    const carouselDimensions = useMemo(() => {
        const carouselWidth = isDesktopWeb() ? desktopWebViewport : windowWidth;
        const itemsPerSlide = isDesktopWeb() ? 3 : 1;
        const itemWidth = isDesktopWeb()
            ? (desktopWebViewport - ITEM_SPACING * (itemsPerSlide - 1)) / itemsPerSlide
            : carouselWidth;
        const visibleRowWidth = isDesktopWeb() ? desktopWebViewport : carouselWidth;

        return { carouselWidth, itemsPerSlide, itemWidth, visibleRowWidth };
    }, []);

    // Prepare data source
    const desktopSlides = useMemo(() => {
        return isDesktopWeb() ? chunkArray(blogs, carouselDimensions.itemsPerSlide) : blogs;
    }, [blogs, carouselDimensions.itemsPerSlide]);

    const renderItem = ({ item, index }: any) => {
        if (isDesktopWeb()) {
            const slideBlogs: BlogPost[] = item as BlogPost[];
            return (
                <View style={styles.desktopSlide}>
                    {slideBlogs.map((blog, idx) => {
                        const itemStyle = {
                            ...styles.blogItemContainer,
                            width: carouselDimensions.itemWidth,
                            marginRight: idx !== carouselDimensions.itemsPerSlide - 1 ? ITEM_SPACING : 0,
                        };

                        return (
                            <SemanticArticle
                                key={blog.id}
                                style={itemStyle}
                                itemScope
                                itemType="https://schema.org/BlogPosting"
                                accessibilityLabel={`Bloggpost: ${blog.title}`}
                            >
                                <BlogCard
                                    title={blog.title}
                                    image={blog.image}
                                    category={blog.category}
                                    date={blog.date}
                                    likes={blog.likes}
                                    onPress={() => handleBlogPress(blog)}
                                    onViewAllPress={() => handleViewAllPress()}
                                />
                            </SemanticArticle>
                        );
                    })}
                    {/* Pad empty slots to maintain consistent width */}
                    {slideBlogs.length < carouselDimensions.itemsPerSlide && Array.from({ length: carouselDimensions.itemsPerSlide - slideBlogs.length }).map((_, idx) => (
                        <View key={`pad_${idx}`} style={{ width: carouselDimensions.itemWidth, marginRight: idx !== carouselDimensions.itemsPerSlide - 1 ? ITEM_SPACING : 0 }} />
                    ))}
                </View>
            );
        }
        const blog: BlogPost = item as BlogPost;
        const itemStyle = {
            ...styles.blogItemContainer,
            width: carouselDimensions.itemWidth,
        };

        return (
            <SemanticArticle
                style={itemStyle}
                itemScope
                itemType="https://schema.org/BlogPosting"
                accessibilityLabel={`Bloggpost: ${blog.title}`}
            >
                <BlogCard
                    title={blog.title}
                    image={blog.image}
                    category={blog.category}
                    date={blog.date}
                    likes={blog.likes}
                    onPress={() => handleBlogPress(blog)}
                    onViewAllPress={() => handleViewAllPress()}
                />
            </SemanticArticle>
        );
    };

    const handleOnPressLeftArrow = useCallback(() => {
        if (blogs.length === 0 || !carouselRef.current) return;
        carouselRef.current.prev();
    }, [blogs.length]);

    const handleOnPressRightArrow = useCallback(() => {
        if (blogs.length === 0 || !carouselRef.current) return;
        carouselRef.current.next();
    }, [blogs.length]);

    const onProgressChange = useCallback((progressValue: number) => {
        const index = Math.round(progressValue * (blogs.length - 1));
        setActiveIndex(index);
    }, [blogs.length]);

    const carouselMode = isDesktopWeb() ? 'default' : 'parallax';
    const carouselModeConfig = isDesktopWeb() ? undefined : {
        parallaxScrollingScale: 0.9,
        parallaxScrollingOffset: 50,
    };

    // Simplified loading logic
    const showLoading = isLoading && !hasInitialized && blogs.length === 0;
    const showMinimalLoading = instantRender && showLoading;
    const showContent = hasInitialized && blogs.length > 0;

    // Show minimal loading for instant render
    if (showMinimalLoading) {
        return (
            <SemanticSection
                style={styles.container}
                role="region"
                accessibilityLabel="Nyheter laddas"
                itemScope
                itemType="https://schema.org/Blog"
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={myColors.primary.main} />
                </View>
            </SemanticSection>
        );
    }

    // Show full loading for non-instant render
    if (showLoading && !instantRender) {
        return (
            <SemanticSection
                style={styles.container}
                role="region"
                accessibilityLabel="Laddar bloggartiklar"
                itemScope
                itemType="https://schema.org/Blog"
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={myColors.primary.main} />
                    <P style={styles.loadingText}>
                        Laddar senaste nyheter...
                    </P>
                </View>
            </SemanticSection>
        );
    }

    // Don't render anything if no content and initialized (prevents error states from showing to users)
    if (hasInitialized && blogs.length === 0) {
        return null;
    }

    // Only render the carousel if we have content
    if (!showContent) {
        return null;
    }

    return (
        <SemanticSection
            style={styles.container}
            role="region"
            accessibilityLabel="Senaste nyheter och bloggartiklar om biluppgifter"
            itemScope
            itemType="https://schema.org/Blog"
        >
            {/* Web-specific MultiCarousel implementation */}
            {Platform.OS === 'web' && MultiCarousel && !disabled && blogs.length > 0 && (
                <View style={[styles.carouselContainer, { width: carouselDimensions.visibleRowWidth }]}>
                    <MultiCarousel
                        ref={webCarouselRef}
                        responsive={{
                            desktop: {
                                breakpoint: { max: 3000, min: 1024 },
                                items: isDesktopWeb() ? carouselDimensions.itemsPerSlide : 2,
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
                        infinite={blogs.length > carouselDimensions.itemsPerSlide}
                        autoPlay={false}
                        showDots={false}
                        arrows={blogs.length > carouselDimensions.itemsPerSlide}
                        renderArrowsWhenDisabled={false}
                        itemClass="carousel-item-padding-40-px"
                        containerClass="blog-carousel-container"
                        sliderClass=""
                        transitionDuration={400}
                        beforeChange={(nextSlide: number) => {
                            if (onProgressChange && blogs.length > 0) {
                                const progress = nextSlide / Math.max(blogs.length - 1, 1);
                                onProgressChange(progress);
                            }
                        }}
                        customLeftArrow={
                            <TouchableOpacity
                                style={styles.navLeftButton}
                                accessibilityLabel="Föregående bloggartiklar"
                                onPress={() => webCarouselRef.current?.previous()}
                            >
                                <SvgXml xml={ImagePath.SvgIcons.LeftArrow} />
                            </TouchableOpacity>
                        }
                        customRightArrow={
                            <TouchableOpacity
                                style={styles.navRightButton}
                                accessibilityLabel="Nästa bloggartiklar"
                                onPress={() => webCarouselRef.current?.next()}
                            >
                                <SvgXml xml={ImagePath.SvgIcons.RightArrow} />
                            </TouchableOpacity>
                        }
                    >
                        {blogs.map((blog, index) => (
                            <div key={blog.id || `blog-${index}`} style={{ padding: '0 8px' }}>
                                <SemanticArticle
                                    style={{
                                        ...styles.blogItemContainer,
                                        width: '100%',
                                        height: 300,
                                    }}
                                    itemScope
                                    itemType="https://schema.org/BlogPosting"
                                    accessibilityLabel={`Bloggpost: ${blog.title}`}
                                >
                                    <BlogCard
                                        title={blog.title}
                                        image={blog.image}
                                        category={blog.category}
                                        date={blog.date}
                                        likes={blog.likes}
                                        onPress={() => handleBlogPress(blog)}
                                        onViewAllPress={() => handleViewAllPress()}
                                    />
                                </SemanticArticle>
                            </div>
                        ))}
                    </MultiCarousel>
                </View>
            )}

            {/* Native mobile carousel */}
            {Platform.OS !== 'web' && !(disabled && Platform.OS === 'android') && (
                <View style={[styles.carouselContainer, { width: carouselDimensions.visibleRowWidth }]}>
                    {blogs.length > 0 && (
                        <>
                            <View style={styles.carouselWrapper}>
                                <Carousel
                                    ref={carouselRef}
                                    data={desktopSlides as any}
                                    renderItem={renderItem}
                                    width={isDesktopWeb() ? desktopWebViewport : carouselDimensions.itemWidth}
                                    height={360}
                                    loop={blogs.length > carouselDimensions.itemsPerSlide}
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
                                    style={[styles.carousel, { width: carouselDimensions.carouselWidth }]}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.navLeftButton,
                                    disabled && Platform.OS === 'android' && { opacity: 0.5 }
                                ]}
                                onPress={handleOnPressLeftArrow}
                                disabled={disabled}
                                accessibilityLabel="Föregående bloggartiklar"
                            >
                                <SvgXml xml={ImagePath.SvgIcons.LeftArrow} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.navRightButton,
                                    disabled && Platform.OS === 'android' && { opacity: 0.5 }
                                ]}
                                onPress={handleOnPressRightArrow}
                                disabled={disabled}
                                accessibilityLabel="Nästa bloggartiklar"
                            >
                                <SvgXml xml={ImagePath.SvgIcons.RightArrow} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}
        </SemanticSection>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: Platform.OS === 'web' ? -20 : 20,
        marginVertical: 20,
        backgroundColor: myColors.screenBackgroundColor,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: myColors.text.primary,
    },
    viewAllText: {
        fontSize: 14,
        color: myColors.primary.main,
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
        ...(Platform.OS === 'android' && {
            elevation: 0,
        }),
    },
    blogItemContainer: {
        backgroundColor: myColors.white,
        borderRadius: 15,
        width: '100%',
        alignSelf: 'center',
        ...(Platform.OS === 'android' && {
            elevation: 1,
        }),
    },
    navLeftButton: {
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: [{ translateY: -40 }],
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
        transform: [{ translateY: -40 }],
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
        height: 200,
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
        height: 200,
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
    desktopSlide: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default BlogList;