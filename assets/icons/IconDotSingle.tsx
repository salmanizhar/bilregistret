import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

const IconDotSingle: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#000000', 
  style 
}) => {
  const safeSize = size || 24;
  const safeColor = color || '#000000';

  const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Separator">
      <circle cx="12" cy="12" r="2" fill="${safeColor}"/>
    </svg>
  `;

  return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconDotSingle; 