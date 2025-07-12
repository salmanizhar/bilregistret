import { myColors } from "@/constants/MyColors";
import { StyleSheet } from "react-native";


export const myStyles = StyleSheet.create({
    grayText14: {
        fontSize: 14,
        color: myColors.baseColors.lightGray3,
        lineHeight: 16,
    },
    grayText14Link: {
        fontSize: 14,
        // color: myColors.baseColors.lightGray3,
        color: myColors.primary.main,
        fontWeight: "bold",
        lineHeight: 16,
        textDecorationLine: "underline"
    },
    blueText14Link: {
        fontSize: 14,
        color: myColors.primary.main,
        lineHeight: 16,
        textDecorationLine: "underline"
    },
    button: {
        backgroundColor: myColors.black,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

})