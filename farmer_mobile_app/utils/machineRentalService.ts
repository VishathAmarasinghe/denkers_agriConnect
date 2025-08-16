import { APIService } from './apiService';

// Types for machine rental operations
export interface EquipmentCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: number;
  name: string;
  category_id: number;
  description?: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate?: number;
  contact_number: string;
  delivery_fee: number;
  security_deposit: number;
  equipment_image_url?: string;
  specifications?: any;
  maintenance_notes?: string;
  is_available: boolean;
  is_active: boolean;
  current_status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_description?: string;
}

export interface EquipmentAvailability {
  equipment_id: number;
  start_date: string;
  end_date: string;
  available_dates: string[];
  unavailable_dates: string[];
  is_available: boolean;
  unavailable_reasons?: { [date: string]: string };
}

export interface EquipmentRentalRequest {
  id: number;
  farmer_id: number;
  equipment_id: number;
  start_date: string;
  end_date: string;
  rental_duration: number;
  total_amount: number;
  delivery_fee: number;
  security_deposit: number;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  additional_notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'active' | 'completed' | 'returned';
  admin_notes?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: string;
  pickup_qr_code_url?: string;
  pickup_qr_code_data?: string;
  return_qr_code_url?: string;
  return_qr_code_data?: string;
  pickup_confirmed_at?: string;
  return_confirmed_at?: string;
  created_at: string;
  updated_at: string;
  farmer_name?: string;
  equipment_name?: string;
  category_name?: string;
  approved_by_name?: string;
}

export interface CreateRentalRequestData {
  equipment_id: number;
  start_date: string;
  end_date: string;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  additional_notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number; // Changed from total_pages to match API response
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class MachineRentalService {
  private baseUrl = '/equipment-rental';

  // ==================== EQUIPMENT CATEGORIES ====================

  /**
   * Get all equipment categories
   */
  async getCategories(page: number = 1, limit: number = 50): Promise<PaginatedResponse<EquipmentCategory>> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: `${this.baseUrl}/categories?page=${page}&limit=${limit}`,
      }) as ApiResponse<PaginatedResponse<EquipmentCategory>>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get active equipment categories
   */
  async getActiveCategories(): Promise<EquipmentCategory[]> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: `${this.baseUrl}/categories/active`,
      }) as ApiResponse<EquipmentCategory[]>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch active categories');
      }
    } catch (error) {
      console.error('Error fetching active categories:', error);
      throw error;
    }
  }

  // ==================== EQUIPMENT ====================

  /**
   * Get all equipment with pagination
   */
  async getEquipment(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Equipment>> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: `${this.baseUrl}/equipment?page=${page}&limit=${limit}`,
      }) as ApiResponse<PaginatedResponse<Equipment>>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch equipment');
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  }

  /**
   * Get available equipment
   */
  async getAvailableEquipment(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Equipment>> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: `${this.baseUrl}/equipment/available?page=${page}&limit=${limit}`,
      }) as ApiResponse<PaginatedResponse<Equipment>>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch available equipment');
      }
    } catch (error) {
      console.error('Error fetching available equipment:', error);
      throw error;
    }
  }

  /**
   * Get equipment by category
   */
  async getEquipmentByCategory(categoryId: number, page: number = 1, limit: number = 50): Promise<PaginatedResponse<Equipment>> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: `${this.baseUrl}/equipment?category_id=${categoryId}&page=${page}&limit=${limit}`,
      }) as ApiResponse<PaginatedResponse<Equipment> | Equipment[]>;
      
      if (response.success) {
        // Handle both paginated and direct array responses
        if (Array.isArray(response.data)) {
          // Direct array response - convert to paginated format
          return {
            data: response.data,
            pagination: {
              page: 1,
              limit: response.data.length,
              total: response.data.length,
              totalPages: 1
            }
          };
        } else {
          // Paginated response
          return response.data;
        }
      } else {
        throw new Error(response.message || 'Failed to fetch equipment by category');
      }
    } catch (error) {
      console.error('Error fetching equipment by category:', error);
      throw error;
    }
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(equipmentId: number): Promise<Equipment> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: `${this.baseUrl}/equipment/${equipmentId}`,
      }) as ApiResponse<Equipment>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch equipment details');
      }
    } catch (error) {
      console.error('Error fetching equipment details:', error);
      throw error;
    }
  }

  // ==================== EQUIPMENT AVAILABILITY ====================

  /**
   * Check equipment availability for specific dates
   */
  async checkEquipmentAvailability(equipmentId: number, startDate: string, endDate: string): Promise<EquipmentAvailability> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: `${this.baseUrl}/equipment/${equipmentId}/availability?start_date=${startDate}&end_date=${endDate}`,
      }) as ApiResponse<EquipmentAvailability>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to check equipment availability');
      }
    } catch (error) {
      console.error('Error checking equipment availability:', error);
      throw error;
    }
  }

  /**
   * Get available equipment with availability dates
   */
  async getAvailableEquipmentWithDates(dateFrom: string, dateTo: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<any>> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: `${this.baseUrl}/equipment/available-with-dates?date_from=${dateFrom}&date_to=${dateTo}&page=${page}&limit=${limit}`,
      }) as ApiResponse<PaginatedResponse<any>>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch available equipment with dates');
      }
    } catch (error) {
      console.error('Error fetching available equipment with dates:', error);
      throw error;
    }
  }

  // ==================== RENTAL REQUESTS ====================

  /**
   * Create a new rental request
   */
  async createRentalRequest(requestData: CreateRentalRequestData): Promise<EquipmentRentalRequest> {
    try {
      const response = await APIService.makeRequest({
        method: 'POST',
        url: `${this.baseUrl}/requests`,
        data: requestData,
      }) as ApiResponse<EquipmentRentalRequest>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create rental request');
      }
    } catch (error) {
      console.error('Error creating rental request:', error);
      throw error;
    }
  }

  /**
   * Get farmer's rental requests
   */
  async getMyRentalRequests(page: number = 1, limit: number = 20): Promise<PaginatedResponse<EquipmentRentalRequest>> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: `${this.baseUrl}/requests/my-requests?page=${page}&limit=${limit}`,
      }) as ApiResponse<PaginatedResponse<EquipmentRentalRequest>>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch rental requests');
      }
    } catch (error) {
      console.error('Error fetching rental requests:', error);
      throw error;
    }
  }

  /**
   * Get rental request by ID
   */
  async getRentalRequestById(requestId: number): Promise<EquipmentRentalRequest> {
    try {
      const response = await APIService.makeRequest({
        method: 'GET',
        url: `${this.baseUrl}/requests/${requestId}`,
      }) as ApiResponse<EquipmentRentalRequest>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch rental request');
      }
    } catch (error) {
      console.error('Error fetching rental request:', error);
      throw error;
    }
  }

  /**
   * Cancel a rental request
   */
  async cancelRentalRequest(requestId: number): Promise<EquipmentRentalRequest> {
    try {
      const response = await APIService.makeRequest({
        method: 'PUT',
        url: `${this.baseUrl}/requests/${requestId}`,
        data: { status: 'cancelled' },
      }) as ApiResponse<EquipmentRentalRequest>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to cancel rental request');
      }
    } catch (error) {
      console.error('Error cancelling rental request:', error);
      throw error;
    }
  }
}

export default new MachineRentalService();
