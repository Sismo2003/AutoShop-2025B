// Utilidades para formateo de fechas usando dayjs
// Archivo: src/utils/dateUtils.js

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extender dayjs con plugins necesarios
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

/**
 * Formatear fecha a formato estadounidense MM/DD/YYYY usando dayjs
 * @param {string|Date} dateInput - Fecha en string o objeto Date
 * @returns {string} - Fecha formateada como "04/02/2025"
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    let date;
    
    // Si es string, intentar parsear con diferentes formatos
    if (typeof dateInput === 'string') {
      // Primero intentar con el formato ISO (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        date = dayjs(dateInput, 'YYYY-MM-DD');
      } else {
        // Para otros formatos, usar el parser por defecto
        date = dayjs(dateInput);
      }
    } else {
      // Si es Date object
      date = dayjs(dateInput);
    }
    
    // Verificar si la fecha es válida
    if (!date.isValid()) {
      console.warn('Invalid date provided to formatDate:', dateInput);
      return dateInput.toString();
    }
    
    // Formatear a formato estadounidense MM/DD/YYYY
    return date.format('MM/DD/YYYY');
    
  } catch (error) {
    console.error('Error formatting date with dayjs:', error);
    return dateInput.toString();
  }
};

/**
 * Formatear fecha a formato corto MM/DD/YYYY usando dayjs
 * @param {string|Date} dateInput - Fecha en string o objeto Date
 * @returns {string} - Fecha formateada como "04/02/2025"
 */
export const formatDateShort = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    let date;
    
    if (typeof dateInput === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        date = dayjs(dateInput, 'YYYY-MM-DD');
      } else {
        date = dayjs(dateInput);
      }
    } else {
      date = dayjs(dateInput);
    }
    
    if (!date.isValid()) {
      console.warn('Invalid date provided to formatDateShort:', dateInput);
      return dateInput.toString();
    }
    
    return date.format('MM/DD/YYYY');
    
  } catch (error) {
    console.error('Error formatting date short with dayjs:', error);
    return dateInput.toString();
  }
};

/**
 * Formatear hora a formato de 12 horas con AM/PM usando dayjs
 * @param {string} timeInput - Hora en formato HH:MM:SS o HH:MM
 * @returns {string} - Hora formateada como "10:00 AM"
 */
export const formatTime = (timeInput) => {
  if (!timeInput) return '';
  
  try {
    // Crear una fecha temporal para usar con dayjs
    const timeOnly = dayjs(`2000-01-01 ${timeInput}`, 'YYYY-MM-DD HH:mm:ss');
    
    if (!timeOnly.isValid()) {
      // Intentar con formato HH:mm
      const timeOnly2 = dayjs(`2000-01-01 ${timeInput}`, 'YYYY-MM-DD HH:mm');
      
      if (!timeOnly2.isValid()) {
        console.warn('Invalid time provided to formatTime:', timeInput);
        return timeInput.toString();
      }
      
      return timeOnly2.format('h:mm A');
    }
    
    return timeOnly.format('h:mm A');
    
  } catch (error) {
    console.error('Error formatting time with dayjs:', error);
    return timeInput.toString();
  }
};

/**
 * Formatear teléfono a formato estadounidense (XXX) XXX-XXXX
 * @param {string} phoneInput - Número de teléfono
 * @returns {string} - Teléfono formateado
 */
export const formatPhone = (phoneInput) => {
  if (!phoneInput) return '';
  
  // Remover todos los caracteres no numéricos
  const cleaned = phoneInput.replace(/\D/g, '');
  
  // Formatear si tiene 10 dígitos
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Formatear si tiene 11 dígitos y empieza con 1
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Si no se puede formatear, retornar como está
  return phoneInput;
};

/**
 * Formatear moneda a formato USD
 * @param {number|string} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada como "$123.45"
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '$0.00';
  
  try {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount}`;
  }
};

/**
 * Obtener fecha actual en formato estadounidense usando dayjs
 * @returns {string} - Fecha actual como "07/29/2025"
 */
export const getCurrentDate = () => {
  return dayjs().format('MM/DD/YYYY');
};

/**
 * Obtener fecha y hora actual en formato estadounidense usando dayjs
 * @returns {string} - Fecha y hora actual como "07/29/2025 2:30 PM"
 */
export const getCurrentDateTime = () => {
  const now = dayjs();
  return `${now.format('MM/DD/YYYY')} ${now.format('h:mm A')}`;
};

/**
 * Formatear fecha para mostrar en formato estadounidense largo
 * @param {string|Date} dateInput - Fecha en string o objeto Date
 * @returns {string} - Fecha formateada como "Wednesday, April 2, 2025"
 */
export const formatDateLong = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    let date;
    
    if (typeof dateInput === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        date = dayjs(dateInput, 'YYYY-MM-DD');
      } else {
        date = dayjs(dateInput);
      }
    } else {
      date = dayjs(dateInput);
    }
    
    if (!date.isValid()) {
      console.warn('Invalid date provided to formatDateLong:', dateInput);
      return dateInput.toString();
    }
    
    // Formatear a formato largo estadounidense
    return date.format('dddd, MMMM D, YYYY');
    
  } catch (error) {
    console.error('Error formatting long date with dayjs:', error);
    return dateInput.toString();
  }
};

/**
 * Formatear fecha para input HTML (YYYY-MM-DD) usando dayjs
 * @param {string|Date} dateInput - Fecha en string o objeto Date
 * @returns {string} - Fecha formateada como "2025-04-02"
 */
export const formatDateForInput = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    const date = dayjs(dateInput);
    
    if (!date.isValid()) {
      console.warn('Invalid date provided to formatDateForInput:', dateInput);
      return '';
    }
    
    return date.format('YYYY-MM-DD');
    
  } catch (error) {
    console.error('Error formatting date for input with dayjs:', error);
    return '';
  }
};

/**
 * Obtener diferencia en días entre dos fechas usando dayjs
 * @param {string|Date} date1 - Primera fecha
 * @param {string|Date} date2 - Segunda fecha
 * @returns {number} - Diferencia en días
 */
export const getDaysDifference = (date1, date2) => {
  try {
    const d1 = dayjs(date1);
    const d2 = dayjs(date2);
    
    if (!d1.isValid() || !d2.isValid()) {
      console.warn('Invalid dates provided to getDaysDifference');
      return 0;
    }
    
    return d1.diff(d2, 'day');
    
  } catch (error) {
    console.error('Error calculating days difference:', error);
    return 0;
  }
};