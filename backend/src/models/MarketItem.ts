import { MarketItem as MarketItemType, MarketItemCreate, MarketItemUpdate, PaginatedResponse } from '../types';
import { pool } from '../config/database';

class MarketItemModel {
  /**
   * Create a new market item
   */
  static async create(data: MarketItemCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO market_items (
          name, description, category, unit, image_url, is_active
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        data.name,
        data.description || null,
        data.category || null,
        data.unit || 'kg',
        data.image_url || null,
        data.is_active !== false ? 1 : 0
      ]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find market item by ID
   */
  static async findById(id: number): Promise<MarketItemType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM market_items WHERE id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToMarketItem((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Find market item by name
   */
  static async findByName(name: string): Promise<MarketItemType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM market_items WHERE name = ?
      `, [name]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToMarketItem((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update market item
   */
  static async update(id: number, data: MarketItemUpdate): Promise<boolean> {
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

      if (data.category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(data.category);
      }

      if (data.unit !== undefined) {
        updateFields.push('unit = ?');
        updateValues.push(data.unit);
      }

      if (data.image_url !== undefined) {
        updateFields.push('image_url = ?');
        updateValues.push(data.image_url);
      }

      if (data.is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(data.is_active ? 1 : 0);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE market_items 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete market item
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        DELETE FROM market_items WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all market items with pagination
   */
  static async getAll(page: number = 1, limit: number = 10, category?: string, isActive?: boolean): Promise<PaginatedResponse<MarketItemType>> {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;
      let whereClause = '';
      const queryParams: any[] = [];

      if (category) {
        whereClause += ' WHERE category = ?';
        queryParams.push(category);
      }

      if (isActive !== undefined) {
        whereClause += whereClause ? ' AND' : ' WHERE';
        whereClause += ' is_active = ?';
        queryParams.push(isActive ? 1 : 0);
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total FROM market_items${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get market items with pagination
      const [rows] = await connection.execute(`
        SELECT * FROM market_items 
        ${whereClause}
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `, queryParams);

      const marketItems = (rows as any[]).map(row => this.mapRowToMarketItem(row));

      return {
        data: marketItems,
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
   * Search market items by name
   */
  static async searchByName(name: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<MarketItemType>> {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total FROM market_items WHERE name LIKE ?
      `, [`%${name}%`]);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get market items with pagination
      const [rows] = await connection.execute(`
        SELECT * FROM market_items 
        WHERE name LIKE ?
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `, [`%${name}%`]);

      const marketItems = (rows as any[]).map(row => this.mapRowToMarketItem(row));

      return {
        data: marketItems,
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
   * Get market items by category
   */
  static async getByCategory(category: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<MarketItemType>> {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total FROM market_items WHERE category = ?
      `, [category]);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get market items with pagination
      const [rows] = await connection.execute(`
        SELECT * FROM market_items 
        WHERE category = ?
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `, [category]);

      const marketItems = (rows as any[]).map(row => this.mapRowToMarketItem(row));

      return {
        data: marketItems,
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
   * Get all categories
   */
  static async getCategories(): Promise<string[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT DISTINCT category FROM market_items 
        WHERE category IS NOT NULL AND category != ''
        ORDER BY category ASC
      `);

      return (rows as any[]).map(row => row.category);
    } finally {
      connection.release();
    }
  }

  /**
   * Check if name exists
   */
  static async nameExists(name: string, excludeId?: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT COUNT(*) as count FROM market_items WHERE name = ?';
      const params = [name];

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
   * Map database row to MarketItem object
   */
  private static mapRowToMarketItem(row: any): MarketItemType {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      unit: row.unit,
      image_url: row.image_url,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default MarketItemModel;
