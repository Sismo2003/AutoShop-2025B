// Import Dependencies
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  // HomeIcon,
  // BuildingOfficeIcon,
  // MapPinIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";

// Local imports
import { Card } from "components/ui";

// ----------------------------------------------------------------------

// Función para formatear números con separadores de miles
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toLocaleString('en-US');
};

// Función para formatear dinero
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Función para calcular porcentaje
const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 100);
};

// Componente individual de estadística
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue', 
  trend = null,
  delay = 0 
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card className="p-4 sm:p-6 h-full hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                <Icon className="size-5 flex-shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-600 dark:text-dark-300 truncate">
                  {title}
                </h3>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-dark-400">
                  {subtitle}
                </p>
              )}
              {trend && (
                <div className="flex items-center gap-1">
                  {trend > 0 ? (
                    <ArrowTrendingUpIcon className="size-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="size-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(trend)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const AppointmentStats = ({ stats }) => {
  // Validación de datos y valores por defecto
  const safeStats = {
    total_all: 0,
    total_scheduled: 0,
    total_today: 0,
    total_completed: 0,
    total_insurance: 0,
    total_cash: 0,
    average_amount: 0,
    ...stats
  };

  // Calcular porcentajes
  const insurancePercentage = calculatePercentage(safeStats.total_insurance, safeStats.total_all);
  const cashPercentage = calculatePercentage(safeStats.total_cash, safeStats.total_all);
  const completedPercentage = calculatePercentage(safeStats.total_completed, safeStats.total_all);

  // Preparar datos para las tarjetas de estadísticas
  const statCards = [
    {
      title: "Total Appointments",
      value: formatNumber(safeStats.total_all),
      subtitle: "All time appointments",
      icon: CalendarDaysIcon,
      color: "blue",
      delay: 0
    },
    {
      title: "Today's Appointments",
      value: formatNumber(safeStats.total_today),
      subtitle: safeStats.total_today === 1 ? "appointment today" : "appointments today",
      icon: ClockIcon,
      color: "orange",
      delay: 0.1
    },
    {
      title: "Upcoming",
      value: formatNumber(safeStats.total_scheduled),
      subtitle: "scheduled appointments",
      icon: CalendarDaysIcon,
      color: "green",
      delay: 0.2
    },
    {
      title: "Completed",
      value: formatNumber(safeStats.total_completed),
      subtitle: `${completedPercentage}% of total`,
      icon: UserGroupIcon,
      color: "purple",
      delay: 0.3
    },
    {
      title: "Insurance Jobs",
      value: formatNumber(safeStats.total_insurance),
      subtitle: `${insurancePercentage}% of total`,
      icon: ShieldCheckIcon,
      color: "indigo",
      delay: 0.4
    },
    {
      title: "Cash Jobs",
      value: formatNumber(safeStats.total_cash),
      subtitle: `${cashPercentage}% of total`,
      icon: BanknotesIcon,
      color: "green",
      delay: 0.5
    }
  ];

  // Si hay datos de average_amount, agregar esa tarjeta
  if (safeStats.average_amount > 0) {
    statCards.push({
      title: "Average Amount",
      value: formatCurrency(safeStats.average_amount),
      subtitle: "per appointment",
      icon: CurrencyDollarIcon,
      color: "gray",
      delay: 0.6
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Appointments Overview
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
              Quick statistics and key metrics
            </p>
          </div>
          
          {/* Indicador de datos actualizados */}
          <div className="text-xs text-gray-500 dark:text-dark-400">
            <span className="inline-flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live data
            </span>
          </div>
        </div>

        {/* Grid de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              color={stat.color}
              delay={stat.delay}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Información adicional si no hay datos */}
        {safeStats.total_all === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg border border-gray-200 dark:border-dark-600"
          >
            <div className="flex items-center gap-3">
              <CalendarDaysIcon className="size-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-dark-200">
                  No appointments data available
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                  Statistics will appear here once appointments are created
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Breakdown rápido */}
        {safeStats.total_all > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-600"
          >
            <h3 className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-4">
              Quick Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Payment Types */}
              <div className="bg-gray-50 dark:bg-dark-700/50 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-600 dark:text-dark-300 mb-2">
                  Payment Types
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-dark-400">Insurance</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {formatNumber(safeStats.total_insurance)} ({insurancePercentage}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-dark-400">Cash</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {formatNumber(safeStats.total_cash)} ({cashPercentage}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-gray-50 dark:bg-dark-700/50 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-600 dark:text-dark-300 mb-2">
                  Status Distribution
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-dark-400">Completed</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {formatNumber(safeStats.total_completed)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-dark-400">Scheduled</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {formatNumber(safeStats.total_scheduled)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Today's Focus */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <h4 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Today&#39;s Focus
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-700 dark:text-blue-300">Today</span>
                    <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                      {formatNumber(safeStats.total_today)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-700 dark:text-blue-300">This Week</span>
                    <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                      {formatNumber(safeStats.total_scheduled)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

AppointmentStats.propTypes = {
  stats: PropTypes.shape({
    total_all: PropTypes.number,
    total_scheduled: PropTypes.number,
    total_today: PropTypes.number,
    total_completed: PropTypes.number,
    total_insurance: PropTypes.number,
    total_cash: PropTypes.number,
    average_amount: PropTypes.number
  })
};

AppointmentStats.defaultProps = {
  stats: {
    total_all: 0,
    total_scheduled: 0,
    total_today: 0,
    total_completed: 0,
    total_insurance: 0,
    total_cash: 0,
    average_amount: 0
  }
};

export default AppointmentStats;