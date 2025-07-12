import { StyleSheet, TouchableOpacity, View, ActivityIndicator, Alert, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import MyText from './MyText';
import { myColors } from '@/constants/MyColors';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import { router } from 'expo-router';
import { showAlert } from '@/utils/alert';
import { useApiQueryClient } from '@/Services/api/hooks/api.hooks';
import { useGoogleSignInWeb } from '../../Services/api/hooks/auth2/useGoogleSignInWeb';
import { useFacebookSignInWeb } from '@/Services/api/hooks/auth2/useFacebookSignInWeb';
import { useAppleSignInWeb } from '@/Services/api/hooks/auth2/useAppleSignInWeb';

type Props = {
    onLoginSuccess?: () => void;
    onClose?: () => void;
}

const SocialMediaSigninWeb = (props: Props) => {
    const { onLoginSuccess, onClose } = props;
    const queryClient = useApiQueryClient();

    // Create success handler that will be called by the hooks
    const handleAuthSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['isAuthenticated'] });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });

        // Call success callback if provided (for popups)
        if (onLoginSuccess) {
            onLoginSuccess();
        }

        // Close popup if callback provided
        if (onClose) {
            onClose();
        }

        // Navigate to main page
        router.replace('/(main)');
    };

    // Create error handler that will be called by the hooks
    const handleAuthError = (error: Error) => {
        showAlert({
            title: 'Sign-in Failed',
            message: error.message,
            type: 'error'
        });
    };

    const { signIn: googleSignIn, loading: googleLoading } = useGoogleSignInWeb({
        onSuccess: handleAuthSuccess,
        onError: handleAuthError
    });
    const { signIn: facebookSignIn, loading: facebookLoading } = useFacebookSignInWeb({
        onSuccess: handleAuthSuccess,
        onError: handleAuthError
    });
    const { signIn: appleSignIn, loading: appleLoading, isAppleSDKLoaded } = useAppleSignInWeb({
        onSuccess: handleAuthSuccess,
        onError: handleAuthError
    });

    const handleGoogleSignIn = async () => {
        try {
            await googleSignIn();
        } catch (error) {
            // Error is already handled by the callback
        }
    };

    const handleFacebookSignIn = async () => {
        try {
            await facebookSignIn();
        } catch (error) {
            // Error is already handled by the callback
        }
    };

    const handleAppleSignIn = async () => {
        try {
            await appleSignIn();
        } catch (error) {
            // Error is already handled by the callback
        }
    };

    return (
        <View>
            <TouchableOpacity
                style={[styles.appleSigninButton, !isAppleSDKLoaded && styles.disabledButton]}
                disabled={appleLoading || !isAppleSDKLoaded}
                onPress={handleAppleSignIn}
            >
                {appleLoading ? (
                    <ActivityIndicator size="small" color={myColors.white} />
                ) : (
                    <SvgXml xml={ImagePath.SvgIcons.AppleIcon} />
                )}
                <MyText fontFamily='Poppins' style={styles.appleSigninButtonText}>
                    {appleLoading ? 'Signing in...' : !isAppleSDKLoaded ? 'Loading Apple...' : 'Logga in med Apple'}
                </MyText>
                <View />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleGoogleSignIn}
                style={styles.googleSigninButton}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <ActivityIndicator size="small" color={myColors.primary.main} />
                ) : (
                    <SvgXml xml={ImagePath.SvgIcons.GoogleIcon} />
                )}
                <MyText fontFamily='Poppins' style={styles.googleSigninButtonText}>
                    {googleLoading ? 'Signing in...' : 'Logga in med Google'}
                </MyText>
                <View />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.googleSigninButton}
                disabled={facebookLoading}
                onPress={handleFacebookSignIn}
            >
                {facebookLoading ? (
                    <ActivityIndicator size="small" color={myColors.white} />
                ) : (
                    <SvgXml xml={ImagePath.SvgIcons.FacebookIcon} />
                )}
                <MyText fontFamily='Poppins' style={styles.googleSigninButtonText}>
                    {facebookLoading ? 'Signing in...' : 'Logga in med Facebook'}
                </MyText>
                <View />
            </TouchableOpacity>
        </View>
    )
}

export default SocialMediaSigninWeb

const styles = StyleSheet.create({
    appleSigninButton: {
        width: '100%',
        height: 52,
        borderRadius: 10,
        marginTop: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: myColors.white,
        borderWidth: 1,
        borderColor: myColors.border.light,
    },
    appleSigninButtonText: {
        fontSize: 15,
        color: myColors.text.primary,
    },
    disabledButton: {
        opacity: 0.6,
    },
    googleSigninButton: {
        width: '100%',
        height: 52,
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 10,
        paddingHorizontal: 20,
        borderColor: myColors.border.light,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: myColors.white
    },
    googleSigninButtonText: {
        fontSize: 15,
        color: myColors.text.primary,
    },
    facebookSigninButton: {
        width: '100%',
        height: 52,
        borderRadius: 10,
        marginTop: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1877F2' // Facebook blue
    },
    facebookSigninButtonText: {
        fontSize: 15,
        color: myColors.white,
    }
})