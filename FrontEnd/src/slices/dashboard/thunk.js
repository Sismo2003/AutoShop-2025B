import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDashBoardCards
} from "../../backend/connection.js";

// Estadísticas globales
export const fetchDashboardCards = createAsyncThunk(
  "dashboard/fetchDashboardCards",
  async (_, { rejectWithValue }) => {
    try {
      return await getDashBoardCards();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
