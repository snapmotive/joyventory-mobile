import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type AdminItemFieldsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminItemFields'>;

interface ItemField {
  id: string;
  name: string;
  enabled: boolean;
  required: boolean;
  defaultValue?: string;
  order: number;
}

const AdminItemFieldsScreen: React.FC = () => {
  const navigation = useNavigation<AdminItemFieldsScreenNavigationProp>();
  
  // Mock item fields data
  const [itemFields, setItemFields] = useState<ItemField[]>([
    { id: 'name', name: 'Name', enabled: true, required: true, order: 1 },
    { id: 'price', name: 'Price', enabled: true, required: true, order: 2 },
    { id: 'sku', name: 'SKU', enabled: true, required: false, order: 3 },
    { id: 'gtin', name: 'GTIN/UPC', enabled: true, required: false, order: 4 },
    { id: 'category', name: 'Category', enabled: true, required: false, defaultValue: 'General', order: 5 },
    { id: 'description', name: 'Description', enabled: true, required: false, order: 6 },
    { id: 'taxRedondo', name: 'Redondo Beach Tax', enabled: true, required: false, order: 7 },
    { id: 'taxTorrance', name: 'Torrance Tax', enabled: true, required: false, order: 8 },
    { id: 'crv5', name: 'CRV 5¢', enabled: true, required: false, order: 9 },
    { id: 'crv10', name: 'CRV 10¢', enabled: true, required: false, order: 10 },
  ]);

  // Toggle field enabled state
  const toggleFieldEnabled = (id: string) => {
    setItemFields(fields => 
      fields.map(field => 
        field.id === id ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  // Toggle field required state
  const toggleFieldRequired = (id: string) => {
    setItemFields(fields => 
      fields.map(field => 
        field.id === id ? { ...field, required: !field.required } : field
      )
    );
  };

  // Update field default value
  const updateDefaultValue = (id: string, value: string) => {
    setItemFields(fields => 
      fields.map(field => 
        field.id === id ? { ...field, defaultValue: value } : field
      )
    );
  };

  // Move field up in order
  const moveFieldUp = (id: string) => {
    const index = itemFields.findIndex(field => field.id === id);
    if (index <= 0) return; // Already at the top
    
    const newFields = [...itemFields];
    const temp = newFields[index - 1].order;
    newFields[index - 1].order = newFields[index].order;
    newFields[index].order = temp;
    
    setItemFields(newFields.sort((a, b) => a.order - b.order));
  };

  // Move field down in order
  const moveFieldDown = (id: string) => {
    const index = itemFields.findIndex(field => field.id === id);
    if (index >= itemFields.length - 1) return; // Already at the bottom
    
    const newFields = [...itemFields];
    const temp = newFields[index + 1].order;
    newFields[index + 1].order = newFields[index].order;
    newFields[index].order = temp;
    
    setItemFields(newFields.sort((a, b) => a.order - b.order));
  };

  // Save changes
  const saveChanges = () => {
    // In a real app, you would call an API to save the changes
    // For now, just show an alert
    alert('Changes saved successfully!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Item Fields Configuration</Text>
        <Text style={styles.subtitle}>
          Configure which fields are visible in the item form, their order, and default values.
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {itemFields.map((field) => (
          <View key={field.id} style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldName}>{field.name}</Text>
              <Switch
                value={field.enabled}
                onValueChange={() => toggleFieldEnabled(field.id)}
                trackColor={{ false: '#d1d5db', true: '#e91e63' }}
                thumbColor={field.enabled ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            {field.enabled && (
              <View style={styles.fieldOptions}>
                <View style={styles.optionRow}>
                  <Text style={styles.optionLabel}>Required</Text>
                  <Switch
                    value={field.required}
                    onValueChange={() => toggleFieldRequired(field.id)}
                    trackColor={{ false: '#d1d5db', true: '#e91e63' }}
                    thumbColor={field.required ? '#fff' : '#f4f3f4'}
                    disabled={field.id === 'name'} // Name is always required
                  />
                </View>
                
                <View style={styles.optionRow}>
                  <Text style={styles.optionLabel}>Default Value</Text>
                  <TextInput
                    style={styles.defaultValueInput}
                    value={field.defaultValue || ''}
                    onChangeText={(value) => updateDefaultValue(field.id, value)}
                    placeholder="No default"
                  />
                </View>
                
                <View style={styles.orderButtons}>
                  <TouchableOpacity
                    style={[styles.orderButton, field.order === 1 && styles.disabledButton]}
                    onPress={() => moveFieldUp(field.id)}
                    disabled={field.order === 1}
                  >
                    <Text style={styles.orderButtonText}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.orderButton, field.order === itemFields.length && styles.disabledButton]}
                    onPress={() => moveFieldDown(field.id)}
                    disabled={field.order === itemFields.length}
                  >
                    <Text style={styles.orderButtonText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveChanges}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  fieldContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fieldOptions: {
    padding: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    color: '#666',
  },
  defaultValueInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginLeft: 16,
    backgroundColor: 'white',
  },
  orderButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  orderButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginLeft: 8,
  },
  orderButtonText: {
    fontSize: 16,
    color: '#333',
  },
  disabledButton: {
    opacity: 0.5,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AdminItemFieldsScreen; 