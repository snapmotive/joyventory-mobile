import axios from 'axios';
import { ApiResponse, SquareItem, ScanLogItem, SquareStatus } from '../types';

// Add declaration for __DEV__ which is available in React Native
declare const __DEV__: boolean;

// Base URL for API - this should be configurable based on environment
const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add timeout to prevent long-hanging requests
  timeout: 10000,
});

// Cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  invalidateByPrefix(prefix: string): void {
    // Convert keys iterator to array before iterating
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

const apiCache = new ApiCache();

// Helper to determine if we should use development mode
// In production, this should always return false
const isDevelopmentMode = () => {
  return __DEV__; // Set to true for testing without backend
};

// Mock data for development mode
const mockItems: SquareItem[] = [
  {
    id: '1',
    name: 'Test Item 1',
    description: 'This is a test item',
    price: 9.99,
    sku: 'TEST001',
    gtin: '123456789012',
    barcode: '123456789012',
    category: 'Test Category',
    tax: true,
    taxRedondo: true,
    crv: true,
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Test Item 2',
    description: 'Another test item',
    price: 19.99,
    sku: 'TEST002',
    gtin: '223456789012',
    barcode: '223456789012',
    category: 'Food',
    tax: true,
    taxTorrance: true,
    crv5: true,
    timestamp: new Date().toISOString()
  }
];

// Get recent scan logs
const getRecentLogs = async (): Promise<ApiResponse<ScanLogItem[]>> => {
  try {
    if (isDevelopmentMode()) {
      // Return mock data in development mode
      const mockLogs: ScanLogItem[] = mockItems.map(item => ({
        id: item.id,
        barcode: item.barcode || item.gtin || '',
        timestamp: item.timestamp || new Date().toISOString(),
        itemName: item.name
      }));
      return { success: true, data: mockLogs };
    }
    
    const cacheKey = 'recent_logs';
    const cachedData = apiCache.get<ScanLogItem[]>(cacheKey);
    
    if (cachedData) {
      return { success: true, data: cachedData };
    }
    
    const response = await api.get('/logs/recent');
    
    if (!response.data) {
      return { success: false, error: 'No data returned from logs API' };
    }
    
    apiCache.set(cacheKey, response.data, 30000); // Cache for 30 seconds
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    
    if (isDevelopmentMode()) {
      // Return mock data in development mode
      const mockLogs: ScanLogItem[] = mockItems.map(item => ({
        id: item.id,
        barcode: item.barcode || item.gtin || '',
        timestamp: item.timestamp || new Date().toISOString(),
        itemName: item.name
      }));
      return { success: true, data: mockLogs };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error fetching logs' 
    };
  }
};

// Get item by barcode
const getItemByBarcode = async (barcode: string): Promise<ApiResponse<SquareItem>> => {
  try {
    if (!barcode) {
      return { success: false, error: 'Barcode is required' };
    }
    
    if (isDevelopmentMode()) {
      // Return mock data in development mode
      const mockItem = mockItems.find(item => 
        item.barcode === barcode || item.gtin === barcode
      );
      
      if (mockItem) {
        return { success: true, data: mockItem };
      } else {
        // Create a new mock item if not found
        const newItem: SquareItem = {
          id: `mock_${Date.now()}`,
          name: `Item ${barcode}`,
          description: 'Mock item created in development mode',
          sku: `SKU${barcode.substring(0, 6)}`,
          gtin: barcode,
          barcode: barcode,
          price: Math.round(Math.random() * 1000) / 100, // Random price between 0-10
          category: 'New Items',
          tax: Math.random() > 0.5,
          taxRedondo: Math.random() > 0.5,
          crv: Math.random() > 0.7,
          timestamp: new Date().toISOString()
        };
        
        // Add to mock items
        mockItems.push(newItem);
        return { success: true, data: newItem };
      }
    }
    
    const cacheKey = `item_barcode_${barcode}`;
    const cachedData = apiCache.get<SquareItem>(cacheKey);
    
    if (cachedData) {
      return { success: true, data: cachedData };
    }
    
    const response = await api.get(`/item/${encodeURIComponent(barcode)}`);
    
    if (!response.data) {
      return { success: false, error: 'Item not found' };
    }
    
    // Transform the response to match our SquareItem interface
    const item: SquareItem = {
      id: response.data.id,
      name: response.data.name || 'Unnamed Item',
      description: response.data.description || '',
      sku: response.data.sku || '',
      gtin: response.data.gtin || barcode,
      barcode: barcode,
      price: response.data.price,
      quantity: response.data.quantity,
      category: response.data.category,
      crv: response.data.crv || false,
      crv5: response.data.crv5 || false,
      crv10: response.data.crv10 || false,
      tax: response.data.tax || false,
      taxRedondo: response.data.taxRedondo || false,
      taxTorrance: response.data.taxTorrance || false,
      locationPrice: response.data.locationPrice,
      trackInventory: response.data.trackInventory || false,
      sellable: response.data.sellable || true,
      stockable: response.data.stockable || true,
      timestamp: response.data.timestamp || new Date().toISOString()
    };
    
    apiCache.set(cacheKey, item);
    return { success: true, data: item };
  } catch (error) {
    console.error('Error fetching item by barcode:', error);
    
    if (isDevelopmentMode()) {
      // Create a new mock item if error
      const newItem: SquareItem = {
        id: `mock_${Date.now()}`,
        name: `Item ${barcode}`,
        description: 'Mock item created in development mode',
        sku: `SKU${barcode.substring(0, 6)}`,
        gtin: barcode,
        barcode: barcode,
        price: Math.round(Math.random() * 1000) / 100,
        category: 'New Items',
        tax: Math.random() > 0.5,
        taxRedondo: Math.random() > 0.5,
        crv: Math.random() > 0.7,
        timestamp: new Date().toISOString()
      };
      
      // Add to mock items
      mockItems.push(newItem);
      return { success: true, data: newItem };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error fetching item' 
    };
  }
};

// Get item by ID
const getItemById = async (id: string): Promise<ApiResponse<SquareItem>> => {
  try {
    if (!id) {
      return { success: false, error: 'Item ID is required' };
    }
    
    if (isDevelopmentMode()) {
      // Return mock data in development mode
      const mockItem = mockItems.find(item => item.id === id);
      
      if (mockItem) {
        return { success: true, data: mockItem };
      } else {
        return { success: false, error: 'Item not found' };
      }
    }
    
    const cacheKey = `item_id_${id}`;
    const cachedData = apiCache.get<SquareItem>(cacheKey);
    
    if (cachedData) {
      return { success: true, data: cachedData };
    }
    
    const response = await api.get(`/item/id/${encodeURIComponent(id)}`);
    
    if (!response.data) {
      return { success: false, error: 'Item not found' };
    }
    
    // Transform the response to match our SquareItem interface
    const item: SquareItem = {
      id: response.data.id,
      name: response.data.name || 'Unnamed Item',
      description: response.data.description || '',
      sku: response.data.sku || '',
      gtin: response.data.gtin || '',
      barcode: response.data.barcode || response.data.gtin || '',
      price: response.data.price,
      quantity: response.data.quantity,
      category: response.data.category,
      crv: response.data.crv || false,
      crv5: response.data.crv5 || false,
      crv10: response.data.crv10 || false,
      tax: response.data.tax || false,
      taxRedondo: response.data.taxRedondo || false,
      taxTorrance: response.data.taxTorrance || false,
      locationPrice: response.data.locationPrice,
      trackInventory: response.data.trackInventory || false,
      sellable: response.data.sellable || true,
      stockable: response.data.stockable || true,
      timestamp: response.data.timestamp || new Date().toISOString()
    };
    
    apiCache.set(cacheKey, item);
    return { success: true, data: item };
  } catch (error) {
    console.error('Error fetching item by ID:', error);
    
    if (isDevelopmentMode()) {
      // Return mock data in development mode if ID matches a mock item
      const mockItem = mockItems.find(item => item.id === id);
      
      if (mockItem) {
        return { success: true, data: mockItem };
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error fetching item' 
    };
  }
};

// Create new item
const createItem = async (item: SquareItem): Promise<ApiResponse<SquareItem>> => {
  try {
    if (!item) {
      return { success: false, error: 'Item data is required' };
    }
    
    // Ensure we have the required fields
    if (!item.name) {
      return { success: false, error: 'Item name is required' };
    }
    
    if (isDevelopmentMode()) {
      // Create a new mock item
      const newItem: SquareItem = {
        ...item,
        id: `mock_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      // Add to mock items
      mockItems.push(newItem);
      return { success: true, data: newItem };
    }
    
    const response = await api.post('/item', item);
    
    if (!response.data) {
      return { success: false, error: 'Failed to create item' };
    }
    
    // Invalidate any cached data for this item
    if (item.gtin) apiCache.invalidate(`item_barcode_${item.gtin}`);
    if (item.barcode) apiCache.invalidate(`item_barcode_${item.barcode}`);
    
    // Transform the response to match our SquareItem interface
    const createdItem: SquareItem = {
      ...item,
      id: response.data.id,
      timestamp: response.data.timestamp || new Date().toISOString()
    };
    
    return { success: true, data: createdItem };
  } catch (error) {
    console.error('Error creating item:', error);
    
    if (isDevelopmentMode()) {
      // Create a new mock item even if there's an error
      const newItem: SquareItem = {
        ...item,
        id: `mock_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      // Add to mock items
      mockItems.push(newItem);
      return { success: true, data: newItem };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error creating item' 
    };
  }
};

// Update existing item
const updateItem = async (item: SquareItem): Promise<ApiResponse<SquareItem>> => {
  try {
    if (!item || !item.id) {
      return { success: false, error: 'Item ID is required for updates' };
    }
    
    if (isDevelopmentMode()) {
      // Find and update the mock item
      const index = mockItems.findIndex(mockItem => mockItem.id === item.id);
      
      if (index !== -1) {
        // Update the existing item
        mockItems[index] = {
          ...item,
          timestamp: new Date().toISOString()
        };
        return { success: true, data: mockItems[index] };
      } else {
        // If not found, create a new one
        const newItem: SquareItem = {
          ...item,
          timestamp: new Date().toISOString()
        };
        mockItems.push(newItem);
        return { success: true, data: newItem };
      }
    }
    
    const response = await api.put(`/item/${item.id}`, item);
    
    if (!response.data) {
      return { success: false, error: 'Failed to update item' };
    }
    
    // Invalidate any cached data for this item
    apiCache.invalidate(`item_id_${item.id}`);
    if (item.gtin) apiCache.invalidate(`item_barcode_${item.gtin}`);
    if (item.barcode) apiCache.invalidate(`item_barcode_${item.barcode}`);
    
    // Transform the response to match our SquareItem interface
    const updatedItem: SquareItem = {
      ...item,
      timestamp: response.data.timestamp || new Date().toISOString()
    };
    
    return { success: true, data: updatedItem };
  } catch (error) {
    console.error('Error updating item:', error);
    
    if (isDevelopmentMode()) {
      // Find and update the mock item even if there's an error
      const index = mockItems.findIndex(mockItem => mockItem.id === item.id);
      
      if (index !== -1) {
        // Update the existing item
        mockItems[index] = {
          ...item,
          timestamp: new Date().toISOString()
        };
        return { success: true, data: mockItems[index] };
      } else {
        // If not found, create a new one
        const newItem: SquareItem = {
          ...item,
          timestamp: new Date().toISOString()
        };
        mockItems.push(newItem);
        return { success: true, data: newItem };
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error updating item' 
    };
  }
};

// Get Square connection status
const getSquareStatus = async (): Promise<ApiResponse<SquareStatus>> => {
  try {
    if (isDevelopmentMode()) {
      // Return mock Square status
      return { 
        success: true, 
        data: {
          connected: true,
          message: 'Connected to Square (Development Mode)',
          lastSync: new Date().toISOString(),
          environment: 'development',
          hasItems: mockItems.length > 0
        }
      };
    }
    
    const cacheKey = 'square_status';
    const cachedData = apiCache.get<SquareStatus>(cacheKey);
    
    if (cachedData) {
      return { success: true, data: cachedData };
    }
    
    const response = await api.get('/square/status');
    
    if (!response.data) {
      return { 
        success: false, 
        error: 'No data returned from Square status API',
        data: { connected: false, message: 'Connection error' }
      };
    }
    
    apiCache.set(cacheKey, response.data, 60000); // Cache for 1 minute
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching Square status:', error);
    
    if (isDevelopmentMode()) {
      // Return mock Square status even if there's an error
      return { 
        success: true, 
        data: {
          connected: true,
          message: 'Connected to Square (Development Mode)',
          lastSync: new Date().toISOString(),
          environment: 'development',
          hasItems: mockItems.length > 0
        }
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error fetching Square status',
      data: { 
        connected: false, 
        message: 'Connection error' 
      }
    };
  }
};

// Export all API functions
export default {
  getRecentLogs,
  getItemByBarcode,
  getItemById,
  createItem,
  updateItem,
  getSquareStatus
}; 