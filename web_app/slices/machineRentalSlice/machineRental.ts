import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { APIService } from '@/utils/apiService';
import { AppConfig } from '@/config/config';
import {
  EquipmentCategory,
  EquipmentCategoryCreate,
  EquipmentCategoryUpdate,
  Equipment,
  EquipmentCreate,
  EquipmentUpdate,
  EquipmentSearchParams,
  EquipmentAvailability,
  EquipmentAvailabilityCreate,
  EquipmentAvailabilityUpdate,
  EquipmentAvailabilitySearchParams,
  EquipmentAvailabilityCheckResponse,
  EquipmentRentalRequest,
  EquipmentRentalRequestCreate,
  EquipmentRentalRequestUpdate,
  EquipmentRentalRequestSearchParams,
  AvailableEquipmentResponse,
} from '@/types/types';

// ==================== EQUIPMENT CATEGORIES ====================

export const fetchEquipmentCategories = createAsyncThunk(
  'machineRental/fetchCategories',
  async (params: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.machineRental.categories}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createEquipmentCategory = createAsyncThunk(
  'machineRental/createCategory',
  async (data: EquipmentCategoryCreate, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(AppConfig.serviceUrls.machineRental.categories, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateEquipmentCategory = createAsyncThunk(
  'machineRental/updateCategory',
  async ({ id, data }: { id: number; data: EquipmentCategoryUpdate }, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(`${AppConfig.serviceUrls.machineRental.categories}/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const activateEquipmentCategory = createAsyncThunk(
  'machineRental/activateCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(`${AppConfig.serviceUrls.machineRental.categories}/${id}/activate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate category');
    }
  }
);

export const deactivateEquipmentCategory = createAsyncThunk(
  'machineRental/deactivateCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(`${AppConfig.serviceUrls.machineRental.categories}/${id}/deactivate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate category');
    }
  }
);

// ==================== EQUIPMENT ====================

export const fetchEquipment = createAsyncThunk(
  'machineRental/fetchEquipment',
  async (params: EquipmentSearchParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.machineRental.equipment}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch equipment');
    }
  }
);

export const createEquipment = createAsyncThunk(
  'machineRental/createEquipment',
  async (data: EquipmentCreate, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(AppConfig.serviceUrls.machineRental.equipment, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create equipment');
    }
  }
);

export const updateEquipment = createAsyncThunk(
  'machineRental/updateEquipment',
  async ({ id, data }: { id: number; data: EquipmentUpdate }, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(`${AppConfig.serviceUrls.machineRental.equipment}/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update equipment');
    }
  }
);

export const activateEquipment = createAsyncThunk(
  'machineRental/activateEquipment',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(`${AppConfig.serviceUrls.machineRental.equipment}/${id}/activate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate equipment');
    }
  }
);

export const deactivateEquipment = createAsyncThunk(
  'machineRental/deactivateEquipment',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(`${AppConfig.serviceUrls.machineRental.equipment}/${id}/deactivate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate equipment');
    }
  }
);

export const getAvailableEquipment = createAsyncThunk(
  'machineRental/getAvailableEquipment',
  async (params: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.machineRental.availableEquipment}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available equipment');
    }
  }
);

// ==================== EQUIPMENT AVAILABILITY ====================

export const setEquipmentAvailability = createAsyncThunk(
  'machineRental/setAvailability',
  async ({ equipmentId, dates, isAvailable, reason }: { 
    equipmentId: number; 
    dates: string[]; 
    isAvailable: boolean; 
    reason?: string 
  }, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.machineRental.equipmentAvailability}/${equipmentId}`,
        { dates, is_available: isAvailable, reason }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set availability');
    }
  }
);

export const checkEquipmentAvailability = createAsyncThunk(
  'machineRental/checkAvailability',
  async ({ equipmentId, startDate, endDate }: { 
    equipmentId: number; 
    startDate: string; 
    endDate: string 
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('start_date', startDate);
      queryParams.append('end_date', endDate);
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.machineRental.equipmentAvailability}/${equipmentId}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check availability');
    }
  }
);

// ==================== RENTAL REQUESTS ====================

export const fetchRentalRequests = createAsyncThunk(
  'machineRental/fetchRentalRequests',
  async (params: EquipmentRentalRequestSearchParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.machineRental.rentalRequests}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rental requests');
    }
  }
);

export const getPendingRentalRequests = createAsyncThunk(
  'machineRental/getPendingRequests',
  async (params: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.machineRental.pendingRequests}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending requests');
    }
  }
);

export const approveRentalRequest = createAsyncThunk(
  'machineRental/approveRequest',
  async ({ requestId, adminNotes }: { requestId: number; adminNotes?: string }, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.machineRental.approveRequest}/${requestId}/approve`,
        { admin_notes: adminNotes }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve request');
    }
  }
);

export const rejectRentalRequest = createAsyncThunk(
  'machineRental/rejectRequest',
  async ({ requestId, rejectionReason, adminNotes }: { 
    requestId: number; 
    rejectionReason: string; 
    adminNotes?: string 
  }, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.machineRental.rejectRequest}/${requestId}/reject`,
        { rejection_reason: rejectionReason, admin_notes: adminNotes }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject request');
    }
  }
);

export const confirmPickup = createAsyncThunk(
  'machineRental/confirmPickup',
  async (requestId: number, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.machineRental.confirmPickup}/${requestId}/confirm-pickup`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm pickup');
    }
  }
);

export const confirmReturn = createAsyncThunk(
  'machineRental/confirmReturn',
  async (requestId: number, { rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.machineRental.confirmReturn}/${requestId}/confirm-return`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm return');
    }
  }
);

// ==================== STATE INTERFACE ====================

interface MachineRentalState {
  // Equipment Categories
  categories: EquipmentCategory[];
  categoriesPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Equipment
  equipment: Equipment[];
  equipmentPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Available Equipment
  availableEquipment: Equipment[];
  availableEquipmentPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Equipment Availability
  equipmentAvailability: EquipmentAvailabilityCheckResponse | null;
  
  // Rental Requests
  rentalRequests: EquipmentRentalRequest[];
  rentalRequestsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Common state
  loading: boolean;
  error: string | null;
  success: string | null;
  searchParams: EquipmentSearchParams;
  rentalSearchParams: EquipmentRentalRequestSearchParams;
}

// ==================== INITIAL STATE ====================

const initialState: MachineRentalState = {
  // Equipment Categories
  categories: [],
  categoriesPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  
  // Equipment
  equipment: [],
  equipmentPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  
  // Available Equipment
  availableEquipment: [],
  availableEquipmentPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  
  // Equipment Availability
  equipmentAvailability: null,
  
  // Rental Requests
  rentalRequests: [],
  rentalRequestsPagination: {
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
  rentalSearchParams: {
    page: 1,
    limit: 10,
  },
};

// ==================== SLICE ====================

const machineRentalSlice = createSlice({
  name: 'machineRental',
  initialState,
  reducers: {
    // Clear messages
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    
    // Set search parameters
    setSearchParams: (state, action: PayloadAction<Partial<EquipmentSearchParams>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    
    // Set rental search parameters
    setRentalSearchParams: (state, action: PayloadAction<Partial<EquipmentRentalRequestSearchParams>>) => {
      state.rentalSearchParams = { ...state.rentalSearchParams, ...action.payload };
    },
    
    // Reset state
    resetState: (state) => {
      state.categories = [];
      state.equipment = [];
      state.availableEquipment = [];
      state.equipmentAvailability = null;
      state.rentalRequests = [];
      state.categoriesPagination = initialState.categoriesPagination;
      state.equipmentPagination = initialState.equipmentPagination;
      state.availableEquipmentPagination = initialState.availableEquipmentPagination;
      state.rentalRequestsPagination = initialState.rentalRequestsPagination;
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==================== EQUIPMENT CATEGORIES ====================
      
      // Fetch categories
      .addCase(fetchEquipmentCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipmentCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
        state.categoriesPagination = action.payload.pagination;
      })
      .addCase(fetchEquipmentCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create category
      .addCase(createEquipmentCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEquipmentCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.categories.unshift(action.payload.data);
      })
      .addCase(createEquipmentCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update category
      .addCase(updateEquipmentCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEquipmentCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.categories.findIndex(cat => cat.id === action.payload.data.id);
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
      })
      .addCase(updateEquipmentCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Activate category
      .addCase(activateEquipmentCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateEquipmentCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.categories.findIndex(cat => cat.id === action.payload.data.id);
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
      })
      .addCase(activateEquipmentCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Deactivate category
      .addCase(deactivateEquipmentCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateEquipmentCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.categories.findIndex(cat => cat.id === action.payload.data.id);
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
      })
      .addCase(deactivateEquipmentCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // ==================== EQUIPMENT ====================
      
      // Fetch equipment
      .addCase(fetchEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = action.payload.data;
        state.equipmentPagination = action.payload.pagination;
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create equipment
      .addCase(createEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.equipment.unshift(action.payload.data);
      })
      .addCase(createEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update equipment
      .addCase(updateEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.equipment.findIndex(eq => eq.id === action.payload.data.id);
        if (index !== -1) {
          state.equipment[index] = action.payload.data;
        }
      })
      .addCase(updateEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Activate equipment
      .addCase(activateEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.equipment.findIndex(eq => eq.id === action.payload.data.id);
        if (index !== -1) {
          state.equipment[index] = action.payload.data;
        }
      })
      .addCase(activateEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Deactivate equipment
      .addCase(deactivateEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.equipment.findIndex(eq => eq.id === action.payload.data.id);
        if (index !== -1) {
          state.equipment[index] = action.payload.data;
        }
      })
      .addCase(deactivateEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get available equipment
      .addCase(getAvailableEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.availableEquipment = action.payload.data;
        state.availableEquipmentPagination = action.payload.pagination;
      })
      .addCase(getAvailableEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // ==================== EQUIPMENT AVAILABILITY ====================
      
      // Set availability
      .addCase(setEquipmentAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setEquipmentAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(setEquipmentAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Check availability
      .addCase(checkEquipmentAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkEquipmentAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.equipmentAvailability = action.payload.data;
      })
      .addCase(checkEquipmentAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // ==================== RENTAL REQUESTS ====================
      
      // Fetch rental requests
      .addCase(fetchRentalRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentalRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.rentalRequests = action.payload.data;
        state.rentalRequestsPagination = action.payload.pagination;
      })
      .addCase(fetchRentalRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get pending requests
      .addCase(getPendingRentalRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingRentalRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.rentalRequests = action.payload.data;
        state.rentalRequestsPagination = action.payload.pagination;
      })
      .addCase(getPendingRentalRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Approve request
      .addCase(approveRentalRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveRentalRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.rentalRequests.findIndex(req => req.id === action.payload.data.id);
        if (index !== -1) {
          state.rentalRequests[index] = action.payload.data;
        }
      })
      .addCase(approveRentalRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Reject request
      .addCase(rejectRentalRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectRentalRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.rentalRequests.findIndex(req => req.id === action.payload.data.id);
        if (index !== -1) {
          state.rentalRequests[index] = action.payload.data;
        }
      })
      .addCase(rejectRentalRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Confirm pickup
      .addCase(confirmPickup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPickup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.rentalRequests.findIndex(req => req.id === action.payload.data.id);
        if (index !== -1) {
          state.rentalRequests[index] = action.payload.data;
        }
      })
      .addCase(confirmPickup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Confirm return
      .addCase(confirmReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const index = state.rentalRequests.findIndex(req => req.id === action.payload.data.id);
        if (index !== -1) {
          state.rentalRequests[index] = action.payload.data;
        }
      })
      .addCase(confirmReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessages, setSearchParams, setRentalSearchParams, resetState } = machineRentalSlice.actions;
export default machineRentalSlice.reducer;
