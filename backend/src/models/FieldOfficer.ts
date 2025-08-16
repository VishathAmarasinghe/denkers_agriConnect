import { FieldOfficer as FieldOfficerType, FieldOfficerCreate, FieldOfficerUpdate, FieldOfficerSearchParams, PaginatedResponse } from '../types';
import { pool } from '../config/database';

class FieldOfficerModel {
  /**
   * Create a new field officer
   */
  static async create(data: FieldOfficerCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO field_officers (
          name, designation, description, center, phone_no, 
          specialization, assigned_province_id, assigned_district_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.name,
        data.designation,
        data.description || null,
        data.center || null,
        data.phone_no || null,
        data.specialization || null,
        data.assigned_province_id || null,
        data.assigned_district_id || null
      ]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find field officer by ID
   */
  static async findById(id: number): Promise<FieldOfficerType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          fo.*,
          p.name as province_name,
          d.name as district_name
        FROM field_officers fo
        LEFT JOIN provinces p ON fo.assigned_province_id = p.id
        LEFT JOIN districts d ON fo.assigned_district_id = d.id
        WHERE fo.id = ? AND fo.is_active = TRUE
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToFieldOfficer((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update field officer
   */
  static async update(id: number, data: FieldOfficerUpdate): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }

      if (data.designation !== undefined) {
        updateFields.push('designation = ?');
        updateValues.push(data.designation);
      }

      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }

      if (data.center !== undefined) {
        updateFields.push('center = ?');
        updateValues.push(data.center);
      }

      if (data.phone_no !== undefined) {
        updateFields.push('phone_no = ?');
        updateValues.push(data.phone_no);
      }

      if (data.specialization !== undefined) {
        updateFields.push('specialization = ?');
        updateValues.push(data.specialization);
      }

      if (data.assigned_province_id !== undefined) {
        updateFields.push('assigned_province_id = ?');
        updateValues.push(data.assigned_province_id);
      }

      if (data.assigned_district_id !== undefined) {
        updateFields.push('assigned_district_id = ?');
        updateValues.push(data.assigned_district_id);
      }

      if (data.is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(data.is_active);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE field_officers 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete field officer (soft delete by setting is_active to false)
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE field_officers 
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Activate field officer
   */
  static async activate(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE field_officers 
        SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Deactivate field officer
   */
  static async deactivate(id: number): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Search field officers with filters and pagination
   */
  static async search(params: FieldOfficerSearchParams): Promise<PaginatedResponse<FieldOfficerType>> {
    const connection = await pool.getConnection();
    try {
      const page = Math.max(1, parseInt(String(params.page || 1)));
      const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
      const offset = (page - 1) * limit;

      // Simple approach - get all and filter in memory for now
      const [allRows] = await connection.execute(`
        SELECT * FROM field_officers WHERE is_active = TRUE
      `);

      let filteredRows = (allRows as any[]).filter(row => {
        if (params.name && !row.name.toLowerCase().includes(params.name.toLowerCase())) return false;
        if (params.designation && !row.designation.toLowerCase().includes(params.designation.toLowerCase())) return false;
        if (params.center && !row.center.toLowerCase().includes(params.center.toLowerCase())) return false;
        if (params.specialization && row.specialization !== params.specialization) return false;
        if (params.assigned_province_id && row.assigned_province_id !== params.assigned_province_id) return false;
        if (params.assigned_district_id && row.assigned_district_id !== params.assigned_district_id) return false;
        return true;
      });

      const total = filteredRows.length;
      const totalPages = Math.ceil(total / limit);
      
      // Apply pagination
      const paginatedRows = filteredRows.slice(offset, offset + limit);

      const fieldOfficers = paginatedRows.map(row => this.mapRowToFieldOfficer(row));

      return {
        data: fieldOfficers,
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
   * Get all field officers with pagination
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<FieldOfficerType>> {
    return this.search({ page, limit });
  }

  /**
   * Get active field officers
   */
  static async getActive(page: number = 1, limit: number = 10): Promise<PaginatedResponse<FieldOfficerType>> {
    return this.search({ is_active: true, page, limit });
  }

  /**
   * Get field officers by province
   */
  static async getByProvince(provinceId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<FieldOfficerType>> {
    return this.search({ assigned_province_id: provinceId, page, limit });
  }

  /**
   * Get field officers by district
   */
  static async getByDistrict(districtId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<FieldOfficerType>> {
    return this.search({ assigned_district_id: districtId, page, limit });
  }

  /**
   * Get field officers by specialization
   */
  static async getBySpecialization(specialization: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<FieldOfficerType>> {
    return this.search({ specialization, page, limit });
  }

  /**
   * Get field officers by center
   */
  static async getByCenter(center: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<FieldOfficerType>> {
    return this.search({ center, page, limit });
  }

  /**
   * Check if field officer name exists
   */
  static async nameExists(name: string, excludeId?: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT COUNT(*) as count FROM field_officers WHERE name = ?';
      const params: (string | number)[] = [name];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const [rows] = await connection.execute(query, params);
      return (rows as any[])[0].count > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Test method to check basic table access
   */
  static async testBasicAccess(): Promise<any> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT id, name FROM field_officers LIMIT 1
      `);
      
      return rows;
    } catch (error) {
      console.error('FieldOfficer test error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Map database row to FieldOfficer object
   */
  private static mapRowToFieldOfficer(row: any): FieldOfficerType {
    return {
      id: row.id,
      name: row.name,
      designation: row.designation,
      description: row.description,
      center: row.center,
      phone_no: row.phone_no,
      specialization: row.specialization,
      assigned_province_id: row.assigned_province_id,
      assigned_district_id: row.assigned_district_id,
      profile_image_url: row.profile_image_url || null,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default FieldOfficerModel;
