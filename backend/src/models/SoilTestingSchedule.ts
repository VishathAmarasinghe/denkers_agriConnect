import mysql from 'mysql2/promise';
import { pool } from '../config/database';
import { 
  SoilTestingSchedule, 
  SoilTestingScheduleCreate, 
  SoilTestingScheduleUpdate, 
  SoilTestingScheduleSearchParams,
  PaginatedResponse 
} from '../types';

class SoilTestingScheduleModel {
  /**
   * Create a new soil testing schedule
   */
  static async create(data: SoilTestingScheduleCreate, farmerId: number): Promise<SoilTestingSchedule> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO soil_testing (
          farmer_id, soil_collection_center_id, scheduled_date, start_time, end_time,
          farmer_phone, farmer_location_address, farmer_latitude, farmer_longitude, field_officer_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        farmerId,
        data.soil_collection_center_id,
        data.scheduled_date,
        data.start_time || null,
        data.end_time || null,
        data.farmer_phone,
        data.farmer_location_address || null,
        data.farmer_latitude || null,
        data.farmer_longitude || null,
        data.field_officer_id || null
      ]);

      const id = (result as any).insertId;
      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Find soil testing schedule by ID
   */
  static async findById(id: number): Promise<SoilTestingSchedule | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          s.*,
          scc.name as center_name,
          scc.address as center_address,
          u.first_name as farmer_first_name,
          u.last_name as farmer_last_name,
          fo.specialization as field_officer_specialization
        FROM soil_testing s
        LEFT JOIN soil_collection_centers scc ON s.soil_collection_center_id = scc.id
        LEFT JOIN users u ON s.farmer_id = u.id
        LEFT JOIN field_officers fo ON s.field_officer_id = fo.id
        WHERE s.id = ?
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
   * Update soil testing schedule
   */
  static async update(id: number, data: SoilTestingScheduleUpdate): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }

      if (data.start_time !== undefined) {
        updateFields.push('start_time = ?');
        updateValues.push(data.start_time);
      }

      if (data.end_time !== undefined) {
        updateFields.push('end_time = ?');
        updateValues.push(data.end_time);
      }

      if (data.admin_notes !== undefined) {
        updateFields.push('admin_notes = ?');
        updateValues.push(data.admin_notes);
      }

      if (data.rejection_reason !== undefined) {
        updateFields.push('rejection_reason = ?');
        updateValues.push(data.rejection_reason);
      }

      if (data.field_officer_id !== undefined) {
        updateFields.push('field_officer_id = ?');
        updateValues.push(data.field_officer_id);
      }

      if (data.completed_at !== undefined) {
        updateFields.push('completed_at = ?');
        updateValues.push(data.completed_at);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE soil_testing 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Update QR code data
   */
  static async updateQRCode(id: number, qrCodeUrl: string, qrCodeData: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE soil_testing 
        SET qr_code_url = ?, qr_code_data = ?, updated_at = NOW()
        WHERE id = ?
      `, [qrCodeUrl, qrCodeData, id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Mark schedule as completed
   */
  static async markCompleted(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE soil_testing 
        SET status = 'completed', completed_at = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Search soil testing schedules with filters and pagination
   */
  static async search(params: SoilTestingScheduleSearchParams): Promise<PaginatedResponse<SoilTestingSchedule>> {
    const connection = await pool.getConnection();
    try {
      const page = Math.max(1, parseInt(String(params.page || 1)));
      const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params.farmer_id) {
        whereClause += ' AND s.farmer_id = ?';
        queryParams.push(parseInt(String(params.farmer_id)));
      }

      if (params.soil_collection_center_id) {
        whereClause += ' AND s.soil_collection_center_id = ?';
        queryParams.push(parseInt(String(params.soil_collection_center_id)));
      }

      if (params.status) {
        whereClause += ' AND s.status = ?';
        queryParams.push(params.status);
      }

      if (params.date_from) {
        whereClause += ' AND s.scheduled_date >= ?';
        queryParams.push(params.date_from);
      }

      if (params.date_to) {
        whereClause += ' AND s.scheduled_date <= ?';
        queryParams.push(params.date_to);
      }

      if (params.field_officer_id) {
        whereClause += ' AND s.field_officer_id = ?';
        queryParams.push(parseInt(String(params.field_officer_id)));
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM soil_testing s
        ${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get schedules with pagination
      const [rows] = await connection.execute(`
        SELECT 
          s.*,
          scc.name as center_name,
          scc.address as center_address,
          u.first_name as farmer_first_name,
          u.last_name as farmer_last_name,
          fo.specialization as field_officer_specialization
        FROM soil_testing s
        LEFT JOIN soil_collection_centers scc ON s.soil_collection_center_id = scc.id
        LEFT JOIN users u ON s.farmer_id = u.id
        LEFT JOIN field_officers fo ON s.field_officer_id = fo.id
        ${whereClause}
        ORDER BY s.scheduled_date DESC, s.created_at DESC
        LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}
      `, queryParams);

      const schedules = (rows as any[]).map(schedule => ({
        id: schedule.id,
        farmer_id: schedule.farmer_id,
        soil_collection_center_id: schedule.soil_collection_center_id,
        scheduled_date: schedule.scheduled_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        status: schedule.status,
        farmer_phone: schedule.farmer_phone,
        farmer_location_address: schedule.farmer_location_address,
        farmer_latitude: schedule.farmer_latitude,
        farmer_longitude: schedule.farmer_longitude,
        admin_notes: schedule.admin_notes,
        rejection_reason: schedule.rejection_reason,
        field_officer_id: schedule.field_officer_id,
        qr_code_url: schedule.qr_code_url,
        qr_code_data: schedule.qr_code_data,
        completed_at: schedule.completed_at,
        created_at: schedule.created_at,
        updated_at: schedule.updated_at,
        center_name: schedule.center_name,
        center_address: schedule.center_address,
        farmer_first_name: schedule.farmer_first_name,
        farmer_last_name: schedule.farmer_last_name,
        field_officer_specialization: schedule.field_officer_specialization
      }));

      return {
        data: schedules,
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
   * Get all soil testing schedules with pagination
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingSchedule>> {
    return this.search({ page, limit });
  }

  /**
   * Get schedules by farmer ID
   */
  static async getByFarmer(farmerId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingSchedule>> {
    return this.search({ farmer_id: farmerId, page, limit });
  }

  /**
   * Get schedules by center ID
   */
  static async getByCenter(centerId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingSchedule>> {
    return this.search({ soil_collection_center_id: centerId, page, limit });
  }

  /**
   * Get schedules by status
   */
  static async getByStatus(status: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingSchedule>> {
    return this.search({ status, page, limit });
  }

  /**
   * Get schedules by field visitor ID
   */
  static async getByFieldVisitor(fieldVisitorId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingSchedule>> {
    return this.search({ field_officer_id: fieldVisitorId, page, limit });
  }

  /**
   * Get today's schedules
   */
  static async getTodaySchedules(): Promise<SoilTestingSchedule[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          s.*,
          scc.name as center_name,
          scc.address as center_address,
          u.first_name as farmer_first_name,
          u.last_name as farmer_last_name,
          fo.specialization as field_officer_specialization
        FROM soil_testing s
        LEFT JOIN soil_collection_centers scc ON s.soil_collection_center_id = scc.id
        LEFT JOIN users u ON s.farmer_id = u.id
        LEFT JOIN field_officers fo ON s.field_officer_id = fo.id
        WHERE s.scheduled_date = CURDATE() AND s.status IN ('approved', 'pending')
        ORDER BY s.start_time ASC
      `);

      return (rows as any[]).map(schedule => ({
        id: schedule.id,
        farmer_id: schedule.farmer_id,
        soil_collection_center_id: schedule.soil_collection_center_id,
        scheduled_date: schedule.scheduled_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        status: schedule.status,
        farmer_phone: schedule.farmer_phone,
        farmer_location_address: schedule.farmer_location_address,
        farmer_latitude: schedule.farmer_latitude,
        farmer_longitude: schedule.farmer_longitude,
        admin_notes: schedule.admin_notes,
        rejection_reason: schedule.rejection_reason,
        field_officer_id: schedule.field_officer_id,
        qr_code_url: schedule.qr_code_url,
        qr_code_data: schedule.qr_code_data,
        completed_at: schedule.completed_at,
        created_at: schedule.created_at,
        updated_at: schedule.updated_at,
        center_name: schedule.center_name,
        center_address: schedule.center_address,
        farmer_first_name: schedule.farmer_first_name,
        farmer_last_name: schedule.farmer_last_name,
        field_officer_specialization: schedule.field_officer_specialization
      }));
    } finally {
      connection.release();
    }
  }
}

export default SoilTestingScheduleModel;
