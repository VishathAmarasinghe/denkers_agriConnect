import { WarehouseCategory as WarehouseCategoryType } from '../types';
import { pool } from '../config/database';

class WarehouseCategoryModel {
  /**
   * Create a new warehouse category
   */
  static async create(data: Omit<WarehouseCategoryType, 'id'>): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO warehouse_categories (name, description) VALUES (?, ?)
      `, [data.name, data.description || null]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find category by ID
   */
  static async findById(id: number): Promise<WarehouseCategoryType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT id, name, description FROM warehouse_categories WHERE id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToCategory((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get all categories
   */
  static async findAll(): Promise<WarehouseCategoryType[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT id, name, description FROM warehouse_categories ORDER BY name
      `);

      return (rows as any[]).map(row => this.mapRowToCategory(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Update category
   */
  static async update(id: number, data: Partial<Omit<WarehouseCategoryType, 'id'>>): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }

      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE warehouse_categories SET ${updateFields.join(', ')} WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete category
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      // Check if category is being used by any warehouses
      const [warehouseCount] = await connection.execute(`
        SELECT COUNT(*) as count FROM warehouses WHERE category_id = ?
      `, [id]);

      if ((warehouseCount as any[])[0].count > 0) {
        throw new Error('Cannot delete category: warehouses are using this category');
      }

      const [result] = await connection.execute(`
        DELETE FROM warehouse_categories WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
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
      let query = 'SELECT COUNT(*) as count FROM warehouse_categories WHERE name = ?';
      let params = [name];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(String(excludeId));
      }

      const [rows] = await connection.execute(query, params);
      return (rows as any[])[0].count > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get category with warehouse count
   */
  static async getWithWarehouseCount(): Promise<(WarehouseCategoryType & { warehouse_count: number })[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          wc.id, 
          wc.name, 
          wc.description,
          COUNT(w.id) as warehouse_count
        FROM warehouse_categories wc
        LEFT JOIN warehouses w ON wc.id = w.category_id
        GROUP BY wc.id, wc.name, wc.description
        ORDER BY wc.name
      `);

      return (rows as any[]).map(row => ({
        ...this.mapRowToCategory(row),
        warehouse_count: row.warehouse_count
      }));
    } finally {
      connection.release();
    }
  }

  /**
   * Map database row to WarehouseCategory object
   */
  private static mapRowToCategory(row: any): WarehouseCategoryType {
    return {
      id: row.id,
      name: row.name,
      description: row.description
    };
  }
}

export default WarehouseCategoryModel;
