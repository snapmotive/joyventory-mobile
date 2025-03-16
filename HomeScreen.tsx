import React, { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
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
    checkSquareStatus,
    handleItemFound,
    handleSaveItem
  } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Handle barcode scanning or manual entry
  const handleBarcodeScanned = useCallback(async (barcode: string) => {
    if (!barcode || barcode.trim() === '') return;
    
    setIsSearching(true);
    try {
      // Search for the item by barcode
      const response = await apiService.getItemByBarcode(barcode);
      
      if (response.success && response.data) {
        // Item found, navigate to item detail
        navigation.navigate('ItemDetail', { itemId: response.data.id });
      } else {
        // Item not found, create a new one with this barcode
        navigation.navigate('ItemDetail', { barcode });
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      Alert.alert(
        'Scan Error',
        'Failed to process barcode. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSearching(false);
    }
  }, [navigation]);

  // Handle search button press
  const handleSearch = useCallback(() => {
    if (searchQuery.trim() === '') return;
    
    // Check if the search query looks like a barcode (numeric)
    if (/^\d+$/.test(searchQuery)) {
      handleBarcodeScanned(searchQuery);
    } else {
      // Implement text search functionality here
      // For now, just filter the items in the ScanLog component
    }
  }, [searchQuery, handleBarcodeScanned]);

  // Handle search input enter key
  const handleSearchSubmit = useCallback(() => {
    handleSearch();
  }, [handleSearch]);
  
  const handleNewItem = useCallback(() => {
    navigation.navigate('ItemDetail', {});
  }, [navigation]);

  // Add global barcode handler for external scanners
  useEffect(() => {
    // In React Native, we can't use window, so we need a different approach
    // This is a placeholder for where you would set up a barcode scanner listener
    // For example, using a library like react-native-camera or expo-barcode-scanner
    
    return () => {
      // Clean up
    };
  }, [handleBarcodeScanned]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Type or scan barcode..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          editable={!isSearching}
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
          disabled={isSearching || searchQuery.trim() === ''}
        >
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newItemButton} onPress={handleNewItem}>
          <Text style={styles.buttonText}>New Item</Text>
        </TouchableOpacity>
      </View>
      
      <ScanLog
        items={scannedItems}
        onClear={clearScanLog}
        onExport={() => Alert.alert('Export', 'Export functionality not implemented yet')}
        onItemFound={handleItemFound}
        squareStatus={squareStatus}
        isCheckingSquare={isCheckingSquare}
        onRefreshSquareStatus={checkSquareStatus}
        searchQuery={searchQuery}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  newItemButton: {
    backgroundColor: '#34A853',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen; 