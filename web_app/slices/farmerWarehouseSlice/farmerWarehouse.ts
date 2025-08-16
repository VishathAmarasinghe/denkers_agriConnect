import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { APIService } from '@/utils/apiService';
import { AppConfig } from '@/config/config';
import {
  FarmerWarehouseRequest,
  FarmerWarehouseRequestCreate,
  FarmerWarehouseRequestUpdate,
  FarmerWarehouseRequestSearchParams,
  MarketPrice,
  MarketPriceCreate,
  MarketPriceUpdate,
} from '@/types/types';

// Async thunks for farmer warehouse requests
export const createFarmerWarehouseRequest = createAsyncThunk(
  'farmerWarehouse/createRequest',
  async (data: FarmerWarehouseRequestCreate) => {
    const response = await APIService.post(AppConfig.serviceUrls.farmerWarehouse.requests, data);
    return response.data;
  }
);

export const fetchFarmerWarehouseRequests = createAsyncThunk(
  'farmerWarehouse/fetchRequests',
  async (params: FarmerWarehouseRequestSearchParams) => {
    const response = await APIService.get(AppConfig.serviceUrls.farmerWarehouse.requests, { params });
    return response.data;
  }
);

export const getFarmerWarehouseRequest = createAsyncThunk(
  'farmerWarehouse/getRequest',
  async (id: number) => {
    const response = await APIService.get(`${AppConfig.serviceUrls.farmerWarehouse.requestById}/${id}`);
    return response.data;
  }
);

export const getFarmerWarehouseRequestQRCode = createAsyncThunk(
  'farmerWarehouse/getRequestQRCode',
  async (id: number) => {
    const response = await APIService.get(`${AppConfig.serviceUrls.farmerWarehouse.qrCode}/${id}/qr-code`);
    return response.data;
  }
);

// Async thunks for storage management
export const fetchFarmerStorage = createAsyncThunk(
  'farmerWarehouse/fetchStorage',
  async (params: { page?: number; limit?: number }) => {
    const response = await APIService.get(AppConfig.serviceUrls.farmerWarehouse.storage, { params });
    return response.data;
  }
);

export const fetchStorageSummary = createAsyncThunk(
  'farmerWarehouse/fetchStorageSummary',
  async () => {
    const response = await APIService.get(AppConfig.serviceUrls.farmerWarehouse.storageSummary);
    return response.data;
  }
);

export const fetchExpiringStorage = createAsyncThunk(
  'farmerWarehouse/fetchExpiringStorage',
  async (params: { page?: number; limit?: number }) => {
    const response = await APIService.get(AppConfig.serviceUrls.farmerWarehouse.expiringStorage, { params });
    return response.data;
  }
);

export const fetchExpiredStorage = createAsyncThunk(
  'farmerWarehouse/fetchExpiredStorage',
  async (params: { page?: number; limit?: number }) => {
    const response = await APIService.get(AppConfig.serviceUrls.farmerWarehouse.expiredStorage, { params });
    return response.data;
  }
);

// Async thunks for notifications
export const fetchNotifications = createAsyncThunk(
  'farmerWarehouse/fetchNotifications',
  async (params: { page?: number; limit?: number }) => {
    const response = await APIService.get(AppConfig.serviceUrls.farmerWarehouse.notifications, { params });
    return response.data;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'farmerWarehouse/markNotificationRead',
  async (id: number) => {
    const response = await APIService.put(`${AppConfig.serviceUrls.farmerWarehouse.markNotificationRead}/${id}/read`);
    return response.data;
  }
);

// Async thunks for market prices
export const fetchMarketPrices = createAsyncThunk(
  'farmerWarehouse/fetchMarketPrices',
  async (params: { page?: number; limit?: number; item_name?: string }) => {
    const response = await APIService.get(AppConfig.serviceUrls.farmerWarehouse.marketPrices, { params });
    return response.data;
  }
);

export const fetchMarketPriceHistory = createAsyncThunk(
  'farmerWarehouse/fetchMarketPriceHistory',
  async (itemName: string) => {
    const response = await APIService.get(`${AppConfig.serviceUrls.farmerWarehouse.marketPriceHistory}/${itemName}/history`);
    return response.data;
  }
);

export const createMarketPrice = createAsyncThunk(
  'farmerWarehouse/createMarketPrice',
  async (data: MarketPriceCreate) => {
    const response = await APIService.post(AppConfig.serviceUrls.farmerWarehouse.marketPrices, data);
    return response.data;
  }
);

export const updateMarketPrice = createAsyncThunk(
  'farmerWarehouse/updateMarketPrice',
  async ({ id, data }: { id: number; data: MarketPriceUpdate }) => {
    const response = await APIService.put(`${AppConfig.serviceUrls.farmerWarehouse.marketPrices}/${id}`, data);
    return response.data;
  }
);

export const deleteMarketPrice = createAsyncThunk(
  'farmerWarehouse/deleteMarketPrice',
  async (id: number) => {
    const response = await APIService.delete(`${AppConfig.serviceUrls.farmerWarehouse.marketPrices}/${id}`);
    return response.data;
  }
);

// Admin async thunks
export const fetchAdminPendingRequests = createAsyncThunk(
  'farmerWarehouse/fetchAdminPendingRequests',
  async (params: { page?: number; limit?: number }) => {
    const response = await APIService.get(AppConfig.serviceUrls.farmerWarehouse.adminPendingRequests, { params });
    return response.data;
  }
);

export const approveFarmerWarehouseRequest = createAsyncThunk(
  'farmerWarehouse/approveRequest',
  async ({ id, adminNotes }: { id: number; adminNotes?: string }) => {
    const response = await APIService.post(`${AppConfig.serviceUrls.farmerWarehouse.requests}/${id}/approve`, { admin_notes: adminNotes });
    return response.data;
  }
);

export const rejectFarmerWarehouseRequest = createAsyncThunk(
  'farmerWarehouse/rejectRequest',
  async ({ id, rejectionReason }: { id: number; rejectionReason: string }) => {
    const response = await APIService.post(`${AppConfig.serviceUrls.farmerWarehouse.requests}/${id}/reject`, { rejection_reason: rejectionReason });
    return response.data;
  }
);

// State interface
export interface FarmerWarehouseState {
  // Requests
  requests: FarmerWarehouseRequest[];
  requestsPagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  requestsLoading: boolean;
  requestsError: string | null;
  
  // Current request
  currentRequest: FarmerWarehouseRequest | null;
  currentRequestLoading: boolean;
  currentRequestError: string | null;
  
  // QR Code
  qrCodeInfo: any;
  qrCodeLoading: boolean;
  qrCodeError: string | null;
  
  // Storage
  storage: any[];
  storagePagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  storageLoading: boolean;
  storageError: string | null;
  
  // Storage summary
  storageSummary: any;
  storageSummaryLoading: boolean;
  storageSummaryError: string | null;
  
  // Expiring storage
  expiringStorage: any[];
  expiringStorageLoading: boolean;
  expiringStorageError: string | null;
  
  // Expired storage
  expiredStorage: any[];
  expiredStorageLoading: boolean;
  expiredStorageError: string | null;
  
  // Notifications
  notifications: any[];
  notificationsPagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  notificationsLoading: boolean;
  notificationsError: string | null;
  
  // Market prices
  marketPrices: MarketPrice[];
  marketPricesPagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  marketPricesLoading: boolean;
  marketPricesError: string | null;
  
  // Market price history
  marketPriceHistory: any[];
  marketPriceHistoryLoading: boolean;
  marketPriceHistoryError: string | null;
  
  // Admin
  adminPendingRequests: FarmerWarehouseRequest[];
  adminPendingRequestsPagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  adminPendingRequestsLoading: boolean;
  adminPendingRequestsError: string | null;
  
  // Search parameters
  searchParams: FarmerWarehouseRequestSearchParams;
  
  // Messages
  success: string | null;
  error: string | null;
}

// Initial state
const initialState: FarmerWarehouseState = {
  // Requests
  requests: [],
  requestsPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  requestsLoading: false,
  requestsError: null,
  
  // Current request
  currentRequest: null,
  currentRequestLoading: false,
  currentRequestError: null,
  
  // QR Code
  qrCodeInfo: null,
  qrCodeLoading: false,
  qrCodeError: null,
  
  // Storage
  storage: [],
  storagePagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  storageLoading: false,
  storageError: null,
  
  // Storage summary
  storageSummary: null,
  storageSummaryLoading: false,
  storageSummaryError: null,
  
  // Expiring storage
  expiringStorage: [],
  expiringStorageLoading: false,
  expiringStorageError: null,
  
  // Expired storage
  expiredStorage: [],
  expiredStorageLoading: false,
  expiredStorageError: null,
  
  // Notifications
  notifications: [],
  notificationsPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  notificationsLoading: false,
  notificationsError: null,
  
  // Market prices
  marketPrices: [],
  marketPricesPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  marketPricesLoading: false,
  marketPricesError: null,
  
  // Market price history
  marketPriceHistory: [],
  marketPriceHistoryLoading: false,
  marketPriceHistoryError: null,
  
  // Admin
  adminPendingRequests: [],
  adminPendingRequestsPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  adminPendingRequestsLoading: false,
  adminPendingRequestsError: null,
  
  // Search parameters
  searchParams: {
    page: 1,
    limit: 10,
  },
  
  // Messages
  success: null,
  error: null,
};

// Create slice
const farmerWarehouseSlice = createSlice({
  name: 'farmerWarehouse',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setSearchParams: (state, action: PayloadAction<Partial<FarmerWarehouseRequestSearchParams>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    resetState: (state) => {
      state.requests = [];
      state.currentRequest = null;
      state.qrCodeInfo = null;
      state.storage = [];
      state.storageSummary = null;
      state.expiringStorage = [];
      state.expiredStorage = [];
      state.notifications = [];
      state.marketPrices = [];
      state.marketPriceHistory = [];
      state.adminPendingRequests = [];
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Requests
    builder
      .addCase(createFarmerWarehouseRequest.pending, (state) => {
        state.requestsLoading = true;
        state.requestsError = null;
      })
      .addCase(createFarmerWarehouseRequest.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.success = 'Warehouse request created successfully';
      })
      .addCase(createFarmerWarehouseRequest.rejected, (state, action) => {
        state.requestsLoading = false;
        state.requestsError = action.error.message || 'Failed to create warehouse request';
      })
      .addCase(fetchFarmerWarehouseRequests.pending, (state) => {
        state.requestsLoading = true;
        state.requestsError = null;
      })
      .addCase(fetchFarmerWarehouseRequests.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.requests = action.payload.data?.data || [];
        state.requestsPagination = {
          total: action.payload.data?.pagination?.total || 0,
          totalPages: action.payload.data?.pagination?.totalPages || 0,
          currentPage: action.payload.data?.pagination?.page || 1,
          limit: action.payload.data?.pagination?.limit || 10,
        };
      })
      .addCase(fetchFarmerWarehouseRequests.rejected, (state, action) => {
        state.requestsLoading = false;
        state.requestsError = action.error.message || 'Failed to fetch warehouse requests';
      })
      .addCase(getFarmerWarehouseRequest.pending, (state) => {
        state.currentRequestLoading = true;
        state.currentRequestError = null;
      })
      .addCase(getFarmerWarehouseRequest.fulfilled, (state, action) => {
        state.currentRequestLoading = false;
        state.currentRequest = action.payload.data;
      })
      .addCase(getFarmerWarehouseRequest.rejected, (state, action) => {
        state.currentRequestLoading = false;
        state.currentRequestError = action.error.message || 'Failed to fetch warehouse request';
      })
      .addCase(getFarmerWarehouseRequestQRCode.pending, (state) => {
        state.qrCodeLoading = true;
        state.qrCodeError = null;
      })
      .addCase(getFarmerWarehouseRequestQRCode.fulfilled, (state, action) => {
        state.qrCodeLoading = false;
        state.qrCodeInfo = action.payload.data;
      })
      .addCase(getFarmerWarehouseRequestQRCode.rejected, (state, action) => {
        state.qrCodeLoading = false;
        state.qrCodeError = action.error.message || 'Failed to fetch QR code information';
      });

    // Storage
    builder
      .addCase(fetchFarmerStorage.pending, (state) => {
        state.storageLoading = true;
        state.storageError = null;
      })
      .addCase(fetchFarmerStorage.fulfilled, (state, action) => {
        state.storageLoading = false;
        state.storage = action.payload.data?.data || [];
        state.storagePagination = {
          total: action.payload.data?.pagination?.total || 0,
          totalPages: action.payload.data?.pagination?.totalPages || 0,
          currentPage: action.payload.data?.pagination?.page || 1,
          limit: action.payload.data?.pagination?.limit || 10,
        };
      })
      .addCase(fetchFarmerStorage.rejected, (state, action) => {
        state.storageLoading = false;
        state.storageError = action.error.message || 'Failed to fetch storage information';
      })
      .addCase(fetchStorageSummary.pending, (state) => {
        state.storageSummaryLoading = true;
        state.storageSummaryError = null;
      })
      .addCase(fetchStorageSummary.fulfilled, (state, action) => {
        state.storageSummaryLoading = false;
        state.storageSummary = action.payload.data;
      })
      .addCase(fetchStorageSummary.rejected, (state, action) => {
        state.storageSummaryLoading = false;
        state.storageSummaryError = action.error.message || 'Failed to fetch storage summary';
      })
      .addCase(fetchExpiringStorage.pending, (state) => {
        state.expiringStorageLoading = true;
        state.expiringStorageError = null;
      })
      .addCase(fetchExpiringStorage.fulfilled, (state, action) => {
        state.expiringStorageLoading = false;
        state.expiringStorage = action.payload.data || [];
      })
      .addCase(fetchExpiringStorage.rejected, (state, action) => {
        state.expiringStorageLoading = false;
        state.expiringStorageError = action.error.message || 'Failed to fetch expiring storage';
      })
      .addCase(fetchExpiredStorage.pending, (state) => {
        state.expiredStorageLoading = true;
        state.expiredStorageError = null;
      })
      .addCase(fetchExpiredStorage.fulfilled, (state, action) => {
        state.expiredStorageLoading = false;
        state.expiredStorage = action.payload.data || [];
      })
      .addCase(fetchExpiredStorage.rejected, (state, action) => {
        state.expiredStorageLoading = false;
        state.expiredStorageError = action.error.message || 'Failed to fetch expired storage';
      });

    // Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationsLoading = true;
        state.notificationsError = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false;
        state.notifications = action.payload.data?.data || [];
        state.notificationsPagination = {
          total: action.payload.data?.pagination?.total || 0,
          totalPages: action.payload.data?.pagination?.totalPages || 0,
          currentPage: action.payload.data?.pagination?.page || 1,
          limit: action.payload.data?.pagination?.limit || 10,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationsLoading = false;
        state.notificationsError = action.error.message || 'Failed to fetch notifications';
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.success = 'Notification marked as read';
        // Update the notification in the list
        const index = state.notifications.findIndex(n => n.id === action.payload.data.id);
        if (index !== -1) {
          state.notifications[index] = { ...state.notifications[index], is_read: true };
        }
      });

    // Market prices
    builder
      .addCase(fetchMarketPrices.pending, (state) => {
        state.marketPricesLoading = true;
        state.marketPricesError = null;
      })
      .addCase(fetchMarketPrices.fulfilled, (state, action) => {
        state.marketPricesLoading = false;
        state.marketPrices = action.payload.data?.data || [];
        state.marketPricesPagination = {
          total: action.payload.data?.pagination?.total || 0,
          totalPages: action.payload.data?.pagination?.totalPages || 0,
          currentPage: action.payload.data?.pagination?.page || 1,
          limit: action.payload.data?.pagination?.limit || 10,
        };
      })
      .addCase(fetchMarketPrices.rejected, (state, action) => {
        state.marketPricesLoading = false;
        state.marketPricesError = action.error.message || 'Failed to fetch market prices';
      })
      .addCase(fetchMarketPriceHistory.pending, (state) => {
        state.marketPriceHistoryLoading = true;
        state.marketPriceHistoryError = null;
      })
      .addCase(fetchMarketPriceHistory.fulfilled, (state, action) => {
        state.marketPriceHistoryLoading = false;
        state.marketPriceHistory = action.payload.data || [];
      })
      .addCase(fetchMarketPriceHistory.rejected, (state, action) => {
        state.marketPriceHistoryLoading = false;
        state.marketPriceHistoryError = action.error.message || 'Failed to fetch market price history';
      })
      .addCase(createMarketPrice.fulfilled, (state, action) => {
        state.success = 'Market price created successfully';
      })
      .addCase(updateMarketPrice.fulfilled, (state, action) => {
        state.success = 'Market price updated successfully';
        // Update the market price in the list
        const index = state.marketPrices.findIndex(mp => mp.id === action.payload.data.id);
        if (index !== -1) {
          state.marketPrices[index] = { ...state.marketPrices[index], ...action.payload.data };
        }
      });

    // Admin
    builder
      .addCase(fetchAdminPendingRequests.pending, (state) => {
        state.adminPendingRequestsLoading = true;
        state.adminPendingRequestsError = null;
      })
      .addCase(fetchAdminPendingRequests.fulfilled, (state, action) => {
        state.adminPendingRequestsLoading = false;
        state.adminPendingRequests = action.payload.data?.data || [];
        state.adminPendingRequestsPagination = {
          total: action.payload.data?.pagination?.total || 0,
          totalPages: action.payload.data?.pagination?.totalPages || 0,
          currentPage: action.payload.data?.pagination?.page || 1,
          limit: action.payload.data?.pagination?.limit || 10,
        };
      })
      .addCase(fetchAdminPendingRequests.rejected, (state, action) => {
        state.adminPendingRequestsLoading = false;
        state.adminPendingRequestsError = action.error.message || 'Failed to fetch admin pending requests';
      })
      .addCase(approveFarmerWarehouseRequest.fulfilled, (state, action) => {
        state.success = 'Warehouse request approved successfully';
        // Update the request in the list
        const index = state.requests.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) {
          state.requests[index] = { ...state.requests[index], status: 'approved' };
        }
      })
      .addCase(rejectFarmerWarehouseRequest.fulfilled, (state, action) => {
        state.success = 'Warehouse request rejected successfully';
        // Update the request in the list
        const index = state.requests.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) {
          state.requests[index] = { ...state.requests[index], status: 'rejected' };
        }
      });

    // Error handling for all rejected cases
    builder.addMatcher(
      (action) => action.type.endsWith('/rejected'),
      (state, action) => {
        state.error = action.error.message || 'Operation failed';
        state.success = null;
      }
    );
  },
});

export const { clearMessages, setSearchParams, resetState } = farmerWarehouseSlice.actions;
export default farmerWarehouseSlice.reducer;
