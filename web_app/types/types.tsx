import { SvgIconProps } from "@mui/material";

export enum ConfirmationType {
  update = "update",
  send = "send",
  upload = "upload",
  accept = "accept",
}

export enum State {
  failed = "failed",
  success = "success",
  loading = "loading",
  idle = "idle",
}

export interface PreLoaderProps {
  message: string | null;
  hideLogo?: boolean;
  isLoading?: boolean;
}

export interface ErrorHandlerProps {
  message: string | null;
}

export interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ElementType<SvgIconProps>;
  name: string;
  urlLink: string;
}

export interface AppointmentTimeFrame {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface SettingsCardProps {
  title: SettingsCardTitle;
  icon: React.ElementType<SvgIconProps>;
  subText: string;
}

export type SettingsCardTitle =
  | "Languages"
  | "Client Type"
  | "Client Status"
  | "Client Fundings"
  | "Care Plan Status"
  | "Appointment Types"
  | "Incident Types"
  | "Incident Status"
  | "Incident Questions"
  | "Care Giver File Uploads"
  | "Care Giver Salary";


  export interface Chat {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
  }
  
  export interface Message {
    chatID: number;
    senderID: string;
    content: string;
    messageID: number;          
    timeStamp: string;  
    senderName: string;
    senderProfilePic: string;        
  }
  
// Soil Collection Center Types
export interface SoilCollectionCenter {
  id?: number;
  name: string;
  location_id: number;
  address: string;
  contact_number: string;
  contact_person?: string;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  operating_hours?: string;
  services_offered?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface SoilCollectionCenterCreateData {
  name: string;
  location_id: number;
  address: string;
  contact_number: string;
  contact_person?: string;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  operating_hours?: string;
  services_offered?: string;
}

export interface SoilCollectionCenterUpdateData {
  name?: string;
  location_id?: number;
  address?: string;
  contact_number?: string;
  contact_person?: string;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  operating_hours?: string;
  services_offered?: string;
  is_active?: boolean;
}

export interface SoilCollectionCenterSearchParams {
  name?: string;
  location_id?: number;
  province?: string;
  district?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Location Types for Google Places API
export interface Location {
  id?: number;
  name: string;
  district: string;
  province: string;
  country: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
}

export interface GooglePlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}
  
// Soil Testing Request Types
export interface SoilTestingRequest {
  id?: number;
  farmer_id: number;
  soil_collection_center_id: number;
  preferred_date: string;
  preferred_time_slot?: string;
  farmer_phone: string;
  farmer_location_address?: string;
  farmer_latitude?: number;
  farmer_longitude?: number;
  additional_notes?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  admin_notes?: string;
  rejection_reason?: string;
  approved_date?: string;
  approved_start_time?: string;
  approved_end_time?: string;
  field_officer_id?: number;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  center_name?: string;
  center_address?: string;
  farmer_first_name?: string;
  farmer_last_name?: string;
  field_officer_specialization?: string;
}

export interface SoilTestingRequestCreateData {
  soil_collection_center_id: number;
  preferred_date: string;
  preferred_time_slot?: string;
  farmer_phone: string;
  farmer_location_address?: string;
  farmer_latitude?: number;
  farmer_longitude?: number;
  additional_notes?: string;
}

export interface SoilTestingRequestUpdateData {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  admin_notes?: string;
  rejection_reason?: string;
  approved_date?: string;
  approved_start_time?: string;
  approved_end_time?: string;
  field_officer_id?: number;
}

export interface SoilTestingRequestSearchParams {
  farmer_id?: number;
  soil_collection_center_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

// User Types
export interface User {
  id: number;
  username: string;
  email?: string;
  phone: string;
  nic: string;
  role: 'admin' | 'farmer' | 'field_officer';
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  language?: string;
  location_id?: number;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  location_name?: string;
  location_address?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Field Officer Types
export interface FieldOfficer {
  id: number;
  name: string;
  designation: string;
  description?: string;
  center?: string;
  phone_no?: string;
  specialization?: string;
  assigned_province_id?: number;
  assigned_district_id?: number;
  profile_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Soil Testing Report Types
export interface SoilTestingReport {
  id: number;
  soil_testing_id: number;
  farmer_id: number;
  soil_collection_center_id: number;
  field_officer_id: number;
  report_file_name: string;
  report_file_path: string;
  report_file_size: number;
  report_file_type: string;
  report_title: string;
  report_summary?: string;
  soil_ph?: number;
  soil_nitrogen?: number;
  soil_phosphorus?: number;
  soil_potassium?: number;
  soil_organic_matter?: number;
  soil_texture?: string;
  recommendations?: string;
  testing_date: string;
  report_date: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  farmer_name?: string;
  center_name?: string;
  field_officer_name?: string;
}

export interface SoilTestingReportCreateData {
  soil_testing_id: number;
  farmer_id: number;
  soil_collection_center_id: number;
  field_officer_id: number;
  report_file_name: string;
  report_file_path: string;
  report_file_size: number;
  report_file_type: string;
  report_title: string;
  report_summary?: string;
  soil_ph?: number;
  soil_nitrogen?: number;
  soil_phosphorus?: number;
  soil_potassium?: number;
  soil_organic_matter?: number;
  soil_texture?: string;
  recommendations?: string;
  testing_date: string;
  report_date: string;
  is_public?: boolean;
}

export interface SoilTestingReportUpdateData {
  report_title?: string;
  report_summary?: string;
  soil_ph?: number;
  soil_nitrogen?: number;
  soil_phosphorus?: number;
  soil_potassium?: number;
  soil_organic_matter?: number;
  soil_texture?: string;
  recommendations?: string;
  testing_date?: string;
  report_date?: string;
  is_public?: boolean;
}

export interface SoilTestingReportSearchParams {
  page?: number;
  limit?: number;
  farmer_id?: number;
  soil_collection_center_id?: number;
  field_officer_id?: number;
  testing_date_from?: string;
  testing_date_to?: string;
  report_date_from?: string;
  report_date_to?: string;
  is_public?: boolean;
  search?: string;
}
  
// ==================== MACHINE RENTAL TYPES ====================

export interface EquipmentCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentCategoryCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface EquipmentCategoryUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface Equipment {
  id: number;
  name: string;
  category_id: number;
  description?: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate?: number;
  contact_number: string;
  delivery_fee: number;
  security_deposit: number;
  equipment_image_url?: string;
  specifications?: any;
  maintenance_notes?: string;
  is_available: boolean;
  is_active: boolean;
  current_status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  created_at: string;
  updated_at: string;
  // Joined fields
  category_name?: string;
  category_description?: string;
}

export interface EquipmentCreate {
  name: string;
  category_id: number;
  description?: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate?: number;
  contact_number: string;
  delivery_fee?: number;
  security_deposit?: number;
  equipment_image_url?: string;
  specifications?: any;
  maintenance_notes?: string;
  is_available?: boolean;
  is_active?: boolean;
  current_status?: 'available' | 'rented' | 'maintenance' | 'out_of_service';
}

export interface EquipmentUpdate {
  name?: string;
  category_id?: number;
  description?: string;
  daily_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  contact_number?: string;
  delivery_fee?: number;
  security_deposit?: number;
  equipment_image_url?: string;
  specifications?: any;
  maintenance_notes?: string;
  is_available?: boolean;
  is_active?: boolean;
  current_status?: 'available' | 'rented' | 'maintenance' | 'out_of_service';
}

export interface EquipmentSearchParams {
  page?: number;
  limit?: number;
  category_id?: number;
  is_available?: boolean;
  is_active?: boolean;
  current_status?: string;
  min_daily_rate?: number;
  max_daily_rate?: number;
  search?: string;
}

export interface EquipmentAvailability {
  id: number;
  equipment_id: number;
  date: string;
  is_available: boolean;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentAvailabilityCreate {
  equipment_id: number;
  date: string;
  is_available: boolean;
  reason?: string;
}

export interface EquipmentAvailabilityUpdate {
  is_available?: boolean;
  reason?: string;
}

export interface EquipmentAvailabilitySearchParams {
  equipment_id: number;
  date_from: string;
  date_to: string;
}

export interface EquipmentAvailabilityCheckResponse {
  is_available: boolean;
  available_dates: string[];
  unavailable_dates: string[];
}

export interface EquipmentRentalRequest {
  id: number;
  farmer_id: number;
  equipment_id: number;
  start_date: string;
  end_date: string;
  rental_duration: number;
  total_amount: number;
  delivery_fee: number;
  security_deposit: number;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  additional_notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'active' | 'completed' | 'returned';
  admin_notes?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: string;
  pickup_qr_code_url?: string;
  pickup_qr_code_data?: string;
  return_qr_code_url?: string;
  return_qr_code_data?: string;
  pickup_confirmed_at?: string;
  return_confirmed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  farmer_name?: string;
  equipment_name?: string;
  category_name?: string;
  approved_by_name?: string;
}

export interface EquipmentRentalRequestCreate {
  equipment_id: number;
  start_date: string;
  end_date: string;
  receiver_name: string;
  receiver_phone: string;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  additional_notes?: string;
}

export interface EquipmentRentalRequestUpdate {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'active' | 'completed' | 'returned';
  admin_notes?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: string;
  pickup_qr_code_url?: string;
  pickup_qr_code_data?: string;
  return_qr_code_url?: string;
  return_qr_code_data?: string;
  pickup_confirmed_at?: string;
  return_confirmed_at?: string;
}

export interface EquipmentRentalRequestSearchParams {
  page?: number;
  limit?: number;
  farmer_id?: number;
  equipment_id?: number;
  status?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  search?: string;
}

export interface AvailableEquipmentResponse {
  equipment_id: number;
  equipment_name: string;
  category_name: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate?: number;
  delivery_fee: number;
  security_deposit: number;
  available_dates: string[];
  unavailable_dates: string[];
}
  
// Warehouse Types
export interface WarehouseCategory {
  id: number;
  name: string;
  description?: string;
}

export interface Warehouse {
  id?: number;
  name: string;
  contact_person_name: string;
  contact_person_number: string;
  warehouse_status: 'open' | 'closed';
  fixed_space_amount: number;
  temperature_range?: string;
  security_level: 'high' | 'medium' | 'low';
  description?: string;
  category_id: number;
  address: string;
  province_id: number;
  district_id: number;
  is_available: boolean;
  created_at?: Date;
  updated_at?: Date;
  // Joined fields for display
  category_name?: string;
  province_name?: string;
  district_name?: string;
}

export interface WarehouseCreateData {
  name: string;
  contact_person_name: string;
  contact_person_number: string;
  warehouse_status?: 'open' | 'closed';
  fixed_space_amount: number;
  temperature_range?: string;
  security_level?: 'high' | 'medium' | 'low';
  description?: string;
  category_id: number;
  address: string;
  province_id: number;
  district_id: number;
}

export interface WarehouseUpdateData {
  name?: string;
  contact_person_name?: string;
  contact_person_number?: string;
  warehouse_status?: 'open' | 'closed';
  fixed_space_amount?: number;
  temperature_range?: string;
  security_level?: 'high' | 'medium' | 'low';
  description?: string;
  category_id?: number;
  address?: string;
  province_id?: number;
  district_id?: number;
  is_available?: boolean;
}

export interface WarehouseSearchParams {
  name?: string;
  category_id?: number;
  province?: string;
  district?: string;
  warehouse_status?: 'open' | 'closed';
  security_level?: 'high' | 'medium' | 'low';
  is_available?: boolean;
  page?: number;
  limit?: number;
}

export interface WarehouseImage {
  id: number;
  warehouse_id: number;
  image_url: string;
  image_name?: string;
  image_type?: string;
  image_size?: number;
  is_primary: boolean;
  created_at: Date;
}

export interface WarehouseImageCreate {
  warehouse_id: number;
  image_url: string;
  image_name?: string;
  image_type?: string;
  image_size?: number;
  is_primary?: boolean;
}

export interface WarehouseInventory {
  id: number;
  warehouse_id: number;
  item_name: string;
  quantity: number;
  location?: string;
  stored_date: Date;
  product_owner?: string;
  item_condition: 'good' | 'moderate' | 'poor';
  expiry_date?: Date;
  notes?: string;
  farmer_id?: number;
  farmer_name?: string;
  farmer_phone?: string;
  storage_type?: 'temporary' | 'long_term';
  storage_duration_days?: number;
  current_market_price?: number;
  auto_sell_on_expiry?: boolean;
  expiry_action?: 'auto_sell' | 'notify_farmer' | 'manual_handling';
  last_price_update?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface WarehouseInventoryCreate {
  warehouse_id: number;
  item_name: string;
  quantity: number;
  location?: string;
  stored_date: Date;
  product_owner?: string;
  item_condition?: 'good' | 'moderate' | 'poor';
  expiry_date?: Date;
  notes?: string;
  farmer_id?: number;
  farmer_name?: string;
  farmer_phone?: string;
  storage_type?: 'temporary' | 'long_term';
  storage_duration_days?: number;
  current_market_price?: number;
  auto_sell_on_expiry?: boolean;
  expiry_action?: 'auto_sell' | 'notify_farmer' | 'manual_handling';
}

export interface WarehouseInventoryUpdate {
  item_name?: string;
  quantity?: number;
  location?: string;
  product_owner?: string;
  item_condition?: 'good' | 'moderate' | 'poor';
  expiry_date?: Date;
  notes?: string;
  storage_type?: 'temporary' | 'long_term';
  storage_duration_days?: number;
  current_market_price?: number;
  auto_sell_on_expiry?: boolean;
  expiry_action?: 'auto_sell' | 'notify_farmer' | 'manual_handling';
}

export interface WarehouseInventorySearchParams {
  warehouse_id?: number;
  item_name?: string;
  storage_type?: 'temporary' | 'long_term';
  item_condition?: 'good' | 'moderate' | 'poor';
  farmer_id?: number;
  page?: number;
  limit?: number;
}

export interface WarehouseAvailability {
  id: number;
  warehouse_id: number;
  date: Date;
  is_available: boolean;
  reason?: string;
  created_at: Date;
}

export interface WarehouseAvailabilityCreate {
  warehouse_id: number;
  date: Date;
  is_available: boolean;
  reason?: string;
}

export interface WarehouseAvailabilityUpdate {
  is_available?: boolean;
  reason?: string;
}

export interface WarehouseAvailabilitySearchParams {
  warehouse_id?: number;
  date?: Date;
  is_available?: boolean;
  page?: number;
  limit?: number;
}

export interface WarehouseTimeSlot {
  id: number;
  warehouse_id: number;
  date: Date;
  start_time: string;
  end_time: string;
  max_bookings: number;
  current_bookings: number;
  is_available: boolean;
  created_at: Date;
}

export interface WarehouseTimeSlotCreate {
  warehouse_id: number;
  date: Date;
  start_time: string;
  end_time: string;
  max_bookings: number;
}

export interface WarehouseTimeSlotUpdate {
  start_time?: string;
  end_time?: string;
  max_bookings?: number;
  is_available?: boolean;
}

export interface WarehouseTimeSlotSearchParams {
  warehouse_id?: number;
  date?: Date;
  is_available?: boolean;
  page?: number;
  limit?: number;
}

export interface WarehouseBooking {
  id: number;
  farmer_id: number;
  warehouse_id: number;
  time_slot_id: number;
  product_type: string;
  quantity: number;
  storage_duration_days: number;
  additional_details?: string;
  status: 'pending' | 'approved' | 'stored' | 'sold' | 'expired';
  qr_code_url?: string;
  qr_code_data?: string;
  return_qr_code_url?: string;
  return_qr_code_data?: string;
  admin_notes?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: Date;
  pickup_confirmed_at?: Date;
  return_confirmed_at?: Date;
  created_at: Date;
  updated_at: Date;
  // Joined fields for display
  farmer_name?: string;
  farmer_phone?: string;
  warehouse_name?: string;
  time_slot_start?: string;
  time_slot_end?: string;
}

export interface WarehouseBookingCreate {
  farmer_id: number;
  warehouse_id: number;
  time_slot_id: number;
  product_type: string;
  quantity: number;
  storage_duration_days: number;
  additional_details?: string;
}

export interface WarehouseBookingUpdate {
  product_type?: string;
  quantity?: number;
  storage_duration_days?: number;
  additional_details?: string;
  status?: 'pending' | 'approved' | 'stored' | 'sold' | 'expired';
}

export interface WarehouseBookingSearchParams {
  farmer_id?: number;
  warehouse_id?: number;
  status?: string;
  page?: number;
  limit?: number;
}

export interface WarehouseAvailableDatesResponse {
  warehouse_id: number;
  warehouse_name: string;
  available_dates: Date[];
  unavailable_dates: Date[];
}

export interface WarehouseAvailableTimeSlotsResponse {
  warehouse_id: number;
  date: Date;
  available_time_slots: WarehouseTimeSlot[];
}

// Farmer Warehouse types
export interface FarmerWarehouseRequest {
  id: number;
  farmer_id: number;
  warehouse_id: number;
  request_type: 'storage' | 'retrieval' | 'inspection';
  item_name: string;
  quantity: number;
  storage_duration_days: number;
  storage_requirements?: string;
  preferred_dates?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: Date;
  qr_code_url?: string;
  qr_code_data?: string;
  warehouse_name?: string;
  warehouse_address?: string;
  warehouse_contact_person?: string;
  warehouse_contact_number?: string;
  farmer_username?: string;
  farmer_first_name?: string;
  farmer_last_name?: string;
  farmer_phone?: string;
  admin_username?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FarmerWarehouseRequestCreate {
  farmer_id: number;
  warehouse_id: number;
  request_type: 'storage' | 'retrieval' | 'inspection';
  item_name: string;
  quantity: number;
  storage_duration_days: number;
  storage_requirements?: string;
  preferred_dates?: string;
}

export interface FarmerWarehouseRequestUpdate {
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: Date;
  qr_code_url?: string;
  qr_code_data?: string;
}

export interface FarmerWarehouseRequestSearchParams {
  farmer_id?: number;
  warehouse_id?: number;
  request_type?: 'storage' | 'retrieval' | 'inspection';
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}

// Market items
export interface MarketItem {
  id: number;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MarketItemCreate {
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface MarketItemUpdate {
  name?: string;
  description?: string;
  category?: string;
  unit?: string;
  image_url?: string;
  is_active?: boolean;
}

// Market prices
export interface MarketPrice {
  id: number;
  market_item_id: number;
  current_price: number;
  price_date: Date;
  source: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  // Joined fields for display
  item_name?: string;
  item_description?: string;
  item_category?: string;
  item_unit?: string;
}

export interface MarketPriceCreate {
  market_item_id: number;
  current_price: number;
  price_date: Date;
  source: string;
  notes?: string;
}

export interface MarketPriceUpdate {
  current_price?: number;
  price_date?: Date;
  source?: string;
  notes?: string;
}
  