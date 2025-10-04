// Import Dependencies
import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { setGlobalLogout } from "backend/api_model";

// Local Imports
import { AuthContext } from "./context";

// Actions
import { 
  initialize
} from 'slices/login/reducer';

// Thunks
import {
  loginUser,
  logoutUser,
} from 'slices/thunk';

import { getProfile } from "backend/connection";



// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const dispatch = useDispatch();

  // Auth redux thunks
  const login = useCallback((credentials) => dispatch(loginUser(credentials)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);

  // Set global logout function
  useEffect(() => {
    setGlobalLogout(logout);
  }, [logout]); 

  const loginState = useSelector(state => state.auth); 

  useEffect(() => {
    const init = async () => {
      try {
        const key_local = JSON.parse(window.localStorage.getItem("key_local"));

        if (key_local && typeof key_local === 'object' && key_local.id) {
          // console.log("AuthProvider, useEffect, key_local:", key_local);

          const response = await getProfile(key_local)
          // console.log("AuthProvider, useEffect, response:", response);
          const user = response.data;

          // console.log("AuthProvider, useEffect, user:", user);

          dispatch(initialize({
            isAuthenticated: true,
            user,
          }));
        } else {
          dispatch(initialize({
            isAuthenticated: false,
            user: null,
          }));
        }

      } catch (err) {
        console.error(err);
        dispatch(initialize({
          isAuthenticated: false,
          user: null,
        }));
      }
    };
    init();
  }, [dispatch]);

  if (!children) {
    return null;
  }
  return (
    <AuthContext
      value={{
        ...(loginState || {}),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
