import { Platform } from 'react-native';

// Web-specific implementation of ExpoBranch module
const ExpoBranchModule = {
  PI: Math.PI,
  hello: () => 'Hello from web!',
  setValueAsync: async (value: string) => {
    if (Platform.OS === 'web') {
      // console.log('Web platform: setValueAsync called with', value);
    }
  }
};

export default ExpoBranchModule;
