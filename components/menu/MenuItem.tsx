import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View, TextStyle } from 'react-native';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';
import { Feather } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import moment from 'moment';

interface MenuItemProps {
    icon: string | ReactNode;
    title: string;
    onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    title,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
        // activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                {typeof icon === 'string' ? (
                    <SvgXml xml={icon} />
                ) : (
                    icon
                )}
            </View>
            <MyText style={styles.menuText}>
                {title}
            </MyText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 16,
    },
    iconContainer: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    menuText: {
        fontSize: 16,
        color: myColors.black,
    } as TextStyle,
});

export default MenuItem;