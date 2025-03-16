import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import apiService from '../../api/apiService';

type AdminCategoriesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminCategories'>;

interface Category {
  id: string;
  name: string;
}

const AdminCategoriesScreen: React.FC = () => {
  const navigation = useNavigation<AdminCategoriesScreenNavigationProp>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from API
  const fetchCategories = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      // In a real app, you would call an API to get categories
      // For now, we'll use mock data
      const mockCategories: Category[] = [
        { id: '1', name: 'Food' },
        { id: '2', name: 'Drinks' },
        { id: '3', name: 'Snacks' },
        { id: '4', name: 'Household' },
        { id: '5', name: 'Electronics' },
      ];
      
      setCategories(mockCategories);
      setLastUpdated(Date.now());
      return true;
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual sync
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage({ type: 'info', text: 'Syncing categories...' });
    
    try {
      const result = await fetchCategories(true);
      if (result) {
        setSyncMessage({ type: 'success', text: 'Categories synced successfully!' });
      } else {
        setSyncMessage({ type: 'error', text: 'Failed to sync categories' });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSyncMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error syncing categories:', error);
      setSyncMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to sync categories' 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryId}>{item.id}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories Management</Text>
      </View>

      <View style={styles.cacheInfo}>
        <View style={styles.cacheHeader}>
          <View>
            <Text style={styles.cacheTitle}>Categories Cache</Text>
            <Text style={styles.cacheSubtitle}>
              Last updated: {formatDate(lastUpdated)}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.syncButton,
              isSyncing && styles.syncButtonDisabled
            ]}
            onPress={handleSync}
            disabled={isSyncing}
          >
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Syncing...' : 'Sync Categories'}
            </Text>
          </TouchableOpacity>
        </View>

        {syncMessage && (
          <View style={[
            styles.messageContainer,
            syncMessage.type === 'success' ? styles.successMessage :
            syncMessage.type === 'error' ? styles.errorMessage :
            styles.infoMessage
          ]}>
            <Text style={styles.messageText}>{syncMessage.text}</Text>
          </View>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e91e63" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cacheInfo: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cacheHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cacheTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cacheSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  syncButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  syncButtonDisabled: {
    backgroundColor: '#b0bec5',
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  successMessage: {
    backgroundColor: '#e8f5e9',
  },
  errorMessage: {
    backgroundColor: '#ffebee',
  },
  infoMessage: {
    backgroundColor: '#e3f2fd',
  },
  messageText: {
    fontSize: 14,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  categoryItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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

export default AdminCategoriesScreen; 