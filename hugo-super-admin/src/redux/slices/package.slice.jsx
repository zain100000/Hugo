/**
 * Package Slice (Super Admin)
 *
 * Manages package-related state and async actions in the Redux store.
 *
 * Super Admin Permissions:
 * - Create package
 * - Fetch all packages
 * - Update package
 * - Delete package
 *
 * Integrates with a backend API using Axios, with authentication
 * handled via Bearer token stored in localStorage.
 *
 * State Shape:
 * {
 *   packages: Array<Object>,
 *   loading: boolean,
 *   error: string | null
 * }
 *
 * @module packageSlice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;
const getToken = () => localStorage.getItem("authToken");

export const getPackages = createAsyncThunk(
  "packages/getPackages",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/coin-package/get-all-packages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

export const createPackage = createAsyncThunk(
  "packages/createPackage",
  async (packageData, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/coin-package/super-admin/create-package`,
        packageData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

export const updatePackage = createAsyncThunk(
  "packages/updatePackage",
  async (updateData, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      let packageId, packageData;
      if (updateData?.packageId && updateData?.packageData) {
        packageId = updateData.packageId;
        packageData = updateData.packageData;
      } else if (updateData?.id) {
        packageId = updateData.id;
        const { id, ...rest } = updateData;
        packageData = rest;
      } else {
        return rejectWithValue("Invalid update data format");
      }

      const response = await axios.patch(
        `${BACKEND_API_URL}/coin-package/super-admin/update-package/${packageId}`,
        packageData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

export const deletePackage = createAsyncThunk(
  "packages/deletePackage",
  async (packageId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");
    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/coin-package/super-admin/delete-package/${packageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { ...response.data, packageId };
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const packageSlice = createSlice({
  name: "packages",
  initialState: {
    packages: [],
    loading: false,
    error: null,
  },
  reducers: {
    setPackages: (state, action) => {
      state.packages = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload.packages || [];
      })
      .addCase(getPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        if (action.payload?.package) {
          state.packages.push(action.payload.package);
        }
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        const updated = action.payload?.updatedPackage;
        if (updated) {
          const index = state.packages.findIndex(
            (pkg) => pkg._id === updated._id
          );
          if (index !== -1) {
            state.packages[index] = updated;
          }
        }
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.packages = state.packages.filter(
          (pkg) => pkg._id !== action.payload.packageId
        );
      });
  },
});

export const { setPackages } = packageSlice.actions;
export default packageSlice.reducer;
