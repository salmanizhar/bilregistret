import React from 'react';
import { StyleSheet, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import MyText from './MyText';
import { myColors } from '@/constants/MyColors';
import { ImagePath } from '@/assets/images';
interface StatusMessageProps {
    visible: boolean;
    type: 'success' | 'error';
    message: string;
    onClose?: () => void;
    showCloseButton?: boolean;
    closeButtonText?: string;
    autoClose?: boolean;
    autoCloseTime?: number;
    style?: StyleProp<ViewStyle>;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
    visible,
    type,
    message,
    onClose,
    showCloseButton = true,
    closeButtonText = 'STÄNG',
    autoClose = false,
    autoCloseTime = 2000,
    style
}) => {
    React.useEffect(() => {
        if (autoClose && visible) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, autoCloseTime);
            return () => clearTimeout(timer);
        }
    }, [visible, autoClose, autoCloseTime, onClose]);

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={[styles.modal, style]}>
                <View style={[
                    styles.iconContainer,
                ]}>
                    <SvgXml
                        xml={type === 'success' ? ImagePath.SvgIcons.SuccessIcon : ImagePath.SvgIcons.ErrorIcon}
                    />
                </View>
                <MyText style={styles.message}>{message}</MyText>
                {showCloseButton && onClose && (
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <MyText style={styles.closeButtonText}>{closeButtonText}</MyText>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: myColors.white,
        borderRadius: 16,
        padding: 24,
        width: '80%',
        alignItems: 'center',
    },
    iconContainer: {
        // width: 56,
        // height: 56,
        // borderRadius: 28,
        // justifyContent: 'center',
        // alignItems: 'center',
        marginBottom: 16,
    },
    successIcon: {
        // backgroundColor: myColors.success,
    },
    errorIcon: {
        // backgroundColor: myColors.error,
    },
    message: {
        fontSize: 18,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: 24,
        textAlign: 'center',
    },
    closeButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: myColors.black,
        borderRadius: 25,
    },
    closeButtonText: {
        color: myColors.white,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default StatusMessage;