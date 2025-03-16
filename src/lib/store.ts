import { create } from 'zustand';
import { SquareItem, SquareStatus, ToastMessage, ScanLogItem } from '../types';
import apiService from '../api/apiService';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

interface AppState {
  // State
  scannedItems: ScanLogItem[];
  backupScannedItems: ScanLogItem[];
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
        set({ 
          scannedItems: response.data,
          backupScannedItems: response.data,
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
        set({ 
          toast: { 
            message: response.error || 'Failed to fetch recent logs', 
            type: 'error' 
          } 
        });
      }
    } catch (error) {
      console.error('Error fetching recent logs:', error);
      set({ isLoading: false });
      set({ 
        toast: { 
          message: 'Failed to fetch recent logs', 
          type: 'error' 
        } 
      });
    }
  },
  
  checkSquareStatus: async () => {
    set({ isCheckingSquare: true });
    try {
      const response = await apiService.getSquareStatus();
      if (response.success && response.data) {
        set({ 
          squareStatus: response.data,
          isCheckingSquare: false 
        });
      } else {
        set({ 
          squareStatus: {
            connected: false,
            message: response.error || 'Failed to check Square status'
          },
          isCheckingSquare: false
        });
      }
    } catch (error) {
      console.error('Error checking Square status:', error);
      set({ 
        squareStatus: {
          connected: false,
          message: 'Failed to check Square status'
        },
        isCheckingSquare: false
      });
    }
  },
  
  handleItemFound: async (itemId: string) => {
    set({ isLoading: true });
    try {
      const response = await apiService.getItemById(itemId);
      if (response.success && response.data) {
        set({ 
          selectedItem: response.data,
          isLoading: false 
        });
        return;
      } else {
        set({ isLoading: false });
        set({ 
          toast: { 
            message: response.error || 'Failed to fetch item details', 
            type: 'error' 
          } 
        });
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      set({ isLoading: false });
      set({ 
        toast: { 
          message: 'Failed to fetch item details', 
          type: 'error' 
        } 
      });
    }
  },
  
  handleSaveItem: async (item: SquareItem) => {
    set({ isLoading: true });
    try {
      const response = await apiService.saveItem(item);
      if (response.success && response.data) {
        set({ 
          selectedItem: null,
          isLoading: false,
          toast: {
            message: 'Item saved successfully',
            type: 'success'
          }
        });
        
        // Refresh the scan log
        get().fetchRecentLogs();
      } else {
        set({ isLoading: false });
        set({ 
          toast: { 
            message: response.error || 'Failed to save item', 
            type: 'error' 
          } 
        });
      }
    } catch (error) {
      console.error('Error saving item:', error);
      set({ isLoading: false });
      set({ 
        toast: { 
          message: 'Failed to save item', 
          type: 'error' 
        } 
      });
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
  
  setNavigation: (nav) => {
    set({ navigation: nav });
  },
  
  setSquareAccessToken: (token) => {
    set({ squareAccessToken: token });
  }
})); 