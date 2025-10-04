import { createSlice } from '@reduxjs/toolkit';
import {
  getCustomersTableThunk,
  registerCustomerThunk,
  getCustomersAndLastCallsThunk,
  getCustomerAllHistoryThunk
} from "./thunk.js";

import { toast } from "sonner";

const initialState = {
  loading: false,
  error: false,
  error_message: "",
  customers_table_view: [], // This will hold the data for the customers table view
  customers_and_last_calls_view: [], // This will hold the basic data for customers and their last calls

  customer_all_history_view: null, // This will hold the complete history of a customer
  customer_dosent_exist: false,
};

const CustomerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {

    // CUSTOMER REGISTRATION
    builder.addCase(registerCustomerThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(registerCustomerThunk.fulfilled, (state) => {
      state.loading = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(registerCustomerThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.API?.error_message || "Error during customer registration, please try again later.";
    });
    
    // GET ALL CUSTOMERS TABLE
    builder.addCase(getCustomersTableThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(getCustomersTableThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.error_message = "";
      state.customers_table_view = action.payload?.data || [];
    });
    builder.addCase(getCustomersTableThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      const msg =  action.payload?.API?.error_message || "Error during customer registration, please try again later.";
      state.error_message = msg;
      toast.error(msg || "Error loading the customer, please try again later.")
    });

    // GET CUSTOMERS AND LAST CALLS
    builder.addCase(getCustomersAndLastCallsThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(getCustomersAndLastCallsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.error_message = "";
      state.customers_and_last_calls_view = action.payload?.data || [];
    });
    builder.addCase(getCustomersAndLastCallsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      const msg =  action.payload?.API?.error_message || "Error during customer selector, please try again later.";
      state.error_message = msg;
      toast.error(msg || "Error loading the customer, please try again later.")
    });

    // GET CUSTOMER ALL HISTORY
    builder.addCase(getCustomerAllHistoryThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
      state.customer_dosent_exist = false;
      state.error_message = "";
    });
    builder.addCase(getCustomerAllHistoryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.error_message = "";
      state.customer_all_history_view = action.payload?.data || null;
      state.customer_dosent_exist = false;
    });
    builder.addCase(getCustomerAllHistoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.customer_dosent_exist = true;
      const msg =  action.payload?.API?.error_message || "Error during customer history fetch, please try again later.";
      state.error_message = msg;
      toast.error(msg || "Error loading the customer, please try again later.")
    });

  },
});

export default CustomerSlice.reducer;
