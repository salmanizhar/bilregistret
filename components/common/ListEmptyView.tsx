import React from 'react';
import { View, StyleSheet } from 'react-native';
import MyText from './MyText';
import { myColors } from '@/constants/MyColors';

interface ListEmptyViewProps {
    message: string;
}

const ListEmptyView: React.FC<ListEmptyViewProps> = ({ message }) => {
    return (
        <View style={styles.container}>
            <MyText fontFamily='Poppins' style={styles.message}>{message}</MyText>
        </View>
    );
};

export default ListEmptyView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        fontSize: 16,
        color: myColors.text.secondary,
    },
});