import express, { Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken, requireAdmin, requireFarmer } from '../middleware/auth';
import SoilTestingReportsService from '../services/soilTestingReports';
import ResponseService from '../services/response';
import ValidationService from '../services/validation';
import * as path from 'path';
import * as fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF, DOC, DOCX, and image files
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and image files are allowed.'));
    }
  }
});

// ==================== SOIL TESTING REPORTS ====================

/**
 * @route   POST /api/v1/soil-testing-reports/upload
 * @desc    Upload soil testing report (Admin only)
 * @access  Private (Admin)
 */
router.post('/upload', authenticateToken, requireAdmin, upload.single('report_file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return ResponseService.error(res, 'Report file is required', 400);
    }

    const reportData = req.body;
    
    // Validate input data
    const validationErrors = ValidationService.validateSoilTestingReport(reportData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await SoilTestingReportsService.uploadReport(reportData, req.file);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message, 201);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Upload soil testing report error:', error);
    if (error instanceof Error && error.message.includes('Invalid file type')) {
      return ResponseService.error(res, error.message, 400);
    }
    return ResponseService.error(res, 'Failed to upload soil testing report. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-reports
 * @desc    Get all soil testing reports (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await SoilTestingReportsService.getAllReports(page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get all reports error:', error);
    return ResponseService.error(res, 'Failed to retrieve soil testing reports. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-reports/search
 * @desc    Search soil testing reports (Admin only)
 * @access  Private (Admin)
 */
router.get('/search', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const searchParams = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      farmer_id: req.query.farmer_id ? parseInt(req.query.farmer_id as string) : undefined,
      soil_collection_center_id: req.query.soil_collection_center_id ? parseInt(req.query.soil_collection_center_id as string) : undefined,
      field_officer_id: req.query.field_officer_id ? parseInt(req.query.field_officer_id as string) : undefined,
      testing_date_from: req.query.testing_date_from as string,
      testing_date_to: req.query.testing_date_to as string,
      report_date_from: req.query.report_date_from as string,
      report_date_to: req.query.report_date_to as string,
      is_public: req.query.is_public !== undefined ? req.query.is_public === 'true' : undefined,
      search: req.query.search as string
    };

    const result = await SoilTestingReportsService.searchReports(searchParams);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Search reports error:', error);
    return ResponseService.error(res, 'Failed to search soil testing reports. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-reports/farmer/:farmerId
 * @desc    Get reports by farmer ID (Admin only)
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

    const result = await SoilTestingReportsService.getReportsByFarmer(farmerId, page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get farmer reports error:', error);
    return ResponseService.error(res, 'Failed to retrieve farmer reports. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-reports/center/:centerId
 * @desc    Get reports by soil collection center ID (Admin only)
 * @access  Private (Admin)
 */
router.get('/center/:centerId', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const centerId = parseInt(req.params.centerId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (isNaN(centerId) || centerId <= 0) {
      return ResponseService.error(res, 'Invalid center ID', 400);
    }

    const result = await SoilTestingReportsService.getReportsByCenter(centerId, page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get center reports error:', error);
    return ResponseService.error(res, 'Failed to retrieve center reports. Please try again.', 500);
  }
});



/**
 * @route   PUT /api/v1/soil-testing-reports/:id
 * @desc    Update soil testing report (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid report ID', 400);
    }

    const updateData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateSoilTestingReportUpdate(updateData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    const result = await SoilTestingReportsService.updateReport(id, updateData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Update report error:', error);
    return ResponseService.error(res, 'Failed to update soil testing report. Please try again.', 500);
  }
});

/**
 * @route   DELETE /api/v1/soil-testing-reports/:id
 * @desc    Delete soil testing report (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid report ID', 400);
    }

    const result = await SoilTestingReportsService.deleteReport(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Delete report error:', error);
    return ResponseService.error(res, 'Failed to delete soil testing report. Please try again.', 500);
  }
});

// ==================== FARMER ACCESS ====================

/**
 * @route   GET /api/v1/soil-testing-reports/my-reports
 * @desc    Get farmer's own reports
 * @access  Private (Farmer)
 */
router.get('/my-reports', authenticateToken, requireFarmer, async (req: Request, res: Response) => {
  try {
    const farmerId = (req.user as any).userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await SoilTestingReportsService.getFarmerReports(farmerId, page, limit);

    if (result.success) {
      return ResponseService.paginated(res, result.data.data, result.data.pagination, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get farmer reports error:', error);
    return ResponseService.error(res, 'Failed to retrieve your reports. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/soil-testing-reports/public
 * @desc    Get public reports (for farmers to view)
 * @access  Public
 */
router.get('/public', async (req: Request, res: Response) => {
  try {
    // Simple test to check if database table exists
    return ResponseService.success(res, { message: 'Testing database connection' }, 'Testing database connection');
  } catch (error) {
    console.error('Get public reports error:', error);
    return ResponseService.error(res, `Failed to retrieve public reports: ${error.message}`, 500);
  }
});

// ==================== FILE DOWNLOAD ====================

/**
 * @route   GET /api/v1/soil-testing-reports/:id/download
 * @desc    Download soil testing report file
 * @access  Private
 */
router.get('/:id/download', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req.user as any).userId;
    const userRole = (req.user as any).role;
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid report ID', 400);
    }

    const downloadInfo = await SoilTestingReportsService.downloadReport(id, userId, userRole);
    
    if (!downloadInfo) {
      return ResponseService.error(res, 'Report not found or access denied', 404);
    }

    // Check if file exists
    if (!fs.existsSync(downloadInfo.filePath)) {
      return ResponseService.error(res, 'Report file not found', 404);
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadInfo.fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(downloadInfo.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download report error:', error);
    return ResponseService.error(res, 'Failed to download report. Please try again.', 500);
  }
});

// ==================== STATISTICS ====================

/**
 * @route   GET /api/v1/soil-testing-reports/statistics
 * @desc    Get report statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/statistics', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await SoilTestingReportsService.getReportStatistics();

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get report statistics error:', error);
    return ResponseService.error(res, 'Failed to retrieve report statistics. Please try again.', 500);
  }
});

// ==================== INDIVIDUAL REPORT ACCESS ====================

/**
 * @route   GET /api/v1/soil-testing-reports/:id
 * @desc    Get soil testing report by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return ResponseService.error(res, 'Invalid report ID', 400);
    }

    const result = await SoilTestingReportsService.getReport(id);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 404);
    }
  } catch (error) {
    console.error('Get report error:', error);
    return ResponseService.error(res, 'Failed to retrieve soil testing report. Please try again.', 500);
  }
});

export default router;
