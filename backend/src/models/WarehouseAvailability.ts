import { WarehouseAvailability as WarehouseAvailabilityType, WarehouseAvailabilityCreate, WarehouseAvailabilityUpdate, WarehouseAvailabilitySearchParams } from '../types';
import { pool } from '../config/database';

class WarehouseAvailabilityModel {
  /**
   * Create or update warehouse availability for a date
   */
  static async create(data: WarehouseAvailabilityCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO warehouse_availability (
          warehouse_id, date, is_available, reason
        ) VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          is_available = VALUES(is_available),
          reason = VALUES(reason),
          updated_at = CURRENT_TIMESTAMP
      `, [
        data.warehouse_id,
        data.date,
        data.is_available,
        data.reason || null
      ]);

      return (result as any).insertId || (result as any).affectedRows;
    } finally {
      connection.release();
    }
  }

  /**
   * Find availability by warehouse and date
   */
  static async findByWarehouseAndDate(warehouseId: number, date: Date): Promise<WarehouseAvailabilityType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM warehouse_availability 
        WHERE warehouse_id = ? AND date = ?
      `, [warehouseId, date]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToWarehouseAvailability((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update warehouse availability
   */
  static async update(id: number, data: WarehouseAvailabilityUpdate): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.is_available !== undefined) {
        updateFields.push('is_available = ?');
        updateValues.push(data.is_available);
      }

      if (data.reason !== undefined) {
        updateFields.push('reason = ?');
        updateValues.push(data.reason);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE warehouse_availability 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete warehouse availability
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        DELETE FROM warehouse_availability WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get availability for a warehouse within a date range
   */
  static async getAvailabilityForWarehouse(params: WarehouseAvailabilitySearchParams): Promise<WarehouseAvailabilityType[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM warehouse_availability 
        WHERE warehouse_id = ? 
        AND date BETWEEN ? AND ?
        ORDER BY date ASC
      `, [
        params.warehouse_id,
        params.start_date,
        params.end_date
      ]);

      return (rows as any[]).map(row => this.mapRowToWarehouseAvailability(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Set warehouse as unavailable for a specific date
   */
  static async setUnavailable(warehouseId: number, date: Date, reason?: string): Promise<boolean> {
    return this.create({
      warehouse_id: warehouseId,
      date,
      is_available: false,
      reason
    }).then(() => true);
  }

  /**
   * Set warehouse as available for a specific date
   */
  static async setAvailable(warehouseId: number, date: Date): Promise<boolean> {
    return this.create({
      warehouse_id: warehouseId,
      date,
      is_available: true,
      reason: null
    }).then(() => true);
  }

  /**
   * Check if warehouse is available for a specific date
   */
  static async checkAvailability(warehouseId: number, date: Date): Promise<boolean> {
    const availability = await this.findByWarehouseAndDate(warehouseId, date);
    
    // If no specific availability record exists, default to available
    if (!availability) {
      return true;
    }
    
    return availability.is_available;
  }

  /**
   * Get availability summary for a warehouse
   */
  static async getAvailabilitySummary(warehouseId: number, startDate: Date, endDate: Date): Promise<any> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          COUNT(*) as total_dates,
          COUNT(CASE WHEN is_available = TRUE THEN 1 END) as available_dates,
          COUNT(CASE WHEN is_available = FALSE THEN 1 END) as unavailable_dates
        FROM warehouse_availability 
        WHERE warehouse_id = ? 
        AND date BETWEEN ? AND ?
      `, [warehouseId, startDate, endDate]);

      return (rows as any[])[0];
    } finally {
      connection.release();
    }
  }

  /**
   * Bulk update availability for multiple dates
   */
  static async bulkUpdateAvailability(warehouseId: number, dates: Date[], isAvailable: boolean, reason?: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      try {
        for (const date of dates) {
          await this.create({
            warehouse_id: warehouseId,
            date,
            is_available: isAvailable,
            reason
          });
        }

        await connection.commit();
        return true;
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    } finally {
      connection.release();
    }
  }

  /**
   * Get next available date for a warehouse
   */
  static async getNextAvailableDate(warehouseId: number, fromDate: Date): Promise<Date | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT date FROM warehouse_availability 
        WHERE warehouse_id = ? 
        AND date >= ? 
        AND is_available = TRUE
        ORDER BY date ASC
        LIMIT 1
      `, [warehouseId, fromDate]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return (rows as any[])[0].date;
    } finally {
      connection.release();
    }
  }

  /**
   * Map database row to WarehouseAvailability object
   */
  private static mapRowToWarehouseAvailability(row: any): WarehouseAvailabilityType {
    return {
      id: row.id,
      warehouse_id: row.warehouse_id,
      date: row.date,
      is_available: Boolean(row.is_available),
      reason: row.reason,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default WarehouseAvailabilityModel;
