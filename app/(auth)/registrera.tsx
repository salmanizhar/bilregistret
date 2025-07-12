import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MyText from '@/components/common/MyText';
import { MyTextInput } from '@/components/common/MyTextInput';
import { ImagePath } from '@/assets/images';
import { myStyles } from '@/Styles/myStyles';
import { myColors } from '@/constants/MyColors';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Checkbox from 'expo-checkbox';
import MyButton from '@/components/common/MyButton';
import { MaxEmailLength, MaxNameLength } from '@/constants/commonConst';
import { SvgXml } from 'react-native-svg';
import { useAuth } from '@/Services/api/context/auth.context';
import { isTablet } from '@/utils/deviceInfo';
import { BORDER_RADIUS } from '@/constants/Dimentions';
import KeyboardAvoidingWrapper from '@/components/common/KeyboardAvoidingWrapper';
import { showAlert } from '@/utils/alert';
import SocialMediaSigninMobile from '@/components/common/SocialMediaSigninMobile';
import SocialMediaSigninWeb from '@/components/common/SocialMediaSigninWeb';
import { isDesktopWeb } from '@/utils/deviceInfo';
import ApprovalPendingScreen from '@/components/auth/ApprovalPendingScreen';
import { desktopWebViewport } from '@/constants/commonConst';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import WebWideHeader from '@/components/common/header.web';
import { safeNavigation } from '@/utils/safeNavigation';

interface RegistrationFormValues {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTermsAndConditions: boolean;
    organization_name?: string;
    organization_number?: string;
    telephone_number?: string;
}

// Valideringsschema
const RegistrationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Namn är obligatoriskt')
        .max(MaxNameLength, `Namnet får vara högst ${MaxNameLength} tecken långt`),
    email: Yup.string()
        .email('Ogiltig e-postadress')
        .required('E-postadress är obligatorisk')
        .max(MaxEmailLength, `E-postadressen får vara högst ${MaxEmailLength} tecken lång`),
    password: Yup.string()
        .min(6, 'Lösenordet måste vara minst 6 tecken långt')
        .required('Lösenord är obligatoriskt'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Lösenorden måste stämma överens')
        .required('Bekräfta lösenord är obligatoriskt'),
    acceptTermsAndConditions: Yup.boolean()
        .oneOf([true], 'Du måste acceptera villkoren')
        .required('Du måste acceptera villkoren'),
    organization_name: Yup.string(),
    organization_number: Yup.string(),
    telephone_number: Yup.string(),
    // telephone_number: Yup.string()
    //     .required('Telefonnummer är obligatoriskt')
    //     .min(8, 'Telefonnumret måste vara minst 8 tecken långt')
    //     .max(13, 'Telefonnumret får vara högst 13 tecken långt')
});

export default function Registration() {
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [approvalPending, setApprovalPending] = useState<{ title: string; message: string } | null>(null);
    const { register, isLoading, error } = useAuth();

    const handleRegistration = async (values: RegistrationFormValues) => {
        try {
            const result = await register({
                customer_email: values.email,
                password: values.password,
                name: values.name,
                organization_name: values.organization_name || '',
                organization_number: values.organization_number || '',
                telephone_number: values.telephone_number || ''
            });

            // Check if registration is pending approval
            if (result && 'error' in result && 
                (result.error === 'WAITING_APPROVAL_FROM_BILREGISTRET' || 
                 result.error === 'WAITING_APPROVAL_FROM_ORGANIZATION_OWNER')) {
                // Set approval pending state
                setApprovalPending({
                    title: result.title || 'Hej! Tack för din ansökan.',
                    message: result.message || 'Din registrering väntar på godkännande.'
                });
                return;
            }

            // If registration is successful, navigate to Home screen
            router.replace('/(main)');
        } catch (err) {
            showAlert({
                title: 'Registration Failed',
                message: error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Failed to create account. Please try again.'),
                type: 'error',
            });
        } finally {
            // Clear the return path
            global.returnToPath = undefined;
        }
    };

    const handleNavigateToLoginScreen = () => {
        router.push('/(auth)/login');
    }

    const navigateToHomeScreen = () => {
        router.push('/(main)');
    };

    // If approval is pending, show the approval pending screen
    if (approvalPending) {
        return (
            <ApprovalPendingScreen 
                title={approvalPending.title} 
                message={approvalPending.message} 
            />
        );
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.container}>

                    <FooterWrapper
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        <View style={styles.inputWrapper}>
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

                                {/* Registration Title */}
                                {isDesktopWeb() ? <View style={styles.titleSection}>
                                    <MyText fontFamily='Poppins' style={styles.title}>Registrera dig</MyText>
                                </View> : null}

                                <Formik<RegistrationFormValues>
                                    initialValues={{
                                        name: "",
                                        email: '',
                                        password: '',
                                        confirmPassword: "",
                                        acceptTermsAndConditions: false,
                                        organization_name: '',
                                        organization_number: '',
                                        telephone_number: ''
                                    }}
                                    validationSchema={RegistrationSchema}
                                    onSubmit={handleRegistration}
                                >
                                    {({ handleChange, handleSubmit, handleBlur, values, errors, touched, setFieldValue }) => (
                                        <View style={styles.formContainer}>
                                            <View style={styles.inputContainer}>
                                                <MyTextInput
                                                    placeholder="Ange namn"
                                                    value={values.name}
                                                    onChangeText={handleChange('name')}
                                                    onBlur={handleBlur('name')}
                                                    error={touched.name ? errors.name : undefined}
                                                    autoCapitalize="none"
                                                    maxLength={MaxNameLength}
                                                    isAuthInput={true}
                                                />

                                                <MyTextInput
                                                    placeholder="Ange e-postadress"
                                                    value={values.email}
                                                    onChangeText={handleChange('email')}
                                                    onBlur={handleBlur('email')}
                                                    error={touched.email ? errors.email : undefined}
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                    containerStyle={{ marginTop: 1 }}
                                                    isAuthInput={true}
                                                />

                                                {/* <MyTextInput
                                    placeholder="Ange ditt telefonnummer"
                                    value={values.telephone_number}
                                    onChangeText={handleChange('telephone_number')}
                                    onBlur={handleBlur('telephone_number')}
                                    error={touched.telephone_number ? errors.telephone_number : undefined}
                                    keyboardType="phone-pad"
                                    containerStyle={{ marginTop: 5 }}
                                /> */}

                                                <MyTextInput
                                                    placeholder="Ange lösenord"
                                                    value={values.password}
                                                    onChangeText={handleChange('password')}
                                                    onBlur={handleBlur('password')}
                                                    error={touched.password ? errors.password : undefined}
                                                    isPassword={true}
                                                    containerStyle={{ marginTop: 1 }}
                                                    isAuthInput={true}
                                                />

                                                <MyTextInput
                                                    placeholder="Bekräfta lösenord"
                                                    value={values.confirmPassword}
                                                    onChangeText={handleChange('confirmPassword')}
                                                    onBlur={handleBlur('confirmPassword')}
                                                    error={touched.confirmPassword ? errors.confirmPassword : undefined}
                                                    isPassword={true}
                                                    containerStyle={{ marginTop: 1 }}
                                                    isAuthInput={true}
                                                />

                                                <MyTextInput
                                                    placeholder="Ange ditt företagsnamn (valfritt)"
                                                    value={values.organization_name}
                                                    onChangeText={handleChange('organization_name')}
                                                    onBlur={handleBlur('organization_name')}
                                                    error={touched.organization_name ? errors.organization_name : undefined}
                                                    containerStyle={{ marginTop: 1 }}
                                                    isAuthInput={true}
                                                />
                                                <MyTextInput
                                                    placeholder="Organisationsnummer (valfritt)"
                                                    value={values.organization_number}
                                                    onChangeText={handleChange('organization_number')}
                                                    onBlur={handleBlur('organization_number')}
                                                    error={touched.organization_number ? errors.organization_number : undefined}
                                                    keyboardType="phone-pad"
                                                    containerStyle={{ marginTop: 1 }}
                                                    isAuthInput={true}
                                                />

                                            </View>
                                            <View style={styles.rememberForgotContainer}>
                                                <View style={styles.checkboxContainer}>
                                                    <Checkbox
                                                        value={values.acceptTermsAndConditions}
                                                        onValueChange={(value) => {
                                                            setFieldValue('acceptTermsAndConditions', value);
                                                            setAcceptTerms(value);
                                                        }}
                                                        color={values.acceptTermsAndConditions ? myColors.black : undefined}
                                                        style={styles.checkbox}
                                                    />
                                                    <MyText style={myStyles.grayText14}>Jag accepterar </MyText>
                                                    <TouchableOpacity onPress={() => safeNavigation('/(auth)/sekretesspolicy')}>
                                                        <MyText style={myStyles.blueText14Link}>Villkoren</MyText>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {touched.acceptTermsAndConditions && errors.acceptTermsAndConditions && (
                                                <MyText style={styles.errorText}>{errors.acceptTermsAndConditions}</MyText>
                                            )}

                                            <MyButton
                                                title={isLoading ? 'REGISTRERAR...' : 'REGISTRERA DIG'}
                                                onPress={() => handleSubmit()}
                                                buttonStyle={styles.registerButton}
                                            />

                                            <MyButton
                                                title="LOGGA IN"
                                                onPress={handleNavigateToLoginScreen}
                                                buttonStyle={styles.guestLoginButton}
                                            />

                                            <View style={styles.RegistrationTopContentWrapper}>
                                                <View style={styles.dontHaveAccountWrapper}>

                                                </View>
                                            </View>

                                            <View style={styles.dividerContainer}>
                                                <View style={styles.divider} />
                                                <MyText style={styles.orText}>eller logga in med</MyText>
                                                <View style={styles.divider} />
                                            </View>

                                            {Platform.OS === 'web' ? <SocialMediaSigninWeb /> : <SocialMediaSigninMobile />}

                                            {isLoading && (
                                                <ActivityIndicator
                                                    size="small"
                                                    color={myColors.primary.main}
                                                    style={styles.loader}
                                                />
                                            )}
                                        </View>
                                    )}
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
        marginBottom: -30,

    },
    formContainer: {
        // marginHorizontal: isDesktopWeb() ? 'auto' : 20,
        // marginTop: isDesktopWeb() ? 20 : 10,
        // maxWidth: isDesktopWeb() ? 500 : undefined,
        // marginTop: -30
        marginHorizontal: isDesktopWeb() ? undefined : 20,
        marginVertical: 20,
    },
    title: {
        fontSize: isDesktopWeb() ? 32 : 28,
        fontWeight: 'bold',
        color: myColors.text.primary,
        textAlign: 'center',
        marginTop: isDesktopWeb() ? 30 : 20,
    },
    inputContainer: {
        // marginTop: -5,
        borderRadius: BORDER_RADIUS.Regular,
        overflow: 'hidden',
    },
    rememberForgotContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
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
        height: isTablet() ? "65%" : "40%",
        width: "auto"
    },
    RegistrationTopContentWrapper: {
        // top: -55,
        // alignItems: "center",
        // marginTop: 20
    },
    RegistrationTxt: { fontSize: 32 },
    dontHaveAccountWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10
    },
    registerButton: {
        backgroundColor: myColors.black,
    },
    guestLoginButton: {
        backgroundColor: myColors.primary.main,
        marginTop: 10,
    },
    loader: {
        marginTop: 10
    },
    errorText: {
        color: myColors.error,
        fontSize: 12,
        // marginTop: -8,
        marginBottom: 8,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
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
    scrollViewContent: {
        // paddingBottom: isDesktopWeb() ? 30 : 20,
    },
    titleSection: {
        marginBottom: 20,
        alignItems: 'center',
    },
    inputWrapper: {
        minWidth: isDesktopWeb() ? 600 : undefined,
        maxWidth: isDesktopWeb() ? 900 : undefined,
        alignSelf: isDesktopWeb() ? "center" : undefined
    }
});