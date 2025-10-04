import { createSlice } from '@reduxjs/toolkit';
import {
  addAppointmentThunk,
  getAppointmentsThunk,
  getAppointmentByIdThunk,
  getCustomersWithAddressesThunk,
  searchCustomersThunk,
  getCustomerInsuranceThunk,
  getGeneralInsuranceThunk,
  getCustomerVehiclesThunk,
  updateAppointmentThunk,
  deleteAppointmentThunk,
  getAppointmentsCompleteViewThunk,
  getAppointmentCompleteDetailsThunk
} from "./thunk";

const initialState = {
  // Estados principales
  appointments: [],
  currentAppointment: null,

  // Estados para la vista completa
  appointmentsCompleteView: [],
  appointmentCompleteDetails: null,
  appointmentsStats: null,
  appointmentsPagination: {
    current_page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 0,
    has_next_page: false,
    has_prev_page: false
  },
  appointmentsFilters: {
    status: 'all',
    search: '',
    payment_type: 'all',
    location_type: 'all',
    date_from: '',
    date_to: '',
    sort_by: 'installation_date',
    sort_order: 'desc'
  },
  
  // Estados de datos relacionados
  customers: [],
  customersSearch: {
    data: [],
    pagination: null,
    isSearching: false,
    searchTerm: '',
    hasSearched: false
  },
  customerInsurance: null,
  generalInsurance: [],
  customerVehicles: [],
  
  // Estados de carga y errores
  loading: false,
  error: false,
  error_message: "",

  // Estados de loading específicos
  loadingCompleteView: false,
  loadingCompleteDetails: false,
  loadingCustomers: false,
  loadingInsurance: false,
  loadingVehicles: false,
  
  // Estados para UI
  selectedCustomer: null,
  hasInsurance: false
};

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    // Reducer para limpiar estados
    clearAppointmentData: (state) => {
      state.currentAppointment = null;
      state.customerInsurance = null;
      state.customerVehicles = [];
      state.selectedCustomer = null;
      state.hasInsurance = false;
      state.error = false;
      state.error_message = "";
    },
    
    // Reducer para establecer cliente seleccionado
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
      // Limpiar datos relacionados cuando cambia el cliente
      state.customerInsurance = null;
      state.customerVehicles = [];
    },
    
    // Reducer para establecer si tiene seguro
    setHasInsurance: (state, action) => {
      state.hasInsurance = action.payload;
      if (!action.payload) {
        state.customerInsurance = null;
      }
    },
    
    // Reducer para limpiar errores
    clearErrors: (state) => {
      state.error = false;
      state.error_message = "";
    },

    // Reducer para establecer filtros de citas
    setAppointmentsFilters: (state, action) => {
      state.appointmentsFilters = {
        ...state.appointmentsFilters,
        ...action.payload
      };
    },
    
    // Reducer para limpiar filtros de citas
    clearAppointmentsFilters: (state) => {
      state.appointmentsFilters = {
        status: 'all',
        search: '',
        payment_type: 'all',
        location_type: 'all',
        date_from: '',
        date_to: '',
        sort_by: 'installation_date',
        sort_order: 'desc'
      };
    },
    
    // Reducer para limpiar detalles de cita completa
    clearAppointmentCompleteDetails: (state) => {
      state.appointmentCompleteDetails = null;
      state.loadingCompleteDetails = false;
    },

    // Reducer para limpiar búsqueda de customers
    clearCustomersSearch: (state) => {
      state.customersSearch = {
        data: [],
        pagination: null,
        isSearching: false,
        searchTerm: '',
        hasSearched: false
      };
    },
  },
  extraReducers: (builder) => {
    // ============= CREAR APPOINTMENT =============
    builder.addCase(addAppointmentThunk.fulfilled, (state, action) => {
      state.appointments.push(action.payload);
      state.loading = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(addAppointmentThunk.rejected, (state, action) => {
      console.log("Error al crear appointment, appointmentReducer.js: ", action.payload);
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al crear la cita";
    });
    builder.addCase(addAppointmentThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
      state.error_message = "";
    });

    // ============= OBTENER APPOINTMENTS =============
    builder.addCase(getAppointmentsThunk.fulfilled, (state, action) => {
      state.appointments = action.payload;
      state.loading = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(getAppointmentsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al obtener las citas";
    });
    builder.addCase(getAppointmentsThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });

    // ============= OBTENER APPOINTMENT POR ID =============
    builder.addCase(getAppointmentByIdThunk.fulfilled, (state, action) => {
      state.currentAppointment = action.payload;
      state.loading = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(getAppointmentByIdThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al obtener la cita";
    });
    builder.addCase(getAppointmentByIdThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });

    // ============= OBTENER CUSTOMERS CON ADDRESSES =============
    builder.addCase(getCustomersWithAddressesThunk.fulfilled, (state, action) => {
      state.customers = action.payload;
      state.loadingCustomers = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(getCustomersWithAddressesThunk.rejected, (state, action) => {
      state.loadingCustomers = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al obtener clientes";
    });
    builder.addCase(getCustomersWithAddressesThunk.pending, (state) => {
      state.loadingCustomers = true;
      state.error = false;
    });

    // ============= BÚSQUEDA DE CUSTOMERS =============
    builder.addCase(searchCustomersThunk.fulfilled, (state, action) => {
      state.customersSearch.data = action.payload.data;
      state.customersSearch.pagination = action.payload.pagination;
      state.customersSearch.searchTerm = action.payload.search_term;
      state.customersSearch.isSearching = false;
      state.customersSearch.hasSearched = true;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(searchCustomersThunk.rejected, (state, action) => {
      state.customersSearch.isSearching = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al buscar clientes";
    });
    builder.addCase(searchCustomersThunk.pending, (state) => {
      state.customersSearch.isSearching = true;
      state.error = false;
    });

    // ============= OBTENER CUSTOMER INSURANCE =============
    builder.addCase(getCustomerInsuranceThunk.fulfilled, (state, action) => {
      state.customerInsurance = action.payload;
      state.loadingInsurance = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(getCustomerInsuranceThunk.rejected, (state, action) => {
      state.loadingInsurance = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al obtener información del seguro";
    });
    builder.addCase(getCustomerInsuranceThunk.pending, (state) => {
      state.loadingInsurance = true;
      state.error = false;
    });

    // ============= OBTENER GENERAL INSURANCE =============
    builder.addCase(getGeneralInsuranceThunk.fulfilled, (state, action) => {
      state.generalInsurance = action.payload;
      state.loading = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(getGeneralInsuranceThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al obtener aseguradoras";
    });
    builder.addCase(getGeneralInsuranceThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });

    // ============= OBTENER CUSTOMER VEHICLES =============
    builder.addCase(getCustomerVehiclesThunk.fulfilled, (state, action) => {
      state.customerVehicles = action.payload;
      state.loadingVehicles = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(getCustomerVehiclesThunk.rejected, (state, action) => {
      state.loadingVehicles = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al obtener vehículos del cliente";
    });
    builder.addCase(getCustomerVehiclesThunk.pending, (state) => {
      state.loadingVehicles = true;
      state.error = false;
    });

    // ============= ACTUALIZAR APPOINTMENT =============
    builder.addCase(updateAppointmentThunk.fulfilled, (state, action) => {
      const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
      state.loading = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(updateAppointmentThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al editar la cita";
    });
    builder.addCase(updateAppointmentThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });

    // ============= ELIMINAR APPOINTMENT =============
    builder.addCase(deleteAppointmentThunk.fulfilled, (state, action) => {
      state.appointments = state.appointments.filter(appointment => appointment.id !== action.payload);
      state.loading = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(deleteAppointmentThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al eliminar la cita";
    });
    builder.addCase(deleteAppointmentThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });

    // ============= OBTENER APPOINTMENTS COMPLETE VIEW =============
    builder.addCase(getAppointmentsCompleteViewThunk.fulfilled, (state, action) => {
      state.appointmentsCompleteView = action.payload.data || [];
      state.appointmentsPagination = action.payload.pagination || state.appointmentsPagination;
      state.appointmentsStats = action.payload.stats || null;
      state.appointmentsFilters = {
        ...state.appointmentsFilters,
        ...action.payload.filters
      };
      state.loadingCompleteView = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(getAppointmentsCompleteViewThunk.rejected, (state, action) => {
      state.loadingCompleteView = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al obtener la vista completa de citas";
    });
    builder.addCase(getAppointmentsCompleteViewThunk.pending, (state) => {
      state.loadingCompleteView = true;
      state.error = false;
      state.error_message = "";
    });

    // ============= OBTENER APPOINTMENT COMPLETE DETAILS =============
    builder.addCase(getAppointmentCompleteDetailsThunk.fulfilled, (state, action) => {
      state.appointmentCompleteDetails = action.payload.data || null;
      state.loadingCompleteDetails = false;
      state.error = false;
      state.error_message = "";
    });
    builder.addCase(getAppointmentCompleteDetailsThunk.rejected, (state, action) => {
      state.loadingCompleteDetails = false;
      state.error = true;
      state.error_message = action.payload?.error || "Error al obtener los detalles completos de la cita";
    });
    builder.addCase(getAppointmentCompleteDetailsThunk.pending, (state) => {
      state.loadingCompleteDetails = true;
      state.error = false;
      state.error_message = "";
    });
  }
});

export const { 
  clearAppointmentData, 
  setSelectedCustomer, 
  setHasInsurance, 
  clearErrors,
  setAppointmentsFilters,
  clearAppointmentsFilters,
  clearAppointmentCompleteDetails,
  clearCustomersSearch
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;