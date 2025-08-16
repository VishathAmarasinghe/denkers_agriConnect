import { expect, jest, it, beforeEach, describe } from '@jest/globals';
import EquipmentRentalService from '../equipmentRental';
import { EquipmentModel } from '../../models/Equipment';
import { EquipmentCategoryModel } from '../../models/EquipmentCategory';
import { EquipmentAvailabilityModel } from '../../models/EquipmentAvailability';
import { EquipmentRentalRequestModel } from '../../models/EquipmentRentalRequest';
import NotificationService from '../notification';
import { Equipment, EquipmentCreate, EquipmentUpdate, EquipmentRentalRequestCreate } from '../../types';

// Mock all models
jest.mock('../../models/Equipment');
jest.mock('../../models/EquipmentCategory');
jest.mock('../../models/EquipmentAvailability');
jest.mock('../../models/EquipmentRentalRequest');
jest.mock('../notification');

const MockedEquipmentModel = EquipmentModel as jest.Mocked<typeof EquipmentModel>;
const MockedEquipmentCategoryModel = EquipmentCategoryModel as jest.Mocked<typeof EquipmentCategoryModel>;
const MockedEquipmentAvailabilityModel = EquipmentAvailabilityModel as jest.Mocked<typeof EquipmentAvailabilityModel>;
const MockedEquipmentRentalRequestModel = EquipmentRentalRequestModel as jest.Mocked<typeof EquipmentRentalRequestModel>;
const MockedNotificationService = NotificationService as jest.Mocked<typeof NotificationService>;

describe('EquipmentRentalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEquipment', () => {
    const mockEquipmentData: EquipmentCreate = {
      name: 'Test Tractor',
      description: 'Test tractor description',
      category_id: 1,
      daily_rate: 100,
      weekly_rate: 600,
      contact_number: '+1234567890',
      delivery_fee: 50,
      security_deposit: 200,
      specifications: { horsepower: 50, fuel_type: 'diesel' }
    };

    const mockCreatedEquipment: Equipment = {
      id: 1,
      name: 'Test Tractor',
      description: 'Test tractor description',
      category_id: 1,
      daily_rate: 100,
      weekly_rate: 600,
      contact_number: '+1234567890',
      delivery_fee: 50,
      security_deposit: 200,
      specifications: { horsepower: 50, fuel_type: 'diesel' },
      is_available: true,
      is_active: true,
      current_status: 'available',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      category_name: 'Tractors',
      category_description: 'Agricultural tractors'
    };

    it('should create equipment successfully when name does not exist in category', async () => {
      MockedEquipmentModel.nameExistsInCategory.mockResolvedValue(false);
      MockedEquipmentModel.create.mockResolvedValue(mockCreatedEquipment);

      const result = await EquipmentRentalService.createEquipment(mockEquipmentData);

      expect(MockedEquipmentModel.nameExistsInCategory).toHaveBeenCalledWith(mockEquipmentData.name, mockEquipmentData.category_id);
      expect(MockedEquipmentModel.create).toHaveBeenCalledWith(mockEquipmentData);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Equipment created successfully');
      expect(result.data).toEqual(mockCreatedEquipment);
    });

    it('should return error when equipment name already exists in category', async () => {
      MockedEquipmentModel.nameExistsInCategory.mockResolvedValue(true);

      const result = await EquipmentRentalService.createEquipment(mockEquipmentData);

      expect(MockedEquipmentModel.nameExistsInCategory).toHaveBeenCalledWith(mockEquipmentData.name, mockEquipmentData.category_id);
      expect(MockedEquipmentModel.create).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Equipment name already exists in this category');
    });

    it('should handle database errors gracefully', async () => {
      MockedEquipmentModel.nameExistsInCategory.mockResolvedValue(false);
      MockedEquipmentModel.create.mockRejectedValue(new Error('Database error'));

      const result = await EquipmentRentalService.createEquipment(mockEquipmentData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create equipment. Please try again.');
    });
  });

  describe('getAllEquipment', () => {
    const mockEquipmentData = {
      data: [
        {
          id: 1,
          name: 'Equipment 1',
          category_id: 1,
          daily_rate: 100,
          weekly_rate: 600,
          contact_number: '+1234567890',
          delivery_fee: 50,
          security_deposit: 200,
          is_available: true,
          is_active: true,
          current_status: 'available' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          category_name: 'Tractors',
          category_description: 'Agricultural tractors'
        },
        {
          id: 2,
          name: 'Equipment 2',
          category_id: 1,
          daily_rate: 150,
          weekly_rate: 900,
          contact_number: '+1234567891',
          delivery_fee: 50,
          security_deposit: 200,
          is_available: true,
          is_active: true,
          current_status: 'available' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          category_name: 'Tractors',
          category_description: 'Agricultural tractors'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    };

    it('should return all equipment', async () => {
      MockedEquipmentModel.getAll.mockResolvedValue(mockEquipmentData);

      const result = await EquipmentRentalService.getAllEquipment();

      expect(MockedEquipmentModel.getAll).toHaveBeenCalledWith(1, 10);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Equipment retrieved successfully');
      expect(result.data).toEqual(mockEquipmentData);
    });

    it('should handle empty equipment list', async () => {
      const emptyData = { data: [] as Equipment[], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      MockedEquipmentModel.getAll.mockResolvedValue(emptyData);

      const result = await EquipmentRentalService.getAllEquipment();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(emptyData);
    });
  });

  describe('getEquipmentByCategory', () => {
    const mockEquipmentData = {
      data: [
        {
          id: 1,
          name: 'Tractor 1',
          category_id: 1,
          daily_rate: 100,
          weekly_rate: 600,
          contact_number: '+1234567890',
          delivery_fee: 50,
          security_deposit: 200,
          is_available: true,
          is_active: true,
          current_status: 'available' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          category_name: 'Tractors',
          category_description: 'Agricultural tractors'
        },
        {
          id: 2,
          name: 'Tractor 2',
          category_id: 1,
          daily_rate: 150,
          weekly_rate: 900,
          contact_number: '+1234567891',
          delivery_fee: 50,
          security_deposit: 200,
          is_available: true,
          is_active: true,
          current_status: 'available' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          category_name: 'Tractors',
          category_description: 'Agricultural tractors'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    };

    it('should return equipment for given category', async () => {
      MockedEquipmentModel.getByCategory.mockResolvedValue(mockEquipmentData);

      const result = await EquipmentRentalService.getEquipmentByCategory(1);

      expect(MockedEquipmentModel.getByCategory).toHaveBeenCalledWith(1, 1, 10);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Equipment by category retrieved successfully');
      expect(result.data).toEqual(mockEquipmentData);
    });
  });

  describe('updateEquipment', () => {
    const mockUpdateData: EquipmentUpdate = {
      name: 'New Name',
      description: 'New Description',
      daily_rate: 150,
      category_id: 1
    };

    const mockUpdatedEquipment: Equipment = {
      id: 1,
      name: 'New Name',
      description: 'New Description',
      category_id: 1,
      daily_rate: 150,
      weekly_rate: 600,
      contact_number: '+1234567890',
      delivery_fee: 50,
      security_deposit: 200,
      is_available: true,
      is_active: true,
      current_status: 'available',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      category_name: 'Tractors',
      category_description: 'Agricultural tractors'
    };

    it('should update equipment successfully when name is unique in category', async () => {
      MockedEquipmentModel.nameExistsInCategory.mockResolvedValue(false);
      MockedEquipmentModel.update.mockResolvedValue(mockUpdatedEquipment);

      const result = await EquipmentRentalService.updateEquipment(1, mockUpdateData);

      expect(MockedEquipmentModel.nameExistsInCategory).toHaveBeenCalledWith('New Name', 1, 1);
      expect(MockedEquipmentModel.update).toHaveBeenCalledWith(1, mockUpdateData);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Equipment updated successfully');
      expect(result.data).toEqual(mockUpdatedEquipment);
    });

    it('should update equipment when name is not being changed', async () => {
      const updateDataWithoutName: EquipmentUpdate = { description: 'New Description', daily_rate: 150 };
      MockedEquipmentModel.update.mockResolvedValue(mockUpdatedEquipment);

      const result = await EquipmentRentalService.updateEquipment(1, updateDataWithoutName);

      expect(MockedEquipmentModel.nameExistsInCategory).not.toHaveBeenCalled();
      expect(MockedEquipmentModel.update).toHaveBeenCalledWith(1, updateDataWithoutName);
      expect(result.success).toBe(true);
    });

    it('should return error when new name already exists in category', async () => {
      MockedEquipmentModel.nameExistsInCategory.mockResolvedValue(true);

      const result = await EquipmentRentalService.updateEquipment(1, mockUpdateData);

      expect(MockedEquipmentModel.nameExistsInCategory).toHaveBeenCalledWith('New Name', 1, 1);
      expect(MockedEquipmentModel.update).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Equipment name already exists in this category');
    });
  });

  describe('getAllCategories', () => {
    const mockCategoriesData = {
      data: [
        { id: 1, name: 'Tractors', description: 'Agricultural tractors', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: 2, name: 'Harvesters', description: 'Grain harvesters', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    };

    it('should return all equipment categories', async () => {
      MockedEquipmentCategoryModel.getAll.mockResolvedValue(mockCategoriesData);

      const result = await EquipmentRentalService.getAllCategories();

      expect(MockedEquipmentCategoryModel.getAll).toHaveBeenCalledWith(1, 10);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Equipment categories retrieved successfully');
      expect(result.data).toEqual(mockCategoriesData);
    });
  });

  describe('getActiveCategories', () => {
    const mockActiveCategories = [
      { id: 1, name: 'Tractors', description: 'Agricultural tractors', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'Harvesters', description: 'Grain harvesters', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
    ];

    it('should return active equipment categories', async () => {
      MockedEquipmentCategoryModel.getActive.mockResolvedValue(mockActiveCategories);

      const result = await EquipmentRentalService.getActiveCategories();

      expect(MockedEquipmentCategoryModel.getActive).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Active equipment categories retrieved successfully');
      expect(result.data).toEqual(mockActiveCategories);
    });
  });

  describe('createRentalRequest', () => {
    const mockRentalData: EquipmentRentalRequestCreate = {
      equipment_id: 1,
      start_date: '2024-01-01',
      end_date: '2024-01-03',
      receiver_name: 'John Doe',
      receiver_phone: '+1234567890',
      delivery_address: '123 Farm Road',
      additional_notes: 'Please deliver early morning'
    };

    const mockCreatedRequest = {
      id: 1,
      farmer_id: 1,
      equipment_id: 1,
      start_date: '2024-01-01',
      end_date: '2024-01-03',
      rental_duration: 3,
      total_amount: 350,
      delivery_fee: 50,
      security_deposit: 200,
      receiver_name: 'John Doe',
      receiver_phone: '+1234567890',
      delivery_address: '123 Farm Road',
      additional_notes: 'Please deliver early morning',
      status: 'pending' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      farmer_name: 'John Farmer',
      equipment_name: 'Test Tractor',
      category_name: 'Tractors'
    };

    it('should create rental request successfully when equipment is available', async () => {
      const mockAvailability = {
        is_available: true,
        unavailable_dates: [] as string[],
        available_dates: ['2024-01-01', '2024-01-02', '2024-01-03']
      };

      MockedEquipmentAvailabilityModel.checkAvailability.mockResolvedValue(mockAvailability);
      MockedEquipmentRentalRequestModel.create.mockResolvedValue(mockCreatedRequest);

      const result = await EquipmentRentalService.createRentalRequest(mockRentalData, 1);

      expect(MockedEquipmentAvailabilityModel.checkAvailability).toHaveBeenCalledWith(1, '2024-01-01', '2024-01-03');
      expect(MockedEquipmentRentalRequestModel.create).toHaveBeenCalledWith(mockRentalData, 1);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Rental request created successfully');
      expect(result.data).toEqual(mockCreatedRequest);
    });

    it('should return error when equipment is not available for requested dates', async () => {
      const mockAvailability = {
        is_available: false,
        unavailable_dates: ['2024-01-02'],
        available_dates: ['2024-01-01', '2024-01-03']
      };

      MockedEquipmentAvailabilityModel.checkAvailability.mockResolvedValue(mockAvailability);

      const result = await EquipmentRentalService.createRentalRequest(mockRentalData, 1);

      expect(MockedEquipmentAvailabilityModel.checkAvailability).toHaveBeenCalledWith(1, '2024-01-01', '2024-01-03');
      expect(MockedEquipmentRentalRequestModel.create).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.message).toContain('Equipment is not available for the selected dates');
    });
  });

  describe('getFarmerRentalRequests', () => {
    const mockRequestsData = {
      data: [
        { 
          id: 1, 
          equipment_id: 1, 
          farmer_id: 1, 
          start_date: '2024-01-01',
          end_date: '2024-01-03',
          rental_duration: 3,
          total_amount: 350,
          delivery_fee: 50,
          security_deposit: 200,
          receiver_name: 'John Doe',
          receiver_phone: '+1234567890',
          delivery_address: '123 Farm Road',
          status: 'pending' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          equipment_name: 'Tractor 1',
          farmer_name: 'John Farmer',
          category_name: 'Tractors'
        },
        { 
          id: 2, 
          equipment_id: 2, 
          farmer_id: 1, 
          start_date: '2024-01-05',
          end_date: '2024-01-07',
          rental_duration: 3,
          total_amount: 450,
          delivery_fee: 50,
          security_deposit: 200,
          receiver_name: 'John Doe',
          receiver_phone: '+1234567890',
          delivery_address: '123 Farm Road',
          status: 'approved' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          equipment_name: 'Tractor 2',
          farmer_name: 'John Farmer',
          category_name: 'Tractors'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    };

    it('should return rental requests for given farmer', async () => {
      MockedEquipmentRentalRequestModel.getByFarmer.mockResolvedValue(mockRequestsData);

      const result = await EquipmentRentalService.getFarmerRentalRequests(1);

      expect(MockedEquipmentRentalRequestModel.getByFarmer).toHaveBeenCalledWith(1, 1, 10);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Farmer rental requests retrieved successfully');
      expect(result.data).toEqual(mockRequestsData);
    });
  });

  describe('getAllRentalRequests', () => {
    const mockRequestsData = {
      data: [
        { 
          id: 1, 
          equipment_id: 1, 
          farmer_id: 1, 
          start_date: '2024-01-01',
          end_date: '2024-01-03',
          rental_duration: 3,
          total_amount: 350,
          delivery_fee: 50,
          security_deposit: 200,
          receiver_name: 'John Doe',
          receiver_phone: '+1234567890',
          delivery_address: '123 Farm Road',
          status: 'pending' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          equipment_name: 'Tractor 1',
          farmer_name: 'John Farmer',
          category_name: 'Tractors'
        },
        { 
          id: 2, 
          equipment_id: 2, 
          farmer_id: 2, 
          start_date: '2024-01-05',
          end_date: '2024-01-07',
          rental_duration: 3,
          total_amount: 450,
          delivery_fee: 50,
          security_deposit: 200,
          receiver_name: 'Jane Doe',
          receiver_phone: '+1234567891',
          delivery_address: '456 Farm Road',
          status: 'approved' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          equipment_name: 'Tractor 2',
          farmer_name: 'Jane Farmer',
          category_name: 'Tractors'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    };

    it('should return all rental requests', async () => {
      MockedEquipmentRentalRequestModel.getAll.mockResolvedValue(mockRequestsData);

      const result = await EquipmentRentalService.getAllRentalRequests();

      expect(MockedEquipmentRentalRequestModel.getAll).toHaveBeenCalledWith(1, 10);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Rental requests retrieved successfully');
      expect(result.data).toEqual(mockRequestsData);
    });
  });

  describe('checkEquipmentAvailability', () => {
    const mockAvailability = {
      is_available: true,
      unavailable_dates: [] as string[],
      available_dates: ['2024-01-01', '2024-01-02', '2024-01-03']
    };

    it('should check equipment availability for given dates', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-03';
      MockedEquipmentAvailabilityModel.checkAvailability.mockResolvedValue(mockAvailability);

      const result = await EquipmentRentalService.checkEquipmentAvailability(1, startDate, endDate);

      expect(MockedEquipmentAvailabilityModel.checkAvailability).toHaveBeenCalledWith(1, startDate, endDate);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Equipment availability checked successfully');
      expect(result.data).toEqual(mockAvailability);
    });
  });

  describe('setEquipmentAvailability', () => {
    it('should set equipment as available for specified dates', async () => {
      const equipmentId = 1;
      const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
      const isAvailable = true;
      const reason = 'Equipment ready';

      MockedEquipmentAvailabilityModel.setAvailable.mockResolvedValue();

      const result = await EquipmentRentalService.setEquipmentAvailability(equipmentId, dates, isAvailable, reason);

      expect(MockedEquipmentAvailabilityModel.setAvailable).toHaveBeenCalledWith(equipmentId, dates);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Equipment availability set to available for specified dates');
    });

    it('should set equipment as unavailable for specified dates', async () => {
      const equipmentId = 1;
      const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
      const isAvailable = false;
      const reason = 'Maintenance';

      MockedEquipmentAvailabilityModel.setUnavailable.mockResolvedValue();

      const result = await EquipmentRentalService.setEquipmentAvailability(equipmentId, dates, isAvailable, reason);

      expect(MockedEquipmentAvailabilityModel.setUnavailable).toHaveBeenCalledWith(equipmentId, dates, reason);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Equipment availability set to unavailable for specified dates');
    });
  });

  describe('getEquipmentAvailabilitySummary', () => {
    const mockSummary = {
      total_dates: 30,
      available_dates: 25,
      unavailable_dates: 5,
      availability_percentage: 83.33
    };

    it('should return equipment availability summary', async () => {
      const equipmentId = 1;
      const dateFrom = '2024-01-01';
      const dateTo = '2024-01-30';
      
      MockedEquipmentAvailabilityModel.getAvailabilitySummary.mockResolvedValue(mockSummary);

      const result = await EquipmentRentalService.getEquipmentAvailabilitySummary(equipmentId, dateFrom, dateTo);

      expect(MockedEquipmentAvailabilityModel.getAvailabilitySummary).toHaveBeenCalledWith(equipmentId, dateFrom, dateTo);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Equipment availability summary retrieved successfully');
      expect(result.data).toEqual(mockSummary);
    });
  });

  describe('getAvailableEquipment', () => {
    const mockAvailableEquipmentData = {
      data: [
        {
          id: 1,
          name: 'Available Tractor',
          category_id: 1,
          daily_rate: 100,
          weekly_rate: 600,
          contact_number: '+1234567890',
          delivery_fee: 50,
          security_deposit: 200,
          is_available: true,
          is_active: true,
          current_status: 'available' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          category_name: 'Tractors',
          category_description: 'Agricultural tractors'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    };

    it('should return available equipment', async () => {
      MockedEquipmentModel.getAvailable.mockResolvedValue(mockAvailableEquipmentData);

      const result = await EquipmentRentalService.getAvailableEquipment();

      expect(MockedEquipmentModel.getAvailable).toHaveBeenCalledWith(1, 10);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Available equipment retrieved successfully');
      expect(result.data).toEqual(mockAvailableEquipmentData);
    });
  });

  describe('getAvailableEquipmentWithDates', () => {
    const mockEquipmentData = {
      data: [
        {
          id: 1,
          name: 'Available Tractor',
          category_id: 1,
          daily_rate: 100,
          weekly_rate: 600,
          contact_number: '+1234567890',
          delivery_fee: 50,
          security_deposit: 200,
          is_available: true,
          is_active: true,
          current_status: 'available' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          category_name: 'Tractors',
          category_description: 'Agricultural tractors'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    };

    const mockAvailability = {
      is_available: true,
      unavailable_dates: [] as string[],
      available_dates: ['2024-01-01', '2024-01-02', '2024-01-03']
    };

    it('should return available equipment with availability dates', async () => {
      MockedEquipmentModel.getAvailable.mockResolvedValue(mockEquipmentData);
      MockedEquipmentAvailabilityModel.checkAvailability.mockResolvedValue(mockAvailability);

      const result = await EquipmentRentalService.getAvailableEquipmentWithDates('2024-01-01', '2024-01-03');

      expect(MockedEquipmentModel.getAvailable).toHaveBeenCalledWith(1, 10);
      expect(MockedEquipmentAvailabilityModel.checkAvailability).toHaveBeenCalledWith(1, '2024-01-01', '2024-01-03');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Available equipment with dates retrieved successfully');
      expect(result.data.data[0]).toHaveProperty('equipment_id');
      expect(result.data.data[0]).toHaveProperty('available_dates');
      expect(result.data.data[0]).toHaveProperty('unavailable_dates');
    });
  });
});
