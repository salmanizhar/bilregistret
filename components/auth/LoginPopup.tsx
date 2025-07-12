import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
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
import { MaxEmailLength, MaxPasswordLength } from '@/constants/commonConst';
import { SvgXml } from 'react-native-svg';
import { useAuth } from '@/Services/api/context/auth.context';
import { getRememberMe, setRememberMe, getSavedEmail, setSavedEmail } from '@/utils/storage';
import { BORDER_RADIUS } from '@/constants/Dimentions';
import SocialMediaSigninMobile from '@/components/common/SocialMediaSigninMobile';
import SocialMediaSigninWeb from '@/components/common/SocialMediaSigninWeb';
import { showAlert } from '@/utils/alert';
import { IconClose } from '@/assets/icons';
import ApprovalPendingModal from './ApprovalPendingModal';
import AuthMessageModal from './AuthMessageModal';

interface LoginFormValues {
  email: string;
  password: string;
}

// Valideringsschema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Ogiltig e-postadress')
    .required('E-postadress är obligatorisk'),
  password: Yup.string()
    .min(6, 'Lösenordet måste vara minst 6 tecken långt')
    .required('Lösenord är obligatoriskt'),
});

interface LoginPopupProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginPopup({ visible, onClose, onLoginSuccess }: LoginPopupProps) {
  const [rememberMe, setRememberMeState] = useState(false);
  const [approvalPending, setApprovalPending] = useState<{ title: string; message: string } | null>(null);
  const [authMessage, setAuthMessage] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [showSessionExpiredMessage, setShowSessionExpiredMessage] = useState(false);

  // Clear error states when popup visibility changes
  useEffect(() => {
    if (visible) {
      // Clear any previous error states when popup opens
      setAuthMessage(null);
      setApprovalPending(null);
    }
  }, [visible]);

  // Load saved preferences when component mounts
  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        const savedRememberMe = await getRememberMe();
        setRememberMeState(savedRememberMe);

        // Check if user was redirected here due to 401 error
        if (typeof global !== 'undefined' && global.returnToPath === '401_redirect') {
          setShowSessionExpiredMessage(true);
        }
      } catch (err) {
        // // console.log('Error loading saved preferences:', err);
      }
    };

    loadSavedPreferences();

    return () => {
      setShowSessionExpiredMessage(false);
      // Clear any error messages when component unmounts
      setAuthMessage(null);
      setApprovalPending(null);
    }
  }, []);

  // Auto-close popup if user becomes authenticated while popup is open
  useEffect(() => {
    if (isAuthenticated && visible) {
      // Small delay to ensure all state updates are processed
      const timer = setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        onClose();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, visible, onClose, onLoginSuccess]);

  const handleLogin = async (values: LoginFormValues) => {
    global_loader_ref?.show_loader(1);
    try {
      // Save remember me preference if checked
      if (rememberMe) {
        await setRememberMe(true);
        await setSavedEmail(values.email);
      } else {
        await setRememberMe(false);
        await setSavedEmail('');
      }

      // Temporarily store the return path to prevent auth context from navigating
      const originalReturnPath = global.returnToPath;
      global.returnToPath = 'popup_login'; // Set a special flag to prevent auto-navigation

      const result = await login({
        customer_email: values.email,
        password: values.password
      });

      // Check if login is pending approval
      if (result && 'error' in result && 
          (result.error === 'WAITING_APPROVAL_FROM_BILREGISTRET' || 
           result.error === 'WAITING_APPROVAL_FROM_ORGANIZATION_OWNER')) {
        // Set approval pending state
        setApprovalPending({
          title: result.title || 'Hej! Tack för din ansökan.',
          message: result.message || 'Ditt konto väntar på godkännande.'
        });
        // Clear any auth message to ensure only approval pending shows
        setAuthMessage(null);
        return;
      }

      // Restore the original return path
      global.returnToPath = originalReturnPath;

      // Call success callback first
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Close the popup
      onClose();

    } catch (err) {
      // Show login error screen instead of popup
      let errorMessage = 'Vi kunde inte logga in dig med de angivna uppgifterna. Kontrollera din e-postadress och lösenord och försök igen.';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (error) {
        // Fallback to useAuth error if available
        errorMessage = typeof error === 'string' ? error : error.message || errorMessage;
      }

      setAuthMessage({
        title: 'Inloggningen misslyckades',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      // Always clear the return path and hide loader
      if (global.returnToPath === 'popup_login') {
        global.returnToPath = undefined;
      }
      global_loader_ref?.show_loader(0);
    }
  };

  const handleGuestLogin = () => {
    // Clear the return path
    global.returnToPath = undefined;
    onClose();
    router.push('/(main)');
  };

  const handleNavigateToRegisterScreen = () => {
    onClose();
    router.push('/registrera');
  };

  const handleNavigateToForgetPasswordScreen = () => {
    onClose();
    router.push('/forgetpasswrod' as any);
  };

  return (
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
              if (authMessage || approvalPending) {
                router.replace('/(main)');
              }
              onClose();
            }}
          >
            <IconClose size={24} color={myColors.black} />
          </TouchableOpacity>

          {approvalPending ? (
            <ApprovalPendingModal 
              title={approvalPending.title} 
              message={approvalPending.message} 
            />
          ) : authMessage ? (
            <AuthMessageModal 
              title={authMessage.title} 
              message={authMessage.message}
              type={authMessage.type}
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

            {showSessionExpiredMessage && (
              <View style={styles.sessionExpiredContainer}>
                <MyText style={styles.sessionExpiredText}>
                  Din session har upphört. Logga in igen för att fortsätta.
                </MyText>
              </View>
            )}

            <Formik<LoginFormValues>
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleSubmit, handleBlur, values, errors, touched, setFieldValue }) => {
                // Load saved email when component mounts and remember me is true
                useEffect(() => {
                  const loadSavedEmail = async () => {
                    if (rememberMe) {
                      const savedEmail = await getSavedEmail();
                      if (savedEmail) {
                        setFieldValue('email', savedEmail);
                      }
                    }
                  };

                  loadSavedEmail();
                }, [rememberMe]);

                return (
                  <View style={styles.formContainer}>
                    {Platform.OS === 'web' ? (
                      <SocialMediaSigninWeb
                        onLoginSuccess={onLoginSuccess}
                        onClose={onClose}
                      />
                    ) : (
                      <SocialMediaSigninMobile />
                    )}

                    <View style={styles.dividerContainer}>
                      <View style={styles.divider} />
                      <MyText style={styles.orText}>eller logga in med</MyText>
                      <View style={styles.divider} />
                    </View>

                    <View style={styles.inputContainer}>
                      <MyTextInput
                        placeholder="Ange e-postadress"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        error={touched.email ? errors.email : undefined}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        maxLength={MaxEmailLength}
                        isAuthInput={true}
                      />

                      <MyTextInput
                        placeholder="Ange ditt lösenord"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        error={touched.password ? errors.password : undefined}
                        isPassword={true}
                        containerStyle={{ marginTop: 1 }}
                        maxLength={MaxPasswordLength}
                        isAuthInput={true}
                      />
                    </View>

                    <View style={styles.rememberForgotContainer}>
                      <View style={styles.checkboxContainer}>
                        <Checkbox
                          value={rememberMe}
                          onValueChange={(value) => {
                            setRememberMeState(value);
                          }}
                          color={rememberMe ? myColors.black : undefined}
                          style={styles.checkbox}
                        />
                        <MyText style={myStyles.grayText14}>Kom ihåg mig</MyText>
                      </View>
                    </View>

                    <MyButton
                      title={isLoading ? 'LOGGAR IN...' : 'LOGGA IN'}
                      onPress={() => handleSubmit()}
                      buttonStyle={styles.loginButton}
                      disabled={isLoading}
                    />

                    <MyButton
                      title="REGISTRERA DIG"
                      onPress={handleNavigateToRegisterScreen}
                      buttonStyle={styles.guestLoginButton}
                      disabled={isLoading}
                    />

                    <View style={styles.loginTopContentWrapper}>
                      <View style={styles.dontHaveAccountWrapper}>
                        <MyText style={myStyles.grayText14}>Glömt ditt lösenord? </MyText>
                        <TouchableOpacity onPress={handleNavigateToForgetPasswordScreen}>
                          <MyText style={myStyles.grayText14Link}>Återställ det här</MyText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }}
            </Formik>
          </ScrollView>
          )}
        </View>
      </View>
    </Modal>
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
    marginTop: 20
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
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
  loginTopContentWrapper: {
    marginTop: 20
  },
  dontHaveAccountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  loginButton: {
    backgroundColor: myColors.black,
  },
  guestLoginButton: {
    backgroundColor: myColors.primary.main,
    marginTop: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
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
  sessionExpiredContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 15,
    borderRadius: BORDER_RADIUS.Regular,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  sessionExpiredText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
});