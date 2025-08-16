import { WarehouseInventory as WarehouseInventoryType, WarehouseInventoryCreate, WarehouseInventoryUpdate, WarehouseInventorySearchParams, PaginatedResponse } from '../types';
import { pool } from '../config/database';

class WarehouseInventoryModel {
  /**
   * Create a new inventory item
   */
  static async create(data: WarehouseInventoryCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO warehouse_inventory (
          warehouse_id, item_name, quantity, location, stored_date,
          product_owner, item_condition, expiry_date, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.warehouse_id,
        data.item_name,
        data.quantity,
        data.location || null,
        data.stored_date,
        data.product_owner || null,
        data.item_condition || 'good',
        data.expiry_date || null,
        data.notes || null
      ]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find inventory item by ID
   */
  static async findById(id: number): Promise<WarehouseInventoryType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          wi.*,
          w.name as warehouse_name
        FROM warehouse_inventory wi
        LEFT JOIN warehouses w ON wi.warehouse_id = w.id
        WHERE wi.id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToWarehouseInventory((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update inventory item
   */
  static async update(id: number, data: WarehouseInventoryUpdate): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.item_name !== undefined) {
        updateFields.push('item_name = ?');
        updateValues.push(data.item_name);
      }

      if (data.quantity !== undefined) {
        updateFields.push('quantity = ?');
        updateValues.push(data.quantity);
      }

      if (data.location !== undefined) {
        updateFields.push('location = ?');
        updateValues.push(data.location);
      }

      if (data.stored_date !== undefined) {
        updateFields.push('stored_date = ?');
        updateValues.push(data.stored_date);
      }

      if (data.product_owner !== undefined) {
        updateFields.push('product_owner = ?');
        updateValues.push(data.product_owner);
      }

      if (data.item_condition !== undefined) {
        updateFields.push('item_condition = ?');
        updateValues.push(data.item_condition);
      }

      if (data.expiry_date !== undefined) {
        updateFields.push('expiry_date = ?');
        updateValues.push(data.expiry_date);
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
        UPDATE warehouse_inventory 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete inventory item
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        DELETE FROM warehouse_inventory WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Search inventory items with filters
   */
  static async search(params: WarehouseInventorySearchParams): Promise<PaginatedResponse<WarehouseInventoryType>> {
    const connection = await pool.getConnection();
    try {
      const page = Math.max(1, parseInt(String(params.page || 1)));
      const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10))));
      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      if (params.warehouse_id) {
        whereClause += ' AND wi.warehouse_id = ?';
        queryParams.push(parseInt(String(params.warehouse_id)));
      }

      if (params.farmer_id) {
        whereClause += ' AND wi.farmer_id = ?';
        queryParams.push(parseInt(String(params.farmer_id)));
      }

      if (params.item_name) {
        whereClause += ' AND wi.item_name LIKE ?';
        queryParams.push(`%${params.item_name}%`);
      }

      if (params.item_condition) {
        whereClause += ' AND wi.item_condition = ?';
        queryParams.push(params.item_condition);
      }

      if (params.product_owner) {
        whereClause += ' AND wi.product_owner LIKE ?';
        queryParams.push(`%${params.product_owner}%`);
      }

      if (params.storage_type) {
        whereClause += ' AND wi.storage_type = ?';
        queryParams.push(params.storage_type);
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM warehouse_inventory wi
        ${whereClause}
      `, queryParams);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get inventory items with pagination - use query() for LIMIT/OFFSET
      const [rows] = await connection.query(`
        SELECT 
          wi.*,
          w.name as warehouse_name,
          w.address as warehouse_address
        FROM warehouse_inventory wi
        LEFT JOIN warehouses w ON wi.warehouse_id = w.id
        ${whereClause}
        ORDER BY wi.stored_date DESC, wi.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `, queryParams);

      const inventoryItems = (rows as any[]).map(row => this.mapRowToWarehouseInventory(row));

      return {
        data: inventoryItems,
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
   * Get all inventory items with pagination
   */
  static async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseInventoryType>> {
    return this.search({ page, limit });
  }

  /**
   * Get inventory items by warehouse
   */
  static async getByWarehouse(warehouseId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseInventoryType>> {
    return this.search({ warehouse_id: warehouseId, page, limit });
  }

  /**
   * Get inventory items by condition
   */
  static async getByCondition(condition: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseInventoryType>> {
    return this.search({ item_condition: condition as 'good' | 'moderate' | 'poor', page, limit });
  }

  /**
   * Get inventory items by product owner
   */
  static async getByProductOwner(owner: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<WarehouseInventoryType>> {
    return this.search({ product_owner: owner, page, limit });
  }

  /**
   * Get expiring items
   */
  static async getExpiringItems(days: number = 30) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          wi.*,
          w.name as warehouse_name,
          w.address as warehouse_address
        FROM warehouse_inventory wi
        LEFT JOIN warehouses w ON wi.warehouse_id = w.id
        WHERE wi.expiry_date IS NOT NULL 
        AND wi.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
        AND wi.expiry_date >= CURDATE()
        ORDER BY wi.expiry_date ASC
      `, [days]);

      return (rows as any[]).map(row => this.mapRowToWarehouseInventory(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get expired items that need action
   */
  static async getExpiredItems() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          wi.*,
          w.name as warehouse_name,
          w.address as warehouse_address
        FROM warehouse_inventory wi
        LEFT JOIN warehouses w ON wi.warehouse_id = w.id
        WHERE wi.expiry_date IS NOT NULL 
        AND wi.expiry_date < CURDATE()
        AND wi.quantity > 0
        ORDER BY wi.expiry_date ASC
      `);

      return (rows as any[]).map(row => this.mapRowToWarehouseInventory(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get items by farmer
   */
  static async getByFarmer(farmerId: number, page: number = 1, limit: number = 10) {
    return this.search({ farmer_id: farmerId, page, limit });
  }

  /**
   * Get items by expiry status
   */
  static async getByExpiryStatus(status: 'active' | 'expiring_soon' | 'expired' | 'auto_sold', page: number = 1, limit: number = 10) {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;
      let whereClause = '';

      switch (status) {
        case 'active':
          whereClause = 'WHERE (wi.expiry_date IS NULL OR wi.expiry_date > DATE_ADD(CURDATE(), INTERVAL 30 DAY)) AND wi.quantity > 0';
          break;
        case 'expiring_soon':
          whereClause = 'WHERE wi.expiry_date IS NOT NULL AND wi.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND wi.expiry_date >= CURDATE() AND wi.quantity > 0';
          break;
        case 'expired':
          whereClause = 'WHERE wi.expiry_date IS NOT NULL AND wi.expiry_date < CURDATE() AND wi.quantity > 0';
          break;
        case 'auto_sold':
          whereClause = 'WHERE wi.expiry_date IS NOT NULL AND wi.expiry_date < CURDATE() AND wi.quantity = 0';
          break;
      }

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total FROM warehouse_inventory wi ${whereClause}
      `);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get items with pagination - use query() for LIMIT/OFFSET
      const [rows] = await connection.query(`
        SELECT 
          wi.*,
          w.name as warehouse_name,
          w.address as warehouse_address
        FROM warehouse_inventory wi
        LEFT JOIN warehouses w ON wi.warehouse_id = w.id
        ${whereClause}
        ORDER BY wi.expiry_date ASC, wi.stored_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      const items = (rows as any[]).map(row => this.mapRowToWarehouseInventory(row));

      return {
        data: items,
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
   * Handle automatic expiry actions
   */
  static async handleExpiredItems() {
    const connection = await pool.getConnection();
    try {
      // Get all expired items
      const expiredItems = await this.getExpiredItems();
      const processedItems: any[] = [];

      for (const item of expiredItems) {
        if (item.auto_sell_on_expiry && item.expiry_action === 'auto_sell') {
          // Auto-sell expired items at current market price
          const soldQuantity = item.quantity;
          const currentPrice = item.current_market_price || 0;
          const totalValue = soldQuantity * currentPrice;

          // Update inventory to mark as sold
          await connection.execute(`
            UPDATE warehouse_inventory 
            SET quantity = 0, notes = CONCAT(COALESCE(notes, ''), ' | Auto-sold on ', CURDATE(), ' at Rs. ', ?)
            WHERE id = ?
          `, [currentPrice, item.id]);

          processedItems.push({
            id: item.id,
            action: 'auto_sold',
            quantity: soldQuantity,
            price: currentPrice,
            total_value: totalValue,
            processed_at: new Date()
          });
        }
      }

      return processedItems;
    } finally {
      connection.release();
    }
  }

  /**
   * Update market price for an item
   */
  static async updateMarketPrice(inventoryId: number, newPrice: number) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        UPDATE warehouse_inventory 
        SET current_market_price = ?, last_price_update = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newPrice, inventoryId]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get storage summary for a farmer
   */
  static async getFarmerStorageSummary(farmerId: number) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          COUNT(*) as total_items,
          SUM(quantity) as total_quantity,
          SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date < CURDATE() THEN quantity ELSE 0 END) as expired_quantity,
          SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND expiry_date >= CURDATE() THEN quantity ELSE 0 END) as expiring_soon_quantity,
          SUM(CASE WHEN expiry_date IS NULL OR expiry_date > DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN quantity ELSE 0 END) as active_quantity,
          SUM(CASE WHEN auto_sell_on_expiry = TRUE THEN quantity * COALESCE(current_market_price, 0) ELSE 0 END) as potential_value
        FROM warehouse_inventory 
        WHERE farmer_id = ? AND quantity > 0
      `, [farmerId]);

      if ((rows as any[]).length === 0) {
        return {
          total_items: 0,
          total_quantity: 0,
          expired_quantity: 0,
          expiring_soon_quantity: 0,
          active_quantity: 0,
          potential_value: 0
        };
      }

      return (rows as any[])[0];
    } finally {
      connection.release();
    }
  }

  /**
   * Map database row to WarehouseInventory object
   */
  private static mapRowToWarehouseInventory(row: any): WarehouseInventoryType {
    return {
      id: row.id,
      warehouse_id: row.warehouse_id,
      item_name: row.item_name,
      quantity: row.quantity,
      location: row.location,
      stored_date: row.stored_date,
      product_owner: row.product_owner,
      item_condition: row.item_condition,
      expiry_date: row.expiry_date,
      notes: row.notes,
      farmer_id: row.farmer_id,
      farmer_name: row.farmer_name,
      farmer_phone: row.farmer_phone,
      storage_type: row.storage_type,
      storage_duration_days: row.storage_duration_days,
      current_market_price: row.current_market_price,
      auto_sell_on_expiry: row.auto_sell_on_expiry,
      expiry_action: row.expiry_action,
      last_price_update: row.last_price_update,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default WarehouseInventoryModel;
