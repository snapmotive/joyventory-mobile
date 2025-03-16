import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SquareItem, ScanLogItem, SquareStatus } from '../types';
import { RootStackParamList } from '../types';

type ScanLogNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface ScanLogProps {
  items: SquareItem[];
  onClear: () => void;
  onExport: () => void;
  onItemFound: (itemId: string) => void;
  squareStatus: SquareStatus;
  isCheckingSquare: boolean;
  onRefreshSquareStatus: () => void;
  searchQuery?: string;
}

const ScanLog: React.FC<ScanLogProps> = ({
  items,
  onClear,
  onExport,
  onItemFound,
  squareStatus,
  isCheckingSquare,
  onRefreshSquareStatus,
  searchQuery = ''
}) => {
  const navigation = useNavigation<ScanLogNavigationProp>();
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const [refreshing, setRefreshing] = useState(false);

  // Filter items based on search query
  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      (item.name?.toLowerCase().includes(query) || false) ||
      (item.sku?.toLowerCase().includes(query) || false) ||
      (item.gtin?.toLowerCase().includes(query) || false) ||
      (item.category?.toLowerCase().includes(query) || false)
    );
    
    // Apply category filter if not "All Categories"
    const matchesCategory = categoryFilter === 'All Categories' || 
      item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Sort items based on selected option
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    } else if (sortOption === 'oldest') {
      return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await onRefreshSquareStatus();
    setRefreshing(false);
  };

  // Format tax display
  const formatTaxDisplay = (item: SquareItem) => {
    if (!item.tax) return 'No Tax';
    
    const taxLocations = [];
    if (item.taxRedondo) taxLocations.push('RB');
    if (item.taxTorrance) taxLocations.push('TOR');
    
    if (taxLocations.length === 0) return '+TAX';
    return `+TAX (${taxLocations.join(', ')})`;
  };
  
  // Format CRV display
  const formatCrvDisplay = (item: SquareItem) => {
    if (!item.crv && !item.crv5 && !item.crv10) return 'No CRV';
    
    if (item.crv5) return '+CRV (CRV5)';
    if (item.crv10) return '+CRV (CRV10)';
    if (item.crv) return '+CRV';
    
    return 'No CRV';
  };

  const renderItem = ({ item, index }: { item: SquareItem; index: number }) => {
    const taxDisplay = formatTaxDisplay(item);
    const crvDisplay = formatCrvDisplay(item);
    const timestamp = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown';
    
    // Calculate item number based on sort order
    const itemNumber = sortOption === 'newest' ? index + 1 : sortedItems.length - index;
    
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => {
          onItemFound(item.id);
          navigation.navigate('ItemDetail', { itemId: item.id });
        }}
      >
        <View style={styles.indexContainer}>
          <Text style={styles.indexText}>{itemNumber}</Text>
        </View>
        
        <View style={styles.itemContent}>
          <View style={styles.itemMainInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemCategory}>{item.category || 'Uncategorized'}</Text>
            <Text style={styles.itemInfo}>GTIN: {item.gtin || item.barcode || 'N/A'}</Text>
            <Text style={styles.itemInfo}>SKU: {item.sku || 'N/A'}</Text>
          </View>
          
          <View style={styles.itemPricing}>
            <Text style={styles.itemPrice}>${(item.price || 0).toFixed(2)}</Text>
            <Text style={styles.itemTax}>{taxDisplay}</Text>
            <Text style={styles.itemCrv}>{crvDisplay}</Text>
            <Text style={styles.itemTimestamp}>{timestamp}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Scan Log</Text>
          <View style={styles.squareStatusContainer}>
            {!squareStatus.connected ? (
              <View style={styles.squareErrorContainer}>
                <View style={styles.squareErrorDot} />
                <Text style={styles.squareErrorText}>
                  Not connected to Square
                </Text>
              </View>
            ) : (
              <View style={styles.squareConnectedContainer}>
                <Text style={styles.squareConnectedText}>
                  {squareStatus.environment || 'production'}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefreshSquareStatus}
              disabled={isCheckingSquare}
            >
              <Text style={styles.refreshButtonText}>⟳</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={styles.categoryFilterButton}
            onPress={() => {
              // This would open a category picker in a real implementation
              setCategoryFilter(categoryFilter === 'All Categories' ? 'Food' : 'All Categories');
            }}
          >
            <Text style={styles.filterButtonText}>{categoryFilter}</Text>
            <Text style={styles.filterButtonIcon}>▼</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sortFilterButton}
            onPress={() => {
              // Cycle through sort options
              if (sortOption === 'newest') setSortOption('oldest');
              else if (sortOption === 'oldest') setSortOption('name');
              else setSortOption('newest');
            }}
          >
            <Text style={styles.filterButtonText}>
              {sortOption === 'newest' ? 'Newest First' : 
               sortOption === 'oldest' ? 'Oldest First' : 'Name'}
            </Text>
            <Text style={styles.filterButtonIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {squareStatus.error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            Error: Square API error: {squareStatus.error}
          </Text>
        </View>
      )}

      <FlatList
        data={sortedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={onClear}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.exportButton]}
          onPress={onExport}
        >
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  squareStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  squareErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  squareErrorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f44336',
    marginRight: 6,
  },
  squareErrorText: {
    fontSize: 12,
    color: '#d32f2f',
  },
  squareConnectedContainer: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  squareConnectedText: {
    fontSize: 12,
    color: '#2e7d32',
  },
  refreshButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  refreshButtonText: {
    fontSize: 18,
    color: '#2196f3',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  filterButtonIcon: {
    fontSize: 10,
    color: '#666',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  listContent: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 4,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  indexContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  indexText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
  },
  itemMainInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemInfo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  itemPricing: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemTax: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemCrv: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemTimestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  exportButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ScanLog; 