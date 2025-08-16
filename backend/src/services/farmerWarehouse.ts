import { pool } from '../config/database';
import FarmerWarehouseRequestModel from '../models/FarmerWarehouseRequest';
import WarehouseInventoryModel from '../models/WarehouseInventory';
import MarketPriceModel from '../models/MarketPrice';
import ExpiryNotificationModel from '../models/ExpiryNotification';
import { 
  FarmerWarehouseRequestCreate, 
  FarmerWarehouseRequestUpdate,
  WarehouseInventoryCreate,
  MarketPriceCreate,
  ExpiryNotificationCreate
} from '../types';
import NotificationService from './notification';

class FarmerWarehouseService {
  /**
   * Generate QR code data for warehouse request
   */
  private static generateQRCodeData(requestId: number, farmerId: number, warehouseId: number): string {
    const qrData = {
      request_id: requestId,
      farmer_id: farmerId,
      warehouse_id: warehouseId,
      timestamp: new Date().toISOString(),
      type: 'warehouse_request'
    };
    return JSON.stringify(qrData);
  }

  /**
   * Generate QR code URL (placeholder - in production, this would generate actual QR code)
   */
  private static generateQRCodeURL(qrData: string): string {
    // In production, this would call a QR code generation service
    // For now, we'll create a URL that can be used to display the QR code
    const encodedData = encodeURIComponent(qrData);
    return `https://agriconnect.lk/qr/${encodedData}`;
  }

  /**
   * Create a new warehouse request (farmer)
   */
  static async createWarehouseRequest(data: FarmerWarehouseRequestCreate): Promise<number> {
    // Validate storage duration (max 90 days for temporary storage)
    if (data.storage_duration_days > 90) {
      throw new Error('Storage duration cannot exceed 90 days for temporary storage');
    }

    // Check if farmer already has a pending request for the same warehouse
    const existingRequests = await FarmerWarehouseRequestModel.search({
      farmer_id: data.farmer_id,
      warehouse_id: data.warehouse_id,
      status: 'pending'
    });

    if (existingRequests.data.length > 0) {
      throw new Error('You already have a pending request for this warehouse');
    }

    return await FarmerWarehouseRequestModel.create(data);
  }

  /**
   * Get farmer's warehouse requests
   */
  static async getFarmerRequests(farmerId: number, page: number = 1, limit: number = 10) {
    return await FarmerWarehouseRequestModel.getByFarmer(farmerId, page, limit);
  }

  /**
   * Get all warehouse requests (Admin only)
   */
  static async getAllRequests(page: number = 1, limit: number = 10, status?: string) {
    return await FarmerWarehouseRequestModel.getAll(page, limit, status);
  }

  /**
   * Get farmer's storage items
   */
  static async getFarmerStorage(farmerId: number, page: number = 1, limit: number = 10) {
    return await WarehouseInventoryModel.getByFarmer(farmerId, page, limit);
  }

  /**
   * Get all storage items (Admin only)
   */
  static async getAllStorage(page: number = 1, limit: number = 10) {
    return await WarehouseInventoryModel.getAll(page, limit);
  }

  /**
   * Get overall storage summary (Admin only)
   */
  static async getAllStorageSummary() {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        SELECT 
          COUNT(*) as total_items,
          SUM(quantity) as total_quantity,
          COUNT(DISTINCT farmer_id) as total_farmers,
          COUNT(DISTINCT warehouse_id) as total_warehouses
        FROM warehouse_inventory
        WHERE quantity > 0
      `);
      
      return (result as any[])[0];
    } finally {
      connection.release();
    }
  }

  /**
   * Get all expiring items (Admin only)
   */
  static async getAllExpiringItems(days: number = 30) {
    return await WarehouseInventoryModel.getExpiringItems(days);
  }

  /**
   * Get all expired items (Admin only)
   */
  static async getAllExpiredItems() {
    return await WarehouseInventoryModel.getExpiredItems();
  }

  /**
   * Get all notifications (Admin only)
   */
  static async getAllNotifications(page: number = 1, limit: number = 10) {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total FROM expiry_notifications
      `);

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get notifications with pagination
      const [rows] = await connection.execute(`
        SELECT 
          en.*,
          wi.item_name,
          wi.farmer_id,
          u.name as farmer_name,
          u.phone as farmer_phone
        FROM expiry_notifications en
        LEFT JOIN warehouse_inventory wi ON en.warehouse_inventory_id = wi.id
        LEFT JOIN users u ON wi.farmer_id = u.id
        ORDER BY en.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      return {
        data: rows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Get farmer's storage summary
   */
  static async getFarmerStorageSummary(farmerId: number) {
    return await WarehouseInventoryModel.getFarmerStorageSummary(farmerId);
  }

  /**
   * Get farmer's expiring items
   */
  static async getFarmerExpiringItems(farmerId: number, days: number = 30) {
    const allItems = await WarehouseInventoryModel.getByFarmer(farmerId, 1, 1000);
    const expiringItems = allItems.data.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= days && daysUntilExpiry >= 0;
    });

    return expiringItems;
  }

  /**
   * Get farmer's expired items
   */
  static async getFarmerExpiredItems(farmerId: number) {
    const allItems = await WarehouseInventoryModel.getByFarmer(farmerId, 1, 1000);
    const expiredItems = allItems.data.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate < new Date();
    });

    return expiredItems;
  }

  /**
   * Approve farmer warehouse request (admin)
   */
  static async approveWarehouseRequest(requestId: number, adminId: number, adminNotes?: string): Promise<boolean> {
    const request = await FarmerWarehouseRequestModel.findById(requestId);
    if (!request) {
      throw new Error('Warehouse request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not in pending status');
    }

    // Generate QR code data and URL
    const qrData = this.generateQRCodeData(requestId, request.farmer_id, request.warehouse_id);
    const qrCodeURL = this.generateQRCodeURL(qrData);

    // Update request status with QR code information
    const updated = await FarmerWarehouseRequestModel.update(requestId, {
      status: 'approved',
      admin_notes: adminNotes,
      approved_by: adminId,
      approved_at: new Date(),
      qr_code_data: qrData,
      qr_code_url: qrCodeURL
    });

    if (updated) {
      // Send SMS notification to farmer with QR code URL
      try {
        const smsMessage = `Your warehouse request for ${request.item_name} has been APPROVED! 🎉\n\nWarehouse: ${request.warehouse_name}\nQuantity: ${request.quantity} kg\nDuration: ${request.storage_duration_days} days\n\nQR Code: ${qrCodeURL}\n\nShow this QR code when visiting the warehouse.`;
        
        await NotificationService.sendSMS({
          recipient: request.farmer_phone || '',
          message: smsMessage
        });
      } catch (error) {
        console.error('Failed to send SMS notification:', error);
      }
    }

    return updated;
  }

  /**
   * Reject farmer warehouse request (admin)
   */
  static async rejectWarehouseRequest(requestId: number, adminId: number, rejectionReason: string, adminNotes?: string): Promise<boolean> {
    const request = await FarmerWarehouseRequestModel.findById(requestId);
    if (!request) {
      throw new Error('Warehouse request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not in pending status');
    }

    // Update request status
    const updated = await FarmerWarehouseRequestModel.update(requestId, {
      status: 'rejected',
      rejection_reason: rejectionReason,
      admin_notes: adminNotes,
      approved_by: adminId,
      approved_at: new Date()
    });

    if (updated) {
      // Send SMS notification to farmer about rejection
      try {
        const smsMessage = `Your warehouse request for ${request.item_name} has been REJECTED ❌\n\nWarehouse: ${request.warehouse_name}\nReason: ${rejectionReason}\n\nPlease contact admin for more details or submit a new request.`;
        
        await NotificationService.sendSMS({
          recipient: request.farmer_phone || '',
          message: smsMessage
        });
      } catch (error) {
        console.error('Failed to send SMS notification:', error);
      }
    }

    return updated;
  }

  /**
   * Add farmer's items to warehouse inventory (admin)
   */
  static async addFarmerItemsToWarehouse(data: WarehouseInventoryCreate): Promise<number> {
    // Set default expiry date if not provided (90 days from storage)
    if (!data.expiry_date) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90);
      data.expiry_date = expiryDate;
    }

    // Set storage type and duration
    const storageDuration = Math.ceil((new Date(data.expiry_date).getTime() - new Date(data.stored_date).getTime()) / (1000 * 60 * 60 * 24));
    data.storage_type = storageDuration <= 90 ? 'temporary' : 'long_term';
    data.storage_duration_days = storageDuration;

    // Get current market price for the item
    const marketPrice = await MarketPriceModel.getCurrentPrice(data.item_name);
    if (marketPrice) {
      data.current_market_price = marketPrice.current_price;
    }

    // Set default expiry action
    data.auto_sell_on_expiry = true;
    data.expiry_action = 'auto_sell';

    return await WarehouseInventoryModel.create(data);
  }

  /**
   * Update market price for farmer's items
   */
  static async updateMarketPrice(itemName: string, newPrice: number, source: string = 'admin_update'): Promise<number> {
    // Find the market item by name
    const MarketItemModel = (await import('../models/MarketItem')).default;
    const item = await MarketItemModel.findByName(itemName);
    
    if (!item) {
      throw new Error('Market item not found');
    }
    
    // Create or update the market price
    const priceData = {
      market_item_id: item.id,
      current_price: newPrice,
      price_date: new Date(),
      source,
      notes: `Price updated to Rs. ${newPrice} per ${item.unit}`
    };
    
    const priceId = await MarketPriceModel.upsertPrice(priceData);

    // Update all inventory items with this item name
    const allItems = await WarehouseInventoryModel.search({ item_name: itemName, page: 1, limit: 1000 });
    for (const inventoryItem of allItems.data) {
      await WarehouseInventoryModel.updateMarketPrice(inventoryItem.id, newPrice);
    }

    return priceId;
  }

  /**
   * Handle automatic expiry processing
   */
  static async processExpiredItems(): Promise<any[]> {
    // Get all expired items
    const expiredItems = await WarehouseInventoryModel.getExpiredItems();
    const processedItems: any[] = [];
    const notifications: ExpiryNotificationCreate[] = [];

    for (const item of expiredItems) {
      if (item.auto_sell_on_expiry && item.expiry_action === 'auto_sell') {
        // Auto-sell expired items
        const soldQuantity = item.quantity;
        const currentPrice = item.current_market_price || 0;
        const totalValue = soldQuantity * currentPrice;

        // Update inventory to mark as sold
        await WarehouseInventoryModel.update(item.id, {
          quantity: 0,
          notes: `${item.notes || ''} | Auto-sold on ${new Date().toISOString().split('T')[0]} at Rs. ${currentPrice} per kg`
        });

        processedItems.push({
          id: item.id,
          action: 'auto_sold',
          quantity: soldQuantity,
          price: currentPrice,
          total_value: totalValue,
          processed_at: new Date()
        });

        // Create notification for farmer
        if (item.farmer_id) {
          notifications.push({
            inventory_id: item.id,
            farmer_id: item.farmer_id,
            notification_type: 'auto_sold',
            message: `Your ${item.item_name} (${soldQuantity} kg) has been automatically sold at Rs. ${currentPrice} per kg due to expiry. Total value: Rs. ${totalValue}`
          });
        }
      } else {
        // Create expiry notification for farmer
        if (item.farmer_id) {
          notifications.push({
            inventory_id: item.id,
            farmer_id: item.farmer_id,
            notification_type: 'expired',
            message: `Your ${item.item_name} (${item.quantity} kg) has expired and requires immediate attention.`
          });
        }
      }
    }

    // Create bulk notifications
    if (notifications.length > 0) {
      await ExpiryNotificationModel.createBulkNotifications(notifications);
    }

    return processedItems;
  }

  /**
   * Send expiry notifications to farmers
   */
  static async sendExpiryNotifications(): Promise<number> {
    // Get items expiring in the next 7 days
    const expiringItems = await WarehouseInventoryModel.getExpiringItems(7);
    const notifications: ExpiryNotificationCreate[] = [];

    for (const item of expiringItems) {
      if (item.farmer_id) {
        const daysUntilExpiry = Math.ceil((new Date(item.expiry_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        notifications.push({
          inventory_id: item.id,
          farmer_id: item.farmer_id,
          notification_type: 'expiring_soon',
          message: `Your ${item.item_name} (${item.quantity} kg) will expire in ${daysUntilExpiry} days. Please take action to avoid automatic sale.`
        });
      }
    }

    if (notifications.length > 0) {
      const notificationIds = await ExpiryNotificationModel.createBulkNotifications(notifications);
      
      // Send SMS notifications
      for (const notification of notifications) {
        try {
          await NotificationService.sendSMS({
            recipient: notification.message, // This should be the farmer's phone number
            message: notification.message
          });
        } catch (error) {
          console.error('Failed to send SMS notification:', error);
        }
      }

      return notificationIds.length;
    }

    return 0;
  }

  /**
   * Get farmer's notifications
   */
  static async getFarmerNotifications(farmerId: number, page: number = 1, limit: number = 10) {
    return await ExpiryNotificationModel.getByFarmer(farmerId, page, limit);
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: number): Promise<boolean> {
    return await ExpiryNotificationModel.markAsRead(notificationId);
  }

  /**
   * Get market prices for items
   */
  static async getMarketPrices(marketItemId?: number, page: number = 1, limit: number = 10) {
    if (marketItemId) {
      return await MarketPriceModel.searchByMarketItemId(marketItemId, page, limit);
    }
    return await MarketPriceModel.getAll(page, limit);
  }

  /**
   * Get price history for an item
   */
  static async getPriceHistory(itemName: string, days: number = 30) {
    return await MarketPriceModel.getPriceHistory(itemName, days);
  }

  /**
   * Create a new market price
   */
  static async createMarketPrice(data: any): Promise<number> {
    // Validate that the market item exists
    const MarketItemModel = (await import('../models/MarketItem')).default;
    const item = await MarketItemModel.findById(data.market_item_id);
    if (!item) {
      throw new Error('Market item not found');
    }
    
    return await MarketPriceModel.create(data);
  }

  /**
   * Update market price by ID
   */
  static async updateMarketPriceById(id: number, data: any): Promise<boolean> {
    return await MarketPriceModel.update(id, data);
  }

  /**
   * Delete market price by ID
   */
  static async deleteMarketPrice(id: number): Promise<boolean> {
    return await MarketPriceModel.delete(id);
  }

  /**
   * Get QR code information for a request
   */
  static async getQRCodeInfo(requestId: number) {
    const request = await FarmerWarehouseRequestModel.findById(requestId);
    if (!request) {
      throw new Error('Warehouse request not found');
    }

    if (request.status !== 'approved') {
      throw new Error('Request is not approved');
    }

    return {
      qr_code_url: request.qr_code_url,
      qr_code_data: request.qr_code_data,
      request_details: {
        id: request.id,
        item_name: request.item_name,
        quantity: request.quantity,
        warehouse_name: request.warehouse_name,
        approved_at: request.approved_at
      }
    };
  }
}

export default FarmerWarehouseService;
