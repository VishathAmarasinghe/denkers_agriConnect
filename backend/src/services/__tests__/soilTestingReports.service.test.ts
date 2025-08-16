import { SoilTestingReportModel } from '../../models/SoilTestingReport';
import SoilTestingScheduleModel from '../../models/SoilTestingSchedule';
import { SoilTestingReport, SoilTestingReportCreate, SoilTestingReportUpdate, SoilTestingSchedule } from '../../types';
import SoilTestingReportsService from '../soilTestingReports';
import * as fs from 'fs';

jest.mock('fs');

describe('SoilTestingReportsService', () => {
  let mockReport: SoilTestingReport;
  let mockReportData: SoilTestingReportCreate;
  let mockFile: Express.Multer.File;
  let mockSchedule: SoilTestingSchedule;

  beforeEach(() => {
    mockReport = {
      id: 1,
      soil_testing_id: 1,
      farmer_id: 1,
      soil_collection_center_id: 1,
      field_officer_id: 1,
      report_file_name: 'test_report.pdf',
      report_file_path: '/uploads/reports/test_report.pdf',
      report_file_size: 1024,
      report_file_type: 'application/pdf',
      report_title: 'Test Report',
      report_summary: 'Test Summary',
      soil_ph: 6.5,
      soil_nitrogen: 1.2,
      soil_phosphorus: 0.8,
      soil_potassium: 1.5,
      soil_organic_matter: 2.3,
      soil_texture: 'Loamy',
      recommendations: 'Test recommendations',
      testing_date: '2024-03-15',
      report_date: '2024-03-16',
      is_public: true,
      created_at: '2024-03-15',
      updated_at: '2024-03-15'
    } as SoilTestingReport;

    mockReportData = {
      soil_testing_id: 1,
      farmer_id: 1,
      soil_collection_center_id: 1,
      field_officer_id: 1,
      report_file_name: 'test_report.pdf',
      report_file_path: '/uploads/reports/test_report.pdf',
      report_file_size: 1024,
      report_file_type: 'application/pdf',
      report_title: 'Test Report',
      report_summary: 'Test Summary',
      soil_ph: 6.5,
      soil_nitrogen: 1.2,
      soil_phosphorus: 0.8,
      soil_potassium: 1.5,
      soil_organic_matter: 2.3,
      soil_texture: 'Loamy',
      recommendations: 'Test recommendations',
      testing_date: '2024-03-15',
      report_date: '2024-03-16'
    };

    mockFile = {
      fieldname: 'report',
      originalname: 'test_report.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer: Buffer.from('test'),
      size: 1024
    } as Express.Multer.File;

    mockSchedule = {
      id: 1,
      farmer_id: 1,
      soil_collection_center_id: 1,
      scheduled_date: '2024-03-15',
      status: 'completed',
      farmer_phone: '1234567890',
      created_at: '2024-03-15',
      updated_at: '2024-03-15'
    } as SoilTestingSchedule;

    // Mock the model static methods
    jest.spyOn(SoilTestingReportModel, 'create').mockResolvedValue(mockReport);
    jest.spyOn(SoilTestingReportModel, 'findById').mockResolvedValue(mockReport);
    jest.spyOn(SoilTestingReportModel, 'update').mockResolvedValue(mockReport);
    jest.spyOn(SoilTestingReportModel, 'search').mockResolvedValue({
      data: [mockReport],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    });
    jest.spyOn(SoilTestingReportModel, 'getByFarmer').mockResolvedValue({
      data: [mockReport],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    });
    jest.spyOn(SoilTestingReportModel, 'getAll').mockResolvedValue({
      data: [mockReport],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    });
    jest.spyOn(SoilTestingScheduleModel, 'findById').mockResolvedValue(mockSchedule);

    // Mock fs functions
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadReport', () => {
    it('should upload a soil testing report successfully', async () => {
      const result = await SoilTestingReportsService.uploadReport(mockReportData, mockFile);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Soil testing report uploaded successfully');
      expect(result.data).toEqual(mockReport);
      expect(SoilTestingReportModel.create).toHaveBeenCalledTimes(1);
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it('should return error if soil testing not found', async () => {
      jest.spyOn(SoilTestingScheduleModel, 'findById').mockResolvedValue(null);

      const result = await SoilTestingReportsService.uploadReport(mockReportData, mockFile);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Soil testing not found');
      expect(result.data).toBeNull();
    });

    it('should return error if soil testing not completed', async () => {
      jest.spyOn(SoilTestingScheduleModel, 'findById').mockResolvedValue({
        ...mockSchedule,
        status: 'pending'
      });

      const result = await SoilTestingReportsService.uploadReport(mockReportData, mockFile);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Soil testing must be completed before uploading a report');
      expect(result.data).toBeNull();
    });
  });

  describe('getReport', () => {
    it('should return report by id', async () => {
      const result = await SoilTestingReportsService.getReport(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Soil testing report retrieved successfully');
      expect(result.data).toEqual(mockReport);
      expect(SoilTestingReportModel.findById).toHaveBeenCalledWith(1);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(SoilTestingReportModel, 'findById').mockRejectedValue(new Error('Database error'));

      const result = await SoilTestingReportsService.getReport(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve soil testing report. Please try again.');
      expect(result.data).toBeNull();
    });
  });

  describe('updateReport', () => {
    const updateData: SoilTestingReportUpdate = {
      report_title: 'Updated Report',
      report_summary: 'Updated Summary',
      recommendations: 'Updated recommendations'
    };

    it('should update report successfully', async () => {
      const result = await SoilTestingReportsService.updateReport(1, updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Soil testing report updated successfully');
      expect(result.data).toEqual(mockReport);
      expect(SoilTestingReportModel.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(SoilTestingReportModel, 'update').mockRejectedValue(new Error('Database error'));

      const result = await SoilTestingReportsService.updateReport(1, updateData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update soil testing report. Please try again.');
      expect(result.data).toBeNull();
    });
  });

  describe('getFarmerReports', () => {
    it('should return all reports for farmer', async () => {
      const result = await SoilTestingReportsService.getFarmerReports(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Your soil testing reports retrieved successfully');
      expect(result.data).toEqual({
        data: [mockReport],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });
      expect(SoilTestingReportModel.getByFarmer).toHaveBeenCalledWith(1, 1, 10);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(SoilTestingReportModel, 'getByFarmer').mockRejectedValue(new Error('Database error'));

      const result = await SoilTestingReportsService.getFarmerReports(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve your reports. Please try again.');
      expect(result.data).toBeNull();
    });
  });

  describe('searchReports', () => {
    it('should search reports with given criteria', async () => {
      const searchParams = {
        farmer_id: 1,
        soil_collection_center_id: 1,
        testing_date_from: '2024-03-01',
        testing_date_to: '2024-03-31'
      };

      const result = await SoilTestingReportsService.searchReports(searchParams);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Soil testing reports retrieved successfully');
      expect(result.data).toEqual({
        data: [mockReport],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });
      expect(SoilTestingReportModel.search).toHaveBeenCalledWith(searchParams);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(SoilTestingReportModel, 'search').mockRejectedValue(new Error('Database error'));

      const result = await SoilTestingReportsService.searchReports({});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to search soil testing reports. Please try again.');
      expect(result.data).toBeNull();
    });
  });

  describe('downloadReport', () => {
    it('should return file info for admin', async () => {
      const result = await SoilTestingReportsService.downloadReport(1, 1, 'admin');

      expect(result).toEqual({
        filePath: mockReport.report_file_path,
        fileName: mockReport.report_file_name
      });
    });

    it('should return file info for farmer accessing own report', async () => {
      const result = await SoilTestingReportsService.downloadReport(1, 1, 'farmer');

      expect(result).toEqual({
        filePath: mockReport.report_file_path,
        fileName: mockReport.report_file_name
      });
    });

    it('should return null for farmer accessing other\'s report', async () => {
      const result = await SoilTestingReportsService.downloadReport(1, 2, 'farmer');

      expect(result).toBeNull();
    });

    it('should return null if file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await SoilTestingReportsService.downloadReport(1, 1, 'admin');

      expect(result).toBeNull();
    });
  });
});