import { WarehouseTimeSlot as WarehouseTimeSlotType, WarehouseTimeSlotCreate, WarehouseTimeSlotUpdate, WarehouseTimeSlotSearchParams } from '../types';
import { pool } from '../config/database';

class WarehouseTimeSlotModel {
  /**
   * Create a new time slot
   */
  static async create(data: WarehouseTimeSlotCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO warehouse_time_slots (
          warehouse_id, date, start_time, end_time, max_bookings
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        data.warehouse_id,
        data.date,
        data.start_time,
        data.end_time,
        data.max_bookings || 1
      ]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find time slot by ID
   */
  static async findById(id: number): Promise<WarehouseTimeSlotType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM warehouse_time_slots WHERE id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToWarehouseTimeSlot((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update time slot
   */
  static async update(id: number, data: WarehouseTimeSlotUpdate): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.start_time !== undefined) {
        updateFields.push('start_time = ?');
        updateValues.push(data.start_time);
      }

      if (data.end_time !== undefined) {
        updateFields.push('end_time = ?');
        updateValues.push(data.end_time);
      }

      if (data.is_available !== undefined) {
        updateFields.push('is_available = ?');
        updateValues.push(data.is_available);
      }

      if (data.max_bookings !== undefined) {
        updateFields.push('max_bookings = ?');
        updateValues.push(data.max_bookings);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE warehouse_time_slots 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete time slot
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        DELETE FROM warehouse_time_slots WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get available time slots for a warehouse on a specific date
   */
  static async getAvailableTimeSlots(warehouseId: number, date: Date): Promise<WarehouseTimeSlotType[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM warehouse_time_slots 
        WHERE warehouse_id = ? 
        AND date = ? 
        AND is_available = TRUE
        AND current_bookings < max_bookings
        ORDER BY start_time ASC
      `, [warehouseId, date]);

      return (rows as any[]).map(row => this.mapRowToWarehouseTimeSlot(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get all time slots for a warehouse on a specific date
   */
  static async getTimeSlotsByDate(warehouseId: number, date: Date): Promise<WarehouseTimeSlotType[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM warehouse_time_slots 
        WHERE warehouse_id = ? 
        AND date = ?
        ORDER BY start_time ASC
      `, [warehouseId, date]);

      return (rows as any[]).map(row => this.mapRowToWarehouseTimeSlot(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get time slots for a warehouse within a date range
   */
  static async getTimeSlotsByDateRange(warehouseId: number, startDate: Date, endDate: Date): Promise<WarehouseTimeSlotType[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM warehouse_time_slots 
        WHERE warehouse_id = ? 
        AND date BETWEEN ? AND ?
        ORDER BY date ASC, start_time ASC
      `, [warehouseId, startDate, endDate]);

      return (rows as any[]).map(row => this.mapRowToWarehouseTimeSlot(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Check if a time slot is available for booking
   */
  static async isTimeSlotAvailable(timeSlotId: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT is_available, current_bookings, max_bookings 
        FROM warehouse_time_slots 
        WHERE id = ?
      `, [timeSlotId]);

      if ((rows as any[]).length === 0) {
        return false;
      }

      const timeSlot = (rows as any[])[0];
      return timeSlot.is_available && timeSlot.current_bookings < timeSlot.max_bookings;
    } finally {
      connection.release();
    }
  }

  /**
   * Increment current bookings for a time slot
   */
  static async incrementBookings(timeSlotId: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE warehouse_time_slots 
        SET current_bookings = current_bookings + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND current_bookings < max_bookings
      `, [timeSlotId]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Decrement current bookings for a time slot
   */
  static async decrementBookings(timeSlotId: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE warehouse_time_slots 
        SET current_bookings = GREATEST(current_bookings - 1, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [timeSlotId]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Create default time slots for a warehouse on a specific date
   */
  static async createDefaultTimeSlots(warehouseId: number, date: Date): Promise<void> {
    const connection = await pool.getConnection();
    try {
      // Check if time slots already exist for this date
      const existingSlots = await this.getTimeSlotsByDate(warehouseId, date);
      if (existingSlots.length > 0) {
        return;
      }

      // Create default time slots (9 AM to 5 PM, 1-hour intervals)
      const defaultSlots = [
        { start: '09:00:00', end: '10:00:00' },
        { start: '10:00:00', end: '11:00:00' },
        { start: '11:00:00', end: '12:00:00' },
        { start: '12:00:00', end: '13:00:00' },
        { start: '13:00:00', end: '14:00:00' },
        { start: '14:00:00', end: '15:00:00' },
        { start: '15:00:00', end: '16:00:00' },
        { start: '16:00:00', end: '17:00:00' }
      ];

      for (const slot of defaultSlots) {
        await this.create({
          warehouse_id: warehouseId,
          date,
          start_time: slot.start,
          end_time: slot.end,
          max_bookings: 1
        });
      }
    } finally {
      connection.release();
    }
  }

  /**
   * Get time slot statistics for a warehouse
   */
  static async getTimeSlotStatistics(warehouseId: number, startDate: Date, endDate: Date): Promise<any> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          COUNT(*) as total_slots,
          COUNT(CASE WHEN is_available = TRUE THEN 1 END) as available_slots,
          COUNT(CASE WHEN is_available = FALSE THEN 1 END) as unavailable_slots,
          SUM(current_bookings) as total_bookings,
          SUM(max_bookings) as total_capacity
        FROM warehouse_time_slots 
        WHERE warehouse_id = ? 
        AND date BETWEEN ? AND ?
      `, [warehouseId, startDate, endDate]);

      return (rows as any[])[0];
    } finally {
      connection.release();
    }
  }

  /**
   * Map database row to WarehouseTimeSlot object
   */
  private static mapRowToWarehouseTimeSlot(row: any): WarehouseTimeSlotType {
    return {
      id: row.id,
      warehouse_id: row.warehouse_id,
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      is_available: Boolean(row.is_available),
      max_bookings: row.max_bookings,
      current_bookings: row.current_bookings,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default WarehouseTimeSlotModel;
