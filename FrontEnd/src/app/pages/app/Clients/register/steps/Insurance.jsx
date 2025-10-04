// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Controller,
  useForm
} from "react-hook-form";
import PropTypes from "prop-types";

// Local Imports
import { Button, Input, Switch } from "components/ui";
import { useAddClientsFormContext } from "../AddClientFormContext.js";
import { Listbox } from "components/shared/form/Listbox";
import { useEffect, useState } from "react";
import { insuranceOptionalSchema } from "../schema.js"

// ----------------------------------------------------------------------

// Insurance Companies - Common US auto glass insurance providers
const INSURANCE_COMPANIES = [
  { id: 'state-farm', label: 'State Farm' },
  { id: 'geico', label: 'GEICO' },
  { id: 'progressive', label: 'Progressive' },
  { id: 'allstate', label: 'Allstate' },
  { id: 'usaa', label: 'USAA' },
  { id: 'farmers', label: 'Farmers' },
  { id: 'liberty-mutual', label: 'Liberty Mutual' },
  { id: 'nationwide', label: 'Nationwide' },
  { id: 'american-family', label: 'American Family' },
  { id: 'travelers', label: 'Travelers' },
  { id: 'aaa', label: 'AAA' },
  { id: 'mercury', label: 'Mercury' },
  { id: 'esurance', label: 'Esurance' },
  { id: 'the-general', label: 'The General' },
  { id: 'safe-auto', label: 'Safe Auto' },
  { id: 'other', label: 'Other' }
];

// ----------------------------------------------------------------------

export function Insurance({ setCurrentStep }) {
  const addClientsFormCtx = useAddClientsFormContext();
  
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  
  useEffect(() => {
    setInsuranceCompanies(INSURANCE_COMPANIES);
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(insuranceOptionalSchema),
    defaultValues: addClientsFormCtx.state.formData.insurance,
  });
  
  const selectedCompany = watch('company_name');
  const hasInsurance = watch('has_insurance');
  
  // Reset insurance fields when toggling has_insurance
  useEffect(() => {
    if (!hasInsurance) {
      reset({
        has_insurance: false,
        company_name: "",
        policy_number: "",
        insurance_phone: "",
      });
    }
  }, [hasInsurance, reset]);
  
  const onSubmit = (data) => {
    addClientsFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { insurance: { ...data } },
    });
    addClientsFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { insurance: { isDone: true } },
    });
    setCurrentStep(3); // Next step
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="space-y-6">
        
        {/* INSURANCE TOGGLE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
            <div>
              <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
                Do you have insurance?
              </h6>
              <p className="text-sm text-gray-600 dark:text-dark-300 mt-1">
                Toggle this option if you have auto insurance coverage
              </p>
            </div>
            <Controller
              render={({ field: { value, onChange, ...rest } }) => (
                <Switch
                  checked={value}
                  onChange={onChange}
                  label=""
                  {...rest}
                />
              )}
              control={control}
              name="has_insurance"
            />
          </div>
        </div>
        
        {/* INSURANCE INFORMATION - Only show if has_insurance is true */}
        {hasInsurance && (
          <div className="space-y-4">
            <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
              <span>Insurance Information</span>
            </h6>
            
            <div className="grid gap-4 lg:grid-cols-2">
              <Controller
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={insuranceCompanies}
                    value={insuranceCompanies.find((company) => company.id === value) || null}
                    onChange={(val) => onChange(val.id)}
                    label="Insurance Company*"
                    placeholder="Select Insurance Company"
                    displayField="label"
                    error={errors?.company_name?.message}
                    {...rest}
                  />
                )}
                control={control}
                name="company_name"
              />
              
              <Input
                {...register("policy_number")}
                label="Policy Number*"
                error={errors?.policy_number?.message}
                placeholder="Ex: ABC123456789"
              />
            </div>
            
            <div className="grid gap-4 lg:grid-cols-2">
              <Input
                {...register("insurance_phone")}
                label="Insurance Phone"
                error={errors?.insurance_phone?.message}
                placeholder="Ex: (555) 123-4567"
                type="tel"
              />
            </div>
          </div>
        )}
        
        {/* NO INSURANCE MESSAGE */}
        {!hasInsurance && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  No Insurance Selected
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Please note that without insurance, you may be responsible for the full cost of the service.
                    We recommend checking with your insurance provider to see if auto glass repair is covered.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* ADDITIONAL INFORMATION - Only show if has insurance */}
        {hasInsurance && (
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-900 dark:text-dark-50 border-b border-gray-200 dark:border-dark-500 pb-2">
              Additional Information
            </h6>
            
            <div className="bg-blue-50 dark:bg-dark-700 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Insurance Tips
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Have your insurance card ready for accurate information</li>
                      <li>Policy numbers are usually found on your insurance card</li>
                      <li>Contact your insurance company if you&apos;re unsure about coverage</li>
                      {selectedCompany === 'other' && (
                        <li className="text-orange-600 dark:text-orange-400">
                          <strong>Other insurance selected:</strong> Please ensure the company name is spelled correctly
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(1)}>
          Prev
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}

Insurance.propTypes = {
  setCurrentStep: PropTypes.func,
};

export default Insurance;