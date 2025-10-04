import express from 'express';

import {
	signIn,
	getProfile,
	logout
} from '../controllers/authController.js';
import { get } from 'https';

const router = express.Router();

// sign in route
router.post('/sign-in', signIn);

// get user profile route
router.get('/profile', getProfile);

// loug out route
router.delete('/logout', logout);



export default router;