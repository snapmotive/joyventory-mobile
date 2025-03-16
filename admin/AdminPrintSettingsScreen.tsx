import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  TextInput,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type AdminPrintSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminPrintSettings'>;

interface PrintSettings {
  enabled: boolean;
  printerName: string;
  paperWidth: string;
  paperHeight: string;
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;
  showLogo: boolean;
  logoUrl: string;
  showBarcode: boolean;
  showPrice: boolean;
  showSku: boolean;
  showCategory: boolean;
  fontSize: string;
  fontFamily: string;
}

const AdminPrintSettingsScreen: React.FC = () => {
  const navigation = useNavigation<AdminPrintSettingsScreenNavigationProp>();
  
  // Mock print settings data
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    enabled: true,
    printerName: 'EPSON TM-T20III',
    paperWidth: '80',
    paperHeight: '297',
    marginTop: '5',
    marginRight: '5',
    marginBottom: '5',
    marginLeft: '5',
    showLogo: true,
    logoUrl: 'https://example.com/logo.png',
    showBarcode: true,
    showPrice: true,
    showSku: false,
    showCategory: true,
    fontSize: '12',
    fontFamily: 'Arial',
  });

  // Toggle boolean settings
  const toggleSetting = (key: keyof PrintSettings) => {
    if (typeof printSettings[key] === 'boolean') {
      setPrintSettings({
        ...printSettings,
        [key]: !printSettings[key],
      });
    }
  };

  // Update text settings
  const updateSetting = (key: keyof PrintSettings, value: string) => {
    setPrintSettings({
      ...printSettings,
      [key]: value,
    });
  };

  // Test print function
  const testPrint = () => {
    // In a real app, this would send a test print job
    Alert.alert(
      'Test Print',
      'A test label would be printed with the current settings.',
      [{ text: 'OK' }]
    );
  };

  // Save settings
  const saveSettings = () => {
    // In a real app, this would save settings to an API
    Alert.alert(
      'Settings Saved',
      'Print settings have been saved successfully.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Print Settings</Text>
        <Text style={styles.subtitle}>
          Configure how labels are printed for inventory items.
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Printer Configuration</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Printing</Text>
            <Switch
              value={printSettings.enabled}
              onValueChange={() => toggleSetting('enabled')}
              trackColor={{ false: '#d1d5db', true: '#e91e63' }}
              thumbColor={printSettings.enabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Printer Name</Text>
            <TextInput
              style={styles.textInput}
              value={printSettings.printerName}
              onChangeText={(value) => updateSetting('printerName', value)}
              placeholder="Enter printer name"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paper Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Width (mm)</Text>
            <TextInput
              style={styles.numberInput}
              value={printSettings.paperWidth}
              onChangeText={(value) => updateSetting('paperWidth', value)}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Height (mm)</Text>
            <TextInput
              style={styles.numberInput}
              value={printSettings.paperHeight}
              onChangeText={(value) => updateSetting('paperHeight', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Margins (mm)</Text>
          
          <View style={styles.marginContainer}>
            <View style={styles.marginRow}>
              <Text style={styles.settingLabel}>Top</Text>
              <TextInput
                style={styles.numberInput}
                value={printSettings.marginTop}
                onChangeText={(value) => updateSetting('marginTop', value)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.marginRow}>
              <Text style={styles.settingLabel}>Right</Text>
              <TextInput
                style={styles.numberInput}
                value={printSettings.marginRight}
                onChangeText={(value) => updateSetting('marginRight', value)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.marginRow}>
              <Text style={styles.settingLabel}>Bottom</Text>
              <TextInput
                style={styles.numberInput}
                value={printSettings.marginBottom}
                onChangeText={(value) => updateSetting('marginBottom', value)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.marginRow}>
              <Text style={styles.settingLabel}>Left</Text>
              <TextInput
                style={styles.numberInput}
                value={printSettings.marginLeft}
                onChangeText={(value) => updateSetting('marginLeft', value)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Logo</Text>
            <Switch
              value={printSettings.showLogo}
              onValueChange={() => toggleSetting('showLogo')}
              trackColor={{ false: '#d1d5db', true: '#e91e63' }}
              thumbColor={printSettings.showLogo ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          {printSettings.showLogo && (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Logo URL</Text>
              <TextInput
                style={styles.textInput}
                value={printSettings.logoUrl}
                onChangeText={(value) => updateSetting('logoUrl', value)}
                placeholder="Enter logo URL"
              />
            </View>
          )}
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Barcode</Text>
            <Switch
              value={printSettings.showBarcode}
              onValueChange={() => toggleSetting('showBarcode')}
              trackColor={{ false: '#d1d5db', true: '#e91e63' }}
              thumbColor={printSettings.showBarcode ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Price</Text>
            <Switch
              value={printSettings.showPrice}
              onValueChange={() => toggleSetting('showPrice')}
              trackColor={{ false: '#d1d5db', true: '#e91e63' }}
              thumbColor={printSettings.showPrice ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show SKU</Text>
            <Switch
              value={printSettings.showSku}
              onValueChange={() => toggleSetting('showSku')}
              trackColor={{ false: '#d1d5db', true: '#e91e63' }}
              thumbColor={printSettings.showSku ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Category</Text>
            <Switch
              value={printSettings.showCategory}
              onValueChange={() => toggleSetting('showCategory')}
              trackColor={{ false: '#d1d5db', true: '#e91e63' }}
              thumbColor={printSettings.showCategory ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Font Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Font Size (pt)</Text>
            <TextInput
              style={styles.numberInput}
              value={printSettings.fontSize}
              onChangeText={(value) => updateSetting('fontSize', value)}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Font Family</Text>
            <TextInput
              style={styles.textInput}
              value={printSettings.fontFamily}
              onChangeText={(value) => updateSetting('fontFamily', value)}
              placeholder="Enter font family"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testPrint}
          >
            <Text style={styles.testButtonText}>Test Print</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
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
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  textInput: {
    flex: 2,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  numberInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  marginContainer: {
    marginTop: 8,
  },
  marginRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  testButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
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

export default AdminPrintSettingsScreen; 