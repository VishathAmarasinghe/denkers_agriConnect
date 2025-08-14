import mysql from 'mysql2/promise';
import { pool } from '../config/database';
import { 
  SoilTestingTimeSlot, 
  SoilTestingTimeSlotCreate, 
  SoilTestingTimeSlotUpdate, 
  SoilTestingTimeSlotSearchParams,
  PaginatedResponse,
  AvailableTimeSlotsResponse
} from '../types';

class SoilTestingTimeSlotModel {
  /**
   * Create a new time slot
   */
  static async create(data: SoilTestingTimeSlotCreate): Promise<SoilTestingTimeSlot> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO soil_testing_time_slots (
          soil_collection_center_id, date, start_time, end_time, max_bookings
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        data.soil_collection_center_id,
        data.date,
        data.start_time,
        data.end_time,
        data.max_bookings || 1
      ]);

      const id = (result as any).insertId;
      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Find time slot by ID
   */
  static async findById(id: number): Promise<SoilTestingTimeSlot | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM soil_testing_time_slots WHERE id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return (rows as any[])[0];
    } finally {
      connection.release();
    }
  }

  /**
   * Update time slot
   */
  static async update(id: number, data: SoilTestingTimeSlotUpdate): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.is_available !== undefined) {
        updateFields.push('is_available = ?');
        updateValues.push(data.is_available);
      }

      if (data.max_bookings !== undefined) {
        updateFields.push('max_bookings = ?');
        updateValues.push(data.max_bookings);
      }

      if (data.current_bookings !== undefined) {
        updateFields.push('current_bookings = ?');
        updateValues.push(data.current_bookings);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE soil_testing_time_slots 
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
        DELETE FROM soil_testing_time_slots WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Search time slots with filters and pagination
   */
  static async search(params: SoilTestingTimeSlotSearchParams): Promise<PaginatedResponse<SoilTestingTimeSlot>> {
    const connection = await pool.getConnection();
    try {
      const page = Math.max(1, parseInt(String(params.page || 1)));
      const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params.soil_collection_center_id) {
        whereClause += ' AND soil_collection_center_id = ?';
        queryParams.push(parseInt(String(params.soil_collection_center_id)));
      }

      if (params.date) {
        whereClause += ' AND date = ?';
        queryParams.push(params.date);
      }

      if (params.date_from) {
        whereClause += ' AND date >= ?';
        queryParams.push(params.date_from);
      }

      if (params.date_to) {
        whereClause += ' AND date <= ?';
        queryParams.push(params.date_to);
      }

      if (params.is_available !== undefined) {
        whereClause += ' AND is_available = ?';
        queryParams.push(params.is_available);
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM soil_testing_time_slots
        ${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get time slots with pagination
      const [rows] = await connection.execute(`
        SELECT * FROM soil_testing_time_slots
        ${whereClause}
        ORDER BY date ASC, start_time ASC
        LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}
      `, queryParams);

      const timeSlots = (rows as any[]).map(slot => ({
        id: slot.id,
        soil_collection_center_id: slot.soil_collection_center_id,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: slot.is_available,
        max_bookings: slot.max_bookings,
        current_bookings: slot.current_bookings,
        created_at: slot.created_at,
        updated_at: slot.updated_at
      }));

      return {
        data: timeSlots,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Get available time slots for a center and date range
   */
  static async getAvailableSlots(centerId: number, dateFrom: string, dateTo: string): Promise<AvailableTimeSlotsResponse[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          date,
          start_time,
          end_time,
          is_available,
          max_bookings,
          current_bookings,
          (max_bookings - current_bookings) as available_bookings
        FROM soil_testing_time_slots
        WHERE soil_collection_center_id = ? 
          AND date >= ? 
          AND date <= ?
          AND is_available = TRUE
        ORDER BY date ASC, start_time ASC
      `, [centerId, dateFrom, dateTo]);

      // Group by date
      const groupedSlots: { [key: string]: any[] } = {};
      
      (rows as any[]).forEach(slot => {
        if (!groupedSlots[slot.date]) {
          groupedSlots[slot.date] = [];
        }
        
        groupedSlots[slot.date].push({
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: slot.is_available,
          available_bookings: slot.available_bookings,
          max_bookings: slot.max_bookings
        });
      });

      // Convert to response format
      return Object.keys(groupedSlots).map(date => ({
        date,
        time_slots: groupedSlots[date]
      }));
    } finally {
      connection.release();
    }
  }

  /**
   * Book a time slot (increment current_bookings)
   */
  static async bookSlot(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE soil_testing_time_slots 
        SET current_bookings = current_bookings + 1,
            updated_at = NOW()
        WHERE id = ? AND current_bookings < max_bookings
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Release a time slot (decrement current_bookings)
   */
  static async releaseSlot(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE soil_testing_time_slots 
        SET current_bookings = GREATEST(current_bookings - 1, 0),
            updated_at = NOW()
        WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all time slots with pagination
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingTimeSlot>> {
    return this.search({ page, limit });
  }

  /**
   * Get time slots by center ID
   */
  static async getByCenter(centerId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingTimeSlot>> {
    return this.search({ soil_collection_center_id: centerId, page, limit });
  }

  /**
   * Get time slots by date
   */
  static async getByDate(date: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingTimeSlot>> {
    return this.search({ date, page, limit });
  }

  /**
   * Check if a date has any scheduled appointments
   */
  static async hasScheduledAppointments(centerId: number, date: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM soil_testing 
        WHERE soil_collection_center_id = ? 
          AND scheduled_date = ? 
          AND status IN ('pending', 'approved')
      `, [centerId, date]);

      return (rows as any[])[0].count > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Make all time slots for a specific date unavailable
   */
  static async makeDateUnavailable(centerId: number, date: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      // Check if there are any scheduled appointments
      const hasAppointments = await this.hasScheduledAppointments(centerId, date);
      if (hasAppointments) {
        throw new Error('Cannot make date unavailable: there are scheduled appointments on this date');
      }

      const [result] = await connection.execute(`
        UPDATE soil_testing_time_slots 
        SET is_available = FALSE, updated_at = NOW()
        WHERE soil_collection_center_id = ? AND date = ?
      `, [centerId, date]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Make all time slots for a specific date available
   */
  static async makeDateAvailable(centerId: number, date: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE soil_testing_time_slots 
        SET is_available = TRUE, updated_at = NOW()
        WHERE soil_collection_center_id = ? AND date = ?
      `, [centerId, date]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get date availability status for a center
   */
  static async getDateAvailability(centerId: number, dateFrom: string, dateTo: string): Promise<Array<{date: string, is_available: boolean, has_slots: boolean, scheduled_appointments: number}>> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          date,
          MIN(is_available) as is_available,
          COUNT(*) as total_slots,
          SUM(CASE WHEN is_available = TRUE THEN 1 ELSE 0 END) as available_slots
        FROM soil_testing_time_slots
        WHERE soil_collection_center_id = ? 
          AND date >= ? 
          AND date <= ?
        GROUP BY date
        ORDER BY date ASC
      `, [centerId, dateFrom, dateTo]);

      // Get scheduled appointments count for each date
      const [appointmentRows] = await connection.execute(`
        SELECT 
          scheduled_date as date,
          COUNT(*) as appointment_count
        FROM soil_testing 
        WHERE soil_collection_center_id = ? 
          AND scheduled_date >= ? 
          AND scheduled_date <= ?
          AND status IN ('pending', 'approved')
        GROUP BY scheduled_date
      `, [centerId, dateFrom, dateTo]);

      const appointmentCounts = (appointmentRows as any[]).reduce((acc: any, row: any) => {
        acc[row.date] = row.appointment_count;
        return acc;
      }, {});

      return (rows as any[]).map(row => ({
        date: row.date,
        is_available: row.is_available === 1,
        has_slots: row.total_slots > 0,
        scheduled_appointments: appointmentCounts[row.date] || 0
      }));
    } finally {
      connection.release();
    }
  }

  /**
   * Bulk update date availability
   */
  static async bulkUpdateDateAvailability(centerId: number, dates: Array<{date: string, is_available: boolean}>, force: boolean = false): Promise<{success: boolean, errors: string[]}> {
    const connection = await pool.getConnection();
    try {
      const errors: string[] = [];
      const results: boolean[] = [];

      for (const dateInfo of dates) {
        try {
          if (!dateInfo.is_available && !force) {
            // Check if there are scheduled appointments
            const hasAppointments = await this.hasScheduledAppointments(centerId, dateInfo.date);
            if (hasAppointments) {
              errors.push(`Cannot make ${dateInfo.date} unavailable: there are scheduled appointments`);
              results.push(false);
              continue;
            }
          }

          const [result] = await connection.execute(`
            UPDATE soil_testing_time_slots 
            SET is_available = ?, updated_at = NOW()
            WHERE soil_collection_center_id = ? AND date = ?
          `, [dateInfo.is_available, centerId, dateInfo.date]);

          results.push((result as any).affectedRows > 0);
        } catch (error) {
          errors.push(`Failed to update ${dateInfo.date}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          results.push(false);
        }
      }

      return {
        success: results.some(r => r),
        errors
      };
    } finally {
      connection.release();
    }
  }
}

export default SoilTestingTimeSlotModel;
