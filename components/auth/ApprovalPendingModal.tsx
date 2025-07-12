import React from 'react';
import { View, StyleSheet } from 'react-native';
import MyText from '../common/MyText';
import { myColors } from '@/constants/MyColors';
import { isDesktopWeb } from '@/utils/deviceInfo';

interface ApprovalPendingModalProps {
    title: string;
    message: string;
}

const ApprovalPendingModal: React.FC<ApprovalPendingModalProps> = ({ title, message }) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <View style={styles.checkmarkCircle}>
                    <View style={styles.checkmark} />
                </View>
            </View>
            
            <MyText fontFamily="Poppins" style={styles.title}>
                {title}
            </MyText>
            
            <View style={styles.messageBox}>
                <MyText style={styles.message}>
                    {message}
                </MyText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 30,
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 50,
        padding: 15,
        marginBottom: 25,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: myColors.text.primary,
        textAlign: 'center',
        marginBottom: 20,
    },
    messageBox: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 20,
        width: '100%',
    },
    message: {
        fontSize: 14,
        color: myColors.black,
        textAlign: 'center',
        lineHeight: 22,
    },
    checkmarkCircle: {
        width: 60,
        height: 60,
        backgroundColor: myColors.success,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        width: 24,
        height: 12,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderColor: myColors.white,
        transform: [{ rotate: '-45deg' }, { translateY: -2 }],
    },
});

export default ApprovalPendingModal;