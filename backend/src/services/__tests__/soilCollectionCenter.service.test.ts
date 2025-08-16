import SoilCollectionCenterModel from '../../models/SoilCollectionCenter';
import { SoilCollectionCenter, SoilCollectionCenterCreateData, SoilCollectionCenterUpdateData } from '../../types';
import SoilCollectionCenterService from '../soilCollectionCenter';

describe('SoilCollectionCenterService', () => {
  let mockCenter: SoilCollectionCenter;
  let mockCenterData: SoilCollectionCenterCreateData;

  beforeEach(() => {
    mockCenter = {
      id: 1,
      name: 'Test Center',
      location_id: 1,
      address: 'Test Address',
      contact_number: '1234567890',
      contact_person: 'Test Person',
      description: 'Test Description',
      operating_hours: '9:00-17:00',
      services_offered: 'Soil Testing',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    } as SoilCollectionCenter;

    mockCenterData = {
      name: 'Test Center',
      location_id: 1,
      address: 'Test Address',
      contact_number: '1234567890',
      contact_person: 'Test Person',
      description: 'Test Description',
      operating_hours: '9:00-17:00',
      services_offered: 'Soil Testing'
    };

    // Mock the model static methods
    jest.spyOn(SoilCollectionCenterModel, 'create').mockResolvedValue(mockCenter);
    jest.spyOn(SoilCollectionCenterModel, 'findById').mockResolvedValue(mockCenter);
    jest.spyOn(SoilCollectionCenterModel, 'update').mockResolvedValue(true);
    jest.spyOn(SoilCollectionCenterModel, 'search').mockResolvedValue({
      data: [mockCenter],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    });
    jest.spyOn(SoilCollectionCenterModel, 'getAll').mockResolvedValue({
      data: [mockCenter],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    });
    jest.spyOn(SoilCollectionCenterModel, 'getByLocation').mockResolvedValue([mockCenter]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCenter', () => {
    it('should create a soil collection center successfully', async () => {
      const result = await SoilCollectionCenterService.createCenter(mockCenterData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Soil collection center created successfully');
      expect(result.data).toEqual(mockCenter);
      expect(SoilCollectionCenterModel.create).toHaveBeenCalledWith(mockCenterData);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(SoilCollectionCenterModel, 'create').mockRejectedValue(new Error('Database error'));

      const result = await SoilCollectionCenterService.createCenter(mockCenterData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create soil collection center. Please try again.');
      expect(result.data).toBeNull();
    });
  });

  describe('getCenter', () => {
    it('should return center by id', async () => {
      const result = await SoilCollectionCenterService.getCenter(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Soil collection center retrieved successfully');
      expect(result.data).toEqual(mockCenter);
      expect(SoilCollectionCenterModel.findById).toHaveBeenCalledWith(1);
    });

    it('should return error if center not found', async () => {
      jest.spyOn(SoilCollectionCenterModel, 'findById').mockResolvedValue(null);

      const result = await SoilCollectionCenterService.getCenter(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Soil collection center not found');
      expect(result.data).toBeNull();
    });
  });

  describe('updateCenter', () => {
    const updateData: SoilCollectionCenterUpdateData = {
      name: 'Updated Center',
      description: 'Updated Description'
    };

    it('should update center successfully', async () => {
      const result = await SoilCollectionCenterService.updateCenter(1, updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Soil collection center updated successfully');
      expect(result.data).toEqual(mockCenter);
      expect(SoilCollectionCenterModel.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return error if center not found', async () => {
      jest.spyOn(SoilCollectionCenterModel, 'findById').mockResolvedValue(null);

      const result = await SoilCollectionCenterService.updateCenter(999, updateData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Soil collection center not found');
      expect(result.data).toBeNull();
    });

    it('should handle update failure', async () => {
      jest.spyOn(SoilCollectionCenterModel, 'update').mockResolvedValue(false);

      const result = await SoilCollectionCenterService.updateCenter(1, updateData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update soil collection center. Please try again.');
      expect(result.data).toBeNull();
    });
  });

  describe('deleteCenter', () => {
    it('should delete center successfully', async () => {
      jest.spyOn(SoilCollectionCenterModel, 'delete').mockResolvedValue(true);

      const result = await SoilCollectionCenterService.deleteCenter(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Soil collection center deactivated successfully');
      expect(result.data).toBeNull();
      expect(SoilCollectionCenterModel.delete).toHaveBeenCalledWith(1);
    });

    it('should return error if center not found', async () => {
      jest.spyOn(SoilCollectionCenterModel, 'findById').mockResolvedValue(null);

      const result = await SoilCollectionCenterService.deleteCenter(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Soil collection center not found');
      expect(result.data).toBeNull();
    });

    it('should handle delete failure', async () => {
      jest.spyOn(SoilCollectionCenterModel, 'delete').mockResolvedValue(false);

      const result = await SoilCollectionCenterService.deleteCenter(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to delete soil collection center. Please try again.');
      expect(result.data).toBeNull();
    });
  });

  describe('getAllCenters', () => {
    it('should return all centers', async () => {
      const result = await SoilCollectionCenterService.getAllCenters();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Soil collection centers retrieved successfully');
      expect(result.data).toEqual({
        data: [mockCenter],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });
      expect(SoilCollectionCenterModel.getAll).toHaveBeenCalledWith(1, 10);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(SoilCollectionCenterModel, 'getAll').mockRejectedValue(new Error('Database error'));

      const result = await SoilCollectionCenterService.getAllCenters();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve soil collection centers. Please try again.');
      expect(result.data).toBeNull();
    });
  });

  describe('searchCenters', () => {
    it('should search centers with given criteria', async () => {
      const searchParams = {
        name: 'Test',
        province: 'Western',
        district: 'Colombo',
        is_active: true
      };

      const result = await SoilCollectionCenterService.searchCenters(searchParams);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Soil collection centers retrieved successfully');
      expect(result.data).toEqual({
        data: [mockCenter],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });
      expect(SoilCollectionCenterModel.search).toHaveBeenCalledWith(searchParams);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(SoilCollectionCenterModel, 'search').mockRejectedValue(new Error('Database error'));

      const result = await SoilCollectionCenterService.searchCenters({});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to search soil collection centers. Please try again.');
      expect(result.data).toBeNull();
    });
  });

  describe('getCentersByLocation', () => {
    it('should return centers by location', async () => {
      const result = await SoilCollectionCenterService.getCentersByLocation(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Soil collection centers retrieved successfully');
      expect(result.data).toEqual([mockCenter]);
      expect(SoilCollectionCenterModel.getByLocation).toHaveBeenCalledWith(1);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(SoilCollectionCenterModel, 'getByLocation').mockRejectedValue(new Error('Database error'));

      const result = await SoilCollectionCenterService.getCentersByLocation(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve soil collection centers. Please try again.');
      expect(result.data).toBeNull();
    });
  });
});