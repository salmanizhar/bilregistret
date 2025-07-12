import React, { memo, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import { IconDotSingle } from '@/assets/icons';
import { isDesktopWeb } from '@/utils/deviceInfo';

interface BlogCardProps {
    title: string;
    image: any;
    category: string;
    date: string;
    likes: string;
    onPress: () => void;
    onViewAllPress?: () => void;
    listMode?: boolean;
}

// 🚀 WEB OPTIMIZATION: Memoized image component with lazy loading
const OptimizedImage = memo(({ 
    source, 
    style, 
    resizeMode, 
    fallbackSource 
}: {
    source: any;
    style: any;
    resizeMode: any;
    fallbackSource: any;
}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleError = useCallback(() => {
        setImageError(true);
    }, []);

    const handleLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    // 🎯 WEB: Use optimized loading strategy
    if (Platform.OS === 'web') {
        const imageProps = {
            source: imageError ? fallbackSource : source,
            style: [style, !imageLoaded && { opacity: 0.5 }],
            resizeMode,
            onError: handleError,
            onLoad: handleLoad,
            // Web-specific optimizations
            loading: 'lazy' as const,
            decoding: 'async' as const,
        };

        return <Image {...imageProps} />;
    }

    // 🎯 MOBILE: Standard implementation
    return (
        <Image
            source={imageError ? fallbackSource : source}
            style={style}
            resizeMode={resizeMode}
            onError={handleError}
            onLoad={handleLoad}
        />
    );
});

// 🚀 WEB OPTIMIZATION: Memoized icon component to reduce re-renders
const MemoizedSvgXml = memo(({ xml }: { xml: string }) => {
    return <SvgXml xml={xml} />;
});

// 🚀 WEB OPTIMIZATION: Memoized text components
const MemoizedMyText = memo(MyText);
const MemoizedIconDotSingle = memo(IconDotSingle);

// 🚀 PERFORMANCE: Memoized list mode component
const ListModeCard = memo(({ 
    title, 
    image, 
    date, 
    onPress 
}: {
    title: string;
    image: any;
    date: string;
    onPress: () => void;
}) => (
    <TouchableOpacity
        style={[styles.card, styles.ListModeContainer]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={styles.cardContentListMode}>
            <OptimizedImage
                source={image ? { uri: image } : ImagePath.emptyImage}
                style={styles.listModeblogImage}
                resizeMode={image ? "cover" : "contain"}
                fallbackSource={ImagePath.emptyImage}
            />
            <View style={styles.listModeInfoWrapper}>
                <MemoizedMyText
                    numberOfLines={2}
                    style={styles.listModeTitleText}
                    id={`blog-card-${title.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
                >
                    {title}
                </MemoizedMyText>
                <MemoizedMyText 
                    fontFamily='Inter' 
                    numberOfLines={1} 
                    style={styles.listModeDescriptionText}
                >
                    {title}
                </MemoizedMyText>

                <View style={styles.footer}>
                    <View style={styles.dateWrapper}>
                        <MemoizedSvgXml xml={ImagePath.SvgIcons.BlogCalendarIcon} />
                        <MemoizedMyText style={styles.dateText}>{date}</MemoizedMyText>
                    </View>
                </View>
            </View>
        </View>
    </TouchableOpacity>
));

// 🚀 PERFORMANCE: Memoized grid mode component
const GridModeCard = memo(({ 
    title, 
    image, 
    date, 
    likes, 
    onPress 
}: {
    title: string;
    image: any;
    date: string;
    likes: string;
    onPress: () => void;
}) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.cardContent}>
            <View style={styles.blogImage}>
                <OptimizedImage
                    source={image ? { uri: image } : ImagePath.emptyImage}
                    style={styles.blogImage}
                    resizeMode={image ? "cover" : "cover"}
                    fallbackSource={ImagePath.emptyImage}
                />
            </View>

            <View style={styles.blogInfoWrapper}>
                <View style={styles.titleContainer}>
                    <MemoizedMyText
                        numberOfLines={2}
                        style={styles.titleText}
                        id={`blog-card-${title.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
                    >
                        {title}
                    </MemoizedMyText>
                </View>

                <View style={styles.footer}>
                    <View style={styles.dateWrapper}>
                        <MemoizedSvgXml xml={ImagePath.SvgIcons.BlogCalendarIcon} />
                        <MemoizedMyText style={styles.dateText}>{date}</MemoizedMyText>
                    </View>
                    <MemoizedIconDotSingle />
                    <View style={styles.likesWrapper}>
                        <MemoizedSvgXml xml={ImagePath.SvgIcons.CommentIcon} />
                        <MemoizedMyText style={styles.likesText}>{likes}</MemoizedMyText>
                    </View>
                </View>
            </View>
        </View>
    </TouchableOpacity>
));

// 🚀 MAIN COMPONENT: Optimized BlogCard with conditional rendering
const BlogCard: React.FC<BlogCardProps> = ({
    title,
    image,
    category,
    date,
    likes,
    onPress,
    onViewAllPress,
    listMode = false
}) => {
    // 🎯 WEB OPTIMIZATION: Memoize props to prevent unnecessary re-renders
    const memoizedProps = {
        title,
        image,
        date,
        likes,
        onPress
    };

    if (listMode) {
        return <ListModeCard {...memoizedProps} />;
    }

    return <GridModeCard {...memoizedProps} />;
};

// 🚀 PERFORMANCE: Optimize styles object (memoize static styles)
const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: myColors.white,
        overflow: 'hidden',
        // 🎯 WEB: Add GPU acceleration hint
        ...(Platform.OS === 'web' && {
            willChange: 'transform',
            backfaceVisibility: 'hidden',
        }),
    },
    cardContent: {
        paddingTop: 12,
        width: '100%',
        height: 300,
        backgroundColor: myColors.white,
    },
    cardContentListMode: {
        paddingTop: 12,
        width: '100%',
        backgroundColor: myColors.white,
    },
    ListModeContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 15,
        paddingVertical: 20,
        marginBottom: 0,
    },
    listModeInfoWrapper: {
        width: "80%",
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    categoryPill: {
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    category: {
        fontSize: 12,
        color: myColors.primary.main,
        textTransform: 'uppercase',
    },
    titleContainer: {
        height: 48, // Fixed height for 2 lines of text
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 15,
        fontWeight: "medium",
        color: myColors.text.primary,
        lineHeight: 24,
    },
    listModeTitleText: {
        fontSize: 17,
        color: myColors.text.primary,
        lineHeight: 20,
    },
    listModeDescriptionText: {
        fontSize: 14,
        color: myColors.baseColors.light2,
        marginVertical: 5,
    },
    blogImage: {
        width: '97%',
        height: 173,
        borderRadius: 12,
        alignSelf: "center",
        backgroundColor: myColors.screenBackgroundColor,
        // 🎯 WEB: Optimize image container
        ...(Platform.OS === 'web' && {
            willChange: 'transform',
            backfaceVisibility: 'hidden',
        }),
    },
    listModeblogImage: {
        width: 44,
        height: 34,
        marginRight: 10,
        // 🎯 WEB: Optimize small images
        ...(Platform.OS === 'web' && {
            imageRendering: 'auto',
        }),
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 5,
    },
    dateWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10
    },
    dateText: {
        fontSize: 12,
        color: myColors.baseColors.light2,
        marginLeft: 4,
    },
    likesWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10
    },
    likesText: {
        fontSize: 12,
        color: myColors.baseColors.light2,
        marginLeft: 4,
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
    blogInfoWrapper: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 10,
        flex: 1,
        justifyContent: 'space-between',
    }
});

// 🚀 CRITICAL: Export with memo for maximum performance
export default memo(BlogCard);