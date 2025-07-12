import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import MyText from './MyText';
import { myColors } from '@/constants/MyColors';

interface PackageCardProps {
    packageName: string;
    description: string;
    icon: string;
    price: string;
    period?: string;
    containerStyle?: ViewStyle;
}

interface Styles {
    packageCard: ViewStyle;
    packageHeader: ViewStyle;
    packageHeaderTextContainer: ViewStyle;
    packageTitle: TextStyle;
    packageDescription: TextStyle;
    iconContainer: ViewStyle;
    priceContainer: ViewStyle;
    priceValue: TextStyle;
    perMonth: TextStyle;
}

const PackageCard: React.FC<PackageCardProps> = ({
    packageName,
    description,
    icon,
    price,
    period = '/månad',
    containerStyle,
}) => {
    return (
        <View style={[styles.packageCard, containerStyle]}>
            <View style={styles.packageHeader}>
                <View style={styles.packageHeaderTextContainer}>
                    <MyText fontFamily='Poppins' style={styles.packageTitle}>{packageName}</MyText>
                    <MyText style={styles.packageDescription}>
                        {description}
                    </MyText>
                </View>
                <View style={styles.iconContainer}>
                    <SvgXml xml={icon} />
                </View>
            </View>

            <View style={styles.priceContainer}>
                <MyText style={styles.priceValue}>{price}</MyText>
                {period && <MyText style={styles.perMonth}>{period}</MyText>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create<Styles>({
    packageCard: {
        backgroundColor: myColors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    packageHeaderTextContainer: {
        width: "78%",
    },
    packageTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: myColors.text.primary,
        marginBottom: 5,
    },
    packageDescription: {
        fontSize: 14,
        color: myColors.baseColors.light2,
        lineHeight: 20,
        maxWidth: '90%',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: myColors.screenBackgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 15,
    },
    priceValue: {
        fontSize: 36,
        color: myColors.text.primary,
    },
    perMonth: {
        fontSize: 12,
        color: myColors.baseColors.light2,
        marginLeft: 5,
    },
});

export default PackageCard;