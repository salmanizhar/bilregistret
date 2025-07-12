import { StyleSheet, TouchableOpacity, View, ActivityIndicator, Alert, Platform } from 'react-native'
import React from 'react'
import MyText from './MyText';
import { myColors } from '@/constants/MyColors';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import { useGoogleSignIn } from '../../Services/api/hooks/auth2/useGoogleSignIn';
import { useFacebookSignIn } from '../../Services/api/hooks/auth2/useFacebookSignIn';
import { useAppleSignIn } from '../../Services/api/hooks/auth2/useAppleSignIn';
import { router } from 'expo-router';
import { useApiQueryClient } from '@/Services/api/hooks/api.hooks';
import { showAlert } from '@/utils/alert';
import * as AppleAuthentication from 'expo-apple-authentication';

type Props = {}

const SocialMediaSignin = (props: Props) => {
    // if (Platform.OS !== "web") {
    // Use the Google sign-in hook
    const { signIn: googleSignIn, loading: googleLoading, error: googleError } = useGoogleSignIn();
    // Use the Facebook sign-in hook
    const { signIn: facebookSignIn, loading: facebookLoading, error: facebookError } = useFacebookSignIn();
    // Use the Apple sign-in hook
    const { signIn: appleSignIn, loading: appleLoading, error: appleError } = useAppleSignIn();
    // Get query client for cache invalidation
    const queryClient = useApiQueryClient();

    // Handle Google sign-in
    const handleGoogleSignIn = async () => {
        try {
            // Attempt sign-in
            const response = await googleSignIn();

            // If we get a successful response:
            if (response) {
                // 1. Invalidate auth queries to refresh the state
                queryClient.invalidateQueries({ queryKey: ['isAuthenticated'] });
                queryClient.invalidateQueries({ queryKey: ['currentUser'] });

                // 2. Navigate to home screen
                router.replace('/(main)');
            }
        } catch (error) {
            // Show error alert with the specific message from the error
            let errorMessage = 'Något gick fel med Google inloggning. Vänligen försök igen senare.';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            showAlert({
                title: 'Google inloggning misslyckades',
                message: errorMessage,
                type: 'error',
            });
            // console.error('Sign-in error:', error);
        }
    };

    // Handle Facebook sign-in
    const handleFacebookSignIn = async () => {
        try {
            // Attempt sign-in
            const response = await facebookSignIn();

            // If we get a successful response:
            if (response) {
                // 1. Invalidate auth queries to refresh the state
                queryClient.invalidateQueries({ queryKey: ['isAuthenticated'] });
                queryClient.invalidateQueries({ queryKey: ['currentUser'] });

                // 2. Navigate to home screen
                router.replace('/(main)');
            }
        } catch (error) {
            // Show error alert with the specific message from the error
            let errorMessage = 'Något gick fel med Facebook inloggning. Vänligen försök igen senare.';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            showAlert({
                title: 'Facebook inloggning misslyckades',
                message: errorMessage,
                type: 'error',
            });

            // console.error('Facebook sign-in error:', error);
        }
    };

    // Handle Apple sign-in
    const handleAppleSignIn = async () => {
        try {
            // Attempt sign-in
            const response = await appleSignIn();

            // If we get a successful response:
            if (response) {
                // 1. Invalidate auth queries to refresh the state
                queryClient.invalidateQueries({ queryKey: ['isAuthenticated'] });
                queryClient.invalidateQueries({ queryKey: ['currentUser'] });

                // 2. Navigate to home screen
                router.replace('/(main)');
            }
        } catch (error) {
            // Show error alert with the specific message from the error
            let errorMessage = 'Något gick fel med Apple inloggning. Vänligen försök igen senare.';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            showAlert({
                title: 'Apple inloggning misslyckades',
                message: errorMessage,
                type: 'error',
            });

            // console.error('Apple sign-in error:', error);
        }
    };

    return (
        <View>
            {Platform.OS === 'ios' && (
                <TouchableOpacity
                    onPress={handleAppleSignIn}
                    style={styles.signinButton}
                    disabled={appleLoading}
                    activeOpacity={0.7}
                >
                    <View style={styles.buttonContent}>
                        {appleLoading ? (
                            <ActivityIndicator size="small" color={myColors.primary.main} />
                        ) : (
                            <SvgXml xml={ImagePath.SvgIcons.AppleIcon} width={20} height={20} style={styles.buttonIcon} />
                        )}
                        <MyText fontFamily='Poppins-Bold' style={styles.signinButtonText}>
                            {appleLoading ? 'Loggar in...' : 'Logga in med Apple'}
                        </MyText>
                    </View>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                onPress={handleGoogleSignIn}
                style={styles.signinButton}
                disabled={googleLoading}
                activeOpacity={0.7}
            >
                <View style={styles.buttonContent}>
                    {googleLoading ? (
                        <ActivityIndicator size="small" color={myColors.primary.main} />
                    ) : (
                        <SvgXml xml={ImagePath.SvgIcons.GoogleIcon} width={20} height={20} style={styles.buttonIcon} />
                    )}
                    <MyText fontFamily='Poppins-Bold' style={styles.signinButtonText}>
                        {googleLoading ? 'Loggar in...' : 'Logga in med Google'}
                    </MyText>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleFacebookSignIn}
                style={styles.signinButton}
                disabled={facebookLoading}
                activeOpacity={0.7}
            >
                <View style={styles.buttonContent}>
                    {facebookLoading ? (
                        <ActivityIndicator size="small" color={myColors.primary.main} />
                    ) : (
                        <SvgXml xml={ImagePath.SvgIcons.FacebookIcon} width={20} height={20} style={styles.buttonIcon} />
                    )}
                    <MyText fontFamily='Poppins-Bold' style={styles.signinButtonText}>
                        {facebookLoading ? 'Loggar in...' : 'Logga in med Facebook'}
                    </MyText>
                </View>
            </TouchableOpacity>
        </View>
    )
    // }
}

export default SocialMediaSignin

const styles = StyleSheet.create({
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 8,
        width: 20,
        height: 20,
    },
    signinButton: {
        width: '100%',
        height: 52,
        borderRadius: 10,
        marginTop: 10,
        backgroundColor: myColors.white, // must be white
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android shadow
    },

    signinButtonText: {
        fontSize: 19, // ~43% of 52pt = ~22
        color: '#000',
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    },
})