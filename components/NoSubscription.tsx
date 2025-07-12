import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { myColors } from '@/constants/MyColors'
import MyText from './common/MyText'
import { SvgXml } from 'react-native-svg'
import { ImagePath } from '@/assets/images'
import { useRouter } from 'expo-router'
import { safeNavigation } from '@/utils/safeNavigation'
import MyButton from './common/MyButton'
type Props = {}

const NoSubscription = (props: Props) => {
    const router = useRouter();
    return (
        <View style={styles.emptyContainer}>
            <SvgXml xml={ImagePath.SvgIcons.PackageIcon} width={60} height={60} />
            <MyText fontFamily="Poppins" style={styles.emptyTitle}>Ingen aktiv prenumeration</MyText>
            <MyText style={styles.emptyDescription}>
                Du har för närvarande ingen aktiv prenumeration. Uppgradera för att se översikten.
            </MyText>

            <MyButton
                title="Uppgradera nu"
                onPress={() => safeNavigation('/paket')}
                buttonStyle={styles.upgradeButton}
                textStyle={styles.upgradeButtonText}
            />
        </View>
    );
}

export default NoSubscription

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: myColors.text.primary,
        marginBottom: 10,
    },
    emptyDescription: {
        fontSize: 16,
        color: myColors.text.secondary,
        textAlign: 'center',
        marginBottom: 20,
    },
    upgradeButton: {
        backgroundColor: myColors.primary.main,
        padding: 10,
        borderRadius: 10,
        width: '100%',
    },
    upgradeButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: myColors.white,
    },
})