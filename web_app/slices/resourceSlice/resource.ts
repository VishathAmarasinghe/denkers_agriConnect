import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";
import axios, { HttpStatusCode } from "axios";

// Define the type for Resource model
export interface Resource {
  resourceId: string;
  resourceName: string;
  validFrom: string;
  validTo: string;
  notes: string;
  shareType: "Internal Only" | "Share With Care Givers";
  creatorId: string;
  resourceDocuments: ResourceDocument[];
}

export interface ResourceDocument {
  documentId: string;
  documentName: string;
  documentLocation: string;
  resourceID: string;
}

interface ResourceState {
  state: State;
  submitState: State;
  updateState: State;
  deleteState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  selectedResource: Resource | null;
  resources: Resource[];
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
}

// Define the initial state for the ResourceSlice
const initialState: ResourceState = {
  state: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  deleteState: State.idle,
  stateMessage: "",
  errorMessage: "",
  selectedResource: null,
  resources: [],
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

// Fetch single resources
export const fetchSingleResource = createAsyncThunk(
  "resource/fetchSingleResources",
  async (payload: { resourceID: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.resources.selectors + `/${payload.resourceID}`
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            axios.isAxiosError(error) &&
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchSingleResource
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Fetch all resources
export const deleteResource = createAsyncThunk(
  "resource/deleteResource",
  async (payload: { resourceID: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().delete(
        AppConfig.serviceUrls.resources.selectors + `/${payload.resourceID}`
      );
      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.deleteResource,
          type: "success",
        })
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            axios.isAxiosError(error) &&
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.deleteResource
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Fetch all resources
export const fetchAllResources = createAsyncThunk(
  "resource/fetchResources",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.resources.selectors
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            axios.isAxiosError(error) &&
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchResources
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Save a new resource
export const updateResource = createAsyncThunk(
  "resource/updateResource",
  async (
    payload: { resource: Resource; files: File[]; resourceId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData = new FormData();

      formData.append("resourceData", JSON.stringify(payload.resource));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await APIService.getInstance().patch(
        AppConfig.serviceUrls.resources.selectors + `/${payload.resourceId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.saveResources,
          type: "success",
        })
      );

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            (error as any).response?.status ===
            HttpStatusCode.InternalServerError
              ? SnackMessage.error.updateResource
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Save a new resource
export const saveResource = createAsyncThunk(
  "resource/saveResource",
  async (
    payload: { resource: Resource; files: File[] },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData = new FormData();

      formData.append("resourceData", JSON.stringify(payload.resource));
      payload.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.resources.selectors,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.saveResources,
          type: "success",
        })
      );

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      console.log("error", error);
      dispatch(
        enqueueSnackbarMessage({
          message:
            (error as any).response?.status ===
            HttpStatusCode.InternalServerError
              ? SnackMessage.error.saveResources
              : String((error as any).response?.data),
          type: "error",
        })
      );
      throw error;
    }
  }
);

// Define the slice with reducers and extraReducers
const ResourceSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitState = State.idle;
      state.updateState = State.idle;
      state.deleteState = State.idle;
    },
    resetSelectedResource(state) {
      state.selectedResource = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllResources.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching resources...";
      })
      .addCase(fetchAllResources.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched resources!";
        state.resources = action.payload;
      })
      .addCase(fetchAllResources.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch resources!";
      })
      .addCase(saveResource.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving resource...";
      })
      .addCase(saveResource.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved resource!";
      })
      .addCase(saveResource.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save resource!";
      })
      .addCase(fetchSingleResource.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching resource...";
      })
      .addCase(fetchSingleResource.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetch resource!";
        state.selectedResource = action.payload;
      })
      .addCase(fetchSingleResource.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch single Resource!";
      })
      .addCase(updateResource.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "Updating resource...";
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully updated resource!";
      })
      .addCase(updateResource.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update single Resource!";
      })
      .addCase(deleteResource.pending, (state) => {
        state.deleteState = State.loading;
        state.stateMessage = "Deleting resource...";
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.deleteState = State.success;
        state.stateMessage = "Successfully deleted resource!";
      })
      .addCase(deleteResource.rejected, (state) => {
        state.deleteState = State.failed;
        state.stateMessage = "Failed to delete single Resource!";
      });
  },
});

export const { resetSubmitState, resetSelectedResource } =
  ResourceSlice.actions;
export default ResourceSlice.reducer;
