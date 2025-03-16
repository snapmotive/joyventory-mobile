import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, SquareItem } from '../types';
import { useStore } from '../lib/store';

type ItemDetailScreenRouteProp = RouteProp<RootStackParamList, 'ItemDetail'>;
type ItemDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ItemDetail'>;

const ItemDetailScreen: React.FC = () => {
  const navigation = useNavigation<ItemDetailScreenNavigationProp>();
  const route = useRoute<ItemDetailScreenRouteProp>();
  const { itemId, barcode } = route.params;
  
  const { handleSaveItem, handleCancel, selectedItem, isLoading } = useStore();
  
  const [item, setItem] = useState<SquareItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form with selected item or create new item if barcode is provided
  useEffect(() => {
    if (selectedItem) {
      setItem(selectedItem);
    } else if (!itemId && barcode) {
      // Create a new item with the scanned barcode
      const newItem: SquareItem = {
        id: '',
        name: '',
        category: '',
        gtin: barcode,
        sku: '',
        price: 0,
        tax: false,
        crv: false,
        timestamp: new Date().toISOString()
      };
      setItem(newItem);
      setIsEditing(true); // Auto-enable editing for new items
    }
  }, [selectedItem, itemId, barcode]);

  const handleInputChange = useCallback((field: keyof SquareItem, value: string | number) => {
    if (!item) return;
    
    setItem(prev => {
      if (!prev) return prev;
      
      // Handle numeric fields
      if (field === 'price' || field === 'tax' || field === 'crv') {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        return { ...prev, [field]: numValue };
      }
      
      return { ...prev, [field]: value };
    });
  }, [item]);

  const handleSave = useCallback(() => {
    if (!item) return;
    
    // Validate required fields
    if (!item.name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }
    
    handleSaveItem(item);
    navigation.goBack();
  }, [item, handleSaveItem, navigation]);

  const handleCancelEdit = useCallback(() => {
    if (itemId) {
      // If editing existing item, revert to original
      setItem(selectedItem);
      setIsEditing(false);
    } else {
      // If creating new item, go back
      handleCancel();
      navigation.goBack();
    }
  }, [itemId, selectedItem, handleCancel, navigation]);

  if (isLoading || !item) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {isEditing ? (itemId ? 'Edit Item' : 'New Item') : 'Item Details'}
          </Text>
          {itemId && !isEditing && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={item.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Item name"
            editable={isEditing}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={item.category}
            onChangeText={(value) => handleInputChange('category', value)}
            placeholder="Category"
            editable={isEditing}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Barcode (GTIN)</Text>
          <TextInput
            style={styles.input}
            value={item.gtin}
            onChangeText={(value) => handleInputChange('gtin', value)}
            placeholder="Barcode"
            editable={isEditing}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>SKU</Text>
          <TextInput
            style={styles.input}
            value={item.sku}
            onChangeText={(value) => handleInputChange('sku', value)}
            placeholder="SKU"
            editable={isEditing}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={styles.input}
              value={item.price !== undefined ? item.price.toString() : '0'}
              onChangeText={(value) => handleInputChange('price', value)}
              placeholder="0.00"
              editable={isEditing}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Tax</Text>
            <TextInput
              style={styles.input}
              value={item.tax !== undefined ? item.tax.toString() : 'false'}
              onChangeText={(value) => handleInputChange('tax', value)}
              placeholder="false"
              editable={isEditing}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>CRV</Text>
          <TextInput
            style={styles.input}
            value={item.crv !== undefined ? item.crv.toString() : 'false'}
            onChangeText={(value) => handleInputChange('crv', value)}
            placeholder="false"
            editable={isEditing}
          />
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancelEdit}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ItemDetailScreen; 