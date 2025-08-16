import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { APIService } from '@/utils/apiService';
import { AppConfig } from '@/config/config';
import {
  SoilTestingRequest,
  SoilTestingRequestCreateData,
  SoilTestingRequestUpdateData,
  SoilTestingRequestSearchParams,
  SoilTestingReport,
  SoilTestingReportCreateData,
  SoilTestingReportUpdateData,
  SoilTestingReportSearchParams,
} from '@/types/types';

// ==================== SOIL TESTING REQUESTS ====================

// Async thunks for soil testing requests
export const fetchSoilTestingRequests = createAsyncThunk(
  'soilTesting/fetchRequests',
  async (params: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.soilTesting.requests}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
    }
  }
);

export const searchSoilTestingRequests = createAsyncThunk(
  'soilTesting/searchRequests',
  async (params: SoilTestingRequestSearchParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.soilTesting.search}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search requests');
    }
  }
);

export const createSoilTestingRequest = createAsyncThunk(
  'soilTesting/createRequest',
  async (data: SoilTestingRequestCreateData, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(AppConfig.serviceUrls.soilTesting.requests, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create request');
    }
  }
);

export const updateSoilTestingRequest = createAsyncThunk(
  'soilTesting/updateRequest',
  async ({ id, data }: { id: number; data: SoilTestingRequestUpdateData }, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(`${AppConfig.serviceUrls.soilTesting.requests}/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update request');
    }
  }
);

export const getPendingSoilTestingRequests = createAsyncThunk(
  'soilTesting/getPendingRequests',
  async (params: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.soilTesting.pending}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending requests');
    }
  }
);

export const getSoilTestingRequestsByFarmer = createAsyncThunk(
  'soilTesting/getRequestsByFarmer',
  async ({ farmerId, params }: { farmerId: number; params: { page: number; limit: number } }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.soilTesting.byFarmer}/${farmerId}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch farmer requests');
    }
  }
);

// ==================== SOIL TESTING REPORTS ====================

// Async thunks for soil testing reports
export const fetchSoilTestingReports = createAsyncThunk(
  'soilTesting/fetchReports',
  async (params: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.soilTesting.reports}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports');
    }
  }
);

export const searchSoilTestingReports = createAsyncThunk(
  'soilTesting/searchReports',
  async (params: SoilTestingReportSearchParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.soilTesting.reportsSearch}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search reports');
    }
  }
);

export const createSoilTestingReport = createAsyncThunk(
  'soilTesting/createReport',
  async (data: SoilTestingReportCreateData | FormData, { rejectWithValue }) => {
    try {
      let response;
      
      if (data instanceof FormData) {
        // For file uploads, send FormData with proper headers
        response = await APIService.getInstance().post(
          AppConfig.serviceUrls.soilTesting.createReport, 
          data,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // For regular JSON data
        response = await APIService.getInstance().post(AppConfig.serviceUrls.soilTesting.reports, data);
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create report');
    }
  }
);

export const updateSoilTestingReport = createAsyncThunk(
  'soilTesting/updateReport',
  async ({ id, data }: { id: number; data: SoilTestingReportUpdateData }, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(`${AppConfig.serviceUrls.soilTesting.reports}/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update report');
    }
  }
);

export const deleteSoilTestingReport = createAsyncThunk(
  'soilTesting/deleteReport',
  async (id: number, { rejectWithValue }) => {
    try {
      await APIService.getInstance().delete(`${AppConfig.serviceUrls.soilTesting.reports}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete report');
    }
  }
);

export const getPublicSoilTestingReports = createAsyncThunk(
  'soilTesting/getPublicReports',
  async (params: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.soilTesting.publicReports}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch public reports');
    }
  }
);

// State interface
interface SoilTestingState {
  // Soil Testing Requests
  requests: SoilTestingRequest[];
  requestsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Soil Testing Reports
  reports: SoilTestingReport[];
  reportsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Common state
  loading: boolean;
  error: string | null;
  success: string | null;
  searchParams: SoilTestingRequestSearchParams;
}

// Initial state
const initialState: SoilTestingState = {
  // Soil Testing Requests
  requests: [],
  requestsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  
  // Soil Testing Reports
  reports: [],
  reportsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  
  // Common state
  loading: false,
  error: null,
  success: null,
  searchParams: {
    page: 1,
    limit: 10,
  },
};

// Soil Testing Slice
const soilTestingSlice = createSlice({
  name: 'soilTesting',
  initialState,
  reducers: {
    // Clear messages
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    
    // Set search parameters
    setSearchParams: (state, action: PayloadAction<Partial<SoilTestingRequestSearchParams>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    
    // Reset state
    resetState: (state) => {
      state.requests = [];
      state.reports = [];
      state.requestsPagination = initialState.requestsPagination;
      state.reportsPagination = initialState.reportsPagination;
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==================== SOIL TESTING REQUESTS ====================
      
      // Fetch requests
      .addCase(fetchSoilTestingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSoilTestingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data;
        state.requestsPagination = action.payload.pagination;
      })
      .addCase(fetchSoilTestingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch soil testing requests';
      })
      
      // Search requests
      .addCase(searchSoilTestingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSoilTestingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data;
        state.requestsPagination = action.payload.pagination;
      })
      .addCase(searchSoilTestingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search soil testing requests';
      })
      
      // Create request
      .addCase(createSoilTestingRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSoilTestingRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Soil testing request created successfully';
        state.requests.unshift(action.payload.data);
      })
      .addCase(createSoilTestingRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create soil testing request';
      })
      
      // Update request
      .addCase(updateSoilTestingRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSoilTestingRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Soil testing request updated successfully';
        const index = state.requests.findIndex(req => req.id === action.payload.data.id);
        if (index !== -1) {
          state.requests[index] = action.payload.data;
        }
      })
      .addCase(updateSoilTestingRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update soil testing request';
      })
      
      // Get pending requests
      .addCase(getPendingSoilTestingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingSoilTestingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data;
        state.requestsPagination = action.payload.pagination;
      })
      .addCase(getPendingSoilTestingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pending requests';
      })
      
      // Get requests by farmer
      .addCase(getSoilTestingRequestsByFarmer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSoilTestingRequestsByFarmer.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data;
        state.requestsPagination = action.payload.pagination;
      })
      .addCase(getSoilTestingRequestsByFarmer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch farmer requests';
      })
      
      // ==================== SOIL TESTING REPORTS ====================
      
      // Fetch reports
      .addCase(fetchSoilTestingReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSoilTestingReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.data;
        state.reportsPagination = action.payload.pagination;
      })
      .addCase(fetchSoilTestingReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch soil testing reports';
      })
      
      // Search reports
      .addCase(searchSoilTestingReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSoilTestingReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.data;
        state.reportsPagination = action.payload.pagination;
      })
      .addCase(searchSoilTestingReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search soil testing reports';
      })
      
      // Create report
      .addCase(createSoilTestingReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSoilTestingReport.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Soil testing report created successfully';
        state.reports.unshift(action.payload.data);
      })
      .addCase(createSoilTestingReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create soil testing report';
      })
      
      // Update report
      .addCase(updateSoilTestingReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSoilTestingReport.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message || 'Soil testing report updated successfully';
        const index = state.reports.findIndex(rep => rep.id === action.payload.data.id);
        if (index !== -1) {
          state.reports[index] = action.payload.data;
        }
      })
      .addCase(updateSoilTestingReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update soil testing report';
      })
      
      // Delete report
      .addCase(deleteSoilTestingReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSoilTestingReport.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Soil testing report deleted successfully';
        state.reports = state.reports.filter(rep => rep.id !== action.payload);
      })
      .addCase(deleteSoilTestingReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete soil testing report';
      })
      
      // Get public reports
      .addCase(getPublicSoilTestingReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicSoilTestingReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.data;
        state.reportsPagination = action.payload.pagination;
      })
      .addCase(getPublicSoilTestingReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch public reports';
      });
  },
});

// Export actions
export const { clearMessages, setSearchParams, resetState } = soilTestingSlice.actions;

// Export reducer
export default soilTestingSlice.reducer;
