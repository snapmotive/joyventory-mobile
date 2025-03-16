import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, SquareItem } from '../types';
import { useStore } from '../lib/store';
import ItemForm from '../components/ItemForm';
import apiService from '../api/apiService';

type ItemDetailRouteProp = RouteProp<RootStackParamList, 'ItemDetail'>;
type ItemDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ItemDetail'>;

const ItemDetailScreen: React.FC = () => {
  const route = useRoute<ItemDetailRouteProp>();
  const navigation = useNavigation<ItemDetailNavigationProp>();
  const { itemId, barcode } = route.params || {};
  
  const { handleSaveItem, handleCancel } = useStore();
  const [item, setItem] = useState<SquareItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch item details if itemId is provided
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!itemId) {
        // Create a new item with the provided barcode
        if (barcode) {
          setItem({
            id: 'new',
            name: '',
            barcode,
          });
        } else {
          // Create a completely new item
          setItem({
            id: 'new',
            name: '',
          });
        }
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await apiService.getItemById(itemId);
        if (response.success && response.data) {
          setItem(response.data);
        } else {
          Alert.alert(
            'Error',
            response.error || 'Failed to fetch item details',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } catch (error) {
        console.error('Error fetching item details:', error);
        Alert.alert(
          'Error',
          'Failed to fetch item details',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [itemId, barcode, navigation]);
  
  // Handle save
  const handleSave = async (updatedItem: SquareItem) => {
    try {
      await handleSaveItem(updatedItem);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item');
    }
  };
  
  // Handle cancel
  const onCancel = () => {
    handleCancel();
    navigation.goBack();
  };
  
  // Handle delete
  const handleDelete = () => {
    if (!item || item.id === 'new') return;
    
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await apiService.deleteItem(item.id);
              if (response.success) {
                navigation.goBack();
              } else {
                Alert.alert('Error', response.error || 'Failed to delete item');
              }
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };
  
  // Handle print label
  const handlePrintLabel = async () => {
    if (!item || item.id === 'new') {
      Alert.alert('Error', 'Please save the item before printing a label');
      return;
    }
    
    try {
      const response = await apiService.printLabel(item.id);
      if (response.success) {
        Alert.alert('Success', 'Label sent to printer');
      } else {
        Alert.alert('Error', response.error || 'Failed to print label');
      }
    } catch (error) {
      console.error('Error printing label:', error);
      Alert.alert('Error', 'Failed to print label');
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {item && (
        <>
          <ItemForm 
            item={item} 
            onSave={handleSave} 
            onCancel={onCancel} 
          />
          
          {item.id !== 'new' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.printButton}
                onPress={handlePrintLabel}
              >
                <Text style={styles.printButtonText}>Print Label</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete Item</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  printButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  printButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ItemDetailScreen; 