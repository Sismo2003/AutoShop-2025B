// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Controller,
  useForm,
  useFieldArray
} from "react-hook-form";
import PropTypes from "prop-types";
import {useEffect, useState} from "react";

// Local Imports
import { Button, Input } from "components/ui";
import { useAddClientsFormContext } from "../AddClientFormContext.js";
import { Listbox } from "components/shared/form/Listbox";

import { vehicleSchema } from "../schema";

import { useDispatch, useSelector } from "react-redux";

import { registerCustomerThunk } from "slices/thunk";

import { toast } from 'sonner'
// ----------------------------------------------------------------------

// Door Options
const DOOR_OPTIONS = [
  { id: '2', label: '2 Doors' },
  { id: '4', label: '4 Doors' },
  { id: 'others', label: 'Others' }
];

// Common Colors
const VEHICLE_COLORS = [
  { id: 'black', label: 'Black' },
  { id: 'white', label: 'White' },
  { id: 'silver', label: 'Silver' },
  { id: 'gray', label: 'Gray' },
  { id: 'red', label: 'Red' },
  { id: 'blue', label: 'Blue' },
  { id: 'green', label: 'Green' },
  { id: 'brown', label: 'Brown' },
  { id: 'gold', label: 'Gold' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'orange', label: 'Orange' },
  { id: 'purple', label: 'Purple' },
  { id: 'other', label: 'Other' }
];

// ----------------------------------------------------------------------

// Servicio para obtener datos del VIN
const getVehicleDataFromVIN = async (vin) => {
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    );
    
    if (!response.ok) {
      throw new Error('Error al consultar la API');
    }
    
    const data = await response.json();
    
    if (data.Results && data.Results.length > 0) {
      const results = data.Results;
      
      // Extraer datos relevantes
      const vehicleData = {
        year: getValueFromResults(results, 'Model Year'),
        make: getValueFromResults(results, 'Make'),
        model: getValueFromResults(results, 'Model'),
        doors: getValueFromResults(results, 'Doors')
      };
      
      return vehicleData;
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener datos del VIN:', error);
    throw error;
  }
};

// Función auxiliar para extraer valores de los resultados
const getValueFromResults = (results, variableName) => {
  const result = results.find(item => item.Variable === variableName);
  return result && result.Value !== 'Not Applicable' && result.Value !== '' ? result.Value : null;
};

// ----------------------------------------------------------------------

export function Vehicles({ setCurrentStep,setFinished }) {
  const addClientsFormCtx = useAddClientsFormContext();
  const [vinLoading, setVinLoading] = useState({});
  const [vinErrors, setVinErrors] = useState({});
  const dispatch = useDispatch();
  
  const {   error , error_message } = useSelector((state) => state.customer);
  
  useEffect(() => {
    if (error) {
      toast.error(error_message);
    }
  },[error, error_message]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(vehicleSchema),
    defaultValues: {
      vehicles: addClientsFormCtx.state.formData.vehicles
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "vehicles"
  });
  
  const addVehicle = () => {
    append({
      year: null,
      make: '',
      model: '',
      color: '',
      vin_number: '',
      vehicle_doors: ''
    });
  };
  
  const removeVehicle = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };
  
  // Función para buscar datos del VIN
  const handleVINLookup = async (vin, index) => {
    if (!vin || vin.length !== 17) return;
    
    setVinLoading(prev => ({ ...prev, [index]: true }));
    setVinErrors(prev => ({ ...prev, [index]: null }));
    
    try {
      const vehicleData = await getVehicleDataFromVIN(vin);
      
      if (vehicleData) {
        // Llenar los campos automáticamente
        if (vehicleData.year) {
          setValue(`vehicles.${index}.year`, parseInt(vehicleData.year));
        }
        if (vehicleData.make) {
          setValue(`vehicles.${index}.make`, vehicleData.make);
        }
        if (vehicleData.model) {
          setValue(`vehicles.${index}.model`, vehicleData.model);
        }
        if (vehicleData.doors) {
          // Mapear el número de puertas al formato esperado
          const doorValue = vehicleData.doors === '2' ? '2' :
            vehicleData.doors === '4' ? '4' : 'others';
          setValue(`vehicles.${index}.vehicle_doors`, doorValue);
        }
        
        // Mostrar mensaje de éxito
        setVinErrors(prev => ({
          ...prev,
          [index]: { type: 'success', message: 'Datos del vehículo encontrados y completados automáticamente' }
        }));
      } else {
        setVinErrors(prev => ({
          ...prev,
          [index]: { type: 'warning', message: 'No se encontraron datos para este VIN' }
        }));
      }
    } catch (error) {
      console.error('Error al obtener datos del VIN:', error);
      setVinErrors(prev => ({
        ...prev,
        [index]: { type: 'error', message: 'Error al buscar datos del VIN. Intente nuevamente.' }
      }));
    } finally {
      setVinLoading(prev => ({ ...prev, [index]: false }));
    }
  };
  
  // Función para manejar el cambio del VIN
  const handleVINChange = (e, index) => {
    const value = e.target.value.toUpperCase();
    setValue(`vehicles.${index}.vin_number`, value);
    
    // Limpiar errores previos
    setVinErrors(prev => ({ ...prev, [index]: null }));
    
    // Auto-buscar cuando el VIN tenga 17 caracteres
    if (value.length === 17) {
      handleVINLookup(value, index);
    }
  };
  
  const onSubmit = async (data) => {
    addClientsFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { vehicles: data.vehicles },
    });
    addClientsFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { vehicles: { isDone: true } },
    });
    
    const allData = addClientsFormCtx.state.formData;
    allData.vehicles = data.vehicles;
    
    if (allData) {
      try {
        await dispatch(registerCustomerThunk(allData)).unwrap();
        console.log("Client created successfully 2: ", allData);
        setFinished(true); // Solo marca como terminado si fue exitoso
      } catch (error) {
        
        console.error("Error creating client 3:", error);
        // No llamamos a setFinished(true) aquí para mantener el paso como no completado
      }
    }
  };
  
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="space-y-6">
        
        {/* HEADER */}
        <div className="space-y-2">
          <h5 className="text-lg font-semibold text-gray-900 dark:text-dark-50">
            Vehicle Information
          </h5>
          <p className="text-sm text-gray-600 dark:text-dark-300">
            Please provide information about your vehicles. Enter the VIN number to auto-fill vehicle details.
          </p>
        </div>
        
        {/* VEHICLES LIST */}
        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-gray-50 dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-600">
              
              {/* Vehicle Header */}
              <div className="flex items-center justify-between mb-4">
                <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
                  Vehicle {index + 1}
                </h6>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeVehicle(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    variant="ghost"
                    size="sm"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Remove
                  </Button>
                )}
              </div>
              
              {/* Vehicle Fields */}
              <div className="space-y-4">
                
                {/* VIN Number - Primero para auto-completar */}
                <div className="relative">
                  <Input
                    {...register(`vehicles.${index}.vin_number`)}
                    label="VIN Number"
                    error={errors?.vehicles?.[index]?.vin_number?.message}
                    placeholder="Enter 17-character VIN to auto-fill details"
                    maxLength={17}
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => handleVINChange(e, index)}
                  />
                  
                  {/* Loading indicator */}
                  {vinLoading[index] && (
                    <div className="absolute right-3 top-8 flex items-center">
                      <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  
                  {/* VIN Status Messages */}
                  {vinErrors[index] && (
                    <div className={`mt-2 p-2 rounded text-sm ${
                      vinErrors[index].type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        vinErrors[index].type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {vinErrors[index].message}
                    </div>
                  )}
                </div>
                
                {/* Year and Make */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Input
                    {...register(`vehicles.${index}.year`)}
                    label="Year"
                    error={errors?.vehicles?.[index]?.year?.message}
                    placeholder="Ex: 2020"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                  
                  <Input
                    {...register(`vehicles.${index}.make`)}
                    label="Make"
                    error={errors?.vehicles?.[index]?.make?.message}
                    placeholder="Ex: Toyota, Ford, Honda"
                  />
                </div>
                
                {/* Model and Color */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Input
                    {...register(`vehicles.${index}.model`)}
                    label="Model"
                    error={errors?.vehicles?.[index]?.model?.message}
                    placeholder="Ex: Camry, F-150, Accord"
                  />
                  
                  <Controller
                    render={({ field: { value, onChange, ...rest } }) => (
                      <Listbox
                        data={VEHICLE_COLORS}
                        value={VEHICLE_COLORS.find((color) => color.id === value) || null}
                        onChange={(val) => onChange(val?.id || '')}
                        label="Color"
                        placeholder="Select Color"
                        displayField="label"
                        error={errors?.vehicles?.[index]?.color?.message}
                        {...rest}
                      />
                    )}
                    control={control}
                    name={`vehicles.${index}.color`}
                  />
                </div>
                
                {/* Doors */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Controller
                    render={({ field: { value, onChange, ...rest } }) => (
                      <Listbox
                        data={DOOR_OPTIONS}
                        value={DOOR_OPTIONS.find((door) => door.id === value) || null}
                        onChange={(val) => onChange(val?.id || '')}
                        label="Number of Doors"
                        placeholder="Select Doors"
                        displayField="label"
                        error={errors?.vehicles?.[index]?.vehicle_doors?.message}
                        {...rest}
                      />
                    )}
                    control={control}
                    name={`vehicles.${index}.vehicle_doors`}
                  />
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => {
                        const currentVin = watch(`vehicles.${index}.vin_number`);
                        if (currentVin && currentVin.length === 17) {
                          handleVINLookup(currentVin, index);
                        }
                      }}
                      variant="outline"
                      className="w-full"
                      disabled={vinLoading[index] || !watch(`vehicles.${index}.vin_number`) || watch(`vehicles.${index}.vin_number`).length !== 17}
                    >
                      {vinLoading[index] ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                          </svg>
                          Lookup VIN
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Vehicle Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={addVehicle}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Add Another Vehicle</span>
            </Button>
          </div>
        </div>
        
        {/* VALIDATION ERRORS */}
        {errors.vehicles && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Please fix the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {typeof errors.vehicles.message === 'string' && (
                    <p>{errors.vehicles.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* HELPFUL TIPS */}
        <div className="bg-blue-50 dark:bg-dark-700 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                VIN Auto-Fill Tips
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc list-inside space-y-1">
                  <li>Enter a complete 17-character VIN to automatically fill vehicle details</li>
                  <li>VIN numbers can be found on your vehicle registration, insurance card, or dashboard</li>
                  <li>VIN numbers dont include the letters I, O, or Q</li>
                  <li>The system will search for Year, Make, Model, and Door information</li>
                  <li>You can manually edit any auto-filled information if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(2)}>
          Prev
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}

Vehicles.propTypes = {
  setCurrentStep: PropTypes.func,
  setFinished: PropTypes.func,
};

export default Vehicles;