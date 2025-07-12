import React, { useState, useRef } from 'react';
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
import { useRouter } from 'expo-router';
import SimpleHeader from '@/components/common/SimpleHeader';
import MyText from '@/components/common/MyText';
import { myColors } from '@/constants/MyColors';
import StatusMessage from '@/components/common/StatusMessage';
import { MyTextInput } from '@/components/common/MyTextInput';
import MyButton from '@/components/common/MyButton';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import { useRequestEmailVerification, useVerifyEmailOtp } from '@/Services/api/hooks';
import { showAlert } from '@/utils/alert';
import { getStatusBarHeight } from '@/constants/commonFunctions';

// Define types for styles
interface Styles {
    container: ViewStyle;
    content: ViewStyle;
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
    blueInput: TextStyle;
    whiteInput: TextStyle;
}

export default function VerifyEmailAddress() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [verificationVisible, setVerificationVisible] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [successVisible, setSuccessVisible] = useState(false);
    const [timerCount, setTimerCount] = useState(30);
    const [isLoading, setIsLoading] = useState(false);

    // Get the verification mutation hooks
    const requestEmailVerification = useRequestEmailVerification();
    const verifyEmailOtp = useVerifyEmailOtp();

    // References for OTP input fields
    const input1Ref = useRef<TextInput>(null);
    const input2Ref = useRef<TextInput>(null);
    const input3Ref = useRef<TextInput>(null);
    const input4Ref = useRef<TextInput>(null);
    const input5Ref = useRef<TextInput>(null);
    const input6Ref = useRef<TextInput>(null);

    const handleGoBack = () => {
        router.back();
    };

    const handleRegister = async () => {
        if (!email || !isValidEmail(email)) {
            return;
        }

        try {
            setIsLoading(true);

            // Call the API to request email verification
            await requestEmailVerification.mutateAsync({
                email: email
            });

            // Show verification screen and start timer
            setVerificationVisible(true);
            startTimer();

        } catch (error: any) {
            showAlert({
                title: 'Fel',
                message: 'Ett fel uppstod vid skickning av verifieringskod. Försök igen.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

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

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleVerifyCode = async () => {
        if (verificationCode.length !== 6) {
            return;
        }

        try {
            setIsLoading(true);

            // Call the API to verify email OTP
            await verifyEmailOtp.mutateAsync({
                email: email,
                otp: verificationCode
            });

            // Show success message
            setSuccessVisible(true);

            // Automatically close the success message after 2 seconds
            setTimeout(() => {
                setSuccessVisible(false);
                router.back();
            }, 2000);

        } catch (error: any) {
            showAlert({
                title: 'Fel',
                message: 'Verifieringskoden är ogiltig. Försök igen.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestNewCode = async () => {
        try {
            setIsLoading(true);

            // Call the API to resend email verification
            await requestEmailVerification.mutateAsync({
                email: email
            });

            // Reset verification code input and restart timer
            setVerificationCode('');
            setTimerCount(30);
            startTimer();

            // Show success message for resend
            showAlert({
                title: 'Framgång',
                message: 'Ny verifieringskod har skickats.',
                type: 'success',
            });

        } catch (error: any) {
            showAlert({
                title: 'Fel',
                message: 'Kunde inte skicka ny verifieringskod. Försök igen senare.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <SimpleHeader
                title={verificationVisible ? "Verifiera E-post" : "Verifierad E-Postadress"}
                onBackPress={handleGoBack}
            />

            {!verificationVisible ? (
                // Email input screen
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                    <View style={styles.content}>
                        <MyTextInput
                            label="E-postadress"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="infocontact@gmail.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="done"
                            onSubmitEditing={() => {
                                Keyboard.dismiss();
                                if (email && isValidEmail(email)) {
                                    handleRegister();
                                }
                            }}
                        />

                        <MyButton
                            title={isLoading ? "SKICKAR..." : "REGISTRERA"}
                            onPress={handleRegister}
                            disabled={!email || !isValidEmail(email) || isLoading}
                        />
                    </View>
                    {/* </TouchableWithoutFeedback> */}
                </ScrollView>
            ) : (
                // Verification code screen
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                    <View style={styles.content}>
                        <View style={styles.otpContainer}>
                            <MyText style={styles.otpTitle}>
                                Ange autentiseringskoden nedan som vi skickade till din e-post.
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
                    {/* </TouchableWithoutFeedback> */}
                </ScrollView>
            )}

            <StatusMessage
                visible={successVisible}
                type="success"
                message="E-post bekräftad."
                autoClose={true}
                showCloseButton={false}
            />
        </View>
    );
}

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
        paddingTop: getStatusBarHeight(),
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        marginTop: -100,
        justifyContent: 'center',
    },
    otpContainer: {
        alignItems: 'center',
        paddingTop: 40,
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
    blueInput: {
        backgroundColor: myColors.primary.light4,
    },
    whiteInput: {
        backgroundColor: myColors.white,
    },
});