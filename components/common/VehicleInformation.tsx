import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Animated,
    Easing,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { router } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { useSectionState } from '@/Services/api/hooks/sectionState.hooks';
import { CarSearchData } from '@/Services/api/types/car.types';

// Types
interface VehicleInfoRowProps {
    label: string;
    value: string | string[];
    isAlternate?: boolean;
}

interface VehicleInformationSectionProps {
    title: string;
    icon: string;
    isExpanded: boolean;
    toggleExpand: () => void;
    children?: React.ReactNode;
}

interface VehicleInformationProps {
    vehicleData: CarSearchData | undefined;
    title?: string;
    initiallyOpen?: boolean;
    showSearchBar?: boolean;
    searchPlaceholder?: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// ProductSearchBar component
const ProductSearchBar: React.FC<{
    placeholder: React.ReactNode;
    value: string;
    onChangeText: (text: string) => void;
    style?: any;
}> = ({ placeholder, value, onChangeText, style }) => {
    return (
        <View style={[{
            marginBottom: 15,
        }, style]}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: myColors.productBackgroundGrey,
                borderRadius: 8,
                paddingHorizontal: 15,
                height: 45,
                borderWidth: 0,
            }}>
                <Ionicons name="search" size={22} color={myColors.white} style={{ marginRight: 10 }} />
                {value === '' && (
                    <View style={{ position: 'absolute', left: 45, right: 15, top: 0, bottom: 0, justifyContent: 'center' }}>
                        {typeof placeholder === 'string' ? (
                            <MyText style={{ color: myColors.white, fontSize: 13, fontWeight: 'bold' }}>{placeholder}</MyText>
                        ) : (
                            placeholder
                        )}
                    </View>
                )}
                <TextInput
                    style={{
                        flex: 1,
                        height: '100%',
                        fontSize: 13,
                        fontWeight: 'bold',
                        color: myColors.white,
                    }}
                    value={value}
                    onChangeText={onChangeText}
                    placeholderTextColor={myColors.white}
                />
                {value.length > 0 && (
                    <TouchableOpacity onPress={() => onChangeText('')}>
                        <Ionicons name="close-circle" size={20} color={myColors.white} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// VehicleInfoRow component
const VehicleInfoRow = React.memo<VehicleInfoRowProps>(({ label, value, isAlternate = false }) => {
    const LoginButtonKeyMapper = "guest_login";

    // Handle array values by joining them with commas
    const displayValue = Array.isArray(value) ? value.join(', ') : value;

    return (
        <View style={[{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 5,
            width: '100%',
        }, isAlternate && { backgroundColor: '#F5F8FA' }]}>
            <MyText style={{
                fontSize: 12,
                fontWeight: '600',
                color: myColors.text.primary,
                flexShrink: 1,
                marginRight: 8,
                width: '70%',
            }}>{label}</MyText>
            {displayValue === LoginButtonKeyMapper ?
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                    <MyText style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: myColors.primary.main,
                        textAlign: 'right',
                        flex: 1,
                    }}>{"Logga In"}</MyText>
                </TouchableOpacity>
                :
                <MyText style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: myColors.text.primary,
                    textAlign: 'right',
                    flex: 1,
                    flexWrap: 'wrap',
                }}>{displayValue}</MyText>
            }
        </View>
    );
});

// VehicleInformationSection component
const VehicleInformationSection = React.memo<VehicleInformationSectionProps>(({
    title,
    icon,
    isExpanded,
    toggleExpand,
    children
}) => {
    const { isOpen: expanded, isLoading, toggleState } = useSectionState({
        sectionKey: `vehicle_info_section_${title}`,
        defaultState: isExpanded,
        dataVersion: '1.0'
    });

    if (isLoading) {
        return (
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <View style={{ flex: 1 }}>
                        <MyText style={styles.sectionTitle}>{title}</MyText>
                    </View>
                    <ActivityIndicator size="small" color={myColors.text.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.sectionContainer}>
            <TouchableOpacity
                style={styles.sectionHeader}
                onPress={toggleState}
                activeOpacity={0.7}
            >
                <View style={{ flex: 1 }}>
                    <MyText style={styles.sectionTitle}>{title}</MyText>
                </View>
                <Entypo
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={myColors.text.primary}
                />
            </TouchableOpacity>

            {expanded && (
                <View style={{ width: '100%' }}>
                    {children}
                </View>
            )}
        </View>
    );
});

// Main VehicleInformation component
const VehicleInformation: React.FC<VehicleInformationProps> = ({
    vehicleData,
    title = "Fordonsinformation",
    initiallyOpen = true,
    showSearchBar = true,
    searchPlaceholder = "Sök specifikt Modell..."
}) => {
    const [infoSearchInputText, setInfoSearchInputText] = useState("");
    const infoSearchQuery = useDebounce(infoSearchInputText, 100);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [dataLoaded, setDataLoaded] = useState(false);

    // Add animated transition when data loads
    useEffect(() => {
        if (vehicleData?.car && !dataLoaded) {
            setDataLoaded(true);
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                    easing: Easing.out(Easing.cubic)
                }).start();
            }, 50);
        }
    }, [vehicleData]);

    // Filter vehicles sections based on search while preserving order
    const filteredSections = useMemo(() => {
        if (!vehicleData?.car) {
            return [];
        }

        // If no search query, return all sections in original order
        if (!infoSearchQuery) {
            return Array.isArray(vehicleData.car)
                ? vehicleData.car
                : (typeof vehicleData.car === 'object' ? [vehicleData.car] : []);
        }

        const query = infoSearchQuery.toLowerCase();
        const sectionsArray = Array.isArray(vehicleData.car)
            ? vehicleData.car
            : (typeof vehicleData.car === 'object' ? [vehicleData.car] : []);

        // Filter sections while preserving order
        return sectionsArray.filter((section: any) => {
            if (!section) return false;

            // Check section title
            if (section.title && typeof section.title === 'string' &&
                section.title.toLowerCase().includes(query)) {
                return true;
            }

            // Check all data fields while preserving their order
            if (section.data && typeof section.data === 'object') {
                const hasMatchingData = Object.entries(section.data).some(([key, value]) => {
                    const keyMatch = key.toLowerCase().includes(query);
                    const valueMatch = String(value).toLowerCase().includes(query);
                    return keyMatch || valueMatch;
                });
                if (hasMatchingData) return true;
            }

            return false;
        });
    }, [vehicleData, infoSearchQuery]);

    // Render content from API data
    const renderApiContent = () => {
        try {
            if (!vehicleData?.car) {
                return (
                    <>
                        {Array(3).fill(null).map((_, index) => (
                            <View
                                key={index}
                                style={styles.loadingSectionContainer}
                            >
                                <View style={styles.loadingSectionContent}>
                                    <View style={[styles.placeholder, { width: '60%', height: 18 }]} />
                                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: myColors.border.light }} />
                                </View>
                            </View>
                        ))}
                    </>
                );
            }

            return (
                <Animated.View style={{ opacity: fadeAnim }}>
                    {filteredSections.map((section: any, index: number) => {
                        if (!section || typeof section !== 'object') return null;

                        const sectionTitle = typeof section.title === 'string' ? section.title : `Section ${index}`;
                        const icon = section.icon || '';
                        const shouldExpand = !!infoSearchQuery;

                        return (
                            <VehicleInformationSection
                                key={index}
                                title={sectionTitle}
                                icon={icon}
                                isExpanded={shouldExpand}
                                toggleExpand={() => { }}
                            >
                                {section.data && typeof section.data === 'object' ? (
                                    // Preserve the order of data fields by using Object.entries
                                    Object.entries(section.data).map(([key, value], idx) => {
                                        if (Array.isArray(value)) {
                                            return value.map((item, itemIdx) => {
                                                // Calculate the running count for proper alternation
                                                const runningCount = Object.entries(section.data)
                                                    .slice(0, idx)
                                                    .reduce((count, [_, val]) => {
                                                        return count + (Array.isArray(val) ? val.length : 1);
                                                    }, 0) + itemIdx;

                                                return (
                                                    <VehicleInfoRow
                                                        key={`${idx}-${itemIdx}`}
                                                        label={key || ''}
                                                        value={item != null ? String(item) : ''}
                                                        isAlternate={runningCount % 2 === 0}
                                                    />
                                                );
                                            });
                                        }
                                        // Calculate the running count for non-array values
                                        const runningCount = Object.entries(section.data)
                                            .slice(0, idx)
                                            .reduce((count, [_, val]) => {
                                                return count + (Array.isArray(val) ? val.length : 1);
                                            }, 0);

                                        return (
                                            <VehicleInfoRow
                                                key={idx}
                                                label={key || ''}
                                                value={value != null ? String(value) : ''}
                                                isAlternate={runningCount % 2 === 0}
                                            />
                                        );
                                    })
                                ) : (
                                    <MyText style={styles.noDataText}>
                                        Ingen information tillgänglig.
                                    </MyText>
                                )}
                            </VehicleInformationSection>
                        );
                    })}

                    {filteredSections.length === 0 && (
                        <View style={styles.noResultsContainer}>
                            <MyText style={styles.noResultsText}>
                                Inga resultat för "{infoSearchQuery}"
                            </MyText>
                        </View>
                    )}
                </Animated.View>
            );
        } catch (error) {
            return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {showSearchBar && (
                    <ProductSearchBar
                        placeholder={searchPlaceholder}
                        value={infoSearchInputText}
                        onChangeText={setInfoSearchInputText}
                    />
                )}
                {renderApiContent()}
            </View>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        marginTop: 5,
    },
    sectionContainer: {
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: myColors.white,
        overflow: 'hidden',
        borderLeftWidth: 3,
        borderColor: myColors.primary.main,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        color: myColors.text.primary,
        fontWeight: '500',
    },
    loadingSectionContainer: {
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: myColors.white,
        overflow: 'hidden',
        borderLeftWidth: 3,
        borderColor: myColors.primary.main,
        height: 130,
    },
    loadingSectionContent: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    placeholder: {
        backgroundColor: myColors.border.light,
        borderRadius: 4,
    },
    noDataText: {
        padding: 16,
        fontSize: 14,
        color: myColors.text.primary,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    noResultsContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noResultsText: {
        fontSize: 14,
        color: myColors.text.secondary,
    },
});

export default VehicleInformation;