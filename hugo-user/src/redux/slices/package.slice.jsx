/**
 * Redux slice for managing coin packages (Super Admin)
 * Only supports fetching all packages
 * Uses AsyncStorage for token handling (React Native)
 */

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

/**
 * Fetch all packages (Super Admin only)
 * @returns {Object} packages data from backend
 */
export const getPackages = createAsyncThunk(
  'packages/getPackages',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.get(
        `${BASE_URL}/coin-package/get-all-packages`,
        {headers: {Authorization: `Bearer ${token}`}},
      );

      return {packages: response.data.packages || []};
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

const packageSlice = createSlice({
  name: 'packages',
  initialState: {
    packages: [],
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
  },
  extraReducers: builder => {
    builder
      .addCase(getPackages.pending, state => {
        state.loading = true;
        state.error = null;
        state.backendMessage = null;
      })
      .addCase(getPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload.packages;
      })
      .addCase(getPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.backendMessage = action.payload.backendMessage;
      });
  },
});

export const {clearError, clearMessage} = packageSlice.actions;
export default packageSlice.reducer;
