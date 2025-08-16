import { pool } from '../config/database';
import { Equipment, EquipmentCreate, EquipmentUpdate, EquipmentSearchParams } from '../types';

export class EquipmentModel {
  /**
   * Create a new equipment
   */
  static async create(equipmentData: EquipmentCreate): Promise<Equipment> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO equipment (
          name, category_id, description, daily_rate, weekly_rate, monthly_rate,
          contact_number, delivery_fee, security_deposit, equipment_image_url,
          specifications, maintenance_notes, is_available, is_active, current_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        equipmentData.name,
        equipmentData.category_id,
        equipmentData.description || null,
        equipmentData.daily_rate,
        equipmentData.weekly_rate,
        equipmentData.monthly_rate || null,
        equipmentData.contact_number,
        equipmentData.delivery_fee || 0.00,
        equipmentData.security_deposit || 0.00,
        equipmentData.equipment_image_url || null,
        equipmentData.specifications ? JSON.stringify(equipmentData.specifications) : null,
        equipmentData.maintenance_notes || null,
        equipmentData.is_available !== undefined ? equipmentData.is_available : true,
        equipmentData.is_active !== undefined ? equipmentData.is_active : true,
        equipmentData.current_status || 'available'
      ]);

      const equipmentId = (result as any).insertId;
      return this.findById(equipmentId);
    } finally {
      connection.release();
    }
  }

  /**
   * Find equipment by ID
   */
  static async findById(id: number): Promise<Equipment> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          e.*,
          ec.name as category_name,
          ec.description as category_description
        FROM equipment e
        LEFT JOIN equipment_categories ec ON e.category_id = ec.id
        WHERE e.id = ?
      `, [id]);

      const equipment = rows as any[];
      if (equipment.length === 0) {
        throw new Error('Equipment not found');
      }

      return this.mapRowToEquipment(equipment[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update equipment
   */
  static async update(id: number, updateData: EquipmentUpdate): Promise<Equipment> {
    const connection = await pool.getConnection();
    try {
      const fields = [];
      const values = [];

      if (updateData.name !== undefined) {
        fields.push('name = ?');
        values.push(updateData.name);
      }
      if (updateData.category_id !== undefined) {
        fields.push('category_id = ?');
        values.push(updateData.category_id);
      }
      if (updateData.description !== undefined) {
        fields.push('description = ?');
        values.push(updateData.description);
      }
      if (updateData.daily_rate !== undefined) {
        fields.push('daily_rate = ?');
        values.push(updateData.daily_rate);
      }
      if (updateData.weekly_rate !== undefined) {
        fields.push('weekly_rate = ?');
        values.push(updateData.weekly_rate);
      }
      if (updateData.monthly_rate !== undefined) {
        fields.push('monthly_rate = ?');
        values.push(updateData.monthly_rate);
      }
      if (updateData.contact_number !== undefined) {
        fields.push('contact_number = ?');
        values.push(updateData.contact_number);
      }
      if (updateData.delivery_fee !== undefined) {
        fields.push('delivery_fee = ?');
        values.push(updateData.delivery_fee);
      }
      if (updateData.security_deposit !== undefined) {
        fields.push('security_deposit = ?');
        values.push(updateData.security_deposit);
      }
      if (updateData.equipment_image_url !== undefined) {
        fields.push('equipment_image_url = ?');
        values.push(updateData.equipment_image_url);
      }
      if (updateData.specifications !== undefined) {
        fields.push('specifications = ?');
        values.push(JSON.stringify(updateData.specifications));
      }
      if (updateData.maintenance_notes !== undefined) {
        fields.push('maintenance_notes = ?');
        values.push(updateData.maintenance_notes);
      }
      if (updateData.is_available !== undefined) {
        fields.push('is_available = ?');
        values.push(updateData.is_available);
      }
      if (updateData.is_active !== undefined) {
        fields.push('is_active = ?');
        values.push(updateData.is_active);
      }
      if (updateData.current_status !== undefined) {
        fields.push('current_status = ?');
        values.push(updateData.current_status);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      await connection.execute(`
        UPDATE equipment 
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values);

      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Delete equipment (soft delete by setting is_active to false)
   */
  static async delete(id: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        UPDATE equipment 
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [id]);
    } finally {
      connection.release();
    }
  }

  /**
   * Activate equipment
   */
  static async activate(id: number): Promise<Equipment> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        UPDATE equipment 
        SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [id]);

      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Deactivate equipment
   */
  static async deactivate(id: number): Promise<Equipment> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        UPDATE equipment 
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [id]);

      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Search equipment with pagination
   */
  static async search(params: EquipmentSearchParams): Promise<{
    data: Equipment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const connection = await pool.getConnection();
    try {
      const page = Math.max(1, parseInt(String(params.page || 1)));
      const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE e.is_active = TRUE';
      const queryParams: any[] = [];

      if (params.category_id) {
        whereClause += ' AND e.category_id = ?';
        queryParams.push(parseInt(String(params.category_id)));
      }

      if (params.is_available !== undefined) {
        whereClause += ' AND e.is_available = ?';
        queryParams.push(params.is_available);
      }

      if (params.current_status) {
        whereClause += ' AND e.current_status = ?';
        queryParams.push(params.current_status);
      }

      if (params.min_daily_rate !== undefined) {
        whereClause += ' AND e.daily_rate >= ?';
        queryParams.push(parseFloat(String(params.min_daily_rate)));
      }

      if (params.max_daily_rate !== undefined) {
        whereClause += ' AND e.daily_rate <= ?';
        queryParams.push(parseFloat(String(params.max_daily_rate)));
      }

      if (params.search) {
        whereClause += ' AND (e.name LIKE ? OR e.description LIKE ?)';
        const searchTerm = `%${params.search}%`;
        queryParams.push(searchTerm, searchTerm);
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM equipment e
        ${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get equipment with pagination
      const [rows] = await connection.execute(`
        SELECT 
          e.*,
          ec.name as category_name,
          ec.description as category_description
        FROM equipment e
        LEFT JOIN equipment_categories ec ON e.category_id = ec.id
        ${whereClause}
        ORDER BY e.name ASC
        LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}
      `, queryParams);

      const equipment = (rows as any[]).map(row => this.mapRowToEquipment(row));

      return {
        data: equipment,
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
   * Get all equipment
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<{
    data: Equipment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.search({ page, limit });
  }

  /**
   * Get equipment by category
   */
  static async getByCategory(categoryId: number, page: number = 1, limit: number = 10): Promise<{
    data: Equipment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.search({ category_id: categoryId, page, limit });
  }

  /**
   * Get available equipment
   */
  static async getAvailable(page: number = 1, limit: number = 10): Promise<{
    data: Equipment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.search({ is_available: true, current_status: 'available', page, limit });
  }

  /**
   * Check if equipment name exists in category
   */
  static async nameExistsInCategory(name: string, categoryId: number, excludeId?: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT COUNT(*) as count FROM equipment WHERE name = ? AND category_id = ?';
      const params = [name, categoryId];

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
   * Map database row to Equipment object
   */
  private static mapRowToEquipment(row: any): Equipment {
    return {
      id: row.id,
      name: row.name,
      category_id: row.category_id,
      description: row.description,
      daily_rate: row.daily_rate,
      weekly_rate: row.weekly_rate,
      monthly_rate: row.monthly_rate,
      contact_number: row.contact_number,
      delivery_fee: row.delivery_fee,
      security_deposit: row.security_deposit,
      equipment_image_url: row.equipment_image_url,
      specifications: row.specifications ? JSON.parse(row.specifications) : null,
      maintenance_notes: row.maintenance_notes,
      is_available: Boolean(row.is_available),
      is_active: Boolean(row.is_active),
      current_status: row.current_status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_name: row.category_name,
      category_description: row.category_description
    };
  }
}
