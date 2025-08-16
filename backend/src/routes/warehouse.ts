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

// Warehouse Categories Routes

// Get all warehouse categories (Public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await WarehouseService.getAllWarehouseCategories();
    
    return res.json({
      success: true,
      message: 'Warehouse categories retrieved successfully',
      data: categories
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve warehouse categories'
    });
  }
});

// Get warehouse category by ID (Public)
router.get('/categories/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const category = await WarehouseService.getWarehouseCategory(categoryId);
    
    return res.json({
      success: true,
      message: 'Warehouse category retrieved successfully',
      data: category
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || 'Warehouse category not found'
    });
  }
});

// Create new warehouse category (Admin only)
router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const categoryId = await WarehouseService.createWarehouseCategory({ name, description });
    
    return res.status(201).json({
      success: true,
      message: 'Warehouse category created successfully',
      data: { id: categoryId }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create warehouse category'
    });
  }
});

// Update warehouse category (Admin only)
router.put('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const updated = await WarehouseService.updateWarehouseCategory(categoryId, { name, description });
    
    if (updated) {
      return res.json({
        success: true,
        message: 'Warehouse category updated successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Warehouse category not found'
      });
    }
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update warehouse category'
    });
  }
});

// Delete warehouse category (Admin only)
router.delete('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const deleted = await WarehouseService.deleteWarehouseCategory(categoryId);
    
    if (deleted) {
      return res.json({
        success: true,
        message: 'Warehouse category deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Warehouse category not found'
      });
    }
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete warehouse category'
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
