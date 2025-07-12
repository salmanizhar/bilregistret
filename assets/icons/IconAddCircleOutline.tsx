import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    style?: any;
}

const IconAddCircleOutline: React.FC<IconProps> = ({
    size = 24,
    color = '#000000',
    style
}) => {
    const safeSize = size || 24;
    const safeColor = color || '#000000';

    const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Add Circle Outline">
      <circle cx="12" cy="12" r="10" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M12 8V16" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 12H16" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

    return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconAddCircleOutline;