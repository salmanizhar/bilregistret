import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from './index';

const IconInformationCircle: React.FC<IconProps> = ({
    size = 24,
    color = '#000000',
    style
}) => {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            style={style}
        >
            <Path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                fill={color}
            />
        </Svg>
    );
};

export default IconInformationCircle;