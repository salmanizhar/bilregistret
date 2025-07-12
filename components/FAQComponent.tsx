import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Animated,
    ActivityIndicator,
    Easing
} from 'react-native';
import { FAQData } from '@/constants/commonConst';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { myColors } from '@/constants/MyColors';
import MyText from './common/MyText';
import { IconChevronDown, IconChevronUp } from '@/assets/icons';
import { useSectionState } from '@/Services/api/hooks/sectionState.hooks';
import { P } from './common/SemanticText';

interface FAQItem {
    id: number;
    category?: string;
    question: string;
    answer: string;
}

interface FAQComponentProps {
    searchQuery?: string;
    selectedCategory?: string;
    showSearch?: boolean;
    showTitle?: boolean;
    instantRender?: boolean;
}

// TextContentRow component - styled like VehicleInfoRow but for text content
interface TextContentRowProps {
    content: string;
    isAlternate?: boolean;
}

const TextContentRow = React.memo<TextContentRowProps>(({ content, isAlternate = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <View style={{ width: '100%' }}>
            <View
                style={[{
                    paddingVertical: isDesktopWeb() ? 12 : 8,
                    paddingHorizontal: isDesktopWeb() ? 20 : 16,
                    alignSelf: 'center',
                    width: isDesktopWeb() ? '95%' : '92%',
                    borderRadius: 5,
                    backgroundColor: isDesktopWeb() ? '#F5F8FA' : (isAlternate ? '#F5F8FA' : '#F5F8FA'), // Keep baby blue on hover
                }]}
                {...(isDesktopWeb() ? {
                    onMouseEnter: () => setIsHovered(true),
                    onMouseLeave: () => setIsHovered(false)
                } : {})}
            >
                <P style={{
                    fontSize: isDesktopWeb() ? 16 : 14,
                    fontWeight: isDesktopWeb() ? '400' : '400',
                    color: myColors.text.primary,
                }}>
                    {content}
                </P>
            </View>
        </View>
    );
});

// Helper function to clean up FAQ content that might have embedded Q&A
const cleanFAQContent = (content: string): string => {
    // Split by double newlines to get paragraphs
    const paragraphs = content.split('\n\n').map(p => p.trim()).filter(p => p);

    // Filter out paragraphs that look like questions (end with ?)
    const answerParagraphs = paragraphs.filter(paragraph => {
        // Remove lines that are clearly questions (end with ? and are short)
        const lines = paragraph.split('\n').map(line => line.trim());
        return !lines.some(line =>
            line.endsWith('?') &&
            line.length < 100 &&
            line.split(' ').length < 15
        );
    });

    return answerParagraphs.join('\n\n');
};

// FAQ Section component - using the exact same design as VehicleInformationSection
interface FAQSectionProps {
    title: string;
    content: string;
    isExpanded: boolean;
    toggleExpand: () => void;
    instantRender?: boolean;
}

const FAQSection = React.memo<FAQSectionProps>(({
    title,
    content,
    isExpanded,
    toggleExpand,
    instantRender = false
}) => {
    const { isOpen: sectionExpanded, isLoading, toggleState } = useSectionState({
        sectionKey: `faq_section_${title}`,
        defaultState: isExpanded,
        dataVersion: '1.0',
        hasContent: !!content,
        isSearching: isExpanded
    });

    // Use local state to control the expanded state and avoid timing issues
    const [expanded, setExpanded] = useState(isExpanded);
    const [isInitialized, setIsInitialized] = useState(false);

    // Calculate proper alignment for the final orange bar position
    const headerPadding = isDesktopWeb() ? 22 : 12;
    const textLineHeight = isDesktopWeb() ? 24 : 19; // Approximate line height for the font sizes
    const textOffset = Math.floor(textLineHeight * 0.15) - 4; // Adjust 3px higher to align with text
    const orangeBarTop = headerPadding + textOffset; // Where the orange bar should sit
    const orangeBarHeight = 30; // Small orange bar height
    const fullCardHeight = 100; // Full blue bar height (covers whole card)

    // Initialize animation values - start with collapsed state (full height, top 0, blue)
    const barHeightAnim = useRef(new Animated.Value(fullCardHeight)).current;
    const barTopAnim = useRef(new Animated.Value(0)).current;
    const barColorAnim = useRef(new Animated.Value(1)).current; // 1 = blue (collapsed)
    const chevronRotateAnim = useRef(new Animated.Value(1)).current; // 1 = down arrow

    // Sync with section state when it changes - but don't set initial immediately
    useEffect(() => {
        if (!isLoading) {
            if (!isInitialized) {
                setIsInitialized(true);
                // Set the correct initial state immediately without animation on first load
                const initialExpanded = sectionExpanded;
                setExpanded(initialExpanded);

                // Set values immediately for first render to prevent flash
                barHeightAnim.setValue(initialExpanded ? orangeBarHeight : fullCardHeight);
                barTopAnim.setValue(initialExpanded ? orangeBarTop : 0);
                barColorAnim.setValue(initialExpanded ? 0 : 1);
                chevronRotateAnim.setValue(initialExpanded ? 0 : 1);
            } else {
                // After initialization, update with animation
                setExpanded(sectionExpanded);
            }
        }
    }, [sectionExpanded, isLoading, isInitialized]);

    // Handle animated transitions when expanded state changes (only after initialization)
    useEffect(() => {
        if (!isInitialized) return;

        const duration = 250;
        const easing = Easing.out(Easing.cubic);

        Animated.parallel([
            Animated.timing(barHeightAnim, {
                toValue: expanded ? orangeBarHeight : fullCardHeight,
                duration,
                easing,
                useNativeDriver: false,
            }),
            Animated.timing(barTopAnim, {
                toValue: expanded ? orangeBarTop : 0,
                duration,
                easing,
                useNativeDriver: false,
            }),
            Animated.timing(barColorAnim, {
                toValue: expanded ? 0 : 1,
                duration,
                easing,
                useNativeDriver: false,
            }),
            Animated.timing(chevronRotateAnim, {
                toValue: expanded ? 0 : 1,
                duration: 200,
                easing,
                useNativeDriver: true,
            }),
        ]).start();
    }, [expanded, isInitialized]);

    // Interpolate color animation
    const barBackgroundColor = barColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#e77832', myColors.primary.main], // Orange when expanded, blue when collapsed
    });

    const chevronRotation = chevronRotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-90deg'],
    });

    // Handle press
    const handlePress = () => {
        toggleState();
    };

    if (isLoading && !instantRender) {
        return (
            <View style={[
                styles.faqSectionAnimated,
                {
                    marginBottom: 1,
                    borderRadius: 8,
                    backgroundColor: myColors.white,
                    overflow: 'hidden',
                },
                isDesktopWeb() && styles.faqSectionDesktop
            ]}>
                <View style={styles.faqSectionHeader}>
                    <View style={{ flex: 1 }}>
                        <MyText style={styles.faqSectionTitle}>{title}</MyText>
                    </View>
                    <ActivityIndicator size="small" color={myColors.text.primary} />
                </View>
            </View>
        );
    }

    // Split content into paragraphs for better formatting
    const cleanedContent = cleanFAQContent(content);
    const contentParagraphs = cleanedContent.split('\n\n').filter(paragraph => paragraph.trim());

    return (
        <View style={[
            styles.faqSectionAnimated,
            {
                marginBottom: 1,
                borderRadius: 8,
                backgroundColor: myColors.white,
                overflow: 'hidden',
            },
            isDesktopWeb() && styles.faqSectionDesktop
        ]}>
            {/* Animated decorative bar - only render when initialized */}
            {isInitialized && (
                <Animated.View
                    style={[
                        styles.animatedDecorativeBar,
                        {
                            height: barHeightAnim,
                            top: barTopAnim,
                            backgroundColor: barBackgroundColor,
                        },
                    ]}
                />
            )}

            <TouchableOpacity
                style={styles.faqSectionHeader}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <View style={{ flex: 1 }}>
                    <MyText style={styles.faqSectionTitle}>{title}</MyText>
                </View>
                {isInitialized && (
                    <Animated.View
                        style={{
                            transform: [{ rotate: chevronRotation }],
                        }}
                    >
                        <IconChevronDown
                            size={26}
                            color={myColors.text.primary}
                        />
                    </Animated.View>
                )}
            </TouchableOpacity>

            {expanded && (
                <View style={{ width: '100%', marginBottom: isDesktopWeb() ? 28 : 18 }}>
                    {contentParagraphs.map((paragraph, index) => (
                        <TextContentRow
                            key={index}
                            content={paragraph}
                            isAlternate={index % 2 === 0}
                        />
                    ))}
                </View>
            )}
        </View>
    );
});

const FAQComponent: React.FC<FAQComponentProps> = ({
    searchQuery = '',
    selectedCategory = 'Alla kategorier',
    showSearch = false,
    showTitle = false,
    instantRender = false
}) => {
    // Filter FAQ based on search and category
    const filteredFAQ = useMemo(() => {
        return FAQData.filter((item: FAQItem) => {
            const matchesSearch = !searchQuery ||
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === 'Alla kategorier' ||
                item.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    return (
        <View style={styles.container}>
            {/* FAQ Title - Only show if showTitle prop is true */}
            {showTitle && (
                <MyText fontFamily="Poppins" style={styles.faqTitle}>
                    FAQ Biluppgifter
                </MyText>
            )}

            {/* Main FAQ Container - Parent container with background color */}
            <View style={styles.faqContainer}>
                <View style={styles.faqMobileContainer}>
                    {filteredFAQ.length === 0 ? (
                        <View style={styles.noResultsContainer}>
                            <MyText style={styles.noResultsIcon}>🔍</MyText>
                            <MyText fontFamily="Poppins" style={styles.noResultsText}>
                                Inga FAQ-frågor hittades för din sökning.
                            </MyText>
                            <MyText fontFamily="Inter" style={styles.noResultsSubText}>
                                Prova att söka med andra nyckelord eller välj en annan kategori.
                            </MyText>
                        </View>
                    ) : (
                        filteredFAQ.map((item: FAQItem) => (
                            <View
                                key={item.id}
                                style={styles.faqMobileCard}
                            >
                                <FAQSection
                                    title={item.question}
                                    content={item.answer}
                                    isExpanded={!!searchQuery} // Expand if there's a search query
                                    toggleExpand={() => { }}
                                    instantRender={instantRender}
                                />
                            </View>
                        ))
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        position: 'relative',
    },

    // FAQ Title - Matching original design
    faqTitle: {
        fontSize: isDesktopWeb() ? 36 : 28,
        lineHeight: isDesktopWeb() ? 50 : 38,
        color: '#262524',
        fontWeight: '400',
        textAlign: 'center',
        marginBottom: isDesktopWeb() ? 55 : 40,
        paddingHorizontal: isDesktopWeb() ? 20 : 16,
    },

    // Main Container - Parent container with background color like biluppgifterDetails
    faqContainer: {
        backgroundColor: myColors.screenBackgroundColor, // Same as biluppgifterDetails
        borderRadius: 10,
        marginHorizontal: isDesktopWeb() ? 0 : 0, // Remove horizontal margin on mobile
        minHeight: isDesktopWeb() ? 400 : 300,
        padding: isDesktopWeb() ? 15 : 10, // Add padding for the container
    },

    // Mobile container - same as vehicleInfoMobileContainer
    faqMobileContainer: {
        flexDirection: 'column',
        width: '100%',
    },

    // Mobile card - same as vehicleInfoMobileCard
    faqMobileCard: {
        width: '100%',
        marginBottom: 10,
    },

    // FAQ Section styles - exactly matching VehicleInformationSection
    faqSectionAnimated: {
        overflow: 'hidden',
        borderLeftWidth: 0, // Remove the default border since we have the animated bar
    },

    faqSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isDesktopWeb() ? 22 : 12,
    },

    faqSectionTitle: {
        fontSize: isDesktopWeb() ? 20 : 16,
        color: myColors.text.primary,
        fontWeight: '500',
    },

    faqSectionDesktop: {
        marginBottom: 1,
        borderRadius: 8,
        backgroundColor: myColors.white,
        overflow: 'hidden',
    },

    // Animated decorative bar - exactly matching the original
    animatedDecorativeBar: {
        position: 'absolute',
        left: 0,
        width: isDesktopWeb() ? 5 : 3,
        zIndex: 9,
    },

    // No Results State
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: isDesktopWeb() ? 80 : 60,
        paddingHorizontal: 24,
        backgroundColor: myColors.white,
        borderRadius: 8,
        marginBottom: 10,
    },
    noResultsIcon: {
        fontSize: isDesktopWeb() ? 64 : 48,
        marginBottom: isDesktopWeb() ? 24 : 16,
        opacity: 0.6,
    },
    noResultsText: {
        fontSize: isDesktopWeb() ? 22 : 18,
        fontWeight: '600',
        color: '#181818',
        textAlign: 'center',
        marginBottom: 8,
    },
    noResultsSubText: {
        fontSize: isDesktopWeb() ? 16 : 15,
        color: '#687693',
        textAlign: 'center',
        lineHeight: isDesktopWeb() ? 24 : 22,
        maxWidth: 300,
    },
});

export default FAQComponent;