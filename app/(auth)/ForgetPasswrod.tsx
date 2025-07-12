import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    Platform,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView,
    ViewStyle,
    TextStyle,
    Alert
} from 'react-native';
import { router } from 'expo-router';
import SimpleHeader from '@/components/common/SimpleHeader';
import MyText from '@/components/common/MyText';
import { myColors } from '@/constants/MyColors';
import StatusMessage from '@/components/common/StatusMessage';
import { MyTextInput } from '@/components/common/MyTextInput';
import MyButton from '@/components/common/MyButton';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import { MaxPasswordLength } from '@/constants/commonConst';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useForgetPassword } from '@/Services/api/hooks/auth.hooks';
import { showAlert } from '@/utils/alert';
import { isDesktopWeb, isTablet } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import WebWideHeader from '@/components/common/header.web';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define types for styles
interface Styles {
    container: ViewStyle;
    otpContainer: ViewStyle;
    otpTitle: TextStyle;
    emailDisplay: TextStyle;
    otpInputContainer: ViewStyle;
    otpInputsRow: ViewStyle;
    otpSingleInput: TextStyle;
    timerContainer: ViewStyle;
    timer: TextStyle;
    resendContainer: ViewStyle;
    resendText: TextStyle;
    resendLink: TextStyle;
    resendLinkDisabled: TextStyle;
    infoContainer: ViewStyle;
    infoTextContainer: ViewStyle;
    infoText: TextStyle;
    errorContainer: ViewStyle;
    errorText: TextStyle;
    titleSection: ViewStyle;
    title: TextStyle;
    formContainer: ViewStyle;
    scrollViewContent: ViewStyle;
    stepContent: ViewStyle;
    passwordFormContainer: ViewStyle;
    inputWrapper: ViewStyle;
}

// Create validation schema for password with Yup
const PasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
        .min(6, 'Lösenordet måste vara minst 6 tecken')
        .required('Ange ett nytt lösenord'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Lösenorden matchar inte')
        .required('Bekräfta ditt nya lösenord')
});

// Interface for password form values
interface PasswordFormValues {
    newPassword: string;
    confirmPassword: string;
}

export default function ForgetPassword() {
    // State for multi-step flow
    const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [timerCount, setTimerCount] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [isPasswordInfoVisible, setIsPasswordInfoVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [resetToken, setResetToken] = useState<string | null>(null);

    const { requestReset, verifyOTP, changePassword } = useForgetPassword();

    // Initial password form values
    const initialPasswordValues: PasswordFormValues = {
        newPassword: '',
        confirmPassword: ''
    };

    // References for OTP input fields
    const input1Ref = useRef<TextInput>(null);
    const input2Ref = useRef<TextInput>(null);
    const input3Ref = useRef<TextInput>(null);
    const input4Ref = useRef<TextInput>(null);
    const input5Ref = useRef<TextInput>(null);
    const input6Ref = useRef<TextInput>(null);

    // Close password info tooltip after delay
    useEffect(() => {
        if (isPasswordInfoVisible) {
            setTimeout(() => {
                setIsPasswordInfoVisible(false);
            }, 3000);
        }
    }, [isPasswordInfoVisible]);

    const handleGoBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            return;
        }
        router.push('/login');
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle sending the password reset email
    const handleSendResetEmail = async () => {
        if (!email || !isValidEmail(email)) {
            showAlert({
                title: 'Fel',
                message: 'Ange en giltig e-postadress.',
                type: 'error',
            });

            return;
        }

        try {
            setIsLoading(true);
            const response = await requestReset.mutateAsync({ customer_email: email });
            setUserId(response.userId || null);
            setCurrentStep(2);
            startTimer();
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            showAlert({
                title: 'Fel',
                message: error.message || 'Ett fel uppstod vid skickning av återställningskod. Försök igen.',
                type: 'error',
            });
        }
    };

    // OTP timer functions
    const startTimer = () => {
        let timer = 30;
        const interval = setInterval(() => {
            if (timer > 0) {
                timer -= 1;
                setTimerCount(timer);
            } else {
                clearInterval(interval);
            }
        }, 1000);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Handle OTP verification
    const handleVerifyCode = async () => {
        if (verificationCode.length !== 6 || !userId) {
            showAlert({
                title: 'Fel',
                message: 'Ange en giltig verifieringskod.',
                type: 'error',
            });
            return;
        }

        try {
            setIsLoading(true);
            const response = await verifyOTP.mutateAsync({
                userId,
                otp: verificationCode
            });
            setResetToken(response.resetToken || null);
            setCurrentStep(3);
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            showAlert({
                title: 'Fel',
                message: 'Verifieringskoden är ogiltig. Försök igen.',
                type: 'error',
            });
        }
    };

    // Handle requesting a new OTP code
    const handleRequestNewCode = async () => {
        try {
            setIsLoading(true);
            const response = await requestReset.mutateAsync({ customer_email: email });
            setUserId(response.userId || null);
            setVerificationCode('');
            setTimerCount(30);
            startTimer();
            setIsLoading(false);
            showAlert({
                title: 'Framgång',
                message: 'Ny verifieringskod har skickats.',
                type: 'success',
            });
        } catch (error: any) {
            setIsLoading(false);
            showAlert({
                title: 'Fel',
                message: error.message || 'Kunde inte skicka ny verifieringskod. Försök igen senare.',
                type: 'error',
            });
        }
    };

    // Handle password reset submission
    const handlePasswordReset = async (values: PasswordFormValues) => {
        if (!resetToken) return;

        try {
            setIsLoading(true);
            await changePassword.mutateAsync({
                resetToken,
                newPassword: values.newPassword
            });
            setSuccessVisible(true);
            setIsLoading(false);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: any) {
            setIsLoading(false);
            const errorMsg = error.message || 'Någonting gick fel. Försök igen senare.';
            setErrorMessage(errorMsg);
            showAlert({
                title: 'Fel',
                message: errorMsg,
                type: 'error',
            });
        }
    };

    // Render step 1: Email input
    const renderEmailStep = () => {
        return (
            <View style={styles.stepContent}>
                <MyTextInput
                    label="E-postadress"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="infocontact@gmail.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSendResetEmail}
                />

                <MyButton
                    title={isLoading ? "SKICKAR..." : "ÅTERSTÄLL LÖSENORD"}
                    onPress={handleSendResetEmail}
                    disabled={!email || !isValidEmail(email) || isLoading}
                />
            </View>
        );
    };

    // Render step 2: OTP verification
    const renderOtpStep = () => {
        return (
            <View style={styles.stepContent}>
                <View style={styles.otpContainer}>
                    <MyText style={styles.otpTitle}>
                        Ange återställningskoden som vi skickade till din e-post.
                    </MyText>
                    <MyText style={styles.emailDisplay}>
                        {email}
                    </MyText>

                    {/* OTP CODE FIELD */}
                    <View style={styles.otpInputContainer}>
                        <View style={styles.otpInputsRow}>
                            <TextInput
                                style={[styles.otpSingleInput]}
                                value={verificationCode.length > 0 ? verificationCode[0] : ''}
                                onChangeText={(text) => {
                                    if (/^[0-9]$/.test(text)) {
                                        const newCode = text + verificationCode.substring(1);
                                        setVerificationCode(newCode);
                                        // Auto-focus next input
                                        if (text) {
                                            input2Ref.current?.focus();
                                        }
                                    } else if (text === '') {
                                        // Handle backspace
                                        setVerificationCode(verificationCode.substring(1));
                                    }
                                }}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                ref={input1Ref}
                            />
                            <TextInput
                                style={[styles.otpSingleInput]}
                                value={verificationCode.length > 1 ? verificationCode[1] : ''}
                                onChangeText={(text) => {
                                    if (/^[0-9]$/.test(text)) {
                                        const newCode = verificationCode.substring(0, 1) + text + verificationCode.substring(2);
                                        setVerificationCode(newCode);
                                        // Auto-focus next input
                                        if (text) {
                                            input3Ref.current?.focus();
                                        }
                                    } else if (text === '') {
                                        // Handle backspace
                                        const newCode = verificationCode.substring(0, 1) + verificationCode.substring(2);
                                        setVerificationCode(newCode);
                                        // Focus previous input
                                        input1Ref.current?.focus();
                                    }
                                }}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                ref={input2Ref}
                            />
                            <TextInput
                                style={[styles.otpSingleInput]}
                                value={verificationCode.length > 2 ? verificationCode[2] : ''}
                                onChangeText={(text) => {
                                    if (/^[0-9]$/.test(text)) {
                                        const newCode = verificationCode.substring(0, 2) + text + verificationCode.substring(3);
                                        setVerificationCode(newCode);
                                        // Auto-focus next input
                                        if (text) {
                                            input4Ref.current?.focus();
                                        }
                                    } else if (text === '') {
                                        // Handle backspace
                                        const newCode = verificationCode.substring(0, 2) + verificationCode.substring(3);
                                        setVerificationCode(newCode);
                                        // Focus previous input
                                        input2Ref.current?.focus();
                                    }
                                }}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                ref={input3Ref}
                            />
                            <TextInput
                                style={[styles.otpSingleInput]}
                                value={verificationCode.length > 3 ? verificationCode[3] : ''}
                                onChangeText={(text) => {
                                    if (/^[0-9]$/.test(text)) {
                                        const newCode = verificationCode.substring(0, 3) + text + verificationCode.substring(4);
                                        setVerificationCode(newCode);
                                        // Auto-focus next input
                                        if (text) {
                                            input5Ref.current?.focus();
                                        }
                                    } else if (text === '') {
                                        // Handle backspace
                                        const newCode = verificationCode.substring(0, 3) + verificationCode.substring(4);
                                        setVerificationCode(newCode);
                                        // Focus previous input
                                        input3Ref.current?.focus();
                                    }
                                }}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                ref={input4Ref}
                            />
                            <TextInput
                                style={[styles.otpSingleInput]}
                                value={verificationCode.length > 4 ? verificationCode[4] : ''}
                                onChangeText={(text) => {
                                    if (/^[0-9]$/.test(text)) {
                                        const newCode = verificationCode.substring(0, 4) + text + verificationCode.substring(5);
                                        setVerificationCode(newCode);
                                        // Auto-focus next input
                                        if (text) {
                                            input6Ref.current?.focus();
                                        }
                                    } else if (text === '') {
                                        // Handle backspace
                                        const newCode = verificationCode.substring(0, 4) + verificationCode.substring(5);
                                        setVerificationCode(newCode);
                                        // Focus previous input
                                        input4Ref.current?.focus();
                                    }
                                }}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                ref={input5Ref}
                            />
                            <TextInput
                                style={[styles.otpSingleInput]}
                                value={verificationCode.length > 5 ? verificationCode[5] : ''}
                                onChangeText={(text) => {
                                    if (/^[0-9]$/.test(text)) {
                                        const newCode = verificationCode.substring(0, 5) + text;
                                        setVerificationCode(newCode);
                                        Keyboard.dismiss();
                                        // If we have a complete code, verify automatically
                                        // if (verificationCode.length === 5) {
                                        //     setTimeout(() => handleVerifyCode(), 500);
                                        // }
                                    } else if (text === '') {
                                        // Handle backspace
                                        const newCode = verificationCode.substring(0, 5);
                                        setVerificationCode(newCode);
                                        // Focus previous input
                                        input5Ref.current?.focus();
                                    }
                                }}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                ref={input6Ref}
                            />
                        </View>
                    </View>

                    <View style={styles.timerContainer}>
                        <SvgXml xml={ImagePath.SvgIcons.SettingsOTPClockIcon} width={20} height={20} />
                        <MyText style={styles.timer}>{formatTime(timerCount)}</MyText>
                    </View>

                    <View style={styles.resendContainer}>
                        <MyText style={styles.resendText}>Fick du inte koden? </MyText>
                        <TouchableOpacity onPress={handleRequestNewCode} disabled={timerCount > 0 || isLoading}>
                            <MyText style={timerCount > 0 || isLoading ? styles.resendLinkDisabled : styles.resendLink}>
                                Begär en ny kod
                            </MyText>
                        </TouchableOpacity>
                    </View>
                </View>

                <MyButton
                    title={isLoading ? "VERIFIERAR..." : "VERIFIERA"}
                    onPress={handleVerifyCode}
                    disabled={verificationCode.length !== 6 || isLoading}
                />
            </View>
        );
    };

    // Render step 3: New password form
    const renderPasswordStep = () => {
        return (
            <Formik
                initialValues={initialPasswordValues}
                validationSchema={PasswordSchema}
                onSubmit={handlePasswordReset}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View style={styles.passwordFormContainer}>
                        <View>
                            <MyTextInput
                                label="Nytt lösenord"
                                placeholder="Ange nytt lösenord"
                                value={values.newPassword}
                                onChangeText={handleChange('newPassword')}
                                onBlur={handleBlur('newPassword')}
                                error={touched.newPassword && errors.newPassword ? errors.newPassword : undefined}
                                isPassword={true}
                                maxLength={MaxPasswordLength}
                                LabelRightComponent={
                                    <View style={styles.infoContainer}>
                                        <TouchableOpacity onPress={() => {
                                            setIsPasswordInfoVisible(true);
                                        }}>
                                            <SvgXml xml={ImagePath.SvgIcons.SettingsInfoIcon} />
                                        </TouchableOpacity>
                                    </View>
                                }
                            />

                            {isPasswordInfoVisible &&
                                <View style={styles.infoTextContainer}>
                                    <MyText style={styles.infoText}>
                                        Ditt nya lösenord måste vara olika från tidigare använda lösenord.
                                    </MyText>
                                </View>
                            }
                        </View>

                        <MyTextInput
                            label="Bekräfta lösenord"
                            placeholder="Bekräfta ditt nya lösenord"
                            value={values.confirmPassword}
                            onChangeText={handleChange('confirmPassword')}
                            onBlur={handleBlur('confirmPassword')}
                            error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                            isPassword={true}
                            maxLength={MaxPasswordLength}
                        />

                        {errorMessage && (
                            <View style={styles.errorContainer}>
                                <MyText style={styles.errorText}>{errorMessage}</MyText>
                            </View>
                        )}

                        <MyButton
                            title={isLoading ? "BEARBETAR..." : "STÄLL IN NYTT LÖSENORD"}
                            onPress={() => handleSubmit()}
                            disabled={isLoading}
                        />
                    </View>
                )}
            </Formik>
        );
    };

    const getScreenTitle = () => {
        switch (currentStep) {
            case 1:
                return "Glömt Lösenord";
            case 2:
                return "Verifiera Kod";
            case 3:
                return "Nytt Lösenord";
            default:
                return "Glömt Lösenord";
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => {
            if (Platform.OS !== 'web') {
                setIsPasswordInfoVisible(false);
                Keyboard.dismiss();
            }
        }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <SafeAreaView style={styles.container} edges={['top']}>
                    <View style={[styles.container, {}]}>

                        <FooterWrapper
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollViewContent}
                        >
                            <View style={styles.inputWrapper}>
                                <DesktopViewWrapper>
                                    {/* Desktop Title */}
                                    {isDesktopWeb() ? <View style={styles.titleSection}>
                                        <MyText fontFamily='Poppins' style={styles.title}>{getScreenTitle()}</MyText>
                                    </View> : null}

                                    {/* Mobile Header - Only show on mobile */}
                                    {!isDesktopWeb() && (
                                        <SimpleHeader
                                            title={getScreenTitle()}
                                            onBackPress={handleGoBack}
                                        />
                                    )}

                                    <View style={styles.formContainer}>
                                        {currentStep === 1 && renderEmailStep()}
                                        {currentStep === 2 && renderOtpStep()}
                                        {currentStep === 3 && renderPasswordStep()}
                                    </View>
                                </DesktopViewWrapper>
                            </View>
                        </FooterWrapper>

                        <StatusMessage
                            visible={successVisible}
                            type="success"
                            message="Lösenord återställt."
                            autoClose={true}
                            showCloseButton={false}
                        />
                    </View>
                </SafeAreaView>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
        // paddingTop: isDesktopWeb() ? 0 : (Platform.OS === "ios" ? 60 : (StatusBar.currentHeight ?? 50) + 10),
    },

    otpContainer: {
        alignItems: 'center',
        paddingTop: 40,
        width: isDesktopWeb() ? 400 : '100%',
        alignSelf: 'center',
    },
    otpTitle: {
        fontSize: 16,
        color: myColors.text.primary,
        textAlign: 'center',
        marginBottom: 20,
    },
    emailDisplay: {
        fontSize: 16,
        color: myColors.text.primary,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 40,
    },
    otpInputContainer: {
        width: '100%',
        marginBottom: 24,
    },
    otpInputsRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        alignSelf: 'center',
    },
    otpSingleInput: {
        width: 40,
        height: 50,
        fontSize: 22,
        backgroundColor: "#DEEAFC",
        borderRadius: 8,
        color: myColors.text.primary,
        textAlign: 'center',
        // Add shadow and border
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginHorizontal: 3,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    timer: {
        fontSize: 15,
        color: myColors.primary.main,
        marginLeft: 8,
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    resendText: {
        fontSize: 15,
        color: myColors.baseColors.lightGray3,
    },
    resendLink: {
        fontSize: 16,
        color: myColors.black,
        fontWeight: 'semibold',
        textDecorationLine: 'underline',
    },
    resendLinkDisabled: {
        fontSize: 16,
        color: myColors.baseColors.lightGray1,
        fontWeight: 'semibold',
        textDecorationLine: 'underline',
    },
    passwordFormContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        marginTop: -100,
        justifyContent: 'center',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    infoTextContainer: {
        width: '70%',
        position: 'absolute',
        top: -60,
        right: 20,
        backgroundColor: myColors.white,
        padding: 10,
        borderRadius: 10,
    },
    infoText: {
        fontSize: 13,
        color: myColors.baseColors.lightGray3,
    },
    errorContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: 5,
    },
    errorText: {
        color: myColors.primary.main,
        fontSize: 13,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: isDesktopWeb() ? -60 : 0,
    },
    title: {
        fontSize: isDesktopWeb() ? 32 : 28,
        fontWeight: 'bold',
        color: myColors.text.primary,
        textAlign: 'center',
        marginTop: isDesktopWeb() ? 30 : 20,
    },
    formContainer: {
        // marginHorizontal: isDesktopWeb() ? undefined : 20,
        // marginTop: isDesktopWeb() ? -40 : 0,
        marginVertical: isDesktopWeb() ? 100 : "20%",
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    stepContent: {
        flex: 1,
        paddingHorizontal: isDesktopWeb() ? 0 : 20,
        paddingTop: 20,
        justifyContent: 'center',
    },
    inputWrapper: {
        minWidth: isDesktopWeb() ? 600 : undefined,
        maxWidth: isDesktopWeb() ? 900 : undefined,
        alignSelf: isDesktopWeb() ? "center" : undefined
    }
});
