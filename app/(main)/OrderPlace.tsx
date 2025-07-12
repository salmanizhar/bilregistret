import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { myColors } from "@/constants/MyColors";
import MyText from "@/components/common/MyText";
import SimpleHeader from "@/components/common/SimpleHeader";
import MyButton from "@/components/common/MyButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { MyTextInput } from "@/components/common/MyTextInput";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { ImagePath } from "@/assets/images";
import Checkbox from "expo-checkbox";
import {
  useValidateCoupon,
  useUpgradeSubscription,
  useCurrentSubscription,
} from "@/Services/api/hooks/subscription.hooks";
import { MaxEmailLength } from "@/constants/commonConst";
import { Entypo } from "@expo/vector-icons";
import AllCountryData from "@/constants/AllCountryList.json";
import { useAuth } from "@/Services/api/context/auth.context";
import { showAlert } from "@/utils/alert";
import { isDesktopWeb } from "@/utils/deviceInfo";
import DesktopViewWrapper from "@/components/common/DesktopViewWrapper";
import FooterWrapper from "@/components/common/ScreenWrapper";
import { IconChevronDown } from "@/assets/icons";

interface UserFormValues {
  fullName: string;
  companyName: string;
  companyEmail: string;
  companyNumber: string;
  billingAddress: string;
  postalCode: string;
  city: string;
  country: string;
  phoneNumber: string;
}

// Add country data
const countries = AllCountryData.map((country) => country.name);

// Define validation schema with Yup
const PaymentSchema = Yup.object().shape({
  fullName: Yup.string().required("Fullständigt namn krävs"),
  companyName: Yup.string().required("Företagsnamn krävs"),
  companyEmail: Yup.string()
    .required("Företagets e-post krävs")
    .email("Ogiltig e-postadress"),
  companyNumber: Yup.string().required("Företagsnummer krävs"),
  billingAddress: Yup.string().required("Faktureringsadress krävs"),
  postalCode: Yup.string().required("Postnummer krävs"),
  city: Yup.string().required("Stad krävs"),
  country: Yup.string().required("Land krävs"),
  phoneNumber: Yup.string().required("Telefonnummer krävs"),
});

export default function OrderPlace() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { refreshUserData } = useAuth();
  const selectedPackage = params;
  // Parse features safely
  let parsedFeatures = [];
  try {
    if (typeof selectedPackage.features === "string") {
      parsedFeatures = JSON.parse(selectedPackage.features);
    } else if (Array.isArray(selectedPackage.features)) {
      parsedFeatures = selectedPackage.features;
    }
  } catch (error) {
    parsedFeatures = [];
  }

  const [paymentMethod, setPaymentMethod] = useState<"credit" | "invoice">(
    "invoice"
  );
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [isCountryPickerVisible, setCountryPickerVisibility] = useState(false);
  const [selectedFormik, setSelectedFormik] =
    useState<FormikProps<UserFormValues> | null>(null);
  const [initialValues, setInitialValues] = useState<UserFormValues>({
    fullName: "",
    companyName: "",
    companyEmail: "",
    companyNumber: "",
    billingAddress: "",
    postalCode: "",
    city: "",
    country: "",
    phoneNumber: "",
  });

  const validateCouponMutation = useValidateCoupon();
  const upgradeSubscriptionMutation = useUpgradeSubscription();
  const { data: currentSubscriptionData, isLoading: isLoadingSubscription } =
    useCurrentSubscription();

  useEffect(() => {
    if (isLoadingSubscription) {
      global_loader_ref?.show_loader(1);
    } else {
      global_loader_ref?.show_loader(0);

      // If subscription data failed to load, don't show an error
      // Just proceed with empty form fields
    }
  }, [isLoadingSubscription]);

  useEffect(() => {
    // // console.log("currentSubscriptionData", currentSubscriptionData);
    if (currentSubscriptionData?.subscription) {
      const billingInfo = currentSubscriptionData.subscription;
      setInitialValues({
        fullName: billingInfo.fullName || "",
        companyName: billingInfo.companyName || "",
        companyEmail: billingInfo.billingEmail || "",
        companyNumber: billingInfo.companyNumber || "",
        billingAddress: billingInfo.billingAddress || "",
        postalCode: billingInfo.postalCode || "",
        city: billingInfo.city || "",
        country: billingInfo.country || "",
        phoneNumber: billingInfo.telephoneNumber || "",
      });
    }
  }, [currentSubscriptionData]);

  const goBack = () => {
    router.back();
  };

  // Calculate prices
  const basePrice = parseFloat(selectedPackage.price as string) || 0;
  const vatRate = 0.25; // 25% VAT
  const vatAmount = basePrice * vatRate;
  const totalPrice = discountApplied
    ? finalPrice + vatAmount
    : basePrice + vatAmount;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      showAlert({
        title: "Fel",
        message: "Vänligen ange en rabattkod",
        type: "error",
      });
      return;
    }
    global_loader_ref?.show_loader(1);
    setIsValidatingCoupon(true);
    const payload = {
      couponCode: couponCode.trim(),
      planId: selectedPackage.id as string,
      purchaseAmount: basePrice,
    };
    // // console.log("payload", payload);
    try {
      const response = await validateCouponMutation.mutateAsync(payload);
      // // console.log("validateCouponMutation response", response);
      if (response.valid) {
        setDiscountApplied(true);
        setDiscountAmount(response.discountAmount);
        setDiscountPercent(response.discount.discountPercent);
        setOriginalPrice(parseFloat(response.originalPrice));
        setFinalPrice(response.finalPrice);
        showAlert({
          title: "Success",
          message:
            response.discount.description || "Discount applied successfully",
          type: "success",
        });
      } else {
        showAlert({
          title: "Error",
          message: "Invalid coupon code",
          type: "error",
        });
        setDiscountApplied(false);
        setDiscountAmount(0);
        setDiscountPercent(0);
        setOriginalPrice(0);
        setFinalPrice(0);
      }
    } catch (error: any) {
      // Handle specific error messages from the backend
      // // console.log("error", error);
      const errorMessage = error?.message || "Failed to validate coupon code";
      showAlert({ title: "Error", message: errorMessage, type: "error" });
      setDiscountApplied(false);
      setDiscountAmount(0);
      setDiscountPercent(0);
      setOriginalPrice(0);
      setFinalPrice(0);
    } finally {
      setIsValidatingCoupon(false);
      global_loader_ref?.show_loader(0);
    }
  };

  const handleCompleteOrder = async (values: any) => {
    const payload = {
      planId: selectedPackage.id as string,
      fullName: values.fullName,
      companyName: values.companyName,
      companyEmail: values.companyEmail,
      billingAddress: values.billingAddress,
      postalCode: values.postalCode,
      city: values.city,
      telephoneNumber: values.phoneNumber,
      couponCode: discountApplied ? couponCode : null,
      companyNumber: values?.companyNumber,
      country: values.country,
      billingEmail: values?.companyEmail,
    };

    // // console.log("payload", payload);

    try {
      global_loader_ref?.show_loader(1);
      const response = await upgradeSubscriptionMutation.mutateAsync(
        payload as any
      );
      // // console.log("upgradeSubscriptionMutation response", response);
      // Check if we have a subscription in the response
      if (response?.subscription) {
        await refreshUserData();
        router.push({
          pathname: "/(main)/OrderSuccess",
          params: {
            orderId: response?.subscription?.id,
            amount: response?.subscription?.pricing?.finalPrice,
          },
        });
      } else {
        showAlert({
          title: "Error",
          message: "Failed to process subscription upgrade",
          type: "error",
        });
      }
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to process subscription upgrade",
        type: "error",
      });
    } finally {
      global_loader_ref?.show_loader(0);
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
      selectedFormik.setFieldValue("country", country);
    }
    hideCountryPicker();
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
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={myColors.white} />
      {!isDesktopWeb() && <SimpleHeader title="Paket" onBackPress={goBack} />}

      <FooterWrapper
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ marginBottom: !isDesktopWeb() ? -50 : 100 }}
          onStartShouldSetResponder={() => true}
        >
          <DesktopViewWrapper>
            {/* Order Summary Ticket */}
            <View style={styles.orderSummaryContainer}>
              {/* Blue bar at the top */}
              <View style={styles.blueTopBar} />

              <View style={styles.glassmorphism}>
                <View style={styles.ticketTopPart}>
                  <MyText fontFamily="Poppins" style={styles.ticketTitle}>
                    Paket
                  </MyText>

                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                      <MyText fontFamily="Poppins" style={styles.packageName}>
                        {selectedPackage.packageName as string}
                      </MyText>
                      {discountApplied ? (
                        <View style={styles.priceContainer}>
                          <MyText style={styles.originalPrice}>
                            {originalPrice.toFixed(2)}kr{" "}
                          </MyText>
                          <MyText style={styles.packagePrice}>
                            {finalPrice.toFixed(2)}kr
                          </MyText>
                        </View>
                      ) : (
                        <MyText style={styles.packagePrice}>
                          {basePrice.toFixed(2)}kr
                        </MyText>
                      )}
                    </View>

                    <View style={styles.summaryRow}>
                      <MyText fontFamily="Poppins" style={styles.packageName}>
                        VAT (25%)
                      </MyText>
                      <MyText style={styles.packagePrice}>
                        {vatAmount.toFixed(2)}kr
                      </MyText>
                    </View>

                    {discountApplied && (
                      <View style={styles.summaryRow}>
                        <MyText fontFamily="Poppins" style={styles.packageName}>
                          Discount ({discountPercent}%)
                        </MyText>
                        <MyText
                          style={{
                            ...styles.packagePrice,
                            color: myColors.success,
                          }}
                        >
                          -{discountAmount.toFixed(2)}kr
                        </MyText>
                      </View>
                    )}
                  </View>
                </View>

                {/* Dashed line with side cutouts */}
                <View style={styles.dashedContainer}>
                  <View style={styles.leftCutout} />
                  <View style={styles.dashedLine} />
                  <View style={styles.rightCutout} />
                </View>

                <View style={styles.ticketBottomPart}>
                  <View style={styles.totalRow}>
                    <View>
                      <MyText fontFamily="Poppins" style={styles.totalLabel}>
                        Belopp Att Betala
                      </MyText>
                      <MyText style={styles.totalValue}>
                        {totalPrice.toFixed(2)}
                        <MyText style={styles.totalValueKr}>kr</MyText>
                      </MyText>
                    </View>
                    <SvgXml xml={ImagePath.SvgIcons.DocumentIcon} />
                  </View>
                </View>
              </View>
            </View>

            {/* Discount Code */}
            <View style={styles.section}>
              <MyText fontFamily="Poppins" style={styles.sectionTitle}>
                Rabattkod
              </MyText>
              <View style={styles.discountContainer}>
                <TextInput
                  style={[
                    styles.discountInput,
                    discountApplied
                      ? { backgroundColor: myColors.border.light }
                      : {},
                  ]}
                  placeholder="Ange rabattkod här"
                  placeholderTextColor={myColors.text.placeholder}
                  value={couponCode}
                  onChangeText={setCouponCode}
                  editable={!discountApplied}
                />
                <MyButton
                  title={discountApplied ? "Applied" : "Apply"}
                  onPress={handleValidateCoupon}
                  buttonStyle={[
                    styles.applyButton,
                    discountApplied
                      ? { backgroundColor: myColors.border.light }
                      : {},
                  ]}
                  disabled={
                    isValidatingCoupon || discountApplied || !couponCode.trim()
                  }
                />
              </View>
            </View>

            {/* Payment Form */}
            <View style={styles.formContainer}>
              <MyText fontFamily="Poppins" style={styles.sectionTitle}>
                Betalningsmetod
              </MyText>

              <View style={styles.paymentMethodContainer}>
                {/* <TouchableOpacity
                                    style={styles.paymentMethodOption}
                                    onPress={() => setPaymentMethod('credit')}
                                >
                                    <View style={styles.radioContainer}>
                                        <View style={[
                                            styles.radioOuterCircle,
                                            paymentMethod === 'credit' && styles.radioOuterCircleSelected
                                        ]}>
                                            {paymentMethod === 'credit' && <View style={styles.radioInnerCircle} />}
                                        </View>
                                        <MyText style={styles.paymentMethodLabel}>Kreditkort</MyText>
                                    </View>
                                </TouchableOpacity> */}

                <TouchableOpacity
                  style={styles.paymentMethodOption}
                  onPress={() => setPaymentMethod("invoice")}
                >
                  <View style={styles.radioContainer}>
                    <View
                      style={[
                        styles.radioOuterCircle,
                        paymentMethod === "invoice" &&
                          styles.radioOuterCircleSelected,
                      ]}
                    >
                      {paymentMethod === "invoice" && (
                        <View style={styles.radioInnerCircle} />
                      )}
                    </View>
                    <MyText style={styles.paymentMethodLabel}>Faktura</MyText>
                  </View>
                </TouchableOpacity>
              </View>

              <Formik
                initialValues={initialValues}
                validationSchema={PaymentSchema}
                enableReinitialize={true}
                onSubmit={handleCompleteOrder}
              >
                {(formikProps: FormikProps<any>) => {
                  const {
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                  } = formikProps;
                  return (
                    <View>
                      <MyTextInput
                        label="Fullständigt namn"
                        placeholder="Ange fullständigt namn"
                        value={values.fullName}
                        onChangeText={handleChange("fullName")}
                        onBlur={handleBlur("fullName")}
                        error={
                          touched.fullName && errors.fullName
                            ? errors.fullName
                            : undefined
                        }
                      />

                      <MyTextInput
                        label="Företagsnamn"
                        placeholder="Ange företagsnamn"
                        value={values.companyName}
                        onChangeText={handleChange("companyName")}
                        onBlur={handleBlur("companyName")}
                        error={
                          touched.companyName && errors.companyName
                            ? errors.companyName
                            : undefined
                        }
                      />

                      <MyTextInput
                        label="Företagets e-post"
                        placeholder="Företagets e-post"
                        value={values.companyEmail}
                        onChangeText={handleChange("companyEmail")}
                        onBlur={handleBlur("companyEmail")}
                        error={
                          touched.companyEmail && errors.companyEmail
                            ? errors.companyEmail
                            : undefined
                        }
                        keyboardType="email-address"
                        autoCapitalize="none"
                        maxLength={MaxEmailLength}
                      />

                      <MyTextInput
                        label="Företagsnummer"
                        placeholder="Ange företagsnamn"
                        value={values.companyNumber}
                        onChangeText={handleChange("companyNumber")}
                        onBlur={handleBlur("companyNumber")}
                        error={
                          touched.companyNumber && errors.companyNumber
                            ? errors.companyNumber
                            : undefined
                        }
                      />

                      <MyTextInput
                        label="Faktureringsadress"
                        placeholder="Ange gatuadress"
                        value={values.billingAddress}
                        onChangeText={handleChange("billingAddress")}
                        onBlur={handleBlur("billingAddress")}
                        error={
                          touched.billingAddress && errors.billingAddress
                            ? errors.billingAddress
                            : undefined
                        }
                      />

                      <View style={styles.rowContainer}>
                        <View style={styles.halfWidth}>
                          <MyTextInput
                            label="Postnummer"
                            placeholder="Ange postnummer"
                            value={values.postalCode}
                            onChangeText={handleChange("postalCode")}
                            onBlur={handleBlur("postalCode")}
                            error={
                              touched.postalCode && errors.postalCode
                                ? errors.postalCode
                                : undefined
                            }
                          />
                        </View>

                        <View style={styles.halfWidth}>
                          <MyTextInput
                            label="Stad"
                            placeholder="Ange din stad"
                            value={values.city}
                            onChangeText={handleChange("city")}
                            onBlur={handleBlur("city")}
                            error={
                              touched.city && errors.city
                                ? errors.city
                                : undefined
                            }
                          />
                        </View>
                      </View>

                      <MyTextInput
                        label="Land / Region"
                        placeholder="Välj land eller region"
                        value={values.country}
                        onChangeText={handleChange("country")}
                        onBlur={handleBlur("country")}
                        error={
                          touched.country && errors.country
                            ? errors.country
                            : undefined
                        }
                        editable={false}
                        onPressIn={() => showCountryPicker(formikProps)}
                        rightIcon={
                          <TouchableOpacity
                            onPress={() => showCountryPicker(formikProps)}
                          >
                            <IconChevronDown size={20} color={myColors.black} />
                          </TouchableOpacity>
                        }
                      />

                      <MyTextInput
                        label="Telefonnummer"
                        placeholder="Ange telefonnummer"
                        value={values.phoneNumber}
                        onChangeText={handleChange("phoneNumber")}
                        onBlur={handleBlur("phoneNumber")}
                        error={
                          touched.phoneNumber && errors.phoneNumber
                            ? errors.phoneNumber
                            : undefined
                        }
                        keyboardType="phone-pad"
                      />

                      {/* <View style={styles.checkboxContainer}>
                                                <Checkbox
                                                    value={savePaymentInfo}
                                                    onValueChange={() => {
                                                        setSavePaymentInfo(!savePaymentInfo);
                                                    }}
                                                    color={savePaymentInfo ? myColors.primary.main : undefined}
                                                    style={styles.checkbox}
                                                />
                                                <MyText style={styles.checkboxLabel}>
                                                    Spara dessa betalningsuppgifter för framtida bruk.
                                                </MyText>
                                            </View> */}

                      <MyButton
                        title="Slutför Betalning"
                        onPress={handleSubmit}
                        buttonStyle={styles.payButton}
                      />
                    </View>
                  );
                }}
              </Formik>
            </View>
          </DesktopViewWrapper>
        </View>
      </FooterWrapper>

      {/* Country Picker Modal */}
      <Modal
        visible={isCountryPickerVisible}
        animationType="slide"
        transparent={true}
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
    </View>
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
  orderSummaryContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    paddingTop: 8, // Space for the blue bar
  },
  blueTopBar: {
    position: "absolute",
    top: 10,
    // left: '35%',
    // right: '35%',
    alignSelf: "center",
    height: 10,
    width: 106,
    backgroundColor: myColors.primary.main, // Primary blue color
    borderRadius: 8,
    // zIndex: 10,
  },
  glassmorphism: {
    backgroundColor: "rgba(221, 235, 245, 0.97)",
    // borderColor: 'rgba(255, 255, 255, 0.5)',
    // borderWidth: 1,
    borderRadius: 16,
    // shadowColor: '#000',
    // shadowOffset: {
    //     width: 0,
    //     height: 4,
    // },
    // shadowOpacity: 0.15,
    // shadowRadius: 12,
    // elevation: 8,
    overflow: "hidden",
    marginTop: 8, // Give some space from the blue bar
  },
  ticketTopPart: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
  },
  ticketBottomPart: {
    marginTop: 16,
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backdropFilter: "blur(10px)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dashedContainer: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(208, 208, 208, 0.5)",
    marginHorizontal: 10,
  },
  leftCutout: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: myColors.screenBackgroundColor,
    marginLeft: -15,
  },
  rightCutout: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: myColors.screenBackgroundColor,
    marginRight: -15,
  },
  ticketTitle: {
    fontSize: 20,
    color: myColors.text.primary,
    marginBottom: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryContainer: {
    backgroundColor: "#DFECF9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  packageName: {
    fontSize: 14,
    color: myColors.baseColors.lightGray3,
  },
  packagePrice: {
    fontSize: 14,
    color: myColors.black,
  },
  vatLabel: {
    fontSize: 16,
    color: "rgba(117, 128, 154, 0.9)",
  },
  vatValue: {
    fontSize: 16,
    fontWeight: "600",
    color: myColors.text.primary,
  },
  totalLabel: {
    fontSize: 14,
    color: myColors.baseColors.lightGray3,
  },
  totalRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalValue: {
    fontSize: 24,
    color: myColors.text.primary,
    marginRight: 12,
  },
  totalValueKr: {
    fontSize: 14,
    color: myColors.text.primary,
  },
  receiptIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    color: myColors.text.primary,
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountInput: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: myColors.border.light,
    borderRadius: 8,
    backgroundColor: myColors.white,
    paddingHorizontal: 16,
    fontSize: 14,
    color: myColors.text.primary,
    marginRight: 10,
  },
  applyButton: {
    width: 100,
    height: 52,
    backgroundColor: myColors.primary.main,
    marginTop: 0,
  },
  formContainer: {
    backgroundColor: myColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginHorizontal: 15,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  paymentMethodOption: {
    marginRight: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuterCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: myColors.border.light,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterCircleSelected: {
    borderColor: myColors.primary.main,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: myColors.primary.main,
  },
  paymentMethodLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: myColors.text.primary,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: myColors.border.light,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: myColors.primary.main,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: myColors.baseColors.lightGray3,
  },
  payButton: {
    marginTop: 16,
    backgroundColor: myColors.primary.main,
  },
  discountText: {
    color: myColors.error,
  },
  discountInputDisabled: {
    backgroundColor: myColors.border.light,
    color: myColors.text.secondary,
  },
  applyButtonDisabled: {
    backgroundColor: myColors.border.light,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: myColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: myColors.border.light,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
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
  priceContainer: {
    alignItems: "flex-end",
    flexDirection: "row",
  },
  originalPrice: {
    fontSize: 14,
    color: myColors.baseColors.lightGray3,
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
});
