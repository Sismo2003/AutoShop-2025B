import app from './app.js';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import https from 'https';
import fs from 'fs';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Crear servidor HTTP
const server = isProduction
	?
	https.createServer( // <-- Servidor HTTPS en producción
		{
			key: fs.readFileSync('/etc/letsencrypt/live/rebate.nimbuscloud.mx/privkey1.pem'),
			cert: fs.readFileSync('/etc/letsencrypt/live/rebate.nimbuscloud.mx/fullchain1.pem'),
		},
		app
	)
	: http.createServer(app);

// Configurar Socket.io (para ambos entornos si lo necesitas)
const io = new Server(server, {
	path: "/socket.io",
	cors: {
		origin: 'https://rebate.nimbuscloud.mx', // IKER SI VES ESTO AJUSTALO POR QUE NO SE QUE PEDO CON TU CORS DE LA APP.JS O SI QUITAR ESTE
		methods: ['GET', 'POST', 'PUT'], // POR QUE YA ESTA EL OTRO O IGUALARLO IDK
		allowedHeaders: ['Content-Type', 'Authorization']
	}
});

// Manejar conexiones de Socket.io
io.on('connection', (socket) => {
	console.log('🔌 Cliente conectado al socket:', socket.id);
	
	socket.on('disconnect', () => {
		console.log('❌ Cliente desconectado:', socket.id);
	});
});

// Iniciar el servidor
server.listen(PORT,'0.0.0.0',  () => {
	console.log(`Server ${process.pid} is running on port ${PORT} in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
});

// Optimización de timeouts
server.keepAliveTimeout = 30000; // 30 segundos
server.headersTimeout = 35000; // 5 segundos más

process.on('SIGTERM', () => {
	console.log('Shutting down gracefully...');
	server.close(() => {
		process.exit(0);
	});
});

export { io, server };
