import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { myColors } from '@/constants/MyColors';

interface MyTextProps extends TextProps {
    children: React.ReactNode;
    color?: string;
    fontFamily?: string;
    uppercase?: boolean;
    align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    fontSize?: number;
    style?: TextStyle | (TextStyle | undefined | false)[];
}

const MyText: React.FC<MyTextProps> = ({
    children,
    color = myColors.black,
    fontFamily,
    uppercase = false,
    align = 'auto',
    fontSize,
    style,
    ...props
}) => {

    // Determine which font to use
    const defaultFont = fontFamily === 'Poppins' ? 'Poppins' : 'Inter';

    // Build the style object
    const customStylesArray = Array.isArray(style) ? style : [style];
    // Filter out any falsy values (undefined, false) from style array
    const filteredCustomStyles = customStylesArray.filter(Boolean) as TextStyle[];

    const textStyles: (TextStyle | undefined | false)[] = [
        {
            color,
            textAlign: align,
            fontFamily: fontFamily || defaultFont,
            ...(fontSize && { fontSize }),
            ...(uppercase && { textTransform: 'uppercase' as const }),
        },
        ...filteredCustomStyles, // Allow custom styles to override defaults
    ];

    return (
        <Text style={textStyles} {...props}>
            {children}
        </Text>
    );
};

export default MyText;