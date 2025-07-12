import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { SvgXml } from 'react-native-svg';
import MyButton from '@/components/common/MyButton';
import { ImagePath } from '@/assets/images';
import { AllPackageData } from '@/constants/commonConst';
import { myStyles } from '@/Styles/myStyles';
import SimpleHeader from '@/components/common/SimpleHeader';
import { usePackages, UIPackage } from '@/Services/api/hooks/usePackages';
import { PackageFeature, PackageResponse } from '@/Services/api/services/packages.service';
import { getStatusBarHeight } from '@/constants/commonFunctions';

type LocalPackage = typeof AllPackageData[0];

type DisplayPackage = PackageResponse | LocalPackage;

export default function SelectPackage() {
    const router = useRouter();
    const { data: packages, isLoading, isError, error } = usePackages();

    const navigateToOrderPlace = (data: DisplayPackage) => {
        if (!router) return; // Guard clause for router

        const params = {
            id: data.id?.toString() || '',
            packageName: getPackageName(data),
            description: data.description || '',
            fullDescription: data.fullDescription || '',
            additionalInformation: data.additionalInformation || '',
            price: data.price || '',
            priceDisplay: data.priceDisplay || '',
            period: data.period || '',
            features: JSON.stringify(getFeatures(data)),
            icon: getIcon(data, 0) || '', // Fallback to first icon if none provided
        };

        router.push({
            pathname: '/orderplace',
            params
        });
    };

    const navigateToReadMore = (data: DisplayPackage) => {
        if (!router) return; // Guard clause for router

        const params = {
            id: data.id?.toString() || '',
            packageName: getPackageName(data),
            description: data.description || '',
            fullDescription: data.fullDescription || '',
            additionalInformation: data.additionalInformation || '',
            price: data.price || '',
            priceDisplay: data.priceDisplay || '',
            period: data.period || '',
            features: JSON.stringify(getFeatures(data)),
            icon: getIcon(data, 0) || '', // Fallback to first icon if none provided
        };

        router.push({
            pathname: '/packagereadmore',
            params
        });
    };

    const handleGoBack = () => {
        router.back();
    };

    const isApiPackage = (pkg: DisplayPackage): pkg is PackageResponse => {
        return 'id' in pkg && typeof pkg.id === 'number';
    };


    const getPackageName = (pkg: DisplayPackage): string => {
        if (isApiPackage(pkg)) {
            return pkg.name;
        }
        return pkg.packageName || pkg.name || '';
    };

    const getFeatures = (pkg: DisplayPackage): PackageFeature[] => {
        if (isApiPackage(pkg)) {
            return Array.isArray(pkg.features) ? pkg.features : [];
        }
        if (Array.isArray(pkg.features)) {
            return pkg.features;
        }
        return [];
    };

    const getIconByPackageIndex = (index: number) => {
        if (!AllPackageData || !AllPackageData[index]) return '';
        return AllPackageData[index].icon || '';
    };

    const getIcon = (pkg: DisplayPackage, index: number): string => {
        if (isApiPackage(pkg)) {
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
        }
        return getIconByPackageIndex(index);
    };

    // Fallback to local data if there's an error or if loading is taking too long
    const displayPackages = packages || []// || AllPackageData;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <SimpleHeader
                title="Välj paket"
                onBackPress={handleGoBack}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {displayPackages?.map((item: DisplayPackage, index: number) => (
                        <View key={index} style={styles.packageCard}>
                            <View style={styles.packageHeader}>
                                <View style={styles.packageHeaderTextContainer}>
                                    <MyText fontFamily='Poppins' style={styles.packageTitle}>
                                        {getPackageName(item)}
                                    </MyText>
                                    <MyText style={styles.packageDescription}>
                                        {item.description}
                                    </MyText>
                                </View>
                                <View style={styles.iconContainer}>
                                    {getIcon(item, index) ? (
                                        <SvgXml key={index} xml={getIcon(item, index)} />
                                    ) : (
                                        <SvgXml key={index} xml={ImagePath.SvgIcons.EnergyIcon} />
                                    )}
                                </View>
                            </View>

                            <View style={styles.priceContainer}>
                                <MyText style={styles.priceValue}>{item.price}{item.priceDisplay}</MyText>
                                <MyText style={styles.perMonth}>{item.period}</MyText>
                            </View>

                            <View style={styles.featuresContainer}>
                                {getFeatures(item).length > 0 ? (
                                    getFeatures(item).map((feature: PackageFeature, index: number) => (
                                        <View key={index} style={styles.featureItem}>
                                            <SvgXml xml={ImagePath.SvgIcons.CheckIcon} />
                                            <MyText style={styles.featureText}>{feature.title}</MyText>
                                        </View>
                                    ))
                                ) : (
                                    <MyText style={styles.featureText}>Inga funktioner tillgängliga</MyText>
                                )}
                            </View>

                            <View style={styles.buttonsContainer}>
                                <MyButton
                                    title="Beställ"
                                    onPress={() => { navigateToOrderPlace(item) }}
                                    buttonStyle={styles.orderButton}
                                />
                                <MyButton
                                    title="läs mer"
                                    onPress={() => { navigateToReadMore(item) }}
                                    buttonStyle={styles.readMoreButton}
                                    textStyle={styles.readMoreText}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
        paddingTop: getStatusBarHeight(),
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 15,
        paddingBottom: 40,
    },
    loaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: myColors.text.primary,
    },
    errorContainer: {
        padding: 20,
        marginBottom: 20,
        backgroundColor: myColors.white,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: myColors.error,
    },
    errorText: {
        fontSize: 16,
        color: myColors.text.primary,
        marginBottom: 5,
    },
    errorDebug: {
        fontSize: 12,
        color: myColors.baseColors.light2,
    },
    packageCard: {
        backgroundColor: myColors.white,
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
        padding: 15,
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    packageTitle: {
        fontSize: 20,
        lineHeight: 30,
        color: myColors.text.primary,
        marginBottom: 5,
    },
    packageDescription: {
        fontSize: 14,
        color: myColors.baseColors.light2,
        lineHeight: 20,
        maxWidth: '90%',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: myColors.screenBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: myColors.border.light,
        paddingBottom: 20,
    },
    priceValue: {
        fontSize: 36,
        color: myColors.text.primary,
    },
    perMonth: {
        fontSize: 12,
        color: myColors.baseColors.light2,
        marginLeft: 5,
    },
    featuresContainer: {
        marginBottom: 15,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: "50%",
    },
    featureText: {
        fontSize: 14,
        color: myColors.text.primary,
        marginLeft: 10,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    orderButton: {
        flex: 1,
        marginRight: 10,
        backgroundColor: myColors.black,
    },
    readMoreButton: {
        flex: 1,
        borderWidth: 1,
        backgroundColor: myColors.white,
        borderColor: myColors.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    readMoreText: {
        fontSize: 16,
        color: myColors.text.primary,
    },
    packageHeaderTextContainer: {
        width: "78%",
    },
});
