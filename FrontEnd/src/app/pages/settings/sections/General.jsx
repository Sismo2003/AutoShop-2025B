// Import Dependencies
import { EnvelopeIcon, UserIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Local Imports
import { PreviewImg } from "components/shared/PreviewImg";
import { Avatar } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

export default function General() {
  const { user } = useAuthContext();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const userInfo = [
    {
      id: 'username',
      label: 'Username',
      value: user?.username || 'Unknown',
      icon: UserIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'email',
      label: 'Email',
      value: user?.email || 'Unknown',
      icon: EnvelopeIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'rol',
      label: 'User Role',
      value: user?.rol || 'Unknown',
      icon: ShieldCheckIcon,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div 
        className="mb-8"
        variants={itemVariants}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent dark:from-primary-400/10" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              General Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              This section allows you to view and manage your general account settings.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Avatar Section */}
      <motion.div 
        className="mb-8"
        variants={cardVariants}
      >
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-lg dark:shadow-xl border border-gray-100 dark:border-dark-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Avatar
                size={32}
                imgComponent={PreviewImg}
                src="/images/100x100.png"
                classNames={{
                  root: "rounded-2xl ring-4 ring-primary-100 dark:ring-primary-800/50 shadow-2xl transition-all duration-300 hover:ring-primary-200 dark:hover:ring-primary-700/70",
                  display: "rounded-2xl",
                }}
              />
            </motion.div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.username || 'Usuario'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Profile Picture
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* User Information Cards */}
      <motion.div 
        className="grid gap-6 md:grid-cols-1 lg:grid-cols-3"
        variants={containerVariants}
      >
        {userInfo.map((info, index) => {
          const IconComponent = info.icon;
          return (
            <motion.div
              key={info.id}
              variants={cardVariants}
              whileHover={{ 
                y: -4,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className="group h-full"
            >
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg dark:shadow-xl border border-gray-100 dark:border-dark-600 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl overflow-hidden relative h-full min-h-[200px] flex flex-col">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative flex flex-col h-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${info.color} shadow-lg transform transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {info.label}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="flex-1">
                      <motion.div 
                        className="group/tooltip relative"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isLoaded ? 1 : 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <p className="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer transition-colors duration-200 hover:text-primary-600 dark:hover:text-primary-400">
                          {info.value}
                        </p>
                        {/* Tooltip para mostrar texto completo */}
                        {info.value.length > 20 && (
                          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap max-w-xs break-all">
                              {info.value}
                              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Status indicator - siempre en la parte inferior */}
                    <div className="flex items-center space-x-2 mt-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Information valid
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Additional Info Section */}
      <motion.div 
        className="mt-8"
        variants={itemVariants}
      >
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-800 dark:to-dark-700 rounded-2xl p-6 border border-gray-200 dark:border-dark-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Account Status
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your account is currently active and in good standing. You can manage your account settings at any time.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400 ml-2">
                Active
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Note */}
      <motion.div 
        className="mt-8 text-center"
        variants={itemVariants}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This is a view-only section. To edit your settings, please contact your support.
        </p>
      </motion.div>
    </motion.div>
  );
}
