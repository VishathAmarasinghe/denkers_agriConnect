import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { APIService } from '@/utils/apiService';
import { AppConfig } from '@/config/config';
import { 
  SoilCollectionCenter, 
  SoilCollectionCenterCreateData, 
  SoilCollectionCenterUpdateData, 
  SoilCollectionCenterSearchParams,
  PaginatedResponse 
} from '@/types/types';

// Async thunks
export const fetchSoilCollectionCenters = createAsyncThunk(
  'soilCollection/fetchCenters',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.soilCollection.centers}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch centers');
    }
  }
);

export const searchSoilCollectionCenters = createAsyncThunk(
  'soilCollection/searchCenters',
  async (searchParams: SoilCollectionCenterSearchParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.soilCollection.search}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search centers');
    }
  }
);

export const createSoilCollectionCenter = createAsyncThunk(
  'soilCollection/createCenter',
  async (centerData: SoilCollectionCenterCreateData, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.soilCollection.centers,
        centerData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create center');
    }
  }
);

export const updateSoilCollectionCenter = createAsyncThunk(
  'soilCollection/updateCenter',
  async ({ id, data }: { id: number; data: SoilCollectionCenterUpdateData }, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(
        `${AppConfig.serviceUrls.soilCollection.centers}/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update center');
    }
  }
);

export const deleteSoilCollectionCenter = createAsyncThunk(
  'soilCollection/deleteCenter',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().delete(
        `${AppConfig.serviceUrls.soilCollection.centers}/${id}`
      );
      return { id, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete center');
    }
  }
);

export const getSoilCollectionCenter = createAsyncThunk(
  'soilCollection/getCenter',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.soilCollection.centers}/${id}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch center');
    }
  }
);

// State interface
interface SoilCollectionState {
  centers: SoilCollectionCenter[];
  selectedCenter: SoilCollectionCenter | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  success: string | null;
  searchParams: SoilCollectionCenterSearchParams;
}

// Initial state
const initialState: SoilCollectionState = {
  centers: [],
  selectedCenter: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  success: null,
  searchParams: {
    page: 1,
    limit: 10,
  },
};

// Slice
const soilCollectionSlice = createSlice({
  name: 'soilCollection',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setSearchParams: (state, action: PayloadAction<SoilCollectionCenterSearchParams>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    setSelectedCenter: (state, action: PayloadAction<SoilCollectionCenter | null>) => {
      state.selectedCenter = action.payload;
    },
    resetState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch centers
    builder
      .addCase(fetchSoilCollectionCenters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSoilCollectionCenters.fulfilled, (state, action) => {
        state.loading = false;
        state.centers = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSoilCollectionCenters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search centers
    builder
      .addCase(searchSoilCollectionCenters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSoilCollectionCenters.fulfilled, (state, action) => {
        state.loading = false;
        state.centers = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchSoilCollectionCenters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create center
    builder
      .addCase(createSoilCollectionCenter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSoilCollectionCenter.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Center created successfully';
        state.centers.unshift(action.payload.data);
        state.pagination.total += 1;
      })
      .addCase(createSoilCollectionCenter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update center
    builder
      .addCase(updateSoilCollectionCenter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSoilCollectionCenter.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Center updated successfully';
        const index = state.centers.findIndex(center => center.id === action.payload.data.id);
        if (index !== -1) {
          state.centers[index] = action.payload.data;
        }
        if (state.selectedCenter?.id === action.payload.data.id) {
          state.selectedCenter = action.payload.data;
        }
      })
      .addCase(updateSoilCollectionCenter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete center
    builder
      .addCase(deleteSoilCollectionCenter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSoilCollectionCenter.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Center deleted successfully';
        state.centers = state.centers.filter(center => center.id !== action.payload.id);
        state.pagination.total -= 1;
        if (state.selectedCenter?.id === action.payload.id) {
          state.selectedCenter = null;
        }
      })
      .addCase(deleteSoilCollectionCenter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get single center
    builder
      .addCase(getSoilCollectionCenter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSoilCollectionCenter.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCenter = action.payload.data;
      })
      .addCase(getSoilCollectionCenter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessages, setSearchParams, setSelectedCenter, resetState } = soilCollectionSlice.actions;
export default soilCollectionSlice.reducer;
