# 🖥️ Desktop Conversion Guide

This document explains **how to introduce desktop-specific layout behaviour** to the Bilregistret App so another AI model (or developer) can replicate the pattern consistently.

## 1. Key Constant

```ts
// constants/commonConst.ts
export const desktopWebViewport = 1280; // <-- single source of truth for desktop width
```

* Always reference **`desktopWebViewport`** instead of `Dimensions.get('window').width` when you need the _maximum_ content width **on desktop web only**.
* On mobile / tablets / native, keep using the real viewport width.

```ts
import { Dimensions } from 'react-native';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { desktopWebViewport } from '@/constants/commonConst';

const screenWidth = isDesktopWeb() ? desktopWebViewport : Dimensions.get('window').width;
```

## 2. Platform Helper

```ts
// utils/deviceInfo.ts
export const isDesktopWeb = () =>
  Device.deviceType === Device.DeviceType.DESKTOP && Platform.OS === 'web';
```

Use `isDesktopWeb()` to gate all desktop-only logic.

## 3. DesktopViewWrapper Component

Purpose: **centres content and caps its width** so mobile screens scale gracefully on wide desktop monitors.

```tsx
// components/common/DesktopViewWrapper.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { isDesktopWeb } from '@/utils/deviceInfo';
import { desktopWebViewport } from '@/constants/commonConst';

interface Props { children: React.ReactNode }

const DesktopViewWrapper: React.FC<Props> = ({ children }) => {
  if (!isDesktopWeb()) return <>{children}</>; // mobile / native – no changes

  return (
    <View style={styles.desktopContainer}>
      <View style={styles.desktopContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  desktopContainer: { alignItems: 'center', width: '100%' },
  desktopContent: { width: '100%', maxWidth: desktopWebViewport },
});

export default DesktopViewWrapper;
```

### Usage Example

```tsx
<DesktopViewWrapper>
  <SearchBar />
  <CategoryList ... />
  <BlogList />
</DesktopViewWrapper>
```

## 4. FooterWrapper Component

`FooterWrapper` wraps screen content in a `ScrollView` **and appends the large desktop footer** when running on web-desktop.

```tsx
// components/common/ScreenWrapper.tsx
export default function FooterWrapper({ children, ...scrollViewProps }) {
  if (isDesktopWeb()) {
    return (
      <ScrollView {...scrollViewProps} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 0 }}>
        {children}
        <WebWideFooter /> {/* huge footer visible only on desktop */}
      </ScrollView>
    );
  }

  return (
    <ScrollView {...scrollViewProps} style={{ flex: 1 }}>
      {children}
    </ScrollView>
  );
}
```

`WebWideFooter` contains fixed, wide-screen only UI (newsletter, links, etc.).

## 5. Refactoring Existing Components

1. **Replace direct viewport width usage** (`Dimensions.get('window').width`, `useWindowDimensions()`, etc.) _when the width is used as a **layout anchor**_.
2. Compute width conditionally:

```ts
const windowWidth = Dimensions.get('window').width;
const layoutWidth = isDesktopWeb() ? desktopWebViewport : windowWidth;
```
3. Feed `layoutWidth` to `Carousel`, `FlatList`, card containers, etc.
4. Keep heights, paddings, and flex properties unchanged unless they also depend on width.

### Typical Patterns

| Before (mobile-centric) | After (desktop-aware) |
| ----------------------- | --------------------- |
| `const CARD_WIDTH = Dimensions.get('window').width - 40;` | `const CARD_WIDTH = (isDesktopWeb() ? desktopWebViewport : Dimensions.get('window').width) - 40;` |
| `<View style={{ width: Dimensions.get('window').width }}>` | `<View style={{ width: layoutWidth }}>` |

## 6. When **NOT** to Replace Width

* Purely decorative calculations (e.g., gradient sizing) that visually fill the screen.
* Horizontal scroll areas meant to extend edge-to-edge.
* Native (iOS/Android) screens.

## 7. Testing Checklist

1. Load any screen on a desktop browser – content must be centred and capped at 1280 px.
2. Resize browser below 1280 px – layout should fluidly shrink to fit.
3. Load the same screen on a phone/emulator – behaviour must remain unchanged.

---

Follow these guidelines to maintain a **single-codebase** that feels great on both handheld devices and large desktop monitors. 