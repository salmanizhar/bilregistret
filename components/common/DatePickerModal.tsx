import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Platform, ViewStyle, TextStyle } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';
import MyButton from './MyButton';
// @ts-ignore - Ignore type errors for react-date-picker import
import DatePicker from 'react-date-picker';

// Import CSS for web date picker (only used on web)
if (Platform.OS === 'web') {
    require('react-date-picker/dist/DatePicker.css');
    require('react-calendar/dist/Calendar.css');
}

interface DatePickerModalProps {
    isVisible: boolean;
    date: Date;
    onClose: () => void;
    onDateChange: (date: Date) => void;
    minimumDate?: Date;
    maximumDate?: Date;
    title?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    mode?: 'date' | 'time' | 'datetime';
}

interface Styles {
    modalOverlay: ViewStyle;
    modalContent: ViewStyle;
    datePickerModalContent: ViewStyle;
    datePickerHeader: ViewStyle;
    modalTitle: TextStyle;
    cancelButton: TextStyle;
    confirmButton: TextStyle;
    datePickerContainer: ViewStyle;
    iosDatePicker: ViewStyle;
    webDatePickerContainer: ViewStyle;
    webDatePickerButtonsContainer: ViewStyle;
    webDatePickerButton: ViewStyle;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
    isVisible,
    date,
    onClose,
    onDateChange,
    minimumDate,
    maximumDate,
    title = 'Välj datum',
    confirmButtonText = 'Bekräfta',
    cancelButtonText = 'Avbryt',
    mode = 'date'
}) => {
    const [tempDate, setTempDate] = useState(date);

    // Update tempDate when date prop changes
    useEffect(() => {
        setTempDate(date);
    }, [date]);

    // Add custom styles for web date picker
    useEffect(() => {
        if (Platform.OS === 'web') {
            // Check if running in a browser environment
            if (typeof document !== 'undefined') {
                const styleTag = document.createElement('style');
                styleTag.innerHTML = `
                    .react-date-picker {
                        width: 100%;
                        font-family: 'Inter', sans-serif;
                    }
                    .react-date-picker__wrapper {
                        border: 1px solid ${myColors.border.light};
                        border-radius: 8px;
                        padding: 8px;
                    }
                    .react-date-picker__inputGroup {
                        padding: 0 8px;
                        font-size: 16px;
                    }
                    .react-calendar {
                        border-radius: 8px;
                        border: 1px solid ${myColors.border.light};
                        font-family: 'Inter', sans-serif;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    }
                    .react-calendar__tile--active {
                        background: ${myColors.primary.main};
                        color: white;
                    }
                    .react-calendar__tile--now {
                        background: ${myColors.primary.light1};
                    }
                    .react-calendar__navigation button:enabled:hover,
                    .react-calendar__navigation button:enabled:focus,
                    .react-calendar__tile:enabled:hover,
                    .react-calendar__tile:enabled:focus {
                        background-color: ${myColors.primary.light1};
                    }
                    /* Hide the input fields and only show the calendar */
                    .react-date-picker__calendar {
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        z-index: 9999 !important;
                    }
                    .react-date-picker__calendar .react-calendar {
                        border: none;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                        padding: 10px;
                    }
                    .react-calendar__navigation {
                        margin-bottom: 10px;
                    }
                    /* Add a backdrop */
                    .date-picker-backdrop {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(0, 0, 0, 0.5);
                        z-index: 9998;
                    }
                `;
                document.head.appendChild(styleTag);

                // Clean up function to remove the style tag when component unmounts
                return () => {
                    document.head.removeChild(styleTag);
                };
            }
        }
    }, []);

    const handleIOSDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (selectedDate) {
            setTempDate(selectedDate);
        }
    };

    const handleAndroidDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        onClose();
        if (selectedDate && event.type !== 'dismissed') {
            onDateChange(selectedDate);
        }
    };

    // Handle web date picker change events
    const handleWebDateChange = (value: any) => {
        if (value && value instanceof Date) {
            setTempDate(value);
            // Immediately apply the date and close the picker
            onDateChange(value);
            onClose();
        }
    };

    const handleConfirm = () => {
        onDateChange(tempDate);
        onClose();
    };

    // For web, we'll create a backdrop to close the picker when clicking outside
    const WebBackdrop = () => {
        if (Platform.OS === 'web' && typeof document !== 'undefined' && isVisible) {
            return <div className="date-picker-backdrop" onClick={onClose}></div>;
        }
        return null;
    };

    return (
        <>
            {/* Android DatePicker - shown directly */}
            {Platform.OS === 'android' && isVisible && (
                <DateTimePicker
                    value={date}
                    mode={mode}
                    display="default"
                    onChange={handleAndroidDateChange}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                />
            )}

            {/* iOS DatePicker - shown in a modal */}
            {Platform.OS === 'ios' && (
                <Modal
                    visible={isVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={onClose}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.datePickerModalContent}>
                            <View style={styles.datePickerHeader}>
                                <TouchableOpacity onPress={onClose}>
                                    <MyText style={styles.cancelButton}>{cancelButtonText}</MyText>
                                </TouchableOpacity>
                                <MyText style={styles.modalTitle}>{title}</MyText>
                                <TouchableOpacity onPress={handleConfirm}>
                                    <MyText style={styles.confirmButton}>{confirmButtonText}</MyText>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.datePickerContainer}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode={mode}
                                    display="spinner"
                                    onChange={handleIOSDateChange}
                                    minimumDate={minimumDate}
                                    maximumDate={maximumDate}
                                    style={styles.iosDatePicker}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Web DatePicker - just the calendar */}
            {Platform.OS === 'web' && isVisible && (
                <>
                    {/* @ts-ignore - Render the backdrop div */}
                    <WebBackdrop />
                    {/* @ts-ignore - Ignore type errors for react-date-picker props */}
                    <DatePicker
                        onChange={handleWebDateChange}
                        value={tempDate}
                        minDate={minimumDate}
                        maxDate={maximumDate}
                        format="dd/MM/y"
                        clearIcon={null}
                        calendarIcon={null}
                        locale="sv-SE"
                        dayPlaceholder="dd"
                        monthPlaceholder="mm"
                        yearPlaceholder="åååå"
                        isOpen={true}
                        autoFocus={true}
                        closeCalendar={false}
                    />
                </>
            )}
        </>
    );
};

const styles = StyleSheet.create<Styles>({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: Platform.OS === 'web' ? 'center' : undefined,
    },
    modalContent: {
        backgroundColor: myColors.white,
        borderRadius: 12,
        padding: 20,
        width: Platform.OS === 'web' ? 320 : '80%',
        alignSelf: 'center',
        marginBottom: Platform.OS === 'web' ? 0 : undefined,
    },
    datePickerModalContent: {
        backgroundColor: myColors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: myColors.border.light,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: myColors.text.primary,
    },
    cancelButton: {
        color: myColors.primary.main,
        fontSize: 16,
    },
    confirmButton: {
        color: myColors.primary.main,
        fontSize: 16,
        fontWeight: '600',
    },
    datePickerContainer: {
        marginBottom: 0,
        alignSelf: 'center',
    },
    iosDatePicker: {
        height: 200,
    },
    webDatePickerContainer: {
        marginVertical: 20,
        alignItems: 'center',
    },
    webDatePickerButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    webDatePickerButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
    },
});

export default DatePickerModal;