import React, { useState, ReactElement, useRef, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle, StyleProp, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';
import { Ionicons } from '@expo/vector-icons';
import { createWebStyles, createBoxShadow } from '@/utils/shadowHelper';

// Keep the same interface as mobile version
export interface DropdownItem {
    label: string;
    value: string | number;
    leftComponent?: React.ReactNode;
    rightComponent?: React.ReactNode;
    disabled?: boolean;
    [key: string]: any; // Allow dynamic field access
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
    maxHeight = 300,
    style,
    placeholderStyle,
    selectedTextStyle,
    containerStyle,
    dropdownPosition = 'auto',
    showArrow = true,
    disabled = false,
    search = false,
    searchPlaceholder = 'Search...',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isFocus, setIsFocus] = useState(false);
    const dropdownRef = useRef<any>(null);
    const searchInputRef = useRef<any>(null);

    // Find selected item
    const selectedItem = data.find(item => item[valueField] === value);

    // Filter data based on search
    const filteredData = searchText
        ? data.filter(item =>
            item[labelField].toLowerCase().includes(searchText.toLowerCase())
        )
        : data;

    // Handle item selection
    const handleItemSelect = (item: DropdownItem) => {
        if (item.disabled) return;
        onChange(item);
        setIsOpen(false);
        setSearchText('');
        setIsFocus(false);
    };

    // Handle dropdown toggle
    const handleToggle = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        setIsFocus(!isOpen);
        if (!isOpen && (search || searchable)) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    };

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (Platform.OS === 'web' && dropdownRef.current && !dropdownRef.current.contains?.(event.target)) {
                setIsOpen(false);
                setIsFocus(false);
                setSearchText('');
            }
        };

        if (Platform.OS === 'web') {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, []);

    // Render dropdown item
    const renderItem = (item: DropdownItem, index: number) => {
        const isSelected = item[valueField] === value;

        return (
            <TouchableOpacity
                key={`${item[valueField]}-${index}`}
                style={[
                    styles.dropdownItem,
                    isSelected && styles.selectedItem,
                    item.disabled && styles.disabledItem
                ]}
                onPress={() => handleItemSelect(item)}
                disabled={item.disabled}
            >
                <View style={styles.itemContent}>
                    {item.leftComponent && (
                        <View style={styles.leftComponent}>
                            {item.leftComponent}
                        </View>
                    )}
                    <MyText style={[
                        styles.itemText,
                        isSelected && styles.selectedItemText,
                        item.disabled && styles.disabledItemText
                    ]}>
                        {item[labelField]}
                    </MyText>
                    {item.rightComponent && (
                        <View style={styles.rightComponent}>
                            {item.rightComponent}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Default right icon
    const defaultRightIcon = (visible?: boolean): ReactElement | null => (
        <Ionicons
            name={visible ? "chevron-up" : "chevron-down"}
            size={20}
            color={myColors.text.secondary}
        />
    );

    return (
        <View style={[styles.container, style]} ref={dropdownRef}>
            {/* Dropdown Trigger */}
            <TouchableOpacity
                style={[
                    styles.dropdown,
                    isFocus && styles.focusedDropdown,
                    disabled && styles.disabledDropdown
                ]}
                onPress={handleToggle}
                disabled={disabled}
            >
                <View style={styles.dropdownContent}>
                    {renderLeftIcon && (
                        <View style={styles.leftIconContainer}>
                            {renderLeftIcon(isFocus)}
                        </View>
                    )}
                    <MyText style={[
                        selectedItem ? styles.selectedText : styles.placeholderText,
                    ]}>
                        {selectedItem ? selectedItem[labelField] : placeholder}
                    </MyText>
                </View>
                {showArrow && (
                    <View style={styles.rightIconContainer}>
                        {renderRightIcon ? renderRightIcon(isOpen) : defaultRightIcon(isOpen)}
                    </View>
                )}
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {isOpen && (
                <View style={[
                    styles.dropdownMenu,
                    { maxHeight },
                    dropdownPosition === 'top' && styles.dropdownMenuTop,
                    containerStyle
                ]}>
                    {/* Search Input */}
                    {(search || searchable) && (
                        <View style={styles.searchContainer}>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: 40,
                                    padding: '8px 12px',
                                    border: `1px solid ${myColors.border.light}`,
                                    borderRadius: 8,
                                    fontSize: 14,
                                    color: myColors.text.primary,
                                    backgroundColor: myColors.white,
                                    ...createWebStyles({ outline: 'none' }),
                                }}
                            />
                        </View>
                    )}

                    {/* Options List */}
                    <ScrollView
                        style={styles.optionsList}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => renderItem(item, index))
                        ) : (
                            <View style={styles.noOptionsContainer}>
                                <MyText style={styles.noOptionsText}>
                                    No options available
                                </MyText>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 1000,
    },
    dropdown: {
        height: 45,
        borderColor: myColors.border.light,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: myColors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    focusedDropdown: {
        borderColor: myColors.primary.main,
    },
    disabledDropdown: {
        opacity: 0.5,
        backgroundColor: myColors.screenBackgroundColor,
    },
    dropdownContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    leftIconContainer: {
        marginRight: 8,
    },
    rightIconContainer: {
        marginLeft: 8,
    },
    placeholderText: {
        fontSize: 14,
        color: myColors.text.secondary,
    },
    selectedText: {
        fontSize: 14,
        color: myColors.text.primary,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: myColors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: myColors.border.light,
        ...createBoxShadow({
            shadowColor: myColors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        }),
        elevation: 1001,
        zIndex: 1001,
    },
    dropdownMenuTop: {
        top: undefined,
        bottom: 50,
    },
    searchContainer: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    optionsList: {
        maxHeight: 200,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    selectedItem: {
        backgroundColor: myColors.screenBackgroundColor,
    },
    disabledItem: {
        opacity: 0.5,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftComponent: {
        marginRight: 12,
    },
    rightComponent: {
        marginLeft: 12,
    },
    itemText: {
        flex: 1,
        fontSize: 14,
        color: myColors.text.primary,
    },
    selectedItemText: {
        color: myColors.primary.main,
        fontWeight: '600',
    },
    disabledItemText: {
        color: myColors.text.secondary,
    },
    noOptionsContainer: {
        padding: 16,
        alignItems: 'center',
    },
    noOptionsText: {
        fontSize: 14,
        color: myColors.text.secondary,
    },
});

export default CustomDropdownPicker;