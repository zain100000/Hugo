/**
 * Transaction Slice (Admin/Super-Admin)
 *
 * Handles state and async actions for transactions in the Redux store.
 *
 * Features:
 * - Fetch all transactions with optional filters/pagination
 * - Approve or reject transactions
 * - Delete transaction (Super-Admin)
 *
 * Integrates with a backend API using Axios.
 * Auth is handled via Bearer token stored in localStorage.
 *
 * State Shape:
 * {
 * transactions: Array<Object>,
 * loading: boolean,
 * error: string | null
 * }
 *
 * @module transactionSlice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * Fetch all transactions
 */
export const getAllTransactions = createAsyncThunk(
  "transactions/getAllTransactions",
  async (filters = {}, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("User is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/transaction/super-admin/get-all-transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        }
      );
      // Assuming the API returns an object with a 'transactions' key or the array directly
      return response.data.transactions || response.data;
    } catch (error) {
      // Standardized error payload
      return rejectWithValue(
        error.response?.data || "An error occurred while fetching transactions."
      );
    }
  }
);

/**
 * Approve a transaction
 */
export const approveTransaction = createAsyncThunk(
  "transactions/approveTransaction",
  async (transactionId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("User is not authenticated.");

    try {
      const response = await axios.patch(
        `${BACKEND_API_URL}/transaction/super-admin/approve-transaction/${transactionId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Assuming the API returns the updated transaction object
      return response.data;
    } catch (error) {
      // Standardized error payload
      return rejectWithValue(
        error.response?.data ||
          "An error occurred while approving the transaction."
      );
    }
  }
);

/**
 * Reject a transaction
 */
export const rejectTransaction = createAsyncThunk(
  "transactions/rejectTransaction",
  async ({ transactionId, adminNotes }, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("User is not authenticated.");

    try {
      const response = await axios.patch(
        `${BACKEND_API_URL}/transaction/super-admin/reject-transaction/${transactionId}`,
        { adminNotes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Assuming the API returns the updated transaction object
      return response.data;
    } catch (error) {
      // Standardized error payload
      return rejectWithValue(
        error.response?.data ||
          "An error occurred while rejecting the transaction."
      );
    }
  }
);

/**
 * Delete a transaction (SuperAdmin)
 */
export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction",
  async (transactionId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("User is not authenticated.");

    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/transaction/super-admin/delete-transaction/${transactionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Return the deleted ID or the ID from the response for the reducer
      return response.data.transactionId || transactionId;
    } catch (error) {
      // Standardized error payload
      return rejectWithValue(
        error.response?.data ||
          "An error occurred while deleting the transaction."
      );
    }
  }
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState: {
    transactions: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Removed setTransactions as it is redundant with getAllTransactions.fulfilled
    /**
     * Clear all transactions from state
     */
    clearTransactions: (state) => {
      state.transactions = [];
    },
    /**
     * Clear current error state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Helper function for pending state
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    // Helper function for rejected state
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // GET All Transactions
      .addCase(getAllTransactions.pending, handlePending)
      .addCase(getAllTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(getAllTransactions.rejected, handleRejected)

      // APPROVE Transaction
      .addCase(approveTransaction.pending, handlePending)
      .addCase(approveTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTransaction = action.payload;
        // Update the transaction in the list
        const index = state.transactions.findIndex(
          (tx) => tx._id === updatedTransaction._id
        );
        if (index !== -1) {
          state.transactions[index] = updatedTransaction;
        }
      })
      .addCase(approveTransaction.rejected, handleRejected)

      // REJECT Transaction
      .addCase(rejectTransaction.pending, handlePending)
      .addCase(rejectTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTransaction = action.payload;
        // Update the transaction in the list
        const index = state.transactions.findIndex(
          (tx) => tx._id === updatedTransaction._id
        );
        if (index !== -1) {
          state.transactions[index] = updatedTransaction;
        }
      })
      .addCase(rejectTransaction.rejected, handleRejected)

      // DELETE Transaction
      .addCase(deleteTransaction.pending, handlePending)
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        // Remove the transaction from the list
        state.transactions = state.transactions.filter(
          (tx) => tx._id !== deletedId
        );
      })
      .addCase(deleteTransaction.rejected, handleRejected);
  },
});

export const { clearTransactions, clearError } = transactionSlice.actions;

export default transactionSlice.reducer;
