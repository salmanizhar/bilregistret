import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { SvgXml } from 'react-native-svg';
import MyButton from '@/components/common/MyButton';
import SimpleHeader from '@/components/common/SimpleHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImagePath } from '@/assets/images';
import PackageCard from '@/components/common/PackageCard';
import { isDesktopWeb } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { safeNavigation } from '@/utils/safeNavigation';

interface Package {
    id: number;
    packageName: string;
    description: string;
    fullDescription: string;
    additionalInformation: string;
    price: string;
    period: string;
    features: { title: string; description: string }[];
    icon: string;
}


export default function PackageReadMore() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Default to Max package if not specified
    const selectedPackage = params;

    // Parse features safely
    let parsedFeatures = [];
    try {
        if (typeof selectedPackage.features === 'string') {
            parsedFeatures = JSON.parse(selectedPackage.features);
        } else if (Array.isArray(selectedPackage.features)) {
            parsedFeatures = selectedPackage.features;
        }
    } catch (error) {
        parsedFeatures = [];
    }

    // // console.log('packageName', selectedPackage);

    const goBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={myColors.primary.main} />
            <Stack.Screen options={{ headerShown: false }} />

            {!isDesktopWeb() && (
                <SimpleHeader title={"Paket"} onBackPress={goBack} />
            )}

            <FooterWrapper style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <DesktopViewWrapper>
                    <View style={[styles.content, isDesktopWeb() && styles.desktopContent]}>
                        {/* Package Summary Card */}
                        <PackageCard
                            packageName={selectedPackage.packageName as string}
                            description={selectedPackage.description as string}
                            icon={selectedPackage.icon as string}
                            price={selectedPackage.price as string}
                            period={selectedPackage.period as string}
                            containerStyle={styles.packageSummaryCard}
                        />

                        {/* Order Button */}
                        <MyButton
                            title="Beställ"
                            onPress={() => {
                                safeNavigation('/orderplace');
                            }}
                            buttonStyle={styles.orderButton}
                        />

                        {/* Description Section */}
                        <View style={styles.descriptionSection}>
                            <MyText style={styles.descriptionText}>
                                {selectedPackage.fullDescription}
                            </MyText>
                        </View>

                        {/* Benefits Section */}
                        <View style={styles.benefitsSection}>
                            <MyText fontFamily='Poppins' style={styles.benefitsSectionTitle}>
                                Bilinfo du kan få tillgång till inloggad:
                            </MyText>

                            <View style={styles.benefitsList}>
                                {parsedFeatures.map((feature: { title: string; description: string }, index: number) => (
                                    <View key={index} style={styles.benefitItem}>
                                        <SvgXml xml={ImagePath.SvgIcons.CheckIcon} />
                                        <MyText style={styles.benefitText}>
                                            {feature.description}
                                        </MyText>
                                    </View>
                                ))}


                            </View>
                        </View>

                        {/* Additional Information */}
                        <MyText style={styles.additionalInfo}>
                            {selectedPackage.additionalInformation}
                        </MyText>
                    </View>
                </DesktopViewWrapper>
            </FooterWrapper>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: myColors.white,
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: myColors.text.primary,
    },
    headerRightSpace: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 15,
        paddingBottom: 40,
    },
    desktopContent: {
        marginBottom: 30,
    },
    packageSummaryCard: {
        marginBottom: 10,
    },
    orderButton: {
        backgroundColor: myColors.primary.main,
        marginBottom: 20,
    },
    descriptionSection: {
        marginBottom: 20,
    },
    descriptionText: {
        fontSize: 15,
        color: myColors.baseColors.light3,
        lineHeight: 22,
        marginBottom: 10,
    },
    benefitsSection: {
        backgroundColor: myColors.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    benefitsSectionTitle: {
        fontSize: 20,
        color: myColors.text.primary,
        lineHeight: 30,
        marginBottom: 15,
    },
    benefitsList: {
        marginBottom: 10,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 0.5,
        borderColor: myColors.border.light,
        paddingBottom: 10,
    },
    benefitText: {
        fontSize: 14,
        color: myColors.text.primary,
        marginLeft: 10,
        flex: 1,
    },
    additionalInfo: {
        fontSize: 15,
        color: myColors.baseColors.light3,
        lineHeight: 22,
    },
});