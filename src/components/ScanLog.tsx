import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import { useStore } from '../lib/store';
import { ScanLogItem } from '../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type ScanLogNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const ScanLog: React.FC = () => {
  const { 
    scannedItems, 
    isLoading, 
    clearScanLog, 
    fetchRecentLogs 
  } = useStore();
  
  const navigation = useNavigation<ScanLogNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter items based on search query
  const filteredItems = searchQuery.trim() === '' 
    ? scannedItems 
    : scannedItems.filter(item => {
        const itemNameMatch = item.itemName && item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
        const barcodeMatch = item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase());
        return itemNameMatch || barcodeMatch;
      });
  
  // Handle item selection
  const handleItemPress = (item: ScanLogItem) => {
    navigation.navigate('ItemDetail', { itemId: item.id });
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render each scan log item
  const renderItem = ({ item }: { item: ScanLogItem }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.barcode}>{item.barcode}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      {item.itemName && (
        <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
          {item.itemName}
        </Text>
      )}
    </TouchableOpacity>
  );
  
  // Handle clear log confirmation
  const handleClearLog = () => {
    Alert.alert(
      'Clear Scan Log',
      'Are you sure you want to clear the scan log?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: clearScanLog
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Scans</Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchRecentLogs}
            disabled={isLoading}
          >
            <Text style={styles.refreshButtonText}>↻</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearLog}
            disabled={isLoading || scannedItems.length === 0}
          >
            <Text style={[
              styles.clearButtonText,
              (isLoading || scannedItems.length === 0) && styles.disabledText
            ]}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search scans..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading scan log...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim() !== '' 
              ? 'No matching scans found' 
              : 'No recent scans'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems as ScanLogItem[]}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 18,
    color: '#334155',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#fee2e2',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  disabledText: {
    opacity: 0.5,
  },
  searchInput: {
    margin: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    backgroundColor: '#f8fafc',
  },
  list: {
    padding: 12,
  },
  item: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  barcode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748b',
  },
  itemName: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default ScanLog; 