import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '@/config/config';
import { APIService } from '@/utils/apiService';

// For now, reuse the global Axios instance and pass full URLs built from AppConfig
const api = APIService.getInstance();

export const fetchWarehouses = async (page = 1, limit = 10) => {
  const url = `${AppConfig.serviceUrls.warehouse}/warehouse`;
  const res = await api.get(url, { params: { page, limit } });
  return res.data;
};

export const fetchWarehouseById = async (id: number | string) => {
  const url = `${AppConfig.serviceUrls.warehouse}/warehouse/${id}`;
  const res = await api.get(url);
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
  const url = `${AppConfig.serviceUrls.warehouse}/farmer-warehouse/requests`;
  const token = await AsyncStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await api.post(url, payload, { headers });
  return res.data;
};

export const fetchMarketPrices = async () => {
  const url = `${AppConfig.serviceUrls.warehouse}/farmer-warehouse/market-prices`;
  const res = await api.get(url);
  return res.data;
};
