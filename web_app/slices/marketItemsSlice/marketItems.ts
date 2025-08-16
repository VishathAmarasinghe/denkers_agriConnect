import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { APIService } from '@/utils/apiService';
import { AppConfig } from '@/config/config';
import {
  MarketItem,
  MarketItemCreate,
  MarketItemUpdate,
} from '@/types/types';

// Async thunks for market items
export const fetchMarketItems = createAsyncThunk(
  'marketItems/fetchItems',
  async (params: { page?: number; limit?: number; category?: string; is_active?: boolean }) => {
    const response = await APIService.get(AppConfig.serviceUrls.farmerWarehouse.marketItems, { params });
    return response.data;
  }
);

export const getMarketItem = createAsyncThunk(
  'marketItems/getItem',
  async (id: number) => {
    const response = await APIService.get(`${AppConfig.serviceUrls.farmerWarehouse.marketItemById}/${id}`);
    return response.data;
  }
);

export const searchMarketItems = createAsyncThunk(
  'marketItems/searchItems',
  async (params: { name: string; page?: number; limit?: number }) => {
    const response = await APIService.get(`${AppConfig.serviceUrls.farmerWarehouse.marketItems}/search/${params.name}`, { 
      params: { page: params.page, limit: params.limit } 
    });
    return response.data;
  }
);

export const getMarketItemsByCategory = createAsyncThunk(
  'marketItems/getItemsByCategory',
  async (params: { category: string; page?: number; limit?: number }) => {
    const response = await APIService.get(`${AppConfig.serviceUrls.farmerWarehouse.marketItems}/category/${params.category}`, { 
      params: { page: params.page, limit: params.limit } 
    });
    return response.data;
  }
);

export const getMarketItemCategories = createAsyncThunk(
  'marketItems/getCategories',
  async () => {
    const response = await APIService.get(`${AppConfig.serviceUrls.farmerWarehouse.marketItems}/categories/all`);
    return response.data;
  }
);

export const getMarketItemStats = createAsyncThunk(
  'marketItems/getStats',
  async () => {
    const response = await APIService.get(`${AppConfig.serviceUrls.farmerWarehouse.marketItems}/stats/overview`);
    return response.data;
  }
);

// Admin async thunks
export const createMarketItem = createAsyncThunk(
  'marketItems/createItem',
  async (data: MarketItemCreate) => {
    const response = await APIService.post(AppConfig.serviceUrls.farmerWarehouse.marketItems, data);
    return response.data;
  }
);

export const updateMarketItem = createAsyncThunk(
  'marketItems/updateItem',
  async ({ id, data }: { id: number; data: MarketItemUpdate }) => {
    const response = await APIService.put(`${AppConfig.serviceUrls.farmerWarehouse.marketItemById}/${id}`, data);
    return response.data;
  }
);

export const deleteMarketItem = createAsyncThunk(
  'marketItems/deleteItem',
  async (id: number) => {
    const response = await APIService.delete(`${AppConfig.serviceUrls.farmerWarehouse.marketItemById}/${id}`);
    return response.data;
  }
);

export const toggleMarketItemStatus = createAsyncThunk(
  'marketItems/toggleStatus',
  async (id: number) => {
    const response = await APIService.patch(`${AppConfig.serviceUrls.farmerWarehouse.marketItemById}/${id}/toggle-status`);
    return response.data;
  }
);

// State interface
export interface MarketItemsState {
  // Market items
  items: MarketItem[];
  itemsPagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  itemsLoading: boolean;
  itemsError: string | null;

  // Current item
  currentItem: MarketItem | null;
  currentItemLoading: boolean;
  currentItemError: string | null;

  // Categories
  categories: string[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Statistics
  stats: any;
  statsLoading: boolean;
  statsError: string | null;

  // Search results
  searchResults: MarketItem[];
  searchPagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  searchLoading: boolean;
  searchError: string | null;

  // Messages
  success: string | null;
  error: string | null;
}

// Initial state
const initialState: MarketItemsState = {
  // Market items
  items: [],
  itemsPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  itemsLoading: false,
  itemsError: null,

  // Current item
  currentItem: null,
  currentItemLoading: false,
  currentItemError: null,

  // Categories
  categories: [],
  categoriesLoading: false,
  categoriesError: null,

  // Statistics
  stats: null,
  statsLoading: false,
  statsError: null,

  // Search results
  searchResults: [],
  searchPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  searchLoading: false,
  searchError: null,

  // Messages
  success: null,
  error: null,
};

// Create slice
const marketItemsSlice = createSlice({
  name: 'marketItems',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    resetState: (state) => {
      state.items = [];
      state.currentItem = null;
      state.categories = [];
      state.stats = null;
      state.searchResults = [];
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch market items
    builder
      .addCase(fetchMarketItems.pending, (state) => {
        state.itemsLoading = true;
        state.itemsError = null;
      })
      .addCase(fetchMarketItems.fulfilled, (state, action) => {
        state.itemsLoading = false;
        state.items = action.payload.data?.data || [];
        state.itemsPagination = {
          total: action.payload.data?.pagination?.total || 0,
          totalPages: action.payload.data?.pagination?.totalPages || 0,
          currentPage: action.payload.data?.pagination?.page || 1,
          limit: action.payload.data?.pagination?.limit || 10,
        };
      })
      .addCase(fetchMarketItems.rejected, (state, action) => {
        state.itemsLoading = false;
        state.itemsError = action.error.message || 'Failed to fetch market items';
      });

    // Get market item
    builder
      .addCase(getMarketItem.pending, (state) => {
        state.currentItemLoading = true;
        state.currentItemError = null;
      })
      .addCase(getMarketItem.fulfilled, (state, action) => {
        state.currentItemLoading = false;
        state.currentItem = action.payload.data;
      })
      .addCase(getMarketItem.rejected, (state, action) => {
        state.currentItemLoading = false;
        state.currentItemError = action.error.message || 'Failed to fetch market item';
      });

    // Search market items
    builder
      .addCase(searchMarketItems.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchMarketItems.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data?.data || [];
        state.searchPagination = {
          total: action.payload.data?.pagination?.total || 0,
          totalPages: action.payload.data?.pagination?.totalPages || 0,
          currentPage: action.payload.data?.pagination?.page || 1,
          limit: action.payload.data?.pagination?.limit || 10,
        };
      })
      .addCase(searchMarketItems.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.error.message || 'Failed to search market items';
      });

    // Get categories
    builder
      .addCase(getMarketItemCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(getMarketItemCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload.data || [];
      })
      .addCase(getMarketItemCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.error.message || 'Failed to fetch categories';
      });

    // Get stats
    builder
      .addCase(getMarketItemStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getMarketItemStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(getMarketItemStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.error.message || 'Failed to fetch statistics';
      });

    // Admin operations
    builder
      .addCase(createMarketItem.fulfilled, (state, action) => {
        state.success = 'Market item created successfully';
      })
      .addCase(updateMarketItem.fulfilled, (state, action) => {
        state.success = 'Market item updated successfully';
        // Update the item in the list
        const index = state.items.findIndex(item => item.id === action.payload.data.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload.data };
        }
      })
      .addCase(deleteMarketItem.fulfilled, (state, action) => {
        state.success = 'Market item deleted successfully';
        // Remove the item from the list
        state.items = state.items.filter(item => item.id !== action.payload.data.id);
      })
      .addCase(toggleMarketItemStatus.fulfilled, (state, action) => {
        state.success = 'Market item status toggled successfully';
        // Update the item status in the list
        const index = state.items.findIndex(item => item.id === action.payload.data.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], is_active: !state.items[index].is_active };
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

export const { clearMessages, resetState } = marketItemsSlice.actions;
export default marketItemsSlice.reducer;
