import { Platform, ViewStyle, TextStyle } from 'react-native';

interface ShadowProps {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
}

interface TextShadowProps {
  textShadowColor?: string;
  textShadowOffset?: { width: number; height: number };
  textShadowRadius?: number;
}

/**
 * Helper to determine if native driver should be used
 * Returns false on web to prevent warnings, true on native platforms
 */
export const shouldUseNativeDriver = (): boolean => {
  return Platform.OS !== 'web';
};

/**
 * Converts React Native shadow props to web-compatible boxShadow
 * Automatically returns the correct format for each platform
 */
export const createBoxShadow = (props: ShadowProps): Partial<ViewStyle> => {
  const { shadowColor, shadowOffset, shadowOpacity, shadowRadius } = props;

  if (Platform.OS === 'web') {
    if (!shadowColor || shadowOpacity === 0) {
      return {};
    }

    const offsetX = shadowOffset?.width || 0;
    const offsetY = shadowOffset?.height || 0;
    const blur = shadowRadius || 0;
    const opacity = shadowOpacity || 1;

    // Convert shadowColor to rgba if it's a hex color
    let color = shadowColor;
    if (shadowColor.startsWith('#') && opacity < 1) {
      const r = parseInt(shadowColor.slice(1, 3), 16);
      const g = parseInt(shadowColor.slice(3, 5), 16);
      const b = parseInt(shadowColor.slice(5, 7), 16);
      color = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else if (shadowColor.startsWith('rgba') || shadowColor.startsWith('rgb')) {
      // If already rgba/rgb, adjust opacity if needed
      if (opacity < 1 && !shadowColor.includes('rgba')) {
        color = shadowColor.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
      }
    }

    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${color}`,
    } as Partial<ViewStyle>;
  }

  // For native platforms, return original shadow props
  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
  };
};

/**
 * Converts React Native textShadow props to web-compatible textShadow
 */
export const createTextShadow = (props: TextShadowProps): Partial<TextStyle> => {
  const { textShadowColor, textShadowOffset, textShadowRadius } = props;

  if (Platform.OS === 'web') {
    if (!textShadowColor) {
      return {};
    }

    const offsetX = textShadowOffset?.width || 0;
    const offsetY = textShadowOffset?.height || 0;
    const blur = textShadowRadius || 0;

    return {
      textShadow: `${offsetX}px ${offsetY}px ${blur}px ${textShadowColor}`,
    } as Partial<TextStyle>;
  }

  // For native platforms, return original textShadow props
  return {
    textShadowColor,
    textShadowOffset,
    textShadowRadius,
  };
};

/**
 * Helper to apply web-safe outline styles
 * Returns appropriate styles for each platform
 */
export const createWebStyles = (webStyles: Record<string, any> = {}): any => {
  if (Platform.OS === 'web') {
    return webStyles;
  }
  return {};
};

/**
 * Helper to remove outline styles for React Native compatibility
 * @deprecated Use createWebStyles instead for better type safety
 */
export const removeOutline = (styles: any): any => {
  const { outline, ...rest } = styles;
  return Platform.OS === 'web' ? { ...rest, outline: 'none' } : rest;
};