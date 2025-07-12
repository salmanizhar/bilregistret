import React from 'react';
import { Platform, TextStyle, AccessibilityRole, View, ViewStyle, StyleSheet } from 'react-native';
import MyText from './MyText';

interface SemanticTextProps {
    children: React.ReactNode;
    style?: TextStyle;
    fontFamily?: string;
    accessibilityLabel?: string;
    accessibilityRole?: AccessibilityRole;
    numberOfLines?: number;
    onPress?: () => void;
    id?: string; // HTML id attribute for web semantic structure
    role?: string; // Additional ARIA role for web
    ariaLevel?: number; // ARIA heading level
    ariaLabelledBy?: string; // ARIA labelledby
    ariaDescribedBy?: string; // ARIA describedby
    itemProp?: string; // Schema.org microdata property
    itemScope?: boolean; // Schema.org microdata scope
    itemType?: string; // Schema.org microdata type
}

interface SemanticContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    id?: string;
    role?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    itemProp?: string;
    itemScope?: boolean;
    itemType?: string;
    accessibilityLabel?: string;
    accessibilityRole?: AccessibilityRole;
} 

// Helper function to separate layout and text styles
const separateStyles = (style: TextStyle | undefined) => {
    if (!style) return { layoutStyle: {}, textStyle: {} };
    
    // Handle flattened styles (from StyleSheet.flatten)
    const flatStyle = Array.isArray(style) ? StyleSheet.flatten(style) : style;
    
    const layoutProps = ['margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical', 'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingHorizontal', 'paddingVertical', 'alignSelf', 'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'position', 'top', 'bottom', 'left', 'right', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'];
    
    const layoutStyle: any = {};
    const textStyle: any = {};
    
    Object.keys(flatStyle).forEach(key => {
        if (layoutProps.includes(key)) {
            layoutStyle[key] = (flatStyle as any)[key];
        } else {
            textStyle[key] = (flatStyle as any)[key];
        }
    });
    
    return { layoutStyle, textStyle };
};

// H1 Component - Main page heading
export const H1: React.FC<SemanticTextProps> = ({ children, style, fontFamily = 'Poppins', id, role, ariaLevel, ariaLabelledBy, ariaDescribedBy, itemProp, itemScope, itemType, ...props }) => {
    const { layoutStyle, textStyle } = separateStyles(style);
    
    const textComponent = (
        <MyText 
            fontFamily={fontFamily}
            style={[{ fontSize: 32, fontWeight: '700' }, textStyle]} 
            {...props}
        >
            {children}
        </MyText>
    );

    const wrappedComponent = Object.keys(layoutStyle).length > 0 ? (
        <View style={layoutStyle}>
            {textComponent}
        </View>
    ) : textComponent;

    if (Platform.OS === 'web') {
        return (
            <h1 
                id={id}
                role={role}
                aria-level={ariaLevel || 1}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={{
                    margin: 0,
                    padding: 0,
                    border: 0,
                    background: 'none',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    fontFamily: 'inherit',
                    lineHeight: 'inherit',
                    color: 'inherit',
                    display: 'block'
                }}
            >
                {wrappedComponent}
            </h1>
        );
    }
    
    return wrappedComponent;
};

// H2 Component - Section headings
export const H2: React.FC<SemanticTextProps> = ({ children, style, fontFamily = 'Poppins', id, role, ariaLevel, ariaLabelledBy, ariaDescribedBy, itemProp, itemScope, itemType, ...props }) => {
    const { layoutStyle, textStyle } = separateStyles(style);
    
    const textComponent = (
        <MyText 
            fontFamily={fontFamily}
            style={[{ fontSize: 24, fontWeight: '600' }, textStyle]} 
            {...props}
        >
            {children}
        </MyText>
    );

    const wrappedComponent = Object.keys(layoutStyle).length > 0 ? (
        <View style={layoutStyle}>
            {textComponent}
        </View>
    ) : textComponent;

    if (Platform.OS === 'web') {
        return (
            <h2 
                id={id}
                role={role}
                aria-level={ariaLevel || 2}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={{
                    margin: 0,
                    padding: 0,
                    border: 0,
                    background: 'none',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    fontFamily: 'inherit',
                    lineHeight: 'inherit',
                    color: 'inherit',
                    display: 'block'
                }}
            >
                {wrappedComponent}
            </h2>
        );
    }
    
    return wrappedComponent;
};

// H3 Component - Subsection headings
export const H3: React.FC<SemanticTextProps> = ({ children, style, fontFamily = 'Poppins', id, role, ariaLevel, ariaLabelledBy, ariaDescribedBy, itemProp, itemScope, itemType, ...props }) => {
    const { layoutStyle, textStyle } = separateStyles(style);
    
    const textComponent = (
        <MyText 
            fontFamily={fontFamily}
            style={[{ fontSize: 20, fontWeight: '600' }, textStyle]} 
            {...props}
        >
            {children}
        </MyText>
    );

    const wrappedComponent = Object.keys(layoutStyle).length > 0 ? (
        <View style={layoutStyle}>
            {textComponent}
        </View>
    ) : textComponent;

    if (Platform.OS === 'web') {
        return (
            <h3 
                id={id}
                role={role}
                aria-level={ariaLevel || 3}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={{
                    margin: 0,
                    padding: 0,
                    border: 0,
                    background: 'none',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    fontFamily: 'inherit',
                    lineHeight: 'inherit',
                    color: 'inherit',
                    display: 'block'
                }}
            >
                {wrappedComponent}
            </h3>
        );
    }
    
    return wrappedComponent;
};

// H4 Component - Sub-subsection headings
export const H4: React.FC<SemanticTextProps> = ({ children, style, fontFamily = 'Poppins', id, role, ariaLevel, ariaLabelledBy, ariaDescribedBy, itemProp, itemScope, itemType, ...props }) => {
    const { layoutStyle, textStyle } = separateStyles(style);
    
    const textComponent = (
        <MyText 
            fontFamily={fontFamily}
            style={[{ fontSize: 18, fontWeight: '600' }, textStyle]} 
            {...props}
        >
            {children}
        </MyText>
    );

    const wrappedComponent = Object.keys(layoutStyle).length > 0 ? (
        <View style={layoutStyle}>
            {textComponent}
        </View>
    ) : textComponent;

    if (Platform.OS === 'web') {
        return (
            <h4 
                id={id}
                role={role}
                aria-level={ariaLevel || 4}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={{
                    margin: 0,
                    padding: 0,
                    border: 0,
                    background: 'none',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    fontFamily: 'inherit',
                    lineHeight: 'inherit',
                    color: 'inherit',
                    display: 'block'
                }}
            >
                {wrappedComponent}
            </h4>
        );
    }
    
    return wrappedComponent;
};

// P Component - Paragraph text
export const P: React.FC<SemanticTextProps> = ({ children, style, fontFamily = 'Inter', id, role, ariaLabelledBy, ariaDescribedBy, itemProp, itemScope, itemType, ...props }) => {
    const { layoutStyle, textStyle } = separateStyles(style);
    
    if (Platform.OS === 'web') {
        // On web, combine all styles and apply to the p element directly to avoid div nesting
        const combinedStyle = {
            margin: 0,
            padding: 0,
            border: 0,
            background: 'none',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontFamily: 'inherit',
            lineHeight: 'inherit',
            color: 'inherit',
            display: 'block',
            ...layoutStyle, // Apply layout styles directly to p element
        };
        
        return (
            <p 
                id={id}
                role={role}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={combinedStyle}
            >
                <MyText 
                    fontFamily={fontFamily}
                    style={[{ fontSize: 16, fontWeight: '400' }, textStyle]} 
                    {...props}
                >
                    {children}
                </MyText>
            </p>
        );
    }
    
    // For native platforms, use the original logic with View wrapper if needed
    const textComponent = (
        <MyText 
            fontFamily={fontFamily}
            style={[{ fontSize: 16, fontWeight: '400' }, textStyle]} 
            {...props}
        >
            {children}
        </MyText>
    );

    const wrappedComponent = Object.keys(layoutStyle).length > 0 ? (
        <View style={layoutStyle}>
            {textComponent}
        </View>
    ) : textComponent;
    
    return wrappedComponent;
};

// Span Component - Inline text
export const Span: React.FC<SemanticTextProps> = ({ children, style, fontFamily = 'Inter', id, role, ariaLabelledBy, ariaDescribedBy, itemProp, itemScope, itemType, ...props }) => {
    const textComponent = (
        <MyText 
            fontFamily={fontFamily}
            style={style} 
            {...props}
        >
            {children}
        </MyText>
    );

    if (Platform.OS === 'web') {
        return (
            <span 
                id={id}
                role={role}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={{
                    margin: 0,
                    padding: 0,
                    border: 0,
                    background: 'none',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    fontFamily: 'inherit',
                    lineHeight: 'inherit',
                    color: 'inherit',
                    display: 'inline'
                }}
            >
                {textComponent}
            </span>
        );
    }
    
    return textComponent;
};

// Strong Component - Bold/important text
export const Strong: React.FC<SemanticTextProps> = ({ children, style, fontFamily = 'Inter', id, role, ariaLabelledBy, ariaDescribedBy, itemProp, itemScope, itemType, ...props }) => {
    const textComponent = (
        <MyText 
            fontFamily={fontFamily}
            style={[{ fontWeight: 'bold' }, style]} 
            {...props}
        >
            {children}
        </MyText>
    );

    if (Platform.OS === 'web') {
        return (
            <strong 
                id={id}
                role={role}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={{
                    margin: 0,
                    padding: 0,
                    border: 0,
                    background: 'none',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    fontFamily: 'inherit',
                    lineHeight: 'inherit',
                    color: 'inherit',
                    display: 'inline'
                }}
            >
                {textComponent}
            </strong>
        );
    }
    
    return textComponent;
};

// =============================================================================
// SEMANTIC CONTAINER COMPONENTS
// =============================================================================
// These components automatically render semantic HTML on web and Views on native

// SemanticAside Component - Complementary content
export const SemanticAside: React.FC<SemanticContainerProps> = ({ 
    children, 
    style, 
    id, 
    role = 'complementary', 
    ariaLabelledBy, 
    ariaDescribedBy, 
    itemProp, 
    itemScope, 
    itemType,
    accessibilityLabel,
    accessibilityRole,
    ...props 
}) => {
    if (Platform.OS === 'web') {
        return (
            <aside 
                id={id}
                role={role}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={style as any}
                {...props}
            >
                {children}
            </aside>
        );
    }
    
    return (
        <View 
            style={style}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
            {...props}
        >
            {children}
        </View>
    );
};

// SemanticSection Component - Main content sections
export const SemanticSection: React.FC<SemanticContainerProps> = ({ 
    children, 
    style, 
    id, 
    role = 'region', 
    ariaLabelledBy, 
    ariaDescribedBy, 
    itemProp, 
    itemScope, 
    itemType,
    accessibilityLabel,
    accessibilityRole,
    ...props 
}) => {
    if (Platform.OS === 'web') {
        return (
            <section 
                id={id}
                role={role}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={style as any}
                {...props}
            >
                {children}
            </section>
        );
    }
    
    return (
        <View 
            style={style}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
            {...props}
        >
            {children}
        </View>
    );
};

// SemanticArticle Component - Standalone content
export const SemanticArticle: React.FC<SemanticContainerProps> = ({ 
    children, 
    style, 
    id, 
    role = 'article', 
    ariaLabelledBy, 
    ariaDescribedBy, 
    itemProp, 
    itemScope, 
    itemType,
    accessibilityLabel,
    accessibilityRole,
    ...props 
}) => {
    if (Platform.OS === 'web') {
        return (
            <article 
                id={id}
                role={role}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={style as any}
                {...props}
            >
                {children}
            </article>
        );
    }
    
    return (
        <View 
            style={style}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
            {...props}
        >
            {children}
        </View>
    );
};

// SemanticHeader Component - Page/section headers
export const SemanticHeader: React.FC<SemanticContainerProps> = ({ 
    children, 
    style, 
    id, 
    role = 'banner', 
    ariaLabelledBy, 
    ariaDescribedBy, 
    itemProp, 
    itemScope, 
    itemType,
    accessibilityLabel,
    accessibilityRole,
    ...props 
}) => {
    if (Platform.OS === 'web') {
        return (
            <header 
                id={id}
                role={role}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={style as any}
                {...props}
            >
                {children}
            </header>
        );
    }
    
    return (
        <View 
            style={style}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
            {...props}
        >
            {children}
        </View>
    );
};

// SemanticMain Component - Main content area
export const SemanticMain: React.FC<SemanticContainerProps> = ({ 
    children, 
    style, 
    id, 
    role = 'main', 
    ariaLabelledBy, 
    ariaDescribedBy, 
    itemProp, 
    itemScope, 
    itemType,
    accessibilityLabel,
    accessibilityRole,
    ...props 
}) => {
    if (Platform.OS === 'web') {
        return (
            <main 
                id={id}
                role={role}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={style as any}
                {...props}
            >
                {children}
            </main>
        );
    }
    
    return (
        <View 
            style={style}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
            {...props}
        >
            {children}
        </View>
    );
};

// SemanticNav Component - Navigation areas
export const SemanticNav: React.FC<SemanticContainerProps> = ({ 
    children, 
    style, 
    id, 
    role = 'navigation', 
    ariaLabelledBy, 
    ariaDescribedBy, 
    itemProp, 
    itemScope, 
    itemType,
    accessibilityLabel,
    accessibilityRole,
    ...props 
}) => {
    if (Platform.OS === 'web') {
        return (
            <nav 
                id={id}
                role={role}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                itemProp={itemProp}
                itemScope={itemScope}
                itemType={itemType}
                style={style as any}
                {...props}
            >
                {children}
            </nav>
        );
    }
    
    return (
        <View 
            style={style}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
            {...props}
        >
            {children}
        </View>
    );
};

export default {
    H1,
    H2,
    H3,
    H4,
    P,
    Span,
    Strong,
    SemanticAside,
    SemanticSection,
    SemanticArticle,
    SemanticHeader,
    SemanticMain,
    SemanticNav
}; 