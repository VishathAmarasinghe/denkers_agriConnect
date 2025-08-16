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

// Get farmer's warehouse requests (Farmer only) or all requests (Admin)
router.get('/requests', authenticateToken, requireFarmerOrAdmin, async (req, res) => {
  try {
    const user = (req as any).user;
    const { page, limit, status } = req.query;
    
    let requests;
    if (user.role === 'admin') {
      // Admin can see all requests
      requests = await FarmerWarehouseService.getAllRequests(
        parseInt(String(page || 1)),
        parseInt(String(limit || 10)),
        status as string
      );
    } else {
      // Farmer can only see their own requests
      const farmerId = user.userId;
      requests = await FarmerWarehouseService.getFarmerRequests(
        farmerId,
        parseInt(String(page || 1)),
        parseInt(String(limit || 10))
      );
    }
    
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

// Get farmer's storage items (Farmer or Admin)
router.get('/storage', authenticateToken, requireFarmerOrAdmin, async (req, res) => {
  try {
    const user = (req as any).user;
    const { page, limit } = req.query;
    
    let storage;
    if (user.role === 'admin') {
      // Admin can see all storage items
      storage = await FarmerWarehouseService.getAllStorage(
        parseInt(String(page || 1)),
        parseInt(String(limit || 10))
      );
    } else {
      // Farmer can only see their own storage
      const farmerId = user.userId;
      storage = await FarmerWarehouseService.getFarmerStorage(
        farmerId,
        parseInt(String(page || 1)),
        parseInt(String(limit || 10))
      );
    }
    
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

// Get farmer's storage summary (Farmer or Admin)
router.get('/storage/summary', authenticateToken, requireFarmerOrAdmin, async (req, res) => {
  try {
    const user = (req as any).user;
    
    let summary;
    if (user.role === 'admin') {
      // Admin can see overall storage summary
      summary = await FarmerWarehouseService.getAllStorageSummary();
    } else {
      // Farmer can only see their own storage summary
      const farmerId = user.userId;
      summary = await FarmerWarehouseService.getFarmerStorageSummary(farmerId);
    }
    
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

// Get farmer's expiring items (Farmer or Admin)
router.get('/storage/expiring', authenticateToken, requireFarmerOrAdmin, async (req, res) => {
  try {
    const user = (req as any).user;
    const { days } = req.query;
    
    let expiringItems;
    if (user.role === 'admin') {
      // Admin can see all expiring items
      expiringItems = await FarmerWarehouseService.getAllExpiringItems(
        parseInt(String(days || 30))
      );
    } else {
      // Farmer can only see their own expiring items
      const farmerId = user.userId;
      expiringItems = await FarmerWarehouseService.getFarmerExpiringItems(
        farmerId,
        parseInt(String(days || 30))
      );
    }
    
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

// Get farmer's expired items (Farmer or Admin)
router.get('/storage/expired', authenticateToken, requireFarmerOrAdmin, async (req, res) => {
  try {
    const user = (req as any).user;
    
    let expiredItems;
    if (user.role === 'admin') {
      // Admin can see all expired items
      expiredItems = await FarmerWarehouseService.getAllExpiredItems();
    } else {
      // Farmer can only see their own expired items
      const farmerId = user.userId;
      expiredItems = await FarmerWarehouseService.getFarmerExpiredItems(farmerId);
    }
    
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

// Get farmer's notifications (Farmer or Admin)
router.get('/notifications', authenticateToken, requireFarmerOrAdmin, async (req, res) => {
  try {
    const user = (req as any).user;
    const { page, limit } = req.query;
    
    let notifications;
    if (user.role === 'admin') {
      // Admin can see all notifications
      notifications = await FarmerWarehouseService.getAllNotifications(
        parseInt(String(page || 1)),
        parseInt(String(limit || 10))
      );
    } else {
      // Farmer can only see their own notifications
      const farmerId = user.userId;
      notifications = await FarmerWarehouseService.getFarmerNotifications(
        farmerId,
        parseInt(String(page || 1)),
        parseInt(String(limit || 10))
      );
    }
    
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

// Mark notification as read (Farmer or Admin)
router.put('/notifications/:id/read', authenticateToken, requireFarmerOrAdmin, async (req, res) => {
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
    const { market_item_id, page, limit } = req.query;
    
    const prices = await FarmerWarehouseService.getMarketPrices(
      market_item_id ? parseInt(String(market_item_id)) : undefined,
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

// Create new market price (Admin only)
router.post('/market-prices', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { market_item_id, current_price, price_date, source, notes } = req.body;
    
    if (!market_item_id || !current_price) {
      return res.status(400).json({
        success: false,
        message: 'Market item ID and current price are required'
      });
    }
    
    const priceData = {
      market_item_id: parseInt(market_item_id),
      current_price: parseFloat(current_price),
      price_date: price_date || new Date(),
      source: source || 'admin',
      notes
    };
    
    const priceId = await FarmerWarehouseService.createMarketPrice(priceData);
    
    return res.json({
      success: true,
      message: 'Market price created successfully',
      data: { id: priceId }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create market price'
    });
  }
});

// Update market price (Admin only)
router.put('/market-prices/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const priceId = parseInt(req.params.id);
    const { current_price, price_date, source, notes } = req.body;
    
    if (!current_price) {
      return res.status(400).json({
        success: false,
        message: 'Current price is required'
      });
    }
    
    const updateData = {
      current_price: parseFloat(current_price),
      price_date: price_date || new Date(),
      source: source || 'admin_update',
      notes
    };
    
    const success = await FarmerWarehouseService.updateMarketPriceById(priceId, updateData);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Market price not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Market price updated successfully'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update market price'
    });
  }
});

// Delete market price (Admin only)
router.delete('/market-prices/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const priceId = parseInt(req.params.id);
    
    const success = await FarmerWarehouseService.deleteMarketPrice(priceId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Market price not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Market price deleted successfully'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete market price'
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
