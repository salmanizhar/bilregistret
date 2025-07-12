// Report a problem screen

import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, StatusBar, ViewStyle, TextStyle, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import SimpleHeader from '@/components/common/SimpleHeader';
import { MyTextInput } from '@/components/common/MyTextInput';
import { Formik } from 'formik';
import * as Yup from 'yup';
import MyText from '@/components/common/MyText';
import MyButton from '@/components/common/MyButton';
import { Entypo } from '@expo/vector-icons';
import { useSubmitReport } from '@/Services/api/hooks';
import { useAuth } from '@/Services/api/context/auth.context';
import { showAlert } from '@/utils/alert';
import CustomDropdownPicker, { DropdownItem } from '@/components/common/CustomDropdownPicker';
import { getStatusBarHeight } from '@/constants/commonFunctions';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import { isDesktopWeb } from '@/utils/deviceInfo';
import FooterWrapper from '@/components/common/ScreenWrapper';

// Problem types
const problemTypes = [
    { label: 'Tekniskt fel', value: 'Technical' },
    // { label: 'Betalningsfel', value: 'Payment' },
    { label: 'Kontoinformation', value: 'Account' },
    { label: 'App-prestanda', value: 'Performance' },
    { label: 'Resultatnoggrannhet', value: 'Accuracy' },
    { label: 'Annat problem', value: 'Other' }
];

// Map UI problem types to API report types
const mapToReportType = (problemType: string): string => {
    const typeMap: Record<string, string> = {
        'Tekniskt fel': 'Technical',
        // 'Betalningsfel': 'Payment',
        'Kontoinformation': 'Account',
        'App-prestanda': 'Performance',
        'Resultatnoggrannhet': 'Accuracy',
        'Annat problem': 'Other'
    };

    return typeMap[problemType] || 'Incident';
};

// Form validation schema
const ReportSchema = Yup.object().shape({
    selectedProblemType: Yup.string().required('Problem typ krävs'),
    problemType: Yup.string().required('Problem typ krävs'),
    description: Yup.string().required('Beskrivning krävs').min(10, 'Beskrivningen måste vara minst 10 tecken'),
    email: Yup.string().email('Ogiltig e-postadress'),
});

interface FormValues {
    selectedProblemType: string;
    problemType: string;
    description: string;
    email: string;
}

export default function ReportProblem() {
    const router = useRouter();
    const [showProblemTypes, setShowProblemTypes] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get the submission hook
    const submitReport = useSubmitReport();

    // Get user auth
    const { user } = useAuth();

    const handleGoBack = () => {
        router.back();
    };

    const toggleProblemTypeDropdown = () => {
        setShowProblemTypes(!showProblemTypes);
    };

    const selectProblemType = (type: DropdownItem, setFieldValue: Function) => {
        setFieldValue('selectedProblemType', type.value);
        setFieldValue('problemType', type.label);
        setShowProblemTypes(false);
    };

    const handleSubmit = async (values: FormValues) => {
        try {
            setIsSubmitting(true);

            // Get user email from auth context if available
            const userEmail = user?.user?.customer_email;

            // Prepare payload for API
            const payload = {
                title: "Report", // Fixed title as per requirement
                description: values.description,
                reportType: mapToReportType(values.selectedProblemType),
                email: userEmail // Use authenticated user's email
            };
            // // console.log('payload', payload);
            // Submit the report
            await submitReport.mutateAsync(payload);

            // Show success message and navigate back
            showAlert({
                title: 'Framgång',
                message: 'Din rapport har skickats. Tack för din feedback!',
                type: 'success',
                positiveButton: {
                    text: 'OK',
                    onPress: () => router.back()
                }
            });

        } catch (error) {
            showAlert({
                title: 'Fel',
                message: 'Det gick inte att skicka rapporten. Försök igen senare.',
                type: 'error',
            });
            // console.error('Failed to submit report:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const initialValues: FormValues = {
        selectedProblemType: '',
        problemType: 'Tekniskt fel',
        description: '',
        email: '',
    };

    const handleBackdropPress = () => {
        Keyboard.dismiss();
        setShowProblemTypes(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {!isDesktopWeb() && (
                <SimpleHeader
                    title="Rapportera Ett Problem"
                    onBackPress={handleGoBack}
                />
            )}

            <FooterWrapper contentContainerStyle={styles.content}>
                <DesktopViewWrapper>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={ReportSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                            <View>
                                <View style={[styles.formField]}>
                                    <MyText style={styles.label}>Problemtyp</MyText>
                                    <CustomDropdownPicker
                                        data={problemTypes}
                                        value={values.selectedProblemType}
                                        onChange={(value) => selectProblemType(value, setFieldValue)}
                                        placeholder="Välj problemtyp"
                                        search={true}
                                        searchPlaceholder="Sök problemtyp..."
                                    />
                                </View>
                                <View style={styles.formField2}>
                                    <MyTextInput
                                        label='Beskriv Problemet'
                                        placeholder="Beskriv ditt problem här..."
                                        value={values.description}
                                        onChangeText={handleChange('description')}
                                        onBlur={handleBlur('description')}
                                        error={touched.description && errors.description ? errors.description : undefined}
                                        multiline={true}
                                        numberOfLines={5}
                                        inputStyle={{
                                            height: 120,
                                            paddingTop: 12,
                                        }}
                                    />

                                    <MyTextInput
                                        label='Din e-post (valfritt)'
                                        placeholder="infocontact@gmail.com"
                                        value={values.email}
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        error={touched.email && errors.email ? errors.email : undefined}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                <MyButton
                                    title={isSubmitting ? "SKICKAR..." : "SKICKA RAPPORT"}
                                    onPress={handleSubmit}
                                    buttonStyle={styles.submitButton}
                                    disabled={isSubmitting}
                                />
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
    formField2: ViewStyle;
    label: TextStyle;
    dropdown: ViewStyle;
    dropdownText: TextStyle;
    dropdownTextPlaceholder: TextStyle;
    dropdownMenu: ViewStyle;
    dropdownItem: ViewStyle;
    dropdownItemText: TextStyle;
    errorText: TextStyle;
    submitButton: ViewStyle;
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
        zIndex: 100,
        paddingHorizontal: 20,
    },
    formField2: {
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: myColors.text.primary,
    },
    dropdown: {
        backgroundColor: myColors.white,
        borderRadius: 8,
        height: 45,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: myColors.border.light,
    },
    dropdownText: {
        fontSize: 14,
        color: myColors.text.primary,
    },
    dropdownTextPlaceholder: {
        fontSize: 14,
        color: myColors.text.placeholder,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        backgroundColor: myColors.white,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 100,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    dropdownItemText: {
        fontSize: 16,
        color: myColors.text.primary,
    },
    errorText: {
        color: myColors.error,
        fontSize: 12,
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: myColors.black,
        marginTop: 20,
        marginBottom: 40,
        marginHorizontal: 20,
    },
});