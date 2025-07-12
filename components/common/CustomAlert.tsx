import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';
import {
    IconCheckmarkCircle,
    IconCloseCircle,
    IconWarning,
    IconInformationCircle
} from '@/assets/icons';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onDismiss: () => void;
    type?: 'success' | 'error' | 'warning' | 'info';
    showIcon?: boolean;
    positiveButton?: {
        text: string;
        onPress?: () => void;
    };
    positiveButton2?: {
        text: string;
        onPress?: () => void;
    };
    negativeButton?: {
        text: string;
        onPress?: () => void;
    };
}

const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    onDismiss,
    type = 'info',
    showIcon = true,
    positiveButton = { text: 'OK' },
    positiveButton2,
    negativeButton,
}) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const getIconComponent = () => {
        const iconProps = {
            size: 32,
            color: getIconColor(),
        };

        switch (type) {
            case 'success':
                return <IconCheckmarkCircle {...iconProps} />;
            case 'error':
                return <IconCloseCircle {...iconProps} />;
            case 'warning':
                return <IconWarning {...iconProps} />;
            default:
                return <IconInformationCircle {...iconProps} />;
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return myColors.success;
            case 'error':
                return myColors.error;
            case 'warning':
                return myColors.warning;
            default:
                return myColors.primary.main;
        }
    };

    const handlePositivePress = () => {
        if (positiveButton.onPress) {
            positiveButton.onPress();
        }
        onDismiss();
    };

    const handlePositive2Press = () => {
        if (positiveButton2?.onPress) {
            positiveButton2.onPress();
        }
        onDismiss();
    };

    const handleNegativePress = () => {
        if (negativeButton?.onPress) {
            negativeButton.onPress();
        }
        onDismiss();
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onDismiss}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.alertContainer,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.content}>
                        {showIcon && (
                            <View style={styles.iconContainer}>
                                {getIconComponent()}
                            </View>
                        )}
                        <View style={styles.textContainer}>
                            <MyText style={styles.title}>{title}</MyText>
                            <MyText style={styles.message}>{message}</MyText>
                        </View>
                    </View>
                    <View style={positiveButton2 ? styles.verticalButtonContainer : styles.buttonContainer}>
                        {negativeButton && (
                            <TouchableOpacity
                                style={[styles.button, styles.negativeButton]}
                                onPress={handleNegativePress}
                                activeOpacity={0.7}
                            >
                                <MyText style={styles.negativeButtonText}>
                                    {negativeButton.text}
                                </MyText>
                            </TouchableOpacity>
                        )}

                        {positiveButton2 &&
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.positiveButton,
                                ]}
                                onPress={handlePositive2Press}
                                activeOpacity={0.7}
                            >
                                <MyText style={styles.positiveButtonText}>
                                    {positiveButton2.text}
                                </MyText>
                            </TouchableOpacity>
                        }
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.positiveButton,
                            ]}
                            onPress={handlePositivePress}
                            activeOpacity={0.7}
                        >
                            <MyText style={styles.positiveButtonText}>
                                {positiveButton.text}
                            </MyText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: Dimensions.get('window').width * 0.85,
        maxWidth: 500,
        backgroundColor: myColors.white,
        borderRadius: 16,
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    iconContainer: {
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: 4,
        fontFamily: 'Poppins-SemiBold',
    },
    message: {
        fontSize: 14,
        color: myColors.text.secondary,
        fontFamily: 'Poppins-Regular',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    verticalButtonContainer: {
        justifyContent: 'flex-end',
        gap: 10,
    },
    button: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    fullWidthButton: {
        flex: 1,
    },
    positiveButton: {
        backgroundColor: myColors.primary.main,
    },
    negativeButton: {
        backgroundColor: myColors.white,
        borderWidth: 1,
        borderColor: myColors.primary.main,
    },
    positiveButtonText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    negativeButtonText: {
        color: myColors.primary.main,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default CustomAlert;