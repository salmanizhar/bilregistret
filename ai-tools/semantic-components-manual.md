# 🎯 Semantic Components Manual

## Table of Contents
1. [Overview](#overview)
2. [Why This Approach](#why-this-approach)
3. [Critical Layout Issues](#critical-layout-issues)
4. [How It Works](#how-it-works)
5. [Available Components](#available-components)
6. [Usage Examples](#usage-examples)
7. [SEO Benefits](#seo-benefits)
8. [Technical Implementation](#technical-implementation)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [Component Props Reference](#component-props-reference)

## Overview

The **Semantic Components** system provides React Native components that render proper semantic HTML on web while maintaining identical visual styling across all platforms. This gives you the best of both worlds: perfect SEO and accessibility on web, with consistent native-like rendering everywhere.

### Key Benefits:
- ✅ **Perfect visual consistency** across web and native
- ✅ **Zero spacing issues** - text renders exactly like `MyText`
- ✅ **Full SEO benefits** with proper semantic HTML structure
- ✅ **Accessibility compliant** with screen readers and assistive technologies
- ✅ **Search engine friendly** with proper heading hierarchy

## Why This Approach

### The Problem We Solved
Traditional approaches to semantic HTML in React Native have issues:

1. **Pure HTML elements**: Cause inconsistent styling and spacing issues
2. **React Native only**: No SEO benefits on web
3. **Conditional rendering**: Complex logic and maintenance overhead

### Our Solution
We created a hybrid approach that:
- Uses `MyText` for all visual rendering (consistent styling)
- Wraps with semantic HTML for SEO (web only)
- Separates layout styles (margins/padding) from text styles
- Maintains identical behavior across platforms

## Critical Layout Issues

### 🚨 CRITICAL: HTML Semantic Elements Break React Native Layout

**THE MOST IMPORTANT LESSON**: When enhancing React Native apps with SEO, **NEVER** use HTML semantic elements (`<section>`, `<article>`, `<nav>`, `<header>`, `<aside>`, etc.) directly in your JSX as they will break layout alignment and centering.

### 🚨 CRITICAL: SEO Changes Must NEVER Affect Native Apps

**FUNDAMENTAL RULE**: All SEO enhancements **MUST be web-only**. The native iOS/Android app should remain completely unaffected by any SEO changes.

#### React Native Compatibility
```tsx
// ❌ FATAL ERROR - Breaks React Native
<header style={styles.container}>  // Causes: "View config getter callback must be a function"
<aside style={styles.sidebar}>     // Invalid component name
<section style={styles.content}>   // Not recognized in React Native

// ✅ CORRECT - Works on all platforms
<View style={styles.container}
      {...(Platform.OS === 'web' && { role: 'banner' })}
>
```

#### Platform Detection Pattern
```tsx
// Always use this pattern for web-only SEO features
{...Platform.OS === 'web' && {
    role: 'region',
    'aria-labelledby': 'section-id',
    itemScope: true,
    itemType: 'https://schema.org/Article'
}}
```

**Why this matters**:
- ✅ **Native apps** see only `<View>` components (no errors)
- ✅ **Web version** gets full semantic markup for SEO
- ✅ **Zero performance impact** on native platforms
- ✅ **Zero functionality changes** for mobile users

#### The Problem
```tsx
// ❌ BAD - This breaks centering and alignment
<section style={styles.centeredSection}>
  <View style={styles.centeredContent}>
    <H2 style={styles.centeredTitle}>Title</H2>
  </View>
</section>
```

**What happens**: HTML elements have intrinsic browser styling that React Native cannot override, causing:
- ❌ Text to lose center alignment
- ❌ Icons to shift left/right  
- ❌ Entire sections to misalign
- ❌ Layout breaking across web/native
- ❌ **FATAL ERRORS** on iOS/Android (component not found)

#### The Solution
```tsx
// ✅ GOOD - Use Views with platform-specific attributes
<View style={styles.centeredSection}
      {...(Platform.OS === 'web' && {
          role: 'region',
          'aria-labelledby': 'section-title',
          itemScope: true,
          itemType: 'https://schema.org/Service'
      })}
>
  <View style={styles.centeredContent}>
    <H2 id="section-title" style={styles.centeredTitle}>Title</H2>
  </View>
</View>

// ✅ EVEN BETTER - Conditional semantic elements for maximum SEO
{Platform.OS === 'web' ? (
  <aside style={styles.centeredSection}
         role="complementary"
         aria-labelledby="section-title"
  >
    <View style={styles.centeredContent}>
      <H2 id="section-title" style={styles.centeredTitle}>Title</H2>
    </View>
  </aside>
) : (
  <View style={styles.centeredSection}>
    <View style={styles.centeredContent}>
      <H2 id="section-title" style={styles.centeredTitle}>Title</H2>
    </View>
  </View>
)}
```

### Platform-Specific Attribute Pattern

**Always use this pattern** for semantic markup that doesn't interfere with layout:

```tsx
// Container Level - Safe semantic markup
<View style={styles.yourStyles}
      {...(Platform.OS === 'web' && {
          role: 'region',           // Semantic role
          'aria-labelledby': 'id',  // Accessibility
          itemScope: true,          // Microdata
          itemType: 'https://schema.org/Article'
      })}
>
  {/* Your React Native content */}
</View>
```

### Safe vs Unsafe Elements

#### ✅ SAFE - Use these semantic components
- `<H1>`, `<H2>`, `<H3>`, `<H4>` - Our custom components
- `<P>`, `<Strong>`, `<Span>` - Our custom components
- `<View>` with platform-specific attributes
- **Conditional HTML elements** - `Platform.OS === 'web' ? <section> : <View>`

#### 🚨 UNSAFE - Never use these directly
- `<section>` - Breaks layout alignment **when used directly**
- `<article>` - Causes centering issues **when used directly**
- `<nav>` - Interferes with flexbox **when used directly**
- `<main>` - Disrupts container styling **when used directly**
- `<aside>` - Affects positioning **when used directly**
- `<header>` - Conflicts with React Native **when used directly**
- `<footer>` - Layout interference **when used directly**

**Key Rule**: HTML elements are SAFE when conditionally rendered for web only:

```tsx
// ✅ SAFE - Conditional rendering
{Platform.OS === 'web' ? <aside style={styles.container}> : <View style={styles.container}>}

// ❌ UNSAFE - Direct usage
<aside style={styles.container}>  // Will break React Native
```

### Real-World Example

From the biluppgifter page fix:

```tsx
// ❌ BEFORE - Broke centering for "Varför välja oss" icons
<section style={styles.whyUsSectionBackground}>
  <article style={styles.whyUsCard}>
    <H3 style={styles.centeredTitle}>Title</H3>
  </article>
</section>

// ✅ GOOD - Platform-specific attributes (maintains alignment)
<View style={styles.whyUsSectionBackground}
      {...(Platform.OS === 'web' && {
          role: 'region',
          itemScope: true,
          itemType: 'https://schema.org/Service'
      })}
>
  <View style={styles.whyUsCard}>
    <H3 style={styles.centeredTitle}>Title</H3>
  </View>
</View>

// ✅ BEST - Conditional semantic elements (maximum SEO + perfect alignment)
{Platform.OS === 'web' ? (
  <aside style={styles.bannerRight}
         role="complementary"
         aria-labelledby="features-heading"
  >
    <View style={styles.featureGrid}>
      <H3 style={styles.centeredTitle}>Title</H3>
    </View>
  </aside>
) : (
  <View style={styles.bannerRight}>
    <View style={styles.featureGrid}>
      <H3 style={styles.centeredTitle}>Title</H3>
    </View>
  </View>
)}
```

### When This Issue Occurs

This happens specifically when:
- ❌ Adding SEO enhancements to existing React Native pages
- ❌ Converting `<View>` elements to semantic HTML
- ❌ Using `<section>`, `<article>` for structured data
- ❌ Implementing ARIA landmarks incorrectly

### Prevention Checklist

Before implementing semantic SEO:

1. **✅ Never replace styled Views with HTML elements**
2. **✅ Always use platform-specific attribute spreading**  
3. **✅ Test alignment on both web and native**
4. **✅ Use our semantic components for text only**
5. **✅ Keep semantic markup at container level only**
6. **✅ MANDATORY: Test on iOS/Android simulator before deploying**
7. **✅ VERIFY: No component name errors in React Native**
8. **✅ CONFIRM: Native app functionality unchanged**

### Mandatory Testing Protocol

**BEFORE any SEO deployment**:

1. **Web Testing**:
   - ✅ Verify semantic HTML in browser DevTools
   - ✅ Check layout alignment and centering
   - ✅ Validate structured data with Google's tools

2. **Native Testing** (CRITICAL):
   - ✅ Run on iOS simulator - NO ERRORS
   - ✅ Run on Android simulator - NO ERRORS  
   - ✅ Verify all text rendering identical to before
   - ✅ Confirm no component name warnings/errors

3. **Cross-Platform Verification**:
   - ✅ Visual comparison: web vs native (must be identical)
   - ✅ Performance check: no slowdowns on native
   - ✅ Functionality test: all features work as before

**If ANY native errors occur**: STOP deployment and fix immediately.

### Error Patterns to Watch For

Common React Native errors from SEO mistakes:

```
❌ "View config getter callback for component `header` must be a function"
❌ "View config getter callback for component `section` must be a function"  
❌ "View config getter callback for component `article` must be a function"
❌ "View config getter callback for component `aside` must be a function"
```

**Root cause**: Using lowercase HTML elements in React Native JSX
**Solution**: Always use `<View>` with platform-specific attributes

### SEO Impact

**Good news**: This approach maintains **100% SEO benefits**:
- ✅ JSON-LD structured data (most important)
- ✅ Proper heading hierarchy  
- ✅ ARIA accessibility
- ✅ Schema.org microdata
- ✅ Search engine optimization

The semantic attributes are applied correctly for SEO while preserving React Native layout integrity.

## How It Works

### Architecture Overview
```
Web Rendering:
<h1 style="neutral-wrapper">
  <View style="layout-styles">
    <MyText style="text-styles">Content</MyText>
  </View>
</h1>

Native Rendering:
<View style="layout-styles">
  <MyText style="text-styles">Content</MyText>
</View>
```

### Style Separation Logic
The system automatically separates your styles into two categories:

**Layout Styles** (applied to wrapper View):
- `margin*`, `padding*`
- `alignSelf`, `flex*`
- `position`, positioning properties
- `width`, `height`, sizing properties

**Text Styles** (applied to MyText):
- `fontSize`, `fontWeight`, `color`
- `textAlign`, `lineHeight`
- `fontFamily`, text-specific properties

## Available Components

### H1 - Main Page Heading
```tsx
import { H1 } from '@/components/common/SemanticText';

<H1 id="main-title" style={styles.heroTitle}>
  Your Main Page Title
</H1>
```

### H2 - Section Headings
```tsx
import { H2 } from '@/components/common/SemanticText';

<H2 id="section-title" style={styles.sectionTitle}>
  Section Heading
</H2>
```

### H3 - Subsection Headings
```tsx
import { H3 } from '@/components/common/SemanticText';

<H3 style={styles.subsectionTitle}>
  Subsection Heading
</H3>
```

### H4 - Sub-subsection Headings
```tsx
import { H4 } from '@/components/common/SemanticText';

<H4 style={styles.cardTitle}>
  Card Title
</H4>
```

### P - Paragraph Text
```tsx
import { P } from '@/components/common/SemanticText';

<P style={styles.bodyText}>
  Your paragraph content goes here.
</P>
```

### Strong - Bold/Important Text
```tsx
import { Strong } from '@/components/common/SemanticText';

<P style={styles.bodyText}>
  This is <Strong style={styles.boldText}>important text</Strong> in a paragraph.
</P>
```

### Span - Inline Text
```tsx
import { Span } from '@/components/common/SemanticText';

<P style={styles.bodyText}>
  Regular text with <Span style={styles.highlight}>highlighted span</Span>.
</P>
```

## Semantic Container Components

### SemanticAside - Complementary Content
```tsx
import { SemanticAside } from '@/components/common/SemanticText';

<SemanticAside 
  style={styles.sidebar}
  ariaLabelledBy="sidebar-title"
  accessibilityLabel="Sidebar content"
>
  <H3 id="sidebar-title">Related Information</H3>
  <P>Complementary content...</P>
</SemanticAside>
```

### SemanticSection - Main Content Sections
```tsx
import { SemanticSection } from '@/components/common/SemanticText';

<SemanticSection 
  style={styles.contentSection}
  ariaLabelledBy="section-title"
  itemScope
  itemType="https://schema.org/Article"
>
  <H2 id="section-title">Section Title</H2>
  <P>Section content...</P>
</SemanticSection>
```

### SemanticArticle - Standalone Content
```tsx
import { SemanticArticle } from '@/components/common/SemanticText';

<SemanticArticle 
  style={styles.article}
  itemScope
  itemType="https://schema.org/Article"
>
  <H2>Article Title</H2>
  <P>Article content...</P>
</SemanticArticle>
```

### SemanticHeader - Page/Section Headers
```tsx
import { SemanticHeader } from '@/components/common/SemanticText';

<SemanticHeader 
  style={styles.header}
  role="banner"
  accessibilityLabel="Main page header"
>
  <H1>Page Title</H1>
  <P>Subtitle or description</P>
</SemanticHeader>
```

### SemanticMain - Main Content Area
```tsx
import { SemanticMain } from '@/components/common/SemanticText';

<SemanticMain 
  style={styles.mainContent}
  accessibilityLabel="Main page content"
>
  <H1>Main Content</H1>
  <P>Primary page content...</P>
</SemanticMain>
```

### SemanticNav - Navigation Areas
```tsx
import { SemanticNav } from '@/components/common/SemanticText';

<SemanticNav 
  style={styles.navigation}
  ariaLabelledBy="nav-title"
  accessibilityLabel="Main navigation"
>
  <H2 id="nav-title" style={{ display: 'none' }}>Navigation</H2>
  {/* Navigation items */}
</SemanticNav>
```

## Usage Examples

### Basic Page Structure (NEW - Simplified Approach)
```tsx
import { H1, H2, H3, P, Strong, SemanticMain, SemanticSection, SemanticAside } from '@/components/common/SemanticText';

export default function ExamplePage() {
  return (
    <View style={styles.container}>
      {/* Main content area */}
      <SemanticMain style={styles.mainContent}>
        <H1 id="page-title" style={styles.pageTitle}>
          Welcome to Our Service
        </H1>
        
        <P style={styles.intro}>
          This is the main introduction to our service...
        </P>
        
        {/* Content sections */}
        <SemanticSection 
          style={styles.featuresSection}
          ariaLabelledBy="features-title"
          itemScope
          itemType="https://schema.org/Service"
        >
          <H2 id="features-title" style={styles.sectionHeading}>
            Our Features
          </H2>
          
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <H3 style={styles.featureTitle}>Fast Performance</H3>
              <P style={styles.featureDescription}>
                Our service is <Strong>lightning fast</Strong> and reliable.
              </P>
            </View>
          </View>
        </SemanticSection>
        
        {/* Sidebar content */}
        <SemanticAside 
          style={styles.sidebar}
          ariaLabelledBy="sidebar-title"
        >
          <H3 id="sidebar-title">Related Information</H3>
          <P>Additional helpful content...</P>
        </SemanticAside>
      </SemanticMain>
    </View>
  );
}
```

### Before vs After Comparison

#### ❌ OLD WAY - Complex conditional logic
```tsx
// Required complex Platform.OS conditionals everywhere
{Platform.OS === 'web' ? (
  <aside style={styles.sidebar}
         role="complementary"
         aria-labelledby="sidebar-title"
  >
    <View style={styles.content}>
      <H3 id="sidebar-title">Title</H3>
      <P>Content...</P>
    </View>
  </aside>
) : (
  <View style={styles.sidebar}>
    <View style={styles.content}>
      <H3 id="sidebar-title">Title</H3>
      <P>Content...</P>
    </View>
  </View>
)}
```

#### ✅ NEW WAY - Simple semantic components
```tsx
// Single component handles everything automatically
<SemanticAside 
  style={styles.sidebar}
  ariaLabelledBy="sidebar-title"
>
  <H3 id="sidebar-title">Title</H3>
  <P>Content...</P>
</SemanticAside>
```

### Complete Page Example
```tsx
import { 
  H1, H2, H3, P, Strong, 
  SemanticMain, SemanticSection, SemanticAside, SemanticHeader 
} from '@/components/common/SemanticText';

export default function CompletePage() {
  return (
    <View style={styles.container}>
      {/* Page header */}
      <SemanticHeader style={styles.header}>
        <H1 id="main-title" style={styles.title}>
          Complete Page Example
        </H1>
        <P style={styles.subtitle}>
          Demonstrating all semantic components
        </P>
      </SemanticHeader>
      
      {/* Main content */}
      <SemanticMain style={styles.main}>
        {/* Introduction section */}
        <SemanticSection 
          style={styles.introSection}
          ariaLabelledBy="intro-title"
          itemScope
          itemType="https://schema.org/Article"
        >
          <H2 id="intro-title" style={styles.sectionTitle}>
            Introduction
          </H2>
          <P style={styles.introText}>
            This page demonstrates the power of semantic components...
          </P>
        </SemanticSection>
        
        {/* Features section */}
        <SemanticSection 
          style={styles.featuresSection}
          ariaLabelledBy="features-title"
          itemScope
          itemType="https://schema.org/Service"
        >
          <H2 id="features-title" style={styles.sectionTitle}>
            Features
          </H2>
          
          <View style={styles.featureList}>
            <View style={styles.feature}>
              <H3 style={styles.featureTitle}>
                Automatic SEO
              </H3>
              <P style={styles.featureText}>
                <Strong>Zero configuration</Strong> semantic HTML on web.
              </P>
            </View>
          </View>
        </SemanticSection>
        
        {/* Sidebar */}
        <SemanticAside 
          style={styles.sidebar}
          ariaLabelledBy="sidebar-title"
        >
          <H3 id="sidebar-title" style={styles.sidebarTitle}>
            Quick Links
          </H3>
          <P style={styles.sidebarText}>
            Additional resources and information.
          </P>
        </SemanticAside>
      </SemanticMain>
    </View>
  );
}
```

## SEO Benefits

### Semantic HTML Structure
On web, the components generate proper semantic HTML:
```html
<h1 id="main-heading">
  <div style="margin-bottom: 30px;">
    <span>Your Title</span>
  </div>
</h1>

<h2 id="section-heading">
  <div style="margin-bottom: 20px;">
    <span>Section Title</span>
  </div>
</h2>

<p>
  <span>Paragraph content</span>
</p>
```

### Search Engine Benefits
- **Proper heading hierarchy** helps search engines understand content structure
- **Semantic markup** improves content accessibility and indexing
- **ID attributes** enable internal linking and page navigation
- **Clean HTML structure** improves crawlability

### Accessibility Benefits
- **Screen readers** can navigate by headings
- **Keyboard navigation** works properly
- **ARIA attributes** are preserved
- **Semantic meaning** is clear to assistive technologies

## Technical Implementation

### Component Architecture
```tsx
export const H1: React.FC<SemanticTextProps> = ({ children, style, id, ...props }) => {
  // 1. Separate layout styles from text styles
  const { layoutStyle, textStyle } = separateStyles(style);
  
  // 2. Create MyText component with text styles
  const textComponent = (
    <MyText 
      fontFamily="Poppins"
      style={[{ fontSize: 32, fontWeight: '700' }, textStyle]} 
      {...props}
    >
      {children}
    </MyText>
  );

  // 3. Wrap with View if layout styles exist
  const wrappedComponent = Object.keys(layoutStyle).length > 0 ? (
    <View style={layoutStyle}>
      {textComponent}
    </View>
  ) : textComponent;

  // 4. On web, wrap with semantic HTML
  if (Platform.OS === 'web') {
    return (
      <h1 id={id} style={{ /* neutral wrapper styles */ }}>
        {wrappedComponent}
      </h1>
    );
  }
  
  // 5. On native, return wrapped component directly
  return wrappedComponent;
};
```

### Style Separation Logic
```tsx
const separateStyles = (style: TextStyle | undefined) => {
  if (!style) return { layoutStyle: {}, textStyle: {} };
  
  const layoutProps = [
    'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'marginHorizontal', 'marginVertical',
    'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
    'paddingHorizontal', 'paddingVertical',
    'alignSelf', 'flex', 'flexGrow', 'flexShrink', 'flexBasis',
    'position', 'top', 'bottom', 'left', 'right',
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'
  ];
  
  const layoutStyle: any = {};
  const textStyle: any = {};
  
  Object.keys(style).forEach(key => {
    if (layoutProps.includes(key)) {
      layoutStyle[key] = (style as any)[key];
    } else {
      textStyle[key] = (style as any)[key];
    }
  });
  
  return { layoutStyle, textStyle };
};
```

## Best Practices

### 1. Proper Heading Hierarchy
```tsx
// ✅ Good - Logical hierarchy
<H1>Main Topic</H1>
  <H2>Section</H2>
    <H3>Subsection</H3>
      <H4>Detail</H4>
  <H2>Another Section</H2>

// ❌ Bad - Skipping levels
<H1>Main Topic</H1>
  <H4>Detail</H4>  // Skipped H2 and H3
```

### 2. Use ID Attributes for Important Headings
```tsx
// ✅ Good - SEO-friendly IDs
<H1 id="main-heading">Page Title</H1>
<H2 id="features-section">Features</H2>
<H2 id="pricing-section">Pricing</H2>

// 🔍 Enables internal linking: example.com/page#features-section
```

### 3. Choose the Right Component
```tsx
// ✅ Use H1 for main page titles
<H1>Page Title</H1>

// ✅ Use P for body text
<P>This is paragraph content...</P>

// ✅ Use Strong for emphasis within text
<P>This is <Strong>important</Strong> information.</P>

// ❌ Don't use headings for styling only
<H2 style={styles.smallText}>Not actually a heading</H2>
```

### 4. Maintain Visual Consistency
```tsx
// ✅ Good - Consistent styling patterns
const styles = StyleSheet.create({
  pageTitle: {
    fontSize: isDesktopWeb() ? 48 : 32,
    fontFamily: 'Poppins',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: isDesktopWeb() ? 36 : 28,
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginBottom: 20,
  },
});
```

### 5. Responsive Design
```tsx
// ✅ Good - Responsive typography
const styles = StyleSheet.create({
  heroTitle: {
    fontSize: isDesktopWeb() ? 60 : 32,
    lineHeight: isDesktopWeb() ? 70 : 40,
    marginBottom: isDesktopWeb() ? 40 : 20,
  },
});
```

## Troubleshooting

### Issue: Spacing Problems
**Symptoms**: Text has no margins or incorrect spacing
**Solution**: Check that margin/padding styles are being applied correctly
```tsx
// Ensure your styles include margin/padding
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    marginBottom: 20, // ✅ This will be applied to wrapper View
  },
});
```

### Issue: Inconsistent Styling
**Symptoms**: Text looks different between web and native
**Solution**: Use `MyText`-compatible styles only
```tsx
// ✅ Good - MyText compatible styles
style={{
  fontSize: 16,
  fontWeight: '600',
  color: '#181818',
  fontFamily: 'Inter',
}}

// ❌ Bad - Web-only styles
style={{
  fontStretch: 'condensed', // Not supported by MyText
  textShadow: '1px 1px 1px black', // Web-specific
}}
```

### Issue: SEO Not Working
**Symptoms**: Search engines not recognizing structure
**Solution**: Verify proper heading hierarchy and HTML output
```tsx
// ✅ Check in browser DevTools that you see:
<h1 id="main-title">
  <div>
    <span>Your Title</span>
  </div>
</h1>
```

### Issue: Accessibility Problems
**Symptoms**: Screen readers not navigating properly
**Solution**: Use proper semantic components and IDs
```tsx
// ✅ Good - Semantic structure with IDs
<H1 id="page-title">Main Title</H1>
<H2 id="section-1">Section Title</H2>

// ❌ Bad - No semantic meaning
<MyText style={styles.bigText}>Not A Real Heading</MyText>
```

### Issue: Layout Alignment Problems
**Symptoms**: Centering broken, icons misaligned after adding SEO
**Solution**: Never use HTML semantic elements directly - use platform-specific attributes
```tsx
// ❌ Bad - Breaks alignment
<section style={styles.centeredSection}>

// ✅ Good - Maintains alignment  
<View style={styles.centeredSection}
      {...(Platform.OS === 'web' && { role: 'region' })}
>
```

## Component Props Reference

### Common Props
All semantic components accept these props:

```tsx
interface SemanticTextProps {
  children: React.ReactNode;           // Text content
  style?: TextStyle;                   // React Native TextStyle
  fontFamily?: string;                 // Font family ('Poppins' | 'Inter')
  accessibilityLabel?: string;         // Accessibility label
  accessibilityRole?: AccessibilityRole; // Accessibility role
  numberOfLines?: number;              // Max lines to display
  onPress?: () => void;               // Press handler
  id?: string;                        // HTML id attribute (web only)
  role?: string;                      // Additional ARIA role for web
  ariaLevel?: number;                 // ARIA heading level
  ariaLabelledBy?: string;            // ARIA labelledby
  ariaDescribedBy?: string;           // ARIA describedby
  itemProp?: string;                  // Schema.org microdata property
  itemScope?: boolean;                // Schema.org microdata scope
  itemType?: string;                  // Schema.org microdata type
}
```

### Default Font Families
- **Headings (H1-H4)**: `Poppins`
- **Body text (P, Span)**: `Inter`  
- **Strong**: `Inter`

### Semantic Element Wrapper Pattern

For **maximum SEO benefit**, use conditional rendering to get real HTML elements on web:

```tsx
// Pattern for semantic container elements
{Platform.OS === 'web' ? (
  <section style={styles.yourStyles}
           role="region"
           aria-labelledby="section-id"
           itemScope
           itemType="https://schema.org/Article"
  >
    {/* Your React Native content */}
  </section>
) : (
  <View style={styles.yourStyles}>
    {/* Same React Native content */}
  </View>
)}
```

**Benefits of this approach**:
- ✅ **Real semantic HTML** on web (better than just ARIA roles)
- ✅ **Zero errors** on native (only sees Views)
- ✅ **Perfect SEO** - search engines see actual `<section>`, `<aside>`, etc.
- ✅ **Identical styling** - same styles applied to both elements

---

## 🎉 Conclusion

The Semantic Components system gives you the perfect balance of visual consistency, SEO benefits, and maintainability. Use these components instead of `MyText` for any text that has semantic meaning, and enjoy automatic SEO optimization without compromising your design!

**Remember**: Always think about the semantic meaning of your content, not just the visual appearance. This will lead to better SEO, accessibility, and user experience.

---

*Created by AI Assistant - Last updated: December 2024* 