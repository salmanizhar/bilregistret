import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

const IconCar: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#000000', 
  style 
}) => {
  const safeSize = size || 24;
  const safeColor = color || '#000000';

  const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Car">
      <path d="M3 17V20a2 2 0 0 0 2 2h2l.15-.005A2 2 0 0 0 9 20v-1h6v1l.005.15A2 2 0 0 0 17 22h2a2 2 0 0 0 2-2v-3" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 12h18l-2-6H5l-2 6Z" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="7" cy="15" r="1" stroke="${safeColor}" stroke-width="1.5"/>
      <circle cx="17" cy="15" r="1" stroke="${safeColor}" stroke-width="1.5"/>
    </svg>
  `;

  return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconCar; 