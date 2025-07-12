import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

const IconInstagram: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#000000', 
  style 
}) => {
  const safeSize = size || 24;
  const safeColor = color || '#000000';

  const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Instagram">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="${safeColor}" stroke-width="1.5"/>
      <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="${safeColor}" stroke-width="1.5"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;

  return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconInstagram; 