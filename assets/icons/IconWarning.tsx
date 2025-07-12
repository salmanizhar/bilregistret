import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

const IconWarning: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#000000', 
  style 
}) => {
  const safeSize = size || 24;
  const safeColor = color || '#000000';

  const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Warning">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 9V13" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 17H12.01" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconWarning; 