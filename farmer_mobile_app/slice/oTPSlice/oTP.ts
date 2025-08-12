import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { APIService } from '../../utils/apiService';
import { State } from '../../types/types';
import { AppConfig } from '../../config/config';
import { SnackMessage } from '../../config/constant';
import axios, { HttpStatusCode } from 'axios';
import { showSnackbar } from '../snackbarSlice/snackbarSlice';

interface OTPState {
  state: State;
  submitState: State;
  validateState: State;
  backgroundProcess: boolean;
  stateMessage: string | null;
  backgroundProcessMessage: string | null;
}

// Define the initial state for the ResourceSlice
const initialState: OTPState = {
  state: State.idle,
  submitState: State.idle,
  validateState: State.idle,
  stateMessage: '',
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

export const validateOTP = createAsyncThunk(
  'OPT/validateOTP',
  async (payload: { email: string; OTP: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.otp + `/validate?email=${payload.email}&otp=${payload.OTP}`
      );
      dispatch(
        showSnackbar({
          message: response.data.message,
          type: 'success',
        })
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request canceled');
      }
      console.log('error', error);
      dispatch(
        showSnackbar({
          message:
            (error as any).response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.otpValidate
              : String((error as any).response?.data),
          type: 'error',
        })
      );
      throw error;
    }
  }
);

// Save a new resource
export const sendOTP = createAsyncThunk(
  'OPT/SendOTP',
  async (payload: { email: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(AppConfig.serviceUrls.otp + `/send?email=${payload.email}`);
      dispatch(
        showSnackbar({
          message: SnackMessage.success.otpSend,
          type: 'success',
        })
      );
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        return rejectWithValue('Request canceled');
      }
      console.log('error', error);
      dispatch(
        showSnackbar({
          message:
            (error as any).response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.otpSend
              : String((error as any).response?.data),
          type: 'error',
        })
      );
      throw error;
    }
  }
);

// Define the slice with reducers and extraReducers
const OtpSlice = createSlice({
  name: 'OTP',
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitState = State.idle;
      state.state = State.idle;
      state.validateState = State.idle;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(sendOTP.pending, state => {
        state.submitState = State.loading;
        state.stateMessage = 'Sending OTP...';
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = 'Successfully send OTP!';
      })
      .addCase(sendOTP.rejected, state => {
        state.submitState = State.failed;
        state.stateMessage = 'Failed to send OTP!';
      })
      .addCase(validateOTP.pending, state => {
        state.validateState = State.loading;
        state.stateMessage = 'Validating OTP...';
      })
      .addCase(validateOTP.fulfilled, (state, action) => {
        state.validateState = State.success;
        state.stateMessage = 'Successfully validate OTP!';
      })
      .addCase(validateOTP.rejected, state => {
        state.validateState = State.failed;
        state.stateMessage = 'Failed to validate OTP!';
      });
  },
});

export const { resetSubmitState } = OtpSlice.actions;
export default OtpSlice.reducer;
