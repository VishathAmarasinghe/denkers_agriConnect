import { pool } from '../config/database';
import { EquipmentAvailability, EquipmentAvailabilityCreate, EquipmentAvailabilityUpdate, EquipmentAvailabilitySearchParams } from '../types';

export class EquipmentAvailabilityModel {
  /**
   * Create equipment availability record
   */
  static async create(availabilityData: EquipmentAvailabilityCreate): Promise<EquipmentAvailability> {
    const [result] = await pool.execute(`
      INSERT INTO equipment_availability (equipment_id, date, is_available, reason) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        is_available = VALUES(is_available),
        reason = VALUES(reason),
        updated_at = CURRENT_TIMESTAMP
    `, [
      availabilityData.equipment_id,
      availabilityData.date,
      availabilityData.is_available,
      availabilityData.reason || null
    ]);

    const availabilityId = (result as any).insertId || (result as any).affectedRows;
    return this.findByEquipmentAndDate(availabilityData.equipment_id, availabilityData.date);
  }

  /**
   * Find availability by equipment ID and date
   */
  static async findByEquipmentAndDate(equipmentId: number, date: string): Promise<EquipmentAvailability> {
    const [rows] = await pool.execute(`
      SELECT * FROM equipment_availability 
      WHERE equipment_id = ? AND date = ?
    `, [equipmentId, date]);

    const availability = rows as any[];
    if (availability.length === 0) {
      throw new Error('Equipment availability not found');
    }

    return this.mapRowToAvailability(availability[0]);
  }

  /**
   * Update equipment availability
   */
  static async update(id: number, updateData: EquipmentAvailabilityUpdate): Promise<EquipmentAvailability> {
    const fields = [];
    const values = [];

    if (updateData.is_available !== undefined) {
      fields.push('is_available = ?');
      values.push(updateData.is_available);
    }
    if (updateData.reason !== undefined) {
      fields.push('reason = ?');
      values.push(updateData.reason);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await pool.execute(`
      UPDATE equipment_availability 
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values);

    const [rows] = await pool.execute(`
      SELECT * FROM equipment_availability WHERE id = ?
    `, [id]);

    return this.mapRowToAvailability((rows as any[])[0]);
  }

  /**
   * Delete availability record
   */
  static async delete(id: number): Promise<void> {
    await pool.execute(`
      DELETE FROM equipment_availability WHERE id = ?
    `, [id]);
  }

  /**
   * Get availability for equipment within date range
   */
  static async getAvailabilityForEquipment(params: EquipmentAvailabilitySearchParams): Promise<EquipmentAvailability[]> {
    const [rows] = await pool.execute(`
      SELECT * FROM equipment_availability 
      WHERE equipment_id = ? AND date BETWEEN ? AND ?
      ORDER BY date ASC
    `, [params.equipment_id, params.date_from, params.date_to]);

    return (rows as any[]).map(row => this.mapRowToAvailability(row));
  }

  /**
   * Set equipment as unavailable for specific dates
   */
  static async setUnavailable(equipmentId: number, dates: string[], reason?: string): Promise<void> {
    for (const date of dates) {
      await this.create({
        equipment_id: equipmentId,
        date,
        is_available: false,
        reason: reason || 'Equipment maintenance'
      });
    }
  }

  /**
   * Set equipment as available for specific dates
   */
  static async setAvailable(equipmentId: number, dates: string[]): Promise<void> {
    for (const date of dates) {
      await this.create({
        equipment_id: equipmentId,
        date,
        is_available: true,
        reason: null
      });
    }
  }

  /**
   * Check if equipment is available for specific dates
   */
  static async checkAvailability(equipmentId: number, startDate: string, endDate: string): Promise<{
    is_available: boolean;
    unavailable_dates: string[];
    available_dates: string[];
  }> {
    const [rows] = await pool.execute(`
      SELECT date, is_available FROM equipment_availability 
      WHERE equipment_id = ? AND date BETWEEN ? AND ?
      ORDER BY date ASC
    `, [equipmentId, startDate, endDate]);

    const availability = rows as any[];
    const unavailable_dates: string[] = [];
    const available_dates: string[] = [];

    // Generate all dates in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const allDates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split('T')[0]);
    }

    // Check availability for each date
    for (const date of allDates) {
      const dateAvailability = availability.find(a => a.date === date);
      
      if (dateAvailability) {
        if (dateAvailability.is_available) {
          available_dates.push(date);
        } else {
          unavailable_dates.push(date);
        }
      } else {
        // If no specific availability record, assume available
        available_dates.push(date);
      }
    }

    return {
      is_available: unavailable_dates.length === 0,
      unavailable_dates,
      available_dates
    };
  }

  /**
   * Get availability summary for equipment
   */
  static async getAvailabilitySummary(equipmentId: number, dateFrom: string, dateTo: string): Promise<{
    total_dates: number;
    available_dates: number;
    unavailable_dates: number;
    availability_percentage: number;
  }> {
    const availability = await this.checkAvailability(equipmentId, dateFrom, dateTo);
    
    const total_dates = availability.available_dates.length + availability.unavailable_dates.length;
    const available_dates = availability.available_dates.length;
    const unavailable_dates = availability.unavailable_dates.length;
    const availability_percentage = total_dates > 0 ? (available_dates / total_dates) * 100 : 0;

    return {
      total_dates,
      available_dates,
      unavailable_dates,
      availability_percentage: Math.round(availability_percentage * 100) / 100
    };
  }

  /**
   * Bulk update availability
   */
  static async bulkUpdateAvailability(equipmentId: number, updates: Array<{
    date: string;
    is_available: boolean;
    reason?: string;
  }>): Promise<void> {
    for (const update of updates) {
      await this.create({
        equipment_id: equipmentId,
        date: update.date,
        is_available: update.is_available,
        reason: update.reason
      });
    }
  }

  /**
   * Map database row to EquipmentAvailability object
   */
  private static mapRowToAvailability(row: any): EquipmentAvailability {
    return {
      id: row.id,
      equipment_id: row.equipment_id,
      date: row.date,
      is_available: Boolean(row.is_available),
      reason: row.reason,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
