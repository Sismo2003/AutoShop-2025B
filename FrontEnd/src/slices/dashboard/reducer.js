import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDashboardCards
} from "./thunk.js";

import { toast } from "sonner";
import { DateTime } from "luxon";
const initialState = {
  loading: false,
  error: false,
  error_message: "",
  cards : {},
  lastFourJobs: [],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Dashboard Cards
    builder.addCase(fetchDashboardCards.pending, (state) => {
      state.loading = true;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(fetchDashboardCards.fulfilled, (state,action) => {
      state.loading = false;
      state.error = false;
      state.error_message = "";

      const {
        scheduleCounter,
        completedCounter,
        customerCounter,
        monthlyRevenue,
        todaysAppointments,
        weekCashPayments,
        weekInsurancePayments,
        weekGrowth,
        lastFourJobs
      } = action.payload.data;

      state.cards = {
        scheduleCounter,
        completedCounter,
        customerCounter,
        monthlyRevenue,
        todaysAppointments,
        weekCashPayments,
        weekInsurancePayments,
        weekGrowth
      };

      const jobs = lastFourJobs.map((job) => {
        let status;
        switch (job.status) {
          case 'completed':
            status = 'Completed';
            break;
          case 'scheduled':
            status = 'Scheduled';
            break;
          case 'pending_approval':
            status = 'Pending Approval';
            break;
          default:
            status = 'Unknown';
        }

        let job_type;
        switch (job.replacement_type) {
          case 'out_of_pocket':
            job_type = 'Out of Pocket';
            break;
          case 'insurance':
            job_type = 'Insurance';
            break;
          default:
            job_type = 'Unknown';
        }

        const jobDateTime = DateTime.fromISO(`${job.date}`);
        const now = DateTime.local();

        let formattedDate;
        if (jobDateTime.hasSame(now, 'day')) {
          formattedDate = `Today, ${job.time}`;
        } else if (jobDateTime.hasSame(now.plus({ days: 1 }), 'day')) {
          formattedDate = `Tomorrow, ${job.time}`;
        } else if (jobDateTime.hasSame(now.minus({ days: 1 }), 'day')) {
          formattedDate = `Yesterday, ${job.time}`;
        } else {
          formattedDate = jobDateTime.toFormat('cccc dd LLL yyyy, ' + job.time);
        }

        return {
          // ...job,
          client : job.client,
          id: job.id,
          type : "Winshield Replacement",
          replacement_type : job_type,
          status,
          date :formattedDate
        };


      })
      state.lastFourJobs = jobs || [];

    });
    builder.addCase(fetchDashboardCards.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.customer_dosent_exist = true;
      const msg =  action.payload?.API?.error_message || "Error during customer history fetch, please try again later.";
      state.error_message = msg;
      toast.error(msg || "Error loading the customer, please try again later.")
    });
  },
});

export default dashboardSlice.reducer;
