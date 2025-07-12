import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import { router, useNavigation } from 'expo-router';
import { isDesktopWeb } from '@/utils/deviceInfo';

interface SimpleHeaderProps {
    title: string;
    onBackPress: () => void;
    iconType?: 'keyboard-backspace' | 'arrow-back';
    rightComponent?: React.ReactNode;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
    title,
    onBackPress,
    iconType = 'arrow-back',
    rightComponent
}) => {
    const navigation = useNavigation();
    const canGoBack = () => {
        // This checks if there's actually a screen to go back to in the navigation stack
        return navigation.canGoBack();
    };

    function goBackWeb() {
        window.history.back();
    }

    const handleGoBack = () => {
        if (canGoBack()) {
            onBackPress()
        } else {
            if (Platform.OS === 'web') {
                goBackWeb();
            } else {
                onBackPress()
            }
        }
    };

    const isDesktop = isDesktopWeb();

    return (
        <View style={[styles.header, isDesktop && styles.headerDesktop]}>
            {!isDesktop && (
                <TouchableOpacity style={[styles.backButton]} onPress={handleGoBack}>
                    <SvgXml xml={ImagePath.SvgIcons.LeftArrow} />
                </TouchableOpacity>
            )}
            <MyText fontFamily="Poppins" numberOfLines={1} style={[styles.title, isDesktop && styles.titleDesktop]}>{title}</MyText>
            {rightComponent ? rightComponent : <View style={[styles.emptySpace, isDesktop && styles.emptySpaceDesktop]} />}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        // backgroundColor: myColors.screenBackgroundColor,
        // borderBottomWidth: 1,
        // borderBottomColor: myColors.baseColors.lightGray1,

    },
    headerDesktop: {
        paddingHorizontal: 30,
        paddingVertical: 25,
        justifyContent: 'flex-start',
    },
    backButton: {
        // height: 46,
        // width: 46,
        // borderRadius: 30,
        height: 46,
        width: 46,
        borderRadius: 30,
        marginRight: 15,
        // backgroundColor: myColors.white,
        alignItems: "center",
        justifyContent: "center",
        // ...myStyles.shadow
    },
    backButtonDesktop: {
        height: 64,
        width: 64,
        borderRadius: 32,
        marginRight: 25,
    },
    title: {
        // fontSize: 24,
        fontSize: 14,
        // fontWeight: '600',
    },
    titleDesktop: {
        fontSize: 24,
        fontWeight: '600',
        marginLeft: 0,
    },
    emptySpace: {
        width: 56, // To balance the header

    },
    emptySpaceDesktop: {
        width: 89, // Larger to balance the bigger back button
    },
});

export default SimpleHeader;