import { WarehouseImage as WarehouseImageType, WarehouseImageCreate } from '../types';
import { pool } from '../config/database';

class WarehouseImageModel {
  /**
   * Create a new warehouse image
   */
  static async create(data: WarehouseImageCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      // If this is the first image for the warehouse, make it primary
      if (data.is_primary) {
        await connection.execute(`
          UPDATE warehouse_images 
          SET is_primary = FALSE 
          WHERE warehouse_id = ?
        `, [data.warehouse_id]);
      }

      const [result] = await connection.execute(`
        INSERT INTO warehouse_images (
          warehouse_id, image_url, image_name, image_type, image_size, is_primary
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        data.warehouse_id,
        data.image_url,
        data.image_name || null,
        data.image_type || null,
        data.image_size || null,
        data.is_primary || false
      ]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find warehouse image by ID
   */
  static async findById(id: number): Promise<WarehouseImageType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM warehouse_images WHERE id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToWarehouseImage((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get all images for a warehouse
   */
  static async getByWarehouse(warehouseId: number): Promise<WarehouseImageType[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM warehouse_images 
        WHERE warehouse_id = ? 
        ORDER BY is_primary DESC, created_at ASC
      `, [warehouseId]);

      return (rows as any[]).map(row => this.mapRowToWarehouseImage(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get primary image for a warehouse
   */
  static async getPrimaryByWarehouse(warehouseId: number): Promise<WarehouseImageType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT * FROM warehouse_images 
        WHERE warehouse_id = ? AND is_primary = TRUE
        LIMIT 1
      `, [warehouseId]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToWarehouseImage((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update warehouse image
   */
  static async update(id: number, data: Partial<WarehouseImageCreate>): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.image_name !== undefined) {
        updateFields.push('image_name = ?');
        updateValues.push(data.image_name);
      }

      if (data.image_type !== undefined) {
        updateFields.push('image_type = ?');
        updateValues.push(data.image_type);
      }

      if (data.image_size !== undefined) {
        updateFields.push('image_size = ?');
        updateValues.push(data.image_size);
      }

      if (data.is_primary !== undefined) {
        if (data.is_primary) {
          // If making this image primary, unset others
          await connection.execute(`
            UPDATE warehouse_images 
            SET is_primary = FALSE 
            WHERE warehouse_id = (SELECT warehouse_id FROM warehouse_images WHERE id = ?)
          `, [id]);
        }
        updateFields.push('is_primary = ?');
        updateValues.push(data.is_primary);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE warehouse_images 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete warehouse image
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        DELETE FROM warehouse_images WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Set image as primary
   */
  static async setPrimary(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      // Get warehouse ID for this image
      const [imageRows] = await connection.execute(`
        SELECT warehouse_id FROM warehouse_images WHERE id = ?
      `, [id]);

      if ((imageRows as any[]).length === 0) {
        return false;
      }

      const warehouseId = (imageRows as any[])[0].warehouse_id;

      // Unset all other primary images for this warehouse
      await connection.execute(`
        UPDATE warehouse_images 
        SET is_primary = FALSE 
        WHERE warehouse_id = ?
      `, [warehouseId]);

      // Set this image as primary
      const [result] = await connection.execute(`
        UPDATE warehouse_images 
        SET is_primary = TRUE 
        WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Map database row to WarehouseImage object
   */
  private static mapRowToWarehouseImage(row: any): WarehouseImageType {
    return {
      id: row.id,
      warehouse_id: row.warehouse_id,
      image_url: row.image_url,
      image_name: row.image_name,
      image_type: row.image_type,
      image_size: row.image_size,
      is_primary: Boolean(row.is_primary),
      created_at: row.created_at
    };
  }
}

export default WarehouseImageModel;
