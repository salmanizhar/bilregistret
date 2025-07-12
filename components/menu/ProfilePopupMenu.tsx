import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    Platform,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { myColors } from '@/constants/MyColors';
import MenuItem from './MenuItem';
import { ImagePath } from '@/assets/images';
import { router } from 'expo-router';
import { useAuth } from '@/Services/api/context/auth.context';
import { showAlert } from '@/utils/alert';

// Define specific route types that are known to exist
type AppRoute = '/(main)/konto' | '/(main)' | '/(auth)/login' | '/(auth)/registrera';

interface ProfilePopupMenuProps {
    visible: boolean;
    onClose: () => void;
    onLogout?: () => void;
}

const ProfilePopupMenu: React.FC<ProfilePopupMenuProps> = ({ visible, onClose, onLogout }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const { logout, isLoading, isAuthenticated, isGuestMode } = useAuth();

    useEffect(() => {
        handleAnimations()
    }, [visible]);

    const handleLogout = async () => {
        try {
            // Close the menu first
            onClose();

            // Show confirmation dialog with consistent styling across platforms
            showAlert({
                title: "Logga ut",
                message: "Är du säker på att du vill logga ut?",
                type: 'warning',
                showIcon: false,
                positiveButton: {
                    text: "Logga ut",
                    onPress: async () => {
                        onClose();
                        await logout();
                        // No navigation - handled in the auth context now
                    }
                },
                negativeButton: {
                    text: "Avbryt",
                    onPress: () => { }
                }
            });
        } catch (error) {
            showAlert({
                title: "Utloggningsfel",
                message: "Ett fel uppstod vid utloggning. Försök igen.",
                type: 'error',
                showIcon: false,
                positiveButton: {
                    text: "OK",
                    onPress: () => { }
                }
            });
        }
    }

    const handleAnimations = () => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.9,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }

    // Navigate directly to profile routes
    const navigateToScreen = (route: AppRoute, params: { activeTab?: string } = {}) => {
        // Close menu first
        onClose();

        // Use simple navigation without delays or redirects
        router.replace({
            pathname: route,
            params
        });
    };

    // if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        styles.menuContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                            height: isAuthenticated ? 110 : 65
                        }
                    ]}
                >
                    <View style={styles.menuItems}>
                        {isAuthenticated ? (
                            <>
                                <MenuItem
                                    icon={ImagePath.SvgIcons.SettingsIcon}
                                    title="Inställningar"
                                    onPress={() => navigateToScreen('/(main)/konto', { activeTab: 'settings' })}
                                />
                                <MenuItem
                                    icon={ImagePath.SvgIcons.LogoutIcon}
                                    title="Logga ut"
                                    onPress={handleLogout}
                                />
                            </>
                        ) : (
                            <MenuItem
                                icon={ImagePath.SvgIcons.ProfileIcon}
                                title="Logga in"
                                onPress={() => navigateToScreen('/(auth)/login')}
                            />
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 20,
        paddingTop: Platform.OS === 'web' ? 65 : 100,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: myColors.backgroundDimmingColor,
    },
    menuContainer: {
        width: 250,
        // height is now dynamically set based on authentication state
        backgroundColor: myColors.popupMenuBackgroundColor,
        borderRadius: 10,
        padding: 20,
        paddingTop: 10,
        position: 'relative'
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItems: {
        // marginTop: 10,
        marginBottom: 20,
    },
    prenumerationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.black,
        padding: 12,
        borderRadius: 50,
        justifyContent: 'center',
        marginBottom: 15,
        marginHorizontal: 10,
    },
    prenumIcon: {
        marginRight: 10,
    },
    prenumText: {
        color: myColors.white,
        fontWeight: '600',
        fontSize: 16,
    },
    phoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    phoneText: {
        color: myColors.black,
        fontSize: 16,
        marginLeft: 10,
        fontWeight: "semibold"
    }
});

export default ProfilePopupMenu;
