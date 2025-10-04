import express from 'express';
import {
  CreateCustomerForm,
  getAllCustomersTable,
  getCustomersAndLastCalls,
  getCustomerWithAllAppointments
} from "../controllers/customerController.js";

const router = express.Router();

router.post('/register', CreateCustomerForm);

router.get('/all_table', getAllCustomersTable);

router.get('/customers-and-last-calls',getCustomersAndLastCalls)

router.get('/customer-history/:customerId',getCustomerWithAllAppointments);

export default router;
