// Import Dependencies
import { useReducer } from "react";
import PropTypes from "prop-types";

// Local Imports
import { AddClientsFormContextProvider } from "./AddClientFormContext.js";
// import { Delta } from "components/shared/form/TextEditor";

// ----------------------------------------------------------------------

// Initial State
const initialState = {
  formData: {
    general: {
      fullName: "",
      
      // Main phone
      phoneCountryCode: "+1",
      phoneNumber: "",
      // secondary phone
      secondaryPhoneCountryCode: "+1",
      secondaryPhoneNumber: "",
      email: ""
    },
    address: {
      property_type: "",
      is_commercial: false,
      business_name: "",
      street_address: "",
      main_cross_streets: "",
      zipcode: "",
      city: "",
      state: 'AZ',
      apartment_name: "",
      unit_number: "",
      building: "",
      gate_code: "",
      special_instructions: "",
    },
    insurance: {
      has_insurance: false,
      company_name: "",
      policy_number: "",
      insurance_phone: "",
    },
    vehicles: [
      {
        year: null,
        make: '',
        model: '',
        color: '',
        vin_number: '',
        vehicle_doors: ''
      }
    ]
  },
  stepStatus: {
    general: {
      isDone: false,
    },
    address: {
      isDone: false,
    },
    insurance: {
      isDone: false,
    },
    vehicles: {
      isDone: false,
    },
  },
};




const reducerHandlers = {
  SET_FORM_DATA: (state, action) => {
    return {
      ...state,
      formData: {
        ...state.formData,
        ...action.payload,
      },
    };
  },
  SET_STEP_STATUS: (state, action) => {
    return {
      ...state,
      stepStatus: {
        ...state.stepStatus,
        ...action.payload,
      },
    };
  },
};

const reducer = (state, action) =>
  reducerHandlers[action.type]?.(state, action) || state;

export function AddClientsFormProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return (
    <AddClientsFormContextProvider value={value}>
      {children}
    </AddClientsFormContextProvider>
  );
}

AddClientsFormProvider.propTypes = {
  children: PropTypes.node,
};
