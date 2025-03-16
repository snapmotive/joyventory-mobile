import React, { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, TextInput, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useStore } from '../lib/store';
import ScanLog from '../components/ScanLog';
import apiService from '../api/apiService';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { 
    scannedItems, 
    isLoading, 
    clearScanLog, 
    fetchRecentLogs, 
    squareStatus, 
    isCheckingSquare, 
    checkSquareStatus
  } = useStore();
  
  const [manualBarcode, setManualBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Handle manual barcode entry
  const handleManualSearch = async () => {
    if (!manualBarcode || manualBarcode.trim() === '') return;
    
    setIsSearching(true);
    try {
      // Search for the item by barcode
      const response = await apiService.getItemByBarcode(manualBarcode);
      
      if (response.success && response.data) {
        // Item found, navigate to item detail
        navigation.navigate('ItemDetail', { itemId: response.data.id });
      } else {
        // Item not found, create a new one with this barcode
        navigation.navigate('ItemDetail', { barcode: manualBarcode });
      }
    } catch (error) {
      console.error('Error searching barcode:', error);
      Alert.alert(
        'Search Error',
        'Failed to process barcode. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSearching(false);
      setManualBarcode('');
    }
  };
  
  // Create a new item
  const handleCreateNew = () => {
    navigation.navigate('ItemDetail', {});
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Square Status */}
        <View style={[
          styles.statusBar,
          { backgroundColor: squareStatus.connected ? '#dcfce7' : '#fee2e2' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: squareStatus.connected ? '#166534' : '#b91c1c' }
          ]}>
            {squareStatus.message || (squareStatus.connected ? 'Connected to Square' : 'Not connected to Square')}
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={checkSquareStatus}
            disabled={isCheckingSquare}
          >
            <Text style={styles.refreshButtonText}>↻</Text>
          </TouchableOpacity>
        </View>
        
        {/* Manual Barcode Entry */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter barcode manually"
            value={manualBarcode}
            onChangeText={setManualBarcode}
            returnKeyType="search"
            onSubmitEditing={handleManualSearch}
            editable={!isSearching}
          />
          <TouchableOpacity
            style={[styles.searchButton, isSearching && styles.disabledButton]}
            onPress={handleManualSearch}
            disabled={isSearching || !manualBarcode.trim()}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
        
        {/* Create New Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateNew}
        >
          <Text style={styles.createButtonText}>Create New Item</Text>
        </TouchableOpacity>
        
        {/* Scan Log */}
        <View style={styles.scanLogContainer}>
          <ScanLog />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  createButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  scanLogContainer: {
    flex: 1,
  },
});

export default HomeScreen; 