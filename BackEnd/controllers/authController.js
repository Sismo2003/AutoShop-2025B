import authModel from "../models/auth.js";
import { generateTokens, cookieConfig } from "../utils/index.js";
import { NODE_ENV } from "../config/main.js";
import Token from "../models/tokenManagement.js";


export const signIn = async (req, res) => {
	try{
		// (1) ask for the body from the request
		const { email, username, password } = req.body;

		// (2) Need the email or the username to login
		if(!email && !username) {
			return res.status(400).json({
				data: false,
				message: 'El email o el nombre de usuario no fueron proporcionados'
			});
		}

		// (3) Need the password to login
		if(!password) {
			return res.status(400).json({
				data: false,
				message: 'La contraseña no fue proporcionada'
			});
		}

		// (4) Call the model to sign in
		const user = await authModel.signInModel({ email, username, password });

		// (5) If the user is not found, return an error
		if(user.length === 0) {
			return res.status(401).json({
				data: false,
				message: 'Usuario no encontrado'
			});
		}
		// (6) If the user is found, return the user data
		else{

			// (6.1) Generate tokens
			const { accessToken, refreshToken } = generateTokens(user[0].id);

			// (6.2) Update the refresh token in the database
			await Token.findByIdAndUpdate(user[0].id, { refreshToken });

			// (6.3) Set the access token in the cookies
			res.cookie('access_token', accessToken, cookieConfig);

			// const { password, ...userWithoutPassword } = user[0];
			
			// (7) Generate a call center token
			console.log("Generating call center token for user: ", user[0].username);

			console.log(user[0]);
			
			return res.status(200).json({
				data: {
					...user[0],
					voice_token :  'voicetoken',
					agent_id : agent
				},
				message: 'Usuario encontrado'
			})
		}

	}	catch(err){
		res.status(500).json({
			data: false,
			message: 'Error interno del servidor',
			error: err.message
		})
		console.log("Error del signin: " + err.message)
	}
}

export const getProfile = async (req, res) => {
	try {
		// (1) Get the user ID from the request
		const { userId } = req.query;

		console.log('User ID:', userId);

		// (2) If the user ID is not provided, return an error
		if (!userId) {
			return res.status(400).json({
				data: false,
				message: 'ID de usuario no proporcionado'
			});
		}

		// (3) Call the model to get the user profile
		const userProfile = await authModel.getProfileById(userId);

		// (4) If the user profile is not found, return an error
		if (!userProfile) {
			return res.status(404).json({
				data: false,
				message: 'Perfil de usuario no encontrado'
			});
		}

		// (5) Return the user profile
		return res.status(200).json({
			data: userProfile,
			message: 'Perfil de usuario encontrado'
		});

	} catch (error) {
		res.status(500).json({
			data: false,
			message: 'Error interno del servidor',
			error: error.message
		});
	}
}

export const logout = async (req, res) => {
	try {
		// (1) Obtener el userId del token o de la sesión
		const userId = req.user?.userId || req.query.userId;

		console.log('User ID for logout:', req.user);
		
		// (2) Si tenemos el userId, invalidar el refresh token en la base de datos
		if (userId) {
			console.log('User ID:', userId);
			await Token.findByIdAndUpdate(userId, { refreshToken: null });
		}

		// (3) Limpiar la cookie del access token
		res.clearCookie('access_token', {
			httpOnly: true,
			secure: NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/'
		});

		// (4) Respuesta exitosa
		return res.status(200).json({
			data: true,
			message: 'Sesión cerrada exitosamente'
		});

	} catch (error) {
		res.status(500).json({
			data: false,
			message: 'Error interno del servidor al cerrar sesión',
			error: error.message
		});
	}
};
