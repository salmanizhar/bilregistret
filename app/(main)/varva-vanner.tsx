import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Share, StatusBar, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { useQuery } from '@tanstack/react-query';
import { makeAuthenticatedRequest } from '@/Services/api/utils/api.utils';
import { API_ROUTES } from '@/Services/api/routes/api.routes';
import SimpleHeader from '@/components/common/SimpleHeader';
import { LoginPopup } from '@/components/auth';
import { useAuth } from '@/Services/api/context/auth.context';
import { getStatusBarHeight } from '@/constants/commonFunctions';
import { isDesktopWeb } from '@/utils/deviceInfo';
import DesktopViewWrapper from '@/components/common/DesktopViewWrapper';
import FooterWrapper from '@/components/common/ScreenWrapper';
import { safeNavigation } from '@/utils/safeNavigation';

interface InviteLinkResponse {
  success: boolean;
  data: {
    invite_link: string;
    coupon_code: string;
    invites: number;
  };
}

const CheckIcon = () => (
  <View style={styles.checkmark}>
    <View style={styles.checkInner}>
      <View style={styles.checkmarkTick} />
    </View>
  </View>
);

const ReferFriends = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Redirect to login page if not authenticated when directly accessing the page
  useEffect(() => {
    if (!isAuthenticated) {
      safeNavigation('/(auth)/login');
    }
  }, [isAuthenticated, router]);

  // Fetch invite link data
  const { data: inviteData, isLoading, isError, error } = useQuery<InviteLinkResponse>({
    queryKey: ['inviteLink'],
    queryFn: async () => {
      try {
        const response = await makeAuthenticatedRequest(API_ROUTES.USER.INVITE_LINK, {
          method: 'GET',
        });

        if (!response.ok) {
          const errorData = await response.json();
          // Check for authentication error
          if (response.status === 401) {
            // Don't show popup automatically, redirect to login page instead
            safeNavigation('/(auth)/login');
            throw new Error('Authentication required');
          }
          throw new Error(errorData.message || 'Failed to fetch invite link');
        }

        return response.json();
      } catch (err) {
        // If it's an auth error, redirect to login page
        if (
          (err instanceof Error && (err.message === 'Authentication required' || err.message === 'Unauthorized')) ||
          (typeof err === 'object' && err !== null && 'status' in err && (err as any).status === 401)
        ) {
          safeNavigation('/(auth)/login');
        }
        throw err;
      }
    },
    enabled: isAuthenticated, // Only run query if user is authenticated
  });

  // console.log("inviteData", inviteData);

  // Handle login success
  const handleLoginSuccess = () => {
    setShowLoginPopup(false);
    // Force refetch the data
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Use useEffect to handle loading state changes
  useEffect(() => {
    if (isLoading) {
      global_loader_ref?.show_loader(1);
    } else {
      global_loader_ref?.show_loader(0);
    }
    return () => {
      global_loader_ref?.show_loader(0);
    }
  }, [isLoading]);

  const copyToClipboard = async () => {
    if (inviteData?.data.invite_link) {
      await Clipboard.setStringAsync(inviteData.data.invite_link);
      // TODO: Add toast notification using the app's toast system
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const onShare = async () => {
    if (!inviteData?.data.invite_link) return;

    try {
      await Share.share({
        message: `Join me on Bilregistret! ${inviteData.data.invite_link}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // New function to handle sharing button click
  const handleShareClick = () => {
    if (!isAuthenticated) {
      // Show login popup when button is clicked without authentication
      setShowLoginPopup(true);
      return;
    }

    // If authenticated, proceed with sharing
    onShare();
  };

  // New function to handle copy button click
  const handleCopyClick = () => {
    if (!isAuthenticated) {
      // Show login popup when button is clicked without authentication
      setShowLoginPopup(true);
      return;
    }

    // If authenticated, proceed with copying
    copyToClipboard();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={myColors.screenBackgroundColor} />

      {/* Login Popup */}
      <LoginPopup
        visible={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Back button */}
      {!isDesktopWeb() && (
        <SimpleHeader
          title="Värva vänner"
          onBackPress={handleGoBack}
        />
      )}

      <FooterWrapper showsVerticalScrollIndicator={false}>
        <DesktopViewWrapper>
          <View style={[styles.mainContent, isDesktopWeb() && styles.desktopContent]}>
            {isDesktopWeb() ? (
              /* Desktop Layout - Two Column */
              <>
                <View style={styles.desktopTitleContainer}>
                  <MyText style={styles.desktopTitle}>Värva vänner</MyText>
                </View>
                <View style={styles.desktopContainer}>
                  <View style={styles.desktopLeftColumn}>
                    {/* Circle background with images */}
                    <View style={[styles.circleBackground, styles.circleBackgroundDesktop]}>
                      <Image
                        source={require('@/assets/images/refer-friends-graphic.jpg')}
                        style={styles.mainImage}
                        resizeMode="contain"
                        resizeMethod="resize"
                      />
                      <View style={styles.avatarGroup}>
                        <Image
                          source={{ uri: 'https://placehold.co/31x31' }}
                          style={styles.avatar}
                        />
                        <Image
                          source={{ uri: 'https://placehold.co/31x31' }}
                          style={[styles.avatar, styles.avatarMiddle]}
                        />
                        <Image
                          source={{ uri: 'https://placehold.co/31x31' }}
                          style={styles.avatar}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.desktopRightColumn}>
                    <View style={[styles.contentContainer, styles.contentContainerDesktop]}>
                      <MyText style={[styles.heading, styles.headingDesktop]}>
                        Få exklusiva förmåner för både dig och dina vänner när du bjuder in dem!
                      </MyText>

                      <View style={[styles.benefitsContainer, styles.benefitsContainerDesktop]}>
                        <View style={styles.benefitRow}>
                          <CheckIcon />
                          <MyText style={[styles.benefitText, styles.benefitTextDesktop]}>Ge dina vänner 100 % rabatt.</MyText>
                        </View>
                        <View style={styles.benefitRow}>
                          <CheckIcon />
                          <MyText style={[styles.benefitText, styles.benefitTextDesktop]}>Få 100 % rabatt för varje vän som köper en plan.</MyText>
                        </View>
                        {(() => {
                          const invites = inviteData?.data?.invites;
                          if (typeof invites === 'number' && invites > 0) {
                            return (
                              <View style={[styles.invitesContainer, styles.invitesContainerDesktop]}>
                                <MyText style={[styles.invitesText, styles.invitesTextDesktop]}>
                                  Du har bjudit in {invites} {invites === 1 ? 'vän' : 'vänner'}!
                                </MyText>
                              </View>
                            );
                          }
                          return null;
                        })()}
                      </View>

                      <View style={[styles.referralLinkContainer, styles.referralLinkContainerDesktop]}>
                        <TouchableOpacity
                          style={[styles.linkBox, styles.linkBoxDesktop]}
                          onPress={handleCopyClick}
                        >
                          <MyText
                            style={[styles.linkText, styles.linkTextDesktop]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {inviteData?.data.invite_link || 'Logga in för att få din inbjudningslänk'}
                          </MyText>
                          <View style={[styles.copyButton, styles.copyButtonDesktop]}>
                            <MyText style={[styles.copyButtonText, styles.copyButtonTextDesktop]}>Kopiera</MyText>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.shareButton, styles.shareButtonDesktop]}
                          onPress={handleShareClick}
                        >
                          <MyText style={[styles.shareButtonText, styles.shareButtonTextDesktop]}>DELA</MyText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              /* Mobile Layout - Original */
              <>
                {/* Circle background with images */}
                <View style={styles.circleBackground}>
                  <Image
                    source={require('@/assets/images/refer-friends-graphic.jpg')}
                    style={styles.mainImage}
                    resizeMode="contain"
                    resizeMethod="resize"
                  />
                  <View style={styles.avatarGroup}>
                    <Image
                      source={{ uri: 'https://placehold.co/31x31' }}
                      style={styles.avatar}
                    />
                    <Image
                      source={{ uri: 'https://placehold.co/31x31' }}
                      style={[styles.avatar, styles.avatarMiddle]}
                    />
                    <Image
                      source={{ uri: 'https://placehold.co/31x31' }}
                      style={styles.avatar}
                    />
                  </View>
                </View>

                <View style={styles.contentContainer}>
                  <MyText style={styles.heading}>
                    Få exklusiva förmåner för både dig och dina vänner när du bjuder in dem!
                  </MyText>

                  <View style={styles.benefitsContainer}>
                    <View style={styles.benefitRow}>
                      <CheckIcon />
                      <MyText style={styles.benefitText}>Ge dina vänner 100 % rabatt.</MyText>
                    </View>
                    <View style={styles.benefitRow}>
                      <CheckIcon />
                      <MyText style={styles.benefitText}>Få 100 % rabatt för varje vän som köper en plan.</MyText>
                    </View>
                    {(() => {
                      const invites = inviteData?.data?.invites;
                      if (typeof invites === 'number' && invites > 0) {
                        return (
                          <View style={styles.invitesContainer}>
                            <MyText style={styles.invitesText}>
                              Du har bjudit in {invites} {invites === 1 ? 'vän' : 'vänner'}!
                            </MyText>
                          </View>
                        );
                      }
                      return null;
                    })()}
                  </View>

                  <View style={styles.referralLinkContainer}>
                    <TouchableOpacity
                      style={styles.linkBox}
                      onPress={handleCopyClick}
                    >
                      <MyText
                        style={styles.linkText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {inviteData?.data.invite_link || 'Logga in för att få din inbjudningslänk'}
                      </MyText>
                      <View style={styles.copyButton}>
                        <MyText style={styles.copyButtonText}>Kopiera</MyText>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={handleShareClick}
                    >
                      <MyText style={styles.shareButtonText}>DELA</MyText>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </DesktopViewWrapper>
      </FooterWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myColors.screenBackgroundColor,
    paddingTop: getStatusBarHeight(),

  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 10,
    zIndex: 1,
  },
  backButtonInner: {
    width: 46,
    height: 46,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: myColors.text.primary,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins',
    color: myColors.text.primary,
    textAlign: 'center',
    marginTop: 25,
  },
  circleBackground: {
    width: 305,
    height: 305,
    backgroundColor: myColors.white,
    borderRadius: 305 / 2,
    alignSelf: 'center',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mainImage: {
    width: '90%',
    height: undefined,
    aspectRatio: 178 / 227,
    resizeMode: 'contain',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  },
  avatarGroup: {
    flexDirection: 'row',
    position: 'absolute',
    right: 63,
    top: 36,
    width: 72,
    height: 72,
    zIndex: 2,
  },
  avatar: {
    width: 31.5,
    height: 31.5,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  avatarMiddle: {
    marginHorizontal: -10,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Poppins',
    color: myColors.text.primary,
    lineHeight: 30,
    marginBottom: 25,
  },
  benefitsContainer: {
    gap: 10,
    marginBottom: 25,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkmark: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(18, 178, 98, 0.4)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInner: {
    width: 16,
    height: 16,
    backgroundColor: 'rgb(18, 178, 98)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkTick: {
    width: 8,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'white',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: myColors.text.primary,
    lineHeight: 24,
  },
  referralLinkContainer: {
    gap: 20,
  },
  linkBox: {
    height: 52,
    backgroundColor: myColors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: myColors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter',
    color: myColors.text.primary,
    paddingLeft: 15,
  },
  copyButton: {
    width: 96,
    height: '100%',
    backgroundColor: myColors.primary.light4,
    borderLeftWidth: 1,
    borderColor: myColors.primary.light3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: myColors.primary.main,
  },
  shareButton: {
    height: 52,
    backgroundColor: myColors.primary.main,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 70,
    width: '100%',
  },
  shareButtonText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: myColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: myColors.text.secondary,
  },
  invitesContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: myColors.primary.light4,
    borderRadius: 8,
  },
  invitesText: {
    fontSize: 14,
    color: myColors.primary.main,
    textAlign: 'center',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
  },
  desktopContent: {
    marginBottom: 30,
  },
  // Desktop Layout Styles
  desktopTitleContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: myColors.border?.light || '#e0e0e0',
    marginBottom: 20,
  },
  desktopTitle: {
    fontSize: 36,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: myColors.text.primary,
    textAlign: 'center',
  },
  desktopContainer: {
    flexDirection: 'row',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 40,
    paddingVertical: 60,
    gap: 80,
    alignItems: 'center',
  },
  desktopLeftColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopRightColumn: {
    flex: 1.2,
    alignItems: 'stretch',
  },
  circleBackgroundDesktop: {
    width: 380,
    height: 380,
    borderRadius: 190,
  },
  contentContainerDesktop: {
    paddingHorizontal: 0,
    marginTop: 0,
  },
  headingDesktop: {
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 35,
  },
  benefitsContainerDesktop: {
    gap: 15,
    marginBottom: 35,
  },
  benefitTextDesktop: {
    fontSize: 16,
    lineHeight: 26,
  },
  invitesContainerDesktop: {
    marginTop: 20,
    padding: 15,
  },
  invitesTextDesktop: {
    fontSize: 16,
  },
  referralLinkContainerDesktop: {
    gap: 15,
    flexDirection: 'row',
  },
  linkBoxDesktop: {
    flex: 1,
    height: 60,
    width: 'auto',
  },
  linkTextDesktop: {
    fontSize: 14,
    paddingLeft: 20,
  },
  copyButtonDesktop: {
    width: 110,
  },
  copyButtonTextDesktop: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareButtonDesktop: {
    width: 140,
    height: 60,
    marginBottom: 0,
  },
  shareButtonTextDesktop: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ReferFriends;