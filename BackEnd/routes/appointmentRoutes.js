// Import Dependencies
import express from 'express';
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getCustomersWithAddresses,
  getCustomerInsurance,
  getGeneralInsurance,
  getCustomerVehicles,
  getAppointmentStats,
  searchAppointments,
  getAppointmentsByDateRange,
  getAppointmentDashboard,
  getAppointmentsCompleteView,
  getAppointmentCompleteDetails,
  searchCustomers
} from '../controllers/appointmentController.js';

// Middleware de validación (opcional)
import { validateAppointmentData } from '../middlewares/appointmentValidation.js';
import db from '../config/db.js';

const router = express.Router();

// ============= RUTAS ESTÁTICAS PRIMERO (más específicas) =============

/**
 * @route   GET /api/appointments/stats
 * @desc    Obtener estadísticas generales de citas
 * @access  Private
 */
router.get('/stats', getAppointmentStats);

/**
 * @route   GET /api/appointments/dashboard
 * @desc    Obtener datos completos del dashboard
 * @access  Private
 */
router.get('/dashboard', getAppointmentDashboard);

/**
 * @route   GET /api/appointments/search
 * @desc    Buscar citas con filtros específicos
 * @query   customer_name, installation_date_from, installation_date_to, location_type, replacement_type, limit, offset
 * @access  Private
 */
router.get('/search', searchAppointments);

/**
 * @route   GET /api/appointments/date-range
 * @desc    Obtener citas por rango de fechas
 * @query   start_date, end_date
 * @access  Private
 */
router.get('/date-range', getAppointmentsByDateRange);

/**
 * @route   GET /api/appointments/customers
 * @desc    Obtener todos los clientes con sus direcciones
 * @access  Private
 */
router.get('/customers', getCustomersWithAddresses);

/**
 * @route   GET /api/appointments/customers/search
 * @desc    Búsqueda de clientes con paginación y filtros
 * @query   q (search term), limit, page
 * @access  Private
 */
router.get('/search-customers', searchCustomers);

/**
 * @route   GET /api/appointments/insurance
 * @desc    Obtener todas las aseguradoras generales
 * @access  Private
 */
router.get('/insurance', getGeneralInsurance);

/**
 * @route   GET /api/appointments/availability
 * @desc    Verificar disponibilidad de fecha y hora
 * @query   date, time_slot
 * @access  Private
 */
router.get('/availability', async (req, res) => {
  try {
    const { date, time_slot } = req.query; // Cambiar 'time' por 'time_slot'
    
    if (!date || !time_slot) {
      return res.status(400).json({
        data: false,
        message: 'Date and time slot are required',
        error: true
      });
    }

    // Verificar si ya existe una cita en esa fecha y slot de tiempo
    const [existingAppointments] = await db.query(`
      SELECT COUNT(*) as count
      FROM appointments 
      WHERE installation_date = ? AND installation_time = ?
    `, [date, time_slot]);

    const isAvailable = existingAppointments[0].count === 0;

    res.status(200).json({
      data: {
        available: isAvailable,
        date,
        time_slot,
        conflicting_appointments: existingAppointments[0].count
      },
      message: isAvailable ? 'Time slot is available' : 'Time slot is already booked',
      error: false
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      data: false,
      message: 'Internal server error while checking availability',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/appointments/available-times
 * @desc    Obtener horarios disponibles para una fecha específica
 * @query   date
 * @access  Private
 */
router.get('/available-times', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        data: false,
        message: 'Date is required',
        error: true
      });
    }

    // Horarios de trabajo disponibles
    const availableTimeSlots = ['6-10', '8-12', '10-2', '2-4', 'all day'];

    // Obtener citas existentes para esa fecha
    const [bookedSlots] = await db.query(`
      SELECT installation_time
      FROM appointments 
      WHERE installation_date = ?
    `, [date]);

    const bookedSlotsSet = new Set(
      bookedSlots.map(appointment => appointment.installation_time)
    );

    const availableSlots = availableTimeSlots.filter(slot => !bookedSlotsSet.has(slot));

    res.status(200).json({
      data: {
        date,
        available_slots: availableSlots,
        booked_slots: Array.from(bookedSlotsSet),
        total_available: availableSlots.length,
        total_booked: bookedSlots.length
      },
      message: `Found ${availableSlots.length} available time slots for ${date}`,
      error: false
    });

  } catch (error) {
    console.error('Error getting available times:', error);
    res.status(500).json({
      data: false,
      message: 'Internal server error while getting available times',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/appointments/report
 * @desc    Generar reporte de citas por período
 * @query   start_date, end_date, format (json|csv)
 * @access  Private
 */
router.get('/report', async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      format = 'json',
      group_by = 'date' // date, location_type, replacement_type
    } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        data: false,
        message: 'Start date and end date are required',
        error: true
      });
    }

    let groupByField = 'installation_date';
    if (group_by === 'location_type') groupByField = 'location_type';
    if (group_by === 'replacement_type') groupByField = 'replacement_type';

    const [reportData] = await db.query(`
      SELECT 
        ${groupByField} as category,
        COUNT(*) as total_appointments,
        SUM(CASE WHEN replacement_type = 'insurance' THEN 1 ELSE 0 END) as insurance_count,
        SUM(CASE WHEN replacement_type = 'out_of_pocket' THEN 1 ELSE 0 END) as cash_count,
        SUM(CASE WHEN location_type = 'home' THEN 1 ELSE 0 END) as home_count,
        SUM(CASE WHEN location_type = 'shop' THEN 1 ELSE 0 END) as shop_count,
        SUM(CASE WHEN location_type = 'other' THEN 1 ELSE 0 END) as other_count
      FROM appointments 
      WHERE installation_date BETWEEN ? AND ?
      GROUP BY ${groupByField}
      ORDER BY ${groupByField}
    `, [start_date, end_date]);

    const summaryData = {
      period: { start_date, end_date },
      total_appointments: reportData.reduce((sum, row) => sum + row.total_appointments, 0),
      total_insurance: reportData.reduce((sum, row) => sum + row.insurance_count, 0),
      total_cash: reportData.reduce((sum, row) => sum + row.cash_count, 0),
      breakdown: reportData
    };

    if (format === 'csv') {
      // Generar CSV
      const csvHeaders = 'Category,Total Appointments,Insurance,Cash,Home,Shop,Other\n';
      const csvRows = reportData.map(row => 
        `${row.category},${row.total_appointments},${row.insurance_count},${row.cash_count},${row.home_count},${row.shop_count},${row.other_count}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="appointments_report_${start_date}_to_${end_date}.csv"`);
      res.send(csvHeaders + csvRows);
    } else {
      res.status(200).json({
        data: summaryData,
        message: 'Report generated successfully',
        error: false
      });
    }

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      data: false,
      message: 'Internal server error while generating report',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/appointments/export/csv
 * @desc    Exportar citas a formato CSV
 * @query   Filtros opcionales para la exportación
 * @access  Private
 */
router.get('/export/csv', async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      customer_name, 
      location_type, 
      replacement_type 
    } = req.query;

    let query = `
      SELECT 
        a.id,
        a.installation_date,
        a.installation_time,
        a.location_type,
        a.replacement_type,
        c.fullname as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        v.year as vehicle_year,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.color as vehicle_color,
        v.vin as vehicle_vin,
        addr.street_address,
        addr.city,
        addr.state,
        addr.zipcode,
        gi.name as insurance_company,
        ia.policy_number,
        s.price_cash,
        r.cash as rebate_cash,
        r.cheque as rebate_check
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN vehicles v ON a.vehicle_id = v.id
      LEFT JOIN addresses addr ON a.address_id = addr.id
      LEFT JOIN insurance_appointment ia ON a.insurance_id = ia.id
      LEFT JOIN general_insurance gi ON ia.general_appointment_id = gi.id
      LEFT JOIN sales s ON a.sale_id = s.id
      LEFT JOIN rebates r ON a.rebate_id = r.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (start_date) {
      query += ` AND a.installation_date >= ?`;
      queryParams.push(start_date);
    }

    if (end_date) {
      query += ` AND a.installation_date <= ?`;
      queryParams.push(end_date);
    }

    if (customer_name) {
      query += ` AND c.fullname LIKE ?`;
      queryParams.push(`%${customer_name}%`);
    }

    if (location_type) {
      query += ` AND a.location_type = ?`;
      queryParams.push(location_type);
    }

    if (replacement_type) {
      query += ` AND a.replacement_type = ?`;
      queryParams.push(replacement_type);
    }

    query += ` ORDER BY a.installation_date DESC`;

    const [appointments] = await db.query(query, queryParams);

    // Generar CSV
    const csvHeaders = [
      'ID', 'Installation Date', 'Installation Time', 'Location Type', 'Payment Type',
      'Customer Name', 'Customer Phone', 'Customer Email',
      'Vehicle Year', 'Vehicle Make', 'Vehicle Model', 'Vehicle Color', 'VIN',
      'Address', 'City', 'State', 'Zip',
      'Insurance Company', 'Policy Number', 'Cash Price', 'Rebate Cash', 'Rebate Check'
    ].join(',') + '\n';

    const csvRows = appointments.map(appointment => [
      appointment.id,
      appointment.installation_date,
      appointment.installation_time,
      appointment.location_type,
      appointment.replacement_type,
      `"${appointment.customer_name || ''}"`,
      appointment.customer_phone || '',
      appointment.customer_email || '',
      appointment.vehicle_year || '',
      `"${appointment.vehicle_make || ''}"`,
      `"${appointment.vehicle_model || ''}"`,
      `"${appointment.vehicle_color || ''}"`,
      appointment.vehicle_vin || '',
      `"${appointment.street_address || ''}"`,
      `"${appointment.city || ''}"`,
      appointment.state || '',
      appointment.zipcode || '',
      `"${appointment.insurance_company || ''}"`,
      appointment.policy_number || '',
      appointment.price_cash || '',
      appointment.rebate_cash || '',
      appointment.rebate_check || ''
    ].join(',')).join('\n');

    const filename = `appointments_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvHeaders + csvRows);

  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({
      data: false,
      message: 'Internal server error while exporting to CSV',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/appointments/complete-view
 * @desc    Obtener appointments con vista completa y filtros avanzados
 * @query   page, limit, status, search, payment_type, location_type, date_from, date_to, sort_by, sort_order
 * @access  Private
 */
router.get('/complete-view', getAppointmentsCompleteView);

/**
 * @route   GET /api/appointments/complete-details/:id
 * @desc    Obtener detalles completos de un appointment específico
 * @access  Private
 */
router.get('/complete-details/:id', getAppointmentCompleteDetails);

/**
 * @route   GET /api/appointments/verify-view
 * @desc    Verificar que la vista appointment_complete_view funciona correctamente
 * @access  Private
 */
router.get('/verify-view', async (req, res) => {
  try {
    console.log('🔍 Verifying appointment_complete_view...');
    
    // Verificar que la vista existe y tiene datos
    const [viewCheck] = await db.query(`
      SELECT COUNT(*) as total_records,
              COUNT(DISTINCT appointment_id) as unique_appointments,
              MAX(appointment_created_at) as latest_appointment
      FROM appointment_complete_view
      LIMIT 1
    `);

    // Obtener una muestra de datos para verificar estructura
    const [sampleData] = await db.query(`
      SELECT 
        appointment_id,
        customer_name,
        vehicle_year,
        vehicle_make,
        vehicle_model,
        replacement_type,
        location_type,
        total_amount,
        appointment_status
      FROM appointment_complete_view 
      ORDER BY appointment_created_at DESC 
      LIMIT 3
    `);

    // Verificar campos críticos
    const [fieldCheck] = await db.query(`
      DESCRIBE appointment_complete_view
    `);

    const criticalFields = [
      'appointment_id',
      'customer_name',
      'vehicle_year',
      'vehicle_make',
      'vehicle_model',
      'replacement_type',
      'total_amount',
      'installation_date',
      'installation_time',
      'location_type'
    ];

    const availableFields = fieldCheck.map(field => field.Field);
    const missingFields = criticalFields.filter(field => !availableFields.includes(field));

    res.status(200).json({
      data: {
        view_status: 'operational',
        total_records: viewCheck[0].total_records,
        unique_appointments: viewCheck[0].unique_appointments,
        latest_appointment: viewCheck[0].latest_appointment,
        sample_data: sampleData,
        field_verification: {
          critical_fields: criticalFields,
          missing_fields: missingFields,
          all_fields_present: missingFields.length === 0
        },
        recommendations: missingFields.length > 0 ? [
          'Some critical fields are missing from the view',
          'Please verify the view definition in the database',
          `Missing fields: ${missingFields.join(', ')}`
        ] : [
          'All critical fields are present',
          'View is ready for production use'
        ]
      },
      message: 'View verification completed',
      error: false
    });

  } catch (error) {
    console.error('❌ Error verifying view:', error);
    res.status(500).json({
      data: false,
      message: 'Error verifying appointment_complete_view',
      error: error.message,
      recommendations: [
        'Check if appointment_complete_view exists in database',
        'Verify database connection',
        'Run the view creation script if needed'
      ]
    });
  }
});

// ============= RUTAS CON PARÁMETROS (menos específicas) =============

/**
 * @route   GET /api/appointments/customers/insurance/:customerId
 * @desc    Obtener información de seguro de un cliente específico
 * @access  Private
 */
router.get('/customers/insurance/:customerId', getCustomerInsurance);

/**
 * @route   GET /api/appointments/customers/vehicles/:customerId
 * @desc    Obtener vehículos de un cliente específico
 * @access  Private
 */
router.get('/customers/vehicles/:customerId', getCustomerVehicles);

/**
 * @route   GET /api/appointments/:id
 * @desc    Obtener una cita específica por ID
 * @access  Private
 */
router.get('/:id', getAppointmentById);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Actualizar una cita existente
 * @access  Private
 */
router.put('/:id', validateAppointmentData, updateAppointment);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Eliminar una cita
 * @access  Private
 */
router.delete('/:id', deleteAppointment);

// ============= RUTAS PRINCIPALES =============

/**
 * @route   POST /api/appointments
 * @desc    Crear una nueva cita completa
 * @access  Private (requiere autenticación)
 */
router.post('/', validateAppointmentData, createAppointment);

/**
 * @route   GET /api/appointments
 * @desc    Obtener todas las citas con detalles
 * @access  Private
 */
router.get('/', getAllAppointments);

export default router;