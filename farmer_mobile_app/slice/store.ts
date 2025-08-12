import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice/Auth';
import snackbarSlice from './snackbarSlice/snackbarSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import otpSlice from './oTPSlice/oTP';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    snack: snackbarSlice,
    otp: otpSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: undefined,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
