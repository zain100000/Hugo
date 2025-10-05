/**
 * Redux slice for managing user coin purchase transactions
 * Handles buying coin packages with manual payment (receipt upload)
 * Uses AsyncStorage for token handling (React Native)
 */

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

/**
 * Buy a coin package (manual payment with receipt)
 * @param {Object} data - { packageId, receipt }
 */
export const buyCoinPackage = createAsyncThunk(
  'transaction/buyCoinPackage',
  async ({packageId, receipt}, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const formData = new FormData();
      formData.append('paymentMethod', 'PAYONEER_MANUAL'); // required
      formData.append('receipt', {
        uri: receipt.uri,
        type: receipt.type || 'image/jpeg',
        name: receipt.fileName || 'receipt.jpg',
      });

      const response = await axios.post(
        `${BASE_URL}/transaction/user/buy-package/${packageId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return {transaction: response.data};
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Network Error - Could not reach server';

      return rejectWithValue({
        message: errorMessage,
        backendMessage: error.response?.data?.message || null,
      });
    }
  },
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: {
    transaction: null,
    loading: false,
    error: null,
    backendMessage: null,
  },
  reducers: {
    clearError: state => {
      state.error = null;
      state.backendMessage = null;
    },
    clearMessage: state => {
      state.backendMessage = null;
    },
    clearTransaction: state => {
      state.transaction = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(buyCoinPackage.pending, state => {
        state.loading = true;
        state.error = null;
        state.backendMessage = null;
      })
      .addCase(buyCoinPackage.fulfilled, (state, action) => {
        state.loading = false;
        state.transaction = action.payload.transaction;
      })
      .addCase(buyCoinPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      });
  },
});

export const {clearError, clearMessage, clearTransaction} =
  transactionSlice.actions;
export default transactionSlice.reducer;
