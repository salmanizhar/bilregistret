import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { SvgXml } from 'react-native-svg';
import CustomProgressBar from '../CustomProgressBar';
import { Entypo } from '@expo/vector-icons';
import { AllPackageData } from '@/constants/commonConst';
import { PackageResponse } from '@/Services/api/services/packages.service';
import { ImagePath } from '@/assets/images';
import { useRouter } from 'expo-router';
import NoSubscription from '../NoSubscription';

interface ProfileOverviewProps {
    userData?: {
        user: {
            name: string;
            customer_email: string;
        };
        subscription: {
            searchesToday: number;
            remainingSearches: number;
            searchesPerDay: number;
            status: string;
            startDate: string;
            endDate: string;
            plan: {
                packageName: string;
                description: string;
                price: string;
                priceDisplay: string;
                period: string;
                features: Array<{
                    title: string;
                }>;
            };
        };
    };
}

type LocalPackage = typeof AllPackageData[0];
type DisplayPackage = PackageResponse | LocalPackage;

const isApiPackage = (pkg: DisplayPackage): pkg is PackageResponse => {
    return 'id' in pkg && typeof pkg.id === 'number';
};

export default function ProfileOverview({ userData }: ProfileOverviewProps) {

    if (!userData?.subscription) {
        return <NoSubscription />
    }

    // Default values if no user data is provided
    const statistics = {
        score: userData.subscription.searchesToday || 0,
        searchesAllowed: userData.subscription.searchesPerDay || 100, // Default max searches
    };

    // Calculate percentages for the progress bar
    const primaryProgress = Math.min(10, (statistics.score / statistics.searchesAllowed) * 100);
    const secondaryProgress = Math.min(20, ((statistics.score + 20) / statistics.searchesAllowed) * 100);

    // Mock activities based on user data
    const activities = [
        {
            id: 1,
            name: 'Bilsökning',
            count: userData.subscription.searchesToday || 0,
            color: myColors.primary.main
        },
        {
            id: 2,
            name: 'Bilvärdering',
            count: userData.subscription.remainingSearches || 0,
            color: '#D3E2F4'
        },
        {
            id: 3,
            name: 'Bläddring',
            count: userData.subscription.searchesPerDay || 0,
            color: '#BBCCE6'
        },
    ];

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

    // Get subscription data
    const subscription = {
        packageName: userData.subscription.plan.packageName,
        description: userData.subscription.plan.description ?? '',
        price: userData.subscription.plan.price + userData.subscription.plan.priceDisplay,
        period: userData.subscription.plan.period,
        icon: getIcon(userData.subscription.plan, 0) // Using default icon since API doesn't provide one
    };

    return (
        <View style={styles.container}>
            {/* Statistics Section */}
            <View style={styles.statsCard}>
                <MyText fontFamily="Poppins" style={styles.sectionTitle}>Översikt</MyText>
                <View style={styles.scoreContainer}>
                    <MyText fontFamily="Poppins" style={styles.statsLabel}>Mina Statistik</MyText>
                    <MyText style={styles.scoreValue}>{statistics.score}</MyText>
                </View>

                <CustomProgressBar
                    primaryProgress={primaryProgress}
                    secondaryProgress={secondaryProgress}
                    height={42}
                    borderRadius={20}
                    primaryColor={myColors.primary.main}
                    secondaryColor="#E5F0FF"
                    stripeColor="#E0E0E0"
                />

                <View style={styles.activitiesContainer}>
                    {activities.map((activity) => (
                        <View key={activity.id} style={styles.activityItem}>
                            <View style={styles.activityIconContainer}>
                                <View style={[styles.circle, { backgroundColor: activity.color }]} />
                                <MyText style={styles.activityName}>{activity.name}</MyText>
                            </View>
                            <MyText style={styles.activityCount}>{activity.count}</MyText>
                        </View>
                    ))}
                </View>
            </View>

            {/* Subscription Card */}
            {userData && (
                <View style={styles.packageCard}>
                    <View style={styles.packageHeader}>
                        <View style={styles.packageHeaderTextContainer}>
                            <MyText fontFamily='Poppins' style={styles.packageTitle}>
                                {subscription.packageName}
                            </MyText>
                            <MyText style={styles.packageDescription}>
                                {subscription.description}
                            </MyText>
                        </View>
                        {/* hide this three button by sani as we dont have any more options currently*/}
                        {/* <TouchableOpacity style={styles.moreButton}>
                            <Entypo name="dots-three-vertical" size={21} color={myColors.black} />
                        </TouchableOpacity> */}
                    </View>

                    <View style={styles.packageBottomDetails}>
                        <View style={styles.priceContainer}>
                            <MyText style={styles.priceValue}>{subscription.price}</MyText>
                            <MyText style={styles.perMonth}>{subscription.period}</MyText>
                        </View>
                        <View style={styles.iconContainer}>
                            <SvgXml xml={subscription.icon} />
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 20,
        color: myColors.text.primary,
        marginBottom: 16,
    },
    statsCard: {
        backgroundColor: myColors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    statsLabel: {
        fontSize: 12,
        color: myColors.baseColors.lightGray3,
    },
    scoreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    scoreValue: {
        fontSize: 24,
        color: myColors.text.primary,
    },
    progressBar: {
        height: 42,
        borderRadius: 4,
        flexDirection: 'row',
        marginBottom: 24,
    },
    progressCarSearch: {
        height: '100%',
        backgroundColor: myColors.primary.main,
        borderRadius: 13,
    },
    progressCarValuation: {
        flex: 1,
        height: '100%',
        backgroundColor: '#EEF6FF',
        borderRadius: 13,
        marginHorizontal: 10,
    },
    progressCarBrowsing: {
        flex: 1,
        height: '100%',
        backgroundColor: myColors.baseColors.light1,
        borderRadius: 13,
    },
    activitiesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    activityItem: {
        alignItems: 'center',
        marginTop: 30,
    },
    activityIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityName: {
        fontSize: 12,
        color: myColors.baseColors.lightGray3,
    },
    activityCount: {
        fontSize: 16,
        color: myColors.text.primary,
    },
    subscriptionCard: {
        // styles for subscription card
    },
    subscriptionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    subscriptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: myColors.text.primary,
    },
    moreButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subscriptionDescription: {
        fontSize: 14,
        color: myColors.text.secondary,
        marginBottom: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: 32,
        fontWeight: '700',
        color: myColors.text.primary,
    },
    period: {
        fontSize: 14,
        color: myColors.text.secondary,
        marginLeft: 4,
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
    packageBottomDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 20,
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
    packageHeaderTextContainer: {
        width: "78%",
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: myColors.screenBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceValue: {
        fontSize: 36,
        color: myColors.text.primary,
    },
    freePrice: {
        color: myColors.primary.main,
    },
    perMonth: {
        fontSize: 12,
        color: myColors.baseColors.light2,
        marginLeft: 5,
    },
    circle: { height: 10, width: 10, borderRadius: 10, marginRight: 5 },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: myColors.text.primary,
        marginBottom: 10,
    },
    emptyDescription: {
        fontSize: 16,
        color: myColors.text.secondary,
        textAlign: 'center',
        marginBottom: 20,
    },
    upgradeButton: {
        backgroundColor: myColors.primary.main,
        padding: 12,
        borderRadius: 10,
    },
    upgradeButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: myColors.white,
    },
});