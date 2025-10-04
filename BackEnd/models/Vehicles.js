import db from '../config/db.js';

class VehicleModel {
  static async create(vehicles,customerId) {
    
    // (1) Vehicle insertion table
    const VEHICLE_QUERY = `INSERT INTO vehicles (
      customer_id,
      year,
      make,
      model,
      color,
      vin,
      doors,
      winshield_part_number
    ) VALUES ${vehicles.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}`;
    
    // fixing the array to flat
    const vehicleValuesFlat = vehicles.flatMap(vehicle => [
      customerId,
      vehicle.year,
      vehicle.make,
      vehicle.model,
      vehicle.color,
      vehicle.vin_number,
      vehicle.vehicle_doors,
      vehicle.winshield_part_number
    ]);
    // (2) Execute the query
    const [VEHICLE_ANSWER] = await db.query(
      VEHICLE_QUERY,
      vehicleValuesFlat
    );
    
    return VEHICLE_ANSWER.insertId;
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
}

export default VehicleModel;
