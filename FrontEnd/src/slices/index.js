import { combineReducers } from 'redux';

// Reducers
import authSlicer from './login/reducer.js';
import dashboardSlicer from './dashboard/reducer.js';
import customerSlicer from './Customer/reducer.js';
import appointmentSlicer from './appointment/reducer.js';

// Combine all reducers
const rootReducer = combineReducers({
	// Authentication
  auth: authSlicer,
  //  Dashboard
  dashboard: dashboardSlicer,
  // Customer
  customer: customerSlicer,
  // Appointment
  appointments: appointmentSlicer,
});

// Export the combined reducer
export default rootReducer;
