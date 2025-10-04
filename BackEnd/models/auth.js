import db from '../config/db.js';

class authModel {

	// Sign in method
	static async signInModel(user) {
		try {
			// (1) Main variables
			const {username, password, email } = user;

			// (2) query construction
			let query = '';
			let params = [];

			// (3) Check if email or username is provided
			// In case the user provides both, we prioritize email
			if(email){
				query = "SELECT id, username, email, rol, activo FROM users WHERE  email = ? AND password = ? LIMIT 1";
				params = [email, password];
			}else if(username) {
				query = "SELECT id, username, email, rol, activo FROM users WHERE  username = ? AND password = ? LIMIT 1";
				params = [username, password];
			}else{
				throw new Error('Username or email is required for login');
			}
			// (4)Execute the query
			const [result] = await db.query(query, params);

			// (5) Return the result
			return result;
		} catch (error) {
			throw error;
		}
	}

	// Get user profile by ID
	static async getProfileById(userId) {
		try {
			// (1) Check if userId is provided
			if (!userId) {
				throw new Error('User ID is required to get profile');
			}

			// (2) Execute the query
			const [result] = await db.query(`
				SELECT id, username, email, rol, activo 
				FROM users 
				WHERE id = ? AND activo = 1
			`, [userId]);

			// (3) Return the result
			return result[0] || null;
		} catch (error) {
			throw error;
		}
	}
}

export default authModel;