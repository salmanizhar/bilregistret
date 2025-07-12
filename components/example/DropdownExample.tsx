import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CustomDropdownPicker, { DropdownItem } from '../common/CustomDropdownPicker';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import MyText from '../common/MyText';
import { myColors } from '@/constants/MyColors';

const DropdownExample: React.FC = () => {
    const [selectedValue, setSelectedValue] = useState<string | number | null>(null);

    // Sample data with left and right components
    const data: DropdownItem[] = [
        {
            label: 'Bensin',
            value: 'B',
            leftComponent: <Ionicons name="car" size={20} color={myColors.primary.main} />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>520</MyText></View>,
        },
        {
            label: 'Diesel',
            value: 'D',
            leftComponent: <Ionicons name="subway" size={20} color={myColors.text.primary} />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>310</MyText></View>,
        },
        {
            label: 'Electric',
            value: 'EL',
            leftComponent: <Ionicons name="flash" size={20} color="#2E86DE" />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>189</MyText></View>,
        },
        {
            label: 'CNG',
            value: 'CNG',
            leftComponent: <Ionicons name="leaf" size={20} color="#10AC84" />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>87</MyText></View>,
        },
        {
            label: 'PHEV',
            value: 'PHEV',
            leftComponent: <Ionicons name="battery-half" size={20} color="#5758BB" />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>152</MyText></View>,
        },
        {
            label: 'HEV',
            value: 'HEV',
            leftComponent: <Ionicons name="battery-charging" size={20} color="#6F1E51" />,
            rightComponent: <View style={styles.countBadge}><MyText style={styles.countText}>104</MyText></View>,
        },
        {
            label: 'Disabled Option',
            value: 'disabled',
            leftComponent: <Ionicons name="close-circle" size={20} color={myColors.text.secondary} />,
            disabled: true,
        },
    ];

    const handleChange = (item: DropdownItem) => {
        setSelectedValue(item.value);
        // console.log('Selected:', item);
    };

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <MyText style={styles.title}>Fuel Type</MyText>
                <CustomDropdownPicker
                    data={data}
                    value={selectedValue}
                    onChange={handleChange}
                    placeholder="Select Fuel Type"
                    search={true}
                    searchPlaceholder="Search fuel type..."
                    renderLeftIcon={(visible) => (
                        <Ionicons
                            name="car-sport"
                            size={22}
                            color={visible ? myColors.primary.main : myColors.text.secondary}
                            style={{ marginRight: 10 }}
                        />
                    )}
                />
            </View>

            <View style={styles.section}>
                <MyText style={styles.title}>Current Selection</MyText>
                <MyText>
                    {selectedValue ? `Selected Value: ${selectedValue}` : 'Nothing selected yet'}
                </MyText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: myColors.screenBackgroundColor,
    },
    section: {
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: myColors.text.primary,
    },
    countBadge: {
        backgroundColor: myColors.screenBackgroundColor,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    countText: {
        fontSize: 12,
        color: myColors.text.primary,
    },
});

export default DropdownExample;