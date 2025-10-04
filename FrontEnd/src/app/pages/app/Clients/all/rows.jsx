// Import Dependencies
import { useState } from "react";
import { toast } from "sonner";
// import { CheckIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";

// Local Imports
// rows.js
// import { twMerge } from "tailwind-variants"; // si usas Tailwind
import {
  // HiOutlinePhone,
  HiOutlineMail,
  // HiOutlineShieldCheck
} from "react-icons/hi";


import { PhoneIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

// import { Avatar, Badge, Swap, SwapOff, SwapOn } from "components/ui";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
// import { rolesOptions } from "./data";
import { Highlight } from "components/shared/Highlight";
import { ensureString } from "utils/ensureString";


import { useTwilioContext } from 'app/contexts/twilio/context.js';

function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return phoneNumber;

  // Eliminar todo lo que no sea dígito o signo +
  const cleaned = phoneNumber.toString().replace(/[^\d+]/g, '');

  // Patrón para números norteamericanos: +1 seguido de 10 dígitos
  const usPattern = /^\+1(\d{10})$/;

  if (usPattern.test(cleaned)) {
    const match = cleaned.match(usPattern);
    const [, number] = match;
    return `+1 (${number.substring(0, 3)}) ${number.substring(3, 6)} ${number.substring(6, 10)}`;
  }

  // Si no coincide con ningún formato conocido, devolver el original
  return phoneNumber;
}

export function CustomerName({ getValue, column, table }) {
  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());
  const val = getValue();

  const [fullname, email] = val.split(', ').map(item =>
    item === 'null' ? null : item
  );

  return (
    <div className="flex flex-col">
      <span className="font-medium capitalize">
        <Highlight query={[globalQuery, columnQuery]}>{fullname}</Highlight>
      </span>
      {email ? (
        <div className="flex items-center gap-2">
          <HiOutlineMail className="text-gray-400" />
          <span className="text-sm text-gray-700">
            <Highlight query={[globalQuery, columnQuery]}>{email || "N/A"}</Highlight>
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function PhoneCell({ getValue, column, table }) {
  const { startCall } = useTwilioContext();
  const val = getValue();

  const [customer_phone, customer_secondary_phone] = val.split(', ').map(item =>
    item === 'null' ? null : item
  );

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      startCall(phoneNumber);
    }
  };

  const PhoneLink = ({ phone, label, className = "" }) => {
    const globalQuery = ensureString(table.getState().globalFilter);
    const columnQuery = ensureString(column.getFilterValue());
    if (!phone) return null;

    const formattedPhone = formatPhoneNumber(phone);
    return (
      <div
        className={`
          group flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-200 cursor-pointer
          hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300
          ${className}
        `}
        onClick={() => handleCall(phone)}
      >
        <PhoneIcon className="w-4 h-4 opacity-60 group-hover:opacity-100" />
        <div className="flex flex-col min-w-0"> {/* Añadido min-w-0 para evitar desbordamiento */}
          {label && (
            <span className="text-xs text-gray-500 dark:text-dark-400 leading-tight">
              {label}
            </span>
          )}
          <div className="whitespace-nowrap overflow-hidden text-ellipsis"> {/* Contenedor para el número */}
            <Highlight query={[globalQuery, columnQuery]}>{formattedPhone}</Highlight>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      <PhoneLink
        phone={customer_phone}
        label="Primary"
        className="text-gray-800 dark:text-dark-100"
      />

      {customer_secondary_phone && (
        <PhoneLink
          phone={customer_secondary_phone}
          label="Secondary"
          className="text-gray-600 dark:text-dark-300"
        />
      )}
      {!customer_phone && !customer_secondary_phone && (
        <div className="text-sm text-gray-400 dark:text-dark-500 italic">
          No phone available
        </div>
      )}
    </div>
  );
}

export const InsuranceCell = ({ getValue,column, table  }) => {
  const { startCall } = useTwilioContext();

  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());

  const val = getValue();

  const [insurance_name, insurance_phone_number] = val.split(', ').map(item =>
    item === 'null' ? null : item
  );
  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      startCall(phoneNumber);
    }
  };

  const hasInsurance = insurance_name && insurance_name !== "No Insurance";
  const hasPhone = insurance_phone_number;

  const formattedPhone = formatPhoneNumber(insurance_phone_number);


  return (
    <div className="flex flex-col space-y-1">
      {/* Insurance Name with Icon */}
      <div className="flex items-center ">
        <ShieldCheckIcon className={`w-4 h-4 ${
          hasInsurance
            ? 'text-green-500 dark:text-green-400'
            : 'text-gray-400 dark:text-dark-500'
        }`} />
        <Highlight query={[globalQuery, columnQuery]}
         className={`font-semibold   ${
           hasInsurance
             ? 'text-gray-800 dark:text-dark-100'
             : 'text-gray-500 dark:text-dark-400'
         }`}
        >{insurance_name || "No Insurance"}
        </Highlight>
      </div>

      {/* Phone Number */}
      {hasPhone ? (
        <div
          className="
            group flex items-center cursor-pointer text-sm
            text-gray-600 dark:text-dark-300
            hover:text-blue-600 dark:hover:text-blue-300
            transition-colors duration-200
          "
          onClick={() => handleCall(insurance_phone_number)}
        >
          <PhoneIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          <Highlight query={[globalQuery, columnQuery]}
            className="font-medium "
          >{formattedPhone || "No phone"}</Highlight>

          {/*<span className="font-medium">{insurance_phone_number}</span>*/}
        </div>
      ) : hasInsurance && (
        <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-dark-500">
          <PhoneIcon className="w-3.5 h-3.5 opacity-50" />
          <span className="italic">No phone</span>
        </div>
      )}
    </div>
  );
};

export const InfoCell = ({ getValue,column, table  }) => {

  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());
  const val = getValue();

  const [customer_insurance_policy_number, last_updated_at_customer, last_updated_at_insurance] = val.split(', ').map(item =>
    item === 'null' ? null : item
  );

  return (
    <div className="text-xs text-gray-500 leading-snug">
      <div>
        <strong>Updated:</strong> {new Date(last_updated_at_customer).toLocaleString()}
      </div>
      <div>
        <strong>Policy #:</strong>{" "}
        <Highlight query={[globalQuery, columnQuery]}>
          {customer_insurance_policy_number || "—"}
        </Highlight>
      </div>
      <div>
        <strong>Insurance Updated:</strong>{" "}
        {new Date(last_updated_at_insurance).toLocaleString()}
      </div>
    </div>
  );
};


// Celda de estado adaptada
export function StatusCell({getValue, row: { index }, column: { id }, table,}) {
  const val = getValue();
  const [loading, setLoading] = useState(false);
  
  const onChange = async (checked) => {
    setLoading(true);
    setTimeout(() => {
      table.options.meta?.updateData(index, id, checked);
      toast.success("Customer status updated");
      setLoading(false);
    }, 1000);
  };
  
  return (
    <StyledSwitch
      className="mx-auto"
      checked={val}
      onChange={onChange}
      loading={loading}
    />
  );
}

// PropTypes actualizados


PhoneCell.propTypes = {
  getValue: PropTypes.func,
  row: PropTypes.object,
};
InsuranceCell.propTypes = {
  getValue: PropTypes.func,
};

StatusCell.propTypes = {
  getValue: PropTypes.func,
  row: PropTypes.object,
  column: PropTypes.object,
  table: PropTypes.object,
};
