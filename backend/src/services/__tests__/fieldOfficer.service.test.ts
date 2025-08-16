import FieldOfficerModel from '../../models/FieldOfficer';
import FieldOfficerContactRequestModel from '../../models/FieldOfficerContactRequest';
import { FieldOfficer, FieldOfficerContactRequest, FieldOfficerContactRequestCreate } from '../../types';
import FieldOfficerService from '../fieldOfficer';

describe('FieldOfficerService', () => {
  let mockFieldOfficer: FieldOfficer;
  let mockContactRequest: FieldOfficerContactRequest;
  let mockContactRequestData: FieldOfficerContactRequestCreate;

  beforeEach(() => {
    mockFieldOfficer = {
      id: 1,
      name: 'Test Officer',
      designation: 'Senior Field Officer',
      description: 'Experienced in crop management',
      center: 'Central Agricultural Center',
      phone_no: '1234567890',
      specialization: 'Crop Management',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    } as FieldOfficer;

    mockContactRequest = {
      id: 1,
      farmer_id: 1,
      field_officer_id: 1,
      farmer_name: 'Test Farmer',
      farmer_mobile: '1234567890',
      farmer_address: 'Test Address',
      current_issues: 'Need consultation',
      urgency_level: 'medium',
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    } as FieldOfficerContactRequest;

    mockContactRequestData = {
      farmer_id: 1,
      field_officer_id: 1,
      farmer_name: 'Test Farmer',
      farmer_mobile: '1234567890',
      farmer_address: 'Test Address',
      current_issues: 'Need consultation',
      urgency_level: 'medium'
    };

    // Mock the model static methods
    jest.spyOn(FieldOfficerModel, 'search').mockResolvedValue({
      data: [mockFieldOfficer],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    });
    jest.spyOn(FieldOfficerModel, 'findById').mockResolvedValue(mockFieldOfficer);
    jest.spyOn(FieldOfficerContactRequestModel, 'create').mockResolvedValue(1);
    jest.spyOn(FieldOfficerContactRequestModel, 'findById').mockResolvedValue(mockContactRequest);
    jest.spyOn(FieldOfficerContactRequestModel, 'getByFarmer').mockResolvedValue({
      data: [mockContactRequest],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    });
    jest.spyOn(FieldOfficerContactRequestModel, 'update').mockResolvedValue(true);
    jest.spyOn(FieldOfficerContactRequestModel, 'search').mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFieldOfficers', () => {
    it('should return all active field officers', async () => {
      const result = await FieldOfficerService.getAllFieldOfficers();

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockFieldOfficer);
      expect(FieldOfficerModel.search).toHaveBeenCalledWith({
        is_active: true,
        page: 1,
        limit: 10
      });
    });
  });

  describe('getFieldOfficerById', () => {
    it('should return field officer by id', async () => {
      const result = await FieldOfficerService.getFieldOfficerById(1);

      expect(result).toBeDefined();
      expect(result).toEqual(mockFieldOfficer);
      expect(FieldOfficerModel.findById).toHaveBeenCalledWith(1);
    });

    it('should return null if field officer not found', async () => {
      jest.spyOn(FieldOfficerModel, 'findById').mockResolvedValue(null);
      const result = await FieldOfficerService.getFieldOfficerById(999);
      expect(result).toBeNull();
    });
  });

  describe('createContactRequest', () => {
    it('should create contact request successfully', async () => {
      const result = await FieldOfficerService.createContactRequest(mockContactRequestData);

      expect(result).toBe(1);
      expect(FieldOfficerContactRequestModel.create).toHaveBeenCalledTimes(1);
      expect(FieldOfficerContactRequestModel.create).toHaveBeenCalledWith(mockContactRequestData);
    });

    it('should throw error if field officer not found', async () => {
      jest.spyOn(FieldOfficerModel, 'findById').mockResolvedValue(null);

      await expect(FieldOfficerService.createContactRequest(mockContactRequestData))
        .rejects.toThrow('Field officer not found');
    });

    it('should throw error if field officer is not active', async () => {
      jest.spyOn(FieldOfficerModel, 'findById').mockResolvedValue({
        ...mockFieldOfficer,
        is_active: false
      });

      await expect(FieldOfficerService.createContactRequest(mockContactRequestData))
        .rejects.toThrow('Field officer is not active');
    });

    it('should throw error if farmer has pending request', async () => {
      jest.spyOn(FieldOfficerContactRequestModel, 'search').mockResolvedValue({
        data: [mockContactRequest],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });

      await expect(FieldOfficerService.createContactRequest(mockContactRequestData))
        .rejects.toThrow('You already have a pending request for this field officer');
    });
  });

  describe('getContactRequestById', () => {
    it('should return contact request by id', async () => {
      const result = await FieldOfficerService.getContactRequestById(1);

      expect(result).toBeDefined();
      expect(result).toEqual(mockContactRequest);
      expect(FieldOfficerContactRequestModel.findById).toHaveBeenCalledWith(1);
    });

    it('should return null if request not found', async () => {
      jest.spyOn(FieldOfficerContactRequestModel, 'findById').mockResolvedValue(null);
      const result = await FieldOfficerService.getContactRequestById(999);
      expect(result).toBeNull();
    });
  });

  describe('getFarmerContactRequests', () => {
    it('should return all contact requests for farmer', async () => {
      const result = await FieldOfficerService.getFarmerContactRequests(1);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockContactRequest);
      expect(FieldOfficerContactRequestModel.getByFarmer).toHaveBeenCalledWith(1, 1, 10);
    });
  });

  describe('assignContactRequest', () => {
    it('should assign contact request successfully', async () => {
      const result = await FieldOfficerService.assignContactRequest(1, 1, 'Test notes');

      expect(result).toBe(true);
      expect(FieldOfficerContactRequestModel.update).toHaveBeenCalledWith(1, {
        status: 'in_progress',
        admin_notes: 'Test notes',
        assigned_by: 1,
        assigned_at: expect.any(Date)
      });
    });

    it('should throw error if request not found', async () => {
      jest.spyOn(FieldOfficerContactRequestModel, 'findById').mockResolvedValue(null);

      await expect(FieldOfficerService.assignContactRequest(999, 1))
        .rejects.toThrow('Contact request not found');
    });

    it('should throw error if request not pending', async () => {
      jest.spyOn(FieldOfficerContactRequestModel, 'findById').mockResolvedValue({
        ...mockContactRequest,
        status: 'in_progress'
      });

      await expect(FieldOfficerService.assignContactRequest(1, 1))
        .rejects.toThrow('Request is not in pending status');
    });
  });
});