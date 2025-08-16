import { ExpiryNotification as ExpiryNotificationType, ExpiryNotificationCreate, PaginatedResponse } from '../types';
import { pool } from '../config/database';

class ExpiryNotificationModel {
  /**
   * Create a new expiry notification
   */
  static async create(data: ExpiryNotificationCreate): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO expiry_notifications (
          inventory_id, farmer_id, notification_type, message, is_read
        ) VALUES (?, ?, ?, ?, FALSE)
      `, [
        data.inventory_id,
        data.farmer_id,
        data.notification_type,
        data.message
      ]);

      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  /**
   * Find expiry notification by ID
   */
  static async findById(id: number): Promise<ExpiryNotificationType | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          en.*,
          wi.item_name,
          wi.quantity,
          wi.expiry_date,
          w.name as warehouse_name
        FROM expiry_notifications en
        LEFT JOIN warehouse_inventory wi ON en.inventory_id = wi.id
        LEFT JOIN warehouses w ON wi.warehouse_id = w.id
        WHERE en.id = ?
      `, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapRowToExpiryNotification((rows as any[])[0]);
    } finally {
      connection.release();
    }
  }

  /**
   * Update expiry notification
   */
  static async update(id: number, data: Partial<ExpiryNotificationType>): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.is_read !== undefined) {
        updateFields.push('is_read = ?');
        updateValues.push(data.is_read);
      }

      if (data.message !== undefined) {
        updateFields.push('message = ?');
        updateValues.push(data.message);
      }

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const [result] = await connection.execute(`
        UPDATE expiry_notifications 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: number): Promise<boolean> {
    return this.update(id, { is_read: true });
  }

  /**
   * Delete expiry notification
   */
  static async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        DELETE FROM expiry_notifications WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all notifications by farmer
   */
  static async getByFarmer(farmerId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<ExpiryNotificationType>> {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total FROM expiry_notifications WHERE farmer_id = ?
      `, [farmerId]);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get notifications with pagination
      const [rows] = await connection.execute(`
        SELECT 
          en.*,
          wi.item_name,
          wi.quantity,
          wi.expiry_date,
          w.name as warehouse_name
        FROM expiry_notifications en
        LEFT JOIN warehouse_inventory wi ON en.inventory_id = wi.id
        LEFT JOIN warehouses w ON wi.warehouse_id = w.id
        WHERE en.farmer_id = ?
        ORDER BY en.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `, [farmerId]);

      const notifications = (rows as any[]).map(row => this.mapRowToExpiryNotification(row));

      return {
        data: notifications,
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
   * Get unread notifications by farmer
   */
  static async getUnreadByFarmer(farmerId: number): Promise<ExpiryNotificationType[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT 
          en.*,
          wi.item_name,
          wi.quantity,
          wi.expiry_date,
          w.name as warehouse_name
        FROM expiry_notifications en
        LEFT JOIN warehouse_inventory wi ON en.inventory_id = wi.id
        LEFT JOIN warehouses w ON wi.warehouse_id = w.id
        WHERE en.farmer_id = ? AND en.is_read = FALSE
        ORDER BY en.created_at DESC
      `, [farmerId]);

      return (rows as any[]).map(row => this.mapRowToExpiryNotification(row));
    } finally {
      connection.release();
    }
  }

  /**
   * Get notifications by type
   */
  static async getByType(notificationType: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<ExpiryNotificationType>> {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total FROM expiry_notifications WHERE notification_type = ?
      `, [notificationType]);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get notifications with pagination
      const [rows] = await connection.execute(`
        SELECT 
          en.*,
          wi.item_name,
          wi.quantity,
          wi.expiry_date,
          w.name as warehouse_name
        FROM expiry_notifications en
        LEFT JOIN warehouse_inventory wi ON en.inventory_id = wi.id
        LEFT JOIN warehouses w ON wi.warehouse_id = w.id
        WHERE en.notification_type = ?
        ORDER BY en.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `, [notificationType]);

      const notifications = (rows as any[]).map(row => this.mapRowToExpiryNotification(row));

      return {
        data: notifications,
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
   * Create bulk notifications for expiring items
   */
  static async createBulkNotifications(notifications: ExpiryNotificationCreate[]): Promise<number[]> {
    const connection = await pool.getConnection();
    try {
      const notificationIds: number[] = [];
      
      for (const notification of notifications) {
        const [result] = await connection.execute(`
          INSERT INTO expiry_notifications (
            inventory_id, farmer_id, notification_type, message, is_read
          ) VALUES (?, ?, ?, ?, FALSE)
        `, [
          notification.inventory_id,
          notification.farmer_id,
          notification.notification_type,
          notification.message
        ]);
        
        notificationIds.push((result as any).insertId);
      }
      
      return notificationIds;
    } finally {
      connection.release();
    }
  }

  /**
   * Clean up old notifications (older than 90 days)
   */
  static async cleanupOldNotifications(): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        DELETE FROM expiry_notifications 
        WHERE created_at < DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      `);

      return (result as any).affectedRows;
    } finally {
      connection.release();
    }
  }

  /**
   * Map database row to ExpiryNotification object
   */
  private static mapRowToExpiryNotification(row: any): ExpiryNotificationType {
    return {
      id: row.id,
      inventory_id: row.inventory_id,
      farmer_id: row.farmer_id,
      notification_type: row.notification_type,
      message: row.message,
      is_read: Boolean(row.is_read),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export default ExpiryNotificationModel;
