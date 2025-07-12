import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { IconClose } from '@/assets/icons';
import MyText from '../common/MyText';
import { myColors } from '@/constants/MyColors';
import { isDesktopWeb, isTablet } from '@/utils/deviceInfo';
import { LinearGradient } from 'expo-linear-gradient';

interface AuthMessageScreenProps {
    title: string;
    message: string;
    type?: 'success' | 'error';
}

const AuthMessageScreen: React.FC<AuthMessageScreenProps> = ({ title, message, type = 'success' }) => {
    const iconSize = isDesktopWeb() ? 120 : isTablet() ? 100 : 80;
    
    const handleClose = () => {
        router.replace('/(main)');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={[myColors.screenBackgroundColor, '#f0f9ff']}
                style={styles.gradientContainer}
            >
                <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={handleClose}
                    activeOpacity={0.7}
                >
                    <IconClose size={24} color={myColors.text.secondary} />
                </TouchableOpacity>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <View style={styles.content}>
                            <View style={styles.iconWrapper}>
                                <View style={[
                                    styles.iconBackground,
                                    type === 'error' && styles.errorIconBackground
                                ]}>
                                    {type === 'success' ? (
                                        <View style={[styles.checkmarkCircle, { width: iconSize, height: iconSize }]}>
                                            <View style={styles.checkmark} />
                                        </View>
                                    ) : (
                                        <View style={[styles.errorCircle, { width: iconSize, height: iconSize }]}>
                                            <View style={styles.errorX1} />
                                            <View style={styles.errorX2} />
                                        </View>
                                    )}
                                </View>
                            </View>
                            
                            <MyText fontFamily="Poppins" style={styles.title}>
                                {title}
                            </MyText>
                            
                            <View style={styles.messageContainer}>
                                <MyText style={styles.message}>
                                    {message}
                                </MyText>
                            </View>
                            
                            <View style={[
                                styles.decorativeElement,
                                type === 'error' && styles.errorDecorativeElement
                            ]} />
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
    },
    gradientContainer: {
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        top: isDesktopWeb() ? 20 : 10,
        right: isDesktopWeb() ? 20 : 15,
        zIndex: 10,
        backgroundColor: myColors.white,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: isDesktopWeb() ? 40 : 20,
        paddingVertical: 40,
    },
    content: {
        alignItems: 'center',
        width: '100%',
        maxWidth: isDesktopWeb() ? 600 : isTablet() ? 500 : '100%',
    },
    iconWrapper: {
        marginBottom: isDesktopWeb() ? 50 : 40,
    },
    iconBackground: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 100,
        padding: isDesktopWeb() ? 30 : 20,
        shadowColor: myColors.success,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    errorIconBackground: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        shadowColor: myColors.error,
    },
    title: {
        fontSize: isDesktopWeb() ? 36 : isTablet() ? 32 : 28,
        fontWeight: '700',
        color: myColors.text.primary,
        textAlign: 'center',
        marginBottom: isDesktopWeb() ? 30 : 24,
        letterSpacing: -0.5,
    },
    messageContainer: {
        backgroundColor: myColors.white,
        borderRadius: 16,
        padding: isDesktopWeb() ? 32 : 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    message: {
        fontSize: isDesktopWeb() ? 18 : isTablet() ? 16 : 15,
        color: myColors.black,
        textAlign: 'center',
        lineHeight: isDesktopWeb() ? 28 : 24,
        letterSpacing: 0.3,
    },
    decorativeElement: {
        width: 60,
        height: 4,
        backgroundColor: myColors.success,
        borderRadius: 2,
        marginTop: 40,
        opacity: 0.3,
    },
    errorDecorativeElement: {
        backgroundColor: myColors.error,
    },
    checkmarkCircle: {
        backgroundColor: myColors.success,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        width: '40%',
        height: '20%',
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: myColors.white,
        transform: [{ rotate: '-45deg' }, { translateY: -4 }],
    },
    errorCircle: {
        backgroundColor: myColors.error,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorX1: {
        position: 'absolute',
        width: '50%',
        height: 4,
        backgroundColor: myColors.white,
        transform: [{ rotate: '45deg' }],
    },
    errorX2: {
        position: 'absolute',
        width: '50%',
        height: 4,
        backgroundColor: myColors.white,
        transform: [{ rotate: '-45deg' }],
    },
});

export default AuthMessageScreen;