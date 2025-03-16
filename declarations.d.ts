import React from 'react';
import { ViewProps } from 'react-native';

declare module 'expo-barcode-scanner' {
  export interface BarCodeScannerResult {
    type: string;
    data: string;
    cornerPoints?: {
      x: number;
      y: number;
    }[];
  }

  export interface BarCodeScannerProps extends ViewProps {
    onBarCodeScanned?: (result: BarCodeScannerResult) => void;
  }
  
  export class BarCodeScanner extends React.Component<BarCodeScannerProps> {
    static Constants: {
      Type: {
        front: number;
        back: number;
      };
      BarCodeType: any;
    };
    
    static requestPermissionsAsync(): Promise<{ status: string }>;
  }
  
  export default BarCodeScanner;
}

declare module 'expo-camera' {
  import { ViewProps } from 'react-native';
  
  export enum FlashMode {
    off = 0,
    on = 1,
    auto = 2,
    torch = 3,
  }
  
  export enum CameraType {
    front = 1,
    back = 0,
  }
  
  export interface CameraProps extends ViewProps {
    flashMode?: FlashMode;
    type?: CameraType;
    ratio?: string;
    onBarCodeScanned?: (result: any) => void;
  }
  
  export class Camera extends React.Component<CameraProps> {
    static requestPermissionsAsync(): Promise<{ status: string }>;
  }
  
  export default Camera;
}

declare module '@react-navigation/native' {
  export function useNavigation<T = any>(): T;
  export const NavigationContainer: React.ComponentType<any>;
}

declare module '@react-navigation/stack' {
  export function createStackNavigator<T = any>(): {
    Navigator: React.ComponentType<any>;
    Screen: React.ComponentType<any>;
  };
  export type StackNavigationProp<T, K extends keyof T> = any;
} 