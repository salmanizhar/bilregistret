import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Modal, FlatList, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { SvgXml } from 'react-native-svg';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { MyTextInput } from '@/components/common/MyTextInput';
import * as ImagePicker from 'expo-image-picker';
import SimpleHeader from '@/components/common/SimpleHeader';
import { ImagePath } from '@/assets/images';
import { MaxPasswordLength } from '@/constants/commonConst';
import { Entypo } from '@expo/vector-icons';
import MyButton from '@/components/common/MyButton';
import DatePickerModal from '@/components/common/DatePickerModal';
import AllCountryData from '@/constants/AllCountryList.json';
import { makeUserRequest, useUpdateProfile } from '@/Services/api/hooks/user.hooks';
import { useAuth } from '@/Services/api/context/auth.context';
import { isImageSizeValid, isUrl, shortenName } from '@/constants/commonFunctions';
import moment from 'moment';
import { showAlert } from '@/utils/alert';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { IconChevronDown } from '@/assets/icons';
import KeyboardAvoidingWrapper from '@/components/common/KeyboardAvoidingWrapper';

// Add country data
const countries = AllCountryData.map((country) => country.name);

// Form values interface
interface UserFormValues {
    name: string;
    email: string;
    password: string;
    birthDate: string;
    country: string;
    telephone_number: string;
    organization_name: string;
    organization_number: string;
    address: string;
    postort: string;
    postnummer: string;
}

// Define validation schema
const UserProfileSchema = Yup.object().shape({
    name: Yup.string().required('Namn krävs'),
    email: Yup.string().email('Ogiltig e-postadress').required('E-postadress krävs'),
    password: Yup.string().min(8, 'Lösenord måste vara minst 8 tecken långt'),
    birthDate: Yup.string().required('Födelsedatum krävs'),
    // country: Yup.string().required('Land/Region krävs'),
    // telephone_number: Yup.string().required('Telefonnummer krävs'),
    // organization_name: Yup.string().required('Företagsnamn krävs'),
});

function UserProfile() {
    const router = useRouter();
    const { user, refreshUserData } = useAuth();
    const updateProfileMutation = useUpdateProfile();
    const [profileImage, setProfileImage] = useState(user?.user?.profile_picture);
    const [showPassword, setShowPassword] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isCountryPickerVisible, setCountryPickerVisibility] = useState(false);
    const [selectedFormik, setSelectedFormik] = useState<FormikProps<UserFormValues> | null>(null);
    const [datePickerDate, setDatePickerDate] = useState(new Date());


    const handleGoBack = () => {
        router.back();
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            showAlert({
                title: 'Behörighet nekad',
                message: 'Vi behöver kameraåtkomst för att ta en bild.',
                type: 'error',
            });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            // Check if the image size is valid
            const sizeCheck = isImageSizeValid(result.assets[0]);
            if (!sizeCheck.isValid) {
                showAlert({
                    title: 'För stor bild',
                    message: sizeCheck.message,
                    type: 'warning',
                });
                return;
            }
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleChooseImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            showAlert({
                title: 'Behörighet nekad',
                message: 'Vi behöver bildbiblioteksåtkomst för att välja en bild.',
                type: 'error',
            });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.4,
        });

        if (!result.canceled) {
            // Check if the image size is valid
            const sizeCheck = isImageSizeValid(result.assets[0]);
            if (!sizeCheck.isValid) {
                showAlert({
                    title: 'För stor bild',
                    message: sizeCheck.message,
                    type: 'warning',
                });
                return;
            }
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async (values: UserFormValues) => {
        try {
            global_loader_ref?.show_loader(1);
            const payload = {
                name: values.name,
                telephone_number: values?.telephone_number || '',
                organization_name: values?.organization_name || '',
                organization_number: values?.organization_number || '',
                address: values?.address || '',
                postort: values?.postort || '',
                postnummer: values?.postnummer || '',
                profile_picture: profileImage,
                customer_email: values.email || '',
                dob: values.birthDate || '',
                // country: values.country || '',
            }
            const webPayload = {
                name: values.name,
                telephone_number: values?.telephone_number || '',
                organization_name: values?.organization_name || '',
                organization_number: values?.organization_number || '',
                address: values?.address || '',
                postort: values?.postort || '',
                postnummer: values?.postnummer || '',
                // profile_picture: profileImage,
                profile_picture_base64: isUrl(profileImage) ? undefined : profileImage,
                customer_email: values.email || '',
                dob: values.birthDate || '',
                // country: values.country || '',
            }

            const finalPayload = Platform.OS === 'web' ? webPayload : payload;
            // console.log("finalPayload", JSON.stringify(finalPayload, null, 2))
            // // console.log("payload", payload)
            await updateProfileMutation.mutateAsync(finalPayload);
            // const response = await makeUserRequest('/user/profile', 'PUT', payload);
            // // console.log("response from screen", response)
            await refreshUserData();
            showAlert({
                title: 'Framgång',
                message: 'Profilen har uppdaterats.',
                type: 'success',
            });
            router.back();
            global_loader_ref?.show_loader(0);
        } catch (error) {
            showAlert({
                title: 'Fel',
                message: 'Det gick inte att uppdatera profilen. Försök igen senare.',
                type: 'error',
            });
            global_loader_ref?.show_loader(0);
        }
    };

    const handleCameraButtonPress = () => {
        if (Platform.OS === 'web') {
            showAlert({
                title: 'Välj bild',
                message: 'Välj bildkälla',
                type: 'info',
                showIcon: false,
                positiveButton: {
                    text: 'Välj från galleri',
                    onPress: () => { handleChooseImage() }
                },
                negativeButton: {
                    text: 'Avbryt',
                    onPress: () => { }
                }
            })
        } else {
            showAlert({
                title: 'Välj bild',
                message: 'Välj bildkälla',
                type: 'info',
                showIcon: false,
                positiveButton: {
                    text: 'Ta foto',
                    onPress: () => { handleTakePhoto() }
                },
                positiveButton2: {
                    text: 'Välj från galleri',
                    onPress: () => { handleChooseImage() }
                },
                negativeButton: {
                    text: 'Avbryt',
                    onPress: () => { }
                }
            })
        }
    };

    // Date picker handlers
    const showDatePicker = (formikProps: FormikProps<UserFormValues>) => {
        setSelectedFormik(formikProps);
        // Parse the existing date if available
        if (formikProps.values.birthDate) {
            const parts = formikProps.values.birthDate.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in Date
                const year = parseInt(parts[2], 10);
                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    setDatePickerDate(date);
                }
            }
        }
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleDateChange = (selectedDate: Date) => {
        setDatePickerDate(selectedDate);
        if (selectedFormik) {
            const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
            selectedFormik.setFieldValue('birthDate', formattedDate);
        }
    };

    // Country picker handlers
    const showCountryPicker = (formikProps: FormikProps<UserFormValues>) => {
        setSelectedFormik(formikProps);
        setCountryPickerVisibility(true);
    };

    const hideCountryPicker = () => {
        setCountryPickerVisibility(false);
    };

    const handleCountrySelect = (country: string) => {
        if (selectedFormik) {
            selectedFormik.setFieldValue('country', country);
        }
        hideCountryPicker();
    };


    // Initial values from user data
    const initialValues: UserFormValues = {
        name: user?.user?.name || '',
        email: user?.user?.customer_email || '',
        telephone_number: user?.user?.telephone_number || '',
        organization_name: user?.user?.organization_name || '',
        organization_number: user?.user?.organization_number || '',
        address: user?.user?.address || '',
        postort: user?.user?.postort || '',
        postnummer: user?.user?.postnummer || '',
        password: '••••••••••••••',
        birthDate: user?.user?.dob ? moment(user?.user?.dob).format('DD/MM/YYYY') : '',
        country: user?.user?.country || '',
    };

    // Render country item
    const renderCountryItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={styles.countryItem}
            onPress={() => handleCountrySelect(item)}
        >
            <MyText>{item}</MyText>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingWrapper>
            <SafeAreaView style={styles.container} edges={['top']}>
                <Stack.Screen options={{ headerShown: false }} />

                {!isDesktopWeb() && <SimpleHeader title="Redigera Profil" onBackPress={handleGoBack} />}

                <FooterWrapper>
                    <DesktopViewWrapper>
                        <View style={styles.contentContainer}>
                            <View style={styles.profileImageContainer}>
                                <Image
                                    source={profileImage ? { uri: profileImage } : ImagePath.userImage}
                                    style={styles.profileImage}
                                />
                                <TouchableOpacity
                                    style={styles.cameraButton}
                                    onPress={handleCameraButtonPress}
                                >
                                    <SvgXml xml={ImagePath.SvgIcons.UserProfileCameraIcon} />
                                </TouchableOpacity>
                            </View>

                            <Formik
                                initialValues={{
                                    name: user?.user?.name || '',
                                    email: user?.user?.customer_email || '',
                                    password: '',
                                    birthDate: user?.user?.dob ? moment(user?.user?.dob).format('DD/MM/YYYY') : '',
                                    country: user?.user?.country || '',
                                    telephone_number: user?.user?.telephone_number || '',
                                    organization_name: user?.user?.organization_name || '',
                                    organization_number: user?.user?.organization_number || '',
                                    address: user?.user?.address || '',
                                    postort: user?.user?.postort || '',
                                    postnummer: user?.user?.postnummer || '',
                                }}
                                validationSchema={UserProfileSchema}
                                onSubmit={handleSubmit}
                            >
                                {(formikProps) => (
                                    <View style={styles.formContainer}>
                                        <MyTextInput
                                            label="Ditt Namn"
                                            placeholder="Ange fullständigt namn"
                                            value={formikProps.values.name}
                                            onChangeText={formikProps.handleChange('name')}
                                            onBlur={formikProps.handleBlur('name')}
                                            error={formikProps.touched.name && formikProps.errors.name ? String(formikProps.errors.name) : undefined}
                                        />

                                        <MyTextInput
                                            label="E-postadress"
                                            placeholder="Ange e-postadress"
                                            value={formikProps.values.email}
                                            onChangeText={formikProps.handleChange('email')}
                                            onBlur={formikProps.handleBlur('email')}
                                            error={formikProps.touched.email && formikProps.errors.email ? String(formikProps.errors.email) : undefined}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                        <MyTextInput
                                            label="Telefonnummer (valfritt)"
                                            placeholder="Ange ditt telefonnummer"
                                            value={formikProps.values.telephone_number}
                                            onChangeText={formikProps.handleChange('telephone_number')}
                                            onBlur={formikProps.handleBlur('telephone_number')}
                                            // error={formikProps.touched.telephone_number ? String(formikProps.errors.telephone_number) : undefined}
                                            keyboardType="phone-pad"
                                            containerStyle={{ marginTop: 5 }}
                                        />

                                        <MyTextInput
                                            label="Företag (valfritt)"
                                            placeholder="Ange ditt företagsnamn"
                                            value={formikProps.values.organization_name}
                                            onChangeText={formikProps.handleChange('organization_name')}
                                            onBlur={formikProps.handleBlur('organization_name')}
                                            // error={formikProps.touched.organization_name ? String(formikProps.errors.organization_name) : undefined}
                                            containerStyle={{ marginTop: 5 }}
                                        />
                                        <MyTextInput
                                            label="Organisationsnummer (valfritt)"
                                            placeholder="Ange organisationsnummer"
                                            value={formikProps.values.organization_number}
                                            onChangeText={formikProps.handleChange('organization_number')}
                                            onBlur={formikProps.handleBlur('organization_number')}
                                            // error={touched.password ? errors.password : undefined}
                                            // isPassword={true}
                                            keyboardType="phone-pad"
                                            containerStyle={{ marginTop: 5 }}
                                        // maxLength={MaxPasswordLength}
                                        />

                                        <MyTextInput
                                            label="Födelsedatum"
                                            placeholder="DD/MM/ÅÅÅÅ"
                                            value={formikProps.values.birthDate}
                                            onChangeText={formikProps.handleChange('birthDate')}
                                            onBlur={formikProps.handleBlur('birthDate')}
                                            error={formikProps.touched.birthDate && formikProps.errors.birthDate ? String(formikProps.errors.birthDate) : undefined}
                                            editable={false}
                                            onPressIn={() => showDatePicker(formikProps)}
                                            rightIcon={
                                                <TouchableOpacity onPress={() => showDatePicker(formikProps)}>
                                                    <SvgXml xml={ImagePath.SvgIcons.UserProfileCalendarIcon} />
                                                </TouchableOpacity>
                                            }
                                            style={{ flex: 1 }}
                                        />

                                        {/* <MyTextInput
                                        label="Land / Region"
                                        placeholder="Välj land eller region"
                                        value={formikProps.values.country}
                                        onChangeText={formikProps.handleChange('country')}
                                        onBlur={formikProps.handleBlur('country')}
                                        error={formikProps.touched.country && formikProps.errors.country ? String(formikProps.errors.country) : undefined}
                                        editable={false}
                                        onPressIn={() => showCountryPicker(formikProps)}
                                        rightIcon={
                                            <TouchableOpacity onPress={() => showCountryPicker(formikProps)}>
                                                <IconChevronDown
                                                    size={20}
                                                    color={myColors.text.webGray}
                                                />
                                            </TouchableOpacity>
                                        }
                                    /> */}

                                        <MyButton
                                            title="SPARA ÄNDRINGAR"
                                            onPress={formikProps.handleSubmit}
                                            buttonStyle={styles.saveButton}
                                        />
                                    </View>
                                )}
                            </Formik>
                        </View>
                    </DesktopViewWrapper>
                </FooterWrapper>

                <DatePickerModal
                    isVisible={isDatePickerVisible}
                    date={datePickerDate}
                    onDateChange={handleDateChange}
                    onClose={hideDatePicker}
                />

                <Modal
                    visible={isCountryPickerVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={hideCountryPicker}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={hideCountryPicker}>
                                    <MyText style={styles.cancelButton}>Avbryt</MyText>
                                </TouchableOpacity>
                                <MyText style={styles.modalTitle}>Välj land</MyText>
                                <View style={{ width: 50 }} />
                            </View>
                            <FlatList
                                data={countries}
                                renderItem={renderCountryItem}
                                keyExtractor={(item) => item}
                                style={styles.countryList}
                            />
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </KeyboardAvoidingWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        marginTop: isDesktopWeb() ? 30 : 0,
        marginBottom: isDesktopWeb() ? 30 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: myColors.text.primary,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: myColors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    profileImageContainer: {
        alignSelf: 'center',
        marginVertical: 24,
        position: 'relative',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 10,
    },
    formContainer: {
        marginBottom: 40,
    },
    saveButton: {
        backgroundColor: myColors.black,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
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
});

export default UserProfile;