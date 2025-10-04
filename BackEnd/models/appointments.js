import db from '../config/db.js';
import { DateTime } from 'luxon';

class appointmentsModel {

    // Crear una nueva cita completa con jobs_appointment y extras
    static async createAppointmentComplete(appointmentData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            let customerId = appointmentData.customer.id;
            let addressId = null;
            let vehicleId = null;
            let insuranceId = null;
            let rebateId = null;
            let saleId = null;
            let alternateAddressId = null;
            let jobsId = null;

            // 1. Actualizar información del cliente si es necesario
            if (appointmentData.customer) {
                await connection.query(`
                    UPDATE customers 
                    SET fullname = ?, phone = ?, secondary_phone = ?, email = ?
                    WHERE id = ?
                `, [
                    appointmentData.customer.fullname,
                    appointmentData.customer.phone,
                    appointmentData.customer.secondary_phone,
                    appointmentData.customer.email,
                    customerId
                ]);
            }

            // 2. Crear o actualizar dirección del cliente
            if (appointmentData.address) {
                // Obtener la dirección actual del cliente
                const [customerResult] = await connection.query(`
                    SELECT address_id FROM customers WHERE id = ?
                `, [customerId]);

                if (customerResult[0]?.address_id) {
                    // Actualizar dirección existente
                    addressId = customerResult[0].address_id;
                    await connection.query(`
                        UPDATE addresses 
                        SET street_address = ?, city = ?, state = ?, zipcode = ?, 
                            unit_number = ?, main_cross_streets = ?, apartment_name = ?, building = ?
                        WHERE id = ?
                    `, [
                        appointmentData.address.street_address,
                        appointmentData.address.city,
                        appointmentData.address.state,
                        appointmentData.address.zipcode,
                        appointmentData.address.unit_number,
                        appointmentData.address.main_cross_streets,
                        appointmentData.address.apartment_name,
                        appointmentData.address.building,
                        addressId
                    ]);
                } else {
                    // Crear nueva dirección
                    const [addressResult] = await connection.query(`
                        INSERT INTO addresses (
                            property_type, street_address, main_cross_streets, zipcode, 
                            city, state, apartment_name, unit_number, building, 
                            is_commercial, special_instructions
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        'house', // Por defecto para clientes residenciales
                        appointmentData.address.street_address,
                        appointmentData.address.main_cross_streets,
                        appointmentData.address.zipcode,
                        appointmentData.address.city,
                        appointmentData.address.state,
                        appointmentData.address.apartment_name,
                        appointmentData.address.unit_number,
                        appointmentData.address.building,
                        0, // No comercial
                        null
                    ]);

                    addressId = addressResult.insertId;

                    // Actualizar el customer con la nueva dirección
                    await connection.query(`
                        UPDATE customers SET address_id = ? WHERE id = ?
                    `, [addressId, customerId]);
                }
            }

            // 3. Crear o actualizar vehículo
            if (appointmentData.vehicle) {
                if (appointmentData.vehicle.id && appointmentData.vehicle.update_existing) {
                    // Actualizar vehículo existente
                    vehicleId = appointmentData.vehicle.id;
                    await connection.query(`
                        UPDATE vehicles 
                        SET year = ?, make = ?, model = ?, color = ?, vin = ?, doors = ?, winshield_part_number = ?
                        WHERE id = ? AND customer_id = ?
                    `, [
                        appointmentData.vehicle.year,
                        appointmentData.vehicle.make,
                        appointmentData.vehicle.model,
                        appointmentData.vehicle.color,
                        appointmentData.vehicle.vin,
                        appointmentData.vehicle.doors,
                        appointmentData.vehicle.part_number,
                        vehicleId,
                        customerId
                    ]); 
                } else {
                    // Crear nuevo vehículo
                    const [vehicleResult] = await connection.query(`
                        INSERT INTO vehicles (
                            customer_id, year, make, model, color, vin, doors, winshield_part_number
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        customerId,
                        appointmentData.vehicle.year,
                        appointmentData.vehicle.make,
                        appointmentData.vehicle.model,
                        appointmentData.vehicle.color,
                        appointmentData.vehicle.vin,
                        appointmentData.vehicle.doors,
                        appointmentData.vehicle.part_number
                    ]);

                    vehicleId = vehicleResult.insertId;
                }
            }

            // 4. Crear/actualizar información de seguro si aplica
            if (appointmentData.insurance) {
                let customerInsuranceId = null;

                // Verificar si el cliente ya tiene información de seguro
                const [existingCustomerInsurance] = await connection.query(`
                    SELECT insurance_id FROM customers WHERE id = ?
                `, [customerId]);

                if (existingCustomerInsurance[0]?.insurance_id && appointmentData.insurance.update_customer_insurance) {
                    // Actualizar seguro existente del cliente
                    customerInsuranceId = existingCustomerInsurance[0].insurance_id;
                    
                    await connection.query(`
                        UPDATE customer_insurance 
                        SET policy_number = ?, general_insurance_id = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `, [
                        appointmentData.insurance.policy_number,
                        appointmentData.insurance.general_insurance_id,
                        customerInsuranceId
                    ]);
                } else if (appointmentData.insurance.update_customer_insurance) {
                    // Crear nuevo seguro para el cliente
                    const [customerInsuranceResult] = await connection.query(`
                        INSERT INTO customer_insurance (
                            policy_number, general_insurance_id, created_at, updated_at
                        ) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    `, [
                        appointmentData.insurance.policy_number,
                        appointmentData.insurance.general_insurance_id
                    ]);

                    customerInsuranceId = customerInsuranceResult.insertId;

                    // Actualizar el customer con el nuevo seguro
                    await connection.query(`
                        UPDATE customers SET insurance_id = ? WHERE id = ?
                    `, [customerInsuranceId, customerId]);
                }

                // Crear la información de seguro específica para esta cita
                const [insuranceResult] = await connection.query(`
                    INSERT INTO insurance_appointment (
                        policy_number, date_of_loss, glass_deductible, 
                        safelife, lynx, other, general_appointment_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    appointmentData.insurance.policy_number,
                    appointmentData.insurance.date_of_loss,
                    appointmentData.insurance.glass_deductible,
                    appointmentData.insurance.safelife,
                    appointmentData.insurance.lynx,
                    appointmentData.insurance.other,
                    appointmentData.insurance.general_insurance_id
                ]);

                insuranceId = insuranceResult.insertId;
            }

            // 5. Crear dirección alternativa si aplica
            if (appointmentData.alternateAddress) {
                const [altAddressResult] = await connection.query(`
                    INSERT INTO addresses (
                        property_type, street_address, main_cross_streets, zipcode, 
                        city, state, apartment_name, unit_number, building, 
                        is_commercial, business_name, special_instructions
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    appointmentData.alternateAddress.property_type,
                    appointmentData.alternateAddress.street_address,
                    appointmentData.alternateAddress.main_cross_streets,
                    appointmentData.alternateAddress.zipcode,
                    appointmentData.alternateAddress.city,
                    appointmentData.alternateAddress.state,
                    null, // apartment_name no aplica para comercial
                    appointmentData.alternateAddress.unit_number,
                    appointmentData.alternateAddress.building,
                    appointmentData.alternateAddress.is_commercial,
                    appointmentData.alternateAddress.business_name,
                    `Contact: ${appointmentData.alternateAddress.contact_name}, Phone: ${appointmentData.alternateAddress.contact_phone}`
                ]);

                alternateAddressId = altAddressResult.insertId;
            }

            // 6. Crear rebate si aplica (solo para insurance)
            if (appointmentData.rebate) {
                const [rebateResult] = await connection.query(`
                    INSERT INTO rebates (customer_id, has_rebate, cash, cheque)
                    VALUES (?, ?, ?, ?)
                `, [
                    customerId,
                    appointmentData.rebate.has_rebate,
                    appointmentData.rebate.cash || null,
                    appointmentData.rebate.check || null
                ]);

                rebateId = rebateResult.insertId;
            }

            // 7. Crear sale si aplica (pago en efectivo)
            if (appointmentData.sale) {
                // Usar Luxon para fechas
                const currentDate = DateTime.now().toISODate(); // YYYY-MM-DD
                
                const [saleResult] = await connection.query(`
                    INSERT INTO sales (
                        customer_id, origin, salesperson, invoice_date,
                        reg_date, status, price_cash, payment_type
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    customerId,
                    appointmentData.sale.origin || 'defecto', // Origen por defecto
                    appointmentData.sale.salesperson,
                    currentDate, // Fecha actual con Luxon
                    currentDate, // Fecha actual con Luxon
                    'pending', // Estado inicial
                    appointmentData.sale.price_cash,
                    appointmentData.sale.payment_type
                ]);

                saleId = saleResult.insertId;
            }

            // 8. Crear la cita principal
            const [appointmentResult] = await connection.query(`
                INSERT INTO appointments (
                    customer_id, installation_date, installation_time, 
                    tech_name, service_advisor, edirect, location_type, 
                    replacement_type, comment, rebate_id, insurance_id, 
                    address_id, sale_id, vehicle_id, user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                customerId,
                appointmentData.appointment.installation_date,
                appointmentData.appointment.installation_time,
                appointmentData.appointment.tech_name,
                appointmentData.appointment.service_advisor,
                appointmentData.appointment.edirect,
                appointmentData.appointment.location_type,
                appointmentData.appointment.replacement_type,
                appointmentData.appointment.comment,
                rebateId,
                insuranceId,
                alternateAddressId || addressId,
                saleId,
                vehicleId,
                appointmentData.appointment.user_id || null
            ]);

            const appointmentId = appointmentResult.insertId;

            // 9. Crear jobs_appointment (tipos de vidrio)
            if (appointmentData.glassTypes) {
                const [jobsResult] = await connection.query(`
                    INSERT INTO jobs_appointment (
                        appointment_id, winshield, front_door, back_door, 
                        quarter, vent
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    appointmentId,
                    appointmentData.glassTypes.has_windshield ? 1 : 0,
                    appointmentData.glassTypes.has_door_glass ? 1 : 0,
                    appointmentData.glassTypes.has_back_glass ? 1 : 0,
                    appointmentData.glassTypes.has_quarter_glass ? 1 : 0,
                    appointmentData.glassTypes.has_vent_glass ? 1 : 0
                ]);

                jobsId = jobsResult.insertId;
            }

            // 10. Crear extras (características técnicas y acabados)
            if (appointmentData.glassFeatures && jobsId) {
                await connection.query(`
                    INSERT INTO extras (
                        ldws, hud, heated, antenna, rain_sensor, molding_black, molding_chrome, 
                        tint, tint_strip, vin_etch, green_blue, gray, bronze, jobs_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    appointmentData.glassFeatures.has_ldws ? 1 : 0,
                    appointmentData.glassFeatures.has_hud ? 1 : 0,
                    appointmentData.glassFeatures.has_heated ? 1 : 0,
                    appointmentData.glassFeatures.has_antenna ? 1 : 0,
                    appointmentData.glassFeatures.has_rain_sensor ? 1 : 0,
                    appointmentData.glassFeatures.has_black ? 1 : 0,
                    appointmentData.glassFeatures.has_chrome ? 1 : 0,
                    appointmentData.glassFeatures.has_windshield_tint ? 1 : 0,
                    appointmentData.glassFeatures.has_tint_strip ? 1 : 0,
                    0, // vin_etch por defecto
                    0, // green_blue por defecto
                    0, // gray por defecto
                    0, // bronze por defecto
                    jobsId
                ]);
            }

            await connection.commit();
            return appointmentId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener todas las citas con información de jobs y extras
    static async getAllWithDetails() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    a.id,
                    a.installation_date,
                    a.installation_time,
                    a.location_type,
                    a.replacement_type,
                    a.comment,
                    a.tech_name,
                    a.service_advisor,
                    a.edirect,
                    a.created_at,
                    
                    -- Información del cliente
                    c.id as customer_id,
                    c.fullname as customer_name,
                    c.phone as customer_phone,
                    c.email as customer_email,
                    
                    -- Información del vehículo
                    v.year as vehicle_year,
                    v.make as vehicle_make,
                    v.model as vehicle_model,
                    v.color as vehicle_color,
                    v.vin as vehicle_vin,
                    v.winshield_part_number,
                    
                    -- Información de dirección
                    addr.street_address,
                    addr.city,
                    addr.state,
                    addr.zipcode,
                    
                    -- Información de seguro
                    ia.policy_number,
                    gi.name as insurance_company,
                    
                    -- Información de rebate
                    r.has_rebate,
                    r.cash as rebate_cash,
                    r.cheque as rebate_check,
                    
                    -- Información de venta
                    s.price_cash,
                    s.payment_type,
                    
                    -- Información de jobs (tipos de vidrio)
                    ja.winshield,
                    ja.front_door,
                    ja.back_door,
                    ja.quarter,
                    ja.vent,
                    
                    -- Información de extras (características)
                    e.hud,
                    e.heated,
                    e.antenna,
                    e.rain_sensor,
                    e.molding_black,
                    e.molding_chrome,
                    e.tint,
                    e.tint_strip,
                    e.vin_etch,
                    e.green_blue,
                    e.gray,
                    e.bronze,
                    e.ldws
                    
                FROM appointments a
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN vehicles v ON a.vehicle_id = v.id
                LEFT JOIN addresses addr ON a.address_id = addr.id
                LEFT JOIN insurance_appointment ia ON a.insurance_id = ia.id
                LEFT JOIN general_insurance gi ON ia.general_appointment_id = gi.id
                LEFT JOIN rebates r ON a.rebate_id = r.id
                LEFT JOIN sales s ON a.sale_id = s.id
                LEFT JOIN jobs_appointment ja ON a.id = ja.appointment_id
                LEFT JOIN extras e ON ja.id = e.jobs_id
                ORDER BY a.installation_date DESC, a.created_at DESC
            `);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener cita por ID con jobs y extras
    static async getByIdWithDetails(id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    a.*,
                    
                    -- Información del cliente
                    c.fullname as customer_name,
                    c.phone as customer_phone,
                    c.secondary_phone as customer_alt_phone,
                    c.email as customer_email,
                    
                    -- Información del vehículo
                    v.year as vehicle_year,
                    v.make as vehicle_make,
                    v.model as vehicle_model,
                    v.color as vehicle_color,
                    v.vin as vehicle_vin,
                    v.doors as vehicle_doors,
                    v.winshield_part_number,
                    
                    -- Información de dirección
                    addr.street_address,
                    addr.city,
                    addr.state,
                    addr.zipcode,
                    addr.unit_number,
                    addr.main_cross_streets,
                    addr.apartment_name,
                    addr.building,
                    addr.business_name,
                    
                    -- Información de seguro
                    ia.policy_number,
                    ia.date_of_loss,
                    ia.glass_deductible,
                    ia.safelife,
                    ia.lynx,
                    ia.other as insurance_other,
                    gi.name as insurance_company,
                    gi.phone_number as insurance_phone,
                    
                    -- Información de rebate
                    r.has_rebate,
                    r.cash as rebate_cash,
                    r.cheque as rebate_check,
                    
                    -- Información de venta
                    s.price_cash,
                    s.payment_type,
                    s.salesperson,
                    s.origin,
                    
                    -- Información de jobs (tipos de vidrio)
                    ja.id as jobs_id,
                    ja.winshield,
                    ja.front_door,
                    ja.back_door,
                    ja.quarter,
                    ja.vent,
                    
                    -- Información de extras (características)
                    e.id as extras_id,
                    e.hud,
                    e.heated,
                    e.antenna,
                    e.rain_sensor,
                    e.molding_black,
                    e.molding_chrome,
                    e.tint,
                    e.tint_strip,
                    e.vin_etch,
                    e.green_blue,
                    e.gray,
                    e.bronze
                    
                FROM appointments a
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN vehicles v ON a.vehicle_id = v.id
                LEFT JOIN addresses addr ON a.address_id = addr.id
                LEFT JOIN insurance_appointment ia ON a.insurance_id = ia.id
                LEFT JOIN general_insurance gi ON ia.general_appointment_id = gi.id
                LEFT JOIN rebates r ON a.rebate_id = r.id
                LEFT JOIN sales s ON a.sale_id = s.id
                LEFT JOIN jobs_appointment ja ON a.id = ja.appointment_id
                LEFT JOIN extras e ON ja.id = e.jobs_id
                WHERE a.id = ?
            `, [id]);
            
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Obtener clientes con sus direcciones
    static async getCustomersWithAddresses() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    c.id,
                    c.fullname,
                    c.phone,
                    c.secondary_phone,
                    c.email,
                    c.created_at,
                    
                    -- Información de dirección
                    a.id as address_id,
                    a.street_address,
                    a.city,
                    a.state,
                    a.zipcode,
                    a.unit_number,
                    a.main_cross_streets,
                    a.apartment_name,
                    a.building,
                    a.business_name
                    
                FROM customers c
                LEFT JOIN addresses a ON c.address_id = a.id
                ORDER BY c.fullname ASC
                LIMIT 100
            `);
            
            // Agrupar la información de dirección en un objeto
            return rows.map(row => ({
                id: row.id,
                fullname: row.fullname,
                phone: row.phone,
                secondary_phone: row.secondary_phone,
                email: row.email,
                created_at: row.created_at,
                address: row.address_id ? {
                    id: row.address_id,
                    street_address: row.street_address,
                    city: row.city,
                    state: row.state,
                    zipcode: row.zipcode,
                    unit_number: row.unit_number,
                    main_cross_streets: row.main_cross_streets,
                    apartment_name: row.apartment_name,
                    building: row.building,
                    business_name: row.business_name
                } : null
            }));
        } catch (error) {
            throw error;
        }
    }

    // Búsqueda de clientes con paginación y filtros
    static async searchCustomersWithPagination({ searchTerm, limit = 20, page = 1 }) {
        try {
            const offset = (page - 1) * limit;

            let query = `
            SELECT 
                c.id,
                c.fullname,
                c.phone,
                c.secondary_phone,
                c.email,
                c.created_at,
                
                -- Información de dirección
                a.id as address_id,
                a.street_address,
                a.city,
                a.state,
                a.zipcode,
                a.unit_number,
                a.main_cross_streets,
                a.apartment_name,
                a.building,
                a.business_name
                
            FROM customers c
            LEFT JOIN addresses a ON c.address_id = a.id
            `;

            const queryParams = [];

            // Agregar filtro de búsqueda si se proporciona
            if (searchTerm && searchTerm.length > 0) {
                query += ` WHERE (
                    c.fullname LIKE ? OR 
                    c.phone LIKE ? OR 
                    c.email LIKE ? OR
                    CONCAT(COALESCE(a.street_address, ''), ' ', COALESCE(a.city, '')) LIKE ?
                )`;
                const searchPattern = `%${searchTerm}%`;
                queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
            }

            // Ordenar por relevancia: primero coincidencias exactas en nombre, luego por teléfono
            query += ` ORDER BY 
                CASE 
                    WHEN c.fullname LIKE ? THEN 1
                    WHEN c.phone LIKE ? THEN 2
                    WHEN c.email LIKE ? THEN 3
                    ELSE 4 
                END,
                c.fullname ASC
            LIMIT ? OFFSET ?
            `;

            // Parámetros para ordenamiento
            const searchStart = searchTerm ? `${searchTerm}%` : '%';
            queryParams.push(searchStart, searchStart, searchStart, limit, offset);

            console.log('🔍 Executing search query with params:', { searchTerm, limit, offset });

            const [customers] = await db.query(query, queryParams);

            // Contar total de resultados para paginación
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM customers c 
                LEFT JOIN addresses a ON c.address_id = a.id
                `;
            let countParams = [];

            if (searchTerm && searchTerm.length > 0) {
                countQuery += ` WHERE (
                    c.fullname LIKE ? OR 
                    c.phone LIKE ? OR 
                    c.email LIKE ? OR
                    CONCAT(COALESCE(a.street_address, ''), ' ', COALESCE(a.city, '')) LIKE ?
                )`;
                const searchPattern = `%${searchTerm}%`;
                countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
            }

            const [countResult] = await db.query(countQuery, countParams);
            const total = countResult[0].total;

            // Formatear resultados con estructura consistente
            const formattedCustomers = customers.map(row => ({
                id: row.id,
                fullname: row.fullname,
                phone: row.phone,
                secondary_phone: row.secondary_phone,
                email: row.email,
                created_at: row.created_at,
                address: row.address_id ? {
                    id: row.address_id,
                    street_address: row.street_address,
                    city: row.city,
                    state: row.state,
                    zipcode: row.zipcode,
                    unit_number: row.unit_number,
                    main_cross_streets: row.main_cross_streets,
                    apartment_name: row.apartment_name,
                    building: row.building,
                    business_name: row.business_name
                } : null
            }));

            // Calcular información de paginación
            const totalPages = Math.ceil(total / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            console.log(`📊 Search results: ${formattedCustomers.length} customers found, total: ${total}`);

            return {
                customers: formattedCustomers,
                pagination: {
                    current_page: page,
                    per_page: limit,
                    total_items: total,
                    total_pages: totalPages,
                    has_next_page: hasNextPage,
                    has_prev_page: hasPrevPage,
                    from: total > 0 ? offset + 1 : 0,
                    to: Math.min(offset + limit, total)
                }
            };

        } catch (error) {
            console.error('❌ Error in searchCustomersWithPagination:', error);
            throw error;
        }
    }

    // Obtener información de seguro del cliente con más detalles
    static async getCustomerInsurance(customerId) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    ci.id,
                    ci.policy_number,
                    ci.comment,
                    ci.general_insurance_id,
                    gi.name as insurance_name,
                    gi.phone_number as insurance_phone,
                    ci.created_at,
                    ci.updated_at
                FROM customer_insurance ci
                INNER JOIN general_insurance gi ON ci.general_insurance_id = gi.id
                WHERE ci.id = (
                    SELECT insurance_id FROM customers WHERE id = ? AND insurance_id IS NOT NULL
                )
            `, [customerId]);
            
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Obtener todas las aseguradoras generales
    static async getGeneralInsurance() {
        try {
            const [rows] = await db.query(`
                SELECT id, name, phone_number, created_at
                FROM general_insurance
                ORDER BY name ASC
            `);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener vehículos del cliente
    static async getCustomerVehicles(customerId) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id, year, make, model, color, vin, doors, created_at, winshield_part_number
                FROM vehicles
                WHERE customer_id = ?
                ORDER BY created_at DESC
            `, [customerId]);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar cita
    static async updateAppointment(id, updateData) {
    try {
        const [result] = await db.query(`
            UPDATE appointments 
            SET 
                installation_date = ?,
                installation_time = ?,
                location_type = ?,
                replacement_type = ?,
                tech_name = ?,
                service_advisor = ?,
                edirect = ?,
                comment = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            updateData.installation_date,
            updateData.installation_time,
            updateData.location_type,
            updateData.replacement_type,
            updateData.tech_name,
            updateData.service_advisor,
            updateData.edirect,
            updateData.comment,
            id
        ]);
        
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

    // Eliminar cita (soft delete)
    static async deleteAppointment(id) {
        try {
            const [result] = await db.query(`
                DELETE FROM appointments WHERE id = ?
            `, [id]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Método mejorado para eliminar appointment con cascada manual completa
    static async deleteAppointmentWithCascade(appointmentId) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            console.log(`🔍 Starting cascade delete for appointment ID: ${appointmentId}`);
            
            // Objeto para rastrear lo que se eliminó
            const deletedItems = {
                appointment: false,
                appointment_audit: 0,
                jobs_appointment: 0,
                extras: 0,
                message: 'Deletion process completed'
            };

            // 1. Obtener información de jobs_appointment relacionados ANTES de eliminar
            const [jobsAppointments] = await connection.query(`
                SELECT id FROM jobs_appointment WHERE appointment_id = ?
            `, [appointmentId]);
            
            console.log(`📋 Found ${jobsAppointments.length} jobs_appointment records to delete`);

            // 2. Eliminar extras relacionados a cada job_appointment
            let totalExtrasDeleted = 0;
            for (const job of jobsAppointments) {
                const [extrasResult] = await connection.query(`
                    DELETE FROM extras WHERE jobs_id = ?
                `, [job.id]);
                
                totalExtrasDeleted += extrasResult.affectedRows;
                console.log(`🗑️ Deleted ${extrasResult.affectedRows} extras for job ID: ${job.id}`);
            }
            deletedItems.extras = totalExtrasDeleted;

            // 3. Eliminar jobs_appointment relacionados
            const [jobsResult] = await connection.query(`
                DELETE FROM jobs_appointment WHERE appointment_id = ?
            `, [appointmentId]);
            
            deletedItems.jobs_appointment = jobsResult.affectedRows;
            console.log(`🗑️ Deleted ${jobsResult.affectedRows} jobs_appointment records`);

            // 4. Eliminar appointment principal (esto eliminará automáticamente appointment_audit por CASCADE)
            const [appointmentResult] = await connection.query(`
                DELETE FROM appointments WHERE id = ?
            `, [appointmentId]);
            
            if (appointmentResult.affectedRows > 0) {
                deletedItems.appointment = true;
                console.log(`✅ Successfully deleted appointment ID: ${appointmentId}`);
            } else {
                console.log(`⚠️ No appointment found with ID: ${appointmentId}`);
                throw new Error('Appointment not found');
            }

            // 5. Verificar que appointment_audit se eliminó automáticamente (CASCADE)
            const [auditCheckResult] = await connection.query(`
                SELECT COUNT(*) as count FROM appointment_audit WHERE appointment_id = ?
            `, [appointmentId]);
            
            // Si el CASCADE funcionó, no debería haber registros de audit
            if (auditCheckResult[0].count === 0) {
                console.log(`✅ Appointment audit records were deleted automatically by CASCADE`);
                deletedItems.appointment_audit = 'Auto-deleted by CASCADE';
            } else {
                console.log(`⚠️ Warning: ${auditCheckResult[0].count} audit records still exist`);
                deletedItems.appointment_audit = `Warning: ${auditCheckResult[0].count} records still exist`;
            }

            // Confirmar la transacción
            await connection.commit();
            
            console.log(`✅ Cascade delete completed successfully for appointment ${appointmentId}`);
            console.log(`📊 Summary:`, deletedItems);
            
            return {
                success: true,
                deletedItems: deletedItems
            };

        } catch (error) {
            // Rollback en caso de error
            await connection.rollback();
            console.error(`❌ Error during cascade delete for appointment ${appointmentId}:`, error);
            throw error;
            
        } finally {
            connection.release();
        }
    }


    // Método para actualizar solo información del cliente
    static async updateCustomerInfo(customerId, customerData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Actualizar información básica del cliente
            await connection.query(`
                UPDATE customers 
                SET fullname = ?, phone = ?, secondary_phone = ?, email = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                customerData.fullname,
                customerData.phone,
                customerData.secondary_phone,
                customerData.email,
                customerId
            ]);

            // Actualizar dirección si se proporciona
            if (customerData.address) {
                const [customerResult] = await connection.query(`
                    SELECT address_id FROM customers WHERE id = ?
                `, [customerId]);

                if (customerResult[0]?.address_id) {
                    await connection.query(`
                        UPDATE addresses 
                        SET street_address = ?, city = ?, state = ?, zipcode = ?, 
                            unit_number = ?, main_cross_streets = ?, apartment_name = ?, building = ?,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `, [
                        customerData.address.street_address,
                        customerData.address.city,
                        customerData.address.state,
                        customerData.address.zipcode,
                        customerData.address.unit_number,
                        customerData.address.main_cross_streets,
                        customerData.address.apartment_name,
                        customerData.address.building,
                        customerResult[0].address_id
                    ]);
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Método para actualizar solo información del seguro del cliente
    static async updateCustomerInsurance(customerId, insuranceData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Verificar si el cliente ya tiene información de seguro
            const [existingCustomerInsurance] = await connection.query(`
                SELECT insurance_id FROM customers WHERE id = ?
            `, [customerId]);

            if (existingCustomerInsurance[0]?.insurance_id) {
                // Actualizar seguro existente
                await connection.query(`
                    UPDATE customer_insurance 
                    SET policy_number = ?, general_insurance_id = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [
                    insuranceData.policy_number,
                    insuranceData.general_insurance_id,
                    existingCustomerInsurance[0].insurance_id
                ]);
            } else {
                // Crear nuevo seguro para el cliente
                const [customerInsuranceResult] = await connection.query(`
                    INSERT INTO customer_insurance (
                        policy_number, general_insurance_id, created_at, updated_at
                    ) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `, [
                    insuranceData.policy_number,
                    insuranceData.general_insurance_id
                ]);

                // Actualizar el customer con el nuevo seguro
                await connection.query(`
                    UPDATE customers SET insurance_id = ? WHERE id = ?
                `, [customerInsuranceResult.insertId, customerId]);
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener estadísticas de citas
    static async getAppointmentStats() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) as total_appointments,
                    SUM(CASE WHEN replacement_type = 'insurance' THEN 1 ELSE 0 END) as insurance_appointments,
                    SUM(CASE WHEN replacement_type = 'out_of_pocket' THEN 1 ELSE 0 END) as cash_appointments,
                    SUM(CASE WHEN location_type = 'home' THEN 1 ELSE 0 END) as home_appointments,
                    SUM(CASE WHEN location_type = 'shop' THEN 1 ELSE 0 END) as shop_appointments,
                    SUM(CASE WHEN location_type = 'other' THEN 1 ELSE 0 END) as other_appointments,
                    SUM(CASE WHEN installation_date >= CURDATE() THEN 1 ELSE 0 END) as upcoming_appointments,
                    SUM(CASE WHEN installation_date < CURDATE() THEN 1 ELSE 0 END) as past_appointments
                FROM appointments
            `);
            
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Buscar citas con filtros
    static async searchAppointments(filters) {
        try {
            let query = `
                SELECT 
                    a.id,
                    a.installation_date,
                    a.installation_time,
                    a.location_type,
                    a.replacement_type,
                    a.created_at,
                    
                    c.fullname as customer_name,
                    c.phone as customer_phone,
                    
                    v.year as vehicle_year,
                    v.make as vehicle_make,
                    v.model as vehicle_model,
                    
                    addr.street_address,
                    addr.city,
                    addr.state,
                    
                    gi.name as insurance_company
                    
                FROM appointments a
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN vehicles v ON a.vehicle_id = v.id
                LEFT JOIN addresses addr ON a.address_id = addr.id
                LEFT JOIN insurance_appointment ia ON a.insurance_id = ia.id
                LEFT JOIN general_insurance gi ON ia.general_appointment_id = gi.id
                WHERE 1=1
            `;

            const queryParams = [];

            if (filters.customer_name) {
                query += ` AND c.fullname LIKE ?`;
                queryParams.push(`%${filters.customer_name}%`);
            }

            if (filters.installation_date_from) {
                query += ` AND a.installation_date >= ?`;
                queryParams.push(filters.installation_date_from);
            }

            if (filters.installation_date_to) {
                query += ` AND a.installation_date <= ?`;
                queryParams.push(filters.installation_date_to);
            }

            if (filters.location_type) {
                query += ` AND a.location_type = ?`;
                queryParams.push(filters.location_type);
            }

            if (filters.replacement_type) {
                query += ` AND a.replacement_type = ?`;
                queryParams.push(filters.replacement_type);
            }

            query += ` ORDER BY a.installation_date DESC, a.created_at DESC`;
            query += ` LIMIT ? OFFSET ?`;
            queryParams.push(filters.limit, filters.offset);

            const [rows] = await db.query(query, queryParams);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener citas por rango de fechas
    static async getAppointmentsByDateRange(startDate, endDate) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    a.id,
                    a.installation_date,
                    a.installation_time,
                    a.location_type,
                    a.replacement_type,
                    
                    c.fullname as customer_name,
                    c.phone as customer_phone,
                    
                    v.year as vehicle_year,
                    v.make as vehicle_make,
                    v.model as vehicle_model,
                    v.color as vehicle_color,
                    
                    addr.street_address,
                    addr.city,
                    addr.state,
                    
                    gi.name as insurance_company
                    
                FROM appointments a
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN vehicles v ON a.vehicle_id = v.id
                LEFT JOIN addresses addr ON a.address_id = addr.id
                LEFT JOIN insurance_appointment ia ON a.insurance_id = ia.id
                LEFT JOIN general_insurance gi ON ia.general_appointment_id = gi.id
                WHERE a.installation_date BETWEEN ? AND ?
                ORDER BY a.installation_date ASC, a.installation_time ASC
            `, [startDate, endDate]);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener datos completos del dashboard
    static async getDashboardData() {
        try {
            // Obtener estadísticas generales
            const stats = await this.getAppointmentStats();
            
            // Usar Luxon para obtener fecha actual
            const today = DateTime.now().toISODate();
            
            // Obtener citas de hoy
            const [todayAppointments] = await db.query(`
                SELECT 
                    a.id,
                    a.installation_time,
                    c.fullname as customer_name,
                    c.phone as customer_phone,
                    v.year as vehicle_year,
                    v.make as vehicle_make,
                    v.model as vehicle_model,
                    addr.street_address,
                    addr.city
                FROM appointments a
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN vehicles v ON a.vehicle_id = v.id
                LEFT JOIN addresses addr ON a.address_id = addr.id
                WHERE a.installation_date = ?
                ORDER BY a.installation_time ASC
            `, [today]);
            
            // Obtener próximas citas (próximos 7 días) usando Luxon
            const nextWeek = DateTime.now().plus({ days: 7 }).toISODate();
            const [upcomingAppointments] = await db.query(`
                SELECT 
                    a.id,
                    a.installation_date,
                    a.installation_time,
                    c.fullname as customer_name,
                    v.year as vehicle_year,
                    v.make as vehicle_make,
                    v.model as vehicle_model
                FROM appointments a
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN vehicles v ON a.vehicle_id = v.id
                WHERE a.installation_date > ? AND a.installation_date <= ?
                ORDER BY a.installation_date ASC, a.installation_time ASC
                LIMIT 10
            `, [today, nextWeek]);
            
            return {
                stats,
                today_appointments: todayAppointments,
                upcoming_appointments: upcomingAppointments,
                today_count: todayAppointments.length,
                upcoming_count: upcomingAppointments.length
            };
        } catch (error) {
            throw error;
        }
    }

    // Verificar disponibilidad de horario
    static async checkTimeSlotAvailability(date, timeSlot, excludeAppointmentId = null) {
        try {
            const query = excludeAppointmentId 
            ? 'SELECT COUNT(*) as count FROM appointments WHERE installation_date = ? AND installation_time = ? AND id != ?'
            : 'SELECT COUNT(*) as count FROM appointments WHERE installation_date = ? AND installation_time = ?';
            
            const params = excludeAppointmentId ? [date, timeSlot, excludeAppointmentId] : [date, timeSlot];
            const [result] = await db.query(query, params);
            
            return result[0].count === 0;
        } catch (error) {
            throw error;
        }
    }

    // Obtener horarios disponibles para una fecha
    static async getAvailableTimeSlots(date) {
        try {
            // Horarios de trabajo disponibles (slots de tiempo)
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

            return {
            date,
            available_slots: availableSlots,
            booked_slots: Array.from(bookedSlotsSet),
            total_available: availableSlots.length,
            total_booked: bookedSlots.length
            };
        } catch (error) {
            throw error;
        }
    }

    // Obtener resumen de appointment por ID
    static async getAppointmentSummary(id) {
        try {
            const appointment = await this.getByIdWithDetails(id);
            
            if (!appointment) {
                return null;
            }

            // Usar Luxon para cálculos de fecha
            const installationDate = DateTime.fromISO(appointment.installation_date);
            const today = DateTime.now().startOf('day');
            const daysDiff = installationDate.diff(today, 'days').days;

            return {
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
                        vent: !!appointment.vent,
                        antenna: !!appointment.antenna
                    },
                    features: {
                        hud: !!appointment.hud,
                        heated: !!appointment.heated,
                        rain_sensor: !!appointment.rain_sensor,
                        molding_black: !!appointment.molding_black,
                        molding_chrome: !!appointment.molding_chrome,
                        tint: !!appointment.tint,
                        tint_strip: !!appointment.tint_strip,
                        vin_etch: !!appointment.vin_etch
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
                    is_past: daysDiff < 0,
                    days_until: Math.ceil(daysDiff)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Método para actualizar jobs y extras de una cita existente
    static async updateAppointmentGlassDetails(appointmentId, glassTypes, glassFeatures) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Buscar el job existente
            const [existingJob] = await connection.query(`
                SELECT id FROM jobs_appointment WHERE appointment_id = ?
            `, [appointmentId]);

            let jobsId;

            if (existingJob[0]) {
                // Actualizar job existente
                jobsId = existingJob[0].id;
                await connection.query(`
                    UPDATE jobs_appointment 
                    SET winshield = ?, front_door = ?, back_door = ?, quarter = ?, vent = ?
                    WHERE id = ?
                `, [
                    glassTypes.has_windshield ? 1 : 0,
                    glassTypes.has_door_glass ? 1 : 0,
                    glassTypes.has_back_glass ? 1 : 0,
                    glassTypes.has_quarter_glass ? 1 : 0,
                    glassTypes.has_vent_glass ? 1 : 0,
                    jobsId
                ]);
            } else {
                // Crear nuevo job
                const [jobResult] = await connection.query(`
                    INSERT INTO jobs_appointment (appointment_id, winshield, front_door, back_door, quarter, vent)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    appointmentId,
                    glassTypes.has_windshield ? 1 : 0,
                    glassTypes.has_door_glass ? 1 : 0,
                    glassTypes.has_back_glass ? 1 : 0,
                    glassTypes.has_quarter_glass ? 1 : 0,
                    glassTypes.has_vent_glass ? 1 : 0
                ]);
                jobsId = jobResult.insertId;
            }

            // Actualizar o crear extras
            const [existingExtras] = await connection.query(`
                SELECT id FROM extras WHERE jobs_id = ?
            `, [jobsId]);

            if (existingExtras[0]) {
                // Actualizar extras existentes
                await connection.query(`
                    UPDATE extras 
                    SET hud = ?, heated = ?, antenna = ?, rain_sensor = ?, molding_black = ?, molding_chrome = ?, 
                        tint = ?, tint_strip = ?, vin_etch = ?, green_blue = ?, gray = ?, bronze = ?
                    WHERE jobs_id = ?
                `, [
                    glassFeatures.has_ldws ? 1 : 0,
                    glassFeatures.heated ? 1 : 0,
                    glassFeatures.has_antenna ? 1 : 0,
                    glassFeatures.has_rain_sensor ? 1 : 0,
                    glassFeatures.has_black ? 1 : 0,
                    glassFeatures.has_chrome ? 1 : 0,
                    glassFeatures.has_windshield_tint ? 1 : 0,
                    glassFeatures.has_tint_strip ? 1 : 0,
                    glassFeatures.vin_etch ? 1 : 0,
                    glassFeatures.green_blue ? 1 : 0,
                    glassFeatures.gray ? 1 : 0,
                    glassFeatures.bronze ? 1 : 0,
                    jobsId
                ]);
            } else {
                // Crear nuevos extras
                await connection.query(`
                    INSERT INTO extras (hud, heated, antenna, rain_sensor, molding_black, molding_chrome, 
                            tint, tint_strip, vin_etch, green_blue, gray, bronze, jobs_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    glassFeatures.has_ldws ? 1 : 0,
                    glassFeatures.heated ? 1 : 0,
                    glassFeatures.has_antenna ? 1 : 0,
                    glassFeatures.has_rain_sensor ? 1 : 0,
                    glassFeatures.has_black ? 1 : 0,
                    glassFeatures.has_chrome ? 1 : 0,
                    glassFeatures.has_windshield_tint ? 1 : 0,
                    glassFeatures.has_tint_strip ? 1 : 0,
                    glassFeatures.vin_etch ? 1 : 0,
                    glassFeatures.green_blue ? 1 : 0,
                    glassFeatures.gray ? 1 : 0,
                    glassFeatures.bronze ? 1 : 0,
                    jobsId
                ]);
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Verificar que un vehículo pertenece a un cliente
    static async verifyVehicleOwnership(vehicleId, customerId) {
        try {
            const [rows] = await db.query(`
                SELECT COUNT(*) as count 
                FROM vehicles 
                WHERE id = ? AND customer_id = ?
            `, [vehicleId, customerId]);
            
            return rows[0].count > 0;
        } catch (error) {
            throw error;
        }
    }

    // Obtener cada appoitment con sus detalles pertenciente a un cliente
    static async getCustomerAppointmentsById(customerId) {
        const [appointments] = await db.query(`
        SELECT
        a.*,
        -- Información del vehículo
        v.year as vehicle_year,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.color as vehicle_color,
        v.vin as vehicle_vin,
        v.doors as vehicle_doors,
        v.winshield_part_number as vehicle_winshield_part_number,

        -- Información de dirección
        addr.street_address,
        addr.city,
        addr.state,
        addr.zipcode,
        addr.unit_number,
        addr.main_cross_streets,
        addr.apartment_name,
        addr.building,
        addr.business_name,

        -- Información de seguro
        ia.policy_number,
        ia.date_of_loss,
        ia.glass_deductible,
        ia.safelife,
        ia.lynx,
        ia.other as insurance_other,
        gi.name as insurance_company,
        gi.phone_number as insurance_phone,

        -- Información de rebate
        r.has_rebate,
        r.cash as rebate_cash,
        r.cheque as rebate_check,

        -- Información de venta
        s.price_cash,
        s.payment_type,
        s.salesperson,
        s.origin,

        -- Información de jobs (tipos de vidrio)
        ja.id as jobs_id,
        ja.winshield,
        ja.front_door,
        ja.back_door,
        ja.quarter,
        ja.vent,

        -- Información de extras (características)
        e.id as extras_id,
        e.hud,
        e.heated,
        e.antenna,
        e.rain_sensor,
        e.molding_black,
        e.molding_chrome,
        e.tint,
        e.tint_strip,
        e.vin_etch,
        e.green_blue,
        e.gray,
        e.bronze

        FROM appointments a
        LEFT JOIN vehicles v ON a.vehicle_id = v.id
        LEFT JOIN addresses addr ON a.address_id = addr.id
        LEFT JOIN insurance_appointment ia ON a.insurance_id = ia.id
        LEFT JOIN general_insurance gi ON ia.general_appointment_id = gi.id
        LEFT JOIN rebates r ON a.rebate_id = r.id
        LEFT JOIN sales s ON a.sale_id = s.id
        LEFT JOIN jobs_appointment ja ON a.id = ja.appointment_id
        LEFT JOIN extras e ON ja.id = e.jobs_id
        WHERE a.customer_id = ?;
    `,[customerId]);
        return appointments;
    }

    /**
     * Obtener appointments con vista completa y filtros avanzados
     * CORREGIDO: Manejo mejorado de fechas con Luxon
     */
    static async getAppointmentsCompleteView(filters = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                status = 'all',
                search = '',
                payment_type = 'all',
                location_type = 'all',
                date_from = '',
                date_to = '',
                sort_by = 'installation_date',
                sort_order = 'desc'
            } = filters;

            let whereConditions = [];
            let queryParams = [];

            // Usar Luxon para obtener fecha actual
            const today = DateTime.now().toISODate();
            
            console.log('🗓️ Today (Luxon):', today);
            console.log('🔍 Filters received:', { date_from, date_to, status });

            // Filtro por estado usando fechas
            switch (status) {
                case 'scheduled':
                    whereConditions.push('installation_date > ?');
                    queryParams.push(today);
                    break;
                case 'today':
                    whereConditions.push('installation_date = ?');
                    queryParams.push(today);
                    break;
                case 'completed':
                    whereConditions.push('installation_date < ?');
                    queryParams.push(today);
                    break;
                default:
                    // 'all' - no filter
                    break;
            }

            // Filtro por búsqueda mejorado
            if (search && search.trim() !== '') {
                whereConditions.push(`(
                    customer_name LIKE ? OR 
                    customer_phone LIKE ? OR 
                    vehicle_vin LIKE ? OR
                    CONCAT(vehicle_year, ' ', vehicle_make, ' ', vehicle_model) LIKE ?
                )`);
                const searchTerm = `%${search.trim()}%`;
                queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            // Filtros de pago
            if (payment_type && payment_type !== 'all') {
                if (payment_type === 'insurance') {
                    whereConditions.push('replacement_type = ?');
                    queryParams.push('insurance');
                } else if (payment_type === 'cash') {
                    whereConditions.push('replacement_type = ?');
                    queryParams.push('out_of_pocket');
                }
            }

            // Filtro por tipo de ubicación
            if (location_type && location_type !== 'all') {
                whereConditions.push('location_type = ?');
                queryParams.push(location_type);
            }

            // Validación de filtros de fecha
            if (date_from && date_from.trim() !== '') {
                const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                if (datePattern.test(date_from.trim())) {
                    const fromDateLuxon = DateTime.fromISO(date_from.trim());
                    if (fromDateLuxon.isValid) {
                        whereConditions.push('installation_date >= ?');
                        queryParams.push(date_from.trim());
                    }
                }
            }

            if (date_to && date_to.trim() !== '') {
                const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                if (datePattern.test(date_to.trim())) {
                    const toDateLuxon = DateTime.fromISO(date_to.trim());
                    if (toDateLuxon.isValid) {
                        whereConditions.push('installation_date <= ?');
                        queryParams.push(date_to.trim());
                    }
                }
            }

            // Construir la consulta principal
            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
            
            // Validar campos de ordenamiento
            const validSortFields = [
                'installation_date', 'customer_name', 'vehicle_make', 
                'appointment_created_at', 'total_amount'
            ];
            const sortField = validSortFields.includes(sort_by) ? sort_by : 'installation_date';
            const sortDirection = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

            // Paginación
            const offset = (parseInt(page) - 1) * parseInt(limit);
            
            // CONSULTA PRINCIPAL ACTUALIZADA usando campos correctos de la vista
            const mainQuery = `
                SELECT 
                    appointment_id,
                    installation_date,
                    installation_time,
                    location_type,
                    replacement_type,
                    appointment_comment,
                    tech_name,
                    service_advisor,
                    edirect,
                    appointment_created_at,
                    appointment_updated_at,
                    
                    -- Información del cliente
                    customer_id,
                    customer_name,
                    customer_phone,
                    customer_alt_phone,
                    customer_email,
                    customer_street_address,
                    customer_city,
                    customer_state,
                    customer_zipcode,
                    customer_cross_streets,
                    customer_created_at,
                    
                    -- Información del vehículo
                    vehicle_id,
                    vehicle_year,
                    vehicle_make,
                    vehicle_model,
                    vehicle_color,
                    vehicle_vin,
                    vehicle_doors,
                    winshield_part_number,
                    
                    -- Información de instalación
                    installation_street_address,
                    installation_city,
                    installation_state,
                    installation_zipcode,
                    installation_business_name,
                    installation_cross_streets,
                    installation_property_type,
                    
                    -- Información de seguro
                    insurance_company_name,
                    appointment_policy_number,
                    date_of_loss,
                    glass_deductible,
                    safelife,
                    lynx,
                    insurance_other_info,
                    
                    -- Información de rebate/pago
                    has_rebate,
                    rebate_cash_amount,
                    rebate_check_amount,
                    cash_price,
                    total_amount,
                    
                    -- Tipos de vidrio
                    has_windshield,
                    has_front_door,
                    has_back_door,
                    has_quarter_glass,
                    has_vent_glass,
                    
                    -- Características de vidrio
                    has_hud,
                    has_heated,
                    has_antenna,
                    has_rain_sensor,
                    has_molding_black,
                    has_molding_chrome,
                    has_tint,
                    has_tint_strip,
                    has_vin_etch,
                    has_green_blue,
                    has_gray,
                    has_bronze,
                    has_ldws,
                    
                    -- Estado y resúmenes
                    appointment_status,
                    days_until_appointment,
                    glass_types_summary,
                    glass_features_summary,
                    installation_contact_summary
                    
                FROM appointment_complete_view
                ${whereClause}
                ORDER BY ${sortField} ${sortDirection}, appointment_created_at DESC
                LIMIT ? OFFSET ?
            `;

            queryParams.push(parseInt(limit), offset);

            const [appointments] = await db.query(mainQuery, queryParams);

            // Consulta para contar el total
            const countQuery = `
                SELECT COUNT(*) as total
                FROM appointment_complete_view
                ${whereClause}
            `;

            const [countResult] = await db.query(countQuery, queryParams.slice(0, -2));
            const totalAppointments = countResult[0].total;

            // Calcular información de paginación
            const totalPages = Math.ceil(totalAppointments / parseInt(limit));
            const hasNextPage = parseInt(page) < totalPages;
            const hasPrevPage = parseInt(page) > 1;

            // Estadísticas usando la vista
            const [statsResult] = await db.query(`
                SELECT 
                    COUNT(*) as total_all,
                    SUM(CASE WHEN appointment_status = 'scheduled' THEN 1 ELSE 0 END) as total_scheduled,
                    SUM(CASE WHEN appointment_status = 'today' THEN 1 ELSE 0 END) as total_today,
                    SUM(CASE WHEN appointment_status = 'completed' THEN 1 ELSE 0 END) as total_completed,
                    SUM(CASE WHEN replacement_type = 'insurance' THEN 1 ELSE 0 END) as total_insurance,
                    SUM(CASE WHEN replacement_type = 'out_of_pocket' THEN 1 ELSE 0 END) as total_cash,
                    COALESCE(AVG(CASE WHEN total_amount > 0 THEN total_amount END), 0) as average_amount
                FROM appointment_complete_view
            `);

            console.log('📊 Query results:', {
                totalAppointments,
                appointmentsFound: appointments.length,
                whereClause,
                paramsCount: queryParams.length
            });

            return {
                data: appointments,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total_items: totalAppointments,
                    total_pages: totalPages,
                    has_next_page: hasNextPage,
                    has_prev_page: hasPrevPage,
                    from: totalAppointments > 0 ? offset + 1 : 0,
                    to: Math.min(offset + parseInt(limit), totalAppointments)
                },
                filters: {
                    status,
                    search,
                    payment_type,
                    location_type,
                    date_from,
                    date_to,
                    sort_by: sortField,
                    sort_order: sortDirection.toLowerCase()
                },
                stats: statsResult[0] || {
                    total_all: 0,
                    total_scheduled: 0,
                    total_today: 0,
                    total_completed: 0,
                    total_insurance: 0,
                    total_cash: 0,
                    average_amount: 0
                }
            };

        } catch (error) {
            console.error('❌ Error in getAppointmentsCompleteView:', error);
            throw error;
        }
    }

    /**
     * Obtener detalles completos de un appointment específico usando la vista
     */
    static async getAppointmentCompleteDetails(appointmentId) {
        try {
            const [appointmentDetails] = await db.query(`
                SELECT * FROM appointment_complete_view WHERE appointment_id = ?
            `, [appointmentId]);
            
            if (appointmentDetails.length === 0) {
                return null;
            }

            const appointment = appointmentDetails[0];

            // Determinar la dirección correcta según el tipo de ubicación
            let installationAddress = null;
            
            if (appointment.location_type === 'home') {
                // Usar dirección del cliente
                installationAddress = {
                    street: appointment.installation_street_address,
                    // cross_streets: appointment.installation_cross_streets,
                    city: appointment.installation_city,
                    state: appointment.installation_state,
                    zip: appointment.installation_zipcode,
                    type: 'Customer Home'
                };
            } else if (appointment.location_type === 'shop') {
                // Instalación en taller
                installationAddress = {
                    type: 'In Shop',
                    business_name: 'Rebate Auto Glass Shop'
                };
            } else if (appointment.location_type === 'other' || appointment.location_type === 'work') {
                // Dirección alternativa
                installationAddress = {
                    street: appointment.installation_street_address,
                    cross_streets: appointment.installation_cross_streets,
                    city: appointment.installation_city,
                    state: appointment.installation_state,
                    zip: appointment.installation_zipcode,
                    business_name: appointment.installation_business_name,
                    type: 'Other Location',
                    is_commercial: !!appointment.installation_business_name,
                    property_type: appointment.installation_property_type
                };
            }

            // Calcular información de pago según el tipo
            let paymentInfo = {
                type: appointment.replacement_type,
                total_amount: appointment.total_amount
            };

            if (appointment.replacement_type === 'insurance') {
                paymentInfo.insurance = {
                    company_name: appointment.insurance_company_name,
                    policy_number: appointment.appointment_policy_number,
                    date_of_loss: appointment.date_of_loss,
                    glass_deductible: appointment.glass_deductible,
                    safelife: appointment.safelife,
                    lynx: appointment.lynx,
                    other_info: appointment.insurance_other_info
                };
                
                if (appointment.has_rebate) {
                    paymentInfo.rebate = {
                        has_rebate: appointment.has_rebate,
                        cash_amount: appointment.rebate_cash_amount,
                        check_amount: appointment.rebate_check_amount,
                        total_rebate: (parseFloat(appointment.rebate_cash_amount) || 0) + (parseFloat(appointment.rebate_check_amount) || 0)
                    };
                }
            } else {
                paymentInfo.cash_price = appointment.cash_price;
            }

            // Estructurar la respuesta completa
            return {
                // Información básica del appointment
                appointment: {
                    id: appointment.appointment_id,
                    installation_date: appointment.installation_date,
                    installation_time: appointment.installation_time,
                    location_type: appointment.location_type,
                    replacement_type: appointment.replacement_type,
                    status: appointment.appointment_status,
                    days_until: appointment.days_until_appointment,
                    comment: appointment.appointment_comment,
                    tech_name: appointment.tech_name,
                    service_advisor: appointment.service_advisor,
                    edirect: appointment.edirect,
                    created_at: appointment.appointment_created_at,
                    updated_at: appointment.appointment_updated_at
                },

                // Información del cliente
                customer: {
                    id: appointment.customer_id,
                    name: appointment.customer_name,
                    phone: appointment.customer_phone,
                    alt_phone: appointment.customer_alt_phone,
                    email: appointment.customer_email,
                    // Dirección del cliente (siempre disponible)
                    address: {
                        street: appointment.customer_street_address,
                        city: appointment.customer_city,
                        state: appointment.customer_state,
                        zip: appointment.customer_zipcode,
                        cross_streets: appointment.customer_cross_streets
                    }
                },

                // Información del vehículo
                vehicle: {
                    id: appointment.vehicle_id,
                    year: appointment.vehicle_year,
                    make: appointment.vehicle_make,
                    model: appointment.vehicle_model,
                    color: appointment.vehicle_color,
                    vin: appointment.vehicle_vin,
                    doors: appointment.vehicle_doors,
                    part_number: appointment.winshield_part_number,
                    display_name: `${appointment.vehicle_year} ${appointment.vehicle_make} ${appointment.vehicle_model}`
                },

                // Información de instalación (puede ser diferente a la del cliente)
                installation: {
                    address: installationAddress,
                    contact_summary: appointment.installation_contact_summary
                },

                // Información de pago estructurada
                payment: paymentInfo,

                // Información de vidrios y características
                glass_work: {
                    types: {
                        windshield: appointment.has_windshield,
                        front_door: appointment.has_front_door,
                        back_door: appointment.has_back_door,
                        quarter_glass: appointment.has_quarter_glass,
                        vent_glass: appointment.has_vent_glass
                    },
                    features: {
                        hud: appointment.has_hud,
                        heated: appointment.has_heated,
                        antenna: appointment.has_antenna,
                        rain_sensor: appointment.has_rain_sensor,
                        molding_black: appointment.has_molding_black,
                        molding_chrome: appointment.has_molding_chrome,
                        tint: appointment.has_tint,
                        tint_strip: appointment.has_tint_strip,
                        vin_etch: appointment.has_vin_etch,
                        green_blue: appointment.has_green_blue,
                        gray: appointment.has_gray,
                        bronze: appointment.has_bronze,
                        ldws: appointment.has_ldws
                    },
                    summary: {
                        types: appointment.glass_types_summary,
                        features: appointment.glass_features_summary
                    }
                }
            };

        } catch (error) {
            throw error;
        }
    }

}

export default appointmentsModel;
