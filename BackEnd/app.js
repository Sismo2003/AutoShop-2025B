import express from 'express';
import morgan from 'morgan';
import { ALLOWED_ORIGINS, NODE_ENV } from './config/main.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Importar middlewares
import { conditionalAuth } from './middlewares/authMiddleware.js';
// Importar rutas

//Dashboard
import dashboardRoutes from './routes/dashboard.js';

//AUTH
import auth from './routes/authRouter.js';


// Customer
import customerRoutes from './routes/CustomerRouter.js';

// Appointments
import appointmentsRoutes from './routes/appointmentRoutes.js';


const app = express();

// middlewares basicos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS CORRECTAMENTE CONFIGURADO
app.use(cors(
  {
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
));

app.use(cookieParser());


// middleware de logging y auth
if (NODE_ENV === 'production') {
  // app.use(morgan('combined'));
  app.use(morgan('dev'));
  app.use(conditionalAuth);
} else {
  app.use(morgan('dev'));
}

// ✅ ahora sí: rutas
app.use('/dashboard', dashboardRoutes);
app.use('/auth', auth);
app.use('/customers', customerRoutes);
app.use('/appointments', appointmentsRoutes);

// Errores
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not found' });
});
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  res.status(500).json({
    message: 'Something broke!',
    ...(NODE_ENV === 'development' && { error: err.message })
  });
});

export default app;
