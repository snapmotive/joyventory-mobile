import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useStore } from '../lib/store';
import { SquareItem } from '../types';
import apiService from '../api/apiService';

interface ItemFormProps {
  item?: SquareItem;
  onSave?: (item: SquareItem) => void;
  onCancel?: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({
  item,
  onSave,
  onCancel
}) => {
  const { handleSaveItem, handleCancel } = useStore();
  
  // Initialize form state with item data or defaults
  const [formData, setFormData] = useState<SquareItem>({
    id: item?.id || 'new',
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    sku: item?.sku || '',
    gtin: item?.gtin || '',
    barcode: item?.barcode || '',
    quantity: item?.quantity || 0,
    category: item?.category || '',
    crv: item?.crv || false,
    crv5: item?.crv5 || false,
    crv10: item?.crv10 || false,
    tax: item?.tax || false,
    taxRedondo: item?.taxRedondo || false,
    taxTorrance: item?.taxTorrance || false,
    locationPrice: item?.locationPrice || 0,
    trackInventory: item?.trackInventory || false,
    sellable: item?.sellable || true,
    stockable: item?.stockable || true,
    type: item?.type || 'REGULAR',
    tracking_type: item?.tracking_type || 'NONE',
    price_type: item?.price_type || 'FIXED'
  });
  
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle form field changes
  const handleChange = (field: keyof SquareItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.price && formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    if (formData.quantity && formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Use the provided onSave callback or the store action
      if (onSave) {
        onSave(formData);
      } else {
        await handleSaveItem(formData);
      }
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle cancellation
  const handleCancelForm = () => {
    if (onCancel) {
      onCancel();
    } else {
      handleCancel();
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholder="Item name"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textArea}
                value={formData.description}
                onChangeText={(value) => handleChange('description', value)}
                placeholder="Item description"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(value) => handleChange('category', value)}
                placeholder="Category"
              />
              {categories.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoriesContainer}
                >
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        formData.category === category && styles.selectedCategoryChip
                      ]}
                      onPress={() => handleChange('category', category)}
                    >
                      <Text 
                        style={[
                          styles.categoryChipText,
                          formData.category === category && styles.selectedCategoryChipText
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
          
          {/* Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Price ($)</Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                value={formData.price?.toString() || '0'}
                onChangeText={(value) => handleChange('price', parseFloat(value) || 0)}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Location Price ($)</Text>
              <TextInput
                style={styles.input}
                value={formData.locationPrice?.toString() || '0'}
                onChangeText={(value) => handleChange('locationPrice', parseFloat(value) || 0)}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Tax</Text>
              <Switch
                value={formData.tax}
                onValueChange={(value) => handleChange('tax', value)}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Tax (Redondo)</Text>
              <Switch
                value={formData.taxRedondo}
                onValueChange={(value) => handleChange('taxRedondo', value)}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Tax (Torrance)</Text>
              <Switch
                value={formData.taxTorrance}
                onValueChange={(value) => handleChange('taxTorrance', value)}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>CRV</Text>
              <Switch
                value={formData.crv}
                onValueChange={(value) => handleChange('crv', value)}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>CRV 5¢</Text>
              <Switch
                value={formData.crv5}
                onValueChange={(value) => handleChange('crv5', value)}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>CRV 10¢</Text>
              <Switch
                value={formData.crv10}
                onValueChange={(value) => handleChange('crv10', value)}
              />
            </View>
          </View>
          
          {/* Inventory */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inventory</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={[styles.input, errors.quantity && styles.inputError]}
                value={formData.quantity?.toString() || '0'}
                onChangeText={(value) => handleChange('quantity', parseInt(value) || 0)}
                keyboardType="number-pad"
                placeholder="0"
              />
              {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Track Inventory</Text>
              <Switch
                value={formData.trackInventory}
                onValueChange={(value) => handleChange('trackInventory', value)}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Sellable</Text>
              <Switch
                value={formData.sellable}
                onValueChange={(value) => handleChange('sellable', value)}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Stockable</Text>
              <Switch
                value={formData.stockable}
                onValueChange={(value) => handleChange('stockable', value)}
              />
            </View>
          </View>
          
          {/* Identifiers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identifiers</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Barcode</Text>
              <TextInput
                style={styles.input}
                value={formData.barcode}
                onChangeText={(value) => handleChange('barcode', value)}
                placeholder="Barcode"
                editable={true}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>SKU</Text>
              <TextInput
                style={styles.input}
                value={formData.sku}
                onChangeText={(value) => handleChange('sku', value)}
                placeholder="SKU"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>GTIN</Text>
              <TextInput
                style={styles.input}
                value={formData.gtin}
                onChangeText={(value) => handleChange('gtin', value)}
                placeholder="GTIN"
              />
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelForm}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#334155',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#64748b',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#334155',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoryChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#3b82f6',
  },
  categoryChipText: {
    color: '#64748b',
    fontSize: 14,
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ItemForm; 