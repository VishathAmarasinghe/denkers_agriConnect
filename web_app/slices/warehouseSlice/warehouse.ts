import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { APIService } from '@/utils/apiService';
import { AppConfig } from '@/config/config';
import {
  Warehouse,
  WarehouseCategory,
  WarehouseCreateData,
  WarehouseUpdateData,
  WarehouseSearchParams,
  WarehouseImage,
  WarehouseImageCreate,
  WarehouseInventory,
  WarehouseInventoryCreate,
  WarehouseInventoryUpdate,
  WarehouseInventorySearchParams,
  WarehouseAvailability,
  WarehouseAvailabilityCreate,
  WarehouseTimeSlot,
  WarehouseTimeSlotCreate,
  WarehouseBooking,
  WarehouseBookingCreate,
  WarehouseBookingSearchParams,
  WarehouseAvailableDatesResponse,
  WarehouseAvailableTimeSlotsResponse,
} from '@/types/types';

// Async thunks for warehouse categories
export const fetchWarehouseCategories = createAsyncThunk(
  'warehouse/fetchCategories',
  async (params: { page?: number; limit?: number }) => {
    const response = await APIService.get(AppConfig.serviceUrls.warehouse.categories, { params });
    return response.data;
  }
);

export const createWarehouseCategory = createAsyncThunk(
  'warehouse/createCategory',
  async (data: { name: string; description?: string }) => {
    const response = await APIService.post(AppConfig.serviceUrls.warehouse.categories, data);
    return response.data;
  }
);

export const updateWarehouseCategory = createAsyncThunk(
  'warehouse/updateCategory',
  async ({ id, data }: { id: number; data: { name?: string; description?: string } }) => {
    const response = await APIService.put(`${AppConfig.serviceUrls.warehouse.categories}/${id}`, data);
    return response.data;
  }
);

export const deleteWarehouseCategory = createAsyncThunk(
  'warehouse/deleteCategory',
  async (id: number) => {
    const response = await APIService.delete(`${AppConfig.serviceUrls.warehouse.categories}/${id}`);
    return response.data;
  }
);

// Async thunks for warehouses
export const fetchWarehouses = createAsyncThunk(
  'warehouse/fetchWarehouses',
  async (params: WarehouseSearchParams) => {
    const response = await APIService.get(AppConfig.serviceUrls.warehouse.warehouses, { params });
    return response.data;
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouse/createWarehouse',
  async (data: WarehouseCreateData) => {
    const response = await APIService.post(AppConfig.serviceUrls.warehouse.warehouses, data);
    return response.data;
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouse/updateWarehouse',
  async ({ id, data }: { id: number; data: WarehouseUpdateData }) => {
    const response = await APIService.put(`${AppConfig.serviceUrls.warehouse.warehouses}/${id}`, data);
    return response.data;
  }
);

export const deleteWarehouse = createAsyncThunk(
  'warehouse/deleteWarehouse',
  async (id: number) => {
    const response = await APIService.delete(`${AppConfig.serviceUrls.warehouse.warehouses}/${id}`);
    return response.data;
  }
);

export const getWarehouse = createAsyncThunk(
  'warehouse/getWarehouse',
  async (id: number) => {
    const response = await APIService.get(`${AppConfig.serviceUrls.warehouse.warehouses}/${id}`);
    return response.data;
  }
);

// Async thunks for warehouse images
export const addWarehouseImage = createAsyncThunk(
  'warehouse/addImage',
  async (data: WarehouseImageCreate) => {
    const response = await APIService.post(AppConfig.serviceUrls.warehouse.warehouseImages, data);
    return response.data;
  }
);

export const deleteWarehouseImage = createAsyncThunk(
  'warehouse/deleteImage',
  async (id: number) => {
    const response = await APIService.delete(`${AppConfig.serviceUrls.warehouse.warehouseImages}/${id}`);
    return response.data;
  }
);

export const setPrimaryWarehouseImage = createAsyncThunk(
  'warehouse/setPrimaryImage',
  async (id: number) => {
    const response = await APIService.put(`${AppConfig.serviceUrls.warehouse.warehouseImages}/${id}/primary`);
    return response.data;
  }
);

// Async thunks for warehouse inventory
export const fetchWarehouseInventory = createAsyncThunk(
  'warehouse/fetchInventory',
  async (params: WarehouseInventorySearchParams) => {
    const response = await APIService.get(AppConfig.serviceUrls.warehouse.warehouseInventory, { params });
    return response.data;
  }
);

export const createInventoryItem = createAsyncThunk(
  'warehouse/createInventoryItem',
  async (data: WarehouseInventoryCreate) => {
    const response = await APIService.post(AppConfig.serviceUrls.warehouse.warehouseInventory, data);
    return response.data;
  }
);

export const updateInventoryItem = createAsyncThunk(
  'warehouse/updateInventoryItem',
  async ({ id, data }: { id: number; data: WarehouseInventoryUpdate }) => {
    const response = await APIService.put(`${AppConfig.serviceUrls.warehouse.warehouseInventory}/${id}`, data);
    return response.data;
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'warehouse/deleteInventoryItem',
  async (id: number) => {
    const response = await APIService.delete(`${AppConfig.serviceUrls.warehouse.warehouseInventory}/${id}`);
    return response.data;
  }
);

// Async thunks for warehouse availability
export const setWarehouseAvailability = createAsyncThunk(
  'warehouse/setAvailability',
  async (data: WarehouseAvailabilityCreate) => {
    const response = await APIService.post(AppConfig.serviceUrls.warehouse.warehouseAvailability, data);
    return response.data;
  }
);

export const checkWarehouseAvailability = createAsyncThunk(
  'warehouse/checkAvailability',
  async ({ warehouseId, date }: { warehouseId: number; date: Date }) => {
    const response = await APIService.get(`${AppConfig.serviceUrls.warehouse.warehouseAvailability}/check`, {
      params: { warehouse_id: warehouseId, date: date.toISOString() }
    });
    return response.data;
  }
);

export const getWarehouseAvailableDates = createAsyncThunk(
  'warehouse/getAvailableDates',
  async ({ warehouseId, startDate, endDate }: { warehouseId: number; startDate: Date; endDate: Date }) => {
    const response = await APIService.get(`${AppConfig.serviceUrls.warehouse.availableDates}`, {
      params: { warehouse_id: warehouseId, start_date: startDate.toISOString(), end_date: endDate.toISOString() }
    });
    return response.data;
  }
);

// Async thunks for warehouse time slots
export const createTimeSlot = createAsyncThunk(
  'warehouse/createTimeSlot',
  async (data: WarehouseTimeSlotCreate) => {
    const response = await APIService.post(AppConfig.serviceUrls.warehouse.warehouseTimeSlots, data);
    return response.data;
  }
);

export const getAvailableTimeSlots = createAsyncThunk(
  'warehouse/getAvailableTimeSlots',
  async ({ warehouseId, date }: { warehouseId: number; date: Date }) => {
    const response = await APIService.get(`${AppConfig.serviceUrls.warehouse.availableTimeSlots}`, {
      params: { warehouse_id: warehouseId, date: date.toISOString() }
    });
    return response.data;
  }
);

// Async thunks for warehouse bookings
export const fetchWarehouseBookings = createAsyncThunk(
  'warehouse/fetchBookings',
  async (params: WarehouseBookingSearchParams) => {
    const response = await APIService.get(AppConfig.serviceUrls.warehouse.warehouseBookings, { params });
    return response.data;
  }
);

export const createWarehouseBooking = createAsyncThunk(
  'warehouse/createBooking',
  async (data: WarehouseBookingCreate) => {
    const response = await APIService.post(AppConfig.serviceUrls.warehouse.warehouseBookings, data);
    return response.data;
  }
);

export const approveWarehouseBooking = createAsyncThunk(
  'warehouse/approveBooking',
  async ({ bookingId, adminNotes }: { bookingId: number; adminNotes?: string }) => {
    const response = await APIService.post(`${AppConfig.serviceUrls.warehouse.approveBooking}/${bookingId}`, {
      admin_notes: adminNotes
    });
    return response.data;
  }
);

export const rejectWarehouseBooking = createAsyncThunk(
  'warehouse/rejectBooking',
  async ({ bookingId, rejectionReason, adminNotes }: { bookingId: number; rejectionReason: string; adminNotes?: string }) => {
    const response = await APIService.post(`${AppConfig.serviceUrls.warehouse.rejectBooking}/${bookingId}`, {
      rejection_reason: rejectionReason,
      admin_notes: adminNotes
    });
    return response.data;
  }
);

export const confirmWarehousePickup = createAsyncThunk(
  'warehouse/confirmPickup',
  async (bookingId: number) => {
    const response = await APIService.post(`${AppConfig.serviceUrls.warehouse.confirmPickup}/${bookingId}`);
    return response.data;
  }
);

export const confirmWarehouseReturn = createAsyncThunk(
  'warehouse/confirmReturn',
  async (bookingId: number) => {
    const response = await APIService.post(`${AppConfig.serviceUrls.warehouse.confirmReturn}/${bookingId}`);
    return response.data;
  }
);

export const getTodayBookings = createAsyncThunk(
  'warehouse/getTodayBookings',
  async (warehouseId?: number) => {
    const response = await APIService.get(AppConfig.serviceUrls.warehouse.todayBookings, {
      params: warehouseId ? { warehouse_id: warehouseId } : {}
    });
    return response.data;
  }
);

export const getOverdueBookings = createAsyncThunk(
  'warehouse/getOverdueBookings',
  async () => {
    const response = await APIService.get(AppConfig.serviceUrls.warehouse.overdueBookings);
    return response.data;
  }
);

// State interface
interface WarehouseState {
  // Categories
  categories: WarehouseCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  
  // Warehouses
  warehouses: Warehouse[];
  warehousesPagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  warehousesLoading: boolean;
  warehousesError: string | null;
  
  // Current warehouse
  currentWarehouse: Warehouse | null;
  currentWarehouseLoading: boolean;
  currentWarehouseError: string | null;
  
  // Images
  warehouseImages: WarehouseImage[];
  imagesLoading: boolean;
  imagesError: string | null;
  
  // Inventory
  inventory: WarehouseInventory[];
  inventoryPagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  inventoryLoading: boolean;
  inventoryError: string | null;
  
  // Availability
  availability: WarehouseAvailability[];
  availabilityLoading: boolean;
  availabilityError: string | null;
  
  // Time slots
  timeSlots: WarehouseTimeSlot[];
  timeSlotsLoading: boolean;
  timeSlotsError: string | null;
  
  // Bookings
  bookings: WarehouseBooking[];
  bookingsPagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  bookingsLoading: boolean;
  bookingsError: string | null;
  
  // Available dates
  availableDates: WarehouseAvailableDatesResponse | null;
  availableDatesLoading: boolean;
  availableDatesError: string | null;
  
  // Available time slots
  availableTimeSlots: WarehouseAvailableTimeSlotsResponse | null;
  availableTimeSlotsLoading: boolean;
  availableTimeSlotsLoadingError: string | null;
  
  // Search parameters
  searchParams: WarehouseSearchParams;
  inventorySearchParams: WarehouseInventorySearchParams;
  bookingSearchParams: WarehouseBookingSearchParams;
  
  // Messages
  success: string | null;
  error: string | null;
}

// Initial state
const initialState: WarehouseState = {
  // Categories
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  
  // Warehouses
  warehouses: [],
  warehousesPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  warehousesLoading: false,
  warehousesError: null,
  
  // Current warehouse
  currentWarehouse: null,
  currentWarehouseLoading: false,
  currentWarehouseError: null,
  
  // Images
  warehouseImages: [],
  imagesLoading: false,
  imagesError: null,
  
  // Inventory
  inventory: [],
  inventoryPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  inventoryLoading: false,
  inventoryError: null,
  
  // Availability
  availability: [],
  availabilityLoading: false,
  availabilityError: null,
  
  // Time slots
  timeSlots: [],
  timeSlotsLoading: false,
  timeSlotsError: null,
  
  // Bookings
  bookings: [],
  bookingsPagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  },
  bookingsLoading: false,
  bookingsError: null,
  
  // Available dates
  availableDates: null,
  availableDatesLoading: false,
  availableDatesError: null,
  
  // Available time slots
  availableTimeSlots: null,
  availableTimeSlotsLoading: false,
  availableTimeSlotsLoadingError: null,
  
  // Search parameters
  searchParams: {
    page: 1,
    limit: 10,
  },
  inventorySearchParams: {
    page: 1,
    limit: 10,
  },
  bookingSearchParams: {
    page: 1,
    limit: 10,
  },
  
  // Messages
  success: null,
  error: null,
};

// Create slice
const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setSearchParams: (state, action: PayloadAction<Partial<WarehouseSearchParams>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    setInventorySearchParams: (state, action: PayloadAction<Partial<WarehouseInventorySearchParams>>) => {
      state.inventorySearchParams = { ...state.inventorySearchParams, ...action.payload };
    },
    setBookingSearchParams: (state, action: PayloadAction<Partial<WarehouseBookingSearchParams>>) => {
      state.bookingSearchParams = { ...state.bookingSearchParams, ...action.payload };
    },
    resetState: (state) => {
      state.warehouses = [];
      state.currentWarehouse = null;
      state.warehouseImages = [];
      state.inventory = [];
      state.availability = [];
      state.timeSlots = [];
      state.bookings = [];
      state.availableDates = null;
      state.availableTimeSlots = null;
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Categories
    builder
      .addCase(fetchWarehouseCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchWarehouseCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload.data?.data || action.payload.data || [];
      })
      .addCase(fetchWarehouseCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.error.message || 'Failed to fetch categories';
      })
      .addCase(createWarehouseCategory.fulfilled, (state, action) => {
        state.success = 'Category created successfully';
        state.categories.push(action.payload.data);
      })
      .addCase(updateWarehouseCategory.fulfilled, (state, action) => {
        state.success = 'Category updated successfully';
        const index = state.categories.findIndex(cat => cat.id === action.payload.data.id);
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
      })
      .addCase(deleteWarehouseCategory.fulfilled, (state, action) => {
        state.success = 'Category deleted successfully';
        state.categories = state.categories.filter(cat => cat.id !== action.payload.data.id);
      });

    // Warehouses
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.warehousesLoading = true;
        state.warehousesError = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.warehousesLoading = false;
        state.warehouses = action.payload.data.data || [];
        state.warehousesPagination = {
          total: action.payload.data.pagination?.total || 0,
          totalPages: action.payload.data.pagination?.totalPages || 0,
          currentPage: action.payload.data.pagination?.page || 1,
          limit: action.payload.data.pagination?.limit || 10,
        };
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.warehousesLoading = false;
        state.warehousesError = action.error.message || 'Failed to fetch warehouses';
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.success = 'Warehouse created successfully';
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        state.success = 'Warehouse updated successfully';
        const index = state.warehouses.findIndex(wh => wh.id === action.payload.data.id);
        if (index !== -1) {
          state.warehouses[index] = { ...state.warehouses[index], ...action.payload.data };
        }
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.success = 'Warehouse deleted successfully';
        state.warehouses = state.warehouses.filter(wh => wh.id !== action.payload.data.id);
      })
      .addCase(getWarehouse.pending, (state) => {
        state.currentWarehouseLoading = true;
        state.currentWarehouseError = null;
      })
      .addCase(getWarehouse.fulfilled, (state, action) => {
        state.currentWarehouseLoading = false;
        state.currentWarehouse = action.payload.data;
      })
      .addCase(getWarehouse.rejected, (state, action) => {
        state.currentWarehouseLoading = false;
        state.currentWarehouseError = action.error.message || 'Failed to fetch warehouse';
      });

    // Images
    builder
      .addCase(addWarehouseImage.fulfilled, (state, action) => {
        state.success = 'Image added successfully';
      })
      .addCase(deleteWarehouseImage.fulfilled, (state, action) => {
        state.success = 'Image deleted successfully';
        state.warehouseImages = state.warehouseImages.filter(img => img.id !== action.payload.data.id);
      })
      .addCase(setPrimaryWarehouseImage.fulfilled, (state, action) => {
        state.success = 'Primary image updated successfully';
      });

    // Inventory
    builder
      .addCase(fetchWarehouseInventory.pending, (state) => {
        state.inventoryLoading = true;
        state.inventoryError = null;
      })
      .addCase(fetchWarehouseInventory.fulfilled, (state, action) => {
        state.inventoryLoading = false;
        state.inventory = action.payload.data.data || [];
        state.inventoryPagination = {
          total: action.payload.data.pagination?.total || 0,
          totalPages: action.payload.data.pagination?.totalPages || 0,
          currentPage: action.payload.data.pagination?.page || 1,
          limit: action.payload.data.pagination?.limit || 10,
        };
      })
      .addCase(fetchWarehouseInventory.rejected, (state, action) => {
        state.inventoryLoading = false;
        state.inventoryError = action.error.message || 'Failed to fetch inventory';
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.success = 'Inventory item created successfully';
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.success = 'Inventory item updated successfully';
        const index = state.inventory.findIndex(item => item.id === action.payload.data.id);
        if (index !== -1) {
          state.inventory[index] = { ...state.inventory[index], ...action.payload.data };
        }
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.success = 'Inventory item deleted successfully';
        state.inventory = state.inventory.filter(item => item.id !== action.payload.data.id);
      });

    // Availability
    builder
      .addCase(setWarehouseAvailability.fulfilled, (state, action) => {
        state.success = 'Availability updated successfully';
      })
      .addCase(checkWarehouseAvailability.fulfilled, (state, action) => {
        state.availability = action.payload.data || [];
      })
      .addCase(getWarehouseAvailableDates.pending, (state) => {
        state.availableDatesLoading = true;
        state.availableDatesError = null;
      })
      .addCase(getWarehouseAvailableDates.fulfilled, (state, action) => {
        state.availableDatesLoading = false;
        state.availableDates = action.payload.data;
      })
      .addCase(getWarehouseAvailableDates.rejected, (state, action) => {
        state.availableDatesLoading = false;
        state.availableDatesError = action.error.message || 'Failed to fetch available dates';
      });

    // Time slots
    builder
      .addCase(createTimeSlot.fulfilled, (state, action) => {
        state.success = 'Time slot created successfully';
      })
      .addCase(getAvailableTimeSlots.pending, (state) => {
        state.availableTimeSlotsLoading = true;
        state.availableTimeSlotsLoadingError = null;
      })
      .addCase(getAvailableTimeSlots.fulfilled, (state, action) => {
        state.availableTimeSlotsLoading = false;
        state.availableTimeSlots = action.payload.data;
      })
      .addCase(getAvailableTimeSlots.rejected, (state, action) => {
        state.availableTimeSlotsLoading = false;
        state.availableTimeSlotsLoadingError = action.error.message || 'Failed to fetch time slots';
      });

    // Bookings
    builder
      .addCase(fetchWarehouseBookings.pending, (state) => {
        state.bookingsLoading = true;
        state.bookingsError = null;
      })
      .addCase(fetchWarehouseBookings.fulfilled, (state, action) => {
        state.bookingsLoading = false;
        state.bookings = action.payload.data.data || [];
        state.bookingsPagination = {
          total: action.payload.data.pagination?.total || 0,
          totalPages: action.payload.data.pagination?.totalPages || 0,
          currentPage: action.payload.data.pagination?.page || 1,
          limit: action.payload.data.pagination?.limit || 10,
        };
      })
      .addCase(fetchWarehouseBookings.rejected, (state, action) => {
        state.bookingsLoading = false;
        state.bookingsError = action.error.message || 'Failed to fetch bookings';
      })
      .addCase(createWarehouseBooking.fulfilled, (state, action) => {
        state.success = 'Booking created successfully';
      })
      .addCase(approveWarehouseBooking.fulfilled, (state, action) => {
        state.success = 'Booking approved successfully';
        const index = state.bookings.findIndex(booking => booking.id === action.payload.data.id);
        if (index !== -1) {
          state.bookings[index] = { ...state.bookings[index], ...action.payload.data };
        }
      })
      .addCase(rejectWarehouseBooking.fulfilled, (state, action) => {
        state.success = 'Booking rejected successfully';
        const index = state.bookings.findIndex(booking => booking.id === action.payload.data.id);
        if (index !== -1) {
          state.bookings[index] = { ...state.bookings[index], ...action.payload.data };
        }
      })
      .addCase(confirmWarehousePickup.fulfilled, (state, action) => {
        state.success = 'Pickup confirmed successfully';
        const index = state.bookings.findIndex(booking => booking.id === action.payload.data.id);
        if (index !== -1) {
          state.bookings[index] = { ...state.bookings[index], ...action.payload.data };
        }
      })
      .addCase(confirmWarehouseReturn.fulfilled, (state, action) => {
        state.success = 'Return confirmed successfully';
        const index = state.bookings.findIndex(booking => booking.id === action.payload.data.id);
        if (index !== -1) {
          state.bookings[index] = { ...state.bookings[index], ...action.payload.data };
        }
      })
      .addCase(getTodayBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.data || [];
      })
      .addCase(getOverdueBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.data || [];
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

export const { clearMessages, setSearchParams, setInventorySearchParams, setBookingSearchParams, resetState } = warehouseSlice.actions;
export default warehouseSlice.reducer;
