
// ============= CONSTANTES Y CONFIGURACIÓN =============

const BALANCE_CONFIG = {
  ERROR_MESSAGES: {
    RETRIEVAL_FAILED: 'Unable to retrieve account balance',
    NO_BALANCE_FOUND: 'No balance information available',
    SERVICE_UNAVAILABLE: 'Balance service temporarily unavailable'
  },
  CACHE_DURATION: 30000, // 30 segundos de cache para evitar demasiadas consultas
  TIMEOUT: 5000 // 5 segundos de timeout para la consulta
};

// Cache simple para evitar consultas excesivas
let balanceCache = {
  data: null,
  timestamp: 0,
  isValid: function() {
    return this.data && (Date.now() - this.timestamp < BALANCE_CONFIG.CACHE_DURATION);
  },
  set: function(data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  clear: function() {
    this.data = null;
    this.timestamp = 0;
  }
};

// ============= FUNCIONES AUXILIARES =============

/**
 * Obtiene el balance de la cuenta de Twilio con cache y manejo de errores
 * @returns {Promise<Object>} - Objeto con la información del balance
 */
async function fetchAccountBalance() {
  try {
    // Verificar cache primero
    if (balanceCache.isValid()) {
      return {
        ...balanceCache.data,
        from_cache: true,
        retrieved_at: new Date(balanceCache.timestamp).toISOString()
      };
    }

    // Consultar balance con timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Balance request timeout')), BALANCE_CONFIG.TIMEOUT)
    );

    const balance = await Promise.race([balancePromise, timeoutPromise]);
    
    if (balance === null || balance === undefined) {
      const errorResult = {
        error: true,
        message: BALANCE_CONFIG.ERROR_MESSAGES.NO_BALANCE_FOUND,
        data: null,
        retrieved_at: new Date().toISOString(),
        from_cache: false
      };
      
      // Cachear también los errores por un tiempo menor
      balanceCache.set(errorResult);
      return errorResult;
    }

    const successResult = {
      error: false,
      message: 'Balance retrieved successfully',
      data: balance,
      retrieved_at: new Date().toISOString(),
      from_cache: false
    };

    // Guardar en cache
    balanceCache.set(successResult);
    return successResult;

  } catch (error) {
    console.error('[BalanceMiddleware] Error fetching account balance:', error.message);
    
    const errorResult = {
      error: true,
      message: BALANCE_CONFIG.ERROR_MESSAGES.RETRIEVAL_FAILED,
      details: error.message,
      retrieved_at: new Date().toISOString(),
      from_cache: false
    };

    return errorResult;
  }
}

/**
 * Verifica si el body de respuesta es un objeto modificable
 * @param {*} body - El cuerpo de la respuesta
 * @returns {boolean} - Si el body puede ser modificado
 */
function isModifiableResponseBody(body) {
  return body !== null && 
         body !== undefined && 
         typeof body === 'object' && 
         !Array.isArray(body);
}

/**
 * Crea un nuevo objeto de respuesta con el balance incluido
 * @param {*} originalBody - El cuerpo original de la respuesta
 * @param {Object} balanceData - Los datos del balance
 * @returns {Object} - Nuevo objeto con balance incluido
 */
function enhanceResponseBody(originalBody, balanceData) {
  if (isModifiableResponseBody(originalBody)) {
    return {
      ...originalBody,
      account_balance: balanceData
    };
  }

  // Si no es un objeto modificable, envolver en un nuevo objeto
  return {
    response_data: originalBody,
    account_balance: balanceData
  };
}

// ============= MIDDLEWARES PRINCIPALES =============

/**
 * Middleware principal que intercepta todas las respuestas JSON
 * y agrega información del balance de Twilio
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
export const enhanceResponseWithBalance = (req, res, next) => {
  // Guardar referencia al método json original
  const originalJsonMethod = res.json;
  
  // Sobrescribir el método json
  res.json = async function(responseBody) {
    try {
      // Obtener información del balance
      const balanceData = await fetchAccountBalance();
      // console.log('[BalanceMiddleware] Balance data retrieved:', balanceData);
      
      // Mejorar el cuerpo de la respuesta con balance
      const enhancedBody = enhanceResponseBody(responseBody, balanceData);
      
      // Llamar al método json original con el cuerpo mejorado
      return originalJsonMethod.call(this, enhancedBody);
      
    } catch (error) {
      console.error('[BalanceMiddleware] Error enhancing response:', error.message);
      
      // En caso de error, agregar información de error del balance
      const errorBalance = {
        error: true,
        message: BALANCE_CONFIG.ERROR_MESSAGES.SERVICE_UNAVAILABLE,
        details: error.message,
        retrieved_at: new Date().toISOString()
      };
      
      const enhancedBody = enhanceResponseBody(responseBody, errorBalance);
      return originalJsonMethod.call(this, enhancedBody);
    }
  };
  
  // Continuar con el siguiente middleware
  next();
};

/**
 * Middleware condicional que solo agrega balance a respuestas exitosas
 * Útil para evitar consultas innecesarias en respuestas de error
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const conditionalBalanceEnhancement = (req, res, next) => {
  const originalJsonMethod = res.json;
  
  res.json = async function(responseBody) {
    // Solo agregar balance si la respuesta es exitosa (status < 400)
    if (res.statusCode < 400) {
      try {
        const balanceData = await fetchAccountBalance();
        const enhancedBody = enhanceResponseBody(responseBody, balanceData);
        return originalJsonMethod.call(this, enhancedBody);
      } catch (error) {
        console.error('[BalanceMiddleware] Error in conditional enhancement:', error.message);
        // Si hay error, enviar respuesta original sin balance
      }
    }
    
    // Para respuestas de error o si falla la consulta, enviar original
    return originalJsonMethod.call(this, responseBody);
  };
  
  next();
};

/**
 * Middleware que agrega balance solo a rutas específicas basadas en path
 * 
 * @param {Array<string>} includedPaths - Array de paths que deben incluir balance
 * @returns {Function} - Middleware function
 */
export const selectiveBalanceEnhancement = (includedPaths = []) => {
  return (req, res, next) => {
    // Verificar si la ruta actual debe incluir balance
    const shouldIncludeBalance = includedPaths.some(path => 
      req.path.startsWith(path) || req.originalUrl.startsWith(path)
    );
    
    if (shouldIncludeBalance) {
      return enhanceResponseWithBalance(req, res, next);
    }
    
    // Si no está en las rutas incluidas, continuar sin modificar
    next();
  };
};

// ============= MIDDLEWARE PRINCIPAL =============

/**
 * Middleware principal recomendado para uso general
 * Combina cache inteligente y manejo robusto de errores
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const balanceEnhancementMiddleware = enhanceResponseWithBalance;

// ============= UTILIDADES PÚBLICAS =============

/**
 * Función para limpiar el cache manualmente
 * Útil para testing o cuando se necesita forzar una nueva consulta
 */
export const clearBalanceCache = () => {
  balanceCache.clear();
  console.log('[BalanceMiddleware] Cache cleared manually');
};

/**
 * Función para obtener el estado actual del cache
 * Útil para debugging y monitoreo
 * 
 * @returns {Object} - Estado del cache
 */
export const getBalanceCacheStatus = () => {
  return {
    hasData: !!balanceCache.data,
    isValid: balanceCache.isValid(),
    timestamp: balanceCache.timestamp,
    age: balanceCache.timestamp ? Date.now() - balanceCache.timestamp : 0
  };
};

/**
 * Función para pre-cargar el balance en cache
 * Útil para warming up el cache al iniciar la aplicación
 * 
 * @returns {Promise<Object>} - Datos del balance pre-cargados
 */
export const preloadBalance = async () => {
  try {
    console.log('[BalanceMiddleware] Preloading balance cache...');
    const balance = await fetchAccountBalance();
    console.log('[BalanceMiddleware] Balance cache preloaded successfully');
    return balance;
  } catch (error) {
    console.error('[BalanceMiddleware] Failed to preload balance cache:', error.message);
    throw error;
  }
};
