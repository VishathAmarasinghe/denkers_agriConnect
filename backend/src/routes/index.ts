import express from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import equipmentRentalRoutes from './equipmentRental';
import farmerWarehouseRoutes from './farmerWarehouse';
import fieldOfficerRoutes from './fieldOfficer';
import warehouseRoutes from './warehouse';
import soilCollectionCentersRoutes from './soilCollectionCenters';
import soilTestingReportsRoutes from './soilTestingReports';
import soilTestingSchedulingRoutes from './soilTestingScheduling';
import googleAuthRoutes from './googleAuth';

const router = express.Router();

// API version prefix
const API_VERSION = '/api/v1';

// Auth routes
router.use(`${API_VERSION}/auth`, authRoutes);

// Google OAuth routes
router.use(`${API_VERSION}/auth/google`, googleAuthRoutes);

// User routes
router.use(`${API_VERSION}/users`, userRoutes);

// Equipment rental routes
router.use(`${API_VERSION}/equipment-rental`, equipmentRentalRoutes);

// Farmer warehouse routes
router.use(`${API_VERSION}/farmer-warehouse`, farmerWarehouseRoutes);

// Field officer routes
router.use(`${API_VERSION}/field-officer`, fieldOfficerRoutes);

// Warehouse routes
router.use(`${API_VERSION}/warehouse`, warehouseRoutes);

// Soil collection centers routes
router.use(`${API_VERSION}/soil-collection-centers`, soilCollectionCentersRoutes);

// Soil testing reports routes
router.use(`${API_VERSION}/soil-testing-reports`, soilTestingReportsRoutes);

// Soil testing scheduling routes
router.use(`${API_VERSION}/soil-testing-scheduling`, soilTestingSchedulingRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
