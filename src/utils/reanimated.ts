import { Platform } from 'react-native';

// Declare global type for our custom function
declare global {
  interface Global {
    __scanCodes?: () => void;
  }
}

// This file ensures that Reanimated is properly initialized
// It should be imported early in the app lifecycle

// Workaround for Reanimated issues on iOS
if (Platform.OS === 'ios') {
  // This is a workaround for some issues with Reanimated on iOS
  // The empty function is used to ensure the JS engine properly initializes
  (global as any).__scanCodes = () => {};
}

export default {
  // This is just a placeholder to ensure the file is imported
  initialized: true
}; 