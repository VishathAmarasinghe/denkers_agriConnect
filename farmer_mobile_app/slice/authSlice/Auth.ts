import {
  AppConfig,
  APPLICATION_ADMIN,
  APPLICATION_FARMER,
} from "@/config/config";
import { SnackMessage } from "@/config/constant";
import { State } from "@/types/types";
import { APIService } from "@/utils/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { HttpStatusCode } from "axios";
import { jwtDecode } from "jwt-decode";
import { showSnackbar } from "../snackbarSlice/snackbarSlice";
import { AppDispatch, RootState } from "../store";

export interface UserData {
  userEmail: string;
  userID: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  status: State;
  passwordResetState: State;
  mode: "active" | "inactive" | "locked" | "maintenance";
  statusMessage: string | null;
  userInfo: UserData | null;
  decodedIdToken: any;
  roles: string[];
  exp: number;
  iat: number;
}

const initialState: AuthState = {
  isAuthenticated: false,
  status: State.idle,
  mode: "active",
  passwordResetState: State.idle,
  statusMessage: null,
  userInfo: null,
  decodedIdToken: null,
  roles: [],
  exp: 0,
  iat: 0,
};

export const login = createAsyncThunk(
  "login/user",
  async (
    payload: { email: string; password: string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<string>(async (resolve, reject) => {
      try {
        console.log("login payload", payload);
        console.log(AppConfig.serviceUrls.authenticaion);

        const response = await APIService.getInstance().post(
          `${AppConfig.serviceUrls.authenticaion}/mobile/login`,
          {
            email: payload.email,
            password: payload.password,
          }
        );
        dispatch(
          showSnackbar({ message: "Login Successfull", type: "success" })
        );
        resolve(response.data); // Resolve the promise with the response data
      } catch (error: any) {
        if (axios.isCancel(error)) {
          reject("Request canceled"); // Reject the promise if the request was canceled
        }
        console.log("login error", error.message);

        dispatch(
          showSnackbar({
            message:
              error?.response?.status === HttpStatusCode.InternalServerError
                ? SnackMessage.error.login
                : String(error?.response?.data),
            type: "error",
          })
        );
        reject(error?.response?.data || "An unknown error occurred"); // Reject the promise with an error message
      }
    });
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    payload: { email: string; password: string; employeeID: string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const response = await APIService.getInstance().post(
          `${AppConfig.serviceUrls.authenticaion}/reset`,
          payload
        );

        // Dispatch a success message on login
        dispatch(
          showSnackbar({
            message:SnackMessage.success.passwordReset,
            type: "success",
          })
        );

        resolve(response.data); // Resolve the promise with the response data
      } catch (error: any) {
        if (axios.isCancel(error)) {
          reject("Request canceled"); // Reject the promise if the request was canceled
        }
        console.log("error", error);

        // Dispatch an error message
        dispatch(
          showSnackbar({
            message:
              error?.response?.status === HttpStatusCode.InternalServerError
                ? SnackMessage.error.passwordReset
                : String(error?.response?.data),
            type: "error",
          })
        );

        reject(error?.response?.data || "An unknown error occurred"); // Reject the promise with an error message
      }
    });
  }
);

export const checkAuthToken = async (dispatch: AppDispatch) => {
  const token = await getDataFromStorage("token");
  if (!token) {
    dispatch(logout());
    return;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = new Date().getTime() / 1000; // Convert to seconds

    if (decodedToken.exp && decodedToken.exp > currentTime) {
      var userRoles: string[] = [];
      var decodedAccessRoles: string[] = decodedToken?.accessRole;
      if (decodedAccessRoles.includes(APPLICATION_ADMIN)) {
        userRoles.push(APPLICATION_ADMIN);
      }
      if (decodedAccessRoles.includes(APPLICATION_FARMER)) {
        userRoles.push(APPLICATION_FARMER);
      }
      // Token is valid
      dispatch(
        authSlice.actions.loginSuccess({
          userInfo: {
            userEmail: decodedToken.email,
            userID: decodedToken.userId,
          },
          roles: userRoles,
          exp: decodedToken.exp,
          iat: decodedToken.iat,
        })
      );
    } else {
      // Token expired
      dispatch(
        showSnackbar({
          message: "Session expired. Please log in again.",
          type: "error",
        })
      );
      dispatch(logout());
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    dispatch(logout());
  }
};



const storeData = async ({ key, value }: { key: string; value: string }) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error("Error saving data", e);
  }
};

const getDataFromStorage = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.error("Error getting data", e);
  }
};

const removeDateFromStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("Error removing data", e);
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<Partial<AuthState>>) => {
      state.isAuthenticated = true;
      state.userInfo = {
        userEmail: action.payload.userInfo?.userEmail || "",
        userID: action.payload.userInfo?.userID || "",
      };
      console.log("action.payload.userInfo", action.payload.userInfo);
      state.roles = action.payload.roles || [];
      state.exp = action.payload.exp || 0;
      state.iat = action.payload.iat || 0;
      state.status = State.success;
    },
    logout: (state) => {
      removeDateFromStorage("token");
      state.isAuthenticated = false;
      state.status = State.idle;
      state.mode = "inactive";
      state.statusMessage = null;
      state.userInfo = null;
      state.decodedIdToken = null;
      state.roles = [];
      state.exp = 0;
      state.iat = 0;
    },
    resetPasswordState: (state) => {
      state.passwordResetState = State.idle;
      state.statusMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = State.loading;
        state.statusMessage = "Authentication processing...";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = State.success;
        state.statusMessage = "Successfully authenticated!";
        state.isAuthenticated = true;
        state.mode = "active";

        storeData({ key: "token", value: action.payload });

        try {
          const decodedToken: any = jwtDecode(action.payload);

          state.userInfo = {
            userEmail: decodedToken?.email,
            userID: decodedToken?.userId,
          };
          storeData({ key: "userId", value: decodedToken?.userId });
          var decodedAccessRoles: string[] = decodedToken?.accessRole;
          console.log("decodedAccessRoles", decodedAccessRoles);
          
          if (decodedAccessRoles.includes(APPLICATION_FARMER)) {
            state.roles.push(APPLICATION_FARMER);
          }
          if (decodedAccessRoles.includes(APPLICATION_ADMIN)) {
            state.roles.push(APPLICATION_ADMIN);
          }
          state.exp = decodedToken?.exp;
          state.iat = decodedToken?.iat;
        } catch (error) {
          state.status = State.failed;
          console.error("Error decoding token:", error);
          state.statusMessage = "Failed to decode token!";
        }
      })
      .addCase(login.rejected, (state) => {
        state.status = State.failed;
        state.statusMessage = "Failed to authenticate!";
        state.isAuthenticated = false;
        state.userInfo = null;
        state.roles = [];
        state.exp = 0;
        state.iat = 0;
      })
      .addCase(resetPassword.pending, (state) => {
        state.passwordResetState = State.loading;
        state.statusMessage = "Resetting Password...";
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.passwordResetState = State.success;
        state.statusMessage = "Successfully reset password!";
      })
      .addCase(resetPassword.rejected, (state) => {
        state.passwordResetState = State.failed;
        state.statusMessage = "Failed to reset password!";
      });
  },
});

export const { logout,resetPasswordState } = authSlice.actions;
export const selectUserInfo = (state: RootState) => state.auth.userInfo;
export const selectRoles = (state: RootState) => state.auth.roles;
export default authSlice.reducer;
