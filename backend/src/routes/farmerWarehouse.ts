import express from 'express';
import { authenticateToken, requireFarmer, requireAdmin, requireFarmerOrAdmin } from '../middleware/auth';
import FarmerWarehouseService from '../services/farmerWarehouse';
import ValidationService from '../services/validation';

const router = express.Router();

// ==================== FARMER WAREHOUSE REQUESTS ====================

// Create warehouse request (Farmer only)
router.post('/requests', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const farmerId = (req as any).user.userId;
    const requestData = { ...req.body, farmer_id: farmerId };
    
    const validation = ValidationService.validateFarmerWarehouseRequest(requestData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const requestId = await FarmerWarehouseService.createWarehouseRequest(requestData);
    
    return res.status(201).json({
      success: true,
      message: 'Warehouse request created successfully',
      data: { id: requestId }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create warehouse request'
    });
  }
});

// Get farmer's warehouse requests (Farmer only)
router.get('/requests', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const farmerId = (req as any).user.userId;
    const { page, limit, status } = req.query;
    
    const requests = await FarmerWarehouseService.getFarmerRequests(
      farmerId,
      parseInt(String(page || 1)),
      parseInt(String(limit || 10))
    );
    
    return res.json({
      success: true,
      message: 'Warehouse requests retrieved successfully',
      data: requests
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve warehouse requests'
    });
  }
});

// Get QR code information for approved request (Farmer or Admin)
router.get('/requests/:id/qr-code', authenticateToken, requireFarmerOrAdmin, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const qrInfo = await FarmerWarehouseService.getQRCodeInfo(requestId);
    
    return res.json({
      success: true,
      message: 'QR code information retrieved successfully',
      data: qrInfo
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve QR code information'
    });
  }
});

// Get warehouse request by ID (Farmer or Admin)
router.get('/requests/:id', authenticateToken, requireFarmerOrAdmin, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const request = await FarmerWarehouseService.getFarmerRequests(requestId, 1, 1);
    
    if (request.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse request not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Warehouse request retrieved successfully',
      data: request.data[0]
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || 'Warehouse request not found'
    });
  }
});

// Approve warehouse request (Admin only)
router.post('/requests/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const adminId = (req as any).user.userId;
    const { admin_notes } = req.body;
    
    const approved = await FarmerWarehouseService.approveWarehouseRequest(requestId, adminId, admin_notes);
    
    if (approved) {
      return res.json({
        success: true,
        message: 'Warehouse request approved successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to approve warehouse request'
      });
    }
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to approve warehouse request'
    });
  }
});

// Reject warehouse request (Admin only)
router.post('/requests/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const adminId = (req as any).user.userId;
    const { rejection_reason, admin_notes } = req.body;
    
    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const rejected = await FarmerWarehouseService.rejectWarehouseRequest(requestId, adminId, rejection_reason, admin_notes);
    
    if (rejected) {
      return res.json({
        success: true,
        message: 'Warehouse request rejected successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to reject warehouse request'
      });
    }
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to reject warehouse request'
    });
  }
});

// ==================== FARMER STORAGE MANAGEMENT ====================

// Get farmer's storage items (Farmer only)
router.get('/storage', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const farmerId = (req as any).user.userId;
    const { page, limit } = req.query;
    
    const storage = await FarmerWarehouseService.getFarmerStorage(
      farmerId,
      parseInt(String(page || 1)),
      parseInt(String(limit || 10))
    );
    
    return res.json({
      success: true,
      message: 'Storage items retrieved successfully',
      data: storage
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve storage items'
    });
  }
});

// Get farmer's storage summary (Farmer only)
router.get('/storage/summary', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const farmerId = (req as any).user.userId;
    const summary = await FarmerWarehouseService.getFarmerStorageSummary(farmerId);
    
    return res.json({
      success: true,
      message: 'Storage summary retrieved successfully',
      data: summary
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve storage summary'
    });
  }
});

// Get farmer's expiring items (Farmer only)
router.get('/storage/expiring', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const farmerId = (req as any).user.userId;
    const { days } = req.query;
    
    const expiringItems = await FarmerWarehouseService.getFarmerExpiringItems(
      farmerId,
      parseInt(String(days || 30))
    );
    
    return res.json({
      success: true,
      message: 'Expiring items retrieved successfully',
      data: expiringItems
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve expiring items'
    });
  }
});

// Get farmer's expired items (Farmer only)
router.get('/storage/expired', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const farmerId = (req as any).user.userId;
    const expiredItems = await FarmerWarehouseService.getFarmerExpiredItems(farmerId);
    
    return res.json({
      success: true,
      message: 'Expired items retrieved successfully',
      data: expiredItems
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve expired items'
    });
  }
});

// Add farmer's items to warehouse (Admin only)
router.post('/storage', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validation = ValidationService.validateWarehouseInventory(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const inventoryId = await FarmerWarehouseService.addFarmerItemsToWarehouse(req.body);
    
    return res.status(201).json({
      success: true,
      message: 'Items added to warehouse successfully',
      data: { id: inventoryId }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to add items to warehouse'
    });
  }
});

// ==================== NOTIFICATIONS ====================

// Get farmer's notifications (Farmer only)
router.get('/notifications', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const farmerId = (req as any).user.userId;
    const { page, limit } = req.query;
    
    const notifications = await FarmerWarehouseService.getFarmerNotifications(
      farmerId,
      parseInt(String(page || 1)),
      parseInt(String(limit || 10))
    );
    
    return res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve notifications'
    });
  }
});

// Mark notification as read (Farmer only)
router.put('/notifications/:id/read', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const marked = await FarmerWarehouseService.markNotificationAsRead(notificationId);
    
    if (marked) {
      return res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to mark notification as read'
    });
  }
});

// ==================== MARKET PRICES ====================

// Get market prices (Public)
router.get('/market-prices', async (req, res) => {
  try {
    const { item_name, page, limit } = req.query;
    
    const prices = await FarmerWarehouseService.getMarketPrices(
      item_name as string,
      parseInt(String(page || 1)),
      parseInt(String(limit || 10))
    );
    
    return res.json({
      success: true,
      message: 'Market prices retrieved successfully',
      data: prices
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve market prices'
    });
  }
});

// Get price history for an item (Public)
router.get('/market-prices/:itemName/history', async (req, res) => {
  try {
    const { itemName } = req.params;
    const { days } = req.query;
    
    const history = await FarmerWarehouseService.getPriceHistory(
      itemName,
      parseInt(String(days || 30))
    );
    
    return res.json({
      success: true,
      message: 'Price history retrieved successfully',
      data: history
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve price history'
    });
  }
});

// Update market price (Admin only)
router.post('/market-prices', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { item_name, current_price, source } = req.body;
    
    if (!item_name || !current_price) {
      return res.status(400).json({
        success: false,
        message: 'Item name and current price are required'
      });
    }
    
    const priceId = await FarmerWarehouseService.updateMarketPrice(item_name, current_price, source);
    
    return res.json({
      success: true,
      message: 'Market price updated successfully',
      data: { id: priceId }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update market price'
    });
  }
});

// ==================== ADMIN OPERATIONS ====================

// Process expired items (Admin only)
router.post('/admin/process-expired', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const processedItems = await FarmerWarehouseService.processExpiredItems();
    
    return res.json({
      success: true,
      message: 'Expired items processed successfully',
      data: {
        processed_count: processedItems.length,
        processed_items: processedItems
      }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to process expired items'
    });
  }
});

// Send expiry notifications (Admin only)
router.post('/admin/send-notifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const notificationCount = await FarmerWarehouseService.sendExpiryNotifications();
    
    return res.json({
      success: true,
      message: 'Expiry notifications sent successfully',
      data: {
        notifications_sent: notificationCount
      }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to send expiry notifications'
    });
  }
});

// Get all pending requests (Admin only)
router.get('/admin/requests/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page, limit } = req.query;
    
    const requests = await FarmerWarehouseService.getFarmerRequests(
      0, // Get all requests
      parseInt(String(page || 1)),
      parseInt(String(limit || 10))
    );
    
    return res.json({
      success: true,
      message: 'Pending requests retrieved successfully',
      data: requests
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve pending requests'
    });
  }
});

export default router;
