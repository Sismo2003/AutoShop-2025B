// Import Dependencies
import * as Yup from 'yup';
import db from '../config/db.js';

// ============= ESQUEMAS DE VALIDACIÓN CORREGIDOS =============

// Esquema para validar datos del cliente
const customerSchema = Yup.object({
  id: Yup.number()
    .positive('Customer ID must be positive')
    .integer('Customer ID must be an integer')
    .required('Customer ID is required'),
  fullname: Yup.string()
    .trim()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name cannot exceed 100 characters')
    .required('Customer name is required'),
  phone: Yup.string()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number format')
    .required('Customer phone is required'),
  secondary_phone: Yup.string()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid secondary phone number format')
    .nullable()
    .transform((value) => value === '' ? null : value),
  email: Yup.string()
    .email('Invalid email format')
    .nullable()
    .transform((value) => value === '' ? null : value)
});

// Esquema para validar dirección
const addressSchema = Yup.object({
  street_address: Yup.string()
    .trim()
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address cannot exceed 100 characters')
    .required('Street address is required'),
  city: Yup.string()
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City cannot exceed 50 characters')
    .required('City is required'),
  state: Yup.string()
    .length(2, 'State must be exactly 2 characters')
    .uppercase()
    .required('State is required'),
  zipcode: Yup.string()
    .matches(/^\d{5}(-\d{4})?$/, 'Invalid zip code format (12345 or 12345-6789)')
    .required('Zip code is required'),
  unit_number: Yup.string()
    .trim()
    .max(20, 'Unit number cannot exceed 20 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  main_cross_streets: Yup.string()
    .trim()
    .max(100, 'Cross streets cannot exceed 100 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  apartment_name: Yup.string()
    .trim()
    .max(100, 'Apartment name cannot exceed 100 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  building: Yup.string()
    .trim()
    .max(50, 'Building cannot exceed 50 characters')
    .nullable()
    .transform((value) => value === '' ? null : value)
});

// Esquema para validar vehículo
const vehicleSchema = Yup.object({
  id: Yup.number()
    .positive('Vehicle ID must be positive')
    .integer('Vehicle ID must be an integer')
    .nullable(), // 
  update_existing: Yup.boolean().default(false), // 
  year: Yup.string()
    .matches(/^\d{4}$/, 'Vehicle year must be 4 digits')
    .required('Vehicle year is required'),
  make: Yup.string()
    .trim()
    .min(2, 'Vehicle make must be at least 2 characters')
    .max(100, 'Vehicle make cannot exceed 100 characters')
    .required('Vehicle make is required'),
  model: Yup.string()
    .trim()
    .min(2, 'Vehicle model must be at least 2 characters')
    .max(100, 'Vehicle model cannot exceed 100 characters')
    .required('Vehicle model is required'),
  color: Yup.string()
    .trim()
    .min(2, 'Vehicle color must be at least 2 characters')
    .max(50, 'Vehicle color cannot exceed 50 characters')
    .required('Vehicle color is required'),
  vin: Yup.string()
    .trim()
    .length(17, 'VIN must be exactly 17 characters')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN contains invalid characters')
    .required('VIN is required'),
  doors: Yup.string()
    .oneOf(['2', '4'], 'Doors must be either 2 or 4')
    .required('Number of doors is required'),
  part_number: Yup.string()
    .trim()
    .max(100, 'Part number cannot exceed 100 characters')
    .required('Part number is required'),
});

// Esquema para validar información de seguro
const insuranceSchema = Yup.object({
  general_insurance_id: Yup.number()
    .positive('Insurance company ID must be positive')
    .integer('Insurance company ID must be an integer')
    .required('Insurance company is required'),
  policy_number: Yup.string()
    .trim()
    .min(5, 'Policy number must be at least 5 characters')
    .max(100, 'Policy number cannot exceed 100 characters')
    .required('Policy number is required'),
  date_of_loss: Yup.date()
    .max(new Date(), 'Date of loss cannot be in the future')
    .required('Date of loss is required'),
  glass_deductible: Yup.number()
    .min(0, 'Glass deductible cannot be negative')
    .max(10000, 'Glass deductible cannot exceed $10,000')
    .required('Glass deductible is required'),
  safelife: Yup.string()
    .trim()
    .max(6, 'Safelife cannot exceed 6 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  lynx: Yup.string()
    .trim()
    .max(10, 'Lynx cannot exceed 10 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  other: Yup.string()
    .trim()
    .max(500, 'Other information cannot exceed 500 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  update_customer_insurance: Yup.boolean().default(true)
});

// Esquema para validar cita
const appointmentSchema = Yup.object({
  installation_date: Yup.date()
    .min(new Date(), 'Installation date cannot be in the past')
    .required('Installation date is required'),
  installation_time: Yup.string()
    .oneOf(['6-10', '8-12', '10-2', '2-4', 'all day'], 'Invalid time slot. Must be one of: 6-10, 8-12, 10-2, 2-4, all day')
    .required('Installation time slot is required'),
  tech_name: Yup.string()
    .trim()
    .min(2, 'Tech name must be at least 2 characters')
    .max(100, 'Tech name cannot exceed 100 characters')
    .required('Tech name is required'),
  service_advisor: Yup.string()
    .trim()
    .min(2, 'Service advisor name must be at least 2 characters')
    .max(100, 'Service advisor name cannot exceed 100 characters')
    .required('Service advisor name is required'),
  edirect: Yup.string()
    .trim()
    .max(100, 'E-direct name cannot exceed 100 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  location_type: Yup.string()
    .oneOf(['home', 'shop', 'other'], 'Location type must be home, shop, or other')
    .required('Location type is required'),
  replacement_type: Yup.string()
    .oneOf(['insurance', 'out_of_pocket'], 'Replacement type must be insurance or out_of_pocket')
    .required('Replacement type is required'),
  cross_street: Yup.string()
    .trim()
    .max(100, 'Cross street cannot exceed 100 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  dep_name: Yup.string()
    .trim()
    .max(100, 'Department name cannot exceed 100 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  building: Yup.string()
    .trim()
    .max(100, 'Building cannot exceed 100 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  comment: Yup.string()
    .trim()
    .max(2000, 'Comment cannot exceed 2000 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  user_id: Yup.number()
    .positive('User ID must be positive')
    .integer('User ID must be an integer')
    .nullable()
});

// Esquema para tipos de vidrio
const glassTypesSchema = Yup.object({
  has_windshield: Yup.boolean().default(false),
  has_door_glass: Yup.boolean().default(false),
  has_back_glass: Yup.boolean().default(false),
  has_vent_glass: Yup.boolean().default(false),
  has_quarter_glass: Yup.boolean().default(false)
}).test('at-least-one-glass', 'Must select at least one glass type', function(value) {
  const glassTypes = [
    value.has_windshield,
    value.has_door_glass,
    value.has_back_glass,
    value.has_vent_glass,
    value.has_quarter_glass
  ];
  
  return glassTypes.some(type => type === true);
});

// Esquema para características del vidrio
const glassFeaturesSchema = Yup.object({
  has_2d: Yup.boolean().default(false),
  has_4d: Yup.boolean().default(false),
  has_ldws: Yup.boolean().default(false),
  has_hud: Yup.boolean().default(false),
  has_heated: Yup.boolean().default(false),
  has_antenna: Yup.boolean().default(false),
  has_rain_sensor: Yup.boolean().default(false),
  has_tint_strip: Yup.boolean().default(false),
  has_windshield_tint: Yup.boolean().default(false),
  has_chrome: Yup.boolean().default(false),
  has_black: Yup.boolean().default(false)
});

// Esquema para validar dirección alternativa
const alternateAddressSchema = Yup.object({
  business_name: Yup.string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters')
    .required('Business name is required'),
  street_address: Yup.string()
    .trim()
    .min(5, 'Install address must be at least 5 characters')
    .max(100, 'Install address cannot exceed 100 characters')
    .required('Install address is required'),
  city: Yup.string()
    .trim()
    .min(2, 'Install city must be at least 2 characters')
    .max(50, 'Install city cannot exceed 50 characters')
    .required('Install city is required'),
  state: Yup.string()
    .length(2, 'Install state must be exactly 2 characters')
    .uppercase()
    .required('Install state is required'),
  zipcode: Yup.string()
    .matches(/^\d{5}(-\d{4})?$/, 'Invalid install zip code format')
    .required('Install zip code is required'),
  unit_number: Yup.string()
    .trim()
    .max(20, 'Unit number cannot exceed 20 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  building: Yup.string()
    .trim()
    .max(50, 'Building cannot exceed 50 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  main_cross_streets: Yup.string()
    .trim()
    .max(100, 'Cross streets cannot exceed 100 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
  contact_name: Yup.string()
    .trim()
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name cannot exceed 100 characters')
    .required('Contact name is required'),
  contact_phone: Yup.string()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid contact phone format')
    .required('Contact phone is required'),
  property_type: Yup.string()
    .oneOf(['house', 'apartment', 'condo', 'restaurant', 'office', 'warehouse', 'other'], 'Invalid App Type of Place')
    .default('other'),
  is_commercial: Yup.boolean().default(true)
});

// Esquema para rebate (solo cuando hay seguro)
const rebateSchema = Yup.object({
  has_rebate: Yup.boolean().default(true),
  cash: Yup.number()
    .min(0, 'Rebate cash amount cannot be negative')
    .max(50000, 'Rebate cash amount cannot exceed $50,000')
    .nullable()
    .transform((value) => value === '' ? null : value),
  check: Yup.number()
    .min(0, 'Rebate check amount cannot be negative')
    .max(50000, 'Rebate check amount cannot exceed $50,000')
    .nullable()
    .transform((value) => value === '' ? null : value),
  observations: Yup.string()
    .trim()
    .max(500, 'Observations cannot exceed 500 characters')
    .nullable()
    .transform((value) => value === '' ? null : value)
});

// Esquema para venta (cash payment) - MEJORADO
const saleSchema = Yup.object({
  price_cash: Yup.number()
    .min(0, 'Cash price cannot be negative')
    .max(50000, 'Cash price cannot exceed $50,000')
    .required('Cash price is required'),
  payment_type: Yup.string()
    .oneOf(['cash', 'check', 'other'], 'Invalid payment type')
    .default('cash'),
  salesperson: Yup.string()
    .trim()
    .min(2, 'Salesperson name must be at least 2 characters')
    .max(100, 'Salesperson name cannot exceed 100 characters')
    .required('Salesperson is required'),
  origin: Yup.string()
    .trim()
    // .min(2, 'Origin must be at least 2 characters')
    .max(100, 'Origin cannot exceed 100 characters')
    // .required('Origin is required')
});

// Esquema principal para validar toda la cita
const appointmentDataSchema = Yup.object({
  customer: customerSchema.required('Customer information is required'),
  address: addressSchema.required('Address information is required'),
  vehicle: vehicleSchema.required('Vehicle information is required'),
  
  // Campos obligatorios para tipos y características de vidrio
  glassTypes: glassTypesSchema.required('Glass types information is required'),
  glassFeatures: glassFeaturesSchema.required('Glass features information is required'),
  
  // Campos condicionales
  insurance: insuranceSchema.nullable(),
  appointment: appointmentSchema.required('Appointment information is required'),
  alternateAddress: alternateAddressSchema.nullable(),
  rebate: rebateSchema.nullable(),
  sale: saleSchema.nullable()
}).test('payment-validation', 'Payment validation failed', function(value) {
  const errors = [];

  // Validación de payment method más robusta
  if (value.appointment?.replacement_type === 'insurance') {
    // Si es insurance, debe tener información de seguro Y rebate
    if (!value.insurance) {
      errors.push(this.createError({
        message: 'Insurance information is required when replacement type is insurance',
        path: 'insurance'
      }));
    }
    
    if (!value.rebate) {
      errors.push(this.createError({
        message: 'Rebate information is required when using insurance',
        path: 'rebate'
      }));
    } else {
      // Validar que tenga al menos cash o check en el rebate
      if (!value.rebate.cash && !value.rebate.check) {
        errors.push(this.createError({
          message: 'Either cash or check amount must be specified for rebate',
          path: 'rebate'
        }));
      }
    }
    
    // Si usa insurance, NO debe tener sale
    if (value.sale) {
      errors.push(this.createError({
        message: 'Sale information should not be provided when using insurance',
        path: 'sale'
      }));
    }
  }
  
  if (value.appointment?.replacement_type === 'out_of_pocket') {
    // Si es out_of_pocket, debe tener información de venta
    if (!value.sale) {
      errors.push(this.createError({
        message: 'Sale information is required when replacement type is out of pocket',
        path: 'sale'
      }));
    }
    
    // Si usa cash, NO debe tener insurance ni rebate
    if (value.insurance) {
      errors.push(this.createError({
        message: 'Insurance information should not be provided when paying cash',
        path: 'insurance'
      }));
    }
    
    if (value.rebate) {
      errors.push(this.createError({
        message: 'Rebate information should not be provided when paying cash',
        path: 'rebate'
      }));
    }
  }
  
  // Validar dirección alternativa
  if (value.appointment?.location_type === 'other' && !value.alternateAddress) {
    errors.push(this.createError({
      message: 'Alternate address is required when location type is other',
      path: 'alternateAddress'
    }));
  }

  if (errors.length > 0) {
    return new Yup.ValidationError(errors);
  }
  
  return true;
});

// ============= FUNCIONES DE VALIDACIÓN AUXILIARES =============

export const validateUniqueVin = async (vin, excludeVehicleId = null) => {
  try {
    const query = excludeVehicleId 
      ? 'SELECT COUNT(*) as count FROM vehicles WHERE vin = ? AND id != ?'
      : 'SELECT COUNT(*) as count FROM vehicles WHERE vin = ?';
    
    const params = excludeVehicleId ? [vin, excludeVehicleId] : [vin];
    const [result] = await db.query(query, params);
    
    return result[0].count === 0;
  } catch (error) {
    console.error('Error validating unique VIN:', error);
    return false;
  }
};

export const validateCustomerExists = async (customerId) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM customers WHERE id = ?', 
      [customerId]
    );
    
    return result[0].count > 0;
  } catch (error) {
    console.error('Error validating customer exists:', error);
    return false;
  }
};

export const validateInsuranceExists = async (insuranceId) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM general_insurance WHERE id = ?', 
      [insuranceId]
    );
    
    return result[0].count > 0;
  } catch (error) {
    console.error('Error validating insurance exists:', error);
    return false;
  }
};

export const validateTimeSlotAvailable = async (date, time, excludeAppointmentId = null) => {
  try {
    const query = excludeAppointmentId 
      ? 'SELECT COUNT(*) as count FROM appointments WHERE installation_date = ? AND installation_time = ? AND id != ?'
      : 'SELECT COUNT(*) as count FROM appointments WHERE installation_date = ? AND installation_time = ?';
    
    const params = excludeAppointmentId ? [date, time, excludeAppointmentId] : [date, time];
    const [result] = await db.query(query, params);
    
    return result[0].count === 0;
  } catch (error) {
    console.error('Error validating time slot availability:', error);
    return false;
  }
};

// ============= FUNCIONES DE UTILIDAD =============

const formatYupErrors = (error) => {
  if (error.inner && error.inner.length > 0) {
    return error.inner.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
  }
  
  return [{
    field: error.path || 'unknown',
    message: error.message,
    value: error.value
  }];
};

// ============= MIDDLEWARE DE VALIDACIÓN PRINCIPAL =============

export const validateAppointmentData = async (req, res, next) => {
  try {
    console.log('🔍 Validating appointment data:', JSON.stringify(req.body, null, 2));
    
    const validatedData = await appointmentDataSchema.validate(req.body, {
      abortEarly: false, // Retornar todos los errores
      stripUnknown: true // Remover campos desconocidos
    });

    console.log('✅ Validation successful');
    
    // Asignar los datos validados y sanitizados al request
    req.body = validatedData;
    next();

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    console.error('❌ Validation errors:', error.errors);
    
    const validationErrors = formatYupErrors(error);

    return res.status(400).json({
      data: false,
      message: 'Validation failed',
      error: true,
      validation_errors: validationErrors
    });
  }
};

// ============= MIDDLEWARE DE VALIDACIÓN AVANZADA =============

export const validateAdvancedAppointmentData = async (req, res, next) => {
  try {
    const { customer, vehicle, insurance, appointment } = req.body;
    const validationErrors = [];

    // Validar que el cliente existe
    const customerExists = await validateCustomerExists(customer.id);
    if (!customerExists) {
      validationErrors.push({
        field: 'customer.id',
        message: 'Customer does not exist',
        value: customer.id
      });
    }

    // Validar VIN único si se proporciona
    if (vehicle.vin) {
      const vinAvailable = await validateUniqueVin(vehicle.vin);
      if (!vinAvailable) {
        validationErrors.push({
          field: 'vehicle.vin',
          message: 'VIN already exists in the system',
          value: vehicle.vin
        });
      }
    }

    // Validar aseguradora si se proporciona información de seguro
    if (insurance && insurance.general_insurance_id) {
      const insuranceExists = await validateInsuranceExists(insurance.general_insurance_id);
      if (!insuranceExists) {
        validationErrors.push({
          field: 'insurance.general_insurance_id',
          message: 'Insurance company does not exist',
          value: insurance.general_insurance_id
        });
      }
    }

    // Validar disponibilidad de horario
    const timeSlotAvailable = await validateTimeSlotAvailable(
      appointment.installation_date, 
      appointment.installation_time || '09:00:00'
    );
    if (!timeSlotAvailable) {
      validationErrors.push({
        field: 'appointment.installation_time',
        message: 'Time slot is already booked',
        value: `${appointment.installation_date} ${appointment.installation_time || '09:00:00'}`
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        data: false,
        message: 'Advanced validation failed',
        error: true,
        validation_errors: validationErrors
      });
    }

    next();

  } catch (error) {
    console.error('Advanced validation error:', error);
    return res.status(500).json({
      data: false,
      message: 'Internal validation error',
      error: true
    });
  }
};

// ============= OTROS MIDDLEWARES =============

export const validateSearchParams = async (req, res, next) => {
  // Implementación básica - puedes expandir según necesites
  next();
};

export const validateIdParam = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        data: false,
        message: 'Invalid ID parameter',
        error: true
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      data: false,
      message: 'Invalid ID parameter',
      error: true
    });
  }
};

export const validateAppointmentUpdateData = async (req, res, next) => {
  // Implementación básica - puedes expandir según necesites
  next();
};

export const validateDateRangeParams = async (req, res, next) => {
  // Implementación básica - puedes expandir según necesites
  next();
};

export const validateAvailabilityParams = async (req, res, next) => {
  // Implementación básica - puedes expandir según necesites
  next();
};

export const validateReportParams = async (req, res, next) => {
  // Implementación básica - puedes expandir según necesites
  next();
};

// ============= EXPORTACIONES =============

export default {
  validateAppointmentData,
  validateAdvancedAppointmentData,
  validateSearchParams,
  validateIdParam,
  validateAppointmentUpdateData,
  validateDateRangeParams,
  validateAvailabilityParams,
  validateReportParams,
  
  // Esquemas
  appointmentDataSchema,
  glassTypesSchema,
  glassFeaturesSchema,
  
  // Utilidades
  validateUniqueVin,
  validateCustomerExists,
  validateInsuranceExists,
  validateTimeSlotAvailable,
  formatYupErrors
};