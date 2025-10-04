import { createAsyncThunk } from "@reduxjs/toolkit";
// import { DateTime } from "luxon";
import {
  addAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  getCustomersWithAddresses,
  searchCustomers,
  getCustomerInsurance,
  getGeneralInsurance,
  getCustomerVehicles,
  getAppointmentById,
  getAppointmentsCompleteView,
  getAppointmentCompleteDetails
} from "../../backend/connection.js";

// Crear nueva cita completa
export const addAppointmentThunk = createAsyncThunk(
  "appointments/add", 
  async (data, { rejectWithValue }) => {
    try {
      const response = await addAppointment(data);
      return response.data;
    } catch (error) {
      console.log("Error al crear appointment, appointmentThunk.js: ", error);
      console.log("error.message:", error.message);
      console.log("error.API_message:", error.API_message);
      console.log("error.API:", error.API);
      console.log("error.API?.message:", error.API?.message);
      console.log("error.API?.validation_errors:", error.API?.validation_errors);
      return rejectWithValue({ 
        error: error.API.validation_errors ? error.API.validation_errors[0].message : error.API_message || "Error creating appointment"
      });
    }
  }
);

// Obtener todas las citas
export const getAppointmentsThunk = createAsyncThunk(
  "appointments/getAll", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAppointments();
      return response.data;
    } catch (error) {
      console.log("Error al obtener appointments, appointmentThunk.js: ", error);
      return rejectWithValue({ 
        error: error.response?.data?.message || error.message || "Error al obtener las citas"
      });
    }
  }
);

// Obtener cita por ID
export const getAppointmentByIdThunk = createAsyncThunk(
  "appointments/getById", 
  async (id, { rejectWithValue }) => {
    try {
      const response = await getAppointmentById({ id });
      return response.data;
    } catch (error) {
      console.log("Error al obtener appointment por ID, appointmentThunk.js: ", error);
      return rejectWithValue({ 
        error: error.response?.data?.message || error.message || "Error al obtener la cita"
      });
    }
  }
);

// Obtener clientes con direcciones
export const getCustomersWithAddressesThunk = createAsyncThunk(
  "appointments/getCustomersWithAddresses", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCustomersWithAddresses();
      return response.data;
    } catch (error) {
      console.log("Error al obtener customers con addresses, appointmentThunk.js: ", error);
      return rejectWithValue({ 
        error: error.response?.data?.message || error.message || "Error al obtener clientes"
      });
    }
  }
);

export const searchCustomersThunk = createAsyncThunk(
  "appointments/searchCustomers", 
  async ({ searchTerm = '', page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = {
        q: searchTerm,
        page: page.toString(),
        limit: limit.toString()
      };
      
      const response = await searchCustomers(params);

      // console.log("Response from searchCustomersThunk:", response);
      
      return response;
    } catch (error) {
      console.log("Error al buscar customers, appointmentThunk.js: ", error);
      return rejectWithValue({ 
        error: error.message || "Error al buscar clientes"
      });
    }
  }
);


// Obtener información de seguro del cliente
export const getCustomerInsuranceThunk = createAsyncThunk(
  "appointments/getCustomerInsurance", 
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await getCustomerInsurance(customerId);
      return response.data;
    } catch (error) {
      console.log("Error al obtener customer insurance, appointmentThunk.js: ", error);
      return rejectWithValue({ 
        error: error.response?.data?.message || error.message || "Error al obtener información del seguro"
      });
    }
  }
);

// Obtener aseguradoras generales
export const getGeneralInsuranceThunk = createAsyncThunk(
  "appointments/getGeneralInsurance", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await getGeneralInsurance();
      return response.data;
    } catch (error) {
      console.log("Error al obtener general insurance, appointmentThunk.js: ", error);
      return rejectWithValue({ 
        error: error.response?.data?.message || error.message || "Error al obtener aseguradoras"
      });
    }
  }
);

// Obtener vehículos del cliente
export const getCustomerVehiclesThunk = createAsyncThunk(
  "appointments/getCustomerVehicles", 
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await getCustomerVehicles(customerId);
      return response.data;
    } catch (error) {
      console.log("Error al obtener customer vehicles, appointmentThunk.js: ", error);
      return rejectWithValue({ 
        error: error.response?.data?.message || error.message || "Error al obtener vehículos del cliente"
      });
    }
  }
);

// Actualizar cita
export const updateAppointmentThunk = createAsyncThunk(
  "appointments/edit", 
  async ({ id, data }, { rejectWithValue }) => {
    try {
      /**const response = **/await updateAppointment(id, data);
      return {
        id,
        ...data,
        // updated_at: DateTime.now().setZone('America/Mexico_City').toISO()
      };
    } catch (error) {
      console.log("Error al editar appointment, appointmentThunk.js: ", error);
      return rejectWithValue({ 
        error: error.response?.data?.message || error.message || "Error al editar la cita"
      });
    }
  }
);

// Eliminar cita
export const deleteAppointmentThunk = createAsyncThunk(
  "appointments/delete", 
  async (id, { rejectWithValue }) => {
    try {
      await deleteAppointment(id);
      return id;
    } catch (error) {
      console.log("Error al eliminar appointment, appointmentThunk.js: ", error);
      return rejectWithValue({ 
        error: error.response?.data?.message || error.message || "Error al eliminar la cita"
      });
    }
  }
);

// Obtener appointments con vista completa y filtros
export const getAppointmentsCompleteViewThunk = createAsyncThunk(
  "appointments/getCompleteView", 
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getAppointmentsCompleteView(filters);
      return response;
    } catch (error) {
      console.log("Error al obtener appointments complete view, appointmentThunk.js: ", error);
      return rejectWithValue({ 
        error: error.API?.message || error.API_message || error.message || "Error al obtener las citas"
      });
    }
  }
);

// Obtener detalles completos de un appointment
export const getAppointmentCompleteDetailsThunk = createAsyncThunk(
  "appointments/getCompleteDetails", 
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await getAppointmentCompleteDetails({ appointmentId });
      return response;
    } catch (error) {
      console.log("Error al obtener appointment complete details, appointmentThunk.js: ", error);
      return rejectWithValue({ 
        error: error.API?.message || error.API_message || error.message || "Error al obtener los detalles de la cita"
      });
    }
  }
);