import { useState, useEffect, useCallback } from 'react';
import machineRentalService, { 
  EquipmentCategory, 
  Equipment, 
  EquipmentAvailability,
  EquipmentRentalRequest,
  CreateRentalRequestData 
} from '../utils/machineRentalService';

interface UseMachineRentalReturn {
  // Categories
  categories: EquipmentCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  fetchCategories: () => Promise<void>;
  
  // Equipment
  equipment: {
    count: number;
    data: Equipment[];
    error: string | null;
    loading: boolean;
  };
  equipmentLoading: boolean;
  equipmentError: string | null;
  fetchEquipmentByCategory: (categoryId: number) => Promise<void>;
  fetchEquipmentById: (equipmentId: number) => Promise<void>;
  
  // Availability
  availability: EquipmentAvailability | null;
  availabilityLoading: boolean;
  availabilityError: string | null;
  checkAvailability: (equipmentId: number, startDate: string, endDate: string) => Promise<void>;
  
  // Rental Requests
  rentalRequests: EquipmentRentalRequest[];
  rentalRequestsLoading: boolean;
  rentalRequestsError: string | null;
  fetchMyRentalRequests: () => Promise<void>;
  createRentalRequest: (data: CreateRentalRequestData) => Promise<EquipmentRentalRequest | null>;
  cancelRentalRequest: (requestId: number) => Promise<boolean>;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  
  // Utility functions
  clearErrors: () => void;
  resetState: () => void;
}

export const useMachineRental = (): UseMachineRentalReturn => {
  // Categories state
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // State for equipment by category
  const [equipment, setEquipment] = useState<{
    count: number;
    data: Equipment[];
    error: string | null;
    loading: boolean;
  }>({
    count: 0,
    data: [],
    error: null,
    loading: false
  });

  // Equipment loading and error states
  const equipmentLoading = equipment.loading;
  const equipmentError = equipment.error;

  // Availability state
  const [availability, setAvailability] = useState<EquipmentAvailability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Rental requests state
  const [rentalRequests, setRentalRequests] = useState<EquipmentRentalRequest[]>([]);
  const [rentalRequestsLoading, setRentalRequestsLoading] = useState(false);
  const [rentalRequestsError, setRentalRequestsError] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      
      const response = await machineRentalService.getActiveCategories();
      // Ensure response is an array
      if (Array.isArray(response)) {
        setCategories(response);
      } else {
        setCategories([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
      setCategoriesError(errorMessage);
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Fetch equipment by category
  const fetchEquipmentByCategory = useCallback(async (categoryId: number) => {
    try {
      setEquipment(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await machineRentalService.getEquipmentByCategory(categoryId);
      
      // Ensure we always have an array of equipment
      if (result && result.data && Array.isArray(result.data)) {
        setEquipment({
          count: result.data.length,
          data: result.data,
          error: null,
          loading: false
        });
      } else {
        console.warn('Unexpected response structure:', result);
        setEquipment({
          count: 0,
          data: [],
          error: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching equipment by category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch equipment';
      setEquipment({
        count: 0,
        data: [],
        error: errorMessage,
        loading: false
      });
    }
  }, [machineRentalService]);

  // Fetch equipment by ID
  const fetchEquipmentById = useCallback(async (equipmentId: number) => {
    try {
      setEquipment(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await machineRentalService.getEquipmentById(equipmentId);
      
      if (result) {
        setEquipment({
          count: 1,
          data: [result],
          error: null,
          loading: false
        });
      } else {
        setEquipment({
          count: 0,
          data: [],
          error: 'Equipment not found',
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching equipment by ID:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch equipment';
      setEquipment({
        count: 0,
        data: [],
        error: errorMessage,
        loading: false
      });
    }
  }, [machineRentalService]);

  // Check equipment availability
  const checkAvailability = useCallback(async (equipmentId: number, startDate: string, endDate: string) => {
    try {
      setAvailabilityLoading(true);
      setAvailabilityError(null);
      
      const response = await machineRentalService.checkEquipmentAvailability(equipmentId, startDate, endDate);
      setAvailability(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check availability';
      setAvailabilityError(errorMessage);
      console.error('Error checking availability:', error);
    } finally {
      setAvailabilityLoading(false);
    }
  }, []);

  // Fetch my rental requests
  const fetchMyRentalRequests = useCallback(async () => {
    try {
      setRentalRequestsLoading(true);
      setRentalRequestsError(null);
      
      const response = await machineRentalService.getMyRentalRequests();
      // Handle both paginated and direct array responses
      if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray(response.data)) {
          // Paginated response
          setRentalRequests(response.data);
          setPagination(response.pagination || null);
        } else if (Array.isArray(response)) {
          // Direct array response
          setRentalRequests(response);
          setPagination(null);
        } else {
          // Fallback to empty array
          setRentalRequests([]);
          setPagination(null);
        }
      } else {
        setRentalRequests([]);
        setPagination(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rental requests';
      setRentalRequestsError(errorMessage);
      console.error('Error fetching rental requests:', error);
      // Set empty array on error to prevent undefined errors
      setRentalRequests([]);
      setPagination(null);
    } finally {
      setRentalRequestsLoading(false);
    }
  }, []);

  // Create rental request
  const createRentalRequest = useCallback(async (data: CreateRentalRequestData): Promise<EquipmentRentalRequest | null> => {
    try {
      const response = await machineRentalService.createRentalRequest(data);
      
      // Refresh rental requests list
      await fetchMyRentalRequests();
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create rental request';
      console.error('Error creating rental request:', error);
      throw new Error(errorMessage);
    }
  }, [fetchMyRentalRequests]);

  // Cancel rental request
  const cancelRentalRequest = useCallback(async (requestId: number): Promise<boolean> => {
    try {
      await machineRentalService.cancelRentalRequest(requestId);
      
      // Refresh rental requests list
      await fetchMyRentalRequests();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel rental request';
      console.error('Error cancelling rental request:', error);
      throw new Error(errorMessage);
    }
  }, [fetchMyRentalRequests]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setCategoriesError(null);

    setAvailabilityError(null);
    setRentalRequestsError(null);
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setCategories([]);
    setEquipment({
      count: 0,
      data: [],
      error: null,
      loading: false
    });
    setAvailability(null);
    setRentalRequests([]);
    setPagination(null);
  }, []);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    // Categories
    categories,
    categoriesLoading,
    categoriesError,
    fetchCategories,
    
    // Equipment
    equipment,
    equipmentLoading,
    equipmentError,
    fetchEquipmentByCategory,
    fetchEquipmentById,
    
    // Availability
    availability,
    availabilityLoading,
    availabilityError,
    checkAvailability,
    
    // Rental Requests
    rentalRequests,
    rentalRequestsLoading,
    rentalRequestsError,
    fetchMyRentalRequests,
    createRentalRequest,
    cancelRentalRequest,

    // Pagination
    // Ensure the pagination object uses the correct property name: total_pages
    pagination: pagination
      ? {
          ...pagination,
          total_pages: pagination.totalPages ?? pagination.totalPages ?? 0,
        }
      : null,

    // Utility functions
    clearErrors,
    resetState,
  };
};
