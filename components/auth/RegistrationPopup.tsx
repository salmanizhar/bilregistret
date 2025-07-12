import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
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
import { RegisterCredentials } from '@/Services/api/hooks/auth.hooks';
import { BORDER_RADIUS } from '@/constants/Dimentions';
import { showAlert } from '@/utils/alert';
import SocialMediaSigninMobile from '@/components/common/SocialMediaSigninMobile';
import SocialMediaSigninWeb from '@/components/common/SocialMediaSigninWeb';
import { Ionicons } from '@expo/vector-icons';
import LoginPopup from './LoginPopup';
import TermsAndConditionsPopup from './terms';
import ApprovalPendingModal from './ApprovalPendingModal';

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

interface RegistrationPopupProps {
  visible: boolean;
  onClose: () => void;
  onRegistrationSuccess?: () => void;
}

export default function RegistrationPopup({ visible, onClose, onRegistrationSuccess }: RegistrationPopupProps) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [approvalPending, setApprovalPending] = useState<{ title: string; message: string } | null>(null);
  const { register, isLoading, error } = useAuth();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);

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

      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }

      onClose();
      router.push('/(main)');
    } catch (err) {
      showAlert({
        title: 'Registration Failed',
        message: error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Failed to create account. Please try again.'),
        type: 'error',
      });
    } finally {
      global.returnToPath = undefined;
    }
  };

  const handleNavigateToLoginScreen = () => {
    onClose();
    setShowLoginPopup(true);
  };

  const handleShowTerms = () => {
    setShowTermsPopup(true);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                onClose();
                if (approvalPending) {
                  router.replace('/(main)');
                }
              }}
            >
              <Ionicons name="close" size={24} color={myColors.black} />
            </TouchableOpacity>

            {approvalPending ? (
              <ApprovalPendingModal 
                title={approvalPending.title} 
                message={approvalPending.message} 
              />
            ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <SvgXml
                xml={ImagePath.SvgIcons.BilregistretBannerIconBlack}
                height={50}
                width={130}
                style={{
                  alignSelf: "center",
                  marginBottom: 15
                }}
              />

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
                        <TouchableOpacity onPress={handleShowTerms}>
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
                      disabled={isLoading}
                    />

                    <View style={styles.RegistrationTopContentWrapper}>
                      <View style={styles.dontHaveAccountWrapper}>
                        <MyText style={myStyles.grayText14}>Har du redan ett konto? </MyText>
                        <TouchableOpacity onPress={handleNavigateToLoginScreen}>
                          <MyText style={myStyles.grayText14Link}>Logga in här</MyText>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.dividerContainer}>
                      <View style={styles.divider} />
                      <MyText style={styles.orText}>eller logga in med</MyText>
                      <View style={styles.divider} />
                    </View>

                    {Platform.OS === 'web' ? (
                      <SocialMediaSigninWeb 
                        onLoginSuccess={onRegistrationSuccess} 
                        onClose={onClose} 
                      />
                    ) : (
                      <SocialMediaSigninMobile />
                    )}

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
            </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <LoginPopup
        visible={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
      />

      <TermsAndConditionsPopup
        visible={showTermsPopup}
        onClose={() => setShowTermsPopup(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: myColors.screenBackgroundColor,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  formContainer: {
    marginTop: 10,
  },
  inputContainer: {
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
  RegistrationTopContentWrapper: {
    marginTop: 10
  },
  dontHaveAccountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  registerButton: {
    backgroundColor: myColors.black,
    marginTop: 10,
  },
  loader: {
    marginTop: 10
  },
  errorText: {
    color: myColors.error,
    fontSize: 12,
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
});