import { EquipmentCategoryModel } from '../models/EquipmentCategory';
import { EquipmentModel } from '../models/Equipment';
import { EquipmentAvailabilityModel } from '../models/EquipmentAvailability';
import { EquipmentRentalRequestModel } from '../models/EquipmentRentalRequest';
import NotificationService from './notification';
import { ApiResponse } from '../types';
import QRCodeService from './qrCode';
import { 
  EquipmentCategory, EquipmentCategoryCreate, EquipmentCategoryUpdate, EquipmentCategorySearchParams,
  Equipment, EquipmentCreate, EquipmentUpdate, EquipmentSearchParams,
  EquipmentAvailability, EquipmentAvailabilityCreate, EquipmentAvailabilityUpdate, EquipmentAvailabilitySearchParams,
  EquipmentRentalRequest, EquipmentRentalRequestCreate, EquipmentRentalRequestUpdate, EquipmentRentalRequestSearchParams,
  AvailableEquipmentResponse
} from '../types';

class EquipmentRentalService {

  /**
   * Create equipment category (Admin only)
   */
  async createCategory(categoryData: EquipmentCategoryCreate): Promise<ApiResponse> {
    try {
      // Check if category name already exists
      const nameExists = await EquipmentCategoryModel.nameExists(categoryData.name);
      if (nameExists) {
        return {
          success: false,
          message: 'Category name already exists',
          data: null
        };
      }

      const category = await EquipmentCategoryModel.create(categoryData);
      
      return {
        success: true,
        message: 'Equipment category created successfully',
        data: category
      };
    } catch (error) {
      console.error('Create category error:', error);
      return {
        success: false,
        message: 'Failed to create equipment category. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get all equipment categories
   */
  async getAllCategories(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await EquipmentCategoryModel.getAll(page, limit);
      
      return {
        success: true,
        message: 'Equipment categories retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get categories error:', error);
      return {
        success: false,
        message: 'Failed to retrieve equipment categories. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get active equipment categories
   */
  async getActiveCategories(): Promise<ApiResponse> {
    try {
      const categories = await EquipmentCategoryModel.getActive();
      
      return {
        success: true,
        message: 'Active equipment categories retrieved successfully',
        data: categories
      };
    } catch (error) {
      console.error('Get active categories error:', error);
      return {
        success: false,
        message: 'Failed to retrieve active categories. Please try again.',
        data: null
      };
    }
  }

  /**
   * Update equipment category (Admin only)
   */
  async updateCategory(id: number, updateData: EquipmentCategoryUpdate): Promise<ApiResponse> {
    try {
      // Check if name exists (excluding current category)
      if (updateData.name) {
        const nameExists = await EquipmentCategoryModel.nameExists(updateData.name, id);
        if (nameExists) {
          return {
            success: false,
            message: 'Category name already exists',
            data: null
          };
        }
      }

      const category = await EquipmentCategoryModel.update(id, updateData);
      
      return {
        success: true,
        message: 'Equipment category updated successfully',
        data: category
      };
    } catch (error) {
      console.error('Update category error:', error);
      return {
        success: false,
        message: 'Failed to update equipment category. Please try again.',
        data: null
      };
    }
  }

  /**
   * Activate equipment category (Admin only)
   */
  async activateCategory(id: number): Promise<ApiResponse> {
    try {
      const category = await EquipmentCategoryModel.activate(id);
      
      return {
        success: true,
        message: 'Equipment category activated successfully',
        data: category
      };
    } catch (error) {
      console.error('Activate category error:', error);
      return {
        success: false,
        message: 'Failed to activate equipment category. Please try again.',
        data: null
      };
    }
  }

  /**
   * Deactivate equipment category (Admin only)
   */
  async deactivateCategory(id: number): Promise<ApiResponse> {
    try {
      const category = await EquipmentCategoryModel.deactivate(id);
      
      return {
        success: true,
        message: 'Equipment category deactivated successfully',
        data: category
      };
    } catch (error) {
      console.error('Deactivate category error:', error);
      return {
        success: false,
        message: 'Failed to deactivate equipment category. Please try again.',
        data: null
      };
    }
  }

  // ==================== EQUIPMENT ====================

  /**
   * Create equipment (Admin only)
   */
  async createEquipment(equipmentData: EquipmentCreate): Promise<ApiResponse> {
    try {
      // Check if equipment name already exists in category
      const nameExists = await EquipmentModel.nameExistsInCategory(equipmentData.name, equipmentData.category_id);
      if (nameExists) {
        return {
          success: false,
          message: 'Equipment name already exists in this category',
          data: null
        };
      }

      const equipment = await EquipmentModel.create(equipmentData);
      
      return {
        success: true,
        message: 'Equipment created successfully',
        data: equipment
      };
    } catch (error) {
      console.error('Create equipment error:', error);
      return {
        success: false,
        message: 'Failed to create equipment. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get all equipment
   */
  async getAllEquipment(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await EquipmentModel.getAll(page, limit);
      
      return {
        success: true,
        message: 'Equipment retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get equipment error:', error);
      return {
        success: false,
        message: 'Failed to retrieve equipment. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get available equipment
   */
  async getAvailableEquipment(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await EquipmentModel.getAvailable(page, limit);
      
      return {
        success: true,
        message: 'Available equipment retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get available equipment error:', error);
      return {
        success: false,
        message: 'Failed to retrieve available equipment. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get equipment by category
   */
  async getEquipmentByCategory(categoryId: number, page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await EquipmentModel.getByCategory(categoryId, page, limit);
      
      return {
        success: true,
        message: 'Equipment by category retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get equipment by category error:', error);
      return {
        success: false,
        message: 'Failed to retrieve equipment by category. Please try again.',
        data: null
      };
    }
  }

  /**
   * Update equipment (Admin only)
   */
  async updateEquipment(id: number, updateData: EquipmentUpdate): Promise<ApiResponse> {
    try {
      // Check if name exists in category (excluding current equipment)
      if (updateData.name && updateData.category_id) {
        const nameExists = await EquipmentModel.nameExistsInCategory(updateData.name, updateData.category_id, id);
        if (nameExists) {
          return {
            success: false,
            message: 'Equipment name already exists in this category',
            data: null
          };
        }
      }

      const equipment = await EquipmentModel.update(id, updateData);
      
      return {
        success: true,
        message: 'Equipment updated successfully',
        data: equipment
      };
    } catch (error) {
      console.error('Update equipment error:', error);
      return {
        success: false,
        message: 'Failed to update equipment. Please try again.',
        data: null
      };
    }
  }

  /**
   * Activate equipment (Admin only)
   */
  async activateEquipment(id: number): Promise<ApiResponse> {
    try {
      const equipment = await EquipmentModel.activate(id);
      
      return {
        success: true,
        message: 'Equipment activated successfully',
        data: equipment
      };
    } catch (error) {
      console.error('Activate equipment error:', error);
      return {
        success: false,
        message: 'Failed to activate equipment. Please try again.',
        data: null
      };
    }
  }

  /**
   * Deactivate equipment (Admin only)
   */
  async deactivateEquipment(id: number): Promise<ApiResponse> {
    try {
      const equipment = await EquipmentModel.deactivate(id);
      
      return {
        success: true,
        message: 'Equipment deactivated successfully',
        data: equipment
      };
    } catch (error) {
      console.error('Deactivate equipment error:', error);
      return {
        success: false,
        message: 'Failed to deactivate equipment. Please try again.',
        data: null
      };
    }
  }

  // ==================== EQUIPMENT AVAILABILITY ====================

  /**
   * Set equipment availability (Admin only)
   */
  async setEquipmentAvailability(equipmentId: number, dates: string[], isAvailable: boolean, reason?: string): Promise<ApiResponse> {
    try {
      if (isAvailable) {
        await EquipmentAvailabilityModel.setAvailable(equipmentId, dates);
      } else {
        await EquipmentAvailabilityModel.setUnavailable(equipmentId, dates, reason);
      }
      
      return {
        success: true,
        message: `Equipment availability set to ${isAvailable ? 'available' : 'unavailable'} for specified dates`,
        data: null
      };
    } catch (error) {
      console.error('Set equipment availability error:', error);
      return {
        success: false,
        message: 'Failed to set equipment availability. Please try again.',
        data: null
      };
    }
  }

  /**
   * Check equipment availability
   */
  async checkEquipmentAvailability(equipmentId: number, startDate: string, endDate: string): Promise<ApiResponse> {
    try {
      const availability = await EquipmentAvailabilityModel.checkAvailability(equipmentId, startDate, endDate);
      
      return {
        success: true,
        message: 'Equipment availability checked successfully',
        data: availability
      };
    } catch (error) {
      console.error('Check equipment availability error:', error);
      return {
        success: false,
        message: 'Failed to check equipment availability. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get equipment availability summary
   */
  async getEquipmentAvailabilitySummary(equipmentId: number, dateFrom: string, dateTo: string): Promise<ApiResponse> {
    try {
      const summary = await EquipmentAvailabilityModel.getAvailabilitySummary(equipmentId, dateFrom, dateTo);
      
      return {
        success: true,
        message: 'Equipment availability summary retrieved successfully',
        data: summary
      };
    } catch (error) {
      console.error('Get availability summary error:', error);
      return {
        success: false,
        message: 'Failed to get availability summary. Please try again.',
        data: null
      };
    }
  }

  // ==================== EQUIPMENT RENTAL REQUESTS ====================

  /**
   * Create rental request (Farmer only)
   */
  async createRentalRequest(requestData: EquipmentRentalRequestCreate, farmerId: number): Promise<ApiResponse> {
    try {
      // Check if equipment is available for the requested dates
      const availability = await EquipmentAvailabilityModel.checkAvailability(
        requestData.equipment_id, 
        requestData.start_date, 
        requestData.end_date
      );

      if (!availability.is_available) {
        return {
          success: false,
          message: `Equipment is not available for the selected dates. Unavailable dates: ${availability.unavailable_dates.join(', ')}`,
          data: null
        };
      }

      const request = await EquipmentRentalRequestModel.create(requestData, farmerId);
      
      return {
        success: true,
        message: 'Rental request created successfully',
        data: request
      };
    } catch (error) {
      console.error('Create rental request error:', error);
      return {
        success: false,
        message: 'Failed to create rental request. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get all rental requests (Admin only)
   */
  async getAllRentalRequests(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await EquipmentRentalRequestModel.getAll(page, limit);
      
      return {
        success: true,
        message: 'Rental requests retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get rental requests error:', error);
      return {
        success: false,
        message: 'Failed to retrieve rental requests. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get pending rental requests (Admin only)
   */
  async getPendingRentalRequests(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await EquipmentRentalRequestModel.getPending(page, limit);
      
      return {
        success: true,
        message: 'Pending rental requests retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get pending requests error:', error);
      return {
        success: false,
        message: 'Failed to retrieve pending requests. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get farmer's rental requests
   */
  async getFarmerRentalRequests(farmerId: number, page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await EquipmentRentalRequestModel.getByFarmer(farmerId, page, limit);
      
      return {
        success: true,
        message: 'Farmer rental requests retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get farmer requests error:', error);
      return {
        success: false,
        message: 'Failed to retrieve farmer requests. Please try again.',
        data: null
      };
    }
  }

  /**
   * Approve rental request (Admin only)
   */
  async approveRentalRequest(requestId: number, adminId: number, adminNotes?: string): Promise<ApiResponse> {
    try {
      const request = await EquipmentRentalRequestModel.findById(requestId);
      
      if (request.status !== 'pending') {
        return {
          success: false,
          message: 'Request is not in pending status',
          data: null
        };
      }

      // Generate pickup QR code using centralized service
      const pickupQRData = QRCodeService.generateEquipmentRentalQRCodeData(
        request.id,
        request.farmer_id,
        request.equipment_id,
        'pickup'
      );

      const pickupQRUrl = QRCodeService.generateEquipmentRentalQRCodeURL(pickupQRData);

      // Update request with approval details and QR code
      const updatedRequest = await EquipmentRentalRequestModel.update(requestId, {
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        admin_notes: adminNotes,
        pickup_qr_code_url: pickupQRUrl,
        pickup_qr_code_data: JSON.stringify(pickupQRData)
      });

      // Send SMS notification to farmer
      try {
        const verificationUrl = QRCodeService.generateEquipmentRentalVerificationURL(pickupQRData);
        const message = `Your equipment rental request for ${request.equipment_name} has been approved! Pickup verification: ${verificationUrl}`;
        await NotificationService.sendSMS({ 
          recipient: request.receiver_phone, 
          message 
        });
      } catch (error) {
        console.error('Failed to send approval SMS:', error);
      }

      return {
        success: true,
        message: 'Rental request approved successfully',
        data: updatedRequest
      };
    } catch (error) {
      console.error('Approve rental request error:', error);
      return {
        success: false,
        message: 'Failed to approve rental request. Please try again.',
        data: null
      };
    }
  }

  /**
   * Reject rental request (Admin only)
   */
  async rejectRentalRequest(requestId: number, adminId: number, rejectionReason: string, adminNotes?: string): Promise<ApiResponse> {
    try {
      const request = await EquipmentRentalRequestModel.findById(requestId);
      
      if (request.status !== 'pending') {
        return {
          success: false,
          message: 'Request is not in pending status',
          data: null
        };
      }

      // Update request with rejection details
      const updatedRequest = await EquipmentRentalRequestModel.update(requestId, {
        status: 'rejected',
        approved_by: adminId,
        approved_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        admin_notes: adminNotes,
        rejection_reason: rejectionReason
      });

      // Send SMS notification to farmer
      try {
        const message = `Your equipment rental request for ${request.equipment_name} has been rejected. Reason: ${rejectionReason}`;
        await NotificationService.sendSMS({ 
          recipient: request.receiver_phone, 
          message 
        });
      } catch (error) {
        console.error('Failed to send rejection SMS:', error);
      }

      return {
        success: true,
        message: 'Rental request rejected successfully',
        data: updatedRequest
      };
    } catch (error) {
      console.error('Reject rental request error:', error);
      return {
        success: false,
        message: 'Failed to reject rental request. Please try again.',
        data: null
      };
    }
  }

  /**
   * Confirm pickup (Admin only)
   */
  async confirmPickup(requestId: number): Promise<ApiResponse> {
    try {
      const request = await EquipmentRentalRequestModel.findById(requestId);
      
      if (request.status !== 'approved') {
        return {
          success: false,
          message: 'Request is not in approved status',
          data: null
        };
      }

      // Generate return QR code using centralized service
      const returnQRData = QRCodeService.generateEquipmentRentalQRCodeData(
        request.id,
        request.farmer_id,
        request.equipment_id,
        'return'
      );

      const returnQRUrl = QRCodeService.generateEquipmentRentalQRCodeURL(returnQRData);

      // Update request with pickup confirmation and return QR code
      const updatedRequest = await EquipmentRentalRequestModel.update(requestId, {
        pickup_confirmed_at: new Date().toISOString().split('T')[0],
        status: 'active',
        return_qr_code_url: returnQRUrl,
        return_qr_code_data: JSON.stringify(returnQRData)
      });

      // Send SMS notification to farmer
      try {
        const verificationUrl = QRCodeService.generateEquipmentRentalVerificationURL(returnQRData);
        const message = `Equipment pickup confirmed! Return verification: ${verificationUrl}`;
        await NotificationService.sendSMS({ 
          recipient: request.receiver_phone, 
          message 
        });
      } catch (error) {
        console.error('Failed to send pickup confirmation SMS:', error);
      }

      return {
        success: true,
        message: 'Equipment pickup confirmed successfully',
        data: updatedRequest
      };
    } catch (error) {
      console.error('Confirm pickup error:', error);
      return {
        success: false,
        message: 'Failed to confirm pickup. Please try again.',
        data: null
      };
    }
  }

  /**
   * Confirm return (Admin only)
   */
  async confirmReturn(requestId: number): Promise<ApiResponse> {
    try {
      const request = await EquipmentRentalRequestModel.findById(requestId);
      
      if (request.status !== 'active') {
        return {
          success: false,
          message: 'Request is not in active status',
          data: null
        };
      }

      // Update request with return confirmation
      const updatedRequest = await EquipmentRentalRequestModel.update(requestId, {
        return_confirmed_at: new Date().toISOString().split('T')[0],
        status: 'returned'
      });

      // Send SMS notification to farmer
      try {
        const message = `Equipment return confirmed! Thank you for using our service.`;
        await NotificationService.sendSMS({ 
          recipient: request.receiver_phone, 
          message 
        });
      } catch (error) {
        console.error('Failed to send return confirmation SMS:', error);
      }

      return {
        success: true,
        message: 'Equipment return confirmed successfully',
        data: updatedRequest
      };
    } catch (error) {
      console.error('Confirm return error:', error);
      return {
        success: false,
        message: 'Failed to confirm return. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get available equipment with availability dates
   */
  async getAvailableEquipmentWithDates(dateFrom: string, dateTo: string, page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await EquipmentModel.getAvailable(page, limit);
      
      // Add availability information for each equipment
      const equipmentWithAvailability: AvailableEquipmentResponse[] = [];
      
      for (const equipment of result.data) {
        const availability = await EquipmentAvailabilityModel.checkAvailability(
          equipment.id, 
          dateFrom, 
          dateTo
        );

        equipmentWithAvailability.push({
          equipment_id: equipment.id,
          equipment_name: equipment.name,
          category_name: equipment.category_name || '',
          daily_rate: equipment.daily_rate,
          weekly_rate: equipment.weekly_rate,
          monthly_rate: equipment.monthly_rate,
          delivery_fee: equipment.delivery_fee,
          security_deposit: equipment.security_deposit,
          available_dates: availability.available_dates,
          unavailable_dates: availability.unavailable_dates
        });
      }

      return {
        success: true,
        message: 'Available equipment with dates retrieved successfully',
        data: {
          data: equipmentWithAvailability,
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('Get available equipment with dates error:', error);
      return {
        success: false,
        message: 'Failed to retrieve available equipment with dates. Please try again.',
        data: null
      };
    }
  }
}

export default new EquipmentRentalService();
