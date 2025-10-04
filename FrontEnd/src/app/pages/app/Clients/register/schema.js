// Import Dependencies
import * as Yup from 'yup'


// ----------------------------------------------------------------------


export const generalSchema = Yup.object().shape({
    fullName: Yup.string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(99, 'Name cannot exceed 99 characters')
      .required('Full name is required'),
    
    
    phoneNumber: Yup.string()
      .trim()
      .matches(
        /^(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
        'Enter a valid phone number (e.g., 123-456-7890)'
      )
      .required('Primary phone number is required'),
    
    secondaryPhoneNumber: Yup.string()
      .trim()
      .matches(
        /^(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
        'Enter a valid phone number (e.g., 123-456-7890)'
      )
      .nullable()
      .transform(value => value === '' ? null : value),
    
    email: Yup.string()
      .trim()
      .email('Please enter a valid email address')
      .max(100, 'Email cannot exceed 100 characters')
      .nullable()
      .transform(value => value === '' ? null : value),

});

export const addressSchema = Yup.object().shape({
    // Property Information
    property_type: Yup.string()
      .oneOf(['house', 'apartment', 'condo', 'restaurant', 'office', 'warehouse', 'other'], 'Invalid property type')
      .required('Property type is required'),
    
    is_commercial: Yup.boolean().default(false),
    
    business_name: Yup.string()
      .trim()
      .max(100, 'Business name must be 100 characters or less')
      .when('is_commercial', {
          is: true,
          then: (schema) => schema.required('Business name is required for commercial properties'),
          otherwise: (schema) => schema.nullable(),
      }),
    
    // Address Information (Required fields)
    street_address: Yup.string()
      .trim()
      .max(100, 'Street address must be 100 characters or less')
      .required('Street address is required'),
    
    main_cross_streets: Yup.string()
      .trim()
      .max(255, 'Cross streets description too long')
      .nullable(),
    
    zipcode: Yup.string()
      .trim()
      .matches(/^\d{5}(-\d{4})?$/, 'Invalid zipcode format')
      .max(10, 'Zipcode must be 10 characters or less')
      .required('Zipcode is required'),
    
    city: Yup.string()
      .trim()
      .max(50, 'City name must be 50 characters or less')
      .required('City is required'),
    
    state: Yup.string()
      .length(2, 'State must be 2 characters')
      .required('State is required'),
    
    // Unit Details (Optional fields, but conditional validation)
    apartment_name: Yup.string()
      .trim()
      .max(100, 'Apartment name must be 100 characters or less')
      .nullable(),
    
    unit_number: Yup.string()
      .trim()
      .max(20, 'Unit number must be 20 characters or less')
      .when('property_type', {
          is: (val) => ['apartment', 'condo', 'office'].includes(val),
          then: (schema) => schema.required('Unit number is required for this property type'),
          otherwise: (schema) => schema.nullable(),
      }),
    
    building: Yup.string()
      .trim()
      .max(50, 'Building name must be 50 characters or less')
      .nullable(),
    
    gate_code: Yup.string()
      .trim()
      .max(10, 'Gate code must be 10 characters or less')
      .nullable(),
    
    // Additional Information
    special_instructions: Yup.string()
      .trim()
      .max(1000, 'Special instructions must be 1000 characters or less')
      .nullable(),
});

export const insuranceOptionalSchema = Yup.object().shape({
    has_insurance: Yup.boolean().default(false),
    
    company_name: Yup.string()
      .trim()
      .max(100, 'Insurance company name must be 100 characters or less')
      .when('has_insurance', {
          is: true,
          then: (schema) => schema.required('Insurance company is required'),
          otherwise: (schema) => schema.nullable(),
      }),
    
    policy_number: Yup.string()
      .trim()
      .max(100, 'Policy number must be 100 characters or less')
      .when('has_insurance', {
          is: true,
          then: (schema) => schema.required('Policy number is required'),
          otherwise: (schema) => schema.nullable(),
      }),
    
    insurance_phone: Yup.string()
      .trim()
      .max(20, 'Phone number must be 20 characters or less')
      .when('has_insurance', {
          is: true,
          then: (schema) => schema
            .matches(
              /^(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
              'Invalid phone number format'
            )
            .required('Phone number is required'),
          otherwise: (schema) => schema.nullable(),
      }),
});

export const  vehicleSchema = Yup.object().shape({
    vehicles: Yup.array().of(
      Yup.object().shape({
          year: Yup
            .number()
            .integer('Year must be a whole number')
            .min(1900, 'Year must be 1900 or later')
            .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
            .nullable()
            .transform((value, originalValue) => {
                return originalValue === '' ? null : value;
            }),
          make: Yup
            .string()
            .max(100, 'Make cannot exceed 100 characters')
            .nullable()
            .transform((value, originalValue) => {
                return originalValue === '' ? null : value;
            }),
          model: Yup
            .string()
            .max(100, 'Model cannot exceed 100 characters')
            .nullable()
            .transform((value, originalValue) => {
                return originalValue === '' ? null : value;
            }),
          color: Yup
            .string()
            .max(50, 'Color cannot exceed 50 characters')
            .nullable(),
          vin_number: Yup
            .string()
            .max(100, 'VIN cannot exceed 100 characters')
            .matches(/^[A-HJ-NPR-Z0-9]{17}$|^$/, 'VIN must be exactly 17 characters (letters and numbers, excluding I, O, Q)')
            .nullable()
            .transform((value, originalValue) => {
                return originalValue === '' ? null : value;
            }),
          vehicle_doors: Yup
            .string()
            .oneOf(['2', '4', 'others'], 'Please select a valid door option')
            .nullable()
      })
    ).min(1, 'At least one vehicle is required')
});


