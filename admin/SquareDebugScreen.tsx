import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useStore } from '../../lib/store';

type SquareDebugScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SquareDebug'>;

interface ApiResponse {
  status: 'success' | 'error';
  timestamp: string;
  endpoint: string;
  requestData?: any;
  responseData?: any;
  error?: string;
}

const SquareDebugScreen: React.FC = () => {
  const navigation = useNavigation<SquareDebugScreenNavigationProp>();
  const { squareAccessToken, setSquareAccessToken } = useStore();
  
  const [accessToken, setAccessToken] = useState(squareAccessToken || '');
  const [locationId, setLocationId] = useState('');
  const [testEndpoint, setTestEndpoint] = useState('locations');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<ApiResponse[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMethod, setRequestMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  
  // Available endpoints for testing
  const endpoints = [
    'locations',
    'catalog/list',
    'inventory/counts',
    'orders',
    'customers'
  ];

  // Available request methods
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];

  // Test connection to Square API
  const testConnection = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'Please enter an access token');
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, this would make an actual API call
      // For this mock, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse: ApiResponse = {
        status: 'success',
        timestamp: new Date().toISOString(),
        endpoint: 'locations',
        responseData: {
          locations: [
            {
              id: 'L8CQXCVHK2S22',
              name: 'Main Store',
              address: {
                address_line_1: '123 Main St',
                locality: 'San Francisco',
                administrative_district_level_1: 'CA',
                postal_code: '94105',
                country: 'US'
              },
              timezone: 'America/Los_Angeles',
              capabilities: ['CREDIT_CARD_PROCESSING', 'INVENTORY']
            }
          ]
        }
      };
      
      setResponses(prev => [mockResponse, ...prev]);
      setLocationId('L8CQXCVHK2S22'); // Set the first location ID
      
      // Save the token to app state
      setSquareAccessToken(accessToken);
      
      Alert.alert('Success', 'Connected to Square API successfully!');
    } catch (error) {
      const errorResponse: ApiResponse = {
        status: 'error',
        timestamp: new Date().toISOString(),
        endpoint: 'locations',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setResponses(prev => [errorResponse, ...prev]);
      Alert.alert('Error', 'Failed to connect to Square API');
    } finally {
      setLoading(false);
    }
  };

  // Make a test request to a specific endpoint
  const makeTestRequest = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'Please enter an access token');
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, this would make an actual API call
      // For this mock, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let mockResponseData: any = {};
      
      // Generate different mock responses based on the endpoint
      switch (testEndpoint) {
        case 'locations':
          mockResponseData = {
            locations: [
              {
                id: 'L8CQXCVHK2S22',
                name: 'Main Store',
                address: {
                  address_line_1: '123 Main St',
                  locality: 'San Francisco',
                  administrative_district_level_1: 'CA',
                  postal_code: '94105',
                  country: 'US'
                }
              }
            ]
          };
          break;
        case 'catalog/list':
          mockResponseData = {
            objects: [
              {
                type: 'ITEM',
                id: 'X5GRZ5QVVMVGZ2T2IQPJMWG3',
                item_data: {
                  name: 'Soda',
                  description: 'Refreshing carbonated beverage',
                  variations: [
                    {
                      id: 'XVLBN7LQVLJVZKPM4BBWGZCJ',
                      type: 'ITEM_VARIATION',
                      item_variation_data: {
                        item_id: 'X5GRZ5QVVMVGZ2T2IQPJMWG3',
                        name: 'Regular',
                        price_money: {
                          amount: 150,
                          currency: 'USD'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          };
          break;
        case 'inventory/counts':
          mockResponseData = {
            counts: [
              {
                catalog_object_id: 'XVLBN7LQVLJVZKPM4BBWGZCJ',
                catalog_object_type: 'ITEM_VARIATION',
                state: 'IN_STOCK',
                location_id: 'L8CQXCVHK2S22',
                quantity: '25'
              }
            ]
          };
          break;
        case 'orders':
          mockResponseData = {
            orders: [
              {
                id: 'CAISENgvlJ6jLWAzERDzjyHVybY',
                location_id: 'L8CQXCVHK2S22',
                line_items: [
                  {
                    name: 'Soda',
                    quantity: '1',
                    base_price_money: {
                      amount: 150,
                      currency: 'USD'
                    }
                  }
                ],
                total_money: {
                  amount: 150,
                  currency: 'USD'
                }
              }
            ]
          };
          break;
        case 'customers':
          mockResponseData = {
            customers: [
              {
                id: 'JDKYHBWT1D4F8MFH63DBMEN8Y4',
                given_name: 'John',
                family_name: 'Doe',
                email_address: 'john.doe@example.com',
                created_at: '2023-01-15T15:27:30Z'
              }
            ]
          };
          break;
        default:
          mockResponseData = { message: 'Endpoint not implemented in mock' };
      }
      
      const mockResponse: ApiResponse = {
        status: 'success',
        timestamp: new Date().toISOString(),
        endpoint: testEndpoint,
        requestData: requestMethod !== 'GET' ? JSON.parse(requestBody || '{}') : undefined,
        responseData: mockResponseData
      };
      
      setResponses(prev => [mockResponse, ...prev]);
    } catch (error) {
      const errorResponse: ApiResponse = {
        status: 'error',
        timestamp: new Date().toISOString(),
        endpoint: testEndpoint,
        requestData: requestMethod !== 'GET' ? JSON.parse(requestBody || '{}') : undefined,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setResponses(prev => [errorResponse, ...prev]);
      Alert.alert('Error', `Failed to make request to ${testEndpoint}`);
    } finally {
      setLoading(false);
      setShowRequestForm(false);
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Clear all responses
  const clearResponses = () => {
    setResponses([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Square API Debug</Text>
        <Text style={styles.subtitle}>
          Test and debug your Square API integration.
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Access Token</Text>
            <TextInput
              style={styles.textInput}
              value={accessToken}
              onChangeText={setAccessToken}
              placeholder="Enter Square access token"
              secureTextEntry
            />
          </View>
          
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Location ID</Text>
            <TextInput
              style={styles.textInput}
              value={locationId}
              onChangeText={setLocationId}
              placeholder="Will be auto-filled after connection test"
              editable={false}
            />
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={testConnection}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Test Connection</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Request Tester</Text>
          
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Endpoint</Text>
            <View style={styles.pickerContainer}>
              {endpoints.map(endpoint => (
                <TouchableOpacity
                  key={endpoint}
                  style={[
                    styles.endpointButton,
                    testEndpoint === endpoint && styles.activeEndpointButton
                  ]}
                  onPress={() => setTestEndpoint(endpoint)}
                >
                  <Text 
                    style={[
                      styles.endpointButtonText,
                      testEndpoint === endpoint && styles.activeEndpointButtonText
                    ]}
                  >
                    {endpoint}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowRequestForm(!showRequestForm)}
          >
            <Text style={styles.toggleButtonText}>
              {showRequestForm ? 'Hide Request Options' : 'Show Request Options'}
            </Text>
          </TouchableOpacity>
          
          {showRequestForm && (
            <View style={styles.requestForm}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Method</Text>
                <View style={styles.methodButtons}>
                  {methods.map(method => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.methodButton,
                        requestMethod === method && styles.activeMethodButton
                      ]}
                      onPress={() => setRequestMethod(method)}
                    >
                      <Text 
                        style={[
                          styles.methodButtonText,
                          requestMethod === method && styles.activeMethodButtonText
                        ]}
                      >
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {requestMethod !== 'GET' && (
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Request Body (JSON)</Text>
                  <TextInput
                    style={styles.jsonInput}
                    value={requestBody}
                    onChangeText={setRequestBody}
                    placeholder='{"example": "value"}'
                    multiline
                    numberOfLines={4}
                  />
                </View>
              )}
            </View>
          )}
          
          <TouchableOpacity
            style={styles.button}
            onPress={makeTestRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Send Request</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.responseHeader}>
            <Text style={styles.sectionTitle}>Response History</Text>
            {responses.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearResponses}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {responses.length === 0 ? (
            <Text style={styles.emptyText}>No requests have been made yet.</Text>
          ) : (
            responses.map((response, index) => (
              <View key={index} style={styles.responseItem}>
                <View style={styles.responseHeader}>
                  <Text style={[
                    styles.responseStatus,
                    response.status === 'success' ? styles.successText : styles.errorText
                  ]}>
                    {response.status.toUpperCase()}
                  </Text>
                  <Text style={styles.responseTimestamp}>{formatDate(response.timestamp)}</Text>
                </View>
                
                <Text style={styles.responseEndpoint}>
                  {requestMethod} {response.endpoint}
                </Text>
                
                {response.requestData && (
                  <View style={styles.dataSection}>
                    <Text style={styles.dataSectionTitle}>Request:</Text>
                    <Text style={styles.jsonText}>
                      {JSON.stringify(response.requestData, null, 2)}
                    </Text>
                  </View>
                )}
                
                {response.responseData && (
                  <View style={styles.dataSection}>
                    <Text style={styles.dataSectionTitle}>Response:</Text>
                    <Text style={styles.jsonText}>
                      {JSON.stringify(response.responseData, null, 2)}
                    </Text>
                  </View>
                )}
                
                {response.error && (
                  <View style={styles.dataSection}>
                    <Text style={styles.dataSectionTitle}>Error:</Text>
                    <Text style={[styles.jsonText, styles.errorText]}>
                      {response.error}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  inputRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  endpointButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    marginBottom: 8,
  },
  activeEndpointButton: {
    backgroundColor: '#e91e63',
  },
  endpointButtonText: {
    color: '#666',
    fontSize: 14,
  },
  activeEndpointButtonText: {
    color: 'white',
  },
  toggleButton: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  toggleButtonText: {
    color: '#e91e63',
    fontSize: 14,
    fontWeight: '500',
  },
  requestForm: {
    marginBottom: 16,
  },
  methodButtons: {
    flexDirection: 'row',
  },
  methodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  activeMethodButton: {
    backgroundColor: '#e91e63',
  },
  methodButtonText: {
    color: '#666',
    fontSize: 14,
  },
  activeMethodButtonText: {
    color: 'white',
  },
  jsonInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  responseItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  responseStatus: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  successText: {
    color: '#10b981',
  },
  errorText: {
    color: '#ef4444',
  },
  responseTimestamp: {
    color: '#666',
    fontSize: 12,
  },
  responseEndpoint: {
    fontSize: 14,
    color: '#333',
    marginVertical: 8,
    fontFamily: 'monospace',
  },
  dataSection: {
    marginTop: 8,
  },
  dataSectionTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
  },
});

export default SquareDebugScreen; 