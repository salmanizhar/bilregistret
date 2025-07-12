import * as React from 'react';
import { Platform } from 'react-native';
import { ExpoBranchViewProps } from './ExpoBranch.types';

export default function ExpoBranchView(props: ExpoBranchViewProps) {
  // Only render if we're on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
