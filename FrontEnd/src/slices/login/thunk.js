import {
  sign_in as signInApi,
  logout as logoutApi,
  // generateToken as callCenterToken

  
} from "../../backend/connection.js";
import { loginRequest, loginError, loginSuccess, logoutSuccess } from "./reducer";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(username) {
  return emailRegex.test(username);
}

export const loginUser = (user) => async (dispatch) => {
  dispatch(loginRequest()); // Activar estado de carga
  // console.log("loginUser, user:", user);
  try {
    let response;


    const isEmailValid = isValidEmail(user.username);

    if (!isEmailValid) {
      response = await signInApi({
        username: user.username,
        password: user.password,
      });
    } else {
      response = await signInApi({
        email: user.username,
        password: user.password,
      });
    }

    console.log("loginUser, response:", response);
    localStorage.setItem("key_local", JSON.stringify(response.data));
    
    if (response) {
      if(response.data?.voice_token){
        console.log("Token de voz recibido del backend");
        localStorage.setItem("voice_token", response.data?.voice_token);
      }
      
      dispatch(loginSuccess(response.data));
      // history("/dashboard");
    }
  } catch (error) {
    dispatch(loginError(error));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    localStorage.removeItem("key_local");
    await logoutApi();
    dispatch(logoutSuccess(true));
  } catch (error) {
    dispatch(loginError(error));
  }
}
