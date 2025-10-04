// AppointmentCard.jsx - Updated with ConfirmModal for delete functionality
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { DateTime } from "luxon";
import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  UserIcon,
  TruckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  EyeIcon,
  // PencilIcon,
  TrashIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  HomeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/outline";

// Local imports
import { Card, Button } from "components/ui";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { deleteAppointmentThunk } from "slices/thunk";

// ----------------------------------------------------------------------

// Mensajes personalizados para el ConfirmModal de eliminación
const deleteConfirmMessages = {
  pending: {
    title: "Delete Appointment?",
    description: "Are you sure you want to delete this appointment? This action cannot be undone and will remove all related data including glass work details and payment information.",
    actionText: "Delete Appointment",
  },
  success: {
    title: "Appointment Deleted",
    description: "The appointment and all related data have been successfully removed from the system.",
    actionText: "Done",
  },
  error: {
    title: "Delete Failed",
    description: "Unable to delete the appointment. Please check your connection and try again. If the problem persists, contact support.",
    actionText: "Retry",
  },
};

// Función para obtener el color del estado
const getStatusColor = (status) => {
  switch (status) {
    case 'today':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'scheduled':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'completed':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

// Función para obtener el ícono del estado
const getStatusIcon = (status) => {
  switch (status) {
    case 'today':
      return <ExclamationTriangleIcon className="size-3" />;
    case 'scheduled':
      return <CalendarDaysIcon className="size-3" />;
    case 'completed':
      return <CheckCircleIcon className="size-3" />;
    default:
      return null;
  }
};

// Función para obtener el color del tipo de pago
const getPaymentTypeColor = (paymentType) => {
  switch (paymentType) {
    case 'insurance':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'out_of_pocket':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

// Función para obtener el ícono del tipo de ubicación
const getLocationIcon = (locationType) => {
  switch (locationType) {
    case 'home':
      return <HomeIcon className="size-4 flex-shrink-0" />;
    case 'shop':
      return <BuildingOfficeIcon className="size-4 flex-shrink-0" />;
    case 'work':
    case 'other':
      return <MapPinIcon className="size-4 flex-shrink-0" />;
    default:
      return <MapPinIcon className="size-4 flex-shrink-0" />;
  }
};

// Función para formatear la fecha usando Luxon
const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  
  const luxonDate = DateTime.fromISO(dateString);
  if (!luxonDate.isValid) {
    console.warn('Invalid date provided to formatDate:', dateString);
    return 'Invalid date';
  }
  
  return luxonDate.toLocaleString({
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Función para formatear el tiempo
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

// Función para formatear el dinero
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Función para formatear el teléfono
const formatPhoneNumber = (phone) => {
  if (!phone) return 'No phone';
  // Si el teléfono es muy largo, mostrar solo los últimos 10 dígitos formateados
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length >= 10) {
    const last10 = cleaned.slice(-10);
    return `(${last10.slice(0, 3)}) ${last10.slice(3, 6)}-${last10.slice(6)}`;
  }
  return phone;
};

// Función para truncar texto de forma segura
const truncateText = (text, maxLength = 25) => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Función para calcular días hasta la cita usando Luxon
const calculateDaysUntil = (dateString) => {
  if (!dateString) return null;
  
  const appointmentDate = DateTime.fromISO(dateString);
  const today = DateTime.now().startOf('day');
  
  if (!appointmentDate.isValid) {
    return null;
  }
  
  const appointmentDay = appointmentDate.startOf('day');
  const diffInDays = appointmentDay.diff(today, 'days').days;
  
  return Math.round(diffInDays);
};

// ============= FUNCIONES MEJORADAS PARA VEHÍCULO =============

// Función mejorada para formatear la información del vehículo
const formatVehicleInfo = (appointment) => {
  // Si tiene un display_name válido (no null y no "null null null")
  if (appointment.vehicle_display_name && 
      appointment.vehicle_display_name !== "null null null" &&
      appointment.vehicle_display_name.trim() !== "") {
    return appointment.vehicle_display_name;
  }

  // Construir información del vehículo de forma segura
  const year = appointment.vehicle_year && appointment.vehicle_year !== "null" ? appointment.vehicle_year : null;
  const make = appointment.vehicle_make && appointment.vehicle_make !== "null" ? appointment.vehicle_make : null;
  const model = appointment.vehicle_model && appointment.vehicle_model !== "null" ? appointment.vehicle_model : null;
  
  // Filtrar solo los valores válidos
  const vehicleParts = [year, make, model].filter(part => part);
  
  // Si tenemos al menos una parte válida
  if (vehicleParts.length > 0) {
    return vehicleParts.join(' ');
  }
  
  // Si no hay información válida del vehículo
  return "Missing Vehicle Information";
};

// Función para formatear el color del vehículo
const formatVehicleColor = (color) => {
  if (!color || color === "null" || color.trim() === "") {
    return "Color not specified";
  }
  return color;
};

// Función para formatear el VIN
const formatVehicleVin = (vin) => {
  if (!vin || vin === "null" || vin.trim() === "") {
    return null; // No mostrar VIN si no está disponible
  }
  return vin;
};

// Función para verificar si hay información válida del vehículo
const hasValidVehicleInfo = (appointment) => {
  const year = appointment.vehicle_year && appointment.vehicle_year !== "null";
  const make = appointment.vehicle_make && appointment.vehicle_make !== "null";
  const model = appointment.vehicle_model && appointment.vehicle_model !== "null";
  const color = appointment.vehicle_color && appointment.vehicle_color !== "null";
  const vin = appointment.vehicle_vin && appointment.vehicle_vin !== "null";
  
  return year || make || model || color || vin;
};

// =============================================================

const AppointmentCard = ({ 
  appointment, 
  onView, 
  // onEdit, 
  isDeleting = false,
  onDeleteSuccess = () => {} // Callback para cuando se elimina exitosamente
}) => {
  const dispatch = useDispatch();
  
  // Estados para el modal de confirmación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  // Función para cerrar el modal
  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteError(false);
    setDeleteSuccess(false);
    setConfirmDeleteLoading(false);
  }, []);

  // Función para abrir el modal de confirmación
  const openDeleteModal = useCallback(() => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  }, []);

  // Función para manejar la eliminación del appointment
  const handleDeleteAppointment = useCallback(async () => {
    try {
      setConfirmDeleteLoading(true);
      setDeleteError(false);

      console.log(`🗑️ Deleting appointment ${appointment.appointment_id}...`);
      
      const result = await dispatch(deleteAppointmentThunk(appointment.appointment_id));
      
      if (deleteAppointmentThunk.fulfilled.match(result)) {
        console.log('✅ Appointment deleted successfully');
        setDeleteSuccess(true);
        setConfirmDeleteLoading(false);
        
        // Mostrar toast de éxito
        toast.success(`Appointment #${appointment.appointment_id} deleted successfully`);
        
        // Llamar al callback de éxito después de un delay
        setTimeout(() => {
          onDeleteSuccess(appointment.appointment_id);
          closeDeleteModal();
        }, 1500);
        
      } else {
        // Error en la eliminación
        console.error('❌ Failed to delete appointment:', result.payload);
        setDeleteError(true);
        setConfirmDeleteLoading(false);
        
        const errorMessage = result.payload?.error || 'Failed to delete appointment';
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error('❌ Unexpected error deleting appointment:', error);
      setDeleteError(true);
      setConfirmDeleteLoading(false);
      toast.error('Unexpected error occurred while deleting appointment');
    }
  }, [dispatch, appointment.appointment_id, onDeleteSuccess, closeDeleteModal]);

  // Función para reintentar eliminación en caso de error
  const handleRetryDelete = useCallback(() => {
    setDeleteError(false);
    setConfirmDeleteLoading(false);
    handleDeleteAppointment();
  }, [handleDeleteAppointment]);

  // Función para obtener el texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case 'today':
        return 'Today';
      case 'scheduled':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  // Función para obtener el texto del tipo de pago
  const getPaymentTypeText = (paymentType) => {
    switch (paymentType) {
      case 'insurance':
        return 'Insurance';
      case 'out_of_pocket':
        return 'Cash';
      default:
        return paymentType;
    }
  };

  // Función para obtener el texto de la ubicación
  const getLocationText = (locationType) => {
    switch (locationType) {
      case 'home':
        return 'Customer Home';
      case 'shop':
        return 'In Shop';
      case 'work':
        return 'Work Location';
      case 'other':
        return 'Other Location';
      default:
        return locationType;
    }
  };

  // Calcular días hasta la cita
  const daysUntil = calculateDaysUntil(appointment.installation_date);

  // Determinar el monto total correcto según el tipo de pago
  const getTotalAmount = () => {
    if (appointment.replacement_type === 'insurance') {
      // Para seguro: rebate cash + rebate check
      const rebateCash = appointment.rebate_cash_amount || 0;
      const rebateCheck = appointment.rebate_check_amount || 0;
      return parseFloat(rebateCash) + parseFloat(rebateCheck);
    } else {
      // Para cash: precio en efectivo
      return parseFloat(appointment.cash_price) || parseFloat(appointment.total_amount) || 0; 
    }
  };

  // Obtener información de la dirección de instalación
  const getInstallationAddress = () => {
    if (appointment.location_type === 'shop') {
      return {
        primary: 'In Shop',
        secondary: 'Rebate Auto Glass'
      };
    } else if (appointment.installation_business_name) {
      return {
        primary: appointment.installation_business_name,
        secondary: `${appointment.installation_city}, ${appointment.installation_state}`
      };
    } else {
      return {
        primary: 'Customer Home',
        secondary: `${appointment.installation_city}, ${appointment.installation_state}`
      };
    }
  };

  const installationInfo = getInstallationAddress();
  const totalAmount = getTotalAmount();

  // Determinar el estado del modal de confirmación
  const deleteModalState = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Card className="relative p-4 h-full flex flex-col hover:shadow-lg transition-all duration-200 min-h-[400px]">
          {/* Header con estado y fecha */}
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.appointment_status)}`}>
                  {getStatusIcon(appointment.appointment_status)}
                  <span className="ml-1">{getStatusText(appointment.appointment_status)}</span>
                </span>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentTypeColor(appointment.replacement_type)}`}>
                  {appointment.replacement_type === 'insurance' ? (
                    <ShieldCheckIcon className="size-3 mr-1" />
                  ) : (
                    <BanknotesIcon className="size-3 mr-1" />
                  )}
                  {getPaymentTypeText(appointment.replacement_type)}
                </span>
              </div>
            </div>

            {/* ID del appointment */}
            <span className="text-xs text-gray-500 dark:text-dark-400 font-mono flex-shrink-0">
              #{appointment.appointment_id}
            </span>
          </div>

          {/* Información principal */}
          <div className="flex-1 space-y-3">
            {/* Cliente */}
            <div className="flex items-start gap-3">
              <UserIcon className="size-4 text-gray-400 dark:text-dark-400 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white truncate" title={appointment.customer_name}>
                  {truncateText(appointment.customer_name, 22)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <PhoneIcon className="size-3 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-dark-300" title={appointment.customer_phone}>
                    {formatPhoneNumber(appointment.customer_phone)}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehículo - Versión mejorada con manejo de nulls */}
            <div className="flex items-start gap-3">
              {hasValidVehicleInfo(appointment) ? (
                <TruckIcon className="size-4 text-gray-400 dark:text-dark-400 mt-1 flex-shrink-0" />
              ) : (
                <div className="size-4 mt-1 flex-shrink-0 flex items-center justify-center">
                  <ExclamationTriangleIcon className="size-4 text-amber-400" />
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                {hasValidVehicleInfo(appointment) ? (
                  <>
                    <p className="font-medium text-gray-900 dark:text-white truncate" 
                       title={formatVehicleInfo(appointment)}>
                      {truncateText(formatVehicleInfo(appointment), 22)}
                    </p>
                    
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-dark-300">
                      {appointment.vehicle_color && appointment.vehicle_color !== "null" && (
                        <span>{truncateText(formatVehicleColor(appointment.vehicle_color), 12)}</span>
                      )}
                      
                      {formatVehicleVin(appointment.vehicle_vin) && (
                        <>
                          {appointment.vehicle_color && appointment.vehicle_color !== "null" && (
                            <span className="text-gray-400">•</span>
                          )}
                          <span className="font-mono">
                            ...{formatVehicleVin(appointment.vehicle_vin).slice(-4)}
                          </span>
                        </>
                      )}
                      
                      {(!appointment.vehicle_color || appointment.vehicle_color === "null") && 
                       !formatVehicleVin(appointment.vehicle_vin) && (
                        <span className="text-gray-400 text-xs italic">
                          Additional details missing
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-amber-600 dark:text-amber-400">
                      Missing Vehicle Information
                    </p>
                    <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                      No vehicle details available
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Fecha y hora */}
            <div className="flex items-start gap-3">
              <CalendarDaysIcon className="size-4 text-gray-400 dark:text-dark-400 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(appointment.installation_date)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ClockIcon className="size-3 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-dark-300">
                    {formatTime(appointment.installation_time)}
                  </p>
                </div>
              </div>
            </div>

            {/* Ubicación de instalación */}
            <div className="flex items-start gap-3">
              {getLocationIcon(appointment.location_type)}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {getLocationText(appointment.location_type)}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-300 truncate" 
                   title={installationInfo.primary}>
                  {truncateText(installationInfo.primary, 25)}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-300 truncate">
                  {installationInfo.secondary}
                </p>
              </div>
            </div>

            {/* Tipos de vidrio */}
            {appointment.glass_types_summary && (
              <div className="bg-gray-50 dark:bg-dark-700/50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-1 flex items-center gap-1">
                  <WrenchScrewdriverIcon className="size-3" />
                  Glass Work
                </p>
                <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed">
                  {truncateText(appointment.glass_types_summary, 50)}
                </p>
                {appointment.glass_features_summary && (
                  <p className="text-xs text-gray-500 dark:text-dark-400 mt-1 leading-relaxed">
                    Features: {truncateText(appointment.glass_features_summary, 40)}
                  </p>
                )}
              </div>
            )}

            {/* Información de pago */}
            <div className="flex items-center gap-3">
              <CurrencyDollarIcon className="size-4 text-gray-400 dark:text-dark-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(totalAmount)}
                </p>
                {appointment.replacement_type === 'insurance' && appointment.insurance_company_name && (
                  <p className="text-sm text-gray-600 dark:text-dark-300 truncate" 
                     title={appointment.insurance_company_name}>
                    {truncateText(appointment.insurance_company_name, 20)}
                  </p>
                )}
                {appointment.replacement_type === 'insurance' && appointment.has_rebate && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {appointment.rebate_cash_amount > 0 && `Cash: ${formatCurrency(appointment.rebate_cash_amount)}`}
                    {appointment.rebate_cash_amount > 0 && appointment.rebate_check_amount > 0 && ' • '}
                    {appointment.rebate_check_amount > 0 && `Check: ${formatCurrency(appointment.rebate_check_amount)}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Días hasta la cita */}
          {daysUntil !== null && appointment.appointment_status === 'scheduled' && (
            <div className="text-center py-2 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                {daysUntil === 0 && 'Today'}
                {daysUntil === 1 && 'Tomorrow'}
                {daysUntil > 1 && `In ${daysUntil} days`}
                {daysUntil < 0 && `${Math.abs(daysUntil)} days ago`}
              </span>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
            <Button
              size="sm"
              variant="outlined"
              onClick={onView}
              className="flex-1 min-w-0"
              disabled={isDeleting || confirmDeleteLoading}
            >
              <EyeIcon className="size-4 mr-1 flex-shrink-0" />
              <span className="truncate">View</span>
            </Button>
            
            {/* <Button
              size="sm"
              variant="outlined"
              onClick={onEdit}
              className="flex-1 min-w-0"
              disabled={isDeleting || confirmDeleteLoading}
            >
              <PencilIcon className="size-4 mr-1 flex-shrink-0" />
              <span className="truncate">Edit</span>
            </Button> */}
            
            <Button
              size="sm"
              variant="outlined"
              color="error"
              onClick={openDeleteModal}
              disabled={isDeleting || confirmDeleteLoading}
              className="p-2 flex-shrink-0"
              title="Delete appointment"
            >
              <TrashIcon className={`size-4 ${confirmDeleteLoading ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
        </Card>
      </motion.div>

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

AppointmentCard.propTypes = {
  appointment: PropTypes.shape({
    appointment_id: PropTypes.number.isRequired,
    customer_name: PropTypes.string.isRequired,
    customer_phone: PropTypes.string,
    vehicle_year: PropTypes.string,
    vehicle_make: PropTypes.string,
    vehicle_model: PropTypes.string,
    vehicle_color: PropTypes.string,
    vehicle_vin: PropTypes.string,
    vehicle_display_name: PropTypes.string,
    installation_date: PropTypes.string.isRequired,
    installation_time: PropTypes.string.isRequired,
    location_type: PropTypes.string.isRequired,
    replacement_type: PropTypes.string.isRequired,
    appointment_status: PropTypes.string.isRequired,
    days_until_appointment: PropTypes.number,
    installation_city: PropTypes.string,
    installation_state: PropTypes.string,
    installation_business_name: PropTypes.string,
    glass_types_summary: PropTypes.string,
    glass_features_summary: PropTypes.string,
    total_amount: PropTypes.number,
    cash_price: PropTypes.number,
    rebate_cash_amount: PropTypes.number,
    rebate_check_amount: PropTypes.number,
    has_rebate: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    insurance_company_name: PropTypes.string
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  isDeleting: PropTypes.bool,
  onDeleteSuccess: PropTypes.func
};

AppointmentCard.defaultProps = {
  isDeleting: false,
  onDeleteSuccess: () => {}
};

export default AppointmentCard;