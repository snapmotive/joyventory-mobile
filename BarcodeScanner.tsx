import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { CameraView, FlashMode, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigation, useIsFocused } from '@react-navigation/native';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
  onCancel: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeScanned, onCancel }) => {
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'torch'>('off');
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    onBarcodeScanned(data);
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === 'off' ? 'torch' : 'off'
    );
  };

  if (!permission) {
    return <Text>Requesting for camera permission</Text>;
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Only render the camera when the screen is focused
  if (!isFocused) {
    return <View style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashMode === 'torch'}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'code93', 'upc_e'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.unfilled} />
          <View style={styles.row}>
            <View style={styles.unfilled} />
            <View style={styles.filled} />
            <View style={styles.unfilled} />
          </View>
          <View style={styles.unfilled} />
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={toggleFlash}
          >
            <Text style={styles.buttonText}>
              {flashMode === 'off' ? 'Flash On' : 'Flash Off'}
            </Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  unfilled: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  row: {
    flexDirection: 'row',
    height: 200,
  },
  filled: {
    width: 200,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BarcodeScanner; 