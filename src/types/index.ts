// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  ItemDetail: { itemId?: string; barcode?: string };
  AdminCategories: undefined;
  AdminItemFields: undefined;
  AdminPrintSettings: undefined;
  AuditLogs: undefined;
  SquareDebug: undefined;
};

// Square Item Types
export interface SquareItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  sku?: string;
  gtin?: string;
  barcode?: string;
  quantity?: number;
  category?: string;
  crv?: boolean;
  crv5?: boolean;
  crv10?: boolean;
  tax?: boolean;
  taxRedondo?: boolean;
  taxTorrance?: boolean;
  locationPrice?: number;
  trackInventory?: boolean;
  sellable?: boolean;
  stockable?: boolean;
  type?: string;
  tracking_type?: string;
  price_type?: string;
  timestamp?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SquareStatus {
  connected: boolean;
  message?: string;
  error?: string;
  lastSync?: string;
  environment?: string;
  hasItems?: boolean;
}

export interface ScanLogItem {
  id: string;
  barcode: string;
  timestamp: string;
  itemName?: string;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  message: string;
  type: ToastType;
} 