import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Share,
    TextInput,
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, Entypo } from '@expo/vector-icons';
import MyText from '@/components/common/MyText';
import { H1, H2, H3, P, SemanticMain, SemanticArticle, SemanticSection, SemanticAside } from '@/components/common/SemanticText';
import { myColors } from '@/constants/MyColors';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import SimpleHeader from '@/components/common/SimpleHeader';
import { MyTextInput } from '@/components/common/MyTextInput';
import MyButton from '@/components/common/MyButton';
import { useBlogBySlug, usePostComment } from '@/Services/api/hooks/blog.hooks';
import RenderHtml from 'react-native-render-html';
import { API_ROUTES } from '@/Services/api/routes/api.routes';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/Services/api/context/auth.context';
import { showAlert } from '@/utils/alert';
import { isDesktopWeb } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { desktopWebViewport } from '@/constants/commonConst';
import { View as RNView } from 'react-native';
import { IconChevronDown, IconChevronUp } from '@/assets/icons';
import { BlogPostSEO } from '@/components/seo';

const { width } = Dimensions.get('window');

// Define interfaces
interface Post {
    id: string;
    title: string;
    image: any;
    category: string;
    date: string;
    likes: string;
    author?: string;
    content?: string;
}
interface Comment {
    id: string;
    author: string;
    avatar?: any;
    text: string;
    date: string;
}

interface Author {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
}

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image: string;
    featuredImage?: string;
    author_id: string;
    status: string;
    view_count: number;
    allow_comments: boolean;
    tags: string[];
    categories: string[];
    meta_title: string;
    meta_description: string;
    published_at: string;
    createdAt: string;
    updatedAt: string;
    author: Author;
}

interface CommentsResponse {
    total: number;
    totalPages: number;
    currentPage: number;
    data: Comment[];
}

interface BlogPostResponse {
    post: BlogPost;
    comments: CommentsResponse;
}

interface TocItem {
    id: string;
    title: string;
}

// Comment Types
interface Comment {
    id: string;
    postId: string;
    userId: string | null;
    parentId: string | null;
    authorName: string;
    authorEmail: string;
    content: string;
    status: "approved" | "pending" | "rejected";
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    updatedAt: string;
    User: {
        id: string;
        name?: string;
        email?: string;
        profile_picture?: string;
    } | null;
    replies: Comment[]; // Self-referential for nested comments
}

// Comment submission validation schema (simplified to only require content)
const CommentSchema = Yup.object().shape({
    content: Yup.string()
        // .min(5, 'Kommentaren måste vara minst 5 tecken')
        .max(500, 'Kommentaren får inte vara längre än 500 tecken')
        .required('Kommentar krävs'),
});

// Add interface for comment form values (simplified)
interface CommentFormValues {
    content: string;
}

// Add UserProfile interface
interface UserProfile {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
}

// Update the helper function to be more strict
const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    if (url === 'about:///blank' || url === 'about:blank' || url === '') return false;
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
};

// Improve the getImageSource function with memory optimization
const getImageSource = (url: string | null | undefined, fallbackImage: any) => {
    if (!url || !isValidImageUrl(url)) {
        return {
            ...fallbackImage,
            style: {
                backgroundColor: myColors.baseColors.lightGray1,
                opacity: 0.7
            }
        };
    }
    // Add cache busting for problematic URLs if needed
    if (url.includes('placeholder') || url.includes('default')) {
        return { uri: `${url}?t=${Date.now()}` };
    }
    return { uri: url };
};

// Create a reusable image load handler
const handleImageLoad = () => {
    // Schedule image cache clearing after a short delay
    if (Platform.OS !== 'web') {
        setTimeout(() => {
            Image.clearMemoryCache();
        }, 300);
    }
};

// Custom fallback for broken images in HTML content
const HtmlImageFallback = () => (
    <RNView style={{
        width: 120,
        height: 120,
        backgroundColor: myColors.baseColors.lightGray1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: myColors.baseColors.lightGray2,
    }}>
        <Feather name="image" size={48} color={myColors.baseColors.lightGray3} />
    </RNView>
);

const BlogDetails = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [emailText, setEmailText] = useState('');
    const [commentsVisible, setCommentsVisible] = useState(true);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentSubmitted, setCommentSubmitted] = useState(false);

    // Ref for scrollView
    const scrollViewRef = useRef<ScrollView>(null);

    // State for handling replies
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    // This will store the Y position of the comment section
    let commentSectionY = 0;

    // Get authenticated user data
    const { user, isAuthenticated } = useAuth();

    // Setup keyboard listeners
    useEffect(() => {
        let isComponentMounted = true;

        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                if (!isComponentMounted) return;

                // Wait for keyboard animation to complete before scrolling
                setTimeout(() => {
                    if (!isComponentMounted) return;

                    if (commentSectionY > 0 && scrollViewRef.current) {
                        // Scroll to the comment section position with some additional offset
                        scrollViewRef.current.scrollTo({
                            y: commentSectionY - 100, // Add some offset to position it well
                            animated: true
                        });
                    } else {
                        // Fallback to scrolling to end if position isn't available
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                    }
                }, 200); // Slightly longer delay to ensure keyboard is fully shown
            }
        );

        return () => {
            isComponentMounted = false;
            keyboardDidShowListener.remove();

            // Clear scrollViewRef when component unmounts
            if (scrollViewRef.current) {
                // @ts-ignore - clear the reference to help GC
                scrollViewRef.current = null;
            }

            // Force image cache clearing on unmount
            Image.clearMemoryCache();
        };
    }, []);

    // Extract slug from parameters
    const slug = params.slug as string || '';

    // Fetch blog data using the hook with proper typing
    const { data: blogPost, isLoading, isError, refetch } = useBlogBySlug(slug) as {
        data: BlogPostResponse | undefined;
        isLoading: boolean;
        isError: boolean;
        refetch: () => void;
    };
    const postDetails = blogPost?.post;
    const blogComments = blogPost?.comments?.data || [];

    // Calculate total comments manually rather than using the utility function
    // This avoids the type compatibility issues
    const totalCommentsCount = useMemo(() => {
        if (!Array.isArray(blogComments)) return 0;
        return blogComments.length + blogComments.reduce((count, comment) =>
            count + (Array.isArray(comment.replies) ? comment.replies.length : 0), 0);
    }, [blogComments]);
    // // console.log("blogComments", JSON.stringify(blogComments, null, 2));
    // This will use actual data when available, fallback to defaults
    const title = postDetails?.title;
    const id = postDetails?.id;
    const image = postDetails?.featured_image || postDetails?.featuredImage; // Handle both camelCase and snake_case
    const category = postDetails?.categories?.[0] || "FORDONSINFORMATION";
    const date = postDetails ? new Date(postDetails.published_at).toLocaleString('sv-SE', {
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'long'
    }) : "11:47 e.m. onsdag";
    const likes = postDetails?.view_count?.toString();
    const author = postDetails?.author?.name;
    const content = postDetails?.content;

    // Use the dedicated hook for comment posting
    const postCommentMutation = usePostComment();

    const handleBack = () => {
        router.back();
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleShare = async () => {
        try {
            const url = `https://bilregistret.ai/blog/${postDetails?.slug || id}`;
            const title = postDetails?.title || "Bilregistret Blog Post";

            await Share.share(
                {
                    message: `${title}\n\n${url}`,
                    url: url, // iOS only, will be ignored on Android
                    title: title, // Android only, will be ignored on iOS
                },
                {
                    dialogTitle: `Dela: ${title}`, // Android only
                    subject: title, // iOS subject (optional)
                }
            );
        } catch (error) {
            showAlert({
                title: 'Fel',
                message: 'Något gick fel när artikeln delades.',
                type: 'error',
            });
            // console.error('Share error:', error);
        }
    };

    // Update user data handling in handleCommentSubmit
    const handleCommentSubmit = async (values: CommentFormValues, { resetForm }: { resetForm: () => void }) => {
        if (!postDetails?.id) {
            showAlert({
                title: 'Fel',
                message: 'Kan inte skicka kommentar utan bloggpost-ID',
                type: 'error',
            });
            return;
        }

        if (!isAuthenticated || !user) {
            showAlert({
                title: 'Log in Required',
                message: 'Du måste vara inloggad för att kommentera blogginlägg.',
                type: 'warning',
                positiveButton: {
                    text: 'Logga in',
                    onPress: () => router.push('/(auth)/login')
                }
            });
            return;
        }

        setIsSubmittingComment(true);
        Keyboard.dismiss();

        try {
            const userProfile = user as UserProfile;
            const authorName = userProfile.name || "Unknown User";
            const authorEmail = userProfile.email || "";

            const payload = {
                postId: postDetails.id,
                authorName,
                authorEmail,
                content: values.content.trim()
            };
            await postCommentMutation.mutateAsync(payload);

            showAlert({
                title: 'Tack!',
                message: 'Din kommentar har skickats för granskning.',
                type: 'success',
            });
            setCommentSubmitted(true);
            resetForm();

            refetch();
        } catch (error: any) {
            showAlert({
                title: 'Fel',
                message: error.message || 'Kan inte skicka kommentar. Försök igen.',
                type: 'error',
            });
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // Handle reply submission
    const handleReplySubmit = async (values: CommentFormValues, { resetForm }: { resetForm: () => void }) => {
        if (!postDetails?.id || !replyingTo) {
            showAlert({
                title: 'Fel',
                message: 'Kan inte skicka svar',
                type: 'error',
            });
            return;
        }

        if (!isAuthenticated || !user) {
            // Redirect to login instead of showing alert
            showAlert({
                title: 'Log in Required',
                message: 'Du måste vara inloggad för att svara på kommentarer.',
                type: 'warning',
                positiveButton: {
                    text: 'Logga in',
                    onPress: () => router.push('/(auth)/login')
                },
                negativeButton: {
                    text: 'Avbryt',
                    onPress: () => { }
                }
            });
            return;
        }

        setIsSubmittingReply(true);
        Keyboard.dismiss();

        try {
            // Get user details from the auth context
            const userData = user.user || user;
            const authorName = userData.name || "Unknown User";
            const authorEmail = userData.email || "";

            // // console.log("userData", JSON.stringify(userData, null, 2));

            const payload = {
                postId: postDetails.id,
                parentId: replyingTo.id,
                authorName,
                authorEmail,
                content: values.content.trim()
            };

            await postCommentMutation.mutateAsync(payload);

            resetForm();
            setReplyingTo(null);

            // Refresh comments data
            refetch();
        } catch (error: any) {
            showAlert({
                title: 'Fel',
                message: error.message || 'Kan inte skicka svar. Försök igen.',
                type: 'error',
            });
            // console.error('Reply submission error:', error);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    // Handle clicking reply button
    const handleReply = (comment: Comment) => {
        if (!isAuthenticated) {
            showAlert({
                title: 'Log in Required',
                message: 'Du måste vara inloggad för att svara på kommentarer.',
                type: 'warning',
                positiveButton: {
                    text: 'Logga in',
                    onPress: () => router.push('/(auth)/login')
                },
                negativeButton: {
                    text: 'Avbryt',
                    onPress: () => { }
                }
            });
            return;
        }
        setReplyingTo(comment);
    };

    // Cancel reply
    const cancelReply = () => {
        setReplyingTo(null);
    };

    const toggleCommentsVisibility = () => {
        setCommentsVisible(!commentsVisible);
    };

    const renderTocItem = ({ id, title }: TocItem) => (
        <View key={id} style={styles.tocItem}>
            <MyText style={styles.tocNumber}>{id}</MyText>
            <MyText style={styles.tocTitle}>{title}</MyText>
        </View>
    );

    const renderListItem = ({ id, title }: TocItem, iconName: string) => (
        <View key={id} style={styles.listItem}>
            <View style={styles.listItemNumberContainer}>
                <MyText style={styles.listItemNumber}>{id}</MyText>
            </View>
            <MyText style={styles.listItemText}>{title}</MyText>
        </View>
    );

    // Render a comment reply
    const renderReply = (reply: Comment) => {
        const replyDate = reply.createdAt ? new Date(reply.createdAt).toLocaleString('sv-SE', {
            hour: 'numeric',
            minute: 'numeric',
            weekday: 'long'
        }) : "";
        const replyUser = reply.User;

        return (
            <View key={reply.id} style={styles.replyItem}>
                <View style={styles.commentHeader}>
                    <View style={styles.commentAuthorContainer}>
                        <Image
                            source={getImageSource(replyUser?.profile_picture, ImagePath.userImage)}
                            style={styles.commentAuthorImage}
                            priority="high"
                            contentFit="fill"
                            cachePolicy="disk"
                            responsivePolicy='live'
                            onLoadEnd={handleImageLoad}
                        />
                        <View>
                            <MyText style={styles.commentAuthorName}>
                                {replyUser?.name || reply.authorName || "Unknown User"}
                            </MyText>
                            <MyText style={styles.commentDate}>{replyDate}</MyText>
                        </View>
                    </View>
                </View>
                <View style={styles.commentBody}>
                    <MyText style={styles.commentText}>{reply.content}</MyText>
                </View>
            </View>
        );
    };

    // Render a comment with its replies
    const renderComment = (comment: Comment) => {
        if (!comment) return null;

        const commentDate = comment.createdAt ? new Date(comment.createdAt).toLocaleString('sv-SE', {
            hour: 'numeric',
            minute: 'numeric',
            weekday: 'long'
        }) : "";
        const commentUser = comment.User;

        // Only show parent comments (not replies)
        if (comment.parentId !== null) {
            return null;
        }

        // Find all replies to this comment
        const replies = Array.isArray(comment.replies) ? comment.replies.reverse() : [];

        return (
            <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                    <View style={styles.commentAuthorContainer}>
                        <Image
                            source={getImageSource(commentUser?.profile_picture, ImagePath.userImage)}
                            style={styles.commentAuthorImage}
                            priority="high"
                            contentFit="cover"
                            cachePolicy="disk"
                            responsivePolicy='live'
                            onLoadEnd={handleImageLoad}
                        />
                        <View>
                            <MyText style={styles.commentAuthorName}>
                                {commentUser?.name || comment.authorName || "Unknown User"}
                            </MyText>
                            <MyText style={styles.commentDate}>{commentDate}</MyText>
                        </View>
                    </View>
                </View>
                <View style={styles.commentBody}>
                    <MyText style={styles.commentText}>{comment.content}</MyText>
                </View>

                {isAuthenticated && (
                    <TouchableOpacity
                        style={styles.replyButton}
                        onPress={() => handleReply(comment)}
                    >
                        <MyText style={styles.replyButtonText}>Reply</MyText>
                    </TouchableOpacity>
                )}

                {/* Show the reply form if replying to this comment */}
                {replyingTo?.id === comment.id && renderReplyForm()}

                {/* Show replies to this comment */}
                {replies.length > 0 && (
                    <View style={styles.repliesContainer}>
                        {replies.map(renderReply)}
                    </View>
                )}
            </View>
        );
    };

    // Render reply form
    const renderReplyForm = () => {
        if (!isAuthenticated) {
            return (
                <View style={styles.loginPromptContainer}>
                    <MyText style={styles.loginPromptText}>
                        Du måste vara inloggad för att svara
                    </MyText>
                    <MyButton
                        title="LOGGA IN"
                        onPress={() => router.push('/(auth)/login')}
                        buttonStyle={styles.loginButtonStyle}
                    />
                </View>
            );
        }

        return (
            <Formik
                initialValues={{ content: '' }}
                validationSchema={CommentSchema}
                onSubmit={handleReplySubmit}
            >
                {({ handleChange, handleSubmit, values, errors, touched, handleBlur }) => (
                    <View style={styles.replyFormContainer}>
                        {/* <MyText style={styles.replyToText}>
                            Svara till {replyingTo?.authorName || 'kommentar'}
                        </MyText> */}

                        <MyTextInput
                            label='Svar *'
                            placeholder="Ditt svar... *"
                            value={values.content}
                            onChangeText={handleChange('content')}
                            onBlur={handleBlur('content')}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            containerStyle={styles.replyInputContainer}
                            inputStyle={[styles.commentInput, styles.replyTextArea]}
                            error={touched.content ? errors.content : undefined}
                        />

                        <View style={styles.replyButtonsContainer}>
                            <TouchableOpacity
                                style={styles.cancelReplyButton}
                                onPress={cancelReply}
                            >
                                <MyText style={styles.cancelReplyText}>Avbryt</MyText>
                            </TouchableOpacity>
                            <MyButton
                                title={isSubmittingReply ? 'SKICKAR...' : 'SVARA'}
                                onPress={handleSubmit}
                                buttonStyle={styles.replySubmitButton}
                                textStyle={styles.replySubmitText}
                                {...(isSubmittingReply ? { disabled: true } : {})}
                            />
                        </View>
                    </View>
                )}
            </Formik>
        );
    };

    // Enhanced HTML content rendering config with semantic structure support
    const htmlConfig = {
        baseStyle: {
            fontSize: 15,
            lineHeight: 24,
            color: myColors.baseColors.light3,
            fontFamily: 'Inter',
            paddingHorizontal: isDesktopWeb() ? 30 : 15,
        },
        tagsStyles: {
            // Convert H1s in content to H2 styling to maintain proper hierarchy
            h1: {
                fontSize: 24,
                fontWeight: '600' as const,
                color: myColors.text.primary,
                marginBottom: 14,
                marginTop: 20,
                fontFamily: 'Poppins'
            },
            h2: {
                fontSize: 22,
                fontWeight: '600' as const,
                color: myColors.text.primary,
                marginBottom: 12,
                marginTop: 18,
                fontFamily: 'Poppins'
            },
            h3: {
                fontSize: 20,
                fontWeight: '600' as const,
                color: myColors.text.primary,
                marginBottom: 12,
                marginTop: 16,
                fontFamily: 'Poppins'
            },
            h4: {
                fontSize: 18,
                fontWeight: '600' as const,
                color: myColors.text.primary,
                marginBottom: 10,
                marginTop: 14,
                fontFamily: 'Poppins'
            },
            h5: {
                fontSize: 16,
                fontWeight: '600' as const,
                color: myColors.text.primary,
                marginBottom: 8,
                marginTop: 12,
                fontFamily: 'Poppins'
            },
            h6: {
                fontSize: 15,
                fontWeight: '600' as const,
                color: myColors.text.primary,
                marginBottom: 8,
                marginTop: 10,
                fontFamily: 'Poppins'
            },
            p: {
                fontSize: 15,
                lineHeight: 24,
                color: myColors.baseColors.light3,
                marginBottom: 12,
                fontFamily: 'Inter'
            },
            strong: {
                fontWeight: '600' as const,
                color: myColors.text.primary
            },
            em: {
                fontStyle: 'italic' as const,
                color: myColors.text.primary
            },
            ul: {
                marginBottom: 16
            },
            ol: {
                marginBottom: 16
            },
            li: {
                fontSize: 15,
                lineHeight: 22,
                marginBottom: 6,
                color: myColors.baseColors.light3
            },
            blockquote: {
                backgroundColor: 'rgba(79, 134, 247, 0.05)',
                borderLeftWidth: 4,
                borderLeftColor: myColors.primary.main,
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 12,
                paddingBottom: 12,
                marginBottom: 16,
                borderRadius: 4
            }
        }
    };

    // Update the logged in user display
    const renderCommentForm = () => {
        if (!isAuthenticated) {
            return (
                <View style={styles.loginToCommentContainer}>
                    <MyText style={styles.loginToCommentText}>
                        Logga in för att lämna en kommentar
                    </MyText>
                    <MyButton
                        title="LOGGA IN"
                        onPress={() => router.push('/(auth)/login')}
                        buttonStyle={styles.loginButton}
                    />
                </View>
            );
        }

        if (commentSubmitted) {
            return (
                <View style={styles.commentSubmittedContainer}>
                    <MyText style={styles.commentSubmittedText}>
                        Tack för din kommentar! Den har skickats för granskning.
                    </MyText>
                    <TouchableOpacity
                        onPress={() => setCommentSubmitted(false)}
                        style={styles.newCommentButton}
                    >
                        <MyText style={styles.newCommentButtonText}>Lägg till en ny kommentar</MyText>
                    </TouchableOpacity>
                </View>
            );
        }

        const userProfile = user as UserProfile;

        return (
            <Formik
                initialValues={{ content: '' }}
                validationSchema={CommentSchema}
                onSubmit={handleCommentSubmit}
            >
                {({ handleChange, handleSubmit, values, errors, touched, handleBlur }) => (
                    <View style={styles.commentInputContainer}>
                        <View style={styles.loggedInUserContainer}>
                            <Image
                                source={getImageSource(userProfile.profilePicture, ImagePath.userImage)}
                                style={styles.userAvatar}
                                priority="high"
                                contentFit="cover"
                                cachePolicy="disk"
                                responsivePolicy='live'
                                onLoadEnd={handleImageLoad}
                            />
                            <MyText style={styles.loggedInUserText}>
                                Kommentera som {userProfile.name || 'Användare'}
                            </MyText>
                        </View>

                        <MyTextInput
                            label='Kommentar *'
                            placeholder="Din kommentar... *"
                            value={values.content}
                            onChangeText={handleChange('content')}
                            onBlur={handleBlur('content')}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            containerStyle={styles.customInputContainer}
                            inputStyle={[styles.commentInput, styles.commentTextArea]}
                            error={touched.content ? errors.content : undefined}
                            onFocus={() => {
                                // Small delay to let the keyboard start appearing
                                setTimeout(() => {
                                    if (commentSectionY > 0 && scrollViewRef.current) {
                                        // Scroll to the comment section position with some additional offset
                                        scrollViewRef.current.scrollTo({
                                            y: commentSectionY - 100,
                                            animated: true
                                        });
                                    } else {
                                        // Fallback to scrolling to end
                                        scrollViewRef.current?.scrollToEnd({ animated: true });
                                    }
                                }, 100);
                            }}
                        />

                        <MyButton
                            title={isSubmittingComment ? 'SKICKAR...' : 'SKRIV EN KOMMENTAR'}
                            onPress={handleSubmit}
                            buttonStyle={styles.commentButtonStyle}
                            {...(isSubmittingComment ? { disabled: true } : {})}
                        />
                    </View>
                )}
            </Formik>
        );
    };

    // Optimize HTML rendering with memoization
    const memoizedHtmlContent = useMemo(() => {
        return { html: postDetails?.content || '' };
    }, [postDetails?.content]);

    // Improve the blog fetching with cancellation
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        // On component unmount, we'll clean up resources
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [slug]);

    // Add a comprehensive cleanup effect at the end of the component
    useEffect(() => {
        // Keep track of any timeouts
        const timeouts: NodeJS.Timeout[] = [];

        // Helper to create timeouts that we can track for cleanup
        const createCleanupTimeout = (callback: () => void, delay: number) => {
            const timeout = setTimeout(callback, delay);
            timeouts.push(timeout);
            return timeout;
        };

        // Proactively clear image cache periodically to prevent buildup
        const intervalId = setInterval(() => {
            if (Platform.OS !== 'web') {
                Image.clearMemoryCache();
            }
        }, 30000); // Every 30 seconds

        return () => {
            // Clear any tracked timeouts
            timeouts.forEach(clearTimeout);

            // Clear interval
            clearInterval(intervalId);

            // Force clear memory cache
            Image.clearMemoryCache();

            // Reset large objects that might cause memory leaks
            if (blogComments) {
                // @ts-ignore - helps garbage collection
                blogComments.length = 0;
            }

            // Force release of scroll view
            if (scrollViewRef.current) {
                // @ts-ignore
                scrollViewRef.current = null;
            }

            // Clear any large HTML content cache
            if (postDetails) {
                // @ts-ignore
                postDetails.content = null;
                // @ts-ignore
                postDetails.excerpt = null;
            }

            // Reset state to help GC
            setIsFavorite(false);
            setCommentText('');
            setEmailText('');
            setCommentsVisible(true);
            setIsSubmittingComment(false);
            setCommentSubmitted(false);
            setReplyingTo(null);
            setIsSubmittingReply(false);
        };
    }, []);

    // Render loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="dark-content" backgroundColor={myColors.white} />
                <Stack.Screen options={{ headerShown: false }} />
                <SimpleHeader title="Blogg" onBackPress={handleBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={myColors.primary.main} />
                    <MyText style={styles.loadingText}>Laddar blogg...</MyText>
                    <View style={styles.skeletonContainer}>
                        <View style={styles.skeletonTitle} />
                        <View style={styles.skeletonMeta} />
                        <View style={styles.skeletonImage} />
                        <View style={styles.skeletonTextLine} />
                        <View style={styles.skeletonTextLine} />
                        <View style={styles.skeletonTextLine} />
                        <View style={[styles.skeletonTextLine, { width: '70%' }]} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Render error state
    if (isError) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="dark-content" backgroundColor={myColors.white} />
                <Stack.Screen options={{ headerShown: false }} />
                <SimpleHeader title="Blogg" onBackPress={handleBack} />
                <View style={styles.errorContainer}>
                    <MyText style={styles.errorText}>Kunde inte ladda bloggen.</MyText>
                    <TouchableOpacity style={styles.retryButton} onPress={() => router.push('/(main)/blogg')}>
                        <MyText style={styles.retryText}>Gå tillbaka till bloggar</MyText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="dark-content" backgroundColor={myColors.white} />
                <Stack.Screen options={{ headerShown: false }} />

                {/* SEO Head Tags */}
                {postDetails && (
                    <BlogPostSEO
                        blogData={{
                            title: postDetails.title,
                            excerpt: postDetails.excerpt,
                            slug: postDetails.slug,
                            imageUrl: postDetails.featured_image || postDetails.featuredImage,
                            publishedAt: postDetails.published_at,
                            updatedAt: postDetails.updatedAt,
                            author: postDetails.author?.name,
                            category: postDetails.categories?.[0],
                            tags: postDetails.tags,
                            content: postDetails.content
                        }}
                    />
                )}

                {/* Using SimpleHeader component */}
                {!isDesktopWeb() && (
                    <SimpleHeader
                        title="Blogg"
                        onBackPress={handleBack}
                    />
                )}

                <FooterWrapper
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <DesktopViewWrapper>
                        <SemanticMain style={isDesktopWeb() ? StyleSheet.flatten([styles.mainContent, styles.desktopContent]) : styles.mainContent}>
                            <SemanticArticle
                                itemScope
                                itemType="https://schema.org/BlogPosting"
                                style={styles.articleContainer}
                            >
                                {/* Featured Image */}
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={getImageSource(image, ImagePath.emptyImage)}
                                        style={[
                                            styles.featuredImage,
                                            {
                                                width: isDesktopWeb() ? desktopWebViewport - 30 : width - 30,
                                                height: (isDesktopWeb() ? desktopWebViewport : width) * 0.45,
                                                marginTop: 30,
                                            }
                                        ]}
                                        priority="high"
                                        contentFit="cover"
                                        contentPosition="center"
                                        cachePolicy="disk"
                                        responsivePolicy='live'
                                        onLoadEnd={handleImageLoad}
                                        transition={200}
                                        // placeholder={ImagePath.emptyImage}
                                        placeholderContentFit="cover"
                                    />
                                </View>

                                {/* Article Header */}
                                <SemanticSection style={styles.articleHeader}>
                                    {/* Category and Actions */}
                                    <View style={styles.actionsContainer}>
                                        <View style={styles.dateContainer}>
                                            <SvgXml xml={ImagePath.SvgIcons.BlogCalendarIcon} />
                                            <MyText style={styles.dateText}>{date}</MyText>
                                        </View>
                                        <View style={styles.actionButtons}>
                                            <View style={styles.ViewSection}>
                                                <SvgXml xml={ImagePath.SvgIcons.ViewsEyeIcon} />
                                                <MyText style={styles.dateText}>{likes} views</MyText>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Article Title - Main H1 */}
                                    <View style={styles.titleContainer}>
                                        <H1
                                            id="article-title"
                                            style={styles.title}
                                            itemProp="headline"
                                        >
                                            {title}
                                        </H1>
                                    </View>

                                    {/* Author and Date */}
                                    <View style={styles.metaContainer}>
                                        <View style={styles.authorContainer}>
                                            <Image
                                                source={getImageSource(postDetails?.author?.profilePicture, ImagePath.userImage)}
                                                style={styles.authorImage}
                                                priority="high"
                                                contentFit="cover"
                                                cachePolicy="disk"
                                                responsivePolicy='live'
                                                onLoadEnd={handleImageLoad}
                                            />
                                            <P style={styles.authorName} itemProp="author">
                                                {author}
                                            </P>
                                        </View>
                                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                                            <SvgXml xml={ImagePath.SvgIcons.BlogShareIcon} />
                                        </TouchableOpacity>
                                    </View>
                                </SemanticSection>

                                {/* Article Content */}
                                <SemanticSection
                                    style={styles.contentContainer}
                                    ariaLabelledBy="article-title"
                                    itemProp="articleBody"
                                >
                                    {postDetails?.content ? (
                                        <RenderHtml
                                            contentWidth={isDesktopWeb() ? desktopWebViewport - 30 : width - 30}
                                            source={memoizedHtmlContent}
                                            baseStyle={htmlConfig.baseStyle}
                                            tagsStyles={htmlConfig.tagsStyles}
                                            renderersProps={{
                                                img: {
                                                    enableExperimentalPercentWidth: true,
                                                }
                                            }}
                                            defaultViewProps={{
                                                removeClippedSubviews: true
                                            }}
                                        />
                                    ) : (
                                        <P style={styles.contentText}>{postDetails?.excerpt}</P>
                                    )}
                                </SemanticSection>
                            </SemanticArticle>

                            {/* Comments Section */}
                            <SemanticAside
                                style={styles.commentsAside}
                                ariaLabelledBy="comments-title"
                                accessibilityLabel="Kommentarer och diskussion"
                            >
                                {/* Comments Section Header */}
                                <TouchableOpacity
                                    style={styles.commentsSectionHeader}
                                    onPress={toggleCommentsVisibility}
                                    activeOpacity={0.7}
                                >
                                    <H2
                                        id="comments-title"
                                        style={styles.commentsSectionTitle}
                                    >
                                        {`${totalCommentsCount} Kommentarer`}
                                    </H2>
                                    {/* <Entypo name={commentsVisible ? "chevron-thin-up" : "chevron-thin-down"} size={24} color={myColors.black} /> */}
                                    {commentsVisible ? <IconChevronUp
                                        color={myColors.black}
                                        size={24}
                                        style={{ marginRight: 10, marginLeft: 10 }}
                                    /> : <IconChevronDown
                                        color={myColors.black}
                                        size={24}
                                        style={{ marginRight: 10, marginLeft: 10 }}
                                    />}
                                </TouchableOpacity>

                                {/* Comments List */}
                                {commentsVisible && (
                                    <View style={styles.commentsContainer}>
                                        {Array.isArray(blogComments) ? blogComments
                                            .filter(comment => comment && comment.parentId === null) // Only show parent comments in the main list
                                            .map(renderComment) : null}
                                    </View>
                                )}

                                {/* Add Comment Section */}
                                <View
                                    style={styles.commentsSection}
                                    onLayout={(event: any) => {
                                        // Save the y position of this view for scrolling reference
                                        const layout = event.nativeEvent.layout;
                                        // We store the position for potential use
                                        commentSectionY = layout.y;
                                    }}
                                >
                                    <SemanticSection ariaLabelledBy="add-comment-title">
                                        {isAuthenticated && (
                                            <H3
                                                id="add-comment-title"
                                                style={styles.sectionTitle}
                                            >
                                                Skriv en kommentar
                                            </H3>
                                        )}
                                        {renderCommentForm()}
                                    </SemanticSection>
                                </View>
                            </SemanticAside>

                            {/* Spacing for bottom */}
                            <View style={styles.bottomSpacing} />
                        </SemanticMain>
                    </DesktopViewWrapper>
                </FooterWrapper>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    featuredImage: {
        borderRadius: 10,
        backgroundColor: myColors.baseColors.lightGray1,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    categoryPill: {
        position: 'absolute',
        bottom: 10,
        right: 25,
        backgroundColor: myColors.baseColors.light5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
    },
    categoryText: {
        color: myColors.white,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        height: 30,
        width: 30,
        borderRadius: 20,
        backgroundColor: myColors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        marginLeft: 15,
        padding: 5,
    },
    ViewSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        padding: 5,
    },
    titleContainer: {
        paddingHorizontal: 15,
        paddingTop: 5,
    },
    title: {
        fontSize: 24,
        color: myColors.text.primary,
        lineHeight: 30,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: myColors.screenBackgroundColor
    },
    authorName: {
        fontSize: 12,
        color: myColors.baseColors.light2,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: myColors.baseColors.light2,
        marginLeft: 5,
    },
    contentContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    contentText: {
        fontSize: 15,
        lineHeight: 24,
        color: myColors.baseColors.light3,
    },
    sectionContainer: {
        paddingHorizontal: 15,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        color: myColors.text.primary,
        marginBottom: 15,
    },
    tocContainer: {
        backgroundColor: 'rgba(79, 134, 247, 0.05)',
        borderRadius: 10,
        padding: 15,
    },
    tocItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    tocNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: myColors.primary.main,
        width: 25,
    },
    tocTitle: {
        fontSize: 15,
        color: myColors.text.primary,
        flex: 1,
    },
    listContainer: {
        marginTop: 5,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    listItemNumberContainer: {
        width: 25,
        height: 25,
        borderRadius: 15,
        backgroundColor: myColors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: 3,
    },
    listItemNumber: {
        color: myColors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    listItemText: {
        fontSize: 15,
        color: myColors.text.primary,
        flex: 1,
        lineHeight: 22,
    },
    commentsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: myColors.baseColors.lightGray1,
    },
    commentsSectionTitle: {
        fontSize: 18,
        color: myColors.text.primary,
    },
    commentsContainer: {
        paddingHorizontal: 15,
    },
    commentItem: {
        paddingVertical: 15,
        backgroundColor: myColors.white,
        paddingHorizontal: 20,
        marginVertical: 7,
        borderRadius: 10,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    commentAuthorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentAuthorImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentAuthorName: {
        fontSize: 16,
        color: myColors.text.primary,
    },
    commentDate: {
        fontSize: 12,
        color: myColors.text.secondary,
        // marginTop: 5,
    },
    commentBody: {
        marginBottom: 10,
    },
    commentText: {
        fontSize: 15,
        lineHeight: 24,
        color: myColors.baseColors.light3,
    },
    replyButton: {
        alignSelf: 'flex-start',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(79, 134, 247, 0.1)',
    },
    replyButtonText: {
        fontSize: 13,
        color: myColors.primary.main,
        fontWeight: '600',
    },
    repliesContainer: {
        marginLeft: 20,
        marginTop: 10,
        borderLeftWidth: 2,
        borderLeftColor: myColors.baseColors.lightGray1,
        paddingLeft: 15,
    },
    replyItem: {
        // paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(79, 134, 247, 0.05)',
        marginVertical: 5,
        borderRadius: 8,
    },
    replyFormContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'rgba(79, 134, 247, 0.05)',
        borderRadius: 10,
    },
    replyToText: {
        fontSize: 14,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: 10,
    },
    replyInputContainer: {
        marginBottom: 10,
    },
    replyTextArea: {
        minHeight: 50,
    },
    replyButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        // marginTop: 10,
    },
    cancelReplyButton: {
        // paddingVertical: 8,
        // paddingHorizontal: 15,
        // borderWidth: 1,
        // borderColor: myColors.baseColors.lightGray1,
        // borderRadius: 5,
        marginRight: 10,
        marginTop: 7,
    },
    cancelReplyText: {
        fontSize: 14,
        color: myColors.black,
    },
    replySubmitButton: {
        paddingHorizontal: 10,
        height: 20,
    },
    replySubmitText: {
        fontSize: 12,
        color: myColors.white,
    },
    commentButtonStyle: {
        marginTop: 20,
        marginBottom: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: myColors.text.secondary,
    },
    skeletonContainer: {
        width: '100%',
        marginTop: 20,
        padding: 15,
    },
    skeletonTitle: {
        height: 30,
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
        marginBottom: 15,
    },
    skeletonMeta: {
        height: 20,
        width: '60%',
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
        marginBottom: 15,
    },
    skeletonImage: {
        height: 200,
        backgroundColor: '#E1E9EE',
        borderRadius: 10,
        marginBottom: 20,
    },
    skeletonTextLine: {
        height: 15,
        backgroundColor: '#E1E9EE',
        borderRadius: 4,
        marginBottom: 10,
        width: '100%',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: myColors.error,
        marginBottom: 20,
    },
    retryButton: {
        padding: 15,
        backgroundColor: myColors.primary.main,
        borderRadius: 8,
    },
    retryText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    commentSubmittedContainer: {
        backgroundColor: 'rgba(79, 134, 247, 0.1)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    commentSubmittedText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
        color: myColors.text.primary,
    },
    newCommentButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: myColors.black,
        borderRadius: 5,
    },
    newCommentButtonText: {
        color: myColors.white,
        fontSize: 14,
        fontWeight: '500',
    },
    loginPromptContainer: {
        backgroundColor: 'rgba(79, 134, 247, 0.1)',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    loginPromptText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
        color: myColors.text.primary,
    },
    loginButtonStyle: {
        width: 300,
    },
    loggedInUserContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: 'rgba(79, 134, 247, 0.05)',
        borderRadius: 10,
    },
    userAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    loggedInUserText: {
        fontSize: 14,
        color: myColors.text.secondary,
    },
    commentsSection: {
        paddingHorizontal: 15,
        paddingTop: 30,
    },
    commentInputContainer: {
        marginTop: 10,
    },
    customInputContainer: {
        marginBottom: 15,
    },
    commentInput: {
        borderColor: myColors.baseColors.lightGray1,
        backgroundColor: myColors.white,
    },
    commentTextArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    bottomSpacing: {
        height: 40,
    },
    loginToCommentContainer: {
        padding: 16,
        backgroundColor: myColors.screenBackgroundColor,
        borderRadius: 8,
        marginVertical: 16,
        alignItems: 'center',
    },
    loginToCommentText: {
        fontSize: 16,
        marginBottom: 12,
    },
    loginToCommentButton: {
        backgroundColor: myColors.primary.main,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    loginToCommentButtonText: {
        color: myColors.white,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: myColors.black,
        paddingHorizontal: 30,
        width: 300,
    },
    mainContent: {
        flex: 1,
    },
    desktopContent: {
        marginBottom: 30,
    },
    articleContainer: {
        // backgroundColor: myColors.white,
        borderRadius: isDesktopWeb() ? 12 : 0,
        marginBottom: 20,
        overflow: 'hidden',
    },
    articleHeader: {
        paddingBottom: 0,
    },
    commentsAside: {
        backgroundColor: isDesktopWeb() ? myColors.white : myColors.screenBackgroundColor,
        borderRadius: isDesktopWeb() ? 12 : 0,
        paddingTop: 20,
    },
});

export default BlogDetails;