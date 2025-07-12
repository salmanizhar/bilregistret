import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { isDesktopWeb } from '@/utils/deviceInfo';
import WebWideHeader from '@/components/common/header.web';

export default function AuthLayout() {
    return (
        <View style={{ flex: 1 }}>
            {isDesktopWeb() && <WebWideHeader />}
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                    animationDuration: 300,
                    presentation: 'card',
                    contentStyle: {
                        backgroundColor: 'transparent',
                    },
                }}
            >
                <Stack.Screen name="Login" />
                <Stack.Screen name="Registration" />
                <Stack.Screen name="forgetpasswrod" />
                <Stack.Screen name="TermsAndConditions" />
                <Stack.Screen name="sekretesspolicy" />
            </Stack>
        </View>
    );
}