import FieldOfficerModel from '../models/FieldOfficer';
import FieldOfficerContactRequestModel from '../models/FieldOfficerContactRequest';
import { FieldOfficerContactRequestCreate, FieldOfficerContactRequestUpdate } from '../types';

class FieldOfficerService {
  /**
   * Get all field officers with pagination
   */
  static async getAllFieldOfficers(page: number = 1, limit: number = 10) {
    return await FieldOfficerModel.search({ is_active: true, page, limit });
  }

  /**
   * Get field officer by ID
   */
  static async getFieldOfficerById(id: number) {
    return await FieldOfficerModel.findById(id);
  }

  /**
   * Get field officers by specialization
   */
  static async getFieldOfficersBySpecialization(specialization: string, page: number = 1, limit: number = 10) {
    return await FieldOfficerModel.search({ 
      specialization, 
      is_active: true, 
      page, 
      limit 
    });
  }

  /**
   * Get field officers by location (province/district)
   */
  static async getFieldOfficersByLocation(provinceId?: number, districtId?: number, page: number = 1, limit: number = 10) {
    const searchParams: any = { is_active: true, page, limit };
    
    if (provinceId) {
      searchParams.assigned_province_id = provinceId;
    }
    
    if (districtId) {
      searchParams.assigned_district_id = districtId;
    }
    
    return await FieldOfficerModel.search(searchParams);
  }

  /**
   * Search field officers with multiple criteria
   */
  static async searchFieldOfficers(params: any, page: number = 1, limit: number = 10) {
    return await FieldOfficerModel.search({ ...params, is_active: true, page, limit });
  }

  /**
   * Get available specializations
   */
  static async getAvailableSpecializations() {
    const allOfficers = await FieldOfficerModel.search({ is_active: true, page: 1, limit: 1000 });
    
    const specializations = new Set<string>();
    allOfficers.data.forEach(officer => {
      if (officer.specialization) {
        specializations.add(officer.specialization);
      }
    });
    
    return Array.from(specializations);
  }

  /**
   * Test method to check basic table access
   */
  static async testBasicAccess() {
    return await FieldOfficerModel.testBasicAccess();
  }

  /**
   * Test search method with no parameters
   */
  static async testSearchNoParams() {
    return await FieldOfficerModel.search({});
  }

  /**
   * Create a field officer contact request (farmer)
   */
  static async createContactRequest(data: FieldOfficerContactRequestCreate): Promise<number> {
    // Validate that the field officer exists and is active
    const fieldOfficer = await FieldOfficerModel.findById(data.field_officer_id);
    if (!fieldOfficer) {
      throw new Error('Field officer not found');
    }
    
    if (!fieldOfficer.is_active) {
      throw new Error('Field officer is not active');
    }

    // Check if farmer already has a pending request for the same field officer
    const existingRequests = await FieldOfficerContactRequestModel.search({
      farmer_id: data.farmer_id,
      field_officer_id: data.field_officer_id,
      status: 'pending'
    });

    if (existingRequests.data.length > 0) {
      throw new Error('You already have a pending request for this field officer');
    }

    return await FieldOfficerContactRequestModel.create(data);
  }

  /**
   * Get farmer's contact requests
   */
  static async getFarmerContactRequests(farmerId: number, page: number = 1, limit: number = 10) {
    return await FieldOfficerContactRequestModel.getByFarmer(farmerId, page, limit);
  }

  /**
   * Get field officer's contact requests
   */
  static async getFieldOfficerContactRequests(fieldOfficerId: number, page: number = 1, limit: number = 10) {
    return await FieldOfficerContactRequestModel.getByFieldOfficer(fieldOfficerId, page, limit);
  }

  /**
   * Get contact request by ID
   */
  static async getContactRequestById(id: number) {
    return await FieldOfficerContactRequestModel.findById(id);
  }

  /**
   * Update contact request status (admin/field officer)
   */
  static async updateContactRequest(id: number, data: FieldOfficerContactRequestUpdate): Promise<boolean> {
    return await FieldOfficerContactRequestModel.update(id, data);
  }

  /**
   * Get pending contact requests (admin)
   */
  static async getPendingContactRequests(page: number = 1, limit: number = 10) {
    return await FieldOfficerContactRequestModel.getPending(page, limit);
  }

  /**
   * Get contact requests by urgency level (admin)
   */
  static async getContactRequestsByUrgency(urgencyLevel: string, page: number = 1, limit: number = 10) {
    return await FieldOfficerContactRequestModel.getByUrgencyLevel(urgencyLevel, page, limit);
  }

  /**
   * Assign contact request to field officer (admin)
   */
  static async assignContactRequest(requestId: number, adminId: number, adminNotes?: string): Promise<boolean> {
    const request = await FieldOfficerContactRequestModel.findById(requestId);
    if (!request) {
      throw new Error('Contact request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not in pending status');
    }

    return await FieldOfficerContactRequestModel.update(requestId, {
      status: 'in_progress',
      admin_notes: adminNotes,
      assigned_by: adminId,
      assigned_at: new Date()
    });
  }

  /**
   * Complete contact request (field officer)
   */
  static async completeContactRequest(requestId: number): Promise<boolean> {
    const request = await FieldOfficerContactRequestModel.findById(requestId);
    if (!request) {
      throw new Error('Contact request not found');
    }

    if (request.status !== 'in_progress') {
      throw new Error('Request is not in progress');
    }

    return await FieldOfficerContactRequestModel.update(requestId, {
      status: 'completed',
      completed_at: new Date()
    });
  }

  /**
   * Reject contact request (admin)
   */
  static async rejectContactRequest(requestId: number, adminId: number, rejectionReason: string, adminNotes?: string): Promise<boolean> {
    const request = await FieldOfficerContactRequestModel.findById(requestId);
    if (!request) {
      throw new Error('Contact request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not in pending status');
    }

    return await FieldOfficerContactRequestModel.update(requestId, {
      status: 'rejected',
      rejection_reason: rejectionReason,
      admin_notes: adminNotes,
      assigned_by: adminId,
      assigned_at: new Date()
    });
  }

  /**
   * Get contact request statistics (admin)
   */
  static async getContactRequestStatistics() {
    const allRequests = await FieldOfficerContactRequestModel.search({ page: 1, limit: 10000 });
    
    const stats = {
      total: allRequests.data.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
      by_urgency: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      }
    };

    allRequests.data.forEach(request => {
      stats[request.status]++;
      stats.by_urgency[request.urgency_level]++;
    });

    return stats;
  }
}

export default FieldOfficerService;
