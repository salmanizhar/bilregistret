import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    backgroundColor?: string;
    style?: any;
}

const IconCloseModern: React.FC<IconProps> = ({
    size = 24,
    color = '#000000',
    backgroundColor = 'rgba(0, 0, 0, 0.05)',
    style
}) => {
    const safeSize = size || 24;
    const safeColor = color || '#000000';

    const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Close">
      <circle cx="12" cy="12" r="10" fill="${backgroundColor}" stroke="none"/>
      <path d="M15 9L9 15M9 9L15 15" stroke="${safeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

    return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconCloseModern;