import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, PanResponder, Animated, LayoutChangeEvent, TouchableWithoutFeedback, GestureResponderEvent, PanResponderGestureState, Platform, NativeSyntheticEvent } from 'react-native';
import { myColors } from '@/constants/MyColors';
import MyText from './MyText';

interface YearRangeSliderProps {
    minValue: number;
    maxValue: number;
    initialMinValue: number;
    initialMaxValue: number;
    onValueChange?: (minValue: number, maxValue: number) => void;
}

const YearRangeSlider: React.FC<YearRangeSliderProps> = ({
    minValue,
    maxValue,
    initialMinValue,
    initialMaxValue,
    onValueChange,
}) => {
    // Container width
    const [containerWidth, setContainerWidth] = useState(0);

    // Animated values for thumb positions
    const leftThumbAnim = useRef(new Animated.Value(0)).current;
    const rightThumbAnim = useRef(new Animated.Value(0)).current;

    // Animated values for display
    const leftDisplayValue = useRef(new Animated.Value(initialMinValue)).current;
    const rightDisplayValue = useRef(new Animated.Value(initialMaxValue)).current;

    // Continuous tracking of real values (not rounded)
    const leftValueRef = useRef(initialMinValue);
    const rightValueRef = useRef(initialMaxValue);

    // Refs to track current position values for bar visualization
    const leftPositionRef = useRef(0);
    const rightPositionRef = useRef(0);

    // Track active thumb for visual feedback
    const [activeThumb, setActiveThumb] = useState<'left' | 'right' | null>(null);

    // Set up position listeners
    useEffect(() => {
        // Keep references to animated values for cleanup
        const leftThumbRef = leftThumbAnim;
        const rightThumbRef = rightThumbAnim;
        const leftDisplayRef = leftDisplayValue;
        const rightDisplayRef = rightDisplayValue;

        // Set up position listeners
        const leftListener = leftThumbAnim.addListener(({ value }) => {
            leftPositionRef.current = value;
        });

        const rightListener = rightThumbAnim.addListener(({ value }) => {
            rightPositionRef.current = value;
        });

        return () => {
            // Clean up listeners
            leftThumbRef.removeListener(leftListener);
            rightThumbRef.removeListener(rightListener);

            // Reset animation values
            leftThumbRef.setValue(0);
            rightThumbRef.setValue(0);
            leftDisplayRef.setValue(initialMinValue);
            rightDisplayRef.setValue(initialMaxValue);

            // Reset refs
            leftPositionRef.current = 0;
            rightPositionRef.current = 0;

            // Reset active thumb
            setActiveThumb(null);
        };
    }, []);

    // Convert continuous value to position (linear interpolation)
    const valueToPosition = (value: number): number => {
        if (containerWidth === 0) return 0;
        return ((value - minValue) / (maxValue - minValue)) * containerWidth;
    };

    // Convert position to continuous value (linear interpolation)
    const positionToValue = (position: number): number => {
        if (containerWidth === 0) return minValue;
        const rawValue = minValue + ((position / containerWidth) * (maxValue - minValue));
        return rawValue; // No rounding for smooth sliding
    };

    // Get rounded value for display only
    const getRoundedValue = (value: number): number => {
        return Math.round(value);
    };

    // Initialize positions when container width is known
    useEffect(() => {
        if (containerWidth > 0) {
            const leftPos = valueToPosition(initialMinValue);
            const rightPos = valueToPosition(initialMaxValue);

            leftThumbAnim.setValue(leftPos);
            rightThumbAnim.setValue(rightPos);
            leftDisplayValue.setValue(initialMinValue);
            rightDisplayValue.setValue(initialMaxValue);

            leftValueRef.current = initialMinValue;
            rightValueRef.current = initialMaxValue;
        }
    }, [containerWidth, initialMinValue, initialMaxValue]);

    // Function to smoothly animate a thumb to a position
    const animateThumb = (
        thumbAnim: Animated.Value,
        position: number,
        displayAnim: Animated.Value,
        value: number,
        callback?: () => void
    ) => {
        Animated.parallel([
            Animated.spring(thumbAnim, {
                toValue: position,
                tension: 80, // Lower tension for more elasticity
                friction: 10, // Higher friction for smoother motion
                useNativeDriver: true,
            }),
            Animated.spring(displayAnim, {
                toValue: value,
                tension: 80,
                friction: 10,
                useNativeDriver: true,
            })
        ]).start(callback);
    };

    // Function to determine which thumb to move when tapping on track
    const getCloserThumb = (tapPosition: number): 'left' | 'right' => {
        const leftPos = leftPositionRef.current;
        const rightPos = rightPositionRef.current;

        const distToLeft = Math.abs(tapPosition - leftPos);
        const distToRight = Math.abs(tapPosition - rightPos);

        return distToLeft <= distToRight ? 'left' : 'right';
    };

    // Handle track press to move the closer thumb
    const handleTrackPress = (event: GestureResponderEvent) => {
        if (containerWidth === 0) return;

        const tapPosition = event.nativeEvent.locationX;
        const thumbToMove = getCloserThumb(tapPosition);
        setActiveThumb(thumbToMove);

        let finalPosition = tapPosition;
        let finalValue = positionToValue(finalPosition);

        if (thumbToMove === 'left') {
            const rightPos = rightPositionRef.current;
            const maxBound = Math.max(0, rightPos - 30);
            finalPosition = Math.min(Math.max(0, tapPosition), maxBound);
            finalValue = positionToValue(finalPosition);

            leftValueRef.current = finalValue;
            animateThumb(leftThumbAnim, finalPosition, leftDisplayValue, finalValue, () => {
                setActiveThumb(null);
                notifyValueChange();
            });
        } else {
            const leftPos = leftPositionRef.current;
            const minBound = Math.min(containerWidth, leftPos + 30);
            finalPosition = Math.max(Math.min(containerWidth, tapPosition), minBound);
            finalValue = positionToValue(finalPosition);

            rightValueRef.current = finalValue;
            animateThumb(rightThumbAnim, finalPosition, rightDisplayValue, finalValue, () => {
                setActiveThumb(null);
                notifyValueChange();
            });
        }
    };

    // Notify parent of value changes with rounded values
    const notifyValueChange = () => {
        if (onValueChange) {
            const roundedLeft = getRoundedValue(leftValueRef.current);
            const roundedRight = getRoundedValue(rightValueRef.current);
            onValueChange(roundedLeft, roundedRight);
        }
    };

    // Left thumb pan handler with manual gesture handling instead of Animated.event
    const leftPanResponder = useMemo(() => {
        // Keep track of cumulative dx values within the gesture cycle
        let cumulativeDx = 0;
        let startPosition = 0;

        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) =>
                Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
            onPanResponderGrant: () => {
                // Remember the starting position
                startPosition = leftPositionRef.current;
                cumulativeDx = 0;
                leftThumbAnim.stopAnimation();
                setActiveThumb('left');

                // Set offset for smooth drag start
                leftThumbAnim.setOffset(startPosition);
                leftThumbAnim.setValue(0);
            },
            onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
                // Calculate new position directly from the gesture dx
                const newPosition = gestureState.dx;
                const rightPos = rightPositionRef.current;

                // Direct value setting with minimal processing
                leftThumbAnim.setValue(newPosition);

                // Calculate the actual position (offset + value)
                const actualPosition = startPosition + newPosition;

                // Ensure we don't cross the right thumb (minimum gap of 30px)
                const minDistance = 30;
                const maxAllowedPosition = rightPos - minDistance;

                // Only update value ref if within constraints
                if (actualPosition >= 0 && actualPosition <= maxAllowedPosition) {
                    const value = positionToValue(actualPosition);
                    leftValueRef.current = value;
                    leftDisplayValue.setValue(value);
                } else if (actualPosition > maxAllowedPosition) {
                    // If trying to move beyond the right thumb, clamp to the max allowed position
                    leftThumbAnim.setValue(maxAllowedPosition - startPosition);
                    const value = positionToValue(maxAllowedPosition);
                    leftValueRef.current = value;
                    leftDisplayValue.setValue(value);
                }
            },
            onPanResponderRelease: () => {
                // Apply offset and reset value for clean state
                leftThumbAnim.flattenOffset();

                // Ensure we're within boundaries
                const currentPosition = leftPositionRef.current;
                const rightPos = rightPositionRef.current;

                if (currentPosition < 0) {
                    animateThumb(leftThumbAnim, 0, leftDisplayValue, minValue);
                    leftValueRef.current = minValue;
                } else if (currentPosition > rightPos - 30) {
                    const maxLeftPos = rightPos - 30;
                    const adjustedValue = positionToValue(maxLeftPos);
                    animateThumb(leftThumbAnim, maxLeftPos, leftDisplayValue, adjustedValue);
                    leftValueRef.current = adjustedValue;
                }

                setActiveThumb(null);
                notifyValueChange();
            }
        });
    }, [containerWidth]);

    // Right thumb pan handler with manual gesture handling
    const rightPanResponder = useMemo(() => {
        let startPosition = 0;

        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) =>
                Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
            onPanResponderGrant: () => {
                // Remember the starting position
                startPosition = rightPositionRef.current;
                rightThumbAnim.stopAnimation();
                setActiveThumb('right');

                // Set offset for smooth drag start
                rightThumbAnim.setOffset(startPosition);
                rightThumbAnim.setValue(0);
            },
            onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
                // Calculate new position directly from the gesture dx
                const newPosition = gestureState.dx;
                const leftPos = leftPositionRef.current;

                // Direct value setting with minimal processing
                rightThumbAnim.setValue(newPosition);

                // Calculate the actual position (offset + value)
                const actualPosition = startPosition + newPosition;

                // Ensure we don't cross the left thumb (minimum gap of 30px)
                const minDistance = 30;
                const minAllowedPosition = leftPos + minDistance;

                // Only update value ref if within constraints
                if (actualPosition >= minAllowedPosition && actualPosition <= containerWidth) {
                    const value = positionToValue(actualPosition);
                    rightValueRef.current = value;
                    rightDisplayValue.setValue(value);
                } else if (actualPosition < minAllowedPosition) {
                    // If trying to move beyond the left thumb, clamp to the min allowed position
                    rightThumbAnim.setValue(minAllowedPosition - startPosition);
                    const value = positionToValue(minAllowedPosition);
                    rightValueRef.current = value;
                    rightDisplayValue.setValue(value);
                }
            },
            onPanResponderRelease: () => {
                // Apply offset and reset value for clean state
                rightThumbAnim.flattenOffset();

                // Ensure we're within boundaries
                const currentPosition = rightPositionRef.current;
                const leftPos = leftPositionRef.current;

                if (currentPosition > containerWidth) {
                    animateThumb(rightThumbAnim, containerWidth, rightDisplayValue, maxValue);
                    rightValueRef.current = maxValue;
                } else if (currentPosition < leftPos + 30) {
                    const minRightPos = leftPos + 30;
                    const adjustedValue = positionToValue(minRightPos);
                    animateThumb(rightThumbAnim, minRightPos, rightDisplayValue, adjustedValue);
                    rightValueRef.current = adjustedValue;
                }

                setActiveThumb(null);
                notifyValueChange();
            }
        });
    }, [containerWidth]);

    // Handle layout to get container width
    const handleLayout = (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
    };

    // Create a renderBars function that doesn't rely on hooks
    const renderBars = () => {
        if (containerWidth === 0) return null;

        const segments = [];
        const segmentCount = 50; // More segments for smoother look
        const segmentWidth = containerWidth / segmentCount;

        // Blue transition point (approximately 70% of the way)
        const blueTransitionPoint = Math.floor(segmentCount * 0.7);

        for (let i = 0; i < segmentCount; i++) {
            // Calculate height based on position in the slider
            let height;

            if (i < 5) {
                // Very small bars at the start
                height = 2 + i * 0.5;
            } else if (i < blueTransitionPoint) {
                // Medium bars with some variation in the middle (gray section)
                const position = (i - 5) / (blueTransitionPoint - 5);
                height = 7 + Math.sin(position * Math.PI) * 15;
            } else {
                // Taller bars at the end (blue section)
                height = 20 + Math.sin((i - blueTransitionPoint) * 0.5) * 5;
            }

            const xPosition = i * segmentWidth;

            // Determine if the segment is within selected range
            const leftPos = leftPositionRef.current;
            const rightPos = rightPositionRef.current;
            const isSelected = xPosition >= leftPos && xPosition <= rightPos;

            // Determine color based on position and selection
            let color;
            if (i >= blueTransitionPoint) {
                // Blue section
                color = isSelected ? myColors.primary.main : myColors.primary.light3;
            } else {
                // Gray section
                color = isSelected ? myColors.primary.main : '#e6e6e6';
            }

            segments.push(
                <View
                    key={i}
                    style={{
                        position: 'absolute',
                        left: xPosition,
                        bottom: 0,
                        width: Math.max(1, segmentWidth - 1),
                        height,
                        backgroundColor: color,
                        borderTopLeftRadius: 1,
                        borderTopRightRadius: 1,
                    }}
                />
            );
        }

        return segments;
    };

    // Get the values as strings for display
    const [leftValueText, setLeftValueText] = useState(initialMinValue.toString());
    const [rightValueText, setRightValueText] = useState(initialMaxValue.toString());

    // Update the display text when values change
    useEffect(() => {
        const leftListener = leftDisplayValue.addListener(({ value }) => {
            setLeftValueText(Math.round(value).toString());
        });

        const rightListener = rightDisplayValue.addListener(({ value }) => {
            setRightValueText(Math.round(value).toString());
        });

        return () => {
            leftDisplayValue.removeListener(leftListener);
            rightDisplayValue.removeListener(rightListener);
        };
    }, []);

    // Safe callback handlers that don't cause re-renders
    const leftPanHandlers = leftPanResponder.panHandlers;
    const rightPanHandlers = rightPanResponder.panHandlers;

    // Add a master cleanup effect
    useEffect(() => {
        return () => {
            // Final cleanup when component unmounts
            setLeftValueText(initialMinValue.toString());
            setRightValueText(initialMaxValue.toString());
            leftValueRef.current = initialMinValue;
            rightValueRef.current = initialMaxValue;
        };
    }, []);

    return (
        <View style={styles.container}>
            {/* Slider container */}
            <View style={styles.sliderContainer} onLayout={handleLayout}>
                {/* Track touchable area */}
                {/* handleTrackPress */}
                <TouchableWithoutFeedback onPress={() => { }}>
                    <View style={styles.trackTouchArea}>
                        {/* Bar visualization */}
                        <View style={styles.barsContainer}>
                            {renderBars()}
                        </View>
                    </View>
                </TouchableWithoutFeedback>

                {/* Selected range overlay */}
                <Animated.View
                    style={[
                        styles.selectedRange,
                        {
                            left: leftThumbAnim,
                            width: Animated.subtract(rightThumbAnim, leftThumbAnim),
                            transform: [{ translateX: 0 }] // Force hardware acceleration
                        }
                    ]}
                />

                {/* Thumbs */}
                <Animated.View
                    style={[
                        styles.thumb,
                        styles.leftThumb,
                        activeThumb === 'left' && styles.activeThumb,
                        {
                            transform: [
                                { translateX: leftThumbAnim },
                                { scale: activeThumb === 'left' ? 1.1 : 1 }
                            ]
                        }
                    ]}
                    {...leftPanHandlers}
                />

                <Animated.View
                    style={[
                        styles.thumb,
                        styles.rightThumb,
                        activeThumb === 'right' && styles.activeThumb,
                        {
                            transform: [
                                { translateX: rightThumbAnim },
                                { scale: activeThumb === 'right' ? 1.1 : 1 }
                            ]
                        }
                    ]}
                    {...rightPanHandlers}
                />
            </View>

            {/* Year labels */}
            <View style={styles.labelsContainer}>
                <MyText style={styles.labelText}>{leftValueText}</MyText>
                <MyText style={styles.labelText}>{rightValueText}</MyText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 10,
    },
    sliderContainer: {
        height: 40,
        width: '100%',
        justifyContent: 'center',
        position: 'relative',
    },
    trackTouchArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    barsContainer: {
        height: 30,
        width: '100%',
        position: 'relative',
    },
    selectedRange: {
        position: 'absolute',
        height: 4,
        backgroundColor: 'transparent',
        top: 18,
        zIndex: 1,
    },
    thumb: {
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: myColors.primary.main,
        top: 6,
        marginLeft: -14, // Center thumb on position
        zIndex: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            }
        }),
    },
    leftThumb: {
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    },
    rightThumb: {
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    activeThumb: {
        borderColor: myColors.primary.dark1,
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    labelText: {
        fontSize: 14,
        color: myColors.text.primary,
        fontWeight: 'bold',
    },
});

export default YearRangeSlider;