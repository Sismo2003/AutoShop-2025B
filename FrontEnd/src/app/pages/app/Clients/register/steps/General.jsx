// Import Dependencies
import {
  useForm
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PropTypes from "prop-types";

// Local Imports
import {
  Button,
  Input,
} from "components/ui";
import { useAddClientsFormContext } from "../AddClientFormContext.js";
import { generalSchema } from "../schema";

// ----------------------------------------------------------------------

const countryOptions = [
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' }
];

export function General({ setCurrentStep }) {
  const addClientsFormCtx = useAddClientsFormContext();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    // watch,
    // setValue,
  } = useForm({
    resolver: yupResolver(generalSchema),
    defaultValues: (addClientsFormCtx.state.formData.general),
  });
  
  const onSubmit = (data) => {
    addClientsFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { general: { ...data } },
    });
    addClientsFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { general: { isDone: true } },
    });
    setCurrentStep(1);
  };
  
  const PhoneInput = ({
                        name,
                        countryCodeName,
                        label,
                        placeholder,
                        error,
                        required = false
                      }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-100">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex rounded-lg border border-gray-300 dark:border-dark-500 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <select
            {...register(countryCodeName)}
            className="bg-gray-50 dark:bg-dark-700 border-0 text-sm px-3 py-2 focus:outline-none focus:bg-white dark:focus:bg-dark-600 min-w-[120px] text-gray-900 dark:text-dark-100"
          >
            {countryOptions.map((option, index) => (
              <option key={index} value={option.code}>
                {option.flag} {option.code}
              </option>
            ))}
          </select>
          <div className="w-px bg-gray-300 dark:bg-dark-500"></div>
          <input
            {...register(name)}
            type="tel"
            placeholder={placeholder}
            className="flex-1 border-0 px-3 py-2 text-sm focus:outline-none placeholder-gray-400 dark:placeholder-dark-300 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
        )}
      </div>
    );
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="space-y-6">
        
        {/* CUSTOMER INFORMATION */}
        <div className="space-y-4">
          <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
            <span>Customer Information</span>
          </h6>
          <p className="text-sm text-gray-600 dark:text-dark-300">
            Please provide the customers basic information
          </p>
          
          {/* Full Name */}
          <Input
            {...register("fullName")}
            label={
              <>
                Full Name <span className="text-red-500">*</span>
              </>
            }
            error={errors?.fullName?.message}
            placeholder="Enter customer full name"
          />
          
          {/* Phone Numbers */}
          <div className="grid gap-4 lg:grid-cols-2">
            <PhoneInput
              name="phoneNumber"
              countryCodeName="phoneCountryCode"
              label="Phone Number"
              placeholder="(480) 923 9000"
              error={errors?.phoneNumber?.message}
              required
            />
            
            <PhoneInput
              name="secondaryPhoneNumber"
              countryCodeName="secondaryPhoneCountryCode"
              label="Secondary Phone Number"
              placeholder="(480) 923 9000"
              error={errors?.secondaryPhoneNumber?.message}
            />
          </div>
          
          {/* Email */}
          <Input
            {...register("email")}
            type="email"
            label="Email Address"
            error={errors?.email?.message}
            placeholder="Enter customer email address"
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <Button className="min-w-[7rem]">Cancel</Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}

General.propTypes = {
  setCurrentStep: PropTypes.func,
};