import { Platform } from 'react-native';

export const ServiceBaseUrl = Platform.OS === 'ios' ? 'http://localhost:7500' : 'http://10.0.2.2:7500';
// Warehouse/HarvestHub service base (provided endpoints run on port 3000)
export const WarehouseBaseUrl = Platform.OS === 'ios' ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

export const APPLICATION_ADMIN = 'admin.agriConnect';
export const APPLICATION_FARMER = 'farmer.agriConnect';

export const AppConfig = {
  serviceUrls: {
    authenticaion: `${ServiceBaseUrl}/auth`,
    otp: `${ServiceBaseUrl}/otp`,
  warehouse: `${WarehouseBaseUrl}/api/v1`,
  },
};
