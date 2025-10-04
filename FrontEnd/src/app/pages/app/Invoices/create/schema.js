// Import Dependencies
import * as Yup from 'yup';
import dayjs from 'dayjs';

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

// Esquema de validación para el formulario de citas frontend
export const appointmentSchema = Yup.object().shape({
  // ============= INFORMACIÓN DEL CLIENTE =============
  customer_id: Yup.string()
    .required('Please select a customer'),
    
  customer_name: Yup.string()
    .trim()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name cannot exceed 100 characters')
    .required('Customer name is required'),
    
  customer_phone: Yup.string()
    .trim()
    .min(10, 'Phone must have at least 10 digits')
    .required('Customer phone is required'),
    
  customer_alt_phone: Yup.string()
    .trim()
    .min(10, 'Alternative phone must have at least 10 digits')
    .nullable(),
    
  customer_email: Yup.string()
    .email('Invalid email format')
    .nullable(),
    
  customer_address: Yup.string()
    .trim()
    .required('Street address is required'),
    
  customer_city: Yup.string()
    .trim()
    .required('City is required'),
    
  customer_state: Yup.string()
    .required('State is required'),
    
  customer_zip: Yup.string()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/, 'Invalid zip code format')
    .required('Zip code is required'),
    
  customer_apt_no: Yup.string()
    .trim()
    .nullable(),
    
  cross_street: Yup.string()
    .trim()
    .required('Cross street is required'),

  department_name: Yup.string()
    .trim()
    .nullable(),
    
  building: Yup.string()
    .trim()
    .nullable(),

  // ============= INFORMACIÓN DEL SEGURO (CONDICIONAL MEJORADA) =============
  has_insurance: Yup.mixed()
    .oneOf([true, false, "true", "false"], 'Please select a payment method')
    .required('Please select a payment method')
    .transform((value) => {
      // Convertir strings a booleans
      if (value === "true") return true;
      if (value === "false") return false;
      return value;
    }),
  
  // Validaciones condicionales para seguro
  insurance_company: Yup.string()
    .when('has_insurance', {
      is: (value) => value === true || value === "true",
      then: (schema) => schema.required('Insurance company is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  policy_number: Yup.string()
    .when('has_insurance', {
      is: (value) => value === true || value === "true",
      then: (schema) => schema.trim().required('Policy number is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  insurance_phone: Yup.string()
    .when('has_insurance', {
      is: (value) => value === true || value === "true",
      then: (schema) => schema.trim().required('Insurance phone is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  date_of_loss: Yup.string()
    .test('date-format', 'Date must be in YYYY-MM-DD format', function(value) {
      if (!value || value === "") return true;
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    })
    .when('has_insurance', {
      is: (value) => value === true || value === "true",
      then: (schema) => schema.required('Date of loss is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  glass_deductible: Yup.number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === null || originalValue === undefined) {
        return undefined;
      }
      if (typeof originalValue === "string" && !isNaN(Number(originalValue))) {
        return Number(originalValue);
      }
      return value;
    })
    .when('has_insurance', {
      is: (value) => value === true || value === "true",
      then: (schema) => schema
        .typeError('Glass deductible must be a valid number')
        .min(0, 'Glass deductible must be positive')
        .required('Glass deductible is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  safelife: Yup.string()
    .trim()
    .nullable()
    .optional(),
    
  lynx_dispatch: Yup.string()
    .trim()
    .nullable()
    .optional(),
    
  other_insurance_info: Yup.string()
    .trim()
    .nullable()
    .optional(),

  // ============= INFORMACIÓN DEL VEHÍCULO =============
  selected_vehicle_id: Yup.string()
    .nullable()
    .optional(),
  vehicle_year: Yup.string()
    .trim()
    .matches(/^\d{4}$/, 'Year must be 4 digits')
    .required('Vehicle year is required'),
    
  vehicle_make: Yup.string()
    .trim()
    .required('Vehicle make is required'),
    
  vehicle_model: Yup.string()
    .trim()
    .required('Vehicle model is required'),
    
  vehicle_color: Yup.string()
    .trim()
    .required('Vehicle color is required'),
    
  vin: Yup.string()
    .trim()
    .min(17, 'VIN must be 17 characters')
    .max(17, 'VIN must be 17 characters')
    .required('VIN is required'),
    
  part_number: Yup.string()
    .trim()
    .required('Part number is required'),

  // ============= TIPOS DE VIDRIO (OBLIGATORIO AL MENOS UNO) =============
  has_windshield: Yup.boolean(),
  has_door_glass: Yup.boolean(),
  has_back_glass: Yup.boolean(),
  has_vent_glass: Yup.boolean(),
  has_quarter_glass: Yup.boolean(),

  // ============= CARACTERÍSTICAS DEL VIDRIO (OPCIONALES) =============
  has_2d: Yup.boolean(),
  has_4d: Yup.boolean(),
  has_ldws: Yup.boolean(),
  has_hud: Yup.boolean(),
  has_heated: Yup.boolean(),
  has_antenna: Yup.boolean(),
  has_rain_sensor: Yup.boolean(),
  has_tint_strip: Yup.boolean(),
  has_windshield_tint: Yup.boolean(),
  has_chrome: Yup.boolean(),
  has_black: Yup.boolean(),

  // ============= INFORMACIÓN DEL PERSONAL =============
  tech_name: Yup.string()
    .trim()
    .required('Technician name is required'),
    
  service_advisor: Yup.string()
    .trim()
    .required('Service advisor is required'),
    
  sales_person: Yup.string()
    .trim()
    .required('Sales person is required'),
    
  edirect: Yup.string()
    .trim()
    .nullable()
    .optional(),
    
  origin: Yup.string()
    .trim(),
    // .required('Origin is required'),

  // ============= FECHA DE INSTALACIÓN =============
  installation_date: Yup.string()
    .test('date-format', 'Date must be in YYYY-MM-DD format', function(value) {
      if (!value || value === "") return true;
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    })
    .test('is-future-date', 'Installation date cannot be in the past', function(value) {
      if (!value || value === "") return true;
      
      const selectedDate = dayjs(value);
      const today = dayjs().startOf('day');
      
      if (!selectedDate.isValid()) return false;
      
      return selectedDate.isSameOrAfter(today);
    })
    .required('Installation date is required'),

  installation_time: Yup.string()
    .oneOf(['6-10', '8-12', '10-2', '2-4', 'all day'], 'Please select a valid time slot')
    .required('Installation time is required'),

  // ============= TIPO DE DIRECCIÓN =============
  location_type: Yup.string()
    .oneOf(['address_customer', 'in_shop', 'other_address'], 'Please select a valid location type')
    .required('Location type is required'),

  // ============= DIRECCIÓN ALTERNATIVA (CONDICIONAL) =============
  app_type_of_place: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.trim().required('App type of place is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  business_name: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.trim().required('Business name is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  install_address: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.trim().required('Install address is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  install_apt_suite: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.trim().nullable().optional(),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  install_city: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.trim().required('Install city is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  install_state: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.required('Install state is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  install_zip: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.trim().matches(/^\d{5}(-\d{4})?$/, 'Invalid zip code').required('Install zip is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  install_dept_name: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.trim().nullable().optional(),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  install_building: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.trim().nullable().optional(),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  install_cross_street: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.trim().required('Cross street is required for alternate address'),
      otherwise: (schema) => schema.nullable().optional()
    }),

    
  install_contact: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.trim().required('Contact name is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  install_phone: Yup.string()
    .when('location_type', {
      is: 'other_address',
      then: (schema) => schema.trim().min(10, 'Phone must have at least 10 digits').required('Contact phone is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),

  // ============= INFORMACIÓN DE REBATE (SOLO SI USA SEGURO) =============
  rebate_type: Yup.string()
    .when('has_insurance', {
      is: (value) => value === true || value === "true",
      then: (schema) => schema.oneOf(['check', 'cash'], 'Please select rebate type').required('Rebate type is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  rebate_amount: Yup.number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === null || originalValue === undefined) {
        return undefined;
      }
      if (typeof originalValue === "string" && !isNaN(Number(originalValue))) {
        return Number(originalValue);
      }
      return value;
    })
    .when('has_insurance', {
      is: (value) => value === true || value === "true",
      then: (schema) => schema
        .typeError('Rebate amount must be a valid number')
        .min(0, 'Rebate amount must be positive')
        .required('Rebate amount is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),
    
  rebate_observations: Yup.string()
    .when('has_insurance', {
      is: (value) => value === true || value === "true",
      then: (schema) => schema.trim().nullable().optional(),
      otherwise: (schema) => schema.nullable().optional()
    }),
  
  // ============= CASH PAYMENT (SOLO SI NO USA SEGURO) =============
  replacement_cash_price: Yup.number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === null || originalValue === undefined) {
        return undefined;
      }
      if (typeof originalValue === "string" && !isNaN(Number(originalValue))) {
        return Number(originalValue);
      }
      return value;
    })
    .when('has_insurance', {
      is: (value) => value === false || value === "false",
      then: (schema) => schema
        .typeError('Cash price must be a valid number')
        .min(0, 'Cash price must be positive')
        .required('Replacement cash price is required'),
      otherwise: (schema) => schema.nullable().optional()
    }),

  // ============= VALIDACIÓN PERSONALIZADA PARA TIPOS DE VIDRIO =============
}).test('at-least-one-glass-type', 'Must select at least one glass type', function(values) {
  const glassTypes = [
    values.has_windshield,
    values.has_door_glass,
    values.has_back_glass,
    values.has_vent_glass,
    values.has_quarter_glass
  ];
  
  const hasAtLeastOneGlass = glassTypes.some(type => type === true);
  
  if (!hasAtLeastOneGlass) {
    return this.createError({
      path: 'glass_types',
      message: 'Must select at least one glass type'
    });
  }
  
  return true;
})
// Validación cruzada para payment method
.test('payment-method-validation', 'Payment method validation failed', function(values) {
  const errors = [];
  
  // Si usa seguro, debe tener rebate info
  if (values.has_insurance === true || values.has_insurance === "true") {
    if (!values.rebate_type || !values.rebate_amount) {
      errors.push(this.createError({
        path: 'rebate_info',
        message: 'Rebate information is required when using insurance'
      }));
    }
    
    // No debe tener cash price si usa seguro
    if (values.replacement_cash_price) {
      errors.push(this.createError({
        path: 'replacement_cash_price',
        message: 'Cash price should not be set when using insurance'
      }));
    }
  }
  
  // Si NO usa seguro, debe tener cash price
  if (values.has_insurance === false || values.has_insurance === "false") {
    if (!values.replacement_cash_price) {
      errors.push(this.createError({
        path: 'replacement_cash_price',
        message: 'Cash price is required when not using insurance'
      }));
    }
    
    // No debe tener rebate info si no usa seguro
    if (values.rebate_type || values.rebate_amount) {
      errors.push(this.createError({
        path: 'rebate_info',
        message: 'Rebate information should not be set when paying cash'
      }));
    }
  }
  
  if (errors.length > 0) {
    return new Yup.ValidationError(errors);
  }
  
  return true;
});