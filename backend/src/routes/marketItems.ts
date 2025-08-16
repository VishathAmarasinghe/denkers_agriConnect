import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import MarketItemService from '../services/marketItem';
import ValidationService from '../services/validation';

const router = express.Router();

// ==================== MARKET ITEMS ====================

// Get all market items (Public)
router.get('/', async (req, res) => {
  try {
    const { page, limit, category, is_active } = req.query;
    
    const items = await MarketItemService.getAllMarketItems(
      parseInt(String(page || 1)),
      parseInt(String(limit || 10)),
      category as string,
      is_active === 'true' ? true : is_active === 'false' ? false : undefined
    );
    
    return res.json({
      success: true,
      message: 'Market items retrieved successfully',
      data: items
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve market items'
    });
  }
});

// Get market item by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    
    const item = await MarketItemService.getMarketItem(itemId);
    
    return res.json({
      success: true,
      message: 'Market item retrieved successfully',
      data: item
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve market item'
    });
  }
});

// Search market items by name (Public)
router.get('/search/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { page, limit } = req.query;
    
    const items = await MarketItemService.searchMarketItems(
      name,
      parseInt(String(page || 1)),
      parseInt(String(limit || 10))
    );
    
    return res.json({
      success: true,
      message: 'Market items search completed successfully',
      data: items
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to search market items'
    });
  }
});

// Get market items by category (Public)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page, limit } = req.query;
    
    const items = await MarketItemService.getMarketItemsByCategory(
      category,
      parseInt(String(page || 1)),
      parseInt(String(limit || 10))
    );
    
    return res.json({
      success: true,
      message: 'Market items by category retrieved successfully',
      data: items
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve market items by category'
    });
  }
});

// Get all categories (Public)
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await MarketItemService.getCategories();
    
    return res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve categories'
    });
  }
});

// Get market item statistics (Public)
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await MarketItemService.getMarketItemStats();
    
    return res.json({
      success: true,
      message: 'Market item statistics retrieved successfully',
      data: stats
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve market item statistics'
    });
  }
});

// ==================== ADMIN OPERATIONS ====================

// Create new market item (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category, unit, image_url, is_active } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }
    
    const itemData = {
      name,
      description,
      category,
      unit: unit || 'kg',
      image_url,
      is_active: is_active !== false
    };
    
    const itemId = await MarketItemService.createMarketItem(itemData);
    
    return res.status(201).json({
      success: true,
      message: 'Market item created successfully',
      data: { id: itemId }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create market item'
    });
  }
});

// Update market item (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const { name, description, category, unit, image_url, is_active } = req.body;
    
    const updateData = {
      name,
      description,
      category,
      unit,
      image_url,
      is_active
    };
    
    const success = await MarketItemService.updateMarketItem(itemId, updateData);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Market item not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Market item updated successfully'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update market item'
    });
  }
});

// Delete market item (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    
    const success = await MarketItemService.deleteMarketItem(itemId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Market item not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Market item deleted successfully'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete market item'
    });
  }
});

// Toggle market item status (Admin only)
router.patch('/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    
    const success = await MarketItemService.toggleMarketItemStatus(itemId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Market item not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Market item status toggled successfully'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to toggle market item status'
    });
  }
});

export default router;
