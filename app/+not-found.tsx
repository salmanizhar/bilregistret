import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import MyText from '@/components/common/MyText';
import { myColors } from '@/constants/MyColors';
import MyButton from '@/components/common/MyButton';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SvgXml
          xml={ImagePath.SvgIcons.BilregistretBannerIconBlack}
          height={70}
          width={170}
          style={styles.logo}
        />
        
        <View style={styles.errorContainer}>
          <MyText style={styles.errorCode}>404</MyText>
          <MyText style={styles.errorTitle}>Sidan hittades inte</MyText>
          <MyText style={styles.errorMessage}>
            Sidan du letar efter finns inte eller har flyttats.
          </MyText>
        </View>

        <View style={styles.actionsContainer}>
          <MyButton
            title="GÅ TILL STARTSIDAN"
            onPress={() => router.replace('/(main)')}
            buttonStyle={styles.homeButton}
          />
          {/* <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MyText style={styles.backButtonText}>Gå tillbaka</MyText>
          </TouchableOpacity> */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myColors.screenBackgroundColor,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 40,
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  errorCode: {
    fontSize: 80,
    fontWeight: 'bold',
    color: myColors.black,
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: myColors.text.primary,
    marginBottom: 15,
  },
  errorMessage: {
    fontSize: 16,
    color: myColors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: myColors.black,
    width: '100%',
    marginBottom: 15,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: myColors.primary.main,
    fontWeight: '500',
  },
});
