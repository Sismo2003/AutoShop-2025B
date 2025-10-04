import { APIClient} from "./api_model.js";

// import the urls predefined
import * as url from './url_helper.js'


// Create an instance of APIClient
const api = new APIClient();

// AUTHENTICATION
export const sign_in = (data) => api.create(url.SIGN_IN_REQUEST, data);
export const getProfile = (data) => api.get(url.GET_PROFILE, { userId: data.id });
export const logout = () => api.delete(url.LOG_OUT_REQUEST);


// CALL CENTER SERVICE
export const generateToken = (user) => api.create(url.GENERATE_TOKEN_REQUEST, { identity: user });
export const getActiveCalls = () => api.get(url.GET_ACTIVE_CALLS, null);
export const changeMuteStatusParticipant = (data) => api.create(url.CHANGE_MUTE_STATUS_PARTICIPANT, data);
export const removeParticipantFromConference = (data) => api.create(url.REMOVE_PARTICIPANT_FROM_CONFERENCE, data);
export const endConference = (data) => api.create(url.END_CONFERENCE, data);

// DASHBOARD
export const getDashBoardCards = () => api.get(url.GET_DASHBOARD_CARDS, null);

// CUSTOMERS
export const registerCustomer = (data) => api.create(url.REGISTER_CUSTOMER, data);
export const getCustomersTable = () => api.get(url.GET_CUSTOMERS_TABLE, null);
export const getCustomersAndLastCalls = () => api.get(url.GET_CUSTOMERS_AND_LAST_CALLS, null);
export const getCustomerAllHistory = (customerId) => api.get(url.GET_CUSTOMER_ALL_HISTORY + `/${customerId}`, null);
export const searchCustomers = (params) => api.get(url.SEARCH_CUSTOMERS, params);

// AGENTS
export const changeAgentStatus = (data) => api.create(url.CHANGE_AGENT_STATUS, data);
export const addCustomerToConference = (data) => api.create(url.ADD_CUSTOMER_TO_CONFERENCE, data);

// APPOINTMENTS
export const addAppointment = (data) => api.create(url.ADD_APPOINTMENT, data);
export const getAppointments = () => api.get(url.GET_APPOINTMENTS, null);
export const getAppointmentById = (id) => api.get(url.GET_APPOINTMENT_BY_ID + `/${id}`, null);
export const getCustomersWithAddresses = () => api.get(url.GET_CUSTOMERS_WITH_ADDRESSES, null);
export const getCustomerVehicles = (customerId) => api.get(url.GET_CUSTOMER_VEHICLES + `/${customerId}`, null);
export const getCustomerInsurance = (customerId) => api.get(url.GET_CUSTOMER_INSURANCE + `/${customerId}`, null);
export const getGeneralInsurance = () => api.get(url.GET_GENERAL_INSURANCE, null);
export const updateAppointment = (id, data) => api.put(url.UPDATE_APPOINTMENT + `/${id}`, { id, ...data });
export const deleteAppointment = (id) => api.delete(url.DELETE_APPOINTMENT + `/${id}`, { id });
export const getAppointmentsCompleteView = (filters) => api.get(url.GET_APPOINTMENTS_COMPLETE_VIEW, filters);
export const getAppointmentCompleteDetails = (data) => api.get(url.GET_APPOINTMENT_COMPLETE_DETAILS + `/${data.appointmentId}`, null);
