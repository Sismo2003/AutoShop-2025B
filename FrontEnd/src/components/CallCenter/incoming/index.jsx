import { motion } from 'framer-motion';
import { PhoneIcon, PhoneXMarkIcon, UserIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

import { useTwilioContext } from 'app/contexts/twilio/context';

export default function IncomingCallModal() {
  const {
    incomingCall,
    acceptCall,
    rejectCall
  } = useTwilioContext();
  
  if (!incomingCall) return null;
  
  return (
    <motion.div
      className="fixed top-6 right-6 z-50"
      initial={{ opacity: 0, x: 100, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 100, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.4
      }}
    >
      <motion.div
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden w-[340px]"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
        animate={{
          y: [0, -2, 0]
        }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Barra superior con indicador */}
        <div className="relative bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 h-1">
          <motion.div
            className="absolute inset-0 bg-white/30"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-emerald-500 rounded-full"
                animate={{
                  opacity: [1, 0.4, 1],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-gray-700">Inbound Call</span>
            </div>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <SpeakerWaveIcon className="w-4 h-4 text-gray-500" />
            </motion.div>
          </div>
          
          {/* Avatar y información del contacto */}
          <div className="text-center mb-6">
            <motion.div
              className="relative inline-block mb-3"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center relative overflow-hidden">
                <UserIcon className="w-8 h-8 text-gray-600" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
              {/* Anillo pulsante */}
              <motion.div
                className="absolute inset-0 border-2 border-emerald-400 rounded-full"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.8, 0, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
              {incomingCall?.parameters?.From ? incomingCall.parameters.From : incomingCall.From}
            </h3>
            <p className="text-sm text-gray-500 font-medium">Unknown Caller</p>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center justify-center space-x-8">
            {/* Botón rechazar */}
            <motion.button
              onClick={rejectCall}
              className="relative w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-lg flex items-center justify-center group"
              whileHover={{
                scale: 1.1,
                boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.4)"
              }}
              whileTap={{
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <PhoneXMarkIcon className="w-6 h-6" />
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
            
            {/* Botón aceptar */}
            <motion.button
              onClick={acceptCall}
              className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center group"
              whileHover={{
                scale: 1.1,
                boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.4)"
              }}
              whileTap={{
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(16, 185, 129, 0.4)",
                  "0 0 0 20px rgba(16, 185, 129, 0)",
                  "0 0 0 0 rgba(16, 185, 129, 0.4)"
                ]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity },
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
            >
              <PhoneIcon className="w-6 h-6" />
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          </div>
          
          {/* Indicador de acciones */}
          <div className="flex items-center justify-center mt-4 space-x-6 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-red-400 rounded-full"></div>
              <span>Reject</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
              <span>Answer</span>
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}