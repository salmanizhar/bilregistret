import React from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Animated } from 'react-native';
import MyText from './MyText';
import { myColors } from '@/constants/MyColors';
import { SvgXml } from 'react-native-svg';
import { DangerIcon } from '@/assets/images/SvgIcons';
import { useSimilarCars } from '@/Services/api/hooks/carSearch.hooks';
import { useRouter } from 'expo-router';
import { isDesktopWeb } from '@/utils/deviceInfo';

const { width } = Dimensions.get('window');

interface NoResultsComponentProps {
    regNr: string;
}

const NoResultsComponent = React.memo<NoResultsComponentProps>(({ regNr }) => {
    const router = useRouter();
    const { data, isLoading } = useSimilarCars(regNr);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (isLoading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [isLoading]);

    const handleSimilarCarPress = (similarRegNr: string) => {
        router.push({
            pathname: '/(main)/biluppgifter/[regnr]',
            params: { regnr: similarRegNr.replace(/\s+/g, "") }
        });
    };

    const containerStyle = isDesktopWeb() ? styles.noResultsContainerDesktop : styles.noResultsContainer;
    const errorSectionStyle = isDesktopWeb() ? styles.errorSectionDesktop : styles.errorSection;
    const suggestionsStyle = isDesktopWeb() ? styles.suggestionsContainerDesktop : styles.suggestionsContainer;

    return (
        <View style={containerStyle}>
            <View style={errorSectionStyle}>
                <View style={styles.errorBackground} />
                <View style={styles.errorIcon}>
                    <SvgXml xml={DangerIcon} />
                </View>
                <MyText style={styles.errorText}>Inga sökträffar hittade</MyText>
            </View>

            {isLoading ? (
                <View style={suggestionsStyle}>
                    <Animated.Text style={[styles.suggestionsTitle, { opacity: fadeAnim }]}>
                        Laddar liknande bilar...
                    </Animated.Text>
                </View>
            ) : data?.similarCars && data.similarCars.length > 0 ? (
                <View style={suggestionsStyle}>
                    <MyText style={styles.suggestionsTitle}>Menade du:</MyText>
                    <View style={styles.suggestionsList}>
                        {data.similarCars.map((car) => (
                            <TouchableOpacity
                                key={car.regNr}
                                onPress={() => handleSimilarCarPress(car.regNr)}
                                style={styles.suggestionItem}
                            >
                                <Text style={styles.suggestionText}>
                                    {car.displayName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ) : null}
        </View>
    );
});

const styles = StyleSheet.create({
    noResultsContainer: {
        width: '100%',
        minHeight: 100,
        position: 'relative',
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
    },
    noResultsContainerDesktop: {
        width: '100%',
        minHeight: 100,
        position: 'relative',
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
        marginBottom: 80,
        paddingHorizontal: 40,
    },
    errorSection: {
        width: width - 40,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 0,
        position: 'relative',
        alignItems: 'center',
        minHeight: 0,
    },
    errorSectionDesktop: {
        width: '100%',
        marginHorizontal: 0,
        marginTop: 20,
        marginBottom: 0,
        position: 'relative',
        alignItems: 'center',
        minHeight: 0,
    },
    errorBackground: {
        width: '100%',
        height: 86,
        backgroundColor: '#FF4938',
        opacity: 0.1,
        borderRadius: 16,
        position: 'absolute',
    },
    errorIcon: {
        position: 'absolute',
        left: 20,
        top: 25,
    },
    errorText: {
        position: 'absolute',
        left: 80,
        top: 35,
        color: '#181818',
        fontSize: 20,
        fontFamily: 'Poppins',
        fontWeight: '400',
        lineHeight: 20,
        paddingTop: 4,
    },
    suggestionsContainer: {
        width: width - 40,
        marginLeft: 20,
        marginTop: 116,
    },
    suggestionsContainerDesktop: {
        width: '100%',
        marginLeft: 0,
        marginTop: 116,
        marginBottom: 60,
    },
    suggestionsTitle: {
        color: '#181818',
        fontSize: 20,
        fontFamily: 'Poppins',
        fontWeight: '400',
        lineHeight: 30,
        marginBottom: 25,
    },
    suggestionsList: {
        gap: 8,
    },
    suggestionText: {
        color: '#181818',
        fontSize: 13,
        fontFamily: 'Inter',
        fontWeight: '400',
        lineHeight: 30,
    },
    regNumber: {
        fontWeight: '700',
        lineHeight: 24,
    },
    dash: {
        fontWeight: '400',
        lineHeight: 24,
    },
    suggestionItem: {
        // Add appropriate styles for TouchableOpacity
    },
});

export default NoResultsComponent;