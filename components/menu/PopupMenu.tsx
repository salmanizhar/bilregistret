import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    TouchableOpacity,
    Animated,
    Platform,
    Linking
} from 'react-native';
import { myColors } from '@/constants/MyColors';
import MenuItem from './MenuItem';
import { Feather } from '@expo/vector-icons';
import MyText from '../common/MyText';
import { ImagePath } from '@/assets/images';
import { SvgXml } from 'react-native-svg';
import { ContactUsNumber } from '@/constants/commonConst';
import { router } from 'expo-router';
import { useContactInfo } from '@/Services/api/hooks';
import { safeNavigation } from '@/utils/safeNavigation';

interface PopupMenuProps {
    visible: boolean;
    onClose: () => void;
    onLogout?: () => void;
    popupPosition?: "left" | "right"
    onClearCache?: () => void;
    onReferFriendsPress?: () => void;
}

const PopupMenu: React.FC<PopupMenuProps> = ({ visible, onClose, onLogout, popupPosition, onClearCache, onReferFriendsPress }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    // Fetch contact info to get the phone number
    const { data: contactData } = useContactInfo();
    const phoneNumber = contactData?.data?.phone || ContactUsNumber; // Fallback to constant

    useEffect(() => {
        handleAnimations()
    }, [visible]);

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

    // if (!visible) return null;

    const handleReferFriendsPress = () => {
        if (onReferFriendsPress) {
            onReferFriendsPress();
        } else {
            router.replace('/(main)/ReferFriends' as any);
        }
        onClose();
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
            presentationStyle="overFullScreen"
            statusBarTranslucent={Platform.OS === 'android'}
        >
            <View style={popupPosition === "right" ? styles.containerRightAligned : styles.container}>
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
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    {/* <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Feather name="x" size={24} color={myColors.black} />
                    </TouchableOpacity> */}

                    <View style={styles.menuItems}>
                        {popupPosition === "right" &&
                            <MenuItem
                                icon={ImagePath.SvgIcons.HomeMenuIcon}
                                title="Hem"
                                onPress={() => {
                                    router.replace('/(main)');
                                    onClose();
                                }}
                            />
                        }
                        <MenuItem
                            icon={ImagePath.SvgIcons.CarBrandIcon}
                            title="Bilmärken"
                            onPress={() => {
                                router.replace('/tillverkare'); //car brand
                                onClose();
                            }}
                        />
                        <MenuItem
                            icon={ImagePath.SvgIcons.AboutUsIcon}
                            title="Om oss"
                            onPress={() => {
                                router.replace('/om-oss'); // About Us
                                onClose();
                            }}
                        />
                        {Platform.OS === 'web' && <MenuItem
                            icon={ImagePath.SvgIcons.PackageIcon}
                            title="Paket"
                            onPress={() => {
                                safeNavigation('/paket');
                                // router.push('/MaxSearchReached');
                                onClose();
                            }}
                        />
                        }
                        <MenuItem
                            icon={ImagePath.SvgIcons.BlogIcon}
                            title="Blogg"
                            onPress={() => {
                                router.replace('/blogg'); // All Blogs
                                onClose();
                            }}
                        />
                        <MenuItem
                            icon={ImagePath.SvgIcons.ReferFriendIcon}
                            title="Värva vänner"
                            onPress={() => {
                                router.replace('/varva-vanner'); // Refer Friends
                                onClose();
                            }}
                        />
                        <MenuItem
                            icon={ImagePath.SvgIcons.ContactIcon}
                            title="Kontakt"
                            onPress={() => {
                                router.replace('/kontakt'); // Contact Us
                                onClose();
                            }}
                        />
                        {onClearCache && (
                            <MenuItem
                                icon={<Feather name="trash-2" size={24} color={myColors.text.primary} />}
                                title="Rensa cache"
                                onPress={() => {
                                    onClearCache();
                                    onClose();
                                }}
                            />
                        )}
                    </View>

                    {/* <TouchableOpacity
                        style={styles.prenumerationButton}
                        onPress={() => {
                            router.push('/AllPackage');
                            onClose();
                        }}
                    >
                        <View style={styles.prenumIcon}>
                            <SvgXml xml={ImagePath.SvgIcons.SubscriptionIcon} />
                        </View>
                        <MyText style={styles.prenumText}>Prenumeration</MyText>
                    </TouchableOpacity> */}

                    <TouchableOpacity
                        style={styles.phoneButton}
                        onPress={() => {
                            Linking.openURL(`tel:${phoneNumber}`);
                            onClose();
                        }}
                    >
                        <SvgXml xml={ImagePath.SvgIcons.CallIcon} />
                        <MyText style={styles.phoneText}>{phoneNumber}</MyText>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'flex-end',
        paddingLeft: 20,
        paddingTop: Platform.OS === 'web' ? 65 : 100,
        // Add high elevation for Android to ensure it appears above reanimated views
        ...(Platform.OS === 'android' && {
            elevation: 999,
            zIndex: 999,
        }),
    },
    containerRightAligned: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 20,
        paddingTop: Platform.OS === 'web' ? 65 : 100,
        // Add high elevation for Android to ensure it appears above reanimated views
        ...(Platform.OS === 'android' && {
            elevation: 999,
            zIndex: 999,
        }),
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: myColors.backgroundDimmingColor,
        // Ensure backdrop is also above reanimated views
        ...(Platform.OS === 'android' && {
            elevation: 998,
            zIndex: 998,
        }),
    },
    menuContainer: {
        width: 250,
        backgroundColor: myColors.popupMenuBackgroundColor,
        borderRadius: 10,
        padding: 20,
        paddingTop: 10,
        paddingBottom: 30,
        position: 'relative',
        // Ensure menu container has highest elevation
        ...(Platform.OS === 'android' && {
            elevation: 1000,
            zIndex: 1000,
        }),
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
        marginTop: 25,
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

export default PopupMenu;