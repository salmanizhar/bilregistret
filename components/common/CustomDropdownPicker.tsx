import React, { useState, useRef, ReactElement } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ViewStyle, TextStyle, StyleProp, Modal, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { IconChevronDown, IconChevronUp, IconClose } from '@/assets/icons';

export interface DropdownItem {
    label: string;
    value: string | number;
    leftComponent?: React.ReactNode;
    rightComponent?: React.ReactNode;
    disabled?: boolean;
    icon?: string; // Add icon property for flag URLs
    [key: string]: any; // Allow dynamic property access
}

type CustomDropdownPickerProps = {
    data: DropdownItem[];
    value: string | number | null;
    placeholder?: string;
    onChange: (item: DropdownItem) => void;
    labelField?: string;
    valueField?: string;
    searchable?: boolean;
    renderLeftIcon?: (visible?: boolean) => ReactElement | null;
    renderRightIcon?: (visible?: boolean) => ReactElement | null;
    maxHeight?: number;
    style?: StyleProp<ViewStyle>;
    placeholderStyle?: StyleProp<TextStyle>;
    selectedTextStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    dropdownPosition?: 'auto' | 'top' | 'bottom';
    showArrow?: boolean;
    disabled?: boolean;
    search?: boolean;
    searchPlaceholder?: string;
    useMobileModal?: boolean; // New prop to enable mobile modal
    modalTitle?: string; // Title for mobile modal
};

const CustomDropdownPicker: React.FC<CustomDropdownPickerProps> = ({
    data,
    value,
    placeholder = 'Select item',
    onChange,
    labelField = 'label',
    valueField = 'value',
    searchable = false,
    renderLeftIcon,
    renderRightIcon,
    maxHeight = 400,
    style,
    placeholderStyle,
    selectedTextStyle,
    containerStyle,
    dropdownPosition = 'auto',
    showArrow = true,
    disabled = false,
    search = false,
    searchPlaceholder = 'Search...',
    useMobileModal = false,
    modalTitle = 'Select Option',
}) => {
    const [isFocus, setIsFocus] = useState(false);
    const [mobileModalVisible, setMobileModalVisible] = useState(false);
    const dropdownRef = useRef<any>(null);

    const renderItem = (item: DropdownItem) => {
        return (
            <View style={styles.itemContainer}>
                {item.leftComponent && <View style={styles.leftComponent}>{item.leftComponent}</View>}
                {item.disabled ? (
                    <MyText style={{ ...styles.itemText, ...styles.disabledText }}>
                        {item.label}
                    </MyText>
                ) : (
                    <MyText style={styles.itemText}>
                        {item.label}
                    </MyText>
                )}
                {item.rightComponent && <View style={styles.rightComponent}>{item.rightComponent}</View>}
            </View>
        );
    };

    const defaultRightIcon = (visible?: boolean): ReactElement | null => (
        // <Ionicons
        //     name={visible ? "chevron-up" : "chevron-down"}
        //     size={20}
        //     color={myColors.text.secondary}
        //     style={styles.iconStyle}
        // />

        visible ? <IconChevronUp
            color={myColors.text.secondary}
            size={20}
        /> : <IconChevronDown
            color={myColors.text.secondary}
            size={20}
        />

    );

    // Handle mobile modal item selection
    const handleMobileModalItemSelect = (item: DropdownItem) => {
        if (item.disabled) return;
        onChange(item);
        setMobileModalVisible(false);
    };

    // Mobile modal button component
    const MobileModalButton = () => {
        const selectedItem = data.find(item => item[valueField] === value);
        const displayText = selectedItem ? selectedItem[labelField] : placeholder;

        return (
            <TouchableOpacity
                style={[styles.dropdownModal, style]}
                onPress={() => setMobileModalVisible(true)}
                disabled={disabled}
            >
                {renderLeftIcon && renderLeftIcon(false)}
                <MyText style={StyleSheet.flatten([
                    selectedItem ? styles.selectedTextStyle : styles.placeholderStyle,
                    selectedTextStyle,
                    placeholderStyle
                ])}>
                    {displayText}
                </MyText>
                {/* <View style={{ flex: 1 }} /> */}
                {renderRightIcon ? renderRightIcon(false) : (showArrow ? defaultRightIcon(false) : null)}
            </TouchableOpacity>
        );
    };

    // Mobile modal content
    const MobileModalContent = () => (
        <Modal
            visible={mobileModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setMobileModalVisible(false)}
        >
            <View style={styles.mobileModalOverlay}>
                <TouchableOpacity
                    style={styles.mobileModalBackdrop}
                    onPress={() => setMobileModalVisible(false)}
                />
                <View style={styles.mobileModalContent}>
                    <View style={styles.mobileModalHeader}>
                        <MyText style={styles.mobileModalTitle}>
                            {modalTitle}
                        </MyText>
                        <TouchableOpacity
                            onPress={() => setMobileModalVisible(false)}
                            style={styles.mobileModalCloseButton}
                        >
                            {/* <Ionicons name="close" size={24} color={myColors.text.primary} /> */}
                            <IconClose
                                color={myColors.text.primary}
                                size={20}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.mobileModalList} showsVerticalScrollIndicator={false}>
                        {data.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.mobileModalItem,
                                    value === item[valueField] && styles.mobileModalItemSelected,
                                    item.disabled && styles.mobileModalItemDisabled
                                ]}
                                onPress={() => handleMobileModalItemSelect(item)}
                                disabled={item.disabled}
                            >
                                {item.leftComponent && (
                                    <View style={styles.leftComponent}>
                                        {item.leftComponent}
                                    </View>
                                )}
                                <MyText style={[
                                    styles.mobileModalItemText,
                                    value === item[valueField] && styles.mobileModalItemTextSelected,
                                    item.disabled && styles.mobileModalItemTextDisabled
                                ]}>
                                    {item[labelField]}
                                </MyText>
                                {item.rightComponent && (
                                    <View style={styles.rightComponent}>
                                        {item.rightComponent}
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    // Use mobile modal for non-desktop web devices when enabled
    if (useMobileModal && !isDesktopWeb()) {
        return (
            <>
                <MobileModalButton />
                <MobileModalContent />
            </>
        );
    }

    // Use regular dropdown for desktop web or when mobile modal is disabled
    return (
        <Dropdown
            ref={dropdownRef}
            style={[styles.dropdown, isFocus && styles.focusedDropdown, style] as any}
            containerStyle={[styles.dropdownContainer, containerStyle] as any}
            placeholderStyle={[styles.placeholderStyle, placeholderStyle] as any}
            selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle] as any}
            itemTextStyle={styles.itemText as any}
            data={data}
            maxHeight={maxHeight}
            labelField={labelField}
            valueField={valueField}
            placeholder={!isFocus ? placeholder : '...'}
            searchPlaceholder={searchPlaceholder}
            value={value}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item) => {
                if (item.disabled) return;
                onChange(item);
                setIsFocus(false);
            }}
            renderLeftIcon={renderLeftIcon}
            renderRightIcon={renderRightIcon || (showArrow ? defaultRightIcon : undefined)}
            renderItem={renderItem}
            search={search || searchable}
            inputSearchStyle={styles.searchInputStyle as any}
            disable={disabled}
            dropdownPosition={dropdownPosition}
            activeColor={myColors.screenBackgroundColor}

        />
    );
};

const styles = StyleSheet.create({
    dropdown: {
        height: 45,
        borderColor: myColors.border.default,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: myColors.white,
    },
    dropdownModal: {
        height: 45,
        borderColor: myColors.border.default,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: myColors.white,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    focusedDropdown: {
        borderColor: myColors.primary.main,
    },
    dropdownContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: myColors.border.light,
        shadowColor: myColors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'scroll',
        minWidth: isDesktopWeb() ? 300 : undefined,
    },
    iconStyle: {
        marginRight: 5,
    },
    placeholderStyle: {
        fontSize: 14,
        color: myColors.text.primary,
    },
    selectedTextStyle: {
        fontSize: 14,
        color: myColors.text.primary,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    itemText: {
        flex: 1,
        fontSize: 14,
        color: myColors.text.primary,
    },
    disabledText: {
        color: myColors.text.secondary,
        opacity: 0.5,
    },
    leftComponent: {
        marginRight: 12,
    },
    rightComponent: {
        marginLeft: 12,
    },
    searchInputStyle: {
        outlineWidth: 0,
    } as any,
    // Mobile modal styles
    mobileModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    mobileModalBackdrop: {
        flex: 1,
    },
    mobileModalContent: {
        backgroundColor: myColors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        minHeight: 300,
        flex: 1,
    },
    mobileModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    mobileModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: myColors.text.primary,
    },
    mobileModalCloseButton: {
        padding: 4,
    },
    mobileModalList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flex: 1,
    },
    mobileModalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    mobileModalItemSelected: {
        backgroundColor: myColors.primary.light3,
    },
    mobileModalItemDisabled: {
        opacity: 0.5,
    },
    mobileModalItemText: {
        fontSize: 16,
        color: myColors.text.primary,
        marginLeft: 12,
        flex: 1,
    },
    mobileModalItemTextSelected: {
        color: myColors.primary.main,
        fontWeight: '600',
    },
    mobileModalItemTextDisabled: {
        color: myColors.text.secondary,
    },
});

export default CustomDropdownPicker;