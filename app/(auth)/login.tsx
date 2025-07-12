import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, ViewStyle, TextStyle, ImageStyle, Platform, StatusBar, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import MyText from '@/components/common/MyText';
import { MyTextInput } from '@/components/common/MyTextInput';
import { ImagePath } from '@/assets/images';
import { myStyles } from '@/Styles/myStyles';
import { myColors } from '@/constants/MyColors';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Checkbox from 'expo-checkbox';
import MyButton from '@/components/common/MyButton';
import { MaxEmailLength, MaxPasswordLength } from '@/constants/commonConst';
import { SvgXml } from 'react-native-svg';
import { useAuth } from '@/Services/api/context/auth.context';
import { getRememberMe, setRememberMe, getSavedEmail, setSavedEmail } from '@/utils/storage';
import { BORDER_RADIUS, MYSCREEN } from '@/constants/Dimentions';
import { isTablet } from '@/utils/deviceInfo';
import SocialMediaSigninMobile from '@/components/common/SocialMediaSigninMobile';
import SocialMediaSigninWeb from '@/components/common/SocialMediaSigninWeb';
import { showAlert } from '@/utils/alert';
import { isDesktopWeb } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import WebWideHeader from '@/components/common/header.web';
import { safeNavigation } from '@/utils/safeNavigation';
import AuthMessageScreen from '@/components/auth/AuthMessageScreen';


interface LoginFormValues {
    email: string;
    password: string;
}

// Valideringsschema
const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Ogiltig e-postadress')
        .required('E-postadress är obligatorisk'),
    password: Yup.string()
        .min(6, 'Lösenordet måste vara minst 6 tecken långt')
        .required('Lösenord är obligatoriskt'),
});

export default function Login() {
    const [rememberMe, setRememberMeState] = useState(false);
    const [authMessage, setAuthMessage] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);
    const { login, isLoading, error } = useAuth();
    const [showSessionExpiredMessage, setShowSessionExpiredMessage] = useState(false);

    // Load saved preferences when component mounts
    useEffect(() => {
        const loadSavedPreferences = async () => {
            try {
                const savedRememberMe = await getRememberMe();
                setRememberMeState(savedRememberMe);

                // Check if user was redirected here due to 401 error
                if (typeof global !== 'undefined' && global.returnToPath === '401_redirect') {
                    setShowSessionExpiredMessage(true);
                }
            } catch (err) {
                // // console.log('Error loading saved preferences:', err);
            }
        };

        loadSavedPreferences();

        return () => {
            setShowSessionExpiredMessage(false);
        }
    }, []);

    const handleLogin = async (values: LoginFormValues) => {
        global_loader_ref?.show_loader(1);
        try {
            // Save remember me preference if checked
            if (rememberMe) {
                await setRememberMe(true);
                await setSavedEmail(values.email);
            } else {
                await setRememberMe(false);
                await setSavedEmail('');
            }

            const result = await login({
                customer_email: values.email,
                password: values.password
            });

            // Check if login is pending approval
            if (result && 'error' in result && 
                (result.error === 'WAITING_APPROVAL_FROM_BILREGISTRET' || 
                 result.error === 'WAITING_APPROVAL_FROM_ORGANIZATION_OWNER')) {
                // Set approval pending state
                setAuthMessage({
                    title: result.title || 'Hej! Tack för din ansökan.',
                    message: result.message || 'Ditt konto väntar på godkännande.',
                    type: 'success'
                });
                return;
            }
        } catch (err) {
            // Show login error screen instead of popup
            let errorMessage = 'Vi kunde inte logga in dig med de angivna uppgifterna. Kontrollera din e-postadress och lösenord och försök igen.';
            
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else if (error) {
                errorMessage = typeof error === 'string' ? error : error.message || errorMessage;
            }
            
            setAuthMessage({
                title: 'Inloggningen misslyckades',
                message: errorMessage,
                type: 'error'
            });

        } finally {
            // Clear the return path
            global.returnToPath = undefined;
            global_loader_ref?.show_loader(0);
        }
    };

    const handleNavigateToRegisterScreen = () => {
        router.push('/registrera');
    };

    const handleNavigateToForgetPasswordScreen = () => {
        safeNavigation('/forgetpasswrod' as any);
    };

    const navigateToHomeScreen = () => {
        router.push('/(main)');
    };

    // If there's an auth message (approval pending or error), show the message screen
    if (authMessage) {
        return (
            <AuthMessageScreen 
                title={authMessage.title} 
                message={authMessage.message}
                type={authMessage.type} 
            />
        );
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={[styles.container, {}]}>
                    {/* Desktop Web Header */}

                    <FooterWrapper
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        <View style={styles.inputWrapper}>
                            <StatusBar barStyle="dark-content" backgroundColor={myColors.primary.main} />
                            <DesktopViewWrapper>
                                {/* Brand Icon - Only show on mobile */}
                                {!isDesktopWeb() && (
                                    <TouchableOpacity onPress={navigateToHomeScreen}>
                                        <SvgXml
                                            xml={ImagePath.SvgIcons.BilregistretBannerIconBlack}
                                            height={70}
                                            width={170}
                                            style={{
                                                alignSelf: "center",
                                            }}
                                        />
                                    </TouchableOpacity>
                                )}

                                {/* Login Title */}
                                {isDesktopWeb() ? <View style={styles.titleSection}>
                                    <MyText fontFamily='Poppins' style={styles.title}>Logga in</MyText>
                                </View> : null}


                                {showSessionExpiredMessage && (
                                    <View style={styles.sessionExpiredContainer}>
                                        <MyText style={styles.sessionExpiredText}>
                                            Du är nu utloggad. {"\n\n"}
                                            Vi hoppas att du fick det du behövde. Välkommen tillbaka när som helst!
                                        </MyText>
                                    </View>
                                )}

                                <Formik<LoginFormValues>
                                    initialValues={{ email: '', password: '' }}
                                    validationSchema={LoginSchema}
                                    onSubmit={handleLogin}
                                >
                                    {({ handleChange, handleSubmit, handleBlur, values, errors, touched, setFieldValue }) => {
                                        // Load saved email when component mounts and remember me is true
                                        useEffect(() => {
                                            const loadSavedEmail = async () => {
                                                if (rememberMe) {
                                                    const savedEmail = await getSavedEmail();
                                                    if (savedEmail) {
                                                        setFieldValue('email', savedEmail);
                                                    }
                                                }
                                            };

                                            loadSavedEmail();
                                        }, [rememberMe]);

                                        return (
                                            <View style={styles.formContainer}>
                                                {Platform.OS === 'web' ? <SocialMediaSigninWeb /> : <SocialMediaSigninMobile />}
                                                <View style={styles.dividerContainer}>
                                                    <View style={styles.divider} />
                                                    <MyText style={styles.orText}>eller logga in med</MyText>
                                                    <View style={styles.divider} />
                                                </View>
                                                <View style={styles.inputContainer}>
                                                    <MyTextInput
                                                        placeholder="Ange e-postadress"
                                                        value={values.email}
                                                        onChangeText={handleChange('email')}
                                                        onBlur={handleBlur('email')}
                                                        error={touched.email ? errors.email : undefined}
                                                        keyboardType="email-address"
                                                        autoCapitalize="none"
                                                        maxLength={MaxEmailLength}
                                                        isAuthInput={true}
                                                    />

                                                    <MyTextInput
                                                        placeholder="Ange ditt lösenord"
                                                        value={values.password}
                                                        onChangeText={handleChange('password')}
                                                        onBlur={handleBlur('password')}
                                                        error={touched.password ? errors.password : undefined}
                                                        isPassword={true}
                                                        containerStyle={{ marginTop: 1 }}
                                                        maxLength={MaxPasswordLength}
                                                        isAuthInput={true}
                                                    />
                                                </View>

                                                <View style={styles.rememberForgotContainer}>
                                                    <View style={styles.checkboxContainer}>
                                                        <Checkbox
                                                            value={rememberMe}
                                                            onValueChange={(value) => {
                                                                setRememberMeState(value);
                                                            }}
                                                            color={rememberMe ? myColors.black : undefined}
                                                            style={styles.checkbox}
                                                        />
                                                        <MyText style={myStyles.grayText14}>Kom ihåg mig</MyText>
                                                    </View>
                                                </View>
                                                <MyButton
                                                    title={isLoading ? 'LOGGAR IN...' : 'LOGGA IN'}
                                                    onPress={() => handleSubmit()}
                                                    buttonStyle={styles.loginButton}
                                                    disabled={isLoading}
                                                />

                                                <MyButton
                                                    title="REGISTRERA DIG"
                                                    onPress={handleNavigateToRegisterScreen}
                                                    buttonStyle={styles.guestLoginButton}
                                                    disabled={isLoading}
                                                />

                                                <View style={styles.loginTopContentWrapper}>
                                                    <View style={styles.dontHaveAccountWrapper}>
                                                        <MyText style={myStyles.grayText14}>Glömt ditt lösenord? </MyText>
                                                        <TouchableOpacity onPress={handleNavigateToForgetPasswordScreen}>
                                                            <MyText style={myStyles.grayText14Link}>Återställ det här</MyText>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    }}
                                </Formik>
                            </DesktopViewWrapper>
                        </View>
                    </FooterWrapper>
                </View>
            </SafeAreaView>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
        paddingBottom: isDesktopWeb() ? 0 : (isTablet() ? 750 : 250),
    },
    formContainer: {
        marginHorizontal: isDesktopWeb() ? undefined : 20,
        // marginTop: isDesktopWeb() ? 20 : 20,
        // maxWidth: isDesktopWeb() ? 500 : undefined,
        marginVertical: 20,
        marginTop: isDesktopWeb() ? -40 : 0,
    },
    title: {
        fontSize: isDesktopWeb() ? 32 : 28,
        fontWeight: 'bold',
        color: myColors.text.primary,
        textAlign: 'center',
        marginTop: isDesktopWeb() ? 30 : 20,
    },
    inputContainer: {
        // marginTop: -5
        borderRadius: BORDER_RADIUS.Regular,
        overflow: 'hidden',
        marginTop: 20
    },
    rememberForgotContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        marginRight: 8,
        borderRadius: 4,
        backgroundColor: myColors.white,
        borderColor: myColors.border.light,
        borderWidth: 1,
        height: 23,
        width: 23,
    },
    rememberMeText: {
        fontSize: 14,
        color: myColors.text.secondary,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: myColors.primary.main,
    },
    headerImage: {
        height: isTablet() ? "100%" : "65%",
        width: "auto"
    },
    loginTopContentWrapper: {
        // top: -55,
        // alignItems: "center",
        marginTop: 20,
        alignSelf: "flex-end",
    },
    loginTxt: {
        fontSize: 32
    },
    dontHaveAccountWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    loginButton: {
        backgroundColor: myColors.black,
    },
    guestLoginButton: {
        backgroundColor: myColors.primary.main,
    },
    loader: {
        marginTop: 10
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: myColors.border.light,
    },
    orText: {
        paddingHorizontal: 10,
        color: myColors.text.secondary,
        fontSize: 14,
    },
    forgetPasswordRowWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    sessionExpiredContainer: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)', // Light red background
        padding: 15,
        top: -30,
        borderRadius: BORDER_RADIUS.Regular,
        marginHorizontal: 20,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)', // Light red border
    },
    sessionExpiredText: {
        color: '#FF3B30', // Red text
        fontSize: 14,
        textAlign: 'center',
    },
    titleSection: {
        marginBottom: 50,
    },
    scrollViewContent: {
        // paddingBottom: isDesktopWeb() ? 30 : 20,
    },
    inputWrapper: {
        minWidth: isDesktopWeb() ? 600 : undefined,
        maxWidth: isDesktopWeb() ? 900 : undefined,
        alignSelf: isDesktopWeb() ? "center" : undefined
    }
});