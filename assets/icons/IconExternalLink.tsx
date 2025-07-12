import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    style?: any;
}

const IconExternalLink: React.FC<IconProps> = ({
    size = 24,
    color = '#000000',
    style
}) => {
    // Ensure values are never undefined during SSR
    const safeSize = size || 24;
    const safeColor = color || '#000000';
    
    const svgXml = `
    <svg width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="External Link">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="15,3 21,3 21,9" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="10" y1="14" x2="21" y2="3" stroke="${safeColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

    return <SvgXml xml={svgXml} width={safeSize} height={safeSize} style={style} />;
};

export default IconExternalLink;