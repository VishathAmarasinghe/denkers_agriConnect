import express from 'express';
import multer from 'multer';
import { requireAdmin, authenticateToken } from '../middleware/auth';
import WarehouseService from '../services/warehouse';
import ValidationService from '../services/validation';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/warehouses/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop() || 'jpg';
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ==================== WAREHOUSE MANAGEMENT ====================

// Create new warehouse (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validation = ValidationService.validateWarehouse(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const warehouseId = await WarehouseService.createWarehouse(req.body);
    
    return res.status(201).json({
      success: true,
      message: 'Warehouse created successfully',
      data: { id: warehouseId }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create warehouse'
    });
  }
});

// Get all warehouses (Public)
router.get('/', async (req, res) => {
  try {
    const { page, limit, ...filters } = req.query;
    const warehouses = await WarehouseService.searchWarehouses({
      ...filters,
      page: parseInt(String(page || 1)),
      limit: parseInt(String(limit || 10))
    });
    
    return res.json({
      success: true,
      message: 'Warehouses retrieved successfully',
      data: warehouses
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve warehouses'
    });
  }
});

// Get warehouse by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const warehouseId = parseInt(req.params.id);
    const warehouse = await WarehouseService.getWarehouse(warehouseId);
    
    return res.json({
      success: true,
      message: 'Warehouse retrieved successfully',
      data: warehouse
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || 'Warehouse not found'
    });
  }
});

// Update warehouse (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const warehouseId = parseInt(req.params.id);
    const validation = ValidationService.validateWarehouseUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const updated = await WarehouseService.updateWarehouse(warehouseId, req.body);
    
    if (updated) {
      return res.json({
        success: true,
        message: 'Warehouse updated successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update warehouse'
    });
  }
});

// Delete warehouse (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const warehouseId = parseInt(req.params.id);
    const deleted = await WarehouseService.deleteWarehouse(warehouseId);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Warehouse deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete warehouse'
    });
  }
});

export default router;
