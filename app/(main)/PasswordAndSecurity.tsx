import React from 'react';
import { StyleSheet, View, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import SimpleHeader from '@/components/common/SimpleHeader';
import MyText from '@/components/common/MyText';
import { myColors } from '@/constants/MyColors';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import { getStatusBarHeight } from '@/constants/commonFunctions';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { isDesktopWeb } from '@/utils/deviceInfo';

export default function PasswordAndSecurity() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {!isDesktopWeb() && (
                <SimpleHeader
                    title="Lösenord & Säkerhet"
                    onBackPress={handleGoBack}
                />
            )}

            <FooterWrapper>
                <DesktopViewWrapper>
                    <View style={styles.content}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => router.push("/(main)/account/konto/losenord-och-sakerhet/byt-losenord")}
                        >
                            <View style={styles.menuItemLeft}>
                                <SvgXml xml={ImagePath.SvgIcons.SettingsLockIcon} />
                                <View style={styles.textContainer}>
                                    <MyText style={styles.menuTitle}>Ändra lösenord</MyText>
                                    <MyText style={styles.menuSubtitle}>PIN</MyText>
                                </View>
                            </View>
                            <SvgXml xml={ImagePath.SvgIcons.SettingsRightArrowIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuItem]}
                            onPress={() => router.push("/(main)/account/konto/losenord-och-sakerhet/bekrafta-telefonnummer")}
                        >
                            <View style={styles.menuItemLeft}>
                                <SvgXml xml={ImagePath.SvgIcons.SettingsCallIcon} />
                                <View style={styles.textContainer}>
                                    <MyText style={styles.menuTitle}>Verifierat telefonnummer</MyText>
                                    <MyText style={styles.menuSubtitle}>Inte registrerad</MyText>
                                </View>
                            </View>
                            <SvgXml xml={ImagePath.SvgIcons.SettingsRightArrowIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuItem]}
                            onPress={() => router.push("/(main)/account/konto/losenord-och-sakerhet/bekrafta-epostadress")}
                        >
                            <View style={styles.menuItemLeft}>
                                <SvgXml xml={ImagePath.SvgIcons.SettingsEmailIcon} />
                                <View style={styles.textContainer}>
                                    <MyText fontFamily="Poppins" style={styles.menuTitle}>Verifierad e-postadress</MyText>
                                    <MyText style={{ ...styles.menuSubtitle, color: myColors.success }}>Registrerad</MyText>
                                </View>
                            </View>
                            <SvgXml xml={ImagePath.SvgIcons.SettingsRightArrowIcon} />
                        </TouchableOpacity>
                    </View>
                </DesktopViewWrapper>
            </FooterWrapper>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
        paddingTop: getStatusBarHeight(),
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        marginTop: isDesktopWeb() ? 30 : 0,
        marginBottom: isDesktopWeb() ? 30 : 0,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: myColors.border.light,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        marginLeft: 16,
    },
    menuTitle: {
        fontSize: 16,
        color: myColors.text.primary,
    },
    menuSubtitle: {
        fontSize: 15,
        color: myColors.baseColors.lightGray3,
        marginTop: 4,
    },
    registeredText: {
        color: myColors.success,
    }
});
