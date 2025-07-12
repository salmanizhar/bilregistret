import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, StatusBar, Platform, ScrollView, Keyboard, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SimpleHeader from '@/components/common/SimpleHeader';
import MyText from '@/components/common/MyText';
import { myColors } from '@/constants/MyColors';
import { SvgXml } from 'react-native-svg';
import StatusMessage from '@/components/common/StatusMessage';
import { MyTextInput } from '@/components/common/MyTextInput';
import { MaxPasswordLength } from '@/constants/commonConst';
import { Formik } from 'formik';
import * as Yup from 'yup';
import MyButton from '@/components/common/MyButton';
import { ImagePath } from '@/assets/images';
import { TouchableWithoutFeedback } from 'react-native';
import { useChangePassword, ChangePasswordData } from '@/Services/api/hooks/auth.hooks';
import { showAlert } from '@/utils/alert';
import { getStatusBarHeight } from '@/constants/commonFunctions';

// Create validation schema with Yup
const PasswordSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Ange ditt nuvarande lösenord'),
    newPassword: Yup.string()
        .min(6, 'Lösenordet måste vara minst 6 tecken')
        .required('Ange ett nytt lösenord'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Lösenorden matchar inte')
        .required('Bekräfta ditt nya lösenord')
});

// Interface for form values
interface PasswordFormValues {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ChangePassword() {
    const router = useRouter();
    const [successVisible, setSuccessVisible] = useState(false);
    const [isPasswordInfoVisible, setIsPasswordInfoVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Get change password mutation
    const changePasswordMutation = useChangePassword();

    useEffect(() => {
        if (isPasswordInfoVisible) {
            setTimeout(() => {
                setIsPasswordInfoVisible(false);
            }, 3000);
        }
    }, [isPasswordInfoVisible]);

    const initialValues: PasswordFormValues = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    const handleGoBack = () => {
        router.back();
    };

    const handleSubmit = async (values: PasswordFormValues) => {
        try {
            if (global_loader_ref) {
                global_loader_ref.show_loader(1);
            }

            // Convert form values to API format
            const passwordData: ChangePasswordData = {
                currentPassword: values.oldPassword,
                newPassword: values.confirmPassword,
            };

            // Call API to change password
            await changePasswordMutation.mutateAsync(passwordData);

            // Show success message
            setSuccessVisible(true);
            setErrorMessage(null);
        } catch (error: any) {
            // Display error message
            setErrorMessage(error.message || 'Någonting gick fel. Försök igen senare.');
            showAlert({
                title: 'Fel',
                message: error.message || 'Någonting gick fel. Försök igen senare.',
                type: 'error',
            });
        } finally {
            if (global_loader_ref) {
                global_loader_ref.show_loader(0);
            }
        }
    };

    const handleCloseSuccess = () => {
        setSuccessVisible(false);
        router.back();
    };

    return (
        // <TouchableWithoutFeedback onPress={() => {
        //     setIsPasswordInfoVisible(false);
        //     Keyboard.dismiss();
        // }}>
        <View style={styles.container}>
            <SimpleHeader
                title="Ändra Lösenord"
                onBackPress={handleGoBack}
            />

            <Formik
                initialValues={initialValues}
                validationSchema={PasswordSchema}
                onSubmit={handleSubmit}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={styles.content}>
                            <MyTextInput
                                label="Gamla lösenord"
                                placeholder="Ange gammalt lösenord"
                                value={values.oldPassword}
                                onChangeText={handleChange('oldPassword')}
                                onBlur={handleBlur('oldPassword')}
                                error={touched.oldPassword && errors.oldPassword ? errors.oldPassword : undefined}
                                isPassword={true}
                                maxLength={MaxPasswordLength}
                            />
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
                                                showAlert({
                                                    title: 'Info',
                                                    message: 'Ditt nya lösenord måste vara olika från tidigare använda lösenord.',
                                                    type: 'info',
                                                });
                                            }}>
                                                <SvgXml xml={ImagePath.SvgIcons.SettingsInfoIcon} />
                                            </TouchableOpacity>
                                        </View>
                                    }
                                />

                                {/* {isPasswordInfoVisible &&
                                        <View style={styles.infoTextContainer}>
                                            <MyText style={styles.infoText}>
                                                Ditt nya lösenord måste vara olika från tidigare använda lösenord.
                                            </MyText>
                                        </View>
                                    } */}
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
                                title='STÄLL IN NYTT LÖSENORD'
                                onPress={() => handleSubmit()}
                                buttonStyle={styles.changePasswordButton}
                                disabled={changePasswordMutation.isPending}
                            />
                        </View>
                    </ScrollView>
                )}
            </Formik>

            <StatusMessage
                visible={successVisible}
                type="success"
                message="Lösenord ändrat."
                onClose={handleCloseSuccess}
            />
        </View>
        // </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
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
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: 20,
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
        // marginLeft: 8,
    },
    changePasswordButton: {
        marginTop: 20,
    },
    buttonText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
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
});