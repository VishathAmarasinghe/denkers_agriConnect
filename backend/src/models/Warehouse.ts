import { Warehouse as WarehouseType, WarehouseCreateData, WarehouseUpdateData, WarehouseSearchParams, PaginatedResponse } from '../types';
import { pool } from '../config/database';

class WarehouseModel {
  /**
   * Create a new warehouse
   */
  static async create(data: WarehouseCreateData): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO warehouses (
          name, contact_person_name, contact_person_number, warehouse_status,
          fixed_space_amount, temperature_range, security_level, description,
          category_id, address, province_id, district_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.name,
        data.contact_person_name,
        data.contact_person_number,
        data.warehouse_status || 'open',
        data.fixed_space_amount,
        data.temperature_range || null,
        data.security_level || 'medium',
        data.description || null,
        data.category_id,
        data.address,
        data.province_id,
        data.district_id
      ]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find warehouse by ID
   */
  static async findById(id: number): Promise<WarehouseType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          w.*,
          wc.name as category_name,
          wc.description as category_description,
          p.name as province_name,
          d.name as district_name
        FROM warehouses w
        LEFT JOIN warehouse_categories wc ON w.category_id = wc.id
        LEFT JOIN provinces p ON w.province_id = p.id
        LEFT JOIN districts d ON w.district_id = d.id
        WHERE w.id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToWarehouse((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update warehouse
   */
  static async update(id: number, data: WarehouseUpdateData): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }

      if (data.contact_person_name !== undefined) {
        updateFields.push('contact_person_name = ?');
        updateValues.push(data.contact_person_name);
      }

      if (data.contact_person_number !== undefined) {
        updateFields.push('contact_person_number = ?');
        updateValues.push(data.contact_person_number);
      }

      if (data.warehouse_status !== undefined) {
        updateFields.push('warehouse_status = ?');
        updateValues.push(data.warehouse_status);
      }

      if (data.fixed_space_amount !== undefined) {
        updateFields.push('fixed_space_amount = ?');
        updateValues.push(data.fixed_space_amount);
      }

      if (data.temperature_range !== undefined) {
        updateFields.push('temperature_range = ?');
        updateValues.push(data.temperature_range);
      }

      if (data.security_level !== undefined) {
        updateFields.push('security_level = ?');
        updateValues.push(data.security_level);
      }

      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }

      if (data.category_id !== undefined) {
        updateFields.push('category_id = ?');
        updateValues.push(data.category_id);
      }

      if (data.address !== undefined) {
        updateFields.push('address = ?');
        updateValues.push(data.address);
      }

      if (data.province_id !== undefined) {
        updateFields.push('province_id = ?');
        updateValues.push(data.province_id);
      }

      if (data.district_id !== undefined) {
        updateFields.push('district_id = ?');
        updateValues.push(data.district_id);
      }

      if (data.is_available !== undefined) {
        updateFields.push('is_available = ?');
        updateValues.push(data.is_available);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE warehouses 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete warehouse (soft delete by setting is_available to false)
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE warehouses 
        SET is_available = FALSE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Search warehouses with filters and pagination
   */
  static async search(params: WarehouseSearchParams): Promise<PaginatedResponse<WarehouseType>> {
    const connection = await pool.getConnection();
    try {
      const page = Math.max(1, parseInt(String(params.page || 1)));
      const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params.name) {
        whereClause += ' AND w.name LIKE ?';
        queryParams.push(`%${params.name}%`);
      }

      if (params.category_id) {
        whereClause += ' AND w.category_id = ?';
        queryParams.push(parseInt(String(params.category_id)));
      }

      if (params.province) {
        whereClause += ' AND p.name LIKE ?';
        queryParams.push(`%${params.province}%`);
      }

      if (params.district) {
        whereClause += ' AND d.name LIKE ?';
        queryParams.push(`%${params.district}%`);
      }

      if (params.warehouse_status) {
        whereClause += ' AND w.warehouse_status = ?';
        queryParams.push(params.warehouse_status);
      }

      if (params.security_level) {
        whereClause += ' AND w.security_level = ?';
        queryParams.push(params.security_level);
      }

      if (params.is_available !== undefined) {
        whereClause += ' AND w.is_available = ?';
        // Convert string boolean to numeric boolean for database query
        const boolValue = typeof params.is_available === 'string' 
          ? (params.is_available === 'true' ? 1 : 0)
          : params.is_available ? 1 : 0;
        queryParams.push(boolValue);
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM warehouses w
        LEFT JOIN provinces p ON w.province_id = p.id
        LEFT JOIN districts d ON w.district_id = d.id
        ${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get warehouses with pagination
      const [rows] = await connection.execute(`
        SELECT 
          w.*,
          wc.name as category_name,
          wc.description as category_description,
          p.name as province_name,
          d.name as district_name
        FROM warehouses w
        LEFT JOIN warehouse_categories wc ON w.category_id = wc.id
        LEFT JOIN provinces p ON w.province_id = p.id
        LEFT JOIN districts d ON w.district_id = d.id
        ${whereClause}
        ORDER BY w.name ASC
        LIMIT ${limit} OFFSET ${offset}
      `, queryParams);

      const warehouses = (rows as any[]).map(row => this.mapRowToWarehouse(row));

      return {
        data: warehouses,
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
   * Get all warehouses with pagination
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseType>> {
    return this.search({ page, limit });
  }

  /**
   * Get available warehouses
   */
  static async getAvailable(page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseType>> {
    return this.search({ is_available: true, page, limit });
  }

  /**
   * Get warehouses by category
   */
  static async getByCategory(categoryId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseType>> {
    return this.search({ category_id: categoryId, page, limit });
  }

  /**
   * Get warehouses by province
   */
  static async getByProvince(provinceId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseType>> {
    // First get the province name from the ID, then search by name
    const connection = await pool.getConnection();
    try {
      const [provinceRows] = await connection.execute('SELECT name FROM provinces WHERE id = ?', [provinceId]);
      if ((provinceRows as any[]).length === 0) {
        return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
      }
      const provinceName = (provinceRows as any[])[0].name;
      return this.search({ province: provinceName, page, limit });
    } finally {
      connection.release();
    }
  }

  /**
   * Get warehouses by district
   */
  static async getByDistrict(districtId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseType>> {
    // First get the district name from the ID, then search by name
    const connection = await pool.getConnection();
    try {
      const [districtRows] = await connection.execute('SELECT name FROM districts WHERE id = ?', [districtId]);
      if ((districtRows as any[]).length === 0) {
        return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
      }
      const districtName = (districtRows as any[])[0].name;
      return this.search({ district: districtName, page, limit });
    } finally {
      connection.release();
    }
  }

  /**
   * Get warehouses by security level
   */
  static async getBySecurityLevel(securityLevel: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseType>> {
    return this.search({ security_level: securityLevel as 'high' | 'medium' | 'low', page, limit });
  }

  /**
   * Get warehouses by status
   */
  static async getByStatus(status: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseType>> {
    return this.search({ warehouse_status: status as 'open' | 'closed', page, limit });
  }

  /**
   * Check if warehouse name exists
   */
  static async nameExists(name: string, excludeId?: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT COUNT(*) as count FROM warehouses WHERE name = ?';
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
   * Map database row to Warehouse object
   */
  private static mapRowToWarehouse(row: any): WarehouseType {
    return {
      id: row.id,
      name: row.name,
      contact_person_name: row.contact_person_name,
      contact_person_number: row.contact_person_number,
      warehouse_status: row.warehouse_status,
      fixed_space_amount: row.fixed_space_amount,
      temperature_range: row.temperature_range,
      security_level: row.security_level,
      description: row.description,
      category_id: row.category_id,
      address: row.address,
      province_id: row.province_id,
      district_id: row.district_id,
      is_available: Boolean(row.is_available),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default WarehouseModel;
