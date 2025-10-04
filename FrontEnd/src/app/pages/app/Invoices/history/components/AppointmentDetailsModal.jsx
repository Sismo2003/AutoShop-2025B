// AppointmentDetailsModal.jsx - Actualizado con ConfirmModal para eliminación
import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Fragment } from "react";
import PropTypes from "prop-types";
import { DateTime } from "luxon";
import { toast } from "sonner";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  XMarkIcon,
  UserIcon,
  TruckIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  CubeIcon,
  PrinterIcon,
  DocumentTextIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

// Redux imports
import { 
  getAppointmentCompleteDetailsThunk,
  deleteAppointmentThunk 
} from "slices/thunk";
import { clearAppointmentCompleteDetails } from "slices/appointment/reducer";

// Local imports
import { Button } from "components/ui";
import { ConfirmModal } from "components/shared/ConfirmModal";
import PrintModal from './PrintModal';
import { usePrintAppointment } from '../hooks/usePrintAppointment';

// ----------------------------------------------------------------------

// Mensajes personalizados para el ConfirmModal de eliminación desde el modal de detalles
const deleteConfirmMessages = {
  pending: {
    title: "Delete Appointment?",
    description: "Are you sure you want to delete this appointment? This action will permanently remove all related data including customer information, vehicle details, glass work specifications, and payment records. This cannot be undone.",
    actionText: "Delete Appointment",
  },
  success: {
    title: "Appointment Deleted",
    description: "The appointment and all associated data have been successfully removed from the system. The appointment list will be updated automatically.",
    actionText: "Done",
  },
  error: {
    title: "Delete Failed",
    description: "Unable to delete the appointment. This could be due to a network issue or the appointment may be referenced by other records. Please try again or contact support if the problem persists.",
    actionText: "Retry Delete",
  },
};

// Función para formatear fecha usando Luxon
const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  
  const luxonDate = DateTime.fromISO(dateString);
  if (!luxonDate.isValid) {
    console.warn('Invalid date provided to formatDate:', dateString);
    return 'Invalid date';
  }
  
  return luxonDate.toLocaleString({
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
};

// Función para formatear tiempo
const formatTime = (timeSlot) => {
  const timeMap = {
    '6-10': '6:00 AM - 10:00 AM',
    '8-12': '8:00 AM - 12:00 PM',
    '10-2': '10:00 AM - 2:00 PM',
    '2-4': '2:00 PM - 4:00 PM',
    'all day': 'All Day'
  };
  return timeMap[timeSlot] || timeSlot;
};

// Función para formatear dinero
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Función para calcular días hasta la cita usando Luxon
const calculateDaysUntil = (dateString) => {
  if (!dateString) return 'Not specified';
  
  const appointmentDate = DateTime.fromISO(dateString);
  const today = DateTime.now().startOf('day');
  
  if (!appointmentDate.isValid) {
    return 'Invalid date';
  }
  
  const appointmentDay = appointmentDate.startOf('day');
  const diffInDays = Math.round(appointmentDay.diff(today, 'days').days);
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays === -1) return 'Yesterday';
  if (diffInDays > 1) return `In ${diffInDays} days`;
  if (diffInDays < -1) return `${Math.abs(diffInDays)} days ago`;
  
  return 'Unknown';
};

// ============= FUNCIONES PARA MANEJAR VEHÍCULO =============

// Función para formatear información del vehículo
const formatVehicleDisplayName = (vehicle) => {
  if (!vehicle) return 'Missing vehicle information';
  
  // Si tiene display_name válido y no es "null null null"
  if (vehicle.display_name && 
      vehicle.display_name !== "null null null" && 
      vehicle.display_name.trim() !== "") {
    return vehicle.display_name;
  }

  // Construir información del vehículo de forma segura
  const year = vehicle.year && vehicle.year !== "null" ? vehicle.year : null;
  const make = vehicle.make && vehicle.make !== "null" ? vehicle.make : null;
  const model = vehicle.model && vehicle.model !== "null" ? vehicle.model : null;
  
  // Filtrar solo los valores válidos
  const vehicleParts = [year, make, model].filter(part => part);
  
  // Si tenemos al menos una parte válida
  if (vehicleParts.length > 0) {
    return vehicleParts.join(' ');
  }
  
  // Si no hay información válida del vehículo
  return "Missing vehicle information";
};

// Función para verificar si hay información válida del vehículo
const hasValidVehicleInfo = (vehicle) => {
  if (!vehicle) return false;
  
  const year = vehicle.year && vehicle.year !== "null";
  const make = vehicle.make && vehicle.make !== "null";
  const model = vehicle.model && vehicle.model !== "null";
  const color = vehicle.color && vehicle.color !== "null";
  const vin = vehicle.vin && vehicle.vin !== "null";
  const doors = vehicle.doors && vehicle.doors !== "null";
  const partNumber = vehicle.part_number && vehicle.part_number !== "null";
  
  return year || make || model || color || vin || doors || partNumber;
};

// Función para formatear valor del vehículo
const formatVehicleValue = (value) => {
  if (!value || value === "null" || value.trim() === "") {
    return "Not specified";
  }
  return value;
};

// =============================================================

// Función helper para describir el tipo de rebate
const getRebateTypeDescription = (cashAmount, checkAmount) => {
  const hasCash = cashAmount && cashAmount > 0;
  const hasCheck = checkAmount && checkAmount > 0;
  
  if (hasCash && hasCheck) {
    return `Mixed: ${formatCurrency(cashAmount)} cash + ${formatCurrency(checkAmount)} check`;
  } else if (hasCash) {
    return `Cash: ${formatCurrency(cashAmount)}`;
  } else if (hasCheck) {
    return `Check: ${formatCurrency(checkAmount)}`;
  } else {
    return 'No rebate amount';
  }
};

// Función para obtener el estado con colores
const getStatusBadge = (status) => {
  const statusConfig = {
    today: { 
      label: 'Today', 
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
    },
    scheduled: { 
      label: 'Upcoming', 
      className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
    },
    completed: { 
      label: 'Completed', 
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' 
    }
  };
  
  const config = statusConfig[status] || { 
    label: 'Unknown', 
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' 
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

// Componente de sección con icono
const Section = ({ icon: Icon, title, children, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-dark-600">
      <Icon className="size-5 text-primary-600" />
      <h3 className="text-base font-medium text-gray-700 dark:text-dark-200">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

// Componente de campo de información mejorado para vehículo
const InfoField = ({ label, value, icon: Icon, isVehicleField = false, showMissingWarning = false }) => (
  <div className="flex items-start gap-3">
    {Icon && (
      showMissingWarning ? (
        <ExclamationTriangleIcon className="size-4 text-amber-400 mt-1 flex-shrink-0" />
      ) : (
        <Icon className="size-4 text-gray-400 dark:text-dark-400 mt-1 flex-shrink-0" />
      )
    )}
    <div className="min-w-0 flex-1">
      <p className="text-sm text-gray-600 dark:text-dark-300">{label}</p>
      <p className={`font-medium break-words ${
        showMissingWarning 
          ? 'text-amber-600 dark:text-amber-400' 
          : 'text-gray-900 dark:text-white'
      }`}>
        {value || (isVehicleField ? 'Missing information' : 'Not specified')}
      </p>
    </div>
  </div>
);

// ============= FUNCIÓN PARA CONVERTIR DATOS API A FORMATO DE IMPRESIÓN =============
const convertApiDataToPrintFormat = (appointmentCompleteDetails) => {
  if (!appointmentCompleteDetails) return null;

  const appointment = appointmentCompleteDetails.appointment;
  const customer = appointmentCompleteDetails.customer;
  const vehicle = appointmentCompleteDetails.vehicle;
  const payment = appointmentCompleteDetails.payment;
  const installation = appointmentCompleteDetails.installation;
  const glassWork = appointmentCompleteDetails.glass_work;

  // Formatear datos según la estructura esperada por AppointmentPrintView
  return {
    // Información básica del appointment
    id: appointment.id,
    
    // Información del cliente
    customer_name: customer.name || '',
    customer_phone: customer.phone || '',
    customer_alt_phone: customer.alt_phone || '',
    customer_email: customer.email || '',
    customer_address: customer.address?.street || '',
    customer_city: customer.address?.city || '',
    customer_state: customer.address?.state || '',
    customer_zip: customer.address?.zip || '',
    cross_street: customer.address?.cross_streets || '',
    department_name: customer.address?.apartment_name || '',
    building: customer.address?.building || '',
    
    // Información del vehículo - manejo seguro de nulls
    vehicle_year: vehicle?.year && vehicle.year !== "null" ? vehicle.year : '',
    vehicle_make: vehicle?.make && vehicle.make !== "null" ? vehicle.make : '',
    vehicle_model: vehicle?.model && vehicle.model !== "null" ? vehicle.model : '',
    vehicle_color: vehicle?.color && vehicle.color !== "null" ? vehicle.color : '',
    vin: vehicle?.vin && vehicle.vin !== "null" ? vehicle.vin : '',
    part_number: vehicle?.part_number && vehicle.part_number !== "null" ? vehicle.part_number : '',
    
    // Información de instalación
    installation_date: appointment.installation_date,
    installation_time: appointment.installation_time,
    location_type: appointment.location_type,
    
    // Información del personal
    tech_name: appointment.tech_name || '',
    service_advisor: appointment.service_advisor || '',
    sales_person: appointment.sales_person || '',
    origin: appointment.origin || '',
    edirect: appointment.edirect || '',
    
    // Información de pago/seguro
    has_insurance: payment?.type === 'insurance',
    
    // Datos de seguro
    insurance_company_name: payment?.insurance?.company_name || '',
    policy_number: payment?.insurance?.policy_number || '',
    insurance_phone: payment?.insurance?.phone || '',
    date_of_loss: payment?.insurance?.date_of_loss || '',
    glass_deductible: payment?.insurance?.glass_deductible || 0,
    safelife: payment?.insurance?.safelife || '',
    lynx_dispatch: payment?.insurance?.lynx || '',
    other_insurance_info: payment?.insurance?.other_info || '',
    
    // Datos de rebate (para insurance)
    rebate_type: payment?.rebate?.cash_amount > 0 && payment?.rebate?.check_amount > 0 ? 'mixed' :
                 payment?.rebate?.cash_amount > 0 ? 'cash' :
                 payment?.rebate?.check_amount > 0 ? 'check' : '',
    rebate_amount: payment?.rebate?.total_rebate || 0,
    rebate_observations: payment?.rebate?.observations || '',
    
    // Datos de pago en efectivo
    replacement_cash_price: payment?.cash_price || 0,
    
    // Tipos de vidrio (glass types) - Convertir a boolean
    has_windshield: Boolean(glassWork?.types?.windshield),
    has_door_glass: Boolean(glassWork?.types?.front_door || glassWork?.types?.back_door),
    has_back_glass: Boolean(glassWork?.types?.back_glass),
    has_quarter_glass: Boolean(glassWork?.types?.quarter_glass),
    has_vent_glass: Boolean(glassWork?.types?.vent_glass),
    
    // Características técnicas del vidrio (glass features) - Convertir a boolean
    has_2d: Boolean(vehicle?.doors === "2"),
    has_4d: Boolean(vehicle?.doors === "4"),
    has_ldws: Boolean(glassWork?.features?.ldws),
    has_rain_sensor: Boolean(glassWork?.features?.rain_sensor),
    has_tint_strip: Boolean(glassWork?.features?.tint_strip),
    has_windshield_tint: Boolean(glassWork?.features?.tint),
    has_chrome: Boolean(glassWork?.features?.molding_chrome),
    has_black: Boolean(glassWork?.features?.molding_black),
    has_hud: Boolean(glassWork?.features?.hud),
    has_heated: Boolean(glassWork?.features?.heated),
    has_antenna: Boolean(glassWork?.features?.antenna),
    
    // Dirección alternativa (si aplica)
    business_name: installation?.address?.business_name || '',
    app_type_of_place: installation?.address?.property_type || '',
    install_address: installation?.address?.street || '',
    install_city: installation?.address?.city || '',
    install_state: installation?.address?.state || '',
    install_zip: installation?.address?.zip || '',
    install_contact: installation?.contact_name || '',
    install_phone: installation?.contact_phone || '',
    install_cross_street: installation?.address?.cross_streets || '',
    install_dept_name: installation?.address?.apartment_name || '',
    install_building: installation?.address?.building || '',
    
    // Otros datos
    repair_price: "0.00",
    comment: appointment.comment || '',
    
    // Datos adicionales para depuración
    resultAPiData: appointmentCompleteDetails
  };
};

const AppointmentDetailsModal = ({ 
  appointmentId, 
  isOpen, 
  onClose,
  onDeleteSuccess = () => {} // Callback para cuando se elimina exitosamente
}) => {
  const dispatch = useDispatch();
  const { appointmentCompleteDetails, loadingCompleteDetails } = useSelector(
    (state) => state.appointments
  );

  // Custom hook para impresión
  const { isModalOpen, appointmentData, openPrintModal, closePrintModal } = usePrintAppointment();

  // Estados para el modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  // Cargar detalles cuando se abre el modal
  useEffect(() => {
    if (isOpen && appointmentId) {
      dispatch(getAppointmentCompleteDetailsThunk(appointmentId));
    }
  }, [isOpen, appointmentId, dispatch]);

  console.log('Detalles completos de la cita:', appointmentCompleteDetails);

  // Limpiar detalles cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearAppointmentCompleteDetails());
    }
  }, [isOpen, dispatch]);

  // Función para abrir el modal de impresión con datos convertidos
  const handlePrintAppointment = () => {
    console.log('🖨️ Iniciando impresión desde modal de detalles...');
    
    if (!appointmentCompleteDetails) {
      console.error('❌ No hay datos de appointment para imprimir');
      return;
    }

    // Convertir datos de la API al formato esperado por el componente de impresión
    const printData = convertApiDataToPrintFormat(appointmentCompleteDetails);
    
    console.log('📋 Datos convertidos para impresión:', printData);
    
    // Abrir modal de impresión
    openPrintModal(printData);
  };

  // ============= FUNCIONES PARA MANEJO DE ELIMINACIÓN =============

  // Función para cerrar el modal de eliminación
  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteError(false);
    setDeleteSuccess(false);
    setConfirmDeleteLoading(false);
  }, []);

  // Función para abrir el modal de confirmación de eliminación
  const openDeleteModal = useCallback(() => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  }, []);

  // Función para manejar la eliminación del appointment
  const handleDeleteAppointment = useCallback(async () => {
    if (!appointmentCompleteDetails?.appointment?.id) {
      console.error('❌ No appointment ID available for deletion');
      return;
    }

    try {
      setConfirmDeleteLoading(true);
      setDeleteError(false);

      const appointmentIdToDelete = appointmentCompleteDetails.appointment.id;
      console.log(`🗑️ Deleting appointment ${appointmentIdToDelete} from details modal...`);
      
      const result = await dispatch(deleteAppointmentThunk(appointmentIdToDelete));
      
      if (deleteAppointmentThunk.fulfilled.match(result)) {
        console.log('✅ Appointment deleted successfully from details modal');
        setDeleteSuccess(true);
        setConfirmDeleteLoading(false);
        
        // Mostrar toast de éxito
        toast.success(`Appointment #${appointmentIdToDelete} deleted successfully`);
        
        // Llamar al callback de éxito y cerrar modal principal después de un delay
        setTimeout(() => {
          onDeleteSuccess(appointmentIdToDelete);
          closeDeleteModal();
          onClose(); // Cerrar el modal de detalles también
        }, 1500);
        
      } else {
        // Error en la eliminación
        console.error('❌ Failed to delete appointment from details modal:', result.payload);
        setDeleteError(true);
        setConfirmDeleteLoading(false);
        
        const errorMessage = result.payload?.error || 'Failed to delete appointment';
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error('❌ Unexpected error deleting appointment from details modal:', error);
      setDeleteError(true);
      setConfirmDeleteLoading(false);
      toast.error('Unexpected error occurred while deleting appointment');
    }
  }, [dispatch, appointmentCompleteDetails?.appointment?.id, onDeleteSuccess, closeDeleteModal, onClose]);

  // Función para reintentar eliminación en caso de error
  const handleRetryDelete = useCallback(() => {
    setDeleteError(false);
    setConfirmDeleteLoading(false);
    handleDeleteAppointment();
  }, [handleDeleteAppointment]);

  // Determinar el estado del modal de confirmación
  const deleteModalState = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
      <Transition show={isOpen} appear as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={onClose}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/30" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="relative flex w-full max-w-6xl origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700">
              {/* Header */}
              <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                <DialogTitle
                  as="h3"
                  className="text-base font-medium text-gray-800 dark:text-dark-100"
                >
                  Appointment Details
                  {appointmentCompleteDetails && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500 dark:text-dark-400 font-mono">
                        ID: #{appointmentCompleteDetails.appointment.id}
                      </span>
                      {getStatusBadge(appointmentCompleteDetails.appointment.status)}
                    </div>
                  )}
                </DialogTitle>
                
                <div className="flex items-center gap-2">
                  {appointmentCompleteDetails && (
                    <>
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={handlePrintAppointment}
                      >
                        <PrinterIcon className="size-4 mr-1" />
                        Print
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={onClose}
                    variant="flat"
                    isIcon
                    className="size-7 rounded-full"
                  >
                    <XMarkIcon className="size-4.5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                {loadingCompleteDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-dark-300">Loading details...</span>
                  </div>
                ) : appointmentCompleteDetails ? (
                  <div className="space-y-6">
                    {/* Información del Appointment */}
                    <Section icon={CalendarDaysIcon} title="Appointment Information">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoField
                          label="Installation Date"
                          value={formatDate(appointmentCompleteDetails.appointment.installation_date)}
                          icon={CalendarDaysIcon}
                        />
                        <InfoField
                          label="Installation Time"
                          value={formatTime(appointmentCompleteDetails.appointment.installation_time)}
                          icon={ClockIcon}
                        />
                        <InfoField
                          label="Location"
                          value={
                            appointmentCompleteDetails.appointment.location_type === 'home' ? 'Customer Home' :
                            appointmentCompleteDetails.appointment.location_type === 'shop' ? 'In Shop' :
                            appointmentCompleteDetails.appointment.location_type === 'work' ? 'Work Location' :
                            appointmentCompleteDetails.appointment.location_type === 'other' ? 'Other Location' :
                            appointmentCompleteDetails.appointment.location_type
                          }
                          icon={MapPinIcon}
                        />
                        <InfoField
                          label="Days Until Appointment"
                          value={calculateDaysUntil(appointmentCompleteDetails.appointment.installation_date)}
                        />
                        <InfoField
                          label="Technician"
                          value={appointmentCompleteDetails.appointment.tech_name}
                          icon={UserIcon}
                        />
                        <InfoField
                          label="Service Advisor"
                          value={appointmentCompleteDetails.appointment.service_advisor}
                          icon={UserIcon}
                        />
                        {appointmentCompleteDetails.appointment.edirect && (
                          <InfoField
                            label="E-Direct"
                            value={appointmentCompleteDetails.appointment.edirect}
                          />
                        )}
                        <InfoField
                          label="Created On"
                          value={formatDate(appointmentCompleteDetails.appointment.created_at)}
                        />
                        {appointmentCompleteDetails.appointment.comment && (
                          <div className="md:col-span-2 lg:col-span-3">
                            <InfoField
                              label="Comments"
                              value={appointmentCompleteDetails.appointment.comment}
                              icon={DocumentTextIcon}
                            />
                          </div>
                        )}
                      </div>
                    </Section>

                    {/* Información del Cliente */}
                    <Section icon={UserIcon} title="Customer Information">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoField
                          label="Full Name"
                          value={appointmentCompleteDetails.customer.name}
                          icon={UserIcon}
                        />
                        <InfoField
                          label="Phone"
                          value={appointmentCompleteDetails.customer.phone}
                          icon={PhoneIcon}
                        />
                        {appointmentCompleteDetails.customer.alt_phone && (
                          <InfoField
                            label="Alternative Phone"
                            value={appointmentCompleteDetails.customer.alt_phone}
                            icon={PhoneIcon}
                          />
                        )}
                        {appointmentCompleteDetails.customer.email && (
                          <InfoField
                            label="Email"
                            value={appointmentCompleteDetails.customer.email}
                            icon={EnvelopeIcon}
                          />
                        )}
                        <InfoField
                          label="Street Address"
                          value={appointmentCompleteDetails.customer.address.street}
                          icon={HomeIcon}
                        />
                        <InfoField
                          label="City, State"
                          value={`${appointmentCompleteDetails.customer.address.city}, ${appointmentCompleteDetails.customer.address.state} ${appointmentCompleteDetails.customer.address.zip}`}
                          icon={MapPinIcon}
                        />
                      </div>
                    </Section>

                    {/* Información del Vehículo - Mejorada */}
                    <Section icon={TruckIcon} title="Vehicle Information">
                      {hasValidVehicleInfo(appointmentCompleteDetails.vehicle) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <InfoField
                            label="Vehicle"
                            value={formatVehicleDisplayName(appointmentCompleteDetails.vehicle)}
                            icon={TruckIcon}
                            isVehicleField={true}
                          />
                          <InfoField
                            label="Color"
                            value={formatVehicleValue(appointmentCompleteDetails.vehicle.color)}
                            isVehicleField={true}
                          />
                          <InfoField
                            label="Doors"
                            value={formatVehicleValue(appointmentCompleteDetails.vehicle.doors)}
                            isVehicleField={true}
                          />
                          <InfoField
                            label="VIN"
                            value={formatVehicleValue(appointmentCompleteDetails.vehicle.vin)}
                            icon={IdentificationIcon}
                            isVehicleField={true}
                          />
                          {appointmentCompleteDetails.vehicle.part_number && 
                           appointmentCompleteDetails.vehicle.part_number !== "null" && (
                            <InfoField
                              label="Part Number"
                              value={formatVehicleValue(appointmentCompleteDetails.vehicle.part_number)}
                              isVehicleField={true}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="size-6 text-amber-500 flex-shrink-0 mt-1" />
                            <div>
                              <h4 className="text-base font-medium text-amber-800 dark:text-amber-200 mb-2">
                                Missing Vehicle Information
                              </h4>
                              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                                No vehicle details are available for this appointment. This information may need to be collected.
                              </p>
                              <div className="text-xs text-amber-600 dark:text-amber-400">
                                <p><strong>Available fields:</strong> Year, Make, Model, Color, VIN, Doors, Part Number</p>
                                <p><strong>Status:</strong> All fields are currently empty</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Section>

                    {/* Información de Instalación */}
                    {appointmentCompleteDetails.installation.address && (
                      <Section icon={MapPinIcon} title="Installation Location">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {appointmentCompleteDetails.appointment.location_type === 'shop' ? (
                            <>
                              <InfoField
                                label="Installation Location"
                                value="In Shop"
                                icon={BuildingOfficeIcon}
                              />
                              <InfoField
                                label="Business"
                                value="Rebate Auto Glass Shop"
                                icon={BuildingOfficeIcon}
                              />
                            </>
                          ) : (
                            <>
                              {appointmentCompleteDetails.installation.address.street && (
                                <InfoField
                                  label="Installation Address"
                                  value={appointmentCompleteDetails.installation.address.street}
                                  icon={HomeIcon}
                                />
                              )}
                              {appointmentCompleteDetails.installation.address.city && (
                                <InfoField
                                  label="City, State"
                                  value={`${appointmentCompleteDetails.installation.address.city}, ${appointmentCompleteDetails.installation.address.state} ${appointmentCompleteDetails.installation.address.zip}`}
                                  icon={MapPinIcon}
                                />
                              )}
                              {appointmentCompleteDetails.installation.address.business_name && (
                                <InfoField
                                  label="Business Name"
                                  value={appointmentCompleteDetails.installation.address.business_name}
                                  icon={BuildingOfficeIcon}
                                />
                              )}
                              {appointmentCompleteDetails.installation.address.is_commercial && (
                                <InfoField
                                  label="Location Type"
                                  value={
                                    typeof appointmentCompleteDetails?.installation?.address?.property_type === "string"
                                      ? appointmentCompleteDetails.installation.address.property_type.charAt(0).toUpperCase() +
                                        appointmentCompleteDetails.installation.address.property_type.slice(1).toLowerCase()
                                      : ""
                                  }
                                />
                              )}
                            </>
                          )}
                          {appointmentCompleteDetails.installation.contact_summary && (
                            <div className="md:col-span-2 lg:col-span-3">
                              <InfoField
                                label="Contact Information"
                                value={appointmentCompleteDetails.installation.contact_summary}
                                icon={PhoneIcon}
                              />
                            </div>
                          )}
                        </div>
                      </Section>
                    )}

                    {/* Información de Pago OPTIMIZADA */}
                    <Section icon={CurrencyDollarIcon} title="Payment Information">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoField
                          label="Payment Type"
                          value={
                            appointmentCompleteDetails.payment.type === 'insurance' ? 'Insurance Claim' :
                            appointmentCompleteDetails.payment.type === 'out_of_pocket' ? 'Cash Payment' :
                            appointmentCompleteDetails.payment.type
                          }
                          icon={appointmentCompleteDetails.payment.type === 'insurance' ? ShieldCheckIcon : BanknotesIcon}
                        />

                        {/* Mostrar Total Amount solo para cash payments */}
                        {appointmentCompleteDetails.payment.type === 'out_of_pocket' && (
                          <InfoField
                            label="Total Amount"
                            value={formatCurrency(appointmentCompleteDetails.payment.total_amount)}
                            icon={CurrencyDollarIcon}
                          />
                        )}

                        {/* Información de Seguro */}
                        {appointmentCompleteDetails.payment.insurance && (
                          <>
                            <InfoField
                              label="Insurance Company"
                              value={appointmentCompleteDetails.payment.insurance.company_name}
                              icon={ShieldCheckIcon}
                            />
                            <InfoField
                              label="Policy Number"
                              value={appointmentCompleteDetails.payment.insurance.policy_number}
                            />
                            <InfoField
                              label="Glass Deductible"
                              value={formatCurrency(appointmentCompleteDetails.payment.insurance.glass_deductible)}
                            />
                            {appointmentCompleteDetails.payment.insurance.date_of_loss && (
                              <InfoField
                                label="Date of Loss"
                                value={formatDate(appointmentCompleteDetails.payment.insurance.date_of_loss)}
                              />
                            )}
                            {appointmentCompleteDetails.payment.insurance.safelife && (
                              <InfoField
                                label="Safelife"
                                value={appointmentCompleteDetails.payment.insurance.safelife}
                              />
                            )}
                            {appointmentCompleteDetails.payment.insurance.lynx && (
                              <InfoField
                                label="Lynx"
                                value={appointmentCompleteDetails.payment.insurance.lynx}
                              />
                            )}
                            {appointmentCompleteDetails.payment.insurance.other_info && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <InfoField
                                  label="Additional Insurance Info"
                                  value={appointmentCompleteDetails.payment.insurance.other_info}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* Información de Rebate optimizada - Solo para insurance */}
                        {appointmentCompleteDetails.payment.rebate && (
                          <>
                            <InfoField
                              label="Rebate Total"
                              value={formatCurrency(appointmentCompleteDetails.payment.rebate.total_rebate)}
                              icon={CurrencyDollarIcon}
                            />
                            
                            {/* Mostrar tipo de rebate solo si hay monto positivo */}
                            {appointmentCompleteDetails.payment.rebate.total_rebate > 0 && (
                              <div className="md:col-span-2 lg:col-span-1">
                                <InfoField
                                  label="Rebate Type"
                                  value={getRebateTypeDescription(
                                    appointmentCompleteDetails.payment.rebate.cash_amount,
                                    appointmentCompleteDetails.payment.rebate.check_amount
                                  )}
                                  icon={BanknotesIcon}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* Precio en efectivo - Solo para cash payments */}
                        {appointmentCompleteDetails.payment.cash_price && appointmentCompleteDetails.payment.type === 'out_of_pocket' && (
                          <InfoField
                            label="Cash Price"
                            value={formatCurrency(appointmentCompleteDetails.payment.cash_price)}
                            icon={BanknotesIcon}
                          />
                        )}
                      </div>
                    </Section>

                    {/* Trabajo de Vidrio */}
                    <Section icon={WrenchScrewdriverIcon} title="Glass Work Details">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tipos de Vidrio */}
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
                            <CubeIcon className="size-4" />
                            Glass Types
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(appointmentCompleteDetails.glass_work.types).map(([key, value]) => {
                              if (!value) return null;
                              const labels = {
                                windshield: 'Windshield',
                                front_door: 'Front Door Glass',
                                back_door: 'Back Door Glass',
                                quarter_glass: 'Quarter Glass',
                                vent_glass: 'Vent Glass'
                              };
                              return (
                                <div key={key} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700 dark:text-dark-300">
                                    {labels[key]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Características */}
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
                            <SparklesIcon className="size-4" />
                            Features & Options
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(appointmentCompleteDetails.glass_work.features).map(([key, value]) => {
                              if (!value) return null;
                              const labels = {
                                hud: 'HUD (Heads-Up Display)',
                                heated: 'Heated Glass',
                                antenna: 'Antenna',
                                rain_sensor: 'Rain Sensor',
                                molding_black: 'Black Molding',
                                molding_chrome: 'Chrome Molding',
                                tint: 'Tinted Glass',
                                tint_strip: 'Tint Strip',
                                ldws: 'LDWS (Lane Departure Warning)',
                                vin_etch: 'VIN Etching',
                                green_blue: 'Green/Blue Tint',
                                gray: 'Gray Tint',
                                bronze: 'Bronze Tint'
                              };
                              return (
                                <div key={key} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700 dark:text-dark-300">
                                    {labels[key]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Resúmenes */}
                      {(appointmentCompleteDetails.glass_work.summary.types || appointmentCompleteDetails.glass_work.summary.features) && (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                            Work Summary
                          </h4>
                          {appointmentCompleteDetails.glass_work.summary.types && (
                            <p className="text-sm text-gray-600 dark:text-dark-300 mb-1">
                              <span className="font-medium">Types:</span> {appointmentCompleteDetails.glass_work.summary.types}
                            </p>
                          )}
                          {appointmentCompleteDetails.glass_work.summary.features && (
                            <p className="text-sm text-gray-600 dark:text-dark-300">
                              <span className="font-medium">Features:</span> {appointmentCompleteDetails.glass_work.summary.features}
                            </p>
                          )}
                        </div>
                      )}
                    </Section>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-gray-500 dark:text-dark-400 mb-2">
                        Unable to load appointment details
                      </p>
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => dispatch(getAppointmentCompleteDetailsThunk(appointmentId))}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer con botones */}
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-dark-600 rounded-b-lg bg-gray-50 dark:bg-dark-800">
                <Button 
                  type="button" 
                  onClick={onClose}
                  variant="outlined"
                  disabled={confirmDeleteLoading}
                >
                  Close
                </Button>
                {appointmentCompleteDetails && (
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={openDeleteModal}
                    disabled={confirmDeleteLoading}
                    className="flex items-center gap-2"
                  >
                    <TrashIcon className={`size-4 ${confirmDeleteLoading ? 'animate-pulse' : ''}`} />
                    Delete Appointment
                  </Button>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

      {/* Modal de impresión */}
      <PrintModal
        isOpen={isModalOpen}
        onClose={closePrintModal}
        appointmentData={appointmentData}
      />

      {/* Modal de confirmación para eliminación */}
      <ConfirmModal
        show={deleteModalOpen}
        onClose={closeDeleteModal}
        messages={deleteConfirmMessages}
        onOk={deleteModalState === "error" ? handleRetryDelete : handleDeleteAppointment}
        confirmLoading={confirmDeleteLoading}
        state={deleteModalState}
      />
    </>
  );
};

AppointmentDetailsModal.propTypes = {
  appointmentId: PropTypes.number,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func
};

AppointmentDetailsModal.defaultProps = {
  onDeleteSuccess: () => {}
};

export default AppointmentDetailsModal;