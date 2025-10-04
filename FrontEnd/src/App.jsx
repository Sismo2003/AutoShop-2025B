// Import Dependencies
import { RouterProvider } from "react-router";


// Local Imports
import { AuthProvider } from "app/contexts/auth/Provider";
import { BreakpointProvider } from "app/contexts/breakpoint/Provider";
import { LocaleProvider } from "app/contexts/locale/Provider";
import { SidebarProvider } from "app/contexts/sidebar/Provider";
import { ThemeProvider } from "app/contexts/theme/Provider";
import { TwilioProvider } from "app/contexts/twilio/Provider";

import router from "app/router/router";


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import IncomingCallModal  from "components/CallCenter/incoming/index";
import ActiveCallWidget from "components/CallCenter/ActiveCallWidget";
import AddParticipantWidget from "components/CallCenter/AddParticipantsWidget";
// ----------------------------------------------------------------------

function App() {
  return (
    <AuthProvider>
      <TwilioProvider>
        <ThemeProvider>
          <LocaleProvider>
            <BreakpointProvider>
              <SidebarProvider>
                <RouterProvider router={router} />

                <ActiveCallWidget />

                <AddParticipantWidget />

                <IncomingCallModal />

                {/* Toast Notifications */}

                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                />
              </SidebarProvider>
            </BreakpointProvider>
          </LocaleProvider>
        </ThemeProvider>
      </TwilioProvider>
    </AuthProvider>
  );
}

export default App;
