import React from 'react';
import { SvgXml } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface SafeSvgXmlProps {
  xml?: string;
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
  [key: string]: any;
}

const SafeSvgXml: React.FC<SafeSvgXmlProps> = ({ 
  xml, 
  width, 
  height, 
  style, 
  ...props 
}) => {
  // Return null if no XML is provided to prevent crashes during SSR
  if (!xml || typeof xml !== 'string' || xml.trim() === '') {
    return null;
  }

  // Validate that the XML contains valid SVG content
  if (!xml.includes('<svg') || !xml.includes('</svg>')) {
    console.warn('Invalid SVG XML provided to SafeSvgXml');
    return null;
  }

  try {
    return (
      <SvgXml 
        xml={xml} 
        width={width} 
        height={height} 
        style={style}
        {...props}
      />
    );
  } catch (error) {
    console.warn('Error rendering SVG:', error);
    return null;
  }
};

export default SafeSvgXml; 