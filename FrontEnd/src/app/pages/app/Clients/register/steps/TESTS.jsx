// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Controller,
  useForm
} from "react-hook-form";
import PropTypes from "prop-types";

// Local Imports
import TextareaAutosize from "react-textarea-autosize";

import { Button, Input } from "components/ui";
import { useAddClientsFormContext } from "../AddClientFormContext.js";
import { addressSchema } from "../schema";

import { ALL_STATES } from "./values/states.js";
import { Listbox } from "components/shared/form/Listbox";
import {useEffect, useState} from "react";

// ----------------------------------------------------------------------

// Property type options
const PROPERTY_TYPES = [
  { id: 'house', label: 'House' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'condo', label: 'Condo' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'office', label: 'Office' },
  { id: 'warehouse', label: 'Warehouse' },
  { id: 'other', label: 'Other' }
];

export function Address({ setCurrentStep }) {
  const addClientsFormCtx = useAddClientsFormContext();
  
  const [states, setStates] = useState([]);
  
  useEffect(() => {
    if (ALL_STATES) {
      const transformedStates = Object.entries(ALL_STATES).map(([label, id]) => ({
        id,
        label
      }));
      setStates(transformedStates);
    }
  }, [ALL_STATES]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch
  } = useForm({
    resolver: yupResolver(addressSchema),
    defaultValues: addClientsFormCtx.state.formData.description,
  });
  
  // Watch property type and is_commercial to show/hide relevant fields
  const propertyType = watch('property_type');
  const isCommercial = watch('is_commercial');
  
  console.log(states)
  const onSubmit = (data) => {
    addClientsFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { address: { ...data } },
    });
    addClientsFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { address: { isDone: true } },
    });
    setCurrentStep(2);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="space-y-6">
        
        {/* PROPERTY TYPE */}
        <div className="space-y-4">
          <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
            <span>Property Information</span>
          </h6>
          <div className="grid gap-4 lg:grid-cols-2">
            <Controller
              render={({ field: { value, onChange, ...rest } }) => (
                <Listbox
                  data={PROPERTY_TYPES}
                  value={PROPERTY_TYPES.find((type) => type.id === value) || null}
                  onChange={(val) => onChange(val.id)}
                  label="Property Type*"
                  placeholder="Select Property Type"
                  displayField="label"
                  error={errors?.property_type?.message}
                  {...rest}
                />
              )}
              control={control}
              name="property_type"
            />
            
            <div className="flex items-center space-x-2">
              <input
                {...register("is_commercial")}
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-dark-100">
                Commercial Property
              </label>
            </div>
          </div>
          
          {/* Business Name - Show only if commercial */}
          {isCommercial && (
            <Input
              {...register("business_name")}
              label="Business Name"
              error={errors?.business_name?.message}
              placeholder="Ex: ABC Restaurant"
            />
          )}
        </div>
        
        {/* ADDRESS */}
        <div className="space-y-4">
          <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
            <span>Address Information</span>
          </h6>
          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              {...register("street_address")}
              component={TextareaAutosize}
              label="Street Address*"
              error={errors?.street_address?.message}
              placeholder="Ex: 1983 East Main Street"
              minRows={2}
            />
            <Input
              {...register("main_cross_streets")}
              label="Main Cross Streets"
              error={errors?.main_cross_streets?.message}
              placeholder="Ex: Between 1st Ave and 2nd Ave"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              {...register("zipcode")}
              label="ZipCode*"
              error={errors?.zipcode?.message}
              placeholder="Ex: 85213"
              maxLength="10"
            />
            <Input
              {...register("city")}
              label="City*"
              error={errors?.city?.message}
              placeholder="Ex: Mesa"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Controller
              render={({ field: { value, onChange, ...rest } }) => (
                <Listbox
                  data={states}
                  value={states.find((state) => state.id === value) || null}
                  onChange={(val) => onChange(val.id)}
                  label="State*"
                  placeholder="Select State"
                  displayField="label"
                  error={errors?.state?.message}
                  {...rest}
                />
              )}
              control={control}
              name="state"
            />
          </div>
        </div>
        
        {/* APARTMENT/UNIT DETAILS - Show only for apartment, condo, office, warehouse */}
        {(['apartment', 'condo', 'office', 'warehouse'].includes(propertyType)) && (
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              {propertyType === 'apartment' || propertyType === 'condo' ? 'Apartment/Condo Details' : 'Unit Details'}
            </h6>
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                {...register("apartment_name")}
                label="Apartment/Building Name"
                error={errors?.apartment_name?.message}
                placeholder="Ex: Sunset Apartments"
              />
              <Input
                {...register("unit_number")}
                label="Unit/Apartment Number"
                error={errors?.unit_number?.message}
                placeholder="Ex: 32A"
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                {...register("building")}
                label="Building"
                error={errors?.building?.message}
                placeholder="Ex: Building A"
              />
              <Input
                {...register("gate_code")}
                label="Gate Code"
                error={errors?.gate_code?.message}
                placeholder="Ex: #0234"
              />
            </div>
          </div>
        )}
        
        {/* SPECIAL INSTRUCTIONS */}
        <div className="space-y-4">
          <Input
            {...register("special_instructions")}
            component={TextareaAutosize}
            label={
              <>
                Special Instructions{" "}
                <span className="text-xs text-gray-400 dark:text-dark-300">
                  (optional)
                </span>
              </>
            }
            error={errors?.special_instructions?.message}
            placeholder="Ex: Blue house next to San Pablo pharmacy, use side entrance"
            minRows={3}
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(0)}>
          Prev
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}

Address.propTypes = {
  setCurrentStep: PropTypes.func,
};