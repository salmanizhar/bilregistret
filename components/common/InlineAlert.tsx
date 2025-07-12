import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
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

const { width } = Dimensions.get('window');

interface InlineAlertButton {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface InlineAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onDismiss: () => void;
    type?: 'success' | 'error' | 'warning' | 'info';
    showIcon?: boolean;
    buttons?: InlineAlertButton[];
}

const InlineAlert: React.FC<InlineAlertProps> = ({
    visible,
    title,
    message,
    onDismiss,
    type = 'info',
    showIcon = true,
    buttons = [{ text: 'OK', onPress: () => { }, style: 'default' }],
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

    const handleButtonPress = (button: InlineAlertButton) => {
        button.onPress();
        onDismiss();
    };

    const getButtonStyle = (buttonStyle?: string) => {
        switch (buttonStyle) {
            case 'destructive':
                return [styles.button, styles.destructiveButton];
            case 'cancel':
                return [styles.button, styles.cancelButton];
            default:
                return [styles.button, styles.positiveButton];
        }
    };

    const getButtonTextStyle = (buttonStyle?: string) => {
        switch (buttonStyle) {
            case 'destructive':
                return styles.destructiveButtonText;
            case 'cancel':
                return styles.cancelButtonText;
            default:
                return styles.positiveButtonText;
        }
    };

    if (!visible) return null;

    return (
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
                <View style={styles.buttonContainer}>
                    {buttons.map((button, index) => (
                        <TouchableOpacity
                            key={index}
                            style={getButtonStyle(button.style)}
                            onPress={() => handleButtonPress(button)}
                            activeOpacity={0.7}
                        >
                            <MyText style={getButtonTextStyle(button.style)}>
                                {button.text}
                            </MyText>
                        </TouchableOpacity>
                    ))}
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 10000,
    },
    alertContainer: {
        width: width * 0.85,
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
        alignItems: 'center',
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
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
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
    positiveButton: {
        backgroundColor: myColors.primary.main,
    },
    cancelButton: {
        backgroundColor: myColors.white,
        borderWidth: 1,
        borderColor: myColors.primary.main,
    },
    destructiveButton: {
        backgroundColor: myColors.error,
    },
    positiveButtonText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    cancelButtonText: {
        color: myColors.primary.main,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    destructiveButtonText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default InlineAlert;