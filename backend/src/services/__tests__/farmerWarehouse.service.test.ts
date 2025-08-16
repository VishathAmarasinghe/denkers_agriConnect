import FarmerWarehouseService from '../farmerWarehouse';
import FarmerWarehouseRequestModel from '../../models/FarmerWarehouseRequest';
import { FarmerWarehouseRequestCreate, FarmerWarehouseRequest } from '../../types';

describe('FarmerWarehouseService', () => {
  let mockRequest: FarmerWarehouseRequest;
  let mockRequestData: FarmerWarehouseRequestCreate;

  beforeEach(() => {
    mockRequest = {
      id: 1,
      farmer_id: 1,
      warehouse_id: 1,
      request_type: 'storage',
      item_name: 'Rice',
      quantity: 1000,
      storage_duration_days: 30,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    } as FarmerWarehouseRequest;

    mockRequestData = {
      farmer_id: 1,
      warehouse_id: 1,
      request_type: 'storage',
      item_name: 'Rice',
      quantity: 1000,
      storage_duration_days: 30
    };

    // Mock the model static methods
    jest.spyOn(FarmerWarehouseRequestModel, 'search').mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    });
    jest.spyOn(FarmerWarehouseRequestModel, 'create').mockResolvedValue(1);
    jest.spyOn(FarmerWarehouseRequestModel, 'findById').mockResolvedValue(mockRequest);
    jest.spyOn(FarmerWarehouseRequestModel, 'update').mockResolvedValue(true);
    jest.spyOn(FarmerWarehouseRequestModel, 'getByFarmer').mockResolvedValue({
      data: [mockRequest],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWarehouseRequest', () => {
    it('should create a warehouse request successfully', async () => {
      const result = await FarmerWarehouseService.createWarehouseRequest(mockRequestData);

      expect(result).toBe(1);
      expect(FarmerWarehouseRequestModel.create).toHaveBeenCalledTimes(1);
      expect(FarmerWarehouseRequestModel.create).toHaveBeenCalledWith(mockRequestData);
    });

    it('should throw error if storage duration exceeds 90 days', async () => {
      const requestData = {
        ...mockRequestData,
        storage_duration_days: 100
      };

      await expect(FarmerWarehouseService.createWarehouseRequest(requestData))
        .rejects.toThrow('Storage duration cannot exceed 90 days for temporary storage');
    });

    it('should throw error if farmer has pending request', async () => {
      jest.spyOn(FarmerWarehouseRequestModel, 'search').mockResolvedValue({
        data: [mockRequest],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });

      await expect(FarmerWarehouseService.createWarehouseRequest(mockRequestData))
        .rejects.toThrow('You already have a pending request for this warehouse');
    });
  });

  describe('getFarmerRequests', () => {
    it('should return farmer warehouse requests', async () => {
      const result = await FarmerWarehouseService.getFarmerRequests(1);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockRequest);
      expect(FarmerWarehouseRequestModel.getByFarmer).toHaveBeenCalledWith(1, 1, 10);
    });
  });

  describe('approveWarehouseRequest', () => {
    it('should approve warehouse request successfully', async () => {
      const result = await FarmerWarehouseService.approveWarehouseRequest(1, 1, 'Approved');

      expect(result).toBe(true);
      expect(FarmerWarehouseRequestModel.update).toHaveBeenCalledTimes(1);
      expect(FarmerWarehouseRequestModel.update).toHaveBeenCalledWith(1, expect.objectContaining({
        status: 'approved',
        admin_notes: 'Approved',
        approved_by: 1
      }));
    });

    it('should throw error if request not found', async () => {
      jest.spyOn(FarmerWarehouseRequestModel, 'findById').mockResolvedValue(null);

      await expect(FarmerWarehouseService.approveWarehouseRequest(999, 1))
        .rejects.toThrow('Warehouse request not found');
    });

    it('should throw error if request not pending', async () => {
      jest.spyOn(FarmerWarehouseRequestModel, 'findById').mockResolvedValue({
        ...mockRequest,
        status: 'approved'
      });

      await expect(FarmerWarehouseService.approveWarehouseRequest(1, 1))
        .rejects.toThrow('Request is not in pending status');
    });
  });
});