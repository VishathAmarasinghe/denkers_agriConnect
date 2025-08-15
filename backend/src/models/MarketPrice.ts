import { MarketPrice as MarketPriceType, MarketPriceCreate, MarketPriceUpdate, PaginatedResponse } from '../types';
import { pool } from '../config/database';

class MarketPriceModel {
  /**
   * Create a new market price
   */
  static async create(data: MarketPriceCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO market_prices (
          item_name, current_price, unit, price_date, source, notes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        data.item_name,
        data.current_price,
        data.unit,
        data.price_date,
        data.source,
        data.notes || null
      ]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find market price by ID
   */
  static async findById(id: number): Promise<MarketPriceType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM market_prices WHERE id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToMarketPrice((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get current market price by item name
   */
  static async getCurrentPrice(itemName: string): Promise<MarketPriceType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM market_prices 
        WHERE item_name = ? 
        ORDER BY price_date DESC 
        LIMIT 1
      `, [itemName]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToMarketPrice((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update market price
   */
  static async update(id: number, data: MarketPriceUpdate): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.current_price !== undefined) {
        updateFields.push('current_price = ?');
        updateValues.push(data.current_price);
      }

      if (data.price_date !== undefined) {
        updateFields.push('price_date = ?');
        updateValues.push(data.price_date);
      }

      if (data.source !== undefined) {
        updateFields.push('source = ?');
        updateValues.push(data.source);
      }

      if (data.notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(data.notes);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE market_prices 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete market price
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        DELETE FROM market_prices WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all market prices with pagination
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<MarketPriceType>> {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total FROM market_prices
      `);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get market prices with pagination
      const [rows] = await connection.execute(`
        SELECT * FROM market_prices 
        ORDER BY price_date DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      const marketPrices = (rows as any[]).map(row => this.mapRowToMarketPrice(row));

      return {
        data: marketPrices,
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
   * Search market prices by item name
   */
  static async searchByItem(itemName: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<MarketPriceType>> {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total FROM market_prices WHERE item_name LIKE ?
      `, [`%${itemName}%`]);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get market prices with pagination
      const [rows] = await connection.execute(`
        SELECT * FROM market_prices 
        WHERE item_name LIKE ?
        ORDER BY price_date DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `, [`%${itemName}%`]);

      const marketPrices = (rows as any[]).map(row => this.mapRowToMarketPrice(row));

      return {
        data: marketPrices,
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
   * Get price history for an item
   */
  static async getPriceHistory(itemName: string, days: number = 30): Promise<MarketPriceType[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM market_prices 
        WHERE item_name = ? 
        AND price_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        ORDER BY price_date DESC
      `, [itemName, days]);

      return (rows as any[]).map(row => this.mapRowToMarketPrice(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Update or create market price (upsert)
   */
  static async upsertPrice(data: MarketPriceCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      // Check if price for this item and date already exists
      const [existingRows] = await connection.execute(`
        SELECT id FROM market_prices 
        WHERE item_name = ? AND DATE(price_date) = DATE(?)
      `, [data.item_name, data.price_date]);

      if ((existingRows as any[]).length > 0) {
        // Update existing price
        const existingId = (existingRows as any[])[0].id;
        await this.update(existingId, {
          current_price: data.current_price,
          source: data.source,
          notes: data.notes
        });
        return existingId;
      } else {
        // Create new price
        return await this.create(data);
      }
    } finally {
      connection.release();
    }
  }

  /**
   * Map database row to MarketPrice object
   */
  private static mapRowToMarketPrice(row: any): MarketPriceType {
    return {
      id: row.id,
      item_name: row.item_name,
      current_price: row.current_price,
      unit: row.unit,
      price_date: row.price_date,
      source: row.source,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default MarketPriceModel;
