import express from 'express';
import { authenticateToken, requireFarmer, requireAdmin, requireFarmerOrAdmin } from '../middleware/auth';
import FieldOfficerService from '../services/fieldOfficer';
import ValidationService from '../services/validation';

const router = express.Router();

// Test endpoint for debugging
router.get('/test', async (req, res) => {
  try {
    const testResult = await FieldOfficerService.testBasicAccess();
    res.json({
      success: true,
      message: 'Test successful',
      data: testResult
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// Test search endpoint for debugging
router.get('/test-search', async (req, res) => {
  try {
    const testResult = await FieldOfficerService.testSearchNoParams();
    res.json({
      success: true,
      message: 'Search test successful',
      data: testResult
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Search test failed',
      error: error.message
    });
  }
});

// Get all field officers (Public)
router.get('/', async (req, res) => {
  try {
    const { page, limit, specialization, province_id, district_id } = req.query;
    
    let fieldOfficers;
    
    if (specialization) {
      fieldOfficers = await FieldOfficerService.getFieldOfficersBySpecialization(
        specialization as string,
        parseInt(String(page || 1)),
        parseInt(String(limit || 10))
      );
    } else if (province_id || district_id) {
      fieldOfficers = await FieldOfficerService.getFieldOfficersByLocation(
        province_id ? parseInt(String(province_id)) : undefined,
        district_id ? parseInt(String(district_id)) : undefined,
        parseInt(String(page || 1)),
        parseInt(String(limit || 10))
      );
    } else {
      fieldOfficers = await FieldOfficerService.getAllFieldOfficers(
        parseInt(String(page || 1)),
        parseInt(String(limit || 10))
      );
    }
    
    res.json({
      success: true,
      message: 'Field officers retrieved successfully',
      data: fieldOfficers
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve field officers'
    });
  }
});

// Get field officer by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const fieldOfficerId = parseInt(req.params.id);
    const fieldOfficer = await FieldOfficerService.getFieldOfficerById(fieldOfficerId);
    
    if (!fieldOfficer) {
      return res.status(404).json({
        success: false,
        message: 'Field officer not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Field officer retrieved successfully',
      data: fieldOfficer
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || 'Field officer not found'
    });
  }
});

// Get field officers by specialization (Public)
router.get('/specialization/:specialization', async (req, res) => {
  try {
    const { specialization } = req.params;
    const { page, limit } = req.query;
    
    const fieldOfficers = await FieldOfficerService.getFieldOfficersBySpecialization(
      specialization,
      parseInt(String(page || 1)),
      parseInt(String(limit || 10))
    );
    
    return res.json({
      success: true,
      message: `Field officers with ${specialization} specialization retrieved successfully`,
      data: fieldOfficers
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve field officers by specialization'
    });
  }
});

// Get available specializations (Public)
router.get('/specializations/available', async (req, res) => {
  try {
    const specializations = await FieldOfficerService.getAvailableSpecializations();
    
    return res.json({
      success: true,
      message: 'Available specializations retrieved successfully',
      data: specializations
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve specializations'
    });
  }
});

// ==================== CONTACT REQUESTS (FARMER) ====================

// Create contact request (Farmer only)
router.post('/contact-requests', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const farmerId = (req as any).user.userId;
    const requestData = { ...req.body, farmer_id: farmerId };
    
    const validation = ValidationService.validateFieldOfficerContactRequest(requestData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const requestId = await FieldOfficerService.createContactRequest(requestData);
    
    return res.status(201).json({
      success: true,
      message: 'Contact request created successfully',
      data: { id: requestId }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create contact request'
    });
  }
});

// Get farmer's contact requests (Farmer only)
router.get('/contact-requests/my-requests', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const farmerId = (req as any).user.userId;
    const { page, limit, status } = req.query;
    
    const requests = await FieldOfficerService.getFarmerContactRequests(
      farmerId,
      parseInt(String(page || 1)),
      parseInt(String(limit || 10))
    );
    
    return res.json({
      success: true,
      message: 'Contact requests retrieved successfully',
      data: requests
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve contact requests'
    });
  }
});

// Get specific contact request (Farmer only)
router.get('/contact-requests/:id', authenticateToken, requireFarmer, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const request = await FieldOfficerService.getContactRequestById(requestId);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }
    
    // Check if the farmer owns this request
    const farmerId = (req as any).user.userId;
    if (request.farmer_id !== farmerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own requests.'
      });
    }
    
    return res.json({
      success: true,
      message: 'Contact request retrieved successfully',
      data: request
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || 'Contact request not found'
    });
  }
});

// ==================== ADMIN OPERATIONS ====================

// Get all contact requests (Admin only)
router.get('/admin/contact-requests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page, limit, status, urgency_level } = req.query;
    
    let requests;
    if (status) {
      requests = await FieldOfficerService.searchFieldOfficers({ status }, parseInt(String(page || 1)), parseInt(String(limit || 10)));
    } else if (urgency_level) {
      requests = await FieldOfficerService.getContactRequestsByUrgency(urgency_level as string, parseInt(String(page || 1)), parseInt(String(limit || 10)));
    } else {
      requests = await FieldOfficerService.getPendingContactRequests(parseInt(String(page || 1)), parseInt(String(limit || 10)));
    }
    
    return res.json({
      success: true,
      message: 'Contact requests retrieved successfully',
      data: requests
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve contact requests'
    });
  }
});

// Assign contact request (Admin only)
router.post('/admin/contact-requests/:id/assign', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const adminId = (req as any).user.userId;
    const { admin_notes } = req.body;
    
    const assigned = await FieldOfficerService.assignContactRequest(requestId, adminId, admin_notes);
    
    if (assigned) {
      res.json({
        success: true,
        message: 'Contact request assigned successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to assign contact request'
      });
    }
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to assign contact request'
    });
  }
});

// Reject contact request (Admin only)
router.post('/admin/contact-requests/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
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
    
    const rejected = await FieldOfficerService.rejectContactRequest(requestId, adminId, rejection_reason, admin_notes);
    
    if (rejected) {
      return res.json({
        success: true,
        message: 'Contact request rejected successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to reject contact request'
      });
    }
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to reject contact request'
    });
  }
});

// Get contact request statistics (Admin only)
router.get('/admin/contact-requests/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await FieldOfficerService.getContactRequestStatistics();
    
    return res.json({
      success: true,
      message: 'Contact request statistics retrieved successfully',
      data: stats
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve statistics'
    });
  }
});

// ==================== FIELD OFFICER OPERATIONS ====================

// Get field officer's assigned requests (Field Officer only)
router.get('/my-assigned-requests', authenticateToken, requireFarmerOrAdmin, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { page, limit } = req.query;
    
    // Note: This would need to be enhanced to check if the user is actually a field officer
    // For now, we'll allow any authenticated user to view their assigned requests
    
    const requests = await FieldOfficerService.getFieldOfficerContactRequests(
      userId,
      parseInt(String(page || 1)),
      parseInt(String(limit || 10))
    );
    
    return res.json({
      success: true,
      message: 'Assigned requests retrieved successfully',
      data: requests
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve assigned requests'
    });
  }
});

// Complete contact request (Field Officer only)
router.post('/contact-requests/:id/complete', authenticateToken, requireFarmerOrAdmin, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const completed = await FieldOfficerService.completeContactRequest(requestId);
    
    if (completed) {
      res.json({
        success: true,
        message: 'Contact request completed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to complete contact request'
      });
    }
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to complete contact request'
    });
  }
});

export default router;
