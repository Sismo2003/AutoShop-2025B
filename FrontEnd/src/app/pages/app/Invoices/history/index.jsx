// Import Dependencies
import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router"; // Import React Router Link
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDaysIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

// Redux imports
import { 
  getAppointmentsCompleteViewThunk
} from "slices/thunk";
import { 
  setAppointmentsFilters,
  clearAppointmentsFilters,
  clearErrors
} from "slices/appointment/reducer";

// Local imports
import { Page } from "components/shared/Page";
import { Button, Input, Card } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";

// Componentes locales
import AppointmentCard from "./components/AppointmentCard";
import AppointmentFilters from "./components/AppointmentFilters";
import AppointmentStats from "./components/AppointmentStats";
import AppointmentDetailsModal from "./components/AppointmentDetailsModal";
import { AppointmentsPagination } from "./components/AppointmentsPagination";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";

// ----------------------------------------------------------------------

// Opciones para filtros principales
const STATUS_OPTIONS = [
  { id: 'all', label: 'All Appointments' },
  { id: 'today', label: 'Today Only' },
  { id: 'scheduled', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' }
];

const PAYMENT_TYPE_OPTIONS = [
  { id: 'all', label: 'All Payment Types' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'cash', label: 'Cash Payment' }
];

const LOCATION_TYPE_OPTIONS = [
  { id: 'all', label: 'All Locations' },
  { id: 'home', label: 'Customer Home' },
  { id: 'shop', label: 'In Shop' },
  { id: 'other', label: 'Other Location' }
];

// Animaciones mejoradas para mejor feedback visual
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2 }
  }
};

// Variantes para la sección de filtros avanzados con scroll suave
const filtersVariants = {
  collapsed: { 
    height: 0,
    opacity: 0,
    marginBottom: 0,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  expanded: { 
    height: "auto",
    opacity: 1,
    marginBottom: 24,
    transition: { 
      duration: 0.4,
      ease: "easeInOut",
      opacity: { delay: 0.1 }
    }
  }
};

// Custom Button component that works with React Router Link
const ButtonAsLink = ({ 
  to, 
  children, 
  color = "primary", 
  variant = "solid",
  size = "md",
  disabled = false,
  className = "",
  ...props 
}) => {
  // Base button classes following the same structure as your Button component
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm", 
    lg: "px-6 py-3 text-base"
  };

  // Color and variant classes
  const colorVariantClasses = {
    primary: {
      solid: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm disabled:bg-primary-300",
      outlined: "border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 disabled:border-primary-300 disabled:text-primary-300"
    },
    neutral: {
      solid: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm disabled:bg-gray-300",
      outlined: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 disabled:border-gray-200 disabled:text-gray-400"
    }
  };

  // Disabled classes
  const disabledClasses = disabled 
    ? "cursor-not-allowed opacity-50" 
    : "cursor-pointer";

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${colorVariantClasses[color][variant]}
    ${disabledClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (disabled) {
    return (
      <span className={buttonClasses} {...props}>
        {children}
      </span>
    );
  }

  return (
    <Link 
      to={to} 
      className={buttonClasses}
      {...props}
    >
      {children}
    </Link>
  );
};

const AppointmentsList = () => {
  // Redux state
  const dispatch = useDispatch();
  const {
    appointmentsCompleteView,
    appointmentsPagination,
    appointmentsStats,
    appointmentsFilters,
    loadingCompleteView,
    error,
    error_message
  } = useSelector((state) => state.appointments);

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(appointmentsFilters.search || '');

  // Refs para mejor UX y scroll behavior
  const filtersRef = useRef();
  const searchTimeoutRef = useRef(null);
  const lastFiltersRef = useRef(null);
  const filtersContainerRef = useRef(null); // Para hacer scroll suave
  
  // Actualizar ref cuando cambien los filtros
  filtersRef.current = appointmentsFilters;

  // Función estable para cargar appointments
  const loadAppointments = useCallback((showLoading = true, forceReload = false) => {
    const currentFilters = filtersRef.current;
    
    // Evitar cargas duplicadas
    const filtersString = JSON.stringify(currentFilters);
    if (!forceReload && lastFiltersRef.current === filtersString) {
      console.log('🚫 Skipping duplicate load with same filters');
      return;
    }
    
    lastFiltersRef.current = filtersString;
    
    // Validar filtros básicos antes de enviar
    const cleanFilters = {
      ...currentFilters,
      showLoading,
      // Asegurar que las fechas estén en formato correcto
      date_from: currentFilters.date_from || '',
      date_to: currentFilters.date_to || '',
      // Limpiar búsqueda de espacios extra
      search: (currentFilters.search || '').trim()
    };

    console.log('🔍 Loading appointments with filters:', cleanFilters);
    dispatch(getAppointmentsCompleteViewThunk(cleanFilters));
  }, [dispatch]);

  // Cargar appointments al montar el componente
  useEffect(() => {
    console.log('🚀 Component mounted, loading initial appointments');
    loadAppointments(true, true); // Force initial load
    
    return () => {
      dispatch(clearErrors());
      // Limpiar timeout al desmontar
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [dispatch]); // Solo al montar

  // Efecto separado para recargar cuando cambien filtros específicos
  useEffect(() => {
    // No ejecutar en el primer render
    if (lastFiltersRef.current === null) {
      return;
    }

    console.log('🔄 Filters changed, scheduling reload...');
    
    const timeoutId = setTimeout(() => {
      loadAppointments(false); // No mostrar loading en cambios automáticos
    }, 300); // Debounce para evitar requests múltiples

    return () => clearTimeout(timeoutId);
  }, [
    appointmentsFilters.search,
    appointmentsFilters.status, 
    appointmentsFilters.payment_type,
    appointmentsFilters.location_type,
    appointmentsFilters.date_from,
    appointmentsFilters.date_to,
    appointmentsFilters.page,
    appointmentsFilters.sort_by,
    appointmentsFilters.sort_order,
    loadAppointments
  ]);

  // Manejar errores
  useEffect(() => {
    if (error && error_message) {
      toast.error(error_message, {
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: () => loadAppointments(true, true)
        }
      });
      dispatch(clearErrors());
    }
  }, [error, error_message, dispatch, loadAppointments]);

  // Manejar búsqueda con debounce mejorado
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Crear nuevo timeout
    searchTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Search term changed:', value);
      dispatch(setAppointmentsFilters({ 
        ...filtersRef.current,
        search: value.trim(),
        page: 1 // Resetear página al buscar
      }));
    }, 500);
  }, [dispatch]);

  // Manejar cambio de filtros de forma estable
  const handleFilterChange = useCallback((filterName, value) => {
    const newFilters = {
      ...filtersRef.current,
      [filterName]: value,
      page: 1 // Resetear página al cambiar filtros
    };

    console.log(`🔧 Filter changed: ${filterName} = ${value}`);
    dispatch(setAppointmentsFilters(newFilters));
  }, [dispatch]);

  // Manejar cambio de página
  const handlePageChange = useCallback((page) => {
    console.log('📄 Page changed to:', page);
    dispatch(setAppointmentsFilters({ 
      ...filtersRef.current,
      page
    }));
  }, [dispatch]);

  // Manejar eliminación exitosa de appointment
  const handleDeleteSuccess = useCallback((appointmentId) => {
    console.log(`✅ Appointment ${appointmentId} deleted successfully, reloading list...`);
    // Recargar con forzado para actualizar la lista
    loadAppointments(false, true);
  }, [loadAppointments]);

  // Limpiar filtros de forma estable
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    dispatch(clearAppointmentsFilters());
    toast.success('All filters cleared');
  }, [dispatch]);

  // Forzar recarga
  const handleForceRefresh = useCallback(() => {
    console.log('🔄 Force refresh requested');
    loadAppointments(true, true);
  }, [loadAppointments]);

  // Exportar appointments
  const handleExportAppointments = useCallback(() => {
    try {
      const exportParams = new URLSearchParams({
        ...filtersRef.current,
        format: 'csv'
      });
      
      window.open(`/api/appointments/export/csv?${exportParams.toString()}`, '_blank');
      toast.success('Export started. Check your downloads.');
    } catch (error) {
      console.error('Error starting export:', error);
      toast.error('Error starting export. Please try again.');
    }
  }, []);

  // Manejar toggle de filtros avanzados con scroll suave
  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => {
      const newState = !prev;
      
      // Si estamos abriendo los filtros, hacer scroll suave después de la animación
      if (newState && filtersContainerRef.current) {
        setTimeout(() => {
          filtersContainerRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }, 150); // Delay para permitir que la animación inicie
      }
      
      // Feedback táctil para mejor UX
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      return newState;
    });
  }, []);

  // Cerrar filtros avanzados
  const handleCloseFilters = useCallback(() => {
    setShowFilters(false);
  }, []);

  // Verificar si hay filtros activos
  const hasActiveFilters = appointmentsFilters.search || 
    appointmentsFilters.status !== 'all' ||
    appointmentsFilters.payment_type !== 'all' ||
    appointmentsFilters.location_type !== 'all' ||
    appointmentsFilters.date_from ||
    appointmentsFilters.date_to;

  // Contar filtros activos (incluyendo filtros avanzados)
  const activeFiltersCount = [
    appointmentsFilters.search,
    appointmentsFilters.status !== 'all' ? 1 : 0,
    appointmentsFilters.payment_type !== 'all' ? 1 : 0,
    appointmentsFilters.location_type !== 'all' ? 1 : 0,
    appointmentsFilters.date_from,
    appointmentsFilters.date_to,
    appointmentsFilters.sort_by !== 'installation_date' ? 1 : 0,
    appointmentsFilters.sort_order !== 'desc' ? 1 : 0
  ].filter(Boolean).length;

  return (
    <Page title="Appointments">
      <div className="transition-content px-4 sm:px-6 lg:px-8 pb-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col space-y-4 py-5 lg:py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarDaysIcon className="size-6 text-primary-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-medium text-gray-700 dark:text-dark-50">
                  Appointments Management
                </h2>
                <p className="text-sm text-gray-500 dark:text-dark-300">
                  Manage and track glass repair appointments
                  {appointmentsCompleteView.length > 0 && (
                    <span className="ml-2">
                      • {appointmentsCompleteView.length} appointment{appointmentsCompleteView.length !== 1 ? 's' : ''} shown
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">              
              <Button
                variant="outlined"
                onClick={handleExportAppointments}
                disabled={loadingCompleteView || appointmentsCompleteView.length === 0}
              >
                <DocumentArrowDownIcon className="size-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleForceRefresh}
                disabled={loadingCompleteView}
              >
                <ArrowPathIcon className={`size-4 mr-2 ${loadingCompleteView ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              {/* CHANGE: Using custom ButtonAsLink component instead of Button with href */}
              <ButtonAsLink
                to="/app/invoice/create"
                color="primary"
                disabled={loadingCompleteView}
              >
                <PlusIcon className="size-4 mr-2" />
                New
              </ButtonAsLink>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas rápidas */}
        {appointmentsStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <AppointmentStats stats={appointmentsStats} />
          </motion.div>
        )}

        {/* SECCIÓN DE FILTROS MEJORADA - Todo en un solo contenedor */}
        <motion.div
          ref={filtersContainerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-4 border-l-4 border-l-primary-500">
            <div className="space-y-4">
              {/* Header de filtros con indicador visual mejorado */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FunnelIcon className="size-5 text-primary-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Filters & Search
                    </h3>
                    {activeFiltersCount > 0 && (
                      <p className="text-sm text-gray-500 dark:text-dark-400">
                        {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                        {appointmentsPagination?.total_items !== undefined && (
                          <span className="ml-2">
                            • {appointmentsPagination.total_items} result{appointmentsPagination.total_items !== 1 ? 's' : ''} found
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botón de filtros avanzados con indicador visual mejorado */}
                <Button
                  variant="outlined"
                  onClick={handleToggleFilters}
                  className={`relative transition-all duration-200 ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/20 dark:border-primary-600 dark:text-primary-400' : ''}`}
                  disabled={loadingCompleteView}
                >
                  {showFilters ? (
                    <ChevronUpIcon className="size-4 mr-2" />
                  ) : (
                    <ChevronDownIcon className="size-4 mr-2" />
                  )}
                  Advanced Filters
                  {/* Indicador de filtros avanzados activos */}
                  {(appointmentsFilters.date_from || appointmentsFilters.date_to || 
                    appointmentsFilters.sort_by !== 'installation_date' || 
                    appointmentsFilters.sort_order !== 'desc') && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
              </div>

              {/* Búsqueda principal */}
              <div>
                <Input
                  placeholder="Search by customer name, phone, VIN, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<MagnifyingGlassIcon className="size-5" />}
                  className="w-full"
                  // disabled={loadingCompleteView}
                />
              </div>

              {/* Filtros rápidos principales */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-1 gap-3">
                <Listbox
                  data={STATUS_OPTIONS}
                  value={STATUS_OPTIONS.find(opt => opt.id === appointmentsFilters.status)}
                  onChange={(val) => handleFilterChange('status', val?.id)}
                  displayField="label"
                  placeholder="All Status"
                  className="min-w-0"
                  disabled={loadingCompleteView}
                />

                <Listbox
                  data={PAYMENT_TYPE_OPTIONS}
                  value={PAYMENT_TYPE_OPTIONS.find(opt => opt.id === appointmentsFilters.payment_type)}
                  onChange={(val) => handleFilterChange('payment_type', val?.id)}
                  displayField="label"
                  placeholder="All Payment Types"
                  className="min-w-0"
                  disabled={loadingCompleteView}
                />

                <Listbox
                  data={LOCATION_TYPE_OPTIONS}
                  value={LOCATION_TYPE_OPTIONS.find(opt => opt.id === appointmentsFilters.location_type)}
                  onChange={(val) => handleFilterChange('location_type', val?.id)}
                  displayField="label"
                  placeholder="All Locations"
                  className="min-w-0"
                  disabled={loadingCompleteView}
                />
              </div>

              {/* Botón para limpiar filtros básicos */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-300">
                  <InformationCircleIcon className="size-4 flex-shrink-0" />
                  <span>
                    Filters are applied automatically as you type and select options
                  </span>
                </div>
                
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  size="sm"
                  disabled={loadingCompleteView || !hasActiveFilters}
                  className="whitespace-nowrap"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>

            {/* Filtros avanzados expandibles con animación suave */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  variants={filtersVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="overflow-hidden"
                >
                  <div className="pt-6 border-t border-gray-200 dark:border-dark-600">
                    <AppointmentFilters 
                      filters={appointmentsFilters}
                      onFilterChange={handleFilterChange}
                      onClose={handleCloseFilters}
                      isLoading={loadingCompleteView}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Lista de appointments */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loadingCompleteView ? (
            <LoadingState />
          ) : appointmentsCompleteView.length === 0 ? (
            <EmptyState 
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          ) : (
            <>
              {/* Grid de appointments */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6 mb-6">
                <AnimatePresence mode="popLayout">
                  {appointmentsCompleteView.map((appointment) => (
                    <motion.div
                      key={appointment.appointment_id}
                      variants={itemVariants}
                      layout
                    >
                      <AppointmentCard
                        appointment={appointment}
                        onView={() => setSelectedAppointmentId(appointment.appointment_id)}
                        onDeleteSuccess={handleDeleteSuccess}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Paginación */}
              {appointmentsPagination && appointmentsPagination.total_pages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <AppointmentsPagination
                    pagination={appointmentsPagination}
                    onPageChange={handlePageChange}
                  />
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Modal de detalles */}
        <AppointmentDetailsModal
          appointmentId={selectedAppointmentId}
          isOpen={!!selectedAppointmentId}
          onClose={() => setSelectedAppointmentId(null)}
        />
      </div>
    </Page>
  );
};

export default AppointmentsList;