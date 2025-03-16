import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SquareItem } from '../types';
import { RootStackParamList } from '../types';

type ItemFormNavigationProp = StackNavigationProp<RootStackParamList, 'ItemDetail'>;

interface ItemFormProps {
  item?: Partial<SquareItem>;
  onSave: (item: Partial<SquareItem>) => void;
  onCancel: () => void;
  squareStatus: {
    connected: boolean;
    error?: string;
    lastSync?: string;
    environment?: string;
  };
  isCheckingSquare: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({
  item,
  onSave,
  onCancel,
  squareStatus,
  isCheckingSquare
}) => {
  const navigation = useNavigation<ItemFormNavigationProp>();
  const [formState, setFormState] = useState<Partial<SquareItem>>({
    name: '',
    description: '',
    category: 'General',
    price: 0,
    sku: '',
    gtin: '',
    taxRedondo: false,
    taxTorrance: false,
    crv5: false,
    crv10: false,
    ...(item || {})
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form state when item changes
  useEffect(() => {
    if (item) {
      setFormState({
        ...formState,
        ...item,
        // Ensure price values are properly formatted
        price: item.price !== undefined ? Number(item.price) : 0,
        locationPrice: item.locationPrice !== undefined ? Number(item.locationPrice) : undefined,
        // Ensure category is set
        category: item.category || 'General'
      });
    }
  }, [item]);

  const handleChange = (name: string, value: string | number | boolean) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.name || formState.name.trim() === '') {
      newErrors.name = 'Name is required';
    }
    
    if (formState.price === undefined || formState.price < 0) {
      newErrors.price = 'Price must be 0 or greater';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onSave(formState);
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {item?.id ? 'Edit Item' : 'Add New Item'}
        </Text>
        <View style={styles.squareStatus}>
          <Text style={[
            styles.squareStatusText,
            { color: squareStatus.connected ? '#4CAF50' : '#F44336' }
          ]}>
            {isCheckingSquare ? 'Checking...' : (squareStatus.connected ? 'Connected' : 'Disconnected')}
          </Text>
          {isCheckingSquare && <ActivityIndicator size="small" color="#2196F3" />}
        </View>
      </View>
      
      <ScrollView style={styles.formContainer}>
        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              value={formState.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholder="Enter item name"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>GTIN/UPC</Text>
              <TextInput
                style={styles.input}
                value={formState.gtin}
                onChangeText={(value) => handleChange('gtin', value)}
                placeholder="Enter GTIN/UPC"
              />
            </View>
            
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>SKU</Text>
              <TextInput
                style={styles.input}
                value={formState.sku}
                onChangeText={(value) => handleChange('sku', value)}
                placeholder="Enter SKU"
              />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={formState.category}
              onChangeText={(value) => handleChange('category', value)}
              placeholder="Enter category"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Price</Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceCurrency}>$</Text>
              <TextInput
                style={[styles.priceInput, errors.price ? styles.inputError : null]}
                value={formState.price?.toString()}
                onChangeText={(value) => {
                  const numValue = value === '' ? 0 : parseFloat(value);
                  if (!isNaN(numValue)) {
                    handleChange('price', numValue);
                  }
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formState.description}
              onChangeText={(value) => handleChange('description', value)}
              placeholder="Enter description"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
        
        {/* Tax & CRV Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax & CRV</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Redondo Beach Tax</Text>
            <Switch
              value={formState.taxRedondo || false}
              onValueChange={(value) => handleChange('taxRedondo', value)}
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Torrance Tax</Text>
            <Switch
              value={formState.taxTorrance || false}
              onValueChange={(value) => handleChange('taxTorrance', value)}
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>CRV 5¢</Text>
            <Switch
              value={formState.crv5 || false}
              onValueChange={(value) => handleChange('crv5', value)}
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>CRV 10¢</Text>
            <Switch
              value={formState.crv10 || false}
              onValueChange={(value) => handleChange('crv10', value)}
            />
          </View>
        </View>
        
        {/* Inventory Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Track Inventory</Text>
            <Switch
              value={formState.trackInventory || false}
              onValueChange={(value) => handleChange('trackInventory', value)}
            />
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button, 
              styles.saveButton,
              isSubmitting && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  squareStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  squareStatusText: {
    fontSize: 12,
    marginRight: 4,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  priceCurrency: {
    paddingHorizontal: 12,
    color: '#666',
  },
  priceInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 0,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ItemForm; 