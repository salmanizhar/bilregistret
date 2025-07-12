import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoBranchViewProps } from './ExpoBranch.types';

const NativeView: React.ComponentType<ExpoBranchViewProps> =
  requireNativeView('ExpoBranch');

export default function ExpoBranchView(props: ExpoBranchViewProps) {
  return <NativeView {...props} />;
}
