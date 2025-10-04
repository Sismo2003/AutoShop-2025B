import db from '../config/db.js';

class AddressModel {
  static async create(payload) {
    // (1) Insert to Address table
    const ADDRESS_QUERY = `INSERT INTO addresses (
      property_type,
      street_address,
      main_cross_streets,
      zipcode,
      city,
      state,
      apartment_name,
      unit_number,
      building,
      gate_code,
      is_commercial,
      business_name,
    special_instructions) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    
    const [ADDRESS_ANSWER] = await db.query(ADDRESS_QUERY, [
      payload.property_type,
      payload.street_address,
      payload.main_cross_streets,
      payload.zipcode,
      payload.city,
      payload.state,
      payload.apartment_name,
      payload.unit_number,
      payload.building,
      payload.gate_code,
      payload.is_commercial ? 1 : 0,
      payload.business_name || null,
      payload.special_instructions || null
    ]);
    
    return ADDRESS_ANSWER.insertId;
  }
  
  static async delete(id) {

    const DELETE_ADDRESS_QUERY = `DELETE FROM addresses WHERE id = ?`;
    
    const [DELETE_ADDRESS_ANSWER] = await db.query(DELETE_ADDRESS_QUERY, [id]);
    
    return DELETE_ADDRESS_ANSWER.affectedRows;
  }
  
}

export default AddressModel;




