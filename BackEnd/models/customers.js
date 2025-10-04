import db from '../config/db.js';
import appointmentsModel from "./appointments.js";

class CustomerModel {
  static async create(customer) {
    
    // (1) create a customer for the id
    const CUSTOMER_QUERY = `INSERT INTO customers
    (fullname,email,phone,secondary_phone,
     insurance_id,created_by_id,address_id)
    VALUES (?,?,?,?,?,?,?)`;
    
    // (1.1)  Insertion to customer table
    const [CUSTOMER_ANSWER] = await db.query(
      CUSTOMER_QUERY,
      [
        customer.fullname,
        customer.email || null,
        customer.phone,
        customer.secondary_phone || null,
        customer.insurance_id || null,
        customer.created_by_id || null,
        customer.address_id || null
      ]
    );

    return CUSTOMER_ANSWER.insertId;
  }
  
  static async getAllTable() {
    const GET_ALL_CUSTOMERS_QUERY = `
        SELECT
            c.id as customer_id,
            c.fullname as customer_fullname,
            c.email as customer_email,
            c.phone as customer_phone,
            c.secondary_phone as customer_secondary_phone,
            c.updated_at as last_updated_at_customer,

            ci.policy_number as customer_insurance_policy_number,
            ci.updated_at as last_updated_at_insurance,

            gi.name as insurance_name,
            gi.phone_number as insurance_phone_number
        FROM customers c
                 INNER JOIN customer_insurance ci on c.insurance_id = ci.id
                 INNER JOIN general_insurance gi on gi.id = ci.general_insurance_id

        ORDER BY  last_updated_at_customer DESC;
        
    `;
    
    const [GET_ALL_CUSTOMERS_ANSWER] = await db.query(GET_ALL_CUSTOMERS_QUERY);
    
    return GET_ALL_CUSTOMERS_ANSWER;
  }
  
  static async delete(id) {
    const DELETE_CUSTOMER_QUERY = `DELETE FROM customers WHERE id = ?`;
    
    const [DELETE_CUSTOMER_ANSWER] = await db.query(DELETE_CUSTOMER_QUERY, [id]);
    
    return DELETE_CUSTOMER_ANSWER.affectedRows;
  }
  
  static async getClientsAndLastCall() {
    const [clients] = await db.query(`
      SELECT
        C.fullname as name,
        C.phone,
        C.secondary_phone,
        C.id,
        C.email
      FROM customers C
    `, []);
    
    for (let client of clients) {
      // Construir lista de teléfonos no nulos
      const phones = [client.phone];
      if (client.secondary_phone) {
        phones.push(client.secondary_phone);
      }
      
      // Construir placeholders dinámicos (?, ?, ?...)
      const placeholders = phones.map(() => '`To` = ?').join(' OR ');
      
      const [lastCall] = await db.query(`
      SELECT DATE_FORMAT(MAX(AnsweredTime), '%d-%m-%Y') as lastCall
      FROM voip_outbound_dial
      WHERE ${placeholders}
    `, phones);
      
      client.lastCall = lastCall[0].lastCall || null;
    }
    
    return clients;
  }

  static async customerExists(name, phone) {
    const CUSTOMER_EXISTS_QUERY = `
      SELECT * FROM customers
      WHERE fullname = ? OR phone = ? LIMIT 1
    `;

    const [CUSTOMER_EXISTS_ANSWER] = await db.query(CUSTOMER_EXISTS_QUERY, [name, phone]);

    return CUSTOMER_EXISTS_ANSWER[0];
  }

  static async getById(id) {

    // (1) Get customer information by ID
    const [customer] = await db.query(`
      SELECT
        -- Customer Information
        c.id as customer_id,
        c.fullname as customer_fullname,
        c.email as customer_email,
        c.phone as customer_phone,
        c.secondary_phone as customer_secondary_phone,
        c.updated_at as last_updated_at_customer,
        c.created_at as created_at_customer,
        
        -- Customer Insurance 
        ci.id as customer_insurance_id,
        ci.policy_number as customer_insurance_policy_number,
        ci.updated_at as last_updated_at_insurance,
        
        -- General Insurance Information
        gi.name as insurance_name,
        gi.phone_number as insurance_phone_number,
        
        -- Customer Address
        ad.id as customer_address_id,
        ad.property_type as customer_address_property_type,
        ad.street_address as customer_address_street,
        ad.main_cross_streets as customer_address_main_cross_streets,
        ad.zipcode as customer_address_zipcode,
        ad.city as customer_address_city,
        ad.state as customer_address_state,
        ad.apartment_name as customer_address_apartment_name,
        ad.unit_number as customer_address_unit_number,
        ad.building as customer_address_building,
        ad.gate_code as customer_address_gate_code,
        ad.is_commercial as customer_address_is_commercial,
        ad.business_name as customer_address_business_name,
        ad.special_instructions as customer_address_special_instructions,
        ad.updated_at as last_updated_at_customer_address,
        ad.created_at as created_at_customer_address

      FROM customers c
       LEFT JOIN customer_insurance ci on c.insurance_id = ci.id
       INNER JOIN general_insurance gi on gi.id = ci.general_insurance_id
       LEFT JOIN addresses ad on c.address_id = ad.id
      WHERE c.id = ?
    `, [id]);
    return customer[0] || null;
  }

}

export default CustomerModel;
