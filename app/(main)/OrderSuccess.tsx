import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import SimpleHeader from '@/components/common/SimpleHeader';
import MyButton from '@/components/common/MyButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';

export default function OrderSuccess() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const orderId = params.orderId as string;
    const amount = params.amount as string;

    const goToHome = () => {
        router.replace('/(main)');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <SimpleHeader title="Order Confirmation" onBackPress={goToHome} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.successContainer}>
                        <SvgXml xml={ImagePath.SvgIcons.SuccessIcon} />
                        <MyText fontFamily="Poppins" style={styles.successTitle}>
                            Order Successful!
                        </MyText>
                        <MyText style={styles.successMessage}>
                            Thank you for your purchase. Your order has been confirmed.
                        </MyText>
                    </View>

                    <View style={styles.orderDetails}>
                        <View style={styles.detailRow}>
                            <MyText style={styles.detailLabel}>Order ID:</MyText>
                            <MyText style={styles.detailValue}>{orderId}</MyText>
                        </View>
                        <View style={styles.detailRow}>
                            <MyText style={styles.detailLabel}>Amount Paid:</MyText>
                            <MyText style={styles.detailValue}>{amount} kr</MyText>
                        </View>
                    </View>

                    <MyButton
                        title="Go to Home"
                        onPress={goToHome}
                        buttonStyle={styles.homeButton}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: myColors.screenBackgroundColor,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    successTitle: {
        fontSize: 24,
        color: myColors.text.primary,
        marginTop: 20,
        marginBottom: 10,
    },
    successMessage: {
        fontSize: 16,
        color: myColors.text.secondary,
        textAlign: 'center',
    },
    orderDetails: {
        backgroundColor: myColors.white,
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        width: '100%',
    },
    detailLabel: {
        fontSize: 16,
        color: myColors.text.secondary,
    },
    detailValue: {
        fontSize: 16,
        color: myColors.text.primary,
        fontWeight: '500',
        width: '60%',
    },
    homeButton: {
        marginTop: 30,
        backgroundColor: myColors.primary.main,
    },
});