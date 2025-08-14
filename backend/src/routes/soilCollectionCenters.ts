import { Router, Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import ResponseService from '../services/response';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import SoilCollectionCenterService from '../services/soilCollectionCenter';
import ValidationService from '../services/validation';

const router = Router();

/**
 * @route   POST /api/v1/soil-collection-centers
 * @desc    Create a new soil collection center (Admin only)
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const centerData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateSoilCollectionCenter(centerData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    // Create center
    const result = await SoilCollectionCenterService.createCenter(centerData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message, 201);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Create center error:', error);
    return ResponseService.error(res, 'Failed to create soil collection center. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-collection-centers
 * @desc    Get all soil collection centers with pagination
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await SoilCollectionCenterService.getAllCenters(page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get centers error:', error);
    return ResponseService.error(res, 'Failed to retrieve soil collection centers. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-collection-centers/search
 * @desc    Search soil collection centers with filters and pagination
 * @access  Public
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const searchParams = {
      name: req.query.name as string,
      location_id: req.query.location_id ? parseInt(req.query.location_id as string) : undefined,
      province: req.query.province as string,
      district: req.query.district as string,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10
    };

    const result = await SoilCollectionCenterService.searchCenters(searchParams);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Search centers error:', error);
    return ResponseService.error(res, 'Failed to search soil collection centers. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-collection-centers/:id
 * @desc    Get soil collection center by ID
 * @access  Public
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid center ID', 400);
    }

    const result = await SoilCollectionCenterService.getCenter(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 404);
    }
  } catch (error) {
    console.error('Get center error:', error);
    return ResponseService.error(res, 'Failed to retrieve soil collection center. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-collection-centers/location/:locationId
 * @desc    Get soil collection centers by location
 * @access  Public
 */
router.get('/location/:locationId', async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.locationId);
    
    if (isNaN(locationId) || locationId <= 0) {
      return ResponseService.error(res, 'Invalid location ID', 400);
    }

    const result = await SoilCollectionCenterService.getCentersByLocation(locationId);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get centers by location error:', error);
    return ResponseService.error(res, 'Failed to retrieve soil collection centers. Please try again.', 500);
  }
});

/**
 * @route   PUT /api/v1/soil-collection-centers/:id
 * @desc    Update soil collection center (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid center ID', 400);
    }

    const updateData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateSoilCollectionCenterUpdate(updateData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    // Update center
    const result = await SoilCollectionCenterService.updateCenter(id, updateData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Update center error:', error);
    return ResponseService.error(res, 'Failed to update soil collection center. Please try again.', 500);
  }
});

/**
 * @route   DELETE /api/v1/soil-collection-centers/:id
 * @desc    Delete (deactivate) soil collection center (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid center ID', 400);
    }

    // Delete (deactivate) center
    const result = await SoilCollectionCenterService.deleteCenter(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Delete center error:', error);
    return ResponseService.error(res, 'Failed to delete soil collection center. Please try again.', 500);
  }
});

export default router;
