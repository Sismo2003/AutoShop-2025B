import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { Card, Button } from "components/ui";

const EmptyState = ({ onClearFilters, hasActiveFilters }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-8 sm:p-12 text-center">
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-6">
          {hasActiveFilters ? (
            <MagnifyingGlassIcon className="size-10 sm:size-12 text-gray-400 dark:text-dark-400" />
          ) : (
            <CalendarDaysIcon className="size-10 sm:size-12 text-gray-400 dark:text-dark-400" />
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-3">
          {hasActiveFilters ? 'No appointments match your filters' : 'No appointments found'}
        </h3>

        <p className="text-gray-500 dark:text-dark-400 mb-6 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
          {hasActiveFilters 
            ? 'Try adjusting your search criteria or clearing the filters to see more results. You can also check if your date range or status filters are too restrictive.'
            : 'Get started by creating your first appointment. You can manage glass repair appointments, track customer information, and monitor job progress all in one place.'
          }
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          {hasActiveFilters ? (
            <>
              <Button
                variant="outlined"
                onClick={onClearFilters}
                className="w-full sm:w-auto min-w-[140px]"
              >
                <FunnelIcon className="size-4 mr-2" />
                Clear All Filters
              </Button>
              <Button
                color="primary"
                href="/appointments/new"
                className="w-full sm:w-auto min-w-[140px]"
              >
                <PlusIcon className="size-4 mr-2" />
                New Appointment
              </Button>
            </>
          ) : (
            <Button
              color="primary"
              href="/appointments/new"
              className="w-full sm:w-auto min-w-[160px]"
            >
              <PlusIcon className="size-4 mr-2" />
              Create First Appointment
            </Button>
          )}
        </div>

        {/* Información adicional solo cuando no hay filtros */}
        {!hasActiveFilters && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <motion.div 
              className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CalendarDaysIcon className="size-6 text-blue-600 dark:text-blue-400 mb-3" />
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Schedule Appointments
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Set installation dates, times, and locations for glass repairs with our easy-to-use scheduling system.
              </p>
            </motion.div>

            <motion.div 
              className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <MagnifyingGlassIcon className="size-6 text-green-600 dark:text-green-400 mb-3" />
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                Track Progress
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                Monitor appointment status, manage customer communications, and track job completion in real-time.
              </p>
            </motion.div>

            <motion.div 
              className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PlusIcon className="size-6 text-purple-600 dark:text-purple-400 mb-3" />
              <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                Manage Payments
              </h4>
              <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                Handle insurance claims, cash payments, and rebates efficiently with integrated payment tracking.
              </p>
            </motion.div>
          </div>
        )}

        {/* Sugerencias cuando hay filtros activos */}
        {hasActiveFilters && (
          <motion.div
            className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="size-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                  Tips for Better Results
                </h4>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Try expanding your date range or removing specific date filters</li>
                  <li>• Check if your status filter matches the expected results</li>
                  <li>• Use broader search terms instead of exact matches</li>
                  <li>• Consider searching by partial customer name or phone number</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

EmptyState.propTypes = {
  onClearFilters: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired
};

export { EmptyState };