import React, { useState } from 'react';
import {
    TextInput,
    TextInputProps,
    StyleSheet,
    View,
    Text,
    ViewStyle,
    TextStyle,
    StyleProp,
    TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';
import { BORDER_RADIUS } from '@/constants/Dimentions';
import { IconEye, IconEyeOff } from '@/assets/icons';

interface MyTextInputProps extends TextInputProps {
    label?: string;
    error?: string | any;
    containerStyle?: StyleProp<ViewStyle>;
    labelStyle?: TextStyle;
    inputStyle?: StyleProp<TextStyle>;
    style?: StyleProp<TextStyle>;
    isPassword?: boolean;
    rightIcon?: React.ReactNode;
    LabelRightComponent?: React.ReactNode;
    isAuthInput?: boolean;
    multiline?: boolean;
}

export const MyTextInput: React.FC<MyTextInputProps> = ({
    label,
    error,
    containerStyle,
    labelStyle,
    inputStyle,
    style,
    isPassword,
    rightIcon,
    LabelRightComponent,
    isAuthInput,
    multiline,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const textInputStyle = [
        isAuthInput ? styles.authInput : styles.input,
        error && styles.inputError,
        multiline && styles.multilineInput,
        inputStyle,
        isPassword && styles.passwordInput
    ];

    return (
        <View style={[isAuthInput ? styles.authContainer : styles.container, containerStyle]}>
            {label && (
                <View style={styles.labelContainer}>
                    <MyText style={{ ...styles.label, ...labelStyle }}>
                        {label}
                    </MyText>
                    {LabelRightComponent && (
                        <View style={styles.labelRightComponent}>
                            {LabelRightComponent}
                        </View>
                    )}
                </View>
            )}
            <View style={styles.inputWrapper}>
                <TextInput
                    style={textInputStyle}
                    placeholderTextColor={myColors.text.placeholder}
                    secureTextEntry={isPassword && !showPassword}
                    multiline={multiline}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <IconEye
                                size={20}
                                color={myColors.black}
                            />
                        ) : (
                            <IconEyeOff
                                size={20}
                                color={myColors.black}
                            />
                        )}
                    </TouchableOpacity>
                )}
                {rightIcon && (
                    <View style={styles.rightIcon}>
                        {rightIcon}
                    </View>
                )}
            </View>
            {error && (
                <View style={styles.errorContainer}>
                    <MyText style={styles.errorText}>
                        {error}
                    </MyText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    authContainer: {
        // marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: myColors.text.primary,
        marginBottom: 3,
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        height: 45,//52,
        borderWidth: 1,
        borderColor: myColors.border.light,
        borderRadius: BORDER_RADIUS.Regular,
        fontSize: 14,
        paddingHorizontal: 20,
        color: myColors.text.primary,
        backgroundColor: colors.white,
        fontFamily: "Inter",
    },
    authInput: {
        height: 45,//52,
        // borderWidth: 1,
        // borderBottomWidth: 1,
        borderColor: myColors.border.light,
        // borderRadius: BORDER_RADIUS.Regular,
        fontSize: 14,
        paddingHorizontal: 20,
        color: myColors.text.primary,
        backgroundColor: colors.white,
        fontFamily: "Inter",
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 15,
    },
    inputError: {
        borderColor: myColors.error,
    },
    errorContainer: {
        paddingTop: 4,
        paddingBottom: 2,
    },
    errorText: {
        fontSize: 12,
        color: myColors.error,
    },
    rightIcon: {
        position: 'absolute',
        right: 15,
        top: 15,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelRightComponent: {

    },
    multilineInput: {
        textAlignVertical: 'top',
        paddingTop: 15,
        minHeight: 120,
        height: 'auto',
    },
});
