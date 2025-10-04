// Import Dependencies
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { DateTime } from "luxon";
import {
  CalendarDaysIcon,
  FunnelIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// Local imports
import { Button } from "components/ui";
import { DatePicker } from "components/shared/form/Datepicker";

// ----------------------------------------------------------------------

// Opciones para ordenamiento
const SORT_OPTIONS = [
  { id: 'installation_date', label: 'Installation Date' },
  { id: 'appointment_created_at', label: 'Creation Date' },
  { id: 'customer_name', label: 'Customer Name' },
  { id: 'vehicle_make', label: 'Vehicle Make' },
  { id: 'total_amount', label: 'Amount' }
];

const SORT_ORDER_OPTIONS = [
  { id: 'desc', label: 'Newest First' },
  { id: 'asc', label: 'Oldest First' }
];

// Función para formatear fecha a string YYYY-MM-DD usando Luxon
const formatDateToString = (date) => {
  if (!date) return "";
  
  // Si ya es un string válido, devolverlo
  if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date;
  }
  
  let luxonDate;
  
  // Convertir a DateTime de Luxon
  if (date instanceof Date) {
    luxonDate = DateTime.fromJSDate(date);
  } else if (typeof date === "string") {
    luxonDate = DateTime.fromISO(date);
  } else {
    return "";
  }
  
  // Verificar que la fecha sea válida
  if (!luxonDate.isValid) {
    console.warn('Invalid date provided to formatDateToString:', date);
    return "";
  }
  
  return luxonDate.toISODate(); // Formato YYYY-MM-DD
};

// Función para parsear string a Date object usando Luxon
const parseDateString = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  
  if (typeof dateString === "string") {
    const luxonDate = DateTime.fromISO(dateString);
    if (luxonDate.isValid) {
      return luxonDate.toJSDate();
    }
  }
  
  return null;
};

const AppointmentFilters = ({ filters = {}, onFilterChange, isLoading = false }) => {
  // Valores por defecto para filtros
  const safeFilters = {
    date_from: '',
    date_to: '',
    sort_by: 'installation_date',
    sort_order: 'desc',
    ...filters
  };

  // Funciones helper para manejar cambios de fecha
  const handleFromDateChange = (selectedDate) => {
    const dateString = formatDateToString(selectedDate[0]);
    console.log('🗓️ From date changed:', selectedDate, '→', dateString);
    onFilterChange('date_from', dateString);
  };

  const handleToDateChange = (selectedDate) => {
    const dateString = formatDateToString(selectedDate[0]);
    console.log('🗓️ To date changed:', selectedDate, '→', dateString);
    onFilterChange('date_to', dateString);
  };

  // FIX: Función corregida para aplicar filtros de fecha rápidos
  const applyQuickDateFilter = (type) => {
    console.log('🚀 Applying quick date filter:', type);
    
    // Usar la zona horaria local de la aplicación
    const now = DateTime.now();
    let fromDate = null;
    let toDate = null;

    switch (type) {
      case 'today':
        fromDate = now.startOf('day');
        toDate = now.endOf('day');
        break;
      case 'next_7_days':
        fromDate = now.startOf('day');
        toDate = now.plus({ days: 7 }).endOf('day');
        break;
      case 'this_month':
        fromDate = now.startOf('month');
        toDate = now.endOf('month');
        break;
      case 'next_month': {
        const nextMonth = now.plus({ months: 1 });
        fromDate = nextMonth.startOf('month');
        toDate = nextMonth.endOf('month');
        break;
      }
      case 'clear':
        // FIX: Crear un objeto con ambos valores y llamar una sola vez
        // const clearFilters = {
        //   ...safeFilters,
        //   date_from: '',
        //   date_to: ''
        // };
        
        // Llamar múltiples cambios en una sola operación
        onFilterChange('date_from', '');
        // Usar setTimeout para asegurar que el primer cambio se procese
        setTimeout(() => {
          onFilterChange('date_to', '');
        }, 0);
        
        console.log('✅ Date filters cleared');
        return;
      default:
        console.warn('Unknown quick filter type:', type);
        return;
    }

    // FIX: Aplicar ambas fechas en secuencia garantizada
    if (fromDate && toDate) {
      const fromDateISO = fromDate.toISODate();
      const toDateISO = toDate.toISODate();
      
      console.log('📅 Setting date range:', { from: fromDateISO, to: toDateISO });
      
      // SOLUCIÓN 1: Aplicar cambios en secuencia con micro-delays
      onFilterChange('date_from', fromDateISO);
      
      // Usar setTimeout para asegurar que el primer cambio se complete antes del segundo
      setTimeout(() => {
        onFilterChange('date_to', toDateISO);
        console.log('✅ Quick date filter applied successfully');
      }, 0);
      
      // ALTERNATIVA: Si el problema persiste, puedes usar este approach batch:
      /*
      // Crear un objeto con ambos cambios y aplicarlos de una vez
      const batchUpdates = {
        ...safeFilters,
        date_from: fromDateISO,
        date_to: toDateISO
      };
      
      // Si onFilterChange acepta múltiples cambios:
      Object.entries({ date_from: fromDateISO, date_to: toDateISO }).forEach(([key, value]) => {
        setTimeout(() => onFilterChange(key, value), 0);
      });
      */
    }
  };

  // Resetear solo filtros avanzados (no los básicos)
  const resetAdvancedFilters = () => {
    // FIX: Aplicar resets en secuencia
    onFilterChange('date_from', '');
    setTimeout(() => onFilterChange('date_to', ''), 0);
    setTimeout(() => onFilterChange('sort_by', 'installation_date'), 10);
    setTimeout(() => onFilterChange('sort_order', 'desc'), 20);
  };

  // Contar filtros avanzados activos
  const advancedFiltersCount = [
    safeFilters.date_from,
    safeFilters.date_to,
    safeFilters.sort_by !== 'installation_date' ? 1 : 0,
    safeFilters.sort_order !== 'desc' ? 1 : 0
  ].filter(Boolean).length;

  // Función para formatear fecha para mostrar al usuario
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const luxonDate = DateTime.fromISO(dateString);
    if (luxonDate.isValid) {
      return luxonDate.toLocaleString(DateTime.DATE_FULL);
    }
    return dateString;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header integrado - sin card separado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="size-4 text-primary-600" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-dark-200">
            Advanced Options
          </h4>
          {advancedFiltersCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
              {advancedFiltersCount} active
            </span>
          )}
        </div>
        
        <Button
          variant="outlined"
          size="sm"
          onClick={resetAdvancedFilters}
          disabled={isLoading || advancedFiltersCount === 0}
          className="text-xs"
        >
          <ArrowPathIcon className="size-3 mr-1" />
          Reset Advanced
        </Button>
      </div>

      {/* Filtros principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección: Filtros de Fecha */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-gray-700 dark:text-dark-200 flex items-center gap-2">
            <CalendarDaysIcon className="size-4" />
            Date Range Filters
          </h5>

          {/* Botones de fechas rápidas - más compacto */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-dark-300 mb-2">
              Quick Ranges
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => applyQuickDateFilter('today')}
                className="text-xs justify-center"
                disabled={isLoading}
              >
                Today
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => applyQuickDateFilter('next_7_days')}
                className="text-xs justify-center"
                disabled={isLoading}
              >
                Next 7 Days
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => applyQuickDateFilter('this_month')}
                className="text-xs justify-center"
                disabled={isLoading}
              >
                This Month
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => applyQuickDateFilter('next_month')}
                className="text-xs justify-center"
                disabled={isLoading}
              >
                Next Month
              </Button>
            </div>
            {(safeFilters.date_from || safeFilters.date_to) && (
              <Button
                variant="outlined"
                size="sm"
                onClick={() => applyQuickDateFilter('clear')}
                className="text-xs text-red-600 border-red-300 hover:bg-red-50 mt-2 w-full justify-center"
                disabled={isLoading}
              >
                Clear Date Range
              </Button>
            )}
          </div>

          {/* Selectores de fecha personalizados - más compacto */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-dark-300 mb-2">
              Custom Range
            </label>
            <div className="space-y-3">
              <DatePicker
                onChange={handleFromDateChange}
                value={parseDateString(safeFilters.date_from)}
                label="From Date"
                placeholder="Select start date..."
                options={{ 
                  disableMobile: true,
                  dateFormat: "Y-m-d"
                }}
                disabled={isLoading}
                className="w-full"
              />

              <DatePicker
                onChange={handleToDateChange}
                value={parseDateString(safeFilters.date_to)}
                label="To Date"
                placeholder="Select end date..."
                options={{ 
                  disableMobile: true,
                  dateFormat: "Y-m-d"
                }}
                disabled={isLoading}
                className="w-full"
              />
            </div>
          </div>

          {/* Información actual de fechas - más compacto */}
          {(safeFilters.date_from || safeFilters.date_to) && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                Active Date Filter
              </p>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                {safeFilters.date_from && safeFilters.date_to ? (
                  <span>
                    {formatDateForDisplay(safeFilters.date_from)} to{' '}
                    {formatDateForDisplay(safeFilters.date_to)}
                  </span>
                ) : safeFilters.date_from ? (
                  <span>From {formatDateForDisplay(safeFilters.date_from)} onwards</span>
                ) : (
                  <span>Up to {formatDateForDisplay(safeFilters.date_to)}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sección: Ordenamiento */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-gray-700 dark:text-dark-200 flex items-center gap-2">
            <FunnelIcon className="size-4" />
            Sorting Options
          </h5>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-dark-300 mb-2">
                Sort By
              </label>
              <select
                value={safeFilters.sort_by || 'installation_date'}
                onChange={(e) => onFilterChange('sort_by', e.target.value)}
                disabled={isLoading}
                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-dark-800 dark:border-dark-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-dark-300 mb-2">
                Sort Order
              </label>
              <select
                value={safeFilters.sort_order || 'desc'}
                onChange={(e) => onFilterChange('sort_order', e.target.value)}
                disabled={isLoading}
                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-dark-800 dark:border-dark-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                {SORT_ORDER_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Indicador de ordenamiento activo */}
            {(safeFilters.sort_by !== 'installation_date' || safeFilters.sort_order !== 'desc') && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-1">
                  Custom Sorting Active
                </p>
                <div className="text-xs text-green-700 dark:text-green-300">
                  Sorted by {SORT_OPTIONS.find(opt => opt.id === safeFilters.sort_by)?.label} - {' '}
                  {SORT_ORDER_OPTIONS.find(opt => opt.id === safeFilters.sort_order)?.label}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer informativo - más sutil */}
      <div className="pt-4 border-t border-gray-200 dark:border-dark-600">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-gray-500 dark:text-dark-400">
            💡 Advanced filters work alongside basic filters above
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-dark-500">
              Changes apply automatically
            </span>
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

AppointmentFilters.propTypes = {
  filters: PropTypes.shape({
    date_from: PropTypes.string,
    date_to: PropTypes.string,
    sort_by: PropTypes.string,
    sort_order: PropTypes.string
  }),
  onFilterChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

AppointmentFilters.defaultProps = {
  filters: {
    date_from: '',
    date_to: '',
    sort_by: 'installation_date',
    sort_order: 'desc'
  },
  isLoading: false
};

export default AppointmentFilters;