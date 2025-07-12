import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

const IconHourglass: React.FC<IconProps> = ({
  size = 24,
  color = '#000000',
  style
}) => {
  const safeSize = size || 24;
  const safeColor = color || '#000000';

  const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Loading">
      <path d="M6 2h12v4l-6 6 6 6v4H6v-4l6-6-6-6V2z" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 6h8" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 18h8" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconHourglass;