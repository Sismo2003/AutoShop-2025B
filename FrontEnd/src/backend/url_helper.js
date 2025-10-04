/*
* URL Helper Module
* This module provides utility functions to construct URLs for API endpoints.
*/

// AUTH
const AUTH_BASE_URL = '/auth';
export const SIGN_IN_REQUEST = AUTH_BASE_URL + '/sign-in';
export const GET_PROFILE = AUTH_BASE_URL + '/profile';
export const LOG_OUT_REQUEST = AUTH_BASE_URL + '/logout';

//DASHBOARD
const BASE_DASHBOARD_URL = '/dashboard';
export const GET_DASHBOARD_CARDS = BASE_DASHBOARD_URL + '/getCards';

// TOKEN FOR CALL CENTER SERVICE
const BASE_CALL_CENTER_URL = "/CallCenter"
export const GENERATE_TOKEN_REQUEST = BASE_CALL_CENTER_URL + '/new-token';
export const ADD_CUSTOMER_TO_CONFERENCE = BASE_CALL_CENTER_URL + '/add-customer-to-conference';
export const GET_ACTIVE_CALLS = BASE_CALL_CENTER_URL + '/active-conferences';
export const CHANGE_MUTE_STATUS_PARTICIPANT = BASE_CALL_CENTER_URL + '/participant-mute';
export const REMOVE_PARTICIPANT_FROM_CONFERENCE = BASE_CALL_CENTER_URL + '/remove-participant-conference';
export const END_CONFERENCE = BASE_CALL_CENTER_URL + '/end-conference';
//AGENTS
const BASE_AGENTS_URL = '/agents';
export const CHANGE_AGENT_STATUS = BASE_AGENTS_URL + '/change-status';

// APPOINTMENTS
const BASE_APPOINTMENTS_URL = '/appointments';
export const ADD_APPOINTMENT = BASE_APPOINTMENTS_URL + '/';
export const GET_APPOINTMENTS = BASE_APPOINTMENTS_URL + '/';
export const GET_APPOINTMENT_BY_ID = BASE_APPOINTMENTS_URL;
export const GET_CUSTOMERS_WITH_ADDRESSES = BASE_APPOINTMENTS_URL + '/customers';
export const GET_CUSTOMER_VEHICLES = BASE_APPOINTMENTS_URL + '/customers/vehicles';
export const GET_CUSTOMER_INSURANCE = BASE_APPOINTMENTS_URL + '/customers/insurance';
export const GET_GENERAL_INSURANCE = BASE_APPOINTMENTS_URL + '/insurance';
export const UPDATE_APPOINTMENT = BASE_APPOINTMENTS_URL;
export const DELETE_APPOINTMENT = BASE_APPOINTMENTS_URL;
export const GET_APPOINTMENTS_COMPLETE_VIEW = BASE_APPOINTMENTS_URL + '/complete-view';
export const GET_APPOINTMENT_COMPLETE_DETAILS = BASE_APPOINTMENTS_URL + '/complete-details';

// CUSTOMERS
const BASE_CUSTOMERS_URL = '/customers';
export const REGISTER_CUSTOMER = BASE_CUSTOMERS_URL + '/register';
export const GET_CUSTOMERS_TABLE = BASE_CUSTOMERS_URL + '/all_table';
export const GET_CUSTOMERS_AND_LAST_CALLS = BASE_CUSTOMERS_URL + '/customers-and-last-calls';
export const GET_CUSTOMER_ALL_HISTORY = BASE_CUSTOMERS_URL + '/customer-history';
export const SEARCH_CUSTOMERS = BASE_APPOINTMENTS_URL + '/search-customers';
