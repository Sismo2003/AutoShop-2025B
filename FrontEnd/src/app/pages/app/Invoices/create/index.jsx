// Import Dependencies
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDaysIcon, 
  UserIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CubeIcon,           // Para Glass Types
  CogIcon,            // Para Technical Features  
  SparklesIcon        // Para Finishes
} from "@heroicons/react/24/outline";

// Redux imports
import { useSelector, useDispatch } from "react-redux";
import {
  getCustomersWithAddressesThunk,
  getCustomerInsuranceThunk,
  getGeneralInsuranceThunk,
  getCustomerVehiclesThunk,
  addAppointmentThunk
} from "slices/thunk";

// Redux actions
import { 
  clearAppointmentData,
  setSelectedCustomer,
  clearErrors,
} from "slices/appointment/reducer";

// Toast import
import { toast } from "sonner";

// Print imports
import PrintModal from './components/PrintModal';
import { usePrintAppointment } from './hooks/usePrintAppointment';

// Local imports
import { appointmentSchema } from "./schema";
import { Page } from "components/shared/Page";
import { Button, Card, Input, Textarea, Checkbox } from "components/ui";
import { DatePicker } from "components/shared/form/Datepicker";
import { Listbox } from "components/shared/form/Listbox";
import { Combobox } from "components/shared/form/Combobox";
import useCustomerSearch from './hooks/useCustomerSearch';
import { AsyncCombobox } from 'components/shared/form/AsyncCombobox';

// ----------------------------------------------------------------------

// Función para formatear fecha a string YYYY-MM-DD
const formatDateToString = (date) => {
  console.log("🔍 formatDateToString recibió:", date, typeof date);
  
  if (!date || date === null) return "";
  
  // Si es un array, tomar el primer elemento
  if (Array.isArray(date) && date.length > 0) {
    date = date[0];
  }
  
  if (typeof date === "string") return date;
  
  if (date instanceof Date) {
    const result = date.toISOString().split('T')[0];
    console.log("🔍 formatDateToString devuelve:", result);
    return result;
  }
  
  return "";
};

// Función para parsear string a Date object
const parseDateString = (dateString) => {
  if (!dateString || dateString === null) return null;
  
  if (dateString instanceof Date) return dateString;
  
  if (typeof dateString === "string") {
    const date = new Date(dateString + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
};

// Estados estadounidenses
const usStates = [
  { id: "AL", label: "Alabama" },
  { id: "AK", label: "Alaska" },
  { id: "AZ", label: "Arizona" },
  { id: "AR", label: "Arkansas" },
  { id: "CA", label: "California" },
  { id: "CO", label: "Colorado" },
  { id: "CT", label: "Connecticut" },
  { id: "DE", label: "Delaware" },
  { id: "FL", label: "Florida" },
  { id: "GA", label: "Georgia" },
  { id: "HI", label: "Hawaii" },
  { id: "ID", label: "Idaho" },
  { id: "IL", label: "Illinois" },
  { id: "IN", label: "Indiana" },
  { id: "IA", label: "Iowa" },
  { id: "KS", label: "Kansas" },
  { id: "KY", label: "Kentucky" },
  { id: "LA", label: "Louisiana" },
  { id: "ME", label: "Maine" },
  { id: "MD", label: "Maryland" },
  { id: "MA", label: "Massachusetts" },
  { id: "MI", label: "Michigan" },
  { id: "MN", label: "Minnesota" },
  { id: "MS", label: "Mississippi" },
  { id: "MO", label: "Missouri" },
  { id: "MT", label: "Montana" },
  { id: "NE", label: "Nebraska" },
  { id: "NV", label: "Nevada" },
  { id: "NH", label: "New Hampshire" },
  { id: "NJ", label: "New Jersey" },
  { id: "NM", label: "New Mexico" },
  { id: "NY", label: "New York" },
  { id: "NC", label: "North Carolina" },
  { id: "ND", label: "North Dakota" },
  { id: "OH", label: "Ohio" },
  { id: "OK", label: "Oklahoma" },
  { id: "OR", label: "Oregon" },
  { id: "PA", label: "Pennsylvania" },
  { id: "RI", label: "Rhode Island" },
  { id: "SC", label: "South Carolina" },
  { id: "SD", label: "South Dakota" },
  { id: "TN", label: "Tennessee" },
  { id: "TX", label: "Texas" },
  { id: "UT", label: "Utah" },
  { id: "VT", label: "Vermont" },
  { id: "VA", label: "Virginia" },
  { id: "WA", label: "Washington" },
  { id: "WV", label: "West Virginia" },
  { id: "WI", label: "Wisconsin" },
  { id: "WY", label: "Wyoming" }
];

// Técnicos disponibles
const technicians = [
  { id: "OMAR", label: "OMAR" },
  { id: "FELIPE", label: "FELIPE" }
];

// Property type options
const PROPERTY_TYPES = [
  { id: 'house', label: 'House' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'condo', label: 'Condo' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'office', label: 'Office' },
  { id: 'warehouse', label: 'Warehouse' },
  { id: 'other', label: 'Other' }
];

const appointmentTimes = [
  { id: "6-10", label: "6:00 AM - 10:00 AM" },
  { id: "8-12", label: "8:00 AM - 12:00 PM" },
  { id: "10-2", label: "10:00 AM - 2:00 PM" },
  { id: "2-4", label: "2:00 PM - 4:00 PM" },
  { id: "all day", label: "All Day" }
];

// Valores iniciales del formulario
const initialValues = {
  // Información del cliente
  customer_id: "",
  customer_name: "",
  customer_phone: "",
  customer_alt_phone: "",
  customer_email: "",
  customer_address: "",
  customer_city: "",
  customer_state: "",
  customer_zip: "",
  customer_apt_no: "",
  cross_street: "",
  department_name: "",
  building: "",
  
  // Información del seguro
  has_insurance: "", // Seteado como string para manejar mejor el formulario
  insurance_company: "",
  policy_number: "",
  insurance_phone: "",
  date_of_loss: null,
  glass_deductible: "",
  safelife: "",
  lynx_dispatch: "",
  other_insurance_info: "",
  
  // Información del vehículo
  selected_vehicle_id: "",
  vehicle_year: "",
  vehicle_make: "",
  vehicle_model: "",
  vehicle_color: "",
  vin: "",
  part_number: "",
  
  // Tipos de vidrio (separados de las características)
  has_windshield: false,
  has_door_glass: false,
  has_back_glass: false,
  has_vent_glass: false,
  has_quarter_glass: false,
  
  // Características técnicas y acabados (separados de los tipos)
  has_2d: false,
  has_4d: false,
  has_ldws: false,
  has_hud: false,
  has_heated: false,
  has_antenna: false,
  has_rain_sensor: false,
  has_tint_strip: false,
  has_windshield_tint: false,
  has_chrome: false,
  has_black: false,
  
  // Información del personal
  tech_name: "",
  service_advisor: "",
  sales_person: "",
  edirect: "",
  origin: "",
  
  // Fecha de instalación
  installation_date: null,
  installation_time: "",
  
  // Tipo de ubicación
  location_type: "address_customer",
  
  // Dirección alternativa
  app_type_of_place: "",
  business_name: "",
  install_address: "",
  install_apt_suite: "",
  install_city: "",
  install_state: "",
  install_zip: "",
  install_dept_name: "",
  install_building: "",
  install_cross_street: "",
  install_contact: "",
  install_phone: "",
  
  // Información de pago/rebate
  rebate_type: "",
  rebate_amount: "",
  rebate_observations: "",
  replacement_cash_price: ""
};

// Animaciones
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const NewAppointmentForm = () => {
  // Redux state
  const dispatch = useDispatch();

  // Custom hook para búsqueda de customers
  const {
    searchTerm: customerSearchTerm,
    setSearchTerm: setCustomerSearchTerm,
    customers: searchableCustomers,
    isLoading: isSearchingCustomers,
    showNoResults: showNoCustomerResults,
    canLoadMore: canLoadMoreCustomers,
    loadMore: loadMoreCustomers
  } = useCustomerSearch();

  const {
    customers,
    customerInsurance,
    generalInsurance,
    customerVehicles,
    selectedCustomer,
    loading,
    // loadingCustomers,
    loadingInsurance,
    error,
    error_message
  } = useSelector((state) => state.appointments);

  // Custom hooks
  // const { printRef, handlePrint } = usePrintAppointment();
  const { isModalOpen, appointmentData, openPrintModal, closePrintModal } = usePrintAppointment();

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setCurrentStep] = useState(1);
  const [isSubmittingRef, setIsSubmittingRef] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(appointmentSchema),
    defaultValues: initialValues,
    mode: 'onChange'
  });

  // Watch form values
  const watchedCustomerId = watch("customer_id");
  const watchedHasInsurance = watch("has_insurance") === "true" || watch("has_insurance") === true;
  const hasPaymentMethodSelected = watch("has_insurance") !== "" && watch("has_insurance") !== undefined && watch("has_insurance") !== null;
  const watchedLocationType = watch("location_type");

  // Cargar datos iniciales
  useEffect(() => {
    dispatch(getCustomersWithAddressesThunk());
    dispatch(getGeneralInsuranceThunk());
    
    return () => {
      dispatch(clearAppointmentData());
    };
  }, [dispatch]);

  // Manejar errores
  useEffect(() => {
    if (error && error_message) {
      toast.error(error_message);
      dispatch(clearErrors());
    }
  }, [error, error_message, dispatch]);

  // Manejar selección de cliente - CORREGIDO para buscar en ambos arrays
  useEffect(() => {
    if (watchedCustomerId) {
      // Buscar primero en customers de búsqueda, luego en customers estáticos
      let customer = searchableCustomers.find(c => c.id === parseInt(watchedCustomerId));
      
      // Si no se encuentra en searchableCustomers, buscar en customers estáticos
      if (!customer && customers.length > 0) {
        customer = customers.find(c => c.id === parseInt(watchedCustomerId));
      }
      
      if (customer && (!selectedCustomer || selectedCustomer.id !== customer.id)) {
        console.log("📋 Customer found and selected:", customer);
        dispatch(setSelectedCustomer(customer));
        
        // Llenar datos del cliente en el formulario
        setValue("customer_name", customer.fullname || "");
        setValue("customer_phone", customer.phone || "");
        setValue("customer_alt_phone", customer.secondary_phone || "");
        setValue("customer_email", customer.email || "");
        setValue("customer_address", customer.address?.street_address || "");
        setValue("customer_city", customer.address?.city || "");
        setValue("customer_state", customer.address?.state || "");
        setValue("customer_zip", customer.address?.zipcode || "");
        setValue("customer_apt_no", customer.address?.unit_number || "");
        setValue("cross_street", customer.address?.main_cross_streets || "");
        setValue("department_name", customer.address?.apartment_name || "");
        setValue("building", customer.address?.building || "");
        
        // Cargar información del seguro del cliente
        dispatch(getCustomerInsuranceThunk(customer.id));
        
        // Cargar vehículos del cliente
        dispatch(getCustomerVehiclesThunk(customer.id));
      }
    } else if (watchedCustomerId === "" && selectedCustomer) {
      // Limpiar selección si no hay customer_id
      dispatch(setSelectedCustomer(null));
    }
  }, [watchedCustomerId, customers, searchableCustomers, dispatch, setValue, selectedCustomer]); // Agregar selectedCustomer a las dependencias

  // Manejar información del seguro
  useEffect(() => {
    console.log("🔄 Insurance Effect:", {
      watchedHasInsurance,
      rawValue: watch("has_insurance"),
      hasCustomerInsurance: !!customerInsurance,
      hasGeneralInsurance: generalInsurance?.length  > 0,
      isValueSelected: watch("has_insurance") !== undefined && watch("has_insurance") !== ""
    });

    const rawInsuranceValue = watch("has_insurance");
    
    if (rawInsuranceValue === undefined || rawInsuranceValue === "" || rawInsuranceValue === null) {
      console.log("⏸️ No hay selección explícita de payment method, esperando...");
      return;
    }

    const hasInsuranceSelected = rawInsuranceValue === "true" || rawInsuranceValue === true;

    if (hasInsuranceSelected) {
      if (customerInsurance && generalInsurance.length > 0) {
        const generalInsuranceData = generalInsurance.find(
          gi => gi.id === customerInsurance.general_insurance_id
        );
        
        if (generalInsuranceData) {
          console.log("Cargando datos de seguro:", {
            customerInsurance,
            generalInsuranceData
          });
          
          setValue("insurance_company", generalInsuranceData.id);
          setValue("policy_number", customerInsurance.policy_number || "");
          setValue("insurance_phone", generalInsuranceData.phone_number || "");
        }
      }
      
      setValue("replacement_cash_price", "");
      
    } else if (rawInsuranceValue === "false" || rawInsuranceValue === false) {
      console.log("💰 Usuario seleccionó Cash Payment - limpiando campos de insurance y rebate");
      
      setValue("insurance_company", "");
      setValue("policy_number", "");
      setValue("insurance_phone", "");
      setValue("date_of_loss", null);
      setValue("glass_deductible", "");
      setValue("safelife", "");
      setValue("lynx_dispatch", "");
      setValue("other_insurance_info", "");
      setValue("rebate_type", "");
      setValue("rebate_amount", "");
      setValue("rebate_observations", "");
    }
    
  }, [watchedHasInsurance, customerInsurance, generalInsurance, dispatch, setValue, watch]);

  // Función para enviar el formulario
  const onSubmit = async (data) => {
    // Prevenir doble envío
    if (isSubmittingRef) {
      console.log("⚠️ Form submission already in progress, ignoring duplicate submission");
      return;
    }

    // console.log("📤 Enviando datos del formulario:", data);
    try {
      setIsSubmitting(true);
      
      // Procesar datos según la nueva estructura con jobs y extras
      const processedData = {
        // Información del cliente (actualizar si es necesario)
        customer: {
          id: parseInt(data.customer_id),
          fullname: data.customer_name,
          phone: data.customer_phone,
          secondary_phone: data.customer_alt_phone || null,
          email: data.customer_email || null
        },
        
        // Dirección del cliente (actualizar si es necesario)
        address: {
          street_address: data.customer_address,
          city: data.customer_city,
          state: data.customer_state,
          zipcode: data.customer_zip,
          unit_number: data.customer_apt_no || null,
          main_cross_streets: data.cross_street || null,
          apartment_name: data.department_name || null,
          building: data.building || null
        },
        
        // Información del vehículo
        vehicle: {
            id: data.selected_vehicle_id && data.selected_vehicle_id !== "new" ? parseInt(data.selected_vehicle_id) : null,
            year: data.vehicle_year,
            make: data.vehicle_make,
            model: data.vehicle_model,
            color: data.vehicle_color,
            vin: data.vin,
            doors: data.has_4d ? "4" : "2",
            part_number: data.part_number,
            update_existing: data.selected_vehicle_id && data.selected_vehicle_id !== "new" 
        },
        
        // Tipos de vidrio (para jobs_appointment)
        glassTypes: {
          has_windshield: data.has_windshield,
          has_door_glass: data.has_door_glass,
          has_back_glass: data.has_back_glass,
          has_vent_glass: data.has_vent_glass,
          has_quarter_glass: data.has_quarter_glass
        },
        
        // Características del vidrio (para extras)
        glassFeatures: {
          has_2d: data.has_2d,
          has_4d: data.has_4d,
          has_ldws: data.has_ldws,
          has_hud: data.has_hud,
          has_heated: data.has_heated,
          has_antenna: data.has_antenna,
          has_rain_sensor: data.has_rain_sensor,
          has_tint_strip: data.has_tint_strip,
          has_windshield_tint: data.has_windshield_tint,
          has_chrome: data.has_chrome,
          has_black: data.has_black
        },
        
        // Información del seguro (solo si aplica)
        insurance: data.has_insurance ? {
          general_insurance_id: parseInt(data.insurance_company),
          policy_number: data.policy_number,
          date_of_loss: data.date_of_loss,
          glass_deductible: parseFloat(data.glass_deductible),
          safelife: data.safelife || null,
          lynx: data.lynx_dispatch || null,
          other: data.other_insurance_info || null,
          update_customer_insurance: true
        } : null,
        
        // Información de la cita
        appointment: {
          installation_date: data.installation_date,
          installation_time: data.installation_time,
          tech_name: data.tech_name,
          service_advisor: data.service_advisor,
          edirect: data.edirect || null,
          location_type: data.location_type === "address_customer" ? "home" : 
                        data.location_type === "in_shop" ? "shop" : "other",
          replacement_type: data.has_insurance ? "insurance" : "out_of_pocket",
          cross_street: data.install_cross_street || null,
          dep_name: data.install_dept_name || null,
          building: data.install_building || null,
          comment: `
            Tech: ${data.tech_name}
            Service Advisor: ${data.service_advisor}
            Sales Person: ${data.sales_person}
            Origin: ${data.origin}
            ${data.edirect ? `Edirect: ${data.edirect}` : ''}
            Part #: ${data.part_number}
          `.trim()
        },
        
        // Dirección alternativa (si aplica)
        alternateAddress: data.location_type === "other_address" ? {
          business_name: data.business_name,
          street_address: data.install_address,
          city: data.install_city,
          state: data.install_state,
          zipcode: data.install_zip,
          unit_number: data.install_apt_suite || null,
          building: data.install_building || null,
          main_cross_streets: data.install_cross_street || null,
          contact_name: data.install_contact,
          contact_phone: data.install_phone,
          property_type: data.app_type_of_place || "other",
          is_commercial: data.app_type_of_place && data.app_type_of_place !== "house" && data.app_type_of_place !== "apartment" && data.app_type_of_place !== "condo"
        } : null,
        
        // Información de rebate (solo si usa seguro)
        rebate: data.has_insurance && data.rebate_type && data.rebate_amount ? {
          has_rebate: true,
          [data.rebate_type]: parseFloat(data.rebate_amount),
          observations: data.rebate_observations || null
        } : null,
        
        // Información de venta (solo si NO tiene seguro)
        sale: !data.has_insurance && data.replacement_cash_price ? {
          price_cash: parseFloat(data.replacement_cash_price),
          payment_type: "cash",
          salesperson: data.sales_person,
          origin: data.origin
        } : null
      };
      
      console.log("📋 Datos procesados para enviar:", processedData);
      
      const resultAction = await dispatch(addAppointmentThunk(processedData));
      
      if (addAppointmentThunk.fulfilled.match(resultAction)) {
        toast.success("Appointment created successfully");

        // Abrir modal de impresión con los datos del appointment creado
        const appointmentForPrint = {
          ...data, // Datos del formulario
          id: resultAction.payload?.id || resultAction.payload?.appointment_id || Date.now(), // ID del appointment creado
          // Mapear datos adicionales del resultado si están disponibles
          resultAPiData: resultAction.payload || {},
        };

        // Abrir modal de impresión
        openPrintModal(appointmentForPrint);

        reset();
        dispatch(clearAppointmentData());
        setCurrentStep(1);
      }
      
    } catch (error) {
      console.error("Error al crear appointment:", error);
      toast.error("Unexpected error creating appointment");
    } finally {
      setIsSubmitting(false);
      setIsSubmittingRef(false); // Liberar el flag
    }
  };

  const onInvalidSubmit = (errors) => {
    console.log("🚫 Validation errors:", errors);
    
    const firstErrorField = Object.keys(errors)[0];
    const firstError = errors[firstErrorField];
    
    if (firstError?.message) {
      toast.error(`${firstError.message}`);
    } else {
      toast.error("Please check all required fields");
    }
  };

  return (
    <Page title="New Appointment">
      <div className="transition-content px-(--margin-x) pb-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <CalendarDaysIcon className="size-6 text-primary-600" />
            <div>
              <h2 className="line-clamp-1 text-xl font-medium text-gray-700 dark:text-dark-50">
                New Appointment
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-300">
                Create a new glass repair appointment
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              className="min-w-[7rem]" 
              variant="outlined"
              onClick={() => {
                reset();
                dispatch(clearAppointmentData());
              }}
            >
              Clear Form
            </Button>
          </div>
        </motion.div>

        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
          id="appointment-form"
        >
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6"
          >
            {/* SECCIÓN 1: INFORMACIÓN DEL CLIENTE */}
            <motion.div variants={fadeInUp} className="col-span-12">
              <Card className="p-4 sm:px-5">
                <div className="flex items-center mb-6">
                  <UserIcon className="h-6 w-6 text-primary-600 mr-3" />
                  <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                    Customer Information
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Selector de Cliente */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Controller
                      render={({ field }) => (
                        <AsyncCombobox
                          data={searchableCustomers}
                          displayField="fullname"
                          value={searchableCustomers.find((customer) => customer.id === parseInt(field.value)) || null}
                          onChange={(val) => {
                            field.onChange(val?.id || '');
                            if (val) {
                              console.log("Selected customer:", val);
                              setCustomerSearchTerm(val.fullname);
                            }
                          }}
                          searchTerm={customerSearchTerm}
                          onSearchChange={setCustomerSearchTerm}
                          placeholder="Select customer"
                          searchPlaceholder="Type customer name, phone, or email..."
                          label="Customer Name *"
                          error={errors?.customer_id?.message}
                          highlight
                          isLoading={isSearchingCustomers}
                          showNoResults={showNoCustomerResults}
                          canLoadMore={canLoadMoreCustomers}
                          onLoadMore={loadMoreCustomers}
                          noResultsText="No customers found"
                          minSearchLength={2}
                        />
                      )}
                      control={control}
                      name="customer_id"
                    />
                    
                    <Input
                      label="Customer Name *"
                      placeholder="Enter customer name"
                      {...register("customer_name")}
                      error={errors?.customer_name?.message}
                      disabled={!selectedCustomer}
                    />
                  </div>

                  {/* Información de contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Phone *"
                      placeholder="(555) 123-4567"
                      {...register("customer_phone")}
                      error={errors?.customer_phone?.message}
                      disabled={!selectedCustomer}
                      prefix={<PhoneIcon className="h-5 w-5" />}
                    />
                    <Input
                      label="Alternative Phone"
                      placeholder="(555) 987-6543"
                      {...register("customer_alt_phone")}
                      error={errors?.customer_alt_phone?.message}
                      disabled={!selectedCustomer}
                      prefix={<PhoneIcon className="h-5 w-5" />}
                    />
                  </div>

                  <Input
                    label="Email"
                    placeholder="customer@email.com"
                    {...register("customer_email")}
                    error={errors?.customer_email?.message}
                    disabled={!selectedCustomer}
                    prefix={<EnvelopeIcon className="h-5 w-5" />}
                  />

                  {/* Dirección */}
                  <Input
                    label="Street Address *"
                    placeholder="123 Main Street"
                    {...register("customer_address")}
                    error={errors?.customer_address?.message}
                    disabled={!selectedCustomer}
                    prefix={<HomeIcon className="h-5 w-5" />}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                      label="Apt. No"
                      placeholder="Apt 123"
                      {...register("customer_apt_no")}
                      error={errors?.customer_apt_no?.message}
                      disabled={!selectedCustomer}
                    />
                    <Input
                      label="City *"
                      placeholder="City"
                      {...register("customer_city")}
                      error={errors?.customer_city?.message}
                      disabled={!selectedCustomer}
                    />
                    <Controller
                      render={({ field }) => (
                        <Listbox
                          data={usStates}
                          value={usStates.find((state) => state.id === field.value) || null}
                          onChange={(val) => field.onChange(val?.id)}
                          name={field.name}
                          label="State *"
                          placeholder="Select State"
                          displayField="label"
                          error={errors?.customer_state?.message}
                          disabled={!selectedCustomer}
                        />
                      )}
                      control={control}
                      name="customer_state"
                    />
                    <Input
                      label="Zip *"
                      placeholder="12345"
                      {...register("customer_zip")}
                      error={errors?.customer_zip?.message}
                      disabled={!selectedCustomer}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Cross Street *"
                      placeholder="Cross street"
                      {...register("cross_street")}
                      error={errors?.cross_street?.message}
                      disabled={!selectedCustomer}
                    />
                    <Input
                      label="Department Name"
                      placeholder="Department"
                      {...register("department_name")}
                      error={errors?.department_name?.message}
                      disabled={!selectedCustomer}
                    />
                    <Input
                      label="Building"
                      placeholder="Building #"
                      {...register("building")}
                      error={errors?.building?.message}
                      disabled={!selectedCustomer}
                    />
                  </div>
                </div>

                {selectedCustomer && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Customer selected: {selectedCustomer.fullname}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      You can edit the information above and it will be updated in the database.
                    </p>
                  </motion.div>
                )}
              </Card>
            </motion.div>

            {/* SECCIÓN 2: PREGUNTA SOBRE SEGURO */}
            {selectedCustomer && (
              <motion.div variants={fadeInUp} className="col-span-12">
                <Card className="p-4 sm:px-5">
                  <div className="flex items-center mb-6">
                    <ShieldCheckIcon className="h-6 w-6 text-primary-600 mr-3" />
                    <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                      Payment Method Selection
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-3 block">
                        How will this appointment be paid? *
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="true"
                            {...register("has_insurance")}
                            className="text-primary-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-dark-200">Use Insurance</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="false"
                            {...register("has_insurance")}
                            className="text-primary-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-dark-200">Cash Payment</span>
                        </label>
                      </div>
                      {errors?.has_insurance?.message && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {errors.has_insurance.message}
                        </p>
                      )}
                    </div>

                    {/* SECCIÓN DE SEGURO */}
                    <AnimatePresence>
                      {watchedHasInsurance && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 pt-4 border-t border-gray-200 dark:border-dark-600"
                        >
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
                              🛡️ Insurance Information
                            </h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                              Fill out the insurance details below. Any changes will be saved to the customer&apos;s profile.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Controller
                                render={({ field }) => (
                                  <Combobox
                                    data={generalInsurance}
                                    displayField="name"
                                    value={generalInsurance.find((ins) => ins.id === parseInt(field.value)) || null}
                                    onChange={(val) => field.onChange(val?.id)}
                                    placeholder="Select Insurance Company"
                                    label="Insurance Company *"
                                    searchFields={["name"]}
                                    error={errors?.insurance_company?.message}
                                    highlight
                                    loading={loadingInsurance}
                                  />
                                )}
                                control={control}
                                name="insurance_company"
                              />

                              <Input
                                label="Policy Number *"
                                placeholder="Policy number"
                                {...register("policy_number")}
                                error={errors?.policy_number?.message}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <Input
                                label="Insurance Phone *"
                                placeholder="(555) 123-4567"
                                {...register("insurance_phone")}
                                error={errors?.insurance_phone?.message}
                                prefix={<PhoneIcon className="h-5 w-5" />}
                              />
                              <Controller
                                render={({ field: { onChange, value } }) => (
                                  <DatePicker
                                    onChange={(selectedDate) => {
                                      const dateString = formatDateToString(selectedDate);
                                      onChange(dateString || "");
                                    }}
                                    value={parseDateString(value)}
                                    label="Date of Loss *"
                                    error={errors?.date_of_loss?.message}
                                    options={{ disableMobile: true }}
                                    placeholder="Select date..."
                                  />
                                )}
                                control={control}
                                name="date_of_loss"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                              <Input
                                label="Glass Deductible *"
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                                min="0"
                                {...register("glass_deductible")}
                                error={errors?.glass_deductible?.message}
                                prefix={<CurrencyDollarIcon className="h-5 w-5" />}
                              />
                              <Input
                                label="Safelife"
                                placeholder="Safelife info"
                                {...register("safelife")}
                                error={errors?.safelife?.message}
                              />
                              <Input
                                label="Lynx Dispatch"
                                placeholder="Lynx dispatch"
                                {...register("lynx_dispatch")}
                                error={errors?.lynx_dispatch?.message}
                              />
                            </div>

                            <div className="mt-4">
                              <Textarea
                                rows={3}
                                label="Other Insurance Information"
                                placeholder="Additional insurance notes..."
                                {...register("other_insurance_info")}
                                error={errors?.other_insurance_info?.message}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* SECCIÓN DE PAGO EN EFECTIVO */}
                    <AnimatePresence>
                      {hasPaymentMethodSelected && watchedHasInsurance === false && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 pt-4 border-t border-gray-200 dark:border-dark-600"
                        >
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
                              💵 Cash Payment
                            </h4>
                            <p className="text-xs text-green-700 dark:text-green-300 mb-4">
                              Enter the total cash price for the glass replacement service.
                            </p>
                            
                            <Input
                              label="Replacement Cash Price *"
                              placeholder="0.00"
                              type="number"
                              step="0.01"
                              min="0"
                              {...register("replacement_cash_price")}
                              error={errors?.replacement_cash_price?.message}
                              prefix={<CurrencyDollarIcon className="h-5 w-5" />}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* SECCIÓN 3: INFORMACIÓN DEL VEHÍCULO */}
            {selectedCustomer && (
              <motion.div variants={fadeInUp} className="col-span-12">
                <Card className="p-4 sm:px-5">
                  <div className="flex items-center mb-6">
                    <TruckIcon className="h-6 w-6 text-primary-600 mr-3" />
                    <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                      Vehicle Information
                    </h3>
                  </div>

                  {/* Selector de vehículo existente */}
                  {customerVehicles.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <TruckIcon className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Customer&apos;s Existing Vehicles
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                        Select an existing vehicle or choose &quot;Add New Vehicle&quot; to create a new one.
                      </p>
                      
                      <Controller
                        render={({ field }) => (
                          <Combobox
                            data={[
                              { id: "new", label: "➕ Add New Vehicle", year: "", make: "", model: "", color: "", vin: "", doors: "" },
                              ...customerVehicles.map(v => ({
                                id: v.id,
                                label: `${v.year} ${v.make} ${v.model} - ${v.color}${v.vin ? ` (VIN: ${v.vin.slice(-4)})` : ''}`,
                                ...v
                              }))
                            ]}
                            displayField="label"
                            value={field.value ? 
                              (field.value === "new" ? 
                                { id: "new", label: "➕ Add New Vehicle" } : 
                                customerVehicles.find(v => v.id === parseInt(field.value)) || null
                              ) : null}
                            onChange={(val) => {
                              field.onChange(val?.id);
                              if (val && val.id !== "new") {
                                // Prellenar campos del vehículo
                                setValue("vehicle_year", val.year || "");
                                setValue("vehicle_make", val.make || "");
                                setValue("vehicle_model", val.model || "");
                                setValue("vehicle_color", val.color || "");
                                setValue("vin", val.vin || "");
                                setValue("has_4d", val.doors === "4");
                                setValue("has_2d", val.doors === "2");
                              } else {
                                // Limpiar campos si es nuevo vehículo
                                setValue("vehicle_year", "");
                                setValue("vehicle_make", "");
                                setValue("vehicle_model", "");
                                setValue("vehicle_color", "");
                                setValue("vin", "");
                                setValue("has_4d", false);
                                setValue("has_2d", false);
                              }
                            }}
                            placeholder="Choose existing vehicle or add new..."
                            label="Vehicle Selection"
                            searchFields={["label", "year", "make", "model"]}
                            highlight
                            error={errors?.selected_vehicle_id?.message}
                          />
                        )}
                        control={control}
                        name="selected_vehicle_id"
                      />
                    </motion.div>
                  )}

                  <div className="space-y-4">

                    {/* Información sobre el vehículo seleccionado */}
                    {watch("selected_vehicle_id") && watch("selected_vehicle_id") !== "new" && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Updating existing vehicle information
                          </span>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          You can modify the details below and they will be saved to the customer&apos;s vehicle record.
                        </p>
                      </motion.div>
                    )}

                    {watch("selected_vehicle_id") === "new" && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Adding new vehicle
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          Fill out the vehicle information below to add it to the customer&apos;s record.
                        </p>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        label="Year *"
                        placeholder="2023"
                        {...register("vehicle_year")}
                        error={errors?.vehicle_year?.message}
                      />
                      <Input
                        label="Make *"
                        placeholder="Toyota"
                        {...register("vehicle_make")}
                        error={errors?.vehicle_make?.message}
                      />
                      <Input
                        label="Model *"
                        placeholder="Camry"
                        {...register("vehicle_model")}
                        error={errors?.vehicle_model?.message}
                      />
                      <Input
                        label="Color *"
                        placeholder="Silver"
                        {...register("vehicle_color")}
                        error={errors?.vehicle_color?.message}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="VIN *"
                        placeholder="17-character VIN"
                        {...register("vin")}
                        error={errors?.vin?.message}
                        maxLength={17}
                      />
                      <Input
                        label="Part Number *"
                        placeholder="Part number"
                        {...register("part_number")}
                        error={errors?.part_number?.message}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* OPCIONES DE VIDRIO - SEPARADA EN TIPOS Y CARACTERÍSTICAS */}
            {selectedCustomer && (
              <motion.div variants={fadeInUp} className="col-span-12">
                <Card className="p-4 sm:px-5">
                  <div className="flex items-center mb-6">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-primary-600 mr-3" />
                    <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                      Glass Options & Features
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tipos de Vidrio (obligatorio al menos uno) */}
                    <div>
                      <div className="flex items-center mb-3">
                        <CubeIcon className="h-4 w-4 text-blue-600 mr-2" />
                        <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200">
                          Glass Types * <span className="text-xs text-gray-500">(Select at least one)</span>
                        </h4>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <div className="space-y-2">
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-blue-200 dark:border-blue-700/50 hover:bg-blue-25 dark:hover:bg-blue-900/5 transition-colors">
                            <Checkbox label="Windshield" {...register("has_windshield")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-blue-200 dark:border-blue-700/50 hover:bg-blue-25 dark:hover:bg-blue-900/5 transition-colors">
                            <Checkbox label="Door Glass" {...register("has_door_glass")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-blue-200 dark:border-blue-700/50 hover:bg-blue-25 dark:hover:bg-blue-900/5 transition-colors">
                            <Checkbox label="Back Glass" {...register("has_back_glass")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-blue-200 dark:border-blue-700/50 hover:bg-blue-25 dark:hover:bg-blue-900/5 transition-colors">
                            <Checkbox label="Vent Glass" {...register("has_vent_glass")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-blue-200 dark:border-blue-700/50 hover:bg-blue-25 dark:hover:bg-blue-900/5 transition-colors">
                            <Checkbox label="Quarter Glass" {...register("has_quarter_glass")} />
                          </div>
                        </div>
                      </div>
                      {errors?.root?.message && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                          Please select at least one glass type
                        </p>
                      )}
                    </div>

                    {/* Características Técnicas */}
                    <div>
                    <div className="flex items-center mb-3">
                      <CogIcon className="h-4 w-4 text-green-600 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200">
                        Technical Features
                      </h4>
                    </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800/30">
                        <div className="space-y-2">
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-green-200 dark:border-green-700/50 hover:bg-green-25 dark:hover:bg-green-900/5 transition-colors">
                            <Checkbox label="2D" {...register("has_2d")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-green-200 dark:border-green-700/50 hover:bg-green-25 dark:hover:bg-green-900/5 transition-colors">
                            <Checkbox label="4D" {...register("has_4d")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-green-200 dark:border-green-700/50 hover:bg-green-25 dark:hover:bg-green-900/5 transition-colors">
                            <Checkbox label="LDWS" {...register("has_ldws")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-green-200 dark:border-green-700/50 hover:bg-green-25 dark:hover:bg-green-900/5 transition-colors">
                            <Checkbox label="HUD" {...register("has_hud")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-green-200 dark:border-green-700/50 hover:bg-green-25 dark:hover:bg-green-900/5 transition-colors">
                            <Checkbox label="Heated" {...register("has_heated")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-green-200 dark:border-green-700/50 hover:bg-green-25 dark:hover:bg-green-900/5 transition-colors">
                            <Checkbox label="Antenna" {...register("has_antenna")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-green-200 dark:border-green-700/50 hover:bg-green-25 dark:hover:bg-green-900/5 transition-colors">
                            <Checkbox label="Rain Sensor" {...register("has_rain_sensor")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-green-200 dark:border-green-700/50 hover:bg-green-25 dark:hover:bg-green-900/5 transition-colors">
                            <Checkbox label="Tint Strip" {...register("has_tint_strip")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-green-200 dark:border-green-700/50 hover:bg-green-25 dark:hover:bg-green-900/5 transition-colors">
                            <Checkbox label="Windshield Tint" {...register("has_windshield_tint")} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acabados */}
                    <div>
                      <div className="flex items-center mb-3">
                        <SparklesIcon className="h-4 w-4 text-purple-600 mr-2" />
                        <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200">
                          Finishes
                        </h4>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800/30">
                        <div className="space-y-2">
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-purple-200 dark:border-purple-700/50 hover:bg-purple-25 dark:hover:bg-purple-900/5 transition-colors">
                            <Checkbox label="Chrome" {...register("has_chrome")} />
                          </div>
                          <div className="p-2 bg-white dark:bg-dark-800 rounded border border-purple-200 dark:border-purple-700/50 hover:bg-purple-25 dark:hover:bg-purple-900/5 transition-colors">
                            <Checkbox label="Black" {...register("has_black")} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* SECCIÓN 5: INFORMACIÓN DEL PERSONAL */}
            {selectedCustomer && (
              <motion.div variants={fadeInUp} className="col-span-12">
                <Card className="p-4 sm:px-5">
                  <div className="flex items-center mb-6">
                    <UserIcon className="h-6 w-6 text-primary-600 mr-3" />
                    <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                      Staff Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Controller
                      render={({ field }) => (
                        <Listbox
                          data={technicians}
                          value={technicians.find((tech) => tech.id === field.value) || null}
                          onChange={(val) => field.onChange(val?.id)}
                          name={field.name}
                          label="Tech Name *"
                          placeholder="Select Technician"
                          displayField="label"
                          error={errors?.tech_name?.message}
                        />
                      )}
                      control={control}
                      name="tech_name"
                    />

                    <Controller
                      render={({ field }) => (
                        <Listbox
                          data={technicians}
                          value={technicians.find((tech) => tech.id === field.value) || null}
                          onChange={(val) => field.onChange(val?.id)}
                          name={field.name}
                          label="Service Advisor *"
                          placeholder="Select Advisor"
                          displayField="label"
                          error={errors?.service_advisor?.message}
                        />
                      )}
                      control={control}
                      name="service_advisor"
                    />

                    <Controller
                      render={({ field }) => (
                        <Listbox
                          data={technicians}
                          value={technicians.find((tech) => tech.id === field.value) || null}
                          onChange={(val) => field.onChange(val?.id)}
                          name={field.name}
                          label="Sales Person *"
                          placeholder="Select Salesperson"
                          displayField="label"
                          error={errors?.sales_person?.message}
                        />
                      )}
                      control={control}
                      name="sales_person"
                    />

                    <Input
                      label="Edirect"
                      placeholder="Edirect info"
                      {...register("edirect")}
                      error={errors?.edirect?.message}
                    />

                    <Input
                      label="Origin"
                      placeholder="Office/Location"
                      {...register("origin")}
                      error={errors?.origin?.message}
                    />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* SECCIÓN 6: FECHA Y UBICACIÓN DE INSTALACIÓN */}
            {selectedCustomer && (
              <motion.div variants={fadeInUp} className="col-span-12">
                <Card className="p-4 sm:px-5">
                  <div className="flex items-center mb-6">
                    <MapPinIcon className="h-6 w-6 text-primary-600 mr-3" />
                    <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                      Installation Details
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
                            onChange={(selectedDate) => {
                              const dateString = formatDateToString(selectedDate);
                              onChange(dateString || "");
                            }}
                            value={parseDateString(value)}
                            label="Installation Date *"
                            error={errors?.installation_date?.message}
                            options={{ 
                              disableMobile: true,
                              minDate: "today"
                            }}
                            placeholder="Select installation date..."
                          />
                        )}
                        control={control}
                        name="installation_date"
                      />

                      <Controller
                        render={({ field }) => (
                          <Listbox
                            data={appointmentTimes}
                            value={appointmentTimes.find((time) => time.id === field.value) || null}
                            onChange={(val) => field.onChange(val?.id)}
                            name={field.name}
                            label="Installation Time *"
                            placeholder="Select time slot"
                            displayField="label"
                            error={errors?.installation_time?.message}
                          />
                        )}
                        control={control}
                        name="installation_time"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-3 block">
                        Installation Location *
                      </label>
                      <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="address_customer"
                            {...register("location_type")}
                            className="text-primary-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-dark-200">Customer Address</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="in_shop"
                            {...register("location_type")}
                            className="text-primary-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-dark-200">In Shop</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="other_address"
                            {...register("location_type")}
                            className="text-primary-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-dark-200">Other Address</span>
                        </label>
                      </div>
                    </div>

                    <AnimatePresence>
                      {watchedLocationType === "other_address" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 pt-4 border-t border-gray-200 dark:border-dark-600"
                        >
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Alternative Installation Address
                              </span>
                            </div>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                              Please provide complete details for the alternative installation location.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                              render={({ field }) => (
                                <Listbox
                                  data={PROPERTY_TYPES}
                                  value={PROPERTY_TYPES.find((type) => type.id === field.value) || null}
                                  onChange={(val) => field.onChange(val?.id)}
                                  name={field.name}
                                  label="App Type of Place *"
                                  placeholder="Select property type"
                                  displayField="label"
                                  error={errors?.app_type_of_place?.message}
                                />
                              )}
                              control={control}
                              name="app_type_of_place"
                            />
                            <Input
                              label="Business Name *"
                              placeholder="Business name"
                              {...register("business_name")}
                              error={errors?.business_name?.message}
                              prefix={<BuildingOfficeIcon className="h-5 w-5" />}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Install Address *"
                              placeholder="123 Business St"
                              {...register("install_address")}
                              error={errors?.install_address?.message}
                              prefix={<HomeIcon className="h-5 w-5" />}
                            />
                            <Input
                              label="Apt. No. & Suite"
                              placeholder="Suite 100"
                              {...register("install_apt_suite")}
                              error={errors?.install_apt_suite?.message}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                              label="City *"
                              placeholder="City"
                              {...register("install_city")}
                              error={errors?.install_city?.message}
                            />
                            <Controller
                              render={({ field }) => (
                                <Listbox
                                  data={usStates}
                                  value={usStates.find((state) => state.id === field.value) || null}
                                  onChange={(val) => field.onChange(val?.id)}
                                  name={field.name}
                                  label="State *"
                                  placeholder="State"
                                  displayField="label"
                                  error={errors?.install_state?.message}
                                />
                              )}
                              control={control}
                              name="install_state"
                            />
                            <Input
                              label="Zip *"
                              placeholder="12345"
                              {...register("install_zip")}
                              error={errors?.install_zip?.message}
                            />
                            <Input
                              label="Building #"
                              placeholder="Building #"
                              {...register("install_building")}
                              error={errors?.install_building?.message}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                              label="Dept Name"
                              placeholder="Department"
                              {...register("install_dept_name")}
                              error={errors?.install_dept_name?.message}
                            />
                            <Input
                              label="Cross Street *"
                              placeholder="Cross street"
                              {...register("install_cross_street")}
                              error={errors?.install_cross_street?.message}
                            />
                            <Input
                              label="Contact *"
                              placeholder="Contact name"
                              {...register("install_contact")}
                              error={errors?.install_contact?.message}
                            />
                          </div>

                          <Input
                            label="Contact Phone *"
                            placeholder="(555) 123-4567"
                            {...register("install_phone")}
                            error={errors?.install_phone?.message}
                            prefix={<PhoneIcon className="h-5 w-5" />}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* SECCIÓN 7: INFORMACIÓN DE REBATE - Solo se muestra si usa seguro */}
            <AnimatePresence>
              {selectedCustomer && watchedHasInsurance && (
                <motion.div 
                  variants={fadeInUp} 
                  className="col-span-12"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-4 sm:px-5">
                    <div className="flex items-center mb-6">
                      <CurrencyDollarIcon className="h-6 w-6 text-primary-600 mr-3" />
                      <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                        Rebate Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
                          🎁 Customer Rebate Details
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                          Specify the rebate details for this insurance claim.
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-3 block">
                              Rebate Type *
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value="check"
                                  {...register("rebate_type")}
                                  className="text-primary-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-dark-200">Check</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value="cash"
                                  {...register("rebate_type")}
                                  className="text-primary-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-dark-200">Cash</span>
                              </label>
                            </div>
                            {errors?.rebate_type?.message && (
                              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {errors.rebate_type.message}
                              </p>
                            )}
                          </div>

                          <Input
                            label="Rebate Amount *"
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            min="0"
                            {...register("rebate_amount")}
                            error={errors?.rebate_amount?.message}
                            prefix={<CurrencyDollarIcon className="h-5 w-5" />}
                          />

                          <Textarea
                            rows={3}
                            label="Rebate Observations"
                            placeholder="Additional notes about the rebate..."
                            {...register("rebate_observations")}
                            error={errors?.rebate_observations?.message}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SECCIÓN 8: RESUMEN */}
            {selectedCustomer && (
              <motion.div variants={fadeInUp} className="col-span-12">
                <Card className="p-4 sm:px-5">
                  <div className="flex items-center mb-6">
                    <CheckCircleIcon className="h-6 w-6 text-primary-600 mr-3" />
                    <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                      Appointment Summary
                    </h3>
                  </div>

                  <div className="bg-gray-50 dark:bg-dark-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600 dark:text-dark-200">Customer:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {watch("customer_name") || "Not selected"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-dark-200">Vehicle:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {watch("vehicle_year") && watch("vehicle_make") && watch("vehicle_model")
                            ? `${watch("vehicle_year")} ${watch("vehicle_make")} ${watch("vehicle_model")}`
                            : "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-dark-200">Payment:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {watchedHasInsurance ? "Insurance + Rebate" : "Cash Payment"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-dark-200">Install Date:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {watch("installation_date") || "Not selected"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-dark-200">Install Time:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {appointmentTimes.find(t => t.id === watch("installation_time"))?.label || "Not selected"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-dark-200">Location:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {watchedLocationType === "address_customer" ? "Customer Address" :
                            watchedLocationType === "in_shop" ? "In Shop" :
                            watchedLocationType === "other_address" ? "Other Address" : "Not selected"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-dark-200">Technician:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {watch("tech_name") || "Not assigned"}
                        </span>
                      </div>
                      
                      {/* Glass Types Summary */}
                      <div className="col-span-full">
                        <span className="font-medium text-gray-600 dark:text-dark-200">Glass Types:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {[
                            watch("has_windshield") && "Windshield",
                            watch("has_door_glass") && "Door Glass", 
                            watch("has_back_glass") && "Back Glass",
                            watch("has_vent_glass") && "Vent Glass",
                            watch("has_quarter_glass") && "Quarter Glass"
                          ].filter(Boolean).join(", ") || "None selected"}
                        </span>
                      </div>
                      
                      {/* Mostrar total estimado */}
                      {watchedHasInsurance && watch("rebate_amount") && (
                        <div>
                          <span className="font-medium text-gray-600 dark:text-dark-200">Rebate Amount:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            ${watch("rebate_amount")} ({watch("rebate_type")})
                          </span>
                        </div>
                      )}
                      {watchedHasInsurance === false && watch("replacement_cash_price") && (
                        <div>
                          <span className="font-medium text-gray-600 dark:text-dark-200">Cash Price:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            ${watch("replacement_cash_price")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
            {/* NUEVA SECCIÓN: BOTONES DE ACCIÓN */}
            {selectedCustomer && (
              <motion.div variants={fadeInUp} className="col-span-12">
                <Card className="p-4 sm:px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                      <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                          Ready to Create Appointment
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-dark-300">
                          Review the information above and create the appointment
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        className="min-w-[7rem]" 
                        variant="outlined"
                        onClick={() => {
                          reset();
                          dispatch(clearAppointmentData());
                        }}
                        disabled={isSubmitting || loading}
                      >
                        Clear Form
                      </Button>
                      <Button
                        className="min-w-[10rem]"
                        color="primary"
                        type="submit"
                        form="appointment-form"
                        disabled={isSubmitting || loading}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            Creating...
                          </div>
                        ) : (
                          "Create Appointment"
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </form>
      </div>

      {/* NUEVO: Modal de impresión */}
      <PrintModal
        isOpen={isModalOpen}
        onClose={closePrintModal}
        appointmentData={appointmentData}
      />
    </Page>
  );
};

export default NewAppointmentForm;
