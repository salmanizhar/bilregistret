import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
    TextInput,
    TextInputProps,
    StyleSheet,
    View,
    TextStyle,
    ViewStyle,
    Alert,
    TouchableOpacity,
    StyleProp,
    Platform,
} from 'react-native';
import { myColors } from '@/constants/MyColors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyText from '@/components/common/MyText';
import { showAlert } from '@/utils/alert';
import { createWebStyles } from '@/utils/shadowHelper';
import { IconClose, IconHourglass, IconSearch } from '@/assets/icons';
import { isDesktopWeb } from '@/utils/deviceInfo';

// Create a custom interface that properly handles both placeholder and style
interface RegistrationNumberInputProps {
    onChangeText?: (text: string) => void;
    iconColor?: string;
    onSearchResult?: (result: any) => void;
    placeholder?: React.ReactNode;
    style?: StyleProp<TextStyle>;
    customLeftIcon?: React.ReactNode;
    hideIcon?: boolean;
    // Include all other TextInput props except placeholder
    [key: string]: any;
}

export type RegistrationNumberInputRef = {
    focus: () => void;
    blur: () => void;
};

// Swedish license plate format: XXX YYZ where X is letter, Y is number, Z is any letter or number
// Less strict pattern - minimum 3 letters followed by anything
const INITIAL_FORMAT_REGEX = /^[A-Z]{3}.*$/;
const PLATE_FORMAT_REGEX = /^[A-Z]{3}\s?[0-9]{2}[A-Z0-9]$/;

const RegistrationNumberInput = forwardRef<RegistrationNumberInputRef, RegistrationNumberInputProps>(({
    style,
    onChangeText,
    placeholder = 'Registreringsnummer / VIN',
    placeholderTextColor = myColors.text.placeholder,
    iconColor,
    onSearchResult,
    customLeftIcon,
    hideIcon = false,
    ...props
}, ref) => {
    const [value, setValue] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = React.useRef<TextInput>(null);

    // Determine icon color - default to text.secondary
    let searchIconColor = iconColor || myColors.text.secondary;

    // If a color is specified in the style prop, use that
    if (style && typeof style === 'object' && 'color' in style) {
        const textStyle = style as TextStyle;
        if (textStyle.color) {
            searchIconColor = textStyle.color as string;
        }
    }

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        },
        blur: () => {
            inputRef.current?.blur();
        }
    }));

    // Perform search when input matches the license plate format
    useEffect(() => {
        const validateAndSearch = async () => {
            // Only proceed if it matches our format and we're not already searching
            if (PLATE_FORMAT_REGEX.test(value) && !isSearching) {
                // // console.log('Format matched, performing search');
                // Enforce proper format (3 letters, space, 3 characters)
                let formattedValue = value;
                if (!formattedValue.includes(' ')) {
                    formattedValue = `${formattedValue.slice(0, 3)} ${formattedValue.slice(3)}`;
                    setValue(formattedValue);
                }
                performSearch(formattedValue);
            }
        };

        validateAndSearch();
    }, [value]);

    // Handle both submit editing and key press events to cover all platforms
    const handleSubmitEditing = () => {
        // // console.log('Submit editing triggered');
        if (value.length >= 3) {
            performSearch(value);
        }
    };

    // Handle the Enter key press to trigger search
    const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
        // // console.log('Key pressed:', nativeEvent.key);
        if (nativeEvent.key === 'Enter' || nativeEvent.key === 'Done') {
            if (value.length >= 3) {
                // If not in proper format but has at least 3 chars, search anyway
                performSearch(value);
            }
        }
    };

    // Check if user is authenticated
    const checkAuthentication = async (): Promise<boolean> => {
        const token = await AsyncStorage.getItem('token');
        return !!token;
    };

    // Search for a vehicle by license plate
    const performSearch = async (licensePlate: string) => {
        // // console.log('Performing search for:', licensePlate);
        if (isSearching) {
            // // console.log('Already searching, ignoring request');
            return;
        }

        setIsSearching(true);

        try {
            // Format the license plate for display and API
            let displayPlate = licensePlate;
            if (!displayPlate.includes(' ') && displayPlate.length >= 6) {
                displayPlate = `${displayPlate.slice(0, 3)} ${displayPlate.slice(3)}`;
            }
            const formattedPlate = displayPlate.replace(/\s/g, '');

            // // console.log(`Attempting to navigate for license plate: ${formattedPlate}`);

            // IMPORTANT: Force blur the input to ensure keyboard is dismissed
            inputRef.current?.blur();

            // Immediate navigation - use a timeout to ensure UI updates first
            setTimeout(() => {
                try {
                    const carObject = {
                        // id: Date.now().toString(), // Generate a unique ID
                        regNumber: displayPlate.replace(/\s+/g, ""),
                        // carModel: 'Sökresultat' // This will be replaced by the API result
                    };

                    if (onSearchResult) {
                        // Using callback for navigation - pass the car object
                        // // console.log('Using callback for navigation with car object:', carObject);
                        onSearchResult(carObject);
                    } else {
                        // Direct navigation - use the same format as handleCarPress in SearchBar
                        // // console.log('Direct navigation to CarDetails with car object');
                        router.push({
                            pathname: '/(main)/biluppgifter/[regnr]',
                            params: {
                                regnr: carObject.regNumber
                            }
                        });
                    }

                    // No background API call - we rely on the API call in the destination component
                    setIsSearching(false);

                } catch (navError) {
                    showAlert({
                        title: 'Navigation Error',
                        message: 'Could not navigate to car details.',
                        type: 'error',
                    });

                    setIsSearching(false);
                }
            }, 100);
        } catch (error) {
            //      // console.log('Error in search:', error);
            setIsSearching(false);
            showAlert({
                title: 'Error',
                message: 'An error occurred during search.',
                type: 'error',
            });
        }
    };

    // Format the registration number:
    // 1. Convert to uppercase
    // 2. Add space after the first 3 characters if:
    //    - First 3 characters are letters
    //    - 4th character is a number or remaining characters would make a valid plate
    const handleChangeText = (text: string) => {
        // Remove any existing spaces first to handle editing
        let rawText = text.replace(/\s/g, '').toUpperCase();

        // Don't allow more than 6 characters (3 letters + 3 digits/letters)
        if (rawText.length > 6) {
            rawText = rawText.substring(0, 6);
        }

        // Format with a space when pattern matches XXX[0-9]
        let formattedText = rawText;

        // If we have at least 3 characters and they're all letters
        if (rawText.length >= 3 && /^[A-Z]{3}/.test(rawText)) {
            // Insert space after the first 3 characters
            formattedText = `${rawText.slice(0, 3)}${rawText.length > 3 ? ' ' + rawText.slice(3) : ''}`;
        }

        setValue(formattedText);

        // Call the parent's onChangeText if provided
        if (onChangeText) {
            onChangeText(formattedText);
        }
    };

    return (
        <View style={[styles.container, style as any]}>
            <TouchableOpacity
                style={styles.inputContainer}
                activeOpacity={1}
                onPress={() => inputRef.current?.focus()}
            >
                {!hideIcon && (customLeftIcon ? customLeftIcon : isSearching ? <IconHourglass size={20} color={searchIconColor} style={styles.searchIcon} /> : <IconSearch size={20} color={searchIconColor} style={styles.searchIcon} />)}


                {/* {value === '' && (
                    <View style={styles.placeholderContainer}>
                        {typeof placeholder === 'string' ? (
                            <MyText style={{ fontSize: 16, color: placeholderTextColor }}>{placeholder}</MyText>
                        ) : (
                            placeholder
                        )}
                    </View>
                )} */}
                <TextInput
                    ref={inputRef}
                    style={[
                        styles.input,
                        createWebStyles({
                            fontSize: 16, // Prevent zoom on mobile web
                            outline: 'none', // Remove blue outline on web
                        }),
                        style
                    ]}
                    autoFocus={isDesktopWeb() ? false : true}
                    value={value}
                    onChangeText={handleChangeText}
                    onSubmitEditing={handleSubmitEditing}
                    onKeyPress={handleKeyPress}
                    autoCapitalize="characters"
                    maxLength={7}
                    returnKeyType="search"
                    placeholderTextColor={placeholderTextColor}
                    placeholder={placeholder}
                    blurOnSubmit={true}
                    maxFontSizeMultiplier={1}
                    keyboardType={Platform.OS === 'ios' ? 'default' : 'default'}
                    {...(Platform.OS === 'web' && {
                        autoComplete: 'off',
                        autoCorrect: false,
                        spellCheck: false,
                        autoCapitalize: 'none',
                        inputMode: 'text',
                        enterKeyHint: 'search'
                    })}
                    {...props}
                />
                {value.length > 0 && (
                    <TouchableOpacity onPress={() => handleChangeText('')}>
                        <IconClose size={20} color={myColors.text.primary} style={styles.clearIcon} />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        height: '100%',
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: myColors.text.primary,
        backgroundColor: 'transparent',
    },
    placeholderContainer: {
        position: 'absolute',
        left: 30,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'flex-start',
        pointerEvents: 'none',
    },
    placeholder: {
        fontSize: 16,
    },
    clearIcon: {
        marginLeft: 10,
    },
});

export default RegistrationNumberInput;