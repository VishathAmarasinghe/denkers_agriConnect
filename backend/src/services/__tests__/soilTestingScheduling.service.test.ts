import { expect, jest, it, beforeEach, describe } from '@jest/globals';
import SoilTestingSchedulingService from '../soilTestingScheduling';
import SoilTestingScheduleModel from '../../models/SoilTestingSchedule';
import SoilTestingTimeSlotModel from '../../models/SoilTestingTimeSlot';
import SoilTestingRequestModel from '../../models/SoilTestingRequest';
import NotificationService from '../notification';
import { SoilTestingScheduleCreate, SoilTestingRequestCreate, SoilTestingTimeSlotCreate } from '../../types';

// Mock all models
jest.mock('../../models/SoilTestingSchedule');
jest.mock('../../models/SoilTestingTimeSlot');
jest.mock('../../models/SoilTestingRequest');
jest.mock('../notification');

const MockedSoilTestingScheduleModel = SoilTestingScheduleModel as jest.Mocked<typeof SoilTestingScheduleModel>;
const MockedSoilTestingTimeSlotModel = SoilTestingTimeSlotModel as jest.Mocked<typeof SoilTestingTimeSlotModel>;
const MockedSoilTestingRequestModel = SoilTestingRequestModel as jest.Mocked<typeof SoilTestingRequestModel>;
const MockedNotificationService = NotificationService as jest.Mocked<typeof NotificationService>;

describe('SoilTestingSchedulingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRequest', () => {
    const mockRequestData: SoilTestingRequestCreate = {
      soil_collection_center_id: 1,
      preferred_date: '2024-01-01',
      preferred_time_slot: '09:00-10:00',
      farmer_phone: '+1234567890',
      farmer_location_address: 'Test Address',
      farmer_latitude: 6.9271,
      farmer_longitude: 79.8612,
      additional_notes: 'Test notes'
    };

    const mockCreatedRequest = {
      id: 1,
      farmer_id: 1,
      soil_collection_center_id: 1,
      preferred_date: '2024-01-01',
      status: 'pending' as const,
      farmer_phone: '+1234567890'
    };

    it('should create soil testing request successfully', async () => {
      MockedSoilTestingRequestModel.create.mockResolvedValue(mockCreatedRequest);

      const result = await SoilTestingSchedulingService.createRequest(mockRequestData, 1);

      expect(MockedSoilTestingRequestModel.create).toHaveBeenCalledWith(mockRequestData, 1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedRequest);
    });

    it('should handle request creation errors gracefully', async () => {
      MockedSoilTestingRequestModel.create.mockRejectedValue(new Error('Creation failed'));

      const result = await SoilTestingSchedulingService.createRequest(mockRequestData, 1);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to create soil testing request');
    });
  });

  describe('getRequest', () => {
    const mockRequest = {
      id: 1,
      farmer_id: 1,
      soil_collection_center_id: 1,
      preferred_date: '2024-01-01',
      status: 'pending' as const,
      farmer_phone: '+1234567890'
    };

    it('should return request when it exists', async () => {
      MockedSoilTestingRequestModel.findById.mockResolvedValue(mockRequest);

      const result = await SoilTestingSchedulingService.getRequest(1);

      expect(MockedSoilTestingRequestModel.findById).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRequest);
    });

    it('should return error when request does not exist', async () => {
      MockedSoilTestingRequestModel.findById.mockResolvedValue(null);

      const result = await SoilTestingSchedulingService.getRequest(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Soil testing request not found');
    });
  });

  describe('updateRequest', () => {
    const mockUpdateData = {
      status: 'approved' as const,
      admin_notes: 'Request approved'
    };

    it('should update request successfully when request exists', async () => {
      const existingRequest = { 
        id: 1, 
        status: 'pending' as const,
        farmer_id: 1,
        soil_collection_center_id: 1,
        preferred_date: '2024-01-01',
        farmer_phone: '+1234567890'
      };
      MockedSoilTestingRequestModel.findById.mockResolvedValue(existingRequest);
      MockedSoilTestingRequestModel.update.mockResolvedValue(true);

      const result = await SoilTestingSchedulingService.updateRequest(1, mockUpdateData);

      expect(MockedSoilTestingRequestModel.findById).toHaveBeenCalledWith(1);
      expect(MockedSoilTestingRequestModel.update).toHaveBeenCalledWith(1, mockUpdateData);
      expect(result.success).toBe(true);
    });

    it('should return error when request does not exist', async () => {
      MockedSoilTestingRequestModel.findById.mockResolvedValue(null);

      const result = await SoilTestingSchedulingService.updateRequest(999, mockUpdateData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Soil testing request not found');
    });
  });

  describe('getPendingRequests', () => {
    const mockRequests = {
      data: [
        { id: 1, farmer_id: 1, status: 'pending' as const, farmer_phone: '+1234567890', soil_collection_center_id: 1, preferred_date: '2024-01-01' },
        { id: 2, farmer_id: 2, status: 'pending' as const, farmer_phone: '+1234567891', soil_collection_center_id: 1, preferred_date: '2024-01-02' }
      ],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
    };

    it('should return pending requests', async () => {
      MockedSoilTestingRequestModel.getPending.mockResolvedValue(mockRequests);

      const result = await SoilTestingSchedulingService.getPendingRequests();

      expect(MockedSoilTestingRequestModel.getPending).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRequests);
    });
  });

  describe('getRequestsByFarmer', () => {
    const mockRequests = {
      data: [
        { id: 1, farmer_id: 1, status: 'pending' as const, farmer_phone: '+1234567890', soil_collection_center_id: 1, preferred_date: '2024-01-01' },
        { id: 2, farmer_id: 1, status: 'approved' as const, farmer_phone: '+1234567890', soil_collection_center_id: 1, preferred_date: '2024-01-02' }
      ],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
    };

    it('should return requests for given farmer', async () => {
      MockedSoilTestingRequestModel.getByFarmer.mockResolvedValue(mockRequests);

      const result = await SoilTestingSchedulingService.getRequestsByFarmer(1);

      expect(MockedSoilTestingRequestModel.getByFarmer).toHaveBeenCalledWith(1, 1, 10);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRequests);
    });
  });

  describe('createSchedule', () => {
    const mockScheduleData: SoilTestingScheduleCreate = {
      soil_collection_center_id: 1,
      scheduled_date: '2024-01-01',
      start_time: '09:00',
      end_time: '10:00',
      farmer_phone: '+1234567890',
      farmer_location_address: 'Test Address'
    };

    const mockCreatedSchedule = {
      id: 1,
      farmer_id: 1,
      soil_collection_center_id: 1,
      scheduled_date: '2024-01-01',
      status: 'pending' as const,
      farmer_phone: '+1234567890'
    };

    it('should create schedule successfully', async () => {
      MockedSoilTestingScheduleModel.create.mockResolvedValue(mockCreatedSchedule);

      const result = await SoilTestingSchedulingService.createSchedule(mockScheduleData, 1);

      expect(MockedSoilTestingScheduleModel.create).toHaveBeenCalledWith(mockScheduleData, 1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedSchedule);
    });

    it('should handle schedule creation errors gracefully', async () => {
      MockedSoilTestingScheduleModel.create.mockRejectedValue(new Error('Creation failed'));

      const result = await SoilTestingSchedulingService.createSchedule(mockScheduleData, 1);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to create soil testing schedule');
    });
  });

  describe('getSchedule', () => {
    const mockSchedule = {
      id: 1,
      farmer_id: 1,
      soil_collection_center_id: 1,
      scheduled_date: '2024-01-01',
      status: 'pending' as const,
      farmer_phone: '+1234567890'
    };

    it('should return schedule when it exists', async () => {
      MockedSoilTestingScheduleModel.findById.mockResolvedValue(mockSchedule);

      const result = await SoilTestingSchedulingService.getSchedule(1);

      expect(MockedSoilTestingScheduleModel.findById).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSchedule);
    });

    it('should return error when schedule does not exist', async () => {
      MockedSoilTestingScheduleModel.findById.mockResolvedValue(null);

      const result = await SoilTestingSchedulingService.getSchedule(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Soil testing schedule not found');
    });
  });

  describe('updateSchedule', () => {
    const mockUpdateData = {
      status: 'approved' as const,
      admin_notes: 'Schedule approved'
    };

    it('should update schedule successfully when schedule exists', async () => {
      const existingSchedule = { 
        id: 1, 
        status: 'pending' as const,
        farmer_id: 1,
        soil_collection_center_id: 1,
        scheduled_date: '2024-01-01',
        farmer_phone: '+1234567890'
      };
      MockedSoilTestingScheduleModel.findById.mockResolvedValue(existingSchedule);
      MockedSoilTestingScheduleModel.update.mockResolvedValue(true);

      const result = await SoilTestingSchedulingService.updateSchedule(1, mockUpdateData);

      expect(MockedSoilTestingScheduleModel.findById).toHaveBeenCalledWith(1);
      expect(MockedSoilTestingScheduleModel.update).toHaveBeenCalledWith(1, mockUpdateData);
      expect(result.success).toBe(true);
    });

    it('should return error when update fails', async () => {
      MockedSoilTestingScheduleModel.update.mockResolvedValue(false);
      MockedSoilTestingScheduleModel.findById.mockResolvedValue(null);

      const result = await SoilTestingSchedulingService.updateSchedule(999, mockUpdateData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update soil testing schedule. Please try again.');
      expect(result.data).toBe(null);
    });
  });

  describe('getTodaySchedules', () => {
    const mockSchedules = [
      { 
        id: 1, 
        scheduled_date: '2024-01-01',
        farmer_id: 1,
        soil_collection_center_id: 1,
        status: 'pending' as const,
        farmer_phone: '+1234567890'
      },
      { 
        id: 2, 
        scheduled_date: '2024-01-01',
        farmer_id: 2,
        soil_collection_center_id: 1,
        status: 'approved' as const,
        farmer_phone: '+1234567891'
      }
    ];

    it('should return today schedules', async () => {
      MockedSoilTestingScheduleModel.getTodaySchedules.mockResolvedValue(mockSchedules);

      const result = await SoilTestingSchedulingService.getTodaySchedules();

      expect(MockedSoilTestingScheduleModel.getTodaySchedules).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSchedules);
    });
  });

  describe('createTimeSlot', () => {
    const mockTimeSlotData: SoilTestingTimeSlotCreate = {
      soil_collection_center_id: 1,
      date: '2024-01-01',
      start_time: '09:00',
      end_time: '10:00',
      max_bookings: 5
    };

    const mockCreatedTimeSlot = {
      id: 1,
      soil_collection_center_id: 1,
      date: '2024-01-01',
      start_time: '09:00',
      end_time: '10:00',
      is_available: true,
      max_bookings: 5,
      current_bookings: 0
    };

    it('should create time slot successfully', async () => {
      MockedSoilTestingTimeSlotModel.create.mockResolvedValue(mockCreatedTimeSlot);

      const result = await SoilTestingSchedulingService.createTimeSlot(mockTimeSlotData);

      expect(MockedSoilTestingTimeSlotModel.create).toHaveBeenCalledWith(mockTimeSlotData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedTimeSlot);
    });

    it('should handle time slot creation errors', async () => {
      MockedSoilTestingTimeSlotModel.create.mockRejectedValue(new Error('Creation failed'));

      const result = await SoilTestingSchedulingService.createTimeSlot(mockTimeSlotData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to create time slot');
    });
  });

  describe('getAvailableTimeSlots', () => {
    const mockAvailableSlots = [
      {
        date: '2024-01-01',
        time_slots: [
          { start_time: '09:00', end_time: '10:00', is_available: true, available_bookings: 3, max_bookings: 5 },
          { start_time: '10:00', end_time: '11:00', is_available: true, available_bookings: 5, max_bookings: 5 }
        ]
      }
    ];

    it('should return available time slots for given center and date range', async () => {
      const centerId = 1;
      const dateFrom = '2024-01-01';
      const dateTo = '2024-01-31';
      
      MockedSoilTestingTimeSlotModel.getAvailableSlots.mockResolvedValue(mockAvailableSlots);

      const result = await SoilTestingSchedulingService.getAvailableTimeSlots(centerId, dateFrom, dateTo);

      expect(MockedSoilTestingTimeSlotModel.getAvailableSlots).toHaveBeenCalledWith(centerId, dateFrom, dateTo);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAvailableSlots);
    });
  });

  describe('updateTimeSlot', () => {
    const mockUpdateData = {
      is_available: false,
      max_bookings: 3
    };

    it('should update time slot successfully', async () => {
      MockedSoilTestingTimeSlotModel.update.mockResolvedValue(true);

      const result = await SoilTestingSchedulingService.updateTimeSlot(1, mockUpdateData);

      expect(MockedSoilTestingTimeSlotModel.update).toHaveBeenCalledWith(1, mockUpdateData);
      expect(result.success).toBe(true);
    });
  });



  describe('markScheduleCompleted', () => {
    it('should mark schedule as completed successfully', async () => {
      const existingSchedule = { 
        id: 1, 
        status: 'approved' as const,
        farmer_id: 1,
        soil_collection_center_id: 1,
        scheduled_date: '2024-01-01',
        farmer_phone: '+1234567890'
      };
      MockedSoilTestingScheduleModel.findById.mockResolvedValue(existingSchedule);
      MockedSoilTestingScheduleModel.markCompleted.mockResolvedValue(true);

      const result = await SoilTestingSchedulingService.markScheduleCompleted(1);

      expect(MockedSoilTestingScheduleModel.findById).toHaveBeenCalledWith(1);
      expect(MockedSoilTestingScheduleModel.markCompleted).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });

    it('should return error when schedule does not exist', async () => {
      MockedSoilTestingScheduleModel.findById.mockResolvedValue(null);

      const result = await SoilTestingSchedulingService.markScheduleCompleted(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Soil testing schedule not found');
    });
  });

  describe('searchSchedules', () => {
    const mockSearchParams = {
      farmer_id: 1,
      soil_collection_center_id: 1,
      status: 'pending'
    };

    const mockSearchResults = {
      data: [
        { 
          id: 1, 
          farmer_id: 1, 
          status: 'pending' as const,
          soil_collection_center_id: 1,
          scheduled_date: '2024-01-01',
          farmer_phone: '+1234567890'
        },
        { 
          id: 2, 
          farmer_id: 1, 
          status: 'pending' as const,
          soil_collection_center_id: 1,
          scheduled_date: '2024-01-02',
          farmer_phone: '+1234567890'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    };

    it('should search schedules with given parameters', async () => {
      MockedSoilTestingScheduleModel.search.mockResolvedValue(mockSearchResults);

      const result = await SoilTestingSchedulingService.searchSchedules(mockSearchParams);

      expect(MockedSoilTestingScheduleModel.search).toHaveBeenCalledWith(mockSearchParams);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSearchResults);
    });
  });

  describe('searchRequests', () => {
    const mockSearchParams = {
      farmer_id: 1,
      soil_collection_center_id: 1,
      status: 'pending'
    };

    const mockSearchResults = {
      data: [
        { 
          id: 1, 
          farmer_id: 1, 
          status: 'pending' as const,
          soil_collection_center_id: 1,
          preferred_date: '2024-01-01',
          farmer_phone: '+1234567890'
        },
        { 
          id: 2, 
          farmer_id: 1, 
          status: 'pending' as const,
          soil_collection_center_id: 1,
          preferred_date: '2024-01-02',
          farmer_phone: '+1234567890'
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    };

    it('should search requests with given parameters', async () => {
      MockedSoilTestingRequestModel.search.mockResolvedValue(mockSearchResults);

      const result = await SoilTestingSchedulingService.searchRequests(mockSearchParams);

      expect(MockedSoilTestingRequestModel.search).toHaveBeenCalledWith(mockSearchParams);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSearchResults);
    });
  });
});
