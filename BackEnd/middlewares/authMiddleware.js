import jwt from 'jsonwebtoken';
import Token from '../models/tokenManagement.js';
import { JWT_CONFIG } from '../config/main.js';
import { generateTokens, cookieConfig } from '../utils/index.js';

// Función para verificar token
export const verifyToken = (token, token_type) => {
  try {
		const JWT_SECRET = token_type === 'refresh' ? JWT_CONFIG.refresh_token_secret : JWT_CONFIG.access_token_secret;
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Función para decodificar token sin validar expiración
export const decodeTokenWithoutValidation = (token, token_type) => {
  try {
    const JWT_SECRET = token_type === 'refresh' ? JWT_CONFIG.refresh_token_secret : JWT_CONFIG.access_token_secret;
    // Usar decode en lugar de verify para obtener el payload sin validar expiración
    return jwt.decode(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware de autenticación
export const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el access token de las cookies
    const accessToken = req.cookies?.access_token;
    
    if (!accessToken) {
      return res.status(401).json({
        error: 'SESSION_EXPIRED',
        message: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.'
      });
    }

    // Verificar el access token
    const decoded = verifyToken(accessToken, 'access');
    
    if (decoded) {
      // Token válido - renovar y continuar
      const { accessToken: newAccessToken } = generateTokens(decoded.userId);
      
      // Establecer el nuevo token en las cookies
      res.cookie('access_token', newAccessToken, cookieConfig);
      
      // Agregar usuario al request
      req.user = { userId: decoded.userId };
      return next();
    }

    // Access token no válido - verificar refresh token
    const user = await Token.findById(req.user?.userId || null);
    
    if (!user || !user.refreshToken) {
      return res.status(401).json({
        error: 'SESSION_EXPIRED',
        message: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.'
      });
    }

    // Verificar refresh token
    const refreshDecoded = verifyToken(user.refreshToken, 'refresh');
    
    if (!refreshDecoded) {
      // Refresh token también inválido
      await Token.findByIdAndUpdate(user.id, { refreshToken: null });
      
      return res.status(401).json({
        error: 'SESSION_EXPIRED',
        message: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.'
      });
    }

    // Refresh token válido - generar nuevos tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
    
    // Actualizar refresh token en la DB
    await Token.findByIdAndUpdate(user.id, { refreshToken: newRefreshToken });
    
    // Establecer nuevo access token en cookies
    res.cookie('access_token', newAccessToken, cookieConfig);
    
    // Agregar usuario al request
    req.user = { userId: user.id };
    next();
    
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para extraer información del usuario sin validación estricta
export const extractUserMiddleware = async (req, res, next) => {
  try {
    // Obtener el access token de las cookies
    const accessToken = req.cookies?.access_token;
    
    if (!accessToken) {
      // No hay token, continuar sin usuario
      req.user = null;
      return next();
    }

    // Decodificar el token sin validar expiración
    const decoded = decodeTokenWithoutValidation(accessToken, 'access');
    
    if (decoded && decoded.userId) {
      // Token decodificado exitosamente, establecer usuario
      req.user = { userId: decoded.userId };
    } else {
      // No se pudo decodificar o no tiene userId
      req.user = null;
    }
    
    return next();
    
  } catch (error) {
    console.error('Error en extractUserMiddleware:', error);
    // En caso de error, continuar sin usuario
    req.user = null;
    return next();
  }
};

// Middleware para aplicar solo en rutas específicas
export const conditionalAuth = (req, res, next) => {
  // Rutas que no requieren autenticación
  const publicRoutes = [
    '/auth/sign-in',
    '/auth/logout',
    // Rutas para CallCenter WEBHOOKS
    '/CallCenter/sip-outbound-call',
    '/CallCenter/voice-answer',
    '/CallCenter/conference-status',
    '/CallCenter/agent-connect-to-conference',
    '/CallCenter/hangup',
    '/CallCenter/conference-fallback-status',
    '/CallCenter/outbound-dial-status',
    '/CallCenter/join-conference',
    '/CallCenter/add-customer-to-conference',
    '/CallCenter/outbound-sip-status',
    '/CallCenter/incoming-call-conference',

    '/CallCenter/incoming-call-sip',
    '/CallCenter/inbound-sip-status'
  ];
  
  // Verificar si la ruta actual está en las rutas públicas
  const isPublicRoute = publicRoutes.some(route => 
    req.path.startsWith(route) || req.originalUrl.startsWith(route)
  );
  
  if (isPublicRoute) {
    return extractUserMiddleware(req, res, next);
  }
  console.log(`Ruta protegida: ${req.path}`);
  // Aplicar middleware de autenticación
  return authMiddleware(req, res, next);
};
