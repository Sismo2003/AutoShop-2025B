// Import Dependencies
import PropTypes from "prop-types";
import clsx from "clsx";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import { DocumentTextIcon } from '@heroicons/react/24/outline'

// Local Imports
import { Avatar, AvatarDot, Badge, Button, Card } from "components/ui";
// import { rolesOptions } from "./data";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import { ConfirmModal } from "components/shared/ConfirmModal";
import {Link} from "react-router";

// ----------------------------------------------------------------------

export function GridView({ table, rows }) {
  const enableFullScreen = table.getState().tableSettings.enableFullScreen;

  return (
    <div
      className={clsx(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4",
        enableFullScreen && "overflow-y-auto px-4 sm:px-5",
      )}
    >
      {rows.map((row) => (
        <Item key={row.id} row={row} table={table} />
      ))}
    </div>
  );
}

function Item({ row, table }) {
  const [loading, setLoading] = useState(false);
  const canSelect = row.getCanSelect();
  
  const onChange = async (checked) => {
    setLoading(true);
    setTimeout(() => {
      table.options.meta?.updateData(row.index, "status", checked);
      toast.success("Customer status updated");
      setLoading(false);
    }, 1000);
  };
  
  return (
    <Card
      className={clsx(
        "px-3 py-2.5 text-center",
        row.getIsSelected() && "ring-3 ring-primary-500/50"
      )}
    >
      <div className="flex w-full items-center justify-between pb-5">
        <Badge color="primary" variant="outlined">
          {row.original.insurance_name || "No Insurance"}
        </Badge>
        <StyledSwitch
          checked={row.original.status ?? true} // Usa true como default si status no existe
          onChange={onChange}
          loading={loading}
        />
      </div>
      
      <Avatar
        {...{
          "data-tooltip": true,
          "data-tooltip-content": `${row.original.customer_fullname}`,
          onClick: canSelect ? () => row.toggleSelected() : undefined,
          size: 18,
          classNames: {
            root: canSelect ? "cursor-pointer" : "cursor-not-allowed",
            display: "text-xl",
          },
          component: "button",
          name: row.original.customer_fullname,
          initialColor: "auto",
          indicator: (
            <Transition
              as={AvatarDot}
              show={row.getIsSelected()}
              enter="transition-all origin-bottom duration-75"
              enterFrom="opacity-0 scale-75"
              enterTo="opacity-100 scale-100"
              leave="transition-all origin-bottom duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-75"
              color="primary"
              className="bottom-0 right-0 flex size-6 items-center justify-center"
            >
              <CheckIcon className="size-3 stroke-[4px] text-white" />
            </Transition>
          ),
        }}
      />
      
      <h3 className="mt-2 text-base font-medium text-gray-800 dark:text-dark-100">
        {row.original.customer_fullname}
      </h3>
      
      <div className="mx-auto mt-4 inline-grid grid-cols-1 gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-lg bg-primary-600/10 text-primary-600">
            <PhoneIcon className="size-3.5" />
          </div>
          <p className="truncate">{row.original.customer_phone}</p>
        </div>
        
        {/* Mostrar teléfono secundario si existe */}
        {row.original.customer_secondary_phone && (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-lg bg-primary-600/10 text-primary-600">
              <PhoneIcon className="size-3.5" />
            </div>
            <p className="truncate">{row.original.customer_secondary_phone}</p>
          </div>
        )}
        
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-lg bg-primary-600/10 text-primary-600">
            <EnvelopeIcon className="size-3.5" />
          </div>
          <p className="truncate">{row.original.customer_email || "N/A"}</p>
        </div>
        
        {/* Mostrar información del seguro si existe */}
        {row.original.insurance_phone_number && (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
              <PhoneIcon className="size-3.5" />
            </div>
            <p className="truncate text-sm text-gray-600">
              Insurance: {row.original.insurance_phone_number}
            </p>
          </div>
        )}
        
        {/* Mostrar número de póliza si existe */}
        {row.original.customer_insurance_policy_number && (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-lg bg-green-600/10 text-green-600">
              <DocumentTextIcon className="size-3.5" />
            </div>
            <p className="truncate text-sm text-gray-600">
              Policy: {row.original.customer_insurance_policy_number}
            </p>
          </div>
        )}
        
        <Actions row={row} table={table} />
      </div>
    </Card>
  );
}


const confirmMessages = {
  pending: {
    description:
      "Are you sure you want to delete this user? Once deleted, it cannot be restored.",
  },
  success: {
    title: "User Deleted",
  },
};

function Actions({ row, table }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const handleDeleteRows = useCallback(() => {
    setConfirmDeleteLoading(true);
    setTimeout(() => {
      table.options.meta?.deleteRow(row);
      setDeleteSuccess(true);
      setConfirmDeleteLoading(false);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
      <div className="flex justify-center gap-1 py-2">

        <Link to={`/app/client/information/${row.original.customer_id}`}  >
          <Button className="h-7 space-x-1.5 rounded-full px-3 text-xs">
            <UserIcon className="size-4" />
            <span>Proflie</span>
          </Button>
        </Link>
        <Button isIcon className="size-7 rounded-full">
          <EnvelopeIcon className="size-4" />
        </Button>
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton as={Button} isIcon className="size-7 rounded-full">
            <EllipsisHorizontalIcon className="size-4" />
          </MenuButton>
          <Transition
            as={MenuItems}
            enter="transition ease-out"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-2"
            className="absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none ltr:right-0 rtl:left-0"
          >
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                  )}
                >
                  <EyeIcon className="size-4.5 stroke-1" />
                  <span>View</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                  )}
                >
                  <PencilIcon className="size-4.5 stroke-1" />
                  <span>Edit</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={openModal}
                  className={clsx(
                    "this:error flex h-9 w-full items-center gap-3 px-3 tracking-wide text-this outline-hidden transition-colors dark:text-this-light",
                    focus && "bg-this/10 dark:bg-this-light/10",
                  )}
                >
                  <TrashIcon className="size-4.5 stroke-1" />
                  <span>Delete</span>
                </button>
              )}
            </MenuItem>
          </Transition>
        </Menu>
      </div>

      <ConfirmModal
        show={deleteModalOpen}
        onClose={closeModal}
        messages={confirmMessages}
        onOk={handleDeleteRows}
        confirmLoading={confirmDeleteLoading}
        state={state}
      />
    </>
  );
}

GridView.propTypes = {
  table: PropTypes.object,
  rows: PropTypes.array,
};

Item.propTypes = {
  table: PropTypes.object,
  row: PropTypes.object,
};

Actions.propTypes = {
  table: PropTypes.object,
  row: PropTypes.object,
};
