import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerCustomer,
  getCustomersTable,
  getCustomersAndLastCalls,
  getCustomerAllHistory
} from "../../backend/connection.js";

// Thunk to register a new customer
export const registerCustomerThunk = createAsyncThunk(
  "customer/register",
  async (data, { rejectWithValue }) => {
    try {
      return await registerCustomer(data);
    } catch (error) {
      console.error("❌ Error during the client registration", error);
      return rejectWithValue(error);
    }
  }
);

// Thunk to fetch customers for the table
export const getCustomersTableThunk = createAsyncThunk(
  "customer/getCustomersTable",
  async (_, { rejectWithValue }) => {
    try {
      return await getCustomersTable();
    } catch (error) {
      console.error("❌ Error during fetching customers table", error);
      return rejectWithValue(error);
    }
  }
);

// Thunk to fetch customers and their last calls
export const getCustomersAndLastCallsThunk = createAsyncThunk(
  "customer/getCustomersAndLastCalls",
  async (_, { rejectWithValue }) => {
    try {
      return await getCustomersAndLastCalls();
    } catch (error) {
      console.error("❌ Error during fetching customers and last calls", error);
      return rejectWithValue(error);
    }
  }
);

// Thunk to fetch all history of a customer
export const getCustomerAllHistoryThunk = createAsyncThunk(
  "customer/getCustomerAllHistory",
  async (customerId, { rejectWithValue }) => {
    try {
      return await getCustomerAllHistory(customerId);
    } catch (error) {
      console.error("❌ Error during fetching customer history", error);
      return rejectWithValue(error);
    }
  }
);
