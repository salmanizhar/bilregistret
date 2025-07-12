import React from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    TextStyle,
    TextInputProps
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { myColors } from '@/constants/MyColors';

interface CustomTextInputProps extends TextInputProps {
    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
    leftIcon?: React.ReactNode;
    error?: string;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
    containerStyle,
    inputStyle,
    rightIcon,
    onRightIconPress,
    leftIcon,
    error,
    ...rest
}) => {
    const inputStyles: StyleProp<TextStyle>[] = [styles.input];

    if (leftIcon) {
        inputStyles.push(styles.inputWithLeftIcon);
    }

    if (rightIcon) {
        inputStyles.push(styles.inputWithRightIcon);
    }

    if (inputStyle) {
        inputStyles.push(inputStyle);
    }

    return (
        <View style={[styles.container, containerStyle]}>
            {leftIcon && (
                <View style={styles.leftIconContainer}>
                    {leftIcon}
                </View>
            )}
            <TextInput
                style={inputStyles}
                placeholderTextColor={myColors.text.placeholder}
                {...rest}
            />
            {rightIcon && (
                <TouchableOpacity
                    style={styles.rightIconContainer}
                    onPress={onRightIconPress}
                    disabled={!onRightIconPress}
                >
                    {rightIcon}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: myColors.border.light,
        height: 48,
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 12,
        fontSize: 16,
        color: myColors.text.primary,
    },
    inputWithLeftIcon: {
        paddingLeft: 0,
    },
    inputWithRightIcon: {
        paddingRight: 0,
    },
    leftIconContainer: {
        paddingLeft: 12,
        height: '100%',
        justifyContent: 'center',
    },
    rightIconContainer: {
        paddingRight: 12,
        height: '100%',
        justifyContent: 'center',
    },
});

export default CustomTextInput;