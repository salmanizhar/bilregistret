// Delete account screen

import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, StatusBar, ViewStyle, TextStyle, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import SimpleHeader from '@/components/common/SimpleHeader';
import { MyTextInput } from '@/components/common/MyTextInput';
import { Formik } from 'formik';
import * as Yup from 'yup';
import MyText from '@/components/common/MyText';
import MyButton from '@/components/common/MyButton';
import { useDeleteAccount } from '@/Services/api/hooks';
import { useAuth } from '@/Services/api/context/auth.context';
import { showAlert } from '@/utils/alert';
import { getStatusBarHeight } from '@/constants/commonFunctions';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import { isDesktopWeb } from '@/utils/deviceInfo';
import FooterWrapper from '@/components/common/ScreenWrapper';

// Deletion reasons
const deletionReasons = [
    'Jag använder inte detta konto längre.',
    // 'Jag får för många oönskade notifikationer.',
    'Jag har haft tekniska problem med mitt konto.',
    'Jag är orolig för säkerheten på mitt konto.'
];

// Form validation schema
const DeleteAccountSchema = Yup.object().shape({
    email: Yup.string().email('Ogiltig e-postadress').required('E-postadress krävs'),
    password: Yup.string().required('Lösenord krävs').min(6, 'Password must be at least 6 characters'),
    reason: Yup.string().required('Du måste välja en anledning'),
});

interface FormValues {
    email: string;
    password: string;
    reason: string;
    type?: 'delete' | 'deactivate';
}

export default function DeleteAccount() {
    const router = useRouter();
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get auth context
    const { logout } = useAuth();

    // Get deletion hook
    const deleteAccountMutation = useDeleteAccount();

    const handleGoBack = () => {
        router.back();
    };

    const selectReason = (reason: string, setFieldValue: Function) => {
        setSelectedReason(reason);
        setFieldValue('reason', reason);
    };

    const handleDeleteAccount = async (values: FormValues, actionType: 'delete' | 'deactivate') => {
        try {
            setIsSubmitting(true);

            // Prepare payload
            const payload = {
                reason: values.reason,
                status: actionType,
                email: values.email,
                password: values.password
            };

            // Call API
            await deleteAccountMutation.mutateAsync(payload);

            showAlert({
                title: 'Framgång',
                message: values.type === 'delete'
                    ? 'Ditt konto har raderats.'
                    : 'Ditt konto har inaktiverats.',
                type: 'success',
                positiveButton: {
                    text: 'OK',
                    onPress: () => {
                        logout();
                        router.replace('/(auth)/login');
                    }
                }
            });
        } catch (error: any) {
            // Handle error
            showAlert({
                title: 'Fel',
                message: 'Ett fel uppstod under bearbetningen. Försök igen senare.',
                type: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmAction = (values: FormValues, actionType: 'delete' | 'deactivate') => {
        // Set action type
        values.type = actionType;

        // Show confirmation dialog
        const title = actionType === 'delete' ? 'Radera konto' : 'Inaktivera konto';
        const message = actionType === 'delete'
            ? 'Är du säker på att du vill radera ditt konto? Denna åtgärd kan inte ångras.'
            : 'Är du säker på att du vill inaktivera ditt konto? Du kan återaktivera det senare.';


        showAlert({
            title: title,
            message: message,
            type: 'warning',
            positiveButton: {
                text: 'Avbryt',
                onPress: () => { }
            },
            negativeButton: {
                text: 'Ja, fortsätt',
                onPress: () => {
                    handleDeleteAccount(values, actionType);
                }
            }
        });
    };

    const initialValues: FormValues = {
        email: '',
        password: '',
        reason: '',
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {!isDesktopWeb() && (
                <SimpleHeader
                    title="Ta Bort Konto"
                    onBackPress={handleGoBack}
                />
            )}

            <FooterWrapper contentContainerStyle={styles.content}>
                <DesktopViewWrapper>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={DeleteAccountSchema}
                        onSubmit={(values) => {/* Submission handled by buttons */ }}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                            <View>
                                <View style={styles.formField}>
                                    <MyText style={styles.label}>E-postadress</MyText>
                                    <MyTextInput
                                        placeholder="infocontact@gmail.com"
                                        value={values.email}
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        error={touched.email && errors.email ? errors.email : undefined}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.formField}>
                                    <MyText style={styles.label}>Ditt lösenord</MyText>
                                    <MyTextInput
                                        placeholder="Ange ditt lösenord"
                                        value={values.password}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                        error={touched.password && errors.password ? errors.password : undefined}
                                        isPassword={true}
                                    />
                                </View>

                                <View style={styles.formField}>
                                    <MyText style={styles.label}>Reason for Deleting</MyText>
                                    {touched.reason && errors.reason && (
                                        <MyText style={styles.errorText}>{errors.reason}</MyText>
                                    )}

                                    {deletionReasons.map((reason, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.reasonItem}
                                            onPress={() => selectReason(reason, setFieldValue)}
                                        >
                                            <View style={styles.radioContainer}>
                                                <View
                                                    style={[
                                                        styles.radioOuter,
                                                        selectedReason === reason && styles.radioOuterSelected
                                                    ]}
                                                >
                                                    {selectedReason === reason && (
                                                        <View style={styles.radioInner} />
                                                    )}
                                                </View>
                                            </View>
                                            <MyText style={styles.reasonText}>{reason}</MyText>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.buttonContainer}>
                                    <MyButton
                                        title="INAKTIVERA KONTO"
                                        onPress={() => {
                                            // Validate the form first
                                            const isValid = Object.keys(errors).length === 0 &&
                                                values.email && values.password && values.reason;

                                            if (!isValid) {
                                                handleSubmit(); // Trigger validation
                                                return;
                                            }

                                            confirmAction(values, 'deactivate');
                                        }}
                                        buttonStyle={styles.deactivateButton}
                                        disabled={isSubmitting}
                                    />

                                    <MyButton
                                        title="RADERA KONTO"
                                        onPress={() => {
                                            // Validate the form first
                                            const isValid = Object.keys(errors).length === 0 &&
                                                values.email && values.password && values.reason;

                                            if (!isValid) {
                                                handleSubmit(); // Trigger validation
                                                return;
                                            }

                                            confirmAction(values, 'delete');
                                        }}
                                        buttonStyle={styles.deleteButton}
                                        textStyle={styles.deleteButtonText}
                                        disabled={isSubmitting}
                                    />
                                </View>
                            </View>
                        )}
                    </Formik>
                </DesktopViewWrapper>
            </FooterWrapper>
        </KeyboardAvoidingView>
    );
}

interface Styles {
    container: ViewStyle;
    content: ViewStyle;
    formField: ViewStyle;
    label: TextStyle;
    errorText: TextStyle;
    reasonItem: ViewStyle;
    radioContainer: ViewStyle;
    radioOuter: ViewStyle;
    radioOuterSelected: ViewStyle;
    radioInner: ViewStyle;
    reasonText: TextStyle;
    buttonContainer: ViewStyle;
    deactivateButton: ViewStyle;
    deleteButton: ViewStyle;
    deleteButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
        paddingTop: getStatusBarHeight(),
    },
    content: {
        flex: 1,
        paddingTop: isDesktopWeb() ? 50 : 30,
    },
    formField: {
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: myColors.text.primary,
    },
    errorText: {
        color: myColors.error,
        fontSize: 12,
        marginBottom: 8,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    radioContainer: {
        marginRight: 10,
    },
    radioOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: myColors.border.light,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: myColors.primary.main,
    },
    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: myColors.primary.main,
    },
    reasonText: {
        fontSize: 15,
        color: myColors.baseColors.light3,
        flex: 1,
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    deactivateButton: {
        backgroundColor: myColors.black,
        flex: 1,
        marginRight: 5,
    },
    deleteButton: {
        backgroundColor: myColors.white,
        borderWidth: 1,
        borderColor: myColors.error,
        flex: 1,
        marginLeft: 5,
    },
    deleteButtonText: {
        color: myColors.error,
    },
});