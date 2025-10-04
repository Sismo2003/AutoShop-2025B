import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
const initialState = {
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    errorMessage: null,
    user: null,
    success: false,
    isUserLogout: false
};

const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        initialize(state, action) {
            const { isAuthenticated, user } = action.payload;
            state.isAuthenticated = isAuthenticated;
            state.isInitialized = true;
            state.user = user;
        },
        loginRequest(state) {
            state.isLoading = true;
            state.errorMessage = null;
        },
        loginSuccess(state, action) {
            state.user = action.payload;
            state.success = true;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.errorMessage = null;
        },
        loginError(state, action) {
            state.errorMessage = action.payload;
            state.success = false;
            state.isLoading = false;
            state.isAuthenticated = false;
            toast.error(action.payload?.message || "Login failed, please try again.");
        },
        logoutSuccess(state, action) {
            state.isUserLogout = action.payload;
            state.isAuthenticated = false;
            state.user = null;
            state.success = false;
            state.errorMessage = null;
        }
    },
});

export const { 
    initialize, 
    loginRequest, 
    loginSuccess, 
    loginError, 
    logoutSuccess 
} = loginSlice.actions;

export default loginSlice.reducer;
