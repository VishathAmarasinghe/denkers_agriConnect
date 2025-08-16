import { expect, jest, it, beforeEach, describe } from '@jest/globals';
import WarehouseService from '../warehouse';
import WarehouseModel from '../../models/Warehouse';
import WarehouseCategoryModel from '../../models/WarehouseCategory';
import WarehouseImageModel from '../../models/WarehouseImage';
import WarehouseInventoryModel from '../../models/WarehouseInventory';
import WarehouseAvailabilityModel from '../../models/WarehouseAvailability';
import WarehouseTimeSlotModel from '../../models/WarehouseTimeSlot';
import WarehouseBookingModel from '../../models/WarehouseBooking';
import { WarehouseCreateData, WarehouseUpdateData, WarehouseSearchParams, WarehouseImageCreate, WarehouseInventoryCreate, WarehouseAvailabilityCreate, WarehouseTimeSlotCreate, WarehouseBookingCreate } from '../../types';

// Mock all dependencies
jest.mock('../../models/Warehouse');
jest.mock('../../models/WarehouseCategory');
jest.mock('../../models/WarehouseImage');
jest.mock('../../models/WarehouseInventory');
jest.mock('../../models/WarehouseAvailability');
jest.mock('../../models/WarehouseTimeSlot');
jest.mock('../../models/WarehouseBooking');
jest.mock('../notification');

const MockedWarehouseModel = WarehouseModel as jest.Mocked<typeof WarehouseModel>;
const MockedWarehouseCategoryModel = WarehouseCategoryModel as jest.Mocked<typeof WarehouseCategoryModel>;
const MockedWarehouseImageModel = WarehouseImageModel as jest.Mocked<typeof WarehouseImageModel>;
const MockedWarehouseInventoryModel = WarehouseInventoryModel as jest.Mocked<typeof WarehouseInventoryModel>;
const MockedWarehouseAvailabilityModel = WarehouseAvailabilityModel as jest.Mocked<typeof WarehouseAvailabilityModel>;
const MockedWarehouseTimeSlotModel = WarehouseTimeSlotModel as jest.Mocked<typeof WarehouseTimeSlotModel>;
const MockedWarehouseBookingModel = WarehouseBookingModel as jest.Mocked<typeof WarehouseBookingModel>;

describe('WarehouseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWarehouse', () => {
    const mockWarehouseData: WarehouseCreateData = {
      name: 'Test Warehouse',
      contact_person_name: 'John Doe',
      contact_person_number: '+1234567890',
      fixed_space_amount: 1000,
      category_id: 1,
      address: '123 Test St',
      province_id: 1,
      district_id: 1
    };

    it('should create warehouse successfully when name is unique', async () => {
      MockedWarehouseModel.nameExists.mockResolvedValue(false);
      MockedWarehouseModel.create.mockResolvedValue(1);

      const result = await WarehouseService.createWarehouse(mockWarehouseData);

      expect(MockedWarehouseModel.nameExists).toHaveBeenCalledWith(mockWarehouseData.name);
      expect(MockedWarehouseModel.create).toHaveBeenCalledWith(mockWarehouseData);
      expect(result).toBe(1);
    });

    it('should throw error when warehouse name already exists', async () => {
      MockedWarehouseModel.nameExists.mockResolvedValue(true);

      await expect(WarehouseService.createWarehouse(mockWarehouseData))
        .rejects
        .toThrow('Warehouse name already exists');
    });

    it('should handle database errors gracefully', async () => {
      MockedWarehouseModel.nameExists.mockResolvedValue(false);
      MockedWarehouseModel.create.mockRejectedValue(new Error('Database error'));

      await expect(WarehouseService.createWarehouse(mockWarehouseData))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getWarehouse', () => {
    const mockWarehouse = {
      id: 1,
      name: 'Test Warehouse',
      contact_person_name: 'John Doe',
      contact_person_number: '+1234567890',
      fixed_space_amount: 1000,
      category_id: 1,
      address: '123 Test St',
      province_id: 1,
      district_id: 1,
      is_available: true
    };

    const mockImages = [
      { id: 1, warehouse_id: 1, image_url: 'image1.jpg', is_primary: false },
      { id: 2, warehouse_id: 1, image_url: 'image2.jpg', is_primary: true }
    ];

    const mockPrimaryImage = { id: 2, warehouse_id: 1, image_url: 'image2.jpg', is_primary: true };

    it('should return warehouse with images when warehouse exists', async () => {
      MockedWarehouseModel.findById.mockResolvedValue(mockWarehouse as any);
      MockedWarehouseImageModel.getByWarehouse.mockResolvedValue(mockImages as any);
      MockedWarehouseImageModel.getPrimaryByWarehouse.mockResolvedValue(mockPrimaryImage as any);

      const result = await WarehouseService.getWarehouse(1);

      expect(MockedWarehouseModel.findById).toHaveBeenCalledWith(1);
      expect(MockedWarehouseImageModel.getByWarehouse).toHaveBeenCalledWith(1);
      expect(MockedWarehouseImageModel.getPrimaryByWarehouse).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        ...mockWarehouse,
        images: mockImages,
        primary_image: mockPrimaryImage
      });
    });

    it('should handle missing images gracefully', async () => {
      MockedWarehouseModel.findById.mockResolvedValue(mockWarehouse as any);
      MockedWarehouseImageModel.getByWarehouse.mockResolvedValue([]);
      MockedWarehouseImageModel.getPrimaryByWarehouse.mockResolvedValue(null);

      const result = await WarehouseService.getWarehouse(1);

      expect(result).toEqual({
        ...mockWarehouse,
        images: [],
        primary_image: null
      });
    });

    it('should throw error when warehouse not found', async () => {
      MockedWarehouseModel.findById.mockResolvedValue(null);

      await expect(WarehouseService.getWarehouse(999))
        .rejects
        .toThrow('Warehouse not found');
    });
  });

  describe('updateWarehouse', () => {
    const mockExistingWarehouse = {
      id: 1,
      name: 'Existing Warehouse',
      contact_person_name: 'John Doe',
      contact_person_number: '+1234567890',
      fixed_space_amount: 1000,
      category_id: 1,
      address: '123 Test St',
      province_id: 1,
      district_id: 1,
      is_available: true
    };

    const mockUpdateData: WarehouseUpdateData = {
      name: 'Updated Warehouse',
      description: 'Updated description'
    };

    it('should update warehouse successfully when warehouse exists and name is unique', async () => {
      MockedWarehouseModel.findById.mockResolvedValue(mockExistingWarehouse as any);
      MockedWarehouseModel.nameExists.mockResolvedValue(false);
      MockedWarehouseModel.update.mockResolvedValue(true);

      const result = await WarehouseService.updateWarehouse(1, mockUpdateData);

      expect(MockedWarehouseModel.findById).toHaveBeenCalledWith(1);
      expect(MockedWarehouseModel.nameExists).toHaveBeenCalledWith(mockUpdateData.name!, 1);
      expect(MockedWarehouseModel.update).toHaveBeenCalledWith(1, mockUpdateData);
      expect(result).toBe(true);
    });

    it('should update warehouse when name is not being changed', async () => {
      const updateDataWithoutName = { description: 'New Description' };
      MockedWarehouseModel.findById.mockResolvedValue(mockExistingWarehouse as any);
      MockedWarehouseModel.update.mockResolvedValue(true);

      const result = await WarehouseService.updateWarehouse(1, updateDataWithoutName);

      expect(MockedWarehouseModel.findById).toHaveBeenCalledWith(1);
      expect(MockedWarehouseModel.nameExists).not.toHaveBeenCalled();
      expect(MockedWarehouseModel.update).toHaveBeenCalledWith(1, updateDataWithoutName);
      expect(result).toBe(true);
    });

    it('should throw error when warehouse not found', async () => {
      MockedWarehouseModel.findById.mockResolvedValue(null);

      await expect(WarehouseService.updateWarehouse(999, mockUpdateData))
        .rejects
        .toThrow('Warehouse not found');
    });

    it('should throw error when new name already exists', async () => {
      MockedWarehouseModel.findById.mockResolvedValue(mockExistingWarehouse as any);
      MockedWarehouseModel.nameExists.mockResolvedValue(true);

      await expect(WarehouseService.updateWarehouse(1, mockUpdateData))
        .rejects
        .toThrow('Warehouse name already exists');
    });
  });

  describe('deleteWarehouse', () => {
    const mockExistingWarehouse = {
      id: 1,
      name: 'Test Warehouse',
      contact_person_name: 'John Doe',
      contact_person_number: '+1234567890',
      fixed_space_amount: 1000,
      category_id: 1,
      address: '123 Test St',
      province_id: 1,
      district_id: 1,
      is_available: true
    };

    it('should delete warehouse successfully when warehouse exists', async () => {
      MockedWarehouseModel.findById.mockResolvedValue(mockExistingWarehouse as any);
      MockedWarehouseModel.delete.mockResolvedValue(true);

      const result = await WarehouseService.deleteWarehouse(1);

      expect(MockedWarehouseModel.findById).toHaveBeenCalledWith(1);
      expect(MockedWarehouseModel.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw error when warehouse not found', async () => {
      MockedWarehouseModel.findById.mockResolvedValue(null);

      await expect(WarehouseService.deleteWarehouse(999))
        .rejects
        .toThrow('Warehouse not found');
    });
  });

  describe('searchWarehouses', () => {
    const mockSearchParams: WarehouseSearchParams = {
      name: 'Test',
      category_id: 1,
      is_available: true
    };

    const mockSearchResults = [
      { id: 1, name: 'Test Warehouse 1' },
      { id: 2, name: 'Test Warehouse 2' }
    ];

    it('should search warehouses with given parameters', async () => {
      MockedWarehouseModel.search.mockResolvedValue(mockSearchResults as any);

      const result = await WarehouseService.searchWarehouses(mockSearchParams);

      expect(MockedWarehouseModel.search).toHaveBeenCalledWith(mockSearchParams);
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle empty search results', async () => {
      MockedWarehouseModel.search.mockResolvedValue([] as never);

      const result = await WarehouseService.searchWarehouses(mockSearchParams);

      expect(result).toEqual([]);
    });
  });

  describe('getAllWarehouses', () => {
    const mockWarehouses = [
      { id: 1, name: 'Warehouse 1' },
      { id: 2, name: 'Warehouse 2' }
    ];

    it('should return all warehouses', async () => {
      MockedWarehouseModel.getAll.mockResolvedValue(mockWarehouses as any);

      const result = await WarehouseService.getAllWarehouses();

      expect(MockedWarehouseModel.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockWarehouses as any);
    });

    it('should handle empty warehouse list', async () => {
      MockedWarehouseModel.getAll.mockResolvedValue([] as never);

      const result = await WarehouseService.getAllWarehouses();

      expect(result).toEqual([]);
    });
  });

  describe('getWarehouseCategories', () => {
    const mockCategories = [
      { id: 1, name: 'Category 1', description: 'Description 1' },
      { id: 2, name: 'Category 2', description: 'Description 2' }
    ];

    it('should return all warehouse categories', async () => {
      MockedWarehouseCategoryModel.findAll.mockResolvedValue(mockCategories);

      const result = await WarehouseService.getAllWarehouseCategories();

      expect(MockedWarehouseCategoryModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });



  describe('addWarehouseImage', () => {
    const mockImageData: WarehouseImageCreate = {
      warehouse_id: 1,
      image_url: 'test-image.jpg',
      image_name: 'Test Image',
      is_primary: false
    };

    it('should add warehouse image successfully', async () => {
      MockedWarehouseModel.findById.mockResolvedValue({
        id: 1,
        name: 'Test Warehouse',
        contact_person_name: 'John Doe',
        contact_person_number: '+1234567890',
        warehouse_status: 'open',
        fixed_space_amount: 1000,
        security_level: 'high',
        category_id: 1,
        address: '123 Test St',
        province_id: 1,
        district_id: 1,
        is_available: true
      });
      MockedWarehouseImageModel.create.mockResolvedValue(1);

      const result = await WarehouseService.addWarehouseImage(mockImageData);

      expect(MockedWarehouseModel.findById).toHaveBeenCalledWith(mockImageData.warehouse_id);
      expect(MockedWarehouseImageModel.create).toHaveBeenCalledWith(mockImageData);
      expect(result).toBe(1);
    });
  });



  describe('getAvailableTimeSlots', () => {
    const date = new Date('2024-01-01');
    const mockTimeSlots = [
      { 
        id: 1, 
        warehouse_id: 1, 
        date: new Date('2024-01-01'),
        start_time: '09:00', 
        end_time: '10:00', 
        is_available: true,
        max_bookings: 5,
        current_bookings: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      { 
        id: 2, 
        warehouse_id: 1, 
        date: new Date('2024-01-01'),
        start_time: '10:00', 
        end_time: '11:00', 
        is_available: true,
        max_bookings: 5,
        current_bookings: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    it('should return available time slots for warehouse and date', async () => {
      MockedWarehouseModel.findById.mockResolvedValue({
        id: 1,
        name: 'Test Warehouse',
        contact_person_name: 'John Doe',
        contact_person_number: '+1234567890',
        warehouse_status: 'open',
        fixed_space_amount: 1000,
        security_level: 'high',
        category_id: 1,
        address: '123 Test St',
        province_id: 1,
        district_id: 1,
        is_available: true
      });
      MockedWarehouseAvailabilityModel.checkAvailability.mockResolvedValue(true);
      MockedWarehouseTimeSlotModel.getAvailableTimeSlots.mockResolvedValue(mockTimeSlots);

      const result = await WarehouseService.getAvailableTimeSlots(1, date);

      expect(MockedWarehouseModel.findById).toHaveBeenCalledWith(1);
      expect(MockedWarehouseTimeSlotModel.getAvailableTimeSlots).toHaveBeenCalledWith(1, date);
      expect(result).toEqual({
        warehouse_id: 1,
        date: date,
        available_time_slots: mockTimeSlots
      });
    });
  });

  describe('createWarehouseBooking', () => {
    const mockBookingData: WarehouseBookingCreate = {
      farmer_id: 1,
      warehouse_id: 1,
      time_slot_id: 1,
      farmer_name: 'John Doe',
      farmer_mobile: '+1234567890',
      farmer_contact: '+1234567890',
      storage_requirements: 'Cold storage needed'
    };

    it('should create warehouse booking successfully', async () => {
      MockedWarehouseModel.findById.mockResolvedValue({
        id: 1,
        name: 'Test Warehouse',
        contact_person_name: 'John Doe',
        contact_person_number: '+1234567890',
        warehouse_status: 'open',
        fixed_space_amount: 1000,
        security_level: 'high',
        category_id: 1,
        address: '123 Test St',
        province_id: 1,
        district_id: 1,
        is_available: true
      });
      MockedWarehouseTimeSlotModel.findById.mockResolvedValue({
        id: 1,
        warehouse_id: 1,
        date: new Date(),
        start_time: '09:00',
        end_time: '10:00',
        is_available: true,
        max_bookings: 5,
        current_bookings: 0,
        created_at: new Date(),
        updated_at: new Date()
      });
      MockedWarehouseBookingModel.create.mockResolvedValue(1);

      const result = await WarehouseService.createWarehouseBooking(mockBookingData);

      expect(MockedWarehouseModel.findById).toHaveBeenCalledWith(mockBookingData.warehouse_id);
      expect(MockedWarehouseBookingModel.create).toHaveBeenCalledWith(mockBookingData);
      expect(result).toBe(1);
    });

    it('should throw error when warehouse does not exist', async () => {
      MockedWarehouseModel.findById.mockResolvedValue(null);

      await expect(WarehouseService.createWarehouseBooking(mockBookingData))
        .rejects
        .toThrow('Warehouse not found');
    });
  });

  describe('getWarehouseBookings', () => {
    const mockBookings = [
      { id: 1, warehouse_id: 1, farmer_id: 1, date: '2024-01-01', status: 'pending' },
      { id: 2, warehouse_id: 1, farmer_id: 2, date: '2024-01-02', status: 'approved' }
    ];

    it('should return warehouse bookings', async () => {
      MockedWarehouseBookingModel.getByWarehouse.mockResolvedValue(mockBookings as any);

      const result = await WarehouseService.getWarehouseBookings(1);

      expect(MockedWarehouseBookingModel.getByWarehouse).toHaveBeenCalledWith(1, 1, 10);
      expect(result).toEqual(mockBookings);
    });
  });
});
