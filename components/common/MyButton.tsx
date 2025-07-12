import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native'
import React from 'react'
import { myStyles } from '@/Styles/myStyles'
import MyText from './MyText'
import { SvgXml } from 'react-native-svg'
import { myColors } from '@/constants/MyColors'

type Props = {
    onPress: () => void;
    title: string;
    buttonStyle?: ViewStyle | ViewStyle[];
    icon?: string | null;
    textStyle?: TextStyle;
    disabled?: boolean;
}

const MyButton = ({ onPress, title, buttonStyle, icon, textStyle, disabled }: Props) => {
    return (
        <TouchableOpacity
            style={[myStyles.button, buttonStyle, disabled && { backgroundColor: myColors.baseColors.lightGray2 }]}
            onPress={onPress}
            disabled={disabled}
        >
            {icon && <SvgXml xml={icon} style={styles.icon} />}
            <MyText style={{ ...myStyles.buttonText, ...textStyle }}>{title}</MyText>
        </TouchableOpacity>
    )
}

export default MyButton

const styles = StyleSheet.create({
    icon: { marginRight: 10 }
})