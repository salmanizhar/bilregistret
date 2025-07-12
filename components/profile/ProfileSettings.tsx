import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { ImagePath } from '@/assets/images';
import { useAuth } from '@/Services/api/context/auth.context';
import { showAlert } from '@/utils/alert';
import { safeNavigation } from '@/utils/safeNavigation';

interface SettingItemProps {
    icon: string;
    label: string;
    onPress?: () => void;
    onLongPress?: () => void;
    rightElement?: React.ReactNode;
    borderLess?: boolean;
    disabled?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, label, onPress, onLongPress, rightElement, borderLess, disabled }) => {
    return (
        <TouchableOpacity
            style={[styles.settingItem, borderLess && { borderBottomWidth: 0 }, disabled && { opacity: 0.3 }]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={5000} // 5 seconds for long press
            disabled={disabled}
        >
            <View style={styles.settingItemLeft}>
                <SvgXml xml={icon} />
                <MyText style={styles.settingItemLabel}>{label}</MyText>
            </View>
            {rightElement}
        </TouchableOpacity>
    );
};

export default function ProfileSettings() {
    const { logout, isLoading } = useAuth();
    const router = useRouter();
    const [lightMode, setLightMode] = useState(false);
    const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current);
            }
        };
    }, []);

    const toggleLightMode = () => {
        setLightMode(prev => !prev);
    };

    const navigateToEditProfile = () => {
        safeNavigation('/(main)/konto/redigera');
    };

    const navigateToPasswordAndSecurity = () => {
        safeNavigation('/(main)/konto/losenord-och-sakerhet');
    };

    const navigateToMySubscription = () => {
        safeNavigation('/(main)/mysubscription');
    };

    const navigateToTermsAndConditions = () => {
        safeNavigation('/(main)/TermsAndConditions');
    };
    const navigateToAnvandarvillkor = () => {
        safeNavigation('/(main)/anvandarvillkor');
    };

    const navigateToHelpAndSupport = () => {
        safeNavigation('/(main)/kontakt');
    };
    const navigateToCookiepolicy = () => {
        safeNavigation('/(main)/cookiepolicy');
    };

    const navigateToReportAProblem = () => {
        safeNavigation('/(main)/rapportera-tekniskt-fel');
    };

    const navigateToRemoveAccount = () => {
        safeNavigation('/(main)/avsluta-konto');
    };

    const handleLogout = async () => {
        try {
            showAlert({
                title: "Logga ut",
                message: "Är du säker på att du vill logga ut?",
                type: 'warning',
                positiveButton: {
                    text: "Logga ut",
                    onPress: async () => {
                        await logout();
                    }
                },
                negativeButton: {
                    text: "Avbryt",
                    onPress: () => { }
                }
            });
        } catch (error) {
            // // console.log('Logout error:', error);
            showAlert({
                title: "Utloggningsfel",
                message: "Ett fel uppstod vid utloggning. Försök igen.",
                type: 'error',
            });
        }
    }


    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <MyText fontFamily="Poppins" style={styles.sectionTitle}>Konto</MyText>

                <SettingItem
                    icon={ImagePath.SvgIcons.SettingsProfileIcon}
                    label="Redigera Profil"
                    onPress={navigateToEditProfile}
                />
                <SettingItem
                    icon={ImagePath.SvgIcons.SettingsPasswordSecurityIcon}
                    label="Lösenord och säkerhet"
                    onPress={navigateToPasswordAndSecurity}
                />
                <SettingItem
                    icon={ImagePath.SvgIcons.SettingsLockIcon}
                    label="Sekretess"
                    onPress={() => {
                        safeNavigation('/(main)/sekretesspolicy');
                    }}
                    onLongPress={() => { }}
                    borderLess
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
                <MyText fontFamily="Poppins" style={styles.sectionTitle}>Support Och Om</MyText>

                {Platform.OS === 'web' &&
                    <SettingItem
                        icon={ImagePath.SvgIcons.SettingsMySubscriptionIcon}
                        label="Min prenumeration"
                        onPress={() => navigateToMySubscription()}
                    />
                }
                <SettingItem
                    icon={ImagePath.SvgIcons.SettingsHelpAndSupportIcon}
                    label="Hjälp & Support"
                    onPress={() => navigateToHelpAndSupport()}
                />
                <SettingItem
                    icon={ImagePath.SvgIcons.SettingsCookiePolicyIcon}
                    label="Cookiepolicy"
                    onPress={() => navigateToCookiepolicy()}
                />
                {/* <SettingItem
                    icon={ImagePath.SvgIcons.SettingsTermsAndConditionsIcon}
                    label="Användarvilkor"
                    onPress={() => navigateToTermsAndConditions()}
                    borderLess
                /> */}
                <SettingItem
                    icon={ImagePath.SvgIcons.SettingsAnvandarvillkorIcon}
                    label="Användarvilkor"
                    onPress={() => navigateToAnvandarvillkor()}
                    borderLess
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
                <MyText fontFamily="Poppins" style={styles.sectionTitle}>Åtgärder</MyText>

                <SettingItem
                    icon={ImagePath.SvgIcons.SettingsReportAProblemIcon}
                    label="Rapportera ett problem"
                    onPress={() => navigateToReportAProblem()}
                />
                <SettingItem
                    icon={ImagePath.SvgIcons.SettingsAddOrRemoveAccountIcon}
                    label="Lägg till eller ta bort konto"
                    onPress={() => navigateToRemoveAccount()}
                />
                <SettingItem
                    icon={ImagePath.SvgIcons.SettingsLogOutIcon}
                    label="Logga ut"
                    onPress={() => handleLogout()}
                    borderLess
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        color: myColors.text.primary,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    section: {
        backgroundColor: myColors.white,
        borderRadius: 16,
        paddingVertical: 16,
        marginBottom: 16,
    },
    divider: {
        marginVertical: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: myColors.border.light,
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingItemLabel: {
        fontSize: 16,
        color: myColors.text.primary,
        marginLeft: 12,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: myColors.success,
    },
});