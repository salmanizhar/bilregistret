// Contact Us screen

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import HeaderWithSearch from '@/components/common/HeaderWithSearch';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MyTextInput } from '@/components/common/MyTextInput';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import MyButton from '@/components/common/MyButton';
import { useContactInfo, useSubmitContactForm } from '@/Services/api/hooks';
import { showToast } from '@/utils/toast';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { isDesktopWeb } from '@/utils/deviceInfo';
import CustomAlert from '@/components/common/CustomAlert';
import { showAlert } from '@/utils/alert';
import { ContactSEO } from '@/components/seo';

// Validation schema
const ContactSchema = Yup.object().shape({
    name: Yup.string().required('Namn krävs'),
    email: Yup.string().email('Ogiltig e-postadress').required('E-post krävs'),
    phone: Yup.string(),
    message: Yup.string().required('Meddelande krävs')
});

export default function ContactUs() {
    // Fetch contact information
    const { data: contactData, isLoading, isError } = useContactInfo();
    // Mutation for submitting the contact form
    const { mutate: submitContactForm, isPending } = useSubmitContactForm();

    const handleSubmit = (values: any, { resetForm }: any) => {
        const payload = {
            name: values.name,
            email: values.email,
            phoneNumber: values.phone,
            subject: "", // Empty string as per requirements
            message: values.message
        };

        submitContactForm(payload, {
            onSuccess: () => {
                // showToast('Ditt meddelande har skickats!', 'success');
                showAlert({
                    title: 'Tack för ditt meddelande!',
                    message: `Vi har nu tagit emot din förfrågan som skickades via vårt formulär på hemsidan. Vi återkommer till dig så snart som möjligt. Om ditt ärende är brådskande, är du välkommen att kontakta oss direkt via e-post eller telefon.\n\nTack för att du kontaktade oss! \nMed vänlig hälsning, Bilregistret.ai`,
                    type: 'success',
                });
                resetForm();
            },
            onError: () => {
                showToast('Det gick inte att skicka meddelandet. Försök igen senare.', 'error');
            }
        });
    };

    return (
        <>
            {/* SEO Head Tags */}
            <ContactSEO />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Stack.Screen options={{ headerShown: false }} />

                    <FooterWrapper style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {/* Header with Search Component - Only render on mobile */}
                        {!isDesktopWeb() && <HeaderWithSearch />}

                        <DesktopViewWrapper>
                            <View style={[styles.content, isDesktopWeb() && styles.desktopContent]}>
                                {/* Main Title */}
                                <View style={styles.titleSection}>
                                    <MyText fontFamily='Poppins' style={styles.mainTitle}>
                                        Kontakta oss
                                    </MyText>
                                    <MyText style={styles.subtitle}>
                                        Vi hjälper dig gärna. Skicka oss ett meddelande så återkommer vi inom 24 timmar.
                                    </MyText>
                                </View>

                                {/* Desktop: 2 columns, Mobile: single column */}
                                <View style={styles.mainContainer}>
                                    {/* Contact Form Section - Now at top and full width */}
                                    <View style={styles.formSection}>
                                        <View style={styles.formContainer}>
                                            <MyText fontFamily='Poppins' style={styles.formTitle}>
                                                Skicka meddelande
                                            </MyText>

                                            <Formik
                                                initialValues={{ name: '', email: '', phone: '', message: '' }}
                                                validationSchema={ContactSchema}
                                                onSubmit={handleSubmit}
                                            >
                                                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                                                    <View style={styles.formContent}>
                                                        <View style={isDesktopWeb() ? styles.formRow : styles.formColumn}>
                                                            <View style={styles.inputContainer}>
                                                                <MyTextInput
                                                                    label="Namn *"
                                                                    placeholder="Ange ditt namn"
                                                                    onChangeText={handleChange('name')}
                                                                    onBlur={handleBlur('name')}
                                                                    value={values.name}
                                                                    error={touched.name && errors.name ? errors.name : undefined}
                                                                />
                                                            </View>

                                                            <View style={styles.inputContainer}>
                                                                <MyTextInput
                                                                    label="E-post *"
                                                                    placeholder="din@email.com"
                                                                    onChangeText={handleChange('email')}
                                                                    onBlur={handleBlur('email')}
                                                                    value={values.email}
                                                                    keyboardType="email-address"
                                                                    autoCapitalize="none"
                                                                    error={touched.email && errors.email ? errors.email : undefined}
                                                                />
                                                            </View>

                                                            <View style={styles.inputContainer}>
                                                                <MyTextInput
                                                                    label="Telefonnummer"
                                                                    placeholder="+46 123 456 789"
                                                                    onChangeText={handleChange('phone')}
                                                                    onBlur={handleBlur('phone')}
                                                                    value={values.phone}
                                                                    keyboardType="phone-pad"
                                                                    error={touched.phone && errors.phone ? errors.phone : undefined}
                                                                />
                                                            </View>
                                                        </View>

                                                        <MyTextInput
                                                            label="Meddelande *"
                                                            placeholder="Berätta för oss hur vi kan hjälpa dig..."
                                                            onChangeText={handleChange('message')}
                                                            onBlur={handleBlur('message')}
                                                            value={values.message}
                                                            multiline
                                                            numberOfLines={4}
                                                            containerStyle={styles.messageContainer}
                                                            inputStyle={[
                                                                styles.messageInput,
                                                                touched.message && errors.message ? styles.messageInputError : null
                                                            ]}
                                                            error={touched.message && errors.message ? errors.message : undefined}
                                                        />

                                                        <MyButton
                                                            title={isPending ? 'SKICKAR...' : 'SKICKA MEDDELANDE'}
                                                            onPress={() => handleSubmit()}
                                                            buttonStyle={styles.submitButton}
                                                            disabled={isPending}
                                                        />
                                                    </View>
                                                )}
                                            </Formik>
                                        </View>
                                    </View>

                                    {/* Contact Information Cards - Now below the form */}
                                    <View style={styles.contactCardsSection}>
                                        <MyText fontFamily='Poppins' style={styles.sectionTitle}>
                                            Kontaktinformation
                                        </MyText>

                                        <View style={isDesktopWeb() ? styles.contactCardsRow : styles.contactCardsColumn}>
                                            <View style={styles.contactCard}>
                                                <View style={styles.iconContainer}>
                                                    <SvgXml xml={ImagePath.SvgIcons.ContactUsAddressIcon} />
                                                </View>
                                                <View style={styles.cardContent}>
                                                    <MyText style={styles.cardLabel}>Adress</MyText>
                                                    <MyText style={styles.cardTitle}>
                                                        {/* {isLoading ? 'Laddar...' : isError ? 'Kunde inte hämta adress' : contactData?.data.address} */}
                                                        Bilregistret Sverige AB Fornminnesgatan 4 {'\n'}253 68 Helsingborg
                                                    </MyText>
                                                </View>
                                            </View>

                                            <View style={styles.contactCard}>
                                                <View style={styles.iconContainer}>
                                                    <SvgXml xml={ImagePath.SvgIcons.ContactUsMailIcon} />
                                                </View>
                                                <View style={styles.cardContent}>
                                                    <MyText style={styles.cardLabel}>E-post</MyText>
                                                    <MyText style={styles.cardTitle}>
                                                        {isLoading ? 'Laddar...' : isError ? 'Kunde inte hämta e-post' : contactData?.data.email}
                                                    </MyText>
                                                </View>
                                            </View>

                                            <View style={styles.contactCard}>
                                                <View style={styles.iconContainer}>
                                                    <SvgXml xml={ImagePath.SvgIcons.ContactUsCallIcon} />
                                                </View>
                                                <View style={styles.cardContent}>
                                                    <MyText style={styles.cardLabel}>Telefon</MyText>
                                                    <MyText style={styles.cardTitle}>
                                                        {isLoading ? 'Laddar...' : isError ? 'Kunde inte hämta telefonnummer' : contactData?.data.phone}
                                                    </MyText>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </DesktopViewWrapper>
                    </FooterWrapper>
                </View>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 15,
        paddingBottom: 40,
        marginTop: 30,
    },
    desktopContent: {
        paddingBottom: 60,
        paddingHorizontal: 40,
        maxWidth: 1400,
        alignSelf: 'center',
    },
    titleSection: {
        marginBottom: 30,
        alignItems: 'center',
    },
    mainTitle: {
        fontSize: isDesktopWeb() ? 32 : 24,
        fontWeight: '600',
        color: myColors.text.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: myColors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.white,
        borderRadius: 10,
        padding: 16,
        marginBottom: isDesktopWeb() ? 0 : 12,
        flex: isDesktopWeb() ? 1 : undefined,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
        }),
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: myColors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: myColors.text.secondary,
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: myColors.text.primary,
        lineHeight: 20,
    },
    formSection: {
        marginBottom: 30,
    },
    formContainer: {
        backgroundColor: myColors.white,
        borderRadius: 12,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            },
        }),
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    formContent: {
        gap: 16,
    },
    messageContainer: {
        marginBottom: 0,
    },
    messageInput: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    messageInputError: {
        borderColor: myColors.error,
    },
    submitButton: {
        marginTop: 8,
        paddingVertical: 16,
    },
    mainContainer: {
        flexDirection: 'column',
    },
    formRow: {
        flexDirection: 'row',
        gap: 16,
    },
    formColumn: {
        flexDirection: 'column',
    },
    inputContainer: {
        flex: 1,
    },
    contactCardsSection: {
        marginTop: 20,
        marginBottom: 30,
    },
    contactCardsRow: {
        flexDirection: 'row',
        gap: 20,
        justifyContent: 'space-between',
    },
    contactCardsColumn: {
        flexDirection: 'column',
    },
});

