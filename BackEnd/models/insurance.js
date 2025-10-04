import db from '../config/db.js';

class InsuranceModel {
  static async create(payload) {
    
    
    // (1) Insert to insurance table
    const INSURANCE_QUERY = `INSERT INTO customer_insurance (
      policy_number,
      comment,
      general_insurance_id
     ) VALUES (?,?,?)`;
    
    const [INSURANCE_ANSWER] = await db.query(
      INSURANCE_QUERY,
      [
        payload.policy_number,
        payload.comment || null,
        payload.general_insurance_id || null
      ]
    );
    
    return INSURANCE_ANSWER.insertId;
    
  }
  
  static async delete(id) {
    
    const DELETE_INSURANCE_QUERY = `DELETE FROM customer_insurance WHERE id = ?`;
    
    const [DELETE_INSURANCE_ANSWER] = await db.query(DELETE_INSURANCE_QUERY, [id]);
    
    return DELETE_INSURANCE_ANSWER.affectedRows;
  }
  
  
}

export default InsuranceModel;




