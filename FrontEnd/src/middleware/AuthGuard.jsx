// Import Dependencies
import { Navigate, useLocation, useOutlet } from "react-router";

// Local Imports
import { GHOST_ENTRY_PATH, REDIRECT_URL_KEY } from "../constants/app.constant";

import { useSelector } from 'react-redux';
// ----------------------------------------------------------------------

export default function AuthGuard() {
  const outlet = useOutlet();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`${GHOST_ENTRY_PATH}?${REDIRECT_URL_KEY}=${location.pathname}`}
        replace
      />
    );
  }

  return <>{outlet}</>;
}
