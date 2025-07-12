import { Platform, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import MyText from './MyText'
import { myColors } from '@/constants/MyColors'
import { IconSearch } from '@/assets/icons'
import { safeNavigation } from '@/utils/safeNavigation'

type Props = {
    theme?: "light" | "dark"
}

const BlueSearchButton = (props: Props) => {

    const handleBlueSearchPress = () => {
        safeNavigation("/searchscreen");
    };

    return (
        <TouchableOpacity style={props?.theme === "light" ? styles.whiteSearchBar : styles.blueSearchBar} onPress={handleBlueSearchPress} >
            <IconSearch size={20} color={props?.theme === "light" ? myColors.text.secondary : myColors.white} style={styles.searchIcon} />
            <MyText style={props?.theme === "light" ? styles.whiteSearchText : styles.blueSearchText}>Registreringsnummer / VIN</MyText>
        </TouchableOpacity>
    )
}

export default BlueSearchButton

const styles = StyleSheet.create({
    blueSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#6CA2EF",
        borderRadius: 10,
        height: 62,
        paddingVertical: Platform.OS === "web" ? 20 : 0,
        paddingRight: 10,
        paddingLeft: 15,
        flex: 1,
        alignSelf: 'stretch',
    },
    whiteSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.white,
        borderRadius: 10,
        height: 62,
        paddingVertical: Platform.OS === "web" ? 20 : 0,
        paddingRight: 10,
        paddingLeft: 15,
        flex: 1,
        alignSelf: 'stretch',
    },
    blueSearchText: {
        color: myColors.white,
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
    },
    whiteSearchText: {
        color: myColors.text.secondary,
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
})