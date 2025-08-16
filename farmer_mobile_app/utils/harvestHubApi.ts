import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig, ServiceBaseUrl } from '@/config/config';
import { APIService } from '@/utils/apiService';

// Ensure we always have an initialized API instance at call time
function getApi() {
  try {
    return APIService.getInstance();
  } catch {
    APIService.initialize(ServiceBaseUrl);
    return APIService.getInstance();
  }
}

export const fetchWarehouses = async (page = 1, limit = 10) => {
  const url = AppConfig.apiEndpoints.warehouses;
  const res = await getApi().get(url, { params: { page, limit } });
  return res.data;
};

export const fetchWarehouseById = async (id: number | string) => {
  const url = `${AppConfig.apiEndpoints.warehouses}/${id}`;
  const res = await getApi().get(url);
  return res.data;
};

export const createStorageRequest = async (payload: {
  warehouse_id: number | string;
  request_type: 'storage';
  item_name: string;
  quantity: number;
  storage_duration_days: number;
  storage_requirements?: string;
}) => {
  const url = AppConfig.apiEndpoints.farmerWarehouseRequests;
  const token = await AsyncStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await getApi().post(url, payload, { headers });
  return res.data;
};

export const fetchMarketPrices = async () => {
  const url = AppConfig.apiEndpoints.marketPrices;
  const res = await getApi().get(url);
  return res.data;
};
