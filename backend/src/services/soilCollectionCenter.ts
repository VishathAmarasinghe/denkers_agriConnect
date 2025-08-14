import { SoilCollectionCenterServiceInterface } from '../types';
import { 
  SoilCollectionCenter, 
  SoilCollectionCenterCreateData, 
  SoilCollectionCenterUpdateData,
  SoilCollectionCenterSearchParams,
  PaginatedResponse,
  ApiResponse
} from '../types';
import SoilCollectionCenterModel from '../models/SoilCollectionCenter';
import ResponseService from './response';

class SoilCollectionCenterService implements SoilCollectionCenterServiceInterface {
  /**
   * Create a new soil collection center
   */
  async createCenter(data: SoilCollectionCenterCreateData): Promise<ApiResponse> {
    try {
      const center = await SoilCollectionCenterModel.create(data);
      
      return {
        success: true,
        message: 'Soil collection center created successfully',
        data: center
      };
    } catch (error) {
      console.error('Create center error:', error);
      return {
        success: false,
        message: 'Failed to create soil collection center. Please try again.',
        data: null
      };
    }
  }

  /**
   * Update an existing soil collection center
   */
  async updateCenter(id: number, data: SoilCollectionCenterUpdateData): Promise<ApiResponse> {
    try {
      // Check if center exists
      const existingCenter = await SoilCollectionCenterModel.findById(id);
      if (!existingCenter) {
        return {
          success: false,
          message: 'Soil collection center not found',
          data: null
        };
      }

      const updated = await SoilCollectionCenterModel.update(id, data);
      if (!updated) {
        return {
          success: false,
          message: 'Failed to update soil collection center. Please try again.',
          data: null
        };
      }

      // Get updated center
      const updatedCenter = await SoilCollectionCenterModel.findById(id);
      
      return {
        success: true,
        message: 'Soil collection center updated successfully',
        data: updatedCenter
      };
    } catch (error) {
      console.error('Update center error:', error);
      return {
        success: false,
        message: 'Failed to update soil collection center. Please try again.',
        data: null
      };
    }
  }

  /**
   * Delete (deactivate) a soil collection center
   */
  async deleteCenter(id: number): Promise<ApiResponse> {
    try {
      // Check if center exists
      const existingCenter = await SoilCollectionCenterModel.findById(id);
      if (!existingCenter) {
        return {
          success: false,
          message: 'Soil collection center not found',
          data: null
        };
      }

      const deleted = await SoilCollectionCenterModel.delete(id);
      if (!deleted) {
        return {
          success: false,
          message: 'Failed to delete soil collection center. Please try again.',
          data: null
        };
      }

      return {
        success: true,
        message: 'Soil collection center deactivated successfully',
        data: null
      };
    } catch (error) {
      console.error('Delete center error:', error);
      return {
        success: false,
        message: 'Failed to delete soil collection center. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get a soil collection center by ID
   */
  async getCenter(id: number): Promise<ApiResponse> {
    try {
      const center = await SoilCollectionCenterModel.findById(id);
      
      if (!center) {
        return {
          success: false,
          message: 'Soil collection center not found',
          data: null
        };
      }

      return {
        success: true,
        message: 'Soil collection center retrieved successfully',
        data: center
      };
    } catch (error) {
      console.error('Get center error:', error);
      return {
        success: false,
        message: 'Failed to retrieve soil collection center. Please try again.',
        data: null
      };
    }
  }

  /**
   * Search soil collection centers with filters and pagination
   */
  async searchCenters(params: SoilCollectionCenterSearchParams): Promise<ApiResponse> {
    try {
      const result = await SoilCollectionCenterModel.search(params);
      
      return {
        success: true,
        message: 'Soil collection centers retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Search centers error:', error);
      return {
        success: false,
        message: 'Failed to search soil collection centers. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get all soil collection centers with pagination
   */
  async getAllCenters(page: number = 1, limit: number = 10): Promise<ApiResponse> {
    try {
      const result = await SoilCollectionCenterModel.getAll(page, limit);
      
      return {
        success: true,
        message: 'Soil collection centers retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Get all centers error:', error);
      return {
        success: false,
        message: 'Failed to retrieve soil collection centers. Please try again.',
        data: null
      };
    }
  }

  /**
   * Get centers by location
   */
  async getCentersByLocation(locationId: number): Promise<ApiResponse> {
    try {
      const centers = await SoilCollectionCenterModel.getByLocation(locationId);
      
      return {
        success: true,
        message: 'Soil collection centers retrieved successfully',
        data: centers
      };
    } catch (error) {
      console.error('Get centers by location error:', error);
      return {
        success: false,
        message: 'Failed to retrieve soil collection centers. Please try again.',
        data: null
      };
    }
  }
}

export default new SoilCollectionCenterService();
