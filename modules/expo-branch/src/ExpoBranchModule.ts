import { NativeModule, requireNativeModule } from 'expo';

import { ExpoBranchModuleEvents } from './ExpoBranch.types';

declare class ExpoBranchModule extends NativeModule<ExpoBranchModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoBranchModule>('ExpoBranch');
