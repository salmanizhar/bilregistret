import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { showAlert } from '@/utils/alert';
import { useAuth } from '@/Services/api/context/auth.context';
import { setAuthToken } from '@/utils/storage';
import { safeNavigation } from '@/utils/safeNavigation';
import { useAppleWebSignIn } from '@/Services/api/hooks/auth.hooks';

export default function AppleCallback() {
    const params = useLocalSearchParams();
    const [isProcessing, setIsProcessing] = useState(true);
    const [statusMessage, setStatusMessage] = useState('Processing Apple Sign-in...');
    const [hasProcessed, setHasProcessed] = useState(false);
    const { refreshUserData } = useAuth();
    const appleWebSignInMutation = useAppleWebSignIn();

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessed) {
            return;
        }

        const handleAppleCallback = async () => {
            try {
                setHasProcessed(true); // Set flag immediately to prevent re-execution

                console.log('Apple callback received with params:', params);
                setStatusMessage('Processing authentication...');

                // Extract code and state from URL parameters
                const { code, state, error } = params;

                console.log('Extracted parameters:', {
                    hasCode: !!code,
                    hasState: !!state,
                    hasError: !!error,
                    code: code ? `${code.toString().substring(0, 20)}...` : 'N/A',
                    state: state ? `${state.toString().substring(0, 20)}...` : 'N/A'
                });

                if (error) {
                    throw new Error(`Apple sign-in error: ${error}`);
                }

                if (!code || typeof code !== 'string') {
                    throw new Error('Missing authorization code from Apple');
                }

                if (!state || typeof state !== 'string') {
                    throw new Error('Missing state parameter from Apple');
                }

                setStatusMessage('Exchanging authorization code...');

                // Call the Apple Web authentication API using the hook
                const authResponse = await appleWebSignInMutation.mutateAsync({
                    code: code,
                    state: state
                });

                console.log('Apple auth API response received:', {
                    hasToken: !!authResponse.token,
                    hasUser: !!authResponse.user,
                    tokenPreview: authResponse.token ? `${authResponse.token.substring(0, 20)}...` : 'N/A'
                });

                setStatusMessage('Loading user data...');

                // Refresh user data to update auth context
                await refreshUserData();
                console.log('User data refreshed');

                setStatusMessage('Completing sign-in...');

                // Show success message
                showAlert({
                    title: 'Welcome!',
                    message: 'Successfully signed in with Apple!',
                    type: 'success'
                });

                // Navigate to main screen
                safeNavigation('/(main)');

            } catch (error) {
                console.error('Apple callback error:', error);

                const errorMessage = error instanceof Error ? error.message : 'Apple sign-in failed';

                showAlert({
                    title: 'Sign-in Failed',
                    message: errorMessage,
                    type: 'error'
                });

                // Navigate back to login
                safeNavigation('/(auth)/login');
            } finally {
                setIsProcessing(false);
            }
        };

        handleAppleCallback();
    }, []); // Removed problematic dependencies

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={myColors.primary.main} />
            <MyText style={styles.text}>
                {isProcessing ? statusMessage : 'Redirecting...'}
            </MyText>
            {isProcessing && (
                <MyText style={styles.subText}>
                    Please wait while we complete your sign-in
                </MyText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: myColors.screenBackgroundColor,
        paddingHorizontal: 20,
    },
    text: {
        marginTop: 20,
        fontSize: 16,
        color: myColors.text.primary,
        textAlign: 'center',
        fontWeight: '600',
    },
    subText: {
        marginTop: 10,
        fontSize: 14,
        color: myColors.text.secondary,
        textAlign: 'center',
    },
});