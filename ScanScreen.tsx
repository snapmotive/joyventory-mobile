import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useStore } from '../lib/store';
import BarcodeScanner from '../components/BarcodeScanner';

type ScanScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const ScanScreen: React.FC = () => {
  const navigation = useNavigation<ScanScreenNavigationProp>();
  const { handleItemFound } = useStore();

  const onBarcodeScanned = useCallback((barcode: string) => {
    handleItemFound(barcode);
    navigation.navigate('Home');
  }, [handleItemFound, navigation]);

  const onCancel = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <BarcodeScanner 
        onBarcodeScanned={onBarcodeScanned} 
        onCancel={onCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default ScanScreen; 