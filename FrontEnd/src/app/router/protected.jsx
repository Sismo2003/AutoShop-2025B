// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/app" />,
        },
        {
          path: "app",
          children: [
            {
              index: true,
              element: <Navigate to="/app/home" />,
            },
            // App - Home
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/app/home")).default,
              }),
            },
            // Invoice Create
            {
              path: "invoice/create",
              lazy: async () => ({
                Component: (await import("app/pages/app/Invoices/create")).default,
              }),
            },
            // Invoice History
            {
              path: "invoice/history",
              lazy: async () => ({
                Component: (await import("app/pages/app/Invoices/history")).default,
              }),
            },
            // Clients Register
            {
              path: "clients/register",
              lazy: async () => ({
                Component: (await import("app/pages/app/Clients/register")).default,
              }),
            },
            // Clients all
            {
              path: "clients/all",
              lazy: async () => ({
                Component: (await import("app/pages/app/Clients/all")).default,
              }),
            },
            {
              path: "client/information/:clientId",
              lazy: async () => ({
                Component: (await import("app/pages/app/Clients/individual")).default,
              }),
            },
          ],
        },
      ],
    },


    // The app layout supports only the main layout. Avoid using it for other layouts.
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
