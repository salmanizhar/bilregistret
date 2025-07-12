import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

const IconUser: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#000000', 
  style 
}) => {
  const safeSize = size || 24;
  const safeColor = color || '#000000';

  const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="User">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="${safeColor}" stroke-width="1.5"/>
    </svg>
  `;

  return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconUser; 