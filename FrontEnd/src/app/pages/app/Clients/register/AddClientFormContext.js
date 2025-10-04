import { createSafeContext } from "utils/createSafeContext";

export const [AddClientsFormContextProvider, useAddClientsFormContext] =
    createSafeContext(
        "useAddClientsFormContext must be used within a AddClientsFormProvider",
    );
