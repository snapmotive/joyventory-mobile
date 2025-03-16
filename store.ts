import { create } from 'zustand';
import { SquareItem, SquareStatus, ToastMessage, ScanLogItem } from '../types';
import apiService from '../api/apiService';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

interface AppState {
  // State
  scannedItems: SquareItem[];
  backupScannedItems: SquareItem[];
  isLoading: boolean;
  selectedItem: SquareItem | null;
  squareStatus: SquareStatus;
  isCheckingSquare: boolean;
  toast: ToastMessage | null;
  navigation: NavigationProp<RootStackParamList> | null;
  squareAccessToken: string | null;
  
  // Actions
  fetchRecentLogs: () => Promise<void>;
  checkSquareStatus: () => Promise<void>;
  handleItemFound: (itemId: string) => Promise<void>;
  handleSaveItem: (item: SquareItem) => Promise<void>;
  handleCancel: () => void;
  clearToast: () => void;
  clearScanLog: () => void;
  setNavigation: (nav: NavigationProp<RootStackParamList> | null) => void;
  setSquareAccessToken: (token: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  scannedItems: [],
  backupScannedItems: [],
  isLoading: false,
  selectedItem: null,
  squareStatus: {
    connected: false,
    message: 'Not connected to Square'
  },
  isCheckingSquare: false,
  toast: null,
  navigation: null,
  squareAccessToken: null,
  
  // Actions
  fetchRecentLogs: async () => {
    set({ isLoading: true });
    try {
      const response = await apiService.getRecentLogs();
      if (response.success && response.data) {
        // For each scan log item, fetch the full item details
        const items: SquareItem[] = [];
        
        for (const log of response.data) {
          // Try to get the item by barcode
          const itemResponse = await apiService.getItemById(log.id);
          
          if (itemResponse.success && itemResponse.data) {
            items.push(itemResponse.data);
          } else {
            // If item not found, create a placeholder item
            items.push({
              id: log.id,
              name: log.itemName || 'Unknown Item',
              barcode: log.barcode,
              timestamp: log.timestamp
            });
          }
        }
        
        set({ 
          scannedItems: items,
          backupScannedItems: items
        });
      }
    } catch (error) {
      console.error('Error fetching recent logs:', error);
      set({ 
        toast: {
          message: 'Failed to fetch recent logs',
          type: 'error'
        }
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  checkSquareStatus: async () => {
    set({ isCheckingSquare: true });
    try {
      const response = await apiService.getSquareStatus();
      if (response.success && response.data) {
        set({ squareStatus: response.data });
      } else {
        set({ 
          squareStatus: {
            connected: false,
            message: response.error || 'Failed to check Square status'
          }
        });
      }
    } catch (error) {
      console.error('Error checking Square status:', error);
      set({ 
        squareStatus: {
          connected: false,
          message: 'Error connecting to Square'
        }
      });
    } finally {
      set({ isCheckingSquare: false });
    }
  },
  
  handleItemFound: async (itemId: string) => {
    set({ isLoading: true });
    try {
      const response = await apiService.getItemById(itemId);
      if (response.success && response.data) {
        set({ 
          selectedItem: response.data,
          toast: {
            message: `Found item: ${response.data.name}`,
            type: 'success'
          }
        });
        
        // Navigate to item detail screen
        // Note: Navigation should be handled in the component, not the store
      } else {
        set({ 
          toast: {
            message: response.error || 'Item not found',
            type: 'error'
          }
        });
      }
    } catch (error) {
      console.error('Error finding item:', error);
      set({ 
        toast: {
          message: error instanceof Error ? error.message : 'Failed to find item',
          type: 'error'
        }
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  handleSaveItem: async (item: SquareItem) => {
    set({ isLoading: true });
    try {
      // Determine if this is a create or update operation
      const isNewItem = !item.id;
      
      // Call the appropriate API method
      const response = isNewItem 
        ? await apiService.createItem(item)
        : await apiService.updateItem(item);
      
      if (response.success && response.data) {
        const savedItem = response.data;
        
        // Update the selected item with the response data
        set({ 
          selectedItem: savedItem,
          toast: {
            message: `Item ${isNewItem ? 'created' : 'updated'} successfully`,
            type: 'success'
          }
        });
        
        // If this is a new item, add it to the scanned items list
        if (isNewItem) {
          set(state => ({
            scannedItems: [savedItem, ...state.scannedItems]
          }));
        } else {
          // If updating, update the item in the scanned items list
          set(state => ({
            scannedItems: state.scannedItems.map(i => 
              i.id === savedItem.id ? savedItem : i
            )
          }));
        }
      } else {
        set({ 
          toast: {
            message: response.error || `Failed to ${isNewItem ? 'create' : 'update'} item`,
            type: 'error'
          }
        });
      }
    } catch (error) {
      console.error('Error saving item:', error);
      set({ 
        toast: {
          message: error instanceof Error ? error.message : 'Failed to save item',
          type: 'error'
        }
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  handleCancel: () => {
    set({ selectedItem: null });
  },
  
  clearToast: () => {
    set({ toast: null });
  },
  
  clearScanLog: () => {
    set({ scannedItems: [] });
  },
  
  setNavigation: (nav: NavigationProp<RootStackParamList> | null) => {
    set({ navigation: nav });
  },
  
  setSquareAccessToken: (token: string | null) => {
    set({ squareAccessToken: token });
  }
})); 