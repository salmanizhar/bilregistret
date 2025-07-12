import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MyText from './common/MyText';

interface ReadMoreTextProps {
    text: string;
    maxLength: number;
    readMoreText?: string;
    readMoreStyle?: object;
    textStyle?: object;
    onReadMorePressed?: () => void;
}

const ReadMoreText = ({
    text,
    maxLength,
    readMoreText = 'Läs mer',
    readMoreStyle,
    textStyle,
    onReadMorePressed,
}: ReadMoreTextProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) return null;

    // Check if the text needs truncation
    const needsTruncation = text.length > maxLength;

    // If no truncation needed, just return the text
    if (!needsTruncation) {
        return <MyText style={textStyle}>{text}</MyText>;
    }

    const handleReadMore = () => {
        if (onReadMorePressed) {
            onReadMorePressed();
        } else {
            setIsExpanded(!isExpanded);
        }
    };

    // If expanded, show full text
    if (isExpanded) {
        return (
            <View>
                <MyText style={textStyle}>
                    {text}{' '}
                    <Text style={{ ...styles.readMoreText, ...(readMoreStyle as object) }} onPress={handleReadMore}>
                        Visa mindre
                    </Text>
                </MyText>
            </View>
        );
    }

    // Display truncated text with read more option
    const truncatedText = text.substring(0, maxLength) + '...';

    return (
        <View>
            <MyText style={textStyle}>
                {truncatedText}{' '}
                <Text style={{ ...styles.readMoreText, ...(readMoreStyle as object) }} onPress={handleReadMore}>
                    {readMoreText}
                </Text>
            </MyText>
        </View>
    );
};

const styles = StyleSheet.create({
    readMoreText: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
});

export default ReadMoreText;