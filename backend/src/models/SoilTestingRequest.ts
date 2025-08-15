import mysql from 'mysql2/promise';
import { pool } from '../config/database';
import { 
  SoilTestingRequest, 
  SoilTestingRequestCreate, 
  SoilTestingRequestUpdate, 
  SoilTestingRequestSearchParams,
  PaginatedResponse 
} from '../types';

class SoilTestingRequestModel {
  /**
   * Create a new soil testing request
   */
  static async create(data: SoilTestingRequestCreate, farmerId: number): Promise<SoilTestingRequest> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO soil_testing_requests (
          farmer_id, soil_collection_center_id, preferred_date, preferred_time_slot,
          farmer_phone, farmer_location_address, farmer_latitude, farmer_longitude, additional_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        farmerId,
        data.soil_collection_center_id,
        data.preferred_date,
        data.preferred_time_slot || null,
        data.farmer_phone,
        data.farmer_location_address || null,
        data.farmer_latitude || null,
        data.farmer_longitude || null,
        data.additional_notes || null
      ]);

      const id = (result as any).insertId;
      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Find soil testing request by ID
   */
  static async findById(id: number): Promise<SoilTestingRequest | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          r.*,
          scc.name as center_name,
          scc.address as center_address,
          u.first_name as farmer_first_name,
          u.last_name as farmer_last_name,
          fo.specialization as field_officer_specialization
        FROM soil_testing_requests r
        LEFT JOIN soil_collection_centers scc ON r.soil_collection_center_id = scc.id
        LEFT JOIN users u ON r.farmer_id = u.id
        LEFT JOIN field_officers fo ON r.field_officer_id = fo.id
        WHERE r.id = ?
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
   * Update soil testing request
   */
  static async update(id: number, data: SoilTestingRequestUpdate): Promise<boolean> {
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

      if (data.approved_date !== undefined) {
        updateFields.push('approved_date = ?');
        updateValues.push(data.approved_date);
      }

      if (data.approved_start_time !== undefined) {
        updateFields.push('approved_start_time = ?');
        updateValues.push(data.approved_start_time);
      }

      if (data.approved_end_time !== undefined) {
        updateFields.push('approved_end_time = ?');
        updateValues.push(data.approved_end_time);
      }

      if (data.field_officer_id !== undefined) {
        updateFields.push('field_officer_id = ?');
        updateValues.push(data.field_officer_id);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE soil_testing_requests 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Search soil testing requests with filters and pagination
   */
  static async search(params: SoilTestingRequestSearchParams): Promise<PaginatedResponse<SoilTestingRequest>> {
    const connection = await pool.getConnection();
    try {
      const page = Math.max(1, parseInt(String(params.page || 1)));
      const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params.farmer_id) {
        whereClause += ' AND r.farmer_id = ?';
        queryParams.push(parseInt(String(params.farmer_id)));
      }

      if (params.soil_collection_center_id) {
        whereClause += ' AND r.soil_collection_center_id = ?';
        queryParams.push(parseInt(String(params.soil_collection_center_id)));
      }

      if (params.status) {
        whereClause += ' AND r.status = ?';
        queryParams.push(params.status);
      }

      if (params.date_from) {
        whereClause += ' AND r.preferred_date >= ?';
        queryParams.push(params.date_from);
      }

      if (params.date_to) {
        whereClause += ' AND r.preferred_date <= ?';
        queryParams.push(params.date_to);
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM soil_testing_requests r
        ${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get requests with pagination
      const [rows] = await connection.execute(`
        SELECT 
          r.*,
          scc.name as center_name,
          scc.address as center_address,
          u.first_name as farmer_first_name,
          u.last_name as farmer_last_name,
          fo.specialization as field_officer_specialization
        FROM soil_testing_requests r
        LEFT JOIN soil_collection_centers scc ON r.soil_collection_center_id = scc.id
        LEFT JOIN users u ON r.farmer_id = u.id
        LEFT JOIN field_officers fo ON r.field_officer_id = fo.id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}
      `, queryParams);

      const requests = (rows as any[]).map(request => ({
        id: request.id,
        farmer_id: request.farmer_id,
        soil_collection_center_id: request.soil_collection_center_id,
        preferred_date: request.preferred_date,
        preferred_time_slot: request.preferred_time_slot,
        farmer_phone: request.farmer_phone,
        farmer_location_address: request.farmer_location_address,
        farmer_latitude: request.farmer_latitude,
        farmer_longitude: request.farmer_longitude,
        additional_notes: request.additional_notes,
        status: request.status,
        admin_notes: request.admin_notes,
        rejection_reason: request.rejection_reason,
        approved_date: request.approved_date,
        approved_start_time: request.approved_start_time,
        approved_end_time: request.approved_end_time,
        field_officer_id: request.field_officer_id,
        created_at: request.created_at,
        updated_at: request.updated_at,
        center_name: request.center_name,
        center_address: request.center_address,
        farmer_first_name: request.farmer_first_name,
        farmer_last_name: request.farmer_last_name,
        field_officer_specialization: request.field_officer_specialization
      }));

      return {
        data: requests,
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
   * Get all soil testing requests with pagination
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingRequest>> {
    return this.search({ page, limit });
  }

  /**
   * Get requests by farmer ID
   */
  static async getByFarmer(farmerId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingRequest>> {
    return this.search({ farmer_id: farmerId, page, limit });
  }

  /**
   * Get requests by center ID
   */
  static async getByCenter(centerId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingRequest>> {
    return this.search({ soil_collection_center_id: centerId, page, limit });
  }

  /**
   * Get pending requests
   */
  static async getPending(page: number = 1, limit: number = 10): Promise<PaginatedResponse<SoilTestingRequest>> {
    return this.search({ status: 'pending', page, limit });
  }
}

export default SoilTestingRequestModel;
