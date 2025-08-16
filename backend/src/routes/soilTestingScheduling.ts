import express, { Request, Response } from 'express';
import { authenticateToken, requireAdmin, requireFarmer } from '../middleware/auth';
import SoilTestingSchedulingService from '../services/soilTestingScheduling';
import ResponseService from '../services/response';
import ValidationService from '../services/validation';

const router = express.Router();

// ==================== SOIL TESTING REQUESTS ====================

/**
 * @route   POST /api/v1/soil-testing-requests
 * @desc    Create a new soil testing request (Farmer only)
 * @access  Private (Farmer)
 */
router.post('/', authenticateToken, requireFarmer, async (req: Request, res: Response) => {
  try {
    const farmerId = (req.user as any).userId;
    const requestData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateSoilTestingRequest(requestData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await SoilTestingSchedulingService.createRequest(requestData, farmerId);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message, 201);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Create soil testing request error:', error);
    return ResponseService.error(res, 'Failed to create soil testing request. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-requests
 * @desc    Get all soil testing requests (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await SoilTestingSchedulingService.getAllRequests(page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get soil testing requests error:', error);
    return ResponseService.error(res, 'Failed to retrieve soil testing requests. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-requests/pending
 * @desc    Get pending soil testing requests (Admin only)
 * @access  Private (Admin)
 */
router.get('/pending', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await SoilTestingSchedulingService.getPendingRequests(page, limit);

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
 * @route   GET /api/v1/soil-testing-requests/farmer/:farmerId
 * @desc    Get soil testing requests by farmer (Admin only)
 * @access  Private (Admin)
 */
router.get('/farmer/:farmerId', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const farmerId = parseInt(req.params.farmerId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (isNaN(farmerId) || farmerId <= 0) {
      return ResponseService.error(res, 'Invalid farmer ID', 400);
    }

    const result = await SoilTestingSchedulingService.getRequestsByFarmer(farmerId, page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get requests by farmer error:', error);
    return ResponseService.error(res, 'Failed to retrieve requests. Please try again.', 500);
  }
});



// ==================== TIME SLOTS ====================

/**
 * @route   GET /api/v1/soil-testing-time-slots/available/:centerId
 * @desc    Get available time slots for a center
 * @access  Public
 */
router.get('/time-slots/available/:centerId', async (req: Request, res: Response) => {
  try {
    const centerId = parseInt(req.params.centerId);
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;

    if (isNaN(centerId) || centerId <= 0) {
      return ResponseService.error(res, 'Invalid center ID', 400);
    }

    if (!dateFrom || !dateTo) {
      return ResponseService.error(res, 'Date range is required', 400);
    }

    const result = await SoilTestingSchedulingService.getAvailableTimeSlots(centerId, dateFrom, dateTo);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get available time slots error:', error);
    return ResponseService.error(res, 'Failed to retrieve available time slots. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/soil-testing-time-slots
 * @desc    Create a new time slot (Admin only)
 * @access  Private (Admin)
 */
router.post('/time-slots', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const timeSlotData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateSoilTestingTimeSlot(timeSlotData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await SoilTestingSchedulingService.createTimeSlot(timeSlotData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message, 201);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Create time slot error:', error);
    return ResponseService.error(res, 'Failed to create time slot. Please try again.', 500);
  }
});

/**
 * @route   PUT /api/v1/soil-testing-time-slots/:id
 * @desc    Update time slot (Admin only)
 * @access  Private (Admin)
 */
router.put('/time-slots/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid time slot ID', 400);
    }

    const updateData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateSoilTestingTimeSlotUpdate(updateData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await SoilTestingSchedulingService.updateTimeSlot(id, updateData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Update time slot error:', error);
    return ResponseService.error(res, 'Failed to update time slot. Please try again.', 500);
  }
});

// ==================== DATE AVAILABILITY MANAGEMENT ====================

/**
 * @route   GET /api/v1/soil-testing-date-availability/:centerId
 * @desc    Get date availability status for a center
 * @access  Public
 */
router.get('/date-availability/:centerId', async (req: Request, res: Response) => {
  try {
    const centerId = parseInt(req.params.centerId);
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;

    if (isNaN(centerId) || centerId <= 0) {
      return ResponseService.error(res, 'Invalid center ID', 400);
    }

    if (!dateFrom || !dateTo) {
      return ResponseService.error(res, 'Date range is required', 400);
    }

    const result = await SoilTestingSchedulingService.getDateAvailability(centerId, dateFrom, dateTo);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get date availability error:', error);
    return ResponseService.error(res, 'Failed to retrieve date availability. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/soil-testing-date-availability/:centerId/unavailable
 * @desc    Make a specific date unavailable (Admin only)
 * @access  Private (Admin)
 */
router.post('/date-availability/:centerId/unavailable', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const centerId = parseInt(req.params.centerId);
    const { date } = req.body;

    if (isNaN(centerId) || centerId <= 0) {
      return ResponseService.error(res, 'Invalid center ID', 400);
    }

    if (!date) {
      return ResponseService.error(res, 'Date is required', 400);
    }

    const result = await SoilTestingSchedulingService.makeDateUnavailable(centerId, date);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Make date unavailable error:', error);
    return ResponseService.error(res, 'Failed to make date unavailable. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/soil-testing-date-availability/:centerId/available
 * @desc    Make a specific date available (Admin only)
 * @access  Private (Admin)
 */
router.post('/date-availability/:centerId/available', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const centerId = parseInt(req.params.centerId);
    const { date } = req.body;

    if (isNaN(centerId) || centerId <= 0) {
      return ResponseService.error(res, 'Invalid center ID', 400);
    }

    if (!date) {
      return ResponseService.error(res, 'Date is required', 400);
    }

    const result = await SoilTestingSchedulingService.makeDateAvailable(centerId, date);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Make date available error:', error);
    return ResponseService.error(res, 'Failed to make date available. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/soil-testing-date-availability/:centerId/bulk-update
 * @desc    Bulk update date availability (Admin only)
 * @access  Private (Admin)
 */
router.post('/date-availability/:centerId/bulk-update', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const centerId = parseInt(req.params.centerId);
    const { dates, force } = req.body;

    if (isNaN(centerId) || centerId <= 0) {
      return ResponseService.error(res, 'Invalid center ID', 400);
    }

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return ResponseService.error(res, 'Dates array is required', 400);
    }

    const result = await SoilTestingSchedulingService.bulkUpdateDateAvailability(centerId, dates, force || false);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Bulk update date availability error:', error);
    return ResponseService.error(res, 'Failed to update date availability. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-date-availability/:centerId/check/:date
 * @desc    Check if a date has scheduled appointments
 * @access  Public
 */
router.get('/date-availability/:centerId/check/:date', async (req: Request, res: Response) => {
  try {
    const centerId = parseInt(req.params.centerId);
    const date = req.params.date;

    if (isNaN(centerId) || centerId <= 0) {
      return ResponseService.error(res, 'Invalid center ID', 400);
    }

    if (!date) {
      return ResponseService.error(res, 'Date is required', 400);
    }

    const result = await SoilTestingSchedulingService.checkDateAppointments(centerId, date);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Check date appointments error:', error);
    return ResponseService.error(res, 'Failed to check date appointments. Please try again.', 500);
  }
});

// ==================== FIELD VISITORS ====================

/**
 * @route   GET /api/v1/soil-testing-field-visitors/available
 * @desc    Get available field visitors
 * @access  Public
 */
router.get('/field-visitors/available', async (req: Request, res: Response) => {
  try {
    const result = await SoilTestingSchedulingService.getAvailableFieldOfficers();

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get available field visitors error:', error);
    return ResponseService.error(res, 'Failed to retrieve available field visitors. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-field-visitors
 * @desc    Get all field visitors (Admin and Farmer)
 * @access  Private (Admin, Farmer)
 */
router.get('/field-visitors', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await SoilTestingSchedulingService.searchFieldOfficers({ page, limit });

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get field visitors error:', error);
    return ResponseService.error(res, 'Failed to retrieve field visitors. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/soil-testing-field-visitors
 * @desc    Create a new field visitor (Admin only)
 * @access  Private (Admin)
 */
router.post('/field-visitors', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const fieldVisitorData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateFieldOfficer(fieldVisitorData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await SoilTestingSchedulingService.createFieldOfficer(fieldVisitorData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message, 201);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Create field visitor error:', error);
    return ResponseService.error(res, 'Failed to create field visitor. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-field-visitors/:id
 * @desc    Get field visitor by ID
 * @access  Private
 */
router.get('/field-visitors/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid field visitor ID', 400);
    }

    const result = await SoilTestingSchedulingService.getFieldOfficer(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 404);
    }
  } catch (error) {
    console.error('Get field visitor error:', error);
    return ResponseService.error(res, 'Failed to retrieve field visitor. Please try again.', 500);
  }
});

/**
 * @route   PUT /api/v1/soil-testing-field-visitors/:id
 * @desc    Update field visitor (Admin only)
 * @access  Private (Admin)
 */
router.put('/field-visitors/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid field visitor ID', 400);
    }

    const updateData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateFieldOfficerUpdate(updateData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await SoilTestingSchedulingService.updateFieldOfficer(id, updateData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Update field visitor error:', error);
    return ResponseService.error(res, 'Failed to update field visitor. Please try again.', 500);
  }
});

// ==================== SOIL TESTING SCHEDULES ====================

/**
 * @route   POST /api/v1/soil-testing-schedules
 * @desc    Create a new soil testing schedule (Admin only)
 * @access  Private (Admin)
 */
router.post('/schedules', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const scheduleData = req.body;
    const farmerId = scheduleData.farmer_id;

    if (!farmerId) {
      return ResponseService.error(res, 'Farmer ID is required', 400);
    }

    // Validate input data
    const validationErrors = ValidationService.validateSoilTestingSchedule(scheduleData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await SoilTestingSchedulingService.createSchedule(scheduleData, farmerId);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message, 201);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Create soil testing schedule error:', error);
    return ResponseService.error(res, 'Failed to create soil testing schedule. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-schedules
 * @desc    Get all soil testing schedules (Admin only)
 * @access  Private (Admin)
 */
router.get('/schedules', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await SoilTestingSchedulingService.searchSchedules({ page, limit });

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get soil testing schedules error:', error);
    return ResponseService.error(res, 'Failed to retrieve soil testing schedules. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-schedules/today
 * @desc    Get today's soil testing schedules (Admin only)
 * @access  Private (Admin)
 */
router.get('/schedules/today', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await SoilTestingSchedulingService.getTodaySchedules();

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get today\'s schedules error:', error);
    return ResponseService.error(res, 'Failed to retrieve today\'s schedules. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-schedules/:id
 * @desc    Get soil testing schedule by ID
 * @access  Private
 */
router.get('/schedules/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid schedule ID', 400);
    }

    const result = await SoilTestingSchedulingService.getSchedule(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 404);
    }
  } catch (error) {
    console.error('Get soil testing schedule error:', error);
    return ResponseService.error(res, 'Failed to retrieve soil testing schedule. Please try again.', 500);
  }
});

/**
 * @route   PUT /api/v1/soil-testing-schedules/:id
 * @desc    Update soil testing schedule (Admin only)
 * @access  Private (Admin)
 */
router.put('/schedules/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid schedule ID', 400);
    }

    const updateData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateSoilTestingScheduleUpdate(updateData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await SoilTestingSchedulingService.updateSchedule(id, updateData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Update soil testing schedule error:', error);
    return ResponseService.error(res, 'Failed to update soil testing schedule. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/soil-testing-schedules/:id/complete
 * @desc    Mark soil testing schedule as completed (QR code scan)
 * @access  Private
 */
router.post('/schedules/:id/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid schedule ID', 400);
    }

    const result = await SoilTestingSchedulingService.markScheduleCompleted(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Mark schedule completed error:', error);
    return ResponseService.error(res, 'Failed to mark schedule as completed. Please try again.', 500);
  }
});

// ==================== SOIL TESTING REQUESTS BY ID ====================

/**
 * @route   GET /api/v1/soil-testing-requests/:id
 * @desc    Get soil testing request by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid request ID', 400);
    }

    const result = await SoilTestingSchedulingService.getRequest(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 404);
    }
  } catch (error) {
    console.error('Get soil testing request error:', error);
    return ResponseService.error(res, 'Failed to retrieve soil testing request. Please try again.', 500);
  }
});

/**
 * @route   PUT /api/v1/soil-testing-requests/:id
 * @desc    Update soil testing request (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid request ID', 400);
    }

    const updateData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateSoilTestingRequestUpdate(updateData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await SoilTestingSchedulingService.updateRequest(id, updateData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Update soil testing request error:', error);
    return ResponseService.error(res, 'Failed to update soil testing request. Please try again.', 500);
  }
});

export default router;
