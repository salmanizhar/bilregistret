import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform, ViewStyle, TextStyle, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SimpleHeader from '@/components/common/SimpleHeader';
import MyText from '@/components/common/MyText';
import { myColors } from '@/constants/MyColors';
import { ImagePath } from '@/assets/images';
import MyButton from '@/components/common/MyButton';
import PackageCard from '@/components/common/PackageCard';
import DatePickerModal from '@/components/common/DatePickerModal';
import { useAuth } from '@/Services/api/context/auth.context';
import { AllPackageData } from '@/constants/commonConst';
import NoSubscription from '@/components/NoSubscription';
import { useCancelSubscription } from '@/Services/api/hooks';
import moment from 'moment';
import { showAlert } from '@/utils/alert';
import { getStatusBarHeight } from '@/constants/commonFunctions';
import { safeNavigation } from '@/utils/safeNavigation';
import { isDesktopWeb } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { MySubscriptionSEO } from '@/components/seo';

// Define types for styles
interface Styles {
    container: ViewStyle;
    scrollView: ViewStyle;
    content: ViewStyle;
    desktopContent: ViewStyle;
    desktopTitleSection: ViewStyle;
    desktopTitle: TextStyle;
    desktopSubtitle: TextStyle;
    actionCardsContainer: ViewStyle;
    desktopActionCardsContainer: ViewStyle;
    actionCard: ViewStyle;
    desktopActionCard: ViewStyle;
    actionCardBorder: ViewStyle;
    actionCardContent: ViewStyle;
    actionTitle: TextStyle;
    desktopActionTitle: TextStyle;
    actionDescription: TextStyle;
    desktopActionDescription: TextStyle;
    buttonContainer: ViewStyle;
    button: ViewStyle;
    desktopButton: ViewStyle;
    buttonText: TextStyle;
    desktopButtonText: TextStyle;
}

export default function MySubscription() {
    const router = useRouter();
    const { user: userData, isLoading, isPremiumUser, refreshUserData } = useAuth();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCancelling, setIsCancelling] = useState(false);

    // Get the cancellation mutation hook
    const cancelSubscription = useCancelSubscription();

    const handleGoBack = () => {
        router.back();
    };

    if (!userData?.subscription) {
        return (
            <View style={styles.container}>
                {!isDesktopWeb() && (
                    <SimpleHeader
                        title="Min Prenumeration"
                        onBackPress={handleGoBack}
                    />
                )}
                <FooterWrapper style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <DesktopViewWrapper>
                        <NoSubscription />
                    </DesktopViewWrapper>
                </FooterWrapper>
            </View>
        )
    }

    // // console.log("userData from my subscription", userData);
    const getIconByPackageIndex = (index: number) => {
        if (!AllPackageData || !AllPackageData[index]) return '';
        return AllPackageData[index].icon || '';
    };

    const getIcon = (pkg: any, index: number): string => {
        // Map API icon names to actual SVG components
        switch (pkg.icon) {
            case 'ImagePath.SvgIcons.EnergyIcon':
                return ImagePath.SvgIcons.EnergyIcon;
            case 'ImagePath.SvgIcons.Cube3Icon':
                return ImagePath.SvgIcons.Cube3Icon;
            case 'ImagePath.SvgIcons.MaxPremiumIcon':
                return ImagePath.SvgIcons.MaxPremiumIcon;
            default:
                return getIconByPackageIndex(index);
        }
    };

    const subscription = {
        packageName: userData?.subscription.plan.packageName || userData?.subscription.plan.name,
        description: userData?.subscription.plan.description,
        price: userData?.subscription.plan.price + userData?.subscription.plan.priceDisplay,
        period: userData?.subscription.plan.period,
        icon: getIcon(userData?.subscription.plan, 0)  // Using default icon since API doesn't provide one
    };


    const handleShowDatePicker = () => {
        setShowDatePicker(true);
    };

    const handleDateChange = async (date: Date) => {
        setSelectedDate(date);
        setShowDatePicker(false);

        // Format the date as MM/DD/YYYY
        const formattedDate = moment(date).format('DD MMM YYYY');

        showAlert({
            title: 'Bekräfta avbrytande',
            message: `Är du säker på att du vill avbryta din prenumeration från ${formattedDate}?`,
            type: 'warning',
            positiveButton: {
                text: 'Avbryt',
                onPress: () => { }
            },
            negativeButton: {
                text: 'Ja, avbryt',
                onPress: () => cancelSubscriptionWithDate(formattedDate)
            }
        });
    };

    const cancelSubscriptionWithDate = async (formattedDate: string) => {
        try {
            setIsCancelling(true);

            // Call API to cancel subscription
            await cancelSubscription.mutateAsync({
                date: formattedDate
            });

            // Refresh user data to get updated subscription status
            await refreshUserData();

            showAlert({
                title: 'Framgång',
                message: 'Din prenumeration har avbrutits framgångsrikt.',
                type: 'success',
            });

        } catch (error) {
            // Show error message
            showAlert({
                title: 'Fel',
                message: 'Det gick inte att avbryta prenumerationen. Försök igen senare.',
                type: 'error',
            });
            // console.error('Error canceling subscription:', error);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleCloseDatePicker = () => {
        setShowDatePicker(false);
    };

    const handleUpgrade = () => {
        if (isDesktopWeb()) {
            safeNavigation("/paket")
        } else {
            // safeNavigation("/SelectPackage")
            safeNavigation("/paket")
        }
    };

    return (
        <View style={styles.container}>
            {/* SEO Head Tags */}
            <MySubscriptionSEO />

            {!isDesktopWeb() && (
                <SimpleHeader
                    title="Min Prenumeration"
                    onBackPress={handleGoBack}
                />
            )}

            <FooterWrapper style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <DesktopViewWrapper>
                    <View style={[styles.content, isDesktopWeb() && styles.desktopContent]}>
                        {/* Desktop Title */}
                        {isDesktopWeb() && (
                            <View style={styles.desktopTitleSection}>
                                <MyText fontFamily='Poppins' style={styles.desktopTitle}>
                                    Min Prenumeration
                                </MyText>
                                <MyText style={styles.desktopSubtitle}>
                                    Hantera din nuvarande prenumeration och upptäck andra alternativ
                                </MyText>
                            </View>
                        )}

                        {/* Current Subscription Card */}
                        <PackageCard
                            packageName={subscription.packageName}
                            description={subscription.description}
                            icon={subscription.icon}
                            price={subscription.price}
                        />

                        {/* Action Cards Container */}
                        <View style={[styles.actionCardsContainer, isDesktopWeb() && styles.desktopActionCardsContainer]}>
                            {/* Cancel Subscription Card */}
                            <View style={[styles.actionCard, styles.actionCardBorder, isDesktopWeb() && styles.desktopActionCard]}>
                                <View style={styles.actionCardContent}>
                                    <MyText style={[styles.actionTitle, isDesktopWeb() && styles.desktopActionTitle]}>
                                        Avsluta denna prenumeration
                                    </MyText>
                                    <MyText style={[styles.actionDescription, isDesktopWeb() && styles.desktopActionDescription]}>
                                        Du kan välja ett datum
                                    </MyText>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, isDesktopWeb() && styles.desktopButton]}
                                    onPress={handleShowDatePicker}
                                    disabled={isCancelling}
                                >
                                    <MyText style={[styles.buttonText, isDesktopWeb() && styles.desktopButtonText]}>
                                        {isCancelling ? "Avbryter..." : "Välj datum"}
                                    </MyText>
                                </TouchableOpacity>
                            </View>

                            {/* Upgrade Subscription Card */}
                            <View style={[styles.actionCard, isDesktopWeb() && styles.desktopActionCard]}>
                                <View style={styles.actionCardContent}>
                                    <MyText style={[styles.actionTitle, isDesktopWeb() && styles.desktopActionTitle]}>
                                        Uppgradera till ett annat paket
                                    </MyText>
                                    <MyText style={[styles.actionDescription, isDesktopWeb() && styles.desktopActionDescription]}>
                                        Välj ditt paket efter behov
                                    </MyText>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, isDesktopWeb() && styles.desktopButton]}
                                    onPress={handleUpgrade}
                                >
                                    <MyText style={[styles.buttonText, isDesktopWeb() && styles.desktopButtonText]}>
                                        Visa paket
                                    </MyText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </DesktopViewWrapper>
            </FooterWrapper>

            {/* DatePicker Component */}
            <DatePickerModal
                isVisible={showDatePicker}
                date={selectedDate}
                onClose={handleCloseDatePicker}
                onDateChange={handleDateChange}
                minimumDate={new Date()}
                maximumDate={moment(userData?.subscription.endDate).toDate()}
            />
        </View>
    );
}

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
        paddingTop: isDesktopWeb() ? 0 : getStatusBarHeight(),
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: isDesktopWeb() ? 0 : 16,
        paddingTop: isDesktopWeb() ? 0 : 16,
    },
    desktopContent: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 40,
    },
    desktopTitleSection: {
        marginBottom: 40,
        alignItems: 'center',
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '400',
        color: myColors.text.primary,
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 40,
    },
    desktopSubtitle: {
        fontSize: 16,
        color: myColors.text.placeholderText,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 600,
    },
    actionCardsContainer: {
        marginTop: 16,
    },
    desktopActionCardsContainer: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 40,
    },
    actionCard: {
        backgroundColor: myColors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    desktopActionCard: {
        flex: 1,
        padding: 24,
        marginBottom: 0,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        minHeight: 180,
    },
    actionCardBorder: {
        borderWidth: 1,
        borderColor: myColors.primary.main,
    },
    actionCardContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        color: myColors.text.primary,
        marginBottom: 4,
    },
    desktopActionTitle: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 8,
    },
    actionDescription: {
        fontSize: 15,
        color: myColors.baseColors.lightGray3,
        marginBottom: 16,
    },
    desktopActionDescription: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
    },
    buttonContainer: {
        alignItems: 'flex-end',
    },
    button: {
        backgroundColor: myColors.primary.main,
        borderRadius: 6,
        paddingVertical: 5,
        paddingHorizontal: 8,
    },
    desktopButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'stretch',
    },
    buttonText: {
        color: myColors.white,
        fontSize: 13,
    },
    desktopButtonText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});
