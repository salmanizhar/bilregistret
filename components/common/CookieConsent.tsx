import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Animated,
    Platform,
} from 'react-native';
import MyText from './MyText';
import { myColors } from '@/constants/MyColors';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { createBoxShadow } from '@/utils/shadowHelper';
import { Strong } from './SemanticText';

interface CookieConsentProps {
    visible: boolean;
    onAccept: () => void;
    onDecline: () => void;
    onClose?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({
    visible,
    onAccept,
    onDecline,
    onClose
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(isDesktopWeb() ? -100 : 100)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: isDesktopWeb() ? -100 : 100,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible, fadeAnim, slideAnim]);

    const handleAccept = () => {
        onAccept();
    };

    const handleDecline = () => {
        onDecline();
    };

    const handlePrivacyPolicyPress = () => {
        if (Platform.OS === 'web') {
            window.open('/cookiepolicy', '_blank');
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: isDesktopWeb() 
                        ? [{ translateX: slideAnim }]
                        : [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={styles.consentContainer}>
                {/* Close button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose || handleDecline}
                    accessibilityLabel="Stäng cookie-meddelande"
                    accessibilityHint="Tryck för att stänga cookie-meddelandet"
                >
                    <MyText style={styles.closeText}>×</MyText>
                </TouchableOpacity>

                {/* Cookie icon and text */}
                <View style={styles.headerContainer}>
                    <MyText style={styles.cookieEmoji}>🍪</MyText>
                    <View style={styles.textContainer}>
                        <MyText style={styles.title}>
                            Vi använder cookies
                        </MyText>
                        <MyText style={styles.description}>
                            Vi använder cookies för att förbättra din användarupplevelse.{' '}
                            <TouchableOpacity
                                onPress={handlePrivacyPolicyPress}
                                style={styles.linkContainer}
                            >
                                <Strong style={styles.linkText}>Läs mer</Strong>
                            </TouchableOpacity>
                        </MyText>
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.declineButton]}
                        onPress={handleDecline}
                        accessibilityLabel="Avvisa cookies"
                    >
                        <MyText style={styles.declineButtonText}>
                            Avvisa
                        </MyText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.acceptButton]}
                        onPress={handleAccept}
                        accessibilityLabel="Acceptera cookies"
                    >
                        <MyText style={styles.acceptButtonText}>
                            Acceptera
                        </MyText>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        ...(isDesktopWeb() ? {
            // Desktop: Bottom right corner
            bottom: 20,
            right: 20,
            zIndex: 9999,
        } : {
            // Mobile: Bottom center
            bottom: 20,
            left: 16,
            right: 16,
            zIndex: 9999,
        }),
        ...(Platform.OS === 'android' && {
            elevation: 9999,
        }),
    },
    consentContainer: {
        backgroundColor: myColors.white,
        borderRadius: isDesktopWeb() ? 12 : 16,
        padding: isDesktopWeb() ? 16 : 16,
        maxWidth: isDesktopWeb() ? 380 : '100%',
        width: isDesktopWeb() ? undefined : '100%',
        position: 'relative',
        ...createBoxShadow({
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
        }),
        elevation: 8,
        borderWidth: 1,
        borderColor: myColors.border.light,
    },
    closeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: myColors.primary.light4,
        zIndex: 1,
    },
    closeText: {
        fontSize: 16,
        fontWeight: '600',
        color: myColors.text.secondary,
        lineHeight: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: isDesktopWeb() ? 12 : 12,
        paddingRight: 24, // Space for close button
    },
    cookieEmoji: {
        fontSize: isDesktopWeb() ? 18 : 16,
        marginRight: 8,
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: isDesktopWeb() ? 15 : 14,
        fontWeight: '600',
        color: myColors.text.primary,
        fontFamily: 'Poppins',
        marginBottom: 4,
        lineHeight: isDesktopWeb() ? 20 : 18,
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
        color: myColors.text.placeholderText,
        fontFamily: 'Inter',
    },
    linkContainer: {
        display: 'inline',
    },
    linkText: {
        color: myColors.primary.main,
        textDecorationLine: Platform.OS === 'web' ? 'underline' : 'none',
        fontFamily: 'Inter',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'stretch',
    },
    button: {
        borderRadius: 6,
        paddingVertical: isDesktopWeb() ? 8 : 10,
        paddingHorizontal: isDesktopWeb() ? 12 : 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isDesktopWeb() ? 32 : 40,
        flex: 1,
    },
    acceptButton: {
        backgroundColor: myColors.primary.main,
        ...createBoxShadow({
            shadowColor: myColors.primary.main,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        }),
    },
    declineButton: {
        backgroundColor: myColors.white,
        borderWidth: 1,
        borderColor: myColors.border.light,
        ...createBoxShadow({
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
        }),
    },
    acceptButtonText: {
        color: myColors.white,
        fontSize: isDesktopWeb() ? 12 : 13,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    declineButtonText: {
        color: myColors.text.primary,
        fontSize: isDesktopWeb() ? 12 : 13,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
});

export default CookieConsent; 