import { 
  SoilTestingRequest, 
  SoilTestingRequestCreate, 
  SoilTestingRequestUpdate,
  SoilTestingRequestSearchParams,
  SoilTestingTimeSlot,
  SoilTestingTimeSlotCreate,
  SoilTestingTimeSlotUpdate,
  SoilTestingTimeSlotSearchParams,
  FieldOfficer,
  FieldOfficerCreate,
  FieldOfficerUpdate,
  FieldOfficerSearchParams,
  SoilTestingSchedule,
  SoilTestingScheduleCreate,
  SoilTestingScheduleUpdate,
  SoilTestingScheduleSearchParams,
  AvailableTimeSlotsResponse,
  QRCodeData,
  EnhancedQRCodeData,
  PaginatedResponse,
  ApiResponse
} from '../types';
import SoilTestingRequestModel from '../models/SoilTestingRequest';
import SoilTestingTimeSlotModel from '../models/SoilTestingTimeSlot';
import FieldOfficerModel from '../models/FieldOfficer';
import SoilTestingScheduleModel from '../models/SoilTestingSchedule';
import ResponseService from './response';
import NotificationService from './notification';
import QRCodeService from './qrCode';

class SoilTestingSchedulingService {
  // ==================== SOIL TESTING REQUESTS ====================

  /**
   * Create a new soil testing request
   */
  async createRequest(data: SoilTestingRequestCreate, farmerId: number): Promise<ApiResponse> {
    try {
      const request = await SoilTestingRequestModel.create(data, farmerId);
      
      return {
        success: true,
        message: 'Soil testing request created successfully',
        data: request
      };
    } catch (error) {
      console.error('Create soil testing request error:', error);
      return {
        success: false,
        message: 'Failed to create soil testing request. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get soil testing request by ID
   */
  async getRequest(id: number): Promise<ApiResponse> {
    try {
      const request = await SoilTestingRequestModel.findById(id);
      
      if (!request) {
        return {
          success: false,
          message: 'Soil testing request not found',
          data: null
        };
      }

      return {
        success: true,
        message: 'Soil testing request retrieved successfully',
        data: request
      };
    } catch (error) {
      console.error('Get soil testing request error:', error);
      return {
        success: false,
        message: 'Failed to retrieve soil testing request. Please try again.',
        data: null
      };
    }
  }

  /**
   * Update soil testing request (admin only)
   */
  async updateRequest(id: number, data: SoilTestingRequestUpdate): Promise<ApiResponse> {
    try {
      const existingRequest = await SoilTestingRequestModel.findById(id);
      if (!existingRequest) {
        return {
          success: false,
          message: 'Soil testing request not found',
          data: null
        };
      }

      const updated = await SoilTestingRequestModel.update(id, data);
      if (!updated) {
        return {
          success: false,
          message: 'Failed to update soil testing request. Please try again.',
          data: null
        };
      }

      // Get updated request
      const updatedRequest = await SoilTestingRequestModel.findById(id);
      
      // Send SMS notification based on status change
      if (data.status === 'rejected' && data.rejection_reason) {
        await this.sendRejectionSMS(existingRequest.farmer_phone, data.rejection_reason);
      } else if (data.status === 'approved') {
        // Create soil testing schedule when request is approved
        try {
          console.log('Creating soil testing schedule for approved request:', {
            requestId: id,
            farmerId: existingRequest.farmer_id,
            centerId: existingRequest.soil_collection_center_id,
            approvedDate: data.approved_date,
            startTime: data.approved_start_time,
            endTime: data.approved_end_time,
            fieldOfficerId: data.field_officer_id
          });

          const scheduleData = {
            soil_collection_center_id: existingRequest.soil_collection_center_id,
            scheduled_date: data.approved_date!,
            start_time: data.approved_start_time!,
            end_time: data.approved_end_time!,
            field_officer_id: data.field_officer_id!,
            farmer_phone: existingRequest.farmer_phone,
            farmer_location_address: existingRequest.farmer_location_address,
            farmer_latitude: existingRequest.farmer_latitude,
            farmer_longitude: existingRequest.farmer_longitude
          };

          console.log('Schedule data to create:', scheduleData);

          const schedule = await SoilTestingScheduleModel.create(scheduleData, existingRequest.farmer_id);
          console.log('Schedule created successfully:', schedule);
          
          // Generate QR code for the schedule
          const qrCodeData: QRCodeData = {
            schedule_id: schedule.id!,
            farmer_id: schedule.farmer_id,
            center_id: schedule.soil_collection_center_id,
            scheduled_date: schedule.scheduled_date,
            timestamp: new Date().toISOString()
          };

          console.log('Generating QR code for data:', qrCodeData);
          const qrCodeResult = await this.generateQRCode(qrCodeData);
          console.log('QR code generated:', qrCodeResult);

          const enhancedQRData: EnhancedQRCodeData = {
            ...qrCodeData,
            uniqueId: qrCodeResult.uniqueId,
            verificationUrl: qrCodeResult.verificationUrl
          };

          console.log('Updating QR code in database...');
          await SoilTestingScheduleModel.updateQRCode(schedule.id!, qrCodeResult.qrCodeUrl, JSON.stringify(enhancedQRData));
          console.log('QR code updated in database successfully');

          // Send SMS with QR code and unique ID
          console.log('Sending SMS with QR code...');
          await this.sendScheduleConfirmationSMS(existingRequest.farmer_phone, schedule.scheduled_date, qrCodeResult.qrCodeUrl, qrCodeResult.uniqueId);
          console.log('SMS sent successfully with QR code');

        } catch (scheduleError) {
          console.error('Failed to create schedule or send QR code:', scheduleError);
          console.error('Error details:', {
            message: scheduleError instanceof Error ? scheduleError.message : 'Unknown error',
            stack: scheduleError instanceof Error ? scheduleError.stack : 'No stack trace'
          });
          // Still send approval SMS even if schedule creation fails
          await this.sendApprovalSMS(existingRequest.farmer_phone, data.approved_date!, data.approved_start_time!, data.approved_end_time!);
        }
      }

      return {
        success: true,
        message: 'Soil testing request updated successfully',
        data: updatedRequest
      };
    } catch (error) {
      console.error('Update soil testing request error:', error);
      return {
        success: false,
        message: 'Failed to update soil testing request. Please try again.',
        data: null
      };
    }
  }

  /**
   * Search soil testing requests
   */
  async searchRequests(params: SoilTestingRequestSearchParams): Promise<ApiResponse> {
    try {
      const result = await SoilTestingRequestModel.search(params);
      
      return {
        success: true,
        message: 'Soil testing requests retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Search soil testing requests error:', error);
      return {
        success: false,
        message: 'Failed to search soil testing requests. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get all soil testing requests
   */
  async getAllRequests(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await SoilTestingRequestModel.getAll(page, limit);
      
      return {
        success: true,
        message: 'Soil testing requests retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get all soil testing requests error:', error);
      return {
        success: false,
        message: 'Failed to retrieve soil testing requests. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get requests by farmer
   */
  async getRequestsByFarmer(farmerId: number, page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await SoilTestingRequestModel.getByFarmer(farmerId, page, limit);
      
      return {
        success: true,
        message: 'Soil testing requests retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get requests by farmer error:', error);
      return {
        success: false,
        message: 'Failed to retrieve soil testing requests. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get pending requests
   */
  async getPendingRequests(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await SoilTestingRequestModel.getPending(page, limit);
      
      return {
        success: true,
        message: 'Pending soil testing requests retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get pending requests error:', error);
      return {
        success: false,
        message: 'Failed to retrieve pending soil testing requests. Please try again.',
        data: null
      };
    }
  }

  // ==================== TIME SLOTS ====================

  /**
   * Create a new time slot
   */
  async createTimeSlot(data: SoilTestingTimeSlotCreate): Promise<ApiResponse> {
    try {
      const timeSlot = await SoilTestingTimeSlotModel.create(data);
      
      return {
        success: true,
        message: 'Time slot created successfully',
        data: timeSlot
      };
    } catch (error) {
      console.error('Create time slot error:', error);
      return {
        success: false,
        message: 'Failed to create time slot. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get available time slots for a center
   */
  async getAvailableTimeSlots(centerId: number, dateFrom: string, dateTo: string): Promise<ApiResponse> {
    try {
      const timeSlots = await SoilTestingTimeSlotModel.getAvailableSlots(centerId, dateFrom, dateTo);
      
      return {
        success: true,
        message: 'Available time slots retrieved successfully',
        data: timeSlots
      };
    } catch (error) {
      console.error('Get available time slots error:', error);
      return {
        success: false,
        message: 'Failed to retrieve available time slots. Please try again.',
        data: null
      };
    }
  }

  /**
   * Update time slot
   */
  async updateTimeSlot(id: number, data: SoilTestingTimeSlotUpdate): Promise<ApiResponse> {
    try {
      const updated = await SoilTestingTimeSlotModel.update(id, data);
      if (!updated) {
        return {
          success: false,
          message: 'Failed to update time slot. Please try again.',
          data: null
        };
      }

      const updatedTimeSlot = await SoilTestingTimeSlotModel.findById(id);
      
      return {
        success: true,
        message: 'Time slot updated successfully',
        data: updatedTimeSlot
      };
    } catch (error) {
      console.error('Update time slot error:', error);
      return {
        success: false,
        message: 'Failed to update time slot. Please try again.',
        data: null
      };
    }
  }

  /**
   * Make a specific date unavailable (admin only)
   */
  async makeDateUnavailable(centerId: number, date: string): Promise<ApiResponse> {
    try {
      const updated = await SoilTestingTimeSlotModel.makeDateUnavailable(centerId, date);
      
      if (updated) {
        return {
          success: true,
          message: `Date ${date} has been made unavailable successfully`,
          data: { centerId, date, is_available: false }
        };
      } else {
        return {
          success: false,
          message: 'Failed to make date unavailable. Please try again.',
          data: null
        };
      }
    } catch (error) {
      console.error('Make date unavailable error:', error);
      if (error instanceof Error && error.message.includes('scheduled appointments')) {
        return {
          success: false,
          message: error.message,
          data: null
        };
      }
      return {
        success: false,
        message: 'Failed to make date unavailable. Please try again.',
        data: null
      };
    }
  }

  /**
   * Make a specific date available (admin only)
   */
  async makeDateAvailable(centerId: number, date: string): Promise<ApiResponse> {
    try {
      const updated = await SoilTestingTimeSlotModel.makeDateAvailable(centerId, date);
      
      if (updated) {
        return {
          success: true,
          message: `Date ${date} has been made available successfully`,
          data: { centerId, date, is_available: true }
        };
      } else {
        return {
          success: false,
          message: 'Failed to make date available. Please try again.',
          data: null
        };
      }
    } catch (error) {
      console.error('Make date available error:', error);
      return {
        success: false,
        message: 'Failed to make date available. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get date availability status for a center
   */
  async getDateAvailability(centerId: number, dateFrom: string, dateTo: string): Promise<ApiResponse> {
    try {
      const availability = await SoilTestingTimeSlotModel.getDateAvailability(centerId, dateFrom, dateTo);
      
      return {
        success: true,
        message: 'Date availability retrieved successfully',
        data: availability
      };
    } catch (error) {
      console.error('Get date availability error:', error);
      return {
        success: false,
        message: 'Failed to retrieve date availability. Please try again.',
        data: null
      };
    }
  }

  /**
   * Bulk update date availability (admin only)
   */
  async bulkUpdateDateAvailability(centerId: number, dates: Array<{date: string, is_available: boolean}>, force: boolean = false): Promise<ApiResponse> {
    try {
      const result = await SoilTestingTimeSlotModel.bulkUpdateDateAvailability(centerId, dates, force);
      
      if (result.success) {
        return {
          success: true,
          message: 'Date availability updated successfully',
          data: {
            centerId,
            updatedDates: dates,
            errors: result.errors
          }
        };
      } else {
        return {
          success: false,
          message: 'Some dates could not be updated',
          data: {
            centerId,
            updatedDates: dates,
            errors: result.errors
          }
        };
      }
    } catch (error) {
      console.error('Bulk update date availability error:', error);
      return {
        success: false,
        message: 'Failed to update date availability. Please try again.',
        data: null
      };
    }
  }

  /**
   * Check if a date has scheduled appointments
   */
  async checkDateAppointments(centerId: number, date: string): Promise<ApiResponse> {
    try {
      const hasAppointments = await SoilTestingTimeSlotModel.hasScheduledAppointments(centerId, date);
      
      return {
        success: true,
        message: 'Date appointment status checked successfully',
        data: {
          centerId,
          date,
          hasScheduledAppointments: hasAppointments,
          canMakeUnavailable: !hasAppointments
        }
      };
    } catch (error) {
      console.error('Check date appointments error:', error);
      return {
        success: false,
        message: 'Failed to check date appointments. Please try again.',
        data: null
      };
    }
  }

  // ==================== FIELD OFFICERS ====================

  /**
   * Create a new field officer
   */
  async createFieldOfficer(data: FieldOfficerCreate): Promise<ApiResponse> {
    try {
      const fieldOfficer = await FieldOfficerModel.create(data);
      
      return {
        success: true,
        message: 'Field officer created successfully',
        data: fieldOfficer
      };
    } catch (error) {
      console.error('Create field officer error:', error);
      return {
        success: false,
        message: 'Failed to create field officer. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get field officer by ID
   */
  async getFieldOfficer(id: number): Promise<ApiResponse> {
    try {
      const fieldOfficer = await FieldOfficerModel.findById(id);
      
      if (!fieldOfficer) {
        return {
          success: false,
          message: 'Field officer not found',
          data: null
        };
      }

      return {
        success: true,
        message: 'Field officer retrieved successfully',
        data: fieldOfficer
      };
    } catch (error) {
      console.error('Get field officer error:', error);
      return {
        success: false,
        message: 'Failed to retrieve field officer. Please try again.',
        data: null
      };
    }
  }

  /**
   * Update field officer
   */
  async updateFieldOfficer(id: number, data: FieldOfficerUpdate): Promise<ApiResponse> {
    try {
      const updated = await FieldOfficerModel.update(id, data);
      if (!updated) {
        return {
          success: false,
          message: 'Failed to update field officer. Please try again.',
          data: null
        };
      }

      const updatedFieldOfficer = await FieldOfficerModel.findById(id);
      
      return {
        success: true,
        message: 'Field officer updated successfully',
        data: updatedFieldOfficer
      };
    } catch (error) {
      console.error('Update field officer error:', error);
      return {
        success: false,
        message: 'Failed to update field officer. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get available field officers
   */
  async getAvailableFieldOfficers(): Promise<ApiResponse> {
    try {
      const fieldOfficers = await FieldOfficerModel.getAll();
      
      return {
        success: true,
        message: 'Available field officers retrieved successfully',
        data: fieldOfficers
      };
    } catch (error) {
      console.error('Get available field officers error:', error);
      return {
        success: false,
        message: 'Failed to retrieve available field officers. Please try again.',
        data: null
      };
    }
  }

  /**
   * Search field officers
   */
  async searchFieldOfficers(params: FieldOfficerSearchParams): Promise<ApiResponse> {
    try {
      const result = await FieldOfficerModel.search(params);
      
      return {
        success: true,
        message: 'Field officers retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Search field officers error:', error);
      return {
        success: false,
        message: 'Failed to search field officers. Please try again.',
        data: null
      };
    }
  }

  // ==================== SOIL TESTING SCHEDULES ====================

  /**
   * Create a new soil testing schedule
   */
  async createSchedule(data: SoilTestingScheduleCreate, farmerId: number): Promise<ApiResponse> {
    try {
      const schedule = await SoilTestingScheduleModel.create(data, farmerId);
      
      // Generate QR code
      const qrCodeData: QRCodeData = {
        schedule_id: schedule.id!,
        farmer_id: schedule.farmer_id,
        center_id: schedule.soil_collection_center_id,
        scheduled_date: schedule.scheduled_date,
        timestamp: new Date().toISOString()
      };

      const qrCodeResult = await this.generateQRCode(qrCodeData);
      const enhancedQRData: EnhancedQRCodeData = {
        ...qrCodeData,
        uniqueId: qrCodeResult.uniqueId,
        verificationUrl: qrCodeResult.verificationUrl
      };
      await SoilTestingScheduleModel.updateQRCode(schedule.id!, qrCodeResult.qrCodeUrl, JSON.stringify(enhancedQRData));

      // Send SMS with QR code URL and unique ID
      await this.sendScheduleConfirmationSMS(data.farmer_phone, schedule.scheduled_date, qrCodeResult.qrCodeUrl, qrCodeResult.uniqueId);

      return {
        success: true,
        message: 'Soil testing schedule created successfully',
        data: schedule
      };
    } catch (error) {
      console.error('Create soil testing schedule error:', error);
      return {
        success: false,
        message: 'Failed to create soil testing schedule. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get soil testing schedule by ID
   */
  async getSchedule(id: number): Promise<ApiResponse> {
    try {
      const schedule = await SoilTestingScheduleModel.findById(id);
      
      if (!schedule) {
        return {
          success: false,
          message: 'Soil testing schedule not found',
          data: null
        };
      }

      return {
        success: true,
        message: 'Soil testing schedule retrieved successfully',
        data: schedule
      };
    } catch (error) {
      console.error('Get soil testing schedule error:', error);
      return {
        success: false,
        message: 'Failed to retrieve soil testing schedule. Please try again.',
        data: null
      };
    }
  }

  /**
   * Update soil testing schedule
   */
  async updateSchedule(id: number, data: SoilTestingScheduleUpdate): Promise<ApiResponse> {
    try {
      const updated = await SoilTestingScheduleModel.update(id, data);
      if (!updated) {
        return {
          success: false,
          message: 'Failed to update soil testing schedule. Please try again.',
          data: null
        };
      }

      const updatedSchedule = await SoilTestingScheduleModel.findById(id);
      
      return {
        success: true,
        message: 'Soil testing schedule updated successfully',
        data: updatedSchedule
      };
    } catch (error) {
      console.error('Update soil testing schedule error:', error);
      return {
        success: false,
        message: 'Failed to update soil testing schedule. Please try again.',
        data: null
      };
    }
  }

  /**
   * Mark schedule as completed (QR code scan)
   */
  async markScheduleCompleted(id: number): Promise<ApiResponse> {
    try {
      const schedule = await SoilTestingScheduleModel.findById(id);
      if (!schedule) {
        return {
          success: false,
          message: 'Soil testing schedule not found',
          data: null
        };
      }

      const completed = await SoilTestingScheduleModel.markCompleted(id);
      if (!completed) {
        return {
          success: false,
          message: 'Failed to mark schedule as completed. Please try again.',
          data: null
        };
      }

      // Decrement field visitor workload
      if (schedule.field_officer_id) {
        // Note: Field officers don't have workload tracking in the current schema
        // This can be implemented later if needed
      }

      const updatedSchedule = await SoilTestingScheduleModel.findById(id);
      
      return {
        success: true,
        message: 'Soil testing schedule marked as completed',
        data: updatedSchedule
      };
    } catch (error) {
      console.error('Mark schedule completed error:', error);
      return {
        success: false,
        message: 'Failed to mark schedule as completed. Please try again.',
        data: null
      };
    }
  }

  /**
   * Search soil testing schedules
   */
  async searchSchedules(params: SoilTestingScheduleSearchParams): Promise<ApiResponse> {
    try {
      const result = await SoilTestingScheduleModel.search(params);
      
      return {
        success: true,
        message: 'Soil testing schedules retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Search soil testing schedules error:', error);
      return {
        success: false,
        message: 'Failed to search soil testing schedules. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get today's schedules
   */
  async getTodaySchedules(): Promise<ApiResponse> {
    try {
      const schedules = await SoilTestingScheduleModel.getTodaySchedules();
      
      return {
        success: true,
        message: 'Today\'s schedules retrieved successfully',
        data: schedules
      };
    } catch (error) {
      console.error('Get today\'s schedules error:', error);
      return {
        success: false,
        message: 'Failed to retrieve today\'s schedules. Please try again.',
        data: null
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generate QR code for schedule
   */
  private async generateQRCode(data: QRCodeData): Promise<{ qrCodeUrl: string; uniqueId: string; verificationUrl: string }> {
    try {
      // Generate the QR code URL and verification data
      const qrCodeUrl = QRCodeService.generateQRCodeURL(data);
      const verificationData = QRCodeService.generateSoilTestingURL(data);
      
      return {
        qrCodeUrl,
        uniqueId: verificationData.uniqueId,
        verificationUrl: verificationData.verificationUrl
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback to simple text-based QR code
      const fallbackId = QRCodeService.generateTextQRCode(data);
      return {
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${fallbackId}`,
        uniqueId: fallbackId,
        verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/soil-verification/${fallbackId}`
      };
    }
  }

  /**
   * Send rejection SMS
   */
  private async sendRejectionSMS(phone: string, reason: string): Promise<void> {
    try {
      const message = `Your soil testing request has been rejected. Reason: ${reason}. Please contact support for assistance.`;
      await NotificationService.sendSMS({ recipient: phone, message });
    } catch (error) {
      console.error('Failed to send rejection SMS:', error);
    }
  }

  /**
   * Send approval SMS
   */
  private async sendApprovalSMS(phone: string, date: string, startTime: string, endTime: string): Promise<void> {
    try {
      const message = `Your soil testing request has been approved! Scheduled for ${date} from ${startTime} to ${endTime}. You will receive a QR code shortly.`;
      await NotificationService.sendSMS({ recipient: phone, message });
    } catch (error) {
      console.error('Failed to send approval SMS:', error);
    }
  }

  /**
   * Send schedule confirmation SMS
   */
  private async sendScheduleConfirmationSMS(phone: string, date: string, qrCodeUrl: string, uniqueId: string): Promise<void> {
    try {
      const message = `Your soil testing has been scheduled for ${date}. QR Code: ${qrCodeUrl}. Unique ID: ${uniqueId}. Please show this to the field officer.`;
      await NotificationService.sendSMS({ recipient: phone, message });
    } catch (error) {
      console.error('Failed to send schedule confirmation SMS:', error);
    }
  }
}

export default new SoilTestingSchedulingService();
