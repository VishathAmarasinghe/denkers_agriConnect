import { APIService } from '@/utils/apiService';
import { AppConfig, ServiceBaseUrl } from '@/config/config';


const ensureInit = () => {
  try {
    APIService.getInstance();
  } catch {
    APIService.initialize(ServiceBaseUrl);
  }
};

const requestAndHandle = async <T>(config: any): Promise<T> => {
  const response = await APIService.getInstance().request(config);
  const body = response?.data;
  if (body?.success) return body.data as T;
  throw new Error(body?.message || 'API request failed');
};


// Keep existing function names for compatibility with screens
export const fetchWarehouses = async (page = 1, limit = 10) => {

  ensureInit();
  try {
  const response = await requestAndHandle<any>({
      method: 'GET',
      url: AppConfig.apiEndpoints.warehouses,
      params: { page, limit },
    });
  return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to load warehouses');
  }
};

export const fetchWarehouseById = async (id: number | string) => {
  ensureInit();
  try {
  const response = await requestAndHandle<any>({
      method: 'GET',
      url: `${AppConfig.apiEndpoints.warehouses}/${id}`,
    });
  return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to load warehouse');
  }

};

export const createStorageRequest = async (payload: {
  warehouse_id: number | string;
  request_type: 'storage';
  item_name: string;
  quantity: number;
  storage_duration_days: number;
  storage_requirements?: string;
}) => {

  ensureInit();
  try {
  const response = await requestAndHandle<any>({
      method: 'POST',
      url: AppConfig.apiEndpoints.farmerWarehouseRequests,
      data: payload,
    });
  return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to submit request');
  }
};

export const fetchMarketPrices = async () => {
  ensureInit();
  try {
  const response = await requestAndHandle<any>({
      method: 'GET',
      url: AppConfig.apiEndpoints.marketPrices,
    });
  return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to load market prices');
  }

};
