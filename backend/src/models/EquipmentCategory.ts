import { pool } from '../config/database';
import { EquipmentCategory, EquipmentCategoryCreate, EquipmentCategoryUpdate, EquipmentCategorySearchParams } from '../types';

export class EquipmentCategoryModel {
  /**
   * Create a new equipment category
   */
  static async create(categoryData: EquipmentCategoryCreate): Promise<EquipmentCategory> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO equipment_categories (name, description, is_active) 
        VALUES (?, ?, ?)
      `, [
        categoryData.name,
        categoryData.description || null,
        categoryData.is_active !== undefined ? categoryData.is_active : true
      ]);

      const categoryId = (result as any).insertId;
      return this.findById(categoryId);
    } finally {
      connection.release();
    }
  }

  /**
   * Find equipment category by ID
   */
  static async findById(id: number): Promise<EquipmentCategory> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM equipment_categories WHERE id = ?
      `, [id]);

      const categories = rows as any[];
      if (categories.length === 0) {
        throw new Error('Equipment category not found');
      }

      return this.mapRowToCategory(categories[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update equipment category
   */
  static async update(id: number, updateData: EquipmentCategoryUpdate): Promise<EquipmentCategory> {
    const connection = await pool.getConnection();
    try {
      const fields = [];
      const values = [];

      if (updateData.name !== undefined) {
        fields.push('name = ?');
        values.push(updateData.name);
      }
      if (updateData.description !== undefined) {
        fields.push('description = ?');
        values.push(updateData.description);
      }
      if (updateData.is_active !== undefined) {
        fields.push('is_active = ?');
        values.push(updateData.is_active);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      await connection.execute(`
        UPDATE equipment_categories 
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values);

      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Delete equipment category (soft delete by setting is_active to false)
   */
  static async delete(id: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        UPDATE equipment_categories 
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [id]);
    } finally {
      connection.release();
    }
  }

  /**
   * Activate equipment category
   */
  static async activate(id: number): Promise<EquipmentCategory> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        UPDATE equipment_categories 
        SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [id]);

      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Deactivate equipment category
   */
  static async deactivate(id: number): Promise<EquipmentCategory> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        UPDATE equipment_categories 
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [id]);

      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Search equipment categories with pagination
   */
  static async search(params: EquipmentCategorySearchParams): Promise<{
    data: EquipmentCategory[];
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
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params.is_active !== undefined) {
        whereClause += ' AND is_active = ?';
        queryParams.push(params.is_active);
      }

      if (params.search) {
        whereClause += ' AND (name LIKE ? OR description LIKE ?)';
        const searchTerm = `%${params.search}%`;
        queryParams.push(searchTerm, searchTerm);
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM equipment_categories 
        ${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get categories with pagination
      const [rows] = await connection.execute(`
        SELECT * FROM equipment_categories 
        ${whereClause}
        ORDER BY name ASC
        LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}
      `, queryParams);

      const categories = (rows as any[]).map(row => this.mapRowToCategory(row));

      return {
        data: categories,
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
   * Get all equipment categories
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<{
    data: EquipmentCategory[];
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
   * Get active equipment categories
   */
  static async getActive(): Promise<EquipmentCategory[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM equipment_categories 
        WHERE is_active = TRUE 
        ORDER BY name ASC
      `);

      return (rows as any[]).map(row => this.mapRowToCategory(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Check if category name exists
   */
  static async nameExists(name: string, excludeId?: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT COUNT(*) as count FROM equipment_categories WHERE name = ?';
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
   * Map database row to EquipmentCategory object
   */
  private static mapRowToCategory(row: any): EquipmentCategory {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
