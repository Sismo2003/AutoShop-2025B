import jwt from 'jsonwebtoken';
import { JWT_CONFIG, NODE_ENV } from '../config/main.js';

// Función para generar tokens
export const generateTokens = (userId) => {
	const payload = { userId };
	
	const accessToken = jwt.sign(payload, JWT_CONFIG.access_token_secret, { 
		expiresIn: JWT_CONFIG.access_token_expires_in
	});
	
	const refreshToken = jwt.sign(payload, JWT_CONFIG.refresh_token_secret, { 
		expiresIn: JWT_CONFIG.refresh_token_expires_in
	});
	
	return { accessToken, refreshToken };
};

export const cookieConfig = {
	httpOnly: true,
	secure: NODE_ENV === 'production',
	sameSite: 'lax',
	path: '/'
	// maxAge: 15 * 60 * 1000,
};