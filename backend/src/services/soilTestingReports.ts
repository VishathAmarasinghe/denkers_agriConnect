import { SoilTestingReport, SoilTestingReportCreate, SoilTestingReportUpdate, SoilTestingReportSearchParams } from '../types';
import { SoilTestingReportModel } from '../models/SoilTestingReport';
import SoilTestingScheduleModel from '../models/SoilTestingSchedule';
import NotificationService from './notification';
import { ApiResponse } from '../types';
import * as fs from 'fs';
import * as path from 'path';

class SoilTestingReportsService {
  /**
   * Create soil testing report (Admin only) - without file upload
   */
  async createReport(reportData: SoilTestingReportCreate): Promise<ApiResponse> {
    try {
      // If soil_testing_id is provided and greater than 0, validate that the soil testing exists and is completed
      if (reportData.soil_testing_id && reportData.soil_testing_id > 0) {
        const soilTesting = await SoilTestingScheduleModel.findById(reportData.soil_testing_id);
        if (!soilTesting) {
          return {
            success: false,
            message: 'Soil testing not found',
            data: null
          };
        }

        if (soilTesting.status !== 'completed') {
          return {
            success: false,
            message: 'Soil testing must be completed before creating a report',
            data: null
          };
        }
      }

      // Create report record without file
      const reportRecord: SoilTestingReportCreate = {
        ...reportData,
        report_file_name: reportData.report_file_name || '',
        report_file_path: reportData.report_file_path || '',
        report_file_size: reportData.report_file_size || 0,
        report_file_type: reportData.report_file_type || ''
      };

      const report = await SoilTestingReportModel.create(reportRecord);

      // Send notification to farmer if soil_testing_id is provided and greater than 0
      if (reportData.soil_testing_id && reportData.soil_testing_id > 0) {
        try {
          const soilTesting = await SoilTestingScheduleModel.findById(reportData.soil_testing_id);
          if (soilTesting && soilTesting.farmer_phone) {
            const message = `Your soil testing report for ${reportData.testing_date} has been created. You can view and download it from your dashboard.`;
            await NotificationService.sendSMS({ 
              recipient: soilTesting.farmer_phone, 
              message 
            });
          }
        } catch (error) {
          console.error('Failed to send notification SMS:', error);
        }
      }

      return {
        success: true,
        message: 'Soil testing report created successfully',
        data: report
      };
    } catch (error) {
      console.error('Create soil testing report error:', error);
      return {
        success: false,
        message: 'Failed to create soil testing report. Please try again.',
        data: null
      };
    }
  }

  /**
   * Upload soil testing report (Admin only)
   */
  async uploadReport(reportData: SoilTestingReportCreate, file: Express.Multer.File): Promise<ApiResponse> {
    try {
      // If soil_testing_id is provided and greater than 0, validate that the soil testing exists and is completed
      if (reportData.soil_testing_id && reportData.soil_testing_id > 0) {
        const soilTesting = await SoilTestingScheduleModel.findById(reportData.soil_testing_id);
        if (!soilTesting) {
          return {
            success: false,
            message: 'Soil testing not found',
            data: null
          };
        }

        if (soilTesting.status !== 'completed') {
          return {
            success: false,
            message: 'Soil testing must be completed before uploading a report',
            data: null
          };
        }
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads/soil-testing-reports');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = path.extname(file.originalname);
      const fileName = `soil_report_${reportData.soil_testing_id}_${timestamp}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Create report record
      const reportRecord: SoilTestingReportCreate = {
        ...reportData,
        report_file_name: fileName,
        report_file_path: filePath,
        report_file_size: file.size,
        report_file_type: file.mimetype
      };

      const report = await SoilTestingReportModel.create(reportRecord);

      // Send notification to farmer if soil_testing_id is provided and greater than 0
      if (reportData.soil_testing_id && reportData.soil_testing_id > 0) {
        try {
          const soilTesting = await SoilTestingScheduleModel.findById(reportData.soil_testing_id);
          if (soilTesting && soilTesting.farmer_phone) {
            const message = `Your soil testing report for ${reportData.testing_date} is now available. You can view and download it from your dashboard.`;
            await NotificationService.sendSMS({ 
              recipient: soilTesting.farmer_phone, 
              message 
            });
          }
        } catch (error) {
          console.error('Failed to send notification SMS:', error);
        }
      }

      return {
        success: true,
        message: 'Soil testing report uploaded successfully',
        data: report
      };
    } catch (error) {
      console.error('Upload soil testing report error:', error);
      return {
        success: false,
        message: 'Failed to upload soil testing report. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get soil testing report by ID
   */
  async getReport(id: number): Promise<ApiResponse> {
    try {
      const report = await SoilTestingReportModel.findById(id);
      
      return {
        success: true,
        message: 'Soil testing report retrieved successfully',
        data: report
      };
    } catch (error) {
      console.error('Get soil testing report error:', error);
      return {
        success: false,
        message: 'Failed to retrieve soil testing report. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get all soil testing reports (Admin only)
   */
  async getAllReports(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await SoilTestingReportModel.getAll(page, limit);
      
      return {
        success: true,
        message: 'Soil testing reports retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get all reports error:', error);
      return {
        success: false,
        message: 'Failed to retrieve soil testing reports. Please try again.',
        data: null
      };
    }
  }

  /**
   * Search soil testing reports (Admin only)
   */
  async searchReports(params: SoilTestingReportSearchParams): Promise<ApiResponse> {
    try {
      const result = await SoilTestingReportModel.search(params);
      
      return {
        success: true,
        message: 'Soil testing reports retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Search reports error:', error);
      return {
        success: false,
        message: 'Failed to search soil testing reports. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get reports by farmer ID (Admin only)
   */
  async getReportsByFarmer(farmerId: number, page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await SoilTestingReportModel.getByFarmer(farmerId, page, limit);
      
      return {
        success: true,
        message: 'Farmer reports retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get farmer reports error:', error);
      return {
        success: false,
        message: 'Failed to retrieve farmer reports. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get reports by soil collection center ID (Admin only)
   */
  async getReportsByCenter(centerId: number, page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await SoilTestingReportModel.getByCenter(centerId, page, limit);
      
      return {
        success: true,
        message: 'Center reports retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get center reports error:', error);
      return {
        success: false,
        message: 'Failed to retrieve center reports. Please try again.',
        data: null
      };
    }
  }

  /**
   * Update soil testing report (Admin only)
   */
  async updateReport(id: number, updateData: SoilTestingReportUpdate): Promise<ApiResponse> {
    try {
      const report = await SoilTestingReportModel.update(id, updateData);
      
      return {
        success: true,
        message: 'Soil testing report updated successfully',
        data: report
      };
    } catch (error) {
      console.error('Update report error:', error);
      return {
        success: false,
        message: 'Failed to update soil testing report. Please try again.',
        data: null
      };
    }
  }

  /**
   * Delete soil testing report (Admin only)
   */
  async deleteReport(id: number): Promise<ApiResponse> {
    try {
      // Get report to delete file
      const report = await SoilTestingReportModel.findById(id);
      
      // Delete file from disk
      if (fs.existsSync(report.report_file_path)) {
        fs.unlinkSync(report.report_file_path);
      }

      // Delete from database
      await SoilTestingReportModel.delete(id);
      
      return {
        success: true,
        message: 'Soil testing report deleted successfully',
        data: null
      };
    } catch (error) {
      console.error('Delete report error:', error);
      return {
        success: false,
        message: 'Failed to delete soil testing report. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get farmer's own reports
   */
  async getFarmerReports(farmerId: number, page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await SoilTestingReportModel.getByFarmer(farmerId, page, limit);
      
      return {
        success: true,
        message: 'Your soil testing reports retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get farmer reports error:', error);
      return {
        success: false,
        message: 'Failed to retrieve your reports. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get public reports (for farmers to view)
   */
  async getPublicReports(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await SoilTestingReportModel.getPublicReports(page, limit);
      
      return {
        success: true,
        message: 'Public soil testing reports retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get public reports error:', error);
      return {
        success: false,
        message: 'Failed to retrieve public reports. Please try again.',
        data: null
      };
    }
  }

  /**
   * Download soil testing report file
   */
  async downloadReport(id: number, userId: number, userRole: string): Promise<{ filePath: string; fileName: string } | null> {
    try {
      const report = await SoilTestingReportModel.findById(id);
      
      // Check access permissions
      if (userRole === 'farmer' && report.farmer_id !== userId) {
        return null; // Farmer can only download their own reports
      }
      
      // Check if file exists
      if (!fs.existsSync(report.report_file_path)) {
        return null;
      }

      return {
        filePath: report.report_file_path,
        fileName: report.report_file_name
      };
    } catch (error) {
      console.error('Download report error:', error);
      return null;
    }
  }

  /**
   * Get report statistics (Admin only)
   */
  async getReportStatistics(): Promise<ApiResponse> {
    try {
      // This would typically involve more complex queries
      // For now, return basic info
      const allReports = await SoilTestingReportModel.getAll(1, 1000);
      const totalReports = Array.isArray(allReports) ? allReports.length : 0;
      
      const statistics = {
        total_reports: totalReports,
        reports_this_month: 0, // Would need date filtering
        reports_by_center: {}, // Would need grouping
        average_soil_ph: 0, // Would need calculation
        most_common_recommendations: [] as string[] // Would need analysis
      };
      
      return {
        success: true,
        message: 'Report statistics retrieved successfully',
        data: statistics
      };
    } catch (error) {
      console.error('Get report statistics error:', error);
      return {
        success: false,
        message: 'Failed to retrieve report statistics. Please try again.',
        data: null
      };
    }
  }
}

export default new SoilTestingReportsService();
