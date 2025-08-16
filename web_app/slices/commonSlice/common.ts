
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VariantType,enqueueSnackbar } from 'notistack'
import { AppDispatch } from '../store'

export interface CommonState {
  message: string
  timestamp: number | null
  type: VariantType
}

const initialState: CommonState = {
  message: '',
  timestamp: null,
  type: 'success',
}

export const CommonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    enqueueSnackbarMessage: (
      state,
      action: PayloadAction<{
        message: string
        type: 'success' | 'error' | 'warning'
      }>,
    ) => {
      state.message = action.payload.message
      state.type = action.payload.type
      state.timestamp = Date.now()
    },
  },
})

export function ShowSnackBarMessage(message: string, type: VariantType) {
  return (dispatch: AppDispatch) => {
    dispatch({
      type: 'common/enqueueSnackbarMessage',
      payload: {
        message: message,
        type: 'success',
      },
    })
  }
}

export const { enqueueSnackbarMessage } = CommonSlice.actions

export default CommonSlice.reducer
