import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

const IconLinkedIn: React.FC<IconProps> = ({ 
  size = 24, 
  color = '#000000', 
  style 
}) => {
  const safeSize = size || 24;
  const safeColor = color || '#000000';

  const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LinkedIn">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="${safeColor}" stroke-width="1.5"/>
      <rect x="2" y="9" width="4" height="12" stroke="${safeColor}" stroke-width="1.5"/>
      <circle cx="4" cy="4" r="2" stroke="${safeColor}" stroke-width="1.5"/>
    </svg>
  `;

  return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconLinkedIn;