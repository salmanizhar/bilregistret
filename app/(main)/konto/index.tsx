import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Stack, useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { SvgXml } from 'react-native-svg';
import ProfileOverview from '@/components/profile/ProfileOverview';
import ProfileSettings from '@/components/profile/ProfileSettings';
import ProfileHeader from '@/components/common/ProfileHeader';
import { ImagePath } from '@/assets/images';
import { useAuth } from '@/Services/api/context/auth.context';
import { shortenName } from '@/constants/commonFunctions';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import { isDesktopWeb } from '@/utils/deviceInfo';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { H1 } from '@/components/common/SemanticText';
import { useIsFocused } from '@react-navigation/native';

// Define styles interface
interface Styles {
    container: ViewStyle;
    profileContainer: ViewStyle;
    profileImageContainer: ViewStyle;
    profileImage: ImageStyle;
    profileImagePremium: ImageStyle;
    statusIndicator: ViewStyle;
    profileInfo: ViewStyle;
    userName: TextStyle;
    userEmail: TextStyle;
    tabContainer: ViewStyle;
    tabButton: ViewStyle;
    activeTabButton: ViewStyle;
    tabText: TextStyle;
    activeTabText: TextStyle;
    contentContainer: ViewStyle;
    heroTitle: TextStyle;
}

export default function Konto() {
    const params = useLocalSearchParams();
    const isFocused = useIsFocused();
    const initialTab = 'settings'
    const [activeTab, setActiveTab] = useState<'overview' | 'settings'>(initialTab);
    const router = useRouter();

    // Get user from auth context
    const { user, isLoading, isPremiumUser, refreshUserData, isAuthenticated } = useAuth();
    const userInformation = user?.user

    // Refresh user profile on component mount
    useEffect(() => {
        if (isAuthenticated) {
            refreshUserData();
        }
    }, [isAuthenticated, isFocused]);

    // Update activeTab when params change
    useEffect(() => {
        if (params.activeTab === 'settings') {
            setActiveTab('settings');
        }
    }, [params.activeTab]);

    // Redirect to home if not authenticated - AFTER all hooks are called
    if (!isAuthenticated) {
        return <Redirect href="/(main)" />;
    }

    const navigateToEditProfile = () => {
        router.push('/(main)/konto/redigera');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {!isDesktopWeb() && <ProfileHeader title={"Mitt konto"} />}

            <FooterWrapper>
                <DesktopViewWrapper>
                    <View style={{ paddingHorizontal: isDesktopWeb() ? 0 : 15 }}>
                        {isDesktopWeb() &&
                            <H1 id="hero-title"
                                style={styles.heroTitle}
                                role="heading"
                                ariaLevel={1}
                                itemProp="headline"
                            >
                                Mitt konto
                            </H1>
                        }
                        <View style={styles.profileContainer}>
                            <View style={styles.profileImageContainer}>
                                <Image
                                    source={userInformation?.profile_picture ? { uri: userInformation?.profile_picture } : ImagePath.userImage}
                                    style={isPremiumUser ? styles.profileImagePremium : styles.profileImage}
                                />
                                {isPremiumUser && <SvgXml xml={ImagePath.SvgIcons.PremiumProfileIcon} style={styles.statusIndicator} />}
                            </View>

                            <View style={styles.profileInfo}>
                                <MyText fontFamily="Poppins" style={styles.userName}>{userInformation?.name || 'User'}</MyText>
                                <MyText style={styles.userEmail}>{userInformation?.customer_email || 'Email not available'}</MyText>
                            </View>

                            <TouchableOpacity onPress={navigateToEditProfile}>
                                <SvgXml xml={ImagePath.SvgIcons.ProfileEditIcon} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={activeTab === 'settings' ? styles.activeTabButton : styles.tabButton}
                                onPress={() => setActiveTab('settings')}
                            >
                                <MyText
                                    style={activeTab === 'settings' ? styles.activeTabText : styles.tabText}
                                >
                                    Inställningar
                                </MyText>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.contentContainer}>
                            <ProfileSettings />
                        </View>
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
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: myColors.white,
        borderRadius: 10,
        marginBottom: 20,
        marginTop: isDesktopWeb() ? 20 : 0,
    },
    profileImageContainer: {
        position: 'relative',
        marginRight: 15,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    profileImagePremium: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: myColors.primary.main,
    },
    statusIndicator: {
        position: 'absolute',
        bottom: -5,
        right: -5,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: myColors.baseColors.light3,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    activeTabButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: myColors.primary.main,
    },
    tabText: {
        color: myColors.baseColors.light3,
    },
    activeTabText: {
        color: myColors.white,
    },
    contentContainer: {
        flex: 1,
    },
    heroTitle: {
        fontSize: isDesktopWeb() ? 36 : 28,
        fontWeight: '400',
        color: '#262524',
        lineHeight: isDesktopWeb() ? 50 : 40,
        // marginBottom: 30,
        fontFamily: 'Poppins',
        textAlign: isDesktopWeb() ? 'left' : 'center',
    },
}) as Styles;