import { WarehouseBooking as WarehouseBookingType, WarehouseBookingCreate, WarehouseBookingUpdate, WarehouseBookingSearchParams, PaginatedResponse } from '../types';
import { pool } from '../config/database';

class WarehouseBookingModel {
  /**
   * Create a new warehouse booking
   */
  static async create(data: WarehouseBookingCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO warehouse_bookings (
          farmer_id, warehouse_id, time_slot_id, farmer_name, farmer_mobile,
          farmer_contact, storage_requirements
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        data.farmer_id,
        data.warehouse_id,
        data.time_slot_id,
        data.farmer_name,
        data.farmer_mobile,
        data.farmer_contact,
        data.storage_requirements || null
      ]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find warehouse booking by ID
   */
  static async findById(id: number): Promise<WarehouseBookingType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          wb.*,
          w.name as warehouse_name,
          w.address as warehouse_address,
          w.contact_person_name as warehouse_contact_person,
          w.contact_person_number as warehouse_contact_number,
          wts.date as booking_date,
          wts.start_time,
          wts.end_time,
          u.name as approved_by_name
        FROM warehouse_bookings wb
        LEFT JOIN warehouses w ON wb.warehouse_id = w.id
        LEFT JOIN warehouse_time_slots wts ON wb.time_slot_id = wts.id
        LEFT JOIN users u ON wb.approved_by = u.id
        WHERE wb.id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToWarehouseBooking((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update warehouse booking
   */
  static async update(id: number, data: WarehouseBookingUpdate): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }

      if (data.admin_notes !== undefined) {
        updateFields.push('admin_notes = ?');
        updateValues.push(data.admin_notes);
      }

      if (data.rejection_reason !== undefined) {
        updateFields.push('rejection_reason = ?');
        updateValues.push(data.rejection_reason);
      }

      if (data.qr_code_url !== undefined) {
        updateFields.push('qr_code_url = ?');
        updateValues.push(data.qr_code_url);
      }

      if (data.qr_code_data !== undefined) {
        updateFields.push('qr_code_data = ?');
        updateValues.push(data.qr_code_data);
      }

      if (data.approved_by !== undefined) {
        updateFields.push('approved_by = ?');
        updateValues.push(data.approved_by);
      }

      if (data.approved_at !== undefined) {
        updateFields.push('approved_at = ?');
        updateValues.push(data.approved_at);
      }

      if (data.completed_at !== undefined) {
        updateFields.push('completed_at = ?');
        updateValues.push(data.completed_at);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE warehouse_bookings 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Update QR code for pickup
   */
  static async updatePickupQRCode(id: number, qrCodeUrl: string, qrCodeData: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE warehouse_bookings 
        SET qr_code_url = ?, qr_code_data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [qrCodeUrl, qrCodeData, id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Update QR code for return
   */
  static async updateReturnQRCode(id: number, qrCodeUrl: string, qrCodeData: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE warehouse_bookings 
        SET qr_code_url = ?, qr_code_data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [qrCodeUrl, qrCodeData, id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Confirm pickup (scan QR code)
   */
  static async confirmPickup(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE warehouse_bookings 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Confirm return (scan QR code)
   */
  static async confirmReturn(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE warehouse_bookings 
        SET status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Search warehouse bookings with filters and pagination
   */
  static async search(params: WarehouseBookingSearchParams): Promise<PaginatedResponse<WarehouseBookingType>> {
    const connection = await pool.getConnection();
    try {
      const page = Math.max(1, parseInt(String(params.page || 1)));
      const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params.farmer_id) {
        whereClause += ' AND wb.farmer_id = ?';
        queryParams.push(parseInt(String(params.farmer_id)));
      }

      if (params.warehouse_id) {
        whereClause += ' AND wb.warehouse_id = ?';
        queryParams.push(parseInt(String(params.warehouse_id)));
      }

      if (params.status) {
        whereClause += ' AND wb.status = ?';
        queryParams.push(params.status);
      }

      if (params.start_date) {
        whereClause += ' AND wts.date >= ?';
        queryParams.push(params.start_date);
      }

      if (params.end_date) {
        whereClause += ' AND wts.date <= ?';
        queryParams.push(params.end_date);
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM warehouse_bookings wb
        LEFT JOIN warehouse_time_slots wts ON wb.time_slot_id = wts.id
        ${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get bookings with pagination
      const [rows] = await connection.execute(`
        SELECT 
          wb.*,
          w.name as warehouse_name,
          w.address as warehouse_address,
          w.contact_person_name as warehouse_contact_person,
          w.contact_person_number as warehouse_contact_number,
          wts.date as booking_date,
          wts.start_time,
          wts.end_time,
          u.name as approved_by_name
        FROM warehouse_bookings wb
        LEFT JOIN warehouses w ON wb.warehouse_id = w.id
        LEFT JOIN warehouse_time_slots wts ON wb.time_slot_id = wts.id
        LEFT JOIN users u ON wb.approved_by = u.id
        ${whereClause}
        ORDER BY wb.created_at DESC
        LIMIT ? OFFSET ?
      `, [...queryParams, limit, offset]);

      const bookings = (rows as any[]).map(row => this.mapRowToWarehouseBooking(row));

      return {
        data: bookings,
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
   * Get all warehouse bookings with pagination
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseBookingType>> {
    return this.search({ page, limit });
  }

  /**
   * Get warehouse bookings by farmer
   */
  static async getByFarmer(farmerId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseBookingType>> {
    return this.search({ farmer_id: farmerId, page, limit });
  }

  /**
   * Get warehouse bookings by warehouse
   */
  static async getByWarehouse(warehouseId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseBookingType>> {
    return this.search({ warehouse_id: warehouseId, page, limit });
  }

  /**
   * Get warehouse bookings by status
   */
  static async getByStatus(status: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseBookingType>> {
    return this.search({ status: status as 'pending' | 'approved' | 'completed' | 'rejected' | 'overdue', page, limit });
  }

  /**
   * Get pending warehouse bookings
   */
  static async getPending(page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseBookingType>> {
    return this.search({ status: 'pending', page, limit });
  }

  /**
   * Get active warehouse bookings (approved but not completed)
   */
  static async getActive(page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseBookingType>> {
    return this.search({ status: 'approved', page, limit });
  }

  /**
   * Get overdue warehouse bookings
   */
  static async getOverdue(): Promise<WarehouseBookingType[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          wb.*,
          w.name as warehouse_name,
          w.address as warehouse_address,
          w.contact_person_name as warehouse_contact_person,
          w.contact_person_number as warehouse_contact_number,
          wts.date as booking_date,
          wts.start_time,
          wts.end_time,
          u.name as approved_by_name
        FROM warehouse_bookings wb
        LEFT JOIN warehouses w ON wb.warehouse_id = w.id
        LEFT JOIN warehouse_time_slots wts ON wb.time_slot_id = wts.id
        LEFT JOIN users u ON wb.approved_by = u.id
        WHERE wb.status = 'approved' 
        AND wts.date < CURDATE()
        ORDER BY wts.date ASC
      `);

      return (rows as any[]).map(row => this.mapRowToWarehouseBooking(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get today's warehouse bookings
   */
  static async getTodayBookings(warehouseId?: number): Promise<WarehouseBookingType[]> {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          wb.*,
          w.name as warehouse_name,
          w.address as warehouse_address,
          w.contact_person_name as warehouse_contact_person,
          w.contact_person_number as warehouse_contact_number,
          wts.date as booking_date,
          wts.start_time,
          wts.end_time,
          u.name as approved_by_name
        FROM warehouse_bookings wb
        LEFT JOIN warehouses w ON wb.warehouse_id = w.id
        LEFT JOIN warehouse_time_slots wts ON wb.time_slot_id = wts.id
        LEFT JOIN users u ON wb.approved_by = u.id
        WHERE wts.date = CURDATE()
        AND wb.status IN ('approved', 'completed')
      `;

      const params: any[] = [];
      if (warehouseId) {
        query += ' AND wb.warehouse_id = ?';
        params.push(warehouseId);
      }

      query += ' ORDER BY wts.start_time ASC';

      const [rows] = await connection.execute(query, params);
      return (rows as any[]).map(row => this.mapRowToWarehouseBooking(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get warehouse booking statistics
   */
  static async getBookingStatistics(warehouseId?: number, startDate?: Date, endDate?: Date): Promise<any> {
    const connection = await pool.getConnection();
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (warehouseId) {
        whereClause += ' AND wb.warehouse_id = ?';
        params.push(warehouseId);
      }

      if (startDate) {
        whereClause += ' AND wts.date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND wts.date <= ?';
        params.push(endDate);
      }

      const [rows] = await connection.execute(`
        SELECT 
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN wb.status = 'pending' THEN 1 END) as pending_bookings,
          COUNT(CASE WHEN wb.status = 'approved' THEN 1 END) as approved_bookings,
          COUNT(CASE WHEN wb.status = 'completed' THEN 1 END) as completed_bookings,
          COUNT(CASE WHEN wb.status = 'rejected' THEN 1 END) as rejected_bookings,
          COUNT(CASE WHEN wb.status = 'overdue' THEN 1 END) as overdue_bookings
        FROM warehouse_bookings wb
        LEFT JOIN warehouse_time_slots wts ON wb.time_slot_id = wts.id
        ${whereClause}
      `, params);

      return (rows as any[])[0];
    } finally {
      connection.release();
    }
  }

  /**
   * Map database row to WarehouseBooking object
   */
  private static mapRowToWarehouseBooking(row: any): WarehouseBookingType {
    return {
      id: row.id,
      farmer_id: row.farmer_id,
      warehouse_id: row.warehouse_id,
      time_slot_id: row.time_slot_id,
      farmer_name: row.farmer_name,
      farmer_mobile: row.farmer_mobile,
      farmer_contact: row.farmer_contact,
      storage_requirements: row.storage_requirements,
      status: row.status,
      admin_notes: row.admin_notes,
      rejection_reason: row.rejection_reason,
      qr_code_url: row.qr_code_url,
      qr_code_data: row.qr_code_data,
      approved_by: row.approved_by,
      approved_at: row.approved_at,
      completed_at: row.completed_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default WarehouseBookingModel;
