import axios from 'axios';
import { ApiResponse, SquareItem, ScanLogItem, SquareStatus } from '../types';

// Add declaration for __DEV__ which is available in React Native
declare const __DEV__: boolean;

// Base URL for API - this should be configurable based on environment
const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api';

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
  
  clear(): void {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

// API Service methods
const apiService = {
  // Get recent scan logs
  getRecentLogs: async (): Promise<ApiResponse<ScanLogItem[]>> => {
    try {
      const cachedData = apiCache.get<ApiResponse<ScanLogItem[]>>('recentLogs');
      if (cachedData) return cachedData;
      
      const response = await api.get<ApiResponse<ScanLogItem[]>>('/logs/recent');
      apiCache.set('recentLogs', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error - getRecentLogs:', error);
      return {
        success: false,
        error: 'Failed to fetch recent logs'
      };
    }
  },
  
  // Get Square status
  getSquareStatus: async (): Promise<ApiResponse<SquareStatus>> => {
    try {
      const response = await api.get<ApiResponse<SquareStatus>>('/square/status');
      return response.data;
    } catch (error) {
      console.error('API Error - getSquareStatus:', error);
      return {
        success: false,
        error: 'Failed to check Square status'
      };
    }
  },
  
  // Get item by barcode
  getItemByBarcode: async (barcode: string): Promise<ApiResponse<SquareItem>> => {
    try {
      const response = await api.get<ApiResponse<SquareItem>>(`/item/${encodeURIComponent(barcode)}`);
      return response.data;
    } catch (error) {
      console.error(`API Error - getItemByBarcode (${barcode}):`, error);
      return {
        success: false,
        error: 'Failed to fetch item by barcode'
      };
    }
  },
  
  // Get item by ID
  getItemById: async (itemId: string): Promise<ApiResponse<SquareItem>> => {
    try {
      const response = await api.get<ApiResponse<SquareItem>>(`/item/id/${encodeURIComponent(itemId)}`);
      return response.data;
    } catch (error) {
      console.error(`API Error - getItemById (${itemId}):`, error);
      return {
        success: false,
        error: 'Failed to fetch item by ID'
      };
    }
  },
  
  // Save item (create or update)
  saveItem: async (item: SquareItem): Promise<ApiResponse<SquareItem>> => {
    try {
      const isNew = !item.id || item.id === 'new';
      const method = isNew ? 'post' : 'put';
      const endpoint = isNew ? '/item' : `/item/${encodeURIComponent(item.id)}`;
      
      const response = await api[method]<ApiResponse<SquareItem>>(endpoint, item);
      
      // Clear cache after saving
      apiCache.clear();
      
      return response.data;
    } catch (error) {
      console.error('API Error - saveItem:', error);
      return {
        success: false,
        error: 'Failed to save item'
      };
    }
  },
  
  // Delete item
  deleteItem: async (itemId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/item/${encodeURIComponent(itemId)}`);
      
      // Clear cache after deleting
      apiCache.clear();
      
      return response.data;
    } catch (error) {
      console.error(`API Error - deleteItem (${itemId}):`, error);
      return {
        success: false,
        error: 'Failed to delete item'
      };
    }
  },
  
  // Search items
  searchItems: async (query: string): Promise<ApiResponse<SquareItem[]>> => {
    try {
      const response = await api.get<ApiResponse<SquareItem[]>>(`/items/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`API Error - searchItems (${query}):`, error);
      return {
        success: false,
        error: 'Failed to search items'
      };
    }
  },
  
  // Get all categories
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    try {
      const cachedData = apiCache.get<ApiResponse<string[]>>('categories');
      if (cachedData) return cachedData;
      
      const response = await api.get<ApiResponse<string[]>>('/categories');
      apiCache.set('categories', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error - getCategories:', error);
      return {
        success: false,
        error: 'Failed to fetch categories'
      };
    }
  },
  
  // Add a new category
  addCategory: async (category: string): Promise<ApiResponse<string[]>> => {
    try {
      const response = await api.post<ApiResponse<string[]>>('/categories', { category });
      
      // Clear cache after adding
      apiCache.clear();
      
      return response.data;
    } catch (error) {
      console.error(`API Error - addCategory (${category}):`, error);
      return {
        success: false,
        error: 'Failed to add category'
      };
    }
  },
  
  // Delete a category
  deleteCategory: async (category: string): Promise<ApiResponse<string[]>> => {
    try {
      const response = await api.delete<ApiResponse<string[]>>(`/categories/${encodeURIComponent(category)}`);
      
      // Clear cache after deleting
      apiCache.clear();
      
      return response.data;
    } catch (error) {
      console.error(`API Error - deleteCategory (${category}):`, error);
      return {
        success: false,
        error: 'Failed to delete category'
      };
    }
  },
  
  // Get audit logs
  getAuditLogs: async (page: number = 1, limit: number = 50): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/audit?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getAuditLogs:', error);
      return {
        success: false,
        error: 'Failed to fetch audit logs'
      };
    }
  },
  
  // Export audit logs
  exportAuditLogs: async (): Promise<ApiResponse<string>> => {
    try {
      const response = await api.get<ApiResponse<string>>('/audit/export');
      return response.data;
    } catch (error) {
      console.error('API Error - exportAuditLogs:', error);
      return {
        success: false,
        error: 'Failed to export audit logs'
      };
    }
  },
  
  // Get print settings
  getPrintSettings: async (): Promise<ApiResponse<any>> => {
    try {
      const cachedData = apiCache.get<ApiResponse<any>>('printSettings');
      if (cachedData) return cachedData;
      
      const response = await api.get<ApiResponse<any>>('/print/settings');
      apiCache.set('printSettings', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error - getPrintSettings:', error);
      return {
        success: false,
        error: 'Failed to fetch print settings'
      };
    }
  },
  
  // Save print settings
  savePrintSettings: async (settings: any): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>('/print/settings', settings);
      
      // Clear cache after saving
      apiCache.clear();
      
      return response.data;
    } catch (error) {
      console.error('API Error - savePrintSettings:', error);
      return {
        success: false,
        error: 'Failed to save print settings'
      };
    }
  },
  
  // Print label
  printLabel: async (itemId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.post<ApiResponse<void>>(`/print/label/${encodeURIComponent(itemId)}`);
      return response.data;
    } catch (error) {
      console.error(`API Error - printLabel (${itemId}):`, error);
      return {
        success: false,
        error: 'Failed to print label'
      };
    }
  },
};

export default apiService; 