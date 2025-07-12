import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import HeaderWithSearch from '@/components/common/HeaderWithSearch';
import { SvgXml } from 'react-native-svg';
import MyButton from '@/components/common/MyButton';
import { ImagePath } from '@/assets/images';
import { AllPackageData } from '@/constants/commonConst';
import { usePackages } from '@/Services/api/hooks/usePackages';
import { PackageFeature, PackageResponse } from '@/Services/api/services/packages.service';
import { isDesktopWeb } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';

type LocalPackage = typeof AllPackageData[0];

type DisplayPackage = PackageResponse | LocalPackage;

const isApiPackage = (pkg: DisplayPackage): pkg is PackageResponse => {
    return 'id' in pkg && typeof pkg.id === 'number';
};

const isLocalPackage = (pkg: DisplayPackage): pkg is LocalPackage => {
    return 'id' in pkg && typeof pkg.id === 'string';
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

export default function AllPackage() {
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

        if (Platform.OS === 'web') {
            router.navigate({
                pathname: '/orderplace',
                params
            });
        } else {
            router.push({
                pathname: '/orderplace',
                params
            });
        }
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

        if (Platform.OS === 'web') {
            router.navigate({
                pathname: '/packagereadmore',
                params
            });
        } else {
            router.push({
                pathname: '/packagereadmore',
                params
            });
        }
    };

    console.log('packages', packages);

    // Use API data if available, otherwise fallback to local data
    const displayPackages = packages || [];

    // Get all unique features for comparison table
    const getAllFeatures = () => {
        const allFeatures = new Set<string>();
        displayPackages.forEach(pkg => {
            getFeatures(pkg).forEach(feature => {
                allFeatures.add(feature.title);
            });
        });
        return Array.from(allFeatures);
    };

    // Check if package has specific feature
    const hasFeature = (pkg: DisplayPackage, featureTitle: string) => {
        return getFeatures(pkg).some(feature => feature.title === featureTitle);
    };

    console.log('displayPackages', displayPackages);
    // Desktop Layout Component
    const DesktopPackageLayout = () => (
        <View style={styles.desktopLayout}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
                <MyText fontFamily='Poppins' style={styles.heroTitle}>
                    Välj det paket som passar ditt företag bäst
                </MyText>
                <MyText style={styles.heroSubtitle}>
                    Få tillgång till omfattande fordonsdata och kraftfulla analysverktyg som tar din verksamhet till nästa nivå
                </MyText>
            </View>

            {/* Packages Grid */}
            <View style={styles.packagesGrid}>
                {displayPackages.map((item: DisplayPackage, index: number) => (
                    <View key={index} style={[styles.desktopPackageCard, index === 1 && styles.popularPackage]}>
                        {index === 1 && (
                            <View style={styles.popularBadge}>
                                <MyText style={styles.popularText}>POPULÄRAST</MyText>
                            </View>
                        )}

                        <View style={styles.desktopPackageHeader}>
                            <View style={styles.desktopIconContainer}>
                                {getIcon(item, index) ? (
                                    <SvgXml xml={getIcon(item, index)} width={32} height={32} />
                                ) : (
                                    <SvgXml xml={ImagePath.SvgIcons.EnergyIcon} width={32} height={32} />
                                )}
                            </View>
                            <MyText fontFamily='Poppins' style={styles.desktopPackageTitle}>
                                {getPackageName(item)}
                            </MyText>
                            <MyText style={styles.desktopPackageDescription}>
                                {item.description}
                            </MyText>
                        </View>

                        <View style={styles.desktopPriceContainer}>
                            <MyText style={styles.desktopPriceValue}>
                                {item.price}{item.priceDisplay}
                            </MyText>
                            <MyText style={styles.desktopPeriod}>{item.period}</MyText>
                        </View>

                        <View style={styles.desktopFeaturesContainer}>
                            {getFeatures(item).slice(0, 4).map((feature: PackageFeature, featureIndex: number) => (
                                <View key={featureIndex} style={styles.desktopFeatureItem}>
                                    <SvgXml xml={ImagePath.SvgIcons.CheckIcon} width={16} height={16} />
                                    <MyText style={styles.desktopFeatureText}>{feature.title}</MyText>
                                </View>
                            ))}
                            {getFeatures(item).length > 4 && (
                                <MyText style={styles.moreFeatures}>+{getFeatures(item).length - 4} fler funktioner</MyText>
                            )}
                        </View>

                        <View style={styles.desktopButtonsContainer}>
                            <MyButton
                                title="Beställ nu"
                                onPress={() => navigateToOrderPlace(item)}
                                buttonStyle={index === 1 ? [styles.desktopOrderButton, styles.popularOrderButton] : styles.desktopOrderButton}
                                textStyle={styles.desktopOrderButtonText}
                            />
                            <MyButton
                                title="Läs mer"
                                onPress={() => navigateToReadMore(item)}
                                buttonStyle={styles.desktopReadMoreButton}
                                textStyle={styles.desktopReadMoreText}
                            />
                        </View>
                    </View>
                ))}
            </View>

            {/* Detailed Information Section */}
            <View style={styles.detailsSection}>
                <MyText fontFamily='Poppins' style={styles.detailsSectionTitle}>
                    Detaljerad paketinformation
                </MyText>

                {displayPackages.map((item: DisplayPackage, index: number) => (
                    item.fullDescription && (
                        <View key={index} style={styles.packageDetailCard}>
                            <View style={styles.packageDetailHeader}>
                                <View style={styles.packageDetailIcon}>
                                    <SvgXml xml={getIcon(item, index)} width={24} height={24} />
                                </View>
                                <MyText fontFamily='Poppins' style={styles.packageDetailTitle}>
                                    {getPackageName(item)}
                                </MyText>
                            </View>
                            <MyText style={styles.packageDetailDescription}>
                                {item.fullDescription}
                            </MyText>
                            {item.additionalInformation && (
                                <MyText style={styles.packageAdditionalInfo}>
                                    {item.additionalInformation}
                                </MyText>
                            )}
                        </View>
                    )
                ))}
            </View>

            {/* Feature Comparison Table */}
            <View style={styles.comparisonSection}>
                <MyText fontFamily='Poppins' style={styles.comparisonTitle}>
                    Jämför funktioner
                </MyText>

                <View style={styles.comparisonTable}>
                    {/* Header Row */}
                    <View style={styles.comparisonHeaderRow}>
                        <View style={styles.featureNameColumn}>
                            <MyText style={styles.comparisonHeaderText}>Funktioner</MyText>
                        </View>
                        {displayPackages.map((pkg, index) => (
                            <View key={index} style={styles.comparisonPackageColumn}>
                                <MyText style={styles.comparisonHeaderText}>
                                    {getPackageName(pkg)}
                                </MyText>
                            </View>
                        ))}
                    </View>

                    {/* Feature Rows */}
                    {getAllFeatures().map((featureTitle, index) => (
                        <View key={index} style={styles.comparisonFeatureRow}>
                            <View style={styles.featureNameColumn}>
                                <MyText style={styles.featureNameText}>{featureTitle}</MyText>
                            </View>
                            {displayPackages.map((pkg, pkgIndex) => (
                                <View key={pkgIndex} style={styles.comparisonPackageColumn}>
                                    {hasFeature(pkg, featureTitle) ? (
                                        <SvgXml xml={ImagePath.SvgIcons.CheckIcon} width={20} height={20} />
                                    ) : (
                                        <View style={styles.crossIcon}>
                                            <MyText style={styles.crossText}>✕</MyText>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    // Mobile Layout Component (existing)
    const MobilePackageLayout = () => (
        <View style={[styles.content, isDesktopWeb() && styles.desktopContent]}>
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
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {!isDesktopWeb() && <HeaderWithSearch />}
            <FooterWrapper style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={{ marginBottom: !isDesktopWeb() ? -50 : 0 }} onStartShouldSetResponder={() => true}>
                    <DesktopViewWrapper>
                        {isDesktopWeb() ? <DesktopPackageLayout /> : <MobilePackageLayout />}
                    </DesktopViewWrapper>
                </View>
            </FooterWrapper>
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
    content: {
        padding: 15,
        paddingBottom: 40,
    },
    desktopContent: {
        paddingBottom: 30,
    },
    // Desktop-specific styles
    desktopLayout: {
        padding: 40,
        paddingBottom: 60,
    },
    heroSection: {
        textAlign: 'center',
        marginBottom: 60,
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 28,
        color: myColors.black,
        fontWeight: '700',
        lineHeight: 30,
        marginBottom: 20,
        textAlign: 'center',
        maxWidth: 800,
    },
    heroSubtitle: {
        fontSize: 18,
        color: myColors.baseColors.light2,
        lineHeight: 26,
        textAlign: 'center',
        maxWidth: 600,
    },
    packagesGrid: {
        flexDirection: 'row',
        gap: 30,
        marginBottom: 80,
    },
    desktopPackageCard: {
        flex: 1,
        backgroundColor: myColors.white,
        borderRadius: 20,
        padding: 30,
        position: 'relative',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    popularPackage: {
        borderColor: myColors.primary.main,
        transform: [{ scale: 1.05 }],
        zIndex: 1,
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        alignSelf: 'center',
        backgroundColor: myColors.primary.main,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    popularText: {
        color: myColors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    desktopPackageHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    desktopIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: myColors.screenBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    desktopPackageTitle: {
        fontSize: 24,
        lineHeight: 32,
        color: myColors.text.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    desktopPackageDescription: {
        fontSize: 16,
        color: myColors.baseColors.light2,
        lineHeight: 22,
        textAlign: 'center',
    },
    desktopPriceContainer: {
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    desktopPriceValue: {
        fontSize: 48,
        color: myColors.text.primary,
        fontWeight: '600',
    },
    desktopPeriod: {
        fontSize: 14,
        color: myColors.baseColors.light2,
        marginTop: 5,
    },
    desktopFeaturesContainer: {
        marginBottom: 30,
        minHeight: 200,
    },
    desktopFeatureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    desktopFeatureText: {
        fontSize: 14,
        color: myColors.text.primary,
        marginLeft: 12,
        flex: 1,
    },
    moreFeatures: {
        fontSize: 12,
        color: myColors.baseColors.light2,
        fontStyle: 'italic',
        marginTop: 10,
    },
    desktopButtonsContainer: {
        gap: 15,
    },
    desktopOrderButton: {
        backgroundColor: myColors.black,
        paddingVertical: 16,
        borderRadius: 12,
    },
    popularOrderButton: {
        backgroundColor: myColors.primary.main,
    },
    desktopOrderButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    desktopReadMoreButton: {
        borderWidth: 1,
        backgroundColor: 'transparent',
        borderColor: myColors.border.light,
        paddingVertical: 16,
        borderRadius: 12,
    },
    desktopReadMoreText: {
        fontSize: 16,
        color: myColors.text.primary,
    },
    // Detailed Information Section
    detailsSection: {
        marginBottom: 80,
    },
    detailsSectionTitle: {
        fontSize: 36,
        lineHeight: 44,
        color: myColors.text.primary,
        marginBottom: 40,
        textAlign: 'center',
    },
    packageDetailCard: {
        backgroundColor: myColors.white,
        borderRadius: 16,
        padding: 30,
        marginBottom: 30,
    },
    packageDetailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    packageDetailIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: myColors.screenBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    packageDetailTitle: {
        fontSize: 24,
        color: myColors.text.primary,
    },
    packageDetailDescription: {
        fontSize: 16,
        color: myColors.text.primary,
        lineHeight: 24,
        marginBottom: 20,
    },
    packageAdditionalInfo: {
        fontSize: 15,
        color: myColors.baseColors.light2,
        lineHeight: 22,
    },
    // Comparison Table
    comparisonSection: {
        backgroundColor: myColors.white,
        borderRadius: 20,
        padding: 40,
    },
    comparisonTitle: {
        fontSize: 36,
        lineHeight: 44,
        color: myColors.text.primary,
        marginBottom: 40,
        textAlign: 'center',
    },
    comparisonTable: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: myColors.border.light,
    },
    comparisonHeaderRow: {
        flexDirection: 'row',
        backgroundColor: myColors.screenBackgroundColor,
        borderBottomWidth: 2,
        borderBottomColor: myColors.border.light,
    },
    comparisonFeatureRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    featureNameColumn: {
        flex: 2,
        padding: 20,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: myColors.border.light,
    },
    comparisonPackageColumn: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: myColors.border.light,
    },
    comparisonHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: myColors.text.primary,
        textAlign: 'center',
    },
    featureNameText: {
        fontSize: 14,
        color: myColors.text.primary,
    },
    crossIcon: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    crossText: {
        fontSize: 16,
        color: myColors.baseColors.light2,
    },
    // ... existing mobile styles ...
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
