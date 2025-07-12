import { MYSCREEN } from '@/constants/Dimentions';
import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';

interface CustomProgressBarProps {
    primaryProgress?: number;   // Blue section (as percentage)
    secondaryProgress?: number; // Light blue section (as percentage)
    height?: number;
    borderRadius?: number;
    primaryColor?: string;      // Blue color
    secondaryColor?: string;    // Light blue
    stripeColor?: string;       // Stripe color
    backgroundColor?: string;
    stripeWidth?: number;
    stripeGap?: number;
    stripeAngle?: number;
}

const CustomProgressBar: React.FC<CustomProgressBarProps> = ({
    primaryProgress = 25,   // Blue section (as percentage)
    secondaryProgress = 25, // Light blue section (as percentage)
    height = 40,
    borderRadius = 13,
    primaryColor = '#4169E1',  // Blue color
    secondaryColor = '#E5F0FF', // Light blue
    stripeColor = '#E0E0E0',  // Stripe color
    backgroundColor = 'transparent',
    stripeWidth = 3,
    stripeGap = MYSCREEN.WIDTH / 50, //8,
    stripeAngle = 45,
}) => {

    // Calculate widths based on percentages
    const primaryWidth = `${primaryProgress}%` as DimensionValue;
    const secondaryWidth = `${secondaryProgress}%` as DimensionValue;
    const remainingWidth = `${100 - primaryProgress - secondaryProgress}%` as DimensionValue;

    // Create the striped section
    const renderStripes = () => {
        // Calculate how many stripes we need based on container width
        // This is an approximation - we'll generate more than needed to ensure coverage
        const numberOfStripes = 50;

        return (
            <View style={[styles.stripedContainer, { height }]}>
                {Array(numberOfStripes).fill(0).map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.stripe,
                            {
                                backgroundColor: stripeColor,
                                width: stripeWidth,
                                marginRight: stripeGap,
                                transform: [{ rotate: `${stripeAngle}deg` }],
                                height: height * 2,  // Make stripe longer to account for angle
                            }
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={[styles.container, { height, backgroundColor }]}>
            {/* Primary progress (blue) */}
            {primaryProgress > 0 && (
                <View
                    style={[
                        styles.section,
                        {
                            width: primaryWidth,
                            backgroundColor: primaryColor,
                            // borderTopLeftRadius: borderRadius,
                            // borderBottomLeftRadius: borderRadius,
                        }
                    ]}
                />
            )}

            {/* Secondary progress (light blue) */}
            {secondaryProgress > 0 && (
                <View
                    style={[
                        styles.section,
                        {
                            width: secondaryWidth,
                            backgroundColor: secondaryColor,
                            // borderTopLeftRadius: primaryProgress === 0 ? borderRadius : 0,
                            // borderBottomLeftRadius: primaryProgress === 0 ? borderRadius : 0,
                        }
                    ]}
                />
            )}

            {/* Remaining section with stripes */}
            {primaryProgress + secondaryProgress < 100 && (
                <View
                    style={[
                        styles.stripedSection,
                        {
                            width: remainingWidth,
                            borderTopRightRadius: borderRadius,
                            borderBottomRightRadius: borderRadius,
                        }
                    ]}
                >
                    {renderStripes()}
                </View>
            )}
        </View>
    );
};

interface Styles {
    container: ViewStyle;
    section: ViewStyle;
    stripedSection: ViewStyle;
    stripedContainer: ViewStyle;
    stripe: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
    container: {
        width: '100%',
        flexDirection: 'row',
        overflow: 'hidden',
    },
    section: {
        height: '100%',
        marginRight: 5,
        borderRadius: 13
    },
    stripedSection: {
        height: '100%',
        overflow: 'hidden',
        borderRadius: 13
    },
    stripedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        left: -5, // Slight offset to align stripes nicely
        right: 0,
        top: 0,
        bottom: 0,
    },
    stripe: {
        position: 'relative',
        top: -10, // Adjust to ensure stripes fill the area
    },
});

export default CustomProgressBar;