import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { myColors } from '@/constants/MyColors'
import MyText from './MyText'
import { Entypo } from '@expo/vector-icons'
import { IconChevronDown } from '@/assets/icons'

type Props = {
    label?: string;
    values: any;
    placeholder?: string;
    error?: any;
    toggleDropdown?: () => void;
    onPressDropdownItem?: any;
    visible?: boolean;
    customPopupView?: any;
}

const CustomDropdown = (props: Props) => {
    const { label, values, error, toggleDropdown, onPressDropdownItem, visible, placeholder, customPopupView } = props;
    return (
        <View style={[styles.formField]}>
            {label && <MyText style={styles.label}>{label}</MyText>}
            <TouchableOpacity
                style={[styles.dropdown, { borderColor: (error) ? myColors.error : myColors.border.default }]}
                onPress={toggleDropdown}
            >
                {values?.value ?
                    <MyText style={styles.dropdownText}>{values?.value}</MyText>
                    : <MyText numberOfLines={2} style={styles.dropdownTextPlaceholder}>{placeholder}</MyText>
                }
                <IconChevronDown
                    color={myColors.text.secondary}
                    size={13}
                />
            </TouchableOpacity>
            {error && (
                <MyText style={styles.errorText}>{error}</MyText>
            )}

            {visible && (
                <View style={styles.dropdownMenu}>
                    {customPopupView && customPopupView}
                    {!customPopupView && <>
                        {values.map((item: any, index: any) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.dropdownItem}
                                onPress={() => onPressDropdownItem(item)}
                            >
                                <MyText style={styles.dropdownItemText}>{item.label}</MyText>
                            </TouchableOpacity>
                        ))}
                    </>}
                </View>
            )}
        </View>
    )
}

export default CustomDropdown

const styles = StyleSheet.create({
    formField: {
        zIndex: 100,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: myColors.text.primary,
    },
    dropdown: {
        backgroundColor: myColors.white,
        height: 45,
        borderRadius: 8,
        paddingHorizontal: 15,
        // paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: myColors.border.default,
    },
    dropdownText: {
        fontSize: 14,
        color: myColors.text.primary,
    },
    dropdownTextPlaceholder: {
        fontSize: 14,
        color: myColors.text.primary,
    },
    dropdownMenu: {
        width: '100%',
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: myColors.white,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 100,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    dropdownItemText: {
        fontSize: 16,
        color: myColors.text.primary,
    },
    errorText: {
        color: myColors.error,
        fontSize: 12,
        marginTop: 4,
    },
})