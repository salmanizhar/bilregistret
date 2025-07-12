import { StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import Tooltip from 'react-native-walkthrough-tooltip';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';
import { SvgXml } from 'react-native-svg';
import { ImagePath } from '@/assets/images';
import { IconClose, IconSearch } from '@/assets/icons';

type Props = {}

const ProductSearchBar: React.FC<{
    placeholder: string | undefined;
    value: string;
    onChangeText: (text: string) => void;
    style?: any;
    isFilterVisible?: boolean;
    filterOnPress?: () => void;
}> = ({ placeholder, value, onChangeText, style, isFilterVisible = false, filterOnPress }) => {
    const [toolTipVisible, setToolTipVisible] = useState(false);
    return (
        <View style={[{
            // marginBottom: 15,
            marginRight: 5,
            flex: 1,

        }, style]}>
            <View style={styles.inputContainer}>
                {/* <Ionicons name="search" size={22} color={myColors.text.secondary} style={{ marginRight: 10 }} /> */}
                <IconSearch
                    color={myColors.text.primary}
                    size={20}
                    style={{ marginRight: 10 }}
                />
                <TextInput
                    style={{
                        flex: 1,
                        height: '100%',
                        fontSize: 13,
                        fontWeight: 'bold',
                        color: myColors.text.primary,
                        outlineWidth: 0,
                    } as any}
                    value={value}
                    onChangeText={onChangeText}
                    placeholderTextColor={myColors.text.secondary}
                    placeholder={placeholder}
                />
                {value.length > 0 && (
                    <TouchableOpacity onPress={() => onChangeText('')}>
                        {/* <Ionicons name="close-circle" size={18} color={myColors.text.secondary} /> */}
                        <IconClose
                            color={myColors.text.primary}
                            size={18}
                        />
                    </TouchableOpacity>
                )}
                {isFilterVisible &&
                    <Tooltip
                        isVisible={toolTipVisible}
                        content={<MyText>Dölj filter</MyText>}
                        placement="top"
                        onClose={() => { setToolTipVisible(false) }}
                    >
                        <TouchableOpacity onPress={() => { filterOnPress && filterOnPress() }}>
                            <SvgXml xml={ImagePath.SvgIcons.FilterIcon} />
                        </TouchableOpacity>
                    </Tooltip>
                }
            </View>
        </View>
    );
};

export default ProductSearchBar

const styles = StyleSheet.create({
    inputContainer: {
        // flexDirection: 'row',
        // alignItems: 'center',
        // backgroundColor: myColors.white,
        // borderRadius: 12,
        // paddingHorizontal: 15,
        // height: 52,
        // borderWidth: 1,
        // borderColor: myColors.primary.light3,
        // width: Platform.select({
        //     web: '100%',
        //     default: '100%'

        // }),
        // alignSelf: 'center',

        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: myColors.white,
        borderWidth: 1,
        // borderColor: myColors.primary.light3,
        borderColor: myColors.border.default,
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 45, // Match ProductSection header height
        width: Platform.select({
            web: '100%',
            default: '100%'

        }),
    },

})