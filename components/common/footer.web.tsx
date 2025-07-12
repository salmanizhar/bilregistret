import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';
import { SvgXml } from 'react-native-svg';
import { BilregistretBannerIconWhite } from '@/assets/images/SvgIcons';
import { APP_STORE_URL, desktopWebViewport, GOOGLE_PLAY_URL } from '@/constants/commonConst';
import moment from 'moment';
import { router } from 'expo-router';
import { XLogo } from '@/assets/images/SvgIcons';
import {
    IconFacebook,
    IconInstagram,
    IconLinkedIn,
    IconApple,
    IconGooglePlay,
    IconArrowForward
} from '@/assets/icons';

/**
 * Desktop-only footer that mirrors the design provided in Figma while remaining
 * fully responsive inside a centred, max-width container. The component uses
 * React-Native primitives so it renders correctly in both Expo Web & Native,
 * but it will only be mounted for Desktop Web (see _layout.tsx).
 */
const WebWideFooter: React.FC = () => {
    // Track window width so we can cap the inner container to a reasonable max-width
    const [width, setWidth] = useState(Dimensions.get('window').width);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const emailInputRef = useRef<TextInput>(null);

    useEffect(() => {
        const sub = Dimensions.addEventListener('change', ({ window }) => setWidth(window.width));
        return () => sub?.remove();
    }, []);

    const contentHorizontalPadding = width < 1440 ? 24 : 48; // breathe a bit on smaller/larger screens
    const maxContentWidth = desktopWebViewport; // keeps things tidy on very wide screens

    // Handle navigation
    const handleNavigation = (route: string) => {
        if (Platform.OS === 'web') {
            router.navigate(route as any);
        } else {
            router.push(route as any);
        }
    };

    // Handle newsletter submission
    const handleNewsletterSubmit = async () => {
        if (!email.trim()) {
            Alert.alert('Fel', 'Vänligen ange en e-postadress');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Fel', 'Vänligen ange en giltig e-postadress');
            return;
        }

        setIsSubmitting(true);

        try {
            // Here you would typically make an API call to subscribe the user
            // For now, we'll just show a success message
            Alert.alert('Tack!', 'Du har prenumererat på vårt nyhetsbrev.');
            setEmail(''); // Clear the input
        } catch (error) {
            Alert.alert('Fel', 'Något gick fel. Försök igen senare.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle input container click to focus input
    const handleInputContainerPress = () => {
        emailInputRef.current?.focus();
    };

    return (
        <View style={styles.container}>
            {/* Max-width centred wrapper */}
            <View style={[styles.contentContainer, {
                paddingHorizontal: contentHorizontalPadding,
                maxWidth: maxContentWidth,
            }]}
            >
                {/* Top section – logo, nav, social */}
                <View style={styles.topSection}>
                    {/* Left – Logo */}
                    <TouchableOpacity onPress={() => handleNavigation('/(main)')}>
                        <SvgXml
                            xml={BilregistretBannerIconWhite}
                            width={185}
                            height={42}
                        />
                    </TouchableOpacity>

                    {/* Middle – navigation links */}
                    <View style={styles.navRow}>
                        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('/paket')}>
                            <MyText color="white" fontFamily="Poppins" uppercase style={styles.navText}>Paket</MyText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('/(main)/biluppgifter/')}>
                            <MyText color="white" fontFamily="Poppins" uppercase style={styles.navText}>Biluppgifter</MyText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('/tillverkare')}>
                            <MyText color="white" fontFamily="Poppins" uppercase style={styles.navText}>Bilmärken</MyText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('/om-oss')}>
                            <MyText color="white" fontFamily="Poppins" uppercase style={styles.navText}>Om oss</MyText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('/kontakt')}>
                            <MyText color="white" fontFamily="Poppins" uppercase style={styles.navText}>Kontakt</MyText>
                        </TouchableOpacity>
                    </View>

                    {/* Right – social icons */}
                    <View style={styles.socialRow}>
                        <a href="https://www.facebook.com/profile.php?id=61573589331744" target="_blank" rel="noopener noreferrer">
                            <TouchableOpacity>
                                <IconFacebook size={16} color="white" />
                            </TouchableOpacity>
                        </a>
                        <a href="https://www.instagram.com/bilregistret/#/" target="_blank" rel="noopener noreferrer">
                            <TouchableOpacity>
                                <IconInstagram size={16} color="white" />
                            </TouchableOpacity>
                        </a>
                        <a href="https://x.com/bilregistret" target="_blank" rel="noopener noreferrer">
                            <TouchableOpacity>
                                <SvgXml xml={XLogo} />
                            </TouchableOpacity>
                        </a>
                        <a href="https://www.linkedin.com/in/bilregistret-ai-63ba56335/" target="_blank" rel="noopener noreferrer">
                            <TouchableOpacity>
                                <IconLinkedIn size={16} color="white" />
                            </TouchableOpacity>
                        </a>
                    </View>
                </View>

                {/* Middle section – Newsletter & Store buttons */}
                <View style={styles.middleSection}>
                    {/* Newsletter */}
                    <View style={styles.newsletterContainer}>
                        <MyText color="white" fontFamily="Inter" style={styles.newsletterTitle}>Prenumerera på nyhetsbrevet</MyText>
                        <TouchableOpacity
                            style={styles.newsletterInputRow}
                            onPress={handleInputContainerPress}
                            activeOpacity={1}
                        >
                            <TextInput
                                placeholder="Ange din e-postadress"
                                placeholderTextColor="#9EA6BA"
                                style={styles.newsletterInput}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                ref={emailInputRef}
                                blurOnSubmit={false}
                                selectTextOnFocus={false}
                            />
                            <TouchableOpacity
                                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                                onPress={handleNewsletterSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <MyText color="white" fontSize={12}>...</MyText>
                                ) : (
                                    <IconArrowForward size={20} color="white" />
                                )}
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>

                    {/* Store badges */}
                    <View style={styles.storeButtonsRow}>
                        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <TouchableOpacity style={styles.storeButton}>
                                <IconApple size={25} color="white" style={{ marginRight: 14 }} />
                                <View>
                                    <MyText color="#9EA6BA" fontSize={13}>Ladda ner på</MyText>
                                    <MyText color="white" fontFamily="Poppins" fontSize={15}>Apple Store</MyText>
                                </View>
                            </TouchableOpacity>
                        </a>
                        <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <TouchableOpacity style={styles.storeButton}>
                                <IconGooglePlay size={25} color="white" style={{ marginRight: 14 }} />
                                <View>
                                    <MyText color="#9EA6BA" fontSize={13}>Ladda ner på</MyText>
                                    <MyText color="white" fontFamily="Poppins" fontSize={15}>Google Play</MyText>
                                </View>
                            </TouchableOpacity>
                        </a>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Bottom bar */}
                <View style={styles.bottomBar}>
                    <View style={styles.termsRow}>
                        <TouchableOpacity onPress={() => handleNavigation('/anvandarvillkor')}>
                            <MyText color="#9EA6BA" fontFamily="Poppins" uppercase fontSize={13}>Användarvillkor</MyText>
                        </TouchableOpacity>
                        <View style={styles.bullet} />
                        <TouchableOpacity onPress={() => handleNavigation('/cookiepolicy')}>
                            <MyText color="#9EA6BA" fontFamily="Poppins" uppercase fontSize={13}>Cookiepolicy</MyText>
                        </TouchableOpacity>
                        <View style={styles.bullet} />
                        <TouchableOpacity onPress={() => handleNavigation('/sekretesspolicy')}>
                            <MyText color="#9EA6BA" fontFamily="Poppins" uppercase fontSize={13}>Sekretesspolicy</MyText>
                        </TouchableOpacity>
                    </View>

                    {/* Payment icons row repeated bottom? kept to centre earlier; leave gap */}
                    <MyText color="#9EA6BA" fontSize={13}>© {moment().year()} Bilregistret.ai | Alla rättigheter reserverade. Ansvarig utgivare: Alen Rasic, databasens namn: bilregistret.ai</MyText>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#141414',
        height: 350,
    },
    contentContainer: {
        alignSelf: 'center',
        width: '100%',
    },
    // Top section
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 40,
    },
    logo: {
        width: 185,
        height: 42,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 40,
    },
    navItem: {
    },
    navText: {
        fontSize: 13,
        letterSpacing: 0.52,
    },
    socialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },

    // Middle section
    middleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 20,
        marginTop: 40,
    },
    newsletterContainer: {
        flex: 1,
        minWidth: 300,
        maxWidth: 420,
    },
    newsletterTitle: {
        fontSize: 15,
        marginBottom: 12,
    },
    newsletterInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    newsletterInput: {
        flex: 1,
        height: 50,
        borderRadius: 6,
        backgroundColor: '#262524',
        paddingHorizontal: 20,
        color: 'white',
        fontSize: 13,
    },
    submitButton: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: myColors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -45, // overlaps input's right padding
    },
    submitButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    storeButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        flexShrink: 1,
    },
    storeButton: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        minWidth: 180,
        height: 60,
    },

    divider: {
        height: 1,
        backgroundColor: 'rgba(158, 166, 186, 0.12)',
        marginTop: 40,
        marginBottom: 20,
    },

    // Bottom bar
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,

    },
    bullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'white',
    },
});

export default WebWideFooter;