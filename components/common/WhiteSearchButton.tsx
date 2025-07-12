import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import MyText from './MyText'
import { myColors } from '@/constants/MyColors'
import { IconSearch } from '@/assets/icons'
import { safeNavigation } from '@/utils/safeNavigation'

const WhiteSearchButton = () => {

    const handleSearchPress = () => {
        safeNavigation("/searchscreen");
    };

    return (
        <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress} >
            {/* <Ionicons
                name={"search"}
                size={20}
                color={myColors.text.secondary}
                style={styles.searchIcon}
            /> */}
            <IconSearch color={myColors.text.secondary} size={20} style={styles.searchIcon} />
            <MyText style={styles.searchText}>Registreringsnummer / VIN</MyText>
        </TouchableOpacity>
    )
}

export default WhiteSearchButton

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.white,
        borderWidth: 2,
        borderColor: myColors.primary.main,
        borderRadius: 10,
        height: 62,
        paddingVertical: Platform.OS === "web" ? 20 : 0,
        paddingRight: 10,
        paddingLeft: 15,
        flex: 1,
        alignSelf: 'stretch',
    },
    searchText: {
        color: myColors.text.webGray,
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
})