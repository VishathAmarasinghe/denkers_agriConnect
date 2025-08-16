import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";
import axios from "axios";

// Define the type for Selector model
export interface Selector {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface SelectorState {
  state: State;
  submitState: State;
  updateState: State;
  deleteState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  selectors: Selector[];
  selectedSelector: Selector | null;
}

const initialState: SelectorState = {
  state: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  deleteState: State.idle,
  stateMessage: "",
  errorMessage: "",
  selectors: [],
  selectedSelector: null,
};

// Fetch all selectors
export const fetchSelectors = createAsyncThunk(
  "selector/fetchSelectors",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // This is a placeholder - implement when you have the actual API endpoint
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.resources}/selectors`
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }

      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch selectors";
      
      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

// Create a new selector
export const createSelector = createAsyncThunk(
  "selector/createSelector",
  async (payload: Omit<Selector, "id">, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        `${AppConfig.serviceUrls.resources}/selectors`,
        payload
      );

      if (response.data.success) {
        dispatch(
          enqueueSnackbarMessage({
            message: SnackMessage.success.saveResources,
            type: "success",
          })
        );
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create selector");
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }

      const errorMessage = error.response?.data?.message || error.message || "Failed to create selector";
      
      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

// Update a selector
export const updateSelector = createAsyncThunk(
  "selector/updateSelector",
  async (payload: Selector, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().put(
        `${AppConfig.serviceUrls.resources}/selectors/${payload.id}`,
        payload
      );

      if (response.data.success) {
        dispatch(
          enqueueSnackbarMessage({
            message: "Selector updated successfully",
            type: "success",
          })
        );
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update selector");
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }

      const errorMessage = error.response?.data?.message || error.message || "Failed to update selector";
      
      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

// Delete a selector
export const deleteSelector = createAsyncThunk(
  "selector/deleteSelector",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().delete(
        `${AppConfig.serviceUrls.resources}/selectors/${id}`
      );

      if (response.data.success) {
        dispatch(
          enqueueSnackbarMessage({
            message: SnackMessage.success.deleteResource,
            type: "success",
          })
        );
        return id;
      } else {
        throw new Error(response.data.message || "Failed to delete selector");
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }

      const errorMessage = error.response?.data?.message || error.message || "Failed to delete selector";
      
      dispatch(
        enqueueSnackbarMessage({
          message: errorMessage,
          type: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

export const selectorSlice = createSlice({
  name: "selector",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.stateMessage = null;
      state.errorMessage = null;
    },
    resetStates: (state) => {
      state.submitState = State.idle;
      state.updateState = State.idle;
      state.deleteState = State.idle;
    },
    setSelectedSelector: (state, action: PayloadAction<Selector | null>) => {
      state.selectedSelector = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch selectors
      .addCase(fetchSelectors.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching selectors...";
      })
      .addCase(fetchSelectors.fulfilled, (state, action) => {
        state.state = State.success;
        state.selectors = action.payload || [];
        state.stateMessage = "Selectors fetched successfully!";
      })
      .addCase(fetchSelectors.rejected, (state, action) => {
        state.state = State.failed;
        state.errorMessage = action.payload as string || "Failed to fetch selectors";
      })
      
      // Create selector
      .addCase(createSelector.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Creating selector...";
      })
      .addCase(createSelector.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.selectors.push(action.payload);
        state.stateMessage = "Selector created successfully!";
      })
      .addCase(createSelector.rejected, (state, action) => {
        state.submitState = State.failed;
        state.errorMessage = action.payload as string || "Failed to create selector";
      })
      
      // Update selector
      .addCase(updateSelector.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "Updating selector...";
      })
      .addCase(updateSelector.fulfilled, (state, action) => {
        state.updateState = State.success;
        const index = state.selectors.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.selectors[index] = action.payload;
        }
        state.stateMessage = "Selector updated successfully!";
      })
      .addCase(updateSelector.rejected, (state, action) => {
        state.updateState = State.failed;
        state.errorMessage = action.payload as string || "Failed to update selector";
      })
      
      // Delete selector
      .addCase(deleteSelector.pending, (state) => {
        state.deleteState = State.loading;
        state.stateMessage = "Deleting selector...";
      })
      .addCase(deleteSelector.fulfilled, (state, action) => {
        state.deleteState = State.success;
        state.selectors = state.selectors.filter(s => s.id !== action.payload);
        state.stateMessage = "Selector deleted successfully!";
      })
      .addCase(deleteSelector.rejected, (state, action) => {
        state.deleteState = State.failed;
        state.errorMessage = action.payload as string || "Failed to delete selector";
      });
  },
});

export const { clearMessages, resetStates, setSelectedSelector } = selectorSlice.actions;
export default selectorSlice.reducer;
