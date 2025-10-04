import express from 'express';
import {
  GetDashboardCards
} from '../controllers/dashboardController.js';

const router = express.Router();


router.get('/getCards', GetDashboardCards);


export default router;
