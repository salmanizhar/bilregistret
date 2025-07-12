import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { myColors } from '@/constants/MyColors';
import MyText from '@/components/common/MyText';

interface SectionHeaderProps {
    title: string;
    hasViewAll?: boolean;
    viewAllLabel?: string;
    onViewAllPress?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    hasViewAll = false,
    viewAllLabel = 'All Blogg',
    onViewAllPress,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <View style={styles.indicator} />
                <MyText style={styles.title}>{title}</MyText>
            </View>

            {hasViewAll && (
                <TouchableOpacity
                    onPress={onViewAllPress}
                    style={styles.viewAllButton}
                >
                    <MyText style={styles.viewAllText}>{viewAllLabel}</MyText>
                    <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={myColors.primary.main}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indicator: {
        width: 4,
        height: 20,
        backgroundColor: myColors.primary.main,
        borderRadius: 2,
        marginRight: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: myColors.text.primary,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: 14,
        color: myColors.primary.main,
        fontWeight: '500',
    },
    icon: {
        marginLeft: 2,
    }
});

export default SectionHeader;