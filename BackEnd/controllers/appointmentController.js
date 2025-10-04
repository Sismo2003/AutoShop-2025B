import appointmentsModel from '../models/appointments.js';

// Crear appointment con validaciones específicas para cada tipo de pago
export const createAppointment = async (req, res) => {
    try {
        const appointmentData = req.body;
        
        console.log('🔍 Received appointment data:', JSON.stringify(appointmentData, null, 2));

        // ============= VALIDACIONES BÁSICAS =============
        if (!appointmentData.customer?.id) {
            return res.status(400).json({
                data: false,
                message: 'Customer ID is required',
                error: true
            });
        }

        if (!appointmentData.appointment?.installation_date) {
            return res.status(400).json({
                data: false,
                message: 'Installation date is required',
                error: true
            });
        }

        if (!appointmentData.appointment?.installation_time) {
            return res.status(400).json({
                data: false,
                message: 'Installation time is required',
                error: true
            });
        }

        // Validar que el tiempo sea válido
        const validTimeSlots = ['6-10', '8-12', '10-2', '2-4', 'all day'];
        if (!validTimeSlots.includes(appointmentData.appointment.installation_time)) {
            return res.status(400).json({
                data: false,
                message: 'Invalid installation time slot',
                error: true
            });
        }

        if (!appointmentData.vehicle) {
            return res.status(400).json({
                data: false,
                message: 'Vehicle information is required',
                error: true
            });
        }

        // Validar vehículo existente si se seleccionó
        if (appointmentData.vehicle?.id && appointmentData.vehicle?.update_existing) {
            // Verificar que el vehículo pertenece al cliente
            const vehicleExists = await appointmentsModel.verifyVehicleOwnership(
                appointmentData.vehicle.id, 
                appointmentData.customer.id
            );
            
            if (!vehicleExists) {
                return res.status(400).json({
                    data: false,
                    message: 'Selected vehicle does not belong to this customer',
                    error: true
                });
            }
        }


        // Validar que al menos un tipo de vidrio esté seleccionado
        if (!appointmentData.glassTypes) {
            return res.status(400).json({
                data: false,
                message: 'Glass types information is required',
                error: true
            });
        }

        const hasGlassType = Object.values(appointmentData.glassTypes).some(value => value === true);
        if (!hasGlassType) {
            return res.status(400).json({
                data: false,
                message: 'At least one glass type must be selected',
                error: true
            });
        }

        if (!appointmentData.appointment?.tech_name) {
            return res.status(400).json({
                data: false,
                message: 'Tech name is required 123',
                error: true
            });
        }

        if (!appointmentData.appointment?.service_advisor) {
            return res.status(400).json({
                data: false,
                message: 'Service advisor is required',
                error: true
            });
        }

        // Validar part number del vehículo
        if (!appointmentData.vehicle?.part_number) {
            return res.status(400).json({
                data: false,
                message: 'Vehicle part number is required',
                error: true
            });
        }



        // ============= VALIDACIONES ESPECÍFICAS POR TIPO DE PAGO =============
        
        // Validar fecha de instalación
        const installationDate = new Date(appointmentData.appointment.installation_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (installationDate < today) {
            return res.status(400).json({
                data: false,
                message: 'Installation date cannot be in the past',
                error: true
            });
        }

        // Validaciones específicas según el tipo de reemplazo
        if (appointmentData.appointment.replacement_type === 'insurance') {
            // CASO 1: PAGO CON SEGURO
            if (!appointmentData.insurance) {
                return res.status(400).json({
                    data: false,
                    message: 'Insurance information is required when using insurance payment',
                    error: true
                });
            }

            if (!appointmentData.insurance.general_insurance_id || 
                !appointmentData.insurance.policy_number ||
                !appointmentData.insurance.date_of_loss ||
                appointmentData.insurance.glass_deductible === undefined) {
                return res.status(400).json({
                    data: false,
                    message: 'Complete insurance information is required (company, policy, date of loss, deductible)',
                    error: true
                });
            }

            if (!appointmentData.rebate) {
                return res.status(400).json({
                    data: false,
                    message: 'Rebate information is required when using insurance',
                    error: true
                });
            }

            // Validar que tenga al menos cash o check en el rebate
            if (!appointmentData.rebate.cash && !appointmentData.rebate.check) {
                return res.status(400).json({
                    data: false,
                    message: 'Either cash or check amount must be specified for rebate',
                    error: true
                });
            }

            // No debe tener información de venta si usa seguro
            if (appointmentData.sale) {
                return res.status(400).json({
                    data: false,
                    message: 'Sale information should not be provided when using insurance',
                    error: true
                });
            }

        } else if (appointmentData.appointment.replacement_type === 'out_of_pocket') {
            // CASO 2: PAGO EN EFECTIVO
            if (!appointmentData.sale) {
                return res.status(400).json({
                    data: false,
                    message: 'Sale information is required when paying cash',
                    error: true
                });
            }

            if (!appointmentData.sale.price_cash || appointmentData.sale.price_cash <= 0) {
                return res.status(400).json({
                    data: false,
                    message: 'Valid cash price is required for cash payment',
                    error: true
                });
            }

            if (!appointmentData.sale.salesperson) {
                return res.status(400).json({
                    data: false,
                    message: 'Salesperson is required for cash payment',
                    error: true
                });
            }

            // No debe tener información de seguro o rebate si paga en efectivo
            if (appointmentData.insurance) {
                return res.status(400).json({
                    data: false,
                    message: 'Insurance information should not be provided when paying cash',
                    error: true
                });
            }

            if (appointmentData.rebate) {
                return res.status(400).json({
                    data: false,
                    message: 'Rebate information should not be provided when paying cash',
                    error: true
                });
            }
        }

        // ============= VALIDACIONES DE DIRECCIÓN ALTERNATIVA =============
        if (appointmentData.alternateAddress) {
            if (!appointmentData.alternateAddress.business_name ||
                !appointmentData.alternateAddress.street_address ||
                !appointmentData.alternateAddress.city ||
                !appointmentData.alternateAddress.state ||
                !appointmentData.alternateAddress.contact_name ||
                !appointmentData.alternateAddress.contact_phone) {
                return res.status(400).json({
                    data: false,
                    message: 'Complete alternate address information is required (business name, address, city, state, contact info)',
                    error: true
                });
            }
        }

        // ============= CREAR LA CITA =============
        console.log('✅ All validations passed, creating appointment...');
        
        const appointmentId = await appointmentsModel.createAppointmentComplete(appointmentData);

        // Obtener la cita creada con todos los detalles
        const createdAppointment = await appointmentsModel.getByIdWithDetails(appointmentId);

        console.log('✅ Appointment created successfully with ID:', appointmentId);

        res.status(201).json({
            data: createdAppointment,
            message: 'Appointment created successfully',
            error: false,
            appointment_id: appointmentId
        });

    } catch (error) {
        console.error('❌ Error creating appointment:', error);
        
        // Manejar errores específicos de base de datos
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('vin')) {
                return res.status(400).json({
                    data: false,
                    message: 'This VIN already exists in the system. Please check the VIN number.',
                    error: true
                });
            }
            return res.status(400).json({
                data: false,
                message: 'Duplicate entry detected. Please check for existing records.',
                error: true
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                data: false,
                message: 'Referenced data not found. Please verify customer, insurance, or other IDs.',
                error: true
            });
        }

        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return res.status(400).json({
                data: false,
                message: 'Database field error. Please contact support.',
                error: true
            });
        }

        res.status(500).json({
            data: false,
            message: 'Internal server error while creating appointment',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ============= OTROS CONTROLADORES (PERMANECEN IGUAL PERO MEJORADOS) =============

export const getAllAppointments = async (req, res) => {
    try {
        console.log('📋 Fetching all appointments...');
        const appointments = await appointmentsModel.getAllWithDetails();
        
        res.status(200).json({
            data: appointments,
            message: appointments.length > 0 ? 'Appointments retrieved successfully' : 'No appointments found',
            error: false,
            total: appointments.length
        });

    } catch (error) {
        console.error('❌ Error retrieving appointments:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while retrieving appointments',
            error: error.message
        });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'Invalid appointment ID',
                error: true
            });
        }

        console.log(`🔍 Fetching appointment with ID: ${id}`);
        const appointment = await appointmentsModel.getByIdWithDetails(id);
        
        if (!appointment) {
            return res.status(404).json({
                data: false,
                message: 'Appointment not found',
                error: true
            });
        }

        res.status(200).json({
            data: appointment,
            message: 'Appointment found',
            error: false
        });

    } catch (error) {
        console.error('❌ Error retrieving appointment:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while retrieving appointment',
            error: error.message
        });
    }
};

export const getCustomersWithAddresses = async (req, res) => {
    try {
        console.log('👥 Fetching customers with addresses...');
        const customers = await appointmentsModel.getCustomersWithAddresses();
        
        res.status(200).json({
            data: customers,
            message: customers.length > 0 ? 'Customers retrieved successfully' : 'No customers found',
            error: false,
            total: customers.length
        });

    } catch (error) {
        console.error('❌ Error retrieving customers:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while retrieving customers',
            error: error.message
        });
    }
};

// Búsqueda de clientes con paginación y filtros
export const searchCustomers = async (req, res) => {
    try {
        const { 
            q: searchTerm = '', 
            limit = 20, 
            page = 1 
        } = req.query;

        console.log(`🔍 Searching customers with term: "${searchTerm}", page: ${page}, limit: ${limit}`);

        // Validaciones
        if (parseInt(limit) > 50) {
            return res.status(400).json({
                data: false,
                message: 'Limit cannot exceed 50 results per page',
                error: true
            });
        }

        if (parseInt(page) < 1) {
            return res.status(400).json({
                data: false,
                message: 'Page must be greater than 0',
                error: true
            });
        }

        console.log(`🔍 Searching customers with term: "${searchTerm}", page: ${page}, limit: ${limit}`);

        const searchParams = {
            searchTerm: searchTerm.trim(),
            limit: Math.min(parseInt(limit), 50),
            page: parseInt(page)
        };

        const result = await appointmentsModel.searchCustomersWithPagination(searchParams);

        // console.log(`🔍 Search results: ${JSON.stringify(result.customers)}`);

        res.status(200).json({
            data: result.customers,
            pagination: result.pagination,
            search_term: searchTerm,
            message: result.customers.length > 0 
                ? `Found ${result.customers.length} customers` 
                : 'No customers found',
            error: false
        });

    } catch (error) {
        console.error('❌ Error searching customers:', error);
        res.status(500).json({
            data: [],
            pagination: null,
            message: 'Internal server error while searching customers',
            error: error.message
        });
    }
};

export const getCustomerInsurance = async (req, res) => {
    try {
        const { customerId } = req.params;
        
        if (!customerId || isNaN(Number(customerId))) {
            return res.status(400).json({
                data: false,
                message: 'Invalid customer ID',
                error: true
            });
        }

        console.log(`🛡️ Fetching insurance for customer ID: ${customerId}`);
        const insurance = await appointmentsModel.getCustomerInsurance(customerId);
        
        res.status(200).json({
            data: insurance,
            message: insurance ? 'Customer insurance found' : 'No insurance information found for this customer',
            error: false
        });

    } catch (error) {
        console.error('❌ Error retrieving customer insurance:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while retrieving customer insurance',
            error: error.message
        });
    }
};

export const getGeneralInsurance = async (req, res) => {;
    try {
        console.log('🏢 Fetching general insurance companies...');
        const insurance = await appointmentsModel.getGeneralInsurance();
        
        res.status(200).json({
            data: insurance,
            message: insurance.length > 0 ? 'Insurance companies retrieved successfully' : 'No insurance companies found',
            error: false,
            total: insurance.length
        });

    } catch (error) {
        console.error('❌ Error retrieving insurance companies:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while retrieving insurance companies',
            error: error.message
        });
    }
};

export const getCustomerVehicles = async (req, res) => {
    try {
        const { customerId } = req.params;
        
        if (!customerId || isNaN(Number(customerId))) {
            return res.status(400).json({
                data: false,
                message: 'Invalid customer ID',
                error: true
            });
        }

        console.log(`🚗 Fetching vehicles for customer ID: ${customerId}`);
        const vehicles = await appointmentsModel.getCustomerVehicles(customerId);
        
        res.status(200).json({
            data: vehicles,
            message: vehicles.length > 0 ? 'Customer vehicles retrieved successfully' : 'No vehicles found for this customer',
            error: false,
            total: vehicles.length
        });

    } catch (error) {
        console.error('❌ Error retrieving customer vehicles:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while retrieving customer vehicles',
            error: error.message
        });
    }
};

export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'Invalid appointment ID',
                error: true
            });
        }

        // Verificar que la cita existe
        console.log(`🔄 Updating appointment with ID: ${id}`);
        const existingAppointment = await appointmentsModel.getByIdWithDetails(id);
        if (!existingAppointment) {
            return res.status(404).json({
                data: false,
                message: 'Appointment not found',
                error: true
            });
        }

        // Validar fecha de instalación si se proporciona
        if (updateData.installation_date) {
            const installationDate = new Date(updateData.installation_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (installationDate < today) {
                return res.status(400).json({
                    data: false,
                    message: 'Installation date cannot be in the past',
                    error: true
                });
            }
        }

        const result = await appointmentsModel.updateAppointment(id, updateData);
        
        if (result) {
            // Obtener la cita actualizada
            const updatedAppointment = await appointmentsModel.getByIdWithDetails(id);
            
            res.status(200).json({
                data: updatedAppointment,
                message: 'Appointment updated successfully',
                error: false
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Unable to update appointment',
                error: true
            });
        }

    } catch (error) {
        console.error('❌ Error updating appointment:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while updating appointment',
            error: error.message
        });
    }
};

export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'Invalid appointment ID',
                error: true
            });
        }

        // Verificar que la cita existe antes de eliminar
        console.log(`🗑️ Attempting to delete appointment with ID: ${id}`);
        const existingAppointment = await appointmentsModel.getByIdWithDetails(id);
        
        if (!existingAppointment) {
            return res.status(404).json({
                data: false,
                message: 'Appointment not found',
                error: true
            });
        }

        // Opcional: Verificar si la cita ya pasó (solo advertencia)
        const installationDate = new Date(existingAppointment.installation_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (installationDate < today) {
            console.warn(`⚠️ Deleting past appointment: ${id}`);
        }

        // Llamar al método mejorado de eliminación con cascada manual
        const result = await appointmentsModel.deleteAppointmentWithCascade(id);
        
        if (result.success) {
            console.log(`✅ Appointment ${id} deleted successfully:`, result.deletedItems);
            
            res.status(200).json({
                data: true,
                message: 'Appointment and all related data deleted successfully',
                error: false,
                deleted_items: result.deletedItems
            });
        } else {
            res.status(404).json({
                data: false,
                message: 'Appointment not found or could not be deleted',
                error: true
            });
        }

    } catch (error) {
        console.error('❌ Error deleting appointment:', error);
        
        // Manejar errores específicos de base de datos
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                data: false,
                message: 'Cannot delete appointment: referenced by other records',
                error: true
            });
        }

        if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
            return res.status(503).json({
                data: false,
                message: 'Database timeout while deleting appointment. Please try again.',
                error: true
            });
        }

        res.status(500).json({
            data: false,
            message: 'Internal server error while deleting appointment',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const getAppointmentStats = async (req, res) => {
    try {
        console.log('📊 Fetching appointment statistics...');
        const stats = await appointmentsModel.getAppointmentStats();
        
        res.status(200).json({
            data: stats,
            message: 'Appointment statistics retrieved successfully',
            error: false
        });

    } catch (error) {
        console.error('❌ Error retrieving appointment statistics:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while retrieving statistics',
            error: error.message
        });
    }
};

// Función adicional para buscar citas por filtros
export const searchAppointments = async (req, res) => {
    try {
        const { 
            customer_name, 
            installation_date_from, 
            installation_date_to, 
            location_type, 
            replacement_type,
            limit = 50,
            offset = 0
        } = req.query;

        console.log('🔍 Searching appointments with filters:', {
            customer_name,
            installation_date_from,
            installation_date_to,
            location_type,
            replacement_type,
            limit,
            offset
        });

        const filters = {
            customer_name,
            installation_date_from,
            installation_date_to,
            location_type,
            replacement_type,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        const appointments = await appointmentsModel.searchAppointments(filters);
        
        res.status(200).json({
            data: appointments,
            message: appointments.length > 0 ? 'Appointments found' : 'No appointments match the search criteria',
            error: false,
            total: appointments.length,
            filters
        });

    } catch (error) {
        console.error('❌ Error searching appointments:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while searching appointments',
            error: error.message
        });
    }
};

// Función para obtener citas por rango de fechas
export const getAppointmentsByDateRange = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        if (!start_date || !end_date) {
            return res.status(400).json({
                data: false,
                message: 'Start date and end date are required',
                error: true
            });
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (startDate > endDate) {
            return res.status(400).json({
                data: false,
                message: 'Start date cannot be after end date',
                error: true
            });
        }

        console.log(`📅 Fetching appointments from ${start_date} to ${end_date}`);
        const appointments = await appointmentsModel.getAppointmentsByDateRange(start_date, end_date);
        
        res.status(200).json({
            data: appointments,
            message: `Found ${appointments.length} appointments between ${start_date} and ${end_date}`,
            error: false,
            total: appointments.length,
            date_range: {
                start_date,
                end_date
            }
        });

    } catch (error) {
        console.error('❌ Error retrieving appointments by date range:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while retrieving appointments by date range',
            error: error.message
        });
    }
};

// Función para obtener dashboard data
export const getAppointmentDashboard = async (req, res) => {
    try {
        console.log('📊 Fetching dashboard data...');
        const dashboardData = await appointmentsModel.getDashboardData();
        
        res.status(200).json({
            data: dashboardData,
            message: 'Dashboard data retrieved successfully',
            error: false
        });

    } catch (error) {
        console.error('❌ Error retrieving dashboard data:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while retrieving dashboard data',
            error: error.message
        });
    }
};

// Función para validar disponibilidad de horarios
export const checkTimeSlotAvailability = async (req, res) => {
    try {
        const { date, time_slot } = req.query; // Cambiar 'time' por 'time_slot'
        
        if (!date || !time_slot) {
        return res.status(400).json({
            data: false,
            message: 'Date and time slot are required',
            error: true
        });
        }

        // Verificar formato de fecha
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const validTimeSlots = ['6-10', '8-12', '10-2', '2-4', 'all day'];
        
        if (!dateRegex.test(date)) {
        return res.status(400).json({
            data: false,
            message: 'Invalid date format. Use YYYY-MM-DD',
            error: true
        });
        }
        
        if (!validTimeSlots.includes(time_slot)) {
        return res.status(400).json({
            data: false,
            message: 'Invalid time slot. Use: 6-10, 8-12, 10-2, 2-4, or all day',
            error: true
        });
        }

        console.log(`⏰ Checking availability for ${date} at ${time_slot}`);
        
        const isAvailable = await appointmentsModel.checkTimeSlotAvailability(date, time_slot);

        res.status(200).json({
        data: {
            available: isAvailable,
            date,
            time_slot,
            message: isAvailable ? 'Time slot is available' : 'Time slot is already booked'
        },
        message: 'Availability check completed',
        error: false
        });

    } catch (error) {
        console.error('❌ Error checking availability:', error);
        res.status(500).json({
        data: false,
        message: 'Internal server error while checking availability',
        error: error.message
        });
    }
};

// Función para obtener resumen de una cita específica
export const getAppointmentSummary = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'Invalid appointment ID',
                error: true
            });
        }

        console.log(`📋 Fetching summary for appointment ID: ${id}`);
        const appointment = await appointmentsModel.getByIdWithDetails(id);
        
        if (!appointment) {
            return res.status(404).json({
                data: false,
                message: 'Appointment not found',
                error: true
            });
        }

        // Construir resumen
        const summary = {
            id: appointment.id,
            customer: {
                name: appointment.customer_name,
                phone: appointment.customer_phone,
                email: appointment.customer_email
            },
            vehicle: {
                year: appointment.vehicle_year,
                make: appointment.vehicle_make,
                model: appointment.vehicle_model,
                color: appointment.vehicle_color,
                vin: appointment.vehicle_vin
            },
            appointment_details: {
                installation_date: appointment.installation_date,
                installation_time: appointment.installation_time,
                location_type: appointment.location_type,
                replacement_type: appointment.replacement_type
            },
            glass_work: {
                types: {
                    windshield: !!appointment.winshield,
                    front_door: !!appointment.front_door,
                    back_door: !!appointment.back_door,
                    quarter: !!appointment.quarter,
                    vent: !!appointment.vent
                },
                features: {
                    hud: !!appointment.hud,
                    heated: !!appointment.heated,
                    rain_sensor: !!appointment.rain_sensor,
                    molding_black: !!appointment.molding_black,
                    molding_chrome: !!appointment.molding_chrome,
                    tint: !!appointment.tint,
                    tint_strip: !!appointment.tint_strip
                }
            },
            payment: {
                type: appointment.replacement_type,
                insurance_company: appointment.insurance_company,
                policy_number: appointment.policy_number,
                rebate_cash: appointment.rebate_cash,
                rebate_check: appointment.rebate_check,
                cash_price: appointment.price_cash
            },
            status: {
                created_at: appointment.created_at,
                is_past: new Date(appointment.installation_date) < new Date()
            }
        };

        res.status(200).json({
            data: summary,
            message: 'Appointment summary retrieved successfully',
            error: false
        });

    } catch (error) {
        console.error('❌ Error retrieving appointment summary:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while retrieving appointment summary',
            error: error.message
        });
    }
};

export const getAppointmentsCompleteView = async (req, res) => {
    try {
        const filters = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            status: req.query.status || 'all',
            search: req.query.search || '',
            payment_type: req.query.payment_type || 'all',
            location_type: req.query.location_type || 'all',
            date_from: req.query.date_from && req.query.date_from.trim() !== '' ? req.query.date_from : '',
            date_to: req.query.date_to && req.query.date_to.trim() !== '' ? req.query.date_to : '',
            sort_by: req.query.sort_by || 'installation_date',
            sort_order: req.query.sort_order || 'desc'
        };

        console.log('📋 Fetching appointments with filters:', filters);
        
        const result = await appointmentsModel.getAppointmentsCompleteView(filters);

        // Procesar los datos para agregar campos calculados
        const processedData = result.data.map(appointment => {
            // Calcular el total amount basado en el tipo de pago
            let calculatedTotal = 0;
            if (appointment.replacement_type === 'insurance') {
                // Para seguro: rebate cash + rebate check
                calculatedTotal = (parseFloat(appointment.rebate_cash_amount) || 0) + (parseFloat(appointment.rebate_check_amount) || 0);
            } else if (appointment.replacement_type === 'out_of_pocket') {
                // Para cash: precio en efectivo
                calculatedTotal = parseFloat(appointment.cash_price) || 0;
            }

            // Determinar la dirección de instalación
            let installationAddress = '';
            let installationCity = '';
            let installationState = '';
            
            if (appointment.installation_business_name) {
                // Es una dirección comercial/alternativa
                installationAddress = appointment.installation_street_address || '';
                installationCity = appointment.installation_city || '';
                installationState = appointment.installation_state || '';
            } else {
                // Usar la dirección del cliente por defecto
                installationAddress = appointment.installation_street_address || '';
                installationCity = appointment.installation_city || '';
                installationState = appointment.installation_state || '';
            }

            return {
                ...appointment,
                total_amount: calculatedTotal,
                installation_street_address: installationAddress,
                installation_city: installationCity,
                installation_state: installationState,
                // Agregar campos de compatibilidad
                winshield_part_number: appointment.windshield_part_number || '',
                // Procesar tipos de vidrio para resumen
                glass_types_summary: appointment.glass_types_summary || [
                    appointment.has_windshield ? 'Windshield' : null,
                    appointment.has_front_door ? 'Front Door' : null,
                    appointment.has_back_door ? 'Back Door' : null,
                    appointment.has_quarter_glass ? 'Quarter Glass' : null,
                    appointment.has_vent_glass ? 'Vent Glass' : null
                ].filter(Boolean).join(', '),
                // Procesar características para resumen
                glass_features_summary: appointment.glass_features_summary || [
                    appointment.has_hud ? 'HUD' : null,
                    appointment.has_heated ? 'Heated' : null,
                    appointment.has_antenna ? 'Antenna' : null,
                    appointment.has_rain_sensor ? 'Rain Sensor' : null,
                    appointment.has_molding_black ? 'Black Molding' : null,
                    appointment.has_molding_chrome ? 'Chrome Molding' : null,
                    appointment.has_tint ? 'Tint' : null,
                    appointment.has_tint_strip ? 'Tint Strip' : null,
                    appointment.has_ldws ? 'LDWS' : null
                ].filter(Boolean).join(', ')
            };
        });

        const response = {
            data: processedData,
            pagination: result.pagination,
            filters: result.filters,
            stats: result.stats,
            message: result.data.length > 0 
                ? `Found ${result.pagination.total_items} appointments` 
                : 'No appointments found with current filters',
            error: false
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('❌ Error fetching appointments complete view:', error);
        res.status(500).json({
            data: [],
            pagination: {
                current_page: 1,
                per_page: 20,
                total_items: 0,
                total_pages: 0,
                has_next_page: false,
                has_prev_page: false,
                from: 0,
                to: 0
            },
            stats: null,
            message: 'Internal server error while fetching appointments',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Obtener detalles completos de un appointment específico
 */
export const getAppointmentCompleteDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                data: false,
                message: 'Invalid appointment ID',
                error: true
            });
        }

        console.log(`🔍 Fetching complete details for appointment ID: ${id}`);
        
        const appointmentDetails = await appointmentsModel.getAppointmentCompleteDetails(id);
        
        if (!appointmentDetails) {
            return res.status(404).json({
                data: false,
                message: 'Appointment not found',
                error: true
            });
        }

        // Procesar y estructurar los datos según el tipo de pago
        const processedDetails = {
            ...appointmentDetails,
            // Calcular información de pago correcta
            payment: {
                ...appointmentDetails.payment,
                display_type: appointmentDetails.payment.type === 'insurance' ? 'Insurance Claim' : 'Cash Payment',
                total_amount: appointmentDetails.payment.type === 'insurance' 
                    ? (appointmentDetails.payment.rebate?.total_rebate || 0)
                    : (appointmentDetails.payment.cash_price || 0)
            },
            // Procesar dirección de instalación
            installation: {
                ...appointmentDetails.installation,
                display_address: appointmentDetails.installation.address ? {
                    ...appointmentDetails.installation.address,
                    full_address: [
                        appointmentDetails.installation.address.street,
                        appointmentDetails.installation.address.city,
                        appointmentDetails.installation.address.state,
                        appointmentDetails.installation.address.zip
                    ].filter(Boolean).join(', ')
                } : appointmentDetails.customer.address
            }
        };

        res.status(200).json({
            data: processedDetails,
            message: 'Appointment details retrieved successfully',
            error: false
        });

    } catch (error) {
        console.error('❌ Error fetching appointment complete details:', error);
        res.status(500).json({
            data: false,
            message: 'Internal server error while fetching appointment details',
            error: error.message
        });
    }
};
