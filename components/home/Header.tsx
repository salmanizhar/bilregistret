import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';

interface HeaderProps {
    onMenuPress: () => void;
    onProfilePress: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuPress, onProfilePress }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
                <MaterialCommunityIcons name="menu" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
                <MaterialCommunityIcons name="triangle" size={40} color="white" style={{ transform: [{ rotate: '180deg' }] }} />
                <MyText style={styles.logoText}>bilregistret</MyText>
            </View>

            <TouchableOpacity onPress={onProfilePress} style={styles.iconButton}>
                <FontAwesome name="user-circle" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: myColors.primary.main,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 4,
    }
});

export default Header;