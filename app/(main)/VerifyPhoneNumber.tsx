import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    Platform,
    TextInput,
    Modal,
    FlatList,
    ViewStyle,
    TextStyle,
    ColorValue,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
    Alert
} from 'react-native';
import { router, useRouter } from 'expo-router';
import SimpleHeader from '@/components/common/SimpleHeader';
import MyText from '@/components/common/MyText';
import { myColors } from '@/constants/MyColors';
import { SvgXml } from 'react-native-svg';
import StatusMessage from '@/components/common/StatusMessage';
import { MyTextInput } from '@/components/common/MyTextInput';
import AllCountryList from '@/constants/AllCountryList.json';
import MyButton from '@/components/common/MyButton';
import { ImagePath } from '@/assets/images';
import { useRequestPhoneVerification, useVerifyPhoneOtp } from '@/Services/api/hooks';
import { showAlert } from '@/utils/alert';
import { getStatusBarHeight } from '@/constants/commonFunctions';
// Icons

const dropdownArrow = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 9L12 15L18 9" stroke="#8F8F8F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Sample list of countries with codes and flags
const countryList = AllCountryList;

// Define types for styles
interface Styles {
    container: ViewStyle;
    content: ViewStyle;
    instruction: TextStyle;
    instructionUnderline: TextStyle;
    phoneInputContainer: ViewStyle;
    countrySelector: ViewStyle;
    countryCode: TextStyle;
    phoneInputWrapper: ViewStyle;
    phoneInput: TextStyle;
    submitButton: ViewStyle;
    disabledButton: ViewStyle;
    buttonText: TextStyle;
    otpContainer: ViewStyle;
    otpTitle: TextStyle;
    phoneDisplay: TextStyle;
    otpInputContainer: ViewStyle;
    otpInputsRow: ViewStyle;
    otpInputBox: ViewStyle;
    otpSingleInput: TextStyle;
    otpInput: TextStyle;
    timerContainer: ViewStyle;
    timer: TextStyle;
    resendContainer: ViewStyle;
    resendText: TextStyle;
    resendLink: TextStyle;
    resendLinkDisabled: TextStyle;
    modalOverlay: ViewStyle;
    modalContent: ViewStyle;
    modalHeader: ViewStyle;
    modalTitle: TextStyle;
    cancelButton: TextStyle;
    countryList: ViewStyle;
    countryItem: ViewStyle;
    countryItemContent: ViewStyle;
    countryName: TextStyle;
}

export default function VerifyPhoneNumber() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpVisible, setOtpVisible] = useState(false);
    const [otp, setOtp] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(countryList[214]); // Sweden
    const [timerCount, setTimerCount] = useState(30);
    const [successVisible, setSuccessVisible] = useState(false);
    const [countryModalVisible, setCountryModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get the verification mutation hooks
    const requestPhoneVerification = useRequestPhoneVerification();
    const verifyPhoneOtp = useVerifyPhoneOtp();

    // References for OTP input fields
    const input1Ref = React.useRef<TextInput>(null);
    const input2Ref = React.useRef<TextInput>(null);
    const input3Ref = React.useRef<TextInput>(null);
    const input4Ref = React.useRef<TextInput>(null);
    const input5Ref = React.useRef<TextInput>(null);
    const input6Ref = React.useRef<TextInput>(null);

    const handleGoBack = () => {
        router.back();
    };

    const handleSubmitPhone = async () => {
        if (!phoneNumber) {
            return;
        }

        try {
            setIsLoading(true);

            // Format the phone number with country code
            const formattedPhoneNumber = `${selectedCountry.phone_code}${phoneNumber}`;

            // Call the API to request verification
            await requestPhoneVerification.mutateAsync({
                telephone_number: formattedPhoneNumber
            });

            // Show OTP screen and start timer
            setOtpVisible(true);
            startTimer();

        } catch (error: any) {
            showAlert({
                title: 'Fel',
                message: 'Ett fel uppstod vid skickning av OTP. Försök igen.',
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

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            return;
        }

        try {
            setIsLoading(true);

            // Format the phone number with country code
            const formattedPhoneNumber = `${selectedCountry.phone_code}${phoneNumber}`;

            // Call the API to verify OTP
            await verifyPhoneOtp.mutateAsync({
                telephone_number: formattedPhoneNumber,
                otp: otp
            });

            // Show success message
            setSuccessVisible(true);

        } catch (error: any) {
            showAlert({
                title: 'Fel',
                message: 'OTP-verifiering misslyckades. Var god försök igen.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setIsLoading(true);

            // Format the phone number with country code
            const formattedPhoneNumber = `${selectedCountry.phone_code}${phoneNumber}`;

            // Call the API to resend OTP
            await requestPhoneVerification.mutateAsync({
                telephone_number: formattedPhoneNumber
            });

            // Reset OTP input and restart timer
            setOtp('');
            setTimerCount(30);
            startTimer();

            // Show success message for resend
            showAlert({
                title: 'Framgång',
                message: 'Ny OTP-kod har skickats.',
                type: 'success',
            });

        } catch (error: any) {
            showAlert({
                title: 'Fel',
                message: 'Kunde inte skicka ny OTP. Försök igen senare.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseSuccess = () => {
        setSuccessVisible(false);
        router.push('/(main)/account/konto/losenord-och-sakerhet');
    };

    const openCountryModal = () => {
        setCountryModalVisible(true);
    };

    const selectCountry = (country: typeof countryList[0]) => {
        setSelectedCountry(country);
        setCountryModalVisible(false);
    };

    const renderCountryItem = ({ item }: { item: typeof countryList[0] }) => (
        <TouchableOpacity
            style={styles.countryItem}
            onPress={() => selectCountry(item)}
        >
            <View style={styles.countryItemContent}>
                <MyText style={styles.countryName}>{item.icon} ({item.phone_code}) {item.name}</MyText>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <SimpleHeader
                title={otpVisible ? "Verifiera OTP" : "Telefonnummer"}
                onBackPress={handleGoBack}
            />

            {!otpVisible ? (
                // Phone number input screen
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                    <View style={styles.content}>
                        <MyText style={styles.instruction}>
                            Vänligen ange ditt telefonnummer för att skicka en OTP.
                        </MyText>

                        <View style={styles.phoneInputContainer}>
                            <TouchableOpacity
                                style={styles.countrySelector}
                                onPress={openCountryModal}
                            >

                                <MyText style={styles.countryCode}>{selectedCountry.icon} ({selectedCountry.phone_code}) {selectedCountry.name}</MyText>
                                <SvgXml xml={dropdownArrow} width={24} height={24} />
                            </TouchableOpacity>

                            <MyTextInput
                                placeholder="Telefonnummer"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                containerStyle={styles.phoneInputWrapper}
                                inputStyle={styles.phoneInput}
                            />
                        </View>

                        <MyButton
                            title={isLoading ? "SKICKAR..." : "KOM IGÅNG"}
                            onPress={handleSubmitPhone}
                            disabled={!phoneNumber || isLoading}
                        />
                    </View>
                    {/* </TouchableWithoutFeedback> */}
                </ScrollView>
            ) : (
                // OTP verification screen
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                    <View style={styles.content}>
                        <View style={styles.otpContainer}>
                            <MyText style={styles.otpTitle}>
                                OTP-kod har skickats till
                            </MyText>
                            <MyText style={styles.phoneDisplay}>
                                {selectedCountry.phone_code} {phoneNumber}
                            </MyText>

                            {/* OTP CODE FIELD */}
                            <View style={styles.otpInputContainer}>
                                <View style={styles.otpInputsRow}>
                                    <TextInput
                                        style={[styles.otpSingleInput]}
                                        value={otp.length > 0 ? otp[0] : ''}
                                        onChangeText={(text) => {
                                            if (/^[0-9]$/.test(text)) {
                                                const newOtp = text + otp.substring(1);
                                                setOtp(newOtp);
                                                // Auto-focus next input
                                                if (text) {
                                                    input2Ref.current?.focus();
                                                }
                                            } else if (text === '') {
                                                // Handle backspace
                                                setOtp(otp.substring(1));
                                            }
                                        }}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        textAlign="center"
                                        ref={input1Ref}
                                    />
                                    <TextInput
                                        style={[styles.otpSingleInput]}
                                        value={otp.length > 1 ? otp[1] : ''}
                                        onChangeText={(text) => {
                                            if (/^[0-9]$/.test(text)) {
                                                const newOtp = otp.substring(0, 1) + text + otp.substring(2);
                                                setOtp(newOtp);
                                                // Auto-focus next input
                                                if (text) {
                                                    input3Ref.current?.focus();
                                                }
                                            } else if (text === '') {
                                                // Handle backspace
                                                const newOtp = otp.substring(0, 1) + otp.substring(2);
                                                setOtp(newOtp);
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
                                        value={otp.length > 2 ? otp[2] : ''}
                                        onChangeText={(text) => {
                                            if (/^[0-9]$/.test(text)) {
                                                const newOtp = otp.substring(0, 2) + text + otp.substring(3);
                                                setOtp(newOtp);
                                                // Auto-focus next input
                                                if (text) {
                                                    input4Ref.current?.focus();
                                                }
                                            } else if (text === '') {
                                                // Handle backspace
                                                const newOtp = otp.substring(0, 2) + otp.substring(3);
                                                setOtp(newOtp);
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
                                        value={otp.length > 3 ? otp[3] : ''}
                                        onChangeText={(text) => {
                                            if (/^[0-9]$/.test(text)) {
                                                const newOtp = otp.substring(0, 3) + text + otp.substring(4);
                                                setOtp(newOtp);
                                                // Auto-focus next input
                                                if (text) {
                                                    input5Ref.current?.focus();
                                                }
                                            } else if (text === '') {
                                                // Handle backspace
                                                const newOtp = otp.substring(0, 3) + otp.substring(4);
                                                setOtp(newOtp);
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
                                        value={otp.length > 4 ? otp[4] : ''}
                                        onChangeText={(text) => {
                                            if (/^[0-9]$/.test(text)) {
                                                const newOtp = otp.substring(0, 4) + text + otp.substring(5);
                                                setOtp(newOtp);
                                                // Auto-focus next input
                                                if (text) {
                                                    input6Ref.current?.focus();
                                                }
                                            } else if (text === '') {
                                                // Handle backspace
                                                const newOtp = otp.substring(0, 4) + otp.substring(5);
                                                setOtp(newOtp);
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
                                        value={otp.length > 5 ? otp[5] : ''}
                                        onChangeText={(text) => {
                                            if (/^[0-9]$/.test(text)) {
                                                const newOtp = otp.substring(0, 5) + text;
                                                setOtp(newOtp);
                                                // Dismiss keyboard after last input
                                                Keyboard.dismiss();
                                            } else if (text === '') {
                                                // Handle backspace
                                                const newOtp = otp.substring(0, 5);
                                                setOtp(newOtp);
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
                                <SvgXml xml={ImagePath.SvgIcons.SettingsOTPClockIcon} />
                                <MyText style={styles.timer}>{formatTime(timerCount)}</MyText>
                            </View>

                            <View style={styles.resendContainer}>
                                <MyText style={styles.resendText}>Fick du inte koden? </MyText>
                                <TouchableOpacity onPress={handleResendOtp} disabled={timerCount > 0 || isLoading}>
                                    <MyText style={timerCount > 0 || isLoading ? styles.resendLinkDisabled : styles.resendLink}>Skicka OTP igen</MyText>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <MyButton
                            title={isLoading ? "VERIFIERAR..." : "BEKRÄFTA"}
                            onPress={handleVerifyOtp}
                            disabled={otp.length !== 6 || isLoading}
                        />
                    </View>
                    {/* </TouchableWithoutFeedback> */}
                </ScrollView>
            )}

            {/* Country Selection Modal */}
            <Modal
                visible={countryModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCountryModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                                <MyText style={styles.cancelButton}>Avbryt</MyText>
                            </TouchableOpacity>
                            <MyText style={styles.modalTitle}>Välj land</MyText>
                            <View style={{ width: 40 }} />
                        </View>
                        <FlatList
                            data={countryList}
                            renderItem={renderCountryItem}
                            keyExtractor={(item) => item.id.toString()}
                            style={styles.countryList}
                        />
                    </View>
                </View>
            </Modal>

            <StatusMessage
                visible={successVisible}
                type="success"
                message="Telefonnummer verifierat."
                onClose={handleCloseSuccess}
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
        marginTop: -100,
        justifyContent: 'center',
    },
    instruction: {
        fontSize: 16,
        color: myColors.text.primary,
        marginBottom: 24,
    },
    instructionUnderline: {
        fontSize: 16,
        color: myColors.text.primary,
        marginBottom: 24,
        textDecorationLine: 'underline',
    },
    phoneInputContainer: {
        marginBottom: 30,
        backgroundColor: "#DEEAFC",
        borderRadius: 8,
    },
    countrySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: myColors.white,
        // borderRadius: 8,
        paddingVertical: 12,
        paddingEnd: 12,
        // marginBottom: 16,
    },
    countryCode: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: myColors.text.primary,
    },
    phoneInputWrapper: {
        marginBottom: 0,
    },
    phoneInput: {
        borderRadius: 8,
        backgroundColor: myColors.transparent,
        borderWidth: 0,
        borderTopWidth: 1
    },
    submitButton: {
        backgroundColor: myColors.black,
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: myColors.baseColors.lightGray2,
    },
    buttonText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    otpContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    otpTitle: {
        fontSize: 16,
        color: myColors.text.primary,
        textAlign: 'center',
    },
    phoneDisplay: {
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
        width: '80%',
        alignSelf: 'center',
    },
    otpInputBox: {
        width: '22%',
        marginHorizontal: 0,
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
    otpInput: {
        width: '100%',
        height: 50,
        fontSize: 24,
        letterSpacing: 20,
        backgroundColor: myColors.white,
        borderRadius: 8,
        padding: 12,
        color: myColors.text.primary,
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: myColors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: myColors.text.primary,
    },
    cancelButton: {
        color: myColors.primary.main,
        fontSize: 16,
    },
    countryList: {
        padding: 16,
    },
    countryItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    countryItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryName: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: myColors.text.primary,
    },
    blueInput: {
        backgroundColor: myColors.primary.light4,
    },
    whiteInput: {
        backgroundColor: myColors.white,
    },
});