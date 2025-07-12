import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    style?: any;
}

const IconHeartOutline: React.FC<IconProps> = ({
    size = 24,
    color = '#000000',
    style
}) => {
    const safeSize = size || 24;
    const safeColor = color || '#000000';

    const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Heart Outline">
      <path d="M20.84 4.61A5.5 5.5 0 0 0 16.5 2.5C14.76 2.5 13.5 3.42 12 5C10.5 3.42 9.24 2.5 7.5 2.5A5.5 5.5 0 0 0 3.16 4.61C1.84 5.95 1.84 8.05 3.16 9.39L12 18.83L20.84 9.39C22.16 8.05 22.16 5.95 20.84 4.61Z" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  `;

    return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconHeartOutline;