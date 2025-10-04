import {useCallback, useEffect, useRef, useState} from 'react';
import { Device } from '@twilio/voice-sdk';
import { TwilioContext } from './context.js';
import { useAuthContext } from '../auth/context.js';
import PropTypes from "prop-types";
import {toast} from "sonner";
import io from "socket.io-client";

import {
  changeAgentStatus,
  addCustomerToConference,
  generateToken
} from "backend/connection"

export const TwilioProvider = ({ children }) => {
  // (1) Contexto de usuario
  const { isInitialized, isAuthenticated, user } = useAuthContext();

  // (1) Device for the SDK
  const [device, setDevice] = useState(null);
  // (2) Estado para manejar la llamada entrante
  const [incomingCall, setIncomingCall] = useState(null);
  // (3) Estado para manejar la llamada activa
  const [activeCall, setActiveCall] = useState(null);
  // (4) Estado para manejar el estado de la conexión con el SDK
  const [callStatus, setCallStatus] = useState('disconnected');
  // (5) Estado para manejar la duracion de la llamada
  const [callDuration, setCallDuration] = useState(0);
  // (6) Estado de tipo de llamada
  const [callType, setCallType] = useState(null); // 'outbound' o 'inbound'
  // (7) Estado para manejar el Mute de la llamada
  const [isMuted, setIsMuted] = useState(false);
  // (8) Url del servidor de Socket.io
  // const socketUrl =
  //   import.meta.VITE_ENV_MODE === 'dev' ?
  //   import.meta.VITE_API_URL_DEV : import.meta.VITE_API_URL_PROD;
  // (9) Estado para manejar el loading de la llamada
  const [isLoading, setIsLoading] = useState(false);
  // (10) Estado para manejar el nombre de la conferencia
  const [conferenceName, setConferenceName] = useState(null);
  // (11) Estado para manejar el widget de agregar participantes
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  // (12) Estado para manejar los participantes de la llamada
  const [participants, setParticipants] = useState([]);
  // (13) Estado de websocket de socket.io
  const [socketStatus, setSocketStatus] = useState('disconnected');
  
  
  const intervalRef = useRef(null);
  
  const socketRef = useRef(null);
  // referecia para el tiempo que dura el modal de incomingcall
  const incomingCallTimeoutRef = useRef(null);



  // define if out proyect is in development or production mode
  const ENV_MODE = import.meta.env.VITE_ENV_MODE;

  // define the base URL for the API
  let webSocketUrl;
  if(ENV_MODE === 'dev') {
    webSocketUrl = import.meta.env.VITE_WEB_SOCKET_URL_DEV;
  }else if(ENV_MODE === 'production') {
    webSocketUrl = import.meta.env.VITE_WEB_SOCKET_URL_PROD;
  }else{
    webSocketUrl = import.meta.env.VITE_WEB_SOCKET_URL_DEV_LOCAL;
  }

  //(1) Función para decodificar y validar el token
  const validateToken = (token) => {
    try {
      // Decodificar el token JWT sin verificar (solo para obtener info)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      const now = Math.floor(Date.now() / 1000);
      
      console.log('Token info:', {
        issued: new Date(payload.iat * 1000),
        expires: new Date(payload.exp * 1000),
        identity: payload.iss,
        isExpired: payload.exp < now,
        timeLeft: payload.exp - now
      });
      
      return {
        isValid: payload.exp > now,
        expiresIn: payload.exp - now,
        payload
      };
    } catch (error) {
      console.error('Error validando token:', error);
      setCallStatus("error");
      return { isValid: false, error: 'Token malformado' };
    }
  };
  // (2) Función para iniciar el timer de llamada
  const startCallTimer = useCallback(() => {
    setCallDuration(0);
    intervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);
  // (3) Función para detener el temporizador
  const stopCallTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  // (4) Funcion para el cambio del estado del agente en la base de datos
  const handleAgentStatusChange = useCallback(async (status, userId = user.id) => {
    try {
      await changeAgentStatus({
        status,
        user_id: userId
      });
    } catch (error) {
      toast.error("Error al actualizar el estado del agente");
      console.error("❌ Error al cambiar el estado del agente:", error);
    }
  }, [user]);
  // (5) Funcion para terminar llamada y volver a estados iniciales
  const handleHangup = useCallback(() => {
    console.log("📞 Ending call...");
    if (activeCall) {
      activeCall.disconnect();
      setActiveCall(null);
      stopCallTimer();
      setCallDuration(0);
      setCallType(null);
      setIsMuted(false);
      setConferenceName(null);
      setCallStatus('connected'); // vuelve al estado "esperando llamada"
      handleAgentStatusChange("available");
      setIsLoading(false);
      setParticipants([]);
      toast.success("📞 Llamada finalizada");
    } else {
      console.warn("❌ No hay llamada activa para finalizar.");
    }
  }, [
    activeCall, stopCallTimer, handleAgentStatusChange, setActiveCall, setCallDuration, setCallType, setIsMuted, setConferenceName, setCallStatus, setIsLoading, setParticipants
  ]);
  //(6) Funcion para obtener un token en caso de renovacion, invalido o error
  const refreshToken = useCallback(async () => {
    try {
      const identidad = user?.username;

      toast.info("Generating token for calls...");
      const newToken = await generateToken(identidad);
      console.log("Token answer:", newToken);

      if (newToken?.data) {
        localStorage.setItem("voice_token", newToken.data);
        toast.info("Token created successfully.");
        return newToken.data;
      } else {
        toast.error("Hubo un error al re-generar el token de Twilio.");
        return null;
      }
    } catch (error) {
      toast.error("Error al generar el token.");
      console.error("Error fetching the new token endpoint:", error);
      return null;
    }
  }, [user?.username]); // solo depende de `user.username`

  
  useEffect(() => {
    if (!activeCall) return;
    
    console.log("🔄 Escuchando eventos de activeCall...");
    
    const handleDisconnect = () => {
      console.log('📴 Llamada desconectada');
      handleHangup();
    };
    
    const handleError = (err) => {
      console.error("❌ Error en la llamada activa:", err);
      setActiveCall(null);
      stopCallTimer();
      setCallDuration(0);
      setCallType(null);
      setIsMuted(false);
      setCallStatus('error');
      handleAgentStatusChange("available");
      toast.error("❌ Error en la llamada");
    };
    
    activeCall.on('disconnect', handleDisconnect);
    activeCall.on('error', handleError);
    
    activeCall.on('accept', () => {
      console.log("llamada aceptada: ", activeCall);
      setIsMuted(false);
      setIsLoading(false);
    });
    
    return () => {
      activeCall.off('disconnect', handleDisconnect);
      activeCall.off('error', handleError);
      console.log("🧹 Limpieza de listeners de activeCall");
    };
  }, [activeCall, handleAgentStatusChange, handleHangup, stopCallTimer]);
  
  
  useEffect(() => {
    let twilioDevice;

    if (!isInitialized || !isAuthenticated) {
      console.log("⏳ Esperando autenticación antes de inicializar Twilio...");
      return;
    }
    
    // Inicializar Socket.io
    socketRef.current = io(webSocketUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true
    });
    
    
    // (1) Escuchar evento 'inbound-call'
    socketRef.current.on('inbound-call', (callData) => {
      try{
        const audio = new Audio('/Sounds/inbound.mp3');
        audio.play().catch((err) => {
          console.warn("🔇 No se pudo reproducir el sonido:", err);
        });
      }catch(error){
        console.log("Error al reproducir el audio: ",error);
      }
      console.log('📞 Llamada entrante recibida via Socket.IO', callData);
      setIncomingCall({
        ...callData.call,
        conferenceName: callData.conferenceName
      });

      // 🧽 Limpiar cualquier timeout anterior
      if (incomingCallTimeoutRef.current) {
        clearTimeout(incomingCallTimeoutRef.current);
      }

      // ⏰ Crear un nuevo timeout para limpiar incomingCall después de 1 minuto
      incomingCallTimeoutRef.current = setTimeout(() => {
        setIncomingCall(null);
        incomingCallTimeoutRef.current = null; // limpiar la ref
        console.log('🕒 Llamada expirada, limpiando incomingCall');
        toast.info("Lost Call " + callData?.call?.From)
      }, 60000);

      const data  = {
        number : callData?.call?.From,
        country : callData?.call?.FromCountry,
        city : callData?.call?.FromCity,
        callSid : callData?.call?.CallSid,
        direction : callData?.call?.Direction,
        conferenceName : callData?.conferenceName
      }
      setParticipants(prev => {
        // Verificar si ya existe ese callSid
        const exists = prev.some(p => p.callSid === data.callSid);
        if (exists) return prev;
        // Si no existe, lo agregamos
        return [...prev, data];
      });



    });
    
    // (2) Escuchar evento 'participant-joined' para saber si un participante se une a la conferencia
    socketRef.current.on('participant-joined', ({ data }) => {
      console.log('👤 Cliente unido a la conferencia:', data);
      
      setParticipants(prev => {
        // Verificar si ya existe ese callSid
        const exists = prev.some(p => p.callSid === data.callSid);
        if (exists) return prev;
        
        // Si no existe, lo agregamos
        return [...prev, data];
      });
    });
    
    // (3) Escuchar evento 'participant-left' para saber si un participante se va de la conferencia
    socketRef.current.on('participant-left', ({ CallSid }) => {
      console.log('👤 Cliente salió de la conferencia:', CallSid);
      setParticipants(prev => prev.filter(p => p.callSid !== CallSid));
    });

    
    // (1) Manejar errores de conexión
    socketRef.current.on('connect_error', (err) => {
      setSocketStatus('error');
      console.error('Error de conexión con Socket.IO:', err);
    });
    // (2) Conexion exitosa
    socketRef.current.on('connect', () => {
      setSocketStatus('connected');
      console.log('✅ Conectado a Socket.IO');
      handleAgentStatusChange("available");
    });
    // (3) Desconexión
    socketRef.current.on('disconnect', () => {
      setSocketStatus('disconnected');
      console.log('❌ Desconectado de Socket.IO');
      handleAgentStatusChange("offline");
    });
    // (4) Reintentos de reconexión
    socketRef.current.on('reconnect_attempt', (attempt) => {
      setSocketStatus('reconnecting');
      console.log(`🔄 Reintentando conexión a Socket.IO (intento ${attempt})`);
    });
    // (5) Reconexión exitosa
    socketRef.current.on('reconnect', (attempt) => {
      setSocketStatus('connected');
      console.log(`✅ Reconectado a Socket.IO (intento ${attempt})`);
      handleAgentStatusChange("available");
    });
    
    
    const initializeTwilio = async () => {
      try {
        console.log("REGISTRANDO TWILIO DEVICE");
        // (1) Verificar si el token existe en localStorage
        let token = localStorage.getItem('voice_token');
        // console.log("TOKEN EN LOCALSTORAGE: ", token);
        if (!token) {
          toast.error('Token de llamada no encontrado. Por favor, inicia sesión nuevamente.');
          console.error('Token no encontrado en localStorage');
          setCallStatus("error");
          return;
        }
        // (1.1) Validar el token del local store
        const tokenInfo = validateToken(token);
        if (!tokenInfo.isValid) { // si es invalido genero otro y rectifico que sea valido
          toast.error('Token expired or invalid, Generating a new one...');
          console.error('Token expirado o inválido', tokenInfo);
          const Newtoken = await refreshToken();
          if(Newtoken){
            const tokenInfo2 = validateToken(Newtoken);
            if(!tokenInfo2.isValid) {
              toast.error('Token expired or invalid, try to log out!');
              console.error("error getting new token: ", tokenInfo2);
              setCallStatus("error");
              return;
            }
          }
        }
        // (1.2) Crear una instancia de Twilio Device
        twilioDevice = new Device(token, {
          // debug: true,
          codecPreferences: ['opus', 'pcmu'],
          maxCallSignalTimeoutMs: 30000,
          allowIncomingWhileBusy: false,
          logLevel: 'debug'
          // logLevel: 'off'
        });
        
        // (1.3) Registrar eventos del dispositivo
        twilioDevice.on('registered', () => {
          console.log('✅ Twilio Device registrado')
          setCallStatus("connected");
        });
        // (1.4) En caso de error al registrar el dispositivo
        twilioDevice.on('error', (err) => {
          console.error('❌ Error en Twilio Device:', err)
          setCallStatus("error");
        });
        
        // se elimino el evento de incoming calls
        
        // Eventos de auto renovación de token
        twilioDevice.on('tokenWillExpire', async () => {
          console.warn('⏳ Token está por expirar, solicitando uno nuevo...');
          const Newtoken = await refreshToken();
          if(Newtoken) {
            const tokenInfo3 = validateToken(Newtoken);
            if(!tokenInfo3.isValid) {
              toast.error('Token generared error');
              return;
            }
            twilioDevice.updateToken(Newtoken)
          };

        });
        twilioDevice.on('tokenExpired', async () => {
          console.warn('🛑 Token expirado, intentando renovar...');
          const Newtoken = await refreshToken();
          if(Newtoken) {
            const tokenInfo4 = validateToken(Newtoken);
            if(!tokenInfo4.isValid) {
              toast.error('Token generared error');
              return;
            }
            twilioDevice.updateToken(Newtoken)
          };
        });
        
        // Evento para conexión activa
        await twilioDevice.register();
        
        setDevice(twilioDevice);
      } catch (error) {
        console.error('🚫 Error al inicializar Twilio Device:', error);
      }
    };
    
    initializeTwilio();
    
    return () => {
      if (twilioDevice) {
        twilioDevice.destroy();
        console.log('🧹 Twilio Device destruido');
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log('🧹 Web Socket destruido');
      }
    };
  }, [isAuthenticated, isInitialized,handleAgentStatusChange,refreshToken, webSocketUrl]);
  
  
  
  
  return (
    <TwilioContext
      value={{
        device,
        incomingCall,
        activeCall,
        callStatus,
        callDuration,
        callType,
        isMuted,
        isLoading,
        showAddParticipant,
        participants, // Lista de participantes en la llamada
        socketStatus,
        
        setActiveCall : (call) => {
          setActiveCall(call);
          if (call) {
            console.log("📞 Outbound Call updated:", call);
          } else {
            console.log("📞 Outbound Call cleared");
          }
        },
        /* Only call this method when agent is connected to socket.io and he accepts a call */
        acceptCall: async () => {
          if (incomingCall) {
            const connection = await device.connect({
              params: {
                ConferenceName: incomingCall?.conferenceName
              }
            })
            if (incomingCallTimeoutRef.current) {
              clearTimeout(incomingCallTimeoutRef.current);
              incomingCallTimeoutRef.current = null;
            }
            setConferenceName(incomingCall?.conferenceName);
            setActiveCall(connection);
            setIncomingCall(null);
            setCallType('inbound');
            startCallTimer();
          }
        },
        
        rejectCall: () => {
          /* NOTE:
          (1) Can't do a incomingCall.reject(); because the call is not a Call object its from the socket.io
          (2) In this case the client should stay in hold until the SIP agent answer or in case he reject the call, its going dirrecly
          to make a call to the owners phone number and if he rejects the call, the call will be rejected.
          */
          if (!incomingCall) {
            console.warn("❌ No hay llamada entrante para rechazar.");
            return;
          }
          if (incomingCallTimeoutRef.current) {
            clearTimeout(incomingCallTimeoutRef.current);
            incomingCallTimeoutRef.current = null;
          }
          setIncomingCall(null);
          setActiveCall(null);
        },
        
        setCallStatus : (status) => {
          setCallStatus(status);
          console.log("📞 Call status updated:", status);
        },
        
        setCallType: (type) => {
          console.log("📞 Call type updated:", type);
          setCallType(type);
        },
        
        toggleMute :() => {
          console.log("🔇 Mute toggled:", activeCall);
          if(activeCall) {
            if (isMuted) {
              activeCall.mute(false);
              setIsMuted(false);
              console.log("🔊 Llamada outbound desmuteada");
            } else {
              activeCall.mute(true);
              setIsMuted(true);
              console.log("🔇 Llamada outbound muteada");
            }
          }
        },
        
        endCall :()=>{
          handleHangup()
        },
        
        setCallDuration: (duration) => {
          setCallDuration(duration);
          console.log("⏱️ Call duration updated:", duration);
        },
        
        startCallTimer: () =>{
          console.log("⏱️ Call timer started");
          startCallTimer();
        },
        
        startCall: async (to) => {
          console.error("📞 Starting outbound call to:", to);
          if(!to.trim()) {
            toast.error("Por favor, ingresa un número de teléfono válido.");
            return;
          }
          const phoneRegex = /^[+]?[1-9][\d\s-]{7,15}$/;
          if (!phoneRegex.test(to.replace(/\s/g, ''))) {
            toast.error('Invalid number format');
            return;
          }
          if(!device) {
            toast.error("Twilio Device not initialized");
            return;
          }
          try{
            setIsLoading(true);
            console.log("Calling to:", to);
            const connection = await device.connect({
              params: {
                To: to,
                Outbount : true
              }
            });
            setActiveCall(connection);
            setIncomingCall(null);
            setCallType('outbound');
            startCallTimer();
            handleAgentStatusChange("in_call");
            
            // hacemos esto para guardar el nombre de la conferencia y poder agregar mas participatnes
            connection.on('accept', () => {
              const callSid = connection.parameters.CallSid;
              setConferenceName(`Conference${callSid}`)
            });
            
          }catch(e){
            setIsMuted(false);
            console.error("Error al iniciar llamada:", e);
            toast.error("Error al iniciar llamada");
          }
        },
        
        setShowAddParticipantWidget: (value) => {
          setShowAddParticipant(value);
        },
        
        addParticipantToCall: async (customer) => {
          if (!activeCall) {
            toast.error("No hay llamada activa para agregar un participante");
            return;
          }
          if (!customer || !customer.phone) {
            toast.error("Por favor, ingresa un número de teléfono válido.");
            return;
          }
          if(!conferenceName) {
            console.log("Detalles de la llamda: ",activeCall);
            toast.error("No hay conferencia activa para agregar un participante");
            return;
          }
          try {
            setIsLoading(true);
            const response = await addCustomerToConference({
              conferenceName,
              phone: customer.phone,
            });
            console.log("Cliente agregado a la conferencia:", response);
            toast.success("Cliente agregado a la conferencia");
          } catch (error) {
            console.error("Error al agregar cliente a la conferencia:", error);
            toast.error("Error al agregar cliente a la conferencia");
          } finally {
            setIsLoading(false);
          }
        }
      }}
    >
      {children}
    </TwilioContext>
  );

};

TwilioProvider.propTypes = {
  children: PropTypes.node,
};
