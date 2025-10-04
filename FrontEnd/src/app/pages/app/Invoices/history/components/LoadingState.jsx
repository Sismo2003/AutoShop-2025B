import { motion } from "framer-motion";
import { Card } from "components/ui";

const LoadingState = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Skeleton cards con diferentes layouts para simular variedad */}
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="w-full"
        >
          <Card className="p-4 sm:p-6">
            <div className="animate-pulse">
              {/* Header skeleton */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap gap-2">
                  {/* Status badges skeleton */}
                  <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded-full w-16 sm:w-20"></div>
                  <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded-full w-14 sm:w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-8 sm:w-12 flex-shrink-0"></div>
              </div>

              {/* Content skeleton - responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Customer info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-dark-600 rounded flex-shrink-0"></div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[120px]"></div>
                      <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[100px]"></div>
                    </div>
                  </div>
                </div>

                {/* Vehicle info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-dark-600 rounded flex-shrink-0"></div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[140px]"></div>
                      <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[80px]"></div>
                    </div>
                  </div>
                </div>

                {/* Date info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-dark-600 rounded flex-shrink-0"></div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[110px]"></div>
                      <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[90px]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional content rows */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-dark-600 rounded flex-shrink-0"></div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[160px]"></div>
                    <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[120px]"></div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-dark-600 rounded flex-shrink-0"></div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[100px]"></div>
                    <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[80px]"></div>
                  </div>
                </div>
              </div>

              {/* Glass work section skeleton (some cards have it, some don't) */}
              {index % 3 === 0 && (
                <div className="bg-gray-100 dark:bg-dark-700 rounded-lg p-3 mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[200px] mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-full max-w-[150px]"></div>
                </div>
              )}

              {/* Actions skeleton */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-dark-600">
                <div className="h-8 bg-gray-200 dark:bg-dark-600 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 dark:bg-dark-600 rounded flex-1"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-dark-600 rounded flex-shrink-0"></div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      {/* Loading indicator overlay */}
      <motion.div
        className="fixed top-4 right-4 z-50 bg-white dark:bg-dark-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-dark-600"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
          <span className="text-sm text-gray-600 dark:text-dark-300 font-medium">
            Loading appointments...
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export { LoadingState };