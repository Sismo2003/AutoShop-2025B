import CustomerModel from "../models/customers.js";
import AddressModel from "../models/Address.js";
import VehicleModel from "../models/Vehicles.js";
import InsuranceModel from "../models/insurance.js";
import appointmentsModel from "../models/appointments.js";

export const CreateCustomerForm = async (req, res) => {
  let addressId = null;
  let insuranceIds = null;
  let customerId = null;
  let vehicleIds = null;
  
  try {
    const { general, address, vehicles, insurance } = req.body;
    
    // Validaciones
    if (!general) {
      return res.status(400).json({
        error_message: "General information is required",
        message: "Bad request failed 400",
        error: true
      });
    }
    if (!address) {
      return res.status(400).json({
        error_message: "Address information is required",
        message: "Bad request failed 400",
        error: true
      });
    }
    if (!vehicles || vehicles.length === 0) {
      return res.status(400).json({
        error_message: "At least one vehicle is required",
        message: "Bad request failed 400",
        error: true
      });
    }
    if (!insurance || insurance.length === 0) {
      return res.status(400).json({
        error_message: "At least one insurance is required",
        message: "Bad request failed 400",
        error: true
      });
    }
    
    // Crear dirección
    addressId = await AddressModel.create(address);
    
    // Crear seguro
    insuranceIds = await InsuranceModel.create({
      ...insurance,
      general_insurance_id: 1
    });
    
    // Crear cliente
    customerId = await CustomerModel.create({
      fullname: general.fullName,
      phone: general.phoneCountryCode + general.phoneNumber,
      secondary_phone: general.secondaryPhoneNumber ?
        (general.secondaryPhoneCountryCode + general.secondaryPhoneNumber) : null,
      email: general.email || null,
      insurance_id: insuranceIds,
      created_by_id: general.createdById || null,
      address_id: addressId
    });
    
    // Crear vehículos
    vehicleIds = await VehicleModel.create(vehicles, customerId);
    
    // Respuesta exitosa
    res.status(201).json({
      message: "Customer created successfully",
      data: {
        customerId,
        addressId,
        insuranceIds,
        vehicleIds
      },
      error: false
    });
    
  } catch (error) {
    console.error('Error creating customer:', error);
    
    // Cleanup en orden inverso a la creación
    if (vehicleIds) {
      try {
        await VehicleModel.delete(vehicleIds);
      } catch (cleanupError) {
        console.error('Error deleting vehicles during cleanup:', cleanupError);
      }
    }
    
    if (customerId) {
      try {
        await CustomerModel.delete(customerId);
      } catch (cleanupError) {
        console.error('Error deleting customer during cleanup:', cleanupError);
      }
    }
    
    if (insuranceIds) {
      try {
        await InsuranceModel.delete(insuranceIds);
      } catch (cleanupError) {
        console.error('Error deleting insurance during cleanup:', cleanupError);
      }
    }
    
    if (addressId) {
      try {
        await AddressModel.delete(addressId);
      } catch (cleanupError) {
        console.error('Error deleting address during cleanup:', cleanupError);
      }
    }
    
    res.status(500).json({
      error_message: error.message,
      message: "Server internal error failed 500",
      error: true
    });
  }
};

export const getAllCustomersTable = async (req, res) => {
  try {
    const customers = await CustomerModel.getAllTable();

    res.status(200).json({
      message: "Customers retrieved successfully",
      data: customers,
      error: false
    });
  } catch (error) {
    console.error('Error retrieving customers:', error);
    
    res.status(500).json({
      error_message: error.message,
      message: "Server internal error failed 500",
      error: true
    });
  }
}

export const getCustomersAndLastCalls = async (req, res) => {
  try {
    const customers = await CustomerModel.getClientsAndLastCall();
    
    res.status(200).json({
      message: "Customers and last calls retrieved successfully",
      data: customers
    });
  } catch (error) {
    console.error('Error retrieving customers and last calls:', error);
    
    res.status(500).json({
      error_message: error.message,
      message: "Server internal error failed 500",
      error: true
    });
  }
}

export const getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await CustomerModel.getById(id);

    if (!customer) {
      return res.status(404).json({
        error_message: "Customer not found",
        message: "Not found failed 404",
        error: true
      });
    }

    res.status(200).json({
      message: "Customer retrieved successfully",
      data: customer,
      error: false
    });

  } catch (error) {
    console.error('Error retrieving customer:', error);

    res.status(500).json({
      error_message: error.message,
      message: "Server internal error failed 500",
      error: true
    });
  }
}

export const getCustomerWithAllAppointments = async (req, res) => {
  try {
    // (1) Get customer ID from request parameters
    const { customerId } = req.params;

    // (1.2) Validate customerId
    if (!customerId) {
      return res.status(400).json({
        error_message: "Customer ID is required",
        message: "Bad request failed 400",
        error: true
      });
    }

    // (2) Retrieve customer information by ID
    const customer = await CustomerModel.getById(customerId);
    // (2.1) Retrieve customer appointments
    if(!customer) {
      return res.status(404).json({
        error_message: "Customer not found",
        message: "Not found failed 404",
        error: true
      });
    }

    //(3) Retrieve customer vehicles
    const vehicles = await VehicleModel.getCustomerVehicles(customerId);

    //(4) Retrieve customer appointments
    const appointments = await appointmentsModel.getCustomerAppointmentsById(customerId);

    // (5) Return the customer with vehicles and appointments
    res.status(200).json({
      message: "Customer with appointments retrieved successfully",
      data: {
        customer,
        vehicles,
        appointments
      },
      error: false
    })

  }catch (error) {
    console.error('Error retrieving customer:', error);

    return res.status(500).json({
      error_message: error.message,
      message: "Server internal error failed 500",
      error: true
    });
  }
}
