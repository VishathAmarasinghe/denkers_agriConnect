// redux/slices/snackbarSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SnackbarState {
  visible: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

const initialState: SnackbarState = {
  visible: false,
  message: "",
  type: "success",
};

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    showSnackbar: (
      state,
      action: PayloadAction<{
        message: string;
        type: "success" | "error" | "warning" | "info";
      }>
    ) => {
      state.visible = true;
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    hideSnackbar: (state) => {
      state.visible = false;
      state.message = "";
      state.type = "success";
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;

export default snackbarSlice.reducer;
