import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    style?: any;
}

const IconRefresh: React.FC<IconProps> = ({
    size = 24,
    color = '#000000',
    style
}) => {
    const safeSize = size || 24;
    const safeColor = color || '#000000';

    const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Refresh">
      <path d="M3 12C3 7.02944 7.02944 3 12 3C14.8273 3 17.2806 4.48056 18.7806 6.75L21 4.5V9H16.5L18.7806 6.75" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 12C21 16.9706 16.9706 21 12 21C9.17270 21 6.71944 19.5194 5.21944 17.25L3 19.5V15H7.5L5.21944 17.25" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

    return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconRefresh;