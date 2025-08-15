import { FieldOfficerContactRequest as FieldOfficerContactRequestType, FieldOfficerContactRequestCreate, FieldOfficerContactRequestUpdate, FieldOfficerContactRequestSearchParams, PaginatedResponse } from '../types';
import { pool } from '../config/database';

class FieldOfficerContactRequestModel {
  /**
   * Create a new field officer contact request
   */
  static async create(data: FieldOfficerContactRequestCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO field_officer_contact_requests (
          farmer_id, field_officer_id, farmer_name, farmer_mobile, 
          farmer_address, current_issues, urgency_level, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [
        data.farmer_id,
        data.field_officer_id,
        data.farmer_name,
        data.farmer_mobile,
        data.farmer_address,
        data.current_issues,
        data.urgency_level
      ]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find field officer contact request by ID
   */
  static async findById(id: number): Promise<FieldOfficerContactRequestType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          foc.*,
          fo.name as field_officer_name,
          fo.designation as field_officer_designation,
          fo.center as field_officer_center,
          fo.phone_no as field_officer_phone,
          fo.specialization as field_officer_specialization,
          fo.profile_image_url as field_officer_profile_image,
          u.username as farmer_username,
          u.first_name as farmer_first_name,
          u.last_name as farmer_last_name,
          admin.username as admin_username
        FROM field_officer_contact_requests foc
        LEFT JOIN field_officers fo ON foc.field_officer_id = fo.id
        LEFT JOIN users u ON foc.farmer_id = u.id
        LEFT JOIN users admin ON foc.assigned_by = admin.id
        WHERE foc.id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToFieldOfficerContactRequest((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update field officer contact request
   */
  static async update(id: number, data: FieldOfficerContactRequestUpdate): Promise<boolean> {
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

      if (data.assigned_by !== undefined) {
        updateFields.push('assigned_by = ?');
        updateValues.push(data.assigned_by);
      }

      if (data.assigned_at !== undefined) {
        updateFields.push('assigned_at = ?');
        updateValues.push(data.assigned_at);
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
        UPDATE field_officer_contact_requests 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete field officer contact request
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        DELETE FROM field_officer_contact_requests WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Search field officer contact requests with filters and pagination
   */
  static async search(params: FieldOfficerContactRequestSearchParams): Promise<PaginatedResponse<FieldOfficerContactRequestType>> {
    const connection = await pool.getConnection();
    try {
      const page = Math.max(1, parseInt(String(params.page || 1)));
      const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params.farmer_id) {
        whereClause += ' AND foc.farmer_id = ?';
        queryParams.push(parseInt(String(params.farmer_id)));
      }

      if (params.field_officer_id) {
        whereClause += ' AND foc.field_officer_id = ?';
        queryParams.push(parseInt(String(params.field_officer_id)));
      }

      if (params.status) {
        whereClause += ' AND foc.status = ?';
        queryParams.push(params.status);
      }

      if (params.urgency_level) {
        whereClause += ' AND foc.urgency_level = ?';
        queryParams.push(params.urgency_level);
      }

      if (params.start_date) {
        whereClause += ' AND foc.created_at >= ?';
        queryParams.push(params.start_date);
      }

      if (params.end_date) {
        whereClause += ' AND foc.created_at <= ?';
        queryParams.push(params.end_date);
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM field_officer_contact_requests foc
        ${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get requests with pagination
      const [rows] = await connection.execute(`
        SELECT 
          foc.*,
          fo.name as field_officer_name,
          fo.designation as field_officer_designation,
          fo.center as field_officer_center,
          fo.phone_no as field_officer_phone,
          fo.specialization as field_officer_specialization,
          fo.profile_image_url as field_officer_profile_image,
          u.username as farmer_username,
          u.first_name as farmer_first_name,
          u.last_name as farmer_last_name,
          admin.username as admin_username
        FROM field_officer_contact_requests foc
        LEFT JOIN field_officers fo ON foc.field_officer_id = fo.id
        LEFT JOIN users u ON foc.farmer_id = u.id
        LEFT JOIN users admin ON foc.assigned_by = admin.id
        ${whereClause}
        ORDER BY 
          CASE 
            WHEN foc.urgency_level = 'critical' THEN 1
            WHEN foc.urgency_level = 'high' THEN 2
            WHEN foc.urgency_level = 'medium' THEN 3
            WHEN foc.urgency_level = 'low' THEN 4
          END,
          foc.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `, queryParams);

      const requests = (rows as any[]).map(row => this.mapRowToFieldOfficerContactRequest(row));

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
   * Get all requests by farmer
   */
  static async getByFarmer(farmerId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<FieldOfficerContactRequestType>> {
    return this.search({ farmer_id: farmerId, page, limit });
  }

  /**
   * Get all requests by field officer
   */
  static async getByFieldOfficer(fieldOfficerId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<FieldOfficerContactRequestType>> {
    return this.search({ field_officer_id: fieldOfficerId, page, limit });
  }

  /**
   * Get pending requests
   */
  static async getPending(page: number = 1, limit: number = 10): Promise<PaginatedResponse<FieldOfficerContactRequestType>> {
    return this.search({ status: 'pending', page, limit });
  }

  /**
   * Get requests by urgency level
   */
  static async getByUrgencyLevel(urgencyLevel: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<FieldOfficerContactRequestType>> {
    return this.search({ urgency_level: urgencyLevel as any, page, limit });
  }

  /**
   * Map database row to FieldOfficerContactRequest object
   */
  private static mapRowToFieldOfficerContactRequest(row: any): FieldOfficerContactRequestType {
    return {
      id: row.id,
      farmer_id: row.farmer_id,
      field_officer_id: row.field_officer_id,
      farmer_name: row.farmer_name,
      farmer_mobile: row.farmer_mobile,
      farmer_address: row.farmer_address,
      current_issues: row.current_issues,
      urgency_level: row.urgency_level,
      status: row.status,
      admin_notes: row.admin_notes,
      rejection_reason: row.rejection_reason,
      assigned_by: row.assigned_by,
      assigned_at: row.assigned_at,
      completed_at: row.completed_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default FieldOfficerContactRequestModel;
