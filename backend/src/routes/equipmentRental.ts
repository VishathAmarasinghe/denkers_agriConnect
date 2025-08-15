import express, { Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken, requireAdmin, requireFarmer } from '../middleware/auth';
import EquipmentRentalService from '../services/equipmentRental';
import ResponseService from '../services/response';
import ValidationService from '../services/validation';

const router = express.Router();

// Configure multer for equipment image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  }
});

// ==================== EQUIPMENT CATEGORIES ====================

/**
 * @route   POST /api/v1/equipment-rental/categories
 * @desc    Create equipment category (Admin only)
 * @access  Private (Admin)
 */
router.post('/categories', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const categoryData = req.body;
    
    // Validate input data
    const validationErrors = ValidationService.validateEquipmentCategory(categoryData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await EquipmentRentalService.createCategory(categoryData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message, 201);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Create equipment category error:', error);
    return ResponseService.error(res, 'Failed to create equipment category. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/equipment-rental/categories
 * @desc    Get all equipment categories
 * @access  Public
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await EquipmentRentalService.getAllCategories(page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get equipment categories error:', error);
    return ResponseService.error(res, 'Failed to retrieve equipment categories. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/equipment-rental/categories/active
 * @desc    Get active equipment categories
 * @access  Public
 */
router.get('/categories/active', async (req: Request, res: Response) => {
  try {
    const result = await EquipmentRentalService.getActiveCategories();

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get active categories error:', error);
    return ResponseService.error(res, 'Failed to retrieve active categories. Please try again.', 500);
  }
});

/**
 * @route   PUT /api/v1/equipment-rental/categories/:id
 * @desc    Update equipment category (Admin only)
 * @access  Private (Admin)
 */
router.put('/categories/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid category ID', 400);
    }

    const updateData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateEquipmentCategoryUpdate(updateData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await EquipmentRentalService.updateCategory(id, updateData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Update equipment category error:', error);
    return ResponseService.error(res, 'Failed to update equipment category. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/equipment-rental/categories/:id/activate
 * @desc    Activate equipment category (Admin only)
 * @access  Private (Admin)
 */
router.post('/categories/:id/activate', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid category ID', 400);
    }

    const result = await EquipmentRentalService.activateCategory(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Activate category error:', error);
    return ResponseService.error(res, 'Failed to activate equipment category. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/equipment-rental/categories/:id/deactivate
 * @desc    Deactivate equipment category (Admin only)
 * @access  Private (Admin)
 */
router.post('/categories/:id/deactivate', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid category ID', 400);
    }

    const result = await EquipmentRentalService.deactivateCategory(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Deactivate category error:', error);
    return ResponseService.error(res, 'Failed to deactivate equipment category. Please try again.', 500);
  }
});

// ==================== EQUIPMENT ====================

/**
 * @route   POST /api/v1/equipment-rental/equipment
 * @desc    Create equipment (Admin only)
 * @access  Private (Admin)
 */
router.post('/equipment', authenticateToken, requireAdmin, upload.single('equipment_image'), async (req: Request, res: Response) => {
  try {
    const equipmentData = req.body;
    
    // Handle image upload if provided
    if (req.file) {
      // In a real implementation, you would save the file and get the URL
      equipmentData.equipment_image_url = `https://example.com/uploads/equipment/${Date.now()}_${req.file.originalname}`;
    }
    
    // Validate input data
    const validationErrors = ValidationService.validateEquipment(equipmentData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await EquipmentRentalService.createEquipment(equipmentData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message, 201);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Create equipment error:', error);
    if (error instanceof Error && error.message.includes('Invalid file type')) {
      return ResponseService.error(res, error.message, 400);
    }
    return ResponseService.error(res, 'Failed to create equipment. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/equipment-rental/equipment
 * @desc    Get all equipment
 * @access  Public
 */
router.get('/equipment', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await EquipmentRentalService.getAllEquipment(page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get equipment error:', error);
    return ResponseService.error(res, 'Failed to retrieve equipment. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/equipment-rental/equipment/available
 * @desc    Get available equipment
 * @access  Public
 */
router.get('/equipment/available', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await EquipmentRentalService.getAvailableEquipment(page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get available equipment error:', error);
    return ResponseService.error(res, 'Failed to retrieve available equipment. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/equipment-rental/equipment/category/:categoryId
 * @desc    Get equipment by category
 * @access  Public
 */
router.get('/equipment/category/:categoryId', async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (isNaN(categoryId) || categoryId <= 0) {
      return ResponseService.error(res, 'Invalid category ID', 400);
    }

    const result = await EquipmentRentalService.getEquipmentByCategory(categoryId, page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get equipment by category error:', error);
    return ResponseService.error(res, 'Failed to retrieve equipment by category. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/equipment-rental/equipment/:id
 * @desc    Get equipment by ID
 * @access  Public
 */
router.get('/equipment/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid equipment ID', 400);
    }

    // This would typically call a service method to get equipment by ID
    // For now, return a placeholder response
    return ResponseService.success(res, { id, message: 'Equipment details would be returned here' }, 'Equipment retrieved successfully');
  } catch (error) {
    console.error('Get equipment error:', error);
    return ResponseService.error(res, 'Failed to retrieve equipment. Please try again.', 500);
  }
});

/**
 * @route   PUT /api/v1/equipment-rental/equipment/:id
 * @desc    Update equipment (Admin only)
 * @access  Private (Admin)
 */
router.put('/equipment/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid equipment ID', 400);
    }

    const updateData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateEquipmentUpdate(updateData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await EquipmentRentalService.updateEquipment(id, updateData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Update equipment error:', error);
    return ResponseService.error(res, 'Failed to update equipment. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/equipment-rental/equipment/:id/activate
 * @desc    Activate equipment (Admin only)
 * @access  Private (Admin)
 */
router.post('/equipment/:id/activate', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid equipment ID', 400);
    }

    const result = await EquipmentRentalService.activateEquipment(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Activate equipment error:', error);
    return ResponseService.error(res, 'Failed to activate equipment. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/equipment-rental/equipment/:id/deactivate
 * @desc    Deactivate equipment (Admin only)
 * @access  Private (Admin)
 */
router.post('/equipment/:id/deactivate', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid equipment ID', 400);
    }

    const result = await EquipmentRentalService.deactivateEquipment(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Deactivate equipment error:', error);
    return ResponseService.error(res, 'Failed to deactivate equipment. Please try again.', 500);
  }
});

// ==================== EQUIPMENT AVAILABILITY ====================

/**
 * @route   POST /api/v1/equipment-rental/equipment/:id/availability
 * @desc    Set equipment availability (Admin only)
 * @access  Private (Admin)
 */
router.post('/equipment/:id/availability', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const equipmentId = parseInt(req.params.id);
    
    if (isNaN(equipmentId) || equipmentId <= 0) {
      return ResponseService.error(res, 'Invalid equipment ID', 400);
    }

    const { dates, is_available, reason } = req.body;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return ResponseService.error(res, 'Dates array is required', 400);
    }

    if (typeof is_available !== 'boolean') {
      return ResponseService.error(res, 'is_available boolean is required', 400);
    }

    const result = await EquipmentRentalService.setEquipmentAvailability(equipmentId, dates, is_available, reason);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Set equipment availability error:', error);
    return ResponseService.error(res, 'Failed to set equipment availability. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/equipment-rental/equipment/:id/availability
 * @desc    Check equipment availability
 * @access  Public
 */
router.get('/equipment/:id/availability', async (req: Request, res: Response) => {
  try {
    const equipmentId = parseInt(req.params.id);
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;
    
    if (isNaN(equipmentId) || equipmentId <= 0) {
      return ResponseService.error(res, 'Invalid equipment ID', 400);
    }

    if (!startDate || !endDate) {
      return ResponseService.error(res, 'Start date and end date are required', 400);
    }

    const result = await EquipmentRentalService.checkEquipmentAvailability(equipmentId, startDate, endDate);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Check equipment availability error:', error);
    return ResponseService.error(res, 'Failed to check equipment availability. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/equipment-rental/equipment/available-with-dates
 * @desc    Get available equipment with availability dates
 * @access  Public
 */
router.get('/equipment/available-with-dates', async (req: Request, res: Response) => {
  try {
    const dateFrom = req.query.date_from as string;
    const dateTo = req.query.date_to as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!dateFrom || !dateTo) {
      return ResponseService.error(res, 'Date range is required', 400);
    }

    const result = await EquipmentRentalService.getAvailableEquipmentWithDates(dateFrom, dateTo, page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get available equipment with dates error:', error);
    return ResponseService.error(res, 'Failed to retrieve available equipment with dates. Please try again.', 500);
  }
});

// ==================== EQUIPMENT RENTAL REQUESTS ====================

/**
 * @route   POST /api/v1/equipment-rental/requests
 * @desc    Create rental request (Farmer only)
 * @access  Private (Farmer)
 */
router.post('/requests', authenticateToken, requireFarmer, async (req: Request, res: Response) => {
  try {
    const requestData = req.body;
    const farmerId = (req.user as any).userId;
    
    // Validate input data
    const validationErrors = ValidationService.validateEquipmentRentalRequest(requestData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await EquipmentRentalService.createRentalRequest(requestData, farmerId);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message, 201);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Create rental request error:', error);
    return ResponseService.error(res, 'Failed to create rental request. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/equipment-rental/requests
 * @desc    Get all rental requests (Admin only)
 * @access  Private (Admin)
 */
router.get('/requests', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await EquipmentRentalService.getAllRentalRequests(page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get rental requests error:', error);
    return ResponseService.error(res, 'Failed to retrieve rental requests. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/equipment-rental/requests/pending
 * @desc    Get pending rental requests (Admin only)
 * @access  Private (Admin)
 */
router.get('/requests/pending', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await EquipmentRentalService.getPendingRentalRequests(page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get pending requests error:', error);
    return ResponseService.error(res, 'Failed to retrieve pending requests. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/equipment-rental/requests/my-requests
 * @desc    Get farmer's rental requests
 * @access  Private (Farmer)
 */
router.get('/requests/my-requests', authenticateToken, requireFarmer, async (req: Request, res: Response) => {
  try {
    const farmerId = (req.user as any).userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await EquipmentRentalService.getFarmerRentalRequests(farmerId, page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get farmer requests error:', error);
    return ResponseService.error(res, 'Failed to retrieve your requests. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/equipment-rental/requests/:id/approve
 * @desc    Approve rental request (Admin only)
 * @access  Private (Admin)
 */
router.post('/requests/:id/approve', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    const adminId = (req.user as any).userId;
    const { admin_notes } = req.body;
    
    if (isNaN(requestId) || requestId <= 0) {
      return ResponseService.error(res, 'Invalid request ID', 400);
    }

    const result = await EquipmentRentalService.approveRentalRequest(requestId, adminId, admin_notes);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Approve rental request error:', error);
    return ResponseService.error(res, 'Failed to approve rental request. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/equipment-rental/requests/:id/reject
 * @desc    Reject rental request (Admin only)
 * @access  Private (Admin)
 */
router.post('/requests/:id/reject', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    const adminId = (req.user as any).userId;
    const { rejection_reason, admin_notes } = req.body;
    
    if (isNaN(requestId) || requestId <= 0) {
      return ResponseService.error(res, 'Invalid request ID', 400);
    }

    if (!rejection_reason) {
      return ResponseService.error(res, 'Rejection reason is required', 400);
    }

    const result = await EquipmentRentalService.rejectRentalRequest(requestId, adminId, rejection_reason, admin_notes);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Reject rental request error:', error);
    return ResponseService.error(res, 'Failed to reject rental request. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/equipment-rental/requests/:id/confirm-pickup
 * @desc    Confirm equipment pickup (Admin only)
 * @access  Private (Admin)
 */
router.post('/requests/:id/confirm-pickup', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    
    if (isNaN(requestId) || requestId <= 0) {
      return ResponseService.error(res, 'Invalid request ID', 400);
    }

    const result = await EquipmentRentalService.confirmPickup(requestId);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Confirm pickup error:', error);
    return ResponseService.error(res, 'Failed to confirm pickup. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/equipment-rental/requests/:id/confirm-return
 * @desc    Confirm equipment return (Admin only)
 * @access  Private (Admin)
 */
router.post('/requests/:id/confirm-return', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    
    if (isNaN(requestId) || requestId <= 0) {
      return ResponseService.error(res, 'Invalid request ID', 400);
    }

    const result = await EquipmentRentalService.confirmReturn(requestId);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Confirm return error:', error);
    return ResponseService.error(res, 'Failed to confirm return. Please try again.', 500);
  }
});

export default router;
