// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import {
  CustomerName,
  InsuranceCell, InfoCell, PhoneCell
} from "./rows";

import { RowActions } from "./RowActions";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export const columns = [

  /*NOTA
  * Sin el enableGlobalFilter: true, no busca en esta columna.
  * El accessor debe ser una función que retorne un string.
  * Si no se usa una función, no busca en esa columna.
  * */
  columnHelper.accessor(
    (row) =>
      `${row.customer_fullname}, ${row.customer_email}`,
    {
      id: "CustomerName",
      label: "Customer Name",
      header: "Customer Name",
      enableGlobalFilter: true,
      enableSorting: true,
      cell: CustomerName,
    }
  ),

  columnHelper.accessor((row) =>
    `${row.customer_phone}, ${row.customer_secondary_phone}`,
    {
      id: "Phone",
      header: "Phone",
      label: "Phone",
      cell: PhoneCell,
      enableGlobalFilter: true, // SIN ESTO NO BUSCA!

    }),
  columnHelper.accessor((row) =>
    `${row.insurance_name}, ${row.insurance_phone_number}`,
    {
      id: "Insurance",
      header: "Insurance",
      cell: InsuranceCell,
      enableGlobalFilter: true, // SIN ESTO NO BUSCA!

    }),
  columnHelper.accessor((row) =>
    `${row.customer_insurance_policy_number}, ${row.last_updated_at_customer}, ${row.last_updated_at_insurance}`,
    {
      id: "Details",
      header: "Details",
      cell: InfoCell,
      enableGlobalFilter: true, // SIN ESTO NO BUSCA!

    }),
  columnHelper.display({
    id: "Action",
    header: "",
    cell: RowActions,
    enableGlobalFilter: true, // SIN ESTO NO BUSCA!

  }),
];
