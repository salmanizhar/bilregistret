import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Pressable, Animated, Easing } from "react-native";
import { SvgXml } from "react-native-svg";
import { TrailerCalculatorIcons } from "@/assets/images/SvgIcons";
import { useRegisterCar } from "@/Services/api/hooks/car.hooks";
import { useSectionState } from '@/Services/api/hooks/sectionState.hooks';
import MyText from '@/components/common/MyText';
import { H2, SemanticSection } from '@/components/common/SemanticText';
import { myColors } from '@/constants/MyColors';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { ActivityIndicator } from 'react-native';
import { IconChevronDown } from '@/assets/icons';
import { createWebStyles, shouldUseNativeDriver } from '@/utils/shadowHelper';
import { Platform } from 'react-native';

type IconState = 'default' | 'success' | 'error' | 'warning';

interface TrailerCalculatorProps {
    carRegNumber: string;
    modellid: number;
    carRegNumberEditable?: boolean;
    // New props for SEO bot pre-filling
    prefilledTrailerRegNumber?: string;
    prefilledSelectedLicense?: 'B' | 'BE' | '96';
    autoCalculate?: boolean;
    expandSections?: boolean;
};

// Add VehicleInformationSection component similar to the one in biluppgifterDetails.tsx
interface VehicleInformationSectionProps {
    title: string;
    icon?: string;
    isExpanded?: boolean;
    children?: React.ReactNode;
    sectionKey?: string; // Add static section key prop
}

const VehicleInformationSection = React.memo<VehicleInformationSectionProps>(({
    title,
    icon,
    isExpanded = false,
    children,
    sectionKey
}) => {
    // Use static section key or fallback to a sanitized version of title
    const stableSectionKey = sectionKey || `trailer_calc_info_section_${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;

    const { isOpen: sectionExpanded, isLoading, toggleState } = useSectionState({
        sectionKey: stableSectionKey,
        defaultState: isExpanded,
        dataVersion: '1.0',
        hasContent: !!children,
        isSearching: false  // Changed from isExpanded to false to prevent initial loading state
    });

    // Use local state to control the expanded state and avoid timing issues
    const [expanded, setExpanded] = React.useState(isExpanded);
    const [isInitialized, setIsInitialized] = React.useState(false);

    // Calculate proper alignment for the final orange bar position
    const headerPadding = isDesktopWeb() ? 22 : 12;
    const textLineHeight = isDesktopWeb() ? 24 : 19; // Approximate line height for the font sizes
    const textOffset = Math.floor(textLineHeight * 0.15) - 4; // Adjust 3px higher to align with text
    const orangeBarTop = headerPadding + textOffset; // Where the orange bar should sit
    const orangeBarHeight = 30; // Small orange bar height
    const fullCardHeight = 100; // Full blue bar height (covers whole card)

    // Initialize animation values - start with collapsed state (full height, top 0, blue)
    const barHeightAnim = React.useRef(new Animated.Value(fullCardHeight)).current;
    const barTopAnim = React.useRef(new Animated.Value(0)).current;
    const barColorAnim = React.useRef(new Animated.Value(1)).current; // 1 = blue (collapsed)
    const chevronRotateAnim = React.useRef(new Animated.Value(1)).current; // 1 = down arrow

    // Sync with section state when it changes - but don't set initial immediately
    React.useEffect(() => {
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
    React.useEffect(() => {
        if (!isInitialized) return;

        const duration = 250;
        const easing = Easing.out(Easing.cubic);

        Animated.parallel([
            Animated.timing(barHeightAnim, {
                toValue: expanded ? orangeBarHeight : fullCardHeight,
                duration,
                easing,
                useNativeDriver: shouldUseNativeDriver(),
            }),
            Animated.timing(barTopAnim, {
                toValue: expanded ? orangeBarTop : 0,
                duration,
                easing,
                useNativeDriver: shouldUseNativeDriver(),
            }),
            Animated.timing(barColorAnim, {
                toValue: expanded ? 0 : 1,
                duration,
                easing,
                useNativeDriver: shouldUseNativeDriver(),
            }),
            Animated.timing(chevronRotateAnim, {
                toValue: expanded ? 0 : 1,
                duration: 200,
                easing,
                useNativeDriver: shouldUseNativeDriver(),
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

    if (isLoading) {
        return (
            <View style={[
                styles.vehicleInformationSectionAnimated,
                {
                    marginBottom: 1,
                    borderRadius: 8,
                    backgroundColor: myColors.white,
                    overflow: 'hidden',
                },
                isDesktopWeb() && styles.vehicleInformationSectionDesktop
            ]}>
                <View style={styles.vehicleInformationSectionHeader}>
                    <View style={{ flex: 1 }}>
                        <MyText style={styles.vehicleInformationSectionTitle}>{title}</MyText>
                    </View>
                    <ActivityIndicator size="small" color={myColors.black} />
                </View>
            </View>
        );
    }

    return (
        <View style={[
            styles.vehicleInformationSectionAnimated,
            {
                marginBottom: 1,
                borderRadius: 8,
                backgroundColor: myColors.white,
                overflow: 'hidden',
            },
            isDesktopWeb() && styles.vehicleInformationSectionDesktop
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
                style={styles.vehicleInformationSectionHeader}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <View style={{ flex: 1 }}>
                    <MyText style={styles.vehicleInformationSectionTitle}>{title}</MyText>
                </View>
                {isInitialized && (
                    <Animated.View
                        style={{
                            transform: [{ rotate: chevronRotation }],
                        }}
                    >
                        <IconChevronDown size={26} color={myColors.text.primary} />
                    </Animated.View>
                )}
            </TouchableOpacity>

            {expanded && (
                <View style={{
                    width: '100%',
                    marginBottom: isDesktopWeb() ? 15 : 0, // Remove bottom margin on mobile
                    paddingHorizontal: isDesktopWeb() ? 25 : 0, // Remove horizontal padding on mobile
                    paddingBottom: isDesktopWeb() ? 25 : 0 // Remove bottom padding on mobile
                }}>
                    {children}
                </View>
            )}
        </View>
    );
});

// Add a new component for the vehicle info item row
interface VehicleInfoRowProps {
    label: string;
    value: string | string[];
    isAlternate?: boolean;
}

const VehicleInfoRow = React.memo<VehicleInfoRowProps>(({ label, value, isAlternate = false }) => {
    // Handle array values by joining them with commas
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <View style={{ width: '100%' }}>
            <View
                style={[{
                    flexDirection: 'row', // Use row layout for both desktop and mobile
                    justifyContent: 'space-between',
                    alignItems: 'center', // Center align for single line display
                    paddingVertical: isDesktopWeb() ? 12 : 10,
                    paddingHorizontal: isDesktopWeb() ? 20 : 16,
                    alignSelf: 'center',
                    width: isDesktopWeb() ? '95%' : '100%',
                    borderRadius: 5,
                    backgroundColor: isHovered ? "transparent" : (isDesktopWeb() ? ('#F5F8FA') : (isAlternate ? '#F5F8FA' : 'transparent')),
                    gap: isDesktopWeb() ? 8 : 8, // Consistent gap for both platforms
                }]}
                {...(isDesktopWeb() ? {
                    onMouseEnter: () => setIsHovered(true),
                    onMouseLeave: () => setIsHovered(false)
                } : {})}
            >
                <MyText
                    style={{
                        fontSize: isDesktopWeb() ? 14 : 13,
                        fontWeight: '600',
                        color: myColors.black,
                        flex: 3, // Give label much more space
                        marginRight: 8,
                    }}
                    numberOfLines={1}
                >{label}</MyText>
                <MyText
                    style={{
                        fontSize: isDesktopWeb() ? 14 : 13,
                        fontWeight: '500',
                        color: isDesktopWeb() ? myColors.black : '#555',
                        textAlign: 'right',
                        flex: 1, // Value takes minimal space needed
                        flexShrink: 0, // Prevent value from shrinking too much
                    }}
                    numberOfLines={1}
                >{displayValue}</MyText>
            </View>
        </View>
    );
});

// Simple text row for descriptive bullet points / paragraphs
interface TextContentRowProps {
    content: string;
    isAlternate?: boolean;
}

const TextContentRow = React.memo<TextContentRowProps>(({ content, isAlternate = false }) => (
    <View style={{ width: '100%' }}>
        <View
            style={{
                paddingVertical: isDesktopWeb() ? 12 : 8,
                paddingHorizontal: isDesktopWeb() ? 20 : 16,
                alignSelf: 'center',
                width: isDesktopWeb() ? '95%' : '92%',
                borderRadius: 5,
                backgroundColor: isDesktopWeb() ? '#F5F8FA' : (isAlternate ? '#F5F8FA' : '#F5F8FA'),
            }}
        >
            <MyText style={{
                fontSize: isDesktopWeb() ? 14 : 13,
                fontWeight: '400',
                color: myColors.text.primary,
            }}>
                {content}
            </MyText>
        </View>
    </View>
));

const TrailerCalculator: React.FC<TrailerCalculatorProps> = ({ carRegNumber, modellid, carRegNumberEditable = false, prefilledTrailerRegNumber, prefilledSelectedLicense, autoCalculate = false, expandSections = false }) => {
    const [selectedLicense, setSelectedLicense] = React.useState<'B' | 'BE' | '96' | null>(prefilledSelectedLicense || 'B');
    const [carRegNumberLocal, setCarRegNumberLocal] = React.useState(carRegNumberEditable ? carRegNumber : "");
    const [trailerRegNumber, setTrailerRegNumber] = React.useState(prefilledTrailerRegNumber || "");
    const [errors, setErrors] = React.useState<{
        carRegNumber?: boolean;
        trailerRegNumber?: boolean;
        license?: boolean;
    }>({});
    const [errorMessage, setErrorMessage] = React.useState<string>("");
    const [carIconState, setCarIconState] = React.useState<IconState>('default');
    const [trailerIconState, setTrailerIconState] = React.useState<IconState>('default');
    const [result, setResult] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [responseData, setResponseData] = React.useState<any>(null);

    const { mutate: registerCar, isPending } = useRegisterCar();

    // Refs for handling automatic focus/blur between inputs
    const carRegNumberInputRef = React.useRef<TextInput>(null);
    const trailerRegNumberInputRef = React.useRef<TextInput>(null);

    // Update local car reg number when carRegNumber prop changes and editable mode is enabled
    React.useEffect(() => {
        if (carRegNumberEditable && carRegNumber) {
            setCarRegNumberLocal(carRegNumber);
        }
    }, [carRegNumber, carRegNumberEditable]);

    // Auto-calculate for bots if pre-filled values are provided
    React.useEffect(() => {
        if (autoCalculate && prefilledTrailerRegNumber && prefilledSelectedLicense && carRegNumber) {
            // Small delay to ensure component is fully mounted
            const timer = setTimeout(() => {
                handleCalculate();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [autoCalculate, prefilledTrailerRegNumber, prefilledSelectedLicense, carRegNumber]);

    const formatRegNumber = (input: string) => {
        const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleaned.length > 3) {
            return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6);
        }
        return cleaned;
    };

    const validateRegNumber = (regNumber: string) => {
        const regNumberPattern = /^[A-Z]{3}\s?[0-9]{2}[A-Z0-9]$/;
        return regNumberPattern.test(regNumber);
    };

    const handleRegNumberChange = (text: string) => {
        if (text.replace(/[^A-Z0-9]/g, '').length <= 6) {
            const formatted = formatRegNumber(text);
            setTrailerRegNumber(formatted);
            // When trailer reg number is complete & valid, blur the field (closes keyboard)
            if (validateRegNumber(formatted)) {
                trailerRegNumberInputRef.current?.blur();
                // Trigger calculation using latest local values
                handleCalculate(undefined, formatted);
            }
            if (errors.trailerRegNumber) {
                setErrors(prev => ({ ...prev, trailerRegNumber: false }));
                setErrorMessage("");
            }
        }
    };

    const handleCarRegNumberChange = (text: string) => {
        if (text.replace(/[^A-Z0-9]/g, '').length <= 6) {
            const formatted = formatRegNumber(text);
            setCarRegNumberLocal(formatted);
            // When car reg number is complete & valid, move focus to trailer input
            if (validateRegNumber(formatted)) {
                trailerRegNumberInputRef.current?.focus();
            }
            if (errors.carRegNumber) {
                setErrors(prev => ({ ...prev, carRegNumber: false }));
                setErrorMessage("");
            }
        }
    };

    const handleLicenseSelect = (license: 'B' | 'BE' | '96') => {
        setSelectedLicense(license);
        if (errors.license) {
            setErrors(prev => ({ ...prev, license: false }));
            setErrorMessage("");
        }
    };

    // Web helper: press license button & blur to avoid focus outline
    const handleLicensePress = (license: 'B' | 'BE' | '96') => {
        handleLicenseSelect(license);
        if (Platform.OS === 'web') {
            // Blur after click to remove blue outline
            setTimeout(() => {
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            }, 0);
        }
    };

    const handleCalculate = (
        carNumberOverride?: string,
        trailerNumberOverride?: string
    ) => {
        const carNumberFinal = carRegNumberEditable ? (carNumberOverride ?? carRegNumberLocal) : carRegNumber;
        const trailerNumberFinal = trailerNumberOverride ?? trailerRegNumber;

        const newErrors: { carRegNumber?: boolean; trailerRegNumber?: boolean; license?: boolean } = {};
        const errorMessages: string[] = [];

        if (!validateRegNumber(trailerNumberFinal)) {
            newErrors.trailerRegNumber = true;
            errorMessages.push("Ange giltig registreringsnummer för släp eller husvagn");
        }

        if (!selectedLicense) {
            newErrors.license = true;
            errorMessages.push("Ange körkortsbehörighet");
        }

        setErrors(newErrors);
        setErrorMessage(errorMessages.length > 0 ? errorMessages.join('\n') : "");

        if (errorMessages.length > 0) {
            setResult("");
            return;
        }

        setIsLoading(true);
        setResult("Beräknar...");
        setErrorMessage(""); // Clear any previous error messages

        const korkortsbehorighet = selectedLicense === '96' ? 'B96' : selectedLicense;

        registerCar({
            regNrCar: carNumberFinal.replace(/\s+/g, ''),
            regNrSlap: trailerNumberFinal.replace(/\s+/g, ''),
            modellid: modellid,
            korkortsbehorighet: korkortsbehorighet as 'B96' | 'B' | 'BE'
        }, {
            onSuccess: (response) => {
                const sanitizedResponse = {
                    ...response,
                    data: {
                        bil: {
                            tjänstevikt: Number((response as any).carData?.Tjanstevikt) || 0,
                            totalvikt: Number((response as any).carData?.Totalvikt) || 0,
                            maxBromsad: Number((response as any).carData?.Max_slapvagnsvikt_bromsad) || 0,
                            maxObromsad: Number((response as any).carData?.Max_slapvagsvikt_obromsad) || 0,
                            tågvikt: Number((response as any).carData?.tågvikt) || 0,
                            title: (response as any).carData?.title || 'Bil'
                        },
                        släp: {
                            tjänstevikt: Number((response as any).trailerData?.Tjanstevikt) || 0,
                            totalvikt: Number((response as any).trailerData?.Totalvikt) || 0,
                            maxLastvikt: Number((response as any).trailerData?.Max_lastvikt) || 0,
                            bromsad: (response as any).trailerData?.bromsad === "ja",
                            title: (response as any).trailerData?.title || 'Släpvagn'
                        }
                    },
                    resultat: (response as any).resultat || {}
                };

                setResponseData(sanitizedResponse);
                setResult("Beräkning klar!");

                // Debug the API response to see what color keys are available
                // console.log('Full API response:', response);
                // console.log('Resultat object:', (response as any).resultat);
                // console.log('Colors object:', (response as any).resultat?.färger);

                const bilColor = (response as any).resultat?.färger?.bil || '';
                // Try different possible keys for trailer color
                const slapColor = (response as any).resultat?.färger?.släp ||
                    (response as any).resultat?.färger?.slap ||
                    (response as any).resultat?.färger?.trailer ||
                    (response as any).resultat?.färger?.släpvagn || '';

                // console.log('Bil color from response:', bilColor);
                // console.log('Släp color from response:', slapColor);

                // Map Swedish color names to icon states
                const mapColorToState = (color: string): IconState => {
                    // console.log('Mapping color:', color);
                    switch (color) {
                        case 'Grön':
                            return 'success';
                        case 'Gul':
                            return 'warning';
                        case 'Röd':
                            return 'error';
                        default:
                            // console.log('Unknown color, defaulting to error:', color);
                            return 'error';
                    }
                };

                const carState = mapColorToState(bilColor);
                const trailerState = mapColorToState(slapColor);

                // console.log('Car icon state:', carState);
                // console.log('Trailer icon state:', trailerState);

                setCarIconState(carState);
                setTrailerIconState(trailerState);

                setIsLoading(false);
            },
            onError: (error) => {
                // console.log('API Error:', error);

                let errorMessages: string[] = [];
                let fieldErrors: { carRegNumber?: boolean; trailerRegNumber?: boolean; license?: boolean } = {};

                try {
                    // Parse the error response - handle different error structures safely
                    const errorData = (error as any)?.response?.data || (error as any)?.data || error;

                    // Handle multiple errors format
                    if (errorData?.errors && Array.isArray(errorData.errors)) {
                        errorMessages = errorData.errors.map((err: any) => err.error || err.message || 'Okänt fel');

                        // Check for specific error codes in multiple errors
                        errorData.errors.forEach((err: any) => {
                            const errorCode = err.errorCode;
                            if (errorCode === 'ERROR_CAR_NOT_PB' || errorCode === 'ERROR_CAR_DATA_NOT_FOUND') {
                                fieldErrors.carRegNumber = true;
                            }
                            if (errorCode === 'ERROR_TRAILER_NOT_SLAP' || errorCode === 'ERROR_TRAILER_DATA_NOT_FOUND') {
                                fieldErrors.trailerRegNumber = true;
                            }
                        });
                    }
                    // Handle single error with "errors" array containing one item
                    else if (errorData?.error) {
                        errorMessages.push(errorData.error);

                        // Check for specific error codes in single error
                        const errorCode = errorData.errorCode;
                        if (errorCode === 'ERROR_CAR_NOT_PB' || errorCode === 'ERROR_CAR_DATA_NOT_FOUND') {
                            fieldErrors.carRegNumber = true;
                        }
                        if (errorCode === 'ERROR_TRAILER_NOT_SLAP' || errorCode === 'ERROR_TRAILER_DATA_NOT_FOUND') {
                            fieldErrors.trailerRegNumber = true;
                        }
                    }
                    // Handle error message directly
                    else if ((error as any)?.message) {
                        errorMessages.push((error as any).message);
                    }
                    // Handle specific status codes with fallback messages
                    else {
                        const status = (error as any)?.status || (error as any)?.response?.status;
                        switch (status) {
                            case 400:
                                errorMessages.push("Ogiltiga uppgifter. Kontrollera registreringsnummer och försök igen.");
                                // For 400 errors without specific error codes, highlight both fields
                                fieldErrors.carRegNumber = true;
                                fieldErrors.trailerRegNumber = true;
                                break;
                            case 404:
                                errorMessages.push("Fordonsinformation kunde inte hittas för angivna registreringsnummer.");
                                // For 404 errors, highlight both fields as data wasn't found
                                fieldErrors.carRegNumber = true;
                                fieldErrors.trailerRegNumber = true;
                                break;
                            case 503:
                                errorMessages.push("Tjänsten är tillfälligt otillgänglig. Försök igen om en stund.");
                                // Don't highlight fields for service unavailable
                                break;
                            case 500:
                                errorMessages.push("Ett tekniskt fel uppstod. Försök igen senare.");
                                // Don't highlight fields for server errors
                                break;
                            default:
                                errorMessages.push("Ett oväntat fel uppstod vid beräkningen.");
                            // Don't highlight fields for unknown errors
                        }
                    }
                } catch (parseError) {
                    // console.error('Error parsing error response:', parseError);
                    errorMessages.push("Ett oväntat fel uppstod vid beräkningen.");
                    // Don't highlight fields for parsing errors
                }

                // If no error messages were found, use a default message
                if (errorMessages.length === 0) {
                    errorMessages.push("Ett oväntat fel uppstod vid beräkningen.");
                }

                // Set the error message(s) and field errors
                setErrorMessage(errorMessages.join('\n'));
                setErrors(fieldErrors);
                setResult("");
                setCarIconState('error');
                setTrailerIconState('error');
                setIsLoading(false);
            }
        });
    };

    // Global Enter key handler for web to trigger calculation
    React.useEffect(() => {
        if (Platform.OS !== 'web') return;
        const keyListener = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                // Prevent default browser behaviour that might shift focus
                e.preventDefault();
                e.stopPropagation();

                // Trigger calculation with current state values
                handleCalculate();

                // Blur any actively focused element to remove blue outline
                if (document.activeElement instanceof HTMLElement) {
                    // delay to ensure click/press processing done
                    setTimeout(() => {
                        document.activeElement && (document.activeElement as HTMLElement).blur();
                    }, 0);
                }
            }
        };
        document.addEventListener('keydown', keyListener);
        return () => document.removeEventListener('keydown', keyListener);
    }, [carRegNumberLocal, trailerRegNumber, selectedLicense]);

    return (
        <View style={styles.calculatorParent}>
            {/* Calculator Section */}
            <View style={styles.calculator}>
                <View style={styles.calculatorChild} />
                <View style={styles.parent}>
                    {/* Car Registration Input */}
                    <View style={styles.div}>
                        <View style={[styles.child, errors.carRegNumber && styles.inputError]} />
                        {carRegNumberEditable ? (
                            <TextInput
                                ref={carRegNumberInputRef}
                                style={[
                                    styles.aag104,
                                    !isDesktopWeb() && { textTransform: 'uppercase' }
                                ]}
                                placeholder="ABC 123"
                                placeholderTextColor="#262524"
                                value={carRegNumberLocal}
                                onChangeText={handleCarRegNumberChange}
                                onSubmitEditing={() => handleCalculate()}
                                autoCapitalize="characters"
                                maxLength={7}
                                keyboardType="ascii-capable"
                            />
                        ) : (
                            <Text style={styles.aag104}>{carRegNumber}</Text>
                        )}
                        <Text style={styles.regBil}>Reg bil :</Text>
                    </View>

                    {/* Trailer Registration Input */}
                    <View style={styles.div}>
                        <View style={[styles.child, errors.trailerRegNumber && styles.inputError]} />
                        <TextInput
                            ref={trailerRegNumberInputRef}
                            style={[
                                styles.xyz100,
                                !isDesktopWeb() && { textTransform: 'uppercase' }
                            ]}
                            placeholder="ABC 123"
                            placeholderTextColor="#262524"
                            value={trailerRegNumber}
                            onChangeText={handleRegNumberChange}
                            onSubmitEditing={() => handleCalculate()}
                            autoCapitalize="characters"
                            maxLength={7}
                            keyboardType="ascii-capable"
                        />
                        <Text style={styles.regSlpvagn}>Reg släpvagn :</Text>
                    </View>

                    {/* License Selection */}
                    <View style={styles.div2}>
                        <Text style={styles.jagHarKrkortsbehrighet}>Jag har körkortsbehörighet :</Text>
                        <View style={styles.licenseContainer}>
                            <View style={[styles.inner, errors.license && styles.licenseError]} />

                            {/* Radio button container */}
                            <View style={styles.radioButtonContainer}>
                                {/* B */}
                                <TouchableOpacity
                                    style={styles.radioButtonWrapper}
                                    onPress={() => handleLicensePress('B')}
                                >
                                    <View style={[
                                        selectedLicense === 'B' ? styles.child3 : styles.rectangleDiv,
                                        errors.license && styles.radioButtonError
                                    ]} />
                                    <Text style={styles.utkadBKod}>B</Text>
                                </TouchableOpacity>

                                {/* Utökad B (kod 96) */}
                                <TouchableOpacity
                                    style={styles.radioButtonWrapper}
                                    onPress={() => handleLicensePress('96')}
                                >
                                    <View style={[
                                        styles.rectangleDiv,
                                        selectedLicense === '96' && styles.radioButtonSelected,
                                        errors.license && styles.radioButtonError
                                    ]} />
                                    <Text style={styles.utkadBKod}>Utökad B (kod 96)</Text>
                                </TouchableOpacity>

                                {/* BE */}
                                <TouchableOpacity
                                    style={styles.radioButtonWrapper}
                                    onPress={() => handleLicensePress('BE')}
                                >
                                    <View style={[
                                        styles.rectangleDiv,
                                        selectedLicense === 'BE' && styles.radioButtonSelected,
                                        errors.license && styles.radioButtonError
                                    ]} />
                                    <Text style={styles.utkadBKod}>BE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Calculate Button */}
                    <TouchableOpacity style={styles.btn} onPress={() => handleCalculate()}>
                        <Text style={styles.berkna}>Beräkna</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Error Messages - Positioned between input and results */}
            {errorMessage && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            )}

            {/* Results Section - Always show */}
            <View style={styles.result}>
                <View style={styles.resultContainer}>
                    <View style={styles.resultBackground} />

                    {/* Results Header */}
                    <View style={styles.resultatParent}>
                        <H2 id="resultat-title" style={styles.berkningsunderlag}>Resultat</H2>
                        <Text style={[
                            styles.berkningKlar,
                            result === "Beräkning klar!" && styles.successText,
                            (result.includes("fel") || result.includes("giltigt")) && styles.errorText
                        ]}>
                            {result || "Ingen beräkning är gjord."}
                        </Text>

                        {/* Display mainText and speedText when calculation is complete */}
                        {result === "Beräkning klar!" && responseData?.resultat?.texter && (
                            <View style={styles.resultTextsContainer}>
                                {responseData.resultat.texter.mainText && (
                                    <Text style={styles.mainResultText}>
                                        {responseData.resultat.texter.mainText}
                                    </Text>
                                )}
                                {responseData.resultat.texter.speedText && (
                                    <Text style={styles.speedResultText}>
                                        {responseData.resultat.texter.speedText}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Vehicle Icons - Always show, grey by default */}
                    <View style={styles.vehicleIconsSection}>
                        <View style={[styles.vehicleIconContainer, {
                            borderColor: result === "Beräkning klar!" && carIconState === 'success' ? '#12B262' :
                                result === "Beräkning klar!" && carIconState === 'warning' ? '#FFA526' :
                                    result === "Beräkning klar!" && carIconState === 'error' ? '#FF4938' : '#CED4D9'
                        }]}>
                            <SvgXml
                                xml={TrailerCalculatorIcons.car.replace(/#B9D3F7/g,
                                    result === "Beräkning klar!" && carIconState === 'success' ? '#12B262' :
                                        result === "Beräkning klar!" && carIconState === 'warning' ? '#FFA526' :
                                            result === "Beräkning klar!" && carIconState === 'error' ? '#FF4938' : '#B9D3F7'
                                )}
                                style={styles.vehicleIcon}
                            />
                        </View>
                        <View style={[styles.vehicleIconContainer, {
                            borderColor: result === "Beräkning klar!" && trailerIconState === 'success' ? '#12B262' :
                                result === "Beräkning klar!" && trailerIconState === 'warning' ? '#FFA526' :
                                    result === "Beräkning klar!" && trailerIconState === 'error' ? '#FF4938' : '#CED4D9'
                        }]}>
                            <SvgXml
                                xml={TrailerCalculatorIcons.slap.replace(/#B9D3F7/g,
                                    result === "Beräkning klar!" && trailerIconState === 'success' ? '#12B262' :
                                        result === "Beräkning klar!" && trailerIconState === 'warning' ? '#FFA526' :
                                            result === "Beräkning klar!" && trailerIconState === 'error' ? '#FF4938' : '#B9D3F7'
                                )}
                                style={styles.vehicleIcon}
                            />
                        </View>
                    </View>

                    {/* Calculation Details Header */}
                    <View style={styles.berkningsunderlagParent}>
                        <H2 id="berakningsunderlag-title" style={styles.berkningsunderlag}>Beräkningsunderlag</H2>
                        <Text style={styles.berkningKlar}>
                            {result === "Beräkning klar!" ? "Beräkning klar!" : "Ingen beräkning är gjord."}
                        </Text>
                    </View>

                    {/* Vehicle Details - Only show when calculation is done */}
                    {result === "Beräkning klar!" && responseData && (
                        <View style={styles.frameParent}>
                            {/* Car Section */}
                            <VehicleInformationSection
                                title={`${carRegNumberEditable ? carRegNumberLocal : carRegNumber} - ${responseData?.data?.bil?.title || 'Bil'}`}
                                isExpanded={expandSections || isDesktopWeb()}
                                sectionKey="trailer_calc_car_section"
                            >
                                <VehicleInfoRow
                                    label="Regnr:"
                                    value={carRegNumberEditable ? carRegNumberLocal : carRegNumber}
                                    isAlternate={false}
                                />
                                <VehicleInfoRow
                                    label="Tjänstevikt:"
                                    value={`${responseData?.data?.bil?.tjänstevikt || 0} kg`}
                                    isAlternate={true}
                                />
                                <VehicleInfoRow
                                    label="Totalvikt:"
                                    value={`${responseData?.data?.bil?.totalvikt || 0} kg`}
                                    isAlternate={false}
                                />
                                <VehicleInfoRow
                                    label="Max släpvagnsvikt bromsad släpvagn:"
                                    value={`${responseData?.data?.bil?.maxBromsad || 0} kg`}
                                    isAlternate={true}
                                />
                                <VehicleInfoRow
                                    label="Max släpvagnsvikt obromsad släpvagn:"
                                    value={`${responseData?.data?.bil?.maxObromsad || 0} kg`}
                                    isAlternate={false}
                                />
                                <VehicleInfoRow
                                    label="Maximal tågvikt:"
                                    value={`${responseData?.data?.bil?.tågvikt || 0} kg`}
                                    isAlternate={true}
                                />
                            </VehicleInformationSection>

                            {/* Trailer Section */}
                            <VehicleInformationSection
                                title={`${trailerRegNumber} - ${responseData?.data?.släp?.title || 'Släpvagn'}`}
                                isExpanded={expandSections || isDesktopWeb()}
                                sectionKey="trailer_calc_trailer_section"
                            >
                                <VehicleInfoRow
                                    label="Regnr:"
                                    value={trailerRegNumber}
                                    isAlternate={false}
                                />
                                <VehicleInfoRow
                                    label="Fordonsinformation:"
                                    value={responseData?.data?.släp?.title || '-'}
                                    isAlternate={true}
                                />
                                <VehicleInfoRow
                                    label="Tjänstevikt:"
                                    value={`${responseData?.data?.släp?.tjänstevikt || 0} kg`}
                                    isAlternate={false}
                                />
                                <VehicleInfoRow
                                    label="Max lastvikt:"
                                    value={`${responseData?.data?.släp?.maxLastvikt || 0} kg`}
                                    isAlternate={true}
                                />
                                <VehicleInfoRow
                                    label="Totalvikt:"
                                    value={`${responseData?.data?.släp?.totalvikt || 0} kg`}
                                    isAlternate={false}
                                />
                                <VehicleInfoRow
                                    label="Bromsad:"
                                    value={responseData?.data?.släp?.bromsad ? 'Ja' : 'Nej'}
                                    isAlternate={true}
                                />
                            </VehicleInformationSection>
                        </View>
                    )}
                </View>
            </View>

            {/* Information Section - moved outside results container with 80px margin */}
            <SemanticSection
                style={styles.infoSectionContainer}
                ariaLabelledBy="hur-fungerar-title"
                itemScope
                itemType="https://schema.org/HowTo"
            >
                <H2 id="hur-fungerar-title" style={styles.infoSectionTitle}>
                    Hur fungerar beräkningen?
                </H2>

                <VehicleInformationSection title="Visa detaljer" isExpanded={expandSections || false} sectionKey="trailer_calc_details_section">
                    {/* <MyText style={styles.kalkylatornAnvnderOfficiell}>
                        Kalkylatorn använder officiella fordonsdata från bilregistret för att beräkna om din bil kan dra den angivna släpvagnen eller husvagnen.
                    </MyText> */}
                    <TextContentRow
                        content="Kalkylatorn använder officiella fordonsdata från bilregistret för att beräkna om din bil kan dra den angivna släpvagnen eller husvagnen."
                        isAlternate={false}
                    />

                    <TextContentRow
                        content="Beräkningen tar hänsyn till:"
                        isAlternate={true}
                    />

                    <TextContentRow
                        content="• Bilens tjänstevikt och maxlaster"
                        isAlternate={false}
                    />

                    <TextContentRow
                        content="• Släpvagnens totalvikt och tjänstevikt"
                        isAlternate={true}
                    />

                    <TextContentRow
                        content="• Om släpvagnen är bromsad eller obromsad"
                        isAlternate={false}
                    />

                    <TextContentRow
                        content="• Din körkortsbehörighet"
                        isAlternate={true}
                    />

                    <TextContentRow
                        content="• Gällande trafikregler och viktgränser"
                        isAlternate={false}
                    />

                    <TextContentRow
                        content="Viktigt att veta"
                        isAlternate={true}
                    />

                    <TextContentRow
                        content="Observera: Du ansvarar alltid själv för att köra lagligt. Kalkylatorn gäller inte fordon med bygel, krok, vändskiva, tapp eller släp med ledad dragstång."
                        isAlternate={false}
                    />

                    <TextContentRow
                        content="Resultatet är vägledande och baseras på tillgänglig registerdata. Vi rekommenderar att du alltid kontrollerar aktuella regler och dina fordons specifikationer."
                        isAlternate={true}
                    />

                    <TextContentRow
                        content="Vi tar inget ansvar för eventuella felaktigheter i beräkningen eller för skador som kan uppstå genom användning av kalkylatorn."
                        isAlternate={false}
                    />
                    <View style={{ marginBottom: 20 }} />
                </VehicleInformationSection>
            </SemanticSection>
        </View>
    );
};

const styles = StyleSheet.create({
    calculatorParent: {
        width: "100%",
        position: "relative",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: isDesktopWeb() ? 30 : 20, // Reduce gap on mobile
    },
    calculator: {
        width: "100%",
        position: "relative",
        height: isDesktopWeb() ? 151 : "auto", // Make height auto on mobile
        marginBottom: 0,
        minHeight: isDesktopWeb() ? 151 : 380, // Ensure minimum height on mobile
        borderRadius: 10, // Add border radius to the container
        overflow: "hidden", // Ensure border radius is visible
    },
    calculatorChild: {
        position: "absolute",
        top: 0,
        left: 0,
        borderRadius: 10,
        backgroundColor: "#f5f8fa",
        width: "100%",
        height: "100%",
        ...(isDesktopWeb() ? {} : {
            // Ensure background covers all content on mobile
            minHeight: 380,
        }),
    },
    parent: {
        position: isDesktopWeb() ? "absolute" : "relative", // Use relative positioning on mobile
        top: isDesktopWeb() ? 35 : 0,
        left: isDesktopWeb() ? 25 : 0,
        right: isDesktopWeb() ? 25 : 0,
        flexDirection: isDesktopWeb() ? "row" : "column",
        alignItems: isDesktopWeb() ? "flex-end" : "stretch",
        justifyContent: "flex-start",
        gap: isDesktopWeb() ? 20 : 20,
        ...(isDesktopWeb() ? {} : {
            // Better mobile layout
            padding: 20,
            paddingBottom: 30,
        }),
    },
    div: {
        width: isDesktopWeb() ? 185 : "100%",
        position: "relative",
        height: isDesktopWeb() ? 81 : 75,
    },
    child: {
        position: "absolute",
        top: isDesktopWeb() ? 25 : 22,
        left: 0,
        borderRadius: 10,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#ced4d9",
        borderStyle: "solid",
        width: "100%",
        height: isDesktopWeb() ? 56 : 48,
        justifyContent: "center",  // Center content vertically
        alignItems: "center",      // Center content horizontally
        ...createWebStyles({ outline: 'none' }),
    },
    inputError: {
        borderColor: "#ff4938",
    },
    aag104: {
        position: "absolute",
        top: isDesktopWeb() ? 25 : 22,
        left: 0,
        width: "100%",
        height: isDesktopWeb() ? 56 : 48,
        lineHeight: 16,
        textTransform: "capitalize",
        fontFamily: "Inter",
        fontWeight: "700",
        fontSize: isDesktopWeb() ? 15 : (Platform.OS === 'web' ? 16 : 14), // Use 16px on mobile web to prevent zoom
        color: "#262524",
        borderRadius: 10,
        paddingHorizontal: isDesktopWeb() ? 20 : 16,
        paddingVertical: 0,
        borderWidth: 0,
        backgroundColor: "transparent",
        textAlign: "left",
        textAlignVertical: "center",
        includeFontPadding: false,
        ...createWebStyles({ 
            outline: 'none',
            ...(Platform.OS === 'web' && !isDesktopWeb() ? {
                fontSize: '16px !important', // Force 16px to prevent zoom
                ':focus': {
                    outline: 'none !important',
                    border: 'none !important',
                    boxShadow: 'none !important',
                    fontSize: '16px !important', // Ensure 16px on focus
                },
                ':focus-visible': {
                    outline: 'none !important',
                    border: 'none !important',
                    boxShadow: 'none !important',
                    fontSize: '16px !important',
                },
            } : {})
        }),
        // Scale down on mobile web to maintain visual size while preventing zoom
        ...(Platform.OS === 'web' && !isDesktopWeb() ? {
            transform: 'scale(0.875)', // 14/16 = 0.875 to maintain visual 14px size
            transformOrigin: 'left center',
            outline: 'none !important',
            border: 'none !important',
            boxShadow: 'none !important',
        } : {}),
    },
    xyz100: {
        position: "absolute",
        top: isDesktopWeb() ? 25 : 22,
        left: 0,
        width: "100%",
        height: isDesktopWeb() ? 56 : 48,
        lineHeight: 16,
        textTransform: "capitalize",
        fontFamily: "Inter",
        fontWeight: "700",
        fontSize: isDesktopWeb() ? 15 : (Platform.OS === 'web' ? 16 : 14), // Use 16px on mobile web to prevent zoom
        color: "#262524",
        borderRadius: 10,
        paddingHorizontal: isDesktopWeb() ? 20 : 16,
        paddingVertical: 0,
        borderWidth: 0,
        backgroundColor: "transparent",
        textAlign: "left",
        textAlignVertical: "center",
        includeFontPadding: false,
        ...createWebStyles({ 
            outline: 'none',
            ...(Platform.OS === 'web' && !isDesktopWeb() ? {
                fontSize: '16px !important', // Force 16px to prevent zoom
                ':focus': {
                    outline: 'none !important',
                    border: 'none !important',
                    boxShadow: 'none !important',
                    fontSize: '16px !important', // Ensure 16px on focus
                },
                ':focus-visible': {
                    outline: 'none !important',
                    border: 'none !important',
                    boxShadow: 'none !important',
                    fontSize: '16px !important',
                },
            } : {})
        }),
        // Scale down on mobile web to maintain visual size while preventing zoom
        ...(Platform.OS === 'web' && !isDesktopWeb() ? {
            transform: 'scale(0.875)', // 14/16 = 0.875 to maintain visual 14px size
            transformOrigin: 'left center',
            outline: 'none !important',
            border: 'none !important',
            boxShadow: 'none !important',
        } : {}),
    },
    regBil: {
        position: "absolute",
        top: 0,
        left: 0,
        lineHeight: isDesktopWeb() ? 24 : 20,
        textTransform: "capitalize",
        fontFamily: "Poppins",
        color: "#181818",
        width: 152,
        fontSize: isDesktopWeb() ? 15 : 14,
    },
    regSlpvagn: {
        position: "absolute",
        top: 0,
        left: 0,
        lineHeight: isDesktopWeb() ? 24 : 20,
        textTransform: "capitalize",
        fontFamily: "Poppins",
        color: "#181818",
        fontSize: isDesktopWeb() ? 15 : 14,
    },
    div2: {
        width: isDesktopWeb() ? 600 : "100%",
        position: "relative",
        height: isDesktopWeb() ? 81 : 120,
    },
    jagHarKrkortsbehrighet: {
        position: "absolute",
        top: 0,
        left: 0,
        lineHeight: isDesktopWeb() ? 24 : 20,
        textTransform: "capitalize",
        fontSize: isDesktopWeb() ? 15 : 14,
        color: "#181818",
        fontFamily: "Poppins",
    },
    licenseContainer: {
        position: "absolute",
        top: isDesktopWeb() ? 25 : 22,
        left: 0,
        width: "100%",
        height: isDesktopWeb() ? 56 : 95, // Much more height on mobile
    },
    inner: {
        position: "absolute",
        top: 0,
        left: 0,
        borderRadius: 10,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#ced4d9",
        borderStyle: "solid",
        width: "100%",
        height: isDesktopWeb() ? 56 : 95, // Match container height
    },
    radioButtonContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: isDesktopWeb() ? 56 : 95,
        flexDirection: isDesktopWeb() ? "row" : "column",
        alignItems: isDesktopWeb() ? "center" : "flex-start",
        justifyContent: isDesktopWeb() ? "space-around" : "space-around",
        zIndex: 1,
        paddingHorizontal: isDesktopWeb() ? 2 : 16,
        paddingVertical: isDesktopWeb() ? 0 : 12,
    },
    radioButtonWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: isDesktopWeb() ? "center" : "flex-start",
        gap: isDesktopWeb() ? 8 : 12,
        flex: isDesktopWeb() ? 0 : 0,
        width: isDesktopWeb() ? undefined : "100%",
        paddingVertical: isDesktopWeb() ? 0 : 2,
        maxWidth: isDesktopWeb() ? undefined : "100%",
        ...(isDesktopWeb() ? {
            minWidth: 'auto',
            paddingHorizontal: 2,
        } : {}),
        // Remove default focus outline on web
        ...createWebStyles({ outline: 'none' }),
    },
    licenseError: {
        borderColor: "#ff4938",
    },
    rectangleDiv: {
        width: isDesktopWeb() ? 16 : 18,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: "#9ea6ba",
        borderStyle: "solid",
        height: isDesktopWeb() ? 16 : 18,
        flexShrink: 0,
    },
    radioButtonSelected: {
        backgroundColor: "#1c70e6",
        borderColor: "rgba(255, 255, 255, 0.5)",
    },
    radioButtonError: {
        borderColor: "#ff4938",
    },
    utkadBKod: {
        lineHeight: isDesktopWeb() ? 28 : 20,
        fontSize: isDesktopWeb() ? 13 : 13,
        color: "#262524",
        fontFamily: "Inter",
        flex: isDesktopWeb() ? 0 : 1,
        textAlign: isDesktopWeb() ? "left" : "left",
        flexShrink: 1,
        flexWrap: "nowrap",
        paddingHorizontal: isDesktopWeb() ? 0 : 0,
        ...(isDesktopWeb() ? {
            whiteSpace: 'nowrap',
        } : {}),
    },
    child3: {
        width: isDesktopWeb() ? 16 : 18,
        borderRadius: 3,
        backgroundColor: "#1c70e6",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.5)",
        borderStyle: "solid",
        height: isDesktopWeb() ? 16 : 18,
        flexShrink: 0,
    },
    btn: {
        flex: isDesktopWeb() ? 1 : 0, // Remove flex on mobile
        width: isDesktopWeb() ? undefined : "100%",
        borderRadius: 10,
        backgroundColor: "#262524",
        height: isDesktopWeb() ? 56 : 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 40,
        marginTop: isDesktopWeb() ? 0 : 15, // Reduce margin on mobile
        ...(isDesktopWeb() ? {} : {
            // Remove positioning issues on mobile
            alignSelf: 'stretch',
            minHeight: 52,
        }),
    },
    berkna: {
        letterSpacing: 0.03,
        lineHeight: 20,
        textTransform: "uppercase",
        color: "#fff",
        fontSize: isDesktopWeb() ? 13 : 14,
        fontFamily: "Poppins",
        fontWeight: isDesktopWeb() ? "normal" : "600",
    },
    result: {
        width: "100%",
        position: "relative",
        minHeight: isDesktopWeb() ? 400 : 350,
        borderRadius: 10, // Add border radius to the container
        overflow: "hidden", // Ensure border radius is visible
    },
    resultContainer: {
        position: "relative",
        width: "100%",
        minHeight: isDesktopWeb() ? 400 : 350,
        paddingBottom: isDesktopWeb() ? 20 : 10,
        paddingHorizontal: isDesktopWeb() ? 25 : 0, // Remove horizontal padding on mobile
        paddingTop: isDesktopWeb() ? 20 : 15,
        borderRadius: 10,
    },
    resultBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f8fa",
        borderRadius: 10,
    },
    resultatParent: {
        marginBottom: isDesktopWeb() ? 15 : 12,
        width: "100%",
        maxWidth: isDesktopWeb() ? 586 : "100%",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        ...(isDesktopWeb() ? {} : {
            paddingHorizontal: 0, // Remove horizontal padding on mobile
        }),
    },
    berkningsunderlag: {
        fontSize: isDesktopWeb() ? 20 : 18,
        color: "#181818",
        fontFamily: "Poppins",
        lineHeight: isDesktopWeb() ? 30 : 26,
        width: "100%",
    },
    berkningKlar: {
        fontSize: isDesktopWeb() ? 15 : 14,
        lineHeight: isDesktopWeb() ? 28 : 24,
        fontFamily: "Inter",
        color: "#8c8c8c",
    },
    successText: {
        color: "#12b262",
    },
    errorText: {
        color: "#FF4938",
    },
    vehicleIconsSection: {
        marginTop: isDesktopWeb() ? 10 : 8,
        marginBottom: isDesktopWeb() ? 35 : 25,
        width: "100%",
        height: isDesktopWeb() ? 124 : 100,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: isDesktopWeb() ? 12 : 10,
        ...(isDesktopWeb() ? {} : {
            paddingHorizontal: 0, // Remove horizontal padding on mobile
        }),
    },
    vehicleIconContainer: {
        flex: 1,
        height: isDesktopWeb() ? 124 : 100,
        borderWidth: 2,
        borderColor: "#CED4D9",
        borderRadius: 10,
        backgroundColor: "#f5f8fa",
        justifyContent: 'center',
        alignItems: 'center',
    },
    vehicleIcon: {
        width: isDesktopWeb() ? 85 : 50,
        height: isDesktopWeb() ? 60 : 35,
    },
    berkningsunderlagParent: {
        marginBottom: isDesktopWeb() ? 15 : 12,
        width: "100%",
        maxWidth: isDesktopWeb() ? 586 : "100%",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: isDesktopWeb() ? 15 : 10,
        ...(isDesktopWeb() ? {} : {
            paddingHorizontal: 0, // Remove horizontal padding on mobile
        }),
    },
    frameParent: {
        marginTop: isDesktopWeb() ? 20 : 15,
        width: "100%",
        flexDirection: isDesktopWeb() ? "row" : "column",
        alignItems: "flex-start",
        justifyContent: isDesktopWeb() ? "space-between" : "flex-start",
        gap: isDesktopWeb() ? 12 : 16,
        ...(isDesktopWeb() ? {} : {
            paddingHorizontal: 0, // Remove horizontal padding on mobile
        }),
    },
    errorContainer: {
        backgroundColor: "#FFF5F5",
        borderRadius: 8,
        padding: isDesktopWeb() ? 15 : 12,
        marginHorizontal: isDesktopWeb() ? 0 : 0, // Remove horizontal margin on mobile
        marginBottom: isDesktopWeb() ? 20 : 16, // Add margin below error messages
    },
    kalkylatornAnvnderOfficiell: {
        lineHeight: isDesktopWeb() ? 24 : 24,
        fontSize: isDesktopWeb() ? 14 : 14,
        color: myColors.black,
        fontFamily: "Inter",
        marginBottom: isDesktopWeb() ? 8 : 6,
    },
    infoSectionContainer: {
        marginTop: isDesktopWeb() ? 5 : 10, // Reduce excessive spacing on mobile
        width: "100%",
        paddingHorizontal: isDesktopWeb() ? 0 : 0,
    },
    vehicleInformationSectionAnimated: {
        overflow: 'hidden',
        borderLeftWidth: 0,
        flex: isDesktopWeb() ? 1 : undefined,
        width: isDesktopWeb() ? undefined : "100%",
        marginBottom: 1,
        borderRadius: 8,
        backgroundColor: myColors.white,
    },
    vehicleInformationSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isDesktopWeb() ? 22 : 16,
    },
    vehicleInformationSectionTitle: {
        fontSize: isDesktopWeb() ? 16 : 16,
        color: myColors.black,
        fontWeight: '500',
    },
    vehicleInformationSectionDesktop: {
        flex: isDesktopWeb() ? 1 : undefined,
        width: isDesktopWeb() ? undefined : "100%",
        marginBottom: 1,
        borderRadius: 8,
        backgroundColor: myColors.white,
        overflow: 'hidden',
    },
    animatedDecorativeBar: {
        position: 'absolute',
        left: 0,
        width: isDesktopWeb() ? 5 : 4,
        zIndex: 9,
    },
    resultTextsContainer: {
        marginTop: 10,
        flexDirection: 'column',
        gap: 8,
    },
    mainResultText: {
        fontSize: isDesktopWeb() ? 14 : 14,
        fontWeight: '500',
        color: myColors.black,
        lineHeight: isDesktopWeb() ? 22 : 20,
        textAlign: 'left',
    },
    speedResultText: {
        fontSize: isDesktopWeb() ? 14 : 14,
        fontWeight: '500',
        color: myColors.black,
        lineHeight: isDesktopWeb() ? 22 : 20,
        textAlign: 'left',
    },
    faqSectionBackground: {
        width: '100%',
        marginTop: isDesktopWeb() ? 40 : 30,
    },
    faqSection: {
        paddingVertical: isDesktopWeb() ? 40 : 20,
        paddingHorizontal: 0,
        width: '100%',
        ...(isDesktopWeb() && {
            maxWidth: 1280,
            alignSelf: 'center',
        }),
    },
    faqTitle: {
        fontSize: isDesktopWeb() ? 32 : 28,
        fontWeight: '400',
        color: myColors.text.primary,
        textAlign: 'left',
        marginBottom: isDesktopWeb() ? 40 : 32,
        lineHeight: isDesktopWeb() ? 40 : 36,
        paddingHorizontal: isDesktopWeb() ? 0 : 20,
    },
    infoSectionTitle: {
        fontSize: isDesktopWeb() ? 28 : 24,
        fontWeight: '400',
        color: myColors.text.primary,
        textAlign: 'left',
        marginBottom: isDesktopWeb() ? 20 : 16,
        lineHeight: isDesktopWeb() ? 36 : 32,
        paddingHorizontal: isDesktopWeb() ? 0 : 16,
    },
});

export default TrailerCalculator;