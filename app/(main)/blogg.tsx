// All Blogs screen

import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Text,
    ScrollView,
    Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { myColors } from '@/constants/MyColors';
import BlogCard from '@/components/home/BlogCard';
import HeaderWithSearch from '@/components/common/HeaderWithSearch';
import { useInfiniteBlogs } from '@/Services/api/hooks/blog.hooks';
import { BlogPost } from '@/Services/api/services/blog.service';
import MyText from '@/components/common/MyText';
import { H1, P, SemanticMain, SemanticSection } from '@/components/common/SemanticText';
import { isDesktopWeb } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { SEOHead } from '@/components/seo';

// Posts per page
const POSTS_PER_PAGE = 10;

const AllBlogs = () => {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    // Use the infinite blogs hook for pagination
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch
    } = useInfiniteBlogs(POSTS_PER_PAGE);

    // Handle back button press
    const handleBack = () => {
        router.back();
    };

    // Handle blog post press
    const handleBlogPress = (blog: BlogPost) => {
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
    };

    // Render blog item
    const renderBlogItem = ({ item }: { item: BlogPost }) => (
        <View
            key={item.id}
            style={styles.blogItemContainer} >
            <BlogCard
                listMode={true}
                title={item.title}
                image={item.featuredImage} // Use fallback image if none provided
                category={item.categories?.[0]?.name || 'Blog'} // Use first category or default
                date={new Date(item.publishedAt).toLocaleString('sv-SE', {
                    hour: 'numeric',
                    minute: 'numeric',
                    weekday: 'long'
                })}
                likes={item.viewCount.toString()}
                onPress={() => handleBlogPress(item)}
                onViewAllPress={() => { }} // Empty function as required
            />
        </View>
    );

    // Handle refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Flatten all pages of data
    const blogPosts = data?.pages.flatMap(page => page.posts) || [];

    // Handle load more when reaching end of list
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    // Render loading footer when fetching more posts
    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={myColors.primary.main} />
                <MyText style={styles.loadingText}>Loading more posts...</MyText>
            </View>
        );
    };

    // Render empty state when no posts
    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={myColors.primary.main} />
                </View>
            );
        }

        if (isError) {
            return (
                <View style={styles.emptyContainer}>
                    <P id="error-message" style={styles.errorText}>
                        Kunde inte ladda blogginlägg. Försök igen senare.
                    </P>
                    <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                        <MyText style={styles.retryText}>Försök igen</MyText>
                    </TouchableOpacity>
                </View>
            );
        }

        if (blogPosts.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <P id="empty-state" style={styles.emptyText}>
                        Inga blogginlägg hittades just nu.
                    </P>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={myColors.white} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* SEO Head Tags */}
            <SEOHead
                title="Blogg - Bilregistret.ai"
                description="Läs de senaste nyheterna och insikterna om bilar, fordonsteknik och bilbranschen i Sverige. Upptäck expertanalyser och nyheter från bilvärlden."
                keywords={[
                    'bil blogg',
                    'bilnyheter',
                    'fordonsteknik',
                    'bilbranschen',
                    'sverige',
                    'nyheter',
                    'bilar',
                    'artiklar',
                    'bilregistret blogg'
                ]}
                url="/blogg"
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'Blog',
                    name: 'Bilregistret.ai Blogg',
                    description: 'Senaste nyheterna och insikter om bilar, fordonsteknik och bilbranschen',
                    url: 'https://bilregistret.ai/blogg',
                    publisher: {
                        '@type': 'Organization',
                        name: 'Bilregistret Sverige AB',
                        url: 'https://bilregistret.ai'
                    },
                    blogPost: blogPosts?.slice(0, 5).map((post, index) => ({
                        '@type': 'BlogPosting',
                        headline: post.title,
                        datePublished: post.publishedAt,
                        url: `https://bilregistret.ai/nyheter/${post.slug}`,
                        author: {
                            '@type': 'Organization',
                            name: 'Bilregistret Sverige AB'
                        }
                    })) || []
                }}
            />

            {isDesktopWeb() ? (
                <FooterWrapper>
                    <DesktopViewWrapper>
                        <SemanticMain style={styles.desktopContent}>
                            <H1 id="blog-page-title" style={styles.pageTitle}>
                                Bilregistret Blogg
                            </H1>
                            <P id="blog-description" style={styles.pageDescription}>
                                Senaste nyheterna och insikter om bilar, fordonsteknik och bilbranschen i Sverige.
                            </P>

                            <SemanticSection
                                style={styles.blogListSection}
                                ariaLabelledBy="blog-page-title"
                                accessibilityLabel="Lista med blogginlägg"
                            >
                                <FlatList
                                    data={blogPosts}
                                    renderItem={renderBlogItem}
                                    keyExtractor={(item) => item.id}
                                    showsVerticalScrollIndicator={false}
                                    ListEmptyComponent={renderEmpty}
                                    ListFooterComponent={renderFooter}
                                    onEndReached={handleLoadMore}
                                    onEndReachedThreshold={0.5}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                            colors={[myColors.primary.main]}
                                            tintColor={myColors.primary.main}
                                        />
                                    }
                                    style={styles.flatListStyle}
                                />
                            </SemanticSection>
                        </SemanticMain>
                    </DesktopViewWrapper>
                </FooterWrapper>
            ) : (
                <ScrollView style={styles.container}>

                    <HeaderWithSearch />
                    <SemanticMain style={styles.mobileContent}>
                        <View style={styles.mobileHeader}>
                            <H1 id="blog-page-title" style={styles.mobilePageTitle}>
                                Bilregistret Blogg
                            </H1>
                            <P id="blog-description" style={styles.mobilePageDescription}>
                                Senaste nyheterna om bilar och fordonsteknik.
                            </P>
                        </View>

                        <SemanticSection
                            style={styles.blogListSection}
                            ariaLabelledBy="blog-page-title"
                            accessibilityLabel="Lista med blogginlägg"
                        >
                            <FlatList
                                data={blogPosts}
                                renderItem={renderBlogItem}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={renderEmpty}
                                ListFooterComponent={renderFooter}
                                onEndReached={handleLoadMore}
                                onEndReachedThreshold={0.5}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={[myColors.primary.main]}
                                        tintColor={myColors.primary.main}
                                    />
                                }
                            />
                        </SemanticSection>
                    </SemanticMain>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
        flexGrow: 1, // Ensure content fills screen even with few items
    },
    desktopContent: {
        flex: 1,
        marginBottom: 30,
        padding: 32,
    },
    mobileContent: {
        flex: 1,
    },
    mobileHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    pageTitle: {
        fontSize: isDesktopWeb() ? 48 : 32,
        fontWeight: '700',
        color: myColors.text.primary,
        marginBottom: isDesktopWeb() ? 16 : 12,
        textAlign: 'left',
    },
    mobilePageTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: myColors.text.primary,
        marginBottom: 8,
    },
    pageDescription: {
        fontSize: isDesktopWeb() ? 18 : 16,
        color: myColors.text.secondary,
        marginBottom: isDesktopWeb() ? 32 : 20,
        textAlign: isDesktopWeb() ? 'center' : 'left',
        lineHeight: isDesktopWeb() ? 28 : 24,
    },
    mobilePageDescription: {
        fontSize: 16,
        color: myColors.text.secondary,
        marginBottom: 16,
        lineHeight: 22,
    },
    blogListSection: {
        flex: 1,
    },
    flatListStyle: {
        flex: 1,
    },
    blogItemContainer: {
        marginTop: 10,
        paddingHorizontal: 20,
    },
    loadingFooter: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 14,
        color: myColors.text.secondary,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
    },
    emptyText: {
        fontSize: 16,
        color: myColors.text.secondary,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: myColors.error,
        textAlign: 'center',
        marginBottom: 10,
    },
    retryButton: {
        padding: 10,
        backgroundColor: myColors.primary.main,
        borderRadius: 8,
        marginTop: 10,
    },
    retryText: {
        color: myColors.white,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default AllBlogs;
